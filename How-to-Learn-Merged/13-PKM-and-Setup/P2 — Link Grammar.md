---
type: PKM
tags: [PKM]
created: 2026-07-20
updated: 2026-07-20
---

# P2 — Link Grammar

> How to use wikilinks in this vault. Links are the substrate of schema transfer — sloppy linking breaks the entire system.

---

## The principle

Obsidian wikilinks are not hyperlinks. They are **statements of structural relationship**. Every link from note A to note B asserts: "B is structurally relevant to A; the reader of A will benefit from knowing B."

This is the same assertion a cognitive scientist makes when claiming transfer between two domains: the structural alignment justifies the link. Sloppy linking — adding links because they "seem related" — produces a graph that mirrors the learner's intuition, not the underlying structure. That intuition is exactly what novices have wrong (see [[01_Theory/T5 — Expert-Novice Differences|T5]]).

The link grammar below forces the link to be **earned**: each link type has a rule, and the rule demands a specific structural relationship.

---

## The four link types

### 1. Schema-instance links

**Direction:** concept → schema dossier.
**Assertion:** "This concept is an instance of this schema."

Format:
```
[[02_Schemas/S6 — Memory & Locality|S6 — Memory & Locality]]
```

**Rule:** every concept note must have ≥1 schema-instance link. Every schema dossier must have a backlink to each of its instances (the "Canonical instances" section).

**Test:** can you write the structural alignment in 2–3 sentences? If not, the link is surface-only — delete it or change it.

### 2. Method-application links

**Direction:** protocol → method.
**Assertion:** "This step of the protocol uses this method."

Format:
```
[[03_Methods/M4 — Worked Examples|M4 Worked Examples]]
```

**Rule:** every protocol step that uses a specific method must link to that method. Every method note must link to the protocols that operationalize it.

**Test:** can you name the step in the protocol that uses this method? If not, the link is decorative — delete it.

### 3. Theory-grounding links

**Direction:** method/schema/protocol → theory note.
**Assertion:** "This method works because of this cognitive principle."

Format:
```
[[01_Theory/T6 — Desirable Difficulties|T6 Desirable Difficulties]]
```

**Rule:** every method note must link to ≥1 theory note. Every theory note must link to the methods/schemas that operationalize it.

**Test:** can you write one sentence on why the theory predicts the method works? If not, the link is decorative — delete it.

### 4. Concept-concept links

**Direction:** concept → concept.
**Assertion:** "These two concepts share a schema, OR one is a prerequisite of the other, OR one is a contrastive case for the other."

Format:
```
[[B+ Tree]]
```

**Rule:** every concept-concept link must be **labeled** in the surrounding text with the relationship type:

- "B+ tree is-a [[02_Schemas/S3 — Tree & Hierarchy|S3 Tree]]" → schema-instance
- "B+ tree depends-on [[Page Cache]]" → prerequisite
- "B+ tree contrasts-with [[Hash Index]]" → contrastive case
- "B+ tree transfers-to [[LSM Tree]]" → transfer target

**Test:** if you cannot name the relationship type, the link is decorative — delete it.

---

## Anti-patterns

### The "related notes" dump

A section at the bottom of a note titled "Related" with 15 wikilinks and no labels. This mirrors a novice's surface-feature classification (T5). Delete the section; replace with labeled concept-concept links.

### The orphan

A note with no inbound links. Either the note is genuinely new (and needs to be linked from a MOC and a schema dossier), or it shouldn't exist.

Fix: every new note must be linked from at least one of:
- A MOC (for navigation).
- A schema dossier (for structural placement).
- Another concept note (for context).

### The hub-and-spoke trap

A schema dossier with 50 backlinks but no outbound links. The schema note becomes a passive index. Active schema dossiers link outward to:
- The theory that explains the schema (T1).
- The methods for studying it (M6).
- Contrastive schemas.

### Topic-linking

Linking "TCP" to "UDP" because they are both "networking." This is surface feature. Link them only if you can articulate the structural relationship (e.g., "TCP guarantees ordered delivery; UDP does not — contrastive case for the reliability schema").

---

## The link as a writing prompt

When you add a link, you commit to writing the structural alignment. The act of writing is the schema construction. Skipping the writing and adding the link anyway produces a graph that looks rich but encodes no transferable structure.

The discipline: **no link without a label**. This single rule eliminates 80% of sloppy linking.

---

## Backlinks vs forward links

Obsidian shows backlinks automatically. Use this for discovery ("what points to this note?") but do not rely on it for structure. Forward links (in the body of the note) are the author's commitment to the relationship. Backlinks are the reader's discovery tool.

Both should be present for every important relationship.

---

## Cross-links

- [[07_PKM/P1 — Tag System|P1 Tag System]] — tags are filters; links are relationships. Don't confuse them.
- [[07_PKM/P3 — MOC Pattern|P3 MOC Pattern]] — MOCs use links for navigation.
- [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — the theory that justifies the link grammar.
- [[01_Theory/T5 — Expert-Novice Differences|T5 Expert-Novice]] — why labeled links matter (surface vs deep structure).
