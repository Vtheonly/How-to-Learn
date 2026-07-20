---
aliases: [Interleaving, Spacing in Practice, Mixed Practice]
tags: [load, protocol, scheduling]
---

# Interleaving and Spacing in Practice

> Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*(6), 481-498.

---

## Theory

Two related but distinct scheduling effects:

### Spacing effect
Distributing study of the same material across multiple sessions (days apart) produces better retention than massing it in one session. (See [[Spaced-Repetition-and-Forgetting]].)

### Interleaving effect
Mixing practice of *different* problem types within a session produces better retention and transfer than blocking (practicing one type at a time).

The interleaving effect is counter-intuitive: blocked practice *feels* more productive (you get into a rhythm, success rate rises) but produces worse retention. Interleaving *feels* harder (constant context switching, lower success rate) but produces better retention and *far* better transfer.

Rohrer & Taylor (2007): students who interleaved mathematics problem types scored 43% on a delayed test, vs 20% for students who blocked. More than 2x retention.

The mechanism: interleaving forces retrieval of "which strategy applies here?" — a metacognitive skill that blocked practice doesn't train.

---

## CS Translation

Most CS learners block by default:

- "This week I'm doing algorithms."
- "Today I'm reading about operating systems."
- "I'll do all 50 SQL exercises this afternoon."

This produces *fluency within the session* but poor retention and weak transfer.

Interleaved approach:

- A 90-min session: 30 min algorithms problem, 30 min OS reading, 30 min SQL exercise
- A weekly schedule: algorithms Mon/Wed/Fri, OS Tue/Thu, SQL Sat
- A review session: alternate algorithms, OS, SQL problems

Interleaving is *especially* valuable for cross-domain transfer. If you're learning distributed systems and databases in the same period, alternating sessions let you see isomorphisms (write-ahead logs, two-phase commit, quorum systems) that pure-blocking would hide.

---

## Protocol: Interleaved Practice Scheduling

### Step 1 — Identify 2-4 active topics

You should always have 2-4 active learning topics, not 1. Examples:

- Algorithms + Operating Systems + a build project
- Distributed systems + ML + a paper reading list
- Compilers + Type theory + a build project

### Step 2 — Interleave within the week

```
Mon: Block A (90 min algorithms) + Block B (90 min distributed systems)
Tue: Block A (90 min distributed systems) + Block B (90 min build project)
Wed: Block A (90 min algorithms) + Block B (90 min paper reading)
Thu: Block A (90 min distributed systems) + Block B (90 min build project)
Fri: Block A (90 min review all 3) + Block B (90 min problem-solving)
```

Notice: each topic appears 2-3x/week, never on consecutive days.

### Step 3 — Interleave within sessions (optional, for problem-solving)

For pure problem-solving sessions, mix problem types:

- 30 min: hard algorithms problem
- 30 min: SQL exercise
- 30 min: distributed systems problem

This *feels* harder than 90 min of one type. Retention is significantly better.

### Step 4 — Use "desirable difficulty"

Interleaving and spacing are *desirable difficulties*: they make practice feel harder while producing better learning. If practice feels easy, you're probably blocking too much.

---

## When Not to Interleave

- **When you're at the very start of a topic** and need concentrated exposure to build the first schemas. Block for the first 1-2 weeks, then switch to interleaved.
- **When the topic is so hard that any context-switching is fatal** (e.g., first encounter with category theory). Block, then interleave once basics are chunked.
- **When you're implementing a single large project** that requires sustained context. Block during active implementation, interleave during learning phases.

---

## Worked Example: A Learning Week

**Active topics**: Distributed systems (DS), Compilers (CMP), Build project (custom KV store)

### Naive blocked week (poor retention)
- Mon-Fri: DS only
- Next week: CMP only
- Two weeks later: project only

### Interleaved week (good retention)
- Mon: DS reading (90) + CMP reading (90)
- Tue: Project (90) + DS problem (90)
- Wed: CMP problem (90) + DS reading (90)
- Thu: Project (90) + CMP reading (90)
- Fri: Review all three (90) + Project (90)

Same total time. Interleaved produces ~2x retention at 1-month delay.

---

## The Cross-Domain Bonus

Interleaving reveals isomorphisms that blocking hides. Example:

- Mon: read about write-ahead logs in databases
- Tue: read about write-ahead logs in distributed systems (Paxos log)
- Wed: read about write-ahead logs in operating systems (journaling file systems)

By Wed, you'll have extracted the *abstract* WAL schema and can apply it to any new domain (blockchain, event sourcing, message queues). Blocking each domain separately would miss this.

This is the operational form of [[Isomorphism-Detection]].

---

## Key Citations

- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*(6), 481-498.
- Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. In *Metacognition*.
- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In *Psychology and the Real World*.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Spaced-Repetition-and-Forgetting]] — the spacing effect (related but distinct)
- [[Session-Architecture]] — how interleaving fits in the daily schedule
- [[Isomorphism-Detection]] — interleaving reveals isomorphisms
- [[Cognitive-Flexibility-Theory]] — interleaving = criss-crossing cases

← Back to [[MOC-Load-Management]]
