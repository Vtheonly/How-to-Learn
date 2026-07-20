---
aliases: [CLT, Sweller, Cognitive Load]
tags: [theory, cognitive-load]
---

# Cognitive Load Theory

> Sweller (1988); Sweller, van Merriënboer, Paas (1998, 2019)

---

## Theory

Working memory (WM) is severely capacity-limited: ~4 chunks (Cowan, 2001), often cited as 7±2 (Miller, 1956) but the modern estimate is lower. When a learner processes new information, every element competes for those 4 slots. Once saturated, learning stops — regardless of how hard the learner "tries."

Cognitive Load Theory distinguishes three loads:

- **Intrinsic load** — inherent difficulty of the material (e.g., understanding a Paxos proof has higher intrinsic load than understanding a stack push). Determined by *element interactivity*: how many elements must be held simultaneously to make sense.
- **Extraneous load** — load imposed by *how* the material is presented, not what it is. Bad notation, verbose prose, distracting diagrams, unnecessary jargon, fragmented examples.
- **Germane load** — load devoted to schema construction (the *productive* load — rehearsal, elaboration, mapping).

**Total load ≤ WM capacity.** If extraneous + intrinsic saturates WM, germane load drops to zero and no schema construction occurs. You "read" but you don't learn.

The goal of instruction (and self-instruction) is: **minimize extraneous, manage intrinsic, maximize germane.**

---

## CS Translation

| Source of load | Example in CS learning | Mitigation |
|---|---|---|
| High intrinsic | Paxos, type inference, lock-free queues | Pre-learn prerequisites; segment via worked examples |
| High extraneous | RFC written as a wall of prose; textbook with one giant code listing | Rewrite in your own notes; chunk into smaller examples; remove irrelevant detail |
| Low germane | Passive re-reading; highlighting | Active recall, self-explanation, build a minimal version |

The "wall of text" effect in RFCs and academic papers is almost always extraneous load. Experts handle it because they have LTM chunks that compress the prose; novices drown.

---

## Protocol: Reducing Load While Reading Dense Material

1. **Pre-load schema** — before reading a complex paper, spend 10 min skimming the abstract, figures, and section headings. This primes LTM retrieval cues and reduces extraneous load during deep reading. (See [[Schema-Driven-Querying]].)

2. **Segment aggressively** — never read a 30-page paper in one pass. Use the [[Three-Pass-Reading-Protocol]]: skim → structural → deep. Each pass has a different load profile.

3. **Eliminate notation overload** — if a paper introduces 15 symbols in two pages, stop and write out a glossary on paper before proceeding. This converts extraneous load (looking up symbols) into a stable external memory.

4. **Use worked examples first** — Sweller's research shows studying worked examples produces less load than problem-solving from scratch for novices. Always read 2-3 worked examples before attempting a problem.

5. **One new concept per session** — if you're learning concepts A, B, C, do not interleave them in the same 90-minute block on day 1. Wait until each is chunked into LTM (usually 1-3 days) before interleaving. (See [[Interleaving-and-Spacing-in-Practice]].)

---

## Worked Example: Reading Lamport's "Time, Clocks, and the Ordering of Events"

A novice reads it linearly. They encounter ~10 new concepts (happened-before, causal ordering, logical clock, physical clock skew, total order, partial order, concurrency) in 8 pages. Element interactivity is extreme. Intrinsic load is high; extraneous load (LaTeX notation, dense prose) is high. Germane load = 0. They finish having "read" it but with no learning.

An expert:
1. Pre-loads schema: "this paper is about ordering events without a global clock" (1 sentence).
2. Skims figures and section titles (3 min).
3. Reads only the definition of "happened-before" carefully (5 min).
4. Stops, writes a small example with 3 processes (10 min).
5. Returns to read the rest, now with the core concept chunked.

Same paper, same time budget. Different load profile → actual learning.

---

## Key Citations

- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science, 12*(2), 257-285.
- Sweller, J., van Merriënboer, J., Paas, F. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251-296.
- Cowan, N. (2001). The magical number 4 in short-term memory. *Behavioral and Brain Sciences, 24*(1), 87-114.
- Miller, G. A. (1956). The magical number seven, plus or minus two. *Psychological Review, 63*(2), 81-97.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Intrinsic-vs-Extraneous-Load]] — operational breakdown
- [[Working-Memory-Saturation]] — detecting when you've hit the wall
- [[Session-Architecture]] — designing sessions around load
- [[Long-Term-Working-Memory]] — how experts bypass the WM bottleneck

← Back to [[MOC-Foundations]]
