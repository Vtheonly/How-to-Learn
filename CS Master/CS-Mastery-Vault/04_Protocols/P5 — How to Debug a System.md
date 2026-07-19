---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P5 — How to Debug a System

> Debugging is not guessing — it is hypothesis-driven bisection: reproduce reliably, write the hypothesis down, change one thing at a time, narrow the suspect region with logs, explain the system to a rubber duck, test the hypothesis with a minimal repro, fix the root cause, and document the failure mode so the same bug never costs you this much time again.

**When to use:** Any time you are stuck on a bug for more than ~30 minutes. Also for production incidents: the protocol scales from a single-function bug to a distributed-systems outage with minor adaptations.
**Inputs:** A bug (a discrepancy between expected and observed behavior), access to the system, a willingness to write things down.
**Outputs:** A written root-cause analysis, a regression test, and a schema dossier update documenting the failure mode.
**Time:** 30 minutes to several hours; the protocol ends when you have a root cause, not when the symptom goes away.

---

## Steps

### Step 1 — Reproduce reliably (10-30 min)

Before anything else, **reproduce the bug on demand**. A bug you cannot reproduce is a bug you cannot fix. Three cases:

1. **Trivially reproducible** — run the failing test, see the failure. Move to Step 2.
2. **Conditionally reproducible** — needs specific input, specific state, specific timing. Construct the minimal reproducer: the smallest input and the shortest sequence of operations that triggers the bug.
3. **Apparently irreproducible** — intermittent, environmental, or timing-dependent. Reproduce by force: stress-test the suspected path, run under load, run with chaos injection, lower the threshold (e.g., turn a timeout from 30s to 100ms) to force the race.

Concrete example — a Kubernetes operator that "sometimes re-processes the same object forever." You suspect it depends on object size or controller restart. Reproducer: create a ConfigMap with 10 KB of data, restart the controller, watch the logs for repeated reconcile calls. If the bug reproduces, you have it on demand. If not, escalate: create a 100 KB ConfigMap, force a network partition between the controller and the API server for 5 seconds, release. The bug reproduces. You have a reproducer.

This step is non-negotiable. Skipping it turns the rest of the protocol into guesswork; see [[03_Methods/M10 — Strategic Triage|M10]] — debugging without reproduction is the cognitive-load version of attempting to learn everything.

### Step 2 — Form a hypothesis; write it down (5 min)

Write, in one sentence, what you believe is the cause. **Write it down** — do not hold it in your head. The act of writing exposes hand-waving; mental hypotheses can stay vague, written ones cannot. Format:

> Hypothesis: the bug is caused by `<specific mechanism>` in `<specific component>`, triggered when `<specific condition>`. Predicted observable consequence: `<what you would see if this hypothesis is true>`. Falsified by: `<what you would see if this hypothesis is false>`.

The "falsified by" clause is the most important part. A hypothesis you cannot falsify is not a hypothesis; it is a feeling. Make the falsification criterion explicit before you run any test.

Concrete example — the K8s operator loop: "Hypothesis: the controller's `Reconcile` function returns success without actually patching the status subresource, so the API server's observed state never matches the desired state, and the next watch event triggers another reconcile. Predicted observable: the status subresource is empty after each reconcile. Falsified by: the status subresource being populated but still not matching the spec."

This step operationalizes [[03_Methods/M5 — Elaboration & Self-Explanation|M5]]: writing the hypothesis is self-explanation, and the falsification criterion is the "because" that exposes hand-waving.

### Step 3 — Bisect: change one thing at a time (variable time)

Debugging is bisection. Each experiment changes **exactly one variable** and observes. If you change two things and the bug disappears, you do not know which one fixed it (or whether the combination did). If you change two things and the bug persists, you have ruled out neither.

The bisection targets:

- **Code bisect**: `git bisect` to find the commit that introduced the bug. Often the fastest method when the bug is recent.
- **Input bisect**: shrink the input that triggers the bug until it cannot be shrunk further. The minimal input is the bug's signature.
- **State bisect**: bisect the system state (data on disk, in-memory caches, environment variables) to find which element triggers the bug.
- **Concurrency bisect**: force the race to deterministic order (barriers, sleeps, single-threading) to find which interleaving triggers the bug.

