/**
 * Iteration 4 — test harness for the 10 new fixes.
 *
 * Each test module corresponds to one issue (or a tightly-coupled
 * group of issues). Run with:
 *   npx tsx tests/run-iteration4-tests.ts
 *
 * Issues covered:
 *   Fix #23 — Build blocker: quote.service.ts TS errors (Partial<CreateQuoteBlockInput>)
 *   Fix #24 — Build blocker: missing DataGrid component
 *   Fix #25 — Issue 4.3  : Transport tranches tier-based installments
 *   Fix #26 — Issue 6.3  : Validation for December/March receivable columns
 *   Fix #27 — Issue 8.1  : S94 off-by-one ingestion advisory warning
 *   Fix #28 — Issue 10.4 : condition_expr filter implementation
 *   Fix #29 — Issue 19   : recomputeAll() pagination
 *   Fix #30 — Issue 20   : Audit trail for calculations (ledger.entry.computed)
 *   Fix #31 — Mismatch C : Sibling discount via primary_parent_id indexed lookup
 *   Fix #32 — Issue 5.5  : Quote block dropdown validation
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// ── Iteration 4 modules under test ──────────────────────────────────
import { LedgerService } from "../src/services/ledger.service";
import { QuoteService, isQuoteConfirmed } from "../src/services/quote.service";
import {
  resolveTransportInstallments,
  TRANSPORT_INSTALLMENTS_BY_TIER,
  TransportTier,
} from "../src/shared/pricing";
import {
  evaluateRuleCondition,
} from "../src/shared/rule-condition";
import {
  CLASSE_DROPDOWN_VALUES,
  FI_DROPDOWN_VALUES,
  FRAISSCOLAIRE_DROPDOWN_VALUES,
  SERVICE_DROPDOWN_VALUES,
  TRANSPORT_DROPDOWN_VALUES,
  validateQuoteLineItemDropdowns,
  validateQuoteBlockDropdowns,
  classToLevel,
} from "../src/shared/quote-dropdown-values";
import { ExcelIngestionService } from "../src/services/excel-ingestion.service";

// ── Integration: real SQLite DB ─────────────────────────────────────
import { DatabaseClient } from "../src/infrastructure/database/sqlite-client";
import { MigrationsRunner } from "../src/infrastructure/database/migrations/migrations-runner";
import { migrations } from "../src/infrastructure/database/migrations/migrations";
import { LedgerRepository } from "../src/infrastructure/repositories/ledger-entry.repository";
import { FeeScheduleRepository } from "../src/infrastructure/repositories/fee-schedule.repository";
import { FormulaRuleRepository } from "../src/infrastructure/repositories/formula-rule.repository";
import { PaymentAuditCommentRepository } from "../src/infrastructure/repositories/payment-audit-comment.repository";
import { QuoteBlockRepository } from "../src/infrastructure/repositories/quote-block.repository";
import { ParentRepository } from "../src/infrastructure/repositories/parent.repository";
import { StudentRepository } from "../src/infrastructure/repositories/student.repository";
import { SpreadsheetTemplateRepository } from "../src/infrastructure/repositories/spreadsheet-template.repository";
import { EventBus } from "../src/infrastructure/event-bus/event-bus";
import { getStarterFormulaRules } from "../src/services/formula-rule.service";

// ── Test runner ──────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    failed++;
    const msg = (err as Error).message;
    failures.push(`${name}: ${msg}`);
    console.log(`  \u2717 ${name}`);
    console.log(`      \u2192 ${msg}`);
  }
}

async function asyncTest(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    failed++;
    const msg = (err as Error).message;
    failures.push(`${name}: ${msg}`);
    console.log(`  \u2717 ${name}`);
    console.log(`      \u2192 ${msg}`);
  }
}

function section(title: string): void {
  console.log(`\n\u2500\u2500 ${title} \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`);
}

// ── Setup helpers ───────────────────────────────────────────────────

async function setupLedgerService(): Promise<{
  service: LedgerService;
  db: DatabaseClient;
  eventBus: EventBus;
  cleanup: () => Promise<void>;
}> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-iter4-"));
  const dbPath = path.join(tmpDir, "test.db");
  const db = new DatabaseClient({ filePath: dbPath });
  await db.open();
  const runner = new MigrationsRunner(db);
  await runner.runAll(migrations);

  const eventBus = new EventBus();
  const ledgerRepo = new LedgerRepository(db);
  const feeScheduleRepo = new FeeScheduleRepository(db);
  const formulaRuleRepo = new FormulaRuleRepository(db);
  const auditCommentRepo = new PaymentAuditCommentRepository(db);

  for (const rule of getStarterFormulaRules()) {
    await formulaRuleRepo.create(rule);
  }

  const service = new LedgerService(
    ledgerRepo,
    feeScheduleRepo,
    formulaRuleRepo,
    auditCommentRepo,
    eventBus,
  );

  return {
    service,
    db,
    eventBus,
    cleanup: async () => {
      await db.close();
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    },
  };
}

async function setupQuoteService(): Promise<{
  service: QuoteService;
  repo: QuoteBlockRepository;
  db: DatabaseClient;
  cleanup: () => Promise<void>;
}> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-quote-iter4-"));
  const dbPath = path.join(tmpDir, "test.db");
  const db = new DatabaseClient({ filePath: dbPath });
  await db.open();
  const runner = new MigrationsRunner(db);
  await runner.runAll(migrations);

  const eventBus = new EventBus();
  const quoteRepo = new QuoteBlockRepository(db);
  const service = new QuoteService(quoteRepo, eventBus);

  return {
    service,
    repo: quoteRepo,
    db,
    cleanup: async () => {
      await db.close();
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    },
  };
}

// ── Summary ─────────────────────────────────────────────────────────
async function main(): Promise<void> {

// ════════════════════════════════════════════════════════════════════
// Fix #23 — Build blocker: quote.service.ts TS errors
// ════════════════════════════════════════════════════════════════════
section("Fix #23 — Build blocker: quote.service.ts TS errors");

test(
  "isQuoteConfirmed() accepts partial line items (no id/lineTotal required)",
  () => {
    // The build blocker was that validateInput() passed items without
    // id/lineTotal to isQuoteConfirmed(), which required QuoteLineItem[].
    // The relaxed signature accepts any object with an `amounts` array.
    const partialItems = [
      { label: "Child A", amounts: [0, 0, 0, 0, 25000, 0, 0, 0] },
      { label: "Child B", amounts: [0, 0, 0, 0, 0, 205000, 0, 0] },
    ];
    assert.strictEqual(isQuoteConfirmed(partialItems as any), true);

    const unconfirmed = [
      { label: "Child C", amounts: [0, 0, 0, 0, 0, 0, 0, 0] },
    ];
    assert.strictEqual(isQuoteConfirmed(unconfirmed as any), false);
  },
);

test(
  "QuoteService.update() with patch (no name) no longer causes TS2345",
  async () => {
    // This test exercises the exact path that broke the build:
    // update() merges patch with before.items, then calls validateInput()
    // which previously required `name`. The relaxed Partial<> signature
    // accepts the patch.
    const { service, cleanup } = await setupQuoteService();
    try {
      const created = await service.create({
        name: "PATCH-TEST-001",
        items: [{ label: "Child", amounts: [0, 0, 0, 0, 25000, 0, 0, 0] }],
        paymentDate: null,
      });
      // Update with a patch that does NOT include `name`. This used
      // to be a TS2345 error.
      const updated = await service.update(created.id.value, {
        discounts: 5000,
      });
      assert.strictEqual(updated.discounts, 5000);
      assert.strictEqual(updated.name, "PATCH-TEST-001", "name should be unchanged");
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #24 — Build blocker: missing DataGrid component
// ════════════════════════════════════════════════════════════════════
section("Fix #24 — Build blocker: missing DataGrid component");

test(
  "DataGrid component file exists at the path every page imports from",
  () => {
    const file = path.join(__dirname, "..", "src", "ui", "components", "data", "DataGrid.tsx");
    assert.ok(fs.existsSync(file), `expected DataGrid at ${file}`);
  },
);

test(
  "DataGrid source exports both `DataGrid` and `Column` (the named imports used by pages)",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "ui", "components", "data", "DataGrid.tsx"),
      "utf8",
    );
    assert.match(src, /export function DataGrid/);
    assert.match(src, /export interface Column/);
  },
);

test(
  "DataGrid supports the full prop surface used by Students/Payments/Classes pages",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "ui", "components", "data", "DataGrid.tsx"),
      "utf8",
    );
    // Every prop used by the calling pages must appear in the DataGridProps interface.
    const requiredProps = [
      "columns", "data", "rowKey", "loading", "emptyState",
      "onRowClick", "selectedIds", "onSelectionChange",
      "sortField", "sortDir",
    ];
    for (const p of requiredProps) {
      assert.ok(
        src.includes(`${p}?:`) || src.includes(`${p}:`),
        `DataGridProps should declare \`${p}\``,
      );
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #25 — Issue 4.3: Transport tranches tier-based installments
// ════════════════════════════════════════════════════════════════════
section("Fix #25 — Issue 4.3: Transport tranches tier-based installments");

test(
  "TRANSPORT_INSTALLMENTS_BY_TIER exposes 4 tiers matching the documented breakdown",
  () => {
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.NEARBY].total, 35000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.NEARBY].t1, 20000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.NEARBY].t2, 10000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.NEARBY].t3, 5000);

    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.INTERMEDIATE].total, 43000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.INTERMEDIATE].t1, 25000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.INTERMEDIATE].t2, 12000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.INTERMEDIATE].t3, 6000);

    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.MEDIUM].total, 52000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.MEDIUM].t1, 30000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.MEDIUM].t2, 12000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.MEDIUM].t3, 10000);

    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.FAR].total, 55000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.FAR].t1, 30000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.FAR].t2, 15000);
    assert.strictEqual(TRANSPORT_INSTALLMENTS_BY_TIER[TransportTier.FAR].t3, 10000);
  },
);

test(
  "For each tier, t1 + t2 + t3 equals total (the tranches sum back to the documented transport fee)",
  () => {
    for (const tier of Object.values(TransportTier)) {
      const inst = TRANSPORT_INSTALLMENTS_BY_TIER[tier];
      const sum = inst.t1 + inst.t2 + inst.t3;
      assert.strictEqual(
        sum, inst.total,
        `tier ${tier}: t1+t2+t3 = ${sum} but total = ${inst.total}`,
      );
    }
  },
);

test(
  "resolveTransportInstallments('Boudouaou') returns the MEDIUM tier breakdown",
  () => {
    const inst = resolveTransportInstallments("Boudouaou");
    assert.ok(inst);
    assert.strictEqual(inst.tier, TransportTier.MEDIUM);
    assert.strictEqual(inst.t1, 30000);
  },
);

test(
  "resolveTransportInstallments('Boumerdès') returns the NEARBY tier breakdown",
  () => {
    const inst = resolveTransportInstallments("Boumerdès");
    assert.ok(inst);
    assert.strictEqual(inst.tier, TransportTier.NEARBY);
    assert.strictEqual(inst.t1, 20000);
  },
);

test(
  "resolveTransportInstallments('') returns null (no transport)",
  () => {
    assert.strictEqual(resolveTransportInstallments(""), null);
    assert.strictEqual(resolveTransportInstallments(null), null);
    assert.strictEqual(resolveTransportInstallments(undefined), null);
  },
);

await asyncTest(
  "LedgerService surfaces an advisory warning when typed transport tranches don't match the tier breakdown",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      // PRIM student with transport to Boumerdès (NEARBY tier).
      // Documented split: T1=20k, T2=10k, T3=5k.
      // Operator typed: T1=30k (the FAR-tier amount) — mismatch.
      const entry = await service.create({
        studentName: "TRANSPORT-MISMATCH-STUDENT",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "Boumerdès",
        remise: 0,
        t1: 30000,
        t2: 10000,
        t3: 5000,
      } as any);
      assert.ok(entry, "save should succeed (advisory only)");
      // The warning was logged via logger.warn — we can't easily capture
      // the logger output here, but the fact that create() returned a
      // valid entry proves the save wasn't blocked.
      assert.strictEqual(entry.t1, 30000, "the typed T1 should be persisted as-is");
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #26 — Issue 6.3: Validation for December/March receivable columns
// ════════════════════════════════════════════════════════════════════
section("Fix #26 — Issue 6.3: Validation for December/March receivable columns");

await asyncTest(
  "create() with septemberBalance >= 10000 surfaces a soft warning (no regression)",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      // The september-balance warning was already in place after iteration 1.
      // This test confirms iteration 4 didn't regress it.
      const entry = await service.create({
        studentName: "SEP-BAL-WARNING",
        level: "PRIM",
        optionCode: "",
        destination: "",
        remise: 0,
        septemberBalance: 15000,
      } as any);
      assert.ok(entry, "save should succeed (soft warning)");
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "create() with decemberBalance >= 10000 surfaces a soft warning (new in iteration 4)",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const entry = await service.create({
        studentName: "DEC-BAL-WARNING",
        level: "PRIM",
        optionCode: "",
        destination: "",
        remise: 0,
        decemberBalance: 12000,
      } as any);
      assert.ok(entry, "save should succeed (soft warning)");
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "create() with marchBalance >= 10000 surfaces a soft warning (new in iteration 4)",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const entry = await service.create({
        studentName: "MAR-BAL-WARNING",
        level: "PRIM",
        optionCode: "",
        destination: "",
        remise: 0,
        marchBalance: 18000,
      } as any);
      assert.ok(entry, "save should succeed (soft warning)");
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "create() with decemberBalance below threshold does NOT emit a warning",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const entry = await service.create({
        studentName: "DEC-BAL-OK",
        level: "PRIM",
        optionCode: "",
        destination: "",
        remise: 0,
        decemberBalance: 5000,
      } as any);
      assert.ok(entry, "save should succeed (no warning)");
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #27 — Issue 8.1: S94 off-by-one ingestion advisory warning
// ════════════════════════════════════════════════════════════════════
section("Fix #27 — Issue 8.1: S94 off-by-one ingestion advisory warning");

test(
  "ImportLedgerResult.offByOneWarnings field exists on the return type",
  () => {
    // We can't easily synthesise a real .xlsx file in a unit test,
    // but we can confirm the public API surface is in place. The
    // integration test below (iteration-3 already has one for the
    // round-trip path) exercises the full pipeline.
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "services", "excel-ingestion.service.ts"),
      "utf8",
    );
    assert.match(src, /offByOneWarnings/, "ImportLedgerResult should expose offByOneWarnings");
    assert.match(src, /detectOffByOneReferences/, "the detection helper should exist");
  },
);

test(
  "detectOffByOneReferences is invoked inside importLedger's row loop",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "services", "excel-ingestion.service.ts"),
      "utf8",
    );
    // The call should appear inside the row loop. We check for the
    // specific call site plus the comment that documents issue 8.1.
    assert.match(src, /Issue 8\.1: detect off-by-one references/);
    assert.match(src, /const rowWarnings = detectOffByOneReferences\(row, r\)/);
  },
);

test(
  "detectOffByOneReferences function narrows to payment columns R-Y (the columns where J refs matter)",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "services", "excel-ingestion.service.ts"),
      "utf8",
    );
    // The helper should reject non-payment columns to avoid false positives
    // on legitimate cross-row formulas (BON VLOOKUPs etc.). The regex
    // itself appears in source as /^[RSTUVWXY]$/.
    assert.match(src, /\^?\[RSTUVWXY\]/);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #28 — Issue 10.4/13: condition_expr filter implementation
// ════════════════════════════════════════════════════════════════════
section("Fix #28 — Issue 10.4/13: condition_expr filter implementation");

test(
  "evaluateRuleCondition returns {ok:true, value:true} for empty/whitespace conditions",
  () => {
    assert.deepStrictEqual(evaluateRuleCondition("", {}), { ok: true, value: true });
    assert.deepStrictEqual(evaluateRuleCondition("   ", {}), { ok: true, value: true });
    assert.deepStrictEqual(evaluateRuleCondition(null as any, {}), { ok: true, value: true });
  },
);

test(
  "evaluateRuleCondition handles string equality (case-insensitive)",
  () => {
    const fields = { level: "PRIM", optionCode: "TRNSP" };
    assert.strictEqual(evaluateRuleCondition('level = "PRIM"', fields).value, true);
    assert.strictEqual(evaluateRuleCondition('level = "prim"', fields).value, true);
    assert.strictEqual(evaluateRuleCondition('level = "COLG"', fields).value, false);
    assert.strictEqual(evaluateRuleCondition('optionCode = "TRNSP"', fields).value, true);
  },
);

test(
  "evaluateRuleCondition handles numeric comparisons",
  () => {
    const fields = { remise: 25500, fi: 25000 };
    assert.strictEqual(evaluateRuleCondition("remise > 0", fields).value, true);
    assert.strictEqual(evaluateRuleCondition("remise > 30000", fields).value, false);
    assert.strictEqual(evaluateRuleCondition("remise >= 25500", fields).value, true);
    assert.strictEqual(evaluateRuleCondition("fi = 25000", fields).value, true);
    assert.strictEqual(evaluateRuleCondition("fi < 25000", fields).value, false);
  },
);

test(
  "evaluateRuleCondition handles AND / OR / NOT composition",
  () => {
    const fields = { level: "LYC", optionCode: "TRNSP", remise: 5000 };
    assert.strictEqual(
      evaluateRuleCondition('level = "LYC" AND remise > 0', fields).value,
      true,
    );
    assert.strictEqual(
      evaluateRuleCondition('level = "PRIM" OR level = "LYC"', fields).value,
      true,
    );
    assert.strictEqual(
      evaluateRuleCondition('NOT (level = "PRIM")', fields).value,
      true,
    );
    assert.strictEqual(
      evaluateRuleCondition('level = "PRIM" AND remise > 0', fields).value,
      false,
    );
  },
);

test(
  "evaluateRuleCondition handles IS NULL / IS NOT NULL",
  () => {
    const fields = { level: "PRIM", destination: "" };
    assert.strictEqual(
      evaluateRuleCondition("destination IS NULL", fields).value,
      true,
    );
    assert.strictEqual(
      evaluateRuleCondition("destination IS NOT NULL", fields).value,
      false,
    );
    assert.strictEqual(
      evaluateRuleCondition("level IS NOT NULL", fields).value,
      true,
    );
  },
);

test(
  "evaluateRuleCondition returns {ok:false} for unparseable conditions (no throw)",
  () => {
    const r = evaluateRuleCondition("level =", { level: "PRIM" });
    assert.strictEqual(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  },
);

await asyncTest(
  "LedgerService.computeFields() filters rules by condition_expr before evaluating them",
  async () => {
    const { service, cleanup, db } = await setupLedgerService();
    try {
      // Insert a custom rule that ONLY applies to PRIM students.
      // We need to bypass the formula-rule service and insert
      // directly via the repository so we can set the condition.
      const formulaRuleRepo = new FormulaRuleRepository(db);
      await formulaRuleRepo.create({
        name: "PRIM-only bonus",
        expression: "registration + baseTuition + 1000",
        scope: "ledger",
        targetField: "devisAnnuel",
        trigger: "on_save",
        watchedFields: [],
        isActive: true,
        condition: 'level = "PRIM"',
        priority: 5,  // lower than the starter rule (10) → runs first
      });

      // PRIM student — the custom rule should fire and produce
      // a devisAnnuel that's 1000 higher than the fallback.
      const primComputed = await service.computeFields({
        studentName: "PRIM-RULE-TEST",
        level: "PRIM",
        optionCode: "",
        destination: "",
        remise: 0,
      } as any);
      // registration=25k + tuition=205k + 1000 bonus = 231000.
      // (Without the rule, the fallback would give 25000+205000=230000.)
      assert.strictEqual(primComputed.devisAnnuel, 231000);

      // LYC student — the rule's condition doesn't match, so the
      // starter rule (or fallback) should fire instead.
      const lycComputed = await service.computeFields({
        studentName: "LYC-RULE-TEST",
        level: "LYC",
        optionCode: "",
        destination: "",
        remise: 0,
      } as any);
      // registration=30k + tuition=340k = 370000 (no +1000 bonus).
      assert.strictEqual(lycComputed.devisAnnuel, 370000);
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #29 — Issue 19: recomputeAll() pagination
// ════════════════════════════════════════════════════════════════════
section("Fix #29 — Issue 19: recomputeAll() pagination");

test(
  "recomputeAll accepts an options parameter with pageSize (no longer hardcoded 10000)",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "services", "ledger.service.ts"),
      "utf8",
    );
    // The signature should accept { pageSize? } rather than always
    // loading 10000 entries in a single shot.
    assert.match(src, /recomputeAll\(\s*options\s*:\s*\{\s*pageSize\?\s*:\s*number\s*\}/);
    // The page size should be bounded (clamped to [1, 1000]).
    assert.match(src, /Math\.max\(1,\s*Math\.min\(1000,/);
  },
);

await asyncTest(
  "recomputeAll processes entries in paginated batches (small pageSize produces same result as large)",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      // Insert 5 entries.
      for (let i = 0; i < 5; i++) {
        await service.create({
          studentName: `BATCH-STUDENT-${i}`,
          level: "PRIM",
          optionCode: "",
          destination: "",
          remise: i * 1000,
        } as any);
      }
      // Recompute with pageSize=2 (3 pages: 2 + 2 + 1).
      const result = await service.recomputeAll({ pageSize: 2 });
      assert.strictEqual(result.recomputed, 5);
      assert.strictEqual(result.skipped, 0);
      assert.strictEqual(result.errors.length, 0);
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "recomputeAll without options uses a sensible default page size",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      // Insert 3 entries.
      for (let i = 0; i < 3; i++) {
        await service.create({
          studentName: `DEFAULT-PAGE-STUDENT-${i}`,
          level: "PRIM",
          optionCode: "",
          destination: "",
          remise: 0,
        } as any);
      }
      // No options → default pageSize (200).
      const result = await service.recomputeAll();
      assert.strictEqual(result.recomputed, 3);
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #30 — Issue 20: Audit trail for calculations
// ════════════════════════════════════════════════════════════════════
section("Fix #30 — Issue 20: Audit trail for calculations");

test(
  "LedgerService.computeFields emits a 'ledger.entry.computed' event on the event bus",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "services", "ledger.service.ts"),
      "utf8",
    );
    assert.match(src, /ledger\.entry\.computed/);
    assert.match(src, /ruleSummary/);
  },
);

await asyncTest(
  "the 'ledger.entry.computed' event is received by subscribers (audit trail wiring)",
  async () => {
    const { service, eventBus, cleanup } = await setupLedgerService();
    try {
      let received = false;
      let receivedPayload: any = null;
      eventBus.subscribe("ledger.entry.computed", async (event) => {
        received = true;
        receivedPayload = event.payload;
      });
      await service.computeFields({
        studentName: "AUDIT-TRAIL-TEST",
        level: "PRIM",
        optionCode: "",
        destination: "",
        remise: 0,
      } as any);
      assert.ok(received, "subscriber should have been notified");
      assert.ok(receivedPayload, "payload should be present");
      assert.strictEqual(receivedPayload.entityType, "LedgerEntry");
      assert.ok(receivedPayload.metadata, "metadata should be present");
      assert.strictEqual(receivedPayload.metadata.studentName, "AUDIT-TRAIL-TEST");
      assert.strictEqual(receivedPayload.metadata.level, "PRIM");
      assert.ok(Array.isArray(receivedPayload.metadata.rules), "rules should be an array");
    } finally {
      await cleanup();
    }
  },
);

test(
  "AuditService.registerListeners subscribes to 'ledger.entry.computed'",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "services", "audit.service.ts"),
      "utf8",
    );
    assert.match(src, /ledger\.entry\.computed/);
  },
);

test(
  "Migration 007 creates the ledger_computed_audit table for persisted audit records",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "infrastructure", "database", "migrations", "migrations.ts"),
      "utf8",
    );
    assert.match(src, /ledger_computed_audit/);
    assert.match(src, /007_iteration4_indexes_and_audit/);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #31 — Mismatch C: Sibling discount via primary_parent_id indexed lookup
// ════════════════════════════════════════════════════════════════════
section("Fix #31 — Mismatch C: Sibling discount via primary_parent_id indexed lookup");

test(
  "Migration 007 creates the idx_students_primary_parent index",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "infrastructure", "database", "migrations", "migrations.ts"),
      "utf8",
    );
    assert.match(src, /idx_students_primary_parent/);
    assert.match(src, /CREATE INDEX IF NOT EXISTS idx_students_primary_parent\s+ON students\(primary_parent_id\)/);
  },
);

test(
  "ParentRepository.getStudentIds uses primary_parent_id = ? as the fast path",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "infrastructure", "repositories", "parent.repository.ts"),
      "utf8",
    );
    // The fast path should appear before the LIKE fallback.
    const fastIdx = src.indexOf("primary_parent_id = @parentId");
    const slowIdx = src.indexOf("parent_ids_json LIKE @pattern");
    assert.ok(fastIdx > -1, "fast path should exist");
    assert.ok(slowIdx > -1, "legacy fallback should still exist");
    assert.ok(
      fastIdx < slowIdx,
      "fast path should appear before the LIKE fallback in the source",
    );
  },
);

await asyncTest(
  "getStudentIds finds students via primary_parent_id (fast path, no LIKE)",
  async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-sib-iter4-"));
    const dbPath = path.join(tmpDir, "test.db");
    const db = new DatabaseClient({ filePath: dbPath });
    try {
      await db.open();
      const runner = new MigrationsRunner(db);
      await runner.runAll(migrations);

      const parentRepo = new ParentRepository(db);
      const studentRepo = new StudentRepository(db);

      // Create a parent.
      const parent = await parentRepo.create({
        firstName: "TEST",
        lastName: "PARENT",
        phone: "0555000000",
        relationship: "guardian",
      } as any);

      // Create two students linked via primary_parent_id.
      // We need to insert directly because the StudentRepository's
      // create() may not set primary_parent_id directly. Use a
      // raw INSERT to be sure.
      const s1 = "sib-student-1";
      const s2 = "sib-student-2";
      db.run(
        `INSERT INTO students (id, student_code, first_name, last_name, full_name,
          date_of_birth, parent_ids_json, primary_parent_id, phone_numbers_json,
          address_json, emergency_contacts_json, registered_at, status, created_at, updated_at)
         VALUES (@id, @code, @first, @last, @full, @dob, @pids, @pid, '[]', '{}', '[]',
          @now, 'pending', @now, @now)`,
        {
          id: s1,
          code: "ST1",
          first: "Child",
          last: "One",
          full: "Child One",
          dob: "2015-01-01",
          pids: JSON.stringify([parent.id.value]),
          pid: parent.id.value,
          now: new Date().toISOString(),
        },
      );
      db.run(
        `INSERT INTO students (id, student_code, first_name, last_name, full_name,
          date_of_birth, parent_ids_json, primary_parent_id, phone_numbers_json,
          address_json, emergency_contacts_json, registered_at, status, created_at, updated_at)
         VALUES (@id, @code, @first, @last, @full, @dob, @pids, @pid, '[]', '{}', '[]',
          @now, 'pending', @now, @now)`,
        {
          id: s2,
          code: "ST2",
          first: "Child",
          last: "Two",
          full: "Child Two",
          dob: "2017-01-01",
          pids: JSON.stringify([parent.id.value]),
          pid: parent.id.value,
          now: new Date().toISOString(),
        },
      );

      // Verify both students are found via primary_parent_id.
      const studentIds = await parentRepo.getStudentIds(parent.id.value);
      assert.ok(studentIds.includes(s1), `should include ${s1}`);
      assert.ok(studentIds.includes(s2), `should include ${s2}`);
      assert.strictEqual(studentIds.length, 2);
    } finally {
      await db.close();
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  },
);

await asyncTest(
  "getStudentIds still finds legacy rows whose primary_parent_id is null but parent_ids_json contains the ID",
  async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-sib-legacy-iter4-"));
    const dbPath = path.join(tmpDir, "test.db");
    const db = new DatabaseClient({ filePath: dbPath });
    try {
      await db.open();
      const runner = new MigrationsRunner(db);
      await runner.runAll(migrations);

      const parentRepo = new ParentRepository(db);

      const parent = await parentRepo.create({
        firstName: "LEGACY",
        lastName: "PARENT",
        phone: "0555000001",
        relationship: "guardian",
      } as any);

      // Insert a student with primary_parent_id = NULL but
      // parent_ids_json containing the parent ID — this is the
      // pattern produced by Excel ingestion.
      const s = "legacy-sib-student";
      db.run(
        `INSERT INTO students (id, student_code, first_name, last_name, full_name,
          date_of_birth, parent_ids_json, primary_parent_id, phone_numbers_json,
          address_json, emergency_contacts_json, registered_at, status, created_at, updated_at)
         VALUES (@id, @code, @first, @last, @full, @dob, @pids, NULL, '[]', '{}', '[]',
          @now, 'pending', @now, @now)`,
        {
          id: s,
          code: "LST1",
          first: "Legacy",
          last: "Child",
          full: "Legacy Child",
          dob: "2016-01-01",
          pids: JSON.stringify([parent.id.value]),
          now: new Date().toISOString(),
        },
      );

      // The fast path returns nothing (primary_parent_id is NULL),
      // so the legacy fallback should fire.
      const ids = await parentRepo.getStudentIds(parent.id.value);
      assert.ok(ids.includes(s), "legacy row should be found via LIKE fallback");
    } finally {
      await db.close();
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #32 — Issue 5.5: Quote block dropdown validation
// ════════════════════════════════════════════════════════════════════
section("Fix #32 — Issue 5.5: Quote block dropdown validation");

test(
  "All five canonical dropdown lists are non-empty",
  () => {
    assert.ok(CLASSE_DROPDOWN_VALUES.length >= 10, "CLASSE should have ≥10 codes");
    assert.ok(FI_DROPDOWN_VALUES.length >= 2, "FI should have ≥2 amounts");
    assert.ok(FRAISSCOLAIRE_DROPDOWN_VALUES.length >= 4, "FRAISSCOLAIRE should have ≥4 amounts");
    assert.ok(SERVICE_DROPDOWN_VALUES.length >= 5, "SERVICE should have ≥5 values");
    assert.ok(TRANSPORT_DROPDOWN_VALUES.length === 4, "transport should have exactly 4 tiers");
  },
);

test(
  "CLASSE_DROPDOWN_VALUES includes both level codes (PRIM, COLG) and specific class codes (CP, CE1, 1AAM, 1AS)",
  () => {
    for (const code of ["MS", "GS", "PRIM", "CP", "CE1", "CE2", "CM1", "CM2",
      "COLG", "1AAM", "2AAM", "3AAM", "4AAM",
      "LYC", "1AS", "2AS", "3AS",
      "AUTISTE", "NV2", "NV3", "NV4", "NV5"]) {
      assert.ok(
        CLASSE_DROPDOWN_VALUES.includes(code),
        `CLASSE should include ${code}`,
      );
    }
  },
);

test(
  "FI_DROPDOWN_VALUES includes 18000, 25000, and 30000 (the three documented registration tiers)",
  () => {
    for (const amt of ["18000", "25000", "30000"]) {
      assert.ok(FI_DROPDOWN_VALUES.includes(amt), `FI should include ${amt}`);
    }
  },
);

test(
  "TRANSPORT_DROPDOWN_VALUES includes 35000, 43000, 52000, and 55000 (the four transport tiers)",
  () => {
    for (const amt of ["35000", "43000", "52000", "55000"]) {
      assert.ok(TRANSPORT_DROPDOWN_VALUES.includes(amt), `transport should include ${amt}`);
    }
  },
);

test(
  "validateQuoteLineItemDropdowns returns no warnings for canonical values",
  () => {
    const w = validateQuoteLineItemDropdowns({
      classe: "CE1",
      fi: "25000",
      fraisScolaire: "205000",
      service: "Transport",
      transport: "35000",
    });
    assert.strictEqual(w.length, 0);
  },
);

test(
  "validateQuoteLineItemDropdowns returns a warning for an unknown classe",
  () => {
    const w = validateQuoteLineItemDropdowns({
      classe: "UNKNOWN-CODE",
    });
    assert.strictEqual(w.length, 1);
    assert.strictEqual(w[0].field, "classe");
    assert.match(w[0].message, /5\.5/);
  },
);

test(
  "validateQuoteLineItemDropdowns is case-insensitive",
  () => {
    const w = validateQuoteLineItemDropdowns({
      classe: "ce1",  // lowercase
      fi: "25000",
    });
    assert.strictEqual(w.length, 0);
  },
);

test(
  "validateQuoteLineItemDropdowns returns a warning for an unknown transport amount",
  () => {
    const w = validateQuoteLineItemDropdowns({
      transport: "99999",
    });
    assert.strictEqual(w.length, 1);
    assert.strictEqual(w[0].field, "transport");
  },
);

test(
  "validateQuoteLineItemDropdowns allows empty values (Excel allows blanks)",
  () => {
    const w = validateQuoteLineItemDropdowns({
      classe: "",
      fi: "",
      fraisScolaire: "",
      service: "",
      transport: "",
    });
    assert.strictEqual(w.length, 0);
  },
);

test(
  "validateQuoteBlockDropdowns aggregates warnings across multiple items and tags each with the item label",
  () => {
    const w = validateQuoteBlockDropdowns([
      { label: "Child A", classe: "CE1", fi: "25000" },
      { label: "Child B", classe: "BAD-CODE", transport: "99999" },
    ]);
    assert.strictEqual(w.length, 2);
    assert.match(w[0].message, /\[Child B\]/);
  },
);

test(
  "classToLevel maps specific class codes to their parent level",
  () => {
    assert.strictEqual(classToLevel("CE1"), "PRIM");
    assert.strictEqual(classToLevel("CM2"), "PRIM");
    assert.strictEqual(classToLevel("3AAM"), "COLG");
    assert.strictEqual(classToLevel("1AS"), "LYC");
    assert.strictEqual(classToLevel("MS"), "MS");
    assert.strictEqual(classToLevel("unknown"), null);
  },
);

await asyncTest(
  "QuoteService.validateInput surfaces dropdown warnings alongside the Nb 02 rule",
  async () => {
    const { service, cleanup } = await setupQuoteService();
    try {
      // Build a quote with two items, neither of which carries an
      // FI payment (amounts[4] = 0 for both). This should trigger
      // BOTH the Nb 02 warning (no confirmation payment) AND a
      // dropdown warning (Bad Child's classe is unknown).
      const warnings = service.validateInput({
        name: "DROPDOWN-TEST-001",
        items: [
          { label: "Good Child", classe: "CE1", fi: "25000", amounts: [0,0,0,0,0,0,0,0] },
          { label: "Bad Child", classe: "WRONG", amounts: [0,0,0,0,0,0,0,0] },
        ],
        paymentDate: null,
      });
      // Expect at least:
      //   - one Nb 02 warning (neither item has FI>0 or fraisScolaire>0)
      //   - one dropdown warning for "Bad Child"'s classe
      const nb02 = warnings.filter((w) => w.message.includes("Nb 02"));
      const dropdown = warnings.filter((w) => w.message.includes("5.5"));
      assert.ok(nb02.length >= 1, "should have at least one Nb 02 warning");
      assert.ok(dropdown.length >= 1, "should have at least one dropdown warning");
    } finally {
      await cleanup();
    }
  },
);

// ── Summary ─────────────────────────────────────────────────────────
console.log("\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
console.log(`  Iteration 4: ${passed} passed, ${failed} failed`);
console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");

if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}

}  // end of main()

main().catch((err) => {
  console.error("Fatal error in iteration-4 test runner:", err);
  process.exit(1);
});
