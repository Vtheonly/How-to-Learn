---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P1 — How to Read a Research Paper

> A research paper is not a novel — you read it in five passes of increasing depth, stopping early if it does not deserve the next pass, and ending with a schema-extraction that links the paper to the rest of your vault.

**When to use:** Any time you open a CS research paper, technical report, or RFC for the first time. Also when re-reading a paper you read passively years ago and never encoded.
**Inputs:** A paper (PDF), 2 hours of uninterrupted focus, a blank note file, your existing schema dossiers ([[02_Schemas/S1 — State & Transition|S1]] through [[02_Schemas/S10 — Search & Inference|S10]]).
**Outputs:** A 1-page structured summary, a schema dossier update (or a new dossier if the paper introduces a novel schema), 3+ `#sr` retrieval prompts, an explicit decision (archive / re-read / cite / implement).
**Time:** 2 hours total for a paper worth reading deeply; 5-30 minutes for a paper you triage out.

---

## Steps

### Step 1 — Pass 1: orientation triage (5 min)

Read **only** the title, abstract, introduction, section headings, every figure/table caption, and the conclusion. Do not read the body. Do not read the math. Decide in writing at the bottom of your note file:

- **Category** (Keshav's five): (a) survey/tutorial, (b) systems paper, (c) theory paper, (d) measurement/empirical, (e) position/vision.
- **One-sentence claim** in your own words. If you cannot produce this sentence, the abstract was vague and the paper is suspect.
- **Decision:** continue to Pass 2, skim only, or abandon. Most papers stop here. Keshav estimates a well-trained reader rejects ~70% of papers at Pass 1.

Concrete example — reading *MapReduce: Simplified Data Processing on Large Clusters* (Dean & Ghemawat, 2004): the abstract says "a programming model and associated implementation for processing and generating large data sets." Your one-sentence claim: "Users write a `map` and a `reduce`; the runtime parallelizes, handles failures, and scales to thousands of machines." Category: systems. Decision: continue.

This step is a triage act — see [[03_Methods/M10 — Strategic Triage|M10]]. The point is to refuse deep work on a paper that has not earned it.

### Step 2 — Pass 2: grasp the claim, skip the math (30 min)

Read the full paper **excluding** proofs, derivations, and unfamiliar math. Read for the **what** and **why**, not the **how-detailed**. Mark every term you do not know with a `?` in the margin but **do not** look it up mid-pass; looking it up breaks the coherence of your reading and trains distraction. Capture in your note:

- The **problem** the paper attacks (1 sentence).
- The **approach** in 3 bullets.
- The **evaluation**: what workload, what metrics, what baselines, what headline result.
- The **assumptions and scope**: every paper smuggles in assumptions; the introduction and evaluation sections reveal them. List at least 2.

Concrete example — reading *The Google File System* (Ghemawat, Gobioff & Leung, 2003): Problem = persistent storage for multi-GB files on commodity hardware that fails constantly. Approach = (a) files are immutable once written, (b) chunk size 64 MB to reduce metadata, (c) single master with chunk-server slaves, (d) lease-based mutation with primary replica ordering. Evaluation = microbenchmarks on a 16-node cluster, sustained read/write throughput, recovery time after node failure. Assumptions = (1) workloads are dominated by appends, not random writes; (2) component failure is the norm, not the exception.

This step loads the paper's relational structure into working memory. The 30-minute time box forces you to skim proof-heavy sections; you will return to them in Pass 3. Tying this to [[03_Methods/M5 — Elaboration & Self-Explanation|M5]]: after the pass, write one self-explanation paragraph — "The authors chose X because Y." If you cannot complete the "because," you did not grasp the design rationale.

### Step 3 — Pass 3: deep read with math, mark unknowns (60-90 min)

Re-read in full. This time **read every proof, every algorithm, every equation**. For each piece of math:

- Restate the **claim** in one sentence in your own words.
- Identify the **key insight** that makes the proof work (not the line-by-line derivation; the load-bearing idea).
- Identify the **assumption** the proof makes that is most likely to be violated in practice.
- Mark every term, lemma, or technique you cannot produce from memory with `??` and add it to a "to learn" list. **Do not pursue it now** — you are inside a generative task, and switching kills encoding (see [[01_Theory/T2 — Cognitive Load Theory|T2]]).

Concrete example — reading *Paxos Made Simple* (Lamport, 2001): the proof of safety rests on the ballot-number ordering and the rule that a proposer in phase 2 must adopt the highest-accepted value from its promise quorum. Restate: "Two proposers cannot both reach quorum on different values, because any two quorums overlap, and the proposer who reaches quorum second sees the value chosen first." Key insight: **quorum overlap + ballot ordering together guarantee safety**. Assumption most likely violated: the proposer correctly learns the highest-accepted value among **its** promise quorum — if the implementation forgets this, safety silently breaks. Mark `??` on the distinction between "highest ballot number seen" and "highest ballot number accepted" — these are different and conflating them is the canonical Paxos implementation bug.

This step is the deliberate-practice core of the protocol (see [[01_Theory/T3 — Deliberate Practice|T3]]): it is effortful, it is at the edge of your competence, and it produces a gap list that drives subsequent study. The 60-90 minute budget exists because beyond that, working memory saturates and you start reading words without encoding them.

### Step 4 — Pass 4: critical read — weaknesses, related work, assumptions (30 min)

Now attack the paper. Read with hostile intent. For each section, ask:

- **What claim is least well-supported?** Find the weakest result and state why.
- **What experiment would falsify the central claim?** Write it down. If you cannot design one, you have not understood the claim.
- **What assumption is most load-bearing?** If it fails, the paper falls.
- **What related work is most threatening?** Read the related-work section as a graph: who would the authors most not want to be cited alongside them, and why?

Concrete example — *Dynamo: Amazon's Highly Available Key-value Store* (DeCandia et al., 2007): the central consistency claim is "eventually consistent, always writeable." The least-supported claim is the "usually less than 1 second" consistency-window figure, which is measured on a specific production workload and is unlikely to generalize. A falsifying experiment: a workload with heavy write contention on a single key under network partitions — the consistency window should blow up. The load-bearing assumption is that the application tolerates stale reads; remove that and the system is unsafe for its own benchmark. The most threatening related work is Bayou, which anticipated the write-anywhere design but at smaller scale.

This step operationalizes [[01_Theory/T8 — Adaptive Expertise|T8]]: the adaptive expert knows not just how to use a result but where it breaks. A paper read without a critical pass becomes a slogan ("Dynamo proves eventual consistency is fine") rather than a calibrated belief ("Dynamo proves eventual consistency is fine for shopping carts").

### Step 5 — Pass 5: schema extraction (20 min)

This is the step that distinguishes a vault reader from a passive reader. Ask: **which of [[02_Schemas/S1 — State & Transition|S1]]–[[02_Schemas/S10 — Search & Inference|S10]] does this paper instantiate?** Most CS papers instantiate one primary schema and one or two secondary schemas. Identify them with evidence:

| Schema | Instantiated by (evidence from the paper) |
|--------|--------------------------------------------|
| S1 State & Transition | The Dynamo coordinator's read/write state machine |
| S7 Concurrency & Coordination | Sloppy quorums + vector clocks + read-repair |
| S6 Memory & Locality | Consistent hashing for partition placement |

For each identified schema, decide:

- Does the paper **confirm** the dossier's existing instance list? Add a one-line entry to the dossier's "Canonical instances" table with a wikilink to your summary.
- Does the paper **challenge** the dossier's contrastive cases or invariants? Open the dossier and add a note; this is how dossiers evolve.
- Does the paper introduce a **new schema** not yet in the vault? Open a stub in `02_Schemas/` and schedule a [[04_Protocols/P7 — How to Build a Schema Dossier|P7]] build for when you have 3+ instances.

Concrete example — reading *The Raft Paper* (Ongaro & Ousterhout, 2014): primary schema is S1 (state machine with leader/follower/candidate roles). Secondary schemas: S7 (consensus via majority quorum and log replication), S5 (information flow from leader to followers, unidirectional). The paper **confirms** S1's "closed-loop convergence" pattern but adds a new canonical instance (Raft's randomized election timeout) — append to S1's dossier. The paper also introduces a contrastive case for S7: Raft vs. Paxos differ on the **strong-leader** axis, which S7's dossier should record.

