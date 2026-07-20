---
aliases: [Triage Heuristics, Utility Heuristics]
tags: [triage, heuristic]
---

# Resource Utility Heuristics

> *Fast triage rules for predicting value before reading.*

---

## The Heuristics

A collection of fast rules, each taking <2 min to apply. None is universally correct; the combination is reliable.

### H1 — Authority heuristic
**Rule**: Prefer works by authors with verifiable prior contributions in the area.
**Quick check**: Have they published peer-reviewed work on this topic before? Have they built working systems? Do practitioners cite them?
**Examples**:
- ✅ Lamport on consensus
- ✅ Knuth on algorithms
- ✅ Ousterhout on operating systems
- ❌ "Industry analyst" blog on consensus

### H2 — Citation heuristic
**Rule**: For papers, check Google Scholar citations.
- <10 citations after 3 years → likely low impact (or new/niche)
- 100+ citations → likely impactful
- 1000+ citations → likely foundational (read it)
**Caveat**: Recent papers will have low citations. For papers <2 years old, look at author track record instead.

### H3 — Age heuristic
**Rule**: For stable subfields (algorithms, type theory, computability), prefer works >10 years old. For fast-moving subfields (ML, web, distributed systems), prefer works <5 years old — *unless* the work is foundational (then age doesn't matter).
**Quick check**: Look at the subdomain. If you can name a foundational work in the subdomain that's >20 years old and still cited, treat age as a feature, not a bug.

### H4 — The "I'll come back" heuristic
**Rule**: If you find yourself saying "I'll come back to this when I know more," just skip it. You probably won't come back, and if you do, you'll find a better resource then.
**Exception**: Books/papers explicitly named in 3+ syllabi or expert reading lists.

### H5 — The explanation density heuristic
**Rule**: For blog posts and articles, count the ratio of explanation to filler.
- High-density: every paragraph introduces a new concept or argument
- Low-density: "In today's fast-paced world of X..."
**Quick check**: Read the first 3 paragraphs. If you learned 0 new things, skip.

### H6 — The worked-example heuristic
**Rule**: For tutorials, prefer those with worked examples and exercises. Avoid tutorials that show only happy paths.
**Quick check**: Does the tutorial include a section on "common pitfalls" or "what can go wrong"? If not, it's probably shallow.

### H7 — The "depending on what I just learned" heuristic
**Rule**: The value of a resource is conditional on your current schemas. A paper that's noise to you today might be a Tier 1 paper in 6 months. Revisit your "ignore" decisions occasionally.
**Practical**: Maintain a "revisit when I know X" list in your reference index.

### H8 — The negative review heuristic
**Rule**: For books, read 2-3 critical (2-3 star) Amazon/Goodreads reviews. They often reveal structural weaknesses that 5-star reviews miss.

### H9 — The reference implementation heuristic
**Rule**: For implementation-focused material, prefer resources with working code you can run. Avoid resources that hand-wave or use pseudocode only.
**Quick check**: Is there a GitHub repo? Are the examples runnable? Are there tests?

### H10 — The "I would cite this" heuristic
**Rule**: After 5 minutes of skimming, ask: "Would I cite this if I were writing a survey?" If no, skip.

---

## Worked Example: Triaging "A blog post on distributed locks"

Encounter: Medium article "Implementing Distributed Locks with Redis"

- **H1 (Authority)**: Author is a senior engineer at a startup, not a distributed systems researcher. Medium authority.
- **H2 (Citations)**: N/A (blog post)
- **H3 (Age)**: 2 years old. Recent enough.
- **H5 (Density)**: First 3 paragraphs: intro, motivation, "in today's distributed world..." Low density.
- **H6 (Worked examples)**: Has code snippets, no failure cases.
- **H9 (Reference impl)**: Has a GitHub repo, but no tests.
- **H10 (Cite this?)**: Probably not.

**Decision**: Tier 3 (skip). The canonical alternative (Martin Kleppmann's blog post "How to do distributed locking") is shorter, denser, written by an authority, and is the standard reference. Read that instead.

---

## Worked Example: Triaging "Raft paper"

- **H1**: Ongaro (PhD student under Ousterhout, who has 30+ years of systems work). Strong.
- **H2**: 3000+ citations. Foundational.
- **H3**: 2014. For consensus, age is fine.
- **H5**: Abstract is dense. First paragraph introduces the problem.
- **H6**: Includes evaluation, case studies.
- **H9**: Reference implementations exist (etcd, Consul).
- **H10**: Would absolutely cite this.

**Decision**: Tier 1. Schedule deep read.

---

## Cross-Links

- [[Selective-Ignorance]] — master skill; heuristics are the implementation
- [[Constraint-Based-Analysis]] — a complementary heuristic
- [[Triage-Decision-Tree]] — operationalizes the heuristics
- [[Resource-Triage-Card]] — Obsidian template capturing these

← Back to [[MOC-Information-Triage]]
