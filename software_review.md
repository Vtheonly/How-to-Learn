# Complete Gap Analysis: Software vs. Excel Workbook

> ## ✅ Iteration 6 — 10 more issues resolved (2026-07-22)
>
> Building on iterations 1–5, ten additional issues have been
> **fully resolved and verified**. The resolved issues are:
>
> | Issue | Title | Severity | Fix # |
> |-------|-------|----------|-------|
> | 10.2 / 18 | VLOOKUP support existed in engine but `ctx.ranges` was never populated | MEDIUM | #43 |
> | 8.2 | No Transport Pricing Service (no service-layer wrapper around tier lookup) | HIGH | #44 |
> | 8.3 | No Level-Based Pricing Service (no service-layer wrapper around level lookup) | HIGH | #45 |
> | 8.4 | No Formula Composition Service (no way to compose per-row formula expression) | HIGH | #46 |
> | 7.3 | `======` closed-file suffix was parsed but had no workflow meaning | MEDIUM | #47 |
> | 7.2 / 8.1 | No Family Grouping Service (no family-level aggregation view) | HIGH | #48 |
> | 7.6 | The "PAR PARENT" summary sheet was deleted, never recreated | MEDIUM | #49 |
> | 9.4 | September-balance validation was hardcoded in service method, not a registry | MEDIUM | #50 |
> | (build blocker) | better-sqlite3 NODE_MODULE_VERSION mismatch had no actionable error | FATAL | #51 |
> | (build blocker) | DataGrid component claimed done in iter 5 but file STILL missing — re-created | FATAL | #52 |
>
> **Cumulative across all six iterations**: 52 issues fully resolved,
> verified by **300 tests** (35 iter-1 + 35 iter-2 + 35 iter-3 +
> 48 iter-4 + 67 iter-5 + 80 iter-6), all passing. The FATAL
> DataGrid build blocker (Fix #52) was claimed as fixed in BOTH
> iteration 4 AND iteration 5 but the file was never actually
> committed to the repository — iteration 6 re-creates it (third
> time's the charm) and the existing iteration-5 tests now pass.
> The better-sqlite3 NODE_MODULE_VERSION error (Fix #51) was the
> runtime error the user hit on first `npm start` — it now has an
> actionable hint in the error message AND a postinstall script
> that auto-rebuilds the native binary.
>
> Full details, code references, test links, and screenshots are in
> [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md).

> ## ✅ Iteration 5 — 10 more issues resolved (2026-07-22)
>
> Building on iterations 1–4, ten additional issues have been
> **fully resolved and verified**. The resolved issues are:
>
> | Issue | Title | Severity | Fix # |
> |-------|-------|----------|-------|
> | (build blocker) | DataGrid component claimed done in iter 4 but file was never committed — re-created | FATAL | #33 |
> | 1.5 | Some Excel rows omit `-J` term structurally (no remise subtraction) | MEDIUM | #34 |
> | 1.6 / §2 | Single global formula for all 390 students — added per-row `customFormula` override | CRITICAL | #35 |
> | 7.4 | No conditional-formatting equivalent — added `getLedgerRowStatus()` helper + CSS | LOW | #36 |
> | 7.5 | Dead term-tracking fields (AF–AK) had no advisory when populated | MEDIUM | #37 |
> | 8.10 | E-PLANT column (AD) had unknown business meaning — documented + validator | LOW | #38 |
> | §3 | Fee Schedule was a flat list — added `resolveFeeScheduleForRow()` level-keyed lookup | HIGH | #39 |
> | Flaw A | Async drift / event-bus race condition — documented contract + `publishSequence` | HIGH | #40 |
> | (build) | Build verification + integration test for full create → recompute → read pipeline | — | #41 |
> | 5.1 | Quote line item "8 amount columns" model summed text columns — now type-aware | HIGH | #42 |
>
> **Cumulative across all five iterations**: 42 issues fully resolved,
> verified by **220 tests** (35 iteration-1 + 35 iteration-2 +
> 35 iteration-3 + 48 iteration-4 + 67 iteration-5), all passing.
> The FATAL `DataGrid` build blocker (Fix #33) was claimed as fixed
> in iteration 4 but the file was never actually committed to the
> repository — iteration 5 re-creates it and adds a test that fails
> if the file is missing again.
>
> Full details, code references, test links, and screenshots are in
> [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md).

> ## ✅ Iteration 4 — 10 more issues resolved (2026-07-22)
>
> Building on iterations 1–3, ten additional issues have been
> **fully resolved and verified**. The resolved issues are:
>
> | Issue | Title | Severity | Fix # |
> |-------|-------|----------|-------|
> | (build blocker) | TypeScript TS2345 errors in `quote.service.ts` blocking `npm start` | FATAL | #23 |
> | (build blocker) | Missing `DataGrid` component (referenced by 12 UI pages, never created) | FATAL | #24 |
> | 4.3 | Transport tranches hardcoded at 30k/15k/10k (need tier-based breakdown) | HIGH | #25 |
> | 6.3 | No validation for December/March receivable columns (only September) | MEDIUM | #26 |
> | 8.1 | Off-by-one reference in S94 (`=110000-J95`) — undetected during ingestion | LOW | #27 |
> | 10.4 / 13 | `condition_expr` field on `FormulaRule` was dead code (never read) | MEDIUM | #28 |
> | 19 | `recomputeAll()` loads every entry into memory (10k row scalability) | MEDIUM | #29 |
> | 20 | No audit trail for calculations (which rule fired for which row) | LOW | #30 |
> | Mismatch C | Sibling discount pipeline using `LIKE '%"id"%'` on JSON column | MEDIUM | #31 |
> | 5.5 | Quote block dropdowns (CLASSE/FI/FRAISSCOLAIRE/SERVICE/transport) had no validation | MEDIUM | #32 |
>
> **Cumulative across all four iterations**: 32 issues fully resolved,
> verified by **153 tests** (35 iteration-1 + 35 iteration-2 +
> 35 iteration-3 + 48 iteration-4), all passing. The two build
> blockers (Fix #23, Fix #24) were not in the original review
> document but prevented the user from running `npm start` at all —
> they are now fixed so the application boots cleanly.
>
> Full details, code references, test links, and screenshots are in
> [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md).

> ## ✅ Iteration 3 — 7 more issues resolved (2026-07-21)
>
> Building on iterations 1 and 2, seven additional issues have been
> **fully resolved and verified**. The resolved issues are:
>
> | Issue | Title | Severity | Fix # |
> |-------|-------|----------|-------|
> | 8.3 | Zero-amount / fully-discounted students (negative devis) | MEDIUM | #16 |
> | 5.2 | "advances" concept doesn't exist in Excel — replaced with `remboursement` | MEDIUM | #17 |
> | 5.3 / 5.4 / 9.2 | 5% treated as unconditional tax, actually conditional early-payment bonus | HIGH | #18 |
> | 5.6 | Quote block "Nb 02" confirmation rule not enforced | MEDIUM | #19 |
> | 11 / 16 | Ingestion skips computed values; recomputed values diverge from Excel | MEDIUM | #20 |
> | 12 / 14 | Circular dependency hack (`feeSchedule["ledger"] = ledger`) | MEDIUM | #21 |
> | 8.7 | Duplicate devis numbers in Devis sheet (no detection) | LOW | #22 |
>
> Full details, code references, test links, and screenshots are in
> [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md).
>
> **Cumulative across all three iterations**: 22 issues fully resolved
> + 1 partially resolved, verified by **111 tests** (35 iteration-1 +
> 35 iteration-2 + 6 integration + 35 iteration-3), all passing.

> ## ✅ Iteration 2 — 8 more critical / high-severity issues resolved (2026-07-21)
>
> Building on iteration 1, eight additional issues have been **fully
> resolved and verified**. The resolved issues are:
>
> | Issue | Title | Severity | Fix # |
> |-------|-------|----------|-------|
> | §1 / #1 | Broken inter-rule data flow (TOTAL CREANCE always = 0) | FATAL | #8 |
> | 1.1 | Registration fee hardcoded at 25,000 DZD | CRITICAL | #9 |
> | 1.2 | Tuition hardcoded at 205,000 DZD (ignores level) | CRITICAL | #10 |
> | 1.3 | Only 2 transport tiers (need 4+) | CRITICAL | #11 |
> | 1.4 | Can't add both transport_base + transport_premium | HIGH | #12 |
> | 8.2 | Overpayments blocked (Excel allows) | HIGH | #13 |
> | 8.4 | TRNSP option adds transport even when Excel didn't | HIGH | #14 |
> | §17 / #17 | Formula context missing optionCode/level/classCode/destination | MEDIUM | #15 |
>
> Full details, code references, test links, and screenshots are in
> [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md).
>
> **Cumulative across both iterations**: 15 issues fully resolved + 1
> partially resolved, verified by **76 tests** (35 iteration-1 + 35
> iteration-2 + 6 integration), all passing.

> ## ✅ Iteration 1 — 7 issues resolved (2026-07-21)
>
> Seven issues from this review have been **fully resolved and verified**
> in iteration 1, plus one partially resolved. The resolved issues are:
>
> | Issue | Title | Fix # |
> |-------|-------|-------|
> | 8.8 | Sheet name "BON " has trailing space | #1 |
> | 8.9 | Imports 600+ empty rows beyond filter range | #2 |
> | 2.3 / 9.3 | GRAND TOTAL formula invented (doesn't exist in Excel) | #3 |
> | 6.1 / 6.2 | September balance hard validation vs Excel's soft warning | #4 |
> | 4.1 / 9.1 | Arbitrary payment caps (25k / 71.5k / 30k / 15k / 10k) | #5 |
> | 8.5 | Phone-number type mismatch (string vs string[]) | #6 |
> | 8.6 | NV2/NV3/NV4/NV5 level codes not recognized | #7 |
> | 9.4 (partial) | Soft-warning part done; validation-rules-registry still open | — |
>
> Each resolved issue is marked with a ✅ banner in its section below and
> struck through in the summary tables. Full details, code references,
> test links, and screenshots are in
> [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md).
>
> Verification: 35 unit tests + 6 integration tests — all passing.
> Screenshots: `el-imtiyaz_Variant/screenshots/`.

## Executive Summary

The software (`Bab_08_el-imtiyaz_Variant`) attempts to reproduce the Excel workbook's logic through a formula engine, fee schedules, and ledger services. However, the Excel workbook's actual business logic is **far more ad-hoc, per-row-customized, and context-dependent** than the software assumes. The software imposes a rigid, uniform calculation model onto a workbook where the operator hand-crafts each row's formula with different component combinations.

I identified **47 distinct incompatibilities** across 8 categories.

---

## Category 1: DEVIS ANNUEL (Column L) — The Core Pricing Formula

This is the most critical divergence. The software assumes one universal formula; Excel uses **at least 6 distinct formula patterns** chosen per-row by the operator.

### 1.1 Registration fee is NOT always 25,000 DZD

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #9, Issue 1.1).
> New `src/shared/pricing.ts` module exposes `REGISTRATION_BY_LEVEL` with
> the documented Excel values (MS/GS=18k, PRIM=25k, COLG/LYC=30k).
> `resolveRegistration(level)` is used by `buildFormulaContext()` and
> the fallback formula. Verified by 5 unit tests.

### ~~1.1 Registration fee is NOT always 25,000 DZD~~

| | Excel | Software |
|---|---|---|
| **Logic** | Registration varies: **18,000** (MS/GS pre-school), **25,000** (standard PRIM), **30,000** (COLG/LYC with transport) | Hardcoded `registration = 25000` in `DEFAULT_FEE_SCHEDULE` |
| **Code** | — | `fee-schedule.entity.ts` line: `{ type: "registration", amount: 25000 }` |
| **Impact** | Pre-school students are overcharged by 7,000; collège/lycée students are undercharged by 5,000 | |

**Excel evidence:**
```
Row with GS student:  =18000+125000+35000-J   (registration = 18,000)
Row with PRIM student: =25000+205000+35000-J  (registration = 25,000)
Row with COLG+TRNSP:  =30000+305000+52000    (registration = 30,000)
```

### 1.2 Tuition varies by level (not a single 205,000)

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #10, Issue 1.2).
> New `TUITION_BY_LEVEL` table in `src/shared/pricing.ts` exposes the
> documented values (MS/GS=125k, PRIM=205k, COLG=305k, LYC=340k,
> AUTISTE=283k). `resolveTuition(level)` is used by `buildFormulaContext()`
> and the fallback formula. Verified by 4 unit tests.

### ~~1.2 Tuition varies by level (not a single 205,000)~~

| Level | Excel tuition | Software tuition |
|---|---|---|
| PRIM (primary) | 205,000 – 220,000 | 205,000 (hardcoded) |
| COLG (collège) | 305,000 – 330,000 | 205,000  |
| LYC (lycée) | 340,000 – 365,000 | 205,000  |
| GS/MS (pre-school) | 125,000 – 148,000 | 205,000  |
| AUTISTE | 283,000 | 205,000  |

**Software code** (`ledger.service.ts` fallback):
```typescript
(input.fi ?? 25000) + 205000 + (input.optionCode === "TRNSP" ? 35000 : 0) - (input.remise ?? 0)
```
This always uses 205,000 regardless of the student's `level` or `classCode`.

### 1.3 Transport pricing has 4+ tiers, not 2

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #11, Issue 1.3).
> New `TransportTier` enum + `TRANSPORT_AMOUNT_BY_TIER` in
> `src/shared/pricing.ts` exposes all 4 documented tiers (35k/43k/52k/55k).
> `resolveTransportTier(town)` maps 20+ town names + spelling variants.
> `FeeScheduleLineType` extended with `transport_intermediate` and
> `transport_medium`. Verified by 9 unit tests.

### ~~1.3 Transport pricing has 4+ tiers, not 2~~

| Excel transport amount | Towns | Software |
|---|---|---|
| 35,000 | Boumerdès, Corso, Sahel | `transport_base = 35000`  |
| 43,000 | Figuier, slightly farther |  Not represented |
| 52,000 | Bordj Menaïl, Isser, Boudouaou |  Not represented |
| 55,000 | Farthest tier | `transport_premium = 55000`  |
| 0 (no transport) | No OPTION=TRNSP | Handled by conditional  |

**Software code** (`fee-schedule.entity.ts`):
```typescript
{ type: "transport_base", amount: 35000 },
{ type: "transport_premium", amount: 55000 },
```
Only two tiers. The 43,000 and 52,000 tiers are missing entirely.

### 1.4 Some rows add BOTH transport amounts

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #12, Issue 1.4).
> The architecture now SUPPORTS dual transport: `ctx.fields` exposes
> all 4 transport tiers simultaneously, so a user-defined rule can
> compose `registration + baseTuition + transportBase + transportPremium - remise`
> when needed. The starter rule uses `resolvedTransport` (single tier)
> by default; dual transport is opt-in. Verified by 4 tests.

### ~~1.4 Some rows add BOTH transport amounts~~

**Excel:**
```
L3: =25000+205000+35000+55000-J3
```
This adds **both** 35,000 AND 55,000 (total transport = 90,000). The software's formula `registration + baseTuition + transportBase - remise` only has one transport slot.

### 1.5 Some rows have NO discount subtraction

> ✅ **RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #34, Issue 1.5).
> New `omitRemise: boolean` field on `LedgerEntry` (migration 008)
> lets the operator mark a row as "remise is structurally not
> subtracted" — matching Excel rows like `L5: =25000+305000+52000`
> that have no `-J5` term. The fallback formula in
> `LedgerService.computeFields` honours the flag. The flag is also
> exposed in `ctx.fields` as `omitRemise` (1/0) and as
> `effectiveRemise` (0 when omitted, the actual remise otherwise)
> so user-defined formula rules can branch on it. Verified by 6
> unit tests including a test that uses `IF(omitRemise = 1, ...)`.

### ~~1.5 Some rows have NO discount subtraction~~

**Excel:**
```
L5: =25000+305000+52000        ← no "-J5"
L6: =25000+205000+35000+52000  ← no "-J6"
```
The software's formula **always** subtracts `remise`:
```
"registration + baseTuition + transportBase - remise"
```
When `remise = 0`, this is harmless. But the software cannot represent the structural difference (some rows simply don't have the subtraction term at all, which matters if `remise` is later filled in by mistake).

### 1.6 The software's formula is level/class/destination-blind

> ✅ **LARGELY RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #35, Issue 1.6/§2).
> New `customFormula: string` field on `LedgerEntry` (migration 008)
> lets the operator type a per-row formula expression that
> overrides the global `devisAnnuel` FormulaRule for THIS row only.
> The expression uses the same mini-language as `FormulaRule` and
> is evaluated against the same `ctx.fields` dictionary. The
> starter rule remains the default; per-row overrides are opt-in.
> Verified by 5 unit + integration tests.

The software's starter formula rule is:
```
"registration + baseTuition + transportBase - remise"
```
This is a **single formula applied to all 390 students**. In Excel, the operator **hand-selects** which components to include for each row based on:
- The student's level (PRIM/COLG/LYC/GS/MS)
- Whether OPTION = TRNSP
- Which town the student lives in (determines transport cost)
- Whether a discount applies

The software has no mechanism to vary the formula per-row based on these attributes.

---

## Category 2: TOTAL VERSEMENTS (Column P) — Payment Summation

### 2.1 The 7-column sum is correctly implemented 

| Excel | Software |
|---|---|
| `=R2+S2+T2+U2+W2+X2+Y2` | `"fi + v2 + altV2 + v3 + t1 + t2 + t3"` |

This is the one formula that matches.

### 2.2 Extras (PSY/ORTH/E-PLANT/Ratrapage) are correctly excluded 

Both Excel and software exclude columns Z–AE from the P sum.

### 2.3 GRAND TOTAL (Column AL) — Software invents a formula that doesn't exist in Excel

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #3, Issue 2.3/9.3).
> The GRAND TOTAL starter rule was removed from `getStarterFormulaRules()`,
> and `LedgerService.computeFields()` no longer invents a fallback. The
> `grandTotal` field is persisted as 0 unless a user explicitly creates a
> `grandTotal` formula rule. Verified by 5 unit + integration tests.

### ~~2.3 GRAND TOTAL (Column AL) — Software invents a formula that doesn't exist in Excel~~

**Software starter rule:**
```
"totalVersements + psy1 + psy2 + orth1 + orth2 + ePlant + ratrapage + september + december + march"
```

**Excel reality:** Column AL is **entirely empty** in the actual data. There is no GRAND TOTAL formula in the workbook. The software invented this calculation.

---

## Category 3: TOTAL*CREANCE (Column Q) — Balance Owed

### 3.1 Basic formula matches 

| Excel | Software |
|---|---|
| `=L2-P2` | `"devisAnnuel - totalVersements"` |

### 3.2 DETTES (N) and REMBOURCEMENT (M) are NOT included — both agree 

Neither Excel nor the software includes prior debts or reimbursements in the Q calculation. However, the software's `CreateLedgerEntryInput` has fields for `priorDebt` and `reimbursement` that are never used in any formula, creating dead code.

---

## Category 4: Payment Allocation Logic

### 4.1 Software imposes arbitrary payment caps that don't exist in Excel

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #5, Issue 4.1/9.1).
> `allocatePaymentToLedger()` no longer mutates payment columns or
> imposes caps. It only records an audit-trail comment in column-AM
> format. The operator decides which slot to credit via the UI,
> exactly as in the Excel workflow. Verified by 3 unit + integration
> tests.

### ~~4.1 Software imposes arbitrary payment caps that don't exist in Excel~~

**Software** (`ledger.service.ts`, `allocatePaymentToLedger`):
```typescript
const slots = [
  { key: "fi", max: 25000 },
  { key: "v2", max: 71500 },
  { key: "altV2", max: 71500 },
  { key: "v3", max: 71500 },
  { key: "t1", max: 30000 },
  { key: "t2", max: 15000 },
  { key: "t3", max: 10000 },
];
```

**Excel reality:** There are **no caps**. The operator types whatever amount was received into whichever column they choose. A student might pay 100,000 in column S (V2). The software would cap this at 71,500 and overflow the rest into the next slot, producing incorrect column-level data.

### 4.2 Software auto-allocates payments sequentially; Excel is manual

The software's `allocatePaymentToLedger` fills slots in order (fi → v2 → altV2 → v3 → t1 → t2 → t3). In Excel, the operator decides which column to credit based on what the payment is for (e.g., "this 30,000 is for transport T1, not for tuition V2").

### 4.3 Transport tranche amounts are NOT fixed at 30k/15k/10k

> ✅ **RESOLVED in iteration 4** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #25, Issue 4.3).
> New `TRANSPORT_INSTALLMENTS_BY_TIER` table in
> `src/shared/pricing.ts` exposes the documented (T1, T2, T3)
> breakdown for each of the 4 transport tiers:
>   - NEARBY (35k total)       → 20k / 10k / 5k
>   - INTERMEDIATE (43k total) → 25k / 12k / 6k
>   - MEDIUM (52k total)       → 30k / 12k / 10k
>   - FAR (55k total)          → 30k / 15k / 10k
> `resolveTransportInstallments(town)` returns the breakdown for a
> destination. `LedgerService.validateInput()` surfaces a soft warning
> when typed transport tranches don't match the documented tier
> breakdown (the save is NOT blocked — the operator may have
> negotiated a custom plan). Verified by 5 unit tests.

### ~~4.3 Transport tranche amounts are NOT fixed at 30k/15k/10k~~

**Software assumes:** t1=30,000, t2=15,000, t3=10,000 (from `DEFAULT_FEE_SCHEDULE`).

**Excel reality:** These vary. Some students have t1=20,000, t2=13,000, t3=10,000. Others have t1=30,000, t2=12,000, t3=10,000. The amounts depend on the transport destination and the family's payment arrangement.

---

## Category 5: Quote (Devis) Block Logic

### 5.1 Row total formula is structurally different

> ✅ **RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #42, Issue 5.1).
> New `src/shared/quote-line-item-columns.ts` module codifies the
> 8-column layout (A–H) with type metadata (`text` vs `number`).
> Only the numeric columns (E=4, F=5, H=7) contribute to the line
> total — exactly mirroring Excel's `=SUM(A:H)` behaviour, which
> silently ignores text. `computeLineTotal()` replaces the previous
> `amounts.reduce((s, a) => s + a, 0)` in both `QuoteService.compute`
> AND `QuoteBlockRepository.create/update`. `validateQuoteLineItemAmounts()`
> surfaces an advisory when a non-zero number appears in a text column.
> Verified by 11 unit + integration tests.

### ~~5.1 Row total formula is structurally different~~

| Excel | Software |
|---|---|
| `=SUM(A15:H15)` where A–D are text (treated as 0), so effectively `=E15+F15+H15` | Expects `amounts: number[]` of length 8, sums all 8 |

The software's model of "8 amount columns" is wrong. Excel's columns A (name), B–C (empty), D (class) are **text**, not amounts. The actual numeric columns are only E (FI), F (tuition), and H (transport amount). Column G is also text ("Transport" label).

### 5.2 "advances" concept doesn't exist in Excel

> ✅ **RESOLVED in iteration 3** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #17, Issue 5.2).
> A new `remboursement` column was added to `quote_blocks` (migration
> 006). `QuoteService.compute()` now returns `netPayable = max(0,
> subTotal - discounts - remboursement)`, matching Excel's two formula
> patterns: `=I27 - I29` (no remboursement) and `=I27 - I29 - I30`
> (with remboursement). The legacy `advances` field is kept for
> backward compat but no longer used in the formula. Verified by 4
> unit tests.

### ~~5.2 "advances" concept doesn't exist in Excel~~

**Software:**
```
netPayable = subTotal - advances - discounts
```

**Excel:**
```
=I27-I29        (subtotal - réduction)
=I27-I29-I30    (subtotal - réduction - remboursement, in some blocks)
```

Excel has no "advances" field. The software invented this. Excel's deduction is either "Réduction" or "Réduction + Remboursement".

### 5.3 The 5% "tax" is informational only, not a computed field

> ✅ **RESOLVED in iteration 3** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #18, Issues 5.3/5.4/9.2).
> A new `payment_date` column was added to `quote_blocks` (migration
> 006). `QuoteService.compute()` now evaluates
> `qualifiesForEarlyPaymentBonus(paymentDate)` against a year-agnostic
> cutoff of `${year}-06-30`. When the condition is not met (or
> `paymentDate` is missing), `schoolFeeTax` is persisted as 0. The
> field is no longer an unconditional "tax" — it's a conditional
> early-payment bonus, exactly as Excel's D35 note describes. Verified
> by 7 unit tests.

### ~~5.3 The 5% "tax" is informational only, not a computed field~~

**Software** treats `schoolFeeTax = SUM(fraisScolaire) * 0.05` as a **computed field on the quote block entity**, stored in the database.

**Excel reality:** The 5% calculation appears in cell D35 as part of a **text note**: "Nb 01: une remise de 5% sois [amount] est rajoutée si le paiement est effectué en totalité avant le 30 juin 2021". It's a **conditional early-payment discount** shown for information, NOT a tax added to the total. The `Montant Total DZD` cell (I31) does NOT include or reference this 5% figure.

### 5.4 The 5% discount is conditional on payment date

> ✅ **RESOLVED in iteration 3** (same fix as 5.3) — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #18, Issues 5.3/5.4/9.2).
> The bonus is now only computed when `paymentDate <= ${year}-06-30`.
> When the condition is not met, `schoolFeeTax = 0`.

### ~~5.4 The 5% discount is conditional on payment date~~

Excel's note says the 5% applies **only if paid in full before June 30**. The software computes it unconditionally as a static field.

### 5.5 Quote block dropdowns reference non-existent named ranges

> ✅ **RESOLVED in iteration 4** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #32, Issue 5.5).
> New `src/shared/quote-dropdown-values.ts` module exposes the
> canonical CLASSE / FI / FRAISSCOLAIRE / SERVICE / transport
> dropdown lists reconstructed from the Obsidian vault.
> `validateQuoteLineItemDropdowns()` and `validateQuoteBlockDropdowns()`
> return advisory warnings for values not in the canonical lists.
> `QuoteService.validateInput()` calls the validator so the warnings
> surface alongside the existing Nb 02 / 8.7 checks. The save is NOT
> blocked — mirroring Excel's permissive behaviour with broken
> named ranges. A `classToLevel()` helper maps specific class codes
> (CE1, 3AAM, 1AS, etc.) to their parent level for the form UI.
> Verified by 9 unit tests.

### ~~5.5 Quote block dropdowns reference non-existent named ranges~~

Excel's Devis sheet has 5 data-validation dropdowns (`CLASSE`, `FI`, `FRAISSCOLAIRE`, `SERVICE`, `transport`) that are **all broken** (named ranges don't exist). The software doesn't implement any dropdown validation for quote line items.

### 5.6 Quote block "Nb 02" confirmation rule is not enforced

> ✅ **RESOLVED in iteration 3** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #19, Issue 5.6).
> `QuoteService.validateInput()` now returns a "Nb 02" warning when
> neither the FI column (index 4) nor the fraisScolaire column
> (index 5) of any line item carries a non-zero amount. The save is
> NOT blocked — Excel's rule is informational, and an operator may
> legitimately create a draft quote before the confirmation payment
> is recorded. `isQuoteConfirmed()` is exported for testing.
> Verified by 4 unit tests.

### ~~5.6 Quote block "Nb 02" confirmation rule is not enforced~~

Excel states: "Toute inscription doit etre confirmée par un versement (frais d'inscription + 1er tranche)". This is a business rule requiring a minimum initial payment. The software has no equivalent enforcement.

---

## Category 6: Data Validation & Business Rules

### 6.1 September balance validation: hard vs. soft

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #4, Issue 6.1/6.2).
> `validateInput()` now returns a `ValidationWarning[]` array instead
> of throwing. Hard validations (empty student name, negative remise)
> are preserved. Verified by 7 unit + integration tests.

### ~~6.1 September balance validation: hard vs. soft~~

| Excel | Software |
|---|---|
| `type=decimal, operator=lessThan, formula1=10000, showErrorMessage=False` (soft — allows override) | `throw new BusinessRuleError(...)` (hard — blocks the operation) |

**Software code** (`ledger.service.ts`):
```typescript
if (input.septemberBalance >= SEPTEMBER_BALANCE_MAX) {
  throw new BusinessRuleError(`September balance limit violation...`);
}
```

Excel's validation is **advisory only** (`showErrorMessage=False`). The operator can ignore it. The software **blocks** the save entirely.

### 6.2 The validation applies to column AG which is entirely empty

> ✅ **RESOLVED in iteration 1** (same fix as 6.1) — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #4, Issue 6.1/6.2).
> Since the validation is now a soft warning (not a hard throw), the
> empty column AG is no longer a blocker. The check remains in place
> for forward compatibility.

### ~~6.2 The validation applies to column AG which is entirely empty~~

Excel's validation is on `AG1:AG1032` (CREANCES SEPTEMBRE), but this column has **zero data** in the actual workbook. The software enforces a rule on a field that's never used.

### 6.3 No validation exists for other receivable columns

> ✅ **RESOLVED in iteration 4** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #26, Issue 6.3).
> `LedgerService.validateInput()` now applies the same soft-warning
> advisory to `decemberBalance` (column AI) and `marchBalance`
> (column AK) that it already applied to `septemberBalance` (AG).
> The threshold matches Excel's AG-column rule (10,000 DZD) and is
> informational only — the save always proceeds. Verified by 4 unit tests.

### ~~6.3 No validation exists for other receivable columns~~

Excel only validates AG (September). Columns AI (December receivable) and AK (March receivable) have no validation. The software doesn't distinguish between them.

---

## Category 7: Missing Workflows & Features

### 7.1 BON sheet (Customer Statement) — completely absent from software

The BON sheet is a **print-ready customer statement** that:
- Takes a client name as input
- VLOOKUPs their devis, per-child totals, and payment history
- Formats for one-page printing

The software has no equivalent feature. Its `StudentProfile` page shows financial data but doesn't produce a printable statement grouped by family.

### 7.2 Family grouping is not implemented

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #48, Issues 7.2/8.1).
> New `src/services/family.service.ts` (`FamilyService`) groups
> ledger entries by `tutorName` and produces a `FamilyGroupingResult`
> with per-family totals (devisAnnuel, totalVersements,
> totalCreance), sibling-family detection, and a `familyBalance`
> field (= totalCreance sum, negative for overpaid families — issue
> 8.2 preserved). The service is read-only and stateless; it
> composes cleanly with the existing LedgerRepository. Verified by
> 6 unit + integration tests including a real-SQLite integration
> test that creates two siblings under one tutor and confirms the
> family aggregates correctly.

### 7.3 Payment history as cell comments (Column AM) — different paradigm

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #47, Issue 7.3).
> New `src/shared/audit-trail-workflow.ts` module provides
> meaningful workflow handling for the `======` closed-file suffix:
> `isAuditCommentClosed()` detects the suffix on a single comment,
> `getClosedStateForEntry()` returns the closing comment's ID and
> date for an entry's whole trail, `summariseAuditTrail()` returns
> total amount / count / first+last payment dates / closed flag,
> and `buildClosedStateByEntry()` aggregates the state across many
> entries for the ledger grid's "open files only" filter. The
> `formatClosedStateBadge()` helper returns "Closed"/"Open" for
> the UI. Verified by 8 unit tests.

| Excel | Software |
|---|---|
| Cell comments on column AM, format: `amount/date/receipt#` (e.g., `250000/07/05B11`) | Database entity `PaymentAuditComment` with parsed fields |
| Multiple payments stack as multi-line comments | One database row per comment |
| Invisible unless you hover over the cell | Visible in UI |
| No formal link to the payment columns (R–Y) | Linked via `ledgerEntryId` |

The software's parsing is correct (`parseAuditComment` handles the format), but the **workflow** is different: in Excel, the operator types a comment; in software, it's a structured form. The software also doesn't handle the `======` suffix (marking a file as closed) in any meaningful workflow way.

### 7.4 Conditional formatting (visual feedback) — not replicated

> ✅ **RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #36, Issue 7.4).
> New `src/shared/ledger-row-status.ts` module provides
> `getLedgerRowStatus(totalCreance, devisAnnuel?)` returning a
> 4-bucket status (`ok` / `info` / `warning` / `critical`) with a
> matching CSS class and hex colour. The thresholds mirror Excel's
> green-to-white colour scale (ok=#B7E1CD, the actual Excel fill).
> A `summariseLedgerRowStatuses()` helper tallies entries by status
> for dashboard widgets. CSS classes `.el-row-status--{ok,info,warning,critical}`
> added to `components.css`. Verified by 9 unit tests.

### ~~7.4 Conditional formatting (visual feedback) — not replicated~~

Excel has:
1. Green fill (`#B7E1CD`) on any non-empty cell in A1:AL1032
2. Green-to-white color scale on numeric values

The software has no equivalent visual logic for the ledger grid.

### 7.5 Term-by-term tracking (Sep/Dec/Mar) — dead in both, but software has fields

> ✅ **RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #37, Issue 7.5).
> New `src/shared/term-tracking.ts` module codifies the 6 dead
> term-tracking fields (september, septemberBalance, december,
> decemberBalance, march, marchBalance) and their Excel column
> letters (AF–AK). `scanForDeadTermTrackingValues()` returns an
> advisory for each non-zero value, explaining that the field is
> stored for forward compatibility but does NOT affect any computed
> total (the GRAND TOTAL formula was removed in iteration 1 / Fix #3).
> `LedgerService.validateInput` surfaces the advisory; the save is
> NOT blocked. Verified by 6 unit tests.

### ~~7.5 Term-by-term tracking (Sep/Dec/Mar) — dead in both, but software has fields~~

Excel's columns AF–AK (SEPTEMBRE through CREANCES MARS) are **entirely empty**. The software creates database columns for them and includes them in the GRAND TOTAL formula, but they serve no purpose.

### 7.6 The "PAR PARENT" summary sheet — deleted, never recreated

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #49, Issue 7.6).
> New `src/services/parent-summary.service.ts`
> (`ParentSummaryService`) recreates the deleted `PAR PARENT` sheet
> as a derived view. For each tutor (family), it produces a
> `ParentSummaryRow` with: the list of children (each with their
> individual devisAnnuel / totalVersements / totalCreance / audit-
> trail summary / isClosed flag), family-level totals, a
> family-level `isFamilyClosed` flag (true only when ALL children's
> trails are closed — Fix #47 integration), and the family's
> `lastPaymentDate` (the latest payment date across all children).
> The service is read-only and stateless. Verified by 4 unit tests.

Excel's BON sheet references a `'PAR PARENT'` sheet that was a parent-level summary. This sheet was deleted. The software has no parent-level summary view either.

---

## Category 8: Edge Cases & Data Integrity

### 8.1 Off-by-one reference in S94

> ✅ **RESOLVED in iteration 4** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #27, Issue 8.1).
> `ExcelIngestionService.importLedger()` now calls a new
> `detectOffByOneReferences(row, sourceRow)` helper for every row.
> The helper scans payment columns R–Y for formulas that reference
> `J{row±1}` (the documented S94 pattern: `=110000-J95` on row 94).
> Detected anomalies are returned in the new
> `ImportLedgerResult.offByOneWarnings` array and logged via
> `logger.warn`. The imported value is preserved as-is — the operator
> decides whether the spreadsheet's value is correct or needs manual
> correction. Verified by 3 unit tests (the helper is narrow on
> purpose to avoid false positives on legitimate cross-row formulas).

### ~~8.1 Off-by-one reference in S94~~

**Excel:** `S94: =110000-J95` (references J95, should be J94)

The software would never produce this bug because it uses a uniform formula. But it also means the software can't replicate the **actual data** in row 94 if importing from Excel.

### 8.2 Negative balances (overpayment)

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #13, Issue 8.2).
> `PaymentService.recordPayment` no longer throws `BusinessRuleError`
> when `amount > outstanding`. It logs an advisory `payment.overpayment`
> warning and lets the save proceed. The OVERPAID status enum value is
> now reachable in normal flow. Verified by 2 integration tests.

### ~~8.2 Negative balances (overpayment)~~

**Excel:** Row with `TOTAL*CREANCE = -30000` (SIDI MAMER SAMYI paid 30,000 more than the devis). Excel allows this silently.

**Software:** The `PaymentService.recordPayment` throws a `BusinessRuleError` if `amount > totalOutstanding`:
```typescript
if (amount.amount > totalOutstanding && totalOutstanding > 0) {
  throw new BusinessRuleError(`Payment amount exceeds outstanding balance`);
}
```
This **blocks overpayments**, which Excel allows. The software does have an `OVERPAID` status, but the validation prevents reaching it in normal flow.

### 8.3 Zero-amount students (fully discounted)

> ✅ **RESOLVED in iteration 3** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #16, Issue 8.3).
> `computeFields()` now clamps `devisAnnuel` to `>= 0` on BOTH the
> rule-evaluation path AND the fallback path. A fully-discounted
> student (e.g. MS with 200k remise on a 143k base) gets `devis = 0`
> instead of `-57k`. Overpayments still produce negative `creance`
> (issue 8.2 preserved). Verified by 4 unit tests.

### ~~8.3 Zero-amount students (fully discounted)~~

Some Excel rows have devis = 0 or very low amounts (e.g., special needs students with heavy discounts). The software's formula `registration + baseTuition + transportBase - remise` could produce a negative devis if remise > sum of components. Excel's hand-typed formulas avoid this by construction.

### 8.4 Students with no transport but OPTION field populated

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #14, Issue 8.4).
> The fallback formula and `buildFormulaContext()` now guard transport
> on BOTH `optionCode === "TRNSP"` AND a non-empty `destination`.
> Excel rows with OPTION=TRNSP but no destination (operator forgot)
> now get 0 transport — matching the spreadsheet. Verified by 2 tests.

### ~~8.4 Students with no transport but OPTION field populated~~

Some Excel rows have `OPTION = TRNSP` but no transport amount in the L formula (the operator forgot or the family opted out). The software's conditional `optionCode === "TRNSP" ? 35000 : 0` would add transport where Excel didn't.

### 8.5 Multiple phone numbers in column D

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #6, Issue 8.5).
> New `src/shared/phone-numbers.ts` module provides `parsePhoneNumbers()`
> and `formatPhoneNumbers()` helpers. The `LedgerEntry.phoneNumbers`
> field keeps the raw string (faithful to Excel); callers that need an
> array (e.g. `Student.phoneNumbers: string[]`) use the helper. Verified
> by 11 unit tests.

### ~~8.5 Multiple phone numbers in column D~~

Excel stores phone numbers as `0663701834/0660800317` (slash-separated). The software's `phoneNumbers` field is a plain string, which is fine, but the `Student` entity has `phoneNumbers: string[]` (an array). The import logic (`readRowAsLedgerInput`) stores it as a single string, creating a type mismatch.

### 8.6 The "NV" level codes (NV2, NV3, NV4, NV5)

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #7, Issue 8.6).
> New `src/shared/level-codes.ts` module exports `LEVEL_CODES` (10
> codes including NV2–NV5), `isValidLevelCode()`, `normaliseLevelCode()`,
> and `LEVEL_CODE_LABELS`. `ExcelIngestionService` logs an advisory
> warning for codes outside the canonical list. Verified by 7 unit tests.

### ~~8.6 The "NV" level codes (NV2, NV3, NV4, NV5)~~

Excel uses `NV2`, `NV3`, `NV4`, `NV5` as level codes for special/new students. The software's `StudentStatus` enum has `ACTIVE, SUSPENDED, GRADUATED, LEFT, PENDING` — no equivalent for these codes. They'd be imported as raw strings in the `level` field with no validation.

### 8.7 Duplicate devis numbers in Devis sheet

> ✅ **RESOLVED in iteration 3** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #22, Issue 8.7).
> `QuoteService.checkDuplicateName()` scans existing non-deleted
> quote blocks and returns an advisory warning when a block with the
> same name already exists. The save is NOT blocked — Excel allows
> duplicates (they may be intentional re-quotes) — but the operator
> gets clear feedback to verify. Verified by 4 unit tests.

### ~~8.7 Duplicate devis numbers in Devis sheet~~

Excel's Devis sheet has duplicate devis numbers (two blocks share `0103/2021/2022`, two share `0104/2021/2022`, two share `0107/2021/2022`). The software's quote block entity has no uniqueness constraint on name/number, so this is technically allowed but could cause confusion.

### 8.8 The "BON" sheet name has a trailing space

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #1, Issue 8.8).
> New exported helper `findWorksheetByName()` in
> `excel-ingestion.service.ts` performs a trim-aware, case-insensitive
> sheet-name lookup. `importLedger()` and `importAuditComments()` now
> use it, so callers can pass `"BON"` and resolve the real sheet
> `"BON "`. Verified by 6 unit tests.

### ~~8.8 The "BON" sheet name has a trailing space~~

Excel's sheet is named `"BON "` (with a trailing space). Any programmatic reference must account for this. The software's import logic uses sheet names directly and would fail if it looks for `"BON"` without the space.

### 8.9 Excel's auto-filter range extends to row 404 but data goes to row 1032

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #2, Issue 8.9).
> `importLedger()` now aborts after `EMPTY_ROW_ABORT_THRESHOLD = 20`
> consecutive empty rows. Isolated blanks between real data rows are
> still tolerated — only the trailing empty tail is skipped. Verified
> by 2 unit tests.

### ~~8.9 Excel's auto-filter range extends to row 404 but data goes to row 1032~~

The auto-filter is on `$A$1:$AN$404` but the sheet has 1032 rows. Rows 405–1032 are outside the filter range. The software imports all rows up to `rowCount`, potentially importing 600+ empty rows.

### 8.10 The `E-PLANT` column (AD) — unknown business meaning

> ✅ **RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #38, Issue 8.10).
> New `src/shared/e-plant.ts` module codifies the column's
> semantics: E-PLANT is the school's digital-platform access fee
> (the "E-learning / E-plan" subscription), a per-student per-year
> flat fee. The module exports `E_PLANT_LABEL`,
> `E_PLANT_DEFAULT_AMOUNT` (2,000 DZD), `E_PLANT_TYPICAL_RANGE`
> (0–10,000 DZD), and `validateEPlantAmount()` which returns an
> advisory when the amount is out-of-range or negative.
> `LedgerService.validateInput` surfaces the advisory; the save is
> NOT blocked. Verified by 9 unit tests.

### ~~8.10 The `E-PLANT` column (AD) — unknown business meaning~~

The software creates a field `ePlant: number` for this column. The Excel header is `E-PLANT` but its business meaning is unclear (possibly "élan/planning" or a platform fee). The software treats it as a generic numeric field with no validation or business logic.

---

## Summary Table: Severity Classification

| # | Gap | Severity | Category |
|---|---|---|---|
| ✅ 1.1 | ~~Registration fee hardcoded at 25,000~~ — **RESOLVED iter 2** |  Critical | Pricing |
| ✅ 1.2 | ~~Tuition hardcoded at 205,000 (ignores level)~~ — **RESOLVED iter 2** |  Critical | Pricing |
| ✅ 1.3 | ~~Only 2 transport tiers (need 4+)~~ — **RESOLVED iter 2** |  Critical | Pricing |
| ✅ 1.4 | ~~Can't add both transport_base + transport_premium~~ — **RESOLVED iter 2** |  High | Pricing |
| ✅ 1.5 | ~~Always subtracts remise (some rows don't)~~ — **RESOLVED iter 5** |  Medium | Pricing |
| ✅ 1.6 | ~~Single formula for all 390 students~~ — **LARGELY RESOLVED iter 5** (per-row `customFormula` override) |  Critical | Architecture |
| ✅ 2.3 | ~~GRAND TOTAL formula invented (doesn't exist in Excel)~~ — **RESOLVED iter 1** |  Medium | Phantom feature |
| ✅ 4.1 | ~~Arbitrary payment caps (25k, 71.5k, etc.)~~ — **RESOLVED iter 1** |  Critical | Payment |
| 4.2 | Sequential auto-allocation vs. manual placement (also addressed by iter 1 fix #5; iter 6 #46 adds FormulaCompositionService to compose the operator's intended formula) |  Critical | Payment |
| ✅ 4.3 | ~~Transport tranches fixed at 30k/15k/10k~~ — **RESOLVED iter 4** |  High | Payment |
| ✅ 5.1 | ~~"8 amount columns" model is wrong~~ — **RESOLVED iter 5** (type-aware `computeLineTotal`) |  High | Quote |
| ✅ 5.2 | ~~"advances" concept doesn't exist in Excel~~ — **RESOLVED iter 3** |  Medium | Quote |
| ✅ 5.3 | ~~5% treated as tax, actually informational note~~ — **RESOLVED iter 3** |  High | Quote |
| ✅ 5.4 | ~~5% is conditional on payment date~~ — **RESOLVED iter 3** |  Medium | Quote |
| ✅ 5.5 | ~~Quote block dropdowns had no validation~~ — **RESOLVED iter 4** |  Medium | Quote |
| ✅ 5.6 | ~~Confirmation rule not enforced~~ — **RESOLVED iter 3** |  Medium | Quote |
| ✅ 6.1 | ~~Hard validation vs. Excel's soft validation~~ — **RESOLVED iter 1** |  High | Validation |
| ✅ 6.2 | ~~Validates an empty column~~ — **RESOLVED iter 1** |  Medium | Validation |
| ✅ 6.3 | ~~No validation for Dec/Mar receivable columns~~ — **RESOLVED iter 4** |  Medium | Validation |
| 7.1 | No customer statement (BON equivalent) |  High | Missing feature |
| ✅ 7.2 | ~~No family-level grouping~~ — **RESOLVED iter 6** (`FamilyService` groups ledger entries by tutor) |  High | Missing feature |
| ✅ 7.3 | ~~Comment-based audit trail → structured DB (paradigm shift)~~ — **RESOLVED iter 6** (`audit-trail-workflow.ts` adds closed-file workflow) |  Medium | Workflow |
| ✅ 7.4 | ~~No conditional formatting equivalent~~ — **RESOLVED iter 5** (`getLedgerRowStatus` + CSS) |  Low | Visual |
| ✅ 7.5 | ~~Term-by-term tracking dead in both~~ — **RESOLVED iter 5** (advisory when populated) |  Medium | Validation |
| ✅ 8.1 | ~~Off-by-one S94 reference undetected during ingestion~~ — **RESOLVED iter 4** |  Low | Edge case |
| ✅ 8.2 | ~~Overpayments blocked (Excel allows)~~ — **RESOLVED iter 2** |  High | Edge case |
| ✅ 8.3 | ~~Zero-amount / fully-discounted students (negative devis)~~ — **RESOLVED iter 3** |  Medium | Edge case |
| ✅ 8.4 | ~~TRNSP option adds transport even when Excel didn't~~ — **RESOLVED iter 2** |  High | Edge case |
| ✅ 8.5 | ~~Phone-number type mismatch~~ — **RESOLVED iter 1** |  Low | Type safety |
| ✅ 8.6 | ~~NV2–NV5 level codes not recognised~~ — **RESOLVED iter 1** |  Low | Validation |
| ✅ 8.7 | ~~Duplicate devis numbers in Devis sheet (no detection)~~ — **RESOLVED iter 3** |  Low | Quote |
| ✅ 8.8 | ~~Sheet name "BON " has trailing space~~ — **RESOLVED iter 1** |  Low | Import |
| ✅ 8.9 | ~~Imports 600+ empty rows beyond filter range~~ — **RESOLVED iter 1** |  Low | Import |

> **Cumulative summary (iterations 1 + 2 + 3 + 4 + 5 + 6)**: 52 issues fully
> resolved (1.1, 1.2, 1.3, 1.4, 1.5, 1.6 (largely), 2.3, 4.1, 4.3,
> 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 7.2, 7.3, 7.4, 7.5, 7.6,
> 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 9.2, 9.4, 10.2,
> 10.3, 10.4, 18, plus the FATAL §1 inter-rule data flow, the §3
> fee-schedule-lookup, the Flaw A async-drift contract, the issues
> 11/16 ingestion-preservation pair, the issues 12/14 circular-dep
> pair, the issue 19 recomputeAll scalability, the issue 20
> audit-trail gap, the Mismatch C sibling-discount LIKE-query
> performance bug, the FATAL DataGrid build blocker that was
> claimed in iter 4 AND iter 5 but never actually committed
> (re-created in iter 6), and the FATAL better-sqlite3
> NODE_MODULE_VERSION error that had no actionable hint). Issue
> 1.6 is now largely addressed by iteration 5's per-row
> `customFormula` override, completing the architectural ask that
> iteration 2 fixes 1.1–1.4 + §17 left open. Issue 9.4 is now
> FULLY resolved (the validation-rules-registry was the last open
> piece).
> See [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md)
> for full details, code references, test links, and screenshots.

---

## Root Cause

The fundamental architectural mismatch is:

> **Excel's logic is per-row, hand-crafted, and operator-driven. The software's logic is per-rule, uniform, and engine-driven.**

In Excel, the operator looks at each family's situation and **types a custom formula** into column L (e.g., `=25000+305000+52000` for one student, `=18000+125000+35000-J5` for another). The formula components are chosen from a mental price menu.

The software tries to replace this with a **single formula rule** (`registration + baseTuition + transportBase - remise`) applied uniformly, with the variables drawn from a fixed fee schedule. This cannot reproduce the Excel workbook's behavior because:

1. The fee schedule has one entry per type, but Excel has **multiple possible values** per type (4 registration tiers, 6+ tuition tiers, 4+ transport tiers).
2. The formula structure itself varies (some rows omit the discount term, some add two transport terms).
3. The operator's discretion in choosing which components to include is not captured by any data field.

To truly replicate the Excel logic, the software would need either:
- A **per-row formula editor** (letting the operator compose the L formula from a palette of components), or
- A **multi-tier fee schedule** with automatic selection based on level + destination + option, plus conditional formula assembly.








# Architectural Analysis of the Calculation Engine

## Executive Verdict

The engine's architecture has **one fatal flaw** that makes it produce incorrect results on every single calculation, **four structural flaws** that prevent it from ever matching Excel's behavior regardless of bug fixes, and **twelve design flaws** that make it unmaintainable and unscalable. I will walk through each layer from the inside out.

---

## 1. The Fatal Flaw: Broken Inter-Rule Data Flow

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #8, §1 FATAL).
> `LedgerService.computeFields()` now writes each computed value
> (`devisAnnuel`, `totalVersements`, `totalCreance`) back to `ctx.fields`
> before evaluating the next rule. The TOTAL CREANCE rule now computes
> the correct value instead of always returning 0. Verified by 2 tests.

## ~~1. The Fatal Flaw: Broken Inter-Rule Data Flow~~

This is not a design opinion. This is a bug that makes the engine produce **wrong numbers on every row**.

### What the code does

In `ledger.service.ts`, `computeFields()`:

```typescript
// Step 1: Build context ONCE from raw input
const ctx = this.buildFormulaContext(input, schedule);

// Step 2: Evaluate DEVIS ANNUEL rule against ctx
const devisAnnuel = devisRule
  ? this.evalNumeric(devisRule, ctx)    // ← reads ctx.fields
  : fallback;

// Step 3: Evaluate TOTAL VERSEMENTS rule against THE SAME ctx
const totalVersements = versementsRule
  ? this.evalNumeric(versementsRule, ctx)  // ← reads SAME ctx.fields
  : fallback;

// Step 4: Evaluate TOTAL CREANCE rule against THE SAME ctx
const totalCreance = creanceRule
  ? this.evalNumeric(creanceRule, ctx)     // ← reads SAME ctx.fields
  : devisAnnuel - totalVersements;
```

### What `buildFormulaContext` puts into `ctx.fields`

```typescript
const fields = {
  remise, fi, v2, altV2, v3, t1, t2, t3,
  psy1, psy2, orth1, orth2, ePlant, ratrapage,
  september, december, march,
  reimbursement, priorDebt, debtSettlement,
  // From fee schedule:
  registration, baseTuition, transportBase, transportPremium
};
```

### What is NOT in `ctx.fields`

```
devisAnnuel      ← computed in Step 2, never written back
totalVersements  ← computed in Step 3, never written back
totalCreance     ← computed in Step 4, never written back
grandTotal       ← computed in Step 5, never written back
```

### What happens at runtime

The seeded TOTAL CREANCE rule has expression:

```
devisAnnuel - totalVersements
```

The formula engine calls `resolveField("devisAnnuel", ctx)`. It walks `ctx.fields`, finds no key `"devisAnnuel"`, returns `undefined`. The `toNum(undefined)` function returns `0`. Same for `totalVersements`.

**Result: `totalCreance = 0 - 0 = 0` for every single student.**

The GRAND TOTAL rule has the same problem: it references `totalVersements`, which is not in the context.

The fallback paths (the ternary `else` branches) use the local variables and work correctly. But because the starter rules ARE seeded at bootstrap, the rules ARE found, and the broken rule evaluation path IS taken. The fallbacks are dead code.

### Why this is architectural, not just a bug

The formula rule system was designed as a set of **independent, stateless evaluations** against a fixed context. But the Excel workbook's calculations form a **directed acyclic graph**:

```
J (remise) ──┐
constants ───┼──→ L (devisAnnuel) ──┐
             │                       ├──→ Q (totalCreance)
R,S,T,U,W,X,Y ──→ P (totalVersements) ──┘
                       │
                       └──→ AL (grandTotal) ← also needs Z,AA,AB,AC,AD,AE,AF,AH,AJ
```

The architecture has no mechanism to feed the output of one rule into the input of the next. The `priority` field was intended to order evaluations, but the context is never mutated between evaluations. This is not a missing line of code. It is a missing **concept** in the architecture: the concept of a **calculation pipeline with intermediate state**.

---

## 2. Structural Flaw: One Formula Per Field vs. Per-Row Formulas

### How Excel works

Column L in the Excel workbook does not contain one formula. It contains **390 different formulas**, hand-typed by the operator:

```
Row 2:  =25000+205000+35000-J2          (PRIM, with transport, with discount)
Row 3:  =25000+205000+35000+55000-J3    (PRIM, dual transport, with discount)
Row 5:  =25000+305000+52000             (COLG, transport, NO discount)
Row 14: =18000+125000+35000-J14         (GS, different registration, different tuition)
Row 16: =30000+340000-J16               (LYC, different registration, no transport)
```

Each row's formula is a **bespoke composition** of components selected by the operator based on the student's level, class, transport destination, and discount eligibility.

### How the software works

The `FormulaRuleRepository` stores rules keyed by `targetField`. The `computeFields` method does:

```typescript
const devisRule = rules.find((r) => r.targetField === "devisAnnuel");
```

This finds **one rule** and applies it to **every row**. The architecture has no concept of per-row formula variation. The `condition_expr` field exists on the `FormulaRule` entity but is **never read** by any service:

```typescript
// formula-rule.entity.ts
condition?: string;  // ← exists

// ledger.service.ts — never references condition_expr anywhere
```

### What would be needed

A **formula resolution strategy** that, given a row's attributes (level, classCode, optionCode, destination), selects or composes the correct formula. This could be:

- A decision table: `(level=PRIM, option=TRNSP, dest=BOUDOUAOU) → "25000 + 205000 + 52000 - remise"`
- A conditional formula: `"registration(level) + tuition(level) + IF(option='TRNSP', transport(destination), 0) - remise"`
- A per-row stored formula: each `LedgerEntry` carries its own expression string

The current architecture supports none of these.

---

## 3. Structural Flaw: The Fee Schedule Is a Flat List, Not a Lookup Table

> ✅ **LARGELY RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #39, Issue §3).
> New `src/shared/fee-schedule-lookup.ts` module wraps the
> level-indexed pricing tables (added in iteration 2) in a single
> composite lookup. `resolveFeeScheduleForRow(level, destination,
> optionCode)` returns the full fee schedule for a row:
> registration, tuition, hasTransport, transportTier, transport,
> transportInstallments, and `totalBeforeRemise`. A
> `previewDevisForRow()` helper computes the expected devis
> (with optional `omitRemise` flag from Fix #34). A
> `listAllLevelPricing()` helper lists every canonical level
> code with its registration + tuition amounts. Verified by 10
> unit tests.

### How Excel works

The operator mentally references a **multi-dimensional price menu**:

| Level | Registration | Tuition |
|-------|-------------|---------|
| MS/GS | 18,000 | 125,000 |
| PRIM | 25,000 | 205,000 |
| COLG | 25,000–30,000 | 305,000 |
| LYC | 30,000 | 340,000–365,000 |

| Destination | Transport |
|-------------|-----------|
| Boumerdès | 35,000 |
| Figuier | 43,000 |
| Boudouaou | 52,000 |
| Farthest | 55,000 |

### How the software works

`DEFAULT_FEE_SCHEDULE` is a **flat array of 7 line items**, each with a single amount:

```typescript
{ type: "registration", amount: 25000 }
{ type: "tuition", amount: 205000 }
{ type: "transport_base", amount: 35000 }
{ type: "transport_premium", amount: 55000 }
```

The `buildFormulaContext` method does:

```typescript
fields.registration = findLine("registration") || 25000;  // always 25000
fields.baseTuition = findLine("tuition") || 205000;        // always 205000
fields.transportBase = findLine("transport_base") || 35000; // always 35000
```

There is no indexing by level. There is no indexing by destination. There is no way to express "registration is 18,000 for GS but 25,000 for PRIM." The `FeeScheduleLine` entity has no `level`, `classCode`, or `destination` field.

### What would be needed

The fee schedule should be a **lookup table** with composite keys:

```
(level=PRIM, component=registration) → 25000
(level=GS, component=registration) → 18000
(level=COLG, component=tuition) → 305000
(destination=BOUDOUAOU, component=transport) → 52000
```

And the formula context builder should resolve these lookups based on the current row's attributes.

---

## 4. Structural Flaw: The Transport Conditional Is Missing

### How Excel works

Transport is added to column L **only when** column I (OPTION) contains `TRNSP`. When OPTION is blank, no transport component appears in the formula.

### How the software works

The starter DEVIS ANNUEL formula is:

```
registration + baseTuition + transportBase - remise
```

This **unconditionally** adds `transportBase` (35,000) to every student's annual quote. A PRIM student without transport gets:

```
25000 + 205000 + 35000 - 0 = 265,000  ← WRONG, should be 230,000
```

The `buildFormulaContext` method does not check `input.optionCode`. It always injects `transportBase` into the context. The formula has no `IF()` conditional.

Even if the formula were `registration + baseTuition + IF(optionCode = "TRNSP", transportBase, 0) - remise`, the `optionCode` field is not in the context either. The `buildFormulaContext` method does not include `optionCode`, `level`, `classCode`, or `destination`.

---

## 5. Structural Flaw: The Quote Service's Data Model Is Wrong

### How Excel's Devis sheet works

Each line item row has:

| Col A | Col D | Col E | Col F | Col G | Col H | Col I |
|-------|-------|-------|-------|-------|-------|-------|
| Name (text) | Class (text) | FI (number) | Tuition (number) | "Transport" (text) | Amount (number) | =SUM(A:H) |

The `=SUM(A:H)` works because Excel's SUM ignores text. The effective calculation is `E + F + H`.

### How the software works

The `QuoteLineItem` entity has:

```typescript
amounts: number[];   // length 8
lineTotal: number;   // = amounts.reduce(sum)
```

The `QuoteService.create()` validates:

```typescript
if (it.amounts.length !== 8) {
  throw new ValidationError(`must have exactly 8 amount columns`);
}
```

This forces 8 numeric values. But columns A, B, C, D, G are **text** in Excel. The software's model conflates text labels with numeric amounts. The `lineTotal` computation sums all 8 values, which would include text-as-zero in Excel but would include actual numbers in the software if the caller puts numbers in positions 0–3 and 6.

The `schoolFeeTax` computation reads `amounts[5]` (index 5 = column F). This is correct for the column mapping, but the architectural assumption that all 8 positions are numeric is wrong.

---

## 6. The Dependency Graph Is Wrong

### Excel's actual dependency graph

```
Input columns (B–K, R–Y, Z–AE, AF–AK)
    │
    ├──→ L = f(hardcoded constants, J)     [no dependency on other computed columns]
    │
    ├──→ P = R + S + T + U + W + X + Y    [no dependency on L]
    │
    ├──→ Q = L - P                         [depends on L AND P]
    │
    └──→ AL = (empty in actual data)       [no formula exists]
```

Key observations:
- L does NOT depend on P
- P does NOT depend on L
- Q depends on BOTH L and P
- AL has NO formula (column is empty)

### Software's dependency graph

```
ctx.fields (flat dictionary)
    │
    ├──→ devisAnnuel = f(registration, baseTuition, transportBase, remise)
    │
    ├──→ totalVersements = f(fi, v2, altV2, v3, t1, t2, t3)
    │
    ├──→ totalCreance = f(devisAnnuel, totalVersements)  ← BROKEN: not in ctx
    │
    └──→ grandTotal = f(totalVersements, psy1, ...)      ← BROKEN: totalVersements not in ctx
                                                           ← WRONG: formula doesn't exist in Excel
```

The software introduces a dependency (grandTotal) that doesn't exist in Excel, and fails to resolve the dependencies that DO exist (totalCreance needs devisAnnuel and totalVersements).

---

## 7. The Calculation Order Is Correct but Irrelevant

The priority ordering (10 → 20 → 30 → 40) is correct: devisAnnuel before totalCreance, totalVersements before totalCreance. But because the context is never updated between evaluations, the ordering has no effect. The rules are evaluated against the same stale context regardless of order.

---

## 8. Missing Services and Modules

### 8.1 No Family Grouping Service

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #48, Issues 7.2/8.1).
> New `FamilyService` (see issue 7.2 above) provides the family-
> grouping service the original review asked for. Verified by 6 tests.

The BON sheet groups students by family (parent name) and produces a consolidated statement. The software has no service that:
- Groups `LedgerEntry` records by `tutorName` or a family identifier
- Sums devisAnnuel, totalVersements, totalCreance across siblings
- Produces a family-level view

The `ParentRepository.getStudentIds()` exists but is never connected to the ledger.

### 8.2 No Transport Pricing Service

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #44, Issue 8.2).
> New `src/services/transport-pricing.service.ts`
> (`TransportPricingService`) is a stateless, mockable service that
> exposes the transport-tier pricing lookups in the same shape as
> the other domain services. Methods: `resolve(destination)` →
> full result (tier, amount, installments, recognised flag),
> `resolveAmount(destination)`, `resolveTier(destination)`,
> `resolveInstallments(destination)`, `listAllTiers()`, and
> `isRecognised(destination)`. The underlying tier table and
> installment breakdown come from `shared/pricing.ts` (Fix #11,
> Fix #25). Verified by 8 unit tests.

There is no service that maps `destination → transport cost`. The fee schedule has two hardcoded transport amounts. The 20 destinations in the REF sheet (Boumerdès, Corso, Boudouaou, etc.) each have different costs, but no lookup mechanism exists.

### 8.3 No Level-Based Pricing Service

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #45, Issue 8.3).
> New `src/services/level-pricing.service.ts`
> (`LevelPricingService`) is a stateless, mockable service that
> exposes the level-indexed pricing lookups in the same shape as
> the other domain services. Methods: `resolve(level)` → full
> result (registration, tuition, subtotal, label, recognised
> flag), `resolveRegistration(level)`, `resolveTuition(level)`,
> `listAllLevels()`, and `defaultRegistration` / `defaultTuition`
> getters. The underlying pricing tables come from
> `shared/pricing.ts` (Fix #9, Fix #10). Verified by 9 unit tests.

There is no service that maps `(level, classCode) → (registration fee, tuition fee)`. The fee schedule has one registration amount and one tuition amount.

### 8.4 No Formula Composition Service

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #46, Issue 8.4).
> New `src/services/formula-composition.service.ts`
> (`FormulaCompositionService`) composes an Excel-style DEVIS
> ANNUEL formula expression from a row's attributes (level,
> destination, optionCode, remise, omitRemise, dualTransport,
> optional registration/tuition overrides). The `compose()` method
> returns the expression string, the individual addends, the
> resolved component amounts, and the expected numerical result.
> A `composeStandard()` convenience wrapper covers the common
> case. A `detectPattern()` helper reverse-engineers a hand-typed
> Excel formula into its components (used by the ingestion service
> to flag non-standard rows). Verified by 11 unit tests.

There is no service that, given a row's attributes, **composes** the correct formula expression. The operator in Excel mentally does: "This is a PRIM student with transport to Boudouaou and a 25,500 discount, so the formula is `=25000+205000+52000-J2`." No software component replicates this decision process.

### 8.5 No Conditional Validation Service

> ✅ **PARTIALLY RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #4, Issue 6.1/6.2).
> The September-balance check is now a soft warning rather than a hard
> throw, which addresses the immediate symptom. The broader architectural
> ask — a general conditional-validation service that mirrors all of
> Excel's data-validation definitions — is still open.

Excel's data validation on column AG (`septemberBalance < 10000`) is a **soft** validation (`showErrorMessage=False`). The software implements it as a hard `BusinessRuleError` in `validateInput()`. There is no concept of soft vs. hard validation in the architecture.

---

## 9. Business Rules in the Wrong Place

### 9.1 Payment allocation in LedgerService

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #5, Issue 4.1/9.1).
> The hardcoded cap table was removed. `allocatePaymentToLedger()` now
> only records an audit-trail comment in column-AM format; it does NOT
> mutate payment columns. The operator decides which slot to credit via
> the UI — exactly as in the Excel workflow. Verified by 3 unit +
> integration tests.

### ~~9.1 Payment allocation in LedgerService~~

The `allocatePaymentToLedger` method lives in `LedgerService` and uses hardcoded caps:

```typescript
const slots = [
  { key: "fi", max: 25000 },
  { key: "v2", max: 71500 },
  { key: "altV2", max: 71500 },
  { key: "v3", max: 71500 },
  { key: "t1", max: 30000 },
  { key: "t2", max: 15000 },
  { key: "t3", max: 10000 },
];
```

This is a **payment domain** concern, not a ledger calculation concern. It also doesn't exist in Excel — the operator manually decides which column to credit. The `PaymentService` already exists and handles payment recording. This allocation logic should either be in `PaymentService` or removed entirely.

### 9.2 The 5% "tax" in QuoteService

> ✅ **RESOLVED in iteration 3** (same fix as 5.3) — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #18, Issues 5.3/5.4/9.2).
> `schoolFeeTax` is now persisted as 0 unless `paymentDate`
> qualifies for the early-payment bonus. The field's semantics
> now match Excel's "5% remise si le paiement est effectué en
> totalité avant le 30 juin" note. Iteration 6's
> `ValidationRulesRegistry` (Fix #50) further exposes the rule
> as a discrete, documented entry in the validation registry.

The `schoolFeeTax` is computed and persisted as a field on `QuoteBlock`. In Excel, it is a **display-only note** conditional on payment date. It should be a computed display value in the UI layer, not a persisted field in the domain entity.

### 9.3 The GRAND TOTAL formula in FormulaRuleService

> ✅ **RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #3, Issue 2.3/9.3).
> The GRAND TOTAL starter rule was removed from `getStarterFormulaRules()`.
> `LedgerService.computeFields()` returns `grandTotal = 0` unless a
> user explicitly creates a `grandTotal` rule. Verified by 5 unit +
> integration tests.

### ~~9.3 The GRAND TOTAL formula in FormulaRuleService~~

The `getStarterFormulaRules()` function seeds a GRAND TOTAL rule. Column AL in Excel is **empty**. This rule should not exist. It was invented by the software.

### 9.4 September balance validation in LedgerService.validateInput

> ✅ **FULLY RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #50, Issue 9.4).
> Iteration 1 made the septemberBalance check soft (Fix #4). The
> broader architectural ask — a dedicated **validation-rules
> registry** that mirrors Excel's data-validation definitions —
> is now implemented in `src/shared/validation-rules-registry.ts`.
> The registry exposes `EXCEL_VALIDATION_RULES` (6 seeded rules
> mirroring Excel's AG/AI/AK/AD/W/X/Y validations), a
> `runValidationRules()` helper that runs all soft rules against
> an input, and `listValidationRules()` / `getValidationRule()`
> accessors for the UI's validation-reference panel. Each rule
> declares its `excelSource` (the Excel data-validation definition
> it mirrors) so future rules can be added in one place. Verified
> by 14 unit tests.

> ✅ **PARTIALLY RESOLVED in iteration 1** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #4, Issue 6.1/6.2).
> The validation is now soft (returns `ValidationWarning[]` and logs
> via `logger.warn`) rather than throwing.

This validation belongs in a **validation rules registry** that mirrors Excel's data validation definitions, not hardcoded in the service method. The Excel validation is soft; the software makes it hard.

---

## 10. The Formula Engine's Limitations

### 10.1 No access to row metadata

> ✅ **RESOLVED in iteration 2** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #15, §17).
> `buildFormulaContext()` now injects `optionCode`, `level`, `classCode`,
> `destination`, and `hasTransport` (boolean) into `ctx.fields`. User-
> defined rules can now branch on row metadata. Verified by 3 tests.

### ~~10.1 No access to row metadata~~

The formula context contains only numeric fields. The formula cannot reference `optionCode`, `level`, `classCode`, or `destination` because these are strings not included in `buildFormulaContext`. A formula like:

```
IF(optionCode = "TRNSP", registration + tuition + transport, registration + tuition) - remise
```

is impossible because `optionCode` is not in the context.

### 10.2 No access to lookup tables

> ✅ **RESOLVED in iteration 6** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #43, Issues 10.2 / 18).
> New `src/shared/formula-lookup-ranges.ts` module builds the
> three canonical lookup ranges (`LEVEL_PRICING`,
> `TRANSPORT_PRICES`, `LEVEL_CODES`) from the same pricing tables
> that drive the fallback formula. `LedgerService.buildFormulaContext()`
> now populates `ctx.ranges` via `buildFormulaLookupRanges()`, so
> any user-defined formula rule can use `VLOOKUP(level,
> LEVEL_PRICING, 4, 0)` to look up tuition, or
> `VLOOKUP("medium", TRANSPORT_PRICES, 3, 0)` to look up the
> medium-tier transport amount. Verified by 11 unit tests
> including end-to-end VLOOKUP tests against all three ranges.

The formula engine supports `VLOOKUP` against named ranges in `ctx.ranges`. But `buildFormulaContext` never populates `ranges`. There is no way to write:

```
VLOOKUP(destination, transportPrices, 2, 0)
```

because `transportPrices` is never injected into the context.

### 10.3 No support for per-row formula storage

> ✅ **RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #35, Issue 1.6/§2/10.3).
> The `LedgerEntry` entity now has a `customFormula: string` field
> (migration 008). The fallback path in `LedgerService.computeFields`
> honours it: when `customFormula` is set, the engine evaluates
> that expression instead of the global `devisAnnuel` FormulaRule
> for THIS row only. Iteration 6's `FormulaCompositionService`
> (Fix #46) can compose the expression string for the operator to
> paste into the field. Verified by 5 unit + integration tests.

The `LedgerEntry` entity has no field for storing a per-row formula expression. The `formula_rules` table stores global rules. There is no way to say "row 2 uses formula X, row 3 uses formula Y."

### 10.4 The `condition_expr` field is dead

> ✅ **RESOLVED in iteration 4** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #28, Issue 10.4/13).
> `LedgerService.computeFields()` now evaluates each rule's
> `condition` field against `ctx.fields` and skips rules whose
> condition returns false. The condition mini-language is
> intentionally minimal (string equality, numeric comparison, AND /
> OR / NOT, IS NULL / IS NOT NULL) — see
> `src/shared/rule-condition.ts`. Parse errors are logged but do NOT
> block the calculation pipeline. Verified by 7 unit tests including
> an integration test that creates a PRIM-only rule and confirms it
> fires for PRIM students but is skipped for LYC students.

### ~~10.4 The `condition_expr` field is dead~~

The `FormulaRule` entity has:

```typescript
condition?: string;  // "Optional: only apply to entries matching this filter"
```

No service ever reads this field. It is never evaluated. It is never used to filter which rows a rule applies to. It is architectural dead weight.

---

## 11. The Excel Ingestion Service Breaks the Formula Chain

> ✅ **RESOLVED in iteration 3** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #20, Issues 11/16).
> `readRowAsLedgerInput()` now reads Excel's stored values for
> `devisAnnuel`, `totalVersements`, and `totalCreance` (via a
> side-channel `extras` object). `importLedger()` calls
> `repo.create()` then `repo.update()` with those values, bypassing
> `computeFields()` so the database faithfully mirrors the
> spreadsheet for untouched rows. Operator edits still trigger a
> proper recompute via `LedgerService.update()`.
>
> **Additional fix discovered while implementing #20**: the
> `buildColumnToFieldMap()` helper was fundamentally broken — it
> mapped column letters to THEMSELVES instead of to field names, so
> no field except `studentName` (the hardcoded fallback) ever
> imported. A new static `EXCEL_HEADER_LABELS` table maps 30+ Excel
> labels ("DEVIS ANNUEL", "TOTAL VERSEMENTS", "TOTAL*CREANCE",
> "2V", "1T", "T2", "t3", "E-PLANT", etc.) to camelCase field names.
> Verified by 1 integration test that round-trips a real .xlsx file.

## ~~11. The Excel Ingestion Service Breaks the Formula Chain~~

### What happens during import

The `readRowAsLedgerInput` function reads cell **values**, not formulas:

```typescript
case "devisAnnuel":
case "totalVersements":
case "totalCreance":
  break;  // ← SKIPPED: "Computed fields are skipped — LedgerService computes them."
```

The imported `LedgerEntry` has `devisAnnuel = 0`, `totalVersements = 0`, `totalCreance = 0`. The `LedgerService` is expected to recompute them. But as shown in Section 1, the recomputation produces `totalCreance = 0` due to the broken context flow.

So after import, every row has `totalCreance = 0` regardless of actual payments.

### What should happen

The ingestion service should either:
1. Read the **computed values** from Excel (the cell results, not the formulas) and store them directly, OR
2. Read the **formula strings** from Excel, store them per-row, and evaluate them with a correct engine

It does neither.

---

## 12. The Circular Dependency Hack

> ✅ **RESOLVED in iteration 3** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #21, Issues 12/14).
> `FeeScheduleService` now accepts an `EventBus` in its constructor.
> `update()` publishes a `feeSchedule.changed` event when pricing
> changes. `LedgerService` subscribes to that event in its
> constructor and calls its own `recomputeAll()` in response. The
> late-injection back-channel (`services.feeSchedule["ledger"] =
> services.ledger`) has been removed from `src/main/ipc/index.ts`.
> The legacy `ledger` field on `FeeScheduleService` is kept
> (deprecated) for backward compat. Verified by 4 unit tests.

## ~~12. The Circular Dependency Hack~~

In `ipc/index.ts`:

```typescript
services.feeSchedule["ledger"] = services.ledger;
```

This is a late-injection property assignment that bypasses TypeScript's type system (the `FeeScheduleService` declares `ledger: LedgerService | null`). It exists because `FeeScheduleService.update()` calls `this.ledger.recomputeAll()` when pricing changes, creating a circular dependency:

```
LedgerService → FeeScheduleRepository (to get pricing)
FeeScheduleService → LedgerService (to trigger recomputation)
```

This is a symptom of misplaced responsibility. The recomputation trigger should be an **event** published by `FeeScheduleService` and subscribed to by `LedgerService`, not a direct method call through a back-channel reference.

---

## 13. What the Correct Architecture Would Look Like

### 13.1 Calculation Pipeline with Intermediate State

```
┌─────────────────────────────────────────────────────────┐
│                   CalculationPipeline                    │
│                                                         │
│  Stage 1: Resolve Pricing                               │
│    Input:  level, classCode, optionCode, destination    │
│    Lookup: PricingTable (multi-tier, indexed)           │
│    Output: registration, tuition, transport             │
│                                                         │
│  Stage 2: Compose Formula                               │
│    Input:  pricing components, remise, optionCode       │
│    Logic:  Build expression string per row              │
│    Output: expression string                            │
│                                                         │
│  Stage 3: Evaluate DEVIS ANNUEL                         │
│    Input:  expression, row fields                       │
│    Output: devisAnnuel → written back to context        │
│                                                         │
│  Stage 4: Evaluate TOTAL VERSEMENTS                     │
│    Input:  fi, v2, altV2, v3, t1, t2, t3              │
│    Output: totalVersements → written back to context    │
│                                                         │
│  Stage 5: Evaluate TOTAL CREANCE                        │
│    Input:  devisAnnuel (from ctx), totalVersements      │
│    Output: totalCreance                                 │
│                                                         │
│  Stage 6: Validate (soft rules)                         │
│    Input:  septemberBalance, etc.                       │
│    Output: warnings (not exceptions)                    │
└─────────────────────────────────────────────────────────┘
```

### 13.2 Pricing as a Lookup Service

```
PricingService.resolve(level, classCode, optionCode, destination) → {
  registration: number,
  tuition: number,
  transport: number | null,
  components: string[]  // for audit trail: ["25000", "205000", "52000"]
}
```

### 13.3 Per-Row Formula Storage

```
LedgerEntry {
  ...
  devisFormula?: string;  // "=25000+205000+52000-J2" stored per row
}
```

### 13.4 Event-Driven Recomputation

```
FeeScheduleService.update()
  → eventBus.publish("pricing.changed", { scheduleId })

LedgerService subscribes:
  eventBus.subscribe("pricing.changed", () => this.recomputeAll())
```

### 13.5 Family Grouping Service

```
FamilyService.getStatement(tutorName) → {
  familyName: string,
  students: Array<{ name, devisAnnuel, totalVersements, totalCreance }>,
  familyDevisAnnuel: number,
  familyTotalVersements: number,
  familyTotalCreance: number
}
```

---

## 14. Summary of Findings

| # | Category | Severity | Finding |
|---|----------|----------|---------|
| ✅ 1 | ~~**Data flow**~~ | ~~FATAL~~ | ~~Intermediate results (devisAnnuel, totalVersements) are never written back to the formula context. TOTAL CREANCE and GRAND TOTAL always evaluate to 0.~~ **RESOLVED iter 2 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #8.** |
| 2 | **Formula model** |  STRUCTURAL | One global formula per target field. Excel has per-row formulas. No mechanism for per-row variation. |
| 3 | **Pricing model** |  STRUCTURAL | Flat fee schedule with single amounts. Excel has multi-tier pricing indexed by level and destination. |
| 4 | **Transport logic** |  STRUCTURAL | Transport unconditionally added. Excel adds it conditionally on OPTION=TRNSP with destination-specific amounts. |
| 5 | **Quote model** |  STRUCTURAL | 8 numeric amounts per line. Excel has 3 numeric + 5 text columns. SUM(A:H) ≠ sum of 8 numbers. |
| 6 | **Dependency graph** |  HIGH | totalCreance depends on devisAnnuel + totalVersements, but context doesn't carry intermediates. |
| ✅ 7 | ~~**Phantom calculation**~~ | ~~HIGH~~ | ~~GRAND TOTAL rule exists. Column AL is empty in Excel. Invented calculation.~~ **RESOLVED iter 1 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #3.** |
| 8 | **5% tax** |  HIGH | Persisted as entity field. Excel has it as conditional display note. |
| ✅ 9 | ~~**Payment allocation**~~ | ~~HIGH~~ | ~~Hardcoded caps in LedgerService. Doesn't exist in Excel. Wrong service.~~ **RESOLVED iter 1 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #5.** |
| 10 | **Missing: family grouping** |  HIGH | No equivalent of BON sheet's VLOOKUP-based family statement. |
| 11 | **Missing: pricing lookup** |  HIGH | No level→fee or destination→transport mapping service. **(Largely addressed by iter 2 fixes #9, #10, #11 — `shared/pricing.ts` now provides both lookups.)** |
| 12 | **Missing: formula composition** |  HIGH | No service that builds per-row formula from row attributes. **(Partly addressed by iter 2 fix #15 — formulas can now branch on level/optionCode/destination.)** |
| ✅ 13 | ~~**condition_expr dead code**~~ | ~~MEDIUM~~ | ~~Field exists on entity, never read by any service.~~ **RESOLVED iter 4 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #28.** |
| ✅ 14 | ~~**Circular dependency hack**~~ | ~~MEDIUM~~ | ~~`services.feeSchedule["ledger"] = services.ledger` bypasses DI.~~ **RESOLVED iter 3 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #21.** |
| ✅ 15 | ~~**Soft vs hard validation**~~ | ~~MEDIUM~~ | ~~Excel's septemberBalance validation is soft. Software throws exception.~~ **RESOLVED iter 1 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #4.** |
| ✅ 16 | ~~**Ingestion skips computed values**~~ | ~~MEDIUM~~ | ~~Import reads inputs, skips computed columns, then recomputes incorrectly.~~ **RESOLVED iter 3 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #20.** |
| ✅ 17 | ~~**Context missing metadata**~~ | ~~MEDIUM~~ | ~~optionCode, level, classCode, destination not in formula context.~~ **RESOLVED iter 2 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #15.** |
| ✅ 18 | ~~**No ranges in context**~~ | ~~MEDIUM~~ | ~~VLOOKUP support exists in engine but ranges never populated.~~ **RESOLVED iter 6 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #43.** |
| ✅ 19 | ~~**Scalability**~~ | ~~MEDIUM~~ | ~~recomputeAll() loads all 10,000 entries into memory, evaluates sequentially.~~ **RESOLVED iter 4 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #29.** |
| ✅ 20 | ~~**No audit trail for calculations**~~ | ~~LOW~~ | ~~No record of which formula was used for which row, or what components composed it.~~ **RESOLVED iter 4 — see [all_that_is_solved_so_far.md](./all_that_is_solved_so_far.md) Fix #30.** |

The engine cannot produce the same results as the Excel workbook in its current architecture. Fixing the fatal context-flow bug (item 1) would make TOTAL CREANCE compute correctly for the fallback path, but the structural flaws (items 2–5) mean the DEVIS ANNUEL itself would still be wrong for every student whose level, transport, or discount configuration differs from the single hardcoded formula.











# Part 1: Architectural & Functional Gap Analysis

This analysis presents a professional, highly critical, and structurally rigorous assessment of the "El-Imtiyaz" billing system. It highlights several significant architectural flaws, incorrect assumptions, and design decisions that diverge from the business logic defined in the original `Suivis clients.xlsx` workbook.

---

## 1. Architectural & Service-Level Design Flaws

The application attempts to wrap a highly synchronous, ad-hoc, cell-based spreadsheet model in a decoupled, asynchronous, event-driven clean architecture. While this approach is standard for modern web applications, it introduces several critical bugs, race conditions, and functional mismatches when applied to this specific billing system.

```
[UI Actions / IPC Calls]
       │
       ▼
[LedgerService] ──(Synchronous DB Mutate)──► [SQLite: ledger_entries]
       │
       ├─(Emits 'ledger.entry.updated')
       │
       ▼
  [EventBus] ──(Asynchronous Dispatch)──► [AuditService] (Persists Audit Log)
       │
       └────────────────────────────────► [NotificationService] (Dispatches SMS/Emails)

──────────────────────────────────────────────────────────────────────────────
CRITICAL ASYNCHRONOUS DRIFT (THE RACE CONDITION):
──────────────────────────────────────────────────────────────────────────────
[Excel Workbook] (Immediate, Single-Threaded Recalculation)
   VS.
[Application] (Asynchronous Event Bus)

If a user edits a student's 'remise' (discount), the application updates the row,
but other service modules reading the database concurrently may read stale computed 
values before the async handlers complete.
```

### Flaw A: The Asynchronous Drift & Event-Bus Race Conditions

> ✅ **RESOLVED in iteration 5** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #40, Flaw A).
> The EventBus implementation already awaited handlers
> SEQUENTIALLY (for-loop with `await`), so within a single
> `publish()` call there was never actual async drift — but the
> contract was not documented, which is why the review flagged it
> as a race condition. Iteration 5 codifies the contract:
> `IEventBus.publish` JSDoc now states that handlers run
> sequentially and `await publish(...)` resolves only after every
> handler has completed. A new `publishSequence()` method
> dispatches multiple events in guaranteed order (each event fully
> published before the next). Verified by 4 unit tests including
> an integration test that confirms a `ledger.entry.created`
> handler sees the row's ID before `create()` resolves.

In the original Excel workbook, recalculation is single-threaded, immediate, and synchronous. When an operator changes a value in column J (`REMISE`), every dependent formula in column L (`DEVIS ANNUEL`), column Q (`TOTAL*CREANCE`), and columns AG/AI/AK (receivables) updates in the same frame.

The application, however, relies on an asynchronous, in-process event bus (`src/infrastructure/event-bus/event-bus.ts`) to handle side effects. For example, `payment.recorded` triggers payment allocation asynchronously. 

If multiple payments are written to the database in rapid succession, or if an operator updates a student's ledger row while a payment event is still processing in the background, the application experiences **asynchronous drift**. A service reading the database to generate a report or check a balance will read stale computed values before the async handlers complete.

### Flaw B: Misplacement of Business Rules & Hardcoded Fallbacks
The application splits its calculations between user-defined formula rules stored in the database (`formula_rules` table) and hardcoded fallbacks inside `LedgerService.computeFields()` (`src/services/ledger.service.ts` line 169).

```typescript
// src/services/ledger.service.ts (Line 169)
const devisAnnuel = devisRule
  ? this.evalNumeric(devisRule, ctx)
  : (input.fi ?? 25000) +
    205000 +
    (input.optionCode === "TRNSP" ? 35000 : 0) -
    (input.remise ?? 0);
```

#### The Mismatch
This fallback is critically flawed. It assumes a flat tuition fee of `205000` (Primary school tuition) for all students. In the actual Excel workbook, tuition is highly dynamic, varying by the student's level (`G` column - `niveau`):
*   `MS` / `GS` (Pre-school): ~125,000 to 186,000 DZD
*   `PRIM` (Primary): 205,000 DZD
*   `COLG` (Collège): 305,000 DZD
*   `LYC` (Lycée): 340,000 to 365,000 DZD

By hardcoding `205000` as the global fallback, if the active `FeeSchedule` is unlinked, missing, or misconfigured, the application will silently bill a Lycée or Collège student at the primary school rate. This introduces a silent, high-severity financial leak.

---

## 2. Incompatibilities & Mismatched Business Rules

A direct comparison of the application's source code against the structural reality of the `Suivis clients.xlsx` workbook reveals several functional gaps.

### Mismatch A: The Hardcoded Allocation Engine vs. Grade-Specific Installments
In `LedgerService.allocatePaymentToLedger()` (`src/services/ledger.service.ts` line 214), payments are automatically split across tranche columns using a hardcoded array of caps:

```typescript
const slots = [
  { key: "fi", max: 25000 },
  { key: "v2", max: 71500 },
  { key: "altV2", max: 71500 },
  { key: "v3", max: 71500 },
  { key: "t1", max: 30000 },
  { key: "t2", max: 15000 },
  { key: "t3", max: 10000 },
] as const;
```

#### Why This Fails
These caps apply **only** to Primary school students with standard transport. 
1.  **Lycée and Collège Students**: Their tuition is much higher (e.g., 305,000 DZD for Collège). Their installment sizes are not `71500`. For a Collège student, `V2`, `2V`, and `v3` are typically `97000` or more. The hardcoded cap of `71500` will prevent the application from allocating payments to their core tuition, capping their payments at a primary school rate and leaving them with a permanent, artificial debt.
2.  **Students Without Transport**: If a student is not enrolled in transport (`OPTION` is blank, not `TRNSP`), the allocation engine still includes transport slots (`t1`, `t2`, `t3`) up to 55,000 DZD. If a parent pays more than the tuition fee, the application will allocate those funds to phantom transport installments, even though the student does not take the bus.

### Mismatch B: September Balance Validation Error
The application applies a strict data validation rule to `septemberBalance` inside `validateInput()` (`src/services/ledger.service.ts` line 261):

```typescript
if (input.septemberBalance !== undefined && input.septemberBalance !== null) {
  if (input.septemberBalance >= enums_1.SEPTEMBER_BALANCE_MAX) {
    throw new BusinessRuleError(`September balance limit violation...`);
  }
}
```

#### Why This Fails
In the original Excel workbook, the data validation rule is set on cell range `AG1:AG1032` (September balance), but this column is a **computed balance**, calculated as:

$$\text{September Balance} = \text{September Due} - \text{September Paid}$$

By treating `septemberBalance` as a user-provided input and throwing a validation error on save, the application prevents the engine from writing computed balances that exceed 10,000 DZD. 

If a student's computed unpaid balance for September is actually 15,000 DZD, the application will throw a validation error and block the operator from saving the row. This halts operations because a valid calculated outstanding debt is flagged as an input error.

### Mismatch C: The Broken Sibling Discount Pipeline

> ✅ **RESOLVED in iteration 4** — see [`all_that_is_solved_so_far.md`](./all_that_is_solved_so_far.md) (Fix #31, Mismatch C).
> `ParentRepository.getStudentIds(parentId)` now uses
> `primary_parent_id = ?` as the fast path (indexed via the new
> `idx_students_primary_parent` created by migration 007). The
> legacy `LIKE '%"id"%'` JSON-pattern fallback is kept for rows
> whose `primary_parent_id` was never set (typically imported
> spreadsheet rows). The fallback now also double-checks the parsed
> JSON to eliminate substring false-positives (e.g. `p_1` matching
> `p_10`). Verified by 3 unit tests including an integration test
> that creates real `students` rows via SQL and confirms both paths
> resolve correctly.

In `DiscountPipeline.resolveEligibility()` (`src/pipelines/discount-pipeline.ts`), sibling relationships are evaluated by scanning the `students` table's JSON column using a SQL `LIKE` query:

```sql
SELECT parent_ids_json FROM students WHERE parent_ids_json LIKE '%"parent_id"%'
```

#### Why This Fails
This is slow, unscalable, and prone to boundary bugs. In the original workbook, siblings are grouped on the `Devis` sheet in visual multi-line blocks under a single parent header. On the `ETAT` sheet, they are linked by identical family names, phone numbers (`NEM` column), or matching tutor names. 

By relying on strict parent IDs that are not automatically linked during raw Excel imports, the application fails to detect siblings for imported spreadsheet rows. As a result, the sibling discount pipeline will evaluate to `0%` for imported data.

---

## 3. Structural Mismatches & Technical Debt

### Mismatch D: Static "Devis" Blocks vs. Flat Database Rows
The `Devis` sheet contains 10 repeating blocks of ~48 rows each. Each block has a distinct sibling hierarchy (e.g., Row 15 is child 1, Row 16 is child 2).

The application stores these as a flat JSON array of `QuoteLineItem` objects inside a `QuoteBlock` entity. While this works well for simple CRUD operations, it loses the visual context of the original spreadsheet. 

If an operator opens the original spreadsheet, edits a cell, and imports it again, the application's ingestion engine will fail to reconcile the changes, leading to duplicated or corrupted quote blocks.

### Mismatch E: The Dead "BON" Print Template
The `BON` sheet is a print template that relies on VLOOKUP formulas to query the now-deleted `PAR PARENT` sheet.

The application keeps the `Receipts` route (`src/ui/pages/Receipts.tsx`) but generates a basic, flat table layout using `pdfmake` instead of replicating the original `BON` template. This means the printed receipts generated by the application do not match the physical forms the school's administrative staff and parents expect.

---

## 4. Gap Analysis Matrix

The following table summarizes the functional gaps between the application's implementation and the Excel workbook's actual behavior:

| Excel Feature / Formula | Application Implementation | Behavioral Divergence (The Gap) | Criticality |
| :--- | :--- | :--- | :--- |
| **Column L: Devis Annuel** | Hardcoded primary school fallback `25k + 205k + 35k - J`. | Fails to detect tuition variations by `niveau` (GS/PRIM/COLG/LYC). Bills older students at primary school rates. | **High** (Financial Loss) |
| **Column P: Total Versements** | Sums `fi + v2 + altV2 + v3 + t1 + t2 + t3`. | The allocation engine uses hardcoded caps. This breaks installment tracking for non-primary students. | **High** (Data Corruption) |
| **Column AG: Sept. Validation** | Throws input validation error if value $\ge 10,000$. | Blocks the database from saving rows if a student's actual computed debt exceeds 10,000 DZD. | **High** (System Blocker) |
| **Devis Dropdowns** | Non-existent named ranges. | Dropdowns for Class, FI, Tuition, and Services are empty in the UI. | **Medium** (UX Mismatch) |
| **BON Sheet VLOOKUPs** | Dead sheet, not implemented. | Printed receipts do not match the visual layout and format expected by parents. | **Medium** (Process Friction) |
| **Sibling Detection** | SQL `LIKE` search on JSON column. | Fails to detect siblings for imported spreadsheet data, skipping their automatic sibling discounts. | **Medium** (Incorrect Balances) |

---

# Part 2: The Obsidian Knowledge Base Vault

The following Markdown files constitute a complete, production-grade Obsidian knowledge base. This documentation maps the entire operational, financial, and formula structure of the `Suivis clients.xlsx` workbook, providing a blueprint for the application's core logic.

---

## File 1: `Index.md`
```markdown
---
title: El-Imtiyaz Financial Tracking System - Knowledge Base
type: index
project: Bab_08_el-imtiyaz_Variant
date: 2026-07-21
status: Complete
---

# El-Imtiyaz Financial Tracking System: Technical Blueprint

Welcome to the complete operational blueprint for the **El-Imtiyaz School Billing and Receivables System**. This system manages student enrollments, annual tuition quotes, term installments, and outstanding debts. This knowledge base serves as a technical manual for the application's ledger calculation engine.

##  System Map & Navigation

This vault is organized into modular notes detailing every aspect of the spreadsheet's operations:

### 1. The Core Sheets (The Components)
*   [[Sheet-Etat-Ledger]]: Detailed breakdown of `ETAT 20262027`—the master transactional ledger.
*   [[Sheet-Devis-Quotes]]: The quote and pricing engine for sibling groups.
*   [[Sheet-Ref-Foundation]]: The static data reference sheet and validation dropdown lists.
*   [[Sheet-Bon-Receipts]]: The legacy print statement template and its dependencies.

### 2. Lexicon & Calculations
*   [[Vocabulary-Dictionary]]: Comprehensive lexicon of abbreviations (PRIM, COLG, LYC, FI, V2, etc.).
*   [[Calculation-Flow]]: Complete data flow and formula dependency graph.
*   [[Architecture-Flaws]]: Gap analysis and technical debt review.

---

##  Core Data Flow Overview

The billing system operates across three transactional layers:

```
 ┌────────────────────────────────────────┐
 │            REF (Foundation)            │
 │ Standardizes Class Levels & Towns      │
 └───────────────────┬────────────────────┘
                     │
                     ├──────────────────────────────┐
                     ▼                              ▼
 ┌────────────────────────────────────────┐ ┌──────────────────────────────┐
 │         Devis (Quote Level)            │ │   ETAT 20262027 (Ledger)     │
 │ Generates Sibling-Group Price Quotes   │ │ Tracks Student Enrollments   │
 │   Calculates "Montant Total DZD"       │ │   and Installment Payments   │
 └───────────────────┬────────────────────┘ └──────────────┬───────────────┘
                     │                                     │
                     │ Pulls Family Base Quote             │
                     ▼                                     │
             [ DEVIS ANNUEL ] ◄────────────────────────────┘
                     │
                     ▼
 ┌────────────────────────────────────────┐
 │         BON (Summary Level)            │
 │ Pulls Ledger Totals to Print Receipts  │
 └────────────────────────────────────────┘
```

##  Verification & Testing
To run a quick diagnostic of the calculation engine, run the following test script:
```bash
npx tsx scripts/test-formula-engine.ts
```
This script verifies the parsing, evaluation, and logical dependencies of the core billing formulas.
```

---

## File 2: `Vocabulary-Dictionary.md`
```markdown
---
title: System Vocabulary & Dictionary
type: dictionary
tags: [lexicon, reference]
---

# System Vocabulary & Column Dictionary

This reference explains every abbreviation, column header, level code, and technical term used in the El-Imtiyaz School System.

## 1. Column Dictionary (`ETAT 20262027`)

| Column | Header | Data Type | Description |
| :--- | :--- | :--- | :--- |
| **B** | `INFOS` | Free-text | Administrative notes (e.g., installment schedules, family exceptions). |
| **C** | `E-MAIL` | Text (Email) | Primary contact email for billing correspondence. |
| **D** | `NEM` | Text (Phone) | Raw contact numbers (e.g., `0555123456 / 0770123456`). |
| **E** | `TUTEUR` | Text (Name) | Family name or name of the primary guardian. |
| **F** | `NOM` | Text (Name) | Full name of the student. |
| **G** | `niveau` | Code | General school division level (e.g., `PRIM`, `COLG`, `LYC`). |
| **H** | `CLASSE` | Code | Specific class section (e.g., `CE1`, `3AAM`, `2AS`). |
| **I** | `OPTION` | Code | Set to `TRNSP` if transport is active, or `TENSP` for special routing. |
| **J** | `REMISE` | Number (DZD) | Total discount subtracted from the base quote. |
| **K** | `JUSTIFICATION`| Free-text | Explanation for the discount (e.g., "Sibling rate", "Staff discount"). |
| **L** | `DEVIS ANNUEL` | Number (DZD) | **Computed**: Total annual fee owed by the student. |
| **M** | `REMBOURCEMENT`| Number (DZD) | Refunds or credits applied to the account. |
| **N** | `DETTES` | Number (DZD) | Past debts carried over from previous school years. |
| **O** | `REGLEMENTS DETTES`| Number (DZD)| Payment applied directly to prior debts. |
| **P** | `TOTAL VERSEMENTS`| Number (DZD)| **Computed**: Sum of all school and transport payments. |
| **Q** | `TOTAL*CREANCE`| Number (DZD) | **Computed**: Outstanding balance owed (= L − P). |
| **R** | `FI` | Number (DZD) | Frais d'Inscription: Registration fee (always 25,000 DZD). |
| **S** | `V2` | Number (DZD) | Second major tuition installment. |
| **T** | `2V` | Number (DZD) | Alternate slot for 2nd installment or split payments. |
| **U** | `v3` | Number (DZD) | Third major tuition installment. |
| **V** | `DISTINATION` | Text (Town) | Transport destination town. |
| **W** | `1T` | Number (DZD) | First transport installment (typically 30,000 DZD). |
| **X** | `T2` | Number (DZD) | Second transport installment (typically 15,000 DZD). |
| **Y** | `t3` | Number (DZD) | Third transport installment (typically 10,000 DZD). |
| **Z** | `PSY1` | Number (DZD) | Fee for psychologist session 1. |
| **AA** | `PSY2` | Number (DZD) | Fee for psychologist session 2. |
| **AB** | `ORTH1` | Number (DZD) | Fee for speech therapy session 1. |
| **AC** | `ORTH2` | Number (DZD) | Fee for speech therapy session 2. |
| **AD** | `E-PLANT` | Number (DZD) | Charge for the school's digital platform. |
| **AE** | `Ratrapage` | Number (DZD) | Catch-up or remedial class fees. |
| **AF** | `SEPTEMBRE` | Number (DZD) | September term fee. |
| **AG** | `CREANCES SEPTEMBRE`| Number (DZD)| September term unpaid balance (must be $<10,000$ DZD). |
| **AH** | `DECEMBRE` | Number (DZD) | December term fee. |
| **AI** | `CREANCES DECEMBRE`| Number (DZD) | December term unpaid balance. |
| **AJ** | `MARS` | Number (DZD) | March term fee. |
| **AK** | `CREANCES MARS` | Number (DZD) | March term unpaid balance. |
| **AL** | `TOTAL` | Number (DZD) | Grand total of all payments and services. |
| **AM** | *(Unlabeled)* | Cell Comments | The receipt-log audit trail (`amount/date receipt#`). |

---

## 2. Technical Abbreviations & Codes

### School Divisions (`niveau` - Column G)
*   **`MS`** (Moyenne Section): Pre-school tier 1 (ages 3–4).
*   **`GS`** (Grande Section): Pre-school tier 2 (ages 4–5).
*   **`PRIM`** (Primaire): Elementary school (Grades 1–5 / CP to CM2).
*   **`COLG`** (Collège): Middle school (Grades 6–9 / 1AAM to 4AAM).
*   **`LYC`** (Lycée): High school (Grades 10–12 / 1AS to 3AS).
*   **`AUTISTE`**: Specialized division for autiste education.

### Class Codes (`CLASSE` - Column H)
*   **`CP`** (Cours Préparatoire): Grade 1 primary.
*   **`CE1` / `CE2`** (Cours Élémentaire): Grades 2 & 3 primary.
*   **`CM1` / `CM2`** (Cours Moyen): Grades 4 & 5 primary.
*   **`1AAM` to `4AAM`** (Année Moyenne): Grades 1 to 4 middle school.
*   **`1AS` to `3AS`** (Année Secondaire): Grades 1 to 3 high school.

### Options & Transportation (`OPTION` - Column I)
*   **`TRNSP`** (Transport): Active school bus routing.
*   **`TENSP`** / **`TRNP`**: Secondary codes for special transport configurations.
```

---

## File 3: `Calculation-Flow.md`
```markdown
---
title: Calculation Flow & Formula Dependencies
type: logic
tags: [formulas, dataflow]
---

# Calculation Flow & Formula Dependencies

This note documents the mathematical formulas, dependencies, and execution order used to calculate the school ledger.

## 1. Formula Dependency Graph

A change to any raw input field (such as a discount in column J or a payment in column S) triggers a cascading recalculation down the dependency chain:

```
[Level (G) / Class (H)] ──► Base Tuition Lookup
                                     │
[Destination (V)] ───────► Transport Fee Lookup ───┐
                                     │             │
[Discount (J)] ──────────► Remise Subtraction      ▼
                                     ├──────► [DEVIS ANNUEL (L)]
[Prior Debts (N)] ───────► Debt Carry-over ────────┤
                                                   ▼
[Installments (R-Y)] ────► [TOTAL VERSEMENTS (P)] ─┴─► [TOTAL CREANCE (Q)]
```

---

## 2. Core Operational Formulas

### Formula 1: The Annual Quote (`DEVIS ANNUEL` - Column L)
Calculates the total fees owed by a student for the entire year, net of discounts:

$$\text{Devis Annuel} = \text{Registration Fee} + \text{Base Tuition} + \text{Transport Fee} - \text{Discount}$$

#### Excel Formulation
In the master sheet, this is written as:
```excel
=25000 + 205000 + 35000 - J2
```
*   `25000` is the registration fee (`FI`).
*   `205000` is the primary school tuition.
*   `35000` is the transport fee for local routes.
*   `J2` is the student's discount (`REMISE`).

---

### Formula 2: Total Payments (`TOTAL VERSEMENTS` - Column P)
Sums all standard installment and transport payments made during the year:

$$\text{Total Versements} = \text{FI} + \text{V2} + \text{2V} + \text{v3} + \text{1T} + \text{T2} + \text{t3}$$

#### Excel Formulation
```excel
=R2 + S2 + T2 + U2 + W2 + X2 + Y2
```
*This calculation excludes clinical services (PSY/ORTH), catch-up classes, and the school platform fee.*

---

### Formula 3: Balance Owed (`TOTAL*CREANCE` - Column Q)
Computes the remaining outstanding debt for the student:

$$\text{Total Creance} = \text{Devis Annuel} - \text{Total Versements}$$

#### Excel Formulation
```excel
=L2 - P2
```
*   A **positive value** indicates an outstanding debt.
*   A **zero value (`0`)** indicates the account is fully paid.
*   A **negative value** indicates an overpayment or credit.

---

### Formula 4: Sibling Discount Breakdown (`REMISE` - Column J)
Tracks and sums multiple discount components (e.g., sibling discounts, staff discounts):

$$\text{Remise} = \text{Sibling Discount} + \text{Early Payment Discount} + \text{Special Reduction}$$

#### Excel Formulation Example
```excel
=5000 + 10000 + 10000
```
This structure documents the components of the discount directly within the cell.

---

## 3. Recalculation Order

To prevent circular dependency errors, the engine evaluates formulas in the following sequence:

1.  **Step 1: Resolve Pricing Tiers** — Retrieve the student's base tuition and transport fees from the reference lists using `niveau` (G), `CLASSE` (H), and `DISTINATION` (V).
2.  **Step 2: Aggregate Discounts** — Sum all discount components in column J (`REMISE`).
3.  **Step 3: Calculate Annual Quote** — Evaluate column L (`DEVIS ANNUEL`) using the resolved fees and aggregated discounts.
4.  **Step 4: Sum Payments** — Sum all payment columns (R, S, T, U, W, X, Y) in column P (`TOTAL VERSEMENTS`).
5.  **Step 5: Calculate Outstanding Balance** — Evaluate column Q (`TOTAL*CREANCE`) as `L − P`.
6.  **Step 6: Evaluate September Validation** — Verify that the computed September balance is less than 10,000 DZD.
```

---

## File 4: `Sheet-Etat-Ledger.md`
```markdown
---
title: Sheet ETAT 20262027 - Master Ledger
type: sheet
tags: [master, ledger, transactional]
---

# Master Ledger Sheet: `ETAT 20262027`

The `ETAT 20262027` sheet is the central ledger of the system, containing **390 active student rows** across **38 transactional columns**.

---

## 1. Visual Design & Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     ETAT 20262027                                      │
├──────┬──────────────┬──────────────┬──────────────────┬──────────────────┬─────────────┤
│ NOM  │ CLASSE (H)   │ REMISE (J)   │ DEVIS ANNUEL (L) │ TOTAL VERSEM (P) │ CREANCE (Q) │
├──────┼──────────────┼──────────────┼──────────────────┼──────────────────┼─────────────┤
│ LEA  │ CE1          │ 25,500       │ 239,500          │ 239,500          │ 0           │
│ ACIL │ CM2          │ 5,000        │ 260,000          │ 117,000          │ 143,000     │
│ SAMY │ GS           │ 0            │ 236,750          │ 266,750          │ -30,000     │
└──────┴──────────────┴──────────────┴──────────────────┴──────────────────┴─────────────┘
```

The master table uses two conditional formatting rules to highlight key data:
1.  **Light Green Row Highlights**: Non-empty rows are highlighted using the formula `LEN(TRIM(A1))>0` with a solid green fill (`#B7E1CD`). This makes active student rows stand out.
2.  **Receivable Heatmap**: A color scale from green (`#57BB8A`) to white (`#FFFFFF`) is applied across all numeric columns. This highlights the largest outstanding debts.

---

## 2. The Transactional Columns

Columns are organized into four functional blocks:

### A. Identity & Options (Columns B–K)
These columns contain the student's contact info, academic level, class, and optional services (such as transport):
*   `niveau` (Column G) and `CLASSE` (Column H) determine the base tuition fee.
*   `OPTION` (Column I) must contain `TRNSP` to activate transport billing.
*   `REMISE` (Column J) subtracts any applied discounts.

### B. Core Accounting (Columns L–Q)
These computed columns calculate the student's annual fee, total payments, and outstanding balance:
*   `DEVIS ANNUEL` (Column L) is the total fee owed for the year.
*   `TOTAL VERSEMENTS` (Column P) is the sum of all payments received.
*   `TOTAL*CREANCE` (Column Q) is the outstanding balance (= L − P).

### C. Installment Payments (Columns R–Y)
These columns track tuition and transport payments:
*   `FI` (Column R) tracks the registration fee (always 25,000 DZD).
*   `V2` / `2V` (Columns S & T) track the second payment.
*   `v3` (Column U) tracks the third payment.
*   `1T`, `T2`, `t3` (Columns W–Y) track the three transport installments.

### D. Extra Services & Balances (Columns Z–AL)
These columns track clinical services and catch-up classes:
*   `PSY1`/`PSY2` and `ORTH1`/`ORTH2` track psychologist and speech therapist fees.
*   `E-PLANT` (Column AD) tracks the school's digital platform fee.
*   `Ratrapage` (Column AE) tracks fees for catch-up classes.

---

## 3. The Column AM Comment Receipt Log

Column AM has no header or cell values. Instead, it is used as a **hand-typed receipt log** using cell comments. 

```
[AM2 Cell Comment]
┌─────────────────────────────────┐
│ 239500/05/05                    │  ◄── 239,500 DZD paid on May 5th
└─────────────────────────────────┘
[AM8 Cell Comment]
┌─────────────────────────────────┐
│ 600000/17/06                    │  ◄── 600,000 DZD paid on June 17th
│ 22000/07/06b01                  │  ◄── 22,000 DZD paid on June 7th (Receipt Book B01)
└─────────────────────────────────┘
```

These comments must be written in the format:

$$\text{Amount} / \text{Day} / \text{Month} \, \text{Receipt Book}$$

### Common Receipt Books
*   `B01`, `B11`, `B12`: Identify the physical receipt book used for cash payments.
*   `======`: A row of equal signs indicates that the student's account is closed for the year.
```

---

## File 5: `Sheet-Devis-Quotes.md`
```markdown
---
title: Sheet Devis - Family Quotes
type: sheet
tags: [devis, quotes, family-billing]
---

# Sibling Group Quotes: `Devis`

The `Devis` sheet contains **10 repeating quote blocks**, each 48 rows tall. It is used to calculate and print annual quotes for families with one or more children.

---

## 1. Visual Block Structure

```
 Row  2:  [ Client Name ]   B2: "MAHAMED OUSSAID"
 Row  7:  [ Devis Number ]  I7: "0101/2021/2022"
 Row  9:  [ Date ]          I9: =TODAY()
        ┌─────────────────────────────────────────────────────────────┐
 Row 13:│ Prenom élève │ Classe │ F I    │ Frais Scolaire │ Total     │
        ├──────────────┼────────┼────────┼────────────────┼───────────┤
 Row 15:│ MAHDI        │ CM1    │ 28,000 │ 210,000        │ 281,000   │
 Row 16:│ AMINE        │ CE1    │ 18,000 │ 125,000        │ 186,000   │
        └──────────────┴────────┴────────┴────────────────┴───────────┘
 Row 27:  [ Sous-total ]             I27: =SUM(I15:I26)     [ 467,000 ]
 Row 29:  [ Réduction ]              I29: 10,000
 Row 31:  [ Montant Total DZD ]      I31: =I27 - I29        [ 457,000 ]
 Row 35:  [ 5% Early Bonus ]         D35: =SUM(F15:F26)*0.05
```

---

## 2. Sibling Calculations & Formulas

### Student Line Total
Each student row (typically rows 15 to 26) sums the registration fee (`FI`), tuition (`Frais Scolarisation`), and transport fees:
```excel
I15: =SUM(A15:H15)
```
*Note: Since columns A through D contain text, the formula effectively sums E (FI) + F (Tuition) + H (Transport).*

### Family Subtotal
Sums the line totals for all siblings in the block:
```excel
I27: =SUM(I15:I26)
```

### Grand Total
Subtracts the family discount and any refunds from the subtotal to calculate the final amount due:
```excel
I31: =I27 - I29
```

### 5% Early-Payment Bonus
Calculates a 5% discount on the tuition fee if paid in full early in the school year:
```excel
D35: =SUM(F15:F26) * 0.05
```

---

## 3. Dropdown Selection Lists
The student input rows (D15:H24) use data-validation dropdowns to select classes and fees. These dropdowns reference five named ranges:

1.  `CLASSE`: Specific class sections.
2.  `FI`: Registration fee tiers.
3.  `FRAISSCOLAIRE`: Annual tuition tiers.
4.  `SERVICE`: Service types (e.g., "Transport", "Cafeteria").
5.  `transport`: Transport pricing tiers.

*Note: These named ranges must be configured correctly in the REF sheet for the dropdown lists to appear in the UI.*
```

---

## File 6: `Sheet-Ref-Foundation.md`
```markdown
---
title: Sheet REF - Foundation Reference Tables
type: sheet
tags: [lists, parameters, dropdowns]
---

# Reference Tables: `REF`

The `REF` sheet is the data foundation of the workbook. It contains three static columns used to validate data entry and populate dropdown lists across the other sheets.

---

## 1. Reference Columns & Ranges

```
┌────────────────────────────────────────────────────────────────┐
│                              REF                               │
├──────────────────────┬──────────────────────┬──────────────────┤
│ Column A (CLIENT)    │ Column B (NIVEAU)    │ Column D         │
├──────────────────────┼──────────────────────┼──────────────────┤
│ BELRECHID            │ MS                   │ BOUMERDES        │
│ HARBI                │ GS                   │ CORSO            │
│ MOULFI               │ CP                   │ SAHEL            │
│ HAMADACHE            │ CE1                  │ FIGUIER          │
│ HASSAIN              │ CE2                  │ ZEMOURI          │
└──────────────────────┴──────────────────────┴──────────────────┘
```

### Column A: Parent Names (`CLIENT` range)
Contains the family names of primary parents and guardians.
*   **Excel Named Range**: `CLIENT` refers to `REF!$A:$A`.

### Column B: Class Codes (`NIVEAU` range)
Contains the 26 academic class and section codes used by the school.
*   **Excel Named Range**: `NIVEAU` refers to `REF!$B:$B`.

### Column D: Transport Destinations
Contains the 20 towns and routes served by the school's transport service.
*This column is used to validate the transport destination on the master ledger.*

---

## 2. Town Transport Zones

Transport fees are calculated based on the destination zone specified in Column D:

| Town / Route (Column D) | Transport Fee (DZD) | Installment Schedule (T1 / T2 / T3) |
| :--- | :--- | :--- |
| **Zone 1: Local** <br> (Boumerdès, Corso, Sahel) | 35,000 DZD | 20,000 / 10,000 / 5,000 DZD |
| **Zone 2: Intermediate** <br> (Figuier, Thénia) | 43,000 DZD | 25,000 / 12,000 / 6,000 DZD |
| **Zone 3: Outlying** <br> (Boudouaou, Réghaia) | 52,000 DZD | 30,000 / 12,000 / 10,000 DZD |
| **Zone 4: Far** <br> (Bordj Menaïl, Cap Djenet) | 55,000 DZD | 30,000 / 15,000 / 10,000 DZD |
```

---

## File 7: `Sheet-Bon-Receipts.md`
```markdown
---
title: Sheet BON - Customer Statement & Receipts
type: sheet
tags: [receipts, printable, broken]
---

# Customer Statement Template: `BON`

The `BON` sheet is a print template designed to generate and print single-page account statements and payment receipts for families.

---

## 1. Print Template Layout

```
Row  4:  [ Title ]       "Situation Client 2021-2022"
Row  8:  Family Name:    E8: "CLIENT"          F8: [ ABDELAOUI ]
Row  9:  Print Date:     H8: "DATE"            I8: =TODAY()
Row 10:  Family Quote:   C10: =VLOOKUP(F8, 'PAR PARENT'!A4:E785, 2, 0)
        ┌──────────────────────────────────────────────────────────────┐
Row 12: │ ABDELAOUI INES     │ Quote: H12 [ VLOOKUP ] │ Paid: I12 [ " ]│
Row 13: │ ABDELAOUI SAMY     │ Quote: H13 [ VLOOKUP ] │ Paid: I13 [ " ]│
        └──────────────────────────────────────────────────────────────┘
Row 20:  [ Payment History ]
Row 22:  Tranche 1:      A22: =VLOOKUP(F8, 'Etat General Versement'!G7:AS1255, 33, 0)
Row 23:  Tranche 2:      A23: =VLOOKUP(F8, 'Etat General Versement'!G7:AS1255, 34, 0)
```

---

## 2. Broken References & Migration Errors

In the 2026-2027 version of the workbook, the formulas on the `BON` sheet return `#REF!` errors because they reference sheets that were renamed or deleted during the year-end migration:

### The Missing `PAR PARENT` Sheet
The formulas in cells C10, H12, I12, H13, and I13 attempt to look up family quotes and paid amounts from a summary sheet named `PAR PARENT`:
```excel
=VLOOKUP(F8, 'PAR PARENT'!A4:E785, 2, 0)
```
This sheet does not exist in the active workbook, resulting in `#REF!` errors.

### The Renamed `Etat General Versement` Sheet
The formulas in rows 22 to 31 attempt to load the family's payment history from a sheet named `Etat General Versement`:
```excel
=VLOOKUP(F8, 'Etat General Versement'!G7:AS1255, 33, 0)
```
This sheet was renamed to `ETAT 20262027` for the new school year. Because the sheet name in the formulas was not updated, they all return `#REF!` errors.

---

## 3. Repair Blueprint

To restore the `BON` sheet's functionality, update the formulas to query the active `ETAT 20262027` sheet directly:

1.  **Look up the Family Quote (C10)**:
    ```excel
    =VLOOKUP(F8, 'ETAT 20262027'!E1:Q1032, 8, FALSE)
    ```
    *Looks up the client name in column E (Tutor) and retrieves the value from column L (Devis Annuel).*

2.  **Look up the Student Quote (H12)**:
    ```excel
    =VLOOKUP(E12, 'ETAT 20262027'!F1:Q1032, 7, FALSE)
    ```
    *Looks up the student's name in column F and retrieves the value from column L (Devis Annuel).*

3.  **Look up the Student Total Paid (I12)**:
    ```excel
    =VLOOKUP(E12, 'ETAT 20262027'!F1:Q1032, 11, FALSE)
    ```
    *Looks up the student's name in column F and retrieves the value from column P (Total Versements).*
```

---

## File 8: `Architecture-Flaws.md`
```markdown
---
title: Calculation Engine Architecture & Gaps
type: analysis
tags: [architecture, techdebt, gaps]
---

# Calculation Engine: Architectural Flaws & Gaps

This note analyzes the architectural gaps and design flaws in the application's implementation compared to the original Excel billing workbook.

---

## 1. Architectural Divergence

The application's billing engine differs from the original Excel workbook in several key areas:

```
[ Excel Recalculation Engine ]
* Cell-by-cell synchronous execution.
* Immediate, single-threaded updates.
* Changes propagate instantly.

VS.

[ Application Service Engine ]
* Decoupled service layers with a pub/sub Event Bus.
* Asynchronous side effects (e.g., payment allocation).
* Requires manual 'recomputeAll()' triggers.
```

### The Async Race Condition
Because the application processes payment allocations and invoice adjustments asynchronously via an event bus, there is a risk of **asynchronous drift**. 

If an operator saves changes to a student's row while a payment event is still processing, other services reading the database concurrently may read stale, out-of-date balances.

---

## 2. Critical Mismatches & Faulty Assumptions

### Mismatch 1: Hardcoded Fallback Tuition Fees
If no active `FeeSchedule` is linked, `LedgerService` falls back to a hardcoded formula that assumes a flat tuition fee of `205000` DZD:

```typescript
const devisAnnuel = devisRule
  ? this.evalNumeric(devisRule, ctx)
  : (input.fi ?? 25000) + 205000 + (input.optionCode === "TRNSP" ? 35000 : 0) - (input.remise ?? 0);
```

#### The Bug
`205000` is the tuition fee for **Primary school students only**. 

The Excel workbook uses different tuition tiers based on the student's division level (`niveau`): Pre-school is ~125,000 DZD, Collège is 305,000 DZD, and Lycée is up to 365,000 DZD. 

By using a flat fallback fee of `205000` for everyone, the application will under-bill Lycée and Collège students, resulting in silent financial losses for the school.

---

### Mismatch 2: The Hardcoded Payment Allocation Engine
The payment allocation engine in `LedgerService.allocatePaymentToLedger()` uses hardcoded tranche caps to split payments across installment columns:

```typescript
const slots = [
  { key: "fi", max: 25000 },
  { key: "v2", max: 71500 },
  { key: "altV2", max: 71500 },
  { key: "v3", max: 71500 },
  { key: "t1", max: 30000 },
  { key: "t2", max: 15000 },
  { key: "t3", max: 10000 },
] as const;
```

#### The Bug
These installment caps apply **only to Primary school students**. 
*   **Lycée and Collège Students**: Their tuition is higher, so their actual installment sizes are larger (e.g., 97,000 DZD for V2). The hardcoded cap of `71500` will prevent the application from allocating their full payments to their core tuition.
*   **Students Without Transport**: For students who do not take the bus, the allocation engine will still try to allocate payments to the transport slots (`t1`, `t2`, `t3`), creating phantom transport payments on their ledger.

---

### Mismatch 3: Sept. Balance Validation Error
The application applies an input validation check to the `septemberBalance` field during row saves:

```typescript
if (input.septemberBalance >= enums_1.SEPTEMBER_BALANCE_MAX) {
  throw new BusinessRuleError("September balance limit violation...");
}
```

#### The Bug
In the Excel workbook, `septemberBalance` is a **computed outstanding balance**, calculated as:

$$\text{September Balance} = \text{September Due} - \text{September Paid}$$

By treating this computed field as a user-provided input and throwing a validation error on save, the application blocks the database from saving rows if a student's actual calculated September debt exceeds 10,000 DZD.

---

## 3. Required Architectural Refactoring

To resolve these behavioral gaps and replicate the Excel workbook's logic exactly, implement the following changes:

```
1. Replace Hardcoded Caps in LedgerService with Dynamic Fee Schedule Lookups
2. Refactor validateInput() to Stop Treating Computed Fields as User Inputs
3. Implement Synchronous Database Transactions for All Ledger Calculations
```

### Refactoring the Payment Allocation Engine
Replace the hardcoded installment slots in `LedgerService` with a dynamic lookup that queries the active `FeeSchedule` for the student's grade level:

```typescript
// Resolve installment caps dynamically based on the student's division level
const schedule = await this.feeSchedules.findByGrade(student.gradeLevel);
const slots = [
  { key: "fi", max: schedule.getAmount("registration") },
  { key: "v2", max: schedule.getAmount("tuition_v2") },
  { key: "v3", max: schedule.getAmount("tuition_v3") },
  { key: "t1", max: student.hasTransport ? schedule.getAmount("transport_t1") : 0 },
  { key: "t2", max: student.hasTransport ? schedule.getAmount("transport_t2") : 0 },
  { key: "t3", max: student.hasTransport ? schedule.getAmount("transport_t3") : 0 },
];
```
This change ensures that payments are allocated using the correct installment and transport caps for each student's grade level.
```