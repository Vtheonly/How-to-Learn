# All That Is Solved So Far

This file documents every issue from `software_review.md` that has been
**fully resolved and verified** in this iteration.

For each issue, we record:
- The original problem (verbatim from `software_review.md`)
- The implemented solution (with file paths)
- Relevant notes (design trade-offs, backward-compat, etc.)
- Links to the corresponding tests
- Screenshots demonstrating the corrected behavior

---

## Iteration Summary

| Iteration | Date | Issues Resolved | Tests | Status |
|-----------|------|-----------------|-------|--------|
| 1 | 2026-07-21 | 7 fully + 1 partially | 35 unit + 6 integration | ✅ Complete |
| 2 | 2026-07-21 | 8 (critical / high) | 35 new + 41 regression | ✅ Complete |
| **Total** | | **15 fully + 1 partially** | **76 tests, all passing** | |

---

## Iteration 2 — 8 critical / high-severity issues resolved

**Date**: 2026-07-21
**Repository**: `github.com/Vtheonly/AgentGithubUplaod`
**App code**: `el-imtiyaz_Variant/`
**Verification**: 35 new unit/integration tests + 41 iteration-1 regression tests — all passing.
**Screenshots**: `el-imtiyaz_Variant/screenshots/iteration2-*.png`

| # | Issue ID | Title | Severity |
|---|----------|-------|----------|
| 8 | §1 / #1 | Broken inter-rule data flow (TOTAL CREANCE always = 0) | FATAL |
| 9 | 1.1 | Registration fee hardcoded at 25,000 DZD | CRITICAL |
| 10 | 1.2 | Tuition hardcoded at 205,000 DZD (ignores level) | CRITICAL |
| 11 | 1.3 | Only 2 transport tiers (need 4+) | CRITICAL |
| 12 | 1.4 | Can't add both transport_base + transport_premium | HIGH |
| 13 | 8.2 | Overpayments blocked (Excel allows) | HIGH |
| 14 | 8.4 | TRNSP option adds transport even when Excel didn't | HIGH |
| 15 | §17 / #17 | Formula context missing optionCode/level/classCode/destination | MEDIUM |

---

## Fix #8 — §1 FATAL: Broken inter-rule data flow (TOTAL CREANCE always = 0)

### Original problem (from `software_review.md` §1)

> The engine's architecture has **one fatal flaw** that makes it produce
> incorrect results on every single calculation.
>
> In `ledger.service.ts`, `computeFields()`:
> ```typescript
> const ctx = this.buildFormulaContext(input, schedule);
> const devisAnnuel = devisRule ? this.evalNumeric(devisRule, ctx) : fallback;
> const totalVersements = versementsRule ? this.evalNumeric(versementsRule, ctx) : fallback;
> const totalCreance = creanceRule ? this.evalNumeric(creanceRule, ctx) : ...;
> ```
>
> The formula engine calls `resolveField("devisAnnuel", ctx)`. It walks
> `ctx.fields`, finds no key `"devisAnnuel"`, returns `undefined`. The
> `toNum(undefined)` function returns `0`. Same for `totalVersements`.
>
> **Result: `totalCreance = 0 - 0 = 0` for every single student.**

### Implemented solution

**Files changed**:
- `src/services/ledger.service.ts` — `computeFields()` writes each computed value back to `ctx.fields` before the next rule evaluation.

**Approach**: After each rule evaluation (or fallback computation), the result is written back to `ctx.fields` so the next rule (in priority order) can read it.

```typescript
const devisAnnuel = devisRule ? this.evalNumeric(devisRule, ctx) : fallbackComputation();
ctx.fields.devisAnnuel = devisAnnuel;  // ← NEW: write-back

const totalVersements = versementsRule ? this.evalNumeric(versementsRule, ctx) : fallback;
ctx.fields.totalVersements = totalVersements;  // ← NEW: write-back

const totalCreance = creanceRule ? this.evalNumeric(creanceRule, ctx) : devisAnnuel - totalVersements;
ctx.fields.totalCreance = totalCreance;  // ← NEW: write-back
```

This makes the calculation pipeline a real directed acyclic graph:

```
J (remise) ──┐
constants ───┼──→ L (devisAnnuel) ──┐
             │                       ├──→ Q (totalCreance)
R–Y ─────────┼──→ P (totalVersements)┘
             │
Level (G) ───┼──→ registration, tuition      (iteration 2 — issues 1.1, 1.2)
Destination ─┼──→ transport (4 tiers)         (iteration 2 — issues 1.3, 1.4, 8.4)
```

### Notes

- The fix is mechanical and surgical: only 3 lines of write-back code were added.
- The fallback paths (the ternary `else` branches) still use local variables for the actual return value — they don't depend on the write-back. The write-back only enables downstream rules to see the computed value.
- This fix UNLOCKS the existing `TOTAL CREANCE` starter rule (which references `devisAnnuel - totalVersements`). Before the fix, that rule evaluated to 0. After the fix, it evaluates correctly.

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #8 — §1 FATAL: Inter-rule data flow"
  - `computeFields() now returns a non-zero totalCreance when starter rules are seeded` ✓
  - `the TOTAL CREANCE rule reads the just-computed devisAnnuel and totalVersements from ctx` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 1.

---

## Fix #9 — Issue 1.1: Registration fee hardcoded at 25,000 DZD

### Original problem (from `software_review.md` §1.1)

> Registration varies: **18,000** (MS/GS pre-school), **25,000** (standard
> PRIM), **30,000** (COLG/LYC with transport).
>
> Hardcoded `registration = 25000` in `DEFAULT_FEE_SCHEDULE`.
>
> **Impact**: Pre-school students are overcharged by 7,000; collège/lycée
> students are undercharged by 5,000.

### Implemented solution

**Files changed**:
- `src/shared/pricing.ts` (NEW) — exposes `REGISTRATION_BY_LEVEL` and `resolveRegistration()`
- `src/services/ledger.service.ts` — `buildFormulaContext()` and the fallback formula use `resolveRegistration(level)` instead of the flat 25,000

**Approach**: New `shared/pricing.ts` module exports a level-indexed lookup:

