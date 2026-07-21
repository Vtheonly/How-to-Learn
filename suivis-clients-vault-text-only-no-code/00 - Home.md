#  Suivis Clients 2026/2027 — Knowledge Base Home

> **One-sentence summary**: This workbook is the school's accounting brain — it stores every student, calculates what each family owes for the year, tracks every payment as it comes in, and shows the remaining balance at a glance.

---

##  The 30-second mental model

Think of the workbook as **three operational layers** sitting on top of **one reference layer**:

```
                  ┌─────────────────────────────┐
       Layer 3 →  │  BON   — Client statement    │  (printable receipt)
                  └──────────────┬──────────────┘
                                 │ pulls from
                  ┌──────────────▼──────────────┐
       Layer 2 →  │  ETAT 20262027 — Ledger     │  (the master table, 390 students)
                  └──────────────┬──────────────┘
                                 │ number is hand-typed from
                  ┌──────────────▼──────────────┐
       Layer 1 →  │  Devis — Quote templates    │  (10 family quotes)
                  └──────────────┬──────────────┘
                                 │ uses dropdown lists from
                  ┌──────────────▼──────────────┐
       Foundation │  REF — Reference data         │  (class codes, towns, parents)
                  └─────────────────────────────┘
```

Each layer **feeds the one above it**, but the connections are partly manual (hand-typed numbers) and partly automatic (formulas). See [[02 - The Four Layers]] for the full breakdown.

---

##  Where to go next

### If you want the big picture first
1. [[01 - Workbook Overview]] — what this workbook is and who uses it
2. [[02 - The Four Layers]] — the mental model above, expanded
3. [[03 - End-to-End Data Flow]] — trace one payment from quote to receipt
4. [[04 - Input vs Processing vs Output]] — which sheets are inputs, which are outputs

### If you want to understand one sheet deeply
- [[REF - The Foundation]]
- [[Devis - The Quote Engine]]
- [[ETAT 20262027 - The Master Ledger]]
- [[BON - The Client Statement]]

### If you want to understand the formulas
- [[L - DEVIS ANNUEL Formula]] — the most important formula in the workbook
- [[P - TOTAL VERSEMENTS Formula]] — sum of all payments
- [[Q - TOTAL CREANCE Formula]] — the remaining balance
- [[J - REMISE Breakdown Formulas]] — how discounts are composed
- [[S - V2 Installment Shortcuts]] — ad-hoc installment formulas
- [[Devis Block Formulas]] — how each quote block computes its total

### If you want to understand the codes
- [[Level Codes (niveau)]]
- [[Class Codes (CLASSE)]]
- [[Town List (DISTINATION)]]
- [[French Terms Glossary]]

### If you want to walk through a real scenario
- [[Workflow 1 - New Family Inquiry]]
- [[Workflow 2 - Student Enrollment]]
- [[Workflow 3 - Payment Recording]]
- [[Workflow 4 - Customer Statement]]

### If you're looking for hidden or broken things
- [[Column AM - Hidden Payment Log]] — the secret audit trail in cell comments
- [[Conditional Formatting]] — why some cells are green
- [[Data Validations]] — the (mostly broken) dropdown lists
- [[Named Ranges]] — the four named ranges, two of which are broken
- [[Broken BON Sheet]] — why BON is full of #REF! errors
- [[Missing Devis Dropdowns]] — why the Devis dropdowns are empty
- [[Off-by-One in S94]] — a small but real formula typo
- [[Stale 2021-2022 Dates]] — old year labels still in the file

### If you need reference data
- [[Price Table]] — every fee component with its meaning
- [[REF Sheet Full Content]] — the full lookup table
- [[Workbook Stats]] — counts, sizes, formula totals

---

##  Important: this workbook has some broken parts

The file was renamed/restructured for 2026/2027, but several pieces weren't fully migrated. The most visible symptoms:

- The `BON` sheet is **completely broken** — every formula returns `#REF!` because the source sheet was renamed.
- The `Devis` dropdowns are **empty** — five named ranges they reference don't exist anymore.
- Two workbook-scoped named ranges (`parent`, `TUTEUR`) point to `#REF!`.
- One formula in `S94` has an off-by-one row reference (`=110000-J95` instead of `=110000-J94`).
- The Devis blocks still say "2021/2022" in their dates and quote numbers.

See [[07 - Issues and Fixes]] for the full list and how to repair each one.

---

##  Source notes

Everything in this vault was verified by reading the actual `.xlsx` file with Python — not by guessing from column headers. Where the conceptual summary that inspired this vault disagrees with what's in the file, the file wins. The discrepancies are called out in the relevant notes.
