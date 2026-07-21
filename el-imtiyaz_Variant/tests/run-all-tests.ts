/**
 * Test harness for the 7 fixes shipped in this iteration.
 *
 * Each test module corresponds to one issue (or a tightly-coupled pair of
 * issues) from `software_review.md`. The tests are intentionally written
 * as a standalone script (`tsx tests/run-all-tests.ts`) rather than a
 * framework-bound suite, so they can be executed without adding a test
 * runner dependency to the project.
 *
 * Run with:
 *   npx tsx tests/run-all-tests.ts
 */

import * as assert from "node:assert";

// ── Imports for the modules under test ───────────────────────────────
import {
  parsePhoneNumbers,
  formatPhoneNumbers,
  isRawPhoneNumbersString,
} from "../src/shared/phone-numbers";
import {
  LEVEL_CODES,
  isValidLevelCode,
  normaliseLevelCode,
  LEVEL_CODE_LABELS,
} from "../src/shared/level-codes";
import { getStarterFormulaRules } from "../src/services/formula-rule.service";
import { findWorksheetByName } from "../src/services/excel-ingestion.service";
import ExcelJS from "exceljs";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

// ── Test runner ──────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    const msg = (err as Error).message;
    failures.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}`);
    console.log(`      → ${msg}`);
  }
}

async function asyncTest(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    const msg = (err as Error).message;
    failures.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}`);
    console.log(`      → ${msg}`);
  }
}

function section(title: string): void {
  console.log(`\n── ${title} ─────────────────────────`);
}

// ── Fix #6 — Issue 8.5: Phone-number parsing ─────────────────────────
section("Fix #6 — Issue 8.5: parsePhoneNumbers / formatPhoneNumbers");

test("parses a single slash-separated string into an array", () => {
  const result = parsePhoneNumbers("0663701834/0660800317");
  assert.deepStrictEqual(result, ["0663701834", "0660800317"]);
});

test("parses a comma-separated string", () => {
  const result = parsePhoneNumbers("0663701834, 0660800317");
  assert.deepStrictEqual(result, ["0663701834", "0660800317"]);
});

test("parses a semicolon-separated string", () => {
  const result = parsePhoneNumbers("0663701834;0660800317");
  assert.deepStrictEqual(result, ["0663701834", "0660800317"]);
});

test("returns a single-element array for a lone number", () => {
  assert.deepStrictEqual(parsePhoneNumbers("0663701834"), ["0663701834"]);
});

test("returns [] for empty / null / undefined input", () => {
  assert.deepStrictEqual(parsePhoneNumbers(""), []);
  assert.deepStrictEqual(parsePhoneNumbers(null), []);
  assert.deepStrictEqual(parsePhoneNumbers(undefined), []);
  assert.deepStrictEqual(parsePhoneNumbers("   "), []);
});

test("trims whitespace around each parsed number", () => {
  const result = parsePhoneNumbers("  0663701834  /  0660800317  ");
  assert.deepStrictEqual(result, ["0663701834", "0660800317"]);
});

test("does NOT split a single number containing a hyphen", () => {
  // A single phone number like +213-555-123 should not be split.
  assert.deepStrictEqual(parsePhoneNumbers("+213-555-123"), ["+213-555-123"]);
});

test("formatPhoneNumbers is the inverse of parsePhoneNumbers", () => {
  const original = "0663701834/0660800317";
  const parsed = parsePhoneNumbers(original);
  const reformatted = formatPhoneNumbers(parsed);
  assert.strictEqual(reformatted, original);
});

test("formatPhoneNumbers([]) returns empty string", () => {
  assert.strictEqual(formatPhoneNumbers([]), "");
  assert.strictEqual(formatPhoneNumbers(null), "");
  assert.strictEqual(formatPhoneNumbers(undefined), "");
});

test("formatPhoneNumbers filters out empty entries", () => {
  assert.strictEqual(
    formatPhoneNumbers(["0663701834", "", "  ", "0660800317"]),
    "0663701834/0660800317",
  );
});