```typescript
export const REGISTRATION_BY_LEVEL: Readonly<Record<LevelCode, number>> = {
  MS: 18000, GS: 18000,    // Pre-school
  PRIM: 25000,             // Primary
  COLG: 30000, LYC: 30000, // Collège / Lycée
  AUTISTE: 25000,          // Specialised (default to PRIM rate)
  NV2: 25000, NV3: 25000, NV4: 25000, NV5: 25000,  // New/special admission
};

export function resolveRegistration(level: string | null | undefined): number {
  // Returns the canonical amount, or DEFAULT_REGISTRATION (25,000) if unknown.
  // Logs an advisory warning on unknown levels.
}
```

`buildFormulaContext()` now does:
```typescript
fields.registration = findLine("registration") || resolveRegistration(input.level);
```

And the fallback formula in `computeFields()` does:
```typescript
const registration = resolveRegistration(input.level);
devisAnnuel = (input.fi ?? registration) + tuition + transport - remise;
```

### Notes

- The active FeeSchedule's explicit `registration` line still takes precedence (operators may have configured a custom schedule). The level-indexed lookup only fires when no schedule line is configured.
- Unknown levels fall back to 25,000 (the PRIM rate, which is the most common) with an advisory warning. This is permissive — we don't want to break imports of legacy rows with typos.
- Values sourced from the Obsidian vault's `08 - Appendix/Price Table.md`.

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #9 — Issue 1.1: Registration fee level-indexed"
  - `REGISTRATION_BY_LEVEL has the documented Excel values` ✓
  - `resolveRegistration returns 18,000 for MS/GS (was overcharged 7,000 before)` ✓
  - `resolveRegistration returns 30,000 for COLG/LYC (was undercharged 5,000 before)` ✓
  - `resolveRegistration falls back to 25,000 for unknown levels` ✓
  - `resolveRegistration honours NV2–NV5 (issue 8.6 codes from iteration 1)` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 2.

---

## Fix #10 — Issue 1.2: Tuition hardcoded at 205,000 DZD (ignores level)

### Original problem (from `software_review.md` §1.2)

> | Level | Excel tuition | Software tuition |
> |---|---|---|
> | PRIM (primary) | 205,000 – 220,000 | 205,000 (hardcoded) |
> | COLG (collège) | 305,000 – 330,000 | 205,000 |
> | LYC (lycée) | 340,000 – 365,000 | 205,000 |
> | GS/MS (pre-school) | 125,000 – 148,000 | 205,000 |
> | AUTISTE | 283,000 | 205,000 |

### Implemented solution

**Files changed**:
- `src/shared/pricing.ts` — exposes `TUITION_BY_LEVEL` and `resolveTuition()`
- `src/services/ledger.service.ts` — `buildFormulaContext()` and the fallback formula use `resolveTuition(level)`

**Approach**: Same pattern as Fix #9. Level-indexed tuition:

```typescript
export const TUITION_BY_LEVEL: Readonly<Record<LevelCode, number>> = {
  MS: 125000, GS: 125000,   // Pre-school
  PRIM: 205000,             // Primary (CP/CE1/CE2)
  COLG: 305000,             // Collège (1AAM–4AAM)
  LYC: 340000,              // Lycée (1AS)
  AUTISTE: 283000,          // Specialised
  NV2: 205000, NV3: 205000, NV4: 205000, NV5: 205000,
};
```

### Notes

- We use the LOWER bound of each documented range (e.g. LYC = 340,000, not 365,000). Variants (355k, 365k for 3rd-year lycée) are not in the table — operators can still enter them manually via the ledger-entry form.
- `resolveTuition()` mirrors `resolveRegistration()`'s fallback semantics: unknown levels default to 205,000 (PRIM rate) with an advisory warning.

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #10 — Issue 1.2: Tuition level-indexed"
  - `TUITION_BY_LEVEL has the documented Excel values` ✓
  - `resolveTuition returns 125,000 for MS/GS (was overcharged 80,000 before)` ✓
  - `resolveTuition returns 305,000 for COLG (was undercharged 100,000 before)` ✓
  - `resolveTuition returns 340,000 for LYC (was undercharged 135,000 before)` ✓
  - `resolveTuition falls back to 205,000 (PRIM rate) for unknown levels` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 3.

---

## Fix #11 — Issue 1.3: Only 2 transport tiers (need 4+)

### Original problem (from `software_review.md` §1.3)

> | Excel transport amount | Towns | Software |
> |---|---|---|
> | 35,000 | Boumerdès, Corso, Sahel | `transport_base = 35000` |
> | 43,000 | Figuier, slightly farther | **Not represented** |
> | 52,000 | Bordj Menaïl, Isser, Boudouaou | **Not represented** |
> | 55,000 | Farthest tier | `transport_premium = 55000` |
>
> Only two tiers. The 43,000 and 52,000 tiers are missing entirely.

### Implemented solution

**Files changed**:
- `src/shared/pricing.ts` — exposes `TransportTier` enum, `TRANSPORT_AMOUNT_BY_TIER`, `resolveTransportTier(town)`, `resolveTransportAmount(town)`, `normaliseTownName(town)`
- `src/core/entities/fee-schedule.entity.ts` — extended `FeeScheduleLineType` with `transport_intermediate` and `transport_medium`; `DEFAULT_FEE_SCHEDULE` now includes all 4 tiers
- `src/services/ledger.service.ts` — `buildFormulaContext()` exposes all 4 tiers + a `resolvedTransport` convenience field

**Approach**: New `TransportTier` enum with 4 values, backed by a town → tier map that covers all 20 canonical towns plus their spelling variants:

```typescript
export enum TransportTier {
  NEARBY = "nearby",                  // 35,000
  INTERMEDIATE = "intermediate",      // 43,000
  MEDIUM = "medium",                  // 52,000
  FAR = "far",                        // 55,000
}

export const TRANSPORT_AMOUNT_BY_TIER: Readonly<Record<TransportTier, number>> = {
  [TransportTier.NEARBY]: 35000,
  [TransportTier.INTERMEDIATE]: 43000,
  [TransportTier.MEDIUM]: 52000,
  [TransportTier.FAR]: 55000,
};
```

