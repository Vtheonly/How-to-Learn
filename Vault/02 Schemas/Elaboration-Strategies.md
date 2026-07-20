---
aliases: [Elaboration, Deep Elaboration, Self-Explanation]
tags: [schema, protocol]
---

# Elaboration Strategies

> *Connecting new information to existing knowledge.*

---

## Theory

Elaboration is the cognitive process of adding detail, context, and connection to new information. The **elaboration effect** (Craik & Lockhart, 1972; elaborated by Pressley et al., 1987) demonstrates that deeper, more meaningful processing produces better retention than shallow processing.

The "levels of processing" framework:

- **Shallow**: structural / phonemic features ("CAPS or lowercase?")
- **Intermediate**: semantic features ("what does this word mean?")
- **Deep**: elaborative ("how does this connect to what I know?")

Each level produces progressively better retention. Deep elaboration is the goal.

---

## CS Translation

Most CS learners elaborate shallowly:
- Highlighting (shallow)
- Re-reading (shallow)
- Copying notes (shallow)
- Memorizing definitions (intermediate)

Effective elaboration:
- Self-explanation: "why does this code do X?"
- Generation: "what would happen if I changed Y?"
- Connection: "how does this relate to Z that I already know?"
- Application: "where would I use this in a project?"

---

## Protocol: Five Elaboration Strategies

### Strategy 1 — Self-explanation

After every paragraph / function / proof step, ask:
- "Why is this true?"
- "What does this imply?"
- "What would happen if this assumption didn't hold?"
- "Why did the author do it this way, not another?"

Write your answers in your notes. The act of generating answers is the elaboration.

### Strategy 2 — Generation

Generate, don't recognize:
- After reading an algorithm, write it from memory
- After reading a paper, write a summary without looking
- After learning a concept, generate your own example
- After reading code, predict what it does before running

Generation is harder than recognition; that's why it works.

### Strategy 3 — Concrete-abstract cycling

Move between concrete and abstract:
- Read abstract definition
- Generate concrete example
- Read another concrete example
- Re-formulate abstract definition
- Generate edge case

Each cycle deepens the schema.

### Strategy 4 — Connection elaboration

For each new concept, list 3 connections:
- "This is similar to X because..."
- "This is different from Y because..."
- "This is a special case of Z because..."

The connections themselves are retrievable structures.

### Strategy 5 — Question generation

After learning a concept, generate 5 questions about it:
- A definition question
- A "why" question
- A "what if" question
- A comparison question
- An application question

These questions become your retrieval practice cards (see [[Spaced-Repetition-Queue]]).

---

## Worked Example: Elaborating on "Two-Phase Commit"

You've just read the Wikipedia article on two-phase commit (2PC). Naive elaboration: copy the definition. Effective elaboration:

### Self-explanation
- "Why two phases? Because the coordinator needs to ensure all participants can commit before asking them to commit. If it skipped phase 1, some participants might fail mid-commit, leaving the system inconsistent."
- "What if the coordinator fails between phase 1 and phase 2? Participants are blocked — they've locked resources but don't know whether to commit or abort. This is the blocking problem."
- "Why does the coordinator log a 'commit' record? So that if it crashes and recovers, it knows the decision was made and can inform participants who are still blocked."

### Generation
- Write the 2PC protocol from memory. Compare to the article.
- Predict: what happens if a participant crashes in phase 2? (Check your prediction.)

### Concrete-abstract cycling
- Abstract: coordinator + participants + 2 phases + log
- Concrete: PostgreSQL prepared transactions
- Re-abstract: distributed atomic commitment
- Edge case: what if a participant lies about its vote? (Byzantine — 2PC fails.)

### Connection
- "This is similar to Paxos because both have a coordinator proposing values to participants."
- "This is different from Paxos because 2PC isn't fault-tolerant to coordinator failure, while Paxos is."
- "This is a special case of atomic commitment protocols; 3PC and PBFT extend it."

### Question generation
1. Define 2PC. (Definition)
2. Why does 2PC block on coordinator failure? (Why)
3. What if we add a third phase? (What if → 3PC)
4. Compare 2PC and Paxos on fault tolerance. (Comparison)
5. When would you use 2PC instead of Paxos? (Application)

Total time: ~30 min. Retention at 1 week: ~70%, vs ~20% for re-reading.

---

## Key Citations

- Craik, F. I. M., & Lockhart, R. S. (1972). Levels of processing: A framework for memory research. *Journal of Verbal Learning and Verbal Behavior, 11*(6), 671-684.
- Pressley, M., McDaniel, M. A., Turnure, J. E., Wood, E., & Ahmad, M. (1987). Generation and precision of elaboration: Effects on intentional and incidental learning. *Journal of Experimental Psychology: Learning, Memory, and Cognition, 13*(2), 291-300.
- Chi, M. T. H., De Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science, 18*(3), 439-477.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Testing-Effect-Retrieval-Practice]] — generation is a form of retrieval
- [[Building-Robust-Mental-Models]] — elaboration is operation 2 (schema elaboration)
- [[Concept-Note-Template]] — where elaboration outputs go

← Back to [[MOC-Schema-Construction]]
