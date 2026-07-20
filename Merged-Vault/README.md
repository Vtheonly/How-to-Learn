# Merged Vault

This vault is the result of merging two source collections from the original
`AgentGithubUplaod` repository:

1. **Elite Cognitive Performance and Reliability (ECPR)** — a structured
   course on cognitive performance for software engineers.
2. **Vault** — an Obsidian-style learning system teaching how to learn
   computer science.

The merge preserved every Markdown file's content verbatim. Only file
location and filename were adjusted:

- Each Markdown file was relocated to its most appropriate topical folder.
- Filenames were normalized to use spaces (underscores and inter-word
  hyphens removed) and a regular hyphen `-` instead of em-dash `—`.
- Folders were renumbered sequentially (`00`..`26`).

## Folder structure

```
00 Index                              — entry points, MOCs, navigation, ECPR course orientation
01 Foundations                        — cognitive science bedrock + ECPR Ch 1 + Ch 4 (Cognitive OS)
02 Schemas                            — the 10 universal abstractions
03 Methods and Techniques             — study strategies + ECPR Ch 10 (Cognitive Habits)
04 Protocols                          — step-by-step playbooks + ECPR Ch 3 (Systemic Protocols)
05 Reading and Synthesis              — reading papers, code, RFCs
06 Information Triage                 — selective ignorance, threshold concepts
07 Cognitive Load Management          — load theory, working memory, burnout
08 Sleep Recovery and Consolidation   — sleep, breaks, memory consolidation
09 Focus and Environment              — workspace design, distraction management
10 Productivity Methods               — time blocking, pomodoro, deep work (ECPR Ch 9)
11 Stress and Performance             — stress tolerance, execution under pressure (ECPR Ch 2)
12 Behavioral and Self-Management     — dopamine, addiction, self-sabotage (ECPR Ch 5)
13 Mental Models and Decisions        — mental models + decision frameworks (ECPR Ch 7 + Ch 8)
14 Engineering Practice               — reading code, code review, system design (ECPR Ch 12)
15 Long-Term Reliability and Growth   — compounding growth, career audit (ECPR Ch 13)
16 Workflows                          — daily/weekly operating loops
17 Case Studies                       — Knuth, Dijkstra, McCarthy, Bell Labs, Norvig
18 CS Domain Maps                     — how to attack each CS subdomain
19 CS Education Research              — CS-specific pedagogy research
20 Roadmap and Curriculum             — study sequence, phases, mastery rubric
21 Books and Literature               — book notes + bibliography (ECPR Ch 6 + Ch 11 + Vault refs)
22 PKM Setup and Tools                — Obsidian setup, plugins, tag system
23 Pitfalls and Pseudoscience         — myths, biohacking, identifying pseudoscience
24 Templates                          — Obsidian note templates
25 Glossary                           — definitions of cognitive terms
26 Daily Notes                        — daily learning logs
```

## Source provenance

