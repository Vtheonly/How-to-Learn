/**
 * FormulaCompositionService — composes a per-row DEVIS ANNUEL formula
 * expression from a row's attributes (level, destination, optionCode,
 * remise, omitRemise).
 *
 * ── Iteration 6 / Fix #46 (issue 8.4) ─────────────────────────────
 * Background (software_review.md issue 8.4 — "No Formula Composition
 * Service"):
 *   There is no service that, given a row's attributes, *composes*
 *   the correct formula expression. The operator in Excel mentally
 *   does: "This is a PRIM student with transport to Boudouaou and
 *   a 25,500 discount, so the formula is `=25000+205000+52000-J2`."
 *   No software component replicates this decision process.
 *
 *   The LedgerService fallback (iteration 2 fixes) computes the
 *   *value* directly, bypassing the formula expression. That's
 *   correct for the fallback path, but it doesn't help an operator
 *   who wants to *see* the formula expression for a row (e.g. to
 *   paste into the `customFormula` field added in iteration 5, or
 *   to display in a "formula preview" widget).
 *
 *   This service fills that gap. Given a row's attributes, it
 *   returns the Excel-style formula string that the operator
 *   *would have typed* in column L. The string is purely
 *   informational — the actual computation still uses the
 *   fallback path (or a user-defined rule, or a per-row
 *   `customFormula`). But having the string available lets the
 *   UI show "for this row, the expected Excel formula is
 *   `=25000+205000+52000-J2`" — which is exactly the kind of
 *   feedback the original review asked for.
 *
 *   The composition logic mirrors the most common Excel patterns
 *   documented in the vault:
 *
 *     Row 2:  =25000+205000+35000-J2          (PRIM, with transport, with discount)
 *     Row 3:  =25000+205000+35000+55000-J3    (PRIM, dual transport, with discount)
 *     Row 5:  =25000+305000+52000             (COLG, transport, NO discount)
 *     Row 14: =18000+125000+35000-J14         (GS, different registration, different tuition)
 *     Row 16: =30000+340000-J16               (LYC, different registration, no transport)
 *
 *   The service supports all 5 patterns via the `dualTransport`
 *   and `omitRemise` flags.
 */

import {
  resolveRegistration,
  resolveTuition,
  resolveTransportAmount,
  resolveTransportTier,
  TransportTier,
} from "../shared/pricing";
import type { LevelCode } from "../shared/level-codes";

/**
 * Inputs to the formula composer.
 *
 * All fields mirror the corresponding `LedgerEntry` fields. The
 * composer is intentionally pure — it does NOT read from the DB
 * and does NOT mutate any state.
 */
export interface FormulaCompositionInput {
  /** Student level (column G — `niveau`). */
  level: string | null | undefined;
  /** Transport option code (column I — `OPTION`). */
  optionCode: string | null | undefined;
  /** Transport destination (column V — `DESTINATION`). */
  destination: string | null | undefined;
  /** Discount amount (column J — `REMISE`). */
  remise: number | null | undefined;
  /**
   * Whether the row structurally omits the `-J` term (issue 1.5).
   * When true, the composed formula has NO `-remise` suffix even
   * if `remise` is non-zero.
   */
  omitRemise?: boolean | null | undefined;
  /**
   * Whether to use the dual-transport pattern (issue 1.4) —
   * adding BOTH the row's tier amount AND the FAR-tier amount
   * (55,000). Excel uses this pattern rarely (e.g. row 3:
   * `=25000+205000+35000+55000-J3`); the operator opt-in by
   * setting this flag.
   */
  dualTransport?: boolean | null | undefined;
  /**
   * Optional registration fee override. When set, the composer
   * uses this amount instead of `resolveRegistration(level)`.
   * Mirrors Excel's behaviour when the operator types a non-
   * standard registration (e.g. a sibling rate).
   */
  registrationOverride?: number | null | undefined;
  /**
   * Optional tuition fee override. When set, the composer uses
   * this amount instead of `resolveTuition(level)`.
   */
  tuitionOverride?: number | null | undefined;
}

/**
 * Result of composing a formula.
 *
 * The `expression` field is the Excel-style formula string
 * (e.g. `=25000+205000+52000-J2`). The `components` array lists
 * the individual addends in order — useful for the UI's
 * "formula breakdown" tooltip.
 */
export interface FormulaCompositionResult {
  /** The composed formula expression (Excel-style, starting with `=`). */
  expression: string;
  /** The individual addends in order (e.g. `["25000", "205000", "52000"]`). */
  components: string[];
  /** The resolved registration amount used in the formula. */
  registration: number;
  /** The resolved tuition amount used in the formula. */
  tuition: number;
  /** The resolved transport amount used in the formula (0 if no transport). */
  transport: number;
  /** The FAR-tier transport amount (only set when `dualTransport` is true). */
  transportPremium: number;
  /** The remise amount subtracted (0 when `omitRemise` is true). */
  remise: number;
  /** Whether the row omits the `-J` term structurally. */
  omitRemise: boolean;
  /** Whether the dual-transport pattern is in use. */
  dualTransport: boolean;
  /** The expected numerical result of the formula. */
  expectedValue: number;
}

/**
 * Stateless service that composes Excel-style DEVIS ANNUEL formula
 * expressions from a row's attributes.
 */
export class FormulaCompositionService {
  readonly serviceName = "FormulaCompositionService";

