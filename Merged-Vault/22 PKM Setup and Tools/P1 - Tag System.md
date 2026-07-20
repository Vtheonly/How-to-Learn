---
type: PKM
tags: [PKM]
created: 2026-07-20
updated: 2026-07-20
---

# P1 — Tag System

> How to tag notes in this vault. Tags are not for "topics" — they are for **filters** that the Dataview queries on the Daily Dashboard depend on.

---

## The principle

A tag must answer a question the user actually asks. The tags in this vault answer:

- **What kind of note is this?** → `type:` frontmatter + tag
- **What pillar does it belong to?** → `pillar/software`, `pillar/systems`, `pillar/ai`
- **What mastery level is it at?** → `mastery/1-recall` … `mastery/6-transfer`
- **What is its lifecycle state?** → `draft`, `evergreen`
- **Does it have retrieval prompts?** → `sr` (auto-added by Spaced Repetition plugin)

Tags are **not** for content topics. Topic navigation is done via wikilinks to schema dossiers and the MOCs. Mixing topics into tags creates tag explosion and breaks the MOC pattern.

---

## The full tag taxonomy

### Type tags (mutually exclusive; one per note)

Set in frontmatter as `type: <X>` AND as a tag `#<X>` for compatibility with Dataview filters.

| Tag | Used for |
|-----|----------|
| `MOC` | Maps of Content in `00_MOCs/` |
| `Theory` | Notes in `01_Theory/` |
| `Schema` | Schema dossiers in `02_Schemas/` |
| `Method` | Method notes in `03_Methods/` |
| `Protocol` | Protocol notes in `04_Protocols/` |
| `Roadmap` | Roadmap notes in `05_Roadmap/` |
| `Template` | Templates in `06_Templates/` |
| `PKM` | PKM notes in `07_PKM/` |
| `Reference` | Reference / citation notes in `08_References/` |
| `Glossary` | Glossary entries in `09_Glossary/` |

### Pillar tags (multi-select; zero or more per note)

Use on concept notes that belong to a pillar.

- `pillar/software` — software engineering concepts
- `pillar/systems` — systems engineering concepts
- `pillar/ai` — AI engineering concepts

A concept note may have zero, one, or multiple pillar tags. "TCP" would be `pillar/systems`. "Transformer attention" would be `pillar/ai`. "B-tree" might be both `pillar/software` and `pillar/systems`.

### Mastery tags (mutually exclusive; one per concept/schema note)

- `mastery/1-recall`
- `mastery/2-explanation`
- `mastery/3-derivation`
- `mastery/4-implementation`
- `mastery/5-diagnosis`
- `mastery/6-transfer`

See [[05_Roadmap/R3 — Mastery Rubric|R3]] for definitions. The Daily Dashboard's Dataview queries group notes by these tags.

### Lifecycle tags

- `draft` — note started but not complete; do not promote to evergreen until rules are met.
- `evergreen` — note complete; passes the vault rules check at the bottom.

### Special tags

- `sr` — added by the Spaced Repetition plugin to notes containing `#sr`-tagged prompts. Used by the Dataview query on the Daily Dashboard.
- `protocol-draft` — for new protocols being tested before promotion to `04_Protocols/`.

---

## How to apply tags

In frontmatter:

```yaml
---
type: Schema
tags: [Schema, pillar/systems, pillar/ai, mastery/3-derivation, evergreen]
---
```

Or inline in the body (Obsidian supports both):

```
#sr #pillar/systems
```

The frontmatter style is preferred for consistency.

---

## What NOT to tag

Do not create tags for:

- Specific topics ("#react", "#tcp", "#paxos"). Use wikilinks to concept notes instead.
- Difficulty ("#hard", "#easy"). Use the mastery level instead.
- Status ("#todo", "#in-progress"). Use checkboxes and the `draft` lifecycle tag.
- Time ("#week3", "#q1"). Use the daily logs and monthly retrospectives.

These rules prevent tag explosion. The vault should never have more than ~30 tags total.

---

## Maintaining the tag set

The list of allowed tags is in `.obsidian/core-plugins-migrated.json` and is enforced by Obsidian's tag suggestion. To add a new tag:

1. Decide it is genuinely necessary (most aren't).
2. Add it to the allowed list in `.obsidian/core-plugins-migrated.json`.
3. Document its use in this note.
4. Apply consistently.

If a tag is used by < 3 notes, it should be merged or deleted.

---

## Cross-links

- [[07_PKM/P2 — Link Grammar|P2 Link Grammar]] — links vs tags.
- [[07_PKM/P3 — MOC Pattern|P3 MOC Pattern]] — how MOCs use tags.
- [[00_MOCs/Daily Dashboard|Daily Dashboard]] — where the tags are queried.