Concrete example — a flaky test that fails ~5% of the time: do not run it 1000 times hoping to catch a pattern. Instead, replace the system clock with a controllable fake; run the test under every interleaving the fake can produce. The bug should reproduce deterministically under one specific interleaving. Now you have a reproducer for Step 1 and a hypothesis target for Step 2.

This step is the deliberate-practice core of debugging (see [[01_Theory/T3 — Deliberate Practice|T3]]). Each experiment is effortful, observable, and gap-producing; each one either confirms or falsifies a hypothesis, narrowing the suspect space.

### Step 4 — Use printf/logging strategically; narrow the suspect region (15-45 min)

When bisection alone is insufficient (which is often), add logging. The rule: **add logging at the boundaries of the suspect region, not throughout it**. If you suspect a function `f`, log its inputs, its outputs, and the invariants it claims to maintain — not every line inside it. Inside-out logging produces noise; boundary logging produces signal.

Levels of instrumentation, from cheapest to most expensive:

1. **Existing logs** — turn the log level up to DEBUG. Cheapest, often sufficient.
2. **Strategic prints** — add 3-5 prints at the boundaries of the suspect region.
3. **Assertions** — `assert(invariant)` at function entry/exit. Fires only on violation; cheap in production.
4. **Debugger breakpoints** — most powerful, most expensive in attention. Use only when logging has narrowed the region to a few lines.

Concrete example — debugging a memory corruption in C: do not sprinkle `printf` throughout the program. Instead, set a watchpoint on the corrupted memory address (`watch *0x...` in gdb). The watchpoint fires the instant the address is written; you see the exact line of code that corrupts it. Boundary logging at the memory-allocation level (with allocator hooks like `MALLOC_CHECK_` or ASan) is even faster.

The trap is over-logging: adding 50 prints, getting 10000 lines of output, and being unable to find the signal. The rule "log at boundaries" prevents this; if you cannot name the boundary, you do not yet understand the system well enough to debug it — go back to [[04_Protocols/P4 — How to Learn a New System|P4]] or [[04_Protocols/P2 — How to Read Source Code|P2]] Step 3.

### Step 5 — When stuck, explain the system to a rubber duck; state assumptions explicitly (10-30 min)

When bisection and logging have not produced a root cause in ~30 minutes, stop. Find a rubber duck (a colleague, an empty chair, a literal rubber duck, an LLM). Explain the system, the bug, your hypothesis, and your experiments so far. **State every assumption explicitly**, even the ones that "obviously" hold. The bug is almost always in an assumption you have not stated because it seemed too obvious to mention.

The rubber duck works because explanation is generative (see [[01_Theory/T7 — Generative Learning|T7]]): producing the explanation forces you to organize the material, expose gaps, and surface hidden assumptions. Mental review does not have this effect because thought can gloss over gaps; speech cannot.

Concrete example — debugging a Postgres query that returns wrong results: you have been assuming the planner is correct because the plan looks reasonable. Explain the plan to the rubber duck: "The planner chose a nested-loop join because it estimated table A has 10 rows. The estimate comes from the statistics in `pg_statistic`." Halfway through this sentence, you realize you have not checked `pg_statistic` — the statistics might be stale or wrong. You check, and `pg_statistic` was last updated before a large insert. The bug is a stale-statistics bug, not a planner bug. The rubber duck surfaced the assumption ("statistics are current") that you had not even known you were making.

This step is mandatory when stuck. Skipping it produces the classic failure mode of "debugging by trying random things for 4 hours." A 15-minute rubber-duck session beats 4 hours of random flailing.

### Step 6 — Test the hypothesis with a minimal repro (15-30 min)

You now have a hypothesis (Step 2, refined by Steps 3-5). Construct the **minimal reproducer**: the smallest possible program that triggers the bug. The minimal repro has three properties:

