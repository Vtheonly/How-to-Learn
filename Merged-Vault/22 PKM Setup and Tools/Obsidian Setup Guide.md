---
aliases: [Setup, Obsidian Install, Vault Setup]
tags: [setup, guide]
---

# ⚙️ Obsidian Setup Guide

> *Get the vault running in 15 minutes.*

---

## Step 1 — Install Obsidian

1. Download from https://obsidian.md (Windows, macOS, Linux)
2. Install and launch
3. Create a new vault: "Open folder as vault"
4. Select the `How-to-Learn-CS-Vault` folder you extracted from the zip

---

## Step 2 — Configure Core Settings

Open Settings (Ctrl+, / Cmd+,):

### Editor
- **Default view for new tabs**: Editing view
- **Strict line breaks**: ON (preserves your formatting)
- **Show line number**: ON (helps when editing large files)

### Files & Links
- **New link format**: Shortest path when possible
- **Default location for new attachments**: In subfolder under current folder (`attachments`)
- **Use [[Wikilinks]]**: ON (matches the vault's style)

### Appearance
- **Base color scheme**: Dark (or your preference)
- **Theme**: Default (or install "Minimal" for cleaner UI)

### Hotkeys
Set these:
- `Ctrl/Cmd + N` — New note
- `Ctrl/Cmd + P` — Command palette
- `Ctrl/Cmd + O` — Quick switcher
- `Ctrl/Cmd + E` — Toggle edit/preview
- `Ctrl/Cmd + [` — Back
- `Ctrl/Cmd + ]` — Forward
- `Alt + [` — Navigate back
- `Alt + ]` — Navigate forward

---

## Step 3 — Install Community Plugins

Go to Settings → Community plugins → Turn on community plugins (if not already on).

Browse and install (see [[Plugin-Recommendations]] for details):

### Essential
1. **Templater** — for templates with dynamic dates
2. **Dataview** — for queries that aggregate your notes
3. **Spaced Repetition** — for SR cards inline in notes

### Highly Recommended
4. **Calendar** — sidebar calendar for daily logs
5. **Graph Analysis** — reveals clusters in your graph
6. **Excalidraw** — for free-form diagrams
7. **Advanced Tables** — for clean table editing

### Optional
8. **Kanban** — for project tracking
9. **Mind Map** — for visual outlines
10. **Outliner** — for bullet-point workflows

---

## Step 4 — Configure Templater

1. Settings → Templater
2. **Template folder location**: `09-Templates`
3. **Trigger Templater on new file creation**: ON
4. **Folder Templates**: assign templates to folders
   - `daily/` → `09-Templates/Daily-Learning-Log.md`
5. Set hotkey: `Alt + N` for "Templater: Create new note from template"

---

## Step 5 — Configure Dataview

Dataview is enabled by default after install. See [[Dataview-Queries]] for queries to add to your MOCs and dashboards.

Settings → Dataview:
- **Enable JavaScript Queries**: ON (only if you'll use JS)
- **Enable Inline Queries**: ON
- **Date format**: `yyyy-MM-dd`

---

## Step 6 — Configure Spaced Repetition

1. Settings → Spaced Repetition
2. **Flashcard tags**: `sr` (or your chosen tag)
3. **Convert folders to decks**: ON (or use tags)
4. **Daily limit**: 100 (lower if you're new)
5. Set hotkey: `Alt + R` for "Spaced Repetition: Review flashcards in note"

---

## Step 7 — Create Your Daily Log Folder

1. Create folder `daily/` in your vault root
2. The Daily-Learning-Log template will create notes here
3. Optional: install the Calendar plugin to navigate daily logs visually

---

## Step 8 — Customize the Graph

Open Graph View (Ctrl/Cmd + G). Configure:

- **Color by: folder**
- **Filter**: hide `99-References` and `09-Templates` for daily use
- **Force toggle: arrows** ON
- **Node size: backlinks** (so hubs appear larger)

Save as a saved graph named "Daily."

---

## Step 9 — Set Up the Daily Note Default

Settings → Daily notes (core plugin):
- **New file location**: `daily/`
- **Template file location**: `09-Templates/Daily-Learning-Log.md`
- **Date format**: `YYYY-MM-DD`

Set hotkey: `Alt + D` for "Open today's daily note."

---

## Step 10 — Open the Canvas

Open `00-Index/Vault-Map.canvas` (if you've copied the canvas file) for a visual overview.

If you don't have the canvas, you can create one:
1. Create new canvas: Command palette → "Create new canvas"
2. Drag notes from the file explorer onto the canvas
3. Connect them with arrows

---

## Verification Checklist

After setup, verify:

- [ ] Daily note hotkey creates a new note from the template
- [ ] Dataview queries render in `00-Index/Home.md`
- [ ] Spaced Repetition plugin finds cards in test concept notes
- [ ] Templater dynamic dates work (`<% tp.date.now() %>`)
- [ ] Graph view shows the vault structure
- [ ] Backlinks panel shows incoming links
- [ ] Search (Ctrl/Cmd + Shift + F) works across the vault

---

## Troubleshooting

### "Templater syntax not rendering"
Make sure Templater (not the core Templates plugin) is enabled, and that Templater's "Trigger Templater on new file creation" is ON.

### "Dataview queries show as code blocks"
Make sure Dataview is enabled. Code blocks should look like:
````
```dataview
TABLE ... 
```
````

### "SR cards not detected"
Check the SR plugin's flashcard tag settings. The vault uses inline `?` separator; ensure that's the configured format.

### "Wiki links don't navigate"
Check Settings → Files & Links → Use `[[Wikilinks]]` is ON. Some links use aliases like `[[Note|Display]]` — make sure your Obsidian version supports this.

---

## Cross-Links

- [[Plugin-Recommendations]] — detailed plugin reviews
- [[Dataview-Queries]] — copy-paste queries
- [[Home]] — once set up, start here
- [[Start-Here]] — onboarding flow

← Back to [[Home]]
