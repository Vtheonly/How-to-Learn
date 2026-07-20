---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P8 — How to Run a Weekly Review

> The weekly review is the steering mechanism of the entire vault — every Sunday you re-read your week's daily logs, promote 3 concepts that "clicked," add `#sr` prompts for 3 that are still fuzzy, find 1-2 new schema links, run [[04_Protocols/P6 — How to Triage What to Ignore|P6]] for the coming week, update the Daily Dashboard, write a 1-paragraph retrospective, and set one target concept.

**When to use:** Every Sunday, 30-45 minutes. Pair with a beverage of your choice. Non-negotiable; the vault compounds only if the review runs.
**Inputs:** The week's 7 daily logs, the current Daily Dashboard, last week's review note, the candidate-topic list for next week.
**Outputs:** Updated mastery levels on 3+ concepts, new `#sr` prompts for 3+ fuzzy concepts, 1-2 new schema links, next week's triaged plan, a retrospective entry, one target concept for the week.
**Time:** 30-45 minutes weekly.

---

## Steps

### Step 1 — Re-read last week's daily logs (10 min)

Open each of the 7 daily logs from the past week. Skim, do not deep-read. For each log, capture in a scratch note:

- The single most important thing you studied that day.
- Any concept that surprised you or that you struggled with.
- Open questions or unresolved threads.
- Time spent (if you logged it; if you did not, start logging it).

The point is to refresh the week in working memory before judging it. Without re-reading, your judgment will be dominated by the most recent day; with re-reading, your judgment reflects the actual distribution of effort and outcomes. This is a deliberate priming act — see [[01_Theory/T2 — Cognitive Load Theory|T2]]: the refresh reduces extraneous load on the subsequent steps by surfacing the relevant context.

Concrete example — a week's logs reveal: Monday studied Paxos (deep, 90 min), Tuesday studied Rust async (deep, 60 min), Wednesday studied CRDTs (skim, 30 min), Thursday debugged a Kubernetes operator loop (P5, 2 hours), Friday read Raft paper (P1, 90 min), Saturday implemented a minimal regex engine for S1 (P7 Step 5, 3 hours), Sunday was rest. The week's distribution: 3 deep sessions (Paxos, Rust async, Raft), 1 debug session, 1 implementation session, 1 skim. Open threads: "still fuzzy on Paxos multi-instance vs. Multi-Paxos"; "Rust async: did not finish the minimal executor."

### Step 2 — Identify 3 concepts that clicked; promote their mastery level (5 min)

For each of 3 concepts where you noticed a real jump in understanding this week, promote the mastery level in the concept's note and in the Daily Dashboard. Mastery levels (see [[05_Roadmap/R3 — Mastery Rubric|R3]]):

- 0-awareness: I have heard of this.
- 1-recall: I can produce the definition from memory.
- 2-explanation: I can explain it in my own words.
- 3-derivation: I can derive it from first principles.
- 4-implementation: I can implement it from scratch.
- 5-transfer: I can apply it to a novel domain.

Promote by **one level** if your week's work moved you across a level boundary. Do not promote by two levels — the consolidation across weeks is what makes the level durable. Document the promotion in the concept's note: "Promoted 1 → 2 on 2026-07-20 after self-explaining Paxos safety in the Feynman pass."

Concrete example — promotions from the sample week:

- **Paxos safety** — promoted 1-recall → 2-explanation. The Feynman pass on Monday produced a clean explanation of why majority quorum + ballot ordering guarantees safety.
- **Regex NFA → DFA construction** — promoted 2-explanation → 3-derivation. The Saturday implementation forced derivation of Thompson's construction and subset construction; you can now derive them.
- **K8s reconciliation loop** — promoted 1-recall → 2-explanation. The Thursday debugging session forced explanation of why level-triggered (not edge-triggered) control is robust to message loss.

### Step 3 — Identify 3 concepts still fuzzy; add `#sr` prompts (10 min)

