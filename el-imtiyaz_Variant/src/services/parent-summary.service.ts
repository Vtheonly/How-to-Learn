/**
 * ParentSummaryService — produces a parent-level summary view,
 * equivalent to Excel's deleted `PAR PARENT` sheet.
 *
 * ── Iteration 6 / Fix #49 (issue 7.6) ─────────────────────────────
 * Background (software_review.md issue 7.6 — "The PAR PARENT summary
 * sheet — deleted, never recreated"):
 *   Excel's BON sheet references a `'PAR PARENT'` sheet that was a
 *   parent-level summary. This sheet was deleted. The software has
 *   no parent-level summary view either.
 *
 *   The original `PAR PARENT` sheet had one row per parent with
 *   aggregated totals across all their children. The BON sheet's
 *   VLOOKUPs (cells C10, H12, I12, H13, I13) queried this sheet
 *   to display the family quote and per-child paid amounts on the
 *   printed statement.
 *
 *   This service recreates that summary as a derived view. It
 *   composes the FamilyService's grouping with the audit-trail
 *   summary (Fix #47) to produce a parent-level record that
 *   includes:
 *     - the tutor name (family key)
 *     - the list of children with their individual quotes/payments/balances
 *     - the family-level totals (matching the PAR PARENT columns)
 *     - the family's last payment date (from the audit trail)
 *     - whether the family's file is closed (issue 7.3)
 *
 *   The service is read-only and stateless. It composes cleanly
 *   with the existing LedgerRepository and the audit-comment
 *   repository.
 */

import type { LedgerRepository } from "../infrastructure/repositories/ledger-entry.repository";
import type { PaymentAuditCommentRepository } from "../infrastructure/repositories/payment-audit-comment.repository";
import type { LedgerEntry } from "../core/entities/ledger-entry.entity";
import {
  summariseAuditTrail,
  getClosedStateForEntry,
  type AuditTrailSummary,
  type ClosedState,
} from "../shared/audit-trail-workflow";

/**
 * A single child's row in the parent summary.
 *
 * Mirrors the columns of the original `PAR PARENT` sheet:
 *   - student name (column F of ETAT)
 *   - devisAnnuel (column L)
 *   - totalVersements (column P)
 *   - totalCreance (column Q)
 *   - last payment date (from column AM audit trail)
 */
export interface ParentSummaryChild {
  /** The student's ledger-entry ID. */
  ledgerEntryId: string;
  /** The student's name (column F). */
  studentName: string;
  /** The student's level (column G). */
  level: string | null | undefined;
  /** The student's class code (column H). */
  classCode: string | null | undefined;
  /** Annual quote (column L). */
  devisAnnuel: number;
  /** Total payments (column P). */
  totalVersements: number;
  /** Outstanding balance (column Q). */
  totalCreance: number;
  /** Whether this child's file is marked closed (issue 7.3). */
  isClosed: boolean;
  /** Summary of the audit trail (last payment, total, etc.). */
  auditTrail: AuditTrailSummary;
}

/**
 * A single parent's row in the summary.
 *
 * Mirrors the columns of the original `PAR PARENT` sheet, plus
 * the family-balance and close-state metadata needed by the BON
 * print template.
 */
export interface ParentSummaryRow {
  /** The tutor / parent name (the family key — column E of ETAT). */
  tutorName: string;
  /** All children in this family, sorted by student name. */
  children: ParentSummaryChild[];
  /** Count of children. */
  childCount: number;
  /** Sum of `devisAnnuel` across all children. */
  familyDevisAnnuel: number;
  /** Sum of `totalVersements` across all children. */
  familyTotalVersements: number;
  /** Sum of `totalCreance` across all children (= family balance). */
  familyTotalCreance: number;
  /**
   * Family-level close state. A family is "closed" when ALL of
   * its children's audit trails are closed. A family with no
   * children is "open" by convention.
   */
  isFamilyClosed: boolean;
  /** Date of the most recent payment across all children, or null. */
  lastPaymentDate: { day: number | null; month: number | null; year: number | null } | null;
}

/**
 * Result of building the parent summary.
 */
export interface ParentSummaryResult {
  /** All parent rows, sorted by tutor name (alphabetical). */
  parents: ParentSummaryRow[];
  /** Total number of parents (families). */
  parentCount: number;
  /** Total number of children across all families. */
  totalChildren: number;
  /** Grand-total devisAnnuel across all families. */
  grandTotalDevisAnnuel: number;
  /** Grand-total totalVersements across all families. */
  grandTotalVersements: number;
  /** Grand-total totalCreance across all families. */
  grandTotalCreance: number;
}

/**
 * Stateless service that produces a parent-level summary view.
 *
 * The service depends on the LedgerRepository (for ledger entries)
 * and the PaymentAuditCommentRepository (for the audit-trail
 * summary and close state). Both are read-only.
 */
export class ParentSummaryService {
  readonly serviceName = "ParentSummaryService";

  constructor(
    private readonly ledger: LedgerRepository,
    private readonly auditComments: PaymentAuditCommentRepository,
  ) {}

