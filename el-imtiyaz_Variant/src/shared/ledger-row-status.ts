/**
 * Ledger row status — the software equivalent of Excel's conditional
 * formatting on the ETAT 20262027 sheet.
 *
 * ── Iteration 5 / Fix #36 (issue 7.4) ──────────────────────────────
 * Background (software_review.md issue 7.4):
 *   The Excel workbook applies two conditional formatting rules to the
 *   ledger grid:
 *     1. Light-green fill (#B7E1CD) on every non-empty row.
 *     2. A green-to-white colour scale on numeric values, highlighting
 *        the largest outstanding debts.
 *
 *   The software had no equivalent visual logic. This module provides
 *   a pure function that classifies a ledger entry's `totalCreance`
 *   into one of four status buckets, plus the recommended CSS class
 *   and human-readable label for each. UIs can use the returned
 *   `className` directly; reports can use the `label`.
 *
 * The thresholds are derived from the school's actual fee structure
 * (see shared/pricing.ts):
 *   - OK        → creance <= 0          (fully paid or overpaid/credit)
 *   - INFO      → 0 < creance <= 10,000 (small remainder, within
 *                                         Excel's AG-column advisory)
 *   - WARNING   → 10,000 < creance <= 100,000 (one tranche unpaid)
 *   - CRITICAL  → creance > 100,000     (multiple tranches unpaid,
 *                                         or no payments at all)
 *
 * The function is intentionally pure: it takes the creance (and an
 * optional devisAnnuel for the "no payments at all" check) and
 * returns a status object. No side effects, no DB calls.
 */

export type LedgerRowStatus = "ok" | "info" | "warning" | "critical";

export interface LedgerRowStatusResult {
  status: LedgerRowStatus;
  /** Human-readable label, in English, suitable for badges / tooltips. */
  label: string;
  /** CSS class — see styles/components.css `.el-row-status--*`. */
  className: string;
  /** Hex colour, for non-CSS contexts (PDF exports, charts, etc.). */
  color: string;
}

/**
 * Thresholds in DZD. Exported so tests can verify them and operators
 * can override them in the future without touching the function.
 */
export const LEDGER_ROW_STATUS_THRESHOLDS = {
  /** A creance <= this value is "OK" (paid or credit). */
  ok: 0,
  /** A creance in (0, this] is "INFO" — matches Excel's AG-column rule. */
  info: 10000,
  /** A creance in (10k, this] is "WARNING" — one tranche unpaid. */
  warning: 100000,
  // Anything above `warning` is "CRITICAL".
} as const;

const STATUS_META: Record<LedgerRowStatus, Omit<LedgerRowStatusResult, "status">> = {
  ok: {
    label: "Paid",
    className: "el-row-status--ok",
    color: "#B7E1CD", // Excel's light-green fill
  },
  info: {
    label: "Small balance",
    className: "el-row-status--info",
    color: "#F0E68C", // khaki — visible but not alarming
  },
  warning: {
    label: "Outstanding",
    className: "el-row-status--warning",
    color: "#FFD580", // warm orange
  },
  critical: {
    label: "Critical",
    className: "el-row-status--critical",
    color: "#FFB3B3", // light red — strong but not aggressive
  },
};

/**
 * Classify a ledger entry's outstanding-balance status.
 *
 * @param totalCreance  The entry's `totalCreance` (= devisAnnuel − totalVersements).
 *                      Negative values represent overpayments / credits.
 * @param devisAnnuel   Optional. The entry's `devisAnnuel`. When both
 *                      `devisAnnuel > 0` and `totalCreance === devisAnnuel`
 *                      (i.e. zero payments received), the status is
 *                      forced to "critical" regardless of the amount —
 *                      matching how the Excel colour scale flags rows
 *                      where no payment has been recorded at all.
 */
export function getLedgerRowStatus(
  totalCreance: number,
  devisAnnuel?: number,
): LedgerRowStatusResult {
  const c = Number(totalCreance) || 0;

  // Special case: a positive devis with zero payments is always
  // critical, even if the amount is small.
  const d = Number(devisAnnuel) || 0;
  if (d > 0 && c === d) {
    return { status: "critical", ...STATUS_META.critical };
  }

  let status: LedgerRowStatus;
  if (c <= LEDGER_ROW_STATUS_THRESHOLDS.ok) {
    status = "ok";
  } else if (c <= LEDGER_ROW_STATUS_THRESHOLDS.info) {
    status = "info";
  } else if (c <= LEDGER_ROW_STATUS_THRESHOLDS.warning) {
    status = "warning";
  } else {
    status = "critical";
  }

  return { status, ...STATUS_META[status] };
}

/**
 * Aggregate the row-status counts for a list of entries. Useful for
 * dashboard widgets ("X students critical, Y outstanding, Z paid").
 */
export function summariseLedgerRowStatuses(
  entries: Array<{ totalCreance: number; devisAnnuel?: number }>,
): Record<LedgerRowStatus, number> {
  const tally: Record<LedgerRowStatus, number> = {
    ok: 0,
    info: 0,
    warning: 0,
    critical: 0,
  };
  for (const e of entries) {
    const { status } = getLedgerRowStatus(e.totalCreance, e.devisAnnuel);
    tally[status]++;
  }
  return tally;
}
