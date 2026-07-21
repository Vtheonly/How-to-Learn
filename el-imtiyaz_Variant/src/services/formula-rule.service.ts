/**
 * Formula Rule Service — manages user-defined calculation rules.
 *
 * Rules are persisted in the `formula_rules` table. Each rule has:
 *   - An expression in our safe mini-language (see FormulaEngine)
 *   - A scope (ledger | quote | student | global)
 *   - A target field (where the result is written back)
 *   - A trigger (manual | on_field_change | on_save | on_workflow)
 *
 * This service exposes CRUD + a "test" endpoint that evaluates an
 * expression against a sample context and returns the result without
 * persisting — useful for the formula editor's live preview.
 */

import { FormulaRuleRepository, FormulaRuleQuery } from "../infrastructure/repositories/formula-rule.repository";
import type {
  FormulaRule,
  CreateFormulaRuleInput,
  UpdateFormulaRuleInput,
} from "../core/entities/formula-rule.entity";
import {
  validate,
  evaluate,
  safeEvaluate,
  extractFieldRefs,
  FormulaSyntaxError,
} from "./formula/formula-engine";
import { NotFoundError, ValidationError } from "../infrastructure/error/app-error";
import { logger } from "../infrastructure/logger/logger";

export interface FormulaTestResult {
  ok: boolean;
  value?: unknown;
  error?: string;
  durationMs?: number;
  fieldRefs?: string[];
}

export class FormulaRuleService {
  readonly serviceName = "FormulaRuleService";

  constructor(private readonly rules: FormulaRuleRepository) {}

  async list(query: FormulaRuleQuery = {}): Promise<FormulaRule[]> {
    return this.rules.list(query);
  }

  async getById(id: string): Promise<FormulaRule> {
    const r = await this.rules.findById(id);
    if (!r) throw new NotFoundError("FormulaRule", id);
    return r;
  }

  async create(input: CreateFormulaRuleInput): Promise<FormulaRule> {
    if (!input.name?.trim()) throw new ValidationError("Rule name is required");
    if (!input.expression?.trim()) throw new ValidationError("Expression is required");

    // Validate syntax before persisting.
    const validation = validate(input.expression);
    if (!validation.ok) {
      throw new ValidationError(`Formula syntax error: ${(validation as { error: string }).error}`);
    }
    // (narrowing helper for strict-mode off)

    // Auto-populate watchedFields from the AST if not supplied.
    let watchedFields = input.watchedFields;
    if (!watchedFields || watchedFields.length === 0) {
      try {
        const { ast } = evaluate(input.expression, { fields: {} });
        watchedFields = extractFieldRefs(ast);
      } catch {
        watchedFields = [];
      }
    }

    const rule = await this.rules.create({ ...input, watchedFields });

    logger.info("formulaRule.created", {
      id: rule.id.value,
      name: rule.name,
      scope: rule.scope,
      targetField: rule.targetField,
      watchedFields: rule.watchedFields,
    });

    return rule;
  }

  async update(id: string, patch: UpdateFormulaRuleInput): Promise<FormulaRule> {
    const before = await this.getById(id);

    if (patch.expression !== undefined && patch.expression !== before.expression) {
      const validation = validate(patch.expression);
      if (!validation.ok) {
        throw new ValidationError(`Formula syntax error: ${(validation as { error: string }).error}`);
      }
      // Re-extract watched fields if expression changed and the caller
      // did not explicitly pass a new watchedFields list.
      if (patch.watchedFields === undefined) {
        try {
          const { ast } = evaluate(patch.expression, { fields: {} });
          patch.watchedFields = extractFieldRefs(ast);
        } catch {
          patch.watchedFields = before.watchedFields;
        }
      }
    }

    return this.rules.update(id, patch);
  }

  async delete(id: string): Promise<void> {
    await this.rules.delete(id);
    logger.info("formulaRule.deleted", { id });
  }

  /**
   * Test an expression against a sample context WITHOUT persisting.
   * Returns the evaluated value, the AST-extracted field references,
   * and any error message. Used by the formula editor's live preview.
   */
  async test(
    expression: string,
    sampleContext: { fields: Record<string, unknown>; ranges?: Record<string, Array<Record<string, unknown>>> }
  ): Promise<FormulaTestResult> {
    const validation = validate(expression);
    if (!validation.ok) {
      return { ok: false, error: (validation as { error: string }).error, fieldRefs: [] };
    }

    let fieldRefs: string[] = [];
    try {
      const { ast } = evaluate(expression, { fields: {} });
      fieldRefs = extractFieldRefs(ast);
    } catch (err) {
      // ignore — validation already passed
    }

    const result = safeEvaluate(expression, sampleContext, "formulaRule.test");
    if (!result.ok) {
      const err = (result as { error: string }).error;
      return { ok: false, error: err, fieldRefs };
    }
    return {
      ok: true,
      value: result.value,
      durationMs: result.durationMs,
      fieldRefs,
    };
  }

