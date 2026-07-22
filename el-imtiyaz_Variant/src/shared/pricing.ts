/**
 * Pricing tables — multi-tier fee lookups for registration, tuition,
 * and transport, mirroring the operator's mental price menu in the
 * source Excel workbook.
 *
 * Background (issues 1.1, 1.2, 1.3, 1.4, 1.6 from software_review.md):
 * The original `DEFAULT_FEE_SCHEDULE` was a flat list of single amounts
 * (registration=25000, tuition=205000, transport_base=35000,
 * transport_premium=55000). The real Excel workbook uses tiered
 * pricing indexed by `level` (column G) and `destination` (column V),
 * with at least 4 registration tiers, 6+ tuition tiers, and 4
 * transport tiers. The flat schedule silently overcharged pre-school
 * students by 7,000 DZD and undercharged Collège/Lycée students by
 * 5,000–160,000 DZD.
 *
 * The values in this module come from the Obsidian vault
 * (`08 - Appendix/Price Table.md` and
 * `03 - Columns and Codes/Town List (DISTINATION).md`), which
 * reconstructed the price menu from the actual L formulas in the
 * ETAT 20262027 sheet and the typed values in the Devis sheet.
 *
 * Lookups are intentionally permissive: unknown level / destination
 * combinations fall back to the most common (PRIM / standard-tier)
 * value, with an advisory log line. This mirrors how the operator in
 * Excel would default to "the usual rate" when unsure.
 */

import { logger } from "../infrastructure/logger/logger";
import { LevelCode } from "./level-codes";

// ── Registration fees (issue 1.1) ────────────────────────────────────

/**
 * Registration fee by student level, in DZD.
 *
 * Source: `Price Table.md` — "Registration fees (Frais d'Inscription, FI)"
 *
 * Excel evidence:
 *   Row with GS student:   =18000+125000+35000-J   (registration = 18,000)
 *   Row with PRIM student: =25000+205000+35000-J   (registration = 25,000)
 *   Row with COLG+TRNSP:   =30000+305000+52000     (registration = 30,000)
 */
export const REGISTRATION_BY_LEVEL: Readonly<Record<LevelCode, number>> = {
  MS: 18000,        // Pre-school tier 1
  GS: 18000,        // Pre-school tier 2
  PRIM: 25000,      // Primary
  COLG: 30000,      // Collège
  LYC: 30000,       // Lycée
  AUTISTE: 25000,   // Specialised division — same as PRIM (no documented rate)
  // NV* codes: new/special-admission students. Default to PRIM rate.
  NV2: 25000,
  NV3: 25000,
  NV4: 25000,
  NV5: 25000,
};

/** Default registration fee, used when the level is unknown. */
export const DEFAULT_REGISTRATION = 25000;

/**
 * Resolve the registration fee for a student level.
 *
 * Returns the canonical amount for the level, or `DEFAULT_REGISTRATION`
 * (25,000 DZD, the most common rate) if the level is unrecognised.
 * Logs an advisory warning on unrecognised levels so operators can
 * spot typos.
 */
export function resolveRegistration(level: string | null | undefined): number {
  if (!level) return DEFAULT_REGISTRATION;
  const key = String(level).trim().toUpperCase();
  if (key in REGISTRATION_BY_LEVEL) {
    return REGISTRATION_BY_LEVEL[key as LevelCode];
  }
  logger.warn("pricing.registration.unknownLevel", {
    level,
    fallback: DEFAULT_REGISTRATION,
  });
  return DEFAULT_REGISTRATION;
}

// ── Tuition fees (issue 1.2) ────────────────────────────────────────

/**
 * Tuition fee by student level, in DZD.
 *
 * Source: `Price Table.md` — "Tuition (Frais Scolarisation)"
 *
 * We use the most common rate per level (the lower bound of the
 * documented range):
 *   - MS/GS: 125,000 DZD
 *   - PRIM:  205,000 DZD (CP/CE1/CE2 — most common primary rate)
 *   - COLG:  305,000 DZD (1AAM–4AAM)
 *   - LYC:   340,000 DZD (1AS — lowest lycée rate)
 *   - AUTISTE: 283,000 DZD (documented in the original review)
 *
 * Variants (165k, 170k, 180k, 210k, 220k, 230k, 248k, 250k, 280k,
 * 285k, 320k, 330k, 355k, 365k) are NOT in this table — they
 * represent sibling rates, transport-bundled rates, or year-specific
 * adjustments. Operators can still enter them manually via the
 * ledger-entry form; this table only drives the fallback computation.
 */
