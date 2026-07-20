---
aliases: [Spaced Repetition, Forgetting Curve, Ebbinghaus]
tags: [theory, memory, scheduling]
---

# Spaced Repetition & the Forgetting Curve

> Ebbinghaus, H. (1885). *Memory: A Contribution to Experimental Psychology*. Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354-380.

---

## Theory

Ebbinghaus (1885) discovered the **forgetting curve**: memory decays following a roughly logarithmic function. Most forgetting happens in the first 24 hours; the rate of further decay slows with each review.

The single most robust finding in memory research: **spacing reviews over time produces dramatically better retention than massing them.** Cepeda et al. (2006) meta-analyzed 254 studies and found spacing effects in nearly every comparison.

The optimal spacing is roughly:
- 1st review: 1 day after initial learning
- 2nd review: ~3 days later
- 3rd review: ~7 days later
- 4th review: ~16 days later
- 5th review: ~35 days later
- Subsequent: doubling each time

The optimal gap *increases* as the memory consolidates. Reviewing too soon wastes time; reviewing too late means relearning.

Critically: **spacing works because forgetting is beneficial.** A review that occurs when you've partially forgotten forces retrieval effort, which strengthens the trace. A review when memory is fresh is essentially re-reading (low payoff).

---

## CS Translation

Most CS learners do not use spaced repetition systematically. They rely on "I'll encounter it again naturally." This works for high-frequency concepts (loops, recursion) and fails completely for low-frequency concepts (Paxos quorum intersection, B+tree split logic, memory barrier semantics).

The result: relearning the same material 5 times across 5 years instead of once with proper scheduling.

---

## Protocol: Spaced Repetition for CS

### Step 1 — Decide what to put in the SR system

**In**:
- Definitions (consensus, monotonic clock, idempotent, exactly-once)
- Invariants (B+tree properties, monad laws, ACID properties)
- Pattern recognition ("Given this code, what pattern is this?")
- Bug patterns ("Given these symptoms, what's the failure mode?")
- Comparison ("Difference between MVCC and OCC?")
- Algorithm steps ("Steps of Paxos Phase 2a")

**Out**:
- Trivial facts (syntax — look it up)
- Things you encounter weekly (they're naturally spaced)
- Anything you can't apply (SR without use is ritual)

### Step 2 — Choose a tool

- **Anki** — most popular, free desktop, mature ecosystem
- **Mochi.cards** — Markdown-native, integrates well with Obsidian
- **RemNote** — combines notes and SR
- **Obsidian Spaced Repetition plugin** — keeps everything in your vault

Recommendation: if you live in Obsidian, use the Spaced Repetition plugin. Otherwise, Mochi for Markdown-friendliness.

### Step 3 — Write good cards

Bad card: "What is a B+tree?" (Too broad; will fail repeatedly)
Good card: "What is the *split invariant* of a B+tree of order m?" (Specific, retrievable)

Bad card: "Define idempotence."
Good card: "A function f is idempotent iff ___." (Forces precise recall)

Bad card: "Paxos uses majorities."
Good card: "Why does Paxos require majority quorums? (1 sentence)"

### Step 4 — Schedule honestly

If you fail a card, *reset* it. Don't fool yourself. The SR system is only useful if failure is honest.

### Step 5 — Cap daily reviews

- New cards/day: 10-20 (more than 20 → reviews snowball)
- Max reviews/day: 100-150 (more than this → burnout)
- Total time: 15-20 min/day

If your review queue grows beyond 200, you're adding cards faster than you can absorb them. Stop adding, do reviews only for a week.

---

## Worked Example: SR for "Paxos"

After reading Paxos Made Simple, create 5 cards:

1. Q: "Paxos Phase 1: what does a proposer send, and to whom?"
   A: "Prepare(n) to a majority of acceptors."

2. Q: "Paxos Phase 1b: when can an acceptor respond to Prepare(n)?"
   A: "Only if it has not promised to a higher n."

3. Q: "Paxos invariant: what does majority intersection guarantee?"
   A: "At least one acceptor in any two quorums has the highest seen proposal — so new proposers learn of any chosen value."

4. Q: "Paxos Phase 2: what does a proposer send?"
   A: "Accept(n, v) where v is the value from the highest-numbered promise, or own value if no promises carried values."

5. Q: "Paxos liveness problem in one sentence."
   A: "Two proposers can duel indefinitely, each preempting the other's Phase 1."

After 4 weeks of spacing, these 5 cards anchor the entire Paxos schema. Encountering Raft later, you'll automatically ask "where is the majority intersection?" — the schema transfers.

---

## Common Failure Modes

- **Adding too many cards** — snowballing review queue → abandoning the system
- **Bad card design** — too long, too vague, multiple answers
- **Reviewing without applying** — cards become ritual, not learning
- **No reset on failure** — false confidence
- **Cramming before reviews** — defeats the spacing

---

## Key Citations

- Ebbinghaus, H. (1885). *Memory: A Contribution to Experimental Psychology*.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall. *Psychological Bulletin, 132*(3), 354-380.
- Wozniak, P. (1995). *Optimization of learning*. [SuperMemo foundation]

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Testing-Effect-Retrieval-Practice]] — retrieval is the engine; spacing is the schedule
- [[Long-Term-Working-Memory]] — what SR builds
- [[Spaced-Repetition-Queue]] — Obsidian template
- [[Daily-Learning-Log]] — daily SR review is part of the loop

← Back to [[MOC-Foundations]]
