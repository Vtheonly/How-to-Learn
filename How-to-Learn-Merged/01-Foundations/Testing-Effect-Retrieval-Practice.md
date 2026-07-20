---
aliases: [Testing Effect, Retrieval Practice, Roediger Karpicke]
tags: [theory, retrieval, memory]
---

# The Testing Effect (Retrieval Practice)

> Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249-255.

---

## Theory

Re-reading and highlighting are nearly useless for long-term retention. **Retrieval practice** — the act of actively recalling information from memory — produces dramatically better retention than re-exposure, even when retrieval fails.

Roediger & Karpicke (2006) had students read a passage under three conditions:

- **Study once**: read once
- **Repeated study**: read multiple times
- **Study + test**: read once, then take a free-recall test

One week later:
- Study once: ~28% recall
- Repeated study: ~40% recall
- **Study + test: ~56% recall**

The retrieval itself, not the feedback, drives the effect. Even testing *without* feedback beats re-reading *with* feedback. The cognitive effort of retrieval consolidates the memory trace.

The mechanism: retrieval is not a "read-out" of memory; it is a *reconstruction* that strengthens the retrieved trace and its cues. Failed retrieval also strengthens — partially — by priming future learning.

---

## CS Translation

In CS learning, retrieval practice is dramatically underused. Common anti-patterns:

- ❌ Re-reading the same paper 3 times → low retention
- ❌ Highlighting textbooks → near-zero retention
- ❌ Watching the same lecture twice → near-zero retention
- ❌ Copying tutorial code without writing it from memory → near-zero retention

Effective alternatives:

- ✅ After reading a paper, close it and write a 1-page summary from memory
- ✅ After learning an algorithm, implement it from scratch without references
- ✅ Use Anki / Mochi / RemNote for spaced retrieval of facts and patterns
- ✅ Explain the concept aloud to an imaginary peer (Feynman technique)
- ✅ Self-quiz: "What are the 5 invariants of a B+tree?"

---

## Protocol: Retrieval-First Learning

For every concept you want to retain:

### Step 1 — Initial encounter
Read/watch/work through the material once. (5-30 min)

### Step 2 — Immediate retrieval (within 1 hour)
Close the source. Write:
- A one-paragraph summary
- The 3 most important definitions
- One worked example
- One thing you don't yet understand

### Step 3 — Next-day retrieval
Open a blank note. Without consulting yesterday's notes, reconstruct the summary. Then compare.

### Step 4 — Week-later retrieval
Repeat the reconstruction. Note what you forgot. *Then* consult the source.

### Step 5 — Convert to spaced repetition
Items you forgot go into Anki / Mochi with the [[Spaced-Repetition-Queue]] schedule.

---

## Worked Example: Learning a B+tree

**Naive approach** (read-only):
- Read the Wikipedia article (15 min)
- Read the database textbook chapter (45 min)
- Watch a YouTube explanation (20 min)
- Total: 80 min
- Retention at 1 week: ~20%

**Retrieval-first approach**:
- Read the Wikipedia article (15 min)
- Close it. Write a summary from memory (10 min). *Struggle is the point.*
- Implement a B+tree from scratch in Python (45 min). Fail at split logic.
- Re-read just the split section (5 min)
- Finish the implementation (15 min)
- Total: 90 min
- Retention at 1 week: ~70%

Same time budget. 3.5x retention. The retrieval is what does it.

---

## The "Pre-Test" Effect

A surprising corollary: testing *before* studying also improves later learning. Taking a pre-test on material you don't know yet, then studying, produces better retention than studying alone.

The mechanism: pre-testing primes the retrieval cues and tells the learner what to look for.

**Application**: before reading a paper, scan the section headings and try to predict what each section will say. Even wrong predictions help.

---

## What to Put in a Retrieval Practice System

- Definitions of technical terms ("What is 'happened-before'?")
- Invariants ("What 3 properties must a B+tree satisfy?")
- Code patterns ("Write the lock-free push from memory")
- Diagnosis patterns ("Given these symptoms, what's the likely cause?")
- Comparison questions ("How does Raft differ from Paxos on leader election?")

Avoid yes/no questions. Avoid questions whose answer is a single word with no context. Prefer "explain" and "compare" and "write the code for."

---

## Key Citations

- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science, 17*(3), 249-255.
- Karpicke, J. D., & Blunt, J. R. (2011). Retrieval practice produces more learning than elaborative studying with concept mapping. *Science, 331*(6018), 772-775.
- Brown, P. C., Roediger, H. L., & McDaniel, M. A. (2014). *Make It Stick*. Harvard University Press. [Accessible synthesis]

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Spaced-Repetition-and-Forgetting]] — the scheduling layer
- [[Long-Term-Working-Memory]] — what retrieval builds
- [[Deliberate-Practice]] — practice is itself retrieval
- [[Spaced-Repetition-Queue]] — Obsidian template

← Back to [[MOC-Foundations]]
