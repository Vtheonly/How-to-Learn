/**
 * Excel Ingestion Service — reads a real .xlsx file and imports its
 * structure + data into the in-app model.
 *
 * Three responsibilities:
 *   1. `analyzeWorkbook(path)` — extract the workbook's *shape* (sheets,
 *      headers, formulas, data-validation rules, named ranges, cross-sheet
 *      references, broken refs). Persists a SpreadsheetTemplate.
 *   2. `importLedger(path, sheetName)` — read the master ledger sheet
 *      row-by-row, creating LedgerEntry records in the database. Each
 *      row becomes one LedgerEntry with all Excel columns mapped.
 *   3. `importAuditComments(path, sheetName)` — read the cell comments
 *      (column AM in the source workbook) and persist them as
 *      PaymentAuditComment records linked to the imported ledger entries.
 *
 * Uses ExcelJS (already a dependency) — no new packages required.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import ExcelJS from "exceljs";
import { logger } from "../infrastructure/logger/logger";
import {
  NotFoundError,
  ValidationError,
  InfrastructureError,
} from "../infrastructure/error/app-error";
import { SpreadsheetTemplateRepository } from "../infrastructure/repositories/spreadsheet-template.repository";
import { LedgerRepository } from "../infrastructure/repositories/ledger-entry.repository";
import { PaymentAuditCommentRepository } from "../infrastructure/repositories/payment-audit-comment.repository";
import type {
  SpreadsheetTemplate,
  SpreadsheetSheetInfo,
} from "../core/entities/spreadsheet-template.entity";
import type { CreateLedgerEntryInput } from "../core/entities/ledger-entry.entity";
import { LEDGER_COLUMN_MAP } from "../core/entities/ledger-entry.entity";
import { isValidLevelCode } from "../shared/level-codes";

export interface AnalyzeResult {
  template: SpreadsheetTemplate;
  sheetCount: number;
  formulaCount: number;
  brokenReferenceCount: number;
  commentCount: number;
}

export interface ImportLedgerResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  templateId: string;
  /**
   * Issue 8.1 (iteration 4): advisory warnings about off-by-one
   * Excel references detected during ingestion. The most prominent
   * example is `S94 = 110000-J95` (should reference J94, not J95).
   * We don't fix the value — we surface the anomaly so the operator
   * can decide whether to manually correct the imported data.
   */
  offByOneWarnings: Array<{ row: number; column: string; formula: string; referencedRow: number; message: string }>;
}

export interface ImportCommentsResult {
  imported: number;
  skipped: number;
  errors: Array<{ cell: string; error: string }>;
}

export class ExcelIngestionService {
  readonly serviceName = "ExcelIngestionService";

  constructor(
    private readonly templates: SpreadsheetTemplateRepository,
    private readonly ledger: LedgerRepository,
    private readonly auditComments: PaymentAuditCommentRepository
  ) {}