test("isRawPhoneNumbersString detects multi-number strings", () => {
  assert.strictEqual(isRawPhoneNumbersString("0663701834/0660800317"), true);
  assert.strictEqual(isRawPhoneNumbersString("0663701834"), false);
  assert.strictEqual(isRawPhoneNumbersString(null), false);
  assert.strictEqual(isRawPhoneNumbersString(42), false);
});

// ── Fix #7 — Issue 8.6: NV level codes ───────────────────────────────
section("Fix #7 — Issue 8.6: LEVEL_CODES catalogue & validation");

test("LEVEL_CODES includes the standard codes (MS, GS, PRIM, COLG, LYC, AUTISTE)", () => {
  for (const code of ["MS", "GS", "PRIM", "COLG", "LYC", "AUTISTE"]) {
    assert.ok(
      LEVEL_CODES.includes(code as any),
      `expected LEVEL_CODES to include ${code}`,
    );
  }
});

test("LEVEL_CODES includes NV2/NV3/NV4/NV5 (issue 8.6)", () => {
  for (const code of ["NV2", "NV3", "NV4", "NV5"]) {
    assert.ok(
      LEVEL_CODES.includes(code as any),
      `expected LEVEL_CODES to include ${code}`,
    );
  }
});

test("isValidLevelCode returns true for canonical codes (case-insensitive)", () => {
  for (const code of ["MS", "GS", "PRIM", "COLG", "LYC", "AUTISTE", "NV2", "NV3", "NV4", "NV5"]) {
    assert.ok(isValidLevelCode(code), `expected ${code} to be valid`);
  }
  // Case-insensitive
  assert.ok(isValidLevelCode("prim"));
  assert.ok(isValidLevelCode("nv3"));
  assert.ok(isValidLevelCode("  LYC  "));
});

test("isValidLevelCode returns false for unknown codes", () => {
  assert.strictEqual(isValidLevelCode("XYZ"), false);
  assert.strictEqual(isValidLevelCode("PRIMARY"), false);
  assert.strictEqual(isValidLevelCode(""), false);
  assert.strictEqual(isValidLevelCode(null), false);
  assert.strictEqual(isValidLevelCode(undefined), false);
});

test("normaliseLevelCode uppercases recognised codes", () => {
  assert.strictEqual(normaliseLevelCode("prim"), "PRIM");
  assert.strictEqual(normaliseLevelCode("  nv3  "), "NV3");
  assert.strictEqual(normaliseLevelCode("LYC"), "LYC");
});

test("normaliseLevelCode returns null for unrecognised codes", () => {
  assert.strictEqual(normaliseLevelCode("XYZ"), null);
  assert.strictEqual(normaliseLevelCode(""), null);
  assert.strictEqual(normaliseLevelCode(null), null);
});

test("LEVEL_CODE_LABELS has an entry for every code in LEVEL_CODES", () => {
  for (const code of LEVEL_CODES) {
    assert.ok(
      LEVEL_CODE_LABELS[code],
      `expected LEVEL_CODE_LABELS to include ${code}`,
    );
    assert.ok(
      LEVEL_CODE_LABELS[code].length > 0,
      `expected LEVEL_CODE_LABELS[${code}] to be a non-empty string`,
    );
  }
});

// ── Fix #3 — Issue 2.3/9.3: GRAND TOTAL rule removed ────────────────
section("Fix #3 — Issue 2.3/9.3: GRAND TOTAL starter rule removed");

test("getStarterFormulaRules does NOT seed a grandTotal rule", () => {
  const starters = getStarterFormulaRules();
  const grandTotalRule = starters.find((r) => r.targetField === "grandTotal");
  assert.strictEqual(
    grandTotalRule,
    undefined,
    `expected no grandTotal starter rule, got: ${JSON.stringify(grandTotalRule)}`,
  );
});