This step is the engine of [[01_Theory/T1 — Schema Transfer|T1]]. Without it, every paper is a unique snowflake; with it, your tenth consensus paper takes 30 minutes instead of 2 hours because you recognize the schema.

### Step 6 — Write the 1-page summary (10 min)

Close the paper. From memory, write a 1-page summary with this fixed structure:

```
# <Paper title> (<authors>, <year>)
## Claim (1 sentence)
## Problem (3 bullets)
## Approach (5 bullets)
## Evaluation (3 bullets: workload / baselines / headline result)
## Assumptions (2 bullets)
## Weaknesses (2 bullets)
## Schema links (table from Step 5)
## Decision (archive / re-read / cite / implement)
## Open questions (1-3 bullets, for follow-up)
```

Open the paper and verify. Mark each section green/yellow/red against the source. Any yellow or red becomes a retrieval prompt. This is free recall, the strongest retrieval format — see [[03_Methods/M1 — Retrieval Practice|M1]] §2 and [[01_Theory/T6 — Desirable Difficulties|T6]].

### Step 7 — Write 3+ retrieval prompts (5 min)

Write at least three `#sr` prompts targeting different mastery levels:

- **Recall** — "Name the three components of MapReduce's runtime and one responsibility of each."
- **Explain** — "Why does GFS use a 64 MB chunk size, and what workload assumption makes that choice correct?"
- **Derive / Diagnose** — "A Paxos implementation commits an entry from a previous term without first replicating a current-term entry on a majority. Describe the precise scenario in which this violates safety, and cite the figure from Ongaro & Ousterhout (2014) that demonstrates it."
- **Transfer** — "MapReduce and Kubernetes both run user code on a cluster. Which schemas (S1–S10) do they share, and which differ? Justify by mapping components."