  /**
   * Analyze a workbook on disk — extract its shape (sheets, headers,
   * formulas, validations, named ranges, cross-sheet refs, broken refs)
   * and persist as a SpreadsheetTemplate. Returns the analysis result.
   */
  async analyzeWorkbook(filePath: string): Promise<AnalyzeResult> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("File", filePath);
    }

    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const existing = await this.templates.findByHash(hash);
    if (existing) {
      logger.info("excel.ingestion.alreadyAnalyzed", { hash, id: existing.id.value });
      return {
        template: existing,
        sheetCount: existing.sheets.length,
        formulaCount: existing.sheets.reduce((s, sh) => s + sh.formulaCount, 0),
        brokenReferenceCount: existing.brokenReferenceCount,
        commentCount: existing.commentCount,
      };
    }

    const workbook = new ExcelJS.Workbook();
    try {
      // ExcelJS expects a Node Buffer; the Buffer returned by fs.readFileSync
      // is already one — cast to satisfy the strict type from @types/node.
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch (err) {
      throw new InfrastructureError(
        `Failed to load xlsx: ${(err as Error).message}`,
        { filePath }
      );
    }

    const sheets: SpreadsheetSheetInfo[] = [];
    const namedRanges: Array<{ name: string; refersTo: string; broken: boolean }> = [];
    const crossSheetRefs: Array<{ from: string; to: string; count: number }> = [];
    let formulaCount = 0;
    let commentCount = 0;
    let brokenReferenceCount = 0;

    // Named ranges
    for (const [name, def] of Object.entries(workbook.definedNames)) {
      const refersTo = (def as any).refersTo ?? String(def);
      const broken = refersTo.includes("#REF!");
      if (broken) brokenReferenceCount++;
      namedRanges.push({ name, refersTo, broken });
    }

    // Per-sheet analysis
    for (const ws of workbook.worksheets) {
      const headers: Array<{ column: string; label: string }> = [];
      const formulaMap = new Map<string, { cell: string; formula: string; count: number }>();
      let sheetFormulaCount = 0;
      let sheetValidationCount = 0;
      let sheetCfCount = 0;

      // Iterate rows (cap at 2000 to avoid pathological files)
      const maxRow = Math.min(ws.rowCount || 0, 2000);
      const maxCol = Math.min(ws.columnCount || 0, 60);

      for (let r = 1; r <= maxRow; r++) {
        const row = ws.getRow(r);
        for (let c = 1; c <= maxCol; c++) {
          const cell = row.getCell(c);
          const addr = cell.address;
          if (r === 1 && cell.value !== null && cell.value !== undefined) {
            const label = typeof cell.value === "object" && (cell.value as any).result !== undefined
              ? String((cell.value as any).result)
              : String(cell.value);
            if (label && !label.startsWith("#REF")) {
              headers.push({ column: addr.replace(/\d+$/, ""), label });
            }
          }
          if (cell.formula) {
            sheetFormulaCount++;
            const key = cell.formula;
            const existing = formulaMap.get(key);
            if (existing) existing.count++;
            else formulaMap.set(key, { cell: addr, formula: cell.formula, count: 1 });
            if (cell.formula.includes("#REF!")) brokenReferenceCount++;
          }
        }
      }

      // Data validations (ExcelJS exposes them on the worksheet)
      const dvs = (ws as any).dataValidations?.model ?? {};
      sheetValidationCount = Object.keys(dvs).length;

      // Conditional formatting — ExcelJS exposes a private cf collection
      const cf = (ws as any)._conditionalFormatting?.model ?? {};
      sheetCfCount = Object.keys(cf).length;

      // Comments — ExcelJS doesn't expose them easily via cell, so we
      // rely on the workbook's `commentCount` if available, or scan
      // worksheets for `_comments` (internal field, may vary).
      const wsComments = (ws as any)._comments ?? [];
      commentCount += wsComments.length;

      formulaCount += sheetFormulaCount;

      sheets.push({
        name: ws.name,
        dimensions: `${ws.getRow(1).getCell(1).address || "A1"}:${ws.getRow(maxRow).getCell(maxCol).address || "Z9"}`,
        rowCount: ws.rowCount,
        colCount: ws.columnCount,
        headers,
        formulaCount: sheetFormulaCount,
        validationCount: sheetValidationCount,
        conditionalFormatCount: sheetCfCount,
        formulaPatterns: Array.from(formulaMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 30),
      });
    }

    // Detect cross-sheet references by scanning formula patterns.
    const refRe = /(?:'([^']+)'!|([A-Za-z0-9_]+)!)/g;
    for (const sheet of sheets) {
      const fromSheet = sheet.name;
      const targets = new Map<string, number>();
      for (const fp of sheet.formulaPatterns) {
        let m;
        while ((m = refRe.exec(fp.formula)) !== null) {
          const target = m[1] ?? m[2];
          if (target && target !== fromSheet) {
            targets.set(target, (targets.get(target) ?? 0) + fp.count);
          }
        }
        refRe.lastIndex = 0;
      }
      for (const [to, count] of targets) {
        crossSheetRefs.push({ from: fromSheet, to, count });
      }
    }

    const template = await this.templates.create({
      name: path.basename(filePath, ".xlsx"),
      sourceFileName: path.basename(filePath),
      sourceFileHash: hash,
      sheets,
      namedRanges,
      crossSheetRefs,
      commentCount,
      brokenReferenceCount,
    });

    logger.info("excel.ingestion.analyzed", {
      id: template.id.value,
      fileName: template.sourceFileName,
      sheets: sheets.length,
      formulas: formulaCount,
      brokenRefs: brokenReferenceCount,
    });

    return {
      template,
      sheetCount: sheets.length,
      formulaCount,
      brokenReferenceCount,
      commentCount,
    };
  }

  /**
   * Import the master ledger sheet into LedgerEntry rows.
   * Each row from row 2 downward becomes one LedgerEntry.
   * Computed columns (L, P, Q) are evaluated by the LedgerService
   * after import — we only persist the raw inputs.
   *
   * Implementation notes (issues 8.8 & 8.9 from software_review.md):
   *   - The source workbook's sheet names sometimes contain trailing
   *     whitespace (e.g. "BON "). `findWorksheetByName` below performs
   *     a trim-aware, case-insensitive lookup so callers can pass
   *     "BON" and still resolve the actual sheet.
   *   - Excel's auto-filter range often stops well before `rowCount`
   *     (e.g. filter on $A$1:$AN$404 but rowCount=1032). To avoid
   *     iterating hundreds of trailing empty rows, we stop iterating
   *     after `EMPTY_ROW_ABORT_THRESHOLD` consecutive empty rows.
   */
  async importLedger(
    filePath: string,
    sheetName: string,
    academicYearId?: string
  ): Promise<ImportLedgerResult> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("File", filePath);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const ws = findWorksheetByName(workbook, sheetName);
    if (!ws) {
      throw new NotFoundError(
        "Worksheet",
        `${sheetName} (also tried trim/case-insensitive match against ${workbook.worksheets.map(s => `"${s.name}"`).join(", ")})`,
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: Array<{ row: number; error: string }> = [];
    const offByOneWarnings: Array<{ row: number; column: string; formula: string; referencedRow: number; message: string }> = [];

    // Header row should be row 1; data starts row 2.
    const headerRow = ws.getRow(1);
    const colMap = buildColumnToFieldMap(headerRow);

    // Abort after this many consecutive empty rows — see issue 8.9.
    const EMPTY_ROW_ABORT_THRESHOLD = 20;
    let consecutiveEmpty = 0;

    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      try {
        const { input, extras } = readRowAsLedgerInput(row, colMap, r, academicYearId);
        // Skip empty rows.
        if (!input.studentName?.trim()) {
          skipped++;
          consecutiveEmpty++;
          if (consecutiveEmpty >= EMPTY_ROW_ABORT_THRESHOLD) {
            // We've crossed into the trailing empty region beyond the
            // auto-filter range. Stop scanning to avoid importing 600+
            // empty rows (issue 8.9).
            logger.info("excel.ingestion.ledger.abortEmptyTail", {
              filePath,
              sheetName: ws.name,
              atRow: r,
              consecutiveEmpty,
            });
            break;
          }
          continue;
        }
        consecutiveEmpty = 0;

        // ── Issue 8.1: detect off-by-one references in this row ──────
        //
        // Excel's S94 cell contains `=110000-J95` — it references
        // J95 (the row below) instead of J94 (the same row). The
        // software would never produce this bug because it uses a
        // uniform formula, but it also means the software can't
        // replicate the actual data in row 94 if importing from
        // Excel. We detect the pattern (any cell in the row whose
        // formula references a different row than the cell itself)
        // and surface an advisory warning so the operator can decide
        // whether the imported value is correct or needs manual
        // correction.
        //
        // The detection is intentionally narrow — we only flag the
        // exact pattern that's documented in the source workbook:
        // a formula in column S (or any payment column) that
        // subtracts J{row+1} or J{row-1}. We don't try to detect
        // every possible off-by-one because the workbook contains
        // legitimate cross-row formulas (e.g. BON sheet VLOOKUPs).
        const rowWarnings = detectOffByOneReferences(row, r);
        for (const w of rowWarnings) {
          offByOneWarnings.push({
            row: r,
            column: w.column,
            formula: w.formula,
            referencedRow: w.referencedRow,
            message:
              `Issue 8.1: column ${w.column} on row ${r} has formula ` +
              `"${w.formula}" which references row ${w.referencedRow} ` +
              `(expected row ${r}). This is the documented S94 off-by-one ` +
              `pattern. The imported value is preserved as-is — verify ` +
              `whether the spreadsheet's value is correct or needs ` +
              `manual correction.`,
          });
          logger.warn("excel.ingestion.offByOneReference", {
            filePath,
            sheetName: ws.name,
            row: r,
            column: w.column,
            formula: w.formula,
            referencedRow: w.referencedRow,
          });
        }

        // ── Issues 11 + 16 (iteration 3): persist Excel's computed ──
        //
        // The previous version called `this.ledger.create(input)`,
        // which invokes LedgerService.computeFields(). For Excel rows
        // whose operator-typed formula used a different composition
        // than the software's fallback (e.g. dual transport, a
        // hand-picked tuition tier, or a no-discount variant), the
        // recomputed devisAnnuel would diverge from the spreadsheet's
        // stored result.
        //
        // We now persist the row straight to the repository with
        // Excel's computed values intact. The LedgerEntry is created
        // via the repository (bypassing computeFields), then patched
        // with the spreadsheet's stored values for devisAnnuel /
        // totalVersements / totalCreance. This is the
        // least-surprising behaviour: the database reflects the
        // spreadsheet, and any later operator edit triggers a proper
        // recompute via LedgerService.update().
        const created = await this.ledger.create(input);
        // Apply Excel's stored computed values on top. We use
        // repository.update so we don't trigger another computeFields
        // pass (which would overwrite the values we're trying to
        // preserve).
        const patch: Record<string, number> = {};
        if (input.devisAnnuel !== undefined) patch.devisAnnuel = input.devisAnnuel;
        if (extras.totalVersements !== undefined) patch.totalVersements = extras.totalVersements;
        if (extras.totalCreance !== undefined) patch.totalCreance = extras.totalCreance;
        if (Object.keys(patch).length > 0) {
          await this.ledger.update(created.id.value, patch as any);
        }
        imported++;
      } catch (err) {
        errors.push({ row: r, error: (err as Error).message });
        skipped++;
        // Reset the empty counter — a row that errored is not empty.
        consecutiveEmpty = 0;
      }
    }

    logger.info("excel.ingestion.ledger.imported", {
      filePath,
      sheetName: ws.name,
      imported,
      skipped,
      errors: errors.length,
    });

    return {
      imported,
      skipped,
      errors,
      templateId: "",
      offByOneWarnings,
    };
  }

  /**
   * Import the column-AM audit comments from a ledger sheet.
   * Each comment is linked to the corresponding LedgerEntry by source row.
   */
  async importAuditComments(
    filePath: string,
    sheetName: string
  ): Promise<ImportCommentsResult> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("File", filePath);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    // Use trim-aware, case-insensitive lookup — see issue 8.8.
    const ws = findWorksheetByName(workbook, sheetName);
    if (!ws) {
      throw new NotFoundError(
        "Worksheet",
        `${sheetName} (also tried trim/case-insensitive match)`,
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: Array<{ cell: string; error: string }> = [];

    // Scan column AM (column 39) for comments.
    // We need to access the workbook's comments part — ExcelJS exposes
    // them via worksheet._comments (internal) or via cell.comment.
    for (let r = 1; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      for (let c = 1; c <= ws.columnCount; c++) {
        const cell = row.getCell(c);
        const cellAddr = cell.address;
        // ExcelJS cell.comment is set when a legacy comment exists.
        const comment = (cell as any).comment;
        if (comment && comment.text) {
          try {
            // Find the matching ledger entry by source row.
            const ledgerEntries = await this.ledger.list({ pageSize: 10000 });
            const entry = ledgerEntries.find((e) => e.sourceRow === r);
            if (!entry) {
              skipped++;
              continue;
            }
            await this.auditComments.create({
              ledgerEntryId: entry.id.value,
              studentId: entry.studentId,
              rawText: comment.text,
              excelCell: cellAddr,
              sourceRow: r,
            });
            imported++;
          } catch (err) {
            errors.push({ cell: cellAddr, error: (err as Error).message });
            skipped++;
          }
        }
      }
    }

    logger.info("excel.ingestion.comments.imported", {
      filePath,
      sheetName,
      imported,
      skipped,
      errors: errors.length,
    });

    return { imported, skipped, errors };
  }
}

