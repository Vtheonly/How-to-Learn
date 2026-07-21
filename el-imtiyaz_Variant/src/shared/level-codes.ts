/**
 * Level-code constants — the school-division codes used in Excel column G
 * (`niveau`) of the `ETAT 20262027` sheet, plus the special `NV*` codes
 * used for new/special-admission students.
 *
 * Background (issue 8.6 in software_review.md): the source workbook uses
 * `NV2`, `NV3`, `NV4`, `NV5` as level codes for special/new students,
 * but the software's `StudentStatus` enum had no equivalent and there was
 * no validation list anywhere in the codebase. Imported rows therefore
 * carried the raw code in `LedgerEntry.level` with no validation and no
 * documentation of what codes are valid.
 *
 * This module makes the catalogue explicit. The list is intentionally
 * permissive (validation is `isValidLevelCode`, not a hard error) so
 * legacy rows with unexpected codes still import — but downstream code
 * now has a single source of truth for the canonical set.
 */

/**
 * The canonical school-division level codes used in column G (`niveau`).
 *
 * Source: `suivis-clients-vault-text-only-no-code/03 - Columns and Codes/
 * Level Codes (niveau).md` plus the ETAT sheet's actual data.
 */
export const LEVEL_CODES = [
  // Pre-school
  "MS",       // Moyenne Section (ages 3–4)
  "GS",       // Grande Section (ages 4–5)

  // Primary
  "PRIM",     // Primaire (CP to CM2)

  // Middle school
  "COLG",     // Collège (1AAM to 4AAM)

  // High school
  "LYC",      // Lycée (1AS to 3AS)

  // Specialised division
  "AUTISTE",  // Specialised autism-education division

  // New / special-admission codes (issue 8.6)
  // These are used by the spreadsheet for students whose final level
  // placement is pending or who joined mid-year. They are NOT student
  // statuses (which live in StudentStatus) — they're level codes that
  // appear in column G alongside PRIM/COLG/LYC.
  "NV2",
  "NV3",
  "NV4",
  "NV5",
] as const;

export type LevelCode = (typeof LEVEL_CODES)[number];

/** Set form for O(1) membership checks. */
const LEVEL_CODE_SET: ReadonlySet<string> = new Set(LEVEL_CODES);

/**
 * Returns true if `code` is one of the canonical level codes recognised
 * by the spreadsheet. The check is case-insensitive (Excel operators
 * sometimes type `prim` instead of `PRIM`).
 *
 * Unknown codes are NOT rejected — the spreadsheet itself contains
 * occasional ad-hoc values, and we don't want to break imports. This
 * function is intended for advisory validation, UI dropdowns, and
 * reporting categorisation.
 */
export function isValidLevelCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return LEVEL_CODE_SET.has(String(code).trim().toUpperCase());
}

/**
 * Normalise a level code to its canonical uppercase form, or return
 * `null` if the code is unrecognised. Useful when promoting a raw
 * ledger string into a typed enum value.
 */
export function normaliseLevelCode(
  code: string | null | undefined,
): LevelCode | null {
  if (!code) return null;
  const upper = String(code).trim().toUpperCase();
  return LEVEL_CODE_SET.has(upper) ? (upper as LevelCode) : null;
}

/**
 * Human-readable label for each level code. Used by the UI and by
 * reporting tools to render the codes in a friendly way.
 */
export const LEVEL_CODE_LABELS: Record<LevelCode, string> = {
  MS: "Moyenne Section (Pre-school 1)",
  GS: "Grande Section (Pre-school 2)",
  PRIM: "Primaire (Primary)",
  COLG: "Collège (Middle School)",
  LYC: "Lycée (High School)",
  AUTISTE: "Specialised Autism Education",
  NV2: "New/Special Admission — NV2",
  NV3: "New/Special Admission — NV3",
  NV4: "New/Special Admission — NV4",
  NV5: "New/Special Admission — NV5",
};
