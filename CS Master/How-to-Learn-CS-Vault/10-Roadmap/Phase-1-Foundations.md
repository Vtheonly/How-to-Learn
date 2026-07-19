---
aliases: [Phase 1, Foundations Phase, Year 1-2]
tags: [roadmap, phase]
---

# Phase 1 — Foundations (Year 1-2)

> *Build the substrate. Math + algorithms + intro systems.*

---

## Goal

Establish the cognitive and technical substrate that everything else builds on. By end of Phase 1, you should:

- Be fluent in proof by induction and asymptotic notation
- Have implemented all major data structures from scratch
- Be comfortable in C (or another systems language)
- Have built a basic shell, malloc, and HTTP server
- Understand the kernel/user boundary

---

## Active Topics

| Topic | Time | Map |
|---|---|---|
| Discrete math | 100-150 hours | [[Learn-Math-for-CS]] |
| Linear algebra | 60-100 hours | [[Learn-Math-for-CS]] |
| Probability | 60-100 hours | [[Learn-Math-for-CS]] |
| Algorithms & data structures | 200-300 hours | [[Learn-Algorithms-and-Data-Structures]] |
| Systems programming (C) | 150-200 hours | [[Learn-Systems-Programming]] |
| Intro OS | 100-150 hours | [[Learn-Operating-Systems]] |

Total: ~700-1000 hours = ~12-18 months at 15-20 hours/week

---

## Weekly Schedule (example)

```mermaid
gantt
    title Phase 1 Week
    dateFormat X
    axisFormat %a
    section Mon
    Math (90m) + Algorithms (90m) :a1, 0, 1d
    section Tue
    Algorithms (90m) + C programming (90m) :a2, 1d, 1d
    section Wed
    Math (90m) + OS reading (90m) :a3, 2d, 1d
    section Thu
    Algorithms (90m) + C build (90m) :a4, 3d, 1d
    section Fri
    Review + SR (90m) + Math (90m) :a5, 4d, 1d
    section Sat
    1 block + weekly review :a6, 5d, 1d
    section Sun
    Rest :a7, 6d, 1d
```

~22 hours/week of deep work.

---

## Build Projects (8-12)

By end of Phase 1, complete:

1. Implement a balanced BST (AVL or red-black) from scratch
2. Implement a hash table (open addressing + chaining)
3. Implement Dijkstra's and A*
4. Implement a B-tree
5. Implement a regex engine (NFA-based)
6. Implement a basic shell (CS:APP shell lab)
7. Implement malloc/free (CS:APP malloc lab)
8. Implement a tiny HTTP server in C
9. Implement a simple thread pool
10. Implement union-find with path compression
11. Solve 30+ LeetCode Medium + 10 Hard
12. Write a Lisp interpreter (SICP-style)

---

## Canonical Reading (Tier 1)

- Rosen, *Discrete Mathematics* (or MIT 6.042J notes)
- Strang, *Introduction to Linear Algebra* + 18.06 lectures
- Bertsekas & Tsitsiklis, *Introduction to Probability*
- Velleman, *How to Prove It*
- CLRS, *Introduction to Algorithms*
- Sedgewick & Wayne, *Algorithms*
- Kernighan & Ritchie, *The C Programming Language*
- Bryant & O'Hallaron, *Computer Systems: A Programmer's Perspective*
- OSTEP (https://pages.cs.wisc.edu/~remzi/OSTEP/)
- SICP (https://mitpress.mit.edu/sites/default/files/sicp/index.html)

---

## Threshold Concepts to Cross

- Proof by induction
- Asymptotic notation (O/Ω/Θ)
- Recursion → induction
- Pointer and indirection
- The stack vs the heap
- System calls vs function calls
- Tree traversal (recursive and iterative)
- Graph traversal (BFS, DFS)
- Dynamic programming
- Amortized analysis

---

## Common Phase 1 Failure Modes

- **Math avoidance**: trying to learn algorithms without proof technique
- **Reading without building**: doing CLRS problems in your head, never coding them
- **Tutorial loops**: doing tutorial after tutorial without escalating difficulty
- **Premature breadth**: trying to learn ML or distributed systems before algorithms
- **Skipping C**: jumping to Python/Go and never learning how memory works
- **Skipping SICP**: missing the conceptual foundation SICP provides

---

## Phase 1 Exit Criteria

Move to Phase 2 when you can:

- [ ] Prove correctness of an algorithm by induction
- [ ] Analyze time/space complexity of any code you write
- [ ] Implement any standard data structure from scratch in <1 hour
- [ ] Read C code fluently; debug with gdb, not print
- [ ] Implement a basic shell from scratch
- [ ] Implement malloc/free that passes stress tests
- [ ] Explain virtual memory, processes, and the system call interface
- [ ] Solve LeetCode Hard problems in <30 min
- [ ] Write a Lisp interpreter

If you can't do all of these, don't move on. Foundations compound; gaps compound too.

---

## Cross-Links

- [[Learn-Math-for-CS]] · [[Learn-Algorithms-and-Data-Structures]] · [[Learn-Systems-Programming]] · [[Learn-Operating-Systems]]
- [[Phase-2-Systems-Depth]] — what comes next
- [[The-3-7-Year-Arc]] — the overview
- [[Deliberate-Practice]] — the methodology

← Back to [[The-3-7-Year-Arc]]
