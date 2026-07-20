---
type: Method
tags: [Method]
created: 2026-07-20
updated: 2026-07-20
evidence: Moderate-High
mastery: 2-explanation
---

# M6 — Analogical Comparison

> Place two examples of the same schema side by side. Identify what is **structurally shared** (the schema) and what is **surficially different** (the disguise).

**Evidence rating:** ★★★★
**Targets:** Schema abstraction; transfer to novel surface features; sharpening of the relational structure that defines the schema.
**Primary theory:** [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]]

---

## 1. The method

Analogical comparison is the deliberate practice of holding two concrete examples of the same schema side by side and asking: what is the same, and what is different? The sameness is the schema. The difference is surface. The comparison is the active ingredient that builds the abstraction.

The procedure is mechanical. Pick two instances — ideally one well-known, one newly learned. Lay them out in two columns. For each component of the first, find the corresponding component of the second. Write the correspondence as a labeled row in a table. Then list the surface features that differ (terminology, scale, hardware/software, etc.) and explicitly mark them as "surface — ignore for transfer."

The key is that the correspondence must be **relational**, not feature-based. "Both have a leader" is feature-based. "Both elect a coordinator that mediates writes" is relational. The relational mapping is what transfers; feature mappings do not. A learner who maps "TCP has ports, HTTP has methods" has not built a schema. A learner who maps "both TCP and HTTP use a state machine to coordinate two parties through a sequence of message exchanges" has.

Comparison is most valuable when the two instances have **different surface features** but the **same relational structure**. Two Paxos variants with the same terminology produce weak comparison; comparing Paxos to a Kubernetes reconciliation loop (different domains, same state-convergence schema) produces strong abstraction.

The hardest part of comparison is resisting the pull of **surface similarity**. Two things that look alike (TCP and UDP, both transport protocols) invite comparison but may share little relational structure. Two things that look different (a distributed consensus protocol and a control-systems feedback loop) may share deep relational structure but invite no comparison at all. The skill is to look past surface similarity and ask: "Do these two systems have the same shape of causes and effects?" If yes, compare; the abstraction will be valuable. If no, skip; the comparison will produce noise.

This is why experts transfer across domains that novices see as unrelated: the expert has learned to attend to relational structure, not surface features. Analogical comparison is the method that builds that attention. See [[01_Theory/T5 — Expert-Novice Differences|T5]].

## 2. Why it works (the mechanism)

Gentner's **structure-mapping theory** (1983) proposes that analogy is the alignment of relational structures between two domains. The learner places the two domains in correspondence, then projects inferences from the well-understood one (the "base") to the less-understood one (the "target"). The act of alignment **abstracts** the common relational structure away from the surface features of either instance. This abstraction is the schema.

The critical claim is that **comparison is the engine of abstraction**. A learner exposed to a single example cannot abstract — they have only one instance and cannot separate structure from surface. A learner exposed to two examples sequentially (without comparison) also fails to abstract — the surface features of each dominate. Only the **simultaneous, deliberate comparison** forces the structural alignment that produces the transferable schema.

This is why interleaving ([[03_Methods/M3 — Interleaving|M3]]) works: each successive problem is implicitly compared to the previous ones, and the comparison sharpens the schema boundaries. Analogical comparison is the deliberate, single-trial version of the same mechanism.

A second mechanism is **inference projection**. Once the two domains are aligned, the learner can project inferences from the base (well-understood) to the target (newly learned). If the base has a property the target has not yet been observed to have, the learner predicts the target will have it. This is how analogy generates new understanding, not just reorganizes existing understanding. Comparing TCP to a Kubernetes reconciliation loop lets you predict that K8s should have an analog of TCP's keepalive probe — and indeed it does (periodic re-reconcile). The prediction preceded the observation; the schema generated the hypothesis.

A third mechanism is **surface-feature stripping**. Comparison forces the learner to decide which features are structural (shared) and which are surface (different). This decision, repeated across comparisons, trains the learner to attend to structure and ignore surface — the defining skill of expert perception (see [[01_Theory/T5 — Expert-Novice Differences|T5]]).

## 3. Evidence

**Gentner (1983)** — Structure-mapping theory. Formalized analogy as relational alignment, predicted that relational commonality (not feature commonality) drives transfer.

