---
aliases: [Query-Driven Reading, Question-Driven Reading]
tags: [reading, protocol]
---

# Schema-Driven Querying

> *Read with a question, not with a paragraph.*

---

## Theory

Default reading mode is **paragraph-driven**: read the first paragraph, then the second, then the third. This is appropriate for narrative but catastrophic for dense technical material.

Expert reading is **query-driven**: the reader maintains a stack of open questions and scans the text for answers. Each answered question pops the stack and pushes sub-questions. Reading is a search, not a consumption.

This works because:

1. **Questions prime retrieval cues** — schemas relevant to the question activate before reading
2. **Selective attention** — relevant paragraphs get processed deeply; irrelevant ones get skipped
3. **Working memory efficiency** — only question-relevant chunks enter WM
4. **Built-in feedback** — if you can't answer the question after reading, you know to re-read

This is closely related to [[Long-Term-Working-Memory|LT-WM]]: the question acts as a retrieval cue that pulls relevant schemas into active state.

---

## CS Translation

When you open a paper, RFC, or codebase, do not start reading. Instead:

1. **Generate 3-5 questions** the document should answer
2. **Scan** TOC, abstract, headings, figures for question-relevant sections
3. **Read those sections first**
4. **Generate new sub-questions** as you read
5. **Read remaining sections only if they answer open questions**

A 40-page paper often has 5-10 pages that actually answer your questions. The other 30 are context you don't need *this pass*.

---

## Protocol: The Query Stack

Maintain a literal stack of questions (on paper or in a side-note):

```
Q1: What problem does this paper solve?
Q2: What is the core mechanism?
Q3: What are the failure modes?
Q4: How does it compare to prior work?
Q5: What assumptions does it make?
```

Read with Q1 in mind. When you find the answer, write it down and pop. Move to Q2.

Sub-questions emerge:
```
Q1: What problem? → "Consensus under partial failure"
  Q1.1: What does "partial failure" mean here? → "Some nodes crash, network may partition"
  Q1.2: What did prior work assume? → ...
```

When the stack is empty or all questions are answered, stop reading. You're done.

If a question can't be answered after a thorough scan, you've either (a) mis-scoped the question, (b) the document doesn't address it, or (c) you lack prerequisite schemas. Diagnose which.

---

## Worked Example: Reading "MapReduce" with Queries

**Default approach** (paragraph-driven):
- Read abstract
- Read intro
- Read section 2 (programming model)
- Read section 3 (implementation)
- ...etc., 60 min total, 30% retention

**Query-driven approach**:

```
Initial stack:
Q1: What problem does MapReduce solve?
Q2: What's the programming model?
Q3: How is fault tolerance handled?
Q4: What are the limitations?
```

- Scan TOC → "Programming Model" (§2), "Implementation" (§3), "Refinements" (§4), "Experience" (§5)
- Read §2 (10 min) → answers Q1, Q2. Push Q2.1: "What types of problems fit Map/Reduce?"
- Read §3.4 (fault tolerance, 5 min) → answers Q3. Push Q3.1: "How does it handle stragglers?"
- Read §3.5 (5 min) → answers Q3.1
- Read §5 (experience, 10 min) → answers Q2.1, Q4
- Stack empty. Total: 30 min, 70% retention.

---

## When Query-Driven Reading Fails

- **When you don't know what questions to ask** (you're a complete novice). Solution: read 2-3 survey papers first to develop question vocabulary.
- **When the document is foundational and you need every detail**. Solution: use [[Three-Pass-Reading-Protocol]] instead.
- **When you're reading for breadth, not depth**. Solution: use [[Syntopical-Reading]].

---

## Cross-Links

- [[Expert-vs-Novice-Reading]] — query-driven reading is a major component of expert reading
- [[Three-Pass-Reading-Protocol]] — complementary; use three-pass when query stack is empty
- [[Reading-RFCs-and-Standards]] — RFCs reward query-driven reading
- [[Resource-Utility-Heuristics]] — query-driven evaluation of whether to read at all

← Back to [[MOC-Reading-and-Synthesis]]
