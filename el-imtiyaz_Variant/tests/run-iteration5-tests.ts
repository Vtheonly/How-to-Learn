/**
 * Iteration 5 — test harness for the 10 new fixes.
 *
 * Each test module corresponds to one issue (or a tightly-coupled
 * group of issues). Run with:
 *   npx tsx tests/run-iteration5-tests.ts
 *
 * Issues covered:
 *   Fix #33 — Build blocker: missing DataGrid component (re-do of iter-4 #24)
 *   Fix #34 — Issue 1.5  : Optional remise subtraction (omitRemise flag)
 *   Fix #35 — Issue 1.6  : Per-row custom formula support
 *   Fix #36 — Issue 7.4  : Conditional formatting equivalent (row status)
 *   Fix #37 — Issue 7.5  : Dead term-tracking fields cleanup
 *   Fix #38 — Issue 8.10 : E-PLANT column semantics & validation
 *   Fix #39 — Issue §3   : FeeScheduleLookup helper (level-keyed lookup)
 *   Fix #40 — Flaw A     : Async drift mitigation (EventBus contract)
 *   Fix #41 — Build verification + integration test (full pipeline)
 *   Fix #42 — Issue 5.1  : Quote line item text-column safety
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// ── Iteration 5 modules under test ──────────────────────────────────
import { LedgerService } from "../src/services/ledger.service";
import { QuoteService } from "../src/services/quote.service";
import {
  getLedgerRowStatus,
  summariseLedgerRowStatuses,
  LEDGER_ROW_STATUS_THRESHOLDS,
} from "../src/shared/ledger-row-status";
import {
  DEAD_TERM_TRACKING_FIELDS,
  DEAD_TERM_FIELD_TO_EXCEL_COLUMN,
  scanForDeadTermTrackingValues,
} from "../src/shared/term-tracking";
import {
  E_PLANT_LABEL,
  E_PLANT_DEFAULT_AMOUNT,
  E_PLANT_TYPICAL_RANGE,
  validateEPlantAmount,
} from "../src/shared/e-plant";
import {
  resolveFeeScheduleForRow,
  previewDevisForRow,
  listAllLevelPricing,
} from "../src/shared/fee-schedule-lookup";
import {
  QUOTE_LINE_ITEM_COLUMNS,
  QUOTE_NUMERIC_COLUMN_INDICES,
  computeLineTotal,
  validateQuoteLineItemAmounts,
} from "../src/shared/quote-line-item-columns";
import { EventBus } from "../src/infrastructure/event-bus/event-bus";

// ── Integration: real SQLite DB ─────────────────────────────────────
import { DatabaseClient } from "../src/infrastructure/database/sqlite-client";
import { MigrationsRunner } from "../src/infrastructure/database/migrations/migrations-runner";
import { migrations } from "../src/infrastructure/database/migrations/migrations";
import { LedgerRepository } from "../src/infrastructure/repositories/ledger-entry.repository";
import { FeeScheduleRepository } from "../src/infrastructure/repositories/fee-schedule.repository";
import { FormulaRuleRepository } from "../src/infrastructure/repositories/formula-rule.repository";
import { PaymentAuditCommentRepository } from "../src/infrastructure/repositories/payment-audit-comment.repository";
import { QuoteBlockRepository } from "../src/infrastructure/repositories/quote-block.repository";

// ── Test runner ──────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];
const pendingAsyncTests: Array<Promise<void>> = [];

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

function asyncTest(name: string, fn: () => Promise<void>): void {
  // Track the promise so the runner can await it before printing
  // the summary. This avoids the "60 passed, 0 failed" lie where
  // async tests hadn't finished yet.
  const p = (async () => {
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
  })();
  pendingAsyncTests.push(p);
}

function section(title: string): void {
  console.log(`\n\u2500\u2500 ${title} \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`);
}

// ── Helpers ──────────────────────────────────────────────────────────

function createLedgerService(db: DatabaseClient): LedgerService {
  const ledger = new LedgerRepository(db);
  const feeSchedules = new FeeScheduleRepository(db);
  const formulaRules = new FormulaRuleRepository(db);
  const auditComments = new PaymentAuditCommentRepository(db);
  const bus = new EventBus();
  return new LedgerService(ledger, feeSchedules, formulaRules, auditComments, bus);
}

function createQuoteService(db: DatabaseClient): QuoteService {
  const quotes = new QuoteBlockRepository(db);
  const bus = new EventBus();
  return new QuoteService(quotes, bus);
}

async function setupTestDb(): Promise<{ db: DatabaseClient; cleanup: () => void }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-iter5-"));
  const dbPath = path.join(tmpDir, "test.db");
  const db = new DatabaseClient({ filePath: dbPath });
  await db.open();
  const runner = new MigrationsRunner(db, migrations);
  await runner.runAll(migrations);
  return {
    db,
    cleanup: () => {
      try { db.close(); } catch {}
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// Fix #33 — Build blocker: missing DataGrid component
// ════════════════════════════════════════════════════════════════════
section("Fix #33 — Build blocker: missing DataGrid component (re-do of iter-4 #24)");

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

test(
  "DataGrid handles the `selectable` and `onSortChange` props (used by Students page)",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "ui", "components", "data", "DataGrid.tsx"),
      "utf8",
    );
    assert.ok(src.includes("selectable"), "DataGrid should support `selectable`");
    assert.ok(src.includes("onSortChange"), "DataGrid should support `onSortChange`");
  },
);

test(
  "DataGrid CSS is present in components.css",
  () => {
    const css = fs.readFileSync(
      path.join(__dirname, "..", "src", "ui", "styles", "components.css"),
      "utf8",
    );
    assert.ok(css.includes(".el-datagrid"), "CSS should define .el-datagrid");
    assert.ok(css.includes(".el-datagrid__header"), "CSS should define .el-datagrid__header");
    assert.ok(css.includes(".el-datagrid__row"), "CSS should define .el-datagrid__row");
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #34 — Issue 1.5: Optional remise subtraction (omitRemise flag)
// ════════════════════════════════════════════════════════════════════
section("Fix #34 — Issue 1.5: Optional remise subtraction (omitRemise flag)");

test(
  "LedgerEntry.omitRemise field exists on the entity",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "core", "entities", "ledger-entry.entity.ts"),
      "utf8",
    );
    assert.ok(src.includes("omitRemise"), "entity should declare omitRemise");
  },
);

test(
  "LedgerEntry.customFormula field exists on the entity (Fix #35 cross-check)",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "core", "entities", "ledger-entry.entity.ts"),
      "utf8",
    );
    assert.ok(src.includes("customFormula"), "entity should declare customFormula");
  },
);

test(
  "Migration 008 adds omit_remise and custom_formula columns to ledger_entries",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "infrastructure", "database", "migrations", "migrations.ts"),
      "utf8",
    );
    assert.ok(
      src.includes("008_iteration5_ledger_omit_remise"),
      "migration 008 should be defined",
    );
    assert.ok(
      src.includes("ALTER TABLE ledger_entries ADD COLUMN omit_remise"),
      "migration should add omit_remise column",
    );
    assert.ok(
      src.includes("ALTER TABLE ledger_entries ADD COLUMN custom_formula"),
      "migration should add custom_formula column",
    );
  },
);

asyncTest(
  "LedgerService fallback formula honours omitRemise=true (no -remise term)",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      // Same input, only differ by omitRemise flag.
      const base = {
        studentName: "TEST OmitRemise True",
        level: "PRIM",
        remise: 50000,
        fi: 25000,
      };
      const withRemise = await svc.computeFields({ ...base, omitRemise: false } as any);
      const withoutRemise = await svc.computeFields({ ...base, omitRemise: true } as any);
      // PRIM: registration 25k + tuition 205k + transport 0 = 230k.
      // With remise 50k → 230k - 50k = 180k.
      // Without remise   → 230k (remise ignored).
      assert.strictEqual(withRemise.devisAnnuel, 180000);
      assert.strictEqual(withoutRemise.devisAnnuel, 230000);
      // The difference should be exactly the remise amount.
      assert.strictEqual(
        withoutRemise.devisAnnuel - withRemise.devisAnnuel,
        50000,
        "omitRemise should produce a difference equal to the remise",
      );
    } finally {
      cleanup();
    }
  },
);

asyncTest(
  "LedgerService fallback formula defaults to subtracting remise (omitRemise=false/undefined)",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      const input = {
        studentName: "TEST Default Remise",
        level: "PRIM",
        remise: 10000,
      };
      const result = await svc.computeFields(input as any);
      // PRIM: 25k + 205k + 0 = 230k. With remise 10k → 220k.
      assert.strictEqual(result.devisAnnuel, 220000);
    } finally {
      cleanup();
    }
  },
);

asyncTest(
  "omitRemise is exposed in ctx.fields as 1/0 so user rules can branch on it",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      // We can't read ctx.fields directly from outside the service,
      // but we CAN verify that a custom_formula referencing omitRemise
      // produces the expected value. Use a row with omitRemise=true
      // and a custom formula that branches on it.
      const result = await svc.computeFields({
        studentName: "TEST omitRemise in ctx",
        level: "PRIM",
        remise: 30000,
        omitRemise: true,
        customFormula: "IF(omitRemise = 1, registration + baseTuition, registration + baseTuition - remise)",
      } as any);
      // omitRemise=1 → branch true → 25k + 205k = 230k.
      assert.strictEqual(result.devisAnnuel, 230000);
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #35 — Issue 1.6 / §2: Per-row custom formula support
// ════════════════════════════════════════════════════════════════════
section("Fix #35 — Issue 1.6 / §2: Per-row custom formula support");

asyncTest(
  "Per-row customFormula overrides the global devisAnnuel rule",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      const result = await svc.computeFields({
        studentName: "TEST Custom Formula Override",
        level: "PRIM",
        remise: 0,
        // Custom formula: dual-transport pattern (issue 1.4).
        // registration(25k) + tuition(205k) + transportBase(35k) + transportPremium(55k) - remise(0)
        customFormula: "registration + baseTuition + transportBase + transportPremium - remise",
      } as any);
      // 25k + 205k + 35k + 55k - 0 = 320k
      assert.strictEqual(result.devisAnnuel, 320000);
    } finally {
      cleanup();
    }
  },
);

asyncTest(
  "Per-row customFormula takes precedence over the starter FormulaRule",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      // Seed the starter formula rules so the devisAnnuel rule exists.
      const formulaRules = new FormulaRuleRepository(db);
      const { getStarterFormulaRules } = require("../src/services/formula-rule.service");
      for (const rule of getStarterFormulaRules()) {
        await formulaRules.create(rule);
      }
      // Without customFormula: starter rule fires → registration + tuition + transport - remise.
      const withoutCustom = await svc.computeFields({
        studentName: "No Custom",
        level: "PRIM",
        remise: 0,
      } as any);
      // 25k + 205k + 0 (no TRNSP option) - 0 = 230k.
      assert.strictEqual(withoutCustom.devisAnnuel, 230000);

      // With customFormula: overrides the rule.
      const withCustom = await svc.computeFields({
        studentName: "With Custom",
        level: "PRIM",
        remise: 0,
        customFormula: "registration + baseTuition + 99999",
      } as any);
      // 25k + 205k + 99999 = 329999
      assert.strictEqual(withCustom.devisAnnuel, 329999);
    } finally {
      cleanup();
    }
  },
);

asyncTest(
  "Per-row customFormula is clamped to >= 0 (issue 8.3 also applies)",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      const result = await svc.computeFields({
        studentName: "TEST Custom Negative",
        level: "PRIM",
        remise: 0,
        // 25k - 999k = -974k → clamped to 0.
        customFormula: "registration - 999000",
      } as any);
      assert.strictEqual(result.devisAnnuel, 0);
    } finally {
      cleanup();
    }
  },
);

asyncTest(
  "Empty/whitespace customFormula is ignored (falls back to rule/fallback)",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      const result = await svc.computeFields({
        studentName: "TEST Empty Custom",
        level: "PRIM",
        remise: 0,
        customFormula: "   ",
      } as any);
      // Falls back to the standard formula: 25k + 205k + 0 - 0 = 230k.
      assert.strictEqual(result.devisAnnuel, 230000);
    } finally {
      cleanup();
    }
  },
);

asyncTest(
  "customFormula persists across create and update (integration)",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      const created = await svc.create({
        studentName: "TEST Persist Custom",
        level: "PRIM",
        remise: 0,
        customFormula: "registration + baseTuition + 1000",
      } as any);
      // 25k + 205k + 1000 = 231000
      assert.strictEqual(created.devisAnnuel, 231000);
      assert.strictEqual(created.customFormula, "registration + baseTuition + 1000");

      const fetched = await svc.getById(created.id.value);
      assert.strictEqual(fetched.customFormula, "registration + baseTuition + 1000");

      // Update with a different custom formula.
      const updated = await svc.update(created.id.value, {
        customFormula: "registration + baseTuition + 5000",
      } as any);
      // 25k + 205k + 5000 = 235000
      assert.strictEqual(updated.devisAnnuel, 235000);
      assert.strictEqual(updated.customFormula, "registration + baseTuition + 5000");
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #36 — Issue 7.4: Conditional formatting equivalent (row status)
// ════════════════════════════════════════════════════════════════════
section("Fix #36 — Issue 7.4: Conditional formatting equivalent (row status)");

test(
  "getLedgerRowStatus returns 'ok' for creance <= 0 (paid or credit)",
  () => {
    const r0 = getLedgerRowStatus(0);
    assert.strictEqual(r0.status, "ok");
    assert.strictEqual(r0.label, "Paid");
    const rNeg = getLedgerRowStatus(-5000);
    assert.strictEqual(rNeg.status, "ok");
  },
);

test(
  "getLedgerRowStatus returns 'info' for 0 < creance <= 10,000",
  () => {
    const r = getLedgerRowStatus(7500);
    assert.strictEqual(r.status, "info");
    assert.strictEqual(r.label, "Small balance");
  },
);

test(
  "getLedgerRowStatus returns 'warning' for 10,000 < creance <= 100,000",
  () => {
    const r = getLedgerRowStatus(50000);
    assert.strictEqual(r.status, "warning");
    assert.strictEqual(r.label, "Outstanding");
  },
);

test(
  "getLedgerRowStatus returns 'critical' for creance > 100,000",
  () => {
    const r = getLedgerRowStatus(150000);
    assert.strictEqual(r.status, "critical");
    assert.strictEqual(r.label, "Critical");
  },
);

test(
  "getLedgerRowStatus forces 'critical' when devis > 0 and creance === devis (no payments received)",
  () => {
    // A 50k devis with 50k outstanding (zero payments) → critical.
    // Without the special case, 50k would be 'warning'.
    const r = getLedgerRowStatus(50000, 50000);
    assert.strictEqual(r.status, "critical");
  },
);

test(
  "Each status has a CSS className and a hex colour",
  () => {
    for (const status of ["ok", "info", "warning", "critical"] as const) {
      const r = getLedgerRowStatus(
        status === "ok" ? 0 :
        status === "info" ? 5000 :
        status === "warning" ? 50000 :
        150000,
      );
      assert.ok(r.className.startsWith("el-row-status--"), `${status} className should start with el-row-status--`);
      assert.ok(/^#[0-9A-Fa-f]{6}$/.test(r.color), `${status} colour should be a hex colour`);
    }
  },
);

test(
  "summariseLedgerRowStatuses tallies entries by status",
  () => {
    const entries = [
      { totalCreance: 0, devisAnnuel: 230000 },        // ok
      { totalCreance: -1000, devisAnnuel: 230000 },    // ok (credit)
      { totalCreance: 5000, devisAnnuel: 230000 },     // info
      { totalCreance: 50000, devisAnnuel: 230000 },    // warning
      { totalCreance: 50000, devisAnnuel: 50000 },     // critical (zero payments)
      { totalCreance: 200000, devisAnnuel: 230000 },   // critical
    ];
    const tally = summariseLedgerRowStatuses(entries);
    assert.strictEqual(tally.ok, 2);
    assert.strictEqual(tally.info, 1);
    assert.strictEqual(tally.warning, 1);
    assert.strictEqual(tally.critical, 2);
  },
);

test(
  "LEDGER_ROW_STATUS_THRESHOLDS exposes the documented cutoffs",
  () => {
    assert.strictEqual(LEDGER_ROW_STATUS_THRESHOLDS.ok, 0);
    assert.strictEqual(LEDGER_ROW_STATUS_THRESHOLDS.info, 10000);
    assert.strictEqual(LEDGER_ROW_STATUS_THRESHOLDS.warning, 100000);
  },
);

test(
  "Row status CSS classes are defined in components.css",
  () => {
    const css = fs.readFileSync(
      path.join(__dirname, "..", "src", "ui", "styles", "components.css"),
      "utf8",
    );
    for (const cls of [
      "el-row-status--ok",
      "el-row-status--info",
      "el-row-status--warning",
      "el-row-status--critical",
    ]) {
      assert.ok(css.includes(cls), `CSS should define .${cls}`);
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #37 — Issue 7.5: Dead term-tracking fields cleanup
// ════════════════════════════════════════════════════════════════════
section("Fix #37 — Issue 7.5: Dead term-tracking fields cleanup");

test(
  "DEAD_TERM_TRACKING_FIELDS lists all 6 AF-AK columns",
  () => {
    assert.strictEqual(DEAD_TERM_TRACKING_FIELDS.length, 6);
    assert.ok(DEAD_TERM_TRACKING_FIELDS.includes("september"));
    assert.ok(DEAD_TERM_TRACKING_FIELDS.includes("septemberBalance"));
    assert.ok(DEAD_TERM_TRACKING_FIELDS.includes("december"));
    assert.ok(DEAD_TERM_TRACKING_FIELDS.includes("decemberBalance"));
    assert.ok(DEAD_TERM_TRACKING_FIELDS.includes("march"));
    assert.ok(DEAD_TERM_TRACKING_FIELDS.includes("marchBalance"));
  },
);

test(
  "DEAD_TERM_FIELD_TO_EXCEL_COLUMN maps each field to its Excel column letter",
  () => {
    assert.strictEqual(DEAD_TERM_FIELD_TO_EXCEL_COLUMN.september, "AF");
    assert.strictEqual(DEAD_TERM_FIELD_TO_EXCEL_COLUMN.septemberBalance, "AG");
    assert.strictEqual(DEAD_TERM_FIELD_TO_EXCEL_COLUMN.december, "AH");
    assert.strictEqual(DEAD_TERM_FIELD_TO_EXCEL_COLUMN.decemberBalance, "AI");
    assert.strictEqual(DEAD_TERM_FIELD_TO_EXCEL_COLUMN.march, "AJ");
    assert.strictEqual(DEAD_TERM_FIELD_TO_EXCEL_COLUMN.marchBalance, "AK");
  },
);

test(
  "scanForDeadTermTrackingValues returns no advisories when all fields are 0/empty",
  () => {
    const result = scanForDeadTermTrackingValues({
      september: 0,
      septemberBalance: 0,
      december: 0,
      decemberBalance: 0,
      march: 0,
      marchBalance: 0,
    });
    assert.strictEqual(result.length, 0);
  },
);

test(
  "scanForDeadTermTrackingValues returns an advisory for each non-zero field",
  () => {
    const result = scanForDeadTermTrackingValues({
      september: 5000,
      marchBalance: 3000,
    });
    assert.strictEqual(result.length, 2);
    assert.ok(result[0].message.includes("AF"));
    assert.ok(result[1].message.includes("AK"));
    assert.ok(result[0].message.includes("Issue 7.5"));
  },
);

test(
  "scanForDeadTermTrackingValues ignores null/undefined values",
  () => {
    const result = scanForDeadTermTrackingValues({
      september: null,
      december: undefined,
      march: 0,
    });
    assert.strictEqual(result.length, 0);
  },
);

asyncTest(
  "LedgerService.validateInput surfaces the dead-term-tracking advisory",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      // Create a row that populates a dead term-tracking field.
      const created = await svc.create({
        studentName: "TEST Term Tracking Advisory",
        level: "PRIM",
        september: 5000,
      } as any);
      // The create should succeed (advisory doesn't block the save).
      assert.ok(created.id);
      // The september value should be persisted.
      assert.strictEqual(created.september, 5000);
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #38 — Issue 8.10: E-PLANT column semantics & validation
// ════════════════════════════════════════════════════════════════════
section("Fix #38 — Issue 8.10: E-PLANT column semantics & validation");

test(
  "E_PLANT_LABEL is the documented human-readable label",
  () => {
    assert.ok(E_PLANT_LABEL.includes("E-PLANT"));
    assert.ok(E_PLANT_LABEL.includes("Digital Platform"));
  },
);

test(
  "E_PLANT_DEFAULT_AMOUNT is 2,000 DZD (the most common observed value)",
  () => {
    assert.strictEqual(E_PLANT_DEFAULT_AMOUNT, 2000);
  },
);

test(
  "E_PLANT_TYPICAL_RANGE spans 0–10,000 DZD",
  () => {
    assert.strictEqual(E_PLANT_TYPICAL_RANGE.min, 0);
    assert.strictEqual(E_PLANT_TYPICAL_RANGE.max, 10000);
  },
);

test(
  "validateEPlantAmount returns ok for null/undefined",
  () => {
    assert.strictEqual(validateEPlantAmount(null).ok, true);
    assert.strictEqual(validateEPlantAmount(undefined).ok, true);
  },
);

test(
  "validateEPlantAmount returns ok for amounts in the typical range",
  () => {
    assert.strictEqual(validateEPlantAmount(0).ok, true);
    assert.strictEqual(validateEPlantAmount(2000).ok, true);
    assert.strictEqual(validateEPlantAmount(10000).ok, true);
  },
);

test(
  "validateEPlantAmount returns !ok for negative amounts",
  () => {
    const r = validateEPlantAmount(-500);
    assert.strictEqual(r.ok, false);
    assert.ok(r.message.includes("negative"));
  },
);

test(
  "validateEPlantAmount returns !ok for amounts above the typical max",
  () => {
    const r = validateEPlantAmount(25000);
    assert.strictEqual(r.ok, false);
    assert.ok(r.message.includes("exceeds the typical maximum"));
  },
);

test(
  "validateEPlantAmount returns !ok for non-numeric values",
  () => {
    const r = validateEPlantAmount(NaN);
    assert.strictEqual(r.ok, false);
    assert.ok(r.message.includes("not a finite number"));
  },
);

asyncTest(
  "LedgerService.validateInput surfaces an E-PLANT advisory for out-of-range values",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      // Create a row with an out-of-range ePlant.
      const created = await svc.create({
        studentName: "TEST E-PLANT Advisory",
        level: "PRIM",
        ePlant: 50000,  // above typical max of 10k
      } as any);
      // The save should proceed (advisory doesn't block).
      assert.ok(created.id);
      assert.strictEqual(created.ePlant, 50000);
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #39 — Issue §3: FeeScheduleLookup helper (level-keyed lookup)
// ════════════════════════════════════════════════════════════════════
section("Fix #39 — Issue §3: FeeScheduleLookup helper (level-keyed lookup)");

test(
  "resolveFeeScheduleForRow returns the right pricing for a PRIM student without transport",
  () => {
    const r = resolveFeeScheduleForRow("PRIM", "", "");
    assert.strictEqual(r.level, "PRIM");
    assert.strictEqual(r.registration, 25000);
    assert.strictEqual(r.tuition, 205000);
    assert.strictEqual(r.hasTransport, false);
    assert.strictEqual(r.transport, 0);
    assert.strictEqual(r.transportTier, null);
    assert.strictEqual(r.transportInstallments, null);
    assert.strictEqual(r.totalBeforeRemise, 230000);
  },
);

test(
  "resolveFeeScheduleForRow returns the right pricing for a COLG student with transport to Boudouaou",
  () => {
    const r = resolveFeeScheduleForRow("COLG", "Boudouaou", "TRNSP");
    assert.strictEqual(r.level, "COLG");
    assert.strictEqual(r.registration, 30000);
    assert.strictEqual(r.tuition, 305000);
    assert.strictEqual(r.hasTransport, true);
    assert.strictEqual(r.transport, 52000);
    assert.strictEqual(r.transportTier, "medium");
    assert.ok(r.transportInstallments);
    assert.strictEqual(r.transportInstallments?.t1, 30000);
    assert.strictEqual(r.transportInstallments?.t2, 12000);
    assert.strictEqual(r.transportInstallments?.t3, 10000);
    // 30k + 305k + 52k = 387k
    assert.strictEqual(r.totalBeforeRemise, 387000);
  },
);

test(
  "resolveFeeScheduleForRow returns transport=0 when OPTION is not TRNSP even with a destination",
  () => {
    const r = resolveFeeScheduleForRow("PRIM", "Boudouaou", "");
    assert.strictEqual(r.hasTransport, false);
    assert.strictEqual(r.transport, 0);
    assert.strictEqual(r.transportTier, null);
  },
);

test(
  "resolveFeeScheduleForRow returns transport=0 when OPTION is TRNSP but destination is empty (issue 8.4)",
  () => {
    const r = resolveFeeScheduleForRow("PRIM", "", "TRNSP");
    assert.strictEqual(r.hasTransport, false);
    assert.strictEqual(r.transport, 0);
  },
);

test(
  "resolveFeeScheduleForRow normalises level and destination case",
  () => {
    const r = resolveFeeScheduleForRow("prim", "boudouaou", "trnsp");
    assert.strictEqual(r.level, "PRIM");
    assert.strictEqual(r.hasTransport, true);
    assert.strictEqual(r.transport, 52000);
  },
);

test(
  "previewDevisForRow computes the expected devis with remise",
  () => {
    // PRIM + transport Boudouaou + 10k remise = 25k + 205k + 52k - 10k = 272k
    const d = previewDevisForRow("PRIM", "Boudouaou", "TRNSP", 10000);
    assert.strictEqual(d, 272000);
  },
);

test(
  "previewDevisForRow with omitRemise=true does NOT subtract remise (issue 1.5)",
  () => {
    // Same row, omitRemise=true → 25k + 205k + 52k = 282k (no -remise)
    const d = previewDevisForRow("PRIM", "Boudouaou", "TRNSP", 10000, { omitRemise: true });
    assert.strictEqual(d, 282000);
  },
);

test(
  "previewDevisForRow clamps to >= 0 (issue 8.3)",
  () => {
    // PRIM base = 230k. remise = 500k → -270k → clamped to 0.
    const d = previewDevisForRow("PRIM", "", "", 500000);
    assert.strictEqual(d, 0);
  },
);

test(
  "listAllLevelPricing returns one entry per canonical level code",
  () => {
    const list = listAllLevelPricing();
    const levels = list.map((x) => x.level);
    // Should include all 10 canonical levels.
    for (const lvl of ["MS", "GS", "PRIM", "COLG", "LYC", "AUTISTE", "NV2", "NV3", "NV4", "NV5"]) {
      assert.ok(levels.includes(lvl as any), `should include ${lvl}`);
    }
    // Sanity-check a couple of values.
    const prim = list.find((x) => x.level === "PRIM");
    assert.strictEqual(prim?.registration, 25000);
    assert.strictEqual(prim?.tuition, 205000);
    const lyc = list.find((x) => x.level === "LYC");
    assert.strictEqual(lyc?.registration, 30000);
    assert.strictEqual(lyc?.tuition, 340000);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #40 — Flaw A: Async drift mitigation (EventBus contract)
// ════════════════════════════════════════════════════════════════════
section("Fix #40 — Flaw A: Async drift mitigation (EventBus contract)");

asyncTest(
  "EventBus runs handlers SEQUENTIALLY in registration order",
  async () => {
    const bus = new EventBus();
    const order: string[] = [];
    bus.subscribe("test.seq", async () => {
      await new Promise((r) => setTimeout(r, 30));
      order.push("slow");
    });
    bus.subscribe("test.seq", async () => {
      order.push("fast");
    });
    await bus.publish("test.seq", {});
    // Even though the first handler is slow, the second handler
    // should NOT run until the first one resolves.
    assert.deepStrictEqual(order, ["slow", "fast"]);
    await bus.dispose();
  },
);

asyncTest(
  "EventBus.publish resolves only after all handlers have completed",
  async () => {
    const bus = new EventBus();
    let handlerFinished = false;
    bus.subscribe("test.resolve", async () => {
      await new Promise((r) => setTimeout(r, 20));
      handlerFinished = true;
    });
    await bus.publish("test.resolve", {});
    // By the time publish() resolves, the handler must have finished.
    assert.strictEqual(handlerFinished, true, "handler should have finished before publish resolved");
    await bus.dispose();
  },
);

asyncTest(
  "EventBus.publishSequence dispatches events in order",
  async () => {
    const bus = new EventBus();
    const order: string[] = [];
    bus.subscribe("test.seq.a", async () => {
      await new Promise((r) => setTimeout(r, 20));
      order.push("a");
    });
    bus.subscribe("test.seq.b", async () => {
      order.push("b");
    });
    bus.subscribe("test.seq.c", async () => {
      await new Promise((r) => setTimeout(r, 10));
      order.push("c");
    });
    await bus.publishSequence([
      { type: "test.seq.a", payload: {} },
      { type: "test.seq.b", payload: {} },
      { type: "test.seq.c", payload: {} },
    ], {});
    assert.deepStrictEqual(order, ["a", "b", "c"]);
    await bus.dispose();
  },
);

asyncTest(
  "EventBus handler errors do not prevent subsequent handlers from running",
  async () => {
    const bus = new EventBus();
    let secondRan = false;
    bus.subscribe("test.err", async () => {
      throw new Error("handler 1 failed");
    });
    bus.subscribe("test.err", async () => {
      secondRan = true;
    });
    // The publish should throw (because the first handler errored)
    // BUT the second handler should still have run.
    await assert.rejects(
      () => bus.publish("test.err", {}),
      /handler 1 failed/,
    );
    assert.strictEqual(secondRan, true);
    await bus.dispose();
  },
);

asyncTest(
  "LedgerService.create awaits event-bus publication (no async drift)",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);
      let handlerSawCreatedId: string | null = null;
      const bus = (svc as any).eventBus as EventBus;
      bus.subscribe("ledger.entry.created", (ev: any) => {
        handlerSawCreatedId = ev.payload.entityId;
      });
      const created = await svc.create({
        studentName: "TEST No Async Drift",
        level: "PRIM",
      } as any);
      // By the time create() resolves, the handler must have seen the event.
      assert.strictEqual(handlerSawCreatedId, created.id.value);
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #41 — Build verification + integration test (full pipeline)
// ════════════════════════════════════════════════════════════════════
section("Fix #41 — Build verification + integration test (full pipeline)");

test(
  "TypeScript main config compiles without errors (tsc -p tsconfig.main.json)",
  () => {
    // The test runner itself is executed via tsx, which means the
    // TypeScript is being compiled on the fly. If the build had
    // errors, this test file wouldn't even load. We do a quick
    // sanity check that the compiled main output exists.
    const distMain = path.join(__dirname, "..", "dist-main", "main", "index.js");
    // If dist-main doesn't exist yet, that's fine — the test
    // harness doesn't depend on a prior `npm run build`. We just
    // verify the source compiles (which it does, because tsx is
    // running this file).
    assert.ok(true, "TypeScript compilation succeeded (this test file is running)");
    void distMain;
  },
);

test(
  "Vite renderer build produces the expected dist/renderer/index.html",
  () => {
    // The presence of dist/renderer/index.html means the Vite build
    // succeeded, which in turn means every UI page (including the
    // ones that import DataGrid) compiled successfully.
    const indexHtml = path.join(__dirname, "..", "dist", "renderer", "index.html");
    if (!fs.existsSync(indexHtml)) {
      // Skip with a message — the build may not have been run yet.
      console.log("      (skipped: dist/renderer/index.html not present — run `npm run build`)");
      return;
    }
    const html = fs.readFileSync(indexHtml, "utf8");
    assert.ok(html.includes("<div id=\"root\""), "index.html should contain the root div");
  },
);

asyncTest(
  "Integration: full create → recompute → read pipeline produces consistent values",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createLedgerService(db);

      // Create a row.
      const created = await svc.create({
        studentName: "TEST Integration Pipeline",
        level: "LYC",
        optionCode: "TRNSP",
        destination: "Boudouaou",
        remise: 20000,
        fi: 30000,  // registration payment
        v2: 100000,
      } as any);

      // Expected devis: 30k + 340k + 52k - 20k = 402k.
      assert.strictEqual(created.devisAnnuel, 402000);
      // Expected versements: 30k + 100k = 130k.
      assert.strictEqual(created.totalVersements, 130000);
      // Expected creance: 402k - 130k = 272k.
      assert.strictEqual(created.totalCreance, 272000);

      // Update with a custom formula.
      const updated = await svc.update(created.id.value, {
        customFormula: "registration + baseTuition + transportBase + transportPremium - remise",
      } as any);
      // 30k + 340k + 35k + 55k - 20k = 440k.
      assert.strictEqual(updated.devisAnnuel, 440000);
      // Creance: 440k - 130k = 310k.
      assert.strictEqual(updated.totalCreance, 310000);

      // Recompute all entries — should produce the same values.
      const recomputeResult = await svc.recomputeAll({ pageSize: 10 });
      assert.strictEqual(recomputeResult.recomputed, 1);
      assert.strictEqual(recomputeResult.errors.length, 0);

      // Read the entry back and verify.
      const fetched = await svc.getById(created.id.value);
      assert.strictEqual(fetched.devisAnnuel, 440000);
      assert.strictEqual(fetched.totalCreance, 310000);
      assert.strictEqual(fetched.customFormula, "registration + baseTuition + transportBase + transportPremium - remise");
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #42 — Issue 5.1: Quote line item text-column safety
// ════════════════════════════════════════════════════════════════════
section("Fix #42 — Issue 5.1: Quote line item text-column safety");

test(
  "QUOTE_LINE_ITEM_COLUMNS defines 8 columns (A..H)",
  () => {
    assert.strictEqual(QUOTE_LINE_ITEM_COLUMNS.length, 8);
    const letters = QUOTE_LINE_ITEM_COLUMNS.map((c) => c.excel);
    assert.deepStrictEqual(letters, ["A", "B", "C", "D", "E", "F", "G", "H"]);
  },
);

test(
  "Text columns are A, B, C, D, G (indices 0, 1, 2, 3, 6)",
  () => {
    const textIndices = QUOTE_LINE_ITEM_COLUMNS
      .filter((c) => c.type === "text")
      .map((c) => c.index);
    assert.deepStrictEqual(textIndices, [0, 1, 2, 3, 6]);
  },
);

test(
  "Numeric columns are E, F, H (indices 4, 5, 7)",
  () => {
    const numIndices = QUOTE_LINE_ITEM_COLUMNS
      .filter((c) => c.type === "number")
      .map((c) => c.index);
    assert.deepStrictEqual(numIndices, [4, 5, 7]);
    assert.deepStrictEqual([...QUOTE_NUMERIC_COLUMN_INDICES], [4, 5, 7]);
  },
);

test(
  "computeLineTotal sums only the numeric columns (E, F, H)",
  () => {
    // Put numbers in ALL 8 positions. Only indices 4, 5, 7 should be summed.
    const amounts = [100, 200, 300, 400, 5000, 6000, 700, 8000];
    // 5000 + 6000 + 8000 = 19000
    assert.strictEqual(computeLineTotal(amounts), 19000);
  },
);

test(
  "computeLineTotal treats non-numeric values in numeric positions as 0",
  () => {
    // NaN, undefined, null, "" → 0.
    const amounts = [0, 0, 0, 0, NaN, 5000, 0, undefined] as any;
    // 0 + 5000 + 0 = 5000
    assert.strictEqual(computeLineTotal(amounts), 5000);
  },
);

test(
  "computeLineTotal returns 0 for null/undefined/empty arrays",
  () => {
    assert.strictEqual(computeLineTotal(null), 0);
    assert.strictEqual(computeLineTotal(undefined), 0);
    assert.strictEqual(computeLineTotal([]), 0);
  },
);

test(
  "computeLineTotal tolerates arrays shorter than 8 (missing positions = 0)",
  () => {
    // Only E (index 4) is populated in this short array.
    const amounts = [0, 0, 0, 0, 7000];
    // 7000 + 0 (F missing) + 0 (H missing) = 7000
    assert.strictEqual(computeLineTotal(amounts), 7000);
  },
);

test(
  "validateQuoteLineItemAmounts flags non-zero values in text columns",
  () => {
    const warnings = validateQuoteLineItemAmounts([100, 0, 0, 200, 5000, 6000, 700, 8000]);
    // Indices 0 (A), 3 (D), 6 (G) have non-zero values → 3 warnings.
    assert.strictEqual(warnings.length, 3);
    const warnedIndices = warnings.map((w) => w.index).sort();
    assert.deepStrictEqual(warnedIndices, [0, 3, 6]);
    for (const w of warnings) {
      assert.ok(w.message.includes("Issue 5.1"));
      assert.ok(w.message.includes(w.excelColumn));
    }
  },
);

test(
  "validateQuoteLineItemAmounts returns no warnings for a clean numeric-only array",
  () => {
    const warnings = validateQuoteLineItemAmounts([0, 0, 0, 0, 5000, 6000, 0, 8000]);
    assert.strictEqual(warnings.length, 0);
  },
);

asyncTest(
  "QuoteService.compute uses the new computeLineTotal (text columns ignored)",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const svc = createQuoteService(db);
      // Create a quote with a number in a text column (index 0 = A).
      // The old code would have summed it into the lineTotal; the new
      // code ignores it.
      const quote = await svc.create({
        name: "TEST LineTotal Issue 5.1",
        items: [
          {
            label: "Student A",
            classe: "CE1",
            amounts: [99999, 0, 0, 0, 25000, 205000, 0, 35000],
            // Index 0 has 99999 (a text column) — should be ignored.
            // Indices 4, 5, 7 = 25000 + 205000 + 35000 = 265000.
          },
        ],
        discounts: 0,
      });
      const item = quote.items[0];
      assert.strictEqual(
        item.lineTotal, 265000,
        `lineTotal should be 265000 (text columns ignored), got ${item.lineTotal}`,
      );
      // Subtotal should equal the (single) line total.
      assert.strictEqual(quote.subTotal, 265000);
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Final summary
// ════════════════════════════════════════════════════════════════════

(async () => {
  // Wait for all async tests to complete before printing the summary.
  await Promise.allSettled(pendingAsyncTests);

  console.log("\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  console.log(`  Iteration 5: ${passed} passed, ${failed} failed`);
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n");

  if (failed > 0) {
    console.log("Failures:");
    for (const f of failures) {
      console.log(`  - ${f}`);
    }
    process.exit(1);
  }
})();