**Gick & Holyoak (1983)** — showed that learners who compared two analogical stories spontaneously abstracted the schema and transferred it to a novel problem. Learners who saw only one story did not. The comparison, not the exposure, was the active ingredient.

**Kurtz, Miao & Gentner (2001)** — compared three conditions: simultaneous presentation with comparison instruction, simultaneous presentation without instruction, sequential presentation. Only the comparison-instructed group showed robust schema abstraction. The mere presence of two examples was insufficient; the instruction to compare was required.

**Nokes & Ohlsson (2010)** — comparison of multiple examples outperformed single-example study on transfer tasks, with the effect mediated by the number of relational correspondences the learner articulated.

**Gentner, Loewenstein & Thompson (2003)** — in a workplace-training study, participants who compared two negotiation cases transferred the schema to a novel case far better than participants who studied the same cases sequentially. The comparison group also retained the schema better over a one-week delay, suggesting comparison produces durable (not just immediate) abstraction.

Full citations: [[08_References/References Index|References Index]].

## 4. How to apply it

1. **Pick two instances.** One should be well-understood (the base); one newly learned (the target). The two must share a relational structure but differ in surface features.

2. **Lay them out in a two-column table.** Each row is a component or role; the two columns are the two instances.

3. **For each row, write the relational correspondence.** Not "X corresponds to Y," but "X plays the role of [relation] in instance A; Y plays the same role in instance B."

4. **List surface differences explicitly.** Mark them as "surface — does not affect the schema." This prevents over-fitting the schema to the surface of either instance.

5. **Articulate the schema in one sentence.** "Both are [abstract structure] in which [role 1] does [action] to [role 2] in order to achieve [property]." This sentence is your transferable schema.

6. **Test the schema on a third instance.** Find a third example (ideally in a different domain) and predict how the schema applies. If the schema fails to predict, refine it.

7. **Pair with M5 (self-explanation) on the correspondences.** For each row, write "why does X play this role in A and Y play this role in B?" The why builds the relational abstraction.

8. **Beware the surface-similarity trap.** If two instances look similar (same domain, same jargon), check whether they actually share relational structure. If they only share surface, the comparison will produce feature mappings, not relational ones. Choose instances that are relationally similar but surficially distant.

9. **Re-compare after a delay.** A single comparison may miss correspondences that emerge only after the schema has consolidated. Re-do the comparison one week later (pair with M2). The second pass often reveals deeper correspondences the first pass missed.

10. **Iterate the schema across instances.** Each new instance either confirms the schema (strengthening it) or forces a refinement (deepening it). Track the schema sentence across instances; watch it generalize. A schema that survives 4+ instances across 3+ domains is likely a core CS schema worth holding in long-term memory.

## 5. Common failure modes

| Misuse | Why it fails | Fix |
|--------|--------------|-----|
| Mapping features instead of relations | Feature mappings don't transfer. | Force "plays the role of..." phrasing. |
| Comparing two near-identical instances | No surface variation; no abstraction pressure. | Pick instances with different domains/terminology. |
| Listing differences without separating surface from structure | Conflates the two; schema stays buried. | Explicitly mark each difference as surface or structural. |
| One-shot comparison | A single alignment may miss correspondences. | Re-compare after a delay (combines with M2). |
| No schema sentence at the end | Without explicit articulation, the schema stays implicit. | Always end with one-sentence schema statement. |
| Comparing unrelated schemas | No relational structure to align. | Verify shared schema first (e.g., both are state machines). |
| Skipping the third-instance test | Schema is untested; may overfit. | Always validate on a held-out instance. |
| Surface-similarity trap | Look-alike instances may share no relational structure. | Prefer relationally-similar, surficially-distant pairs. |
| Comparing only within one domain | Domain jargon dominates; abstraction stays buried. | Compare across domains to force relational extraction. |
| One comparison, never revisited | Schema stays at first-pass depth. | Re-compare after a delay; iterate across instances. |

## 6. Worked example

You compare the TCP state machine with a Kubernetes reconciliation loop. Both are state-convergence schemas: a controller drives a system toward a desired state through a sequence of corrective messages.