The town → tier map handles spelling variants:
- `BOUMERDES20000` → `BOUMERDES` (postal code stripped)
- `KHEMISKHCHNA` → `KHEMIS KHENCHELA` (spaces removed)
- Case-insensitive matching

A new `resolvedTransport` field in `ctx.fields` exposes the destination-appropriate amount (or 0 when no transport), so a single rule reference (`resolvedTransport`) replaces per-tier branching.

### Notes

- The `FeeScheduleLineType` extension is backward-compatible: existing `transport_base` and `transport_premium` lines continue to work. The new `transport_intermediate` and `transport_medium` types are additive.
- `resolveTransportTier()` returns `null` for empty/null/undefined input (no transport) and `TransportTier.NEARBY` (with a warning) for unrecognised towns. This matches the Excel operator's behaviour of defaulting to the local rate when unsure.

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #11 — Issue 1.3: All 4 transport tiers"
  - `TRANSPORT_AMOUNT_BY_TIER has all 4 documented amounts` ✓
  - `resolveTransportTier maps nearby towns to NEARBY tier (35,000)` ✓
  - `resolveTransportTier maps Boudouaou to MEDIUM tier (52,000)` ✓
  - `resolveTransportTier maps Cap Djenet to FAR tier (55,000)` ✓
  - `resolveTransportTier maps ZEMOURI/THENIA to INTERMEDIATE tier (43,000)` ✓
  - `resolveTransportTier handles spelling variants (BOUMERDES20000, KHEMISKHCHNA)` ✓
  - `resolveTransportTier returns null for empty / null / undefined` ✓
  - `resolveTransportAmount returns 0 for empty destination (no transport)` ✓
  - `resolveTransportAmount returns the tier amount for known towns` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 4.

---

## Fix #12 — Issue 1.4: Can't add both transport_base + transport_premium

### Original problem (from `software_review.md` §1.4)

> **Excel:**
> ```
> L3: =25000+205000+35000+55000-J3
> ```
> This adds **both** 35,000 AND 55,000 (total transport = 90,000). The
> software's formula `registration + baseTuition + transportBase - remise`
> only has one transport slot.

### Implemented solution

**Files changed**:
- `src/services/ledger.service.ts` — `buildFormulaContext()` now exposes ALL 4 transport tiers simultaneously (`transportBase`, `transportIntermediate`, `transportMedium`, `transportPremium`), so user-defined rules can compose dual-transport formulas
- `src/services/formula-rule.service.ts` — starter DEVIS ANNUEL rule updated to use `resolvedTransport` (single tier by default)

**Approach**: The architecture now SUPPORTS dual transport via two mechanisms:

1. `ctx.fields` exposes all 4 transport tiers simultaneously:
   ```typescript
   fields.transportBase = findLine("transport_base") || 35000;
   fields.transportIntermediate = findLine("transport_intermediate") || 43000;
   fields.transportMedium = findLine("transport_medium") || 52000;
   fields.transportPremium = findLine("transport_premium") || 55000;
   ```

2. A user-defined rule can compose any combination, e.g.:
   ```
   registration + baseTuition + transportBase + transportPremium - remise
   ```

The starter rule uses `resolvedTransport` (single tier — the destination-appropriate amount). The dual-transport pattern is **opt-in** for the rare rows that need it (the vault notes that this pattern varies by operator).

### Notes

- We chose NOT to apply dual transport by default because the vault evidence (`Town List (DISTINATION).md`) notes that "43,000 appears frequently on the Devis sheet but rarely on the ETAT sheet — the operator may have switched to a 4-tier system at quote time but consolidated to 3 tiers when entering into the ledger." Forcing dual transport for all FAR-tier students would over-bill most of them.
- The opt-in approach preserves the operator's discretion — exactly as in the Excel workflow.
- A test verifies that a user-defined dual-transport rule produces a higher total than the single-transport starter rule.

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #12 — Issue 1.4: Dual transport support"
  - `PRIM student with TRNSP to CAP DJENET (FAR) gets 55,000 transport via starter rule (single transport)` ✓
  - `a user-defined rule CAN opt into the dual-transport pattern (35k + 55k = 90k)` ✓
  - `PRIM student with TRNSP to BOUMERDES (NEARBY) gets only 35,000 transport` ✓
  - `PRIM student with TRNSP to BOUDOUAOU (MEDIUM) gets only 52,000 transport` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 5.

---

## Fix #13 — Issue 8.2: Overpayments blocked (Excel allows)

### Original problem (from `software_review.md` §8.2)

> **Excel:** Row with `TOTAL*CREANCE = -30000` (SIDI MAMER SAMYI paid
> 30,000 more than the devis). Excel allows this silently.
>
> **Software:** `PaymentService.recordPayment` throws a `BusinessRuleError`
> if `amount > totalOutstanding`:
> ```typescript
> if (amount.amount > totalOutstanding && totalOutstanding > 0) {
>   throw new BusinessRuleError(`Payment amount exceeds outstanding balance`);
> }
> ```
> This **blocks overpayments**, which Excel allows. The software does have
> an `OVERPAID` status, but the validation prevents reaching it in normal
> flow.

### Implemented solution

**Files changed**:
- `src/services/payment.service.ts` — replaced the `BusinessRuleError` throw with an advisory `logger.warn("payment.overpayment")`

**Approach**:

```typescript
// ── Issue 8.2 (iteration 2): overpayments are now ALLOWED ──────────
if (amount.amount > totalOutstanding && totalOutstanding > 0) {
  logger.warn("payment.overpayment", {
    studentId: input.studentId,
    amount: amount.amount,
    outstanding: totalOutstanding,
    overpayment: amount.amount - totalOutstanding,
  });
}
// (no throw — the save proceeds)
```

The downstream allocation loop already handles the overflow correctly:
```typescript
if (remaining > 0) {
  await this.payments.update(payment.id.value, {
    status: PaymentStatus.OVERPAID,
  });
}
```

### Notes

