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

/**
 * A soft validation warning. Excel's data-validation rules on column AG
 * (CREANCES SEPTEMBRE) use `showErrorMessage=False`, which means Excel
 * shows the operator an advisory tooltip but does NOT block the save.
 * The software mirrors that semantics by returning warnings rather than
 * throwing — see issues 6.1 and 6.2 in software_review.md.
 */
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

    // ── Iteration 3 (issues 12 + 14): event-driven recomputation ──
    //
    // When the FeeSchedule changes, every LedgerEntry that uses it
    // must be re-evaluated. The previous version achieved this via a
    // late-injection back-channel:
    //     services.feeSchedule["ledger"] = services.ledger;
    // which bypassed TypeScript's type system and created a hidden
    // circular dependency. We now subscribe to the `feeSchedule.changed`
    // event published by FeeScheduleService.update() and call our own
    // recomputeAll() in response. This is the proper DI pattern — no
    // late injection, no private-property assignment, no circular
    // reference.
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
      // Excel's september-balance rule is `showErrorMessage=False` — soft.
      // Log and continue rather than blocking the save.
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
      // Soft warnings — see create() above and issues 6.1 / 6.2.
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

    // ── Issue 10.4 / #13: filter rules by `condition_expr` ───────────
    //
    // The `FormulaRule.condition` field has existed on the entity since
    // iteration 1 but was never read by any service — it was pure
    // architectural dead weight. We now evaluate it against the row's
    // fields and only keep rules whose condition matches (or whose
    // condition is empty, which means "applies to every row").
    //
    // The condition mini-language is intentionally simple — see
    // `shared/rule-condition.ts` for the supported syntax. Examples:
    //   - `level = "PRIM"`            → only PRIM rows
    //   - `optionCode = "TRNSP"`      → only transport students
    //   - `level = "LYC" AND remise > 0`
    //   - ``                          → applies to every row (default)
    const rules = allRules.filter((rule) => {
      if (!rule.condition || !String(rule.condition).trim()) return true;
      const match = evaluateRuleCondition(rule.condition, ctx.fields);
      if (!match.ok) {
        // Log but do NOT block — a broken condition shouldn't take down
        // the entire calculation pipeline.
        logger.warn("ledger.rule.condition.evalFailed", {
          ruleId: rule.id.value,
          ruleName: rule.name,
          condition: rule.condition,
          error: match.error,
        });
        return true; // treat as "no condition"
      }
      return match.value;
    });

    // ── FATAL FLAW FIX (issue §1 / #1 in software_review.md) ──────────
    //
    // The previous version of this method evaluated each rule against
    // the SAME stale `ctx.fields` dictionary. The TOTAL CREANCE rule
    // (`devisAnnuel - totalVersements`) always returned 0 because
    // neither `devisAnnuel` nor `totalVersements` was written back to
    // the context after being computed.
    //
    // The fix: after each rule evaluation, write the result back to
    // `ctx.fields` so the next rule (in priority order) can read it.
    // This makes the calculation pipeline a real directed acyclic graph:
    //
    //   J (remise) ──┐
    //   constants ───┼──→ L (devisAnnuel) ──┐
    //                │                       ├──→ Q (totalCreance)
    //   R–Y ─────────┼──→ P (totalVersements)┘
    //                │
    //   ── Level-indexed pricing (issues 1.1, 1.2) ──
    //   Level (G) ───┼──→ registration, tuition
    //   Destination ─┼──→ transport (4 tiers — issue 1.3)
    //
    // The fallback paths (the ternary `else` branches) continue to use
    // the local variables so they remain correct when no rule is
    // defined. They also seed `ctx.fields` so any downstream rule can
    // read the computed value.

    const devisRule = rules.find((r) => r.targetField === "devisAnnuel");
    let devisAnnuel: number;

    // ── Issue 1.6 / §2 (iteration 5 / Fix #35): per-row custom formula ──
    //
    // Excel's L column contains hand-typed formulas that vary per row.
    // The starter FormulaRule is global; rows that need a different
    // composition (e.g. dual transport `registration + tuition +
    // transportBase + transportPremium - remise`, or no-transport
    // `registration + tuition - remise`) would otherwise require a
    // separate FormulaRule each.
    //
    // We now honour a per-row `customFormula` string stored on the
    // LedgerEntry itself. When present, it takes precedence over the
    // global `devisRule` for THIS row only — other rows continue to
    // use the rule. The expression uses the same mini-language as
    // FormulaRule (see services/formula/formula-engine.ts) and is
    // evaluated against the same ctx.fields built by
    // buildFormulaContext().
    //
    // The custom formula is clamped to >= 0 (issue 8.3) just like
    // the rule and fallback paths — Excel never displays a negative
    // devis because the operator simply omits components.
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
      // Also write back to ctx so downstream rules can read it.
      ctx.fields.devisAnnuel = devisAnnuel;
    } else if (devisRule) {
      // ── Issue 8.3: clamp devisAnnuel to >= 0 (also for the rule path) ──
      //
      // The rule expression (e.g. `registration + baseTuition +
      // resolvedTransport - remise`) can produce a negative value when
      // `remise` exceeds the sum of components. Excel never displays a
      // negative devis — the operator simply omits components — so we
      // clamp the rule's output at 0 too, not just the fallback path.
      devisAnnuel = Math.max(0, this.evalNumeric(devisRule, ctx));
    } else {
      // Fallback formula — Excel-equivalent per-row composition.
      //
      // Issues addressed by this fallback:
      //   - 1.1: registration is level-indexed via resolveRegistration()
      //   - 1.2: tuition is level-indexed via resolveTuition()
      //   - 1.3: transport uses 4 tiers via resolveTransportAmount()
      //   - 8.4: transport is only added when OPTION=TRNSP AND a
      //          destination is populated. Excel rows with OPTION=TRNSP
      //          but no destination (operator forgot) get NO transport
      //          component — matching the spreadsheet.
      //
      // Issue 1.4 (dual transport — adding BOTH 35k base AND 55k premium
      // for FAR-tier destinations) is intentionally NOT applied by the
      // fallback. The vault evidence (Town List DISTINATION.md) notes
      // that this dual-transport pattern is rare and varies by operator.
      // We expose both `transportBase` and `transportPremium` (plus
      // `transportIntermediate` and `transportMedium`) in `ctx.fields`
      // so a user-defined rule CAN compose a dual-transport formula
      // (e.g. `registration + baseTuition + transportBase + transportPremium - remise`)
      // when the operator's workflow requires it.
      const registration = resolveRegistration(input.level);
      const tuition = resolveTuition(input.level);
      const hasTransportOption = (input.optionCode ?? "").toUpperCase() === "TRNSP";
      const hasDestination = !!(input.destination && String(input.destination).trim());
      const transport = (hasTransportOption && hasDestination)
        ? resolveTransportAmount(input.destination)
        : 0;
      // ── Issue 8.3: clamp devisAnnuel to >= 0 ─────────────────────────
      //
      // Excel rows hand-typed by the operator never produce a negative
      // DEVIS ANNUEL — the operator simply omits components (e.g. a
      // fully-discounted student gets `=0` or a token positive number).
      // The software's composable fallback, however, can go negative when
      // `remise` exceeds the sum of components (e.g. registration=18k +
      // tuition=125k + transport=0 − remise=200k = -57k for a heavily
      // subsidised pre-school student).
      //
      // We clamp at 0 to match the spreadsheet's effective range. The
      // outstanding balance (TOTAL CREANCE) is still computed correctly
      // — a student with devis=0 and payments=0 has creance=0, not a
      // phantom credit. Overpayments are still represented separately
      // (negative creance) when payments exceed devis, which is the
      // Excel behaviour documented in issue 8.2.
      //
      // ── Issue 1.5 (iteration 5 / Fix #34): omitRemise flag ──────────
      //
      // Some Excel rows omit the `-J` term structurally:
      //     L5:  =25000+305000+52000           (no "-J5")
      //     L6:  =25000+205000+35000+52000     (no "-J6")
      // When `input.omitRemise === true`, we mirror that structure:
      // the fallback formula does NOT subtract `remise`, even if a
      // value is present. This protects against silent miscalculation
      // if an operator later types a number into column J by mistake.
      // When `omitRemise` is false / undefined (the default), the
      // formula keeps the `-remise` term — matching rows like
      //     L2:  =25000+205000+35000-J2
      // which is the most common pattern.
      const useRemise = !(input.omitRemise === true);
      const remiseTerm = useRemise ? (input.remise ?? 0) : 0;
      const rawDevis =
        (input.fi ?? registration) +
        tuition +
        transport -
        remiseTerm;
      devisAnnuel = Math.max(0, rawDevis);
      // Write back to ctx for downstream rules (issue §1 fix) and to
      // expose the individual tiers so a user-defined rule can opt
      // into the dual-transport pattern (issue 1.4).
      ctx.fields.registration = registration;
      ctx.fields.baseTuition = tuition;
      ctx.fields.transportBase = (hasTransportOption && hasDestination)
        ? resolveTransportAmount(input.destination)
        : 0;
      ctx.fields.transportPremium = (hasTransportOption && hasDestination)
        ? TRANSPORT_AMOUNT_BY_TIER[TransportTier.FAR]
        : 0;
    }
    // ALWAYS write devisAnnuel back to ctx so TOTAL CREANCE can read it.
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
    // Write totalVersements back to ctx so TOTAL CREANCE can read it.
    ctx.fields.totalVersements = totalVersements;

    const creanceRule = rules.find((r) => r.targetField === "totalCreance");
    const totalCreance = creanceRule
      ? this.evalNumeric(creanceRule, ctx)
      : devisAnnuel - totalVersements;
    // Write totalCreance back to ctx for any downstream rule (e.g. grandTotal).
    ctx.fields.totalCreance = totalCreance;

    // grandTotal is intentionally NOT computed.
    //
    // Background (issues 2.3 and 9.3 in software_review.md): Excel column
    // AL (TOTAL / GRAND TOTAL) is entirely empty in the source workbook —
    // there is no formula to reproduce. The previous version of this file
    // computed `grandTotal = totalVersements + extras + quarterly`, which
    // was an invented calculation. We now persist 0 (the database column
    // is NOT NULL DEFAULT 0) and rely on the upstream caller to compute
    // any aggregate they need via a dedicated report query.
    //
    // If a user explicitly creates a `grandTotal` formula rule, we still
    // honour it for backward compatibility — but we no longer seed one.
    const grandTotalRule = rules.find((r) => r.targetField === "grandTotal");
    const grandTotal = grandTotalRule ? this.evalNumeric(grandTotalRule, ctx) : 0;

    // ── Issue 20: audit trail for calculations ─────────────────────
    //
    // Background (software_review.md issue 20): there was previously no
    // record of which formula was used for which row, or what components
    // composed it. We now emit a `ledger.entry.computed` event every
    // time `computeFields()` runs successfully. The audit-log service
    // already subscribes to ledger.* events; the new event lets the
    // audit trail answer questions like "when was the last time this
    // row's devisAnnuel was re-computed, and which rule produced it?".
    //
    // We deliberately include `ruleSummary` (the names of the rules
    // that fired) so the audit record is self-contained even when the
    // underlying FormulaRule rows are later edited or deleted.
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

  /**
   * Recompute every ledger entry's derived fields.
   *
   * ── Issue 19: scalability ─────────────────────────────────────
   *
   * The previous version loaded every ledger entry into memory in a
   * single shot (`pageSize: 10000`) and then iterated sequentially.
   * For a school with ~390 active students that works, but the
   * architecture was explicitly designed to scale to 10,000 entries
   * (per the design notes in `software_review.md` issue 19), and a
   * single-shot load of that size causes noticeable GC pressure and
   * blocks the event loop for several seconds.
   *
   * We now paginate in fixed-size batches (default 200 rows). Each
   * batch is processed, the computed values are persisted, and only
   * then do we move to the next page. This keeps the working set
   * small, lets the event loop breathe between batches, and produces
   * the same result as the previous implementation.
   *
   * The page size is exposed as a parameter so callers can tune it
   * (e.g. the FeeScheduleService's `feeSchedule.changed` handler uses
   * the default; an admin-triggered bulk recompute could pass a
   * larger value).
   */
  async recomputeAll(
    options: { pageSize?: number } = {},
  ): Promise<{
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

  /**
   * Record a payment against a ledger entry.
   *
   * Excel behaviour reproduced here (issues 4.1 and 9.1 in
   * software_review.md): the source workbook has **no caps** on the
   * individual payment columns (R/S/T/U/W/X/Y). The operator types
   * whatever amount was received into whichever column they choose —
   * a student might pay 100,000 in column S (V2) for a single tranche,
   * or split a payment across tranches manually.
   *
   * The previous version of this method auto-allocated `amount` across
   * the seven payment slots using hardcoded caps (fi=25k, v2=71.5k,
   * altV2=71.5k, v3=71.5k, t1=30k, t2=15k, t3=10k). Those caps only
   * matched Primary-school students and silently corrupted payments for
   * Collège/Lycée students (whose real installments are larger) and for
   * students without transport (who got phantom transport payments).
   *
   * We now **only record an audit-trail comment** (column AM in the
   * source workbook). The caller — typically the UI's payment form or
   * the PaymentService — is responsible for deciding which slot to
   * credit, exactly as the Excel operator does. This matches the
   * spreadsheet workflow and avoids introducing column-level data that
   * doesn't reflect the operator's intent.
   */
  async allocatePaymentToLedger(
    studentId: string,
    amount: number,
    rcp: string,
  ): Promise<void> {
    const entries = await this.ledger.list({ studentId });
    if (entries.length === 0) return;
    const entry = entries[0];

    // Record the audit-trail comment in column-AM format:
    //   amount/day/month/receiptBook
    // This mirrors the Excel workflow where the operator hand-types
    // a comment per payment. We do NOT mutate the payment columns
    // (R–Y) — the operator decides which slot to credit via the UI.
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // 1-indexed month
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

  /**
   * Validate a ledger-entry input.
   *
   * Excel behaviour reproduced here (issues 6.1 and 6.2 in
   * software_review.md):
   *   - Hard errors (ValidationError) are reserved for fields that are
   *     genuinely malformed (negative remise, blank student name). Excel
   *     blocks these too.
   *   - Soft warnings (returned in the `ValidationWarning[]` array) cover
   *     the septemberBalance rule. Excel's validation on `AG1:AG1032` is
   *     configured with `showErrorMessage=False` — i.e. advisory only.
   *     The previous version of this file threw a BusinessRuleError, which
   *     blocked valid computed balances from being persisted. We now log
   *     a warning instead and let the save proceed.
   *   - Column AG itself is empty in the actual workbook, so the rule is
   *     effectively unused — but we keep the soft check for forward
   *     compatibility in case operators start populating it.
   */
  private validateInput(input: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // ── Hard validations ──
    if (input.studentName !== undefined && !String(input.studentName).trim()) {
      throw new ValidationError("NOM (Student Name) is required.");
    }
    if (input.remise !== undefined && input.remise < 0) {
      throw new ValidationError("Remise cannot be negative.");
    }

    // ── Soft validations (advisory, mirror Excel's showErrorMessage=False) ──
    //
    // Issue 6.3 (iteration 4): the previous version only validated
    // `septemberBalance` against the Excel AG-column rule. The Excel
    // workbook does NOT define validations for the December (column AI)
    // or March (column AK) receivable columns, but the software's
    // data model treats them symmetrically — so we surface the same
    // advisory warning for all three terms. The threshold matches
    // Excel's AG-column rule (10,000 DZD) and is informational only —
    // the save always proceeds. This gives operators forward visibility
    // on any term where the unpaid balance is creeping up, without
    // blocking the workflow.
    const advisoryBalanceMax = SEPTEMBER_BALANCE_MAX;
    const checkTermBalance = (
      field: string,
      label: string,
      value: unknown,
    ) => {
      if (value === undefined || value === null) return;
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      if (n >= advisoryBalanceMax) {
        warnings.push({
          field,
          value: n,
          message: `${label} balance (${n}) is at or above the advisory limit of ${advisoryBalanceMax} DZD. Excel's data validation on column AG is configured as showErrorMessage=False (advisory only); the save proceeds. (Issue 6.3: the same advisory is now applied to December and March columns for symmetry.)`,
        });
      }
    };
    checkTermBalance("septemberBalance", "September", input.septemberBalance);
    checkTermBalance("decemberBalance", "December", input.decemberBalance);
    checkTermBalance("marchBalance", "March", input.marchBalance);

    // ── Issue 7.5 (iteration 5 / Fix #37): dead term-tracking advisory ──
    //
    // Excel's columns AF–AK (SEPTEMBRE, CREANCES SEPTEMBRE, DECEMBRE,
    // CREANCES DECEMBRE, MARS, CREANCES MARS) are entirely empty in
    // the source workbook. The software stores values in these
    // columns for forward compatibility but does NOT include them in
    // any computed total (the GRAND TOTAL formula was removed in
    // iteration 1 / Fix #3). When an operator populates one of these
    // fields, we surface an advisory so they know the value is stored
    // but won't affect any computed total unless they create a custom
    // `grandTotal` formula rule that references it.
    const termAdvisories = scanForDeadTermTrackingValues(input as Record<string, unknown>);
    for (const adv of termAdvisories) {
      warnings.push({
        field: adv.field,
        value: adv.value,
        message: adv.message,
      });
    }

    // ── Issue 8.10 (iteration 5 / Fix #38): E-PLANT validation ────
    //
    // The E-PLANT column (Excel col AD) is the school's digital-platform
    // access fee. The previous software treated it as a generic numeric
    // field with no validation. We now surface an advisory when the
    // amount is outside the typical range (0–10,000 DZD) or negative.
    // The save is NOT blocked — the operator may have a legitimate
    // reason for an unusual value (specialised programme, refund, etc.).
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

    // ── Issue 4.3: transport tranche mismatch advisory ─────────────
    //
    // When the student has OPTION=TRNSP and a destination town, the
    // expected (T1, T2, T3) split comes from the documented tier
    // breakdown in `shared/pricing.ts`. If the operator typed amounts
    // that don't match (e.g. T1=30k for a NEARBY-tier town whose
    // documented T1 is 20k), we surface an advisory warning. The save
    // is NOT blocked — the operator may have negotiated a custom plan.
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
        if (t1 > 0 && t1 !== expected.t1) mismatchParts.push(`T1=${t1} (expected ${expected.t1})`);
        if (t2 > 0 && t2 !== expected.t2) mismatchParts.push(`T2=${t2} (expected ${expected.t2})`);
        if (t3 > 0 && t3 !== expected.t3) mismatchParts.push(`T3=${t3} (expected ${expected.t3})`);
        if (mismatchParts.length > 0) {
          warnings.push({
            field: "transportTranches",
            value: { t1, t2, t3, expected },
            message:
              `Issue 4.3: transport tranches for destination "${input.destination}" ` +
              `(tier: ${expected.tier}) don't match the documented breakdown: ` +
              mismatchParts.join(", ") +
              `. Total expected: ${expected.total} DZD. The save proceeds — ` +
              `the operator may have negotiated a custom payment plan.`,
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
    // ── Issue §17 (context missing metadata) ──────────────────────────
    //
    // The previous version of this method only injected numeric fields
    // into `ctx.fields`. Formula rules could not reference `optionCode`,
    // `level`, `classCode`, or `destination` — even though these strings
    // are exactly what the Excel operator uses to decide which formula
    // components to include. We now inject them as strings, so a rule
    // like `IF(optionCode = "TRNSP", registration + tuition + transport,
    // registration + tuition) - remise` becomes possible.
    const fields: Record<string, unknown> = {
      // Numeric payment / discount columns (unchanged)
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

      // ── NEW (issue §17): row metadata, so formulas can branch on it ──
      optionCode: input.optionCode ?? "",
      level: input.level ?? "",
      classCode: input.classCode ?? "",
      destination: input.destination ?? "",
      hasTransport:
        (input.optionCode ?? "").toUpperCase() === "TRNSP" &&
        !!(input.destination && String(input.destination).trim()),

      // ── Issue 1.5 (iteration 5): expose omitRemise to user rules ──
      //
      // User-defined formula rules need to be able to branch on
      // whether the spreadsheet row structurally subtracts remise.
      // We expose the flag as both a boolean (1/0 for the formula
      // engine's numeric comparisons) and as the underlying remise
      // amount so a rule can write `IF(omitRemise = 1, registration
      // + tuition, registration + tuition - remise)`.
      omitRemise: input.omitRemise === true ? 1 : 0,
      effectiveRemise:
        input.omitRemise === true ? 0 : (input.remise ?? 0),
    };

    const lines: FeeScheduleLine[] = schedule?.lines ?? [];
    const findLine = (type: string) =>
      lines.find((l) => l.type === type)?.amount ?? 0;

    // ── Issues 1.1, 1.2: level-indexed pricing ────────────────────────
    //
    // When the active FeeSchedule has explicit `registration` and
    // `tuition` lines, we honour them (operators may have configured
    // a custom schedule). Otherwise we fall back to the level-indexed
    // lookups from `shared/pricing.ts`, which use the canonical
    // Excel values (18k for MS/GS, 25k for PRIM, 30k for COLG/LYC, etc.).
    fields.registration =
      findLine("registration") || resolveRegistration(input.level);
    fields.baseTuition =
      findLine("tuition") || resolveTuition(input.level);

    // ── Issue 1.3: all 4 transport tiers are now exposed ──────────────
    //
    // The previous version only exposed `transportBase` (35k) and
    // `transportPremium` (55k). We now also expose `transportIntermediate`
    // (43k) and `transportMedium` (52k), so formulas can reference any
    // of the 4 documented tiers.
    fields.transportBase = findLine("transport_base") || 35000;
    fields.transportIntermediate = findLine("transport_intermediate") || 43000;
    fields.transportMedium = findLine("transport_medium") || 52000;
    fields.transportPremium = findLine("transport_premium") || 55000;

    // ── Issue 1.3 + 8.4: resolved transport amount for this row ──────
    //
    // `resolvedTransport` is the destination-appropriate transport
    // amount, or 0 when the student has no transport. Formulas that
    // want "whatever transport applies to THIS row" can reference
    // this single field instead of branching on `destination`.
    fields.resolvedTransport = (input.optionCode ?? "").toUpperCase() === "TRNSP"
      ? resolveTransportAmount(input.destination)
      : 0;

    // ── Iteration 6 / Fix #43 (issue 10.2 / item 18): populate ctx.ranges ──
    //
    // The formula engine supports `VLOOKUP`, `INDEX`, and `MATCH`
    // against named ranges in `ctx.ranges`. Before this fix, the
    // ranges dictionary was never populated — so any rule that used
    // `VLOOKUP(level, LEVEL_PRICING, 4, 0)` returned `#N/A` because
    // the engine found no range named `LEVEL_PRICING`.
    //
    // We now inject the three canonical lookup ranges built from the
    // same pricing tables that drive the fallback formula:
    //   - LEVEL_PRICING     (level → registration + tuition + subtotal)
    //   - TRANSPORT_PRICES  (tier  → amount + T1 + T2 + T3)
    //   - LEVEL_CODES       (level → label)
    //
    // The ranges are pure data (no DB lookup) so they're cheap to
    // rebuild on every compute. If a future rule needs a range that
    // reflects operator-edited FeeSchedule amounts, that range can
    // be added here alongside the canonical ones.
    const ranges = buildFormulaLookupRanges();

    return { fields, ranges };
  }

  private evalNumeric(
    rule: any,
    ctx: { fields: Record<string, unknown>; ranges?: Record<string, Array<Record<string, unknown>>> },
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
