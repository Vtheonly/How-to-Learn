---
aliases: [Learn Programming Languages and Type Theory, Programming Languages and Type Theory Learning Map]
tags: [domain-map, programming-languages-and-type-theory]
---

# 🗺️ Learn Programming Languages and Type Theory



---

## Threshold Concepts

- **Syntax vs semantics** — and the gap between them
- **Operational, denotational, axiomatic semantics** — the three big approaches
- **The lambda calculus** — the foundation
- **Lexical vs dynamic scope** — and why lexical wins
- **Closures** — functions + environments
- **Continuations** — control flow as data
- **Type systems as static analysis** — and Curry-Howard
- **Parametric polymorphism** — generics done right
- **Soundness vs completeness** — and the trade-offs

---

## Canonical Sources (Tier 1 — read deeply)

- **Pierce, *Types and Programming Languages*** (TaPL) — the modern standard
- **Harper, *Practical Foundations for Programming Languages*** (PFPL) — more rigorous
- **SICP** (full book, but especially chapters 1-4)
- **Friedman & Felleisen, *The Little Schemer*** series — for recursion and continuations

---

## Reference Index (Tier 2 — on demand)

- *Concepts in Programming Languages* (Mitchell)
- *Programming Language Pragmatics* (Scott)
- Cardelli & Wegner (1985), "On Understanding Types, Data Abstraction, and Polymorphism"
- Wadler's papers (esp. "Theorems for Free")
- The Lambda Papers (Sussman & Steele, 1975-1980)

---

## Common Failure Modes

- **Reading TaPL without doing exercises.** Pierce's exercises are the value.
- **Skipping lambda calculus.** It's the math; everything else is notation.
- **Treating "Haskell" as "type theory."** Haskell is one instance; the theory is broader.
- **Avoiding continuations.** They're weird; that's the point.
- **Not implementing interpreters.** Implement at least 3 mini-languages.

---

## Build Projects

1. Implement a small Lisp interpreter (SICP-style)
2. Implement a simply-typed lambda calculus with type checker
3. Implement Hindley-Milner type inference
4. Add algebraic data types and pattern matching
5. Implement call/cc (continuations)
6. Implement a small ML-like language
7. Write a type checker for a structural type system

---

## Triage Shortcuts

- SICP first (always)
- Then TaPL with exercises
- Harper for more rigor
- Implement as you read — Pierce is best absorbed through code
- The Lambda Papers are old but exceptional

---

## Estimated Time

**300-500 hours** for solid PL/type theory competence.
~12 months at 10 hours/week.

Prerequisite: discrete math, basic functional programming, compilers.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