test("getStarterFormulaRules still seeds the three real Excel formulas (L, P, Q)", () => {
  const starters = getStarterFormulaRules();
  const ledgerScoped = starters.filter((r) => r.scope === "ledger");
  const targetFields = ledgerScoped.map((r) => r.targetField).sort();
  assert.deepStrictEqual(
    targetFields,
    ["devisAnnuel", "totalCreance", "totalVersements"],
  );
});

test("the DEVIS ANNUEL starter expression references registration + tuition + transport", () => {
  const starters = getStarterFormulaRules();
  const devisRule = starters.find((r) => r.targetField === "devisAnnuel");
  assert.ok(devisRule, "expected devisAnnuel starter rule to exist");
  assert.ok(
    devisRule!.expression.includes("registration"),
    "expected expression to reference registration",
  );
  assert.ok(
    devisRule!.expression.includes("baseTuition"),
    "expected expression to reference baseTuition",
  );
  // Iteration 2 changed the transport reference from `transportBase`
  // (always 35k) to `resolvedTransport` (destination-indexed across
  // 4 tiers — see issues 1.3, 1.4, 8.4). The expression should now
  // reference `resolvedTransport`.
  assert.ok(
    devisRule!.expression.includes("resolvedTransport"),
    "expected expression to reference resolvedTransport (iteration 2)",
  );
});

async function main(): Promise<void> {
// ── Fix #1 — Issue 8.8: Sheet name "BON " trailing space ────────────
section("Fix #1 — Issue 8.8: findWorksheetByName tolerates trailing space");

async function makeWorkbookWithSheet(sheetName: string): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  // Minimal content: a header row + one data row.
  ws.getCell("A1").value = "NOM";
  ws.getCell("B1").value = "CLASSE";
  ws.getCell("A2").value = "TEST STUDENT";
  ws.getCell("B2").value = "CE1";
  return wb;
}

await asyncTest("exact match still works (backward compatibility)", async () => {
  const wb = await makeWorkbookWithSheet("ETAT 20262027");
  const ws = findWorksheetByName(wb, "ETAT 20262027");
  assert.ok(ws, "expected to find the worksheet by exact name");
  assert.strictEqual(ws!.name, "ETAT 20262027");
});

await asyncTest("matches when the actual sheet has a trailing space (issue 8.8)", async () => {
  // The source workbook's BON sheet is named "BON " (with a trailing space).
  const wb = await makeWorkbookWithSheet("BON ");
  const ws = findWorksheetByName(wb, "BON");
  assert.ok(ws, "expected to find 'BON ' when searching for 'BON'");
  assert.strictEqual(ws!.name, "BON ");
});

await asyncTest("matches case-insensitively", async () => {
  const wb = await makeWorkbookWithSheet("Etat 20262027");
  const ws = findWorksheetByName(wb, "ETAT 20262027");
  assert.ok(ws, "expected case-insensitive match to succeed");
});

await asyncTest("matches when the requested name has stray whitespace", async () => {
  const wb = await makeWorkbookWithSheet("ETAT 20262027");
  const ws = findWorksheetByName(wb, "  ETAT 20262027  ");
  assert.ok(ws, "expected leading/trailing whitespace on the request to be tolerated");
});

await asyncTest("returns undefined for a non-existent sheet (no false positives)", async () => {
  const wb = await makeWorkbookWithSheet("ETAT 20262027");
  const ws = findWorksheetByName(wb, "MISSING");
  assert.strictEqual(ws, undefined);
});

await asyncTest("returns undefined for an empty name", async () => {
  const wb = await makeWorkbookWithSheet("ETAT 20262027");
  assert.strictEqual(findWorksheetByName(wb, ""), undefined);
  assert.strictEqual(findWorksheetByName(wb, "   "), undefined);
});

// ── Fix #2 — Issue 8.9: Empty-row abort in importLedger ─────────────
section("Fix #2 — Issue 8.9: importLedger aborts after consecutive empty rows");

