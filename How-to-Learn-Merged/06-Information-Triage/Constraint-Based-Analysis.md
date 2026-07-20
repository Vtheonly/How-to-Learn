---
aliases: [Constraint Analysis, Predictive Triage]
tags: [triage, heuristic]
---

# Constraint-Based Analysis

> *Predict the value of a resource by identifying the constraints it must respect.*

---

## Principle

A useful heuristic for predicting the value of a technical resource before reading it: **identify the constraints the work respects**. Works that respect *real* constraints tend to be valuable; works that ignore them tend to be confused.

This is a form of *predictive triage*: you can often tell in 5 minutes whether a paper or book is worth reading by checking what constraints the authors acknowledge.

---

## Common Constraints in CS

| Domain | Real constraints |
|---|---|
| Distributed systems | Network partitions, clock skew, partial failure, message delay |
| Concurrency | Memory models, instruction reordering, cache coherence |
| Compilers | Halting problem, undecidability of equivalence, register pressure |
| Databases | ACID trade-offs, CAP, isolation levels, disk seek times |
| ML | Bias-variance, no-free-lunch, gradient vanishing, dataset shift |
| Systems | Amdahl's law, universal scalability law, Little's law |
| Algorithms | Time-space trade-offs, lower bounds, NP-hardness |
| Security | Kerckhoffs's principle, no security through obscurity, side channels |

A work that doesn't acknowledge the relevant constraints is suspect. A work that *enumerates* them and reasons about trade-offs is usually high-value.

---

## Protocol: The Constraint Check

When triaging a paper or book:

1. **Identify the subdomain** (distributed systems? ML? compilers?)
2. **List the 3-5 hard constraints** in that subdomain (use the table above as a starting point)
3. **Search the work for those constraints**. Do they appear in:
   - The motivation?
   - The model?
   - The evaluation?
4. **Decide**:
   - If all constraints appear and are reasoned about → likely Tier 1 or 2
   - If some constraints appear but aren't addressed → likely Tier 3 (hand-wavy)
   - If no constraints appear → likely Tier 3 (probably wrong or trivial)

---

## Worked Example: Triaging a "New Consensus Algorithm" Paper

Constraints for distributed consensus:
- Partial failure (some nodes crash)
- Network partition (network may split)
- Asynchrony (no bounded message delay)
- Quorum intersection (must intersect across decisions)
- FLP impossibility (can't solve deterministic consensus in async + 1 fault)

**Triage check on a hypothetical paper "FastPaxos++"**:

✅ Mentions partial failure: "We assume nodes may crash but recover"
✅ Mentions asynchrony: "We do not assume synchronous message delays"
❌ Does not mention network partition
❌ Does not mention FLP
❌ Claims "100% availability" — directly contradicts FLP

**Decision**: Tier 3. The authors either don't know the field or are ignoring known impossibility results. Skip.

**Triage check on Raft (Ongaro & Ousterhout 2014)**:

✅ Acknowledges partial failure
✅ Acknowledges asynchrony (and discusses leader election timeouts)
✅ Discusses FLP implicitly (relaxes determinism via randomness)
✅ Acknowledges quorum intersection (majority quorums)
✅ Discusses partition behavior explicitly

**Decision**: Tier 1. The authors understand the constraints and reason within them.

---

## Constraint-Based Sanity Checking

Even after reading a work, constraint-based analysis is a sanity check:

- Does the work's claim violate any known theorem? (FLP, CAP, no-free-lunch, Amdahl, Shannon's source coding, etc.)
- Does the work's evaluation respect the constraints? (e.g., a distributed systems paper that only tests on a LAN is suspect)
- Does the work acknowledge the constraints it relaxes? (a paper that gets availability by relaxing consistency should say so)

If a work violates a known theorem and doesn't discuss it, it's wrong. Discard.

---

## When to Relax This Heuristic

- **Tutorial-level material** often doesn't mention constraints because they're not relevant yet. Don't discard OSTEP for not mentioning FLP.
- **Survey papers** may not contribute new constraints-respecting work but summarize many. Useful as Tier 2.
- **Historical papers** predate some constraints being formalized (Lamport 1978 predates FLP 1985). Don't discard for that.

---

## Key Citations

- Lamport, L. (1978). Time, clocks, and the ordering of events. (constraint identification in distributed systems)
- Fischer, M. J., Lynch, N. A., Paterson, M. S. (1985). Impossibility of distributed consensus with one faulty process. (FLP)
- Brewer, E. (2000). Towards robust distributed systems. (CAP, informal)
- Gilbert, S., Lynch, N. (2002). Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services. (CAP, formal)

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Resource-Utility-Heuristics]] — broader triage rules
- [[Selective-Ignorance]] — the master skill
- [[Constraint-Based-Analysis]] is one of several heuristics in the [[Triage-Decision-Tree]]
- [[Threshold-Concepts]] — many thresholds are constraint realizations

← Back to [[MOC-Information-Triage]]
