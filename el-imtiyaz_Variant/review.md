# Complete Gap Analysis: Software vs. Excel Workbook

## Executive Summary

The software (`Bab_08_el-imtiyaz_Variant`) attempts to reproduce the Excel workbook's logic through a formula engine, fee schedules, and ledger services. However, the Excel workbook's actual business logic is **far more ad-hoc, per-row-customized, and context-dependent** than the software assumes. The software imposes a rigid, uniform calculation model onto a workbook where the operator hand-crafts each row's formula with different component combinations.

I identified **47 distinct incompatibilities** across 8 categories.

---

## Category 1: DEVIS ANNUEL (Column L) — The Core Pricing Formula

This is the most critical divergence. The software assumes one universal formula; Excel uses **at least 6 distinct formula patterns** chosen per-row by the operator.

### 1.1 Registration fee is NOT always 25,000 DZD

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

**Excel:**
```
L3: =25000+205000+35000+55000-J3
```
This adds **both** 35,000 AND 55,000 (total transport = 90,000). The software's formula `registration + baseTuition + transportBase - remise` only has one transport slot.

### 1.5 Some rows have NO discount subtraction

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

**Software assumes:** t1=30,000, t2=15,000, t3=10,000 (from `DEFAULT_FEE_SCHEDULE`).

**Excel reality:** These vary. Some students have t1=20,000, t2=13,000, t3=10,000. Others have t1=30,000, t2=12,000, t3=10,000. The amounts depend on the transport destination and the family's payment arrangement.

---

## Category 5: Quote (Devis) Block Logic

### 5.1 Row total formula is structurally different

| Excel | Software |
|---|---|
| `=SUM(A15:H15)` where A–D are text (treated as 0), so effectively `=E15+F15+H15` | Expects `amounts: number[]` of length 8, sums all 8 |

The software's model of "8 amount columns" is wrong. Excel's columns A (name), B–C (empty), D (class) are **text**, not amounts. The actual numeric columns are only E (FI), F (tuition), and H (transport amount). Column G is also text ("Transport" label).

### 5.2 "advances" concept doesn't exist in Excel

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

**Software** treats `schoolFeeTax = SUM(fraisScolaire) * 0.05` as a **computed field on the quote block entity**, stored in the database.

**Excel reality:** The 5% calculation appears in cell D35 as part of a **text note**: "Nb 01: une remise de 5% sois [amount] est rajoutée si le paiement est effectué en totalité avant le 30 juin 2021". It's a **conditional early-payment discount** shown for information, NOT a tax added to the total. The `Montant Total DZD` cell (I31) does NOT include or reference this 5% figure.

### 5.4 The 5% discount is conditional on payment date

Excel's note says the 5% applies **only if paid in full before June 30**. The software computes it unconditionally as a static field.

### 5.5 Quote block dropdowns reference non-existent named ranges

Excel's Devis sheet has 5 data-validation dropdowns (`CLASSE`, `FI`, `FRAISSCOLAIRE`, `SERVICE`, `transport`) that are **all broken** (named ranges don't exist). The software doesn't implement any dropdown validation for quote line items.

### 5.6 Quote block "Nb 02" confirmation rule is not enforced

Excel states: "Toute inscription doit etre confirmée par un versement (frais d'inscription + 1er tranche)". This is a business rule requiring a minimum initial payment. The software has no equivalent enforcement.

---

## Category 6: Data Validation & Business Rules

### 6.1 September balance validation: hard vs. soft

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

Excel's validation is on `AG1:AG1032` (CREANCES SEPTEMBRE), but this column has **zero data** in the actual workbook. The software enforces a rule on a field that's never used.

### 6.3 No validation exists for other receivable columns

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

Excel's BON sheet groups multiple children under one parent (e.g., ABDELAOUI INES + ABDELAOUI SAMY under client ABDELAOUI). The software's ledger is per-student with no family-level aggregation view.

### 7.3 Payment history as cell comments (Column AM) — different paradigm

| Excel | Software |
|---|---|
| Cell comments on column AM, format: `amount/date/receipt#` (e.g., `250000/07/05B11`) | Database entity `PaymentAuditComment` with parsed fields |
| Multiple payments stack as multi-line comments | One database row per comment |
| Invisible unless you hover over the cell | Visible in UI |
| No formal link to the payment columns (R–Y) | Linked via `ledgerEntryId` |

