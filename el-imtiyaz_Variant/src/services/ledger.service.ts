import {
  LedgerRepository,
  LedgerQuery,
} from "../infrastructure/repositories/ledger-entry.repository";
import { FeeScheduleRepository } from "../infrastructure/repositories/fee-schedule.repository";
import { FormulaRuleRepository } from "../infrastructure/repositories/formula-rule.repository";
import { PaymentAuditCommentRepository } from "../infrastructure/repositories/payment-audit-comment.repository";
import type {
  LedgerEntry,
  CreateLedgerEntryInput,
  UpdateLedgerEntryInput,
} from "../core/entities/ledger-entry.entity";
import type {
  FeeSchedule,
  FeeScheduleLine,
} from "../core/entities/fee-schedule.entity";
import type { IEventBus } from "../core/interfaces/event-bus.interface";
import { SEPTEMBER_BALANCE_MAX } from "../core/enums";
import {
  ValidationError,
  NotFoundError,
  BusinessRuleError,
} from "../infrastructure/error/app-error";
import { logger } from "../infrastructure/logger/logger";
import { safeEvaluate } from "./formula/formula-engine";
import {
  resolveRegistration,
  resolveTuition,
  resolveTransportAmount,
  resolveTransportTier,
  resolveTransportInstallments,
  TRANSPORT_AMOUNT_BY_TIER,
  TransportTier,
} from "../shared/pricing";
import { evaluateRuleCondition } from "../shared/rule-condition";
import { scanForDeadTermTrackingValues } from "../shared/term-tracking";
import { validateEPlantAmount } from "../shared/e-plant";
import { buildFormulaLookupRanges } from "../shared/formula-lookup-ranges";

export interface ValidationWarning {
  field: string;
  message: string;
  value: unknown;
}

export interface LedgerSummary {
  totalEntries: number;
  totalDevisAnnuel: number;
  totalVersements: number;
  totalCreance: number;
  totalGrandTotal: number;
  byClass: Array<{ classCode: string; count: number; creance: number }>;
  byLevel: Array<{ level: string; count: number; creance: number }>;
}

export class LedgerService {
  readonly serviceName = "LedgerService";

  constructor(
    private readonly ledger: LedgerRepository,
    private readonly feeSchedules: FeeScheduleRepository,
    private readonly formulaRules: FormulaRuleRepository,
    private readonly auditComments: PaymentAuditCommentRepository,
    private readonly eventBus: IEventBus,
  ) {
    this.registerEventSubscriptions();
  }

  private registerEventSubscriptions(): void {
    this.eventBus.subscribe("payment.recorded", async (event) => {
      const payment = event.payload as any;
      if (payment && payment.studentId) {
        await this.allocatePaymentToLedger(
          payment.studentId,
          payment.amount,
          payment.receiptNumber,
        );
      }
    });

    this.eventBus.subscribe("feeSchedule.changed", async (_event) => {
      logger.info("ledger.recompute.triggered", {
        source: "feeSchedule.changed",
      });
      try {
        await this.recomputeAll();
      } catch (err) {
        logger.error("ledger.recompute.failed", {
          source: "feeSchedule.changed",
          error: (err as Error).message,
        });
      }
    });

    // Real-time synchronization when a Student record is created
    this.eventBus.subscribe("student.created", async (event) => {
      const student = event.payload as any;
      if (student) {
        logger.info("ledger.sync.student.created", { studentId: student.id });
        try {
          await this.create({
            studentId: student.id,
            studentName: student.fullName,
            phoneNumbers: student.phoneNumbers?.join("/") || "",
            level: "PRIM", // Default fallback level
            classCode: "CP",
            omitRemise: false,
          });
        } catch (err) {
          logger.error("ledger.sync.student.failed", {
            error: (err as Error).message,
          });
        }
      }
    });

    // Real-time synchronization when a Student record is updated
    this.eventBus.subscribe("student.updated", async (event) => {
      const student = event.payload.after as any;
      if (student) {
        try {
          const existing = await this.ledger.list({
            studentId: student.id.value || student.id,
          });
          if (existing.length > 0) {
            await this.ledger.update(existing[0].id.value, {
              studentName: student.fullName,
              phoneNumbers: student.phoneNumbers?.join("/") || "",
            });
          }
        } catch (err) {
          logger.error("ledger.sync.student.update.failed", {
            error: (err as Error).message,
          });
        }
      }
    });
  }

