---
type: Method
tags: [Method]
created: 2026-07-20
updated: 2026-07-20
evidence: High
mastery: 2-explanation
---

# M2 — Spaced Repetition

> Distribute reviews across expanding intervals instead of massing them in one session.

**Evidence rating:** ★★★★★
**Targets:** Long-term retention; combat the forgetting curve; make review a low-cost daily habit.
**Primary theory:** [[01_Theory/T6 — Desirable Difficulties|T6 Desirable Difficulties]]

---

## 1. The method

Spaced repetition means reviewing material at increasing delays: day 0, day 1, day 3, day 7, day 21, day 60, day 180. Each review happens just before you would have forgotten the material, which makes the recall effortful (the desirable-difficulty zone). The act of retrieving at that moment resets the forgetting curve with a **steeper slope** — next time you forget more slowly.

In this vault, spaced repetition is operationalized through the Obsidian Spaced Repetition plugin. Any prompt tagged `#sr` is scheduled automatically. You do not manage intervals by hand; you write good prompts and the plugin decides when to surface them. Your job is to (a) write prompts at the right mastery level, (b) review honestly, and (c) cap daily volume so depth wins over volume.

The mechanical procedure is simple: open the daily review queue in the morning, work through the surfaced prompts, rate each (again / hard / good / easy), and stop when the queue is empty. The plugin handles the rest. The hard part is writing prompts that survive spacing — a prompt you can answer only because you saw it yesterday will not survive a 60-day gap, and that is exactly the diagnostic you want.

## 2. Why it works (the mechanism)

The forgetting curve (Ebbinghaus 1885) describes memory as decaying approximately exponentially after study. Two variables govern the curve: the **initial strength** after encoding and the **decay rate**. A single retrieval at the right moment leaves the memory stronger and the decay rate smaller. Each subsequent retrieval amplifies this effect, producing the characteristic staircase of long-term retention.

The "right moment" matters: reviewing too early (while still in working memory) produces no long-term benefit; reviewing too late (after forgetting) means you re-learn from scratch. The optimal gap is roughly 10–20% of the desired retention interval (Cepeda et al. 2006). For one-week retention, review after ~1 day; for one-year retention, review after ~3 weeks.

Spacing also re-instates the **retrieval difficulty** that builds strong paths. Massed review feels productive because every retrieval succeeds easily — but easy retrieval is weak encoding. Spaced review feels harder because the trace has decayed; that difficulty is the mechanism, not a cost.

A third mechanism is **encoding variability**. Each spaced review occurs in a slightly different context (different time of day, different surrounding material, different mood). The variation creates multiple context-dependent retrieval cues, so the memory becomes accessible from more starting points. Massed review encodes the memory in a single context, making it brittle — recallable in that context, less so elsewhere. This is why studying the same topic in different rooms and at different times produces more robust recall than studying it in the same place at the same time.

A fourth mechanism is **consolidation**. Memory consolidation — the biological process by which short-term memories become long-term — occurs over hours to days, largely during sleep. Spacing distributes encoding across multiple consolidation windows; massing crams encoding into a single window. The biological ceiling on per-session consolidation is part of why you cannot learn a semester's worth of material in one weekend, regardless of effort.

## 3. Evidence

**Ebbinghaus (1885)** — first systematic measurement of the forgetting curve using nonsense syllables. Showed that distributed repetition produces savings in re-learning compared to massed repetition.

**Cepeda, Pashler, Vul, Wixted & Rohrer (2006)** — meta-analysis of spacing effects. Distributed practice outperformed massed practice with effect sizes d ≈ 0.4–0.6 across 184 studies. Critically, they identified the gap-to-retention-interval ratio (~10–20%) as the key parameter.

**Kornell & Bjork (2008)** — showed learners systematically **prefer** massing even when spacing is better. The judgment-of-learning illusion: massing feels more effective because each repetition is easy.

**Cepeda, Pashler, Vul, Wixted & Rohrer (2008)** — follow-up examining the gap-duration tradeoff. Showed that the optimal gap depends on the retention interval: short gaps optimize short-term retention; long gaps optimize long-term retention. The 10–20% rule is a heuristic, not a law — for very long retention (years), the optimal gap can be months.

**Dunlosky et al. (2013)** — rated distributed practice as one of two **high-utility** techniques (alongside retrieval practice).

A practical implication of the gap-duration tradeoff: if you are studying for an interview in 2 weeks, massed practice with a 1-day gap is near-optimal. If you are studying for a career, you need gaps of weeks to months. The same technique (spacing) requires different schedules depending on the goal. This is why the #sr plugin's expanding-interval algorithm is calibrated to long-term retention — it assumes you want the knowledge for years, not weeks.

