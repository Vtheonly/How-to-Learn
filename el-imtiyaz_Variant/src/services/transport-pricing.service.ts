/**
 * TransportPricingService — a service-layer wrapper around the
 * transport-tier pricing tables in `shared/pricing.ts`.
 *
 * ── Iteration 6 / Fix #44 (issue 8.2) ─────────────────────────────
 * Background (software_review.md issue 8.2 — "No Transport Pricing
 * Service"):
 *   There is no service that maps `destination → transport cost`.
 *   The fee schedule has two hardcoded transport amounts. The 20
 *   destinations in the REF sheet (Boumerdès, Corso, Boudouaou,
 *   etc.) each have different costs, but no lookup mechanism exists.
 *
 *   Iteration 2 (Fix #11) added the underlying pricing tables to
 *   `shared/pricing.ts` (`resolveTransportTier`,
 *   `resolveTransportAmount`, `resolveTransportInstallments`,
 *   `TRANSPORT_AMOUNT_BY_TIER`, `TRANSPORT_INSTALLMENTS_BY_TIER`).
 *   Iteration 4 (Fix #25) added the per-tier installment breakdown.
 *
 *   This file is the missing *service* layer the original review
 *   asked for: a stateless, mockable service that exposes the
 *   transport-pricing lookups in the same shape as the other
 *   domain services (`ParentService`, `StudentService`, etc.).
 *   The LedgerService and the UI can now depend on
 *   `TransportPricingService` instead of calling the shared
 *   helpers directly — making it trivial to swap in a
 *   DB-backed fee schedule later, or to mock the service in tests.
 *
 *   The service is intentionally a thin wrapper. The pricing
 *   decision logic lives in `shared/pricing.ts`; this file just
 *   gives it a service-shaped facade so it composes cleanly with
 *   the rest of the application's DI graph.
 */

import {
  resolveTransportTier,
  resolveTransportAmount,
  resolveTransportInstallments,
  isTransportDestinationRecognised,
  TRANSPORT_AMOUNT_BY_TIER,
  TRANSPORT_INSTALLMENTS_BY_TIER,
  TransportTier,
  type TransportInstallments,
} from "../shared/pricing";

/**
 * Result of looking up transport pricing for a single destination.
 *
 * Mirrors the `FeeScheduleLookupResult` shape (subset) so the two
 * can be composed in a future pricing-orchestration service.
 */
export interface TransportPricingResult {
  /** Normalised town name (uppercase, whitespace-collapsed). */
  destination: string;
  /** Tier slug, or null when the town is empty. */
  tier: TransportTier | null;
  /** Total annual transport fee (DZD). 0 when no transport. */
  amount: number;
  /** Per-tier (T1, T2, T3) breakdown, or null when no transport. */
  installments: TransportInstallments | null;
  /** Whether the destination was recognised (false → fallback used). */
  recognised: boolean;
}

/**
 * Stateless service that resolves transport pricing for a
 * destination town.
 *
 * All methods are pure — no DB, no side effects. The class exists
 * so other services can depend on `TransportPricingService` (a
 * stable, mockable interface) rather than on the free functions
 * in `shared/pricing.ts` directly.
 */
export class TransportPricingService {
  readonly serviceName = "TransportPricingService";

  /**
   * Resolve the full transport-pricing result for a destination.
   *
   * Returns `tier = null`, `amount = 0` when the destination is
   * empty (the student has no transport). Returns the NEARBY tier
   * (35,000 DZD) as a fallback when the town is unrecognised —
   * matching the operator's "default to local rate" behaviour.
   */
  resolve(destination: string | null | undefined): TransportPricingResult {
    const tier = resolveTransportTier(destination);
    if (tier === null) {
      return {
        destination: "",
        tier: null,
        amount: 0,
        installments: null,
        recognised: false,
      };
    }
    const normalised = (destination ?? "").trim().toUpperCase();
    const recognised = this.isRecognised(normalised);
    return {
      destination: normalised,
      tier,
      amount: TRANSPORT_AMOUNT_BY_TIER[tier],
      installments: TRANSPORT_INSTALLMENTS_BY_TIER[tier],
      recognised,
    };
  }

  /**
   * Resolve just the transport amount for a destination.
   *
   * Convenience wrapper around `resolve()` for callers that only
   * need the bottom-line number.
   */
  resolveAmount(destination: string | null | undefined): number {
    return resolveTransportAmount(destination);
  }

  /**
   * Resolve just the tier slug for a destination.
   */
  resolveTier(destination: string | null | undefined): TransportTier | null {
    return resolveTransportTier(destination);
  }

  /**
   * Resolve the (T1, T2, T3) installment breakdown for a destination.
   */
  resolveInstallments(
    destination: string | null | undefined,
  ): TransportInstallments | null {
    return resolveTransportInstallments(destination);
  }

  /**
   * List all 4 transport tiers with their amounts and installment
   * breakdowns. Useful for the UI's pricing-reference widget and
   * for the validation-rules registry (issue 9.4).
   */
  listAllTiers(): Array<{
    tier: TransportTier;
    amount: number;
    installments: TransportInstallments;
  }> {
    return (Object.keys(TRANSPORT_AMOUNT_BY_TIER) as TransportTier[]).map((tier) => ({
      tier,
      amount: TRANSPORT_AMOUNT_BY_TIER[tier],
      installments: TRANSPORT_INSTALLMENTS_BY_TIER[tier],
    }));
  }

  /**
   * Check whether a town name is in the canonical transport-pricing
   * table. Exposed publicly so the UI can warn the operator when
   * they type an unknown destination.
   */
  isRecognised(destination: string | null | undefined): boolean {
    return isTransportDestinationRecognised(destination);
  }
}
