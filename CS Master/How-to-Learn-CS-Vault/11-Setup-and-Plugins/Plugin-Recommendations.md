---
aliases: [Plugins, Recommended Plugins]
tags: [setup, plugins]
---

# Plugin Recommendations

> *The plugins that turn Obsidian from a markdown editor into a learning operating system.*

---

## Tier 1 — Essential

### Templater
**What**: Templating engine with JavaScript-style dynamic content.
**Why**: Powers all the [[09-Templates/|templates]] in this vault. Without it, daily logs and triage cards are manual.
**Setup**: 
1. Install from Community Plugins
2. Set template folder to `09-Templates`
3. Enable "Trigger Templater on new file creation"
4. Bind hotkeys for common templates
**Config**:
```json
{
  "template_folder": "09-Templates",
  "trigger_on_create": true,
  "folder_templates": {
    "daily/": "09-Templates/Daily-Learning-Log.md"
  }
}
```

### Dataview
**What**: SQL-like queries over your markdown frontmatter.
**Why**: Aggregates your notes into dynamic tables (e.g., "all Tier 1 papers read this month"). Without it, your MOCs are static.
**Setup**: Install, enable, then add queries to MOCs. See [[Dataview-Queries]].
**Example query** (in any note):
```dataview
TABLE tier, rating, read
FROM #reading
WHERE read >= date(today) - dur(30 days)
SORT read DESC
```

### Spaced Repetition
**What**: Inline flashcards in your notes, with SR scheduling.
**Why**: Powers the [[Spaced-Repetition-Queue|SR protocol]]. Cards live next to the concept they test, not in a separate app.
**Setup**:
1. Install
2. Set flashcard tag: `sr` (or leave default)
3. Set daily review limit: 100
4. Use the format:
   ```
   Question text?
   ?
   Answer text
   ```

---

## Tier 2 — Highly Recommended

### Calendar
**What**: Sidebar calendar showing daily notes.
**Why**: Easier navigation of [[Daily-Learning-Log|daily logs]]. Click a date → open that note.
**Setup**: Install, enable, configure to point at `daily/` folder.

### Graph Analysis
**What**: Computes graph metrics (PageRank, clustering) over your notes.
**Why**: Reveals which notes are "hubs" (high-centrality) and which are isolated. Helps you spot under-linked concepts.
**Setup**: Install, enable, run on your vault.

### Excalidraw
**What**: Embedded free-form drawing in notes.
**Why**: For diagrams that don't fit Mermaid's structure (e.g., hand-drawn architecture sketches).
**Setup**: Install, enable, embed via `![[drawing.excalidraw]]`.

### Advanced Tables
**What**: Better table editing (auto-format, sort, formula).
**Why**: Tables in [[Triage-Decision-Tree|triage]], [[Concept-Mapping-Protocol|concept maps]], and [[MOC-Domain-Maps|domain maps]] become much easier to maintain.
**Setup**: Install, enable. Use Tab/Enter to navigate.

---

## Tier 3 — Optional but Useful

### Kanban
**What**: Trello-style boards from markdown.
**Why**: For tracking [[Project-Implementation-Log|build projects]] through stages (planned → in-progress → testing → done).
**Setup**: Install, create a board note with columns.

### Mind Map
**What**: Visual mind map from markdown bullet lists.
**Why**: Quick visualizations of hierarchical concepts.
**Setup**: Install, enable, run command on a note.

### Outliner
**What**: Enhanced bullet-list editing (Roam-style).
**Why**: If you prefer outliner-style notes, this is essential. Otherwise skip.
**Setup**: Install, enable.

### Tasks
**What**: Todo tracking with due dates and recurrence.
**Why**: For task management within notes.
**Setup**: Install, enable. Syntax: `- [ ] Task 📅 2024-04-15`

### Periodic Notes
**What**: Weekly, monthly, quarterly notes alongside daily notes.
**Why**: Supports the [[Weekly-Learning-Rhythm|weekly review]] and [[Review-and-Refactor-Cycle|quarterly review]] structure.
**Setup**: Install, enable, create templates for weekly/monthly/quarterly notes.

### Better Word Count
**What**: Tracks word count, characters, and reading time.
**Why**: Useful for tracking your writing output.
**Setup**: Install, enable.

---

## Plugin Combinations

### The "Daily Workflow" Combo
- Templater + Calendar + Daily Notes + Spaced Repetition + Dataview

Daily log creation → calendar navigation → inline SR review → Dataview aggregation in MOCs.

### The "Research Workflow" Combo
- Templater + Dataview + Spaced Repetition + PDF++ (for PDF reading) + Citations

Paper triage → reading note → SR cards from paper → Dataview aggregation by topic.

### The "Build Workflow" Combo
- Templater + Kanban + Tasks + Git (community plugin) + Advanced Tables

Build planning → project tracking → task management → version control.

---

## What to Avoid

### Plugins that duplicate Obsidian's core
Most "outline" plugins duplicate functionality Obsidian has built-in. Check core first.

### Productivity porn
Plugins that look impressive but don't change your behavior. Be ruthless: if a plugin doesn't change a workflow, uninstall it.

### Sync plugins you don't need
Obsidian Sync (paid) works well, but Syncthing, iCloud, Dropbox, or git all work for free. Pick one and stop.

### Theme overload
Pick one theme and stick with it. Theme-switching is procrastination.

---

## Plugin Maintenance

### Quarterly audit (during [[Review-and-Refactor-Cycle|quarterly review]]):
- Disable plugins you haven't used in 3 months
- Update plugins (check Settings → Community plugins → Check for updates)
- Review whether new plugins would help current workflows

### Backup
Before any major plugin change:
1. Export your vault (Settings → Files → Export)
2. Or commit to git
3. Or copy the folder

Plugin updates occasionally break things. Have a rollback.

---

## Cross-Links

- [[Obsidian-Setup-Guide]] — initial setup
- [[Dataview-Queries]] — query examples
- [[09-Templates/]] — what Templater powers
- [[Daily-Learning-Log]] — what the daily workflow looks like

← Back to [[Home]]