1. **It triggers the bug** — confirmed by observation.
2. **It is minimal** — removing any element makes the bug disappear.
3. **It is portable** — runs on any environment, not just yours.

The minimal repro is your falsification test (from Step 2). If the bug reproduces in the minimal repro, your hypothesis is supported. If not, your hypothesis is falsified; return to Step 2 with a new hypothesis.

The act of minimizing the repro almost always surfaces the actual cause. As you remove elements, you discover which ones are load-bearing and which are incidental. Often the minimization itself produces the "aha" — you realize the bug is in a component you had assumed was correct.

Concrete example — debugging a deadlock in a Rust async program: the original failing program is 2000 lines and uses 5 crates. Minimize: remove one crate at a time, run the test. After removing crate 3, the bug still reproduces. After removing crate 4, it disappears — but that does not mean crate 4 caused the bug; it means crate 4's presence is required to trigger the race. Minimize further: replace the 2000-line program with a 50-line program that uses only crate 4 and the standard library, and that still triggers the bug. The 50-line program reveals the deadlock is in `tokio::spawn` inside a `std::sync::Mutex` guard's scope — a classic "holding a lock across an await" bug. The minimization surfaced it because the 50-line version made the lock-acquire and the await visually adjacent.

### Step 7 — Fix the root cause, not the symptom (30 min - several hours)

The bug is fixed when the **root cause** is addressed, not when the symptom disappears. Three cases:

1. **Root cause is a coding bug** (off-by-one, wrong variable, missing check). Fix the code; add a regression test (Step 8).
2. **Root cause is a design bug** (race condition, missing invariant, wrong abstraction). The fix is structural: add a lock, add an invariant check, refactor the abstraction. Document the design change.
3. **Root cause is an assumption bug** (assumed input was sanitized, assumed network was reliable, assumed clock was monotonic). The fix is to validate the assumption explicitly; the bug class is "trust boundary" and the fix is to add a check at the boundary.

Resist the temptation to fix the symptom. A symptom fix is a regression waiting to happen: the bug will reappear in a different form, and the next debugging session will start from scratch. A root-cause fix is a bug class eliminated forever.

Concrete example — the K8s operator loop from Step 1: the root cause was that the controller was reading the spec and writing the status, but the status write was failing silently (a missing RBAC permission). The symptom was "reconcile runs forever." A symptom fix would be "add a backoff so the reconcile does not spin" — but that masks the bug. The root-cause fix is "add the missing RBAC permission; add a check that surfaces silent failures of status writes." The fix includes the regression test in Step 8.

### Step 8 — Document the failure mode in a schema dossier (15-30 min)

Every non-trivial bug reveals a failure mode of a schema. Map the bug to the schema it instantiates and add an entry to the schema's "Failure analysis" section. This is the single most undervalued step in debugging: the failure-mode catalog you build over months is what makes the 100th bug a 10-minute fix instead of a 3-hour one.

Format:

```
## Failure mode: <short name>
**Schema:** [[02_Schemas/S# — ...|S#]]
**Symptom:** <one-sentence observable>
**Root cause:** <one-sentence mechanism>
**Detection:** <how to detect in production>
**Recovery:** <how to recover>
**Prevention:** <how to prevent recurrence>
**Regression test:** <link to test in repo>
```

Concrete examples:

- The K8s operator loop bug → schema S1 (state & transition), failure mode "silent failure of state transition leaves controller in non-converging loop." Detection: alert on reconcile-count-per-object-per-minute. Recovery: fix the underlying silent failure. Prevention: surface silent API failures loudly.
- The Rust async deadlock → schema S7 (concurrency & coordination), failure mode "holding a non-async-aware lock across an await point." Detection: stress-test the path. Recovery: replace `std::sync::Mutex` with `tokio::sync::Mutex` or restructure to release the lock before awaiting. Prevention: lint rule against holding `std::sync::MutexGuard` across `.await`.
- The Postgres stale-statistics bug → schema S4 (optimization & constraints), failure mode "planner decisions based on stale statistics produce catastrophic plans." Detection: compare `EXPLAIN` output before and after `ANALYZE`. Recovery: run `ANALYZE`. Prevention: enable auto-analyze; monitor statistics freshness.

