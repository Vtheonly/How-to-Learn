---
aliases: [John McCarthy Workflow, Lisp as Thought]
tags: [case-study, workflow]
---

# John McCarthy's Workflow

> *Building the language to think in.*

---

## The Profile

John McCarthy (1927–2011), Turing Award winner, inventor of Lisp, co-founder of MIT AI Lab and Stanford AI Lab, coined "artificial intelligence." His career spanned 50+ years and produced foundational work in AI, programming language theory, and formal logic.

Key sources:
- McCarthy, *Recursive Functions of Symbolic Expressions* (1960)
- McCarthy's collected papers at formal.stanford.edu
- Memoirs by colleagues (Sussman, Steele, Feigenbaum)
- McCarthy's Stanford homepage (archived)

---

## The Workflow

### 1. Building tools to think with

McCarthy's signature move: when faced with a new problem domain, build a language / notation / tool for thinking about it.

- Needed to think about symbolic AI → invented Lisp (1958)
- Needed to reason about actions → invented situation calculus (1963)
- Needed to formalize common-sense reasoning → developed circumscription (1980)
- Needed to specify programs → invented refinements of Hoare logic

The pattern: **the tool is the thinking.** Lisp wasn't a product; it was McCarthy's way of expressing thoughts about computation that existing languages couldn't express.

### 2. Lisp as a cognitive prosthesis

Lisp was designed to make thinking about programs *easier*. McCarthy chose:
- S-expressions (uniform syntax) — eliminates parsing as a cognitive load
- First-class functions — enables higher-order abstractions
- Homoiconicity (code = data) — enables metacircular evaluation
- Garbage collection — eliminates memory management as a concern

Each design choice removes a cognitive burden, freeing attention for the actual problem. This is operational [[Cognitive-Load-Theory|load theory]] — applied 20 years before Sweller formalized it.

### 3. Mathematical foundations

McCarthy was trained as a mathematician. He approached AI as a mathematical enterprise: define concepts precisely, prove theorems, seek foundations.

His non-monotonic logics, situation calculus, and circumscription are all attempts to *formalize* aspects of intelligence that other AI researchers left informal.

This commitment to formalization was sometimes a weakness (he was skeptical of statistical ML late in life), but it produced schemas of unusual clarity.

### 4. Long horizons

McCarthy worked on AI from 1956 until his death in 2011 — 55 years. He didn't chase trends. He worked on what he believed was foundational, even when the field moved away.

The lesson: a long time horizon allows sustained work on hard problems that can't be solved in a 5-year grant cycle.

### 5. Building communities

McCarthy co-founded two major AI labs (MIT, Stanford). He understood that thinking is *social* — that the EWD-style manuscript circulation works best when there's a community of peers.

He also mentored generations of students (Sussman, Steele, Abelson, etc.) who extended his work. The community multiplied his impact.

### 6. Concrete demonstrations

Despite his mathematical orientation, McCarthy insisted on working implementations. Lisp was implemented; the AI Lab ran on Lisp machines. Theory without practice didn't count.

---

## Extracted Protocol

| McCarthy pattern | How to apply |
|---|---|
| Build tools to think with | When struggling with a domain, build a small DSL or notation for it. The act of building forces clarity. |
| Eliminate incidental complexity | Choose tools that remove cognitive load (e.g., a high-level language for prototyping). Don't fight unnecessary battles. |
| Mathematical foundations | For concepts you care about, learn the math. Don't settle for hand-waving. |
| Long horizons | Pick problems worth 10+ years. Don't optimize for trends. |
| Build communities | Find or create a group of peers with whom you exchange work. Solitary work is slower. |
| Implementation matters | Build it. Don't just describe it. |

---

## What McCarthy Does NOT Do

- ❌ He didn't chase trends (resisted neural networks for decades)
- ❌ He didn't separate theory and practice
- ❌ He didn't work in isolation — community was essential
- ❌ He didn't tolerate imprecision in foundational concepts

---

## Key Sources

- McCarthy, J. (1960). Recursive functions of symbolic expressions and their computation by machine, Part I. *CACM 3*(4).
- McCarthy, J. (1963). Situations, actions and causal laws. Stanford AI Memo.
- McCarthy's collected papers: formal.stanford.edu/jmc/

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Dijkstra-Workflow]] — another formalist, different style
- [[Knuth-Workflow]] — another long-horizon thinker
- [[The-Abstraction-Ladder]] — McCarthy lived at the top of the ladder
- [[Cognitive-Load-Theory]] — McCarthy's language design as load reduction

← Back to [[MOC-Case-Studies]]
