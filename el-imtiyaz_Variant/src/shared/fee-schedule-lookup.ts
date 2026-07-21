/**
 * Fee Schedule Lookup — a level-keyed lookup helper that mirrors the
 * operator's mental "price menu" in the source Excel workbook.
 *
 * ── Iteration 5 / Fix #39 (issue §3) ───────────────────────────────
 * Background (software_review.md issue §3 — "The Fee Schedule Is a
 * Flat List, Not a Lookup Table"):
 *   The original `DEFAULT_FEE_SCHEDULE` was a flat array of single
 *   amounts (registration=25000, tuition=205000, transport_base=35000,
 *   transport_premium=55000). The real Excel workbook uses tiered
 *   pricing indexed by `level` (column G) and `destination` (column V).
 *
 *   Iteration 2 (Fix #9 / #10 / #11) added the level-indexed pricing
 *   tables to `shared/pricing.ts` (`resolveRegistration`,
 *   `resolveTuition`, `resolveTransportAmount`). This module wraps
 *   those helpers in a single composite lookup so the caller can ask
 *   "give me the full fee schedule for THIS row's level + destination"
 *   in one call, instead of three.
 *
 *   The composite lookup is the architectural piece the original
 *   review asked for: a "lookup table with composite keys". The
 *   `FeeScheduleLookup` interface is intentionally pure (no DB, no
 *   side effects) so it can be unit-tested in isolation and reused
 *   by both the LedgerService fallback and the UI's "preview pricing"
 *   widget.
 */

import {
  resolveRegistration,
  resolveTuition,
  resolveTransportAmount,
  resolveTransportTier,
  resolveTransportInstallments,
  TransportTier,
  type TransportInstallments,
} from "./pricing";
import type { LevelCode } from "./level-codes";

/**
 * The full set of pricing components for a single student row,
 * resolved from the level + destination + transport-option triad.
 *
 * This is the software equivalent of the operator's mental "price
 * menu" lookup: "for a PRIM student with TRNSP to Boudouaou, the
 * registration is 25k, tuition is 205k, transport is 52k".
 */
export interface FeeScheduleLookupResult {
  /** Student level (normalised uppercase). */
  level: string;
  /** Registration fee for this level (DZD). */
  registration: number;
  /** Tuition fee for this level (DZD). */
  tuition: number;
  /** Whether the student has OPTION=TRNSP. */
  hasTransport: boolean;
  /** Transport destination (normalised uppercase), or empty string. */
  destination: string;
  /** Transport tier, or null when the student has no transport. */
  transportTier: TransportTier | null;
  /** Resolved transport amount (DZD), or 0 when no transport. */
  transport: number;
  /** Per-tier (T1, T2, T3) installment breakdown, or null. */
  transportInstallments: TransportInstallments | null;
  /**
   * The total annual fee for this row, computed as
   *   registration + tuition + transport
   * (mirrors the most common Excel L-formula pattern). The caller
   * can subtract `remise` separately to match the `-J` pattern, or
   * omit the subtraction to match the no-`-J` pattern (issue 1.5).
   */
  totalBeforeRemise: number;
}

/**
 * Resolve the full fee-schedule lookup for a student row.
 *
 * @param level         The student's `level` (column G). Null/undefined
 *                      falls back to PRIM rates with an advisory log.
 * @param destination   The student's transport destination (column V).
 *                      Null/undefined/empty means no transport.
 * @param optionCode    The student's OPTION (column I). Only "TRNSP"
 *                      activates transport; everything else (including
 *                      "TENSP", "TRNP", or empty) means no transport.
 *                      Case-insensitive.
 *
 * Example:
 *   const r = resolveFeeScheduleForRow("PRIM", "BOUDOUAOU", "TRNSP");
 *   // → { level: "PRIM", registration: 25000, tuition: 205000,
 *   //     hasTransport: true, destination: "BOUDOUAOU",
 *   //     transportTier: "medium", transport: 52000, ...,
 *   //     totalBeforeRemise: 282000 }
 *
 *   const r2 = resolveFeeScheduleForRow("LYC", "", "");
 *   // → { level: "LYC", registration: 30000, tuition: 340000,
 *   //     hasTransport: false, destination: "",
 *   //     transportTier: null, transport: 0, ...,
 *   //     totalBeforeRemise: 370000 }
 */