export const TUITION_BY_LEVEL: Readonly<Record<LevelCode, number>> = {
  MS: 125000,
  GS: 125000,
  PRIM: 205000,
  COLG: 305000,
  LYC: 340000,
  AUTISTE: 283000,
  // NV* codes: default to PRIM tuition (most common).
  NV2: 205000,
  NV3: 205000,
  NV4: 205000,
  NV5: 205000,
};

/** Default tuition fee, used when the level is unknown. */
export const DEFAULT_TUITION = 205000;

/**
 * Resolve the tuition fee for a student level.
 *
 * Returns the canonical amount for the level, or `DEFAULT_TUITION`
 * (205,000 DZD, the PRIM rate) if the level is unrecognised.
 */
export function resolveTuition(level: string | null | undefined): number {
  if (!level) return DEFAULT_TUITION;
  const key = String(level).trim().toUpperCase();
  if (key in TUITION_BY_LEVEL) {
    return TUITION_BY_LEVEL[key as LevelCode];
  }
  logger.warn("pricing.tuition.unknownLevel", {
    level,
    fallback: DEFAULT_TUITION,
  });
  return DEFAULT_TUITION;
}

// ── Transport fees (issues 1.3, 1.4) ────────────────────────────────

/**
 * Transport zone tiers — the 4 tiers documented in the vault.
 *
 * Source: `Town List (DISTINATION).md` and `Price Table.md`
 *
 * | Tier | Amount (DZD) | Towns |
 * |------|--------------|-------|
 * | 1 (nearby)     | 35,000 | BOUMERDES, CORSO, SAHEL, FIGUIER, BENYOUNES |
 * | 2 (intermediate)| 43,000 | ZEMOURI, THENIA (rarely used on ETAT) |
 * | 3 (medium)     | 52,000 | BOUDOUAOU, OULED MOUSSA, KHEMIS KHENCHELA, TIDJELABINE |
 * | 4 (far)        | 55,000 | CAP DJENET (DJENAT), BORDJ MNAIL, ISSER, SI MUSTAPHA, REGHIAA, ROUIBA |
 *
 * The previous `DEFAULT_FEE_SCHEDULE` only had two tiers (`transport_base`
 * = 35,000 and `transport_premium` = 55,000), missing the 43,000 and
 * 52,000 tiers entirely. This module adds all four and provides a
 * destination-based lookup.
 */
export enum TransportTier {
  NEARBY = "nearby",           // 35,000 DZD
  INTERMEDIATE = "intermediate", // 43,000 DZD
  MEDIUM = "medium",           // 52,000 DZD
  FAR = "far",                 // 55,000 DZD
}

export const TRANSPORT_AMOUNT_BY_TIER: Readonly<Record<TransportTier, number>> = {
  [TransportTier.NEARBY]: 35000,
  [TransportTier.INTERMEDIATE]: 43000,
  [TransportTier.MEDIUM]: 52000,
  [TransportTier.FAR]: 55000,
};

/**
 * Town → transport tier mapping.
 *
 * The keys are the canonical uppercased town names from the REF sheet.
 * Spelling variants (e.g. "BOUMREDES" vs "BOUMERDES") are normalised
 * via `normaliseTownName()` before lookup. Towns not in the map fall
 * back to `TransportTier.NEARBY` (the cheapest tier) with an advisory
 * warning — matching how the operator would default to the local rate
 * when unsure.
 *
 * Source: `Town List (DISTINATION).md` — "How the town drives the
 * transport fee" table.
 */