  /**
   * Evaluate a single rule against a context and record the outcome
   * on the rule (for debugging UI).
   */
  async evaluateAndRecord(
    ruleId: string,
    ctx: { fields: Record<string, unknown>; ranges?: Record<string, Array<Record<string, unknown>>> }
  ): Promise<FormulaTestResult> {
    const rule = await this.getById(ruleId);
    const result = safeEvaluate(rule.expression, ctx, `formulaRule.eval.${rule.name}`);
    if (!result.ok) {
      const err = (result as { error: string }).error;
      await this.rules.recordEvaluation(ruleId, { value: null, error: err });
      return { ok: false, error: err };
    }
    await this.rules.recordEvaluation(ruleId, { value: result.value });
    return { ok: true, value: result.value, durationMs: result.durationMs };
  }
}

/**
 * Get a list of "starter" formula rules that reproduce the Excel
 * workbook's built-in formulas. Used to seed the formula library
 * on first run.
 *
 * Iteration 2 changes (issues 1.1, 1.2, 1.3, 1.4, 8.4, §17):
 *   - The DEVIS ANNUEL starter rule now uses `resolvedTransport` — a
 *     single field that exposes the destination-appropriate transport
 *     amount (one of 35k / 43k / 52k / 55k) or 0 when the student has
 *     no transport. This replaces the old `transportBase` reference,
 *     which always returned 35k regardless of the student's town.
 *   - The starter rule also takes advantage of the level-indexed
 *     `registration` and `baseTuition` fields, which are now resolved
 *     from the student's `level` (column G) when no custom FeeSchedule
 *     line is configured.
 *   - The TOTAL CREANCE rule continues to reference `devisAnnuel` and
 *     `totalVersements` — the §1 FATAL-flaw fix in LedgerService now
 *     writes those intermediate values back to the context, so the
 *     rule actually computes the correct balance.
 */
export function getStarterFormulaRules(): Array<Omit<CreateFormulaRuleInput, "id">> {
  return [
    {
      name: "DEVIS ANNUEL",
      description:
        "Reproduces Excel column L: registration + tuition + transport − discount. " +
        "Iteration 2: registration and tuition are level-indexed (issues 1.1, 1.2); " +
        "transport is destination-indexed across 4 tiers (issues 1.3, 1.4, 8.4).",
      expression: "registration + baseTuition + resolvedTransport - remise",
      scope: "ledger",
      targetField: "devisAnnuel",
      trigger: "on_save",
      watchedFields: [
        "remise",
        "registration",
        "baseTuition",
        "resolvedTransport",
        "level",
        "optionCode",
        "destination",
      ],
      isActive: true,
      priority: 10,
    },
    {
      name: "TOTAL VERSEMENTS",
      description: "Reproduces Excel column P: sum of all 7 payment installments",
      expression: "fi + v2 + altV2 + v3 + t1 + t2 + t3",
      scope: "ledger",
      targetField: "totalVersements",
      trigger: "on_save",
      watchedFields: ["fi", "v2", "altV2", "v3", "t1", "t2", "t3"],
      isActive: true,
      priority: 20,
    },
    {
      name: "TOTAL CREANCE",
      description: "Reproduces Excel column Q: devis_annuel − total_versements (balance owed)",
      expression: "devisAnnuel - totalVersements",
      scope: "ledger",
      targetField: "totalCreance",
      trigger: "on_save",
      watchedFields: ["devisAnnuel", "totalVersements"],
      isActive: true,
      priority: 30,
    },
    // NOTE: There is intentionally NO "GRAND TOTAL" starter rule.
    // Excel column AL (TOTAL) is entirely empty in the source workbook —
    // there is no real formula to reproduce. The previous version of this
    // file seeded a `grandTotal` rule (sum of totalVersements + extras +
    // quarterly), but that was an invented calculation that does not exist
    // in the spreadsheet and produced misleading values. See issues 2.3
    // and 9.3 in software_review.md.
    {
      name: "Quote Sub-Total",
      description: "Reproduces Excel Devis I27: =SUM(I15:I26)",
      expression: "SUM(lineItems.lineTotal)",
      scope: "quote",
      targetField: "subTotal",
      trigger: "on_save",
      watchedFields: ["lineItems.lineTotal"],
      isActive: true,
      priority: 10,
    },
    {
      name: "Quote Net Payable",
      description: "Reproduces Excel Devis I31: =I27 - I29 - I30",
      expression: "subTotal - advances - discounts",
      scope: "quote",
      targetField: "netPayable",
      trigger: "on_save",
      watchedFields: ["subTotal", "advances", "discounts"],
      isActive: true,
      priority: 20,
    },
    {
      name: "Quote 5% Tax on School Fees",
      description: "Reproduces Excel Devis D35: =SUM(F15:F26) * 0.05",
      expression: "SUM(lineItems.fraisScolaireAmount) * 0.05",
      scope: "quote",
      targetField: "schoolFeeTax",
      trigger: "on_save",
      watchedFields: ["lineItems.fraisScolaireAmount"],
      isActive: true,
      priority: 30,
    },
  ];
}