The failure-mode catalog compounds. After 50 documented bugs, you start recognizing new bugs as instances of documented failure modes; debugging time collapses from hours to minutes. This is the long-term payoff of the protocol — see [[01_Theory/T4 — Long-Term Working Memory|T4]].

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Changing multiple things at once | Bug disappears; you don't know why. | Step 3: change exactly one variable per experiment. |
| Fixing symptoms, not root cause | The bug reappears in a different form next month. | Step 7: address the root cause; add a regression test. |
| Not writing hypotheses down | Mental hypotheses stay vague; you forget what you ruled out. | Step 2: written hypothesis with explicit falsification criterion. |
| Debugging without reproducing | You "fix" something you cannot verify. | Step 1 is non-negotiable; do not skip to fix. |
| Not using a debugger | You add 50 prints instead of 1 breakpoint. | Step 4: use the cheapest sufficient instrumentation; watchpoints > breakpoints > prints > debug logs. |
| Skipping the rubber duck | You spend 4 hours trying random things. | Step 5 is mandatory when stuck >30 min; explanation is generative. |
| Over-logging | 10000 lines of output, no signal. | Log at boundaries, not throughout; name the boundary before logging inside it. |
| Stopping at the first plausible cause | You fix something, the symptom goes away, but the root cause is elsewhere. | Step 6: minimal repro; Step 7: root cause, not symptom. |
| No regression test | Bug reappears in 6 months; you debug from scratch. | Step 8 includes a regression test that fails before the fix and passes after. |
| No schema dossier entry | The bug is a one-off; the failure mode is not catalogued. | Step 8 maps the bug to a schema; the catalog compounds across bugs. |
| Debugging from memory | You "remember" the system but your model is stale. | Re-trace the path with a debugger (P2 Step 3); do not trust memory of code. |

## Linked methods

- [[03_Methods/M10 — Strategic Triage|M10]] — Step 1 (reproduce reliably) is a triage act; you cannot debug what you cannot reproduce.
- [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] — Step 2 (write the hypothesis) and Step 5 (rubber duck) are self-explanation.
- [[03_Methods/M8 — Generative Production|M8]] — Step 6's minimal repro is generative production of the bug.
- [[03_Methods/M4 — Worked Examples|M4]] — Each debugging step is a worked example of hypothesis-driven investigation.
- [[03_Methods/M1 — Retrieval Practice|M1]] — When you encounter a similar bug later, retrieve the documented failure mode from your dossier.

## Linked theory

- [[01_Theory/T7 — Generative Learning|T7]] — Step 5's rubber duck is generative; explanation forces gap exposure.
- [[01_Theory/T3 — Deliberate Practice|T3]] — Step 3's bisection is effortful, observable, gap-producing.
- [[01_Theory/T4 — Long-Term Working Memory|T4]] — Step 8's failure-mode catalog builds the LT-WM chunks that make future debugging fast.
- [[01_Theory/T8 — Adaptive Expertise|T8]] — Documenting failure modes produces adaptive, not routine, debugging expertise.
- [[01_Theory/T1 — Schema Transfer|T1]] — Step 8 maps bugs to schemas, enabling transfer across systems.

## Worked example

A Kubernetes operator intermittently re-processes the same ConfigMap every 2 seconds, forever. You have been stuck for an hour.

