---
aliases: [Transfer, Far Transfer, Near Transfer]
tags: [schema, transfer, theory]
---

# Cross-Domain Transfer

> *How learned schemas generalize to new problems.*

---

## Theory

Transfer is the application of prior learning to a new problem. Two types:

- **Near transfer**: transfer to a similar domain (e.g., applying C指针 to Go pointers)
- **Far transfer**: transfer to a dissimilar domain (e.g., applying queueing theory to compiler optimization)

Near transfer happens automatically and frequently. Far transfer is rare, hard, and the mark of expert thinking. Most "genius" in CS is far transfer: seeing that the structure of one field applies to another.

The literature is sobering: far transfer is **notoriously difficult to induce**. Most formal instruction produces near transfer only. Far transfer seems to emerge from:

1. **Deep abstraction**: schemas stripped of surface features
2. **Multiple-domain practice**: applying the same schema in 3+ domains
3. **Explicit analogy**: deliberately mapping source to target (see [[Structure-Mapping-Theory]])
4. **Time**: far transfer appears to develop over years, not weeks

---

## CS Translation

CS is a transfer-rich field because of its mathematical foundation. Many "different" topics are the same math in different dress:

- Type systems and logic (Curry-Howard)
- Concurrency and linear logic
- Causal ordering and partial orders
- Hash tables and modular arithmetic
- Compression and information theory
- Compilers and theorem provers
- Distributed consensus and Byzantine generals

A learner who internalizes the abstract math can transfer across CS subfields effortlessly. A learner who internalizes only the surface syntax cannot.

---

## Protocol: Engineering Transfer

### Step 1 — Learn concepts at multiple levels of abstraction

For each concept, learn:
- The concrete instance (e.g., Python `dict`)
- The abstract concept (e.g., hash map)
- The mathematical structure (e.g., function from keys to values with collision handling)

The middle level is what transfers. The concrete level is too specific; the math level is too abstract.

### Step 2 — Practice the same concept in 3+ domains

For "hash map":
- Python `dict`
- C++ `unordered_map`
- A custom implementation (open addressing vs chaining)
- Database hash index
- A Bloom filter (variant)

Each implementation deepens the abstract schema.

### Step 3 — Use deliberate analogies

When learning a new concept, *force* yourself to find 2-3 analogies in domains you already know. Write them down. (See [[Isomorphism-Detection]].)

### Step 4 — Cross-domain problem-solving

Occasionally solve problems in domain B using tools from domain A:

- Solve a concurrency problem using queueing theory
- Solve a database problem using compiler techniques
- Solve a networking problem using compiler/parser techniques

This is uncomfortable; that's the point. Discomfort signals transfer is happening.

### Step 5 — Maintain a "schema map" of your knowledge

Use [[Schema-Map-Note]]s to record cross-domain connections. The map itself becomes a transfer engine: when you encounter a new domain, you scan the map for likely matches.

---

## Worked Example: Transfer from Logic to Type Systems

A learner knows propositional logic. They're learning typed lambda calculus.

### Step 1 — Multiple levels of abstraction
- Concrete: Haskell's `Maybe`, `Either`
- Abstract: sum types, product types, function types
- Mathematical: intuitionistic propositional logic

### Step 2 — Practice in 3+ domains
- Haskell
- Rust (`Option`, `Result`)
- TypeScript (conditional types)
- OCaml (variants)

### Step 3 — Analogies
- Logic: `A ∧ B` ↔ Type: `(A, B)` (product type)
- Logic: `A ∨ B` ↔ Type: `Either A B` (sum type)
- Logic: `A → B` ↔ Type: `A -> B` (function type)
- Logic: `A ⊢ B` ↔ Type: `A -> B` (implication / function)
- Logic: proof ↔ Type: program (Curry-Howard)

### Step 4 — Cross-domain
Use type-theoretic reasoning to prove program properties. Use proof techniques to design type systems.

### Step 5 — Schema map
Write a [[Schema-Map-Note]] linking logic and type theory. Reference when encountering either.

After this exercise, the learner can read *any* logic-paper as a type-theory paper and vice versa. Two domains for the price of one.

---

## Common Failure Modes

- ❌ Surface transfer ("this code looks like that code") — no structural alignment
- ❌ Over-generalization ("everything is a state machine") — true but useless
- ❌ No transfer attempt ("I'll just learn this from scratch") — wastes the schemas you have
- ❌ Premature transfer ("this is just like X" before verifying) — leads to wrong inferences

---

## Key Citations

- Singley, M. K., & Anderson, J. R. (1989). *Transfer of Cognitive Skill*. Harvard University Press.
- Salomon, G., & Perkins, D. N. (1989). Rocky roads to transfer: Rethinking mechanisms of a neglected phenomenon. *Educational Psychologist, 24*(2), 113-142.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Structure-Mapping-Theory]] — formal mechanism
- [[Isomorphism-Detection]] — operational protocol
- [[Schema-Theory-and-Anderson]] — what gets transferred
- [[Cognitive-Flexibility-Theory]] — multi-case practice

← Back to [[MOC-Schema-Construction]]
