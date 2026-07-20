---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S1 — State & Transition

> A system is a **state machine** when its future behavior depends only on its current state and the next input, not on the history that produced that state — this is the Markov property, and it is the structural feature that lets us reason about computation, protocols, and control loops with finite mental machinery.

---

## 1. Formal core

A deterministic state machine is a 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$ where:

- $Q$ is a finite (or countable) set of states.
- $\Sigma$ is the input alphabet.
- $\delta : Q \times \Sigma \to Q$ is the transition function.
- $q_0 \in Q$ is the start state.
- $F \subseteq Q$ is the set of accepting (or terminal) states.

A **nondeterministic** variant relaxes the transition function to $\delta : Q \times \Sigma \to \mathcal{P}(Q)$, returning a *set* of next states. A **probabilistic** variant (Markov chain) returns a distribution: $\delta : Q \times \Sigma \to \Delta(Q)$, where $\Delta(Q)$ is the simplex over $Q$. A **reward-augmented** variant (MDP) adds $R : Q \times \Sigma \times Q \to \mathbb{R}$.

The **core invariant** is the Markov property: $\Pr(s_{t+1} \mid s_t, a_t, s_{t-1}, a_{t-1}, \dots) = \Pr(s_{t+1} \mid s_t, a_t)$. If this fails, the system is *not* a state machine under the chosen state representation — either the representation is incomplete (hidden state) or the system is genuinely history-dependent and needs a richer model (e.g., a pushdown automaton, a recurrent policy, or a hidden Markov model with belief state).

Auxiliary properties:

- **Determinism**: $|\delta(q,a)| \leq 1$ for all $(q,a)$.
- **Termination** (for reactive systems): there exists a well-founded measure that decreases on every transition; otherwise the machine may run forever, which is sometimes intended (servers, controllers) and sometimes a bug (non-progress in protocols).
- **Reachability**: state $q'$ is reachable from $q$ iff $\exists w \in \Sigma^* : \delta^*(q, w) = q'$, where $\delta^*$ is the lifted transition over strings.
- **Liveness vs. safety**: safety = "bad states are unreachable"; liveness = "good states are eventually reached." These two classes partition almost all temporal-logic specifications. The division is not academic: safety violations can be checked *locally* (one counter-example trace suffices), while liveness violations require reasoning about *all infinite traces*. This asymmetry is why model checkers (TLA+, SPIN) handle safety far better than liveness, and why production systems monitor the two with different techniques (invariant assertions for safety, progress deadlines for liveness).

**Acceptance conditions** determine which infinite runs "count" as successful. For finite words the rule is simple: end in an accepting state. For infinite words (ω-languages, model checking, liveness) the rule is more subtle:

- **Büchi**: a run accepts iff it visits $F$ infinitely often. Used to express "the system eventually does X forever."
- **Muller**: a run accepts iff the set of states visited infinitely often equals one of a specified family. Strictly more expressive than Büchi.
- **Rabin / Streett / parity**: increasingly complex acceptance conditions on the *infinitely-often* set, used in tree automata and synthesis.

The schema-level point: a state machine is not just $(Q, \Sigma, \delta, q_0, F)$ — it also has an **acceptance condition** that defines which behaviors are "good." Changing the acceptance condition (Büchi → safety → parity) changes what class of properties you can express, *without changing the underlying transition structure*. This is the schema-level reason liveness and safety are studied separately.

A **transition system** generalizes by dropping the alphabet: $\delta \subseteq Q \times Q$. This is the form used in model checking (TLA+, Promela, CTL/LTL).