// ── Helpers ────────────────────────────────────────────────────

/**
 * Find a worksheet by name, tolerating trailing/leading whitespace and
 * case differences.
 *
 * Background (issue 8.8 in software_review.md): the source workbook's
 * `BON` sheet is actually named `"BON "` (with a trailing space). Any
 * code that calls `workbook.getWorksheet("BON")` would fail to resolve
 * it. This helper normalises both the requested name and the candidate
 * names so callers can pass the logical name ("BON") and still resolve
 * the real sheet ("BON ").
 */
export function findWorksheetByName(
  workbook: ExcelJS.Workbook,
  name: string,
): ExcelJS.Worksheet | undefined {
  const target = String(name ?? "").trim().toLowerCase();
  if (!target) return undefined;
  // First try an exact match — preserves backward compatibility and is
  // the common case for normalised workbooks.
  const exact = workbook.getWorksheet(name);
  if (exact) return exact;
  // Fall back to a trim-aware, case-insensitive match.
  for (const ws of workbook.worksheets) {
    if (String(ws.name ?? "").trim().toLowerCase() === target) {
      return ws;
    }
  }
  return undefined;
}

/**
 * Build a { excelColumnLetter → fieldName } map from the header row.
 *
 * The source workbook's header row contains the human-readable Excel
 * labels (e.g. "NEM", "DEVIS ANNUEL", "TOTAL*CREANCE"). These don't
 * match the camelCase field names in `LEDGER_COLUMN_MAP` (e.g.
 * "phoneNumbers", "devisAnnuel", "totalCreance"). We therefore also
 * need a forward map from the Excel label to the camelCase field
 * name. That forward map is built once from the static
 * `EXCEL_HEADER_LABELS` table below.
 *
 * ── Iteration 3 (issues 11 + 16) ──
 * The previous version of this helper built `labelToField` as
 * `{ field.toUpperCase(): columnLetter }` — i.e. it mapped the
 * camelCase field name (uppercased) back to the column letter from
 * LEDGER_COLUMN_MAP. Then it looked up the Excel header label in
 * this map and, if found, set `map.set(colLetter, columnLetter)`
 * — mapping the column letter to ITSELF. That meant `readRowAsLedgerInput`
 * could never match any `case` in its switch (because the fieldName
 * was always a column letter like "B", "C", ... and never "studentName",
 * "devisAnnuel", etc.). The only reason any field ever imported was
 * the fallback `map.set("F", "studentName")` line.
 *
 * We now build a proper { excelLabel: fieldName } lookup using the
 * static EXCEL_HEADER_LABELS table, then for each header cell set
 * `map.set(colLetter, fieldName)` correctly.
 */
