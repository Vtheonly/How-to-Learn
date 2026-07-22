/**
 * Formula lookup ranges — populates `ctx.ranges` so the formula engine's
 * `VLOOKUP`, `INDEX`, and `MATCH` functions can resolve named ranges
 * against the same pricing tables that the fallback formula uses.
 *
 * ── Iteration 6 / Fix #43 (issue 10.2 / item 18) ──────────────────
 * Background (software_review.md issue 10.2 — "No access to lookup
 * tables"):
 *   The formula engine supports `VLOOKUP` against named ranges in
 *   `ctx.ranges`. But `buildFormulaContext()` never populates
 *   `ranges`. There is no way to write:
 *
 *     VLOOKUP(destination, transportPrices, 2, 0)
 *
 *   because `transportPrices` is never injected into the context.
 *
 *   The same gap is restated at the bottom of the architectural
 *   analysis (item 18 — "No ranges in context"):
 *   > VLOOKUP support exists in engine but ranges never populated.
 *
 *   This module is the missing piece. It builds the three named
 *   ranges that mirror Excel's REF sheet:
 *
 *     - `LEVEL_PRICING`    — level → registration + tuition
 *     - `TRANSPORT_PRICES` — town → tier + transport amount + T1/T2/T3
 *     - `LEVEL_CODES`      — level code → label
 *
 *   Each range is an array of plain objects. The formula engine's
 *   VLOOKUP uses the first key as the lookup column (mirroring
 *   Excel's "first column of the range" convention), so the keys
 *   are ordered accordingly.
 *
 *   The lookup is intentionally pure (no DB, no side effects) so
 *   the same module can be unit-tested in isolation and reused by
 *   the LedgerService's `buildFormulaContext()` AND by the UI's
 *   "formula preview" widget.
 */

import {
  REGISTRATION_BY_LEVEL,
  TUITION_BY_LEVEL,
  TRANSPORT_AMOUNT_BY_TIER,
  TRANSPORT_INSTALLMENTS_BY_TIER,
  TransportTier,
  type TransportInstallments,
} from "./pricing";
import { LEVEL_CODES, LEVEL_CODE_LABELS, type LevelCode } from "./level-codes";

/**
 * A single row in the `LEVEL_PRICING` named range.
 *
 * Mirrors the operator's mental price menu:
 *   PRIM  → registration=25k, tuition=205k
 *   COLG  → registration=30k, tuition=305k
 *   ...
 */
export interface LevelPricingRangeRow {
  /** Lookup key (Excel column G — `niveau`). */
  level: string;
  /** Human-readable label (e.g. "Primaire (CP to CM2)"). */
  label: string;
  /** Registration fee (DZD). */
  registration: number;
  /** Tuition fee (DZD). */
  tuition: number;
  /** Registration + tuition, pre-computed for convenience. */
  subtotal: number;
}

/**
 * A single row in the `TRANSPORT_PRICES` named range.
 *
 * Mirrors the REF sheet's transport-zone table:
 *   BOUMERDES → tier=nearby, amount=35000, T1=20000/T2=10000/T3=5000
 *   BOUDOUAOU → tier=medium, amount=52000, T1=30000/T2=12000/T3=10000
 *   ...
 *
 * Note: the lookup key is the *normalised* town name (uppercase,
 * whitespace-collapsed, postal-code-stripped). Callers writing a
 * VLOOKUP formula should normalise via `normaliseTownName()` OR
 * pass `exactMatch = false` (the 4th VLOOKUP arg) so the engine
 * does string comparison.
 */
export interface TransportPriceRangeRow {
  /** Lookup key (normalised town name, e.g. "BOUMERDES"). */
  town: string;
  /** Tier slug (e.g. "nearby", "medium"). */
  tier: TransportTier;
  /** Total annual transport fee (DZD). */
  amount: number;
  /** First tranche (Excel column W). */
  t1: number;
  /** Second tranche (Excel column X). */
  t2: number;
  /** Third tranche (Excel column Y). */
  t3: number;
}

/**
 * A single row in the `LEVEL_CODES` named range — the canonical
 * list of school-division codes (issue 8.6).
 */
export interface LevelCodeRangeRow {
  /** Lookup key (the level code, e.g. "PRIM"). */
  level: string;
  /** Human-readable label. */
  label: string;
}

