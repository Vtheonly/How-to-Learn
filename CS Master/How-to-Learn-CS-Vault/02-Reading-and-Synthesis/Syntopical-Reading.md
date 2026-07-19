---
aliases: [Syntopical, Adler Reading]
tags: [reading, protocol]
---

# Syntopical Reading (Adler)

> Adler, M. J., & Van Doren, C. (1940/1972). *How to Read a Book*. Chapter 20: "Reading the Syntopical Literature."

---

## Theory

Mortimer Adler distinguished four levels of reading:

1. **Elementary** — decoding words
2. **Inspectional** — skimming for structure (systematic skimming)
3. **Analytical** — deep, single-book reading
4. **Syntopical** — reading *across* multiple books on the same topic to construct your own synthesis

Syntopical reading is the highest level. It treats books not as authorities to absorb, but as *contributors to a conversation* you are constructing.

The protocol:

1. **Define the topic** precisely (e.g., "consensus in distributed systems" — not "distributed systems")
2. **Assemble a bibliography** of relevant works (5-15 books/papers)
3. **Inspectional-read all of them** to identify which actually contribute
4. **Identify the key propositions** each author makes about the topic
5. **Define the issues** — points where authors agree, disagree, or talk past each other
6. **Structure the conversation** — group authors by stance, define the disagreements
7. **Synthesize** your own position informed by all of them

---

## CS Translation

CS is a syntopical discipline. No single book contains "the truth" about:

- Concurrency (你需要: Hoare CSP, Goetz *Java Concurrency in Practice*, Herlihy *The Art of Multiprocessor Programming*, Lamport papers)
- Distributed systems (Lamport, Tanenbaum, Kleppmann, Coulouris, Tanenbaum van Steen)
- Type theory (Pierce, Pierce *TaPL*, Harper *Practical Foundations*, Cardelli papers)
- Operating systems (Tanenbaum, Silberschatz, OSTEP, BSD source)

Reading one book makes you a follower of that book's framing. Reading five syntopically makes you a synthesizer.

---

## Protocol: Syntopical Reading of a CS Topic

### Phase 1 — Frame (1 week)

1. Define the topic in 1-2 sentences. Narrow is better.
   - ❌ "Distributed systems" (too broad)
   - ✅ "How do distributed systems achieve consensus under partial failure?"

2. Identify 5-10 canonical works. Use:
   - Citation graphs (Google Scholar "cited by")
   - Top-3 university course syllabi (MIT 6.824, Berkeley CS162, Stanford CS240)
   - Practitioner reading lists (e.g., the Aphyr bookshelf, the Murat Demirbas blog)

3. Inspectional-read each (TOC + chapter summaries + intro + conclusion). 30 min each.

4. Filter to 4-6 that actually contribute distinct positions.

### Phase 2 — Map the Conversation (1-2 weeks)

For each remaining work, extract:

- **Core claim** (1 sentence)
- **Key terms** (and their definitions — note where authors disagree on definitions)
- **Assumptions** (what they take as given)
- **Method** (formal proof? empirical? engineering?)
- **Limitations** (what they explicitly don't address)

Build a matrix: rows = works, columns = the above. The matrix is your syntopical map.

### Phase 3 — Identify the Issues (1 week)

Where do authors:
- **Agree**? (These are likely foundational invariants.)
- **Disagree**? (These are the live debates.)
- **Talk past each other**? (These are terminology mismatches.)

For each disagreement, formulate the issue as a question: "Under partial partition, should a system prefer availability or consistency?" — then locate each author's answer.

### Phase 4 — Synthesize (1-2 weeks)

Write a 5-10 page synthesis:
- What is the consensus (if any)?
- What are the live debates?
- What is your own position, and which authors most inform it?
- What is still unknown?

This document becomes a permanent part of your knowledge base. Refer back to it. Update it as you read new works.

---

## Worked Example: Syntopical Reading of Distributed Consensus

**Bibliography (after filtering)**:
1. Lamport, "The Part-Time Parliament" (1998) — original Paxos
2. Lamport, "Paxos Made Simple" (2001) — simplification
3. Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm" (2014) — Raft
4. Castro & Liskov, "Practical Byzantine Fault Tolerance" (1999) — PBFT
5. Schneider, "Implementing Fault-Tolerant Services Using the State Machine Approach" (1990) — survey

**Matrix extract**:

| Work | Core claim | Failure model | Leader? | Byzantine? |
|---|---|---|---|---|
| Lamport 1998 | Paxos solves consensus under crash faults | Crash | Phase-driven | No |
| Lamport 2001 | Same, simplified presentation | Crash | Phase-driven | No |
| Ongaro 2014 | Raft = Paxos with strong leader for understandability | Crash | Strong leader | No |
| Castro 1999 | PBFT extends to Byzantine faults | Byzantine | Rotating primary | Yes |
| Schneider 1990 | State machine replication = consensus + log | Crash | Varies | Varies |

**Issues identified**:
1. *Understandability vs. minimality*: Lamport optimizes for proof; Ongaro for human cognition.
2. *Crash vs. Byzantine*: PBFT costs 3x message overhead for Byzantine tolerance.
3. *Leader role*: Strong leader (Raft) vs. phase-driven (Paxos) vs. rotating (PBFT).

**Synthesis**: A 6-page document positioning all 5 works on these 3 axes, with my own take on which axis matters most for which deployment context.

After this exercise, encountering any new consensus algorithm (Zab, HotStuff, EPaxos) takes 30 min to locate on the matrix and understand its contribution.

---

## Key Citations

- Adler, M. J., & Van Doren, C. (1972). *How to Read a Book* (revised ed.). Chapter 20.
- Adler's syntopical method as applied to academic literature: Bean, J. C. (2011). *Engaging Ideas*.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Cognitive-Flexibility-Theory]] — the theoretical basis for multi-case synthesis
- [[Concept-Mapping-Protocol]] — the comparison matrix is a concept map
- [[Reading-Research-Papers]] — for the analytical level
- [[MOC-Domain-Maps]] — each domain map is a syntopical reading plan

← Back to [[MOC-Reading-and-Synthesis]]