For each of 3 concepts where you noticed continued fuzziness, write 2-3 `#sr` prompts targeting the specific gap. The prompts should be at a mastery level one above your current level (the "frontier"), not at your comfort level. Tag every prompt `#sr`; the SR plugin will schedule them.

Concrete example — fuzzy concepts from the sample week:

1. **Paxos multi-instance vs. Multi-Paxos** (currently 2-explanation; target 3-derivation). Prompts:
   - "Derive the difference between running N independent Paxos instances and running Multi-Paxos with a stable leader. What does the stable leader collapse?"
   - "In Multi-Paxos, after the first Prepare/Promise round, subsequent Propose rounds skip Prepare. Justify why safety is preserved."
2. **Rust async: minimal executor** (currently 1-recall; target 2-explanation). Prompts:
   - "Explain the difference between a `Future`, a `Task`, and an `Executor` in Rust async. Why does `Future` require pinning?"
   - "Sketch a 50-line single-threaded executor that polls a queue of tasks. Where does the `Waker` get stored, and how does it re-enqueue a task?"
3. **Raft log commitment rule** (currently 1-recall; target 2-explanation). Prompts:
   - "Why does Raft require the leader to replicate a current-term entry on a majority before committing prior-term entries? Cite Figure 8 from Ongaro & Ousterhout (2014)."
   - "Describe the scenario in which a prior-term entry could be committed and then rolled back if Raft did not have this rule."

The fuzzy-concept prompts are the highest-ROI output of the review. They target exactly your frontier; the SR queue will surface them over the coming weeks; the gaps will close not by re-reading but by spaced retrieval. See [[03_Methods/M1 — Retrieval Practice|M1]] and [[03_Methods/M2 — Spaced Repetition|M2]].

### Step 4 — Find 1-2 new schema links between this week's concepts and old ones (5-10 min)

This is the most important step for long-term learning. Look at the concepts you studied this week and ask: **which of these connects to a schema or concept I already have?** Write the link as an explicit wikilink in both notes (the new concept and the old one).

Schema links compound. Each new link strengthens the network; a concept with 5 links is more retrievable than one with 1, because any of the 5 cues can retrieve it. See [[01_Theory/T4 — Long-Term Working Memory|T4]]: expert knowledge is a richly connected network, not a list of facts. The weekly review is where the network gets built.

Concrete example — schema links from the sample week:

1. **Paxos safety ↔ K8s reconciliation loop** (both instantiate [[02_Schemas/S1 — State & Transition|S1]]). The link: both are closed-loop convergence systems where a controller drives actual state toward desired state through a sequence of messages, with safety depending on quorum overlap (Paxos) or level-triggered re-reconcile (K8s). The shared schema is "convergence under message loss"; the surface differences (ballot numbers vs. resource versions) are noise. Add this link to both notes.
2. **Rust async ↔ S1 (event loop)** and **Rust async ↔ S7 (concurrency)**. The Rust async runtime is a single-threaded event loop (S1) that coordinates multiple tasks without shared-state races (S7). The link makes Rust async an instance of two schemas simultaneously, which sharpens both. Add to both the Rust async note and the S1/S7 dossiers' canonical instances tables.
3. **Regex NFA → DFA ↔ S1** (already in S1's dossier; reaffirm). The Saturday implementation confirmed the existing link; no new dossier entry, but the personal implementation counts as evidence the schema is robust.

### Step 5 — Run P6 triage for next week (10 min)

Apply [[04_Protocols/P6 — How to Triage What to Ignore|P6]] to the candidate-topic list for next week. The triage produces the deep-study queue (2 topics), the skim queue (5 topics), and the defer/ignore decisions for the rest.

Concrete example — next week's triage:

| Topic | P | R | T | Score | Decision |
|-------|---|---|---|-------|----------|
| Paxos Multi-Paxos (continue) | 5 | 4 | 5 | 100 | Deep |
| Rust async: minimal executor (continue) | 4 | 4 | 4 | 64 | Deep |
| CRDTs (skim) | 3 | 3 | 5 | 45 | Skim |
| Raft log commitment (continue) | 4 | 3 | 4 | 48 | Skim |
| TLA+ for the K8s operator design | 3 | 3 | 4 | 36 | Skim |
| WebAssembly (deferred last quarter) | 2 | 1 | 2 | 4 | Ignore |

The 2 deep topics continue threads from this week (Paxos, Rust async); the skim topics include the fuzzy-concept follow-up (Raft log commitment) and a new exploration (TLA+). WebAssembly stays ignored until a triggering project arises.

### Step 6 — Update the Daily Dashboard (5 min)

Open the [[00_MOCs/Daily Dashboard|Daily Dashboard]] and update:

- **Current deep topics** — the 2 from Step 5.
- **Current skim topics** — the 5 from Step 5.
- **Frontier prompts** — the `#sr` prompts from Step 3, surfaced at the top of the dashboard.
- **Target concept for the week** — see Step 8.
- **Open threads** — unresolved questions from Step 1, with a deadline for resolution.

The Daily Dashboard is the entry point for every study session; if it is stale, every session starts with confusion about what to do. The review's job is to leave the dashboard in a state where next Monday's session opens cleanly.

### Step 7 — Write a 1-paragraph retrospective (5 min)

Write one paragraph answering three questions:

1. **What worked** — which study activities produced durable learning this week?
2. **What didn't** — which activities produced little or shallow learning?
3. **What will you change** — one concrete adjustment for next week.

The retrospective is not a diary; it is a feedback loop. Without it, you repeat the same ineffective activities week after week. With it, your study practice improves iteratively — see [[01_Theory/T3 — Deliberate Practice|T3]] §2 (deliberate practice includes feedback on the practice itself, not just the performance).

Concrete example — a retrospective:

> This week's highest-ROI activity was the Saturday regex implementation (P7 Step 5): forcing myself to implement Thompson's construction and subset construction from scratch surfaced three gaps I would not have found by reading. The lowest-ROI was the Wednesday CRDTs skim — I read the paper passively and produced no summary, no schema link, and no `#sr` prompts; it will not survive a week. Next week: enforce P1's 1-page summary even on skim topics; if a skim does not produce a summary, it does not count as a skim.

### Step 8 — Set one target concept for next week (2 min)

Choose **one** concept that will be the focus of next week. Write it at the top of the Daily Dashboard as "This week's target: <concept>." The target is the single concept you will, by next Sunday, be able to explain in a Feynman pass without notes.

The single target matters because it forces prioritization. Without it, the 2 deep topics and 5 skim topics diffuse your attention; with it, the target anchors the week and the other topics are supporting context. The target concept is also the one whose mastery promotion you will judge next Sunday — closing the loop.

Concrete example — next week's target: "Multi-Paxos — be able to derive the difference between N independent Paxos instances and Multi-Paxos with a stable leader, in a Feynman pass, without notes, by next Sunday."

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Skipping the review | Mastery levels drift; `#sr` queue grows stale; dashboard rots. | Schedule Sunday review as a recurring event; pair with M7 (implementation intentions). |
| Not promoting mastery levels | Concepts studied but never moved up; the dashboard always shows the same levels. | Step 2 requires explicit promotion; document the level and the reason. |
| Not linking to schemas | Each concept is an island; retrieval is hard; transfer fails. | Step 4 requires 1-2 new schema links per week; the network compounds only if links are written. |
| Vague retrospective | "Good week, learned a lot" — no actionable feedback. | Step 7 requires three specific answers (worked / didn't / change); vague is not acceptable. |
| No target concept for next week | Attention diffuses across 7 topics; nothing reaches mastery. | Step 8 requires one named target; the target anchors the week. |
| Re-litigating the triage mid-week | You abandon the 2 deep topics for a shiny new one. | P6's decisions are not re-litigated weekly; shiny topics enter next week's triage, not this week's plan. |
| Fuzzy-concept prompts too easy | The `#sr` queue fills with prompts you can already answer. | Step 3 requires prompts at the frontier (one level above current); easy prompts waste SR slots. |
| No fuzzy-concept prompts at all | The queue has nothing to surface; gaps stay gaps. | Step 3 requires 3 fuzzy concepts with 2-3 prompts each; non-negotiable. |
| Dashboard not updated | Monday's session opens with "what was I doing?" | Step 6 leaves the dashboard in a state where Monday opens cleanly. |
| Treating the review as a checkbox | 10-minute drive-by; no depth; no schema links; no retrospective. | The 30-45 minute budget exists because depth is the point; a 10-minute review is worse than none. |
| Promoting by 2 levels | Mastery inflation; the level no longer reflects reality. | Promote by one level only; consolidation across weeks is what makes the level durable. |

## Linked methods

- [[03_Methods/M2 — Spaced Repetition|M2]] — Step 3's `#sr` prompts feed the SR queue.
- [[03_Methods/M9 — Concept Mapping|M9]] — Step 4's schema links are concept-map edges.
- [[03_Methods/M10 — Strategic Triage|M10]] — Step 5 runs P6 (the operational playbook for M10).
- [[03_Methods/M1 — Retrieval Practice|M1]] — Step 3's prompts are cued retrieval at the frontier.
- [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] — Step 7's retrospective forces self-explanation of the practice itself.
- [[03_Methods/M7 — Implementation Intentions|M7]] — pair the review with an if-then plan: "When Sunday 7pm arrives, I will open the dashboard and run P8."

## Linked theory

- [[01_Theory/T3 — Deliberate Practice|T3]] — Step 7's retrospective is feedback on the practice itself; deliberate practice requires it.
- [[01_Theory/T4 — Long-Term Working Memory|T4]] — Step 4's schema links build the LT-WM network that makes expert retrieval fast.
- [[01_Theory/T1 — Schema Transfer|T1]] — Step 4 is the engine of transfer; without weekly link-building, schemas do not generalize.
- [[01_Theory/T6 — Desirable Difficulties|T6]] — Step 3's frontier prompts are desirable difficulties; easy prompts would not produce growth.
- [[01_Theory/T8 — Adaptive Expertise|T8]] — the review's feedback loop is what produces adaptive, not routine, expertise.
- [[01_Theory/T2 — Cognitive Load Theory|T2]] — Step 1's re-read primes the context, reducing extraneous load on the subsequent judgment steps.

## Worked example

It is Sunday, 7pm. You open the dashboard; last week's logs are linked at the top.

- **Step 1 (10 min)** — re-read 7 daily logs. Scratch note captures: Mon Paxos (90 min deep), Tue Rust async (60 min deep), Wed CRDTs (30 min skim, no summary), Thu K8s operator bug (2 hr P5), Fri Raft paper (90 min P1), Sat regex engine implementation (3 hr P7 Step 5), Sun rest. Open threads: "Multi-Paxos vs N independent instances"; "Rust async: minimal executor not finished"; "Raft Figure 8 not fully traced."
- **Step 2 (5 min)** — promote 3 concepts. Paxos safety 1→2 (Feynman pass succeeded). Regex NFA→DFA 2→3 (implementation forced derivation). K8s reconciliation loop 1→2 (debugging forced explanation of level-triggered control). Update each concept's note with date and reason.
- **Step 3 (10 min)** — 3 fuzzy concepts, 2-3 prompts each:
  1. Multi-Paxos (currently 2; target 3): "Derive the difference between N independent Paxos instances and Multi-Paxos with a stable leader. What does the stable leader collapse?" "After the first Prepare/Promise round, subsequent Propose rounds skip Prepare. Justify why safety is preserved."
  2. Rust async minimal executor (currently 1; target 2): "Explain the difference between a `Future`, a `Task`, and an `Executor`. Why does `Future` require pinning?" "Sketch a 50-line single-threaded executor. Where does the `Waker` get stored?"
  3. Raft log commitment (currently 1; target 2): "Why does Raft require a current-term entry replicated on a majority before committing prior-term entries? Cite Figure 8." "Describe the rollback scenario if the rule were absent."
- **Step 4 (8 min)** — 2 new schema links:
  1. Paxos safety ↔ K8s reconciliation (both S1: closed-loop convergence under message loss; quorum overlap vs. level-triggered re-reconcile are surface differences). Add wikilinks in both notes; add a row to S1's dossier canonical instances.
  2. Rust async runtime ↔ S1 (event loop) and S7 (single-threaded coordination). Add Rust async as a canonical instance in S1 and S7 dossiers.
- **Step 5 (10 min)** — run P6 for next week. Top 2 deep: continue Paxos → Multi-Paxos, continue Rust async → finish minimal executor. Skim: CRDTs (re-do, with summary this time), Raft Figure 8 deep-dive, TLA+ for the K8s operator. Defer: eBPF, differential dataflow. Ignore: WebAssembly, Lean 4 (carried over).
- **Step 6 (5 min)** — update Daily Dashboard: deep topics = Multi-Paxos + Rust async executor; skim = CRDTs + Raft Fig 8 + TLA+; frontier prompts = the 6 from Step 3; target concept = "Multi-Paxos"; open threads = the 3 from Step 1 with deadlines.
- **Step 7 (5 min)** — retrospective: "Saturday's regex implementation was the week's highest-ROI activity — it surfaced 3 gaps I would not have found by reading. Wednesday's CRDTs skim was the lowest — I read passively, produced no summary, no schema link, no `#sr` prompts; it will not survive a week. Change for next week: enforce P1's 1-page summary even on skim topics; a skim without a summary does not count as a skim."
- **Step 8 (2 min)** — target concept: "Multi-Paxos — be able to derive the difference between N independent Paxos instances and Multi-Paxos with a stable leader, in a Feynman pass, without notes, by next Sunday."

Total time: 45 minutes. The week is closed: mastery levels updated, 6 frontier prompts in the SR queue, 2 new schema links strengthening the network, next week's plan triaged, dashboard fresh for Monday morning, a written retrospective closing the feedback loop, and one named target anchoring the week. Without P8, the same week would have produced learning that decays within a month; with P8, the learning consolidates and the practice improves iteratively.

## Retrieval queue

#sr
- List the eight steps of P8 in order. Which step is described as "most important for long-term learning," and why?
- Step 2 asks you to promote mastery levels by one only, never two. Justify this rule using T3 (deliberate practice) and the role of consolidation across weeks.
- Step 4 (schema links) is described as the engine of T4 (LT-WM). Explain why a concept with 5 schema links is more retrievable than one with 1, and how the weekly review compounds this.
- Step 7 (retrospective) is mandatory and must answer three specific questions. Why is "good week, learned a lot" not acceptable, and which theory justifies the requirement?
- You skip the review for 3 weeks. Trace the specific downstream failures: dashboard rot, SR queue staleness, schema-link debt, mastery-level drift. Which failure is most damaging, and why?

---

## Cross-links

- Related protocols: [[04_Protocols/P6 — How to Triage What to Ignore|P6 Triage]] (Step 5 runs P6 for next week), [[04_Protocols/P1 — How to Read a Research Paper|P1 Read Paper]] (papers studied feed the review), [[04_Protocols/P5 — How to Debug a System|P5 Debug]] (debugging sessions feed the review), [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]] (schema links from Step 4 may seed new dossiers).
- Related schemas: [[02_Schemas/S1 — State & Transition|S1]] — the weekly review is itself a state machine (weekly state → reviewed state → next week's plan state), with the dashboard as the persistent state store.
