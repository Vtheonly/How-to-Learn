---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P6 — How to Triage What to Ignore

> You cannot learn everything — trying to is the largest single source of wasted effort. Triage weekly: list everything you could study, score each on prerequisite centrality, project relevance, and transfer value, multiply, and let the top 2 win deep study, the next 5 skim, and the rest defer or ignore until next quarter.

**When to use:** Weekly (Sunday evening, paired with [[04_Protocols/P8 — How to Run a Weekly Review|P8]]). Also whenever you feel overwhelmed by "things I should learn," or whenever a new shiny topic surfaces mid-week and you need a rule to defer it.
**Inputs:** A list of every candidate topic currently competing for your study time — new topics encountered this week, old topics still on the list, ambient "I should learn X" items.
**Outputs:** A prioritized backlog: 2 topics for deep study, 5 for skim, the rest deferred or ignored with explicit recorded decisions.
**Time:** 30-45 minutes weekly; 1 hour quarterly.

---

## Steps

### Step 1 — List everything you "could" study (10 min)

Open a blank note. Brain-dump **every** topic currently competing for your attention. Include:

- New topics encountered this week (from blog posts, podcasts, conversations, papers).
- Old topics still on the list from previous triage sessions.
- Ambient "I should learn X" items that live rent-free in your head.
- Reading-list items (papers, books, articles).
- Tools, frameworks, languages, and systems you feel you "should" know.
- Topics suggested by colleagues, mentors, or social media.

Be exhaustive. Do not pre-filter. The point of the list is to externalize the cognitive load — every item on the page is one item no longer occupying working memory. The list typically has 15-30 items; do not be alarmed.

Concrete example — a sample triage list from a backend engineer's week:

1. WebAssembly (saw a talk)
2. Rust async internals (current project blocks on this)
3. CRDTs (read a blog post)
4. PostgreSQL query planner (production incident last week)
5. WebGPU (saw a demo)
6. Differential dataflow (heard on a podcast)
7. Type-level programming in TypeScript (coworker mentioned)
8. Lean 4 (saw a tweet)
9. eBPF (hearsay at work)
10. TLA+ (paper on a design)
11. Apache Iceberg (vendor pitch)
12. Vector databases (multiple recent mentions)
13. Zig (saw a benchmark)
14. DisTruptor pattern (Java concurrency blog)
15. Honeycomb / OpenTelemetry (observability stack at work)
16. Spark internals (data team uses it)
17. SQLite internals (curiosity)
18. Formal verification with F* (paper)

### Step 2 — Score prerequisite centrality (P, 1-5) (5 min)

For each topic, score how many **other topics or future projects** depend on this one. P is the leverage score: a topic with P=5 unlocks many downstream capabilities; a topic with P=1 is standalone and can be skipped without consequence.

| P score | Meaning | Example |
|---------|---------|---------|
| 5 | Many future topics require this; foundational | "Probability theory" for any ML/Stats work |
| 4 | Several future topics require this | "Operating systems internals" for systems work |
| 3 | Some future topics benefit | "Rust async internals" for backend systems work |
| 2 | One or two topics benefit | "Apache Iceberg" for data engineering |
| 1 | Standalone; no downstream dependencies | "Type-level TS" for backend work |

The mistake here is to score by **how interesting** the topic is, not how central. Interesting ≠ central. WebAssembly is interesting; for a backend engineer not working on browsers, it is P=2 at most. Probability theory is less immediately engaging but P=5 for anyone doing data, ML, or systems performance.

### Step 3 — Score project relevance (R, 1-5) and transfer value (T, 1-5) (10 min)

**Project relevance (R):** does a current or near-term project require this?

| R score | Meaning |
|---------|---------|
| 5 | Blocking a current project this week |
| 4 | Required for a current project this month |
| 3 | Useful for a current project; not blocking |
| 2 | Likely useful in next 3 months |
| 1 | No current or near-term use |

**Transfer value (T):** how broadly does the underlying schema transfer across CS?

| T score | Meaning | Example |
|---------|---------|---------|
| 5 | Core CS schema reused across many domains | "Consensus," "caching," "indexes" |
| 4 | Schema reused across several domains | "Event loops," "vector clocks" |
| 3 | Schema reused within one subfield | "Query optimization" |
| 2 | Specific technique with some transfer | "eBPF programs" |
| 1 | Niche, one-off; no transfer | "Vendor-specific config" |

T is the most important of the three for long-term learning. A topic with T=5 is worth learning even if R=1, because the schema will pay off across decades. A topic with T=1 is rarely worth learning deeply even if R=5, because the payoff is local and the knowledge decays. The triage's job is to find topics with high P × R × T; pure R-driven study produces local experts who cannot transfer.

### Step 4 — Compute priority = P × R × T (5 min)