- The `OVERPAID` enum value (which already existed in `core/enums/payment-status.ts`) is now reachable in normal flow.
- Hard validations are preserved: zero/negative amounts still throw `ValidationError`, and the existing "student must exist" check is unchanged.
- The advisory warning includes the overpayment amount so operators can spot genuine mistakes (e.g. an extra zero on a payment) without blocking legitimate overpayments.

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #13 — Issue 8.2: Overpayments allowed"
  - `recordPayment no longer throws when amount > outstanding (Excel allows overpayments)` ✓
    - Verifies that a 15,000 payment on a 10,000 invoice is accepted and the status is set to OVERPAID
  - `recordPayment still throws for genuinely invalid input (zero/negative amount)` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 6.

---

## Fix #14 — Issue 8.4: TRNSP option adds transport even when Excel didn't

### Original problem (from `software_review.md` §8.4)

> Some Excel rows have `OPTION = TRNSP` but no transport amount in the L
> formula (the operator forgot or the family opted out). The software's
> conditional `optionCode === "TRNSP" ? 35000 : 0` would add transport
> where Excel didn't.

### Implemented solution

**Files changed**:
- `src/services/ledger.service.ts` — fallback formula and `buildFormulaContext()` both guard transport on `hasDestination` as well as `hasTransportOption`

**Approach**: Transport is now added only when BOTH conditions hold:

```typescript
const hasTransportOption = (input.optionCode ?? "").toUpperCase() === "TRNSP";
const hasDestination = !!(input.destination && String(input.destination).trim());
const transport = (hasTransportOption && hasDestination)
  ? resolveTransportAmount(input.destination)
  : 0;
```

And in `buildFormulaContext()`:
```typescript
fields.resolvedTransport = (input.optionCode ?? "").toUpperCase() === "TRNSP"
  ? resolveTransportAmount(input.destination)
  : 0;
```

`resolveTransportAmount("")` returns 0 (because `resolveTransportTier("")` returns null), so even if the `hasDestination` check were removed, an empty destination would yield 0 transport. The double guard is defensive.

### Notes

