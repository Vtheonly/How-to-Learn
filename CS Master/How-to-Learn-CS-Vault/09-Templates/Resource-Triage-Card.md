---
aliases: [Triage Card, Resource Triage Template]
tags: [template, triage]
---

# 📋 Resource Triage Card

> *Decide what to do with a resource in 5 minutes.*

---

## Template

```markdown
---
type: triage-card
date: <% tp.date.now("YYYY-MM-DD") %>
title: "<<title>>"
author: "<<author>>"
url: "<<url or ISBN>>"
tier: <<1 | 2 | 3>>
tags: [<<topic1>>, <<topic2>>]
---

# <<Title>>

## Quick assessment (5 min)

### H1 — Authority
<<Author credentials? Peer-reviewed? Practitioner-validated?>>

### H2 — Citations / reach
<<For papers: Google Scholar count. For books: Amazon reviews, syllabi appearance.>>

### H3 — Age & recency
<<Year. Appropriate for subdomain's rate of change?>>

### H5 — Explanation density
<<Skim first 3 paragraphs. Density: high / medium / low.>>

### H6 — Worked examples
<<Has worked examples + exercises? Or only happy-path demos?>>

### H8 — Critical reviews
<<For books: read 2-3 critical (2-3 star) reviews. What weaknesses?>>

### H9 — Reference implementation
<<For implementation material: working code? Runnable? Tests?>>

### H10 — "Would I cite this?"
<<Yes / No / Maybe.>>

## Constraint check (2 min, for technical resources)

<<What subdomain? What are its real constraints?>>
<<Does the resource acknowledge / reason about those constraints?>>

## Decision

**Tier**: <<1 / 2 / 3>>

**Reason**: <<1-2 sentences>>

**Action**:
- [ ] Tier 1 → schedule deep read, add to reading list
- [ ] Tier 2 → add to reference index, read on-demand
- [ ] Tier 3 → ignore

**Revisit trigger**: <<conditions under which to revisit this decision>>

## If Tier 1 or 2: read plan

- Estimated time: <<
- Prerequisites needed: <<
- Read order (sections): <<
- Build target (if applicable): <<
```

---

## When to Use

Whenever you encounter a new resource (paper, book, blog post, video) and need to decide whether to invest time.

Use [[Triage-Decision-Tree]] as the decision logic.

---

## Cross-Links

- [[Selective-Ignorance]] — the principle
- [[Resource-Utility-Heuristics]] — the heuristics
- [[Triage-Decision-Tree]] — the flowchart
- [[Dataview-Queries]] — for aggregating triage decisions

← Back to [[09-Templates/]]
