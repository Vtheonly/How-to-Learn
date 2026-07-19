---
aliases: [Learn Databases, Databases Learning Map]
tags: [domain-map, databases]
---

# 🗺️ Learn Databases



---

## Threshold Concepts

- **The relational model** — Codd's contribution
- **ACID** — and what each letter actually guarantees
- **Isolation levels** — read uncommitted, read committed, repeatable read, serializable
- **The log** — WAL is the central abstraction in databases
- **Indexes** — B-tree, hash; the trade-offs
- **Two-phase commit** — and why it blocks
- **MVCC** — how modern databases achieve concurrency
- **The query optimizer** — and why SQL is declarative
- **Consistency models** — linearizability, serializability, causal consistency

---

## Canonical Sources (Tier 1 — read deeply)

- **Hellerstein, Stonebraker, Hamilton, *Database Systems: The Complete Book*** (the "Red Book")
- **Garcia-Molina, Ullman, Widom, *Database Systems: The Complete Book*** (more comprehensive)
- **Kleppmann, *Designing Data-Intensive Applications*** (DDIA) — modern, practical
- **Codd (1970), "A Relational Model of Data for Large Shared Data Banks"** — the original

---

## Reference Index (Tier 2 — on demand)

- *Transaction Processing* (Gray & Reuter) — for transaction internals
- *Readings in Database Systems* (Red Book, Hellerstein & Stonebraker eds.) — paper collection
- *Database Internals* (Petrov) — modern systems internals
- PostgreSQL docs + source code
- Aphyr's Jepsen analyses

---

## Common Failure Modes

- **Using ORMs without learning SQL.** SQL is the substrate; ORMs are conveniences.
- **Treating DBs as "data buckets."** Databases are consistency engines; the data is incidental.
- **Skipping the relational algebra.** It's the math behind SQL.
- **Not implementing a DB.** Build a tiny KV store with WAL, B-tree, and transactions.
- **Ignoring query plans.** EXPLAIN ANALYZE is essential.

---

## Build Projects

1. Implement a KV store with a WAL (recover from crash)
2. Add B-tree indexes to your KV store
3. Implement 2PL (two-phase locking) and OCC (optimistic concurrency control)
4. Build a tiny SQL engine (lexer + parser + executor for SELECT/INSERT/UPDATE)
5. Implement a simple MVCC layer
6. Add a query optimizer (rule-based first, then cost-based)
7. Implement a sharded KV store with consistent hashing

---

## Triage Shortcuts

- Kleppmann first for modern understanding
- Red Book for depth
- PostgreSQL is the best open-source DB to read source code for
- Jepsen analyses reveal how databases actually fail
- For distributed DBs, read Spanner, Dynamo, Bigtable papers

---

## Estimated Time

**300-500 hours** for solid database competence.
~12 months at 10 hours/week.

Prerequisite: algorithms, systems programming.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
