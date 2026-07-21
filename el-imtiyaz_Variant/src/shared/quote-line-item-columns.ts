/**
 * Quote line item column semantics — the 8 Excel columns A..H of a
 * Devis-sheet line item row, with their types and which ones
 * contribute to the line total.
 *
 * ── Iteration 5 / Fix #42 (issue 5.1) ──────────────────────────────
 * Background (software_review.md issue 5.1):
 *   Excel's `=SUM(A15:H15)` works because Excel's SUM ignores text.
 *   The actual numeric columns are:
 *     E (FI, registration fee)         → index 4
 *     F (Frais Scolaire, tuition)      → index 5
 *     H (transport amount)             → index 7
 *   The text columns are:
 *     A (label / student name)         → index 0
 *     B, C (empty in the source)       → indices 1, 2
 *     D (CLASSE dropdown)              → index 3
 *     G (SERVICE label, e.g. transport)→ index 6
 *
 *   The software's `QuoteLineItem.amounts: number[]` (length 8)
 *   conflates text and numeric positions. The previous lineTotal
 *   computation was `amounts.reduce((s, a) => s + a, 0)`, which
 *   sums all 8 values. When the caller correctly placed text labels
 *   in positions 0,1,2,3,6 (as zero-length or 0), the sum was right
 *   by accident. But if the caller placed non-zero numbers in those
 *   positions (e.g. a "quantity" in column A), the sum would
 *   silently include them — diverging from Excel's behaviour.
 *
 *   This module codifies the column types and exports a
 *   `computeLineTotal()` helper that sums ONLY the numeric columns
 *   (E, F, H — indices 4, 5, 7), exactly matching Excel's effective
 *   computation. The QuoteService.compute() method now uses this
 *   helper instead of the naive sum.
 *
 *   The `amounts[]` array shape is preserved for backward
 *   compatibility — the database schema and the UI bindings still
 *   expect 8 elements. Only the SUM behaviour changes.
 */

/**
 * The 8 columns of a Devis-sheet line item row, in order (A..H).
 *
 * `type: 'text'` columns are ignored by SUM (matching Excel).
 * `type: 'number'` columns are summed.
 */
export interface QuoteLineItemColumnDef {
  /** Excel column letter. */
  excel: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  /** Position in the amounts[] array (0-indexed). */
  index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Excel header / business meaning. */
  label: string;
  /** Whether Excel treats this column as numeric (true) or text (false). */
  type: "number" | "text";
  /** Whether SUM(A:H) includes this column. */
  includedInLineTotal: boolean;
}

export const QUOTE_LINE_ITEM_COLUMNS: ReadonlyArray<QuoteLineItemColumnDef> = [
  { excel: "A", index: 0, label: "Label / student name",   type: "text",   includedInLineTotal: false },
  { excel: "B", index: 1, label: "(empty in source)",      type: "text",   includedInLineTotal: false },
  { excel: "C", index: 2, label: "(empty in source)",      type: "text",   includedInLineTotal: false },
  { excel: "D", index: 3, label: "CLASSE dropdown",        type: "text",   includedInLineTotal: false },
  { excel: "E", index: 4, label: "FI (registration fee)",  type: "number", includedInLineTotal: true },
  { excel: "F", index: 5, label: "Frais Scolaire (tuition)", type: "number", includedInLineTotal: true },
  { excel: "G", index: 6, label: "SERVICE label",          type: "text",   includedInLineTotal: false },
  { excel: "H", index: 7, label: "Transport amount",       type: "number", includedInLineTotal: true },
];

/**
 * Indices that contribute to the line total (E, F, H).
 * Exposed for tests and for callers that want to validate inputs.
 */
export const QUOTE_NUMERIC_COLUMN_INDICES: ReadonlyArray<number> =
  QUOTE_LINE_ITEM_COLUMNS
    .filter((c) => c.includedInLineTotal)
    .map((c) => c.index);

/**
 * Compute the line total for a quote line item, mirroring Excel's
 * `=SUM(A:H)` semantics exactly: text columns are ignored, only the
 * numeric columns (E=4, F=5, H=7) are summed.
 *
 * This is the function the QuoteService should use to refresh
 * `lineTotal` — see Fix #42.
 *
 * Non-numeric values in the numeric positions are coerced via
 * `Number(x) || 0` (NaN/undefined/null → 0), matching how Excel's
 * SUM treats empty cells.
 *
 * @param amounts  The 8-element amounts array (length 8 expected).
 *                 Shorter arrays are tolerated (missing positions
 *                 contribute 0). Longer arrays are truncated to 8.
 */
export function computeLineTotal(amounts: number[] | null | undefined): number {
  if (!Array.isArray(amounts) || amounts.length === 0) return 0;
  let sum = 0;
  for (const idx of QUOTE_NUMERIC_COLUMN_INDICES) {
    if (idx >= amounts.length) break;
    const v = amounts[idx];
    const n = Number(v);
    if (Number.isFinite(n)) {
      sum += n;
    }
    // Non-finite values (NaN, Infinity) are treated as 0 by Excel's SUM.
  }
  return sum;
}

/**
 * Validate that an amounts array has the expected 8 columns and that
 * the text columns (indices 0, 1, 2, 3, 6) do NOT carry non-zero
 * numbers. Returns an array of advisory warnings; empty when the
 * array is well-formed.
 *
 * The save is NOT blocked — Excel allows text columns to contain
 * anything (they're ignored by SUM), but the software should flag
 * suspicious inputs (e.g. a number in column A where a label belongs).
 */
export interface QuoteLineItemAmountsWarning {
  index: number;
  excelColumn: string;
  value: unknown;
  message: string;
}

export function validateQuoteLineItemAmounts(
  amounts: number[] | null | undefined,
): QuoteLineItemAmountsWarning[] {
  const warnings: QuoteLineItemAmountsWarning[] = [];
  if (!Array.isArray(amounts)) return warnings;
  for (const col of QUOTE_LINE_ITEM_COLUMNS) {
    if (col.type !== "text") continue;
    if (col.index >= amounts.length) break;
    const v = amounts[col.index];
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (Number.isFinite(n) && n !== 0) {
      warnings.push({
        index: col.index,
        excelColumn: col.excel,
        value: v,
        message:
          `Issue 5.1: column ${col.excel} (${col.label}) is a text column ` +
          `in Excel but carries a numeric value (${v}). Excel's SUM(A:H) ` +
          `would ignore it; the software now also ignores it. If you ` +
          `intended this value to be in the line total, move it to ` +
          `column E, F, or H.`,
      });
    }
  }
  return warnings;
}