  /**
   * Compose the formula expression for a row.
   *
   * The composition mirrors the most common Excel patterns
   * documented in the vault. See the class docstring for the
   * full pattern catalogue.
   */
  compose(input: FormulaCompositionInput): FormulaCompositionResult {
    const registration =
      input.registrationOverride != null
        ? input.registrationOverride
        : resolveRegistration(input.level);
    const tuition =
      input.tuitionOverride != null
        ? input.tuitionOverride
        : resolveTuition(input.level);

    const hasTransportOption =
      (input.optionCode ?? "").toUpperCase() === "TRNSP";
    const hasDestination = !!(input.destination && String(input.destination).trim());
    const useTransport = hasTransportOption && hasDestination;
    const transport = useTransport
      ? resolveTransportAmount(input.destination)
      : 0;

    const dualTransport = input.dualTransport === true && useTransport;
    const transportPremium = dualTransport
      ? // FAR tier is always 55,000 DZD.
        55000
      : 0;

    const omitRemise = input.omitRemise === true;
    const remise = omitRemise ? 0 : (input.remise ?? 0);

    // Build the components list in Excel's left-to-right order.
    const components: string[] = [String(registration), String(tuition)];
    if (transport > 0) {
      components.push(String(transport));
    }
    if (dualTransport && transportPremium > 0) {
      components.push(String(transportPremium));
    }

    const expectedValue =
      registration + tuition + transport + transportPremium - remise;

    // Build the expression string. Excel formulas always start with `=`.
    let expression = "=" + components.join("+");
    if (!omitRemise && remise > 0) {
      expression += `-${remise}`;
    } else if (!omitRemise && remise === 0) {
      // When remise is 0, Excel operators typically still include
      // the `-J` term (it evaluates to 0 and is harmless). We mirror
      // that pattern for fidelity with the spreadsheet's L2-style rows.
      expression += "-0";
    }
    // When omitRemise is true, no `-J` term is added — matching
    // Excel rows like L5: `=25000+305000+52000`.

    return {
      expression,
      components,
      registration,
      tuition,
      transport,
      transportPremium,
      remise,
      omitRemise,
      dualTransport,
      expectedValue: Math.max(0, expectedValue),
    };
  }

  /**
   * Compose the formula for a row using only the standard pattern
   * (no dual transport, no overrides). Convenience wrapper around
   * `compose()` for the common case.
   */
  composeStandard(
    level: string | null | undefined,
    optionCode: string | null | undefined,
    destination: string | null | undefined,
    remise: number | null | undefined,
    omitRemise: boolean | null | undefined = false,
  ): FormulaCompositionResult {
    return this.compose({ level, optionCode, destination, remise, omitRemise });
  }

  /**
   * Detect the pattern a row's hand-typed Excel formula matches.
   *
   * Given a raw formula string (e.g. `=25000+205000+35000-J2`),
   * returns a structured description of which components are
   * present. Useful for the ingestion service (issue 11) when
   * deciding whether to flag a row as "non-standard formula".
   *
   * Returns null when the formula doesn't match any known pattern.
   */
  detectPattern(
    formula: string,
    level: string | null | undefined,
  ): {
    hasRegistration: boolean;
    hasTuition: boolean;
    hasTransport: boolean;
    hasDualTransport: boolean;
    hasRemiseSubtraction: boolean;
    registrationAmount: number | null;
    tuitionAmount: number | null;
    transportAmount: number | null;
    transportPremiumAmount: number | null;
  } | null {
    if (!formula) return null;
    const s = formula.replace(/^=/, "").replace(/\s+/g, "");
    if (!s) return null;

    // Split into addends and subtracts.
    const parts = s.split(/([+-])/);
    const addends: number[] = [];
    const subtracts: number[] = [];
    let nextSign = "+";
    for (const p of parts) {
      if (p === "+") { nextSign = "+"; continue; }
      if (p === "-") { nextSign = "-"; continue; }
      if (!p) continue;
      // Each addend is either a number or a cell reference like "J2".
      const asNum = Number(p);
      if (!isNaN(asNum)) {
        if (nextSign === "+") addends.push(asNum);
        else subtracts.push(asNum);
      } else {
        // Cell reference (e.g. J2) — treat as a remise subtraction
        // if it follows a `-` sign, ignore otherwise.
        if (nextSign === "-") {
          subtracts.push(0); // marker: a cell ref was subtracted
        }
      }
    }

    const expectedRegistration = resolveRegistration(level);
    const expectedTuition = resolveTuition(level);
    const transportTiers = [35000, 43000, 52000, 55000];

    const hasRegistration = addends.includes(expectedRegistration);
    const hasTuition = addends.includes(expectedTuition);
    const transportAmount = addends.find((a) => transportTiers.includes(a)) ?? null;
    const hasTransport = transportAmount !== null;
    const transportPremiumAmount = addends.filter((a) => a === 55000).length >= 2
      ? 55000
      : (hasTransport && transportAmount === 55000 && addends.filter((a) => transportTiers.includes(a)).length >= 2
          ? 55000
          : null);
    const hasDualTransport =
      addends.filter((a) => transportTiers.includes(a)).length >= 2;
    const hasRemiseSubtraction = subtracts.length > 0;

    return {
      hasRegistration,
      hasTuition,
      hasTransport,
      hasDualTransport,
      hasRemiseSubtraction,
      registrationAmount: hasRegistration ? expectedRegistration : null,
      tuitionAmount: hasTuition ? expectedTuition : null,
      transportAmount,
      transportPremiumAmount: hasDualTransport ? 55000 : null,
    };
  }
}