**Equivalence and minimality.** Two states $q, q'$ are *equivalent* (Bisimulation / Myhill–Nerode) iff no input string distinguishes them — i.e., for all $w \in \Sigma^*$, $\delta^*(q, w) \in F \iff \delta^*(q', w) \in F$. The Myhill–Nerode theorem partitions $Q$ into equivalence classes and yields the unique minimal DFA; this is the formal underpinning of every state-machine minimization algorithm (Hopcroft's $O(|Q| \log |Q|)$ partition refinement). Equivalence matters because real systems (TCP stacks, parser tables, protocol implementations) accumulate redundant states over revisions, and detecting redundancy requires the schema — not just diffing the diagrams.

**Time and fairness.** A transition system is *time-abstract*; real systems add clocks. A timed automaton (Alur–Dill) extends $Q$ with real-valued clocks and guards; the state space becomes uncountable but decidable via zone abstraction. Fairness constrains which infinite executions are admissible: *strong fairness* says "if a transition is enabled infinitely often, it fires infinitely often," and is the formal way to rule out schedulers that let one thread starve. Almost every liveness bug in concurrent code is, at bottom, a missing fairness assumption.

## 2. Canonical instances (≥3 domains)

| Domain | Instance | States | Inputs / Events | Key invariants |
|--------|----------|--------|------------------|----------------|
| Theory of computation | DFA / NFA recognizing a regular language | Finite | Symbols from $\Sigma$ | Determinism (DFA); epsilon-closure (NFA); Myhill–Nerode minimality |
| Networking | TCP connection lifecycle | 11 (CLOSED, SYN_SENT, ESTABLISHED, FIN_WAIT_1, …) | Packet flags (SYN, ACK, FIN, RST) + timeouts | RFC 793 state diagram; safety = no half-open from outside; liveness = eventual CLOSE |
| Compilers | Lexer / parser automaton | DFA states from regex (Thompson → subset construction) | Characters / tokens | Longest-match rule; maximal munch; no ambiguity in DFA |
| Probability | Discrete-time Markov chain | State space $S$ | Time steps (implicit) | $\sum_{s'} P(s' \mid s) = 1$; stationary distribution $\pi = \pi P$ |
| AI / RL | Markov Decision Process | Environment state $s \in S$ | Actions $a \in A$ | Markov property of $P(s' \mid s, a)$; Bellman equation $V^\pi(s) = \mathbb{E}[r + \gamma V^\pi(s')]$ |
| Distributed systems | Kubernetes reconciliation loop | Desired state / actual state / reconciling | Watch events from etcd | Level-triggered (not edge-triggered); idempotent transitions; eventual convergence |
| Game engines | Game loop (input → update → render) | Scene state (entities, transforms) | Frame ticks, input events | Fixed-timestep update; deterministic replay if state + inputs are logged |

Across all of these the same five-part structure recurs: a set of configurations, an alphabet of events, a transition rule, a starting configuration, and a notion of terminal/accepting configurations. Two diagnostic questions transfer across every row of the table: (1) *Is the state set actually finite or countable, and is that countability preserved under every refactor?* (2) *What is the contract on terminal states — must the machine reach one, may it loop forever, or is non-termination a defect?* Most production bugs in this schema come from answering the second question differently in code than in the spec.

A useful cross-instance comparison: TCP and Kubernetes reconciliation look superficially different (packet-level vs. YAML-level) but share the *level-triggered* discipline — the controller acts on the current diff between desired and actual, not on the event that caused the diff. Edge-triggered designs (which fire on the *change* itself) are subtly broken under message loss because a missed event means a permanently wrong state; level-triggered designs self-heal because the next reconcile re-derives the correct action from the current diff. This is the schema-level reason Kubernetes controllers are robust to restarts.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: the 5-tuple $(Q, \Sigma, \delta, q_0, F)$ and the Markov property.
- *Hardware*: CPU pipeline state, NIC packet-processing state, GPU shader state.
- *Language/runtime*: `enum` + `match` in Rust, `state` fields in OOP, the State monad in Haskell.
- *Operating system*: process states (RUNNABLE, SLEEPING, ZOMBIE), TCP socket states, inotify event delivery.
- *Distributed system*: Raft leader states (Follower, Candidate, Leader), GFS chunk-server states, actor states in Akka.
- *Production practice*: structured logging with state transitions, distributed tracing spans, golden-signal dashboards that alert on dwell-time in a non-terminal state.

