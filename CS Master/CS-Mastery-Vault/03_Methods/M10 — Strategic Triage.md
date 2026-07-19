---
type: Method
tags: [Method]
created: 2026-07-20
updated: 2026-07-20
evidence: Indirect
mastery: 2-explanation
---

# M10 — Strategic Triage

> Decide what to learn deeply, what to skim, what to defer, and what to ignore. You cannot learn everything; trying to is the largest single source of wasted effort.

**Evidence rating:** ★★★
**Targets:** Avoiding cognitive overload; allocating finite study time to high-leverage material; resisting the temptation to learn "just in case."
**Primary theory:** [[01_Theory/T2 — Cognitive Load Theory|T2 CLT]]

---

## 1. The method

Strategic triage is the weekly practice of deciding, for every candidate learning target, whether to (a) learn it deeply now, (b) skim it now to map the territory, (c) defer it until a triggering need, or (d) ignore it permanently. The decisions are made **explicitly**, written down, and reviewed. Without this, the default is to attempt (a) for everything, which produces cognitive overload and shallow coverage of everything (see [[01_Theory/T2 — Cognitive Load Theory|T2]]).

The procedure is a weekly one-hour session. List every topic currently competing for study time — including new topics you've heard about, old topics you feel guilty for not finishing, and ambient "I should learn X" items. For each, score three dimensions on a 1–3 scale:

1. **Prerequisite centrality** — how many other things depend on this? (3 = many future topics require it; 1 = standalone.)
2. **Project relevance** — does a current project or near-term goal require it? (3 = blocking a current project; 1 = no current use.)
3. **Transfer value** — how broadly does the underlying schema transfer? (3 = core CS schema reused across many domains; 1 = narrow, one-off.)

Multiply: score = P × R × T, range 1–27. Rank. Learn the top 2 deeply this week. Skim the next 3. Defer everything below 8 to next week's triage. Ignore anything scoring 1 (almost nothing matters so little, but a few items do — niche tools, deprecated frameworks, blog drama).

The point is not the precision of the score. The point is to **make the decision deliberate** rather than defaulting to "learn everything, learn nothing well."

## 2. Why it works (the mechanism)

Triage works through two mechanisms:

1. **Cognitive load management.** Working memory is the bottleneck (see [[01_Theory/T2 — Cognitive Load Theory|T2]]). Attempting to learn 20 topics simultaneously produces intrinsic load that exceeds WM for any single one. No topic gets the focused attention it needs; all are learned shallowly. Triage restricts the active frontier to 2–3 topics, restoring WM capacity per topic.

2. **Expertise literature — selective attention.** Ericsson's deliberate-practice research (see [[01_Theory/T3 — Deliberate Practice|T3]]) consistently finds that experts spend their time on a small set of high-leverage activities, not on broad coverage. The selection is itself a skill: knowing what to ignore is part of expert performance. Novices try to learn everything; experts triage ruthlessly.

The mechanism is indirect: triage is not itself a learning activity; it is a **meta**-activity that determines which learning activities occur. Its evidence base comes from the expertise literature (which shows experts triage) and from cognitive load theory (which shows why breadth-without-depth fails). The combination is compelling but indirect — there is no RCT of "triage vs. no triage" because the comparison is too coarse to run.

The just-in-time vs. just-in-case distinction is central. Just-in-case learning ("I might need WebAssembly someday") has no current cue and decays before use. Just-in-time learning ("I need WebAssembly for this project this week") has a strong cue, high motivation, and immediate application — the ideal encoding conditions. Defer everything you can until just-in-time.

A second mechanism is **opportunity cost**. Every hour spent on a low-leverage topic is an hour not spent on a high-leverage topic. The cost of studying the wrong thing is not just the wasted time — it is the foregone learning of the right thing. Triage makes this opportunity cost explicit. A learner who defers WebAssembly to study Rust async internals has not just saved time; they have redirected that time to a topic with higher prerequisite centrality and project relevance. The redirect compounds across weeks and months.

## 3. Evidence

