---
type: Roadmap
tags: [Roadmap]
created: 2026-07-20
updated: 2026-07-20
---

# R4 — Project-Based Learning Tracks

> Three canonical projects, one per pillar. Each project is large enough to require multiple schemas, deep enough to drive representative practice, and bounded enough to finish.

---

## The thesis

The research is unambiguous: **learning through building representative systems beats learning through topic coverage** (see [[01_Theory/T3 — Deliberate Practice|T3]] and the source research's section on historical CS pioneers).

This note gives you three project tracks. Pick one for Q3 of [[05_Roadmap/R1 — The 12-Month Study Sequence|R1]], and consider the others for year 2.

## How to choose a track

| If you want to be… | Choose… |
|--------------------|---------|
| A backend / distributed systems engineer | Track A: Distributed KV Store |
| An ML engineer / AI researcher | Track B: Transformer From Scratch |
| A language / tooling / systems engineer | Track C: Compiler |

If you're unsure, pick Track A. Distributed systems exercises the most schemas (S1, S2, S5, S6, S7, S8) and produces the broadest transfer.

---

## Track A — Distributed Key-Value Store

### What you will build

A multi-node, replicated, linearizable key-value store with:
- A Raft-based consensus protocol.
- A gRPC API (GET, PUT, DELETE).
- A persistent write-ahead log.
- A B+ tree or LSM-tree storage engine.
- Snapshotting and log compaction.
- Leader election, log replication, membership changes.

### Schemas exercised

- [[02_Schemas/S1 — State & Transition|S1 State]] — Raft state machine (follower/candidate/leader).
- [[02_Schemas/S2 — Graph & Reachability|S2 Graph]] — replication topology, quorum computation.
- [[02_Schemas/S5 — Information Flow|S5 Information Flow]] — request pipeline (RPC → log → state machine → response).
- [[02_Schemas/S6 — Memory & Locality|S6 Memory]] — page cache, in-memory index.
- [[02_Schemas/S7 — Concurrency & Coordination|S7 Concurrency]] — RPC concurrency, log replication under concurrent writes.
- [[02_Schemas/S8 — Probability & Uncertainty|S8 Probability]] — quorum intersection under failure.

### Phase plan

**Month 1 (skeleton)**:
- Read the Raft paper (Ongaro & Ousterhout 2014) using [[04_Protocols/P1 — How to Read a Research Paper|P1]].
- Write a 2-page design doc.
- Implement the RPC layer; nodes can talk to each other.
- Implement the Raft state machine skeleton: states + transitions, no real logic.

**Month 2 (core)**:
- Implement leader election.
- Implement log replication.
- Implement the storage engine (pick LSM or B+).
- Single-node correctness; multi-node consensus.

**Month 3 (production)**:
- Snapshotting, log compaction.
- Membership changes.
- Fault injection: kill nodes, partition network, observe behavior.
- Write a 2-page retrospective: what schemas did this deepen? Where did schemas mislead?

### Test of mastery

- Implement Raft leader election from memory in < 1 hour.
- Diagnose a stuck cluster by reading logs.
- Explain linearizability vs sequential consistency using your system as the example.
- Transfer: identify the same consensus schema in ZooKeeper, etcd, and PostgreSQL synchronous replication.

---

## Track B — Transformer From Scratch

### What you will build

A working transformer language model, end to end, including:
- A tensor library with autograd (no PyTorch).
- Tokenizer (BPE from scratch).
- Positional encoding.
- Multi-head attention.
- Layer norm, feed-forward layers, residual connections.
- Training loop with Adam optimizer.
- Text generation (greedy + sampling).
- Inference with KV cache.

### Schemas exercised

- [[02_Schemas/S4 — Optimization & Constraints|S4 Optimization]] — gradient descent, Adam.
- [[02_Schemas/S5 — Information Flow|S5 Information Flow]] — forward pass, backward pass, training loop.
- [[02_Schemas/S8 — Probability & Uncertainty|S8 Probability]] — softmax, sampling, cross-entropy.
- [[02_Schemas/S9 — Representation & Transformation|S9 Representation]] — embeddings, linear transformations.
- [[02_Schemas/S10 — Search & Inference|S10 Search]] — beam search, KV cache.

### Phase plan

**Month 1 (foundations)**:
- Implement a tensor library: forward ops (matmul, add, relu, softmax) + backward ops (autograd).
- Implement SGD and Adam.
- Train a logistic regression on MNIST to verify the library works.

**Month 2 (transformer core)**:
- Implement multi-head attention.
- Implement a 2-layer transformer.
- Train on a tiny corpus (Shakespeare). Verify loss goes down.

**Month 3 (production)**:
- Implement KV cache for fast inference.
- Implement BPE tokenizer.
- Train on a real dataset (TinyStories, OpenWebText subset).
- Write a 2-page retrospective: what schemas deepened? Where did intuition fail?

### Test of mastery

- Implement multi-head attention from memory in < 30 minutes.
- Derive backprop through softmax + cross-entropy on a whiteboard.
- Diagnose why training loss plateaued (gradient issues? data issue? architecture?).
- Transfer: identify attention's information-flow schema in DBMS query execution pipelines.

---

## Track C — Compiler

### What you build

A compiler for a small typed language, including:
- Lexer.
- Recursive descent parser.
- Type checker (Hindley-Milner or simple bidirectional).
- AST → IR lowering.
- SSA-based optimizer (constant folding, dead code elimination).
- Code generation (to x86-64 or to a bytecode VM).
- A mark-and-sweep garbage collector (if targeting a VM).

### Schemas exercised

- [[02_Schemas/S1 — State & Transition|S1 State]] — lexer and parser state machines.
- [[02_Schemas/S2 — Graph & Reachability|S2 Graph]] — AST, CFG, dataflow.
- [[02_Schemas/S3 — Tree & Hierarchy|S3 Tree]] — AST, dominator tree.
- [[02_Schemas/S5 — Information Flow|S5 Information Flow]] — pipeline: lex → parse → semant → IR → opt → codegen.
- [[02_Schemas/S6 — Memory & Locality|S6 Memory]] — register allocation, object layout.
- [[02_Schemas/S10 — Search & Inference|S10 Search]] — type inference as constraint solving.

### Phase plan

**Month 1 (front-end)**:
- Pick a small language (e.g., a subset of ML).
- Implement lexer and parser.
- Implement AST and pretty-printer.
- Test: parse 100 programs, including malformed ones.

**Month 2 (middle-end)**:
- Implement type checker.
- Lower to SSA-form IR.
- Implement 2 optimizations: constant folding, dead code elimination.

**Month 3 (back-end)**:
- Code generation to x86-64 (or to a stack-based VM).
- Implement a minimal GC.
- Run end-to-end programs.
- Write retrospective.

### Test of mastery

- Implement a lexer for a small grammar from memory.
- Diagnose a type-inference failure.
- Explain the SSA form and why it helps optimization.
- Transfer: identify the same pipeline schema (lex → parse → transform) in PostgreSQL query processing.

---

## Common rules across tracks

1. **From scratch** — no use of the canonical library (no etcd, no PyTorch, no LLVM). Reference implementations are for reading, not calling.
2. **Tests from day 1** — every module has unit tests; integration tests run on every commit.
3. **Public** — open-source the project. Public scrutiny is feedback.
4. **Retrospective** — end with a 2-page writeup: what schemas deepened, where schemas mislead, what would you do differently.
5. **Honest scope** — if the project is taking 5 months, cut scope. Finishing a small project teaches more than abandoning a large one.

## The single most important rule

> **Do not look at the reference implementation while writing your own.**

You may read the reference once, before starting, to understand the design. After that, the reference is closed. You will get stuck. The stuck-ness is the learning. If you peek, you replace generative production with copying, and the mastery gain collapses.

If you are stuck for > 2 hours on a single issue, you may consult the reference for **that specific issue only**. Then close it again.

## Cross-links

- [[05_Roadmap/R1 — The 12-Month Study Sequence|R1 12-Month Sequence]] — Q3 plan.
- [[05_Roadmap/R2 — Three Pillars Curriculum|R2 Three Pillars]] — which pillar each track belongs to.
- [[05_Roadmap/R3 — Mastery Rubric|R3 Mastery Rubric]] — the tests at the end of each track are level 5–6.
- [[01_Theory/T3 — Deliberate Practice|T3 Deliberate Practice]] — why projects must be hard.
- [[01_Theory/T8 — Adaptive Expertise|T8 Adaptive Expertise]] — projects force adaptive, not routine, expertise.

## Retrieval queue

#sr
- Name the 3 project tracks and which pillar each belongs to.
- For Track A (distributed KV), list the 6 schemas it exercises and one feature per schema.
- Why does the vault forbid consulting the reference implementation while writing your own?
- You're stuck on a bug for 90 minutes. What is the rule for consulting the reference?
- Why does Track A exercise the most schemas, and why does that matter for transfer?

---

> **Bottom line**: a finished small project teaches more than 10 abandoned large ones. Pick a track, scope it honestly, finish it, and write the retrospective. The retrospective is where the schema consolidation happens.