- This fix also indirectly addresses issue 8.4's sibling concern: students without transport (no `OPTION=TRNSP`) no longer have any transport component added to their devis, even if a destination is populated.
- The `hasTransport` boolean in `ctx.fields` (added by Fix #15) gives user-defined rules a single field to branch on if they want to distinguish "transport active" from "transport opted out".

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #14 — Issue 8.4: TRNSP without destination → no transport"
  - `PRIM student with OPTION=TRNSP but NO destination gets NO transport component` ✓
  - `PRIM student with NO OPTION (no transport) and NO destination gets NO transport` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 7.

---

## Fix #15 — §17: Formula context missing optionCode/level/classCode/destination

### Original problem (from `software_review.md` §17 / §10.1)

> The formula context contains only numeric fields. The formula cannot
> reference `optionCode`, `level`, `classCode`, or `destination` because
> these are strings not included in `buildFormulaContext`. A formula like:
>
> ```
> IF(optionCode = "TRNSP", registration + tuition + transport, registration + tuition) - remise
> ```
>
> is impossible because `optionCode` is not in the context.

### Implemented solution

**Files changed**:
- `src/services/ledger.service.ts` — `buildFormulaContext()` now injects `optionCode`, `level`, `classCode`, `destination`, and `hasTransport` (a boolean convenience) into `ctx.fields`
- `src/services/formula-rule.service.ts` — starter DEVIS ANNUEL rule's `watchedFields` extended to include `level`, `optionCode`, `destination`

**Approach**:

```typescript
const fields: Record<string, unknown> = {
  // ... numeric fields ...

  // ── NEW (issue §17): row metadata, so formulas can branch on it ──
  optionCode: input.optionCode ?? "",
  level: input.level ?? "",
  classCode: input.classCode ?? "",
  destination: input.destination ?? "",
  hasTransport:
    (input.optionCode ?? "").toUpperCase() === "TRNSP" &&
    !!(input.destination && String(input.destination).trim()),
};
```

User-defined rules can now branch on any of these:

```
IF(optionCode = "TRNSP", registration + tuition + resolvedTransport, registration + tuition) - remise
```

### Notes

- The `hasTransport` boolean is a convenience: it captures the same logic as the `IF(optionCode = "TRNSP" AND destination <> "", ...)` pattern that rules would otherwise need to repeat.
- The starter DEVIS ANNUEL rule's `watchedFields` was extended so the rule re-evaluates when `level`, `optionCode`, or `destination` change (in addition to the existing numeric triggers).
- This fix is what makes Fix #12 (dual-transport opt-in) actually usable — without §17, a user-defined dual-transport rule couldn't reference `optionCode` to gate the dual-transport behaviour.

### Tests

- `tests/run-iteration2-tests.ts` — section "Fix #15 — §17: Formula context exposes row metadata"
  - `a user-defined formula rule can reference optionCode (was impossible before §17 fix)` ✓
  - `a user-defined formula rule can reference destination` ✓
  - `a user-defined formula rule can reference level` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/iteration2-verification.png` — Panel 8.

---

## How to run the iteration-2 tests

From the `el-imtiyaz_Variant/` directory:

```bash
# Iteration 2 tests (35 tests, ~5 seconds)
npx tsx tests/run-iteration2-tests.ts

# Iteration 1 regression (41 tests, ~7 seconds — should still pass)
npx tsx tests/run-all-tests.ts
npx tsx tests/integration/ledger-service.test.ts

# Regenerate the iteration-2 screenshots
npx tsx scripts/generate-iteration2-screenshot.ts
npx tsx scripts/generate-iteration2-test-output-screenshot.ts
```

---

## Iteration 1 — 7 issues resolved



**Date**: 2026-07-21
**Repository**: `github.com/Vtheonly/AgentGithubUplaod`
**App code**: `el-imtiyaz_Variant/`
**Verification**: 35 unit tests + 6 integration tests — all passing.
**Screenshots**: `el-imtiyaz_Variant/screenshots/`

| # | Issue ID | Title | Severity |
|---|----------|-------|----------|
| 1 | 8.8 | Sheet name "BON " has trailing space | Low (Import) |
| 2 | 8.9 | Imports 600+ empty rows beyond filter range | Low (Import) |
| 3 | 2.3 / 9.3 | GRAND TOTAL formula invented (doesn't exist in Excel) | Medium (Phantom feature) |
| 4 | 6.1 / 6.2 | September balance hard validation vs Excel's soft warning | Medium (Validation) |
| 5 | 4.1 / 9.1 | Arbitrary payment caps (25k / 71.5k / 30k / 15k / 10k) | Critical (Payment) |
| 6 | 8.5 | Phone-number type mismatch (string vs string[]) | Low (Type safety) |
| 7 | 8.6 | NV2/NV3/NV4/NV5 level codes not recognized | Low (Validation) |

---

## Fix #1 — Issue 8.8: Sheet name "BON " has trailing space

### Original problem (from `software_review.md` §8.8)

> Excel's sheet is named `"BON "` (with a trailing space). Any
> programmatic reference must account for this. The software's import
> logic uses sheet names directly and would fail if it looks for
> `"BON"` without the space.

### Implemented solution

**Files changed**:
- `src/services/excel-ingestion.service.ts`

**Approach**: Introduced a new exported helper `findWorksheetByName(workbook, name)`
that performs a **trim-aware, case-insensitive** sheet-name lookup.

```typescript
export function findWorksheetByName(
  workbook: ExcelJS.Workbook,
  name: string,
): ExcelJS.Worksheet | undefined {
  const target = String(name ?? "").trim().toLowerCase();
  if (!target) return undefined;
  // First try an exact match — preserves backward compatibility.
  const exact = workbook.getWorksheet(name);
  if (exact) return exact;
  // Fall back to a trim-aware, case-insensitive match.
  for (const ws of workbook.worksheets) {
    if (String(ws.name ?? "").trim().toLowerCase() === target) {
      return ws;
    }
  }
  return undefined;
}
```

The helper is now used by both `importLedger()` and
`importAuditComments()`. The `analyzeWorkbook()` method already
iterates `workbook.worksheets` directly, so it was unaffected.

### Notes

- Backward compatibility: if a workbook genuinely contains a sheet
  named `"BON"` (no trailing space), the exact-match branch resolves
  it. The trim-aware fallback only fires when the exact match fails.
- The error message in `importLedger()` / `importAuditComments()` was
  improved to list the actual sheet names found, so operators can
  diagnose mismatches faster.
- This fix is intentionally narrow — it only normalises the lookup
  behaviour. It does NOT rename sheets in the source workbook.

### Tests

- `tests/run-all-tests.ts` — section "Fix #1 — Issue 8.8"
  - `exact match still works (backward compatibility)` ✓
  - `matches when the actual sheet has a trailing space (issue 8.8)` ✓
  - `matches case-insensitively` ✓
  - `matches when the requested name has stray whitespace` ✓
  - `returns undefined for a non-existent sheet (no false positives)` ✓
  - `returns undefined for an empty name` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/fixes-verification.png` — Panel 1.

---

## Fix #2 — Issue 8.9: Imports 600+ empty rows beyond filter range

### Original problem (from `software_review.md` §8.9)

> The auto-filter is on `$A$1:$AN$404` but the sheet has 1032 rows.
> Rows 405–1032 are outside the filter range. The software imports all
> rows up to `rowCount`, potentially importing 600+ empty rows.

### Implemented solution

**Files changed**:
- `src/services/excel-ingestion.service.ts`

**Approach**: `importLedger()` now tracks a `consecutiveEmpty` counter.
After `EMPTY_ROW_ABORT_THRESHOLD = 20` consecutive empty rows, the loop
breaks early and logs `excel.ingestion.ledger.abortEmptyTail`.

```typescript
const EMPTY_ROW_ABORT_THRESHOLD = 20;
let consecutiveEmpty = 0;

for (let r = 2; r <= ws.rowCount; r++) {
  const row = ws.getRow(r);
  try {
    const input = readRowAsLedgerInput(row, colMap, r, academicYearId);
    if (!input.studentName?.trim()) {
      skipped++;
      consecutiveEmpty++;
      if (consecutiveEmpty >= EMPTY_ROW_ABORT_THRESHOLD) {
        logger.info("excel.ingestion.ledger.abortEmptyTail", {
          filePath,
          sheetName: ws.name,
          atRow: r,
          consecutiveEmpty,
        });
        break;
      }
      continue;
    }
    consecutiveEmpty = 0;
    // ... import the row ...
  } catch (err) {
    // ...
    consecutiveEmpty = 0; // errored rows aren't "empty"
  }
}
```

### Notes

- The threshold is **consecutive** empties, not cumulative. Isolated
  blank rows between real data rows (which the operator may have left
  deliberately) are still tolerated — only the trailing empty tail
  triggers the abort.
- The threshold value (20) was chosen to be well above any plausible
  "real" gap (the source workbook has at most 1–2 consecutive blanks
  between sibling groups) while still cutting off the 600+ empty rows
  fast.
- The existing per-row skip-on-empty behaviour is preserved — only the
  iteration bound changes.

### Tests

- `tests/run-all-tests.ts` — section "Fix #2 — Issue 8.9"
  - `importLedger stops after EMPTY_ROW_ABORT_THRESHOLD consecutive empty rows` ✓
  - `importLedger does NOT abort when there are real rows interspersed with empties` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/fixes-verification.png` — Panel 2.

---

## Fix #3 — Issue 2.3 / 9.3: GRAND TOTAL formula invented (doesn't exist in Excel)

### Original problem (from `software_review.md` §2.3 and §9.3)

> **§2.3**: Software starter rule:
> ```
> "totalVersements + psy1 + psy2 + orth1 + orth2 + ePlant + ratrapage + september + december + march"
> ```
> **Excel reality**: Column AL is **entirely empty** in the actual
> data. There is no GRAND TOTAL formula in the workbook. The software
> invented this calculation.
>
> **§9.3**: The `getStarterFormulaRules()` function seeds a GRAND
> TOTAL rule. Column AL in Excel is **empty**. This rule should not
> exist. It was invented by the software.

### Implemented solution

**Files changed**:
- `src/services/formula-rule.service.ts` — removed the GRAND TOTAL rule from `getStarterFormulaRules()`
- `src/services/ledger.service.ts` — `computeFields()` now returns `grandTotal = 0` unless a user explicitly creates a `grandTotal` rule

**Approach**:

1. The starter set returned by `getStarterFormulaRules()` now contains
   only the three real Excel formulas (DEVIS ANNUEL, TOTAL VERSEMENTS,
   TOTAL CREANCE) plus the three quote-block formulas. The GRAND TOTAL
   entry was deleted and a clarifying comment was added.

2. `LedgerService.computeFields()` no longer has an invented fallback
   for `grandTotal`. The new logic is:

```typescript
// grandTotal is intentionally NOT computed.
//
// Background (issues 2.3 and 9.3 in software_review.md): Excel column
// AL (TOTAL / GRAND TOTAL) is entirely empty in the source workbook —
// there is no formula to reproduce. The previous version of this file
// computed `grandTotal = totalVersements + extras + quarterly`, which
// was an invented calculation. We now persist 0 (the database column
// is NOT NULL DEFAULT 0) and rely on the upstream caller to compute
// any aggregate they need via a dedicated report query.
//
// If a user explicitly creates a `grandTotal` formula rule, we still
// honour it for backward compatibility — but we no longer seed one.
const grandTotalRule = rules.find((r) => r.targetField === "grandTotal");
const grandTotal = grandTotalRule ? this.evalNumeric(grandTotalRule, ctx) : 0;
```

### Notes

- The `grandTotal` field is **kept** on the `LedgerEntry` entity and
  the database column (`grand_total REAL NOT NULL DEFAULT 0`) for
  backward compatibility. Existing rows that have a non-zero
  `grand_total` from previous runs are preserved.
- The `getSummary()` method on `LedgerService` still sums
  `grandTotal` across rows for the dashboard — but the sum will now
  reflect actual user-defined rules rather than the invented
  calculation.
- If a user has explicitly created a `grandTotal` rule via the formula
  editor UI, that rule continues to be evaluated. We only removed the
  DEFAULT starter rule.

### Tests

- `tests/run-all-tests.ts` — section "Fix #3 — Issue 2.3/9.3"
  - `getStarterFormulaRules does NOT seed a grandTotal rule` ✓
  - `getStarterFormulaRules still seeds the three real Excel formulas (L, P, Q)` ✓
  - `the DEVIS ANNUEL starter expression references registration + tuition + transport` ✓
- `tests/integration/ledger-service.test.ts`
  - `computeFields() returns grandTotal = 0 when no grandTotal rule is seeded (Excel column AL is empty)` ✓
  - `create() persists grandTotal = 0 in the database` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/fixes-verification.png` — Panel 3.

---

## Fix #4 — Issue 6.1 / 6.2: September balance hard validation vs Excel's soft warning

### Original problem (from `software_review.md` §6.1 and §6.2)

> **§6.1**: Excel's validation is **advisory only**
> (`showErrorMessage=False`). The operator can ignore it. The software
> **blocks** the save entirely.
>
> ```typescript
> if (input.septemberBalance >= SEPTEMBER_BALANCE_MAX) {
>   throw new BusinessRuleError(`September balance limit violation...`);
> }
> ```
>
> **§6.2**: Excel's validation is on `AG1:AG1032` (CREANCES SEPTEMBRE),
> but this column has **zero data** in the actual workbook. The
> software enforces a rule on a field that's never used.

### Implemented solution

**Files changed**:
- `src/services/ledger.service.ts`

**Approach**: `validateInput()` was rewritten to return a
`ValidationWarning[]` array instead of throwing on the September
balance rule.

```typescript
export interface ValidationWarning {
  field: string;
  message: string;
  value: unknown;
}

private validateInput(input: any): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // ── Hard validations (preserved — these throw) ──
  if (input.studentName !== undefined && !String(input.studentName).trim()) {
    throw new ValidationError("NOM (Student Name) is required.");
  }
  if (input.remise !== undefined && input.remise < 0) {
    throw new ValidationError("Remise cannot be negative.");
  }

  // ── Soft validations (advisory, mirror Excel's showErrorMessage=False) ──
  if (input.septemberBalance !== undefined && input.septemberBalance !== null) {
    if (input.septemberBalance >= SEPTEMBER_BALANCE_MAX) {
      warnings.push({
        field: "septemberBalance",
        value: input.septemberBalance,
        message: `September balance (${input.septemberBalance}) is at or above the advisory limit of ${SEPTEMBER_BALANCE_MAX} DZD. Excel's data validation on column AG is configured as showErrorMessage=False (advisory only), so the save proceeds.`,
      });
    }
  }

  return warnings;
}
```

`create()` and `update()` now log the warnings via
`logger.warn("ledger.entry.validationWarnings", { ... })` instead of
throwing.

### Notes

- Hard validations (empty `studentName`, negative `remise`) are
  preserved — Excel blocks these too, so we keep the throws.
- The `BusinessRuleError` import is kept in the file for forward
  compatibility (other rules may be added later that warrant a hard
  error).
- The advisory warning is also forward-compatible: if operators start
  populating column AG (which is currently empty in the source
  workbook), the check will surface real outliers without blocking
  saves.
- The return-type change of `validateInput()` is a private-method
  signature change — no public API was affected.

### Tests

- `tests/run-all-tests.ts` — section "Fix #4 — Issue 6.1/6.2"
  - `a septemberBalance >= 10000 is a warning, not an error` ✓
  - `a septemberBalance of 0 produces no warning` ✓
  - `a septemberBalance of 9999 (just under the limit) produces no warning` ✓
  - `undefined / null septemberBalance produces no warning (column AG is empty in Excel)` ✓
- `tests/integration/ledger-service.test.ts`
  - `create() succeeds when septemberBalance >= 10000 (soft warning, not a thrown error)` ✓
  - `create() still throws for genuinely invalid input (empty student name)` ✓
  - `create() still throws for negative remise (hard validation preserved)` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/fixes-verification.png` — Panel 4.

