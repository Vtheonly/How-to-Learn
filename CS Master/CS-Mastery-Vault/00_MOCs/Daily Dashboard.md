---
type: MOC
tags: [MOC]
created: 2026-07-20
updated: 2026-07-20
---

# Daily Dashboard

> Your "today" view. Bookmark this. Open it at the start of every session.

---

## Today

Date: `=date(today)`

### Quick start

1. If a study session: open [[06_Templates/Daily Session|Daily Session template]].
2. If a review session: open the **Spaced Repetition** sidebar.
3. If triage: open [[04_Protocols/P6 — How to Triage What to Ignore|P6 Triage]].
4. If weekly review (Sunday): open [[04_Protocols/P8 — How to Run a Weekly Review|P8 Weekly Review]].

---

## Recently touched notes

```dataview
TABLE WITHOUT ID
  file.link AS "Note",
  dateformat(file.mtime, "MMM dd HH:mm") AS "Updated"
WHERE file.mtime >= (today - dur(7 days))
SORT file.mtime DESC
LIMIT 15
```

---

## Open retrieval prompts (`#sr`)

These are the questions you have queued for spaced repetition. Aim to clear the due queue daily.

> Open the Spaced Repetition sidebar plugin to actually review. The list below is for awareness only.

```dataview
TABLE WITHOUT ID
  file.link AS "Source note",
  length(filter(file.lists, (x) => contains(x.text, "#sr"))) AS "SR prompts"
FROM ""
WHERE contains(file.content, "#sr")
SORT file.mtime DESC
LIMIT 20
```

---

## Concepts at each mastery level

### Mastery 1 — Recall

```dataview
LIST
WHERE contains(file.tags, "mastery/1-recall")
SORT file.name ASC
```

### Mastery 2 — Explanation

```dataview
LIST
WHERE contains(file.tags, "mastery/2-explanation")
SORT file.name ASC
```

### Mastery 3 — Derivation

```dataview
LIST
WHERE contains(file.tags, "mastery/3-derivation")
SORT file.name ASC
```

### Mastery 4 — Implementation

```dataview
LIST
WHERE contains(file.tags, "mastery/4-implementation")
SORT file.name ASC
```

### Mastery 5 — Diagnosis

```dataview
LIST
WHERE contains(file.tags, "mastery/5-diagnosis")
SORT file.name ASC
```

### Mastery 6 — Transfer

```dataview
LIST
WHERE contains(file.tags, "mastery/6-transfer")
SORT file.name ASC
```

---

## This week's sessions

```dataview
TABLE WITHOUT ID
  file.link AS "Session",
  dateformat(file.ctime, "MMM dd HH:mm") AS "Logged"
FROM "10_Daily"
WHERE file.ctime >= (this.file.ctime - dur(7 days))
SORT file.ctime DESC
```

---

## The 4 vault rules (always visible)

1. **Every note connects to a schema.**
2. **Every concept ends in retrieval.**
3. **Every session is logged.**
4. **Every week, abstract.**

---

## The single question for today

> What is the one concept I most want to be able to **produce from memory** by the end of today?

Write it here, then design your session around it.

**Today's target concept:** ________
