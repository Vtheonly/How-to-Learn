---
aliases: [Learn Compilers, Compilers Learning Map]
tags: [domain-map, compilers]
---

# 🗺️ Learn Compilers



---

## Threshold Concepts

- **Lexing vs parsing** — the distinction matters
- **Regular languages vs context-free** — and why
- **Abstract syntax trees** — vs concrete syntax trees
- **Recursive descent** — and why it dominates hand-written parsers
- **Visitor pattern** — the standard AST traversal
- **Symbol tables** — scope, environments, lookups
- **Static vs dynamic semantics** — and the boundary
- **SSA form** — modern intermediate representation
- **Continuation-passing style** — the conceptual underpinning

---

## Canonical Sources (Tier 1 — read deeply)

- **Aho, Lam, Sethi, Ullman, *Compilers: Principles, Techniques, and Tools*** (the "Dragon Book") — the classic
- **Appel, *Modern Compiler Implementation in ML/C/Java*** — pick the ML version
- **SICP chapter 4 + 5** (free, https://mitpress.mit.edu/sites/default/files/sicp/index.html) — metacircular evaluator, register machine
- **Cooper & Torczon, *Engineering a Compiler*** — modern, practical

---

## Reference Index (Tier 2 — on demand)

- *Essentials of Programming Languages* (Friedman, Wand, Haynes) — for interpreters
- *Types and Programming Languages* (Pierce) — for type systems
- *Programming Language Pragmatics* (Scott) — broad survey
- The LLVM tutorial (https://llvm.org/docs/tutorial/)
- Sussman's SICP video lectures

---

## Common Failure Modes

- **Reading the Dragon Book without implementing.** The Dragon Book is dense; only implementation makes it stick.
- **Skipping SICP.** SICP 4-5 gives you the conceptual foundation in a way the Dragon Book can't.
- **Treating parsing as the whole compiler.** Parsing is ~20% of the work.
- **Using parser generators without writing a recursive descent parser first.** Learn the manual version first.
- **Ignoring code generation.** "Compiling to bytecode" or "to JS" is fine; don't stop at AST.

---

## Build Projects

1. Implement a JSON parser (recursive descent)
2. Implement a Lisp interpreter (SICP-style metacircular evaluator)
3. Implement a small ML-like language with type inference (Hindley-Milner)
4. Implement a C-subset compiler targeting x86-64 or LLVM IR
5. Implement a regex engine (NFA-based)
6. Add an optimization pass (constant folding, dead code elimination)
7. Write a transpiler (e.g., custom language → JS)

---

## Triage Shortcuts

- Start with SICP 4-5 (conceptual foundation)
- Then a small compiler (Appel or the LLVM tutorial)
- Dragon Book as reference, not first read
- Crafting Interpreters (craftinginterpreters.com) is excellent for first-timers
- For type systems, Pierce after SICP

---

## Estimated Time

**300-500 hours** for solid compiler competence.
~12 months at 10 hours/week.

Prerequisite: algorithms, discrete math, systems programming.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
