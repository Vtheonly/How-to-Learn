---
aliases: [Schema Theory, Anderson ACT-R, Rumelhart Schemas]
tags: [theory, schema]
---

# Schema Theory (Rumelhart / Anderson)

> Rumelhart (1980); Anderson (1977); Anderson's ACT-R (1993)

---

## Theory

Knowledge is not stored as isolated facts. It is stored as **schemas** — structured patterns that capture the typical features and relations of a class of situations. Schemas live in long-term memory and are activated by cues in the environment.

When an expert sees a piece of code, they do not see individual tokens. They see *patterns*: "this is a producer-consumer queue," "this is a callback registration," "this is a two-phase commit." Each pattern is a schema. Recognition is fast (milliseconds) and cheap (low WM load) because the schema supplies the structure — the expert only has to encode what's *different* from the canonical pattern.

**Novices lack schemas.** They see tokens, not patterns. Every token occupies a WM slot. They drown quickly.

### Anderson's ACT-R formulation

ACT-R (Adaptive Control of Thought — Rational) models cognition as two memories:

- **Declarative memory** — facts and chunks ("a TCP segment has source port, dest port, sequence number, ack number, flags, window, checksum, urgent pointer, payload")
- **Procedural memory** — production rules ("IF I receive a SYN with no matching connection THEN send a SYN-ACK with my own sequence number")

Learning = compiling declarative chunks into procedural rules through practice. This is why you can *describe* how a system call works but not *use* it fluently — declarative precedes procedural, and procedural requires repetition.

---

## CS Translation

Every mature CS practitioner carries thousands of schemas. Examples:

- **Pattern-level**: producer-consumer, observer, visitor, two-phase commit, leader election, optimistic concurrency control, retry-with-exponential-backoff
- **System-level**: write-ahead log, B-tree, copy-on-write, capability-based security, monad, continuation
- **Failure-level**: thundering herd, split-brain, head-of-line blocking, time-of-check-to-time-of-use (TOCTOU), priority inversion

When an expert reads `git rebase --interactive`, they don't parse it as five English words. They activate the "interactive history rewriting" schema, which carries with it: commits as a DAG, replay semantics, conflict resolution points, force-push implications. One schema, ~30 facts loaded for free.

A novice without that schema reads the same words and must construct all 30 facts in WM from scratch. They fail.

---

## Protocol: Deliberate Schema Acquisition

1. **Name the schemas you encounter.** When you learn a new concept, name it explicitly. "This is a *write-ahead log*." Names anchor retrieval.

2. **Collect variants.** Don't learn "B-tree" once. Learn B+tree, B*tree, LSM-tree, Fractal tree. Each variant sharpens the schema by contrast.

3. **Build a personal pattern catalog.** Use the [[Concept-Note-Template]] for each schema. Within 2 years you should have 200-500 notes.

4. **Practice recognition, not recall.** Flashcards should show *examples* and ask "what pattern is this?" — not "define X." Recognition is the operative skill.

5. **Map isomorphisms explicitly.** When you see the same schema in two domains (e.g., a parser automaton and a network protocol state machine), write a [[Schema-Map-Note]] linking them. This is the highest-leverage activity in the vault.

---

## Worked Example: The "State Machine" Schema

A novice learns "state machine" once in a theory of computation course.

An expert has *one* state machine schema that fires across:

- TCP connection lifecycle (CLOSED → SYN-SENT → SYN-RECEIVED → ESTABLISHED → ...)
- Lexer state (START → IN_IDENTIFIER → IN_NUMBER → ...)
- Parser automaton (LR/LALR states)
- ML model decoding (beam search states)
- Distributed consensus (Paxos proposal rounds)
- UI component lifecycle (React mount/update/unmount)
- Database transaction (BEGIN → ACTIVE → COMMITTED/ABORTED)
- Reactive streams (subscriber states: idle → requesting → received → completed)

Each instance *reinforces the schema*. After 5+ instances, the schema is automatic. Learning a new state machine costs the expert ~30 minutes; the novice pays ~3 hours.

This is why experts accelerate: **each new topic costs less because the schemas are already there.**

---

## Key Citations

- Rumelhart, D. E. (1980). Schemata: The building blocks of cognition. In *Theoretical Issues in Reading Comprehension*.
- Anderson, J. R. (1977). Induction of augmented transition networks. *Cognitive Science, 1*(2), 125-157.
- Anderson, J. R. (1993). *Rules of the Mind*. Lawrence Erlbaum. [ACT-R]
- Chase, W. G., & Simon, H. A. (1973). Perception in chess. *Cognitive Psychology, 4*(1), 55-81. [chunking in chess experts]

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Long-Term-Working-Memory]] — schema activation bypasses WM limits
- [[Isomorphism-Detection]] — transferring schemas across domains
- [[Structure-Mapping-Theory]] — formal mechanism of analogical schema transfer
- [[Building-Robust-Mental-Models]] — operational schema construction

← Back to [[MOC-Foundations]]
