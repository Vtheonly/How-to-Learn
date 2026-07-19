---
type: Template
tags: [Template]
created: 2026-07-20
updated: 2026-07-20
---

# Schema Dossier

> Template for a new schema dossier. Use [[04_Protocols/P7 — How to Build a Schema Dossier|P7]] as the construction protocol.

---

**Schema name:** ____
**Date created:** YYYY-MM-DD
**Mastery level:** 2-explanation

> One-sentence summary:

> ____

---

## 1. Formal core

Definitions, invariants, notation. ~150–250 words.

> ____

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Key invariants |
|--------|----------|----------------|
| ____ | ____ | ____ |
| ____ | ____ | ____ |
| ____ | ____ | ____ |

For each instance, write 1–2 sentences on how the schema instantiates.

## 3. Contrastive cases

Examples that look similar to this schema but differ in a crucial way.

| Looks like this schema | Differs because |
|------------------------|-----------------|
| ____ | ____ |
| ____ | ____ |

## 4. Implementation

A minimal from-scratch implementation prompt. Describe what to build, what tests to write, what sub-skills it exercises.

> ____

**Difficulty estimate:** ____
**Time estimate:** ____

## 5. Failure analysis

5+ ways this schema fails in practice. Be specific.

| Failure mode | Cause | Symptom | Fix |
|--------------|-------|---------|-----|
| ____ | ____ | ____ | ____ |
| ____ | ____ | ____ | ____ |
| ____ | ____ | ____ | ____ |
| ____ | ____ | ____ | ____ |
| ____ | ____ | ____ | ____ |

## 6. Transfer tests

3+ prompts where terminology / representation / constraints change. `#sr`-tagged.

#sr
- ____
- ____
- ____

## 7. Delayed retrieval

#sr
- ____ *(level 1 recall)*
- ____ *(level 2 explanation)*
- ____ *(level 3 derivation)*
- ____ *(level 4 implementation)*
- ____ *(level 5 diagnosis)*
- ____ *(level 6 transfer)*

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]]
- **Method**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]]
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]]
- **Related schemas**: [[02_Schemas/S_ — _|S_]], [[02_Schemas/S_ — _|S_]]

---

## Vault rules check

- [ ] Has 3+ canonical instances from different domains.
- [ ] Has 2+ contrastive cases.
- [ ] Has 5+ failure modes.
- [ ] Has 3+ transfer tests tagged `#sr`.
- [ ] Has 3+ delayed retrieval prompts tagged `#sr` at increasing mastery levels.
- [ ] Links to T1 and P7.
- [ ] Links to ≥2 related schema dossiers.