  async list(query: LedgerQuery = {}): Promise<LedgerEntry[]> {
    return this.ledger.list(query);
  }

  async getById(id: string): Promise<LedgerEntry> {
    const entry = await this.ledger.findById(id);
    if (!entry) throw new NotFoundError("LedgerEntry", id);
    return entry;
  }

  async getByStudent(studentId: string): Promise<LedgerEntry[]> {
    return this.ledger.list({ studentId });
  }

  async create(input: CreateLedgerEntryInput): Promise<LedgerEntry> {
    const warnings = this.validateInput(input);
    if (warnings.length > 0) {
      logger.warn("ledger.entry.validationWarnings", {
        studentName: input.studentName,
        warnings,
      });
    }
    const computed = await this.computeFields(input);
    const entry = await this.ledger.create({ ...input, ...computed });

    await this.eventBus.publish("ledger.entry.created", {
      entityId: entry.id.value,
      entityType: "LedgerEntry",
      after: entry,
      actor: { actorId: "system", actorName: "System" },
    });

    logger.info("ledger.entry.created", {
      id: entry.id.value,
      studentName: entry.studentName,
    });
    return entry;
  }

  async update(
    id: string,
    patch: UpdateLedgerEntryInput,
  ): Promise<LedgerEntry> {
    const before = await this.getById(id);
    const warnings = this.validateInput({ ...before, ...patch });
    if (warnings.length > 0) {
      logger.warn("ledger.entry.validationWarnings", {
        id,
        warnings,
      });
    }

    const merged = { ...before, ...patch } as CreateLedgerEntryInput;
    const computed = await this.computeFields(merged);
    const updated = await this.ledger.update(id, { ...patch, ...computed });

    await this.eventBus.publish("ledger.entry.updated", {
      entityId: id,
      entityType: "LedgerEntry",
      before,
      after: updated,
      actor: { actorId: "system", actorName: "System" },
    });

    return updated;
  }

  async delete(id: string): Promise<void> {
    const before = await this.getById(id);
    await this.ledger.delete(id);
    await this.eventBus.publish("ledger.entry.deleted", {
      entityId: id,
      entityType: "LedgerEntry",
      before,
      actor: { actorId: "system", actorName: "System" },
    });
  }

