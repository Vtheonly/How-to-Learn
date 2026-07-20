---
type: Roadmap
tags: [Roadmap]
created: 2026-07-20
updated: 2026-07-20
---

# R1 — The 12-Month Study Sequence

> A month-by-month plan that builds schemas vertically, horizontally, and through representative projects. Not "what to learn" — "in what order, with what method, against what test."

---

## The thesis

The research is clear: most self-directed learners fail not because they lack motivation, but because they sequence poorly. They try to learn everything to depth 2 (explanation), which feels like progress but produces zero transferable schema.

This sequence inverts that. It builds **3 schemas to depth 5+** in the first quarter, then expands breadth — because schema depth is what makes new domains cheap to enter.

## The shape of the year

| Quarter | Phase | Primary output | Schema focus |
|---------|-------|----------------|--------------|
| Q1 (months 1–3) | Foundations | Programming fluency + discrete math + 3 schemas | [[02_Schemas/S1 — State & Transition\|S1]], [[02_Schemas/S2 — Graph & Reachability\|S2]], [[02_Schemas/S9 — Representation & Transformation\|S9]] |
| Q2 (months 4–6) | Systems spine | OS + networking + databases + 3 schemas | [[02_Schemas/S5 — Information Flow\|S5]], [[02_Schemas/S6 — Memory & Locality\|S6]], [[02_Schemas/S7 — Concurrency & Coordination\|S7]] |
| Q3 (months 7–9) | Depth project | One substantial system built end-to-end | All schemas integrated through one project |
| Q4 (months 10–12) | Breadth & transfer | Distributed systems + ML foundations + adaptive-expertise work | [[02_Schemas/S4 — Optimization & Constraints\|S4]], [[02_Schemas/S8 — Probability & Uncertainty\|S8]], [[02_Schemas/S10 — Search & Inference\|S10]] |

## The non-negotiables for every month

Regardless of phase, every month includes:

- **Daily**: 60–120 minutes of focused study using the [[06_Templates/Daily Session|Daily Session template]]. Generative ratio ≥ 50%.
- **Daily**: 15 minutes of spaced-repetition review of `#sr` prompts.
- **Weekly**: [[04_Protocols/P8 — How to Run a Weekly Review|Weekly Review]] (Sunday, 45 min).
- **Monthly**: [[06_Templates/Monthly Retrospective|Monthly Retrospective]] — self-assess mastery levels against [[05_Roadmap/R3 — Mastery Rubric|R3]].

---

## Q1 — Foundations (months 1–3)

### Month 1 — Programming fluency + S1 State

**Goal**: Reach mastery level 4 (implementation) on the core of one language + on the state-machine schema.

**Content**:
- Pick one primary language (Python or Java recommended). Reach working fluency: data structures, control flow, basic OOP, file I/O, exceptions, testing.
- Read: a single concise book (e.g., *Fluent Python* chapters 1–8, or *Effective Java* chapters 1–6).
- Schemas: study [[02_Schemas/S1 — State & Transition|S1 State]] dossier. Implement: (a) a regex engine as NFA+DFA, (b) a TCP state machine simulator.

**Method**: [[03_Methods/M4 — Worked Examples|M4 Worked Examples]] for new language features; [[03_Methods/M8 — Generative Production|M8 Generative Production]] for the implementations.

**Test for advancement**: implement a regex engine from scratch in < 4 hours, from memory. If you cannot, repeat.

### Month 2 — Discrete math + S2 Graph

**Goal**: Reach level 4 on graph schemas and discrete math foundations.

**Content**:
- Discrete math: logic, sets, relations, induction, combinatorics, graph theory basics.
- Schemas: [[02_Schemas/S2 — Graph & Reachability|S2 Graph]] dossier. Implement: a build system with dependency resolution + cycle detection.
- Connect: every graph algorithm you learn, write the structural alignment with a different domain (e.g., BFS in a network routing context, BFS in a build system, BFS in a social graph).

**Method**: [[03_Methods/M3 — Interleaving|M3 Interleaving]] across graph problem types; [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] across domains.

**Test**: from a fresh problem statement, identify which graph algorithm fits AND implement it correctly within 1 hour.

### Month 3 — Linear algebra + S9 Representation

**Goal**: Reach level 3 (derivation) on linear algebra and level 4 on representation schemas.

**Content**:
- Linear algebra: vectors, matrices, eigenvalues, SVD, projections. Work through *Introduction to Linear Algebra* (Strang), chapters 1–7.
- Schemas: [[02_Schemas/S9 — Representation & Transformation|S9 Representation]] dossier. Implement: SVD-based image compression from scratch in NumPy.
- Connect: map each linear algebra operation to a CS use (matmul → transformer layer; projection → PCA; eigendecomposition → PageRank).

