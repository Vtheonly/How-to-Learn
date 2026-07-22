/**
 * Validation rules registry — a registry of soft-validation rules
 * that mirror Excel's data-validation definitions.
 *
 * ── Iteration 6 / Fix #50 (issue 9.4) ──────────────────────────────
 * Background (software_review.md issue 9.4 — "September balance
 * validation in LedgerService.validateInput"):
 *   This validation belongs in a *validation rules registry* that
 *   mirrors Excel's data validation definitions, not hardcoded in
 *   the service method. The Excel validation is soft; the software
 *   makes it hard.
 *
 *   Iteration 1 (Fix #4) made the septemberBalance check soft
 *   (returns `ValidationWarning[]` instead of throwing). The
 *   broader architectural ask — a dedicated validation-rules
 *   registry — was left open.
 *
 *   This module is that registry. It exposes:
 *     - `ValidationRuleDefinition` — the shape of a single rule
 *     - `EXCEL_VALIDATION_RULES` — the seeded rules, mirroring
 *       Excel's data-validation definitions on the ETAT sheet
 *     - `runValidationRules()` — runs all rules against an input
 *       and returns the warnings
 *
 *   The LedgerService's `validateInput()` method now delegates
 *   the soft-validation portion to this registry, so future
 *   validation rules can be added in one place (the registry)
 *   instead of being scattered across the service method.
 *
 *   The registry is intentionally pure (no DB, no side effects).
 *   Each rule is a plain function that takes the input and
 *   returns either a `ValidationWarning` or null. This makes the
 *   registry trivially testable and lets the UI reuse the same
 *   rule set for live form validation.
 */

import type { ValidationWarning } from "../services/ledger.service";
import { SEPTEMBER_BALANCE_MAX } from "../core/enums/ledger-category";
import { scanForDeadTermTrackingValues } from "./term-tracking";
import { validateEPlantAmount } from "./e-plant";
import {
  resolveTransportInstallments,
} from "./pricing";

/**
 * The shape of a single validation rule.
 *
 * Each rule has:
 *   - `id`           — a stable identifier (e.g. "septemberBalanceLimit")
 *   - `field`        — the input field the rule applies to
 *   - `severity`     — "soft" (advisory, save proceeds) or "hard"
 *                      (throws ValidationError). Hard rules are
 *                      still evaluated by the service directly;
 *                      the registry only handles soft rules.
 *   - `excelSource`  — a human-readable description of the Excel
 *                      data-validation definition this rule
 *                      mirrors (e.g. "AG1:AG1032, type=decimal,
 *                      operator=lessThan, formula1=10000,
 *                      showErrorMessage=False")
 *   - `evaluate`     — the rule function. Returns a
 *                      `ValidationWarning` when the rule fires,
 *                      null otherwise.
 */
export interface ValidationRuleDefinition {
  id: string;
  field: string;
  severity: "soft" | "hard";
  excelSource: string;
  evaluate: (input: Record<string, unknown>) => ValidationWarning | null;
}

/**
 * The seeded validation rules, mirroring Excel's data-validation
 * definitions on the ETAT sheet.
 *
 * These rules are the single source of truth for soft validations.
 * The LedgerService's `validateInput()` method delegates to this
 * list; future rules can be added here without modifying the
 * service.
 */
