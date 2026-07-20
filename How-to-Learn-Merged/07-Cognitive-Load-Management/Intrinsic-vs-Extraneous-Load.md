---
aliases: [Intrinsic Load, Extraneous Load, Load Decomposition]
tags: [load, theory]
---

# Intrinsic vs. Extraneous Load

> *Operational decomposition of [[Cognitive-Load-Theory]].*

---

## Recap

Total cognitive load = Intrinsic + Extraneous + Germane ≤ WM capacity.

- **Intrinsic** — inherent difficulty of the material
- **Extraneous** — difficulty imposed by *how* the material is presented
- **Germane** — load devoted to schema construction (the productive kind)

Goal: minimize extraneous, manage intrinsic, maximize germane.

---

## Identifying Each Load Type

### Intrinsic load (high when...)

- The concept has many interacting elements (e.g., understanding a Paxos proof requires holding 5+ roles and message types simultaneously)
- You lack prerequisite schemas (e.g., trying to read TaPL without lambda calculus)
- The concept is at the edge of your competence

**You cannot reduce intrinsic load without changing the material or yourself.** You can only manage it (segmentation, pre-loading).

### Extraneous load (high when...)

- The notation is unfamiliar or inconsistent
- The author uses 3 different terms for the same concept
- The diagrams are unclear or absent
- The examples are missing or trivial
- The structure is non-obvious (no TOC, no headings, no summaries)
- You're reading on a screen with notifications
- You're trying to read while listening to music with lyrics

**Extraneous load is almost always reducible.** This is the easiest win.

### Germane load (high when...)

- You're actively retrieving, not re-reading
- You're generating your own examples
- You're connecting the new concept to existing schemas
- You're writing a summary
- You're implementing the concept in code

**Germane load is what produces learning.** Maximize it.

---

## Protocol: Load Audit

When you find yourself struggling with a resource, run this audit:

### Step 1 — Is this intrinsic or extraneous?

Ask: "Would an expert in this field find this passage hard?"

- If yes → intrinsic load. The material is hard for everyone.
- If no → extraneous load. The material is hard *for you* because of presentation.

### Step 2 — If extraneous, identify the source

Common sources:

- **Notation**: Look up unfamiliar symbols; build a glossary
- **Terminology**: Note when authors use multiple terms for the same concept; pick one and stick with it in your notes
- **Structure**: Re-outline the material in your own structure
- **Examples**: Generate your own examples (this also adds germane load)
- **Environment**: Eliminate distractions (see [[Environmental-Design]])

### Step 3 — If intrinsic, segment

Strategies for managing intrinsic load:

- **Pre-load prerequisites**: If you lack a prerequisite, stop and learn it first
- **Worked examples**: Find or construct worked examples; they have lower intrinsic load than abstract definitions
- **Partially complete examples**: Work through examples with the solution partially provided (research shows this is optimal for novices)
- **Segment**: Read in 15-30 min chunks with breaks; do not attempt to absorb a hard concept in one sitting
- **Reduce element interactivity**: Identify the 2-3 most important elements; hold those in mind and let the rest go until later

### Step 4 — Maximize germane load

Once extraneous is minimized and intrinsic is segmented, add germane load:

- Self-explain after each section (1 paragraph)
- Generate an example
- Connect to a known schema (write the link explicitly)
- Take a retrieval test on the section

---

## Worked Example: Reading TaPL (Pierce, Types and Programming Languages)

**Scenario**: Mid-level engineer trying to learn type theory for the first time.

**Symptom**: After 30 min, you've "read" 5 pages but understand nothing.

**Load audit**:

- *Intrinsic*: high (lambda calculus + type systems + formal proofs are all new)
- *Extraneous*: moderate (notation is dense; Pierce uses 5 inference rule notations across the book)
- *Germane*: low (you're reading passively)

**Intervention**:

1. Pre-load lambda calculus (spend a day on SICP §1.3 or a tutorial)
2. Build a glossary of inference rule notation
3. Read in 20-min segments with 5-min breaks
4. After each section, write a 2-sentence self-explanation
5. Generate your own typing example for each rule
6. Test yourself: "Given this rule, what's the type of this expression?"

After 2 weeks of this approach, intrinsic load drops (you have lambda calc schemas), extraneous is managed (glossary done), germane is high (you're testing).

---

## The Asymmetry of Practice

For novices: most load is intrinsic (the material is hard) and extraneous (presentation). Germane load is low because there's no room.

For experts: most load is germane (active schema construction). Intrinsic is low (schemas compress the material). Extraneous is low (they can ignore bad presentation).

This is why novices tire after 1 hour and experts can go 4 hours: the *composition* of load changes with expertise.

---

## Cross-Links

- [[Cognitive-Load-Theory]] — the underlying theory
- [[Working-Memory-Saturation]] — what happens when load exceeds capacity
- [[Session-Architecture]] — operational design
- [[Environmental-Design]] — removing extraneous load at the environment level

← Back to [[MOC-Load-Management]]
