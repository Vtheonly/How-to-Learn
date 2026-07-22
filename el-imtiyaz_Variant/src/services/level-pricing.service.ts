/**
 * LevelPricingService — a service-layer wrapper around the
 * level-indexed pricing tables in `shared/pricing.ts`.
 *
 * ── Iteration 6 / Fix #45 (issue 8.3) ─────────────────────────────
 * Background (software_review.md issue 8.3 — "No Level-Based Pricing
 * Service"):
 *   There is no service that maps `(level, classCode) → (registration
 *   fee, tuition fee)`. The fee schedule has one registration amount
 *   and one tuition amount.
 *
 *   Iteration 2 (Fix #9 / #10) added the underlying pricing tables
 *   to `shared/pricing.ts` (`resolveRegistration`, `resolveTuition`,
 *   `REGISTRATION_BY_LEVEL`, `TUITION_BY_LEVEL`).
 *
 *   This file is the missing *service* layer the original review
 *   asked for: a stateless, mockable service that exposes the
 *   level-pricing lookups in the same shape as the other domain
 *   services. The LedgerService and the UI can now depend on
 *   `LevelPricingService` instead of calling the shared helpers
 *   directly — making it trivial to swap in a DB-backed fee
 *   schedule later, or to mock the service in tests.
 *
 *   The service is intentionally a thin wrapper. The pricing
 *   decision logic lives in `shared/pricing.ts`; this file just
 *   gives it a service-shaped facade so it composes cleanly with
 *   the rest of the application's DI graph.
 */

import {
  resolveRegistration,
  resolveTuition,
  REGISTRATION_BY_LEVEL,
  TUITION_BY_LEVEL,
  DEFAULT_REGISTRATION,
  DEFAULT_TUITION,
} from "../shared/pricing";
import {
  LEVEL_CODES,
  isValidLevelCode,
  normaliseLevelCode,
  LEVEL_CODE_LABELS,
  type LevelCode,
} from "../shared/level-codes";

/**
 * Result of looking up level-based pricing for a single student.
 *
 * Mirrors the `FeeScheduleLookupResult` shape (subset) so the two
 * can be composed in a future pricing-orchestration service.
 */
export interface LevelPricingResult {
  /** Normalised level code (uppercase). */
  level: string;
  /** Human-readable label (e.g. "Primaire (CP to CM2)"). */
  label: string;
  /** Registration fee for this level (DZD). */
  registration: number;
  /** Tuition fee for this level (DZD). */
  tuition: number;
  /** Registration + tuition, pre-computed for convenience. */
  subtotal: number;
  /** Whether the level was recognised (false → PRIM fallback used). */
  recognised: boolean;
}

/**
 * Stateless service that resolves registration and tuition fees
 * for a student level.
 *
 * All methods are pure — no DB, no side effects. The class exists
 * so other services can depend on `LevelPricingService` (a
 * stable, mockable interface) rather than on the free functions
 * in `shared/pricing.ts` directly.
 */
export class LevelPricingService {
  readonly serviceName = "LevelPricingService";

  /**
   * Resolve the full level-pricing result for a student.
   *
   * Returns the PRIM rate (the most common rate) as a fallback
   * when the level is unrecognised — matching the operator's
   * "default to primary" behaviour. The `recognised` flag lets
   * the UI surface an advisory when the fallback is in use.
   */
  resolve(level: string | null | undefined): LevelPricingResult {
    const normalised = normaliseLevelCode(level) ?? "";
    const recognised = isValidLevelCode(normalised);
    const registration = resolveRegistration(normalised || level);
    const tuition = resolveTuition(normalised || level);
    const label = recognised
      ? LEVEL_CODE_LABELS[normalised as LevelCode] ?? normalised
      : `(unrecognised — using PRIM fallback)`;
    return {
      level: normalised || (level ?? ""),
      label,
      registration,
      tuition,
      subtotal: registration + tuition,
      recognised,
    };
  }

  /**
   * Resolve just the registration fee for a level.
   */
  resolveRegistration(level: string | null | undefined): number {
    return resolveRegistration(level);
  }

  /**
   * Resolve just the tuition fee for a level.
   */
  resolveTuition(level: string | null | undefined): number {
    return resolveTuition(level);
  }

  /**
   * List all canonical level codes with their registration + tuition
   * amounts. Useful for the UI's pricing-reference widget, the
   * validation-rules registry (issue 9.4), and the formula-lookup
   * ranges (Fix #43).
   */
  listAllLevels(): Array<{
    level: LevelCode;
    label: string;
    registration: number;
    tuition: number;
    subtotal: number;
  }> {
    return LEVEL_CODES.map((code) => ({
      level: code,
      label: LEVEL_CODE_LABELS[code] ?? code,
      registration: REGISTRATION_BY_LEVEL[code],
      tuition: TUITION_BY_LEVEL[code],
      subtotal: REGISTRATION_BY_LEVEL[code] + TUITION_BY_LEVEL[code],
    }));
  }

  /**
   * The default registration amount (used when the level is
   * unrecognised or empty). Exposed for tests and for the UI's
   * "default value" hint.
   */
  get defaultRegistration(): number {
    return DEFAULT_REGISTRATION;
  }

  /**
   * The default tuition amount (used when the level is unrecognised
   * or empty).
   */
  get defaultTuition(): number {
    return DEFAULT_TUITION;
  }
}