**Method**: [[03_Methods/M5 — Elaboration & Self-Explanation|M5 Self-Explanation]] on each proof; [[03_Methods/M1 — Retrieval Practice|M1 Retrieval]] on derivations.

**Test**: derive SVD from scratch on a whiteboard, including why A = UΣV^T.

---

## Q2 — Systems spine (months 4–6)

### Month 4 — Operating systems + S6 Memory + S5 Information Flow

**Goal**: Reach level 4 on OS concepts, memory schemas, and pipeline schemas.

**Content**:
- OS: processes, threads, scheduling, virtual memory, file systems, system calls. Use OSTEP (free online).
- Schemas: [[02_Schemas/S6 — Memory & Locality|S6 Memory]] (CPU cache, page cache, buffer pool) and [[02_Schemas/S5 — Information Flow|S5 Information Flow]] (CPU pipeline, syscall pipeline).
- Implement: a tiny shell with fork/exec/wait/pipes. A simple page-cache simulator.

**Method**: [[04_Protocols/P4 — How to Learn a New System|P4 Learn a System]] applied to Linux.

**Test**: trace a syscall from user space to kernel and back, explaining each layer.

### Month 5 — Networking + S1 deepening + S5 expansion

**Goal**: Reach level 4 on TCP/IP, HTTP, DNS, TLS.

**Content**:
- Networking: TCP/IP illustrated vol. 1 chapters 1–20; HTTP/1.1, HTTP/2, HTTP/3 overviews; DNS; TLS 1.3.
- Schemas: revisit [[02_Schemas/S1 — State & Transition|S1]] through TCP states; revisit [[02_Schemas/S5 — Information Flow|S5]] through the network stack.
- Implement: a TCP stack in userspace (skeleton), an HTTP/1.1 server from scratch.

**Method**: [[03_Methods/M6 — Analogical Comparison|M6]]: compare TCP state machine to lexer state machine to Markov chain.

**Test**: explain why TCP has TIME_WAIT, both in terms of the protocol state machine and in terms of failure modes.

### Month 6 — Databases + S6 deepening + S7 Concurrency intro

**Goal**: Reach level 4 on relational databases, indexes, transactions.

**Content**:
- Databases: SQL, relational algebra, indexes (B-tree, hash), query planning, transactions, MVCC, isolation levels. Use *Designing Data-Intensive Applications* (Kleppmann), chapters 1–7.
- Schemas: deepen [[02_Schemas/S6 — Memory & Locality|S6]] (buffer pool, write-ahead log) and [[02_Schemas/S3 — Tree & Hierarchy|S3]] (B+ tree). Introduce [[02_Schemas/S7 — Concurrency & Coordination|S7]] (transactions, locks, 2PL, MVCC).
- Implement: a key-value store with B+ tree index + write-ahead log + simple transactions.

**Method**: [[04_Protocols/P4 — How to Learn a New System|P4]] on PostgreSQL.

**Test**: explain MVCC vs 2PL on 5 dimensions, and trace a READ COMMITTED transaction's visibility rules.

---

## Q3 — Depth project (months 7–9)

### The shape of the project

Pick **one** project that integrates everything learned so far. The project should be large enough to require:
- Multiple schemas working together.
- A real implementation you maintain for > 1 month.
- Production-quality concerns: tests, performance, observability.

Three canonical choices (see [[05_Roadmap/R4 — Project-Based Learning Tracks|R4]] for detail):

1. **Systems path**: a distributed key-value store with replication, consensus (Raft), and a SQL-like query layer.
2. **AI path**: a transformer from scratch + training pipeline + inference engine, ending in a working LLM.
3. **Languages path**: a compiler for a typed programming language — lexer, parser, type checker, code generator, GC.

### Month 7 — Architecture and skeleton

- Read the canonical paper(s) for the chosen project.
- Write a 2-page design doc: components, data flow, failure modes.
- Implement the skeleton: modules compile, components wire together, no real logic yet.
- Method: [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] on the design.

### Month 8 — Core implementation

- Implement the hardest component first (consensus, attention, type checker).
- Use [[04_Protocols/P5 — How to Debug a System|P5 Debug]] for every bug.
- Write tests alongside implementation.

### Month 9 — Production hardening + reflection

