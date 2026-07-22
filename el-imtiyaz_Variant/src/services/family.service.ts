/**
 * FamilyService — groups ledger entries by family (tutor name) and
 * produces a consolidated statement.
 *
 * ── Iteration 6 / Fix #48 (issues 7.2 / 8.1) ──────────────────────
 * Background (software_review.md issue 7.2 — "Family grouping is
 * not implemented"):
 *   Excel's BON sheet groups multiple children under one parent
 *   (e.g., ABDELAOUI INES + ABDELAOUI SAMY under client ABDELAOUI).
 *   The software's ledger is per-student with no family-level
 *   aggregation view.
 *
 *   And issue 8.1 — "No Family Grouping Service":
 *   The BON sheet groups students by family (parent name) and
 *   produces a consolidated statement. The software has no service
 *   that:
 *   - Groups `LedgerEntry` records by `tutorName` or a family
 *     identifier
 *   - Sums devisAnnuel, totalVersements, totalCreance across
 *     siblings
 *   - Produces a family-level view
 *
 *   The `ParentRepository.getStudentIds()` exists but is never
 *   connected to the ledger.
 *
 *   This service is the missing piece. It reads ledger entries
 *   (optionally filtered by academic year) and groups them by
 *   `tutorName`. Each family group carries:
 *     - the tutor name (the family key)
 *     - the list of student ledger entries in the family
 *     - family-level totals (sum of devisAnnuel, totalVersements,
 *       totalCreance across siblings)
 *     - the family balance (= totalCreance sum — negative means
 *       the family overpaid)
 *
 *   The service is intentionally read-only and stateless. It
 *   composes cleanly with the existing LedgerRepository and can
 *   be mocked in tests by passing a fake repository.
 */

import type { LedgerRepository } from "../infrastructure/repositories/ledger-entry.repository";
import type { LedgerEntry } from "../core/entities/ledger-entry.entity";

/**
 * A single family group — one tutor name with all their children's
 * ledger entries and the family-level totals.
 */
export interface FamilyGroup {
  /** The tutor name (the family key). Mirrors Excel's column E. */
  tutorName: string;
  /** All ledger entries in this family, sorted by student name. */
  entries: LedgerEntry[];
  /** Count of children (ledger entries) in the family. */
  studentCount: number;
  /** Sum of `devisAnnuel` across all entries in the family. */
  familyDevisAnnuel: number;
  /** Sum of `totalVersements` across all entries in the family. */
  familyTotalVersements: number;
  /** Sum of `totalCreance` across all entries in the family. */
  familyTotalCreance: number;
  /**
   * Family balance = `familyTotalCreance`.
   *
   * Positive → the family still owes money.
   * Zero → the family is settled.
   * Negative → the family overpaid (issue 8.2 — Excel allows this).
   */
  familyBalance: number;
  /**
   * Whether the family has more than one child (the sibling case).
   * Single-child families are still returned but flagged here so
   * the UI can collapse them.
   */
  isSiblingFamily: boolean;
}

/**
 * Result of grouping all ledger entries by family.
 */
export interface FamilyGroupingResult {
  /** All family groups, sorted by tutor name (alphabetical). */
  families: FamilyGroup[];
  /** Total number of families. */
  familyCount: number;
  /** Total number of ledger entries across all families. */
  totalEntries: number;
  /** Grand-total devisAnnuel across all families. */
  grandTotalDevisAnnuel: number;
  /** Grand-total totalVersements across all families. */
  grandTotalVersements: number;
  /** Grand-total totalCreance across all families. */
  grandTotalCreance: number;
  /** Count of families with more than one child. */
  siblingFamilyCount: number;
}

/**
 * Stateless service that groups ledger entries by family.
 *
 * The service depends only on the LedgerRepository (read-only).
 * It does NOT persist anything — the family grouping is a
 * derived view, recomputed on each call.
 */
export class FamilyService {
  readonly serviceName = "FamilyService";

  constructor(private readonly ledger: LedgerRepository) {}

  /**
   * Group all ledger entries by tutor name.
   *
   * Entries with no `tutorName` are grouped under the empty
   * string "" — the UI can decide whether to filter them out
   * or display them as "(unassigned)".
   *
   * @param academicYearId  Optional academic-year filter. When
   *                        set, only entries for that year are
   *                        grouped.
   */
  async groupByFamily(academicYearId?: string): Promise<FamilyGroupingResult> {
    const entries = await this.ledger.list({
      academicYearId,
      pageSize: 10000,
    });
    return this.groupEntries(entries);
  }

  /**
   * Get a single family's group by tutor name.
   *
   * Returns null when no entries match the tutor name.
   */
  async getFamilyByTutor(
    tutorName: string,
    academicYearId?: string,
  ): Promise<FamilyGroup | null> {
    if (!tutorName) return null;
    const all = await this.groupByFamily(academicYearId);
    return all.families.find((f) => f.tutorName === tutorName) ?? null;
  }

  /**
   * Group a pre-fetched list of ledger entries by family.
   *
   * Exposed publicly so tests can pass in mock entries without
   * having to mock the repository.
   */
  groupEntries(entries: ReadonlyArray<LedgerEntry>): FamilyGroupingResult {
    const byTutor = new Map<string, LedgerEntry[]>();
    for (const e of entries) {
      const key = (e.tutorName ?? "").trim();
      const arr = byTutor.get(key) ?? [];
      arr.push(e);
      byTutor.set(key, arr);
    }

    const families: FamilyGroup[] = [];
    let grandTotalDevisAnnuel = 0;
    let grandTotalVersements = 0;
    let grandTotalCreance = 0;
    let siblingFamilyCount = 0;

    for (const [tutorName, familyEntries] of byTutor.entries()) {
      // Sort entries by student name within the family.
      familyEntries.sort((a, b) =>
        (a.studentName ?? "").localeCompare(b.studentName ?? ""),
      );

      let familyDevisAnnuel = 0;
      let familyTotalVersements = 0;
      let familyTotalCreance = 0;
      for (const e of familyEntries) {
        familyDevisAnnuel += e.devisAnnuel ?? 0;
        familyTotalVersements += e.totalVersements ?? 0;
        familyTotalCreance += e.totalCreance ?? 0;
      }

      const isSiblingFamily = familyEntries.length > 1;
      if (isSiblingFamily) siblingFamilyCount++;

      families.push({
        tutorName,
        entries: familyEntries,
        studentCount: familyEntries.length,
        familyDevisAnnuel,
        familyTotalVersements,
        familyTotalCreance,
        familyBalance: familyTotalCreance,
        isSiblingFamily,
      });

      grandTotalDevisAnnuel += familyDevisAnnuel;
      grandTotalVersements += familyTotalVersements;
      grandTotalCreance += familyTotalCreance;
    }

    // Sort families alphabetically by tutor name. The empty-tutor
    // family (if any) sorts first.
    families.sort((a, b) => a.tutorName.localeCompare(b.tutorName));

    return {
      families,
      familyCount: families.length,
      totalEntries: entries.length,
      grandTotalDevisAnnuel,
      grandTotalVersements,
      grandTotalCreance,
      siblingFamilyCount,
    };
  }
}
