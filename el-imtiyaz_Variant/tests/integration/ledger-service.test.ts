/**
 * Integration test — exercises LedgerService against a real (temp-file)
 * SQLite database. Verifies the end-to-end behaviour of:
 *
 *   - Fix #3 (Issue 2.3/9.3): grandTotal is no longer invented
 *   - Fix #4 (Issue 6.1/6.2): septemberBalance soft validation
 *   - Fix #5 (Issue 4.1/9.1): allocatePaymentToLedger no longer mutates
 *     payment columns or imposes caps
 *
 * Run with:
 *   npx tsx tests/integration/ledger-service.test.ts
 */

import * as assert from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { DatabaseClient } from "../../src/infrastructure/database/sqlite-client";
import { MigrationsRunner } from "../../src/infrastructure/database/migrations/migrations-runner";
import { migrations } from "../../src/infrastructure/database/migrations/migrations";
import { LedgerRepository } from "../../src/infrastructure/repositories/ledger-entry.repository";
import { FeeScheduleRepository } from "../../src/infrastructure/repositories/fee-schedule.repository";
import { FormulaRuleRepository } from "../../src/infrastructure/repositories/formula-rule.repository";
import { PaymentAuditCommentRepository } from "../../src/infrastructure/repositories/payment-audit-comment.repository";
import { StudentRepository } from "../../src/infrastructure/repositories/student.repository";
import { EventBus } from "../../src/infrastructure/event-bus/event-bus";
import { LedgerService } from "../../src/services/ledger.service";
import {
  getStarterFormulaRules,
} from "../../src/services/formula-rule.service";
import { v4 as uuidv4 } from "uuid";

let passed = 0;
let failed = 0;

function ok(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`      → ${(err as Error).message}`);
  }
}

async function okAsync(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`      → ${(err as Error).message}`);
  }
}

async function setupService(): Promise<{
  service: LedgerService;
  dbPath: string;
  db: DatabaseClient;
  cleanup: () => Promise<void>;
}> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "el-imtiyaz-int-"));
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

  // Seed the starter formula rules — but NOTE that after our fix, the
  // grandTotal rule is no longer in the starter set.
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
    dbPath,
    db,
    cleanup: async () => {
      await db.close();
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    },
  };
}

/** Insert a minimal student row so ledger_entries.student_id FK is satisfied. */
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
      id,
      `STU-TEST-${id.slice(0, 8)}`,
      "TEST",
      "STUDENT",
      "TEST STUDENT",
      "2015-01-01",
      "unspecified",
      "[]",
      null,
      "[]",
      JSON.stringify({ line1: "x", city: "x", country: "x" }),
      "[]",
      now,
      "active",
      "{}",
      now,
      now,
    ],
  );
  return id;
}

console.log("\n── Integration: LedgerService — Fix #3, #4, #5 ────");

