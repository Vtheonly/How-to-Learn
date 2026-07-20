---
aliases: [Concept Note, Concept Template]
tags: [template, concept]
---

# 📋 Concept Note Template

> *The atomic unit of your knowledge base. One concept per note.*

---

## Template

```markdown
---
type: concept-note
concept: <<name>>
date: <% tp.date.now("YYYY-MM-DD") %>
last-revised: <<date>>
status: <<draft | revised | consolidated>>
tags: [concept, <<topic1>>, <<topic2>>]
---

# <<Concept Name>>

## Definition (in your own words)

<<Precise definition. If you can't write it, you don't understand it.>>

## Canonical name & aliases

- Canonical: <<name>>
- Aliases: <<other names>>
- Notation: <<if applicable>>

## Worked example

<<A concrete example. Non-negotiable: a concept without an example is a definition, not a schema.>>

## Counter-example

<<Something that *looks* like this concept but isn't. State precisely why.>>

## Invariants

<<What must be true for this concept to apply? 2-5 invariants.>>

- <<invariant 1>>
- <<invariant 2>>
- <<invariant 3>>

## Boundary cases

<<Where does the concept break down? What inputs are ambiguous?>>

- <<boundary 1>>
- <<boundary 2>>

## Integration with existing schemas

<<How does this connect to what you already know? 2-3 connections.>>

- Similar to [[<<concept A>>]] because <<
- Different from [[<<concept B>>]] because <<
- Specializes [[<<concept C>>]] because <<

## Applications

<<Where does this show up in practice?>>

- <<application 1>>
- <<application 2>>

## Common misconceptions

<<Where do people (including your past self) go wrong?>>

- <<misconception 1>>
- <<misconception 2>>

## SR cards

<<Add 2-3 cards here using the [[Spaced-Repetition-Queue|SR format]].>>

What is <<X>>?
?
<<answer>>

## Source

- Primary: <<book / paper / chapter>>
- Secondary: <<other references>>

## Links

- [[<<related concept>>]]
- [[<<related concept>>]]
- [[<<schema map>>]]
```

---

## When to Use

For every new concept you learn. The template operationalizes [[Building-Robust-Mental-Models]].

---

## The Concept Note Lifecycle

1. **Draft** (during learning loop): fill in Definition, Worked example, Source
2. **Revised** (within 1 week, during weekly review): fill in Invariants, Boundary cases, Integration, Applications
3. **Consolidated** (within 1 month, during monthly review): fill in Common misconceptions, SR cards; cross-link to other notes

If a note stays in Draft for >2 weeks, either revise or delete.

---

## Cross-Links

- [[Building-Robust-Mental-Models]] — the protocol this template operationalizes
- [[Schema-Map-Note]] — for connecting concept notes
- [[Knowledge-Consolidation-Workflow]] — the lifecycle
- [[Spaced-Repetition-Queue]] — for SR cards

← Back to [[09-Templates/]]