| Role | TCP connection | K8s reconciliation loop |
|------|----------------|-------------------------|
| Desired state | ESTABLISHED (both sides ready) | Spec (declared in YAML) |
| Actual state | Current socket state | Status (observed from cluster) |
| Controller | Protocol stack on each host | Controller (e.g., Deployment controller) |
| Corrective signal | Segment (SYN, ACK, FIN) | Reconcile loop iteration producing API calls |
| Convergence | Both hosts reach ESTABLISHED | Observed status matches spec |
| Failure mode | Half-open connection (one side thinks ESTABLISHED, other doesn't) | Drift (cluster state diverges from spec) |
| Resolution | Keepalive probes detect half-open; RST resets | Periodic re-reconcile detects drift; applies corrective patch |

**Surface differences (ignore for transfer):** network packets vs. API calls; transport layer vs. cluster orchestrator; microsecond timescale vs. second timescale.

**Schema sentence:** Both are **closed-loop convergence systems** in which a controller observes actual state, compares to desired state, and emits corrective signals until they match, with failure modes that arise from divergence between the controller's belief and reality.

**Third-instance test:** Apply this schema to a thermostat. Desired state = setpoint; actual state = measured temperature; controller = thermostat logic; corrective signal = furnace on/off; failure mode = sensor drift. The schema transfers cleanly.

You try a fourth instance: a git rebase. Desired state = linear history with the feature branch's commits on top of main; actual state = current branch state; controller = the rebase algorithm; corrective signal = cherry-picking commits; failure mode = merge conflicts. The schema transfers again, with a subtlety: the "corrective signal" in git is destructive (rewrites history), unlike TCP or K8s where it is additive. This refinement — "the corrective signal may be additive or destructive" — generalizes the schema further. Each new instance either confirms the schema (strengthening it) or refines it (deepening it). Both outcomes are learning.

## 7. Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — comparison is the engine of schema abstraction.
- **Theory**: [[01_Theory/T5 — Expert-Novice Differences|T5 Expert-Novice]] — experts abstract relations; novices match features.
- **Methods**: [[03_Methods/M3 — Interleaving|M3 Interleaving]] — implicit, distributed comparison.
- **Methods**: [[03_Methods/M5 — Elaboration & Self-Explanation|M5 Self-Explanation]] — explain each correspondence.
- **Methods**: [[03_Methods/M9 — Concept Mapping|M9 Concept Mapping]] — map the schema's internal relations.

## 8. Retrieval queue

#sr
- Define analogical comparison. What is the active ingredient — exposure, simultaneity, or instruction to compare? (Kurtz, Miao & Gentner 2001.)
- Distinguish feature mapping from relational mapping. Why does only the latter transfer?
- State Gentner's structure-mapping theory in two sentences.
- Why does comparing two near-identical instances produce weaker abstraction than comparing instances with different surfaces?
- You have just learned about write-ahead logging. Design an analogical comparison with another system you already know, including the relational correspondence table and the schema sentence.
- State Gentner's structure-mapping theory in two sentences. What is the active ingredient — exposure, simultaneity, or instruction to compare?
- Distinguish feature mapping from relational mapping. Why does only the latter transfer?
- Why is the surface-similarity trap dangerous, and how do you avoid it?
- You compare Paxos to a thermostat and the schema transfers. What does the successful transfer tell you about the schema's generality, and what should you do next?
- Explain inference projection. How does analogy generate predictions, not just reorganize existing knowledge?
- Why does comparison train surface-feature stripping? How does this relate to expert perception?
- You compare two systems and find only feature mappings, no relational mappings. What is the diagnosis, and what should you do?
- Gick & Holyoak (1983): what did the comparison group do that the single-story group did not? What was the transfer result?
- Kurtz, Miao & Gentner (2001): why was the instruction to compare necessary? What does this imply for self-directed study?
- You compare Paxos to a two-phase commit and find they share no relational structure. Is this a failure of the method or a finding about the systems? Explain.
- Why does comparison across domains (TCP vs. K8s) produce stronger abstraction than comparison within a domain (TCP vs. UDP)?
- Nokes & Ohlsson (2010): what mediated the transfer benefit of comparing multiple examples?

---

> **Bottom line**: a schema is the relational structure shared across instances. You cannot see it in one instance. You can only see it by **comparing** two.