Tag every prompt `#sr`. The Spaced Repetition plugin will surface them over the coming weeks. Schedule the first retrieval for tomorrow morning, the second for one week, the third for one month. Without scheduling, the paper will decay to recognition within a week.

### Step 8 — Decide and file (5 min)

Decide explicitly:

- **Archive** — paper read, summary written, never need to re-open. Move note to `07_Archive/`.
- **Re-read** — paper too dense for one pass; schedule a second Pass 3 in 2 weeks.
- **Cite** — paper is load-bearing for an upcoming project; add to the project's reading list and a `#cite` tag.
- **Implement** — paper deserves a minimal reimplementation; spin off a [[04_Protocols/P4 — How to Learn a New System|P4]]-style task and a project note.

Record the decision in the note's front matter as `status: archive | re-read | cite | implement`. A paper without a decision is a paper that will haunt your reading list forever.

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Reading linearly top to bottom | You finish the paper exhausted and cannot state the claim. | Run the passes in order; stop after Pass 1 if the paper has not earned Pass 2. |
| Not taking notes | A week later you remember only the title. | The 1-page summary in Step 6 is non-negotiable; a paper read without a summary is a paper not read. |
| Getting stuck on the first unknown | You spend 45 minutes on a definition and never finish the section. | Mark `??`, defer to the "to learn" list, keep moving; pursue unknowns only after the pass. |
| Passive reading | You "read" the paper but cannot answer any retrieval prompt. | End every pass with a free-recall block (Step 6); the discomfort of failed recall is the signal. |
| No follow-up retrieval | The paper decays to recognition within a week. | Step 7 must produce `#sr` prompts scheduled in the spaced-repetition queue. |
| Reading every paper deeply | Your reading list grows faster than your understanding. | Apply M10 triage at Pass 1; reject ~70% of papers. |
| Skipping the schema extraction | Paper becomes a unique snowflake; no transfer. | Step 5 is the highest-ROI step; a paper without schema links does not strengthen the vault. |
| Treating the abstract as the claim | You cite the abstract's framing as if it were the result. | The abstract sells; the evaluation delivers. Always derive the claim from the evaluation, not the abstract. |
| Skipping related work | You miss that the paper is a refinement of a prior result. | Read related work as a graph (Step 4); identify the most threatening prior work. |
| No decision recorded | The paper sits in your reading list "to finish later." | Step 8 forces an explicit `status:` field; no paper exits the protocol without one. |
| Citing without reading the evaluation | You cite the paper's headline result based on the abstract. | The abstract sells; the evaluation delivers. Never cite a result you cannot trace to a figure or table. |
| Hoarding "to-read" papers | Your reading list grows faster than your reading; every paper is guilt. | Apply P6 to the reading list itself: most papers are triaged out at Pass 1; only the top 2 per week earn a full P1 run. |
| Re-reading instead of retrieving | You re-open the paper when you forget a detail, refreshing recognition not recall. | Once P1 is complete, future refresh uses the `#sr` prompts (Step 7), not the paper; re-reading is a last resort, not a default. |
| Skipping Pass 1 triage on "important" papers | You dive into Pass 3 on a paper you "have to read," burn out, and never finish. | Pass 1 applies to every paper, including ones assigned for class or work; the 5-minute orientation prevents the 3-hour misinvestment. |

