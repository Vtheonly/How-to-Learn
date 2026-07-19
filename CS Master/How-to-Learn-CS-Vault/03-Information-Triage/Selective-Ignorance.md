---
aliases: [Selective Ignorance, Strategic Skipping]
tags: [triage, principle]
---

# Selective Ignorance

> *"Knowledge is of two kinds. We know a subject ourselves, or we know where we can find information upon it."* — Samuel Johnson, 1775

---

## Principle

In any information-rich domain, the dominant skill is **not acquisition but filtering**. The high-velocity learner is not the one who reads the most; they are the one who *ignores* the most.

This is empirically supported:

- **Information overload degrades decision quality** (Speier et al., 1999)
- **Marginal value of additional reading diminishes sharply** after the canonical sources are absorbed
- **Reading the wrong material first can interfere with learning the right material** (negative transfer; see [[Cognitive-Flexibility-Theory]])

Selective ignorance is *not* anti-intellectualism. It is the discipline of reserving deep cognitive investment for material that will compound.

---

## CS Translation

For a self-taught CS learner, the volume of "recommended" material is overwhelming. A typical "How to Learn CS" GitHub repo lists 100+ books, 50+ courses, 1000+ papers. Reading all of them is impossible. Reading the *wrong* 20% actively harms you by:

- Loading incorrect schemas that must later be unlearned
- Consuming time that should go to practice
- Creating false confidence ("I've read 30 books on X")
- Filling WM with details that crowd out structure

---

## The Three Tiers of Resources

### Tier 1 — Canonical (deep read)
- 3-5 sources per subdomain
- Universally cited by experts
- Read fully, multiple times
- Example: CLRS for algorithms; OSTEP for OS; Kleppmann for distributed systems

### Tier 2 — Contextual (skim)
- Sources that fill specific gaps in your understanding
- Read sections, not whole works
- Example: Stevens *TCP/IP Illustrated* vol. 1 — read the TCP chapter when implementing TCP, not before
- Reference-index: note what's there; come back when needed

### Tier 3 — Ignorable (skip)
- Marketing material
- "Top 10 things you need to know about X" blog posts
- Books that are derivatives of canonical works
- Anything with "for Dummies" or "in 24 hours" in the title (with very few exceptions)
- Conference talks you can find as papers (read the paper instead)
- Twitter threads, LinkedIn posts, dev.to articles (with rare exceptions)

---

## Protocol: The 5-Minute Triage

When you encounter a new resource:

1. **Source quality check (1 min)**: Who wrote it? Are they an expert? Is it peer-reviewed or community-validated? (See [[Resource-Utility-Heuristics]].)

2. **Recency check (1 min)**: For fast-moving fields (ML, distributed systems, web), is it from the last 5 years? For stable fields (algorithms, type theory), older is often better.

3. **Canonicality check (1 min)**: Is this on the standard reading list for the subdomain? (Check [[MOC-Domain-Maps]].) If yes → Tier 1. If no → continue.

4. **Specific need check (1 min)**: Do I have a specific question this resource answers? If yes → Tier 2. If no → continue.

5. **Decision (1 min)**:
   - Tier 1 → schedule deep read
   - Tier 2 → add to reference index, read only the relevant section now
   - Tier 3 → ignore

Use [[Resource-Triage-Card]] template.

---

## The Reference Index

For Tier 2 resources, maintain a **reference index** — a note per subdomain that lists resources you *haven't* read deeply but know exist, with a 1-line description of when you'd consult them.

Example for distributed systems:

```markdown
# Distributed Systems — Reference Index

## Tier 1 (read deeply)
- Kleppmann, *DDIA* — read fully, 2024-03
- Lamport, "Time, Clocks" — read fully, 2024-04
- ...

## Tier 2 (skim / on-demand)
- Tanenbaum & Van Steen, *Distributed Systems* — consult Ch 7 (consensus) when needed
- Coulouris et al., *Distributed Systems* — consult for clock sync algorithms
- Aphyr, "Jepsen" analyses — consult when evaluating specific DB
- ...

## Tier 3 (ignored)
- Most Medium articles on "distributed systems for beginners"
- Most YouTube videos
```

The reference index turns "I should read that someday" into "I know where to find that when I need it."

---

## Anti-Patterns

### The Completeness Trap
"I should read all of OSTEP before starting any systems project." No. Read the chapters relevant to your project. OSTEP is a reference, not a novel.

### The Hype Trap
"This new paper is getting a lot of attention; I should read it." No. Wait 6-12 months. If it's still cited, then consider reading. Most "hot" papers don't survive.

### The Sympathy Trap
"The author worked hard on this; I should finish it." No. Sunken cost is not a reason to keep reading a low-value resource.

### The Curriculum Trap
"I need to complete the MIT 6.824 syllabus in order." No. The syllabus is a *map*, not a *script*. Move to the next item when you've mastered the current one, not when you've completed it.

### The FOMO Trap
"Everyone is talking about this; I'll be left behind." No. You will be left behind only by failing to build deep schemas, not by failing to read the latest thing.

---

## Key Citations

- Speier, C., Valacich, J. S., Vessey, I. (1999). The influence of task interruption on individual decision making. *Information Systems Research, 10*(4), 359-387.
- Simon, H. A. (1971). Designing organizations for an information-rich world. *Computers, Communications, and the Information Society*.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Resource-Utility-Heuristics]] — the fast rules
- [[Triage-Decision-Tree]] — the operational flowchart
- [[Threshold-Concepts]] — what to read first within a Tier 1 work
- [[Constraint-Based-Analysis]] — predicting value before reading

← Back to [[MOC-Information-Triage]]
