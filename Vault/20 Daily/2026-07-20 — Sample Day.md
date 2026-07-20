---
type: Daily
tags: [Daily, example]
created: 2026-07-20
updated: 2026-07-20
---

# 2026-07-20 — Sample Day

> This is a filled-in example of the [[06_Templates/Daily Session|Daily Session template]]. Delete this file once you've used it as a reference, or keep it as a model.

**Date:** 2026-07-20
**Start time:** 09:00
**Planned duration:** 90 min

## 1. Triage (5 min) — M10

Today's **single target concept**:

> MVCC in PostgreSQL — understand visibility rules well enough to derive them on a whiteboard.

Today's **secondary concepts**:

- Buffer pool eviction (LRU vs. clock)
- Write-ahead log semantics

## 2. Worked example (15 min) — M4

Studied the MVCC chapter in *Designing Data-Intensive Applications* (Kleppmann), chapter 7. Traced the example of two concurrent transactions T1 (read x) and T2 (write x).

Key insight from this example:

> MVCC achieves snapshot isolation without locks by giving each transaction a consistent view of the database at transaction start. Writers create new versions; readers see the version that was latest at their snapshot timestamp.

## 3. Generative production (60 min) — M8

Closed the book. Wrote the visibility rules from memory:

- Each row has xmin (inserting txn) and xmax (deleting txn).
- A transaction T with snapshot S can see a row iff:
  - xmin committed before S started AND (xmax is null OR xmax did not commit before S started).
- Updated a row in a sandbox Postgres instance and verified using `xmin`/`xmax` columns.

**Generative ratio check**:
- Producing: 55 min
- Consuming: 15 min (book work)
- Ratio: 78% (target ≥ 50% — pass)

## 4. Self-explanation (10 min) — M5

Wrote three sentences in plain language:

> MVCC lets readers see a consistent snapshot without blocking writers. Each row carries transaction IDs that tell the reader whether the row was visible at the reader's snapshot time. Writers create new versions instead of overwriting, so old readers can still see old versions until garbage collection reclaims them.

## 5. Retrieval (10 min) — M1

Closed all notes. From memory:

- **Define MVCC:** Multi-Version Concurrency Control — a method where each transaction sees a snapshot of the database, and updates create new row versions instead of overwriting.
- **Why it exists:** To allow readers and writers to proceed concurrently without locking, eliminating read-write contention for snapshot-isolation workloads.
- **Instance in another domain:** Git's immutable commit history is structurally similar — writers create new commits; readers see a snapshot at a given ref; old commits are GC'd when no ref points to them.

## 6. Schema link (5 min)

MVCC instantiates:
- [[02_Schemas/S6 — Memory & Locality|S6 Memory]] — multiple versions cached, visibility is a "cache hit" decision.
- [[02_Schemas/S7 — Concurrency & Coordination|S7 Concurrency]] — coordination via version numbers rather than locks.

Updated [[02_Schemas/S7 — Concurrency & Coordination|S7]]'s "Canonical instances" section with MVCC.

## 7. Retrieval prompts (5 min) — M2

#sr
- What are the two key columns MVCC attaches to each row, and what do they store?
- State the visibility rule for a transaction T reading a row under snapshot isolation.
- Why does MVCC avoid read-write locks but still produce correct snapshot isolation? Give the invariant.
- Compare MVCC visibility rules to Git's commit reachability — what's structurally the same, what's different?
- A workload has 95% reads, 5% writes. Why might MVCC still cause performance problems?

## 8. Log

**End time:** 10:38
**Actual duration:** 98 min
**Perceived difficulty (1–5, target 3–4):** 4
**Generative ratio:** 78%
**Mastery level at end of session:** 3-derivation *(I can derive the visibility rules but I have not yet implemented a minimal MVCC store. Targeting level 4 next week.)*

**One thing I'm still confused about:**

> How does Postgres's vacuum process know when an old version is safe to GC? Need to look up the XID horizon mechanism.

**Tomorrow's starting point:**

> Implement a toy MVCC store in 200 lines of Python — 5 transactions, snapshot isolation, GC of unreachable versions.

---

## Vault rules check

- [x] Every note I created today connects to a schema.
- [x] Every concept I touched ends in a retrieval prompt.
- [x] I logged this session.
- [ ] (If Sunday) I ran the weekly review.

---

## Cross-links

- [[06_Templates/Daily Session|Daily Session template]]
- [[02_Schemas/S7 — Concurrency & Coordination|S7 Concurrency]]
- [[02_Schemas/S6 — Memory & Locality|S6 Memory]]