| Folder(s) in merged vault                          | Original source                                                            |
|----------------------------------------------------|----------------------------------------------------------------------------|
| 00 Index (partial)                                 | `Elite Cognitive Performance and Reliability/README.md`                     |
| 00 Index (partial)                                 | `Elite Cognitive Performance and Reliability/0. Foundations/`               |
| 00 Index (partial)                                 | `Vault/00 Index/`                                                           |
| 01 Foundations (partial)                           | `Vault/01 Foundations/`                                                     |
| 01 Foundations (partial)                           | `Elite Cognitive Performance and Reliability/Chapter 1 - Cognitive Foundations of On-Demand Competence/` |
| 01 Foundations (partial)                           | `Elite Cognitive Performance and Reliability/Chapter 4 - The Software Engineer's Cognitive Operating System/` |
| 02 Schemas                                         | `Vault/02 Schemas/`                                                         |
| 03 Methods and Techniques (partial)                | `Vault/03 Methods/`                                                         |
| 03 Methods and Techniques (partial)                | `Elite Cognitive Performance and Reliability/Chapter 10 - Cognitive Habits and Intelligence Amplification/` |
| 04 Protocols (partial)                             | `Vault/04 Protocols/`                                                       |
| 04 Protocols (partial)                             | `Elite Cognitive Performance and Reliability/Chapter 3 - Systemic Protocols and Routine Engineering/` |
| 05 Reading and Synthesis                           | `Vault/05 Reading and Synthesis/`                                           |
| 06 Information Triage                              | `Vault/06 Information Triage/`                                              |
| 07 Cognitive Load Management                       | `Vault/07 Cognitive Load Management/`                                       |
| 08 Sleep Recovery and Consolidation                | `Vault/08 Sleep Recovery and Consolidation/`                                |
| 09 Focus and Environment                           | `Vault/09 Focus and Environment/`                                           |
| 10 Productivity Methods                            | `Elite Cognitive Performance and Reliability/Chapter 9 - Productivity Methods for Cognitive Performance/` |
| 11 Stress and Performance                          | `Elite Cognitive Performance and Reliability/Chapter 2 - Stress Tolerance and Execution Under Pressure/` |
| 12 Behavioral and Self-Management                  | `Elite Cognitive Performance and Reliability/Chapter 5 - Behavioral Decoupling, Addiction, and Self-Sabotage Mitigation/` |
| 13 Mental Models and Decisions (partial)           | `Elite Cognitive Performance and Reliability/Chapter 7 - Decision-Making Frameworks for Engineers/` |
| 13 Mental Models and Decisions (partial)           | `Elite Cognitive Performance and Reliability/Chapter 8 - Mental Models for Software Engineers/` |
| 14 Engineering Practice                            | `Elite Cognitive Performance and Reliability/Chapter 12 - Becoming a Stronger Software Engineer/` |
| 15 Long-Term Reliability and Growth                | `Elite Cognitive Performance and Reliability/Chapter 13 - Long-Term Reliability and Compounding Growth/` |
| 16 Workflows                                       | `Vault/10 Workflows/`                                                       |
| 17 Case Studies                                    | `Vault/11 Case Studies/`                                                    |
| 18 CS Domain Maps                                  | `Vault/12 CS Domain Maps/`                                                  |
| 19 CS Education Research                           | `Vault/13 CS Education Research/`                                           |
| 20 Roadmap and Curriculum                          | `Vault/14 Roadmap/`                                                         |
| 21 Books and Literature (partial)                  | `Vault/18 References/`                                                      |
| 21 Books and Literature (partial)                  | `Elite Cognitive Performance and Reliability/Chapter 6 - Literature for the Software Engineer's Mind/` |
| 21 Books and Literature (partial)                  | `Elite Cognitive Performance and Reliability/Chapter 11 - Books for the Engineers Mind/` |
| 22 PKM Setup and Tools                             | `Vault/16 PKM Setup and Tools/`                                             |
| 23 Pitfalls and Pseudoscience                      | `Vault/17 Pitfalls and Pseudoscience/`                                      |
| 24 Templates                                       | `Vault/15 Templates/`                                                       |
| 25 Glossary                                        | `Vault/19 Glossary/`                                                        |
| 26 Daily Notes                                     | `Vault/20 Daily/`                                                           |

## Notes

- File contents were not modified in any way (no rewriting, summarizing,
  or content editing).
- The `Vault-Map.canvas` file (Obsidian canvas) was preserved in `00 Index/`
  alongside the other navigation files.
- The `.obsidian/` configuration folder from the ECPR source was not
  relocated (it is workspace state, not Markdown content).
- The original `README.md` at the repository root was a placeholder
  ("This is simply a repo for uploaded remote reference purposes…") and is
  superseded by this merged-vault README.
- `Untitled.md` (which contained only token-count markers) was preserved
  verbatim in `00 Index/`.