- **Step 1 (10 min)** — reproduce. Create a ConfigMap with 10 KB of data; restart the controller; watch the logs. The reconcile loop fires every 2 seconds on the same object. Reproducer confirmed.
- **Step 2 (5 min)** — write the hypothesis: "The controller's `Reconcile` function returns success without patching the status subresource, so the API server's observed state never matches desired, and the next watch event triggers another reconcile. Predicted observable: the status subresource is empty after each reconcile. Falsified by: status subresource being populated but still not matching spec."
- **Step 3 (15 min)** — bisect. First variable: the controller's RBAC permissions. Add `update` permission on `configmaps/status`. Rebuild. The bug persists — RBAC is not the cause (or not the only cause). Restore. Second variable: the status-patch call itself. Add a log line before and after the `UpdateStatus` call. The "after" log never fires; the call returns an error that is being swallowed.
- **Step 4 (10 min)** — strategic logging. Add logs at the boundary of `Reconcile`: entry (key, desired spec, observed status), before `UpdateStatus` (computed patch), after `UpdateStatus` (error or nil). Run. The "after" log shows `error: the server could not find the requested resource` — the status subresource does not exist on this CRD. The CRD definition is missing the `status` subresource declaration.
- **Step 5 (10 min)** — rubber duck. You explain the system to a colleague: "The controller computes the desired status, calls `UpdateStatus`, which fails silently because the CRD has no status subresource, the error is swallowed by a `defer` that does `_ = err`, the reconcile returns nil, the watch fires again because observed != desired, the loop spins." Mid-explanation you realize the silent-swallow is the deeper bug: even if you fix the CRD, the next silent failure will spin the same way. The fix must surface silent failures, not just patch this one.
- **Step 6 (20 min)** — minimal repro. A 50-line Go program: register a CRD without a status subresource, write a controller that calls `UpdateStatus` and ignores the error, observe the spin. The repro triggers in 5 seconds. Hypothesis confirmed.
- **Step 7 (30 min)** — fix the root cause. Two changes: (a) add the `status` subresource to the CRD definition; (b) remove the `defer _ = err` and propagate errors so silent failures become loud failures. The symptom fix (a) alone would mask the deeper bug (b); the root-cause fix is both.
- **Step 8 (15 min)** — document the failure mode in the S1 dossier:
  ```
  ## Failure mode: silent-failure non-convergence
  **Schema:** S1 (state & transition)
  **Symptom:** Controller reconcile loop spins forever on one object.
  **Root cause:** A state transition (status patch) fails silently; the controller
    believes it succeeded; observed state never converges to desired; the watch
    re-fires.
  **Detection:** Alert on reconcile-count-per-object-per-minute > N.
  **Recovery:** Identify the silent failure (logging at reconcile boundaries);
    fix the underlying cause.
  **Prevention:** Never swallow errors in reconcile; propagate to the controller
    runtime, which will back off.
  **Regression test:** e2e test that removes a subresource and asserts the
    controller surfaces an error rather than spinning.
  ```

Total time: ~2 hours. The bug is fixed (root cause, not symptom), the regression test prevents recurrence, and the S1 dossier has a new failure-mode entry that will make the next "spinning controller" bug a 10-minute diagnosis instead of a 2-hour one.

## Retrieval queue

#sr
- List the eight steps of P5 in order. Which step is mandatory when stuck >30 min, and why?
- Step 2 asks you to write the hypothesis with an explicit "falsified by" clause. Why is this clause more important than the hypothesis itself?
- Step 3 says "change exactly one variable per experiment." What is the failure mode of changing two variables, and how does it compound across debugging sessions?
- Step 5 (rubber duck) is described as mandatory when stuck. Justify this using T7 (generative learning) and the difference between mental review and spoken explanation.
- Step 8 asks you to map every bug to a schema. How does this compounding effect produce the "100th bug is a 10-minute fix" property? Cite T4 (LT-WM).

---

## Cross-links

- Related protocols: [[04_Protocols/P2 — How to Read Source Code|P2 Read Source]] (Step 4 uses P2's debugger trace), [[04_Protocols/P4 — How to Learn a New System|P4 Learn System]] (Step 8's failure modes are P4 Step 8's inputs), [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]] (Step 8's failure-mode entries are part of every dossier's failure-analysis section).
- Related schemas: [[02_Schemas/S1 — State & Transition|S1]], [[02_Schemas/S4 — Optimization & Constraints|S4]], [[02_Schemas/S5 — Information Flow|S5]], [[02_Schemas/S7 — Concurrency & Coordination|S7]] — the schemas whose failure modes most often produce bugs.
