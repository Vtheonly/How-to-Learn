---
aliases: [Dataview, Queries, Dataview Examples]
tags: [setup, dataview]
---

# Dataview Queries

> *Copy-paste Dataview queries for the vault.*

---

## Query 1 — Recent Reading Notes

Add to [[MOC-Reading-and-Synthesis]] or your dashboard:

```dataview
TABLE tier, rating, read
FROM #reading
WHERE read >= date(today) - dur(30 days)
SORT read DESC
LIMIT 20
```

---

## Query 2 — Tier 1 Reading List (unread)

Add to your dashboard:

```dataview
TABLE author, year, url
FROM #reading
WHERE tier = 1 AND !read
SORT year DESC
```

---

## Query 3 — Concepts by Status

Add to [[MOC-Schema-Construction]]:

```dataview
TABLE status, date
FROM #concept
SORT status ASC, date DESC
```

Statuses: `draft`, `revised`, `consolidated`.

---

## Query 4 — Recent Daily Logs

Add to your dashboard:

```dataview
TABLE date, week
FROM #daily-log
WHERE date >= date(today) - dur(14 days)
SORT date DESC
```

---

## Query 5 — Saturation Events (last 14 days)

For monitoring [[Working-Memory-Saturation]]:

```dataview
TABLE date, file.name AS "block"
FROM #daily-log
WHERE contains(file.content, "saturation")
AND date >= date(today) - dur(14 days)
SORT date DESC
```

Adjust the `contains()` filter to match your log format.

---

## Query 6 — Projects in Progress

Add to your dashboard:

```dataview
TABLE concept, start-date, status
FROM #project
WHERE status = "in-progress"
SORT start-date DESC
```

---

## Query 7 — Schema Maps (Cross-Domain Connections)

Add to [[MOC-Schema-Construction]]:

```dataview
TABLE source-domain, target-domain, date
FROM #schema-map
SORT date DESC
```

---

## Query 8 — Triage Decisions This Month

For monitoring your [[Selective-Ignorance]] practice:

```dataview
TABLE tier, title, author
FROM #triage-card
WHERE date >= date(today) - dur(30 days)
SORT tier ASC, date DESC
```

---

## Query 9 — Deep Work Hours This Week

Aggregates from your daily logs (requires consistent field in frontmatter):

```dataview
TABLE sum(time) AS "Total minutes"
FROM #daily-log
WHERE week = dateformat(date(today), "YYYY-'W'ww")
GROUP BY week
```

Note: requires you to log time per block. Adjust query to match your log structure.

---

## Query 10 — Open Questions

Surfaces open questions from your daily logs:

```dataview
TASK
FROM #daily-log
WHERE !completed
GROUP BY file.link
LIMIT 50
```

---

## Query 11 — Notes Needing Review (Drafts > 2 weeks)

For [[Knowledge-Consolidation-Workflow]]:

```dataview
TABLE date, file.name
FROM #concept
WHERE status = "draft"
AND date <= date(today) - dur(14 days)
SORT date ASC
```

---

## Query 12 — Reading Note Count by Topic

```dataview
TABLE length(rows) AS "Notes"
FROM #reading
FLATTEN tags AS tag
WHERE contains(tag, "#")
GROUP BY tag
SORT length(rows) DESC
LIMIT 20
```

---

## Inline Queries

Dataview also supports inline queries in any note:

- `` `= this.tier` `` — display the current note's tier
- `` `= length(this.file.outlinks)` `` — count outgoing links
- `` `= length(this.file.inlinks)` `` — count incoming links
- `` `= date(today) - this.date` `` — days since this note's date

---

## DataviewJS (Advanced)

For complex queries, use DataviewJS:

```dataviewjs
const pages = dv.pages("#concept")
  .where(p => p.status === "draft")
  .sort(p => p.date, "asc");

dv.table(
  ["Concept", "Date", "Status"],
  pages.map(p => [p.file.link, p.date, p.status])
);
```

Enable DataviewJS in Settings → Dataview.

---

## Customizing Queries

To adapt these queries to your vault:

1. Check your frontmatter field names match (e.g., `tier`, `read`, `status`)
2. Adjust date ranges as needed
3. Add filters for tags specific to your workflow
4. Use `LIMIT` to keep tables manageable

---

## Dataview Resources

- Official docs: https://blacksmithgu.github.io/obsidian-dataview/
- Query examples: https://github.com/blacksmithgu/obsidian-dataview/blob/master/docs/docs/queries/queries.md
- Community examples: r/ObsidianMD, Obsidian Discord

---

## Cross-Links

- [[Plugin-Recommendations]] — Dataview is a Tier 1 plugin
- [[Obsidian-Setup-Guide]] — initial setup
- [[Knowledge-Consolidation-Workflow]] — where Dataview is most useful
- [[Daily-Learning-Log]] — the data source

← Back to [[Home]]