**Rohrer & Taylor (2006)** — showed that spacing benefits are larger when the material is conceptually rich (mathematics, science) than when it is a list of trivia. The schema-building benefit of spacing compounds with the retrieval benefit: each spaced review is both a retrieval event and a schema-consolidation event.

Full citations: [[08_References/References Index|References Index]].

## 4. How to apply it

1. **Use the Spaced Repetition plugin.** Tag prompts with `#sr`. Do not hand-maintain a spreadsheet of intervals; the plugin handles expanding intervals correctly.

2. **Aim for 15–30 quality prompts per day.** This is the upper bound for sustained depth. Reviewing 500 cards/day means each card is shallow. The point is durable transfer, not trivia throughput.

3. **Write prompts that survive a 60-day gap.** A prompt like "What does TCP stand for?" survives spacing but teaches nothing. A prompt like "Draw the TCP state machine and label every transition with the segment that triggers it" survives spacing AND builds schema. See [[03_Methods/M1 — Retrieval Practice|M1]] for prompt levels.

4. **Schedule reviews for the morning.** Willpower and attention are highest early. Treat the review queue as the first task of the day, before email or code. Pair with [[03_Methods/M7 — Implementation Intentions|M7]]: "When I open Obsidian at 9am, I review until the queue is empty."

5. **Match the gap to the desired retention interval.** For concepts you need for an interview in 2 weeks, gap ≈ 1–2 days is fine. For concepts you need for a career, gap ≈ 3–4 weeks. The plugin does this automatically if you rate honestly.

6. **Review honestly.** If you peek or rationalize a "good" rating when you actually struggled, you break the schedule. Rate based on whether you could produce the answer cold, not on whether you recognized it eventually.

7. **Prune ruthlessly.** Prompts you've answered correctly 5+ times at 6-month intervals can be deleted. The queue should hold your active frontier, not your lifetime archive.

8. **Mix prompt types within the daily queue.** Don't review all of one topic, then all of another. Shuffle the queue so each successive prompt is a different topic. This pairs spacing with [[03_Methods/M3 — Interleaving|M3]] and produces discrimination gains on top of retention gains.

9. **Set a daily hard cap.** Even on days when the queue is large, stop at your cap (e.g., 25 prompts). Backlogs roll over; you never "catch up" by cramming 200 in a day. A hard cap prevents the backlog from spiraling into a massed catch-up session that destroys the spacing.

10. **Calibrate the gap to the importance.** Not all knowledge deserves 1-year retention. Tier your prompts:

    - **Tier A (career-critical schemas)**: target 1-year retention; gaps expand to 6 months.
    - **Tier B (project-relevant)**: target 3-month retention; gaps expand to 1 month.
    - **Tier C (transient)**: target 1-month retention; gaps expand to 1 week; delete after.

11. **Sleep between sessions.** Consolidation happens during sleep; a concept studied and then reviewed the next morning benefits from one consolidation cycle. A concept studied and reviewed 4x in one evening benefits from zero. Spacing without sleep is not spacing.

## 5. Common failure modes

| Misuse | Why it fails | Fix |
|--------|--------------|-----|
| 500 cards/day | Each review becomes shallow recognition; you stop retrieving. | Cap at 15–30 deep prompts. |
| Shallow prompts | "Definition of X" does not survive a 60-day gap meaningfully. | Write level-3+ prompts (explain, derive, implement). |
| Reviewing before forgetting | Re-reviewing 4x in one day gives no spacing benefit. | Trust the schedule; resist re-reviewing on impulse. |
| Dishonest ratings | "I kind of knew it" → "good" inflates the interval past the forgetting point. | Rate on cold production only. |
| Never pruning | The queue becomes an archive; review time dilutes. | Delete prompts stable at 6-month intervals. |
| Massed backlogs | "Catch up" sessions on weekends erase the spacing. | Set a daily hard cap; missed days roll over slowly. |
| Interleaving unrelated topics | Spacing without schema-family overlap dilutes discrimination gains. | Pair with [[03_Methods/M3 — Interleaving|M3]]. |
| Rating "good" on recognition | Recognition-based ratings inflate intervals past the forgetting curve. | Rate on cold production only; downgrade if you hesitated. |
| Cramming the backlog on weekends | Massed catch-up destroys the spacing benefit for those cards. | Hard daily cap; let backlogs roll over. |
| Treating all knowledge as Tier A | Queue explodes; review time dilutes; important cards starved. | Tier prompts; prune Tier C aggressively. |
| Spacing without sleep | No consolidation cycles between reviews. | Never review the same card twice in one day. |

## 6. Worked example

You study the TCP three-way handshake on Monday. You write one #sr prompt:

