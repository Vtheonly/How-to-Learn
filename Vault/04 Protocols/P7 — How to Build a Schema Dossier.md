---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P7 — How to Build a Schema Dossier

> A schema dossier is not a definition — it is a 7-part artifact that proves a pattern is a real schema by exhibiting it across 3+ domains, formalizing its core, listing contrastive cases that look similar but differ, specifying a minimal implementation, brainstorming failure modes, and writing transfer tests that force the schema to generalize.

**When to use:** When you have noticed a pattern recurring across 3+ domains (e.g., "this looks like the same shape as the previous two things I studied"). Also when promoting a stub dossier to a full dossier after the third instance accumulates.
**Inputs:** 3+ concrete instances of a suspected schema, drawn from domains you know well enough to map.
**Outputs:** A schema dossier file in `02_Schemas/` following the 7-part format, with at least 3 retrieval prompts tagged `#sr`.
**Time:** 4-8 hours for a first dossier; 2-4 hours for subsequent ones as the format becomes automatic.

---

## Steps

### Step 1 — Identify the schema across 3+ domains (30 min)

Before writing anything, verify that the pattern is real. A pattern noticed in one domain is an anecdote; in two domains, a coincidence; in three, a candidate schema. Collect three concrete instances from three different domains. For each, write:

- The domain (networking, compilers, OS, distributed systems, etc.).
- The concrete instance (TCP state machine, DFA, Kubernetes controller).
- The shared relational structure in one sentence (not surface features; the relations).

If you cannot find a third instance, the pattern is not yet a schema — it is an interesting observation. Park it in a `#schema-stub` note and wait for more instances to accumulate. Forcing a dossier from 1 or 2 instances produces overfit schemas that fail to transfer.

Concrete example — building the [[02_Schemas/S1 — State & Transition|S1]] dossier from scratch. Three instances collected:

1. **Theory of computation**: a DFA $(Q, \Sigma, \delta, q_0, F)$ recognizing a regular language. States $Q$, alphabet $\Sigma$, transition $\delta$, start $q_0$, accept $F$.
2. **Networking**: TCP connection lifecycle (CLOSED → SYN_SENT → ESTABLISHED → ... → CLOSED). 11 states, packet flags as alphabet, RFC 793 as the transition table.
3. **Distributed systems**: Kubernetes reconciliation loop (desired state → reconciling → reconciled). Watch events from etcd as alphabet, idempotent transitions, eventual convergence.

The shared relational structure across all three: a set of configurations, an alphabet of events, a transition rule, a starting configuration, a notion of terminal/accepting configurations. That sentence is the schema's first draft.

This step is the engine of [[03_Methods/M6 — Analogical Comparison|M6]]: the three-way comparison forces relational extraction. The active ingredient is not the three instances but the **comparison** of them — see Kurtz, Miao & Gentner (2001), reviewed in M6 §3.

### Step 2 — Write the formal core (definitions, invariants) (60-90 min)

Formalize the schema. Use mathematical notation where it clarifies; use prose where math obscures. The formal core has four parts:

1. **Definition** — the schema as a tuple, an algebraic structure, or a set of axioms.
2. **Core invariant** — the property that must hold for the schema to apply (e.g., the Markov property for S1).
3. **Auxiliary properties** — properties the schema may have (determinism, termination, etc.) that distinguish sub-cases.
4. **Equivalence and minimality** — when two instances of the schema are "the same," and the canonical form.

The formal core is the most important part of the dossier. Without it, the schema is a vibe; with it, the schema is a tool that can be tested, refined, and transferred. The bar: a reader who knows the formal core but not the instances should be able to recognize the schema in a new domain.

Concrete example — S1's formal core (abridged):

> A deterministic state machine is a 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$ where $Q$ is a finite (or countable) set of states, $\Sigma$ is the input alphabet, $\delta : Q \times \Sigma \to Q$ is the transition function, $q_0 \in Q$ is the start state, and $F \subseteq Q$ is the set of accepting states. The core invariant is the Markov property: $\Pr(s_{t+1} \mid s_t, a_t, s_{t-1}, a_{t-1}, \dots) = \Pr(s_{t+1} \mid s_t, a_t)$. If this fails, the system is not a state machine under the chosen representation.

This step is effortful. Resist the temptation to copy the textbook definition; the act of writing the formal core in your own words is what builds the schema in long-term memory — see [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] §4 ("Write, don't just think").

### Step 3 — List canonical instances (60 min)

For each of the 3+ instances from Step 1 (plus any others you find), add a row to a canonical-instances table with columns:

| Domain | Instance | States | Inputs/Events | Key invariants |