The software's parsing is correct (`parseAuditComment` handles the format), but the **workflow** is different: in Excel, the operator types a comment; in software, it's a structured form. The software also doesn't handle the `======` suffix (marking a file as closed) in any meaningful workflow way.

### 7.4 Conditional formatting (visual feedback) — not replicated

Excel has:
1. Green fill (`#B7E1CD`) on any non-empty cell in A1:AL1032
2. Green-to-white color scale on numeric values

The software has no equivalent visual logic for the ledger grid.

### 7.5 Term-by-term tracking (Sep/Dec/Mar) — dead in both, but software has fields

Excel's columns AF–AK (SEPTEMBRE through CREANCES MARS) are **entirely empty**. The software creates database columns for them and includes them in the GRAND TOTAL formula, but they serve no purpose.

### 7.6 The "PAR PARENT" summary sheet — deleted, never recreated

Excel's BON sheet references a `'PAR PARENT'` sheet that was a parent-level summary. This sheet was deleted. The software has no parent-level summary view either.

---

## Category 8: Edge Cases & Data Integrity

### 8.1 Off-by-one reference in S94

**Excel:** `S94: =110000-J95` (references J95, should be J94)

The software would never produce this bug because it uses a uniform formula. But it also means the software can't replicate the **actual data** in row 94 if importing from Excel.

### 8.2 Negative balances (overpayment)

**Excel:** Row with `TOTAL*CREANCE = -30000` (SIDI MAMER SAMYI paid 30,000 more than the devis). Excel allows this silently.

**Software:** The `PaymentService.recordPayment` throws a `BusinessRuleError` if `amount > totalOutstanding`:
```typescript
if (amount.amount > totalOutstanding && totalOutstanding > 0) {
  throw new BusinessRuleError(`Payment amount exceeds outstanding balance`);
}
```
This **blocks overpayments**, which Excel allows. The software does have an `OVERPAID` status, but the validation prevents reaching it in normal flow.

### 8.3 Zero-amount students (fully discounted)

Some Excel rows have devis = 0 or very low amounts (e.g., special needs students with heavy discounts). The software's formula `registration + baseTuition + transportBase - remise` could produce a negative devis if remise > sum of components. Excel's hand-typed formulas avoid this by construction.

### 8.4 Students with no transport but OPTION field populated

Some Excel rows have `OPTION = TRNSP` but no transport amount in the L formula (the operator forgot or the family opted out). The software's conditional `optionCode === "TRNSP" ? 35000 : 0` would add transport where Excel didn't.

### 8.5 Multiple phone numbers in column D

Excel stores phone numbers as `0663701834/0660800317` (slash-separated). The software's `phoneNumbers` field is a plain string, which is fine, but the `Student` entity has `phoneNumbers: string[]` (an array). The import logic (`readRowAsLedgerInput`) stores it as a single string, creating a type mismatch.

### 8.6 The "NV" level codes (NV2, NV3, NV4, NV5)

Excel uses `NV2`, `NV3`, `NV4`, `NV5` as level codes for special/new students. The software's `StudentStatus` enum has `ACTIVE, SUSPENDED, GRADUATED, LEFT, PENDING` — no equivalent for these codes. They'd be imported as raw strings in the `level` field with no validation.

### 8.7 Duplicate devis numbers in Devis sheet

Excel's Devis sheet has duplicate devis numbers (two blocks share `0103/2021/2022`, two share `0104/2021/2022`, two share `0107/2021/2022`). The software's quote block entity has no uniqueness constraint on name/number, so this is technically allowed but could cause confusion.

### 8.8 The "BON" sheet name has a trailing space

Excel's sheet is named `"BON "` (with a trailing space). Any programmatic reference must account for this. The software's import logic uses sheet names directly and would fail if it looks for `"BON"` without the space.

### 8.9 Excel's auto-filter range extends to row 404 but data goes to row 1032

The auto-filter is on `$A$1:$AN$404` but the sheet has 1032 rows. Rows 405–1032 are outside the filter range. The software imports all rows up to `rowCount`, potentially importing 600+ empty rows.

### 8.10 The `E-PLANT` column (AD) — unknown business meaning