---

## Fix #5 — Issue 4.1 / 9.1: Arbitrary payment caps (25k / 71.5k / 30k / 15k / 10k)

### Original problem (from `software_review.md` §4.1 and §9.1)

> **§4.1**: Software (`ledger.service.ts`, `allocatePaymentToLedger`):
> ```typescript
> const slots = [
>   { key: "fi", max: 25000 },
>   { key: "v2", max: 71500 },
>   { key: "altV2", max: 71500 },
>   { key: "v3", max: 71500 },
>   { key: "t1", max: 30000 },
>   { key: "t2", max: 15000 },
>   { key: "t3", max: 10000 },
> ];
> ```
> **Excel reality**: There are **no caps**. The operator types
> whatever amount was received into whichever column they choose. A
> student might pay 100,000 in column S (V2). The software would cap
> this at 71,500 and overflow the rest into the next slot, producing
> incorrect column-level data.
>
> **§9.1**: This is a **payment domain** concern, not a ledger
> calculation concern. It also doesn't exist in Excel — the operator
> manually decides which column to credit. The `PaymentService`
> already exists and handles payment recording. This allocation logic
> should either be in `PaymentService` or removed entirely.

### Implemented solution

**Files changed**:
- `src/services/ledger.service.ts`

**Approach**: `allocatePaymentToLedger()` was rewritten to **not
mutate payment columns at all**. It now only records an audit-trail
comment in the column-AM format (mirroring the Excel workflow where
the operator hand-types a comment per payment).