export function resolveFeeScheduleForRow(
  level: string | null | undefined,
  destination: string | null | undefined,
  optionCode: string | null | undefined,
): FeeScheduleLookupResult {
  const normalisedLevel = (level ?? "").toString().trim().toUpperCase();
  const registration = resolveRegistration(normalisedLevel);
  const tuition = resolveTuition(normalisedLevel);

  // Issue 8.4: OPTION=TRNSP alone does NOT activate transport — the
  // destination must also be populated. Excel rows with OPTION=TRNSP
  // but no destination (operator forgot) get NO transport component.
  const hasTransportOption = (optionCode ?? "").toString().trim().toUpperCase() === "TRNSP";
  const normalisedDestination = (destination ?? "").toString().trim();
  const hasTransport = hasTransportOption && !!normalisedDestination;
  const effectiveDestination = hasTransport ? normalisedDestination : "";

  const transportTier = hasTransport && effectiveDestination
    ? resolveTransportTier(effectiveDestination)
    : null;
  const transport = hasTransport && effectiveDestination
    ? resolveTransportAmount(effectiveDestination)
    : 0;
  const transportInstallments = hasTransport && effectiveDestination
    ? resolveTransportInstallments(effectiveDestination)
    : null;

  const totalBeforeRemise = registration + tuition + transport;

  return {
    level: normalisedLevel || "(unspecified)",
    registration,
    tuition,
    hasTransport,
    destination: effectiveDestination.toUpperCase(),
    transportTier,
    transport,
    transportInstallments,
    totalBeforeRemise,
  };
}

/**
 * Helper: compute the expected devis for a row given the level,
 * destination, option code, and remise. This is the same computation
 * the LedgerService fallback performs, exposed as a pure function so
 * the UI can preview pricing without going through the service.
 *
 * When `omitRemise` is true, the remise is NOT subtracted — matching
 * Excel rows like `L5: =25000+305000+52000` (no `-J5`). See issue 1.5.
 *
 * The result is clamped to >= 0 (issue 8.3).
 */
export function previewDevisForRow(
  level: string | null | undefined,
  destination: string | null | undefined,
  optionCode: string | null | undefined,
  remise: number | null | undefined,
  options: { omitRemise?: boolean } = {},
): number {
  const lookup = resolveFeeScheduleForRow(level, destination, optionCode);
  const useRemise = !options.omitRemise;
  const remiseTerm = useRemise ? (Number(remise) || 0) : 0;
  const raw = lookup.totalBeforeRemise - remiseTerm;
  return Math.max(0, raw);
}

/**
 * Convenience: list all canonical levels and their registration +
 * tuition rates. Useful for the UI's "fee schedule editor" page.
 */
export function listAllLevelPricing(): Array<{
  level: LevelCode;
  registration: number;
  tuition: number;
}> {
  // Importing inline to avoid a circular import in case `pricing.ts`
  // ever imports from this module (it doesn't today, but defensive).
  // The cast through `unknown` is intentional — `LevelCode` is a
  // string-literal union, and we want to iterate over its values.
  const { REGISTRATION_BY_LEVEL, TUITION_BY_LEVEL } =
    require("./pricing") as typeof import("./pricing");
  const levels = Object.keys(REGISTRATION_BY_LEVEL) as LevelCode[];
  return levels.map((level) => ({
    level,
    registration: REGISTRATION_BY_LEVEL[level],
    tuition: TUITION_BY_LEVEL[level],
  }));
}
