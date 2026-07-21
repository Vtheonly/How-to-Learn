/**
 * Quote-block dropdown values — the canonical lists that the Excel
 * `Devis` sheet's data-validation dropdowns reference (issue 5.5 in
 * software_review.md).
 *
 * Background: the Excel workbook defines five named ranges
 * (`CLASSE`, `FI`, `FRAISSCOLAIRE`, `SERVICE`, `transport`) that
 * populate the dropdowns on the Devis sheet's line-item rows
 * (D15:H26 of each block). In the actual workbook, those named
 * ranges all point to non-existent cells — every dropdown is broken.
 *
 * The software previously had NO validation for these fields at all.
 * Operators could type arbitrary strings into `classe`, `fi`,
 * `fraisScolaire`, `service`, and `transport`, and the quote block
 * would silently accept them. This module reconstructs the canonical
 * lists from the Obsidian vault and exposes a validator that surfaces
 * advisory warnings for unrecognised values — without blocking the
 * save, mirroring Excel's permissive behaviour.
 *
 * Sources:
 *   - `suivis-clients-vault-text-only-no-code/03 - Columns and Codes/
 *     Vocabulary-Dictionary.md` (class codes & level codes)
 *   - `suivis-clients-vault-text-only-no-code/04 - Sheets/REF —
 *     Reference Tables.md` (parent names, town list)
 *   - `suivis-clients-vault-text-only-no-code/04 - Sheets/Devis —
 *     Quotes.md` (block layout & dropdown columns)
 *   - `shared/pricing.ts` (registration, tuition, transport tiers)
 */

import {
  REGISTRATION_BY_LEVEL,
  TUITION_BY_LEVEL,
  TRANSPORT_AMOUNT_BY_TIER,
  TransportTier,
} from "./pricing";
import { LEVEL_CODES, LevelCode } from "./level-codes";

// ── CLASSE dropdown (column D) ─────────────────────────────────────────
//
// The Devis sheet's CLASSE dropdown should contain every class code
// the school uses. The REF sheet's `NIVEAU` named range documents
// these. We list both the level codes (PRIM, COLG, LYC, MS, GS,
// AUTISTE, NV2-NV5) and the specific class codes (CP, CE1, CE2,
// CM1, CM2, 1AAM-4AAM, 1AS-3AS) — Excel's actual dropdown shows
// the specific codes, but operators sometimes enter the level code
// instead, so we accept both.

export const CLASSE_DROPDOWN_VALUES: readonly string[] = [
  // Pre-school
  "MS", "GS",
  // Primary
  "PRIM", "CP", "CE1", "CE2", "CM1", "CM2",
  // Middle school (Collège)
  "COLG", "1AAM", "2AAM", "3AAM", "4AAM",
  // High school (Lycée)
  "LYC", "1AS", "2AS", "3AS",
  // Specialised division
  "AUTISTE",
  // New / special-admission (issue 8.6)
  "NV2", "NV3", "NV4", "NV5",
];

// ── FI dropdown (column E) ─────────────────────────────────────────────
//
// The FI dropdown lists the valid registration-fee amounts. From the
// pricing table:
//   18,000 DZD  → MS/GS pre-school
//   25,000 DZD  → PRIM
//   30,000 DZD  → COLG/LYC
// The dropdown values are stored as strings (Excel data validation
// always works with strings); we expose both string and numeric
// forms for convenience.

export const FI_DROPDOWN_VALUES: readonly string[] = Object.values(
  REGISTRATION_BY_LEVEL,
)
  .map((n) => String(n))
  .filter((v, i, arr) => arr.indexOf(v) === i); // de-dup

// ── FRAISSCOLAIRE dropdown (column F) ──────────────────────────────────
//
// Tuition fee amounts, indexed by level. The Devis sheet's dropdown
// shows the canonical amount per level (operators pick the right one
// for the student's level). We expose the unique values from
// TUITION_BY_LEVEL.

export const FRAISSCOLAIRE_DROPDOWN_VALUES: readonly string[] = Object.values(
  TUITION_BY_LEVEL,
)
  .map((n) => String(n))
  .filter((v, i, arr) => arr.indexOf(v) === i);

// ── SERVICE dropdown (column G) ────────────────────────────────────────
//
// The SERVICE column on the Devis sheet holds a text label like
// "Transport", "Cafeteria", "Ratrapage", "PSY", "ORTH", or
// "E-PLANT". Excel's named range is broken, but the values are
// documented in the Obsidian vault's vocabulary dictionary.

export const SERVICE_DROPDOWN_VALUES: readonly string[] = [
  "Transport",
  "Cafeteria",
  "Ratrapage",
  "PSY",
  "ORTH",
  "E-PLANT",
  "Septembre",
  "Décembre",
  "Mars",
];

// ── transport dropdown (column H) ──────────────────────────────────────
//
// The transport dropdown lists the valid transport-fee amounts. From
// the pricing table, the four tiers are 35,000 / 43,000 / 52,000 /
// 55,000 DZD. We expose them as strings (Excel data-validation
// strings).

export const TRANSPORT_DROPDOWN_VALUES: readonly string[] = Object.values(
  TRANSPORT_AMOUNT_BY_TIER,
).map((n) => String(n));

// ── Validation helpers ─────────────────────────────────────────────────

export interface DropdownValidationWarning {
  field: "classe" | "fi" | "fraisScolaire" | "service" | "transport";
  value: string;
  message: string;
}

/**
 * Check whether a value is in a dropdown list. The comparison is
 * case-insensitive and whitespace-trimmed — Excel's data validation
 * is similarly permissive.
 */