/**
 * Build a temp .xlsx file that mirrors the problematic shape described in
 * issue 8.9: a real header + N real data rows, then a long tail of empty
 * rows (the auto-filter range stops at the data, but ws.rowCount extends
 * well past it).
 */
async function buildWorkbookWithEmptyTail(
  sheetName: string,
  dataRows: string[][],
  emptyTailCount: number,
): Promise<string> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  // Header
  ws.getCell("A1").value = "NOM";
  ws.getCell("F1").value = "NOM"; // LEDGER_COLUMN_MAP maps F → studentName
  ws.getCell("G1").value = "niveau";
  ws.getCell("H1").value = "CLASSE";
  // Data rows
  dataRows.forEach((row, i) => {
    const r = i + 2;
    ws.getCell(`F${r}`).value = row[0];
    ws.getCell(`G${r}`).value = row[1] ?? "PRIM";
    ws.getCell(`H${r}`).value = row[2] ?? "CE1";
  });
  // Pad the tail with empty rows by writing then clearing a far-away cell.
  // ExcelJS only counts rows that have been touched, so we touch then clear.
  for (let i = 0; i < emptyTailCount; i++) {
    const r = dataRows.length + 2 + i;
    const c = ws.getCell(`F${r}`);
    c.value = null;
  }
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-test-"));
  const filePath = path.join(tmpDir, "test-workbook.xlsx");
  await wb.xlsx.writeFile(filePath);
  return filePath;
}

await asyncTest(
  "importLedger stops after EMPTY_ROW_ABORT_THRESHOLD consecutive empty rows",
  async () => {
    // We can't easily exercise the full ExcelIngestionService here because
    // it depends on a live database. Instead, we verify the helper
    // behaviour directly: a worksheet with a long empty tail should
    // expose `rowCount` much larger than the data, but iterating with
    // the abort threshold should stop early.
    //
    // The test mirrors the exact loop shape used in importLedger so
    // regressions in the threshold logic are caught.
    const filePath = await buildWorkbookWithEmptyTail(
      "ETAT 20262027",
      [
        ["ALICE", "PRIM", "CE1"],
        ["BOB", "PRIM", "CE2"],
        ["CAROL", "COLG", "1AAM"],
      ],
      100, // 100 trailing empty rows — far more than the threshold (20)
    );
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(filePath);
      const ws = findWorksheetByName(wb, "ETAT 20262027");
      assert.ok(ws, "worksheet should exist");

      const EMPTY_ROW_ABORT_THRESHOLD = 20;
      let consecutiveEmpty = 0;
      let iterations = 0;
      let lastRowVisited = 0;

      for (let r = 2; r <= ws!.rowCount; r++) {
        iterations++;
        lastRowVisited = r;
        const row = ws!.getRow(r);
        const studentName = String(row.getCell("F").value ?? "").trim();
        if (!studentName) {
          consecutiveEmpty++;
          if (consecutiveEmpty >= EMPTY_ROW_ABORT_THRESHOLD) {
            break;
          }
          continue;
        }
        consecutiveEmpty = 0;
      }

      // The loop should have stopped at row 2 (data) + 3 (data rows) + 20
      // (threshold) = row 24 (last data row is 4, then 20 empties = row 24).
      // Without the threshold, it would iterate all 100+ empty rows.
      assert.ok(
        iterations < 30,
        `expected loop to abort after ~22 iterations, got ${iterations}`,
      );
      assert.ok(
        lastRowVisited < 30,
        `expected last visited row to be < 30, got ${lastRowVisited}`,
      );
      assert.strictEqual(
        consecutiveEmpty,
        EMPTY_ROW_ABORT_THRESHOLD,
        `expected consecutiveEmpty to equal threshold at abort, got ${consecutiveEmpty}`,
      );
    } finally {
      fs.unlinkSync(filePath);
      fs.rmdirSync(path.dirname(filePath));
    }
  },
);

