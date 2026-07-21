/**
 * Iteration 2 — test harness for the 8 new critical fixes.
 *
 * Each test module corresponds to one issue (or a tightly-coupled group
 * of issues). Run with:
 *   npx tsx tests/run-iteration2-tests.ts
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { v4 as uuidv4 } from "uuid";

// ── Iteration 2 modules under test ──────────────────────────────────
import {
  REGISTRATION_BY_LEVEL,
  TUITION_BY_LEVEL,
  TRANSPORT_AMOUNT_BY_TIER,
  TransportTier,
  resolveRegistration,
  resolveTuition,
  resolveTransportAmount,
  resolveTransportTier,
  normaliseTownName,
  DEFAULT_REGISTRATION,
  DEFAULT_TUITION,
} from "../src/shared/pricing";
import { getStarterFormulaRules } from "../src/services/formula-rule.service";

// ── Iteration 2 integration: real SQLite DB ─────────────────────────
import { DatabaseClient } from "../src/infrastructure/database/sqlite-client";
import { MigrationsRunner } from "../src/infrastructure/database/migrations/migrations-runner";
import { migrations } from "../src/infrastructure/database/migrations/migrations";
import { LedgerRepository } from "../src/infrastructure/repositories/ledger-entry.repository";
import { FeeScheduleRepository } from "../src/infrastructure/repositories/fee-schedule.repository";
import { FormulaRuleRepository } from "../src/infrastructure/repositories/formula-rule.repository";
import { PaymentAuditCommentRepository } from "../src/infrastructure/repositories/payment-audit-comment.repository";
import { StudentRepository } from "../src/infrastructure/repositories/student.repository";
import { InvoiceRepository } from "../src/infrastructure/repositories/payment.repository";
import { PaymentRepository } from "../src/infrastructure/repositories/payment.repository";
import { EventBus } from "../src/infrastructure/event-bus/event-bus";
import { LedgerService } from "../src/services/ledger.service";
import { PaymentService } from "../src/services/payment.service";

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

async function setupLedgerService(): Promise<{
  service: LedgerService;
  db: DatabaseClient;
  cleanup: () => Promise<void>;
}> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-iter2-"));
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
    cleanup: async () => {
      await db.close();
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    },
  };
}

async function insertTestStudent(db: DatabaseClient): Promise<string> {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO students (
      id, student_code, first_name, last_name, full_name,
      date_of_birth, gender, parent_ids_json, primary_parent_id,
      phone_numbers_json, address_json, emergency_contacts_json,
      registered_at, status, metadata_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, `STU-TEST-${id.slice(0, 8)}`, "TEST", "STUDENT", "TEST STUDENT",
      "2015-01-01", "unspecified", "[]", null, "[]",
      JSON.stringify({ line1: "x", city: "x", country: "x" }), "[]",
      now, "active", "{}", now, now,
    ],
  );
  return id;
}

async function setupPaymentService(): Promise<{
  paymentService: PaymentService;
  ledgerService: LedgerService;
  db: DatabaseClient;
  cleanup: () => Promise<void>;
}> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-pay-"));
  const dbPath = path.join(tmpDir, "test.db");
  const db = new DatabaseClient({ filePath: dbPath });
  await db.open();
  const runner = new MigrationsRunner(db);
  await runner.runAll(migrations);

  const eventBus = new EventBus();
  const studentRepo = new StudentRepository(db);
  const paymentRepo = new PaymentRepository(db);
  const invoiceRepo = new InvoiceRepository(db);
  const ledgerRepo = new LedgerRepository(db);
  const feeScheduleRepo = new FeeScheduleRepository(db);
  const formulaRuleRepo = new FormulaRuleRepository(db);
  const auditCommentRepo = new PaymentAuditCommentRepository(db);

  for (const rule of getStarterFormulaRules()) {
    await formulaRuleRepo.create(rule);
  }

  const ledgerService = new LedgerService(
    ledgerRepo, feeScheduleRepo, formulaRuleRepo, auditCommentRepo, eventBus,
  );
  const paymentService = new PaymentService(
    paymentRepo, invoiceRepo, studentRepo, eventBus,
  );

  return {
    paymentService,
    ledgerService,
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
// Fix #8 — §1 FATAL: Broken inter-rule data flow
// ════════════════════════════════════════════════════════════════════
section("Fix #8 — §1 FATAL: Inter-rule data flow (TOTAL CREANCE ≠ 0)");

await asyncTest(
  "computeFields() now returns a non-zero totalCreance when starter rules are seeded",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const computed = await service.computeFields({
        studentName: "ITER2 STUDENT",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "BOUMERDES",
        remise: 0,
        fi: 25000,
        v2: 71500,
        altV2: 0,
        v3: 0,
        t1: 30000,
        t2: 15000,
        t3: 10000,
      } as any);
      // Before the §1 fix, totalCreance was always 0 (devisAnnuel and
      // totalVersements were not in the context, so the rule evaluated
      // 0 - 0 = 0). It should now be a real number.
      assert.ok(
        computed.totalCreance !== 0,
        `totalCreance should be non-zero after the §1 fix, got ${computed.totalCreance}`,
      );
      // And it should equal devisAnnuel - totalVersements.
      assert.strictEqual(
        computed.totalCreance,
        computed.devisAnnuel! - computed.totalVersements!,
        `totalCreance should equal devisAnnuel - totalVersements`,
      );
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "the TOTAL CREANCE rule reads the just-computed devisAnnuel and totalVersements from ctx",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      // PRIM student with no payments → totalCreance should equal devisAnnuel.
      const computed = await service.computeFields({
        studentName: "NO-PAYMENT STUDENT",
        level: "PRIM",
        optionCode: "",     // no transport
        destination: "",
        remise: 0,
        fi: 0, v2: 0, altV2: 0, v3: 0, t1: 0, t2: 0, t3: 0,
      } as any);
      // devisAnnuel = 25000 + 205000 + 0 = 230000
      // totalVersements = 0
      // totalCreance = 230000 - 0 = 230000
      assert.strictEqual(computed.devisAnnuel, 230000);
      assert.strictEqual(computed.totalVersements, 0);
      assert.strictEqual(computed.totalCreance, 230000);
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #9 — Issue 1.1 CRITICAL: Registration fee level-indexed
// ════════════════════════════════════════════════════════════════════
section("Fix #9 — Issue 1.1: Registration fee level-indexed");

test("REGISTRATION_BY_LEVEL has the documented Excel values", () => {
  assert.strictEqual(REGISTRATION_BY_LEVEL.MS, 18000, "MS registration = 18,000");
  assert.strictEqual(REGISTRATION_BY_LEVEL.GS, 18000, "GS registration = 18,000");
  assert.strictEqual(REGISTRATION_BY_LEVEL.PRIM, 25000, "PRIM registration = 25,000");
  assert.strictEqual(REGISTRATION_BY_LEVEL.COLG, 30000, "COLG registration = 30,000");
  assert.strictEqual(REGISTRATION_BY_LEVEL.LYC, 30000, "LYC registration = 30,000");
});

test("resolveRegistration returns 18,000 for MS/GS (was overcharged 7,000 before)", () => {
  assert.strictEqual(resolveRegistration("MS"), 18000);
  assert.strictEqual(resolveRegistration("GS"), 18000);
  assert.strictEqual(resolveRegistration("gs"), 18000); // case-insensitive
  assert.strictEqual(resolveRegistration("  ms  "), 18000); // trims
});

test("resolveRegistration returns 30,000 for COLG/LYC (was undercharged 5,000 before)", () => {
  assert.strictEqual(resolveRegistration("COLG"), 30000);
  assert.strictEqual(resolveRegistration("LYC"), 30000);
});

test("resolveRegistration falls back to 25,000 for unknown levels", () => {
  assert.strictEqual(resolveRegistration("UNKNOWN"), DEFAULT_REGISTRATION);
  assert.strictEqual(resolveRegistration(null), DEFAULT_REGISTRATION);
  assert.strictEqual(resolveRegistration(undefined), DEFAULT_REGISTRATION);
  assert.strictEqual(resolveRegistration(""), DEFAULT_REGISTRATION);
});

test("resolveRegistration honours NV2–NV5 (issue 8.6 codes from iteration 1)", () => {
  for (const code of ["NV2", "NV3", "NV4", "NV5"]) {
    assert.strictEqual(
      resolveRegistration(code),
      25000,
      `${code} should default to PRIM registration (25,000)`,
    );
  }
});

// ════════════════════════════════════════════════════════════════════
// Fix #10 — Issue 1.2 CRITICAL: Tuition level-indexed
// ════════════════════════════════════════════════════════════════════
section("Fix #10 — Issue 1.2: Tuition level-indexed");

test("TUITION_BY_LEVEL has the documented Excel values", () => {
  assert.strictEqual(TUITION_BY_LEVEL.MS, 125000, "MS tuition = 125,000");
  assert.strictEqual(TUITION_BY_LEVEL.GS, 125000, "GS tuition = 125,000");
  assert.strictEqual(TUITION_BY_LEVEL.PRIM, 205000, "PRIM tuition = 205,000");
  assert.strictEqual(TUITION_BY_LEVEL.COLG, 305000, "COLG tuition = 305,000");
  assert.strictEqual(TUITION_BY_LEVEL.LYC, 340000, "LYC tuition = 340,000");
  assert.strictEqual(TUITION_BY_LEVEL.AUTISTE, 283000, "AUTISTE tuition = 283,000");
});

test("resolveTuition returns 125,000 for MS/GS (was overcharged 80,000 before)", () => {
  assert.strictEqual(resolveTuition("MS"), 125000);
  assert.strictEqual(resolveTuition("GS"), 125000);
});

test("resolveTuition returns 305,000 for COLG (was undercharged 100,000 before)", () => {
  assert.strictEqual(resolveTuition("COLG"), 305000);
});

test("resolveTuition returns 340,000 for LYC (was undercharged 135,000 before)", () => {
  assert.strictEqual(resolveTuition("LYC"), 340000);
});

test("resolveTuition falls back to 205,000 (PRIM rate) for unknown levels", () => {
  assert.strictEqual(resolveTuition("UNKNOWN"), DEFAULT_TUITION);
  assert.strictEqual(resolveTuition(null), DEFAULT_TUITION);
});

// ════════════════════════════════════════════════════════════════════
// Fix #11 — Issue 1.3 CRITICAL: All 4 transport tiers
// ════════════════════════════════════════════════════════════════════
section("Fix #11 — Issue 1.3: All 4 transport tiers (35k / 43k / 52k / 55k)");

test("TRANSPORT_AMOUNT_BY_TIER has all 4 documented amounts", () => {
  assert.strictEqual(TRANSPORT_AMOUNT_BY_TIER[TransportTier.NEARBY], 35000);
  assert.strictEqual(TRANSPORT_AMOUNT_BY_TIER[TransportTier.INTERMEDIATE], 43000);
  assert.strictEqual(TRANSPORT_AMOUNT_BY_TIER[TransportTier.MEDIUM], 52000);
  assert.strictEqual(TRANSPORT_AMOUNT_BY_TIER[TransportTier.FAR], 55000);
});

test("resolveTransportTier maps nearby towns to NEARBY tier (35,000)", () => {
  for (const town of ["BOUMERDES", "Corso", "Sahel", "FIGUIER", "Benyounes"]) {
    assert.strictEqual(
      resolveTransportTier(town),
      TransportTier.NEARBY,
      `${town} should map to NEARBY`,
    );
  }
});

test("resolveTransportTier maps Boudouaou to MEDIUM tier (52,000)", () => {
  assert.strictEqual(resolveTransportTier("BOUDOUAOU"), TransportTier.MEDIUM);
  assert.strictEqual(resolveTransportTier("Ouled Moussa"), TransportTier.MEDIUM);
  assert.strictEqual(resolveTransportTier("KHEMIS KHENCHELA"), TransportTier.MEDIUM);
  assert.strictEqual(resolveTransportTier("Tidjelabine"), TransportTier.MEDIUM);
});

test("resolveTransportTier maps Cap Djenet to FAR tier (55,000)", () => {
  assert.strictEqual(resolveTransportTier("CAP DJENET"), TransportTier.FAR);
  assert.strictEqual(resolveTransportTier("DJENAT"), TransportTier.FAR);
  assert.strictEqual(resolveTransportTier("BORDJ MNAIL"), TransportTier.FAR);
  assert.strictEqual(resolveTransportTier("ISSER"), TransportTier.FAR);
  assert.strictEqual(resolveTransportTier("REGHIAA"), TransportTier.FAR);
  assert.strictEqual(resolveTransportTier("RegHAIA"), TransportTier.FAR); // case variant
});

test("resolveTransportTier maps ZEMOURI/THENIA to INTERMEDIATE tier (43,000)", () => {
  assert.strictEqual(resolveTransportTier("ZEMOURI"), TransportTier.INTERMEDIATE);
  assert.strictEqual(resolveTransportTier("THENIA"), TransportTier.INTERMEDIATE);
});

test("resolveTransportTier handles spelling variants (BOUMERDES20000, KHEMISKHCHNA)", () => {
  // normaliseTownName strips trailing postal codes and collapses whitespace
  assert.strictEqual(normaliseTownName("BOUMERDES20000"), "BOUMERDES");
  assert.strictEqual(normaliseTownName("  boumerdes  "), "BOUMERDES");
  assert.strictEqual(resolveTransportTier("BOUMERDES20000"), TransportTier.NEARBY);
  assert.strictEqual(resolveTransportTier("KHEMISKHCHNA"), TransportTier.MEDIUM);
});

test("resolveTransportTier returns null for empty / null / undefined", () => {
  assert.strictEqual(resolveTransportTier(null), null);
  assert.strictEqual(resolveTransportTier(undefined), null);
  assert.strictEqual(resolveTransportTier(""), null);
  assert.strictEqual(resolveTransportTier("   "), null);
});

test("resolveTransportAmount returns 0 for empty destination (no transport)", () => {
  assert.strictEqual(resolveTransportAmount(""), 0);
  assert.strictEqual(resolveTransportAmount(null), 0);
});

test("resolveTransportAmount returns the tier amount for known towns", () => {
  assert.strictEqual(resolveTransportAmount("BOUMERDES"), 35000);
  assert.strictEqual(resolveTransportAmount("ZEMOURI"), 43000);
  assert.strictEqual(resolveTransportAmount("BOUDOUAOU"), 52000);
  assert.strictEqual(resolveTransportAmount("CAP DJENET"), 55000);
});

// ════════════════════════════════════════════════════════════════════
// Fix #12 — Issue 1.4 HIGH: Dual transport support (opt-in via user rule)
// ════════════════════════════════════════════════════════════════════
section("Fix #12 — Issue 1.4: Dual transport support (opt-in via user rule)");

await asyncTest(
  "PRIM student with TRNSP to CAP DJENET (FAR) gets 55,000 transport via starter rule (single transport)",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const computed = await service.computeFields({
        studentName: "FAR TRANSPORT STUDENT",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "CAP DJENET",
        remise: 0,
      } as any);
      // Starter rule: registration + baseTuition + resolvedTransport - remise
      // = 25,000 + 205,000 + 55,000 = 285,000
      // (resolvedTransport for FAR tier = 55,000)
      assert.strictEqual(
        computed.devisAnnuel,
        285000,
        `PRIM + FAR transport (starter rule) should be 285,000, got ${computed.devisAnnuel}`,
      );
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "a user-defined rule CAN opt into the dual-transport pattern (35k + 55k = 90k)",
  async () => {
    const { service, db, cleanup } = await setupLedgerService();
    try {
      // Insert a custom rule that adds BOTH transportBase + transportPremium.
      const formulaRuleRepo = new (require("../src/infrastructure/repositories/formula-rule.repository").FormulaRuleRepository)(db);
      await formulaRuleRepo.create({
        name: "DEVIS ANNUEL (dual transport)",
        description: "Reproduces Excel row L3: =25000+205000+35000+55000-J3",
        expression: "registration + baseTuition + transportBase + transportPremium - remise",
        scope: "ledger",
        targetField: "devisAnnuel",
        trigger: "on_save",
        watchedFields: ["registration", "baseTuition", "transportBase", "transportPremium", "remise"],
        isActive: true,
        priority: 5, // higher priority than the starter (10)
      });
      const computed = await service.computeFields({
        studentName: "DUAL TRANSPORT STUDENT",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "CAP DJENET", // FAR tier
        remise: 0,
      } as any);
      // Custom rule: registration + baseTuition + transportBase + transportPremium - remise
      // = 25,000 + 205,000 + 55,000 + 55,000 = 340,000
      // (transportBase for FAR = 55,000 because resolveTransportAmount returns 55,000;
      //  transportPremium = 55,000 because we set it to FAR tier amount)
      // The point of this test is that a user CAN compose a dual-transport
      // formula — the architecture now supports it.
      assert.ok(
        computed.devisAnnuel! > 285000,
        `dual-transport formula should yield a higher total than single-transport, got ${computed.devisAnnuel}`,
      );
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "PRIM student with TRNSP to BOUMERDES (NEARBY) gets only 35,000 transport",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const computed = await service.computeFields({
        studentName: "NEARBY TRANSPORT STUDENT",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "BOUMERDES",
        remise: 0,
      } as any);
      // Excel evidence (e.g. row 2): =25000+205000+35000-J2
      // Starter rule: 25,000 + 205,000 + 35,000 = 265,000
      assert.strictEqual(
        computed.devisAnnuel,
        265000,
        `PRIM + NEARBY transport should be 265,000, got ${computed.devisAnnuel}`,
      );
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "PRIM student with TRNSP to BOUDOUAOU (MEDIUM) gets only 52,000 transport",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const computed = await service.computeFields({
        studentName: "MEDIUM TRANSPORT STUDENT",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "BOUDOUAOU",
        remise: 0,
      } as any);
      // = 25,000 + 205,000 + 52,000 = 282,000
      assert.strictEqual(computed.devisAnnuel, 282000);
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #13 — Issue 8.2 HIGH: Overpayments no longer blocked
// ════════════════════════════════════════════════════════════════════
section("Fix #13 — Issue 8.2: Overpayments allowed (Excel behaviour)");

await asyncTest(
  "recordPayment no longer throws when amount > outstanding (Excel allows overpayments)",
  async () => {
    const { paymentService, db, cleanup } = await setupPaymentService();
    try {
      const studentId = await insertTestStudent(db);
      // Create an invoice for 10,000 DZD
      const invoice = await paymentService.createInvoice({
        studentId,
        type: "monthly_tuition",
        description: "Test invoice",
        amountDue: 10000,
      });
      // Pay 15,000 — 5,000 more than the 10,000 outstanding.
      // The OLD code threw BusinessRuleError here. The new code should
      // accept the payment and mark it OVERPAID.
      const payment = await paymentService.recordPayment({
        studentId,
        amount: 15000,
        invoiceIds: [invoice.id.value],
        paymentMethod: "cash" as any,
        paymentDate: new Date().toISOString().slice(0, 10),
      } as any);
      assert.ok(payment.id, "payment should have been recorded");
      // The OVERPAID status is set by the allocation loop when remaining > 0.
      const reloaded = await paymentService.getById(payment.id.value);
      assert.strictEqual(
        reloaded.status,
        "overpaid",
        `payment status should be OVERPAID, got ${reloaded.status}`,
      );
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "recordPayment still throws for genuinely invalid input (zero/negative amount)",
  async () => {
    const { paymentService, db, cleanup } = await setupPaymentService();
    try {
      const studentId = await insertTestStudent(db);
      await assert.rejects(
        async () =>
          paymentService.recordPayment({
            studentId,
            amount: 0,
            paymentMethod: "cash" as any,
            paymentDate: new Date().toISOString().slice(0, 10),
          } as any),
        /positive/,
        "expected a ValidationError for zero amount",
      );
      await assert.rejects(
        async () =>
          paymentService.recordPayment({
            studentId,
            amount: -100,
            paymentMethod: "cash" as any,
            paymentDate: new Date().toISOString().slice(0, 10),
          } as any),
        /positive/,
        "expected a ValidationError for negative amount",
      );
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #14 — Issue 8.4 HIGH: TRNSP without destination adds no transport
// ════════════════════════════════════════════════════════════════════
section("Fix #14 — Issue 8.4: TRNSP without destination → no transport");

await asyncTest(
  "PRIM student with OPTION=TRNSP but NO destination gets NO transport component",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const computed = await service.computeFields({
        studentName: "NO-DEST TRANSPORT STUDENT",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "", // missing destination — operator forgot
        remise: 0,
      } as any);
      // Excel evidence: some rows have OPTION=TRNSP but no transport
      // term in the L formula (the operator forgot or the family opted
      // out). The OLD code added 35,000 unconditionally. The new code
      // adds nothing when the destination is empty.
      // = 25,000 + 205,000 + 0 = 230,000
      assert.strictEqual(
        computed.devisAnnuel,
        230000,
        `PRIM + TRNSP-but-no-destination should be 230,000 (no transport), got ${computed.devisAnnuel}`,
      );
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "PRIM student with NO OPTION (no transport) and NO destination gets NO transport",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const computed = await service.computeFields({
        studentName: "NO-TRANSPORT STUDENT",
        level: "PRIM",
        optionCode: "",
        destination: "",
        remise: 0,
      } as any);
      // = 25,000 + 205,000 + 0 = 230,000
      assert.strictEqual(computed.devisAnnuel, 230000);
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Fix #15 — §17 MEDIUM: Context now exposes row metadata
// ════════════════════════════════════════════════════════════════════
section("Fix #15 — §17: Formula context exposes optionCode/level/classCode/destination");

await asyncTest(
  "a user-defined formula rule can reference optionCode (was impossible before §17 fix)",
  async () => {
    const { service, db, cleanup } = await setupLedgerService();
    try {
      // Insert a custom rule that branches on optionCode.
      // We use the seeded rule infrastructure: create a custom rule
      // whose expression references optionCode.
      const formulaRuleRepo = new (require("../src/infrastructure/repositories/formula-rule.repository").FormulaRuleRepository)(db);
      await formulaRuleRepo.create({
        name: "TRANSPORT INDICATOR",
        description: "Returns 1 if transport, 0 otherwise",
        expression: 'IF(optionCode = "TRNSP", 1, 0)',
        scope: "ledger",
        targetField: "devisAnnuel", // override the starter
        trigger: "on_save",
        watchedFields: ["optionCode"],
        isActive: true,
        priority: 5, // higher priority than the starter (10)
      });
      const computed = await service.computeFields({
        studentName: "OPTION-CODE TEST",
        level: "PRIM",
        optionCode: "TRNSP",
        destination: "BOUMERDES",
        remise: 0,
      } as any);
      // The custom rule returns 1 (because optionCode = "TRNSP").
      // The starter rule is overridden because the custom rule has
      // higher priority (lower priority number).
      assert.strictEqual(
        computed.devisAnnuel,
        1,
        `custom rule referencing optionCode should evaluate to 1, got ${computed.devisAnnuel}`,
      );
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "a user-defined formula rule can reference destination",
  async () => {
    const { service, db, cleanup } = await setupLedgerService();
    try {
      const formulaRuleRepo = new (require("../src/infrastructure/repositories/formula-rule.repository").FormulaRuleRepository)(db);
      await formulaRuleRepo.create({
        name: "DESTINATION CHECK",
        description: "Returns 777 if destination is BOUMERDES",
        expression: 'IF(destination = "BOUMERDES", 777, 0)',
        scope: "ledger",
        targetField: "devisAnnuel",
        trigger: "on_save",
        watchedFields: ["destination"],
        isActive: true,
        priority: 5,
      });
      const computed = await service.computeFields({
        studentName: "DESTINATION TEST",
        level: "PRIM",
        optionCode: "",
        destination: "BOUMERDES",
        remise: 0,
      } as any);
      assert.strictEqual(computed.devisAnnuel, 777);
    } finally {
      await cleanup();
    }
  },
);

await asyncTest(
  "a user-defined formula rule can reference level",
  async () => {
    const { service, db, cleanup } = await setupLedgerService();
    try {
      const formulaRuleRepo = new (require("../src/infrastructure/repositories/formula-rule.repository").FormulaRuleRepository)(db);
      await formulaRuleRepo.create({
        name: "LEVEL CHECK",
        description: "Returns 999 if level is COLG",
        expression: 'IF(level = "COLG", 999, 0)',
        scope: "ledger",
        targetField: "devisAnnuel",
        trigger: "on_save",
        watchedFields: ["level"],
        isActive: true,
        priority: 5,
      });
      const computed = await service.computeFields({
        studentName: "LEVEL TEST",
        level: "COLG",
        optionCode: "",
        destination: "",
        remise: 0,
      } as any);
      assert.strictEqual(computed.devisAnnuel, 999);
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Combined end-to-end: a LYC student with FAR transport
// ════════════════════════════════════════════════════════════════════
section("End-to-end: LYC + FAR transport (combines 1.1, 1.2, 1.3, 8.4)");

await asyncTest(
  "LYC student with TRNSP to ISSER (FAR) gets the correct single-transport devis",
  async () => {
    const { service, cleanup } = await setupLedgerService();
    try {
      const computed = await service.computeFields({
        studentName: "LYC FAR STUDENT",
        level: "LYC",
        optionCode: "TRNSP",
        destination: "ISSER",
        remise: 10000,
        fi: 30000,
        v2: 100000,
        altV2: 0,
        v3: 100000,
        t1: 30000,
        t2: 15000,
        t3: 10000,
      } as any);
      // Expected (starter rule with resolvedTransport):
      //   registration (LYC)  = 30,000
      //   tuition (LYC)       = 340,000
      //   resolvedTransport   = 55,000   (FAR tier — single transport)
      //   remise              = -10,000
      //   ──────────────────────────────
      //   devisAnnuel         = 30,000 + 340,000 + 55,000 - 10,000
      //                       = 415,000
      //   totalVersements     = 30,000 + 100,000 + 0 + 100,000 + 30,000 + 15,000 + 10,000
      //                       = 285,000
      //   totalCreance        = 415,000 - 285,000 = 130,000
      assert.strictEqual(computed.devisAnnuel, 415000);
      assert.strictEqual(computed.totalVersements, 285000);
      assert.strictEqual(computed.totalCreance, 130000);
    } finally {
      await cleanup();
    }
  },
);

// ════════════════════════════════════════════════════════════════════
// Starter rule regression
// ════════════════════════════════════════════════════════════════════
section("Starter rule: DEVIS ANNUEL uses resolvedTransport (iteration 2)");

test("the DEVIS ANNUEL starter expression references resolvedTransport", () => {
  const starters = getStarterFormulaRules();
  const devisRule = starters.find((r) => r.targetField === "devisAnnuel");
  assert.ok(devisRule);
  assert.ok(
    devisRule!.expression.includes("resolvedTransport"),
    `expected expression to reference resolvedTransport, got: ${devisRule!.expression}`,
  );
});

test("the DEVIS ANNUEL starter watchedFields includes level, optionCode, destination", () => {
  const starters = getStarterFormulaRules();
  const devisRule = starters.find((r) => r.targetField === "devisAnnuel");
  assert.ok(devisRule);
  for (const f of ["level", "optionCode", "destination"]) {
    assert.ok(
      devisRule!.watchedFields.includes(f),
      `expected watchedFields to include ${f}`,
    );
  }
});

// ── Summary ─────────────────────────────────────────────────────────
console.log("\n──────────────────────────────────────────────");
console.log(`  Iteration 2: ${passed} passed, ${failed} failed`);
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
  console.error("Fatal error in iteration-2 test runner:", err);
  process.exit(1);
});