Working through each layer for one canonical instance (e.g., TCP) and then porting the layering to a second instance (e.g., a Kubernetes controller) is what produces genuine schema transfer — see [[01_Theory/T1 — Schema Transfer|T1]] §3.4.

## 3. Contrastive cases

### 3.1 History-dependent "stateful" systems (not Markov)

A RESTful session that uses a session ID to look up server-side history is *not* a state machine in $Q$ alone — the transition depends on the full session record. To recover the schema you must fold the session record into the state: $Q' = Q \times \text{SessionRecord}$. This is the standard move when someone says "this isn't really a state machine": enlarge the state space until the Markov property holds.

### 3.2 Pushdown automata (state + stack)

A PDA is $(Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ with a stack alphabet $\Gamma$. The transition reads the top-of-stack symbol: $\delta : Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to \mathcal{P}(Q \times \Gamma^*)$. The stack is an *unbounded* memory, which lets PDAs recognize context-free languages (e.g., balanced parentheses) that no DFA can. The contrast: a state machine has *finite* memory; a PDA trades determinism for an unbounded auxiliary structure.

### 3.3 Petri nets (state + tokens over places)

A Petri net is a bipartite graph of places and transitions; the "state" is a marking $M : P \to \mathbb{N}$ assigning token counts to places. Transitions fire when all input places have enough tokens. Unlike a state machine, a Petri net encodes *concurrency* natively (two transitions can fire simultaneously) and *synchronization* (a transition waits for multiple inputs). A state machine is the special case where every transition has exactly one input place and one output place.

### 3.4 Reactive control with hidden state (HMM / POMDP)

In a POMDP the agent observes $o \sim O(s')$ rather than $s'$ itself. The Markov property holds at the level of the environment, but the *agent's* state must be a **belief state** $b(s) = \Pr(s \mid \text{history})$, updated by Bayes' rule on each observation. The agent's policy is a state machine over belief distributions, not over states.

### 3.5 Mealy vs Moore machines (output placement)

A Mealy machine's output depends on *state and input*: $\lambda : Q \times \Sigma \to O$. A Moore machine's output depends on *state alone*: $\lambda : Q \to O$. The two are equivalent in expressiveness but differ in engineering: Mealy uses fewer states (the input is part of the output decision); Moore is easier to verify (output is a function of state only, so testing all states suffices). Hardware designers prefer Moore for verification; protocol designers prefer Mealy for compactness. The schema is the same; the *output contract* differs.

### 3.6 Statecharts (Hierarchical state machines)

Harel statecharts extend the basic schema with nesting (a state can contain sub-states), orthogonality (two regions run concurrently), and broadcast events. The motivation is that real systems (UI controllers, embedded devices, SCADA) have *thousands* of states when flattened, but only *dozens* when organized hierarchically. The contrast: a flat state machine is a special case of a statechart with one level. The schema is preserved — the Markov property holds at every level — but the *expressiveness per state* is dramatically higher. This is why every modern UI framework (Qt, SCXML, XState) is built on statecharts rather than flat FSMs.

### 3.7 Probabilistic vs nondeterministic state machines

A nondeterministic state machine returns a *set* of next states; a probabilistic one returns a *distribution*. These look similar but differ profoundly: nondeterminism is a specification device (the implementer picks *any* valid next state, and the contract must hold for all choices), while probability is a property of the world (the next state is sampled, and the contract is statistical). Confusing them leads to two famous bugs: (a) treating an MDP as an NFA and proving "safety" that actually fails with probability 1; (b) treating an NFA as an MDP and "solving" for an optimal policy that has no meaning because there is no distribution. The schema-level fix: always ask whether the branching is *adversarial* (nondeterministic) or *stochastic* (probabilistic) — the analysis techniques differ entirely.

### 3.8 Total vs partial transition functions

A *total* transition function $\delta : Q \times \Sigma \to Q$ defines a next state for every $(q, a)$ pair; a *partial* one is undefined for some pairs. Most textbook automata are total (with an explicit "dead state" or "trap state" absorbing undefined transitions). Most real systems are partial: a TCP socket in `CLOSED` has no transition on `ACK`. The contrast matters because partiality is the natural way to express *safety invariants* — "this transition cannot happen" is enforced by leaving $\delta$ undefined, not by adding runtime checks. The schema-level fix: choose partiality deliberately; document which $(q, a)$ pairs are intentionally undefined vs. implementation gaps.

### 3.9 Closed vs open state machines

A *closed* state machine has a fixed state set $Q$ known at compile time (an `enum`); an *open* one allows new states to be added at runtime (an interpreter, an actor system, a plugin host). Closed machines admit exhaustive analysis (model checking, total-function compilation, switch-table dispatch). Open machines admit flexibility but lose every static guarantee — you cannot model-check what you cannot enumerate. The schema-level fix: when you need both, layer them — a closed inner machine that handles the *core* protocol, surrounded by an open dispatcher that handles *extensions*. This is the structural pattern behind every plugin architecture (VS Code, BPF, eBPF, WebAssembly host functions).

### 3.10 Deterministic replay vs deterministic execution

A state machine is *deterministically executable* if its transition function is pure (same input → same output, no side effects). It is *deterministically replayable* if, in addition, all inputs are logged. Deterministic replay is the basis of record-replay debuggers (rr, Mozilla record/replay), time-travel debugging, and blockchain consensus (every node replays the same transaction log to reach the same state). The contrast: a system can be deterministic at the schema level (a pure transition function) but lose replayability through nondeterministic I/O, time-dependent logic, or hidden global state. The schema-level fix: separate the *pure* transition from the *impure* I/O boundary, log all inputs at the boundary, replay the pure transition.

## 4. Implementation

**Build a regex engine as an NFA/DFA from scratch.** Target: ~200 lines of Python (or Rust, for the brave).

Concrete deliverables:

1. Parse a small regex grammar: literals, `*`, `+`, `?`, `|`, parentheses, `.`, character classes `[abc]`.
2. Thompson's construction: regex AST → NFA with $\varepsilon$-transitions.
3. Subset construction: NFA → DFA. Memoize by subset.
4. Matching: simulate the DFA (or NFA with epsilon-closure) on an input string. Return longest match.
5. Test suite with at least five patterns:
   - `a*b` against `aaab` (match), `b` (match), `aaa` (no match)
   - `a|b` against `a`, `b`, `c`
   - `(ab)*` against `ababab`, `ababa`, empty string
   - `[abc]+` against `cabbc`
   - `a.b` against `axb`, `aab`, `ab`

**Worked example to verify your engine**. The regex `a*b` compiles to the NFA `q0 --ε--> q1 --a--> q1 --b--> q2` with start $q_0$ and accept $q_2$. The $\varepsilon$-closure of $\{q_0\}$ is $\{q_0, q_1\}$. On input `aaab`: $\{q_0,q_1\} \xrightarrow{a} \{q_1\} \xrightarrow{a} \{q_1\} \xrightarrow{a} \{q_1\} \xrightarrow{b} \{q_2\}$ — accept. On input `aaa`: same prefix but the final state is $\{q_1\}$, not containing $q_2$ — reject. If your engine accepts `aaa` or rejects `aaab`, your $\varepsilon$-closure is wrong.

**Difficulty**: medium-hard. **Sub-skills tested**: recursive AST construction, graph representation of automata, fixed-point iteration for epsilon-closure, memoization for subset construction, longest-match disambiguation. The failure you will hit: epsilon-cycle (NFA with $\varepsilon$-loop) — your closure computation must be a fixpoint, not a recursion.

**Extension ladder** (each stage adds a transferable skill):
1. After step 4, add DFA minimization (Hopcroft's partition refinement). Compare your minimized DFA size to the original — the ratio quantifies how much redundancy your construction introduced.
2. Replace eager subset construction with lazy / on-the-fly DFA construction. Measure peak memory; it should drop dramatically for the pathological regex `(a|b)*a(a|b)^{20}`.
3. Add capture groups and backreferences. Note: backreferences make the language non-regular; you will be forced into a hybrid NFA + backtracking scheme. This is *why* PCRE is exponential and RE2 is not — RE2 refuses backreferences.

For an extra stage, implement on-the-fly DFA construction (lazy DFA) to avoid state explosion on large alphabets — this is what RE2 and Rust's `regex` actually do.

## 5. Failure analysis

1. **State explosion in determinization.** Subset construction can blow up from $n$ NFA states to $2^n$ DFA states. Example: the regex `(a|b)*a(a|b)^{n}` requires $\Omega(2^n)$ DFA states (a classic lower bound). Mitigation: lazy DFA, NFA simulation, or bit-parallel simulation (Shift-Or).

2. **Non-determinism in distributed protocols.** Two replicas of the same state machine receiving the same events in different orders end up in different states. Mitigation: total order broadcast (Raft/Paxos) or CRDTs that commute. The bug is subtle: the local code is a correct state machine, but the *system* is not, because the input order is part of the state.

3. **Hidden state in concurrent environments.** Two threads share a state variable; thread-local caching makes each thread's view of "current state" stale. The Markov property silently fails because the *effective* state includes cache coherence status. Mitigation: memory barriers, atomics, or message-passing (actor model).

4. **Missed transitions in protocol design.** RFC 793 has a 2D table (state × flag-combo); designers forget cells. The famous example is the TCP `SYN-SENT` × `RST` transition, mishandled in several early stacks. Mitigation: enumerate the cross product explicitly; use TLA+ to model check coverage.

5. **Starvation and non-progress.** A scheduler is a state machine over (run-queue, executing). If transitions consistently pick the same task, liveness fails even though the machine is technically live. Mitigation: fairness constraints in the temporal specification; aging in schedulers.

6. **State-space regressions.** A refactor adds a new state but forgets a transition out of it. The system wedges in production. Mitigation: state coverage tests; invariant assertions on every transition; chaos testing of terminal states.

7. **Livelock.** Two states oscillate forever (e.g., two routers' SPF runs triggering each other). The state machine is "live" (always transitioning) but never terminates. Distinguish from deadlock; both are liveness failures but require different fixes.

8. **Determinism drift under floating point.** A "deterministic" game replay breaks because a transition function uses `sin()` and the FPU's last-bit rounding differs between machines. The state machine's *contract* says deterministic; the *implementation* violates it because floating-point is not bit-reproducible across libm versions, compiler flags, or FPU vendors. Mitigation: fixed-point arithmetic, or pinning to a specific libm with `-ffp-contract=off`. This is the schema-level reason why competitive games, blockchain consensus engines, and deterministic-replay debuggers forbid floating point in their core state transitions.

9. **Specification vs implementation drift.** The protocol spec describes 11 states; the implementation has 12 because someone added `SYN_RECEIVED_DUP` to handle a specific attack. The extra state never gets documented, never gets tested under failure, and silently changes behavior under conditions nobody reproduces until production. Mitigation: code-generate the state machine from a single source of truth (a TLA+ spec, a DSL, a table) so the spec and implementation cannot diverge.

## 6. Transfer tests

#sr
- **Terminology shift**: A backend service receives webhook events and updates a database row. The PM says "we need to add retries with exponential backoff and an idempotency key." Without using the words *state machine*, *Markov*, or *transition*, identify the schema and sketch the state set, the alphabet of events, and the safety and liveness invariants you would test.
- **Representation shift**: You are given a 2D grid where a robot moves between cells; each cell has a reward. The robot's policy is a lookup from `(cell, time-of-day)` to an action. Is this an instance of the schema? If so, what is the state space, and what additional property must hold for value iteration to converge? If not, what schema does it instantiate instead?
- **Constraint shift**: A system has 1 billion reachable states; subset construction over the implicit NFA is infeasible. Describe two techniques (one symbolic, one streaming) that let you still answer reachability queries, and state the assumption each one makes.
- **Unnamed solution**: A colleague is debugging a Kubernetes operator that "sometimes re-processes the same object forever." Without naming the schema, give them the diagnostic question that distinguishes a true non-termination bug from a benign level-triggered loop.
- **Competing schemas**: An LLM agent takes turns acting in an environment. Is its behavior better modeled as S1 (state machine), S4 (optimization over actions), or S8 (POMDP)? State the distinguishing evidence that would settle the choice.
- **Layer shift**: A TCP stack is implemented in kernel C, in a userspace library (e.g., lwIP), and in a hardware NIC (TOE / Chelsio). For each layer, predict which invariants of the state machine are preserved, which become harder to enforce, and which become trivially true. The schema is invariant; the layer changes the failure modes.
- **Time shift**: A state machine operates in logical time (event ordering) and in physical time (wall clock). When these diverge — leap seconds, NTP slewing, clock skew across nodes — which invariants break first? Identify the schema-level fix (vector clocks, hybrid logical clocks, or externalizing time to a consensus service).
- **Boundary shift**: A state machine specification is split across two services communicating over an unreliable network. Which invariants of the single-machine state machine break? Which schema-level pattern (idempotent retries, two-phase commit, saga, CRDT) restores each?

## 7. Delayed retrieval

#sr
- **Recall**: List the five components of a DFA 5-tuple and the one-sentence invariant that defines the Markov property.
- **Explanation**: Why does the subset-construction of an NFA with $n$ states potentially produce a DFA with $2^n$ states? Give a regex family that achieves this bound.
- **Derivation**: Starting from the Bellman equation $V^\pi(s) = \sum_a \pi(a \mid s) \sum_{s'} P(s' \mid s, a) [r + \gamma V^\pi(s')]$, derive the condition under which value iteration converges. Identify where the Markov property is invoked.
- **Implementation**: Write the epsilon-closure algorithm for an NFA. State its time complexity and the bug you get if you implement it with naive recursion instead of a fixpoint worklist.
- **Diagnosis**: A TCP implementation occasionally enters a state where it sends SYN repeatedly with no backoff. Map this onto the schema, identify which invariant is violated, and propose the smallest fix consistent with RFC 793.
- **Transfer**: You move from networking to chip design (Verilog FSMs). Predict three things that will be *identical* and three things that will *differ* between a TCP state machine and a Verilog Mealy machine. Justify each via the schema, not the domain.
- **Meta**: Write the two-paragraph "structural alignment" between a Kubernetes reconciliation loop and a TCP state machine, in the style of T1 §3.4. The act of writing the alignment is what produces transfer; passive reading does not. Schedule this prompt for one week after initial study.
- **Reverse**: A junior engineer says "I don't need state machines; my code is just functions." Identify the implicit state machine in any non-trivial function (loop counter, exception handler, generator resumption point) and explain why every program with persistent data is a state machine whether the engineer acknowledges it or not.
- **Composition shift**: Two state machines run concurrently and communicate via a shared queue. Is the composition itself a state machine? If yes, give the construction (Cartesian product of states, with synchronization on queue events). If no, identify which property of the schema breaks (the product state space is exponential; the composition may be nondeterministic; the queue introduces history).
- **Testing shift**: You are given a state machine implementation and its specification (a transition table). Describe a property-based testing strategy that (a) generates random input sequences, (b) checks the implementation's trace against the spec's trace, (c) minimizes failing cases. State the schema-level reason this catches more bugs than unit tests on individual transitions.
- **Failure-mode shift**: A state machine has a "stuck" state where it accepts inputs but produces no observable output. Is this a deadlock, a livelock, or neither? Define the diagnostic test that distinguishes the three.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — the schema whose transfer is most often demonstrated with this dossier.
- **Related schemas**: [[02_Schemas/S2 — Graph & Reachability|S2 Graph & Reachability]] (a state machine is a labeled directed graph), [[02_Schemas/S5 — Information Flow|S5 Information Flow]] (each transition propagates information), [[02_Schemas/S7 — Concurrency & Coordination|S7 Concurrency & Coordination]] (shared state across actors).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — the TCP-vs-FSM-vs-Kubernetes exercise is the canonical comparison.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]] — the format of this note.
