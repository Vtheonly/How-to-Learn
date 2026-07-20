---
aliases: [Gentner, Structure Mapping, SMT]
tags: [theory, analogy, transfer]
---

# Structure Mapping Theory (Gentner)

> Gentner, D. (1983). Structure-mapping: A theoretical framework for analogy. *Cognitive Science, 7*(2), 155-170.

---

## Theory

Analogy is the cognitive operation that lets a learner take a well-understood schema from one domain (the *source*) and project it onto a new domain (the *target*), transferring relational structure.

Gentner's Structure Mapping Theory (SMT) specifies how this works:

1. **Alignment** — find a structural correspondence between source and target. Match relations, not objects. "Atom : nucleus :: solar system : sun" works because the relation (orbital attraction) matches, even though the objects (atoms, planets) are dissimilar.

2. **Projection** — carry over predicates from source to target that are consistent with the alignment. If the source has a predicate `orbits(nucleus, electron)`, project `orbits(sun, planet)`.

3. **Inference** — generate new candidate inferences about the target. If the source has `mass(sun) >> mass(planet)`, infer `mass(nucleus) >> mass(electron)` — even if you haven't measured it yet.

The key principle: **relations matter, surface features don't.** Good analogies preserve relational structure; bad analogies match surface features and break under projection.

This is why analogies like "the CPU is the brain of the computer" are pedagogically useless — the relation "thinking" doesn't project cleanly onto "executing instructions." Whereas "a cache is like a refrigerator near your desk" is a *good* analogy: the relation "fast access to frequently-used items at the cost of small capacity" projects cleanly.

---

## CS Translation

CS is unusually rich in cross-domain isomorphisms because the field is largely about *abstract structure*. Examples of structure-mapped analogies that accelerate learning:

| Source schema | Target domain | Transferred relation |
|---|---|---|
| Water flow | Electrical current | Pressure ≈ voltage; flow ≈ current; constriction ≈ resistance |
| Filesystem hierarchy | DOM tree / AST | Recursive traversal; parent-child; path = sequence of edges |
| Postal system | TCP/IP layers | Encapsulation at each layer; address at each layer; routing at each layer |
| Restaurant kitchen | CPU pipeline | Stations ≈ pipeline stages; order ticket ≈ instruction; chef ≈ ALU |
| Library catalog | Hash index | Lookup by key; bucket = shelf; collisions = same shelf |
| Bank ledger | Blockchain / WAL | Append-only; ordered; tamper-evident |

Each analogy carries 5-20 inferences for free if the structural alignment is good.

---

## Protocol: Using Analogies to Learn Faster

1. **When you hit a hard concept, search for a source.** Ask: "What do I already know that has the same *shape*?" Not the same *words* — the same *relations*.

2. **Write out the alignment explicitly.** Source objects → target objects. Source relations → target relations. If you can't fill the table, the analogy is bad.

3. **Test the analogy by projecting an inference.** "If the source has property P, does the target have P?" If yes, the analogy is structurally valid. If no, you've hit a disanalogy — note it.

4. **Track disanalogies.** Every analogy breaks somewhere. Knowing *where* it breaks is half the value. ("Cache ≠ refrigerator: caches can be invalidated; refrigerators can't.")

5. **Don't use analogies as explanations; use them as scaffolding.** Once the target schema is built, discard the analogy. The expert doesn't think "cache = refrigerator" — they think "cache."

---

## Worked Example: Monads via Structure Mapping

The classic novice trap: trying to understand monads via the "burrito" analogy (surface match — both "wrap" things). This fails because the wrapping relation doesn't capture the *bind* operation.

A better source: **option types** (already familiar to most CS learners).

| Source: `Option<T>` | Target: `Monad M<T>` | Relation transferred |
|---|---|---|
| `Some(x)` | `M.pure(x)` | Wraps a value |
| `None` | (varies) | Empty case |
| `flatMap(f)` | `bind(f)` | Sequences computations |
| Type signature `T -> Option<U>` | Type signature `T -> M<U>` | Continuation shape |

Project: "A monad is anything with `pure` and `bind` satisfying the three laws, just like `Option` is." This carries 80% of the operational understanding of monads in one analogy.

---

## Key Citations

- Gentner, D. (1983). Structure-mapping. *Cognitive Science, 7*(2), 155-170.
- Gentner, D., & Markman, A. B. (1997). Structure mapping in analogy and similarity. *American Psychologist, 52*(1), 45-56.
- Holyoak, K. J., & Thagard, P. (1995). *Mental Leaps: Analogy in Creative Thought*. MIT Press.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Isomorphism-Detection]] — operational protocol for finding analogies
- [[Cross-Domain-Transfer]] — broader framework
- [[Cognitive-Flexibility-Theory]] — analogies across ill-structured domains
- [[Schema-Theory-and-Anderson]] — analogies build new schemas

← Back to [[MOC-Foundations]]