async function main(): Promise<void> {
// ── Fix #3: grandTotal no longer invented ───────────────────────────
await okAsync(
  "computeFields() returns grandTotal = 0 when no grandTotal rule is seeded (Excel column AL is empty)",
  async () => {
    const { service, cleanup } = await setupService();
    try {
      const computed = await service.computeFields({
        studentName: "TEST STUDENT",
        fi: 25000,
        v2: 71500,
        altV2: 0,
        v3: 0,
        t1: 30000,
        t2: 15000,
        t3: 10000,
        psy1: 5000,
        psy2: 0,
        orth1: 0,
        orth2: 0,
        ePlant: 2000,
        ratrapage: 0,
        september: 0,
        december: 0,
        march: 0,
        remise: 0,
        optionCode: "TRNSP",
      } as any);

      // The fix we are verifying: grandTotal should be 0, NOT the old
      // invented sum. The grandTotal is the ONLY field this test
      // asserts on — the other computed fields (devisAnnuel,
      // totalVersements, totalCreance) are covered by a separate
      // architectural issue documented in software_review.md Section 1
      // (broken inter-rule data flow) which is explicitly out of scope
      // for this iteration.
      assert.strictEqual(
        computed.grandTotal,
        0,
        `grandTotal should be 0 (Excel column AL is empty), got ${computed.grandTotal}`,
      );
    } finally {
      await cleanup();
    }
  },
);

await okAsync(
  "create() persists grandTotal = 0 in the database",
  async () => {
    const { service, cleanup } = await setupService();
    try {
      const entry = await service.create({
        studentName: "GRAND TOTAL TEST",
        fi: 25000,
        v2: 71500,
        altV2: 0,
        v3: 0,
        t1: 30000,
        t2: 15000,
        t3: 10000,
        psy1: 5000,
        ePlant: 2000,
        remise: 0,
        optionCode: "TRNSP",
      } as any);
      assert.strictEqual(
        entry.grandTotal,
        0,
        `grandTotal should be 0 after create(), got ${entry.grandTotal}`,
      );
    } finally {
      await cleanup();
    }
  },
);

// ── Fix #4: septemberBalance soft validation ────────────────────────
await okAsync(
  "create() succeeds when septemberBalance >= 10000 (soft warning, not a thrown error)",
  async () => {
    const { service, cleanup } = await setupService();
    try {
      // The old code threw BusinessRuleError here. The new code logs a
      // warning and lets the save proceed.
      const entry = await service.create({
        studentName: "HIGH SEP BALANCE STUDENT",
        septemberBalance: 15000, // > 10000 — would have thrown before
        remise: 0,
      } as any);
      assert.ok(entry.id, "entry should have been created with an id");
      assert.strictEqual(entry.studentName, "HIGH SEP BALANCE STUDENT");
    } finally {
      await cleanup();
    }
  },
);

await okAsync(
  "create() still throws for genuinely invalid input (empty student name)",
  async () => {
    const { service, cleanup } = await setupService();
    try {
      await assert.rejects(
        async () => service.create({ studentName: "", remise: 0 } as any),
        /NOM \(Student Name\) is required/,
        "expected a ValidationError for empty student name",
      );
    } finally {
      await cleanup();
    }
  },
);

await okAsync(
  "create() still throws for negative remise (hard validation preserved)",
  async () => {
    const { service, cleanup } = await setupService();
    try {
      await assert.rejects(
        async () =>
          service.create({
            studentName: "NEG REMISE",
            remise: -1000,
          } as any),
        /Remise cannot be negative/,
        "expected a ValidationError for negative remise",
      );
    } finally {
      await cleanup();
    }
  },
);

// ── Fix #5: allocatePaymentToLedger no longer caps or auto-splits ──
await okAsync(
  "allocatePaymentToLedger does NOT mutate payment columns (operator decides slot)",
  async () => {
    const { service, db, cleanup } = await setupService();
    try {
      // Insert a real student so the student_id FK on ledger_entries is
      // satisfied (the column is `student_id TEXT REFERENCES students(id)`).
      const testStudentId = await insertTestStudent(db);

      // Create a student ledger entry with zero payments.
      const entry = await service.create({
        studentId: testStudentId,
        studentName: "PAYMENT TEST STUDENT",
        remise: 0,
        fi: 0,
        v2: 0,
        altV2: 0,
        v3: 0,
        t1: 0,
        t2: 0,
        t3: 0,
        optionCode: "TRNSP",
      } as any);

      // Record a payment of 100,000. The OLD code would have capped V2
      // at 71,500 and split the remainder across v3/t1/t2/t3, producing
      // phantom transport payments even though the operator may have
      // intended the full 100,000 to go to V2.
      await service.allocatePaymentToLedger(
        testStudentId,
        100000,
        "RCP-001",
      );

      // After the call, the payment columns should be UNCHANGED —
      // only an audit comment should have been recorded.
      const after = await service.getById(entry.id.value);
      assert.strictEqual(
        after.fi,
        0,
        `fi should still be 0 (no auto-allocation), got ${after.fi}`,
      );
      assert.strictEqual(
        after.v2,
        0,
        `v2 should still be 0 (no auto-allocation), got ${after.v2}`,
      );
      assert.strictEqual(
        after.altV2,
        0,
        `altV2 should still be 0, got ${after.altV2}`,
      );
      assert.strictEqual(
        after.v3,
        0,
        `v3 should still be 0, got ${after.v3}`,
      );
      assert.strictEqual(
        after.t1,
        0,
        `t1 should still be 0 (no phantom transport), got ${after.t1}`,
      );
      assert.strictEqual(
        after.t2,
        0,
        `t2 should still be 0 (no phantom transport), got ${after.t2}`,
      );
      assert.strictEqual(
        after.t3,
        0,
        `t3 should still be 0 (no phantom transport), got ${after.t3}`,
      );

      // But an audit comment SHOULD have been recorded.
      const comments = await service.listAuditComments(entry.id.value);
      assert.ok(
        comments.length > 0,
        "expected at least one audit comment to be recorded",
      );
      const last = comments[comments.length - 1] as any;
      assert.ok(
        String(last.rawText ?? "").includes("100000"),
        `expected audit comment to mention the amount (100000), got: ${last.rawText}`,
      );
      assert.ok(
        String(last.rawText ?? "").includes("RCP-001"),
        `expected audit comment to mention the receipt number (RCP-001), got: ${last.rawText}`,
      );
    } finally {
      await cleanup();
    }
  },
);

console.log(`\n  Integration: ${passed} passed, ${failed} failed`);
console.log("──────────────────────────────────────────────\n");

if (failed > 0) {
  process.exit(1);
}
}

main().catch((err) => {
  console.error("Fatal error in integration test runner:", err);
  process.exit(1);
});
