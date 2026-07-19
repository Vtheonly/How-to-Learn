---
aliases: [SR Queue, Spaced Repetition Template, Anki Card Template]
tags: [template, sr, anki]
---

# 📋 Spaced Repetition Queue

> *Cards for the Obsidian Spaced Repetition plugin (or Anki import).*

---

## Template

Place the cards inline in your concept notes. The Spaced Repetition plugin will pick them up.

```markdown
# <<Concept Name>>

## SR Cards

What is the definition of <<X>>?
?
<<precise definition>>

What are the <<N>> invariants of <<X>>?
?
1. <<invariant 1>>
2. <<invariant 2>>
3. <<invariant 3>>

Compare <<X>> and <<Y>> on <<dimension>>.
?
<<X>>: <<answer>>
<<Y>>: <<answer>>

Given <<scenario>>, what's the <<diagnosis / next step / output>>?
?
<<answer with reasoning>>

Write the <<algorithm / code / formula>> for <<X>>.
?
```
<<code or pseudo-code>>
```

Why does <<X>> work? (1 sentence)
?
<<explanation>>

## Card Design Rules

- **Specific, not broad**: "What is the split invariant of a B+tree of order m?" (good) vs "What is a B+tree?" (bad)
- **Forces retrieval, not recognition**: avoid yes/no questions
- **Single answer per card**: split multi-part cards
- **Include context**: "In Paxos, what does Phase 1a do?" (good) vs "What does 1a do?" (bad)
- **Use code blocks for code answers**: forces exact recall
- **Tag with source**: `[src:: [[Lamport-1978]]]` for tracing back

## Daily Review Workflow

1. Open Obsidian
2. Run "Spaced Repetition: Review flashcards in note" or use the sidebar
3. Review queue (typically 10-20 min)
4. Be honest — failed cards reset
5. Add new cards only after deliberate practice, not after passive reading

## Card Limits

- New cards/day: 10-20 (more → review snowball)
- Max reviews/day: 100-150 (more → burnout)
- Total active cards: <2000 (more → review snowball)

## Anti-Patterns

- ❌ Adding cards for things you encounter weekly (they're naturally spaced)
- ❌ Adding cards for things you can't apply (ritual without use)
- ❌ Multiple facts per card (split them)
- ❌ Yes/no questions (low retrieval effort)
- ❌ Cards without source tags (can't trace back when you forget)

## Migration from Anki

If you have an existing Anki collection:
1. Export from Anki as CSV
2. Convert to Obsidian SR format (one card per Q&A pair)
3. Embed in concept notes by topic

## Cross-Links

- [[Spaced-Repetition-and-Forgetting]] — the theory
- [[Testing-Effect-Retrieval-Practice]] — the mechanism
- [[Daily-Learning-Log]] — daily SR review is part of the loop
- [[Plugin-Recommendations]] — the Spaced Repetition plugin

← Back to [[09-Templates/]]