The table is the dossier's evidence. Five rows is the floor; ten is better. Each row is a wikilink target — when you study a future system, you should be able to add a row by writing `<system> — see [[02_Schemas/S# — ...|S#]] canonical instances`.

The table's most important property: **diversity**. Three rows from the same subfield (e.g., all networking) prove nothing. Three rows from theory, networking, distributed systems, biology, and game engines prove the schema is a real cross-domain pattern. Choose instances whose surface features differ maximally — see the surface-similarity trap in M6 §4.

After the table, write a 2-3 paragraph "horizontal layering" note showing how the schema applies at multiple layers (mathematical, hardware, OS, distributed, production practice). This is the depth that distinguishes a dossier from a Wikipedia article.

Concrete example — S1's canonical instances table (abridged) has 7 rows: DFA/NFA, TCP lifecycle, lexer/parser automaton, Markov chain, MDP, Kubernetes reconciliation, game loop. The horizontal layering note traces S1 through: mathematical model (the 5-tuple), hardware (CPU pipeline state), language/runtime (`enum` + `match`), OS (process states), distributed system (Raft leader states), production practice (structured logging of transitions).

### Step 4 — Identify contrastive cases (90 min)

For each schema, find cases that **look similar but differ** in a load-bearing way. The contrastive cases sharpen the schema's boundary: without them, the schema overgeneralizes. Format each contrastive case as a subsection with:

- **What it looks like** (the surface similarity to the schema).
- **Where it diverges** (the load-bearing difference).
- **The schema-level fix** (how to either extend the schema to include it, or mark it as outside).

Aim for 5-10 contrastive cases. They are the dossier's hardest section to write, and the highest-value: contrastive cases are what prevent overgeneralization when you apply the schema to a new system.

Concrete example — S1's contrastive cases include:

