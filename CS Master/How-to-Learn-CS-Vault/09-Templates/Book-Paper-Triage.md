---
aliases: [Book Triage, Paper Triage, Reading Note Template]
tags: [template, reading]
---

# 📋 Book / Paper Triage Note

> *Combine the [[Resource-Triage-Card]] and [[Three-Pass-Reading-Protocol]] into a single note per resource.*

---

## Template

```markdown
---
type: reading-note
title: "<<title>>"
author: "<<author(s)>>"
year: <<year>>
url: "<<link or ISBN>>"
read: <% tp.date.now("YYYY-MM-DD") %>
tier: <<1 | 2 | 3>>
pass: <<1 | 2 | 3 | 4>>
rating: <<1-5>>
tags: [reading, <<topic1>>, <<topic2>>]
---

# <<Title>> (<<Author>> <<Year>>)

## Triage

### Quick assessment
- Authority: <<
- Recency: <<
- Density: <<
- Worked examples: <<
- "Would cite?": <<

### Decision
- Tier: <<
- Reason: <<

## Pass 1 — Triage (5-10 min)

- Topic: <<1 sentence>>
- Claim: <<1 sentence>>
- Worth Pass 2? [Y/N]

## Pass 2 — Structural (45-60 min)

- Problem: <<1 sentence>>
- Contribution: <<1-3 sentences>>
- Method (key idea): <<1 paragraph>>
- Evaluation summary: <<1 paragraph>>
- Threshold concepts: <<list>>
- Limitations / open questions: <<list>>
- My assessment: <<1 paragraph>>
- Worth Pass 3? [Y/N]

## Pass 3 — Deep (2-5 hours, only if needed)

### Re-derivation
<<your pseudo-code or proof reconstruction>>

### Assumptions
<<list, including implicit ones>>

### Limitations (claimed + unclaimed)
<<list>>

### Comparison to related work

| This work | <<related 1>> | <<related 2>> |
|---|---|---|
| ... | ... | ... |

### Critique
<<weaknesses, missing baselines, unstated assumptions>>

### Extension sketch
<<what you would do next, given this work>>

## Pass 4 — Reproduce (optional, 4-10 hours)

- Got code: [Y/N]
- Built: [Y/N — link to [[project log]] if Y]
- Reproduced experiment: [Y/N]
- Divergences: <<

## Synthesis

<<Your 1-paragraph final take. What did you learn? How does it connect to your existing schemas?>>

## Schemas acquired / extended

- [[<<schema 1>>]]
- [[<<schema 2>>]]

## Build target

<<If applicable: what should you build to consolidate this?>>

## Citation

<<BibTeX or formatted citation>>

## Links

- [[<<related reading note>>]]
- [[<<concept note>>]]
```

---

## When to Use

For every paper or book you read at Pass 2 or higher. One note per resource.

---

## Cross-Links

- [[Three-Pass-Reading-Protocol]] — the underlying protocol
- [[Reading-Research-Papers]] — Keshav's method
- [[Resource-Triage-Card]] — the triage section
- [[Bibliography]] — where reference-only entries go

← Back to [[09-Templates/]]
