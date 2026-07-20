---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S10 — Search & Inference

> **Search** is the structure that arises whenever a system must find a goal in a **state space** (explicit or implicit), and **inference** is the dual structure — deriving conclusions from premises by traversing a **proof space**; both share the same underlying schema: traverse a graph under a **cost budget** using a **strategy** (systematic, heuristic, stochastic) that trades **completeness**, **optimality**, and **efficiency** against each other, with the central risk being that the search space explodes exponentially while the budget is finite.

---

## 1. Formal core

A **search problem** is a tuple $(\mathcal{S}, s_0, \mathcal{G}, \text{succ}, c)$ where $\mathcal{S}$ is the state space, $s_0 \in \mathcal{S}$ is the initial state, $\mathcal{G} \subseteq \mathcal{S}$ is the goal set, $\text{succ}: \mathcal{S} \to 2^{\mathcal{S}}$ is the successor function, and $c: \mathcal{S} \times \mathcal{S} \to \mathbb{R}_{\ge 0}$ is the step cost. A **solution** is a path $s_0, s_1, \dots, s_k$ with $s_k \in \mathcal{G}$ and $s_{i+1} \in \text{succ}(s_i)$. An **optimal** solution minimizes $\sum_i c(s_i, s_{i+1})$.

The state space is almost always too large to enumerate (chess has $\sim 10^{40}$ reachable positions; the 15-puzzle has $\sim 10^{13}$). The schema-level question is therefore always: **how to traverse the implicit space efficiently enough to find a goal under the budget.** This is a question about the *order* of exploration and the *pruning* of irrelevant branches.

**Uninformed search strategies** use no problem-specific knowledge:

- **BFS** (Breadth-First Search): explores states in order of depth. Complete (finds a solution if one exists, given infinite memory) and optimal for unit step costs. Memory: $O(b^d)$ where $b$ is branching factor and $d$ is solution depth. The memory blowup is fatal for $d > 10$ in most practical problems.
- **DFS** (Depth-First Search): explores one branch to completion before backtracking. Memory: $O(bd)$ — linear in depth. Not complete on infinite-depth spaces (may descend forever); not optimal. Iterative deepening (IDDFS) combines BFS's completeness and optimality with DFS's memory footprint.
- **Dijkstra's algorithm**: BFS generalized to non-unit step costs, using a priority queue ordered by $g(s) = \sum c$ from $s_0$ to $s$. Optimal; memory $O(b^d)$; the foundational algorithm for shortest paths.

**Informed search** uses a **heuristic** $h(s) \approx h^*(s)$, where $h^*(s)$ is the true optimal cost-to-go. **A\*** orders the priority queue by $f(s) = g(s) + h(s)$:

- If $h$ is **admissible** ($h \le h^*$), A\* is **optimal** — it always finds the minimum-cost solution.
- If $h$ is **consistent** ($h(s) \le c(s, s') + h(s')$), A\* never reopens a state and runs in $O(b^{\epsilon d})$ for $\epsilon = h/h^*$ — sub-exponential when the heuristic is good.

The heuristic is the lever. A perfect heuristic ($h = h^*$) makes A\* expand only the optimal path; no heuristic ($h = 0$) reduces A\* to Dijkstra. Designing heuristics is the modeling act: relax the problem (drop a constraint, allow a superset of moves), solve the relaxation exactly, use its solution as $h$. The 15-puzzle's Manhattan-distance heuristic is the solution to the relaxed problem where tiles can move through each other.

**Branch-and-bound** generalizes A\* to optimization (not just reachability): maintain an incumbent best solution; prune any branch whose lower bound exceeds the incumbent. ILP solvers, traveling-salesman solvers, and combinatorial auctions all use this. The schema: **search with pruning by bounds.**