- **History-dependent stateful systems (REST sessions)** — looks like a state machine but the transition depends on the full session record. Schema-level fix: enlarge the state to $Q \times \text{SessionRecord}$ to recover Markov.
- **Pushdown automata** — state + unbounded stack. Looks like a state machine but recognizes context-free, not regular. Schema-level fix: state machine is the special case with no stack.
- **Petri nets** — state + tokens over places. Looks like a state machine but encodes concurrency natively. Schema-level fix: state machine is the special case where every transition has one input and one output place.
- **POMDPs** — the agent observes $o \sim O(s')$, not $s'$. The environment is Markov; the agent's state must be a belief distribution. Schema-level fix: the agent's state is the belief state.
- **Mealy vs Moore** — output placement differs. Same expressiveness, different verification properties. Schema-level fix: the schema is the same; the output contract differs.
- **Statecharts (hierarchical)** — flat state machine is the special case with one level. Schema-level fix: nesting and orthogonality are extensions, not replacements.

This step operationalizes [[01_Theory/T1 — Schema Transfer|T1]] §3 (contrastive cases are how schemas sharpen). A schema without contrastive cases is a slogan; with them, it is a tool.

### Step 5 — Specify a minimal implementation prompt (30 min)

State a concrete, buildable artifact that someone implementing the schema from scratch would produce. The implementation prompt should be:

- **Specific**: name the artifact, the language, the target LOC.
- **Scoped**: small enough to complete in 1-3 days.
- **Schema-exercising**: the artifact must instantiate the schema's core invariant, not just its surface features.
- **Testable**: specify the test cases that the artifact must pass, including the failure modes.

For each implementation, write:

- The deliverable list (what files, what functions).
- A worked example to verify correctness.
- A "difficulty" rating and a list of sub-skills tested.
- An "extension ladder" of follow-on stages that deepen the schema.

Concrete example — S1's implementation prompt: "Build a regex engine as an NFA/DFA from scratch. Target: ~200 lines of Python." Deliverables: parse a small regex grammar, Thompson's construction (AST → NFA), subset construction (NFA → DFA), matching with longest-match. Test suite with 5 patterns. Worked example: the regex `a*b` compiles to the NFA `q0 --ε--> q1 --a--> q1 --b--> q2` with start $q_0$ and accept $q_2$. The ε-closure of $\{q_0\}$ is $\{q_0, q_1\}$. On input `aaab`: $\{q_0,q_1\} \xrightarrow{a} \{q_1\} \xrightarrow{a} \{q_1\} \xrightarrow{a} \{q_1\} \xrightarrow{b} \{q_2\}$ — accept. Extension ladder: DFA minimization (Hopcroft), lazy DFA construction, capture groups and backreferences.

This step is the bridge from understanding to fluency — see [[03_Methods/M8 — Generative Production|M8]]. A schema you can implement is a schema you own.

### Step 6 — Brainstorm failure modes (60 min)

For each schema, list the ways it can fail in practice. Failure modes are the dossier's operational payoff: when you encounter a bug, you should be able to scan your failure-mode catalog and recognize the bug as an instance of a documented failure mode (see [[04_Protocols/P5 — How to Debug a System|P5]] Step 8).

For each failure mode:

- **Name** (short, memorable: "state explosion in determinization," "hidden state in concurrent environments").
- **Mechanism** (one sentence on why the failure occurs).
- **Example** (a concrete system where this failure has been observed).
- **Mitigation** (the standard fix, or the schema-level reason the fix works).

Aim for 8-12 failure modes. They are the dossier's longest section because they are the most operationally useful. Every bug you debug adds a failure mode to some dossier (P5 Step 8); over time, the dossiers accumulate failure-mode wisdom that makes future debugging fast.

Concrete example — S1's failure analysis (abridged) includes: state explosion in determinization (mitigation: lazy DFA, NFA simulation), non-determinism in distributed protocols (mitigation: total order broadcast), hidden state in concurrent environments (mitigation: memory barriers, atomics), missed transitions in protocol design (mitigation: enumerate the cross product; TLA+ model checking), starvation and non-progress (mitigation: fairness constraints), state-space regressions (mitigation: state coverage tests), livelock (mitigation: distinguish from deadlock), determinism drift under floating point (mitigation: fixed-point arithmetic), specification vs implementation drift (mitigation: code-generate from a single source of truth).

### Step 7 — Write transfer tests and retrieval prompts; tag `#sr` (45 min)

The dossier closes with two retrieval blocks, both tagged `#sr`:

1. **Transfer tests** — 6-12 prompts that force the schema to generalize to novel contexts. Format each as a "shift": terminology shift, representation shift, constraint shift, unnamed solution, competing schemas, layer shift, time shift, boundary shift.
2. **Delayed retrieval** — 8-12 prompts that test recall, explanation, derivation, implementation, diagnosis, and transfer of the schema's core.

The transfer tests are the dossier's assessment. A reader who cannot pass them has not internalized the schema; they have memorized the formal core. The retrieval prompts are the dossier's spaced-repetition hook: each prompt becomes a card in the SR queue, and the schema is refreshed across weeks and months.

Concrete example — S1's transfer tests include: "A backend service receives webhook events and updates a database row. Without using the words *state machine*, identify the schema and sketch the state set, alphabet, and safety/liveness invariants." S1's delayed retrieval includes: "List the five components of a DFA 5-tuple and the one-sentence invariant that defines the Markov property."

After writing the dossier, add cross-links at the bottom: theory links (T1 schema transfer, T4 LT-WM), related schemas (S2 graph, S5 information flow, S7 concurrency), methods (M6 analogical comparison), and protocols (P7 build dossier itself, P1 read paper, P5 debug).

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Building a dossier from 1 instance | Schema overfits; fails to transfer; "every system is a state machine" becomes a slogan. | Step 1 requires 3+ instances; park the schema as a `#schema-stub` until 3 accumulate. |
| No contrastive cases | Schema overgeneralizes; you apply it to systems where it does not fit. | Step 4 requires 5-10 contrastive cases; the dossier's hardest section is its most valuable. |
| No failure modes | Dossier is academic; you cannot use it to debug. | Step 6 requires 8-12 failure modes; every bug (P5 Step 8) adds a failure mode. |
| Vague formal core | Schema is a vibe; you cannot test whether a new system instantiates it. | Step 2 uses mathematical notation; the core invariant must be falsifiable. |
| No transfer tests | You cannot assess whether you have internalized the schema. | Step 7 requires 6-12 transfer tests, each as a "shift" forcing generalization. |
| Copying the textbook definition | The formal core is in someone else's words; you have not internalized it. | Step 2 requires writing the formal core in your own words; the act is the encoding. |
| One-shot dossier, never revised | Schema ossifies; new instances do not refine it. | Each new instance (from P1 Step 5, P2 Step 7, P4 Step 2) should refine an existing dossier. |
| Over-formalization | Math obscures; the dossier is unreadable. | Use math where it clarifies, prose where it obscures; the bar is recognition, not elegance. |
| No implementation prompt | Schema is theoretical; you cannot build it. | Step 5 specifies a buildable artifact with test cases and an extension ladder. |
| No horizontal layering | Schema is shallow; it applies at one layer only. | Step 3 includes a 2-3 paragraph horizontal layering note across 5-6 layers. |
| Treating canonical instances as Wikipedia entries | Each row is comprehensive but the comparison is missing. | The active ingredient is the comparison across instances, not the per-instance detail. |

## Linked methods

- [[03_Methods/M6 — Analogical Comparison|M6]] — Step 1's 3-instance comparison is the engine of schema extraction.
- [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] — Step 2's formal core must be written in your own words; the act is the encoding.
- [[03_Methods/M9 — Concept Mapping|M9]] — Step 3's horizontal layering is a concept map across layers.
- [[03_Methods/M8 — Generative Production|M8]] — Step 5's implementation prompt is generative production at the schema scale.
- [[03_Methods/M1 — Retrieval Practice|M1]] — Step 7's `#sr` prompts schedule retrieval across weeks.
- [[03_Methods/M2 — Spaced Repetition|M2]] — the SR queue schedules the dossier's prompts.

## Linked theory

- [[01_Theory/T1 — Schema Transfer|T1]] — P7 is the operational playbook for T1; the dossier format is what makes transfer possible.
- [[01_Theory/T4 — Long-Term Working Memory|T4]] — the dossier's formal core and failure-mode catalog become LT-WM chunks.
- [[01_Theory/T5 — Expert-Novice Differences|T5]] — experts hold schemas; novices hold instances; P7 is how you build expert schemas.
- [[01_Theory/T6 — Desirable Difficulties|T6]] — the transfer tests are desirable difficulties; the discomfort of failed retrieval is the signal.
- [[01_Theory/T8 — Adaptive Expertise|T8]] — the failure-mode catalog and contrastive cases produce adaptive, not routine, expertise.

## Dossier maturity rubric

A dossier evolves through maturity levels, mirroring concept mastery (see [[05_Roadmap/R3 — Mastery Rubric|R3]]):

| Level | Indicator | Typical state |
|-------|-----------|---------------|
| 0-stub | A `#schema-stub` note with 1-2 instances | Not yet a schema; parked until 3rd instance |
| 1-recognition | 3+ instances collected, no formal core | Pattern confirmed, not yet formalized |
| 2-formal | Formal core written, canonical instances table populated (5+) | Schema is testable; new instances can be checked against the formal core |
| 3-contrastive | 5+ contrastive cases documented with schema-level fixes | Schema's boundary is sharp; overgeneralization is unlikely |
| 4-implementable | Implementation prompt written, minimal artifact built | Schema is owned, not just understood |
| 5-failure-aware | 8+ failure modes documented, each from a real bug | Schema is operational; debugging benefits compound |

Most dossiers reach level 2-3 after their first full P7 run, level 4 after the implementation prompt is exercised, and level 5 over months as bugs accumulate. A dossier at level 5 is the vault's most valuable artifact: it generalizes across domains, sharpens its own boundary, drives implementations, and accelerates debugging. The goal is to lift every dossier to level 5 over a year of study.

The rubric also serves as a triage signal during [[04_Protocols/P8 — How to Run a Weekly Review|P8]]: a dossier stuck at level 1 for a month needs a deliberate P7 pass; a dossier at level 4 needs a bug-hunt to reach level 5. The review surfaces these gaps; the rubric names them.

## Retrieval queue

#sr
- List the seven steps of P7 in order. Why is Step 1 (3+ instances) a hard requirement rather than a guideline?
- The formal core (Step 2) is described as the most important part of the dossier. Why does the protocol require you to write it in your own words rather than copy a textbook definition? Cite M5.
- Step 4 (contrastive cases) is described as the dossier's hardest and highest-value section. Justify the "highest-value" claim using T1 §3 and the risk of overgeneralization.
- A bug you debug (P5 Step 8) produces a new failure mode. Where in P7 does it go, and how does it compound across debugging sessions?
- You notice a pattern in only 2 domains. What does the protocol prescribe, and why is forcing a dossier from 2 instances a trap?

---

## Cross-links

- Related protocols: [[04_Protocols/P1 — How to Read a Research Paper|P1 Read Paper]] (Step 5 of P1 produces schema links that feed P7), [[04_Protocols/P2 — How to Read Source Code|P2 Read Source]] (Step 7 of P2 produces schema links), [[04_Protocols/P4 — How to Learn a New System|P4 Learn System]] (Step 2 of P4 produces schema links), [[04_Protocols/P5 — How to Debug a System|P5 Debug]] (Step 8 of P5 produces failure-mode entries for P7's Step 6).
- Related schemas: all of [[02_Schemas/S1 — State & Transition|S1]] through [[02_Schemas/S10 — Search & Inference|S10]] — each was built via this protocol, and each is a template for future dossiers.