## Linked methods

- [[03_Methods/M10 — Strategic Triage|M10]] — Pass 1 is a triage act: reject papers that have not earned the next pass.
- [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] — Pass 2 ends with a "because" paragraph on design rationale.
- [[03_Methods/M4 — Worked Examples|M4]] — Pass 3 traces every proof as a worked example.
- [[03_Methods/M1 — Retrieval Practice|M1]] — Step 6 is free recall; Step 7 schedules cued retrieval.
- [[03_Methods/M9 — Concept Mapping|M9]] — Step 5 maps the paper onto the schema graph.
- [[03_Methods/M2 — Spaced Repetition|M2]] — Step 7 schedules prompts across days and weeks.

## Linked theory

- [[01_Theory/T1 — Schema Transfer|T1]] — Step 5 is the engine of transfer; without it papers do not generalize.
- [[01_Theory/T2 — Cognitive Load Theory|T2]] — Pass 3's "mark unknowns, do not pursue" rule protects working memory.
- [[01_Theory/T3 — Deliberate Practice|T3]] — Pass 3 is effortful, at the edge of competence, gap-producing.
- [[01_Theory/T6 — Desirable Difficulties|T6]] — Step 6's free recall is the canonical desirable difficulty.
- [[01_Theory/T8 — Adaptive Expertise|T8]] — Pass 4's critical reading produces adaptive, not routine, expertise.

## Worked example

You open *Spark: Cluster Computing with Working Sets* (Zaharia et al., 2010), having never read it.

