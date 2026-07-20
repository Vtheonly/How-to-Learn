---
aliases: [LT-WM, Ericsson Kintsch, Long-Term Working Memory]
tags: [theory, memory, expertise]
---

# Long-Term Working Memory (Ericsson & Kintsch)

> Ericsson, K. A., & Kintsch, W. (1995). Long-term working memory. *Psychological Review, 102*(2), 211-245.

---

## Theory

Classical working memory (WM) holds ~4 chunks for ~30 seconds. By this limit, no human should be able to read a 1000-page systems manual and retain anything. Yet experts do.

Ericsson & Kintsch resolved this by proposing **Long-Term Working Memory (LT-WM)**: a learned capacity to use long-term memory (LTM) as a temporary working buffer through *retrieval cues*.

The mechanism:

1. The expert has thousands of domain schemas in LTM (see [[Schema-Theory-and-Anderson]]).
2. While reading/working, they generate **retrieval cues** in WM (a few tokens — "this is a wait-free queue, see Java's ConcurrentLinkedQueue").
3. Each cue retrieves an entire schema from LTM into "active" status.
4. The expert effectively has hundreds of chunks "active" without overloading WM, because only the cue (not the schema) occupies WM.

LT-WM is **domain-specific**. A chess grandmaster has extraordinary LT-WM for chess positions but ordinary WM for digits. A senior systems engineer has LT-WM for distributed systems design but not for organic chemistry.

LT-WM takes years of deliberate practice to build. It cannot be shortcut.

---

## CS Translation

This is *the* mechanism that explains high-velocity technical learning:

- The expert reading a 100k LOC codebase is using LT-WM. Each function name is a cue that retrieves the function's purpose, history, and implications from LTM.
- The expert reading a paper at 5x the speed of a novice isn't "reading faster." Each paragraph activates 5-10 schemas that supply context the novice must construct from scratch.
- The expert who "just sees" the bug in a code review is using LT-WM: the surface cue activates the failure-mode schema ("this is a classic TOCTOU between lines 14 and 22").

This is why you cannot "speed up" novice learning by teaching them to read faster. The bottleneck is not reading speed; it is the absence of LT-WM retrieval structures.

---

## Protocol: Building LT-WM in a New Domain

You cannot rush LT-WM, but you can structure practice so it forms faster:

1. **Generate retrieval cues, don't just store facts.** When you learn a concept, also store *when you would think of it.* "If I see X, retrieve Y." Example: "If I see `select()` with a timeout of 0, retrieve busy-wait anti-pattern."

2. **Practice retrieval, not recognition.** Reading your notes does not build LT-WM. Closing the notes and writing what you remember does. (See [[Testing-Effect-Retrieval-Practice]].)

3. **Spaced retrieval over time.** Cues that are not retrieved decay. Use [[Spaced-Repetition-and-Forgetting]] schedules (Anki or similar).

4. **Use varied contexts.** A schema retrieved only in one context becomes context-bound. Apply each concept in 3+ different projects.

5. **Build, don't just read.** Implementation forces generation of new cues (variable names, file structures, error messages). See [[Build-to-Learn]].

6. **Sleep.** Consolidation of LTM schemas happens during slow-wave and REM sleep. Sleep deprivation collapses LT-WM. See [[Burnout-Prevention]].

---

## Worked Example: Why a Senior Engineer "Just Knows"

A senior engineer glances at this code:

```go
go func() {
    mu.Lock()
    defer mu.Unlock()
    ch <- value
}()
```

And says: "This will deadlock if the channel is unbuffered and the receiver isn't reading yet."

**What just happened in their head** (LT-WM in action):

1. Cues: `go func`, `mu.Lock`, `defer Unlock`, `ch <- value`
2. Cue → schema "goroutine + mutex + channel send"
3. Schema activates failure mode: "send blocks if buffer full → receiver needs to be ready → but receiver may need the same mutex → deadlock"
4. Verbal output in <2 seconds.

The novice reads the same code and sees valid Go syntax. They have no schema, no cue-to-failure-mode link. They will debug this for 4 hours.

The expert did not "think faster." They retrieved.

---

## Key Citations

- Ericsson, K. A., & Kintsch, W. (1995). Long-term working memory. *Psychological Review, 102*(2), 211-245.
- Ericsson, K. A., & Staszewski, J. (1989). Skilled memory and expertise. In *Complex Information Processing*.

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Schema-Theory-and-Anderson]] — what gets stored in LTM
- [[Expertise-Research-Ericsson]] — how long it takes to build
- [[Deliberate-Practice]] — the training protocol
- [[Working-Memory-Saturation]] — what happens when LT-WM fails

← Back to [[MOC-Foundations]]