const EXCEL_HEADER_LABELS: Record<string, string> = {
  // Identity & descriptive
  INFOS: "infos",
  "E-MAIL": "email",
  EMAIL: "email",
  NEM: "phoneNumbers",
  TUTEUR: "tutorName",
  NOM: "studentName",
  NIVEAU: "level",
  CLASSE: "classCode",
  OPTION: "optionCode",
  REMISE: "remise",
  JUSTIFICATION: "justification",
  // Computed values
  "DEVIS ANNUEL": "devisAnnuel",
  REMBOURCEMENT: "reimbursement",
  DETTES: "priorDebt",
  "REGLEMENTS DETTES": "debtSettlement",
  "TOTAL VERSEMENTS": "totalVersements",
  "TOTAL*CREANCE": "totalCreance",
  // Payment installments
  FI: "fi",
  V2: "v2",
  "2V": "altV2",
  V3: "v3",
  DISTINATION: "destination",
  "1T": "t1",
  T2: "t2",
  T3: "t3",
  // Extras
  PSY1: "psy1",
  PSY2: "psy2",
  ORTH1: "orth1",
  ORTH2: "orth2",
  "E-PLANT": "ePlant",
  EPLANT: "ePlant",
  RATRAPAGE: "ratrapage",
  // Quarterly tracking
  SEPTEMBRE: "september",
  "CREANCES SEPTEMBRE": "septemberBalance",
  DECEMBRE: "december",
  "CREANCES DECEMBRE": "decemberBalance",
  MARS: "march",
  "CREANCES MARS": "marchBalance",
  // Grand total
  TOTAL: "grandTotal",
};