/**
 * Build the `LEVEL_PRICING` named range — one row per canonical
 * level code, with registration + tuition amounts.
 *
 * Used by formulas like:
 *   VLOOKUP(level, LEVEL_PRICING, 4, 0)   → subtotal (reg + tuition)
 *   VLOOKUP(level, LEVEL_PRICING, 3, 0)   → tuition only
 */
export function buildLevelPricingRange(): LevelPricingRangeRow[] {
  return LEVEL_CODES.map((code) => {
    const registration = REGISTRATION_BY_LEVEL[code as LevelCode];
    const tuition = TUITION_BY_LEVEL[code as LevelCode];
    return {
      level: code,
      label: LEVEL_CODE_LABELS[code] ?? code,
      registration,
      tuition,
      subtotal: registration + tuition,
    };
  });
}

/**
 * Build the `TRANSPORT_PRICES` named range — one row per tier,
 * with the canonical amount + T1/T2/T3 breakdown.
 *
 * Note: in Excel, the REF sheet lists *towns* (one row per town),
 * but the transport amount is per-tier. We expose one row per
 * *tier* here because that's the level at which the pricing
 * actually varies — the town is just a key into the tier. A
 * formula that wants "the transport amount for THIS row's
 * destination" should use `resolvedTransport` (already in
 * `ctx.fields` since iteration 2 / Fix #15) rather than a
 * VLOOKUP against this range.
 *
 * The range is most useful when the operator wants to enumerate
 * all tiers (e.g. `INDEX(TRANSPORT_PRICES, 2, 3)` → 43000, the
 * intermediate-tier amount) or to look up the T1/T2/T3 split
 * for a given tier name.
 *
 * Used by formulas like:
 *   VLOOKUP("medium", TRANSPORT_PRICES, 3, 0)  → 52000
 *   VLOOKUP("medium", TRANSPORT_PRICES, 4, 0)  → 30000 (T1)
 */
export function buildTransportPricesRange(): TransportPriceRangeRow[] {
  return (Object.keys(TRANSPORT_AMOUNT_BY_TIER) as TransportTier[]).map((tier) => {
    const installments: TransportInstallments = TRANSPORT_INSTALLMENTS_BY_TIER[tier];
    return {
      town: tier, // The lookup key is the tier slug (not a town).
      tier,
      amount: TRANSPORT_AMOUNT_BY_TIER[tier],
      t1: installments.t1,
      t2: installments.t2,
      t3: installments.t3,
    };
  });
}

/**
 * Build the `LEVEL_CODES` named range — the canonical list of
 * level codes (issue 8.6).
 *
 * Used by formulas like:
 *   IF(ISNA(MATCH(level, LEVEL_CODES, 0)), 0, 1)
 * to check whether a level is in the canonical list.
 */
export function buildLevelCodesRange(): LevelCodeRangeRow[] {
  return LEVEL_CODES.map((code) => ({
    level: code,
    label: LEVEL_CODE_LABELS[code] ?? code,
  }));
}

/**
 * Build the full `ctx.ranges` dictionary — all three named ranges,
 * ready to be spread into a `FormulaContext`.
 *
 * Usage in `buildFormulaContext()`:
 *   const ctx = {
 *     fields: { ... },
 *     ranges: buildFormulaLookupRanges(),
 *   };
 */
export function buildFormulaLookupRanges(): Record<
  string,
  Array<Record<string, unknown>>
> {
  return {
    LEVEL_PRICING: buildLevelPricingRange() as unknown as Array<Record<string, unknown>>,
    TRANSPORT_PRICES: buildTransportPricesRange() as unknown as Array<Record<string, unknown>>,
    LEVEL_CODES: buildLevelCodesRange() as unknown as Array<Record<string, unknown>>,
  };
}

/**
 * The list of named range names this module exposes.
 *
 * Useful for tests and for the UI's "formula reference" picker.
 */
export const FORMULA_LOOKUP_RANGE_NAMES = [
  "LEVEL_PRICING",
  "TRANSPORT_PRICES",
  "LEVEL_CODES",
] as const;

export type FormulaLookupRangeName = (typeof FORMULA_LOOKUP_RANGE_NAMES)[number];