const TOWN_TO_TIER: Readonly<Record<string, TransportTier>> = {
  // Tier 1 (nearby) — 35,000
  BOUMERDES: TransportTier.NEARBY,
  CORSO: TransportTier.NEARBY,
  SAHEL: TransportTier.NEARBY,
  FIGUIER: TransportTier.NEARBY,
  BENYOUNES: TransportTier.NEARBY,

  // Tier 2 (intermediate) — 43,000
  ZEMOURI: TransportTier.INTERMEDIATE,
  THENIA: TransportTier.INTERMEDIATE,

  // Tier 3 (medium) — 52,000
  BOUDOUAOU: TransportTier.MEDIUM,
  "OULED MOUSSA": TransportTier.MEDIUM,
  "OULEDMOUSSA": TransportTier.MEDIUM,
  "KHEMIS KHENCHELA": TransportTier.MEDIUM,
  "KHEMIS KHCHNA": TransportTier.MEDIUM,
  "KHEMISKHCHNA": TransportTier.MEDIUM,
  TIDJELABINE: TransportTier.MEDIUM,

  // Tier 4 (far) — 55,000
  "CAP DJENET": TransportTier.FAR,
  DJENAT: TransportTier.FAR,
  "BORDJ MNAIL": TransportTier.FAR,
  BORDJMNAIL: TransportTier.FAR,
  ISSER: TransportTier.FAR,
  "SI MUSTAPHA": TransportTier.FAR,
  REGHIAA: TransportTier.FAR,
  REGHAIA: TransportTier.FAR,
  ROUIBA: TransportTier.FAR,
};

/**
 * Normalise a town name for lookup: uppercase, collapse whitespace,
 * strip trailing postal codes (e.g. "BOUMERDES20000" → "BOUMERDES").
 */
export function normaliseTownName(town: string | null | undefined): string {
  if (!town) return "";
  let s = String(town).trim().toUpperCase();
  // Strip trailing digits (postal codes like "20000")
  s = s.replace(/\s*(\d{4,5})\s*$/, "");
  // Collapse internal whitespace
  s = s.replace(/\s+/g, " ");
  return s;
}

/**
 * Resolve the transport tier for a destination town.
 *
 * Returns `null` when the town is empty (no transport) or `TransportTier.NEARBY`
 * as a fallback when the town is unrecognised (with an advisory warning).
 */
export function resolveTransportTier(
  town: string | null | undefined,
): TransportTier | null {
  if (!town) return null;
  const key = normaliseTownName(town);
  if (!key) return null;
  if (key in TOWN_TO_TIER) {
    return TOWN_TO_TIER[key];
  }
  logger.warn("pricing.transport.unknownTown", {
    town,
    normalised: key,
    fallback: TransportTier.NEARBY,
  });
  return TransportTier.NEARBY;
}

/**
 * Resolve the transport amount for a destination town.
 *
 * Returns 0 when the town is empty (no transport), the canonical
 * tier amount when recognised, or 35,000 (NEARBY) as a fallback.
 */
export function resolveTransportAmount(
  town: string | null | undefined,
): number {
  const tier = resolveTransportTier(town);
  if (tier === null) return 0;
  return TRANSPORT_AMOUNT_BY_TIER[tier];
}

/**
 * Check whether a town name is in the canonical transport-pricing
 * table (i.e. `resolveTransportTier()` would NOT fall back to
 * NEARBY for it).
 *
 * Exposed publicly so the TransportPricingService (issue 8.2) and
 * the UI can warn the operator when they type an unknown
 * destination.
 *
 * ── Iteration 6 / Fix #44 ──────────────────────────────────────────
 */
export function isTransportDestinationRecognised(
  town: string | null | undefined,
): boolean {
  if (!town) return false;
  const key = normaliseTownName(town);
  if (!key) return false;
  return key in TOWN_TO_TIER;
}

/**
 * Backwards-compatible transport tier names that map to the
 * `FeeScheduleLineType` strings. The fee schedule still uses
 * `transport_base` and `transport_premium`; we add `transport_intermediate`
 * and `transport_medium` for the two missing tiers (issue 1.3).
 */
export const TRANSPORT_TIER_TO_LINE_TYPE: Readonly<Record<TransportTier, string>> = {
  [TransportTier.NEARBY]: "transport_base",
  [TransportTier.INTERMEDIATE]: "transport_intermediate",
  [TransportTier.MEDIUM]: "transport_medium",
  [TransportTier.FAR]: "transport_premium",
};