function buildColumnToFieldMap(headerRow: ExcelJS.Row): Map<string, string> {
  const map = new Map<string, string>();

  headerRow.eachCell((cell, _colNumber) => {
    const label = String(cell.value ?? "").trim();
    const colLetter = cell.address.replace(/\d+$/, "");
    if (label) {
      const upper = label.toUpperCase();
      const fieldName = EXCEL_HEADER_LABELS[upper];
      if (fieldName) {
        map.set(colLetter, fieldName);
      }
    }
  });

  // Always include column F → studentName as a fallback.
  if (!map.has("F")) map.set("F", "studentName");

  return map;
}

/** Convert one ExcelJS Row into a CreateLedgerEntryInput. */
function readRowAsLedgerInput(
  row: ExcelJS.Row,
  colMap: Map<string, string>,
  sourceRow: number,
  academicYearId?: string
): { input: CreateLedgerEntryInput; extras: { totalVersements?: number; totalCreance?: number } } {
  const input: CreateLedgerEntryInput = {
    studentName: "",
    sourceRow,
    academicYearId,
  };
  // Side-channel for Excel computed values that are NOT on
  // CreateLedgerEntryInput (the service computes them). We still
  // preserve them so importLedger() can write them straight to the
  // database, mirroring the spreadsheet (issues 11 + 16).
  const extras: { totalVersements?: number; totalCreance?: number } = {};

  row.eachCell((cell, _colNumber) => {
    const colLetter = cell.address.replace(/\d+$/, "");
    const fieldName = colMap.get(colLetter);
    if (!fieldName) return;
    const value = cell.value;

    switch (fieldName) {
      case "studentName":
        input.studentName = String(value ?? "").trim();
        break;
      case "phoneNumbers":
        // Excel stores phone numbers as a single slash-separated string
        // (e.g. "0663701834/0660800317"). The LedgerEntry entity mirrors
        // the raw string — see issue 8.5 in software_review.md. Callers
        // that need a structured array (e.g. the Student entity) should
        // use `parsePhoneNumbers()` from `shared/phone-numbers.ts`.
        input.phoneNumbers = String(value ?? "").trim();
        break;
      case "infos":
        input.infos = value ? String(value) : undefined;
        break;
      case "email":
        input.email = value ? String(value) : undefined;
        break;
      case "tutorName":
        input.tutorName = value ? String(value) : undefined;
        break;
      case "level": {
        // Issue 8.6: NV2/NV3/NV4/NV5 are valid level codes in the source
        // workbook. We import the raw string unchanged, but log an
        // advisory warning for codes outside the canonical catalogue so
        // operators can spot typos. We do NOT throw — the spreadsheet
        // contains occasional ad-hoc values and we don't want to break
        // imports. See `shared/level-codes.ts` for the canonical list.
        const rawLevel = value ? String(value).trim() : undefined;
        input.level = rawLevel;
        if (rawLevel && !isValidLevelCode(rawLevel)) {
          logger.warn("excel.ingestion.unknownLevelCode", {
            sourceRow,
            level: rawLevel,
            hint: "Not in canonical LEVEL_CODES list. Imported as-is.",
          });
        }
        break;
      }
      case "classCode":
        input.classCode = value ? String(value) : undefined;
        break;
      case "optionCode":
        input.optionCode = value ? String(value) : undefined;
        break;
      case "destination":
        input.destination = value ? String(value) : undefined;
        break;
      case "justification":
        input.justification = value ? String(value) : undefined;
        break;
      case "remise":
        input.remise = toNumber(value);
        break;
      case "fi": input.fi = toNumber(value); break;
      case "v2": input.v2 = toNumber(value); break;
      case "altV2": input.altV2 = toNumber(value); break;
      case "v3": input.v3 = toNumber(value); break;
      case "t1": input.t1 = toNumber(value); break;
      case "t2": input.t2 = toNumber(value); break;
      case "t3": input.t3 = toNumber(value); break;
      case "psy1": input.psy1 = toNumber(value); break;
      case "psy2": input.psy2 = toNumber(value); break;
      case "orth1": input.orth1 = toNumber(value); break;
      case "orth2": input.orth2 = toNumber(value); break;
      case "ePlant": input.ePlant = toNumber(value); break;
      case "ratrapage": input.ratrapage = toNumber(value); break;
      case "september": input.september = toNumber(value); break;
      case "december": input.december = toNumber(value); break;
      case "march": input.march = toNumber(value); break;
      case "reimbursement": input.reimbursement = toNumber(value); break;
      case "priorDebt": input.priorDebt = toNumber(value); break;
      case "debtSettlement": input.debtSettlement = toNumber(value); break;
      // ── Issues 11 + 16 (iteration 3): preserve Excel's computed values ──
      //
      // The previous version of this block was:
      //     case "devisAnnuel":
      //     case "totalVersements":
      //     case "totalCreance":
      //       break;  // SKIPPED — "LedgerService computes them"
      //
      // That comment was optimistic. LedgerService.recomputeAll() does
      // re-evaluate every row, but the recomputation is based on the
      // software's fallback formula (which uses level-indexed pricing
      // + resolved transport). For Excel rows whose operator-typed
      // formula used a different composition (e.g. dual transport, a
      // hand-picked tuition tier, or a no-discount variant), the
      // recomputed value would diverge from the spreadsheet's stored
      // result.
      //
      // Issue 11 (ingestion skips computed values) and issue 16
      // (computed columns are then recomputed with potentially-wrong
      // logic) compound: the imported row ends up with devisAnnuel=0
      // and totalCreance=0 until a manual recompute is triggered, and
      // even after the recompute the values may not match the
      // spreadsheet.
      //
      // We now preserve Excel's computed values verbatim. They are
      // stored on the LedgerEntry so the database reflects the
      // spreadsheet faithfully. If the operator later edits an input
      // field, LedgerService.update() recomputes — but rows that have
      // never been touched keep their Excel values, which is the
      // least-surprising behaviour.
      case "devisAnnuel":
        input.devisAnnuel = toNumber(value);
        break;
      case "totalVersements":
        // `totalVersements` isn't on CreateLedgerEntryInput (the
        // service computes it), but we accept the Excel value here so
        // the caller can opt to persist it. Stash it on a private
        // side-channel that importLedger() picks up after the row is
        // built. (See `extras.totalVersements` below.)
        extras.totalVersements = toNumber(value);
        break;
      case "totalCreance":
        extras.totalCreance = toNumber(value);
        break;
      // The quarterly balances (AG/AI/AK) and grand total (AL) are
      // still skipped — Excel's column AG is empty (issue 6.2) and
      // AL has no formula (issue 2.3, fixed in iteration 1).
      case "septemberBalance":
      case "decemberBalance":
      case "marchBalance":
      case "grandTotal":
        break;
    }
  });

  return { input, extras };
}

