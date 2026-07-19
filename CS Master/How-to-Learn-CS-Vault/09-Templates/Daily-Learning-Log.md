---
aliases: [Daily Log, Daily Learning Log Template]
tags: [template, daily]
---

# 📋 Daily Learning Log

> *One entry per learning block. Aggregate weekly.*

---

## Template

Copy the body below into your daily log file (e.g., `2024-03-15.md`).

```markdown
---
date: <% tp.date.now("YYYY-MM-DD") %>
tags: [daily-log]
week: <% tp.date.now("YYYY-[W]ww") %>
---

# <% tp.date.now("YYYY-MM-DD dddd") %>

## Today's blocks

### Block 1 — <% tp.date.now("HH:mm") %>
- **Target**: <<one line>>
- **Type**: [reading | build | problem-solving | review | SR]
- **Time**: <<X min>>
- **At the edge**: <<what was hard>>
- **Failures**: <<what I got wrong>>
- **Feedback received**: <<from where>>
- **Schemas**: <<new / extended which>>
- **Saturation events**: <<count, with times>>
- **Next**: <<what to change next time>>

### Block 2 — ...
<<repeat>>

### Block 3 — ...
<<repeat>>

## Today's triage decisions

- <<resource>>: <<Tier 1 / 2 / 3 — reason>>
- <<resource>>: ...

## Today's questions (open threads)

- <<question 1>>
- <<question 2>>

## Energy & recovery

- Sleep last night: <<hours>>
- Energy level (1-5): <<
- Exercise: <<yes/no>>
- Mood: <<one line>>

## End-of-day reflection (3 sentences)

<<What did I learn? What was hard? What's tomorrow's focus?>>

## Tomorrow's first block

- Target: <<
- Pre-session: <<
```

---

## Why Each Field Matters

- **Target**: forces you to articulate the goal before starting
- **Type**: forces you to vary block types (see [[Session-Architecture]])
- **At the edge**: confirms the work was actually deliberate practice (not below the edge)
- **Failures**: where the learning lives; without this, you're not practicing, you're performing
- **Feedback received**: confirms the loop is closed
- **Schemas**: tracks schema acquisition (your growing asset)
- **Saturation events**: early warning system (see [[Working-Memory-Saturation]])
- **Triage decisions**: tracks your [[Selective-Ignorance|triage]] practice
- **Open questions**: surfaces what to investigate next
- **Energy & recovery**: links learning to physical state (see [[Burnout-Prevention]])
- **Reflection**: the meta-cognitive act that consolidates the day
- **Tomorrow's first block**: pre-commits to tomorrow

---

## Aggregation

At end of week, run a Dataview query (see [[Dataview-Queries]]) to aggregate:

- Total hours of deep work
- Block type distribution
- Saturation events
- Schemas acquired

Use the aggregates in your [[Weekly-Learning-Rhythm|weekly review]].

---

## Cross-Links

- [[The-Learning-Loop]] — the workflow this template supports
- [[Session-Architecture]] — the 90-min block format
- [[Weekly-Learning-Rhythm]] — the weekly aggregate
- [[Dataview-Queries]] — for aggregation

← Back to [[09-Templates/]]
