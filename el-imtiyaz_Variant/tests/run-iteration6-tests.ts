/**
 * Iteration 6 — test harness for the 9 new fixes.
 *
 * Each test module corresponds to one issue (or a tightly-coupled
 * group of issues). Run with:
 *   npx tsx tests/run-iteration6-tests.ts
 *
 * Issues covered:
 *   Fix #43 — Issue 10.2/18 : Populate ctx.ranges with lookup tables for VLOOKUP
 *   Fix #44 — Issue 8.2     : TransportPricingService wrapper
 *   Fix #45 — Issue 8.3     : LevelPricingService wrapper
 *   Fix #46 — Issue 8.4     : FormulaCompositionService
 *   Fix #47 — Issue 7.3     : isClosed workflow for PaymentAuditComment
 *   Fix #48 — Issue 7.2/8.1 : FamilyService (group ledger entries by tutor)
 *   Fix #49 — Issue 7.6     : ParentSummaryService (PAR PARENT equivalent)
 *   Fix #50 — Issue 9.4     : ValidationRulesRegistry
 *   Fix #51 — Build blocker : better-sqlite3 NODE_MODULE_VERSION diagnostic
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// ── Iteration 6 modules under test ──────────────────────────────────
import {
  buildFormulaLookupRanges,
  buildLevelPricingRange,
  buildTransportPricesRange,
  buildLevelCodesRange,
  FORMULA_LOOKUP_RANGE_NAMES,
} from "../src/shared/formula-lookup-ranges";
import { TransportPricingService } from "../src/services/transport-pricing.service";
import { LevelPricingService } from "../src/services/level-pricing.service";
import {
  FormulaCompositionService,
} from "../src/services/formula-composition.service";
import {
  isAuditCommentClosed,
  getClosedStateForEntry,
  summariseAuditTrail,
  buildClosedStateByEntry,
  formatClosedStateBadge,
} from "../src/shared/audit-trail-workflow";
import { FamilyService } from "../src/services/family.service";
import { ParentSummaryService } from "../src/services/parent-summary.service";
import {
  EXCEL_VALIDATION_RULES,
  runValidationRules,
  listValidationRules,
  getValidationRule,
} from "../src/shared/validation-rules-registry";
import { safeEvaluate } from "../src/services/formula/formula-engine";
import {
  resolveRegistration,
  resolveTuition,
  resolveTransportAmount,
} from "../src/shared/pricing";

// ── Integration: real SQLite DB ─────────────────────────────────────
import { DatabaseClient } from "../src/infrastructure/database/sqlite-client";
import { MigrationsRunner } from "../src/infrastructure/database/migrations/migrations-runner";
import { migrations } from "../src/infrastructure/database/migrations/migrations";
import { LedgerRepository } from "../src/infrastructure/repositories/ledger-entry.repository";
import { PaymentAuditCommentRepository } from "../src/infrastructure/repositories/payment-audit-comment.repository";
import { Identifier } from "../src/core/value-objects/identifier";

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

async function setupTestDb(): Promise<{ db: DatabaseClient; cleanup: () => void }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-iter6-"));
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

// Minimal stub of a LedgerEntry for in-memory testing of FamilyService.
function makeLedgerEntry(overrides: Partial<any> = {}): any {
  const id = Identifier.from<"LedgerEntry">(overrides.id ?? `ledger-${Math.random().toString(36).slice(2, 10)}`);
  // Note: do NOT spread `...overrides` at the end — that would replace
  // the typed `id: Identifier<...>` field with the raw string, breaking
  // any code that reads `entry.id.value`.
  const base: any = {
    id,
    studentName: "TEST STUDENT",
    tutorName: "TEST TUTOR",
    level: "PRIM",
    classCode: "CE1",
    optionCode: "",
    destination: "",
    remise: 0,
    fi: 0,
    v2: 0,
    altV2: 0,
    v3: 0,
    t1: 0,
    t2: 0,
    t3: 0,
    devisAnnuel: 0,
    totalVersements: 0,
    totalCreance: 0,
    grandTotal: 0,
  };
  // Apply overrides field-by-field so the typed `id` survives.
  for (const [k, v] of Object.entries(overrides)) {
    if (k === "id") continue; // already handled above
    base[k] = v;
  }
  return base;
}

// Minimal stub of a PaymentAuditComment for in-memory testing.
// The `isClosed` flag is computed from `rawText` (matching what the
// repository does when persisting), so tests can just set rawText
// and the helper handles the rest.
function makeAuditComment(overrides: Partial<any> = {}): any {
  const rawText = overrides.rawText ?? "250000/07/05B11";
  const isClosedFromText = /={3,}\s*$/.test(rawText.trim());
  return {
    id: Identifier.from<"PaymentAuditComment">(overrides.id ?? `audit-${Math.random().toString(36).slice(2, 10)}`),
    ledgerEntryId: overrides.ledgerEntryId ?? "ledger-1",
    studentId: overrides.studentId,
    paymentId: overrides.paymentId,
    rawText,
    amount: overrides.amount ?? 250000,
    day: overrides.day ?? 7,
    month: overrides.month ?? 5,
    year: overrides.year ?? null,
    batch: overrides.batch ?? "B11",
    // If the caller explicitly sets isClosed, honour it. Otherwise
    // derive from rawText (mirroring the repository's parseAuditComment).
    isClosed: overrides.isClosed !== undefined ? overrides.isClosed : isClosedFromText,
    excelCell: overrides.excelCell,
    sourceRow: overrides.sourceRow,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════
// Fix #43 — Issue 10.2 / 18: Populate ctx.ranges with lookup tables
// ════════════════════════════════════════════════════════════════════
section("Fix #43 — Issue 10.2/18: ctx.ranges populated for VLOOKUP support");

test(
  "buildFormulaLookupRanges() returns the three canonical named ranges",
  () => {
    const ranges = buildFormulaLookupRanges();
    assert.ok(ranges, "ranges should be defined");
    assert.ok(Array.isArray(ranges.LEVEL_PRICING), "LEVEL_PRICING should be an array");
    assert.ok(Array.isArray(ranges.TRANSPORT_PRICES), "TRANSPORT_PRICES should be an array");
    assert.ok(Array.isArray(ranges.LEVEL_CODES), "LEVEL_CODES should be an array");
  },
);

test(
  "FORMULA_LOOKUP_RANGE_NAMES lists the three range names",
  () => {
    assert.deepStrictEqual(
      [...FORMULA_LOOKUP_RANGE_NAMES],
      ["LEVEL_PRICING", "TRANSPORT_PRICES", "LEVEL_CODES"],
    );
  },
);

test(
  "LEVEL_PRICING range contains one row per canonical level code",
  () => {
    const rows = buildLevelPricingRange();
    // 10 canonical level codes (MS, GS, PRIM, COLG, LYC, AUTISTE, NV2-NV5).
    assert.ok(rows.length >= 10, `expected >= 10 rows, got ${rows.length}`);
    // Each row has level, label, registration, tuition, subtotal.
    for (const r of rows) {
      assert.ok(typeof r.level === "string" && r.level.length > 0);
      assert.ok(typeof r.registration === "number");
      assert.ok(typeof r.tuition === "number");
      assert.strictEqual(r.subtotal, r.registration + r.tuition);
    }
  },
);

test(
  "LEVEL_PRICING range: PRIM row has registration=25000 and tuition=205000",
  () => {
    const rows = buildLevelPricingRange();
    const prim = rows.find((r) => r.level === "PRIM");
    assert.ok(prim, "PRIM row should exist");
    assert.strictEqual(prim!.registration, 25000);
    assert.strictEqual(prim!.tuition, 205000);
    assert.strictEqual(prim!.subtotal, 230000);
  },
);

test(
  "TRANSPORT_PRICES range has 4 rows (one per tier)",
  () => {
    const rows = buildTransportPricesRange();
    assert.strictEqual(rows.length, 4, `expected 4 tier rows, got ${rows.length}`);
    // Each row has tier, amount, t1, t2, t3.
    for (const r of rows) {
      assert.ok(typeof r.tier === "string");
      assert.ok(typeof r.amount === "number");
      assert.ok(typeof r.t1 === "number");
      assert.ok(typeof r.t2 === "number");
      assert.ok(typeof r.t3 === "number");
      assert.strictEqual(r.t1 + r.t2 + r.t3, r.amount, "installments should sum to total");
    }
  },
);

test(
  "LEVEL_CODES range lists every canonical code (issue 8.6 cross-check)",
  () => {
    const rows = buildLevelCodesRange();
    const codes = rows.map((r) => r.level);
    assert.ok(codes.includes("PRIM"));
    assert.ok(codes.includes("COLG"));
    assert.ok(codes.includes("LYC"));
    assert.ok(codes.includes("NV2"));
    assert.ok(codes.includes("AUTISTE"));
  },
);

test(
  "VLOOKUP against LEVEL_PRICING returns the correct registration for PRIM (col 3)",
  () => {
    const ctx = {
      fields: { level: "PRIM" },
      ranges: buildFormulaLookupRanges(),
    };
    // Range columns: 1=level, 2=label, 3=registration, 4=tuition, 5=subtotal.
    const result = safeEvaluate(
      'VLOOKUP("PRIM", "LEVEL_PRICING", 3, 0)',
      ctx,
      "test-vlookup-level-pricing",
    );
    assert.ok(result.ok, `VLOOKUP should succeed, got error: ${result.ok ? "" : (result as any).error}`);
    assert.strictEqual(result.value, 25000, `expected registration 25000, got ${result.value}`);
  },
);

test(
  "VLOOKUP against LEVEL_PRICING returns tuition (col 4) for PRIM",
  () => {
    const ctx = {
      fields: { level: "PRIM" },
      ranges: buildFormulaLookupRanges(),
    };
    const result = safeEvaluate(
      'VLOOKUP("PRIM", "LEVEL_PRICING", 4, 0)',
      ctx,
      "test-vlookup-prim-tuition",
    );
    assert.ok(result.ok);
    assert.strictEqual(result.value, 205000);
  },
);

test(
  "VLOOKUP against LEVEL_PRICING returns subtotal (col 5) for COLG",
  () => {
    const ctx = {
      fields: { level: "COLG" },
      ranges: buildFormulaLookupRanges(),
    };
    // COLG: registration=30k, tuition=305k, subtotal=335k
    const result = safeEvaluate(
      'VLOOKUP("COLG", "LEVEL_PRICING", 5, 0)',
      ctx,
      "test-vlookup-colg-subtotal",
    );
    assert.ok(result.ok);
    assert.strictEqual(result.value, 335000);
  },
);

test(
  "VLOOKUP against TRANSPORT_PRICES returns amount for 'medium' tier",
  () => {
    const ctx = {
      fields: {},
      ranges: buildFormulaLookupRanges(),
    };
    const result = safeEvaluate(
      'VLOOKUP("medium", "TRANSPORT_PRICES", 3, 0)',
      ctx,
      "test-vlookup-transport-medium",
    );
    assert.ok(result.ok);
    assert.strictEqual(result.value, 52000);
  },
);

test(
  "VLOOKUP against LEVEL_CODES returns label for LYC",
  () => {
    const ctx = {
      fields: {},
      ranges: buildFormulaLookupRanges(),
    };
    const result = safeEvaluate(
      'VLOOKUP("LYC", "LEVEL_CODES", 2, 0)',
      ctx,
      "test-vlookup-level-label",
    );
    assert.ok(result.ok);
    assert.ok(typeof result.value === "string");
    assert.ok(String(result.value).includes("Lycée"));
  },
);

test(
  "LedgerService.buildFormulaContext populates ctx.ranges (integration)",
  () => {
    // Read the source and verify the new code path is present.
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "services", "ledger.service.ts"),
      "utf8",
    );
    assert.ok(
      src.includes("buildFormulaLookupRanges"),
      "LedgerService should call buildFormulaLookupRanges()",
    );
    assert.ok(
      src.includes("return { fields, ranges };"),
      "LedgerService should return ranges from buildFormulaContext()",
    );
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #44 — Issue 8.2: TransportPricingService wrapper
// ════════════════════════════════════════════════════════════════════
section("Fix #44 — Issue 8.2: TransportPricingService wrapper");

test(
  "TransportPricingService is instantiable (stateless)",
  () => {
    const svc = new TransportPricingService();
    assert.strictEqual(svc.serviceName, "TransportPricingService");
  },
);

test(
  "resolve('Boumerdes') returns tier=nearby, amount=35000, recognised=true",
  () => {
    const svc = new TransportPricingService();
    // Use the canonical spelling (no accent) — the TOWN_TO_TIER map
    // keys are uppercase ASCII names.
    const r = svc.resolve("Boumerdes");
    assert.strictEqual(r.tier, "nearby");
    assert.strictEqual(r.amount, 35000);
    assert.strictEqual(r.recognised, true);
    assert.ok(r.installments, "installments should be set");
    assert.strictEqual(r.installments!.t1, 20000);
  },
);

test(
  "resolve('Boudouaou') returns tier=medium, amount=52000",
  () => {
    const svc = new TransportPricingService();
    const r = svc.resolve("Boudouaou");
    assert.strictEqual(r.tier, "medium");
    assert.strictEqual(r.amount, 52000);
    assert.strictEqual(r.installments!.t2, 12000);
  },
);

test(
  "resolve(null) returns tier=null, amount=0 (no transport)",
  () => {
    const svc = new TransportPricingService();
    const r = svc.resolve(null);
    assert.strictEqual(r.tier, null);
    assert.strictEqual(r.amount, 0);
    assert.strictEqual(r.installments, null);
  },
);

test(
  "resolve('UNKNOWN_TOWN') falls back to NEARBY tier with recognised=false",
  () => {
    const svc = new TransportPricingService();
    const r = svc.resolve("UNKNOWN_TOWN_XYZ");
    assert.strictEqual(r.tier, "nearby");
    assert.strictEqual(r.amount, 35000);
    assert.strictEqual(r.recognised, false);
  },
);

test(
  "resolveAmount() convenience wrapper returns the right number",
  () => {
    const svc = new TransportPricingService();
    // Use the canonical spelling — TOWN_TO_TIER has "BORDJ MNAIL"
    // (no E, no accent).
    assert.strictEqual(svc.resolveAmount("Bordj Mnail"), 55000);
    assert.strictEqual(svc.resolveAmount(""), 0);
  },
);

test(
  "listAllTiers() returns 4 tiers with their installment breakdowns",
  () => {
    const svc = new TransportPricingService();
    const tiers = svc.listAllTiers();
    assert.strictEqual(tiers.length, 4);
    const tierSlugs = tiers.map((t) => t.tier).sort();
    assert.deepStrictEqual(tierSlugs, ["far", "intermediate", "medium", "nearby"]);
  },
);

test(
  "isRecognised() distinguishes canonical towns from fallback cases",
  () => {
    const svc = new TransportPricingService();
    // Use canonical spellings (no accents) — the TOWN_TO_TIER map
    // keys are uppercase ASCII names.
    assert.strictEqual(svc.isRecognised("Boumerdes"), true);
    assert.strictEqual(svc.isRecognised("BOUDOUAOU"), true);
    assert.strictEqual(svc.isRecognised("UNKNOWN_TOWN_XYZ"), false);
    assert.strictEqual(svc.isRecognised(null), false);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #45 — Issue 8.3: LevelPricingService wrapper
// ════════════════════════════════════════════════════════════════════
section("Fix #45 — Issue 8.3: LevelPricingService wrapper");

test(
  "LevelPricingService is instantiable (stateless)",
  () => {
    const svc = new LevelPricingService();
    assert.strictEqual(svc.serviceName, "LevelPricingService");
  },
);

test(
  "resolve('PRIM') returns registration=25000, tuition=205000, recognised=true",
  () => {
    const svc = new LevelPricingService();
    const r = svc.resolve("PRIM");
    assert.strictEqual(r.registration, 25000);
    assert.strictEqual(r.tuition, 205000);
    assert.strictEqual(r.subtotal, 230000);
    assert.strictEqual(r.recognised, true);
  },
);

test(
  "resolve('COLG') returns registration=30000, tuition=305000",
  () => {
    const svc = new LevelPricingService();
    const r = svc.resolve("COLG");
    assert.strictEqual(r.registration, 30000);
    assert.strictEqual(r.tuition, 305000);
  },
);

test(
  "resolve('GS') returns registration=18000, tuition=125000 (pre-school rate)",
  () => {
    const svc = new LevelPricingService();
    const r = svc.resolve("GS");
    assert.strictEqual(r.registration, 18000);
    assert.strictEqual(r.tuition, 125000);
  },
);

test(
  "resolve('LYC') returns registration=30000, tuition=340000",
  () => {
    const svc = new LevelPricingService();
    const r = svc.resolve("LYC");
    assert.strictEqual(r.registration, 30000);
    assert.strictEqual(r.tuition, 340000);
  },
);

test(
  "resolve('UNKNOWN_LEVEL') falls back to PRIM with recognised=false",
  () => {
    const svc = new LevelPricingService();
    const r = svc.resolve("UNKNOWN_LEVEL_XYZ");
    assert.strictEqual(r.registration, 25000);
    assert.strictEqual(r.tuition, 205000);
    assert.strictEqual(r.recognised, false);
  },
);

test(
  "resolve(null) falls back to PRIM defaults",
  () => {
    const svc = new LevelPricingService();
    const r = svc.resolve(null);
    assert.strictEqual(r.registration, 25000);
    assert.strictEqual(r.tuition, 205000);
  },
);

test(
  "resolveRegistration() and resolveTuition() convenience wrappers work",
  () => {
    const svc = new LevelPricingService();
    assert.strictEqual(svc.resolveRegistration("LYC"), 30000);
    assert.strictEqual(svc.resolveTuition("LYC"), 340000);
  },
);

test(
  "listAllLevels() returns every canonical level code",
  () => {
    const svc = new LevelPricingService();
    const levels = svc.listAllLevels();
    assert.ok(levels.length >= 10);
    const codes = levels.map((l) => l.level);
    assert.ok(codes.includes("PRIM"));
    assert.ok(codes.includes("COLG"));
    assert.ok(codes.includes("LYC"));
    assert.ok(codes.includes("AUTISTE"));
  },
);

test(
  "defaultRegistration and defaultTuition getters expose the PRIM fallback",
  () => {
    const svc = new LevelPricingService();
    assert.strictEqual(svc.defaultRegistration, 25000);
    assert.strictEqual(svc.defaultTuition, 205000);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #46 — Issue 8.4: FormulaCompositionService
// ════════════════════════════════════════════════════════════════════
section("Fix #46 — Issue 8.4: FormulaCompositionService");

test(
  "FormulaCompositionService is instantiable (stateless)",
  () => {
    const svc = new FormulaCompositionService();
    assert.strictEqual(svc.serviceName, "FormulaCompositionService");
  },
);

test(
  "composeStandard(PRIM, TRNSP, 'Boumerdès', 0) produces =25000+205000+35000-0",
  () => {
    const svc = new FormulaCompositionService();
    const r = svc.composeStandard("PRIM", "TRNSP", "Boumerdès", 0, false);
    assert.strictEqual(r.expression, "=25000+205000+35000-0");
    assert.strictEqual(r.registration, 25000);
    assert.strictEqual(r.tuition, 205000);
    assert.strictEqual(r.transport, 35000);
    assert.strictEqual(r.expectedValue, 265000);
  },
);

test(
  "composeStandard(PRIM, TRNSP, 'Boumerdès', 25500) produces =25000+205000+35000-25500",
  () => {
    const svc = new FormulaCompositionService();
    const r = svc.composeStandard("PRIM", "TRNSP", "Boumerdès", 25500, false);
    assert.strictEqual(r.expression, "=25000+205000+35000-25500");
    assert.strictEqual(r.expectedValue, 239500);
  },
);

test(
  "compose with omitRemise=true omits the -remise suffix (Excel L5 pattern)",
  () => {
    const svc = new FormulaCompositionService();
    const r = svc.compose({
      level: "COLG",
      optionCode: "TRNSP",
      destination: "Boudouaou", // 52k
      remise: 99999,            // should be ignored
      omitRemise: true,
    });
    // =30000+305000+52000  (no -remise)
    assert.strictEqual(r.expression, "=30000+305000+52000");
    assert.strictEqual(r.omitRemise, true);
    assert.strictEqual(r.remise, 0);
    assert.strictEqual(r.expectedValue, 387000);
  },
);

test(
  "compose with dualTransport=true adds BOTH tier amount and 55000",
  () => {
    const svc = new FormulaCompositionService();
    const r = svc.compose({
      level: "PRIM",
      optionCode: "TRNSP",
      destination: "Boumerdès", // 35k NEARBY
      remise: 0,
      dualTransport: true,
    });
    // =25000+205000+35000+55000-0
    assert.strictEqual(r.expression, "=25000+205000+35000+55000-0");
    assert.strictEqual(r.transport, 35000);
    assert.strictEqual(r.transportPremium, 55000);
    assert.strictEqual(r.expectedValue, 320000);
  },
);

test(
  "compose with no transport omits transport term (Excel L16 pattern)",
  () => {
    const svc = new FormulaCompositionService();
    const r = svc.compose({
      level: "LYC",
      optionCode: "",
      destination: "",
      remise: 0,
    });
    // =30000+340000-0
    assert.strictEqual(r.expression, "=30000+340000-0");
    assert.strictEqual(r.transport, 0);
  },
);

test(
  "compose with registrationOverride uses the override instead of the level lookup",
  () => {
    const svc = new FormulaCompositionService();
    const r = svc.compose({
      level: "PRIM",
      optionCode: "",
      destination: "",
      remise: 0,
      registrationOverride: 18000,
      tuitionOverride: 125000,
    });
    assert.strictEqual(r.expression, "=18000+125000-0");
    assert.strictEqual(r.registration, 18000);
    assert.strictEqual(r.tuition, 125000);
  },
);

test(
  "compose clamps expectedValue to >= 0 (issue 8.3 cross-check)",
  () => {
    const svc = new FormulaCompositionService();
    const r = svc.compose({
      level: "GS",
      optionCode: "",
      destination: "",
      remise: 500000, // > registration + tuition
    });
    assert.ok(r.expectedValue >= 0, `expectedValue should be >= 0, got ${r.expectedValue}`);
  },
);

test(
  "detectPattern() identifies the components of a hand-typed Excel formula",
  () => {
    const svc = new FormulaCompositionService();
    const pattern = svc.detectPattern("=25000+205000+35000-J2", "PRIM");
    assert.ok(pattern, "pattern should be detected");
    assert.strictEqual(pattern!.hasRegistration, true);
    assert.strictEqual(pattern!.hasTuition, true);
    assert.strictEqual(pattern!.hasTransport, true);
    assert.strictEqual(pattern!.hasDualTransport, false);
    assert.strictEqual(pattern!.hasRemiseSubtraction, true);
    assert.strictEqual(pattern!.registrationAmount, 25000);
    assert.strictEqual(pattern!.tuitionAmount, 205000);
    assert.strictEqual(pattern!.transportAmount, 35000);
  },
);

test(
  "detectPattern() detects the dual-transport pattern (issue 1.4)",
  () => {
    const svc = new FormulaCompositionService();
    const pattern = svc.detectPattern("=25000+205000+35000+55000-J3", "PRIM");
    assert.ok(pattern);
    assert.strictEqual(pattern!.hasDualTransport, true);
    assert.strictEqual(pattern!.transportPremiumAmount, 55000);
  },
);

test(
  "detectPattern() detects the no-remise pattern (issue 1.5)",
  () => {
    const svc = new FormulaCompositionService();
    const pattern = svc.detectPattern("=25000+305000+52000", "COLG");
    assert.ok(pattern);
    assert.strictEqual(pattern!.hasRemiseSubtraction, false);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #47 — Issue 7.3: isClosed workflow
// ════════════════════════════════════════════════════════════════════
section("Fix #47 — Issue 7.3: isClosed workflow for PaymentAuditComment");

test(
  "isAuditCommentClosed() detects the ===== suffix",
  () => {
    assert.strictEqual(isAuditCommentClosed({ rawText: "50000/19/09 ======" }), true);
    assert.strictEqual(isAuditCommentClosed({ rawText: "50000/19/09B11 ======" }), true);
    assert.strictEqual(isAuditCommentClosed({ rawText: "50000/19/09B11" }), false);
    assert.strictEqual(isAuditCommentClosed({ rawText: "" }), false);
    assert.strictEqual(isAuditCommentClosed({ isClosed: true, rawText: "anything" }), true);
    assert.strictEqual(isAuditCommentClosed({ isClosed: false, rawText: "anything ======" }), false);
    assert.strictEqual(isAuditCommentClosed(null), false);
  },
);

test(
  "getClosedStateForEntry() returns isClosed=true when ANY comment is closed",
  () => {
    const comments = [
      makeAuditComment({ id: "a1", rawText: "100000/01/09B11", day: 1, month: 9 }),
      makeAuditComment({ id: "a2", rawText: "50000/19/09 ======", day: 19, month: 9 }),
    ];
    const state = getClosedStateForEntry(comments);
    assert.strictEqual(state.isClosed, true);
    if (state.isClosed) {
      assert.strictEqual(state.closingCommentId, "a2");
      assert.strictEqual(state.closingCommentDate.day, 19);
      assert.strictEqual(state.closingCommentDate.month, 9);
    }
  },
);

test(
  "getClosedStateForEntry() returns isClosed=false when NO comment is closed",
  () => {
    const comments = [
      makeAuditComment({ id: "a1", rawText: "100000/01/09B11" }),
      makeAuditComment({ id: "a2", rawText: "50000/19/09B11" }),
    ];
    const state = getClosedStateForEntry(comments);
    assert.strictEqual(state.isClosed, false);
  },
);

test(
  "getClosedStateForEntry() returns isClosed=false for an empty trail",
  () => {
    const state = getClosedStateForEntry([]);
    assert.strictEqual(state.isClosed, false);
  },
);

test(
  "buildClosedStateByEntry() builds a map keyed by ledger entry ID",
  () => {
    const map = new Map([
      ["e1", [makeAuditComment({ id: "a1", ledgerEntryId: "e1", rawText: "x ======" })]],
      ["e2", [makeAuditComment({ id: "a2", ledgerEntryId: "e2", rawText: "y" })]],
    ]);
    const result = buildClosedStateByEntry(map);
    assert.strictEqual(result.size, 2);
    assert.strictEqual(result.get("e1")!.isClosed, true);
    assert.strictEqual(result.get("e2")!.isClosed, false);
  },
);

test(
  "summariseAuditTrail() returns total amount, count, dates, closed flag",
  () => {
    const comments = [
      makeAuditComment({ amount: 100000, day: 1, month: 9, year: null, rawText: "100000/01/09" }),
      makeAuditComment({ amount: 50000, day: 19, month: 9, year: null, rawText: "50000/19/09 ======" }),
    ];
    const s = summariseAuditTrail(comments);
    assert.strictEqual(s.totalAmount, 150000);
    assert.strictEqual(s.commentCount, 2);
    assert.strictEqual(s.firstPaymentDate!.day, 1);
    assert.strictEqual(s.lastPaymentDate!.day, 19);
    assert.strictEqual(s.isClosed, true);
    assert.ok(s.closingCommentId);
  },
);

test(
  "summariseAuditTrail() returns zero totals for an empty trail",
  () => {
    const s = summariseAuditTrail([]);
    assert.strictEqual(s.totalAmount, 0);
    assert.strictEqual(s.commentCount, 0);
    assert.strictEqual(s.firstPaymentDate, null);
    assert.strictEqual(s.lastPaymentDate, null);
    assert.strictEqual(s.isClosed, false);
    assert.strictEqual(s.closingCommentId, null);
  },
);

test(
  "formatClosedStateBadge() returns 'Closed' or 'Open'",
  () => {
    const closed = getClosedStateForEntry([makeAuditComment({ rawText: "x ======" })]);
    const open = getClosedStateForEntry([makeAuditComment({ rawText: "x" })]);
    assert.strictEqual(formatClosedStateBadge(closed), "Closed");
    assert.strictEqual(formatClosedStateBadge(open), "Open");
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #48 — Issue 7.2 / 8.1: FamilyService
// ════════════════════════════════════════════════════════════════════
section("Fix #48 — Issue 7.2/8.1: FamilyService");

test(
  "FamilyService.groupEntries() groups entries by tutor name",
  () => {
    // Use a stub repository — groupEntries() doesn't read from it.
    const svc = new FamilyService({} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "ABDELAOUI", studentName: "INES",  devisAnnuel: 100, totalVersements: 50, totalCreance: 50 }),
      makeLedgerEntry({ id: "e2", tutorName: "ABDELAOUI", studentName: "SAMY",   devisAnnuel: 200, totalVersements: 100, totalCreance: 100 }),
      makeLedgerEntry({ id: "e3", tutorName: "BELRECHID", studentName: "KARIM",  devisAnnuel: 300, totalVersements: 0, totalCreance: 300 }),
    ];
    const result = svc.groupEntries(entries);
    assert.strictEqual(result.familyCount, 2);
    assert.strictEqual(result.totalEntries, 3);
    const abdelaoui = result.families.find((f) => f.tutorName === "ABDELAOUI");
    assert.ok(abdelaoui);
    assert.strictEqual(abdelaoui!.studentCount, 2);
    assert.strictEqual(abdelaoui!.isSiblingFamily, true);
    assert.strictEqual(abdelaoui!.familyDevisAnnuel, 300);
    assert.strictEqual(abdelaoui!.familyTotalVersements, 150);
    assert.strictEqual(abdelaoui!.familyTotalCreance, 150);
  },
);

test(
  "FamilyService.groupEntries() sorts children by student name within a family",
  () => {
    const svc = new FamilyService({} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "X", studentName: "ZED" }),
      makeLedgerEntry({ id: "e2", tutorName: "X", studentName: "ALPHA" }),
      makeLedgerEntry({ id: "e3", tutorName: "X", studentName: "MID" }),
    ];
    const result = svc.groupEntries(entries);
    const family = result.families[0];
    assert.strictEqual(family.entries[0].studentName, "ALPHA");
    assert.strictEqual(family.entries[1].studentName, "MID");
    assert.strictEqual(family.entries[2].studentName, "ZED");
  },
);

test(
  "FamilyService.groupEntries() sorts families alphabetically by tutor name",
  () => {
    const svc = new FamilyService({} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "ZETA", studentName: "A" }),
      makeLedgerEntry({ id: "e2", tutorName: "ALPHA", studentName: "B" }),
      makeLedgerEntry({ id: "e3", tutorName: "MID", studentName: "C" }),
    ];
    const result = svc.groupEntries(entries);
    assert.strictEqual(result.families[0].tutorName, "ALPHA");
    assert.strictEqual(result.families[1].tutorName, "MID");
    assert.strictEqual(result.families[2].tutorName, "ZETA");
  },
);

test(
  "FamilyService.groupEntries() computes sibling-family count correctly",
  () => {
    const svc = new FamilyService({} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "F1", studentName: "A" }),
      makeLedgerEntry({ id: "e2", tutorName: "F1", studentName: "B" }),
      makeLedgerEntry({ id: "e3", tutorName: "F2", studentName: "C" }),
    ];
    const result = svc.groupEntries(entries);
    assert.strictEqual(result.siblingFamilyCount, 1);
  },
);

test(
  "FamilyService.groupEntries() handles negative balances (overpayment, issue 8.2)",
  () => {
    const svc = new FamilyService({} as any);
    const entries = [
      makeLedgerEntry({
        id: "e1", tutorName: "OVERPAID",
        devisAnnuel: 100, totalVersements: 150, totalCreance: -50,
      }),
    ];
    const result = svc.groupEntries(entries);
    const family = result.families[0];
    assert.strictEqual(family.familyBalance, -50);
  },
);

asyncTest(
  "FamilyService.groupByFamily() works against a real SQLite DB",
  async () => {
    const { db, cleanup } = await setupTestDb();
    try {
      const ledger = new LedgerRepository(db);
      // Insert two siblings under one tutor.
      await ledger.create({
        studentName: "ABDELAOUI INES",
        tutorName: "ABDELAOUI",
        level: "PRIM",
        classCode: "CE1",
        fi: 25000, v2: 100000, altV2: 0, v3: 80000,
        t1: 20000, t2: 10000, t3: 5000,
        remise: 0,
        optionCode: "TRNSP",
        destination: "Boumerdès",
      } as any);
      await ledger.create({
        studentName: "ABDELAOUI SAMY",
        tutorName: "ABDELAOUI",
        level: "GS",
        classCode: "GS",
        fi: 18000, v2: 60000, altV2: 0, v3: 47000,
        t1: 10000, t2: 5000, t3: 2500,
        remise: 0,
        optionCode: "TRNSP",
        destination: "Boumerdès",
      } as any);
      const svc = new FamilyService(ledger);
      const result = await svc.groupByFamily();
      assert.ok(result.familyCount >= 1, `expected >= 1 family, got ${result.familyCount}`);
      const abdelaoui = result.families.find((f) => f.tutorName === "ABDELAOUI");
      assert.ok(abdelaoui, "ABDELAOUI family should exist");
      assert.strictEqual(abdelaoui!.studentCount, 2);
      assert.strictEqual(abdelaoui!.isSiblingFamily, true);
    } finally {
      cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #49 — Issue 7.6: ParentSummaryService (PAR PARENT equivalent)
// ════════════════════════════════════════════════════════════════════
section("Fix #49 — Issue 7.6: ParentSummaryService");

test(
  "ParentSummaryService.buildSummaryFromEntries() groups children by tutor",
  () => {
    const svc = new ParentSummaryService({} as any, {} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "ABDELAOUI", studentName: "INES",  devisAnnuel: 230000, totalVersements: 100000, totalCreance: 130000 }),
      makeLedgerEntry({ id: "e2", tutorName: "ABDELAOUI", studentName: "SAMY",   devisAnnuel: 143000, totalVersements: 50000,  totalCreance: 93000 }),
    ];
    const auditByEntry = new Map([
      ["e1", [makeAuditComment({ ledgerEntryId: "e1", amount: 100000, day: 5, month: 9, year: null })]],
      ["e2", [makeAuditComment({ ledgerEntryId: "e2", amount: 50000,  day: 7, month: 10, year: null, rawText: "50000/07/10 ======" })]],
    ]);
    const result = svc.buildSummaryFromEntries(entries, auditByEntry);
    assert.strictEqual(result.parentCount, 1);
    assert.strictEqual(result.totalChildren, 2);
    assert.strictEqual(result.grandTotalDevisAnnuel, 373000);
    const abdelaoui = result.parents[0];
    assert.strictEqual(abdelaoui.tutorName, "ABDELAOUI");
    assert.strictEqual(abdelaoui.childCount, 2);
    assert.strictEqual(abdelaoui.familyDevisAnnuel, 373000);
    assert.strictEqual(abdelaoui.familyTotalVersements, 150000);
    assert.strictEqual(abdelaoui.familyTotalCreance, 223000);
    // Family is closed only when ALL children are closed.
    // e1 has no closing comment → family should NOT be closed.
    assert.strictEqual(abdelaoui.isFamilyClosed, false);
    // Last payment date should be the later of the two trails.
    assert.ok(abdelaoui.lastPaymentDate);
    assert.strictEqual(abdelaoui.lastPaymentDate!.month, 10);
  },
);

test(
  "ParentSummaryService: family is closed only when ALL children are closed",
  () => {
    const svc = new ParentSummaryService({} as any, {} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "FAM", studentName: "A" }),
      makeLedgerEntry({ id: "e2", tutorName: "FAM", studentName: "B" }),
    ];
    const auditByEntry = new Map([
      ["e1", [makeAuditComment({ ledgerEntryId: "e1", rawText: "x ======" })]],
      ["e2", [makeAuditComment({ ledgerEntryId: "e2", rawText: "y ======" })]],
    ]);
    const result = svc.buildSummaryFromEntries(entries, auditByEntry);
    assert.strictEqual(result.parents[0].isFamilyClosed, true);
  },
);

test(
  "ParentSummaryService: family is open when AT LEAST ONE child is open",
  () => {
    const svc = new ParentSummaryService({} as any, {} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "FAM", studentName: "A" }),
      makeLedgerEntry({ id: "e2", tutorName: "FAM", studentName: "B" }),
    ];
    const auditByEntry = new Map([
      ["e1", [makeAuditComment({ ledgerEntryId: "e1", rawText: "x ======" })]],
      ["e2", [makeAuditComment({ ledgerEntryId: "e2", rawText: "y" })]],
    ]);
    const result = svc.buildSummaryFromEntries(entries, auditByEntry);
    assert.strictEqual(result.parents[0].isFamilyClosed, false);
  },
);

test(
  "ParentSummaryService: each child row includes the audit-trail summary",
  () => {
    const svc = new ParentSummaryService({} as any, {} as any);
    const entries = [
      makeLedgerEntry({ id: "e1", tutorName: "FAM", studentName: "A", devisAnnuel: 100, totalVersements: 100 }),
    ];
    const auditByEntry = new Map([
      ["e1", [
        makeAuditComment({ ledgerEntryId: "e1", amount: 60, day: 1, month: 9, year: null }),
        makeAuditComment({ ledgerEntryId: "e1", amount: 40, day: 15, month: 10, year: null }),
      ]],
    ]);
    const result = svc.buildSummaryFromEntries(entries, auditByEntry);
    const child = result.parents[0].children[0];
    assert.strictEqual(child.auditTrail.totalAmount, 100);
    assert.strictEqual(child.auditTrail.commentCount, 2);
    assert.strictEqual(child.auditTrail.firstPaymentDate!.day, 1);
    assert.strictEqual(child.auditTrail.lastPaymentDate!.day, 15);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #50 — Issue 9.4: ValidationRulesRegistry
// ════════════════════════════════════════════════════════════════════
section("Fix #50 — Issue 9.4: ValidationRulesRegistry");

test(
  "EXCEL_VALIDATION_RULES is a non-empty array",
  () => {
    assert.ok(Array.isArray(EXCEL_VALIDATION_RULES));
    assert.ok(EXCEL_VALIDATION_RULES.length >= 5, `expected >= 5 rules, got ${EXCEL_VALIDATION_RULES.length}`);
  },
);

test(
  "Each rule has id, field, severity, excelSource, and evaluate function",
  () => {
    for (const r of EXCEL_VALIDATION_RULES) {
      assert.ok(typeof r.id === "string" && r.id.length > 0, `rule.id invalid: ${r.id}`);
      assert.ok(typeof r.field === "string" && r.field.length > 0);
      assert.ok(r.severity === "soft" || r.severity === "hard");
      assert.ok(typeof r.excelSource === "string");
      assert.ok(typeof r.evaluate === "function");
    }
  },
);

test(
  "septemberBalanceLimit rule fires when balance >= 10000",
  () => {
    const rule = getValidationRule("septemberBalanceLimit");
    assert.ok(rule);
    const w = rule!.evaluate({ septemberBalance: 15000 });
    assert.ok(w, "rule should fire for 15000");
    assert.strictEqual(w!.field, "septemberBalance");
    assert.strictEqual(w!.value, 15000);
  },
);

test(
  "septemberBalanceLimit rule does NOT fire when balance < 10000",
  () => {
    const rule = getValidationRule("septemberBalanceLimit");
    const w = rule!.evaluate({ septemberBalance: 5000 });
    assert.strictEqual(w, null);
  },
);

test(
  "septemberBalanceLimit rule does NOT fire when balance is null/undefined",
  () => {
    const rule = getValidationRule("septemberBalanceLimit");
    assert.strictEqual(rule!.evaluate({ septemberBalance: null }), null);
    assert.strictEqual(rule!.evaluate({ septemberBalance: undefined }), null);
    assert.strictEqual(rule!.evaluate({}), null);
  },
);

test(
  "decemberBalanceAdvisory rule mirrors the september rule (issue 6.3)",
  () => {
    const rule = getValidationRule("decemberBalanceAdvisory");
    assert.ok(rule);
    const w = rule!.evaluate({ decemberBalance: 12000 });
    assert.ok(w);
  },
);

test(
  "marchBalanceAdvisory rule mirrors the september rule (issue 6.3)",
  () => {
    const rule = getValidationRule("marchBalanceAdvisory");
    assert.ok(rule);
    const w = rule!.evaluate({ marchBalance: 12000 });
    assert.ok(w);
  },
);

test(
  "ePlantRange rule fires for an out-of-range value (issue 8.10)",
  () => {
    const rule = getValidationRule("ePlantRange");
    assert.ok(rule);
    const w = rule!.evaluate({ ePlant: 999999 });
    assert.ok(w, "rule should fire for 999999");
    assert.strictEqual(w!.field, "ePlant");
  },
);

test(
  "ePlantRange rule does NOT fire for a value in the typical range",
  () => {
    const rule = getValidationRule("ePlantRange");
    const w = rule!.evaluate({ ePlant: 2000 });
    assert.strictEqual(w, null);
  },
);

test(
  "transportTrancheMismatch rule fires when T1 doesn't match the tier breakdown",
  () => {
    const rule = getValidationRule("transportTrancheMismatch");
    assert.ok(rule);
    // NEARBY tier (Boumerdès): T1=20000, T2=10000, T3=5000.
    // Pass T1=30000 to trigger the mismatch.
    const w = rule!.evaluate({
      optionCode: "TRNSP",
      destination: "Boumerdès",
      t1: 30000,
      t2: 10000,
      t3: 5000,
    });
    assert.ok(w, "rule should fire for T1 mismatch");
    assert.strictEqual(w!.field, "transportTranches");
  },
);

test(
  "transportTrancheMismatch rule does NOT fire when tranches match",
  () => {
    const rule = getValidationRule("transportTrancheMismatch");
    const w = rule!.evaluate({
      optionCode: "TRNSP",
      destination: "Boumerdès",
      t1: 20000,
      t2: 10000,
      t3: 5000,
    });
    assert.strictEqual(w, null);
  },
);

test(
  "transportTrancheMismatch rule does NOT fire when OPTION is not TRNSP",
  () => {
    const rule = getValidationRule("transportTrancheMismatch");
    const w = rule!.evaluate({
      optionCode: "",
      destination: "Boumerdès",
      t1: 999999,
    });
    assert.strictEqual(w, null);
  },
);

test(
  "runValidationRules() runs all soft rules and returns combined warnings",
  () => {
    const input = {
      septemberBalance: 15000,
      decemberBalance: 12000,
      marchBalance: 11000,
      ePlant: 999999,
    };
    const warnings = runValidationRules(input);
    // September + December + March + E-Plant = 4 warnings.
    assert.ok(warnings.length >= 4, `expected >= 4 warnings, got ${warnings.length}`);
    const fields = warnings.map((w) => w.field);
    assert.ok(fields.includes("septemberBalance"));
    assert.ok(fields.includes("decemberBalance"));
    assert.ok(fields.includes("marchBalance"));
    assert.ok(fields.includes("ePlant"));
  },
);

test(
  "runValidationRules() returns no warnings for a truly clean input",
  () => {
    // A clean input has NO populated dead-term-tracking fields.
    // (septemberBalance etc. ARE dead-term fields — populating them
    // triggers the issue-7.5 advisory, even if the value is small.)
    const input = {
      ePlant: 2000,
    };
    const warnings = runValidationRules(input);
    assert.strictEqual(warnings.length, 0);
  },
);

test(
  "runValidationRules() includes the dead-term-tracking advisory (issue 7.5)",
  () => {
    const input = {
      september: 50000,  // populated dead field
    };
    const warnings = runValidationRules(input);
    const fields = warnings.map((w) => w.field);
    assert.ok(fields.includes("september"), "should include september dead-field advisory");
  },
);

test(
  "listValidationRules() returns the same array as EXCEL_VALIDATION_RULES",
  () => {
    assert.strictEqual(listValidationRules(), EXCEL_VALIDATION_RULES);
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #51 — better-sqlite3 NODE_MODULE_VERSION diagnostic
// ════════════════════════════════════════════════════════════════════
section("Fix #51 — better-sqlite3 NODE_MODULE_VERSION diagnostic");

test(
  "scripts/rebuild-better-sqlite3.js exists",
  () => {
    const file = path.join(__dirname, "..", "scripts", "rebuild-better-sqlite3.js");
    assert.ok(fs.existsSync(file), `expected rebuild script at ${file}`);
  },
);

test(
  "rebuild script is executable Node.js (has shebang and main function)",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "scripts", "rebuild-better-sqlite3.js"),
      "utf8",
    );
    assert.ok(src.startsWith("#!/usr/bin/env node"), "script should have a Node.js shebang");
    assert.ok(src.includes("function main()"), "script should define a main() function");
    assert.ok(src.includes("npm rebuild better-sqlite3"), "script should invoke npm rebuild");
  },
);

test(
  "package.json declares the postinstall hook",
  () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
    );
    assert.ok(pkg.scripts, "package.json should have scripts");
    assert.ok(
      pkg.scripts.postinstall && pkg.scripts.postinstall.includes("rebuild-better-sqlite3"),
      "postinstall should invoke rebuild-better-sqlite3.js",
    );
    assert.ok(
      pkg.scripts["rebuild:sqlite"] && pkg.scripts["rebuild:sqlite"].includes("rebuild-better-sqlite3"),
      "rebuild:sqlite script should be defined",
    );
  },
);

test(
  "sqlite-client.ts detects NODE_MODULE_VERSION errors and appends the fix hint",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "infrastructure", "database", "sqlite-client.ts"),
      "utf8",
    );
    assert.ok(
      src.includes("NODE_MODULE_VERSION"),
      "sqlite-client should check for NODE_MODULE_VERSION in the error message",
    );
    assert.ok(
      src.includes("npm rebuild better-sqlite3"),
      "sqlite-client should append the npm rebuild hint",
    );
    assert.ok(
      src.includes("Fix #51"),
      "sqlite-client should reference Fix #51 for traceability",
    );
  },
);

test(
  "rebuild script handles the 'module not installed' case gracefully",
  () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "scripts", "rebuild-better-sqlite3.js"),
      "utf8",
    );
    assert.ok(
      src.includes("not installed"),
      "script should handle the case where better-sqlite3 is not installed",
    );
  },
);

// ════════════════════════════════════════════════════════════════════
// Final summary
// ════════════════════════════════════════════════════════════════════

(async () => {
  await Promise.allSettled(pendingAsyncTests);

  console.log("\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  console.log(`  Iteration 6: ${passed} passed, ${failed} failed`);
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n");

  if (failed > 0) {
    console.log("Failures:");
    for (const f of failures) {
      console.log(`  - ${f}`);
    }
    process.exit(1);
  }
})();
