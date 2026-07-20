---
aliases: [Phase 3, Specialization Phase, Year 4-6]
tags: [roadmap, phase]
---

# Phase 3 — Specialization (Year 4-6)

> *Distributed systems + ML + one depth area. Build research-level understanding.*

---

## Goal

Move from "competent generalist" to "deep specialist." By end of Phase 3, you should:

- Be able to read current research papers in your specialization
- Be able to design and implement a non-trivial distributed system
- Be able to design and train non-trivial ML models
- Have one additional depth area of your choice
- Be able to critically evaluate work in your specialization

---

## Active Topics

| Topic | Time | Map |
|---|---|---|
| Distributed systems | 300-400 hours | [[Learn-Distributed-Systems]] |
| Machine learning | 300-400 hours | [[Learn-ML]] |
| Depth area of choice | 200-400 hours | (varies) |

Total: ~800-1200 hours = ~10-15 months at 20 hours/week

---

## Depth Area Options

Pick **one** of:

- **Programming languages / type theory**: [[Learn-Programming-Languages]]
- **Graphics / rendering**: real-time rendering, ray tracing, GPU programming
- **Security**: applied crypto, systems security, network security
- **Formal methods**: theorem proving, model checking, program verification
- **Numerical methods / scientific computing**: HPC, parallel computing
- **Robotics**: control, perception, planning
- **Computational biology**: bioinformatics, structural modeling
- **Quantum computing**: quantum algorithms, quantum information

Choose based on: (a) what excites you, (b) what complements your distributed/ML work, (c) what has career potential.

---

## Weekly Schedule (example)

```mermaid
gantt
    title Phase 3 Week
    dateFormat X
    axisFormat %a
    section Mon
    Distributed (90m) + ML (90m) :a1, 0, 1d
    section Tue
    ML (90m) + Depth area (90m) :a2, 1d, 1d
    section Wed
    Distributed (90m) + Depth area (90m) :a3, 2d, 1d
    section Thu
    ML (90m) + Distributed (90m) :a4, 3d, 1d
    section Fri
    Review + paper reading (90m) + build (90m) :a5, 4d, 1d
```

~22 hours/week of deep work.

---

## Build Projects (10-15)

1. Implement Raft (leader election + log replication)
2. Build a sharded KV store with Raft replication
3. Run Jepsen tests on your distributed system
4. Implement vector clocks; detect concurrent writes
5. Implement a CRDT (G-Counter, OR-Set)
6. Build a tiny MapReduce
7. Implement linear regression + logistic regression from scratch
8. Implement a small neural net for MNIST from scratch
9. Implement backprop by hand (micrograd-style)
10. Build a small Transformer from scratch (nanoGPT-style)
11. Reproduce a classic ML paper (e.g., AlexNet on CIFAR)
12. Implement an end-to-end ML pipeline (data → train → eval → deploy)
13. Implement a small RL agent (DQN)
14. Build 3-5 projects in your depth area
15. Contribute to an open-source project in your specialization

---

## Canonical Reading (Tier 1)

### Distributed systems
- Kleppmann, *DDIA*
- Tanenbaum & Van Steen, *Distributed Systems*
- Lamport (1978), "Time, Clocks"
- Lamport, "Paxos Made Simple"
- Ongaro & Ousterhout (2014), Raft paper
- Gilbert & Lynch (2002), CAP formal proof
- FLP (1985)

### ML
- Bishop, *PRML*
- Hastie et al., *ESL* (free)
- Goodfellow et al., *Deep Learning* (free)
- Karpathy, "Neural Networks: Zero to Hero"
- Transformer paper (Vaswani et al. 2017)

### Depth area (varies)
See the relevant learning map.

---

## Threshold Concepts to Cross

- Happened-before (Lamport 1978)
- Quorum intersection
- FLP impossibility
- Linearizability vs serializability vs eventual consistency
- CAP theorem (formal version)
- Bias-variance tradeoff
- Gradient descent and the chain rule
- Backpropagation
- Overfitting and regularization
- Train/val/test methodology

---

## Common Phase 3 Failure Modes

- **Treating distributed systems as "advanced databases"**: distributed systems has its own foundations (Lamport, FLP, CAP) that databases don't cover
- **Skipping the math in ML**: trying to learn ML without linear algebra + probability
- **Using sklearn without implementing**: never implementing algorithms from scratch
- **Chasing SOTA**: reading only recent papers without foundations
- **No depth area**: staying broad, never going deep

---

## Phase 3 Exit Criteria

Move to Phase 4 when you can:

- [ ] Read current research papers in distributed systems without struggle
- [ ] Implement Raft or Paxos from scratch, with tests
- [ ] Diagnose consistency anomalies in a distributed system
- [ ] Read current ML papers and implement the core algorithm
- [ ] Train a non-trivial model from scratch and reproduce a paper's results
- [ ] Critically evaluate ML papers (find flaws, not just summarize)
- [ ] Contribute a non-trivial PR to an open-source project
- [ ] Build an end-to-end system in your depth area
- [ ] Explain your specialization to a non-expert

---

## Cross-Links

- [[Learn-Distributed-Systems]] · [[Learn-ML]] · [[Learn-Programming-Languages]]
- [[Phase-2-Systems-Depth]] — prerequisite
- [[Phase-4-Convergence]] — what comes next
- [[The-3-7-Year-Arc]] — the overview

← Back to [[The-3-7-Year-Arc]]