function isInDropdown(value: string, list: readonly string[]): boolean {
  if (!value) return true; // empty values are allowed (Excel allows blanks)
  const v = String(value).trim().toUpperCase();
  return list.some((x) => String(x).trim().toUpperCase() === v);
}

/**
 * Validate a single line item's dropdown fields. Returns an array of
 * warnings — empty when everything matches the canonical lists. The
 * save is NOT blocked; these are advisory warnings only, mirroring
 * how Excel's broken named ranges would have shown empty dropdowns
 * but still accepted typed values.
 *
 * Issue 5.5 (iteration 4).
 */
export function validateQuoteLineItemDropdowns(item: {
  classe?: string;
  fi?: string;
  fraisScolaire?: string;
  service?: string;
  transport?: string;
}): DropdownValidationWarning[] {
  const warnings: DropdownValidationWarning[] = [];
  if (item.classe && !isInDropdown(item.classe, CLASSE_DROPDOWN_VALUES)) {
    warnings.push({
      field: "classe",
      value: item.classe,
      message:
        `Issue 5.5: classe value "${item.classe}" is not in the canonical ` +
        `CLASSE dropdown list. The Excel Devis sheet's named range is broken, ` +
        `but the documented values are: ${CLASSE_DROPDOWN_VALUES.join(", ")}. ` +
        `The save proceeds — verify the spelling.`,
    });
  }
  if (item.fi && !isInDropdown(item.fi, FI_DROPDOWN_VALUES)) {
    warnings.push({
      field: "fi",
      value: item.fi,
      message:
        `Issue 5.5: FI value "${item.fi}" is not in the canonical FI ` +
        `dropdown list (registration fees: ${FI_DROPDOWN_VALUES.join(", ")}). ` +
        `The save proceeds — verify the amount.`,
    });
  }
  if (item.fraisScolaire && !isInDropdown(item.fraisScolaire, FRAISSCOLAIRE_DROPDOWN_VALUES)) {
    warnings.push({
      field: "fraisScolaire",
      value: item.fraisScolaire,
      message:
        `Issue 5.5: fraisScolaire value "${item.fraisScolaire}" is not in the ` +
        `canonical FRAISSCOLAIRE dropdown list (tuition fees: ` +
        `${FRAISSCOLAIRE_DROPDOWN_VALUES.join(", ")}). The save proceeds — ` +
        `verify the amount.`,
    });
  }
  if (item.service && !isInDropdown(item.service, SERVICE_DROPDOWN_VALUES)) {
    warnings.push({
      field: "service",
      value: item.service,
      message:
        `Issue 5.5: service value "${item.service}" is not in the canonical ` +
        `SERVICE dropdown list (valid values: ${SERVICE_DROPDOWN_VALUES.join(", ")}). ` +
        `The save proceeds — verify the spelling.`,
    });
  }
  if (item.transport && !isInDropdown(item.transport, TRANSPORT_DROPDOWN_VALUES)) {
    warnings.push({
      field: "transport",
      value: item.transport,
      message:
        `Issue 5.5: transport value "${item.transport}" is not in the canonical ` +
        `transport dropdown list (valid amounts: ${TRANSPORT_DROPDOWN_VALUES.join(", ")}). ` +
        `The save proceeds — verify the amount.`,
    });
  }
  return warnings;
}

/**
 * Validate all line items in a quote block. Convenience wrapper
 * around `validateQuoteLineItemDropdowns` that aggregates warnings
 * across all items and tags each warning with the item's label for
 * easy debugging.
 */
export function validateQuoteBlockDropdowns(
  items: Array<{ label?: string; classe?: string; fi?: string; fraisScolaire?: string; service?: string; transport?: string }>,
): DropdownValidationWarning[] {
  const all: DropdownValidationWarning[] = [];
  for (const item of items) {
    const itemWarnings = validateQuoteLineItemDropdowns(item);
    for (const w of itemWarnings) {
      all.push({
        ...w,
        message: `[${item.label ?? "(unlabelled)"}] ${w.message}`,
      });
    }
  }
  return all;
}

// ── Convenience: which level code is this class? ───────────────────────
//
// Used by the quote-form UI to suggest the right FI/FRAISSCOLAIRE
// values when the operator picks a class. For example, picking
// "CE1" should suggest FI=25,000 and fraisScolaire=205,000 (both
// PRIM-tier amounts).

const CLASS_TO_LEVEL: Record<string, LevelCode> = {
  // Pre-school
  MS: "MS", GS: "GS",
  // Primary
  PRIM: "PRIM", CP: "PRIM", CE1: "PRIM", CE2: "PRIM", CM1: "PRIM", CM2: "PRIM",
  // Middle school
  COLG: "COLG", "1AAM": "COLG", "2AAM": "COLG", "3AAM": "COLG", "4AAM": "COLG",
  // High school
  LYC: "LYC", "1AS": "LYC", "2AS": "LYC", "3AS": "LYC",
  // Specialised
  AUTISTE: "AUTISTE",
  // New / special-admission
  NV2: "NV2", NV3: "NV3", NV4: "NV4", NV5: "NV5",
};

/**
 * Map a CLASSE code to its parent level code. Returns `null` for
 * unrecognised values. Useful for suggesting default FI and
 * FRAISSCOLAIRE amounts when the operator picks a class.
 *
 * Example:
 *   classToLevel("CE1") → "PRIM"
 *   classToLevel("3AS") → "LYC"
 *   classToLevel("unknown") → null
 */
export function classToLevel(classe: string | null | undefined): LevelCode | null {
  if (!classe) return null;
  const key = String(classe).trim().toUpperCase();
  return key in CLASS_TO_LEVEL ? CLASS_TO_LEVEL[key] : null;
}

// Re-export the level codes for callers that need the canonical list.
export { LEVEL_CODES, LevelCode };