  async computeFields(
    input: CreateLedgerEntryInput,
  ): Promise<Partial<LedgerEntry>> {
    const schedule = await this.feeSchedules.findActive();
    const ctx = this.buildFormulaContext(input, schedule);
    const allRules = await this.formulaRules.list({
      scope: "ledger",
      isActive: true,
    });
    allRules.sort((a, b) => a.priority - b.priority);

    const rules = allRules.filter((rule) => {
      if (!rule.condition || !String(rule.condition).trim()) return true;
      const match = evaluateRuleCondition(rule.condition, ctx.fields);
      if (!match.ok) {
        logger.warn("ledger.rule.condition.evalFailed", {
          ruleId: rule.id.value,
          ruleName: rule.name,
          condition: rule.condition,
          error: match.error,
        });
        return true;
      }
      return match.value;
    });

    const devisRule = rules.find((r) => r.targetField === "devisAnnuel");
    let devisAnnuel: number;

    const customFormula =
      (input as CreateLedgerEntryInput).customFormula &&
      String((input as CreateLedgerEntryInput).customFormula).trim()
        ? String((input as CreateLedgerEntryInput).customFormula).trim()
        : null;

    if (customFormula) {
      const customResult = safeEvaluate(
        customFormula,
        ctx,
        "ledger.customFormula",
      );
      const customValue = customResult.ok
        ? typeof customResult.value === "number"
          ? customResult.value
          : Number(customResult.value) || 0
        : 0;
      if (!customResult.ok) {
        logger.warn("ledger.customFormula.evalFailed", {
          studentName: input.studentName,
          customFormula,
          error: (customResult as { error: string }).error,
        });
      }
      devisAnnuel = Math.max(0, customValue);
      ctx.fields.devisAnnuel = devisAnnuel;
    } else if (devisRule) {
      devisAnnuel = Math.max(0, this.evalNumeric(devisRule, ctx));
    } else {
      const registration = resolveRegistration(input.level);
      const tuition = resolveTuition(input.level);
      const hasTransportOption =
        (input.optionCode ?? "").toUpperCase() === "TRNSP";
      const hasDestination = !!(
        input.destination && String(input.destination).trim()
      );
      const transport =
        hasTransportOption && hasDestination
          ? resolveTransportAmount(input.destination)
          : 0;
      const useRemise = !(input.omitRemise === true);
      const remiseTerm = useRemise ? (input.remise ?? 0) : 0;
      const rawDevis =
        (input.fi ?? registration) + tuition + transport - remiseTerm;
      devisAnnuel = Math.max(0, rawDevis);
      ctx.fields.registration = registration;
      ctx.fields.baseTuition = tuition;
      ctx.fields.transportBase =
        hasTransportOption && hasDestination
          ? resolveTransportAmount(input.destination)
          : 0;
      ctx.fields.transportPremium =
        hasTransportOption && hasDestination
          ? TRANSPORT_AMOUNT_BY_TIER[TransportTier.FAR]
          : 0;
    }
    ctx.fields.devisAnnuel = devisAnnuel;

    const versementsRule = rules.find(
      (r) => r.targetField === "totalVersements",
    );
    const totalVersements = versementsRule
      ? this.evalNumeric(versementsRule, ctx)
      : (input.fi ?? 0) +
        (input.v2 ?? 0) +
        (input.altV2 ?? 0) +
        (input.v3 ?? 0) +
        (input.t1 ?? 0) +
        (input.t2 ?? 0) +
        (input.t3 ?? 0);
    ctx.fields.totalVersements = totalVersements;

    const creanceRule = rules.find((r) => r.targetField === "totalCreance");
    const totalCreance = creanceRule
      ? this.evalNumeric(creanceRule, ctx)
      : devisAnnuel - totalVersements;
    ctx.fields.totalCreance = totalCreance;

    const grandTotalRule = rules.find((r) => r.targetField === "grandTotal");
    const grandTotal = grandTotalRule
      ? this.evalNumeric(grandTotalRule, ctx)
      : 0;

    const ruleSummary = rules.map((r) => ({
      id: r.id.value,
      name: r.name,
      targetField: r.targetField,
      priority: r.priority,
      hadCondition: !!(r.condition && String(r.condition).trim()),
    }));
    await this.eventBus.publish("ledger.entry.computed", {
      entityId: "(input)",
      entityType: "LedgerEntry",
      after: { devisAnnuel, totalVersements, totalCreance, grandTotal },
      actor: { actorId: "system", actorName: "LedgerService.computeFields" },
      metadata: {
        studentName: input.studentName,
        level: input.level,
        optionCode: input.optionCode,
        destination: input.destination,
        ruleCount: rules.length,
        rules: ruleSummary,
      },
    });

    return { devisAnnuel, totalVersements, totalCreance, grandTotal };
  }

  async recomputeAll(options: { pageSize?: number } = {}): Promise<{
    recomputed: number;
    skipped: number;
    errors: any[];
  }> {
    const pageSize = Math.max(1, Math.min(1000, options.pageSize ?? 200));
    let recomputed = 0;
    let skipped = 0;
    const errors: any[] = [];
    let page = 1;
    let batch: LedgerEntry[] = [];
    do {
      batch = await this.ledger.list({ page, pageSize });
      if (batch.length === 0) break;
      for (const entry of batch) {
        try {
          const computed = await this.computeFields(entry);
          await this.ledger.update(entry.id.value, computed);
          recomputed++;
        } catch (err) {
          skipped++;
          errors.push({ id: entry.id.value, error: (err as Error).message });
        }
      }
      page++;
    } while (batch.length === pageSize);
    return { recomputed, skipped, errors };
  }

