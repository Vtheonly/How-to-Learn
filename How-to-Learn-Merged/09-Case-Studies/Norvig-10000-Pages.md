---
aliases: [Peter Norvig, 10000 Pages, Teach Yourself Programming in 10 Years]
tags: [case-study, workflow]
---

# Peter Norvig — "Teach Yourself Programming in 10 Years"

> Norvig, P. (2001). *Teach Yourself Programming in Ten Years*. norvig.com/21-days.html

---

## The Essay

Norvig's 2001 essay was a response to the proliferation of "Learn X in 21 Days" books. Its core thesis:

> "Researchers (Bloom (1985), Bryan & Harter (1899), Hayes (1989), Simmon & Chase (1973)) have shown it takes about ten years to develop expertise in any of a wide variety of areas... The key is deliberative practice: not just doing it again and again, but challenging yourself with a task that is just beyond your current ability, trying it, analyzing your performance while and after doing it, and correcting any mistakes."

He then lists specific practices. The essay is short; the principles are dense.

---

## The Workflow

Norvig's recommendations (paraphrased and extended):

### 1. Write code

Get interested in programming, and write some code. Then write more. Then write more.

Norvig's specific recommendation: **write a new program every week for ten years.** ~500 programs in total. Each one should be slightly harder than the last.

### 2. Read programs

> "Read the code. Read the code. Read the code."

Norvig emphasizes that programmers typically read far less code than they write, which is the opposite of how writers or musicians train. Musicians study Bach; programmers should study Torvalds, Carmack, etc.

Specific recommendations:
- Read good open-source code (Linux kernel, SQLite, Redis)
- Read code in languages you don't know
- Read code with a question ("how does this handle X?")

### 3. Read the original papers

Norvig's specific list (from his "Programming is Hard" talks):
- Turing (1936) — on computable numbers
- Shannon (1948) — mathematical theory of communication
- Dijkstra (1968) — go-to statement considered harmful
- Lamport (1978) — time, clocks
- Codd (1970) — relational model
- Kahn (1974) — recursive computation

Original sources are denser and more precise than second-hand explanations. (See [[Selective-Ignorance]].)

### 4. Talk with other programmers

Become part of a community. Work alongside people better than you. Code review. Pair program. Argue.

### 5. Work on projects with other programmers

Solo work is necessary but not sufficient. Group projects teach collaboration, version control, design at scale, debugging others' code.

### 6. Work on projects *after* other programmers

Maintain code you didn't write. This teaches a different set of skills: reading, refactoring, preserving invariants, understanding others' design decisions.

### 7. Learn multiple programming languages

Norvig specifically recommends learning at least one language from each of these paradigms:
- Procedural (C, Pascal)
- Object-oriented (Java, C++, Python)
- Functional (Haskell, ML, Erlang)
- Logic (Prolog)
- Concurrent (Go, Erlang, Clojure)
- Assembly (any)

The point isn't the languages; it's the paradigms. Each paradigm forces a different way of thinking (see [[Structure-Mapping-Theory|structure mapping]]).

### 8. Understand computer architecture

You can't write efficient code without understanding:
- How memory works (caches, virtual memory)
- How CPUs work (pipelines, branch prediction, instruction-level parallelism)
- How I/O works (disk, network)
- How concurrency is implemented

This is the [[The-Abstraction-Ladder|ladder of abstraction]] — descend periodically to Level 1.

### 9. Be involved in language design

Either by participating in language standardization, or by designing your own small languages (DSLs, configuration formats, etc.).

Language design forces you to confront tradeoffs you'd otherwise ignore.

### 10. Read the literature

Norvig's recommendation: **read ~10,000 pages of computer science literature over the course of your training.** That's roughly:

- 20-30 textbooks (10,000-15,000 pages)
- Or 200-300 papers (at ~30-50 pages each)
- Or a mix

The number isn't magic; the principle is volume + variety. (See [[Selective-Ignorance]] for *which* to read.)

---

## The Math

10,000 pages over 10 years = ~3 pages/day. That's not much. Almost anyone can do it.

But 10,000 pages of *deliberately chosen* material, with *active synthesis* (not passive reading), produces extraordinary breadth.

Most CS graduates read maybe 2,000-3,000 pages of CS material total (courses + a few books). Norvig is proposing ~5x that. Combined with the writing programs (~500) and the reading code (substantial), this produces a deep foundation.

---

## Extracted Protocol

| Norvig pattern | How to apply |
|---|---|
| Write a program a week | For 5+ years. Each slightly harder than the last. |
| Read code | Spend ~25% of your reading time on code, not prose. |
| Read original papers | Read at least 1-2 foundational papers per subdomain. |
| Join a community | Find 3-5 peers. Code review. Argue. |
| Maintain others' code | Contribute to an existing project. Don't only write fresh code. |
| Learn 6+ languages | At least one per paradigm. |
| Understand the hardware | Periodically descend to Level 1 of the abstraction ladder. |
| Design a language | Even a tiny DSL counts. |
| 10,000 pages over 10 years | ~3 pages/day of active reading. Track it. |

---

## What Norvig Does NOT Recommend

- ❌ "21 days to expert" books
- ❌ Reading only secondary sources
- ❌ Sticking with one language
- ❌ Only writing fresh code (maintaining is essential)
- ❌ Skipping the math (architecture, algorithms, theory)
- ❌ Skipping the literature

---

## Modern Extensions

In the 25 years since Norvig's essay, the landscape has shifted:

- **Open source** makes "read code" far easier (GitHub)
- **LLMs** can help you navigate unfamiliar code (but don't substitute for reading)
- **Video lectures** (MIT OCW, Berkeley, Stanford) supplement reading
- **Online communities** (Hacker News, /r/programming, Discord) supplement in-person

But the core recommendations hold. Volume + variety + active engagement = expertise.

---

## Cross-Links

- [[Expertise-Research-Ericsson]] — the research Norvig cites
- [[Deliberate-Practice]] — the operational form
- [[Reading-Codebases-Systematically]] — the reading-code protocol
- [[Selective-Ignorance]] — *which* pages to read
- [[MOC-Domain-Maps]] — the curriculum

← Back to [[MOC-Case-Studies]]
