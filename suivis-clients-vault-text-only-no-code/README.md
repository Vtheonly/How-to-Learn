# Suivis Clients 2026/2027 — Obsidian Vault

This is a complete, beginner-friendly knowledge base that explains how the Excel workbook `Suivis clients 2026_2027.xlsx` works from start to finish.

## How to use this vault

1. Open this folder in Obsidian (File → Open vault → Open folder as vault).
2. Start with [[00 - Home]] — it gives you the 30-second mental model.
3. Follow the wikilinks (`[[like this]]`) to drill into any topic.
4. Every note is self-contained: you can read it on its own without losing context.

## What's inside

| Folder | What you'll learn |
|---|---|
| `01 - Overview` | The big picture, the four layers, the end-to-end data flow, what's input vs output |
| `02 - Sheets Deep Dive` | One deep note per sheet: REF, Devis, ETAT 20262027, BON |
| `03 - Columns and Codes` | What every column means, what every code/abbreviation stands for |
| `04 - Formulas Explained` | One note per formula family: what it does, why it exists, where its inputs come from |
| `05 - Workflows` | Step-by-step walkthroughs of the four real-world workflows (inquiry → enrollment → payment → statement) |
| `06 - Hidden Logic` | Things you can't see at first glance: the AM comment log, conditional formatting, data validations, named ranges |
| `07 - Issues and Fixes` | Everything that's broken in the workbook and how to repair it |
| `08 - Appendix` | Reference data: the full price table, the full REF sheet, workbook stats |

## Quick facts

- **Workbook type**: School financial tracking system (tuition + installments + receivables)
- **School**: Sarl Elimtiyaz (Algeria, Boumerdès Province)
- **Year**: 2026/2027 (but several legacy 2021/2022 dates remain — see [[Stale 2021-2022 Dates]])
- **Currency**: Algerian Dinar (DZD)
- **Students tracked**: 390
- **Sheets**: 4 (REF, Devis, ETAT 20262027, BON)
- **Formulas**: ~1,500 across the workbook
- **Languages**: French (Algerian) with some English shorthand

## Source of truth

All facts in this vault were verified by reading the actual `.xlsx` XML content with Python (`openpyxl` + raw XML inspection). Where the conceptual explanation that inspired this vault (a separate AI's summary) disagrees with the actual file, the file wins — and the discrepancy is called out explicitly in the relevant note.

See [[00 - Home]] to begin.