  async allocatePaymentToLedger(
    studentId: string,
    amount: number,
    rcp: string,
  ): Promise<void> {
    const entries = await this.ledger.list({ studentId });
    if (entries.length === 0) return;
    const entry = entries[0];

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const rawText = `${amount}/${day}/${month} ${rcp}`;

    await this.auditComments.create({
      ledgerEntryId: entry.id.value,
      studentId,
      rawText,
    });

    logger.info("ledger.payment.auditRecorded", {
      ledgerEntryId: entry.id.value,
      studentId,
      amount,
      rcp,
    });
  }

  async getSummary(): Promise<LedgerSummary> {
    const entries = await this.ledger.list({ pageSize: 10000 });
    const byClassMap = new Map<string, { count: number; creance: number }>();
    const byLevelMap = new Map<string, { count: number; creance: number }>();
    let totalDevisAnnuel = 0,
      totalVersements = 0,
      totalCreance = 0,
      totalGrandTotal = 0;

    for (const e of entries) {
      totalDevisAnnuel += e.devisAnnuel;
      totalVersements += e.totalVersements;
      totalCreance += e.totalCreance;
      totalGrandTotal += e.grandTotal;

      const ck = e.classCode ?? "(unassigned)";
      const lk = e.level ?? "(unassigned)";
      const c = byClassMap.get(ck) ?? { count: 0, creance: 0 };
      const l = byLevelMap.get(lk) ?? { count: 0, creance: 0 };

      byClassMap.set(ck, {
        count: c.count + 1,
        creance: c.creance + e.totalCreance,
      });
      byLevelMap.set(lk, {
        count: l.count + 1,
        creance: l.creance + e.totalCreance,
      });
    }

    return {
      totalEntries: entries.length,
      totalDevisAnnuel,
      totalVersements,
      totalCreance,
      totalGrandTotal,
      byClass: Array.from(byClassMap.entries()).map(([classCode, v]) => ({
        classCode,
        ...v,
      })),
      byLevel: Array.from(byLevelMap.entries()).map(([level, v]) => ({
        level,
        ...v,
      })),
    };
  }

  async listAuditComments(ledgerEntryId: string): Promise<any[]> {
    return this.auditComments.list({ ledgerEntryId });
  }

  async addAuditComment(input: {
    ledgerEntryId: string;
    rawText: string;
    studentId?: string;
    paymentId?: string;
    excelCell?: string;
    sourceRow?: number;
  }): Promise<any> {
    return this.auditComments.create(input);
  }

  private validateInput(input: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (input.studentName !== undefined && !String(input.studentName).trim()) {
      throw new ValidationError("NOM (Student Name) is required.");
    }
    if (input.remise !== undefined && input.remise < 0) {
      throw new ValidationError("Remise cannot be negative.");
    }

    const advisoryBalanceMax = SEPTEMBER_BALANCE_MAX;
    const checkTermBalance = (field: string, label: string, value: unknown) => {
      if (value === undefined || value === null) return;
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      if (n >= advisoryBalanceMax) {
        warnings.push({
          field,
          value: n,
          message: `${label} balance (${n}) is at or above the advisory limit of ${advisoryBalanceMax} DZD.`,
        });
      }
    };
    checkTermBalance("septemberBalance", "September", input.septemberBalance);
    checkTermBalance("decemberBalance", "December", input.decemberBalance);
    checkTermBalance("marchBalance", "March", input.marchBalance);

    const termAdvisories = scanForDeadTermTrackingValues(
      input as Record<string, unknown>,
    );
    for (const adv of termAdvisories) {
      warnings.push({
        field: adv.field,
        value: adv.value,
        message: adv.message,
      });
    }

    if (input.ePlant !== undefined && input.ePlant !== null) {
      const ePlantCheck = validateEPlantAmount(input.ePlant);
      if (!ePlantCheck.ok) {
        warnings.push({
          field: "ePlant",
          value: ePlantCheck.value,
          message: `Issue 8.10: ${ePlantCheck.message}`,
        });
      }
    }

    if (
      (input.optionCode ?? "").toUpperCase() === "TRNSP" &&
      input.destination &&
      String(input.destination).trim()
    ) {
      const expected = resolveTransportInstallments(input.destination);
      if (expected) {
        const t1 = Number(input.t1 ?? 0);
        const t2 = Number(input.t2 ?? 0);
        const t3 = Number(input.t3 ?? 0);
        const mismatchParts: string[] = [];
        if (t1 > 0 && t1 !== expected.t1)
          mismatchParts.push(`T1=${t1} (expected ${expected.t1})`);
        if (t2 > 0 && t2 !== expected.t2)
          mismatchParts.push(`T2=${t2} (expected ${expected.t2})`);
        if (t3 > 0 && t3 !== expected.t3)
          mismatchParts.push(`T3=${t3} (expected ${expected.t3})`);
        if (mismatchParts.length > 0) {
          warnings.push({
            field: "transportTranches",
            value: { t1, t2, t3, expected },
            message:
              `Issue 4.3: transport tranches for destination "${input.destination}" ` +
              `(tier: ${expected.tier}) don't match the documented breakdown: ` +
              mismatchParts.join(", ") +
              `. Total expected: ${expected.total} DZD.`,
          });
        }
      }
    }

    return warnings;
  }