export const EXCEL_VALIDATION_RULES: ReadonlyArray<ValidationRuleDefinition> = [
  // ── September balance (Excel column AG) ──────────────────────────
  //
  // Excel data validation:
  //   range:           AG1:AG1032
  //   type:            decimal
  //   operator:        lessThan
  //   formula1:        10000
  //   showErrorMessage: False  (advisory only)
  {
    id: "septemberBalanceLimit",
    field: "septemberBalance",
    severity: "soft",
    excelSource:
      "AG1:AG1032, type=decimal, operator=lessThan, formula1=10000, showErrorMessage=False",
    evaluate: (input) => {
      const v = input.septemberBalance;
      if (v === undefined || v === null) return null;
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      if (n >= SEPTEMBER_BALANCE_MAX) {
        return {
          field: "septemberBalance",
          value: n,
          message: `September balance (${n}) is at or above the advisory limit of ${SEPTEMBER_BALANCE_MAX} DZD. Excel's data validation on column AG is configured as showErrorMessage=False (advisory only); the save proceeds.`,
        };
      }
      return null;
    },
  },

  // ── December balance (Excel column AI) ───────────────────────────
  //
  // Excel does NOT define a validation on column AI. The software
  // surfaces the same advisory as for AG (issue 6.3) for symmetry.
  {
    id: "decemberBalanceAdvisory",
    field: "decemberBalance",
    severity: "soft",
    excelSource:
      "(none — Excel does not define a validation on column AI; software adds this advisory for symmetry with AG, per issue 6.3)",
    evaluate: (input) => {
      const v = input.decemberBalance;
      if (v === undefined || v === null) return null;
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      if (n >= SEPTEMBER_BALANCE_MAX) {
        return {
          field: "decemberBalance",
          value: n,
          message: `December balance (${n}) is at or above the advisory limit of ${SEPTEMBER_BALANCE_MAX} DZD. Excel does not define a validation on column AI; the software surfaces this advisory for symmetry with AG (issue 6.3). The save proceeds.`,
        };
      }
      return null;
    },
  },

  // ── March balance (Excel column AK) ──────────────────────────────
  //
  // Excel does NOT define a validation on column AK. The software
  // surfaces the same advisory as for AG (issue 6.3) for symmetry.
  {
    id: "marchBalanceAdvisory",
    field: "marchBalance",
    severity: "soft",
    excelSource:
      "(none — Excel does not define a validation on column AK; software adds this advisory for symmetry with AG, per issue 6.3)",
    evaluate: (input) => {
      const v = input.marchBalance;
      if (v === undefined || v === null) return null;
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      if (n >= SEPTEMBER_BALANCE_MAX) {
        return {
          field: "marchBalance",
          value: n,
          message: `March balance (${n}) is at or above the advisory limit of ${SEPTEMBER_BALANCE_MAX} DZD. Excel does not define a validation on column AK; the software surfaces this advisory for symmetry with AG (issue 6.3). The save proceeds.`,
        };
      }
      return null;
    },
  },

  // ── Dead term-tracking fields (Excel columns AF–AK) ─────────────
  //
  // Excel's columns AF–AK are entirely empty in the source workbook.
  // The software stores values in these columns for forward
  // compatibility but does NOT include them in any computed total
  // (issue 7.5 / Fix #37). This rule surfaces an advisory when any
  // of the dead fields is populated.
  //
  // Note: this rule can produce MULTIPLE warnings per input (one per
  // populated dead field). The `evaluate` function returns only the
  // first; the registry's `runValidationRules()` helper collects
  // them all by re-running the rule for each dead field. We expose
  // a separate `runDeadTermTrackingRules()` helper for that.
  {
    id: "deadTermTrackingFields",
    field: "september|december|march|septemberBalance|decemberBalance|marchBalance",
    severity: "soft",
    excelSource:
      "AF1:AK1032 — columns are entirely empty in the source workbook; software stores values for forward compatibility (issue 7.5)",
    evaluate: (input) => {
      const advisories = scanForDeadTermTrackingValues(input);
      return advisories.length > 0 ? advisories[0] : null;
    },
  },

  // ── E-PLANT amount (Excel column AD) ─────────────────────────────
  //
  // Excel does not define a validation on column AD. The software
  // surfaces an advisory when the amount is outside the typical
  // range (0–10,000 DZD) or negative (issue 8.10 / Fix #38).
  {
    id: "ePlantRange",
    field: "ePlant",
    severity: "soft",
    excelSource:
      "(none — Excel does not define a validation on column AD; software adds this advisory based on the documented typical range, per issue 8.10)",
    evaluate: (input) => {
      const v = input.ePlant;
      if (v === undefined || v === null) return null;
      const check = validateEPlantAmount(Number(v));
      if (!check.ok) {
        return {
          field: "ePlant",
          value: check.value,
          message: `Issue 8.10: ${check.message}`,
        };
      }
      return null;
    },
  },

  // ── Transport tranche mismatch (Excel columns W/X/Y) ─────────────
  //
  // Excel does not define a validation on columns W/X/Y. The
  // software surfaces an advisory when the typed T1/T2/T3 amounts
  // don't match the documented tier breakdown for the student's
  // destination (issue 4.3 / Fix #25).
  {
    id: "transportTrancheMismatch",
    field: "t1|t2|t3",
    severity: "soft",
    excelSource:
      "(none — Excel does not define a validation on columns W/X/Y; software adds this advisory based on the documented tier breakdown, per issue 4.3)",
    evaluate: (input) => {
      const optionCode = String(input.optionCode ?? "").toUpperCase();
      const destination = input.destination;
      if (optionCode !== "TRNSP") return null;
      if (!destination || !String(destination).trim()) return null;
      const expected = resolveTransportInstallments(destination as string);
      if (!expected) return null;
      const t1 = Number(input.t1 ?? 0);
      const t2 = Number(input.t2 ?? 0);
      const t3 = Number(input.t3 ?? 0);
      const mismatchParts: string[] = [];
      if (t1 > 0 && t1 !== expected.t1) mismatchParts.push(`T1=${t1} (expected ${expected.t1})`);
      if (t2 > 0 && t2 !== expected.t2) mismatchParts.push(`T2=${t2} (expected ${expected.t2})`);
      if (t3 > 0 && t3 !== expected.t3) mismatchParts.push(`T3=${t3} (expected ${expected.t3})`);
      if (mismatchParts.length === 0) return null;
      return {
        field: "transportTranches",
        value: { t1, t2, t3, expected },
        message:
          `Issue 4.3: transport tranches for destination "${destination}" ` +
          `(tier: ${expected.tier}) don't match the documented breakdown: ` +
          mismatchParts.join(", ") +
          `. Total expected: ${expected.total} DZD. The save proceeds — ` +
          `the operator may have negotiated a custom payment plan.`,
      };
    },
  },
];

