/**
 * Term tracking (SEPTEMBRE / DECEMBRE / MARS) — documentation and
 * advisory helpers for the dead columns AF–AK on the ETAT 20262027
 * sheet.
 *
 * ── Iteration 5 / Fix #37 (issue 7.5) ──────────────────────────────
 * Background (software_review.md issue 7.5):
 *   Excel's columns AF–AK are documented in the column dictionary:
 *     AF  SEPTEMBRE           — September term fee
 *     AG  CREANCES SEPTEMBRE  — September unpaid balance (validation: <10k)
 *     AH  DECEMBRE            — December term fee
 *     AI  CREANCES DECEMBRE   — December unpaid balance
 *     AJ  MARS                — March term fee
 *     AK  CREANCES MARS       — March unpaid balance
 *
 *   In the actual `Suivis clients.xlsx` workbook, **all six columns
 *   are entirely empty** — no operator has ever typed a value into
 *   them. The school's real billing flow uses the R–Y installment
 *   columns (FI, V2, 2V, v3, T1, T2, T3) and the L/P/Q computed
 *   columns. The term-tracking columns are forward-compatible
 *   placeholders that the spreadsheet author defined but never used.
 *
 *   The previous software:
 *     - Created database columns for them (good — preserves the schema).
 *     - Exposed them in `ctx.fields` (good — formulas can reference them).
 *     - **Included them in the GRAND TOTAL formula** (bad — the
 *       formula was an invention and was removed in iteration 1 / Fix #3).
 *
 *   This module:
 *     - Documents the dead-column status in a single source of truth.
 *     - Provides an advisory helper that surfaces a warning when an
 *       operator populates a term-tracking field — so the operator
 *       knows the value will be stored but won't affect any computed
 *       total unless they also create a custom `grandTotal` formula
 *       rule that references it.
 *
 *   The advisory is informational only (mirrors Excel's
 *   `showErrorMessage=False` pattern from issues 6.1/6.2). It does
 *   NOT block the save.
 */

/**
 * The list of term-tracking field names whose corresponding Excel
 * columns (AF–AK) are entirely empty in the source workbook.
 *
 * Exposed so tests can verify the list matches the spreadsheet schema.
 */
export const DEAD_TERM_TRACKING_FIELDS = [
  "september",
  "septemberBalance",
  "december",
  "decemberBalance",
  "march",
  "marchBalance",
] as const;

export type DeadTermTrackingField = (typeof DEAD_TERM_TRACKING_FIELDS)[number];

/**
 * Map each dead field to its Excel column letter, for advisory
 * messages. Useful when surfacing warnings to the operator — the
 * column letter is more recognisable than the field name.
 */
export const DEAD_TERM_FIELD_TO_EXCEL_COLUMN: Readonly<
  Record<DeadTermTrackingField, string>
> = {
  september: "AF",
  septemberBalance: "AG",
  december: "AH",
  decemberBalance: "AI",
  march: "AJ",
  marchBalance: "AK",
};

export interface TermTrackingAdvisory {
  field: DeadTermTrackingField;
  excelColumn: string;
  value: number;
  message: string;
}

/**
 * Scan an input object for non-zero values in the dead term-tracking
 * fields and return an advisory warning for each one found.
 *
 * The warnings are informational only — the save always proceeds.
 * The operator should know that:
 *   1. The value WILL be persisted (the database columns exist).
 *   2. The value will NOT affect any computed total unless they
 *      create a custom `grandTotal` formula rule that references it.
 *
 * @param input  The ledger-entry input (or row) to scan.
 * @returns An array of advisory warnings; empty when no term-tracking
 *          field is populated.
 */
export function scanForDeadTermTrackingValues(
  input: Record<string, unknown>,
): TermTrackingAdvisory[] {
  const advisories: TermTrackingAdvisory[] = [];
  for (const field of DEAD_TERM_TRACKING_FIELDS) {
    const raw = input[field];
    if (raw === undefined || raw === null) continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n === 0) continue;
    advisories.push({
      field,
      excelColumn: DEAD_TERM_FIELD_TO_EXCEL_COLUMN[field],
      value: n,
      message:
        `Issue 7.5: column ${DEAD_TERM_FIELD_TO_EXCEL_COLUMN[field]} ` +
        `(${field}) is populated (${n} DZD), but this column is ` +
        `entirely empty in the source Excel workbook and is NOT ` +
        `included in any computed total. The value is stored for ` +
        `forward compatibility. To use it in a calculation, create ` +
        `a custom 'grandTotal' formula rule that references ` +
        `'${field}'.`,
    });
  }
  return advisories;
}
