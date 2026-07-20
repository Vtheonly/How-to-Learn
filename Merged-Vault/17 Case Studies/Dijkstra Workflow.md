---
aliases: [Edsger Dijkstra Workflow, EWD Method]
tags: [case-study, workflow]
---

# Edsger Dijkstra's Workflow

> *Manuscripts as a primary thinking tool.*

---

## The Profile

Edsger W. Dijkstra (1930–2002), Turing Award winner, pioneer of structured programming, semaphores, self-stabilization, and predicate transformers. One of the most prolific and influential CS thinkers of the 20th century.

Key sources:
- The EWD archive (~1300 manuscripts, all publicly available at cs.utexas.edu/~EWD)
- Dijkstra's *A Discipline of Programming* (1976)
- Dijkstra's *Selected Writings on Computing* (1982)
- Biographical memoirs by colleagues (Feijen, van Gasteren, Misra)

---

## The Workflow

### 1. Manuscripts as the thinking tool

Dijkstra wrote manuscripts as his primary mode of thinking. The EWD series — numbered manuscripts he wrote and circulated to colleagues from 1959 until his death in 2002 — contains ~1300 documents totaling thousands of pages.

The manuscripts are not summaries of completed thought. They *are* the thinking. Dijkstra would write a manuscript to work out an idea, circulating it to ~30 colleagues for feedback. The feedback often sparked the next manuscript.

> "Writing is nature's way of letting you know how sloppy your thinking is." — Dijkstra (often attributed, possibly apocryphal in exact wording, but the sentiment pervades the EWDs)

### 2. Handwriting and fountain pens

Dijkstra wrote the EWDs by hand, in fountain pen, on paper. Only later were they transcribed. The slow pace of handwriting was a feature: it forced care, precision, and revision.

He resisted word processors because they encouraged "easy" revision. Handwriting made every sentence a deliberate act.

### 3. Avoidance of computers for thinking

Paradoxically, Dijkstra often wrote *about* computing but did his deepest thinking *away* from a computer. The computer, for him, was for verification, not for thinking. Thinking happened on paper.

This is a strong version of the principle that [[Environmental-Design|environment shapes thought]]: a computer offers many affordances, none of which are *careful sustained thought*.

### 4. The manuscript circulation loop

Each EWD was:
1. Written by Dijkstra (a few days to a few weeks)
2. Mailed to ~30 colleagues (the "EWD club")
3. Read and annotated by recipients
4. Discussed in person at conferences or visits
5. Often revised into a new EWD responding to feedback

This is a deliberate-practice loop with expert feedback. The manuscripts were not published in the formal sense; they were *conversation artifacts*.

### 5. Strong opinions on notation and language

Dijkstra had strong, often harsh, opinions about how computing should be expressed. He believed notation shaped thought (cf. [[Schema-Theory-and-Anderson|schemas]] are language-dependent). He railed against:
- `goto` (famously)
- Vague natural language in specifications
- "Anthropomorphic" descriptions of programs
- Tests as a substitute for proofs

His commitment to formal notation was a commitment to precise thinking.

### 6. Mathematics-first

Dijkstra believed computer science was a branch of mathematics, not engineering. He worked primarily with:
- Predicates and predicate transformers
- Formal proofs
- Calculational derivations

He avoided empirical methods when formal methods sufficed. This is a *choice* — Dijkstra's work has been criticized for being too pure — but it produced extraordinary clarity.

### 7. Long solitary walks

From biographical accounts, Dijkstra took long walks daily, often thinking through problems without writing. The walking served the same function as Knuth's evenings: mental space for non-verbal processing.

---

## Extracted Protocol

| Dijkstra pattern | How to apply |
|---|---|
| Write to think | Don't wait until you understand. Write to find out what you think. |
| Manuscript circulation | Share your thinking with 3-5 expert peers regularly. Treat their feedback as the practice loop. |
| Handwriting for hard problems | For very hard problems, write by hand. The slowness is the point. |
| Computer-free thinking | Don't think *at* a computer. Think away, then verify at the computer. |
| Strong notation | Develop your own notation when standard notation is imprecise. Notation shapes thought. |
| Formal methods when possible | When you can prove, don't just test. Proofs scale; tests don't. |
| Walking for non-verbal processing | Daily walks without input. Let the mind work on the problem. |

---

## Tensions With Modern Practice

Dijkstra's approach has limitations:

- **Empirical questions resist formal methods.** "How fast is this on real hardware?" can't be proven; it must be measured.
- **His critique of testing was overstated.** Modern practice shows tests and proofs are complementary, not exclusive.
- **His disdain for "engineering" missed real value.** Engineering produces working systems that pure CS cannot.

But for *learning*, his methods are powerful. The discipline of formal notation and careful writing produces clearer schemas than informal approaches.

---

## Key Sources

- EWD archive: cs.utexas.edu/users/EWD
- Dijkstra, E. W. (1976). *A Discipline of Programming*. Prentice-Hall.
- Misra, J. (2010). *Edsger Wybe Dijkstra: A Pioneering Computer Scientist*. Notices of the AMS.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Knuth-Workflow]] — similar writing-as-thinking, different domain
- [[McCarthy-Workflow]] — formal methods from a different angle
- [[Elaboration-Strategies]] — Dijkstra's manuscripts are elaboration taken to extreme
- [[Daily-Learning-Log]] — a modern, lower-friction version of the EWD habit

← Back to [[MOC-Case-Studies]]
