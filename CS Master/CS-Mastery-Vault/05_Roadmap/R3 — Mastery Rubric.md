---
type: Roadmap
tags: [Roadmap]
created: 2026-07-20
updated: 2026-07-20
---

# R3 — Mastery Rubric

> Six levels of mastery. Most learners stop at level 2 and call it done. Real mastery is level 5+. This rubric tells you what each level means, how to test for it, and when to advance.

---

## The six levels

| Level | Name | What you can do | Test |
|-------|------|-----------------|------|
| 1 | Recall | Define the term. | "What is a page fault?" |
| 2 | Explanation | Explain why it exists and what it does. | "Why does virtual memory require a TLB?" |
| 3 | Derivation | Derive or prove the property. | "Derive effective access time given TLB hit rate h." |
| 4 | Implementation | Build it from scratch. | "Implement a toy virtual-memory simulator." |
| 5 | Diagnosis | Debug it; explain failure modes. | "Explain why this workload pages excessively." |
| 6 | Transfer | Apply the same schema in a different domain. | "Compare VM paging with DB buffer-pool management." |

Each level subsumes the lower ones. You cannot diagnose (5) without being able to implement (4); you cannot implement without being able to derive (3); etc.

## Why this rubric exists

Without an explicit rubric, learners default to **level-2 self-assessment**: "I read it, I understand it." This is the Dunning-Kruger trap. They cannot implement, cannot diagnose, cannot transfer — but they feel they understand.

The rubric forces an honest question: **"What can I produce from memory, right now, without notes?"**

If the answer is "I can define it" — you're at level 1. Period. The feeling of understanding is not mastery; production is mastery.

## The tests in detail

### Level 1 — Recall

**Test**: "Define [concept]."
**Pass criterion**: precise definition in one sentence, in your own words. Not a Wikipedia quote.

Example: "Page fault — an exception raised by the MMU when the CPU accesses a virtual address whose page is not currently resident in physical memory."

### Level 2 — Explanation

**Test**: "Why does [concept] exist? What problem does it solve? What does it do?"
**Pass criterion**: 2–3 paragraphs explaining the problem, the mechanism, and the consequence. Without notes.

Example: "Virtual memory exists to give each process the illusion of a contiguous, private address space, isolating processes from each other and from the kernel. The TLB caches recent virtual-to-physical translations so the page table doesn't have to be walked on every memory access. Without a TLB, every memory access would require multiple memory reads for the page table walk, making the system 10–100× slower."

### Level 3 — Derivation

**Test**: "Derive [property] from first principles."
**Pass criterion**: a step-by-step derivation with each step justified. May include a proof or a quantitative calculation.

Example: "Effective access time (EAT) with TLB hit rate h, TLB lookup time t, and memory access time m: EAT = h(t + m) + (1 - h)(t + m + m·(page_table_depth - 1) + m). With a single-level page table, EAT = h(t+m) + (1-h)(t + 2m). For h = 0.95, t = 1ns, m = 100ns: EAT = 0.95·101 + 0.05·201 = 95.95 + 10.05 = 106ns."

### Level 4 — Implementation

**Test**: "Implement a minimal version of [system] from scratch."
**Pass criterion**: working code, written from memory or with minimal reference, that demonstrates the core mechanism. Not a clone of an existing system — a minimal correct version.

Example: A 200-line virtual memory simulator with a page table, TLB cache, LRU replacement, and a workload generator. The simulator should produce statistics: TLB hit rate, page fault rate, EAT.

### Level 5 — Diagnosis

**Test**: "Here is a failing system / misbehavior. Explain why."
**Pass criterion**: a correct root-cause explanation, identifying the violated invariant, the cascading consequence, and the fix.

Example: "Your database workload sees periodic latency spikes every 60 seconds. The spikes correlate with dirty page writeback. The buffer pool is sized at 4GB but your working set is 6GB, so the LRU is constantly evicting hot pages. Fix: increase shared_buffers to 8GB, or partition the workload."

### Level 6 — Transfer