**Ericsson, Krampe & Tesch-Römer (1993)** — the foundational deliberate-practice paper. Experts were distinguished from non-experts not by total time spent but by time spent on **high-leverage, effortful practice** of carefully selected activities. The selection was as important as the execution.

**Sweller's Cognitive Load Theory** (see [[01_Theory/T2 — Cognitive Load Theory|T2]]) — high element interactivity requires focused attention; breadth-without-depth overloads WM. Triage is the operational response to CLT at the curriculum level.

**Newell & Simon (1972), problem-space theory** — expertise in a domain is partly the expert's ability to identify which features of a problem matter and which to ignore. The same applies to curricula: expertise includes knowing which topics matter.

**Hambrick, Macnamara, Campitelli, Ullen & Mosing (2016)** — critique of deliberate-practice "10,000 hours" claim; emphasizes that *what* is practiced matters more than *how much*. Triage is the lever that controls *what*.

**Bjork & Bjork's "desirable difficulties" framework** — also notes that learners systematically mis-judge what to study, preferring easy material over high-leverage material. Triage counters this by forcing an explicit ranking.

Full citations: [[08_References/References Index|References Index]].

## 4. How to apply it

1. **Schedule a weekly triage.** One hour, Sunday evening. Pair with an implementation intention (M7): "When I sit down on Sunday at 7pm, I will run the triage protocol."

2. **List every candidate topic.** Include: new topics encountered this week, old topics still on the list, ambient "should learn" items, anything in your browser's reading list.

3. **Score each on P × R × T (1–3 each, 1–27 total).**
   - P (prerequisite centrality): how many future topics require this?
   - R (project relevance): does a current/near-term project require this?
   - T (transfer value): how broadly does the underlying schema transfer?

4. **Rank and assign.** Top 2 → learn deeply this week. Next 3 → skim (read 1 paper or 1 chapter to map territory). Score 8–15 → defer to next triage. Score < 4 → ignore (record the decision; do not re-litigate weekly).

5. **Cap the active frontier at 2–3 deep topics.** This is the WM constraint (T2). More than 3 → shallow coverage of all.

6. **Prefer just-in-time.** If a topic has no current project use (R = 1), defer it. It will surface again when needed; trust that.

7. **Record decisions in the vault.** A short note per triage session: what's in, what's skimmed, what's deferred, what's ignored. This prevents re-litigating and creates a record of how your judgment evolved.

8. **Review the deferred list quarterly.** Some items will have become relevant (R increased); promote them. Others will have proved irrelevant; delete them.

## 5. Common failure modes

| Misuse | Why it fails | Fix |
|--------|--------------|-----|
| Attempting to learn everything | Overload; shallow coverage of all. | Cap active frontier at 2–3. |
| Never deferring "just in case" topics | JIT > JIC for retention; JIC decays before use. | Default to defer unless R ≥ 2. |
| Re-litigating ignored items weekly | Wastes triage time; breaks the decision. | Once ignored, only review quarterly. |
| No written record | Decisions evaporate; nothing to review. | Write a short triage note per session. |
| Treating the score as precise | The score is a forcing function, not a measurement. | Use it to rank; don't optimize to decimal places. |
| Triage without follow-through | Decisions made, not executed. | Pair with M7 (implementation intentions) for daily execution. |
| Skim = read in full | Skim means map the territory, not consume the material. | Skim = 1 paper or 1 chapter, no deep work. |
| Ignoring prerequisite centrality | Deferring a true prerequisite blocks downstream topics. | P = 3 topics almost always learn-deeply. |

## 6. Worked example

It is Sunday evening. Your candidate list includes: WebAssembly, Rust async internals, CRDTs, PostgreSQL query planner, WebGPU, differential dataflow, type-level programming in TypeScript, Lean 4, eBPF, formal verification with TLA+.

You score:

| Topic | P | R | T | Score | Decision |
|-------|---|---|---|-------|----------|
| Rust async internals | 3 | 3 | 2 | 18 | Learn deeply |
| PostgreSQL query planner | 2 | 3 | 2 | 12 | Learn deeply |
| CRDTs | 2 | 2 | 3 | 12 | Skim |
| eBPF | 2 | 2 | 2 | 8 | Defer |
| Differential dataflow | 1 | 2 | 3 | 6 | Defer |
| TLA+ | 2 | 1 | 3 | 6 | Defer |
| WebGPU | 1 | 1 | 2 | 2 | Ignore |
| WebAssembly | 2 | 1 | 1 | 2 | Ignore |
| Type-level TS | 1 | 1 | 1 | 1 | Ignore |
| Lean 4 | 1 | 1 | 1 | 1 | Ignore |

You record the decision. The active frontier for this week is Rust async internals (deep) + PostgreSQL query planner (deep) + CRDTs (skim). Everything else is deferred or ignored until the next triage.

Crucially, you do **not** feel guilty about ignoring WebAssembly. You have made an explicit, recorded decision based on three explicit criteria. The decision can be revisited next quarter. The cognitive load that would have come from "I should also be learning WebAssembly" is gone; you can focus on Rust async and Postgres with full WM.

Three months later, a new project requires WebAssembly. The topic returns to triage with R = 3 (blocking a current project). Its score jumps from 2 to 12, and it enters the learn-deeply queue. The deferral was correct — the topic was not worth learning three months ago, and it is worth learning now. The just-in-time principle held: you learned WebAssembly when you needed it, with a strong cue and immediate application, not three months earlier when it would have decayed before use. Triage is not about saying no forever; it is about saying not-now until the conditions for effective learning are met.

## 7. Cross-links

- **Theory**: [[01_Theory/T2 — Cognitive Load Theory|T2 CLT]] — triage is the curriculum-level load-management response.
- **Theory**: [[01_Theory/T3 — Deliberate Practice|T3 Deliberate Practice]] — experts triage ruthlessly; selection is part of expertise.
- **Methods**: [[03_Methods/M7 — Implementation Intentions|M7 Implementation Intentions]] — triage decisions only execute via if-then plans.
- **Methods**: [[03_Methods/M1 — Retrieval Practice|M1 Retrieval Practice]] — applied to the topics triaged "in."
- **Protocols**: [[04_Protocols/P6 — Weekly Triage Protocol|P6 Weekly Triage]] — the operational playbook.

## 8. Retrieval queue

#sr
- Define strategic triage. Why is it a meta-activity rather than a learning activity?
- Name the three scoring dimensions (P, R, T) and explain what each measures.
- Why does just-in-time learning outperform just-in-case learning for retention?
- Ericsson (1993): what distinguished experts' time use from non-experts', and how does this support triage?
- You have 10 candidate topics. Score each on P × R × T, rank, and assign each to learn-deeply / skim / defer / ignore. Justify one boundary decision.
- Why does just-in-time learning outperform just-in-case learning for retention?
- Explain the opportunity-cost argument for triage. Why is the cost of studying the wrong thing more than just the wasted time?
- Ericsson (1993): what distinguished experts' time use from non-experts', and how does this support triage?
- A topic scores P=3, R=1, T=3 (score 9). Should you learn it deeply, skim, defer, or ignore? Justify your reasoning.
- Bjork & Bjork: how do learners systematically mis-judge what to study? How does triage counter this?
- You have 30 minutes of free time and 5 deferred topics (each would take ~2 hours to learn deeply). What is the correct action, and why?
- Hambrick et al. (2016): what does the critique of the "10,000 hours" claim imply about the role of triage in expertise?
- Your triage scores a topic at 18 (learn deeply) but after 3 days of study you realize the transfer value is actually low (T=1, not T=3). What do you do, and what does this reveal about the triage process?
- Newell & Simon (1972): how does problem-space theory support the claim that knowing what to ignore is part of expertise?
- You have 5 topics all scoring 12 (P=2, R=2, T=3). How do you break the tie to select the top 2 for deep study?

---

> **Bottom line**: the cost of trying to learn everything is learning nothing well. Triage is the discipline of choosing the few things that matter and explicitly deferring the rest. The guilt you feel about "not learning X" is the cost of not triaging.
