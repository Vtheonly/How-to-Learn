---
aliases: [Project Log, Implementation Log Template]
tags: [template, project]
---

# 📋 Project Implementation Log

> *Track a build project from concept to completion. The artifact of [[Build-to-Learn]].*

---

## Template

One file per build project. Save in your projects folder.

```markdown
---
type: project-log
project: <<name>>
concept: <<what schema this build consolidates>>
start-date: <% tp.date.now("YYYY-MM-DD") %>
end-date: <<TBD>>
status: <<in-progress | completed | paused | abandoned>>
tags: [project, <<topic1>>, <<topic2>>]
---

# <<Project Name>>

## Goal

<<1-2 sentences: what you're building and why>>

## Concept being consolidated

<<Which schema from your [[MOC-Foundations|foundations]] / [[MOC-Domain-Maps|domain maps]] is this build consolidating?>>

## Constraints

- **Time budget**: <<X hours total>>
- **Code size target**: <<Y LOC>>
- **No-reference constraint**: <<what you won't consult>>

## Source material

- Primary: <<paper / book chapter>>
- Allowed: <<standard library docs, your own notes>>
- Forbidden: <<existing implementations, tutorials, LLM-generated core algo>>

## Implementation log

### Session 1 — <<date>>
- Time: <<X min>>
- Goal: <<
- Progress: <<
- Walls hit: <<
- Decisions: <<
- Next: <<

### Session 2 — <<date>>
<<repeat>>

### Session N — <<date>>
<<repeat>>

## Testing

### Test cases
- <<test 1>>
- <<test 2>>
- ...

### Reference implementation
<<Which existing implementation will you compare against?>>

### Comparison results
- Test 1: pass / fail / diff: <<
- Test 2: ...
- ...

## What I got wrong

<<List every gap in your understanding the build revealed.>>

- <<gap 1>>
- <<gap 2>>

## What the reference taught me

<<What did you learn by comparing to the reference?>>

- <<insight 1>>
- <<insight 2>>

## What's still unclear

<<Open questions for future learning>>

- <<question 1>>
- <<question 2>>

## Next build

<<Related concept to build next, building on this one>>

## Links

- [[<<concept note>>]]
- [[<<related project>>]]
```

---

## When to Use

For every [[Build-to-Learn]] project. One file per project.

---

## Why Each Field Matters

- **Concept being consolidated**: ties the build back to your schema map
- **Source material**: makes the "no-reference constraint" explicit
- **Implementation log**: surfaces patterns across sessions
- **Testing**: forces you to define success criteria
- **What I got wrong**: the *learning* — without this, you've built but not learned
- **What the reference taught me**: closes the loop with feedback
- **What's still unclear**: seeds future projects
- **Next build**: ensures builds chain into a curriculum

---

## Cross-Links

- [[Build-to-Learn]] — the workflow
- [[Deliberate-Practice]] — the underlying principle
- [[Concept-Note-Template]] — for the consolidated schemas
- [[Dataview-Queries]] — for aggregating project status

← Back to [[09-Templates/]]