**Test**: "Apply the same schema in a different domain."
**Pass criterion**: a correct structural alignment between two domains, identification of what's same (relational structure) and what's different (surface features), and a correct prediction or design in the new domain.

Example: "VM paging and DB buffer-pool management are structurally identical: both cache a slower tier (disk) in a faster tier (RAM), both have a replacement policy, both have a write-back policy, both have a hit-rate metric. Differences: VM pages are fixed 4KB; DB pages are typically 8–16KB. VM uses hardware TLB; DB uses a software page map. VM page faults are synchronous; DB buffer misses may be asynchronous (read-ahead). Prediction: any technique that improves VM hit rate (prefetching, grouping) has a DB analog (read-ahead, extent allocation)."

---

## How to test yourself

The test must be:

1. **Closed-book** — no notes, no Google, no AI assistant.
2. **Produced** — written or verbalized, not just thought.
3. **Time-boxed** — at most 30 minutes for a level-3+ test.
4. **Compared** — against a reference (the textbook, an expert's answer, a canonical implementation).

If you skip the comparison, you cannot know whether you passed. Self-assessment without external calibration is unreliable (Dunning-Kruger).

## How to tag concepts in the vault

Every concept note in your vault should have one of:

```yaml
mastery: 1-recall
mastery: 2-explanation
mastery: 3-derivation
mastery: 4-implementation
mastery: 5-diagnosis
mastery: 6-transfer
```

These also correspond to tags `#mastery/1-recall`, etc. (configured in `07_PKM/P1 — Tag System`).

The Daily Dashboard (`00_MOCs/Daily Dashboard`) auto-groups notes by mastery level using Dataview. Use this view weekly to see where you stand.

## When to advance a concept

Advance a concept from level N to level N+1 only when you have **passed the level N+1 test within the last 7 days**.

Why 7 days? Because of the forgetting curve (see [[03_Methods/M2 — Spaced Repetition|M2]]). If you passed the test today, you might still have it next week. If you pass next week's test, the memory is consolidating. If you cannot, the level should drop back.

The Spaced Repetition plugin's review queue is the natural mechanism for this. Each `#sr` prompt should be tagged with the mastery level it tests. If you fail the review, the concept drops a level.

## The 80/20 of mastery

Most learners spend 80% of their time at level 2 (explanation) and never advance. The reason is that level 2 is comfortable and feels like learning.

The fix is structural: **target level 4 (implementation) explicitly**. For any concept, the question is not "do I understand it?" but "can I implement a minimal version?"

This single shift — from explanation-target to implementation-target — is the most leveraged change in this entire vault. It is the difference between a learner who knows 200 concepts at level 2 (no transferable skill) and a learner who knows 50 concepts at level 4 (deep, transferable, durable).

## The diagnostic question

For every concept you "know," ask:

> "If I were dropped on a desert island with a compiler and a spec, could I build this from scratch?"

If the honest answer is no, you're below level 4. The vault's job is to get you to "yes" for at least 30 concepts in a year.

## Cross-links

- [[05_Roadmap/R1 — The 12-Month Study Sequence|R1 12-Month Sequence]] — mastery targets per quarter.
- [[05_Roadmap/R2 — Three Pillars Curriculum|R2 Three Pillars]] — mastery targets per subdomain.
- [[03_Methods/M1 — Retrieval Practice|M1 Retrieval]] — the test mechanism.
- [[03_Methods/M8 — Generative Production|M8 Generative Production]] — how to test level 4.
- [[01_Theory/T5 — Expert-Novice Differences|T5 Expert-Novice]] — why level 6 (transfer) is the expert marker.

## Retrieval queue

#sr
- Name the 6 levels of the mastery rubric in order.
- Why is level 2 self-assessment unreliable, and what is the diagnostic question?
- What is the pass criterion for level 3 (derivation)?
- You read about Paxos and "understand it." Which level are you likely at, and what test would advance you?
- Why does the vault recommend targeting level 4 (implementation) over level 2 (explanation)?

---

> **Bottom line**: feelings lie; production doesn't. If you cannot produce it from memory, you don't know it. Tag every concept honestly. Advance only on test passage. Spend most of your time at level 4.