**Adversarial search** (games): two players alternate moves with opposing objectives. **Minimax** computes the optimal move assuming the opponent plays optimally: $\text{minimax}(s) = \max_{s'} \min_{s''} \dots$ to the game's depth limit, where leaves are evaluated by a heuristic. **Alpha-beta pruning** eliminates branches that cannot affect the minimax value; in the best case it doubles the searchable depth. **Expectiminimax** extends minimax to chance nodes (dice, card draws).

**Monte Carlo Tree Search** (MCTS) trades the full-width expansion of minimax for stochastic sampling: (1) **select** a leaf via a bandit policy (UCT: $\bar{X}_i + C \sqrt{\ln N / N_i}$); (2) **expand** the leaf; (3) **rollout** (simulate to a terminal state with a cheap policy); (4) **backpropagate** the result up the path. MCTS is the algorithm behind AlphaGo: it concentrates search on promising branches, handles huge branching factors, and asymptotically converges to minimax. The schema: **biased stochastic sampling of a search tree.**

**Constraint satisfaction** reformulates search as assigning values to variables subject to constraints. **Constraint propagation** (arc consistency, AC-3; path consistency) prunes the search space *before* branching by eliminating values that cannot participate in any solution. **Backtracking search** with propagation is the foundation of SAT solvers and CSP solvers. The schema: **search with inference interleaved — each branching decision triggers further pruning.**

**Logical inference** is search over a proof space. Given axioms and inference rules, the question is whether a goal formula is derivable. **Resolution** is the canonical rule: from $(A \lor P)$ and $(B \lor \neg P)$, derive $(A \lor B)$. Resolution is **refutation-complete** — if the goal is unsatisfiable, resolution will derive a contradiction. **Forward chaining** (data-driven) and **backward chaining** (goal-driven) are search strategies over the rule set. SAT solvers (DPLL, CDCL) are the industrial-strength realization: CDCL (conflict-driven clause learning) learns new clauses from each conflict, pruning future search — the schema is *search that learns from failure*.

**Dynamic programming** is search over a recursive structure with **memoization** — once a subproblem's optimal value is computed, it is never recomputed. Bellman's equation $V^*(s) = \max_a [R(s, a) + \gamma \sum_{s'} T(s' \mid s, a) V^*(s')]$ (S8) is the canonical DP recurrence. The schema: **search with overlapping subproblems, where memoization collapses the exponential tree into a polynomial DAG.** Sequence alignment (Needleman-Wunsch, Smith-Waterman), Viterbi (S8), shortest paths in DAGs, and the knapsack problem are all DP.

**The unifying schema**: search, inference, and DP are all *graph traversal under a budget* with different traversal orders (FIFO for BFS, priority for A\*, recursive-with-memo for DP, stochastic for MCTS) and different pruning mechanisms (bounds for branch-and-bound, propagation for CSPs, clause learning for SAT, memoization for DP). The choice of order and pruning is the engineering decision; the underlying structure is invariant.

## 2. Canonical instances (≥3 domains)

| Domain | State space | Strategy | Pruning | Key property |
|--------|-------------|----------|---------|--------------|
| Pathfinding | Graph vertices | Dijkstra / A\* | Visited set, admissible heuristic | Optimal |
| Routing | Road network | Contraction hierarchies, A\* | Landmark heuristic | Optimal, sub-second on continent-scale |
| Games (chess) | Board positions | Alpha-beta | Move ordering, quiescence | Optimal under depth limit |
| Games (Go) | Board positions | MCTS + neural eval | UCT bandit | Asymptotically optimal |
| Bioinformatics | Alignment matrix | DP (Needleman-Wunsch) | Memoization | Optimal, polynomial |
| Symbolic AI | Formula space | Resolution / CDCL | Clause learning | Refutation-complete |
| Compilers | Type space | Unification, constraint solving | Occurs-check | Decidable for HM |
| Query planning | Join trees | Dynamic programming / cascade | Cost-based pruning | Optimal for small joins |
| Scheduling | Assignment space | Constraint propagation + backtracking | Arc consistency | Complete |
| ILP / combinatorial optimization | Integer vector space | Branch-and-bound + LP relaxation | Bounds, cuts | Optimal (slow) |
| LLM decoding | Token sequence space | Beam search / sampling | Beam width, top-k / top-p | Approximate, controllable |
| Robotics | Continuous state space | RRT, RRT\* | Voronoi bias | Probabilistic completeness |
| Database query | Execution plan space | Cost-based optimizer | Branch-and-bound on join orders | Near-optimal |
| RAG (retrieval-augmented gen) | Document × prompt space | Vector search + LLM reasoning | Top-k retrieval | Approximate |

Across every instance the same four design questions recur: (a) what is the state space and how large is it, (b) what is the budget (time, memory, queries), (c) what strategy (systematic, heuristic, stochastic) fits the structure, and (d) what pruning (bounds, propagation, memoization, learning) is available.

A cross-instance pattern worth internalizing: **the strategy tracks the structure of the optimal solution.** If the optimal solution is a path (routing, planning), use shortest-path algorithms. If it's a sequence under a scoring function (alignment, decoding), use DP or beam search. If it's a proof (logic, type checking), use resolution or unification. If it's a game value (chess, Go), use minimax or MCTS. The wrong strategy on the right structure wastes the budget; the right strategy on the wrong structure is no better. Recognizing the structure is the schema-level skill.

A second pattern: **every mature search system combines a strategy with a learned component.** Modern chess engines (Stockfish) combine alpha-beta with a neural evaluation function. Modern Go (AlphaZero) combines MCTS with a neural policy and value. Modern SAT solvers (CDCL) combine systematic search with learned clauses. Modern query optimizers combine dynamic programming with learned cost models. The schema: **the search provides completeness guarantees; the learned component focuses the budget on the regions most likely to matter.** Pure search is too slow; pure learning has no guarantees. The combination is the industrial pattern.

A third pattern worth internalizing: **the state-space representation determines what strategy is even available.** Represent the 15-puzzle as a flat 16-tuple and A\* with Manhattan distance is natural; represent it as a permutation group and IDA\* with pattern databases is natural; represent it as a constraint satisfaction problem and backtracking with arc consistency is natural. The same physical puzzle, three representations, three different natural strategies. The schema-level skill is to choose the representation that exposes the structure the chosen strategy exploits. Mismatching representation and strategy (e.g., flat-tuple representation with arc-consistency search) wastes the strategy's power. This connects S10 to S9 (Representation & Transformation): the search schema is downstream of the representation schema, and a poor representation cannot be rescued by a clever search.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: state space, admissible/consistent heuristics, the Bellman equation, refutation completeness, the effective branching factor.
- *Algorithmic layer*: BFS, DFS, Dijkstra, A\*, IDA\*, MCTS, alpha-beta, CDCL, branch-and-bound, dynamic programming.
- *Systems layer*: SQL query optimizers, Kubernetes scheduler, SAT/SMT solvers in program analysis, LLM decoding libraries.
- *Distributed layer*: distributed SAT solving, parallel MCTS, MapReduce for combinatorial search, federated query planning.
- *Production practice*: solver timeouts and anytime behavior, learned heuristics in production, caching of solved subproblems (transposition tables as a service).

The transfer exercise that builds the schema: take one canonical search problem (e.g., shortest path in a road network) and solve it at each layer — as a textbook Dijkstra, as A\* with a landmark heuristic, as a contraction hierarchy with hours of preprocessing, as a learned model that predicts the path directly. The invariants that survive all layers (the path is a valid path; the cost is bounded by the strategy's guarantee) are the schema. The invariants that break (the optimality guarantee, the preprocessing budget, the failure mode under road closures) are the layer-specific concerns.

## 3. Contrastive cases

### 3.1 Systematic vs heuristic vs stochastic

**Systematic** search (BFS, DFS, Dijkstra) explores the space in a fixed order; complete and optimal given infinite resources; fails when the space is too large. **Heuristic** search (A\*, IDA\*) uses problem-specific knowledge to prioritize; complete and optimal with an admissible heuristic; can handle larger spaces but still exponential in the worst case. **Stochastic** search (MCTS, simulated annealing, genetic algorithms) samples the space; not complete in general (may miss the goal), but handles astronomically large spaces by concentrating effort where samples suggest promise. The bug: applying systematic search to a space too large (15-puzzle by BFS — $10^{13}$ states, infeasible); applying stochastic search to a space small enough for systematic (no point in MCTS for tic-tac-toe).

### 3.2 Complete vs incomplete

A **complete** search finds a solution if one exists (BFS, Dijkstra, A\* with finite branching). An **incomplete** search may miss a solution even if one exists (greedy best-first, beam search, MCTS with finite budget). The trade: completeness costs memory or time. The bug: relying on an incomplete search for a safety-critical task (verifying a circuit with bounded model checking — the bound may miss bugs that need more depth). Mitigation: use complete search for safety, incomplete for performance, and document which is which.

### 3.3 Exact vs approximate

**Exact** search returns the optimal solution (Dijkstra, A\* with admissible heuristic, full minimax). **Approximate** search returns a solution within a bound of optimal (beam search, anytime algorithms, approximation algorithms). The trade: exact is exponential in the worst case; approximate is polynomial with a quality guarantee. The bug: applying exact search to an NP-hard problem at scale (TSP with 1000 cities by branch-and-bound — infeasible) or applying approximate search when optimality is required (medical dosage). The middle ground: **anytime algorithms** that return increasingly good solutions as the budget grows, with a guarantee on the current best.

### 3.4 Offline vs online search

**Offline** search computes a complete plan before execution (Dijkstra returns the full path; minimax returns the full principal variation). **Online** search interleaves planning and execution, replanning as new information arrives (real-time A\*, LRTA\*, game-tree search with time limits, MPC in robotics). The trade: offline is optimal if the model is correct; online is robust to model error but suboptimal within each planning window. The bug: applying offline search to a non-stationary environment (a robot plan that breaks on the first unexpected obstacle); applying online search where the per-step planning budget is too small to find a non-trivial plan.

### 3.5 Forward vs backward search

**Forward** search (from initial state to goal) is natural when the branching factor is small and the goal test is cheap. **Backward** search (from goal to initial state) is natural when the goal set is small and the predecessor function is cheap. **Bidirectional** search (meet in the middle) can reduce complexity from $O(b^d)$ to $O(b^{d/2})$. The bug: applying forward search when the goal set is small (backward would be cheaper); applying backward search when the predecessor function is expensive (most scheduling problems — predecessors are not easily computed).

### 3.6 Search vs inference

**Search** enumerates candidate solutions; **inference** derives conclusions. The two are dual: every search can be reformulated as inference (derive a contradiction from "no solution exists" — this is what SAT solvers do), and every inference can be reformulated as search (search the proof space). The bug: applying search where inference's pruning would help (a CSP with strong constraints is solved faster by propagation than by backtracking); applying inference where search's flexibility would help (a theorem prover that gets stuck in one proof branch when backtracking would find another).

### 3.7 Tree search vs graph search

**Tree search** treats each state as new (may revisit); **graph search** tracks visited states (no revisit). Tree search uses $O(bd)$ memory; graph search uses $O(b^d)$. The bug: applying tree search to a problem with many paths to the same state (exponential waste); applying graph search to a problem with a huge state space (memory blowout). The compromise: **transposition tables** in game search — cache visited states with a bounded size, evicting the least-recently-used.

## 4. Implementation

**Build an A\* solver for the 15-puzzle with Manhattan-distance heuristic, then extend to bidirectional A\*.** Target: ~250 lines.

15-puzzle: a 4×4 grid with 15 numbered tiles and one blank; a move slides a tile adjacent to the blank into the blank. The goal is a specific arrangement (e.g., tiles 1-15 in row-major order, blank last). State: a 16-tuple (or a 64-bit packed representation). Successors: up to 4 (move the tile above/below/left/right of the blank into the blank). Goal test: state equals the goal arrangement.

Manhattan-distance heuristic: $h(s) = \sum_{\text{tile } t} |x_t - x_t^*| + |y_t - y_t^*|$, where $(x_t, y_t)$ is $t$'s current position and $(x_t^*, y_t^*)$ is its goal position. Admissible (each tile must move at least its Manhattan distance) and consistent (each move changes the heuristic by at most 1, the step cost). The optimal solution length for the 15-puzzle averages ~52 moves; Manhattan-distance A\* can solve random instances in seconds.

Implementation:
- State: pack the 16 tiles into a 64-bit integer (4 bits each) for cheap hashing and comparison.
- Priority queue: a binary heap keyed on $f = g + h$. Use `heapq` (Python) or `std::priority_queue` (C++).
- Closed set: a hash set of visited states.
- Open set: a hash map from state to its current best $g$ (for decrease-key emulation).
- Reconstruct path: store a parent pointer per state; backtrack from goal.

Test cases:
- 100 random solvable instances (generate by applying 100 random moves from the goal). Verify the solver returns a path of length equal to the optimal (compare against a reference solver; the average length should be ~52).
- Optimality: verify the returned path length is a lower bound on the Manhattan-distance heuristic at the start, and that no shorter path is found by IDA\* on the same instance.
- Scaling: time to solve correlates with solution length and heuristic quality. Plot nodes-expanded vs solution length; the slope is the **effective branching factor** — for Manhattan-distance A\* on the 15-puzzle, it's ~1.4 (vs the raw branching factor of ~2.7).
- Hard instance: the "most difficult" 15-puzzle instance (80 moves to solve). Verify the solver completes in reasonable time (seconds to minutes, depending on the heuristic); if not, add the **linear conflict** heuristic (Manhattan + 2 per linear conflict) which roughly halves the effective branching factor.

Bidirectional A\* extension:
- Run two A\* searches in parallel: forward from $s_0$, backward from $\mathcal{G}$.
- Terminate when the two open sets meet (a state is in both closed sets).
- The optimal path length is $\min_{s \in \text{both}} (g_{\text{fwd}}(s) + g_{\text{bwd}}(s))$.
- The backward search needs a reverse successor function (for the 15-puzzle, this is identical to the forward successor function — moves are symmetric).

Test cases for bidirectional:
- Verify the bidirectional solution is the same length as the unidirectional solution.
- Verify the bidirectional search expands fewer total nodes (typically by a factor of $\sqrt{b^d}$ for $d$-deep solutions).
- The **meeting point subtlety**: bidirectional A\* is not as straightforward as it sounds — the standard termination criterion ("a state is in both open sets") is *not* correct; you must wait until the top of both priority queues has $f \ge$ the best meeting cost found so far. Verify your termination criterion against the brute-force optimal; a wrong criterion returns suboptimal paths.

**Difficulty**: medium-hard. **Sub-skills tested**: A\* with consistent heuristic, transposition handling, heuristic design (Manhattan, linear conflict), bidirectional coordination. The bugs you will hit: (a) using a non-admissible heuristic by accident (e.g., counting the blank in the Manhattan distance) — solutions are suboptimal; (b) the bidirectional termination criterion — see above; (c) the priority queue's decrease-key operation — most stdlib heaps don't support it, so you emulate with lazy deletion (push duplicates, skip stale entries on pop).

**Extension ladder**:
1. Replace A\* with **IDA\*** (iterative-deepening A\*). Memory drops to $O(d)$; time goes up by a constant factor. Verify IDA\* solves the same instances and uses kilobytes of memory where A\* used gigabytes.
2. Add the **linear conflict** heuristic. Verify the effective branching factor drops to ~1.2. Add the **walking distance** heuristic (a more sophisticated pattern-database heuristic) and verify it drops further to ~1.05.
3. Build a **pattern database** for the 15-puzzle: precompute the optimal cost for a subset of tiles (e.g., the 7-8 partition) by retrograde BFS from the goal; use the database as the heuristic. This is how Korf solved the 17×17 puzzle. Verify the database-backed A\* solves random instances in milliseconds.
4. Generalize to **weighted A\*** (use $f = g + W \cdot h$ for $W > 1$). Verify solutions are within $W$ of optimal; verify the search is much faster. This is the standard speed-optimality tradeoff in practice.

## 5. Failure analysis

1. **State space explosion.** The space is exponential in depth; even A\* with a good heuristic runs out of memory for $d > 30$ on hard problems. Diagnosis: the open set grows unboundedly. Mitigation: switch to **memory-bounded search** (IDA\*, SMA\*), use a pattern database to shrink the effective depth, or accept suboptimality (weighted A\*, greedy best-first).

2. **Inadmissible heuristics.** A heuristic that overestimates $h^*$ breaks A\*'s optimality guarantee — solutions are found faster but may be suboptimal. The classic case: using the *current-distance* heuristic in a problem where it overestimates. Diagnosis: solutions found are shorter than the heuristic's prediction (impossible if admissible). Mitigation: prove admissibility by reduction to a relaxed problem; or use weighted A\* explicitly with a known weight.

3. **Time/memory tradeoffs.** BFS is optimal but uses $O(b^d)$ memory; IDDFS uses $O(bd)$ memory but re-expands states. A\* with a perfect heuristic is optimal and fast but uses $O(b^{\epsilon d})$ memory. The choice is dictated by which constraint binds. The bug: choosing BFS because it's "simple" and running out of memory at depth 10.

4. **Local minima.** Greedy local search (hill-climbing, simulated annealing at low temperature) can get stuck in a local optimum that is far from the global. The classic case: a traveling salesman tour that looks locally optimal but is 50% over the optimum. Mitigation: random restarts, simulated annealing with a careful cooling schedule, genetic algorithms with diversity preservation, or a different strategy entirely (branch-and-bound for guaranteed optimality).

5. **Infinite loops in cyclic graphs.** DFS on a cyclic graph without a visited set loops forever. Even with a visited set, an inconsistent heuristic can cause A\* to reopen a state infinitely. Mitigation: always track visited states; verify the heuristic is consistent (or accept the reopen cost).

6. **False positives in inference.** A resolution prover derives a contradiction from a satisfiable theory because of a bug in the inference rule implementation. The classic case: forgetting the **occurs-check** in unification (allowing $X = f(X)$) makes Prolog unsound. Mitigation: validate the prover against known-satisfiable and known-unsatisfiable benchmarks; use a reference prover for differential testing.

7. **Non-termination of resolution.** Resolution is refutation-complete but not decidable — it may run forever on satisfiable theories. The classic case: first-order logic with a function symbol and a satisfiable but non-provable goal. Mitigation: set a time/step bound; use **ordered resolution** or **resolution with selection** to restrict the search space; switch to **decidable fragments** (e.g., modal logic, description logics) when termination is required.

8. **Pruning too aggressive in beam search.** Beam search with a narrow beam ($k = 1$) is greedy and may prune the optimal path early; with a wide beam ($k = 1000$) it's slow. The classic case: LLM decoding with beam search produces repetitive, low-diversity output because the beam converges to similar sequences. Mitigation: **diverse beam search** (penalize similar sequences in the beam), **nucleus sampling** (sample from the top-$p$ probability mass), or **temperature scaling**.

9. **Heuristic drift in learning-enhanced search.** A learned heuristic (neural eval function) is accurate on the training distribution but wrong off-distribution; the search is misled. The classic case: AlphaGo's eval function miscalibrated on positions outside its training set. Mitigation: hybrid heuristics (neural + hand-crafted, with the hand-crafted dominating far off-distribution), uncertainty estimates (search more where the neural net is uncertain), or conservative MCTS (more rollouts where the policy is split).

10. **Transposition-table collisions.** A bounded transposition table evicts entries; a later search re-expands an evicted state, wasting work. The bug: evicting a state whose value is still needed by an in-progress search. Mitigation: **replacement schemes** (depth-preferred, two-tier tables) that prefer to evict shallow or old entries; or **lock-free** transposition tables to avoid contention.

11. **Adversarial search with imperfect opponent model.** Minimax assumes optimal play; if the opponent is suboptimal, the minimax move may be too conservative (it assumes the opponent will find the best response). Mitigation: **expectimax** (model the opponent as a probability distribution), **opponent modeling** (learn the opponent's policy from history), or **regret-minimizing** strategies (online learning in repeated games).

12. **Query optimizer misestimation.** A SQL query optimizer's cost model misestimates the cardinality of an intermediate result; it chooses a plan that is 100× slower than the optimal. The classic case: PostgreSQL estimating a join returns 10 rows when it returns 10M, then choosing a nested-loop join. Mitigation: **adaptive query execution** (Spark, AQE) that re-optimizes mid-query based on observed cardinalities; **materialized samples** for cardinality estimation; or **learned cardinality estimation**.

## 6. Transfer tests

#sr
- **Terminology shift**: A compiler team reports "type inference is slow on this program." Without using the word *search*, identify the schema (proof-space search via unification), the state space (substitutions), and the strategy (constraint propagation with occurs-check).
- **Representation shift**: You are given a 1000-city TSP and a 1000-row distance matrix. The task is to find a near-optimal tour. Identify the schema (search under a budget), the strategy (branch-and-bound with LP relaxation, or 2-opt local search, or simulated annealing), and the failure mode if the budget is too tight (local optimum far from global).
- **Constraint shift**: Each search node must be evaluated in less than 1μs. Compare three strategies (full minimax, alpha-beta with neural eval, MCTS with 100 rollouts) on the axes of optimality, depth reached, and per-node cost. Which strategy is appropriate for a real-time game with 100ms per move?
- **Unnamed solution**: A team reports "our LLM hallucinates on factual questions but is fine on arithmetic." Identify the schema (search vs retrieval), the bug (LLM decoding is approximate search over token sequences, not retrieval from a knowledge base), and the fix (RAG: retrieve relevant documents, then condition generation on them).
- **Competing schemas**: A SAT solver uses CDCL to find a satisfying assignment. Is this S10 (Search) or S1 (State & Transition)? State the structural feature that decides (the state is a partial assignment; the transition is a variable assignment or clause learning), and explain when each schema is the right lens.
- **Failure shift**: An A\* search returns a path of length 60 on a problem whose Manhattan-distance lower bound is 50. A reference solver returns 55. Identify the schema (admissible heuristic), the bug (the heuristic is inadmissible — it overestimates on some states), and the diagnostic (check $h \le h^*$ on every state along the returned path).
- **Scale shift**: A system must solve 1M routing queries per second with p99 latency under 50ms on a continent-scale road network. Identify which strategy (Dijkstra, A\* with landmarks, contraction hierarchies) satisfies the constraint, the preprocessing required (CH takes hours), and the tradeoff (preprocessing time vs query latency).
- **Layer shift**: The same logical "find the best move" is implemented as (a) full-width minimax to depth 4, (b) alpha-beta with a hand-crafted eval to depth 8, (c) MCTS with a neural policy to 10k simulations. Identify which invariants of (a) survive into (b) and (c), and which new failure modes each layer introduces (eval-function inaccuracy, stochastic incompleteness).

## 7. Delayed retrieval

#sr
- **Recall**: State the admissibility and consistency conditions for an A\* heuristic. State the Bellman equation for an MDP. State what CDCL learns from each conflict.
- **Explanation**: Why does A\* with an admissible heuristic return the optimal solution? Give the proof sketch (no node off the optimal path is expanded before the goal, because $f$ on the optimal path is monotonically non-decreasing and bounded by $f^*$).
- **Derivation**: Derive the effective branching factor $b^*$ for A\* on a problem with branching factor $b$, optimal depth $d$, and $N$ nodes expanded: $N + 1 = 1 + b^* + (b^*)^2 + \dots + (b^*)^d$. Explain why $b^* \to 1$ as the heuristic improves.
- **Implementation**: Implement A\* for the 15-puzzle with Manhattan distance. State the failure mode if the heuristic is inconsistent (states reopened infinitely) and the fix (verify consistency; or accept the reopen overhead with a visited-with-best-g map). State the test that catches a non-admissible heuristic (compare to IDA\* optimal).
- **Diagnosis**: A search solver returns suboptimal solutions on some instances. Describe the diagnostic procedure to identify whether the cause is (a) inadmissible heuristic, (b) inconsistent heuristic causing premature pruning, (c) transposition-table collision evicting a needed state, or (d) a bug in the successor function. Which test settles each?
- **Transfer**: You move from A\* on the 15-puzzle to MCTS on Go. Predict two invariants that *carry over* (search under a budget; pruning by bounds / UCT) and two that *break* (deterministic vs stochastic expansion; completeness guarantee vs asymptotic convergence). Justify via the search schema.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — search and inference recur from pathfinding to theorem proving to LLM decoding.
- **Related schemas**: [[02_Schemas/S1 — State & Transition|S1 State & Transition]] (search traverses a state machine), [[02_Schemas/S2 — Graph & Reachability|S2 Graph & Reachability]] (search is graph traversal; bidirectional search is two simultaneous reachability computations), [[02_Schemas/S4 — Optimization & Constraints|S4 Optimization & Constraints]] (search as optimization; branch-and-bound as constrained optimization).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing A\* to minimax to CDCL to Viterbi reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