  private buildFormulaContext(
    input: CreateLedgerEntryInput,
    schedule: FeeSchedule | null,
  ) {
    const fields: Record<string, unknown> = {
      remise: input.remise ?? 0,
      fi: input.fi ?? 0,
      v2: input.v2 ?? 0,
      altV2: input.altV2 ?? 0,
      v3: input.v3 ?? 0,
      t1: input.t1 ?? 0,
      t2: input.t2 ?? 0,
      t3: input.t3 ?? 0,
      psy1: input.psy1 ?? 0,
      psy2: input.psy2 ?? 0,
      orth1: input.orth1 ?? 0,
      orth2: input.orth2 ?? 0,
      ePlant: input.ePlant ?? 0,
      ratrapage: input.ratrapage ?? 0,
      september: input.september ?? 0,
      december: input.december ?? 0,
      march: input.march ?? 0,
      reimbursement: input.reimbursement ?? 0,
      priorDebt: input.priorDebt ?? 0,
      debtSettlement: input.debtSettlement ?? 0,

      optionCode: input.optionCode ?? "",
      level: input.level ?? "",
      classCode: input.classCode ?? "",
      destination: input.destination ?? "",
      hasTransport:
        (input.optionCode ?? "").toUpperCase() === "TRNSP" &&
        !!(input.destination && String(input.destination).trim()),

      omitRemise: input.omitRemise === true ? 1 : 0,
      effectiveRemise: input.omitRemise === true ? 0 : (input.remise ?? 0),
    };

    const lines: FeeScheduleLine[] = schedule?.lines ?? [];
    const findLine = (type: string) =>
      lines.find((l) => l.type === type)?.amount ?? 0;

    fields.registration =
      findLine("registration") || resolveRegistration(input.level);
    fields.baseTuition = findLine("tuition") || resolveTuition(input.level);

    fields.transportBase = findLine("transport_base") || 35000;
    fields.transportIntermediate = findLine("transport_intermediate") || 43000;
    fields.transportMedium = findLine("transport_medium") || 52000;
    fields.transportPremium = findLine("transport_premium") || 55000;

    fields.resolvedTransport =
      (input.optionCode ?? "").toUpperCase() === "TRNSP"
        ? resolveTransportAmount(input.destination)
        : 0;

    const ranges = buildFormulaLookupRanges();

    return { fields, ranges };
  }

  private evalNumeric(
    rule: any,
    ctx: {
      fields: Record<string, unknown>;
      ranges?: Record<string, Array<Record<string, unknown>>>;
    },
  ): number {
    const result = safeEvaluate(
      rule.expression,
      ctx,
      `ledger.rule.${rule.name}`,
    );
    return result.ok
      ? typeof result.value === "number"
        ? result.value
        : Number(result.value) || 0
      : 0;
  }
}
