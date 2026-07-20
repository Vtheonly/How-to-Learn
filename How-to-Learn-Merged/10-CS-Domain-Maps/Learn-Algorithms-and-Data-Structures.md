---
aliases: [Learn Algorithms and Data Structures, Algorithms and Data Structures Learning Map]
tags: [domain-map, algorithms-and-data-structures]
---

# 🗺️ Learn Algorithms and Data Structures



---

## Threshold Concepts

- **O/Omega/Theta notation** — must be fluent, not just "know"
- **Induction on input size** — the analysis technique
- **Recursion** — and the relationship between recursion and induction
- **The pointer/indirection** — the universal CS primitive
- **Tree traversal** — pre/in/post-order; recursive and iterative
- **Graph traversal** — BFS, DFS; when each is appropriate
- **Divide and conquer** — and the master theorem
- **Dynamic programming** — the threshold that takes longest to cross
- **Amortized analysis** — the concept that "average cost per operation" can be bounded

---

## Canonical Sources (Tier 1 — read deeply)

- **CLRS** (*Introduction to Algorithms*) — the standard reference. Read fully.
- **Sedgewick & Wayne, *Algorithms*** (4th ed.) — better visualizations, more practical
- **Kleinberg & Tardos, *Algorithm Design*** — best for design intuition
- **Skiena, *The Algorithm Design Manual*** — best for "real-world" application

---

## Reference Index (Tier 2 — on demand)

- Knuth, *TAOCP* vol. 1 & 3 (for deep treatment of specific topics)
- Tarjan, *Data Structures and Network Algorithms*
- Erickson, *Algorithms* (free, modern, http://jeffe.cs.illinois.edu/teaching/algorithms/)
- Okasaki, *Purely Functional Data Structures* (for FP angle)

---

## Common Failure Modes

- **Reading CLRS without doing problems.** Reading alone produces zero algorithms skill.
- **Memorizing algorithms instead of derivations.** Memorize the *derivation*, then re-derive.
- **Avoiding dynamic programming.** It's hard. Spend 2-3 weeks exclusively on it.
- **Not implementing.** Implement every algorithm you learn, from scratch.
- **Only doing "easy" problems.** Growth happens at the edge (see [[Deliberate-Practice]]).
- **Skipping graph algorithms.** They're foundational for networks, compilers, distributed systems.

---

## Build Projects

1. Implement a balanced BST (AVL or red-black) from scratch
2. Implement a hash table with open addressing + chaining
3. Implement Dijkstra's and A* with correctness tests
4. Implement a B-tree
5. Implement union-find with path compression
6. Implement a skip list
7. Solve 30+ LeetCode "Medium" problems (mix of categories)
8. Solve 10+ LeetCode "Hard" problems (focus on DP and graph)
9. Implement a simple regex engine (uses NFA/DFA — connects to compilers)

---

## Triage Shortcuts

- For first exposure, prefer Sedgewick's visualizations over CLRS's formal style
- For design intuition, prefer Kleinberg-Tardos
- For implementation, prefer Skiena
- Advent of Code days 15+ are excellent DP/algorithm practice
- Avoid "cracking the coding interview" as a learning source — it's an interview prep source
- When stuck on a problem, *don't look at the solution immediately* — wait 24 hours first

---

## Estimated Time

**300-500 hours** for solid competence.
~12 months at 10 hours/week.

This is the single most important CS domain. Don't rush it.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