/**
 * Run all soft-validation rules against an input.
 *
 * Returns the list of warnings produced by the rules. The input is
 * passed unchanged to each rule; rules that don't apply return null
 * and are skipped.
 *
 * Note: the `deadTermTrackingFields` rule can produce MULTIPLE
 * warnings (one per populated dead field). This helper handles
 * that case by re-running the dead-term-tracking scanner directly
 * and appending all of its advisories.
 */
export function runValidationRules(
  input: Record<string, unknown>,
  rules: ReadonlyArray<ValidationRuleDefinition> = EXCEL_VALIDATION_RULES,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  for (const rule of rules) {
    if (rule.severity !== "soft") continue;
    if (rule.id === "deadTermTrackingFields") {
      // Special case: this rule produces multiple warnings.
      const advisories = scanForDeadTermTrackingValues(input);
      for (const adv of advisories) {
        warnings.push(adv);
      }
      continue;
    }
    const w = rule.evaluate(input);
    if (w) warnings.push(w);
  }
  return warnings;
}

/**
 * List all registered validation rules.
 *
 * Useful for the UI's "validation reference" panel and for tests
 * that verify the rule set is complete.
 */
export function listValidationRules(): ReadonlyArray<ValidationRuleDefinition> {
  return EXCEL_VALIDATION_RULES;
}

/**
 * Get a single validation rule by ID.
 */
export function getValidationRule(
  id: string,
): ValidationRuleDefinition | undefined {
  return EXCEL_VALIDATION_RULES.find((r) => r.id === id);
}