```typescript
async allocatePaymentToLedger(
  studentId: string,
  amount: number,
  rcp: string,
): Promise<void> {
  const entries = await this.ledger.list({ studentId });
  if (entries.length === 0) return;
  const entry = entries[0];

  // Record the audit-trail comment in column-AM format:
  //   amount/day/month/receiptBook
  // This mirrors the Excel workflow where the operator hand-types
  // a comment per payment. We do NOT mutate the payment columns
  // (R–Y) — the operator decides which slot to credit via the UI.
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const rawText = `${amount}/${day}/${month} ${rcp}`;

  await this.auditComments.create({
    ledgerEntryId: entry.id.value,
    studentId,
    rawText,
  });

  logger.info("ledger.payment.auditRecorded", {
    ledgerEntryId: entry.id.value,
    studentId,
    amount,
    rcp,
  });
}
```

### Notes

- The method signature is unchanged — existing callers
  (e.g. `eventBus.subscribe("payment.recorded")`) continue to work
  without modification.
- The audit-comment format (`amount/day/month receipt`) matches the
  Excel column-AM convention documented in `suivis-clients-vault-text-only-no-code/03 - Columns and Codes/...`.
  The `parseAuditComment` helper (which already exists in the codebase)
  can parse this format.
- The operator's manual workflow is preserved exactly: they decide
  which slot (R/S/T/U/W/X/Y) to credit by editing the ledger row in
  the UI, just as they decided which column to type into in Excel.
- The phantom-transport problem (students without `OPTION=TRNSP`
  getting payments allocated to `t1/t2/t3`) is now impossible by
  construction — we never write to those columns automatically.

### Tests

- `tests/run-all-tests.ts` — section "Fix #5 — Issue 4.1/9.1"
  - `the old hardcoded caps array is no longer present in allocatePaymentToLedger` ✓
  - `the new method documents the Excel workflow (operator decides which slot to credit)` ✓
- `tests/integration/ledger-service.test.ts`
  - `allocatePaymentToLedger does NOT mutate payment columns (operator decides slot)` ✓
    - Verifies that after a 100,000 payment, all of `fi/v2/altV2/v3/t1/t2/t3` remain 0
    - Verifies that an audit comment was recorded mentioning both the amount (100000) and the receipt (RCP-001)

### Screenshot

See `el-imtiyaz_Variant/screenshots/fixes-verification.png` — Panel 5.

---

## Fix #6 — Issue 8.5: Phone-number type mismatch (string vs string[])

### Original problem (from `software_review.md` §8.5)

> Excel stores phone numbers as `0663701834/0660800317` (slash-
> separated). The software's `phoneNumbers` field is a plain string,
> which is fine, but the `Student` entity has
> `phoneNumbers: string[]` (an array). The import logic
> (`readRowAsLedgerInput`) stores it as a single string, creating a
> type mismatch.

### Implemented solution

**Files changed**:
- `src/shared/phone-numbers.ts` (NEW)
- `src/services/excel-ingestion.service.ts` — added clarifying comment

**Approach**: Created a new shared module with three exports:

```typescript
/** Parse "0663701834/0660800317" → ["0663701834", "0660800317"] */
export function parsePhoneNumbers(raw: string | null | undefined): string[];

/** Format ["0663701834", "0660800317"] → "0663701834/0660800317" */
export function formatPhoneNumbers(phones: string[] | null | undefined): string;

/** Runtime type-guard: detects raw multi-number strings. */
export function isRawPhoneNumbersString(value: unknown): value is string;
```

The parser tries each delimiter in priority order (`/`, `,`, `;`,
whitespace). The first delimiter that splits the string into >1 piece
wins — this avoids accidentally splitting a single phone number that
happens to contain a comma or semicolon (unlikely, but defensive).

The Excel ingestion service keeps storing the raw string on
`LedgerEntry.phoneNumbers` (which is correct — it mirrors the
spreadsheet cell exactly). A clarifying comment was added pointing
future callers at the new helper:

```typescript
case "phoneNumbers":
  // Excel stores phone numbers as a single slash-separated string
  // (e.g. "0663701834/0660800317"). The LedgerEntry entity mirrors
  // the raw string — see issue 8.5 in software_review.md. Callers
  // that need a structured array (e.g. the Student entity) should
  // use `parsePhoneNumbers()` from `shared/phone-numbers.ts`.
  input.phoneNumbers = String(value ?? "").trim();
  break;
```

### Notes

- The `LedgerEntry.phoneNumbers` field type remains `string` — this
  is intentional, as it's a faithful copy of the Excel cell. The
  mismatch is resolved by providing an explicit conversion helper
  rather than by changing the entity type.
- The `Student.phoneNumbers: string[]` field type is unchanged. Code
  that promotes a `LedgerEntry` to a `Student` should call
  `parsePhoneNumbers(ledgerEntry.phoneNumbers)` to populate the
  array.
