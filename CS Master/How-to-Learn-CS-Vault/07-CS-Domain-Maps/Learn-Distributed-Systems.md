---
aliases: [Learn Distributed Systems, Distributed Systems Learning Map]
tags: [domain-map, distributed-systems]
---

# 🗺️ Learn Distributed Systems



---

## Threshold Concepts

- **Happened-before** (Lamport 1978) — the foundation
- **Logical vs physical clocks** — and why physical clocks can't order events
- **The CAP theorem** — and what it actually says (and doesn't)
- **FLP impossibility** — why you can't have deterministic consensus + async + 1 fault
- **Quorum intersection** — the structural reason consensus works
- **Linearizability** — and why it's expensive
- **Eventual consistency** — and its many flavors
- **The state machine approach** — Schneider (1990)
- **Idempotence** — the operational requirement for any retry logic

---

## Canonical Sources (Tier 1 — read deeply)

- **Kleppmann, *Designing Data-Intensive Applications*** (DDIA) — the modern starting point
- **Tanenbaum & Van Steen, *Distributed Systems*** (free, https://www.distributed-systems.net/)
- **Coulouris, Dollimore, Kindberg, *Distributed Systems: Concepts and Design*** — comprehensive reference
- **Lamport (1978), "Time, Clocks, and the Ordering of Events"** — the foundational paper

---

## Reference Index (Tier 2 — on demand)

- Lamport, "Paxos Made Simple"
- Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm" (Raft)
- Gilbert & Lynch (2002), formal CAP proof
- Fischer, Lynch, Paterson (1985), FLP
- Aphyr's Jepsen analyses (aphyr.com)
- Murat Demirbas's distributed systems reading list
- MIT 6.824 syllabus (free, with video lectures)

---

## Common Failure Modes

- **Reading without building.** Distributed systems are unintuitive; only implementation reveals the truth.
- **Skipping Lamport 1978.** Everything else depends on it.
- **Treating CAP as a slogan.** Read the formal version (Gilbert & Lynch 2002).
- **Avoiding Paxos.** Paxos is hard but foundational; suffer through it.
- **Using "eventually consistent" as a hand-wave.** Define your consistency model precisely.
- **Not reasoning about failures.** Every distributed system is a failure-recovery system.

---

## Build Projects

1. Implement Lamport clocks in a multi-process simulation
2. Implement a key-value store with leader election (Raft)
3. Implement a sharded KV store with consistent hashing + replication
4. Build a tiny MapReduce
5. Implement vector clocks and detect concurrent writes
6. Implement a CRDT (e.g., G-Counter, OR-Set)
7. Run Jepsen-style tests against your system

---

## Triage Shortcuts

- Kleppmann first for breadth and modern systems
- Lamport 1978 first for foundations
- MIT 6.824 labs are excellent structured practice
- For each paper, also read critiques / Jepsen analyses
- Aphyr's blog posts reveal how real systems fail

---

## Estimated Time

**400-600 hours** for solid distributed systems competence.
~15 months at 10 hours/week.

Prerequisite: OS, networks, databases. This is the hardest CS subdomain.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