> Draw the TCP connection-establishment sequence between client C and server S. Label each segment with flags, sequence numbers, and the state each side enters. Explain why a three-way (not two-way) handshake is required.

You rate it "again" Monday, "hard" Tuesday (1-day interval), "good" Friday (3-day interval — slightly long, but you recalled it), "good" 3 weeks later, "good" 2 months later, and from then on it surfaces every 6 months.

At each review, you produce the diagram from scratch: SYN (seq=x), SYN-ACK (seq=y, ack=x+1), ACK (ack=y+1). You name the states: CLOSED → SYN-SENT → ESTABLISHED on the client; LISTEN → SYN-RECEIVED → ESTABLISHED on the server. You explain that two-way fails because neither side has confirmed the other's initial sequence number was received, leaving stale SYNs unhandled. Each successful retrieval at a longer interval makes the next retrieval easier and slower to decay.

After the 60-day review, you notice the explanation has stabilized but the diagram production has become mechanical. You upgrade the prompt: "Now add a fourth agent — a NAT in the middle — and explain how each segment is transformed." The upgraded prompt resets the difficulty and pushes the schema to a new edge. The old prompt is deleted; the new one inherits the interval.

Six months later, you encounter a real bug involving half-open connections through a NAT. The schema is there, cold, because the spaced reviews held it at the edge of forgetting and reset the curve each time. The total review time invested across six months was ~15 minutes. The payoff is a bug you diagnose in 10 minutes instead of 2 hours.

The economics of this are the point. The original study session cost 30 minutes. The six months of spaced reviews cost 15 minutes. Total: 45 minutes for a schema that survives six months and pays off in a real debugging session. The alternative — studying once for 30 minutes and never reviewing — would have produced a schema that decayed within a week and was unavailable when the bug appeared. Spacing converts a 30-minute study session into a six-month asset for an additional 15 minutes of distributed review. No other method produces this return on time.

## 7. Cross-links

- **Theory**: [[01_Theory/T6 — Desirable Difficulties|T6 Desirable Difficulties]] — spacing is the canonical desirable difficulty.
- **Methods**: [[03_Methods/M1 — Retrieval Practice|M1 Retrieval Practice]] — spacing is the *when*; retrieval is the *what*.
- **Methods**: [[03_Methods/M3 — Interleaving|M3 Interleaving]] — interleave within the daily review queue.
- **Methods**: [[03_Methods/M7 — Implementation Intentions|M7 Implementation Intentions]] — pre-commit the review slot.
- **Protocols**: [[04_Protocols/P2 — Daily Review Protocol|P2 Daily Review]] — the operational playbook.

## 8. Retrieval queue

#sr
- Define spacing and contrast it with massing. What does each do to the forgetting curve?
- Cepeda et al. (2006): what is the recommended gap-to-retention-interval ratio, and why?
- Why do learners prefer massing even when spacing is better? (Kornell & Bjork 2008.)
- You have 200 overdue cards. What is the correct response and why?
- Design a spaced-repetition schedule (intervals + prompt level) for the concept "Paxos safety vs. liveness" assuming you want 1-year retention.
- Name four mechanisms by which spacing improves retention (beyond the forgetting-curve reset).
- Why does spacing without sleep fail to produce the spacing benefit?
- You have 50 Tier-A, 80 Tier-B, and 120 Tier-C prompts. Design a daily review plan with a hard cap of 25.
- A prompt has been rated "good" 6 times at 6-month intervals. What should you do, and why?
- Cepeda et al. (2008): how does the optimal gap change with the desired retention interval? Give two concrete examples.
- Why is the judgment-of-learning illusion (Kornell & Bjork 2008) dangerous for self-directed learners?
- Rohrer & Taylor (2006): why are spacing benefits larger for conceptually rich material than for trivia?
- You have a 2-week interview prep window. Design a spacing schedule (intervals + prompt tiers) that optimizes for 2-week retention without sacrificing 6-month retention of the core schemas.
- Contrast the four mechanisms of spacing (forgetting-curve reset, retrieval difficulty, encoding variability, consolidation). Which two depend on sleep?
- Why does the #sr plugin's expanding-interval algorithm assume long-term (year-plus) retention? What would change if you optimized for 2-week retention instead?
- Ebbinghaus (1885): what did the forgetting-curve experiments measure, and what was the key finding about distributed vs. massed repetition?
- You miss 3 days of reviews. On day 4, your queue has 60 overdue cards. What is the correct response, and why is "review all 60 today" wrong?
- Why is "reviewing before forgetting" a failure mode, and how does the plugin's algorithm prevent it?

---

> **Bottom line**: spacing is not about reviewing more — it is about reviewing at the moment of maximum retrieval difficulty. The plugin handles the schedule; your job is writing prompts worth remembering for a year.