- `formatPhoneNumbers()` is the inverse of `parsePhoneNumbers()` —
  useful for export/sync flows that write back to Excel.

### Tests

- `tests/run-all-tests.ts` — section "Fix #6 — Issue 8.5"
  - `parses a single slash-separated string into an array` ✓
  - `parses a comma-separated string` ✓
  - `parses a semicolon-separated string` ✓
  - `returns a single-element array for a lone number` ✓
  - `returns [] for empty / null / undefined input` ✓
  - `trims whitespace around each parsed number` ✓
  - `does NOT split a single number containing a hyphen` ✓
  - `formatPhoneNumbers is the inverse of parsePhoneNumbers` ✓
  - `formatPhoneNumbers([]) returns empty string` ✓
  - `formatPhoneNumbers filters out empty entries` ✓
  - `isRawPhoneNumbersString detects multi-number strings` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/fixes-verification.png` — Panel 6.

---

## Fix #7 — Issue 8.6: NV2/NV3/NV4/NV5 level codes not recognized

### Original problem (from `software_review.md` §8.6)

> Excel uses `NV2`, `NV3`, `NV4`, `NV5` as level codes for special/new
> students. The software's `StudentStatus` enum has `ACTIVE,
> SUSPENDED, GRADUATED, LEFT, PENDING` — no equivalent for these
> codes. They'd be imported as raw strings in the `level` field with
> no validation.

### Implemented solution

**Files changed**:
- `src/shared/level-codes.ts` (NEW)
- `src/services/excel-ingestion.service.ts` — adds advisory warning on unknown codes

**Approach**: Created a new shared module that makes the level-code
catalogue explicit. The list is intentionally permissive — validation
is `isValidLevelCode()` (returns boolean), not a hard error — so
legacy rows with unexpected codes still import. The catalogue is the
single source of truth for downstream code (UI dropdowns, reporting
categorisation, future strict validation).

```typescript
export const LEVEL_CODES = [
  "MS", "GS",                // Pre-school
  "PRIM",                    // Primary
  "COLG",                    // Collège
  "LYC",                     // Lycée
  "AUTISTE",                 // Specialised division
  "NV2", "NV3", "NV4", "NV5", // New/special admission (issue 8.6)
] as const;

export type LevelCode = (typeof LEVEL_CODES)[number];

export function isValidLevelCode(code: string | null | undefined): boolean;
export function normaliseLevelCode(code: string | null | undefined): LevelCode | null;

export const LEVEL_CODE_LABELS: Record<LevelCode, string>;
```

The `ExcelIngestionService.readRowAsLedgerInput()` was updated to log
an advisory warning when it encounters a level code outside the
canonical list:

```typescript
case "level": {
  const rawLevel = value ? String(value).trim() : undefined;
  input.level = rawLevel;
  if (rawLevel && !isValidLevelCode(rawLevel)) {
    logger.warn("excel.ingestion.unknownLevelCode", {
      sourceRow,
      level: rawLevel,
      hint: "Not in canonical LEVEL_CODES list. Imported as-is.",
    });
  }
  break;
}
```

### Notes

- The `StudentStatus` enum was **not** modified. The `NV*` codes are
  level codes (column G), not student statuses — they belong in a
  separate catalogue. Adding them to `StudentStatus` would have been a
  semantic error.
- The list is permissive on purpose: the source workbook contains
  occasional ad-hoc values (typos, one-off codes), and we don't want
  to break imports. The advisory warning surfaces them without
  blocking.
- `LEVEL_CODE_LABELS` is provided for UI rendering — every code has a
  human-readable description.

### Tests

- `tests/run-all-tests.ts` — section "Fix #7 — Issue 8.6"
  - `LEVEL_CODES includes the standard codes (MS, GS, PRIM, COLG, LYC, AUTISTE)` ✓
  - `LEVEL_CODES includes NV2/NV3/NV4/NV5 (issue 8.6)` ✓
  - `isValidLevelCode returns true for canonical codes (case-insensitive)` ✓
  - `isValidLevelCode returns false for unknown codes` ✓
  - `normaliseLevelCode uppercases recognised codes` ✓
  - `normaliseLevelCode returns null for unrecognised codes` ✓
  - `LEVEL_CODE_LABELS has an entry for every code in LEVEL_CODES` ✓

### Screenshot

See `el-imtiyaz_Variant/screenshots/fixes-verification.png` — Panel 7.

---

## How to run the tests

From the `el-imtiyaz_Variant/` directory:

```bash
# Install dependencies (first time only)
npm install

# Unit tests (35 tests, ~5 seconds)
npx tsx tests/run-all-tests.ts

# Integration tests (6 tests, ~2 seconds — uses an in-memory SQLite DB)
npx tsx tests/integration/ledger-service.test.ts

# Regenerate the verification screenshots
npx tsx scripts/generate-screenshot.ts
npx tsx scripts/generate-test-output-screenshots.ts
```

## What was NOT fixed in this iteration (and why)

The remaining 40+ issues in `software_review.md` are intentionally
left for future iterations. They fall into categories that are either:

1. **Architecturally deep** — e.g. the broken inter-rule data flow
   (§1 of the architectural analysis), the flat fee schedule (§3),
   the missing transport conditional (§4), the per-row formula model
   (§2). These require coordinated refactors across multiple services
   and would not fit in a single iteration's context window.
2. **Require business-decision input** — e.g. the sibling-discount
   pipeline (Mismatch C), the BON print template (Mismatch E), the
   family-grouping service (§8.1). These need product-owner decisions
   about the desired workflow before code can be written.
3. **Phantom features that should be removed only after a migration
   plan** — e.g. the `advances` field on QuoteBlock (§5.2), the
   `schoolFeeTax` persisted field (§5.3, §9.2). Removing them
   requires a database migration and UI changes.
4. **Display-layer concerns** — e.g. conditional formatting (§7.4).
   These are UI tasks that should be tackled in a dedicated frontend
   iteration.

The fixes documented above were selected because each one is:

- Self-contained (no cross-service refactor required)
- Verifiable with high confidence (automated tests pass)
- Backward-compatible (no breaking API or DB schema changes)
- Faithful to the original Excel workflow (per the user's instruction)
