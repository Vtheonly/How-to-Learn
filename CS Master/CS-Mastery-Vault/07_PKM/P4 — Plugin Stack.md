---
type: PKM
tags: [PKM]
created: 2026-07-20
updated: 2026-07-20
---

# P4 — Plugin Stack

> The plugins this vault depends on, why each is needed, and how to configure it.

---

## The principle

Plugins are not productivity theater. Every plugin in this vault serves a specific cognitive function grounded in the theory notes. If a plugin does not serve a function, it should not be installed.

The vault ships with configuration for two plugins that are **load-bearing**: Dataview and Spaced Repetition. Both are pre-configured in `.obsidian/plugins/` with their `data.json` and `manifest.json`. You need to install the actual plugin binaries (the `.js` files) by enabling them in Obsidian's settings.

## Required plugins

### 1. Dataview

**Why:** powers every dashboard query in this vault. Without Dataview, the Daily Dashboard, the MOC trackers, and the mastery-level lists do not work.

**Cognitive function:** externalizes the metacognitive monitor. You see your mastery distribution at a glance, which forces honest self-assessment (see [[01_Theory/T3 — Deliberate Practice|T3]] — feedback loop).

**Installation:**
1. Open Obsidian Settings → Community plugins.
2. Browse → search "Dataview" → install → enable.
3. The vault's pre-shipped `data.json` and `manifest.json` will be used automatically. If not, copy them from `.obsidian/plugins/dataview/`.

**Configuration:** the vault ships with `enableDataviewJs: false` (for security). Keep it false unless you specifically need JS queries. The standard DQL queries used in this vault do not require JS.

**Required for:**
- [[00_MOCs/Daily Dashboard|Daily Dashboard]]
- [[00_MOCs/MOC — Schemas|MOC — Schemas]] (mastery tracker)
- [[00_MOCs/00 Master Index|Master Index]] (recent updates)

### 2. Spaced Repetition

**Why:** implements [[03_Methods/M2 — Spaced Repetition|M2 Spaced Repetition]] for every `#sr`-tagged prompt in the vault. Without this plugin, the retrieval queue is just static text.

**Cognitive function:** externalizes the spacing schedule. The forgetting curve is automatic; the plugin makes scheduling automatic too. Without it, you would have to manually schedule reviews, which is too much friction to sustain.

**Installation:**
1. Open Obsidian Settings → Community plugins.
2. Browse → search "Spaced Repetition" → install → enable.
3. The vault ships with configuration in `.obsidian/plugins/obsidian-spaced-repetition/data.json` (flashcards tag = `sr`, etc.).

**Usage:**
- Add `#sr` after a prompt to make it a flashcard.
- Open the Spaced Repetition sidebar to review due cards.
- Review daily for 15 minutes.

**Configuration:** the vault uses `flashcardsTag: "sr"` (not the default `#flashcards`). This matches the tag used throughout the theory/method/schema notes.

---

## Recommended (optional) plugins

### 3. Templater

**Why:** the templates in `06_Templates/` use Obsidian's core template syntax (`{{date}}`, `{{time}}`). Templater adds more power (JavaScript, prompts, conditional logic). Useful if you want to extend templates.

**Cognitive function:** reduces friction at session start. Lower friction → more consistent template use → more consistent logging → better metacognitive feedback.

### 4. Calendar

**Why:** visual navigation of `10_Daily/`. Click a day, see the log. Low-friction.

**Cognitive function:** reinforces the daily habit by making daily logs visually present.

### 5. Graph Analysis

**Why:** surfaces orphan notes and weakly-linked clusters. Useful during the [[04_Protocols/P8 — How to Run a Weekly Review|weekly review]].

**Cognitive function:** externalizes link-graph quality. Per [[07_PKM/P2 — Link Grammar|P2 Link Grammar]], orphans and weak clusters are schema-construction failures. This plugin makes them visible.

### 6. Excalidraw

**Why:** hand-drawn diagrams inside notes. The act of drawing is generative (see [[01_Theory/T7 — Generative Learning|T7]]). Better than inserted images for cognitive purposes.

---

## Forbidden plugins

Do **not** install these in this vault:

- **Kanban** — task management is not the vault's purpose. Use a separate task manager.
- **Tasks** — same.
- **Day Planner** — same.
- **Mind Map** — Obsidian's graph view + schema dossiers already serve this function. Adding a separate mind-map view creates two sources of truth.
- **Various AI assistants that summarize notes** — summarization is the enemy of generative learning (T7). The whole point of the vault is that **you** produce the summaries.

The principle: this vault is for learning, not productivity. Anything that does work for you takes learning away from you.

---

## Configuration notes

The vault ships with `.obsidian/app.json` configured for:
- Shortest-path wikilinks (so `[[00 Master Index]]` works from anywhere).
- New files in `10_Daily/` by default.
- Attachments in `99_Attachments/`.

If you change these, the templates and MOCs may break.

---

## Cross-links

- [[07_PKM/P1 — Tag System|P1 Tag System]] — tags power Dataview queries.
- [[07_PKM/P3 — MOC Pattern|P3 MOC Pattern]] — MOCs depend on Dataview.
- [[03_Methods/M2 — Spaced Repetition|M2 Spaced Repetition]] — the theory behind the Spaced Repetition plugin.
- [[00_MOCs/Daily Dashboard|Daily Dashboard]] — the primary Dataview consumer.