- Add observability: metrics, logs, traces.
- Stress test, find the bottleneck, optimize.
- Write a 2-page retrospective: what schemas did this project deepen? Where did you misapply schemas? What failed?

---

## Q4 — Breadth & transfer (months 10–12)

### Month 10 — Distributed systems + S7 deepening

**Goal**: Level 4 on distributed systems concepts.

**Content**:
- Distributed systems: time/clocks, consistency models, consensus (Paxos, Raft, Byzantine), replication, partitioning, CRDTs. Use *Designing Data-Intensive Applications* chapters 5–12.
- Schemas: deepen [[02_Schemas/S7 — Concurrency & Coordination|S7]] to distributed setting.
- Implement: a simple Raft implementation from the paper.

**Method**: [[03_Methods/M6 — Analogical Comparison|M6]] — compare single-machine concurrency to distributed concurrency.

### Month 11 — ML foundations + S4 + S8

**Goal**: Level 4 on ML fundamentals.

**Content**:
- ML: linear/logistic regression, gradient descent, backprop, regularization, basic NN. Use *Deep Learning* (Goodfellow) chapters 4–6 or Andrew Ng's course.
- Schemas: [[02_Schemas/S4 — Optimization & Constraints|S4]] (gradient descent, convexity) and [[02_Schemas/S8 — Probability & Uncertainty|S8]] (Bayes, distributions).
- Implement: a neural network framework from scratch — autograd, layers, optimizer, training loop.

**Method**: [[03_Methods/M8 — Generative Production|M8]] — never use a library for the from-scratch implementations.

### Month 12 — Adaptive expertise consolidation

**Goal**: Convert the year's learning into adaptive (not routine) expertise.

**Content**:
- Pick a domain **deliberately outside** your Q3 project. If you built a distributed KV store, study computer vision basics. If you built a transformer, study OS scheduling.
- Apply the schemas you've built to the new domain. Write 3 schema dossiers updates showing transfer.
- Run a [[06_Templates/Monthly Retrospective|full retrospective]] of the year: which schemas are at level 5+? Which are still at 3? Make a 12-month plan for year 2.

---

## Tracking progress

Update this section monthly. For each schema, record the mastery level reached.

| Schema | End of Q1 | End of Q2 | End of Q3 | End of Q4 |
|--------|-----------|-----------|-----------|-----------|
| S1 State | 4 | 5 | 5 | 6 |
| S2 Graph | 4 | 5 | 5 | 6 |
| S3 Tree | 2 | 4 | 5 | 5 |
| S4 Optimization | 2 | 2 | 3 | 5 |
| S5 Info Flow | 2 | 4 | 5 | 5 |
| S6 Memory | 2 | 4 | 5 | 5 |
| S7 Concurrency | 2 | 3 | 4 | 5 |
| S8 Probability | 2 | 2 | 3 | 5 |
| S9 Representation | 4 | 4 | 5 | 6 |
| S10 Search | 3 | 3 | 4 | 5 |

These are realistic targets for a sustained 12-month effort. If you're below the targets, the issue is almost always **practice volume** or **generative ratio** — not aptitude.

---

## The honest constraint

This plan assumes ~15 hours/week of focused study (about 2 hours/day, 6 days/week, with weekly review). At 15 hours/week × 52 weeks = 780 hours, you will not reach senior level. You will reach **strong intermediate** — comparable to a 2–3 year junior engineer who studied deliberately.

The remaining distance to "senior" requires years of full-time, feedback-rich representative practice. There is no shortcut. The vault can compress the inefficient years; it cannot eliminate the necessary ones.

---

## Cross-links

- [[05_Roadmap/R2 — Three Pillars Curriculum|R2 Three Pillars Curriculum]] — what to study within each phase.
- [[05_Roadmap/R3 — Mastery Rubric|R3 Mastery Rubric]] — how to assess your level.
- [[05_Roadmap/R4 — Project-Based Learning Tracks|R4 Project Tracks]] — Q3 depth projects.
- [[05_Roadmap/R5 — The Dependency Graph of CS|R5 Dependency Graph]] — when to deviate from this plan.

## Retrieval queue

#sr
- For each quarter of the 12-month sequence, name the phase and the schemas focused on.
- Why does the sequence prioritize schema depth (3 schemas to level 5) in Q1 over breadth?
- What is the assumed weekly study volume, and what level does it realistically produce?
- Why is Q4 month 12 deliberately set outside your Q3 project domain?

---

> **Bottom line**: the 12-month plan is not a content list — it is a **schema-density schedule**. Every month should produce measurable growth in at least one schema's mastery level. If it doesn't, the issue is method, not content.
