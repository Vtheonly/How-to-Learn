---
type: Theory
tags: [Theory]
created: 2026-07-20
updated: 2026-07-20
mastery: 6-transfer
---

# T2 — Cognitive Load Theory

> Working memory is the bottleneck. It holds ~4 elements, decays in seconds, and is the only place where conscious learning happens. Cognitive Load Theory (Sweller) tells you how to design instruction so the bottleneck doesn't choke.

---

## 1. The mechanism

Working memory (WM) is severely limited:

- **Capacity**: ~4 chunks (Cowan 2001), often cited as 7±2 (Miller 1956) but the modern estimate is lower.
- **Duration**: ~15–30 seconds without rehearsal (Peterson & Peterson 1959).
- **Modality**: separate stores for visual/spatial and auditory/verbal (Baddeley).

All new information must pass through WM to be encoded into long-term memory (LTM). If the load exceeds WM capacity, learning stops — even if you keep reading.

Cognitive Load Theory (Sweller, van Merriënboer, Paas) distinguishes **three types** of load:

| Load type | Source | Effect | Manage by |
|-----------|--------|--------|-----------|
| **Intrinsic** | Inherent difficulty of the material (element interactivity) | Unavoidable, but reducible by sequencing | Pre-training, part-whole practice |
| **Extraneous** | Bad instructional design (split attention, redundancy, search) | Hurts learning | Worked examples, integrated format |
| **Germane** | Schema construction & automation | Helps learning | Don't minimize — optimize for it |

The goal: **minimize extraneous, manage intrinsic, maximize germane**.

## 2. Evidence

### Worked Examples Effect (Sweller & Cooper 1985)

Studying fully worked solutions reduces extraneous load vs. problem-solving, freeing WM for schema construction. Effects are large for novices (d ≈ 0.5–1.0). For experts, the effect reverses — see [[01_Theory/T5 — Expert-Novice Differences|T5]] and the Expertise Reversal Effect.

### Split-Attention Effect (Sweller, Chandler, Tierney 1990)

If a learner must look at a diagram and a separate text explanation, the act of integrating them consumes WM. Putting text *on* the diagram restores capacity.

### Expertise Reversal Effect (Kalyuga 2007)

Methods that help novices (worked examples, integrated text-diagrams) **hurt** experts because the redundant guidance itself becomes extraneous load. The same instructional method should not be used unchanged across skill levels.

### Element Interactivity (Sweller 2010)

A concept like "carry in addition" has high element interactivity: you cannot understand carrying without simultaneously understanding place value, addition, and the carry digit. Intrinsic load is high. Such concepts **must** be sequenced carefully — pre-teach sub-elements first.

### 4C/ID Model (van Merriënboer 1997)

For complex skills (debugging, system design), instruction should decompose into:
1. **Recurrent constituent skills** (practice to automaticity)
2. **Non-recurrent constituent skills** (schemas, deliberate practice)
3. **Just-in-time information** (only when needed)
4. **Part-task vs. whole-task practice** (gradually integrate)

Full citations: [[08_References/References Index#Cognitive Load, Working Memory, Chunking|References Index]].

## 3. How to apply it

### 3.1 The Cognitive Load Test

Before any study session, ask:

> "How many unfamiliar elements will I be juggling simultaneously?"

If the answer is > 4, you need to **reduce intrinsic load** by:
- Pre-studying one of the elements first.
- Finding a simpler worked example.
- Splitting the session into part-tasks.

Example: reading a paper on Paxos without prior knowledge of consensus, quorums, and failure models will exceed WM. Read about quorums first, then re-attempt.

### 3.2 Use worked examples before problems

For any new topic, **always** start with 2–3 fully worked examples. Trace them. Self-explain each step. Only then attempt your own problems.

This is non-negotiable for novices. See [[03_Methods/M4 — Worked Examples|M4 Worked Examples]].

### 3.3 Eliminate split attention in your notes

In your Obsidian notes, do not write a diagram in one place and its explanation in another. Inline the explanation next to the diagram, or use callouts next to the relevant element.

### 3.4 Sequence by element interactivity

When designing a curriculum, identify the **prerequisite graph** (see [[05_Roadmap/R5 — The Dependency Graph of CS|R5]]). Concepts with high element interactivity must come after their sub-components.

### 3.5 Reduce load = more germane capacity

The capacity freed by reducing extraneous load is not "spare" — it is the capacity available for **schema construction** (germane load). Use it. Always pair load reduction with an active schema-building task (comparison, self-explanation, retrieval).

## 4. Common failure modes

### 4.1 Reading dense material cold

Trying to read a distributed-systems paper without the schemas for consensus, replication, and partial failure. Intrinsic load exceeds WM. The reader "reads" the words but encodes nothing.

**Fix**: pre-study the schemas. Use [[04_Protocols/P1 — How to Read a Research Paper|P1 Read Paper]].

### 4.2 Confusing ease with learning

Reduced extraneous load makes material *feel* easy. Learners often interpret ease as learning. It isn't. Ease is the absence of germane load — which is the absence of schema construction.

**Fix**: pair every worked example with a self-test. If you cannot reproduce the worked example from memory, the ease was illusory.

### 4.3 Over-scaffolding experts

A learner at mastery level 4+ who continues to rely on worked examples will regress. The scaffolding that helped at level 1 becomes extraneous load.

**Fix**: when mastery ≥ 4, switch from worked examples to problem-solving + interleaving. See [[01_Theory/T5 — Expert-Novice Differences|T5]].

### 4.4 Mistaking "covered" for "learned"

Reading 200 pages in a day produces a feeling of progress. The actual encoding is minimal — WM simply cannot process that volume. **Coverage is not learning.**

**Fix**: replace page-count goals with mastery-level goals. "Take one concept from level 2 to level 4 today" beats "read 50 pages today."

## 5. Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — schemas in LTM bypass the WM bottleneck.
- **Theory**: [[01_Theory/T6 — Desirable Difficulties|T6 Desirable Difficulties]] — load that *feels* hard can be germane.
- **Method**: [[03_Methods/M4 — Worked Examples|M4 Worked Examples]] — primary extraneous-load reducer.
- **Protocol**: [[04_Protocols/P1 — How to Read a Research Paper|P1 Read Paper]] — designed around WM limits.
- **Roadmap**: [[05_Roadmap/R5 — The Dependency Graph of CS|R5 Dependency Graph]] — sequence by element interactivity.

## 6. Retrieval queue

#sr
- Name the three types of cognitive load and state which to minimize, manage, and maximize.
- Why does the worked-example effect reverse for experts? (Cite Kalyuga 2007.)
- Define "element interactivity" and give an example of a CS concept with high element interactivity.
- You read a paper and feel confused. Diagnose: is the load intrinsic, extraneous, or both? What is your next action?
- Why is "coverage" (pages read per day) a poor learning metric in light of CLT?

---

> **Bottom line**: working memory is the only door into long-term memory, and it is narrow. Every instructional choice you make should be evaluated by one question: *does this choice preserve WM capacity for schema construction?*
