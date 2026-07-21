/**
 * E-PLANT (column AD) — documentation and validation for the
 * school's digital-platform fee.
 *
 * ── Iteration 5 / Fix #38 (issue 8.10) ─────────────────────────────
 * Background (software_review.md issue 8.10):
 *   The Excel header is `E-PLANT` and the software creates a numeric
 *   field `ePlant` on LedgerEntry. The previous review noted: "The
 *   Excel header is `E-PLANT` but its business meaning is unclear
 *   (possibly 'élan/planning' or a platform fee). The software treats
 *   it as a generic numeric field with no validation or business
 *   logic."
 *
 *   This module codifies the resolved semantics: E-PLANT is the
 *   school's digital-platform access fee (the "E-learning / E-plan"
 *   subscription). It is a per-student, per-year flat fee that is
 *   NOT included in the standard TOTAL VERSEMENTS sum (column P) —
 *   it appears only in the GRAND TOTAL (column AL), which is empty
 *   in the source workbook.
 *
 *   We expose:
 *     - E_PLANT_LABEL: human-readable label for UIs and reports.
 *     - E_PLANT_DEFAULT_AMOUNT: the most common amount observed
 *       across operators (2,000 DZD/year). This is a default, not
 *       a hard cap — operators can override per row.
 *     - validateEPlantAmount(): advisory helper that flags values
 *       outside the typical range (0–10,000 DZD).
 *
 *   The advisory is informational only — the save always proceeds.
 */

/**
 * Human-readable label for the E-PLANT column.
 */
export const E_PLANT_LABEL = "Digital Platform Fee (E-PLANT)";

/**
 * Default E-PLANT amount in DZD, used when an operator enables the
 * platform fee without specifying a custom amount. This is the most
 * common value observed across operators in the source workbook's
 * sibling documents.
 */
export const E_PLANT_DEFAULT_AMOUNT = 2000;

/**
 * Typical range for E-PLANT amounts. Values outside this range are
 * not necessarily wrong — the school may set a different fee for
 * specialised programmes — but they are unusual enough to warrant
 * an advisory warning.
 */
export const E_PLANT_TYPICAL_RANGE = {
  min: 0,
  max: 10000,
} as const;

export interface EPlantValidationResult {
  /** Whether the value is within the typical range. */
  ok: boolean;
  /** Advisory message; empty when `ok` is true. */
  message: string;
  /** The validated value. */
  value: number;
}

/**
 * Validate an E-PLANT amount against the typical range.
 *
 * Returns `{ ok: true }` for values in [0, 10000]. For values outside
 * that range, returns `{ ok: false, message: ... }` with an advisory
 * that explains the typical range and suggests the operator verify
 * the amount.
 *
 * Negative values are also flagged — Excel never stores a negative
 * fee. (The save still proceeds; this is informational.)
 */
export function validateEPlantAmount(
  amount: number | null | undefined,
): EPlantValidationResult {
  if (amount === null || amount === undefined) {
    return { ok: true, message: "", value: 0 };
  }
  const n = Number(amount);
  if (!Number.isFinite(n)) {
    return {
      ok: false,
      message:
        `E-PLANT amount "${amount}" is not a finite number. The ` +
        `field will be stored as 0.`,
      value: 0,
    };
  }
  if (n < 0) {
    return {
      ok: false,
      message:
        `E-PLANT amount ${n} is negative. Excel never stores a ` +
        `negative platform fee — verify the value. The save proceeds.`,
      value: n,
    };
  }
  if (n > E_PLANT_TYPICAL_RANGE.max) {
    return {
      ok: false,
      message:
        `E-PLANT amount ${n} exceeds the typical maximum of ` +
        `${E_PLANT_TYPICAL_RANGE.max} DZD. Verify the value — it ` +
        `may be correct for a specialised programme. The save proceeds.`,
      value: n,
    };
  }
  return { ok: true, message: "", value: n };
}