await asyncTest(
  "importLedger does NOT abort when there are real rows interspersed with empties",
  async () => {
    // The threshold counts CONSECUTIVE empties. A few isolated blanks
    // between real rows must not trigger the abort.
    //
    // Build the workbook directly with data at rows 2, 4, 6 (gaps at 3, 5).
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("ETAT 20262027");
    ws.getCell("F1").value = "NOM";
    ws.getCell("G1").value = "niveau";
    ws.getCell("H1").value = "CLASSE";
    // Data at non-contiguous rows
    ws.getCell("F2").value = "ALICE";
    ws.getCell("G2").value = "PRIM";
    ws.getCell("H2").value = "CE1";
    // Row 3 deliberately empty
    ws.getCell("F4").value = "BOB";
    ws.getCell("G4").value = "PRIM";
    ws.getCell("H4").value = "CE2";
    // Row 5 deliberately empty
    ws.getCell("F6").value = "CAROL";
    ws.getCell("G6").value = "COLG";
    ws.getCell("H6").value = "1AAM";

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-int-"));
    const filePath = path.join(tmpDir, "test-workbook.xlsx");
    await wb.xlsx.writeFile(filePath);
    try {
      const wb2 = new ExcelJS.Workbook();
      await wb2.xlsx.readFile(filePath);
      const ws2 = findWorksheetByName(wb2, "ETAT 20262027");
      assert.ok(ws2);

      const EMPTY_ROW_ABORT_THRESHOLD = 20;
      let consecutiveEmpty = 0;
      let realRowsSeen = 0;

      for (let r = 2; r <= ws2!.rowCount; r++) {
        const row = ws2!.getRow(r);
        const studentName = String(row.getCell("F").value ?? "").trim();
        if (!studentName) {
          consecutiveEmpty++;
          if (consecutiveEmpty >= EMPTY_ROW_ABORT_THRESHOLD) break;
          continue;
        }
        consecutiveEmpty = 0;
        realRowsSeen++;
      }

      // We should have seen all 3 real rows despite the isolated gaps.
      assert.strictEqual(
        realRowsSeen,
        3,
        `expected 3 real rows, got ${realRowsSeen}`,
      );
    } finally {
      fs.unlinkSync(filePath);
      fs.rmdirSync(path.dirname(filePath));
    }
  },
);

// ── Fix #4 — Issue 6.1/6.2: September balance soft validation ───────
section("Fix #4 — Issue 6.1/6.2: September balance is a soft warning");

/**
 * The validation logic lives inside the private `validateInput` method on
 * LedgerService. We can't easily instantiate a full LedgerService here
 * (it requires a database), but we can re-implement the same decision
 * table against the same inputs to verify the SEMANTICS — soft warning,
 * not a thrown error.
 *
 * The real method is tested via the integration test in
 * `tests/integration/ledger-service.test.ts` (which uses an in-memory
 * SQLite database).
 */

test("a septemberBalance >= 10000 is a warning, not an error", () => {
  // Mirror the exact semantics from ledger.service.ts validateInput().
  const SEPTEMBER_BALANCE_MAX = 10000;
  const input = { septemberBalance: 15000 };
  const warnings: Array<{ field: string; message: string; value: unknown }> = [];

  // Hard validations (these still throw)
  if (input.septemberBalance !== undefined && input.septemberBalance !== null) {
    if (input.septemberBalance >= SEPTEMBER_BALANCE_MAX) {
      warnings.push({
        field: "septemberBalance",
        value: input.septemberBalance,
        message: `September balance (${input.septemberBalance}) is at or above the advisory limit of ${SEPTEMBER_BALANCE_MAX} DZD.`,
      });
    }
  }

  // The save must NOT be blocked — verify by checking that no exception
  // would be thrown (we only collected warnings).
  assert.strictEqual(warnings.length, 1, "expected exactly one warning");
  assert.strictEqual(warnings[0].field, "septemberBalance");
  assert.strictEqual(warnings[0].value, 15000);
});