- **Pass 1 (5 min)** — title + abstract + intro + figures + conclusion. One-sentence claim: "RDDs are an immutable, partitioned, in-memory dataset abstraction that lets Spark recover from faults by recomputing lost partitions from lineage, not by replication." Category: systems. Decision: continue — the claim is sharp and the abstraction is novel to you.
- **Pass 2 (30 min)** — read body, skip the formal RDD semantics in §3.2 for now. Problem: iterative ML workloads on Hadoop MapReduce pay disk I/O between iterations. Approach: (a) RDDs as the abstraction, (b) lineage graph as the fault-recovery mechanism, (c) lazy transformations, (d) in-memory caching via `persist()`. Evaluation: logistic regression and k-means on 100 GB, comparison to Hadoop. Assumptions: (1) working sets fit in aggregate cluster RAM; (2) transformations are deterministic (otherwise lineage recomputation produces different results).
- **Pass 3 (75 min)** — re-read §3.2 with the math. The key insight is that an RDD's lineage graph is a DAG of transformations; fault tolerance comes from *recomputation*, not replication. The assumption most likely violated in practice: transformation determinism — if a transformation reads from an external mutable source (a database, a clock), lineage recomputation produces different results and the system is silently unsound. Mark `??` on narrow vs. wide dependencies; defer to "to learn."
- **Pass 4 (30 min)** — critical read. Weakest claim: "Spark is up to 100x faster than Hadoop" — measured only on workloads where the working set fits in RAM, which is precisely the workload Spark is designed for. A falsifying experiment: a working set 2x cluster RAM, comparing Spark (spilling to disk) to Hadoop. Most load-bearing assumption: deterministic transformations. Most threatening related work: Twister (which anticipated iterative MapReduce but at smaller scale) and HaLoop (which added iteration awareness to Hadoop without the RDD abstraction).
- **Pass 5 (20 min)** — schema extraction. Primary schema: S9 (representation & transformation) — RDDs are a representation; transformations are pure functions on the representation. Secondary: S2 (graph & reachability) — lineage is a DAG; reachability from lost partitions to source data drives recovery. S6 (memory & locality) — partition placement, in-memory caching, cache-aware scheduling. Add a row to S9's dossier ("Spark RDD: immutable, partitioned, lineage-traced dataset; transformations are pure; recovery via recomputation"). Add a row to S6's dossier noting the cache vs. recompute tradeoff.
- **Step 6 (10 min)** — close the paper, write the 1-page summary from memory; reopen and verify. Two yellows: you forgot the distinction between narrow and wide dependencies, and you forgot the broadcast variables feature. Both become `#sr` prompts.
- **Step 7 (5 min)** — write 4 `#sr` prompts at recall/explain/derive/transfer levels.
- **Step 8 (2 min)** — decision: **implement**. Spark's RDD abstraction deserves a minimal reimplementation (a 200-line Python RDD with `map`, `filter`, `reduce`, lineage, and fault recovery by recomputation). Spin off a project note; schedule the reimplementation for next week.

Total time: ~3 hours. The paper is now durable: a 1-page summary in your vault, 4 retrieval prompts in the SR queue, two schema dossier updates, a project note for the reimplementation, and a clear decision. Without P1, the same 3 hours would have produced a vague memory and a browser tab you never re-open.

## Retrieval queue

#sr
- List the five passes of P1 and the time budget for each. What is the decision criterion at the end of Pass 1?
- Why does the protocol forbid pursuing unknowns mid-pass? Which theory justifies this, and what is the failure mode if you violate it?
- Describe the 1-page summary template (Step 6) from memory. Why must the summary be written with the paper closed?
- Step 5 (schema extraction) is described as the highest-ROI step. Justify this claim using T1 (schema transfer) and the cost of reading without it.
- Design a falsifying experiment for a paper of your choice using only the four critical questions in Pass 4. Which question is hardest to answer, and why?

---

## Cross-links

- Related protocols: [[04_Protocols/P2 — How to Read Source Code|P2 Read Source]] (paper's reference implementation is the natural follow-on), [[04_Protocols/P4 — How to Learn a New System|P4 Learn System]] (the canonical paper is often Step 5 of P4), [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]] (Step 5's schema links feed P7).
- Related schemas: [[02_Schemas/S1 — State & Transition|S1]], [[02_Schemas/S2 — Graph & Reachability|S2]], [[02_Schemas/S5 — Information Flow|S5]], [[02_Schemas/S7 — Concurrency & Coordination|S7]], [[02_Schemas/S10 — Search & Inference|S10]] — the schemas most often instantiated by CS papers.