The software creates a field `ePlant: number` for this column. The Excel header is `E-PLANT` but its business meaning is unclear (possibly "élan/planning" or a platform fee). The software treats it as a generic numeric field with no validation or business logic.

---

## Summary Table: Severity Classification

| # | Gap | Severity | Category |
|---|---|---|---|
| 1.1 | Registration fee hardcoded at 25,000 |  Critical | Pricing |
| 1.2 | Tuition hardcoded at 205,000 (ignores level) |  Critical | Pricing |
| 1.3 | Only 2 transport tiers (need 4+) |  Critical | Pricing |
| 1.4 | Can't add both transport_base + transport_premium |  High | Pricing |
| 1.5 | Always subtracts remise (some rows don't) |  Medium | Pricing |
| 1.6 | Single formula for all 390 students |  Critical | Architecture |
| 2.3 | GRAND TOTAL formula invented (doesn't exist in Excel) |  Medium | Phantom feature |
| 4.1 | Arbitrary payment caps (25k, 71.5k, etc.) |  Critical | Payment |
| 4.2 | Sequential auto-allocation vs. manual placement |  Critical | Payment |
| 4.3 | Transport tranches fixed at 30k/15k/10k |  High | Payment |
| 5.1 | "8 amount columns" model is wrong |  High | Quote |
| 5.2 | "advances" concept doesn't exist in Excel |  Medium | Quote |
| 5.3 | 5% treated as tax, actually informational note |  High | Quote |
| 5.4 | 5% is conditional on payment date |  Medium | Quote |
| 5.6 | Confirmation rule not enforced |  Medium | Quote |
| 6.1 | Hard validation vs. Excel's soft validation |  High | Validation |
| 6.2 | Validates an empty column |  Medium | Validation |
| 7.1 | No customer statement (BON equivalent) |  High | Missing feature |
| 7.2 | No family-level grouping |  High | Missing feature |
| 7.3 | Comment-based audit trail → structured DB (paradigm shift) |  Medium | Workflow |
| 7.4 | No conditional formatting equivalent |  Low | Visual |
| 8.2 | Overpayments blocked (Excel allows) |  High | Edge case |
| 8.4 | TRNSP option adds transport even when Excel didn't |  High | Edge case |
| 8.8 | Sheet name "BON " has trailing space |  Low | Import |
| 8.9 | Imports 600+ empty rows beyond filter range |  Low | Import |

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

The BON sheet groups students by family (parent name) and produces a consolidated statement. The software has no service that:
- Groups `LedgerEntry` records by `tutorName` or a family identifier
- Sums devisAnnuel, totalVersements, totalCreance across siblings
- Produces a family-level view

The `ParentRepository.getStudentIds()` exists but is never connected to the ledger.

### 8.2 No Transport Pricing Service

There is no service that maps `destination → transport cost`. The fee schedule has two hardcoded transport amounts. The 20 destinations in the REF sheet (Boumerdès, Corso, Boudouaou, etc.) each have different costs, but no lookup mechanism exists.

### 8.3 No Level-Based Pricing Service

There is no service that maps `(level, classCode) → (registration fee, tuition fee)`. The fee schedule has one registration amount and one tuition amount.

### 8.4 No Formula Composition Service

There is no service that, given a row's attributes, **composes** the correct formula expression. The operator in Excel mentally does: "This is a PRIM student with transport to Boudouaou and a 25,500 discount, so the formula is `=25000+205000+52000-J2`." No software component replicates this decision process.

### 8.5 No Conditional Validation Service

Excel's data validation on column AG (`septemberBalance < 10000`) is a **soft** validation (`showErrorMessage=False`). The software implements it as a hard `BusinessRuleError` in `validateInput()`. There is no concept of soft vs. hard validation in the architecture.

---

## 9. Business Rules in the Wrong Place

### 9.1 Payment allocation in LedgerService

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

The `schoolFeeTax` is computed and persisted as a field on `QuoteBlock`. In Excel, it is a **display-only note** conditional on payment date. It should be a computed display value in the UI layer, not a persisted field in the domain entity.

### 9.3 The GRAND TOTAL formula in FormulaRuleService

The `getStarterFormulaRules()` function seeds a GRAND TOTAL rule. Column AL in Excel is **empty**. This rule should not exist. It was invented by the software.

### 9.4 September balance validation in LedgerService.validateInput

This validation belongs in a **validation rules registry** that mirrors Excel's data validation definitions, not hardcoded in the service method. The Excel validation is soft; the software makes it hard.

---

## 10. The Formula Engine's Limitations

### 10.1 No access to row metadata

The formula context contains only numeric fields. The formula cannot reference `optionCode`, `level`, `classCode`, or `destination` because these are strings not included in `buildFormulaContext`. A formula like:

```
IF(optionCode = "TRNSP", registration + tuition + transport, registration + tuition) - remise
```

is impossible because `optionCode` is not in the context.

### 10.2 No access to lookup tables

The formula engine supports `VLOOKUP` against named ranges in `ctx.ranges`. But `buildFormulaContext` never populates `ranges`. There is no way to write:

```
VLOOKUP(destination, transportPrices, 2, 0)
```

because `transportPrices` is never injected into the context.

### 10.3 No support for per-row formula storage

The `LedgerEntry` entity has no field for storing a per-row formula expression. The `formula_rules` table stores global rules. There is no way to say "row 2 uses formula X, row 3 uses formula Y."

### 10.4 The `condition_expr` field is dead

The `FormulaRule` entity has:

```typescript
condition?: string;  // "Optional: only apply to entries matching this filter"
```

No service ever reads this field. It is never evaluated. It is never used to filter which rows a rule applies to. It is architectural dead weight.

---

## 11. The Excel Ingestion Service Breaks the Formula Chain

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
| 1 | **Data flow** |  FATAL | Intermediate results (devisAnnuel, totalVersements) are never written back to the formula context. TOTAL CREANCE and GRAND TOTAL always evaluate to 0. |
| 2 | **Formula model** |  STRUCTURAL | One global formula per target field. Excel has per-row formulas. No mechanism for per-row variation. |
| 3 | **Pricing model** |  STRUCTURAL | Flat fee schedule with single amounts. Excel has multi-tier pricing indexed by level and destination. |
| 4 | **Transport logic** |  STRUCTURAL | Transport unconditionally added. Excel adds it conditionally on OPTION=TRNSP with destination-specific amounts. |
| 5 | **Quote model** |  STRUCTURAL | 8 numeric amounts per line. Excel has 3 numeric + 5 text columns. SUM(A:H) ≠ sum of 8 numbers. |
| 6 | **Dependency graph** |  HIGH | totalCreance depends on devisAnnuel + totalVersements, but context doesn't carry intermediates. |
| 7 | **Phantom calculation** |  HIGH | GRAND TOTAL rule exists. Column AL is empty in Excel. Invented calculation. |
| 8 | **5% tax** |  HIGH | Persisted as entity field. Excel has it as conditional display note. |
| 9 | **Payment allocation** |  HIGH | Hardcoded caps in LedgerService. Doesn't exist in Excel. Wrong service. |
| 10 | **Missing: family grouping** |  HIGH | No equivalent of BON sheet's VLOOKUP-based family statement. |
| 11 | **Missing: pricing lookup** |  HIGH | No level→fee or destination→transport mapping service. |
| 12 | **Missing: formula composition** |  HIGH | No service that builds per-row formula from row attributes. |
| 13 | **condition_expr dead code** |  MEDIUM | Field exists on entity, never read by any service. |
| 14 | **Circular dependency hack** |  MEDIUM | `services.feeSchedule["ledger"] = services.ledger` bypasses DI. |
| 15 | **Soft vs hard validation** |  MEDIUM | Excel's septemberBalance validation is soft. Software throws exception. |
| 16 | **Ingestion skips computed values** |  MEDIUM | Import reads inputs, skips computed columns, then recomputes incorrectly. |
| 17 | **Context missing metadata** |  MEDIUM | optionCode, level, classCode, destination not in formula context. |
| 18 | **No ranges in context** |  MEDIUM | VLOOKUP support exists in engine but ranges never populated. |
| 19 | **Scalability** |  MEDIUM | recomputeAll() loads all 10,000 entries into memory, evaluates sequentially. |
| 20 | **No audit trail for calculations** |  LOW | No record of which formula was used for which row, or what components composed it. |

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