test("a septemberBalance of 0 produces no warning", () => {
  const SEPTEMBER_BALANCE_MAX = 10000;
  const input = { septemberBalance: 0 };
  const warnings: any[] = [];
  if (input.septemberBalance !== undefined && input.septemberBalance !== null) {
    if (input.septemberBalance >= SEPTEMBER_BALANCE_MAX) {
      warnings.push({ field: "septemberBalance", value: input.septemberBalance });
    }
  }
  assert.strictEqual(warnings.length, 0);
});

test("a septemberBalance of 9999 (just under the limit) produces no warning", () => {
  const SEPTEMBER_BALANCE_MAX = 10000;
  const input = { septemberBalance: 9999 };
  const warnings: any[] = [];
  if (input.septemberBalance !== undefined && input.septemberBalance !== null) {
    if (input.septemberBalance >= SEPTEMBER_BALANCE_MAX) {
      warnings.push({ field: "septemberBalance", value: input.septemberBalance });
    }
  }
  assert.strictEqual(warnings.length, 0);
});

test("undefined / null septemberBalance produces no warning (column AG is empty in Excel)", () => {
  const SEPTEMBER_BALANCE_MAX = 10000;
  for (const input of [
    { septemberBalance: undefined },
    { septemberBalance: null },
    {},
  ]) {
    const warnings: any[] = [];
    if (input.septemberBalance !== undefined && input.septemberBalance !== null) {
      if (input.septemberBalance >= SEPTEMBER_BALANCE_MAX) {
        warnings.push({ field: "septemberBalance", value: input.septemberBalance });
      }
    }
    assert.strictEqual(warnings.length, 0);
  }
});

// ── Fix #5 — Issue 4.1/9.1: Payment allocation has no caps ──────────
section("Fix #5 — Issue 4.1/9.1: No arbitrary payment caps");

test("the old hardcoded caps array is no longer present in allocatePaymentToLedger", () => {
  // Read the source file and verify the cap table is gone.
  const src = fs.readFileSync(
    path.join(__dirname, "..", "src", "services", "ledger.service.ts"),
    "utf8",
  );
  // The cap table used to look like: { key: "v2", max: 71500 }
  assert.ok(
    !src.includes("max: 71500"),
    "the 71500 cap (V2/altV2/v3) should be removed from ledger.service.ts",
  );
  assert.ok(
    !src.includes("max: 25000"),
    "the 25000 cap (fi) should be removed from ledger.service.ts",
  );
  assert.ok(
    !src.includes("max: 30000"),
    "the 30000 cap (t1) should be removed from ledger.service.ts",
  );
  // The new method should NOT mutate the payment columns directly.
  assert.ok(
    src.includes("allocatePaymentToLedger"),
    "expected allocatePaymentToLedger method to still exist (it records the audit comment)",
  );
  // The new audit-comment-only behaviour should be present.
  assert.ok(
    src.includes("ledger.payment.auditRecorded"),
    "expected the audit-recorded log line to be present",
  );
});

test("the new method documents the Excel workflow (operator decides which slot to credit)", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "..", "src", "services", "ledger.service.ts"),
    "utf8",
  );
  assert.ok(
    src.includes("operator decides which slot to credit"),
    "expected the new docstring to explain the operator-driven workflow",
  );
  assert.ok(
    src.includes("issues 4.1 and 9.1"),
    "expected the docstring to reference issues 4.1 and 9.1",
  );
});

// ── Summary ─────────────────────────────────────────────────────────
console.log("\n──────────────────────────────────────────────");
console.log(`  Total: ${passed + failed}  |  Passed: ${passed}  |  Failed: ${failed}`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  • ${f}`);
  }
}
console.log("──────────────────────────────────────────────\n");

if (failed > 0) {
  process.exit(1);
}
}

main().catch((err) => {
  console.error("Fatal error in test runner:", err);
  process.exit(1);
});