Multiply. Range 1-125. The score is a forcing function, not a measurement — its purpose is to make the ranking explicit, not to be precise. Two topics with scores 24 and 27 are effectively tied; the difference is noise.

Concrete example — the sample list scored:

| # | Topic | P | R | T | Score | Decision |
|---|-------|---|---|---|-------|----------|
| 2 | Rust async internals | 4 | 5 | 4 | 80 | Deep |
| 4 | PostgreSQL query planner | 4 | 5 | 3 | 60 | Deep |
| 3 | CRDTs | 3 | 3 | 5 | 45 | Skim |
| 15 | OpenTelemetry | 3 | 4 | 3 | 36 | Skim |
| 9 | eBPF | 3 | 3 | 3 | 27 | Skim |
| 11 | Apache Iceberg | 2 | 4 | 3 | 24 | Skim |
| 16 | Spark internals | 2 | 3 | 3 | 18 | Skim |
| 17 | SQLite internals | 3 | 2 | 4 | 24 | Skim |
| 6 | Differential dataflow | 2 | 2 | 4 | 16 | Defer |
| 10 | TLA+ | 3 | 2 | 4 | 24 | Defer (skim next quarter) |
| 18 | F* | 3 | 1 | 4 | 12 | Defer |
| 12 | Vector databases | 2 | 2 | 3 | 12 | Defer |
| 1 | WebAssembly | 2 | 1 | 2 | 4 | Ignore |
| 5 | WebGPU | 1 | 1 | 2 | 2 | Ignore |
| 7 | Type-level TS | 1 | 1 | 1 | 1 | Ignore |
| 8 | Lean 4 | 1 | 1 | 2 | 2 | Ignore |
| 13 | Zig | 2 | 1 | 2 | 4 | Ignore |
| 14 | Disruptor pattern | 2 | 1 | 3 | 6 | Ignore |

### Step 5 — Top 2: study deeply this week (rest of the week)

The top 2 by score (here: Rust async internals, PostgreSQL query planner) become this week's deep-study targets. Apply the relevant protocols to each:

- Rust async internals → [[04_Protocols/P3 — How to Learn a New Language|P3]] (if Rust is new) or [[04_Protocols/P4 — How to Learn a New System|P4]] (treating the async runtime as a system). Deep study means: read the canonical source (the `tokio` source for the runtime, the Rust async book for the model), trace one flow with a debugger, write a minimal reimplementation of a single-threaded executor.
- PostgreSQL query planner → [[04_Protocols/P4 — How to Learn a New System|P4]]. Deep study means: read the architecture overview, identify schemas (S4 optimization is primary), read `src/backend/optimizer/`, implement a tiny cost-based optimizer for a 3-table join.

The cap of 2 deep topics is the working-memory constraint (see [[01_Theory/T2 — Cognitive Load Theory|T2]]). Attempting 5 deep topics simultaneously produces shallow coverage of all 5. The 2-topic cap is non-negotiable; if you have time for a third, deepen one of the first two rather than spreading.

### Step 6 — Next 5: skim only (1-2 hours total)

The next 5 by score (here: CRDTs, OpenTelemetry, eBPF, Apache Iceberg, SQLite internals) get **skim only**: read 1 paper or 1 chapter to map the territory. Do not implement. Do not write a full schema dossier. Do not invest more than ~30 minutes per topic.

The goal of skim is **territory mapping**: you should be able to answer, for each skimmed topic, "what problem does this solve, what is the core trick, and which schemas (S1-S10) does it instantiate?" If you cannot answer those three questions, your skim was too shallow; if you find yourself implementing, your skim was too deep.

Skim produces a stub note per topic, tagged `#skim`, with the three answers above and a `#revisit` tag for next quarter's triage. The stub notes are the deferred list's seed.

### Step 7 — Rest: defer or ignore; revisit quarterly (10 min)

For every topic not in the top 2 (deep) or next 5 (skim), decide:

- **Defer** (score 8-15, or any topic with P ≥ 3 and R = 1): record the decision; revisit next quarter. These are topics that would be valuable but have no current trigger; trust the just-in-time principle (see [[03_Methods/M10 — Strategic Triage|M10]] §4).
- **Ignore** (score < 8): record the decision; do not re-litigate weekly. These are topics that will not pay off; explicitly closing them removes the cognitive load of "I should learn X."

Record the decision in your note. The act of recording is what closes the open loop: an item that exists only in your head will resurface as guilt every time you see it mentioned; an item recorded as "ignore, reviewed 2026-07-20" is closed.

Quarterly revisit (every 12-13 weeks): re-score the deferred list. Some items will have become relevant (R increased); promote them. Others will have proved irrelevant; delete them. A few will have been quietly obsoleted by industry shifts (e.g., a framework that lost adoption); delete those too.

Concrete example — quarterly revisit of the sample list:

