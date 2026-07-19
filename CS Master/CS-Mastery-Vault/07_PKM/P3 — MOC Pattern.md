---
type: PKM
tags: [PKM]
created: 2026-07-20
updated: 2026-07-20
---

# P3 — MOC Pattern

> Maps of Content (MOCs) are the navigation layer of this vault. They are not indices — they are **curated entry points** that answer a specific question.

---

## What an MOC is

An MOC is a single note whose purpose is to **answer a specific navigation question**. Examples:

- "What are the cognitive principles this vault is built on?" → `00_MOCs/MOC — Theory.md`
- "What are the universal schemas?" → `00_MOCs/MOC — Schemas.md`
- "What should I study this week?" → `00_MOCs/Daily Dashboard.md` (always-current MOC)

An MOC is **not**:
- A table of contents (Obsidian's outline view does that).
- A list of all notes in a folder (Dataview does that).
- A category page (tags do that).

An MOC is a curated answer to a question the user actually asks.

---

## The MOCs in this vault

| MOC | Question it answers |
|-----|---------------------|
| [[00_MOCs/00 Master Index\|Master Index]] | "Where do I start?" |
| [[00_MOCs/How to Use This Vault\|How to Use This Vault]] | "How does the system work?" |
| [[00_MOCs/MOC — Theory\|Theory MOC]] | "What are the cognitive principles?" |
| [[00_MOCs/MOC — Schemas\|Schemas MOC]] | "What are the universal abstractions?" |
| [[00_MOCs/MOC — Methods\|Methods MOC]] | "What study methods do I use?" |
| [[00_MOCs/MOC — Protocols\|Protocols MOC]] | "What's the protocol for task X?" |
| [[00_MOCs/MOC — Roadmap\|Roadmap MOC]] | "What's the curriculum?" |
| [[00_MOCs/Daily Dashboard\|Daily Dashboard]] | "What do I do today?" |

---

## The MOC pattern

Every MOC in this vault follows this shape:

1. **One-sentence summary** (blockquote at top).
2. **The question this MOC answers** (one paragraph).
3. **A table** of the items, with one-line descriptions.
4. **A "how to use" section** — decision tree or flowchart.
5. **Cross-links** to other MOCs.

This is intentional. The shape is consistent so that the user can scan any MOC in 10 seconds and know whether it answers their question.

---

## When to create a new MOC

Create a new MOC when:

- You find yourself asking the same navigation question repeatedly, and no existing MOC answers it.
- A folder grows beyond ~15 notes and needs an internal index that answers a specific question (not just "list everything").

Do **not** create an MOC when:

- A note would suffice (most "I need a list of X" cases are better as a single note).
- The MOC would duplicate an existing MOC.
- The MOC would have < 5 entries. Wait until the count grows.

---

## MOCs vs Dataview queries

Dataview queries are dynamic; MOCs are curated. Use both:

- **Dataview** for "show me all notes with tag X" or "show me recently updated notes." These are mechanical queries; no curation needed.
- **MOCs** for "what should I read first?" or "how do these concepts relate?" These are judgment calls; no query can make them.

The Daily Dashboard is a hybrid: curated content (the 4 vault rules, the quick-start block) plus Dataview queries (recently touched, mastery-level lists).

---

## How to maintain an MOC

MOCs decay. Notes are added; the MOC doesn't get updated; the MOC becomes stale.

Maintenance protocol:

- During the [[04_Protocols/P8 — How to Run a Weekly Review|weekly review]], check each MOC.
- Add any new notes that should be listed.
- Remove any listed notes that no longer exist.
- Update the "how to use" section if your workflow has changed.

If an MOC has not been edited in 3 months, it is probably stale. Audit it.

---

## The single most important MOC

The [[00_MOCs/Daily Dashboard|Daily Dashboard]] is the most important MOC. It is the only MOC you should open daily. Every other MOC exists to be linked from the Daily Dashboard.

Bookmark the Daily Dashboard in Obsidian's bookmark sidebar. Open it at the start of every session.

---

## Cross-links

- [[07_PKM/P1 — Tag System|P1 Tag System]] — tags support MOC filtering.
- [[07_PKM/P2 — Link Grammar|P2 Link Grammar]] — links connect MOCs to content.
- [[07_PKM/P4 — Plugin Stack|P4 Plugin Stack]] — Dataview powers MOC queries.
- [[00_MOCs/00 Master Index|Master Index]] — the root MOC.
