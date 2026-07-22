/**
 * Closed-file workflow — meaningful handling of the `======` suffix
 * on payment audit comments (Excel column AM).
 *
 * ── Iteration 6 / Fix #47 (issue 7.3) ─────────────────────────────
 * Background (software_review.md issue 7.3 — "Payment history as
 * cell comments (Column AM) — different paradigm"):
 *   The software's parsing is correct (`parseAuditComment` handles
 *   the format), but the **workflow** is different: in Excel, the
 *   operator types a comment; in software, it's a structured form.
 *   The software also doesn't handle the `======` suffix (marking
 *   a file as closed) in any meaningful workflow way.
 *
 *   The `parseAuditComment()` helper (in the repository) already
 *   detects the `======` suffix and sets `isClosed = true` on the
 *   parsed row. The repository already persists the flag in the
 *   `is_closed` column. The repository already accepts an
 *   `isClosed: boolean` query filter.
 *
 *   What was missing is the *workflow* layer: a way to ask "is
 *   this ledger entry's audit trail closed?" and "give me a
 *   summary of the closed trail". This module provides those
 *   helpers without requiring a new service class — the
 *   repository is already the right home for persistence, and
 *   the helpers here are pure functions over the parsed rows.
 *
 *   The closed state has a clear business meaning in Excel: the
 *   operator types `======` at the end of the column-AM comment
 *   to mark "this student's file is settled for the year — no
 *   more payments expected". The software should expose that
 *   state so the UI can:
 *     1. Show a "closed" badge on the student's ledger row.
 *     2. Filter the ledger grid to "open files only" by default.
 *     3. Warn the operator if they record a new payment against
 *        a closed file (issue 8.2-style soft warning, not a
 *        hard block — Excel allows it).
 */

import type { PaymentAuditComment } from "../core/entities/payment-audit-comment.entity";

/**
 * A partial date carried by an audit comment (day/month/year, any
 * of which may be null when the comment didn't include it).
 */
export interface AuditCommentDate {
  day: number | null;
  month: number | null;
  year: number | null;
}

/**
 * The close state for a single ledger entry's audit trail.
 *
 * A trail is "closed" when at least one of its comments carries
 * the `======` suffix. The `closingCommentId` is the ID of the
 * comment that closed the trail (the first such comment, in
 * repository order).
 */
export type ClosedState =
  | {
      isClosed: true;
      closingCommentId: string;
      closingCommentDate: AuditCommentDate;
      closingRawText: string;
    }
  | { isClosed: false };

/**
 * Summary of a ledger entry's audit trail.
 *
 * Returned by `summariseAuditTrail()` — used by the BON print
 * template (issue 7.1) and by the parent-summary service
 * (Fix #49).
 */
export interface AuditTrailSummary {
  /** Sum of all `amount` fields across the trail's comments. */
  totalAmount: number;
  /** Number of comments in the trail. */
  commentCount: number;
  /** Date of the first payment in the trail, or null. */
  firstPaymentDate: AuditCommentDate | null;
  /** Date of the last payment in the trail, or null. */
  lastPaymentDate: AuditCommentDate | null;
  /** Whether the trail is closed (any comment carries `======`). */
  isClosed: boolean;
  /** ID of the closing comment, or null. */
  closingCommentId: string | null;
}

/**
 * Check whether a single audit comment is marked closed (i.e. its
 * `rawText` ends with `======`).
 *
 * Pure function — safe to call on any PaymentAuditComment-shaped
 * object, including the raw rows returned by the repository.
 */
export function isAuditCommentClosed(
  comment: { rawText?: string; isClosed?: boolean } | null | undefined,
): boolean {
  if (!comment) return false;
  if (typeof comment.isClosed === "boolean") return comment.isClosed;
  if (typeof comment.rawText !== "string") return false;
  return /={3,}\s*$/.test(comment.rawText.trim());
}

/**
 * Given a list of audit comments for a single ledger entry,
 * determine whether the entry's audit trail is closed.
 *
 * An entry is "closed" when AT LEAST ONE of its comments carries
 * the `======` suffix. This mirrors Excel's behaviour: once the
 * operator types the suffix on any line of the cell comment, the
 * whole cell is considered "closed".
 *
 * Returns the close metadata when available (date of the closing
 * comment, raw text of the closing line). Returns null when the
 * trail is open.
 */
export function getClosedStateForEntry(
  comments: ReadonlyArray<PaymentAuditComment>,
): ClosedState {
  for (const c of comments) {
    if (isAuditCommentClosed(c)) {
      return {
        isClosed: true,
        closingCommentId: c.id.value,
        closingCommentDate: {
          day: c.day,
          month: c.month,
          year: c.year,
        },
        closingRawText: c.rawText,
      };
    }
  }
  return { isClosed: false };
}

/**
 * Aggregate closed-state across many ledger entries.
 *
 * Returns a map keyed by `ledgerEntryId`. Each value is the
 * close-state for that entry (or `{ isClosed: false }` when the
 * entry has no closing comment).
 *
 * Useful for the ledger grid's "open files only" filter: build
 * the map once, then look up each row in O(1).
 */
export function buildClosedStateByEntry(
  commentsByEntry: ReadonlyMap<string, ReadonlyArray<PaymentAuditComment>>,
): Map<string, ReturnType<typeof getClosedStateForEntry>> {
  const out = new Map<string, ReturnType<typeof getClosedStateForEntry>>();
  for (const [entryId, comments] of commentsByEntry.entries()) {
    out.set(entryId, getClosedStateForEntry(comments));
  }
  return out;
}

/**
 * Summarise a list of audit comments for a single ledger entry.
 *
 * Returns:
 *   - total amount paid across all comments
 *   - count of comments
 *   - first/last payment dates
 *   - whether the trail is closed
 *
 * This is the data the BON print template (issue 7.1) would
 * show in the "Payment History" section. It's also what the
 * ledger grid's "last payment" column should display.
 */
export function summariseAuditTrail(
  comments: ReadonlyArray<PaymentAuditComment>,
): AuditTrailSummary {
  let totalAmount = 0;
  let commentCount = 0;
  let first: AuditCommentDate | null = null;
  let last: AuditCommentDate | null = null;
  let isClosed = false;
  let closingCommentId: string | null = null;

  for (const c of comments) {
    commentCount++;
    if (typeof c.amount === "number") {
      totalAmount += c.amount;
    }
    const date: AuditCommentDate = { day: c.day, month: c.month, year: c.year };
    if (first === null) first = date;
    last = date;
    if (isAuditCommentClosed(c)) {
      isClosed = true;
      closingCommentId = c.id.value;
    }
  }

  return {
    totalAmount,
    commentCount,
    firstPaymentDate: first,
    lastPaymentDate: last,
    isClosed,
    closingCommentId,
  };
}

/**
 * Format a closed-state badge label for the UI.
 *
 * Returns "Closed" when the trail is closed, "Open" otherwise.
 * The UI can use this as a fallback when it doesn't have a
 * localised string.
 */
export function formatClosedStateBadge(
  state: ReturnType<typeof getClosedStateForEntry>,
): string {
  return state.isClosed ? "Closed" : "Open";
}
