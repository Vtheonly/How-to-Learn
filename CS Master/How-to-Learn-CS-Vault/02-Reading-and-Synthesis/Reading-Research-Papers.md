---
aliases: [Paper Reading, Keshav Three Pass, Research Paper Protocol]
tags: [reading, protocol, papers]
---

# Reading Research Papers

> Keshav, S. (2007). *How to Read a Paper*. ACM SIGCOMM Computer Communication Review.

---

## Theory

A research paper is not a novel. It is a *compressed argument* with a specific structure: problem, prior work, contribution, method, evaluation, limitations. Each section serves a rhetorical function. Reading them all with equal attention wastes time.

Keshav's three-pass method:

- **Pass 1 (5-10 min)**: Get the bird's-eye view. Read title, abstract, intro, section headings, conclusions. Ignore details. Decide: is this worth pass 2?

- **Pass 2 (60 min)**: Get the full story, but skip proofs/evaluations. Read all sections, look at figures/tables, mark references you don't know. Decide: is this worth pass 3?

- **Pass 3 (4-5 hours for a hard paper)**: Re-implement the work in your head. Virtually re-derive the results. Identify every assumption and limitation.

Most papers warrant only pass 1. A smaller set warrants pass 2. Maybe 5-10% warrant pass 3.

---

## CS Translation

In CS, the three-pass method aligns naturally with the field's structure:

- **Pass 1** answers: what's the contribution?
- **Pass 2** answers: how does it work? what's the evidence?
- **Pass 3** answers: could I build this? what are the hidden assumptions?

For systems papers, add a 4th pseudo-pass: **reproduce** (run their code or reimplement a minimal version). Reproduction reveals everything pass 3 misses.

---

## Protocol: The Three Passes

### Pass 1 — Triage (5-10 min)

Read in this order:

1. **Title + abstract** (1 min) — what is this about?
2. **Introduction** (3 min) — what problem, what contribution
3. **Section headings** (1 min) — how is the argument structured?
4. **Conclusion** (2 min) — what did they claim to show?
5. **References** (skim, 2 min) — do they cite work you know? do they cite work you don't know but should?

**Output**: A one-paragraph summary in your own words. **Decision**: Read pass 2? Yes/No/Reference-only.

If "Reference-only": add to your [[Bibliography]] note with a 1-line summary. Move on.

### Pass 2 — Structural Comprehension (45-60 min)

Read all sections, but:

- **Skip** dense proofs (just read the theorem statements)
- **Skip** evaluation details (just read the headline numbers and figures)
- **Mark** unfamiliar references for later
- **Examine** all figures and tables carefully — they often carry the core argument

**Output**: A 1-page summary containing:
- Problem (1 sentence)
- Contribution (1-3 sentences)
- Method (key idea, 1 paragraph)
- Evaluation summary (1 paragraph)
- Limitations / open questions (1 paragraph)
- Your assessment: is the contribution real? is the method sound? is the evaluation convincing?

**Decision**: Read pass 3? Usually no. Pass 3 only if you will build on this work or you suspect the paper is wrong.

### Pass 3 — Deep Comprehension (2-5 hours)

The goal of pass 3 is to *virtually re-implement* the work. For each section:

1. **Method**: Re-derive the algorithm or system in your own words. Write pseudo-code.
2. **Proofs**: Re-derive each step. If you can't, identify the gap.
3. **Evaluation**: For each experiment, predict what you would expect, then compare to their numbers. Divergences are interesting.
4. **Assumptions**: List every assumption the paper makes — even implicit ones.
5. **Limitations**: Identify what the paper *doesn't* claim, even if it implies it.

**Output**: A multi-page note that:
- Critiques the paper (not just summarizes)
- Lists assumptions and limitations
- Identifies the strongest counter-example you can think of
- Compares to 2-3 related papers
- Sketches how you would extend or test this work

### Pass 4 (optional) — Reproduction

If the paper is foundational to your work:

1. Get their code (if available) and run it
2. If no code, re-implement a minimal version
3. Reproduce at least one of their experiments
4. Document divergences

Reproduction is the highest form of reading. You will discover more in 1 hour of reproduction than in 5 hours of pass-3 reading.

---

## Reading Lists for Specific Subfields

Instead of reading random papers, follow curated reading lists:

- **Distributed systems**: Murat Demirbas's reading list; the MIT 6.824 syllabus; Aphyr's blog posts
- **ML**: Andrej Karpathy's reading lists; the Stanford CS231n/CS224n syllabi
- **Systems**: the OSDI/SOSP "best papers" lists; the MIT 6.S081 reading list
- **Compilers**: the Dragon Book bibliography; PLDI "test of time" awards
- **Networking**: the SIGCOMM best papers; the IETF RFC reading lists

See [[MOC-Domain-Maps]] for curated lists per subfield.

---

## Worked Example: Reading "MapReduce" (Dean & Ghemawat, 2004)

**Pass 1** (8 min): Title, abstract, intro, headings, conclusion.
- Output: "Google's framework for processing large datasets using Map and Reduce functions across commodity clusters. ~6 pages. Likely worth pass 2."

**Pass 2** (45 min): Read all sections; skip detailed benchmarks.
- Output (1 page):
  - Problem: large-scale data processing is hard to parallelize, fault-tolerant, and distribute
  - Contribution: programming model (Map/Reduce) + runtime that handles parallelization, fault tolerance, data distribution
  - Method: Users write Map(k,v) → list(k',v') and Reduce(k', list(v')) → list(v'). Runtime shards input, schedules map workers, shuffles intermediate data, schedules reduce workers, re-executes failed tasks.
  - Eval: sort of 1TB in ~600 sec on 1800 machines. Locality optimization saves ~50% bandwidth. Backup tasks reduce stragglers 4x.
  - Limitations: not for arbitrary communication patterns; not for low-latency; not for interactive; master is single-point-of-failure (mitigated by checkpoints).

**Pass 3** (would be ~3 hours; only if implementing a MapReduce-like system).

**Decision**: Most readers stop after Pass 2. Pass 3 only if building a clone or extending the model.

---

## Key Citations

- Keshav, S. (2007). How to Read a Paper. *ACM SIGCOMM CCR, 37*(3), 83-84.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Three-Pass-Reading-Protocol]] — Obsidian template operationalizing this
- [[Schema-Driven-Querying]] — complementary; use during pass 2
- [[Syntopical-Reading]] — when reading multiple related papers
- [[Resource-Triage-Card]] — the decision point between passes

← Back to [[MOC-Reading-and-Synthesis]]
