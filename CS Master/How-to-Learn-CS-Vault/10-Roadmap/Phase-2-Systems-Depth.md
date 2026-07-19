---
aliases: [Phase 2, Systems Phase, Year 2-4]
tags: [roadmap, phase]
---

# Phase 2 — Systems Depth (Year 2-4)

> *Build real systems. OS + networks + databases + compilers.*

---

## Goal

Master the four core systems subdomains. By end of Phase 2, you should:

- Understand how operating systems work, end-to-end
- Understand how the internet works, end-to-end
- Understand how databases achieve consistency and durability
- Have built a compiler for a non-trivial language
- Be able to design and implement a multi-component system

---

## Active Topics

| Topic | Time | Map |
|---|---|---|
| Operating Systems | 200-300 hours | [[Learn-Operating-Systems]] |
| Networks | 150-250 hours | [[Learn-Networks]] |
| Databases | 200-300 hours | [[Learn-Databases]] |
| Compilers | 200-300 hours | [[Learn-Compilers]] |

Total: ~750-1150 hours = ~9-15 months at 20 hours/week

---

## Weekly Schedule (example)

Two topics active at a time (interleaved — see [[Interleaving-and-Spacing-in-Practice]]):

```mermaid
gantt
    title Phase 2 Week (Months 1-6: OS + Networks)
    dateFormat X
    axisFormat %a
    section Mon
    OS reading (90m) + Networks build (90m) :a1, 0, 1d
    section Tue
    Networks reading (90m) + OS build (90m) :a2, 1d, 1d
    section Wed
    OS (90m) + Networks (90m) :a3, 2d, 1d
    section Thu
    Networks (90m) + OS (90m) :a4, 3d, 1d
    section Fri
    Review + SR (90m) + build (90m) :a5, 4d, 1d
```

Switch topic pairs every 3-6 months.

---

## Build Projects (12-18)

By end of Phase 2, complete:

1. Modify xv6: add a syscall, implement a scheduler change
2. Implement a tiny log-structured filesystem in FUSE
3. Implement a basic TCP stack (in userspace, on raw IP)
4. Implement an HTTP/1.1 server from scratch
5. Implement a DNS resolver
6. Build a simple load balancer
7. Implement a KV store with WAL + B-tree + transactions
8. Implement a tiny SQL engine
9. Implement a sharded KV store with consistent hashing
10. Implement a JSON parser
11. Implement a Lisp interpreter (already done in Phase 1; extend it)
12. Implement a small ML-like language with type inference
13. Implement a C-subset compiler targeting LLVM IR
14. Implement a regex engine (NFA-based)
15. Implement a transpiler (custom language → JS)
16. Add an optimization pass to your compiler
17. Build a chat server (WebSocket)
18. Run Jepsen-style tests on a distributed system

---

## Canonical Reading (Tier 1)

### OS
- OSTEP
- Silberschatz et al., *Operating System Concepts*
- Bovet & Cesati, *Understanding the Linux Kernel*

### Networks
- Kurose & Ross, *Computer Networking: A Top-Down Approach*
- Stevens, *TCP/IP Illustrated Vol. 1*
- RFC 1122, 1123, 793 (and 9293)

### Databases
- Hellerstein et al., *Database Systems: The Complete Book* (Red Book)
- Kleppmann, *Designing Data-Intensive Applications*
- Garcia-Molina, Ullman, Widom, *Database Systems*

### Compilers
- Aho et al., *Compilers: Principles, Techniques, and Tools* (Dragon Book)
- Appel, *Modern Compiler Implementation in ML*
- SICP chapters 4-5
- Cooper & Torczon, *Engineering a Compiler*

---

## Threshold Concepts to Cross

- The process abstraction and virtual memory
- The end-to-end principle (networks)
- ACID and isolation levels (databases)
- The relational model and query optimization
- Lexing vs parsing; ASTs
- Recursive descent
- SSA form
- Hindley-Milner type inference
- The compilation pipeline

---

## Common Phase 2 Failure Modes

- **Reading without implementing**: reading the Dragon Book without writing a compiler
- **Using libraries instead of building**: using Express instead of writing an HTTP server
- **Skipping the hard parts**: avoiding TCP, avoiding type inference, avoiding query optimization
- **Premature specialization**: jumping to distributed systems before mastering OS/networks/DB
- **Tutorial-driven learning**: following tutorials instead of building from spec

---

## Phase 2 Exit Criteria

Move to Phase 3 when you can:

- [ ] Implement a basic OS feature in xv6 or Linux
- [ ] Implement a working TCP stack (or a substantial subset)
- [ ] Explain the entire HTTP request/response cycle from socket to application
- [ ] Build a KV store with WAL, B-tree, and transactions
- [ ] Build a SQL engine that handles JOIN, GROUP BY, basic optimization
- [ ] Build a compiler for a non-trivial language with type inference
- [ ] Read code in: Linux kernel, PostgreSQL, LLVM (not all, but enough to navigate)
- [ ] Diagnose a performance problem using profilers, not guessing
- [ ] Design a multi-component system (e.g., a chat system, a URL shortener)

---

## Cross-Links

- [[Learn-Operating-Systems]] · [[Learn-Networks]] · [[Learn-Databases]] · [[Learn-Compilers]]
- [[Phase-1-Foundations]] — prerequisite
- [[Phase-3-Specialization]] — what comes next
- [[The-3-7-Year-Arc]] — the overview

← Back to [[The-3-7-Year-Arc]]