// ── Issue 4.3: Transport installment (tranche) breakdown per tier ──────
//
// Background (software_review.md issue 4.3):
//   The previous DEFAULT_FEE_SCHEDULE hard-coded transport tranches as
//   T1=30,000, T2=15,000, T3=10,000 for every student. The Excel
//   workbook's REF sheet documents that the installment split depends
//   on the destination tier — the same total transport fee is paid
//   back in different sized chunks depending on the route:
//
//     Tier 1 (nearby,        35,000 total) → 20,000 / 10,000 / 5,000
//     Tier 2 (intermediate,  43,000 total) → 25,000 / 12,000 / 6,000
//     Tier 3 (medium,        52,000 total) → 30,000 / 12,000 / 10,000
//     Tier 4 (far,           55,000 total) → 30,000 / 15,000 / 10,000
//
//   Source: `suivis-clients-vault-text-only-no-code/04 - Sheets/REF —
//   Reference Tables.md` (town transport zones table).
//
//   This fixes the "transport tranches fixed at 30k/15k/10k" gap by
//   exposing the per-tier installment breakdown. The DEFAULT_FEE_SCHEDULE
//   in `fee-schedule.entity.ts` keeps its flat fallback amounts (those
//   drive the *initial* schedule that operators can edit); the new
//   `resolveTransportInstallments()` helper is what services should call
//   to know the expected split for a given destination.
//
//   The check is advisory only — the operator can always type a
//   different amount into T1/T2/T3 if the family negotiated a custom
//   payment plan. The lookup is used by validation logic and by the
//   ingestion importer to flag rows whose typed installments don't
//   match the documented tier breakdown.

export interface TransportInstallments {
  /** Total annual transport fee (matches `TRANSPORT_AMOUNT_BY_TIER`). */
  total: number;
  /** First tranche (Excel column W). */
  t1: number;
  /** Second tranche (Excel column X). */
  t2: number;
  /** Third tranche (Excel column Y). */
  t3: number;
  /** The tier this breakdown belongs to. */
  tier: TransportTier;
}

export const TRANSPORT_INSTALLMENTS_BY_TIER: Readonly<
  Record<TransportTier, TransportInstallments>
> = {
  [TransportTier.NEARBY]: {
    tier: TransportTier.NEARBY,
    total: 35000,
    t1: 20000,
    t2: 10000,
    t3: 5000,
  },
  [TransportTier.INTERMEDIATE]: {
    tier: TransportTier.INTERMEDIATE,
    total: 43000,
    t1: 25000,
    t2: 12000,
    t3: 6000,
  },
  [TransportTier.MEDIUM]: {
    tier: TransportTier.MEDIUM,
    total: 52000,
    t1: 30000,
    t2: 12000,
    t3: 10000,
  },
  [TransportTier.FAR]: {
    tier: TransportTier.FAR,
    total: 55000,
    t1: 30000,
    t2: 15000,
    t3: 10000,
  },
};

/**
 * Resolve the documented (T1, T2, T3) installment breakdown for a
 * destination town. Returns `null` when the town is empty (no
 * transport) — matching the convention used by
 * `resolveTransportTier()`.
 *
 * The returned object includes the `total` transport fee for
 * convenience — it equals the sum of the three tranches, which in
 * turn matches `TRANSPORT_AMOUNT_BY_TIER[tier]`.
 *
 * Example:
 *   resolveTransportInstallments("Boudouaou")
 *     → { tier: "medium", total: 52000, t1: 30000, t2: 12000, t3: 10000 }
 *
 *   resolveTransportInstallments("Boumerdès")
 *     → { tier: "nearby", total: 35000, t1: 20000, t2: 10000, t3: 5000 }
 *
 *   resolveTransportInstallments("")
 *     → null
 */
export function resolveTransportInstallments(
  town: string | null | undefined,
): TransportInstallments | null {
  const tier = resolveTransportTier(town);
  if (tier === null) return null;
  return TRANSPORT_INSTALLMENTS_BY_TIER[tier];
}