/**
 * Detect off-by-one Excel formula references in a row (issue 8.1).
 *
 * The source workbook's S94 cell contains `=110000-J95` — it
 * references row 95 (the row below) instead of row 94 (the same
 * row). The software would never produce this bug because it uses a
 * uniform formula, but it also means the software can't replicate
 * the actual data in row 94 if importing from Excel.
 *
 * This helper scans every formula-carrying cell in the row and looks
 * for references to `J{row±1}` (specifically: any formula that
 * subtracts or adds a cell on an adjacent row from column J, the
 * REMISE column). The pattern is narrow on purpose — we don't want
 * to flag legitimate cross-row formulas (e.g. BON sheet VLOOKUPs).
 *
 * Returns an array of `{ column, formula, referencedRow }` objects
 * for each detected off-by-one reference. The caller surfaces these
 * as advisory warnings; the imported value is preserved as-is.
 */
function detectOffByOneReferences(
  row: ExcelJS.Row,
  sourceRow: number,
): Array<{ column: string; formula: string; referencedRow: number }> {
  const out: Array<{ column: string; formula: string; referencedRow: number }> = [];
  row.eachCell((cell, _colNumber) => {
    const formula = (cell as any).formula as string | undefined;
    if (!formula || typeof formula !== "string") return;
    // Match patterns like `J95`, `J94`, etc. — column J followed by
    // a row number. We extract the row number and compare it to the
    // cell's own row.
    const colLetter = cell.address.replace(/\d+$/, "");
    // Only scan payment-related columns (the issue specifically calls
    // out S, but we check R-Y for completeness — they're the columns
    // where a J reference would be meaningful for balance math).
    if (!/^[RSTUVWXY]$/.test(colLetter)) return;
    const matches = formula.matchAll(/J(\d+)/g);
    for (const m of matches) {
      const refRow = Number(m[1]);
      if (!Number.isFinite(refRow)) continue;
      // Only flag references that are exactly 1 row off (the
      // documented pattern). A 5-row offset is likely intentional
      // (e.g. a sibling reference).
      if (Math.abs(refRow - sourceRow) === 1) {
        out.push({
          column: colLetter,
          formula,
          referencedRow: refRow,
        });
        // One warning per cell is enough — break out of the matchAll
        // loop after the first hit.
        break;
      }
    }
  });
  return out;
}

function toNumber(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  if (typeof v === "object" && (v as any).result !== undefined) {
    return Number((v as any).result) || 0;
  }
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
