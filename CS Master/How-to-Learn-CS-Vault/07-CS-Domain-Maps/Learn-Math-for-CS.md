---
aliases: [Learn Math for CS, Math for CS Learning Map]
tags: [domain-map, math-for-cs]
---

# 🗺️ Learn Math for CS



---

## Threshold Concepts

- **Proof by induction** — the foundational proof technique for recursion, data structures, algorithms
- **Sets, relations, functions** — the language of all of CS
- **Combinatorics** — counting, permutations, combinations; required for probability
- **Graph theory basics** — nodes, edges, paths, cycles; the substrate of networks, compilers, dependencies
- **Modular arithmetic** — required for cryptography, hashing, distributed systems
- **Logical quantifiers (∀, ∃)** — required for spec writing, formal methods, ML
- **Asymptotic notation (O, Ω, Θ)** — required for algorithm analysis
- **Linear algebra basics** — vectors, matrices, eigenvalues; required for ML, graphics
- **Probability basics** — distributions, expectation, variance; required for ML, randomized algorithms, performance analysis

---

## Canonical Sources (Tier 1 — read deeply)

- **Discrete math**: Rosen, *Discrete Mathematics and Its Applications* (or alternatively, MIT 6.042J notes by Lehman, Leighton, Meyer — free)
- **Linear algebra**: Strang, *Introduction to Linear Algebra* (4th ed.) + MIT 18.06 video lectures
- **Probability**: Bertsekas & Tsitsiklis, *Introduction to Probability* (or Blitzstein & Hwang, *Introduction to Probability*)
- **Proofs**: Velleman, *How to Prove It* (the single best book on proof technique)

---

## Reference Index (Tier 2 — on demand)

- Knuth, *Concrete Mathematics* (for harder combinatorics and asymptotic analysis)
- Axler, *Linear Algebra Done Right* (more theoretical than Strang)
- Cover & Thomas, *Elements of Information Theory* (when you need info-theoretic arguments)
- Tao, *Analysis I* (if you want deeper mathematical maturity)

---

## Common Failure Modes

- **Trying to learn math without doing proofs.** Reading a math book without doing exercises is consumption, not learning.
- **Treating math as a prerequisite to be "passed."** Math is the language; you'll keep using it forever.
- **Skipping linear algebra.** Even if you don't do ML, linear algebra shows up in graphics, networks, and algorithms.
- **Using "intuitive" sources instead of rigorous ones.** 3Blue1Brown is great as a supplement, not a substitute.
- **Notation avoidance.** Learn the symbols. The notation is the tool.

---

## Build Projects

1. Implement a proof checker for propositional logic
2. Implement matrix operations from scratch (multiplication, inverse, eigendecomposition)
3. Implement a simple RSA encryption library (uses modular arithmetic)
4. Implement a basic random walk simulator and verify theoretical predictions
5. Prove correctness of 5 classic algorithms (induction)
6. Build a Markov chain text generator (uses probability + linear algebra)

---

## Triage Shortcuts

- Prefer books over YouTube for first exposure (denser, more rigorous)
- Skip "math for CS" survey books; learn from real math books
- Don't read math linearly; read with a question (see [[Schema-Driven-Querying]])
- For exercises: if you can't solve in 30 min, look at the solution, then re-solve from scratch next day
- Use Anki for definitions and theorem statements, not for proofs

---

## Estimated Time

**200-400 hours** for solid competence in discrete math + linear algebra + probability.
This is roughly 6 months at 10 hours/week, or 1 year at 5 hours/week.

Don't try to compress further. Math schemas need consolidation time.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