- TLA+ — a new design project starts next quarter. R goes from 2 to 4. Score goes from 24 to 48. Promote to deep study.
- WebAssembly — a new feature requires a browser plugin. R goes from 1 to 5. Score goes from 4 to 40. Promote to deep study.
- Lean 4 — no triggering project. Keep ignored.
- Zig — no triggering project. Keep ignored.

The quarterly revisit takes ~1 hour and is the long-term steering mechanism. Without it, the deferred list grows without bound and the ignored list decays into "things I once considered."

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Trying to learn everything | Shallow coverage of 10 topics; nothing sticks. | Cap deep study at 2 topics; the rest get skim or defer. |
| FOMO | You defer a topic but feel guilty every time it is mentioned. | Record the decision explicitly; trust the just-in-time principle; revisit quarterly, not weekly. |
| Not scoring | Decisions are vibes; the same topic is re-litigated weekly. | Step 4 forces explicit scores; recorded scores are not re-litigated. |
| Ignoring prerequisite centrality | You defer a true prerequisite; downstream topics stall. | P=4-5 topics almost always go deep, even if R is low; they unlock too much. |
| Learning trendy tools over fundamentals | You can recite Kubernetes YAML but cannot explain consensus. | T is the long-term score; weight T more heavily for foundational topics. |
| Treating the score as precise | You agonize over whether a topic is 24 or 27. | The score is a forcing function; treat ties as ties. |
| Re-litigating ignored items | You spend triage time reconsidering items already ignored. | Once ignored, only revisit quarterly; weekly re-litigation wastes the protocol. |
| Skim = read in full | You spend 5 hours "skimming" a topic and never reach the deep topics. | Skim = 30 min, 1 paper, 3 questions; do not implement. |
| No written record | Decisions evaporate; nothing to review quarterly. | Write a triage note per session; record scores, decisions, dates. |
| Scoring by interest, not centrality | WebAssembly scores high because it is cool, not because it is central. | Score P by what downstream topics require, not by what is engaging. |
| Triage without follow-through | Decisions made, not executed; the deep topics do not get deep study. | Pair triage with [[03_Methods/M7 — Implementation Intentions|M7]] if-then plans for daily execution. |

## Linked methods

- [[03_Methods/M10 — Strategic Triage|M10]] — P6 is the operational playbook for M10.
- [[03_Methods/M7 — Implementation Intentions|M7]] — triage decisions execute only via if-then plans; pair the top-2 deep topics with explicit "when X, I will Y" plans.
- [[03_Methods/M1 — Retrieval Practice|M1]] — applied to the topics triaged "in."
- [[03_Methods/M2 — Spaced Repetition|M2]] — retrieval schedules for deep topics.
- [[03_Methods/M9 — Concept Mapping|M9]] — the skim step asks "which schemas does this instantiate?", which is a one-row concept map.

## Linked theory

- [[01_Theory/T2 — Cognitive Load Theory|T2]] — the 2-topic deep cap is the WM constraint; more than 3 deep topics overloads.
- [[01_Theory/T3 — Deliberate Practice|T3]] — experts triage ruthlessly; selection is part of expertise.
- [[01_Theory/T1 — Schema Transfer|T1]] — T (transfer value) rewards schemas over tools; the long-term payoff is transfer.
- [[01_Theory/T6 — Desirable Difficulties|T6]] — the just-in-time principle is partly a difficulty principle: deferred topics have stronger cues and stronger encoding when they return.
- [[01_Theory/T8 — Adaptive Expertise|T8]] — adaptive experts know what to ignore; routine experts try to learn everything.

## Retrieval queue

#sr
- List the seven steps of P6 in order. Why is the deep-study cap set at 2 topics per week?
- Define P, R, and T. Which is most important for long-term learning, and why?
- A topic scores P=5, R=1, T=4 (score 20). Should you learn it deeply, skim, defer, or ignore? Justify your reasoning using the prerequisite-centrality rule.
- You defer WebAssembly with R=1; three months later a project requires it. Trace how its score changes and what action the quarterly revisit prescribes.
- Why does the protocol forbid re-litigating ignored items weekly? What cognitive-load purpose does the rule serve?

---

## Cross-links

- Related protocols: [[04_Protocols/P8 — How to Run a Weekly Review|P8 Weekly Review]] (Step 5 of P8 runs P6 for the coming week), [[04_Protocols/P1 — How to Read a Research Paper|P1 Read Paper]] (papers enter the triage list as candidate topics), [[04_Protocols/P4 — How to Learn a New System|P4 Learn System]] (the deep-study protocol for systems topics).
- Related schemas: [[02_Schemas/S4 — Optimization & Constraints|S4 Optimization & Constraints]] (triage is itself an optimization over a constrained budget of time), [[02_Schemas/S10 — Search & Inference|S10 Search & Inference]] (the triage is a search over the topic space for the highest-ROI subset).