  /**
   * Build the parent-level summary for all families.
   *
   * @param academicYearId  Optional academic-year filter.
   */
  async buildSummary(academicYearId?: string): Promise<ParentSummaryResult> {
    const entries = await this.ledger.list({
      academicYearId,
      pageSize: 10000,
    });

    // Fetch audit comments for every entry in one shot. The
    // repository's `list()` doesn't support an `IN (...)` filter,
    // so we fetch per-entry. For a 390-student school this is
    // ~390 queries, which is acceptable for a read-only summary
    // view. A future optimisation could add an `IN` filter to
    // the repository.
    const auditByEntry = new Map<string, Awaited<ReturnType<typeof this.auditComments.list>>>();
    for (const e of entries) {
      const comments = await this.auditComments.list({ ledgerEntryId: e.id.value });
      auditByEntry.set(e.id.value, comments);
    }

    return this.buildSummaryFromEntries(entries, auditByEntry);
  }

  /**
   * Build the summary for a single parent (tutor name).
   *
   * Returns null when no entries match.
   */
  async buildSummaryForTutor(
    tutorName: string,
    academicYearId?: string,
  ): Promise<ParentSummaryRow | null> {
    if (!tutorName) return null;
    const all = await this.buildSummary(academicYearId);
    return all.parents.find((p) => p.tutorName === tutorName) ?? null;
  }

  /**
   * Build the summary from pre-fetched entries and audit comments.
   *
   * Exposed publicly so tests can pass in mock data without having
   * to mock the repositories.
   */
  buildSummaryFromEntries(
    entries: ReadonlyArray<LedgerEntry>,
    auditByEntry: ReadonlyMap<string, ReadonlyArray<import("../core/entities/payment-audit-comment.entity").PaymentAuditComment>>,
  ): ParentSummaryResult {
    // Group entries by tutor name.
    const byTutor = new Map<string, LedgerEntry[]>();
    for (const e of entries) {
      const key = (e.tutorName ?? "").trim();
      const arr = byTutor.get(key) ?? [];
      arr.push(e);
      byTutor.set(key, arr);
    }

    const parents: ParentSummaryRow[] = [];
    let grandTotalDevisAnnuel = 0;
    let grandTotalVersements = 0;
    let grandTotalCreance = 0;
    let totalChildren = 0;

    for (const [tutorName, familyEntries] of byTutor.entries()) {
      familyEntries.sort((a, b) =>
        (a.studentName ?? "").localeCompare(b.studentName ?? ""),
      );

      const children: ParentSummaryChild[] = [];
      let familyDevisAnnuel = 0;
      let familyTotalVersements = 0;
      let familyTotalCreance = 0;
      let isFamilyClosed = familyEntries.length > 0;
      let lastPaymentDate: { day: number | null; month: number | null; year: number | null } | null = null;

      for (const e of familyEntries) {
        const comments = auditByEntry.get(e.id.value) ?? [];
        const auditTrail = summariseAuditTrail(comments);
        const closedState: ClosedState = getClosedStateForEntry(comments);

        children.push({
          ledgerEntryId: e.id.value,
          studentName: e.studentName ?? "",
          level: e.level,
          classCode: e.classCode,
          devisAnnuel: e.devisAnnuel ?? 0,
          totalVersements: e.totalVersements ?? 0,
          totalCreance: e.totalCreance ?? 0,
          isClosed: closedState.isClosed,
          auditTrail,
        });

        familyDevisAnnuel += e.devisAnnuel ?? 0;
        familyTotalVersements += e.totalVersements ?? 0;
        familyTotalCreance += e.totalCreance ?? 0;
        if (!closedState.isClosed) isFamilyClosed = false;
        if (auditTrail.lastPaymentDate) {
          if (
            lastPaymentDate === null ||
            compareDates(auditTrail.lastPaymentDate, lastPaymentDate) > 0
          ) {
            lastPaymentDate = auditTrail.lastPaymentDate;
          }
        }
      }

      parents.push({
        tutorName,
        children,
        childCount: children.length,
        familyDevisAnnuel,
        familyTotalVersements,
        familyTotalCreance,
        isFamilyClosed,
        lastPaymentDate,
      });

      grandTotalDevisAnnuel += familyDevisAnnuel;
      grandTotalVersements += familyTotalVersements;
      grandTotalCreance += familyTotalCreance;
      totalChildren += children.length;
    }

    parents.sort((a, b) => a.tutorName.localeCompare(b.tutorName));

    return {
      parents,
      parentCount: parents.length,
      totalChildren,
      grandTotalDevisAnnuel,
      grandTotalVersements,
      grandTotalCreance,
    };
  }
}

/**
 * Compare two partial dates (day/month/year, any of which may be null).
 *
 * Returns >0 if `a` is later than `b`, <0 if earlier, 0 if equal.
 * Null year/month/day are treated as 0 for comparison.
 *
 * Used to find the most recent payment date across a family's audit
 * trails. The comparison is intentionally lenient — a date with a
 * null year is treated as "earlier" than one with a known year.
 */
function compareDates(
  a: { day: number | null; month: number | null; year: number | null },
  b: { day: number | null; month: number | null; year: number | null },
): number {
  const ya = a.year ?? 0;
  const yb = b.year ?? 0;
  if (ya !== yb) return ya - yb;
  const ma = a.month ?? 0;
  const mb = b.month ?? 0;
  if (ma !== mb) return ma - mb;
  const da = a.day ?? 0;
  const db = b.day ?? 0;
  return da - db;
}
