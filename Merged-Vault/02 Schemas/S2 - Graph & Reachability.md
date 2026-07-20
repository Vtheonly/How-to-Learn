---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S2 — Graph & Reachability

> A **graph** is the minimal structure that captures "things and the relations between them"; reachability — "can I get from $u$ to $v$ by following edges?" — is the question that subsumes routing, dependency resolution, type inference, program slicing, and a thousand other engineering tasks under one traversal algorithm.

---

## 1. Formal core

A graph is a pair $G = (V, E)$ where $V$ is a set of vertices and $E$ is a set of edges. For a directed graph $E \subseteq V \times V$; for an undirected graph $E \subseteq \binom{V}{2}$, equivalently $E$ is a set of unordered pairs $\{u, v\}$.

A **labeled** or **attributed** graph attaches data to vertices and/or edges (vertex labels $\ell_V : V \to L_V$, edge labels $\ell_E : E \to L_E$). A **weighted** graph is the special case $\ell_E : E \to \mathbb{R}_{\geq 0}$.

**Reachability**: $u \to^* v$ iff there exists a finite sequence $u = v_0, v_1, \dots, v_k = v$ with $(v_{i-1}, v_i) \in E$ for all $i$. The reflexive-transitive closure of $E$ is denoted $E^*$.

**Connectivity**:
- Undirected: connected components partition $V$.
- Directed: strongly connected components (SCCs) are the maximal subsets where every pair is mutually reachable. Tarjan's and Kosaraju's algorithms compute SCCs in $\Theta(|V| + |E|)$.

**Acyclic graphs**:
- A DAG is a directed graph with no directed cycle. A topological ordering of a DAG is a linear order $\prec$ with $(u, v) \in E \Rightarrow u \prec v$. Computed by Kahn's algorithm (peel off zero-indegree vertices) or DFS post-order reversal. Existence of a topological order is *equivalent* to acyclicity — this is the most-used cycle test in practice.

**Traversals**:
- **BFS** uses a FIFO queue; visits vertices in order of hop count from the source. Computes shortest paths in *unweighted* graphs. $\Theta(|V| + |E|)$.
- **DFS** uses a stack (or recursion); visits as deep as possible before backtracking. Computes preorder, postorder; underpins Tarjan SCC, topological sort, articulation points, bridge detection.
- **Dijkstra** generalizes BFS to non-negative weights via a priority queue. $\Theta((|V| + |E|) \log |V|)$ with a binary heap.
- **A\*** adds a heuristic lower bound to Dijkstra's priority. Optimal given an admissible heuristic.
- **Bellman–Ford** tolerates negative weights; detects negative cycles.

**Invariants that distinguish algorithms**:
- BFS optimality holds iff all edge weights are equal (or unweighted).
- Dijkstra's correctness requires *non-negative* weights.
- Topological sort requires acyclicity; otherwise the algorithm detects a cycle as a side effect.

**Algebraic structure**. The set of paths in a graph forms a semiring (the "tropical semiring" for shortest paths: $(\min, +)$; the "Boolean semiring" for reachability: $(\lor, \land)$). Many graph algorithms are matrix multiplications over a semiring — Floyd–Warshall is $O(n^3)$ semiring multiplication, Kleene closure computes transitive closure as $E^* = E + E^2 + E^3 + \dots$, and Strassen-style fast matrix multiplication accelerates them. This is the schema-level reason that graph libraries (GraphBLAS, cuGraph) expose a single API for reachability, shortest paths, and min-cost flow — they are all the same semiring computation with different operators. The unifying abstraction is far more powerful than memorizing each algorithm separately.

**Planarity and embeddings**. A graph is *planar* iff it can be drawn without edge crossings. Kuratowski's theorem characterizes planarity by forbidden minors ($K_5$ and $K_{3,3}$). Planar graphs admit $O(n)$ algorithms for many problems that are $O(n^3)$ in general (shortest path via separator decomposition, isomorphism). The schema-level point: not all graphs are equal — *structural classes* (planar, bipartite, bounded-treewidth, scale-free, small-world) admit dramatically faster algorithms. Real systems exploit this: VLSI routing (planar), social networks (small-world), and dependency graphs (DAGs, hence topological) all benefit from recognizing their class.

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Vertices | Edges | Reachability question |
|--------|----------|----------|-------|------------------------|
| Compilers | Abstract Syntax Tree / call graph | AST nodes / functions | Parent-child / call relations | "Which functions can be reached from `main`?" (dead-code elimination) |
| Package management | Dependency graph (npm, cargo, pip) | Packages | Versioned dependencies | "Can I install this set without a cycle?" (resolution) |
| Networking | BGP / OSPF topology | Routers | Links (with weights) | "What is the shortest path from AS100 to AS200?" |
| NLP / SEO | Knowledge graph | Entities | Relations (rdf:type, etc.) | "Is X a subclass of Y?" (transitive closure over `rdfs:subClassOf`) |
| Probability | Bayesian network | Random variables | Conditional dependencies | "Is X d-separated from Y given Z?" (path-based reachability with blocking rules) |
| Program analysis | Points-to / dataflow graph | Program points | Def-use chains | "Which definitions reach this use?" (reaching definitions) |
| Distributed systems | Kubernetes scheduling graph | Pods, nodes, volumes | Affinity / anti-affinity edges | "Is there a feasible assignment?" (bipartite matching + reachability) |
| Security | Capability graph | Subjects, objects | Permission grants | "Can subject S transitively acquire permission P?" |

The same five operations recur: build the graph, query reachability, find SCCs, topologically sort (if a DAG), compute shortest paths.

Two cross-instance observations are worth internalizing. First, almost every "analysis" problem in CS reduces to a graph traversal on an appropriately defined graph — the schema's expressive power comes from the fact that *relations* (calls, dependencies, flows, constraints) are universal. Second, the difference between a 10 ms query and a 10 second query is almost never the algorithm; it is whether the graph fits in cache (S6), whether it has been pre-condensed to its SCCs, and whether you materialized the transitive closure or compute it on demand. The graph schema is the right *cognitive* unit; the performance is governed by the interaction with S6 Memory & Locality.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: $G = (V, E)$, adjacency, reachability, transitive closure.
- *Hardware*: NUMA topology graphs, PCIe tree, network-on-chip for GPUs.
- *Language/runtime*: object reference graphs (GC traversal), `import` graphs, class hierarchy.
- *Operating system*: process parent trees, file descriptor graphs, dependency graphs in `systemd`.
- *Distributed system*: consensus quorum graphs, gossip overlays, Raft membership.
- *Production practice*: trace graphs in OpenTelemetry, dependency graphs in Datadog, topology maps in network observability tools.

For each canonical instance in the table above, walking through these six layers and identifying where the schema *breaks* (e.g., a knowledge graph has cycles that a dependency graph forbids) is what builds the transfer muscle.

## 3. Contrastive cases

### 3.1 Trees (special case)

A tree is a connected acyclic *undirected* graph, or equivalently a rooted directed graph with a unique path from root to every node. Trees lose the expressive power of DAGs (shared children) and general graphs (cycles). The contrast matters because many algorithms "feel" tree-shaped (recursive descent, divide-and-conquer) but actually operate on DAGs (memoized recursion, dynamic programming) or graphs (SSA, dataflow). Treating a DAG as a tree duplicates work exponentially.

### 3.2 DAGs (acyclic directed)

A DAG forbids cycles but allows a node to have multiple parents. This is the right model for: spreadsheets, build systems, git commit history, Bayesian networks, SSA form. The contrast with general graphs: topological sort works; shortest paths are trivial (relax in topological order, $\Theta(|V| + |E|)$); SCCs are all singletons. The contrast with trees: a node can be reached by multiple paths, so naive recursion overcounts.

### 3.3 Hypergraphs (edges contain >2 nodes)

A hypergraph $H = (V, \mathcal{E})$ has hyperedges $e \in \mathcal{E}$ where $e \subseteq V$ with $|e|$ arbitrary. Each hyperedge is a *relation* among many nodes. Examples: database joins (a join key relates N rows), biochemical reaction networks (a reaction consumes multiple substrates and produces multiple products), SAT clauses (a clause is a disjunction over N literals). The contrast: reachability on hypergraphs is a fixpoint computation (the "Galois connection" / relational join closure), not a simple traversal.

### 3.4 Property graphs vs RDF vs hypergraphs

A property graph (Neo4j) attaches key-value pairs to nodes and edges. RDF is a directed labeled graph with triples. Both are subsumed by hypergraphs when N-ary relations matter (e.g., "Alice *enrolled-in* CourseX *in* 2024 *with-grade* A" is one 4-ary fact, not three triples). Mis-choosing the model is a common schema-design failure: reifying N-ary relations as nodes inflates graph size and breaks reachability queries.

### 3.5 Trees (the strict sub-case)

Trees forbid multiple parents and cycles. Many algorithms "feel" tree-shaped but operate on DAGs or general graphs: SSA form, dynamic programming on memoized recursion, and Merkle structures all have multiple-parent shapes that violate tree invariants. Treating a DAG as a tree duplicates shared substructures exponentially (the naive Fibonacci recurrence is the canonical example). The schema-level fix is memoization, which restores linear-time behavior by *not* re-traversing shared children. This is the structural reason DP "works" — it is the graph traversal equivalent of turning an exponential tree into a linear DAG.

### 3.6 Multigraphs and labeled graphs

A *multigraph* allows multiple edges between the same pair of vertices (parallel edges); a *labeled* graph attaches labels to edges. Most real-world graphs (network topologies with redundant links, biological pathways with multiple reaction types, transit graphs with multiple bus lines between stops) are multigraphs, but most algorithms silently assume simple graphs. The contrast: BFS on a multigraph still works, but shortest-path algorithms must consider *every* parallel edge; ignoring them misses the cheapest route. The schema-level fix: when modeling a system as a graph, always ask "can two nodes have more than one relation?" — if yes, you have a multigraph and your data structures must encode the multiplicity.

## 4. Implementation

**Build a parallel build system.** Target: ~300 lines.

Inputs: a dependency file (TOML or simple DSL) listing tasks and their dependencies.

```
[compile]
cmd = "g++ -c main.cpp"
deps = []

[link]
cmd = "g++ main.o -o app"
deps = ["compile"]

[test]
cmd = "./app --test"
deps = ["link"]

[benchmark]
cmd = "./app --bench"
deps = ["link"]
```

Deliverables:

1. Parse the file into a graph.
2. Detect cycles. If a cycle exists, print the offending cycle and exit non-zero.
3. Topologically sort. Within a topological level, run independent tasks in parallel using a thread pool or `asyncio`.
4. On task failure, abort downstream tasks (transitive reachability from the failed node).
5. Support `--dry-run`, `--jobs N`, and incremental builds: hash each task's inputs; skip tasks whose inputs are unchanged *and* whose dependencies were skipped.

Test cases:
- Diamond: `a → b → d`, `a → c → d` (test that b and c run in parallel).
- Cycle: `a → b → a` (test that you detect and report it).
- Fan-out: `a → {b, c, d, e}` (test parallelism).
- Diamond with cycle on the side: combine the above (test that you still find the cycle in a subgraph).
- Incremental: run twice; the second run should skip everything.

**Difficulty**: medium. **Sub-skills tested**: graph representation (adjacency list vs matrix), topological sort (Kahn's algorithm), parallel scheduling (countdown latches or futures), cycle reporting (DFS with recursion stack), content hashing for incremental builds.

**Extension ladder**:
1. After step 5, add content-addressed caching: store each task's output by the hash of `(cmd, deps, dep_outputs)`. Re-running a build with no changes should be near-instant.
2. Add remote caching (upload/download outputs by hash). This is what Bazel, Buck, and Nix do. The graph schema is unchanged; the *storage* moves across a network, which introduces a new failure mode (cache poisoning).
3. Add dynamic dependencies — a task discovers new dependencies only after running (e.g., a compiler that reads `#include` directives). This breaks the static-graph assumption and requires a fixpoint algorithm: run, observe new deps, run again until stable. The schema extends; the algorithm becomes iterative.

The bugs you will hit: (a) deadlock when a thread waits on a task that never gets scheduled because of a missed edge; (b) incorrect cycle reporting when the cycle is in a non-trivial SCC; (c) races on the "is this task done?" flag.

**Why this exercise matters**. Build systems are the canonical graph schema application because they expose every part of the schema: representation (the dependency graph), traversal (topological sort), reachability (cancel-on-failure), and dynamic updates (incremental builds). The same algorithms run inside a database query planner, a TypeScript type checker, a Kubernetes controller's dependency resolver, and an ML compiler's graph rewriter. Once you have built one correctly, you have built all of them — at the schema level.

## 5. Failure analysis

1. **Cycles in "DAGs" (deadlocks).** npm, pip, and cargo have all shipped versions that resolved cycles incorrectly. The fix is not "forbid cycles" (some are valid, e.g., mutual recursion in Python imports) but "detect cycles and report them with the smallest rotating subgraph." This is SCC computation, not DFS-with-color.

2. **Missing edges (incomplete dependencies).** A build file omits `deps = ["header.h"]`; the build succeeds incrementally and fails on a clean build. The graph is wrong; the algorithm is correct. Mitigation: auto-discover dependencies (compiler `-MMD` flag, `strace`-based file tracking).

3. **Exponential blowup in transitive closure.** Materializing $E^*$ as a bitmatrix costs $\Theta(|V|^2)$ space and $\Theta(|V|^3)$ Floyd–Warshall time. For a knowledge graph with $10^8$ nodes this is infeasible. Mitigation: bidirectional BFS on demand, transitive-closure reduction (kept acyclic via condensation to SCCs first), or indexing with a reachability oracle (FERRARI, PReaCH).

4. **Partition tolerance in distributed graphs.** A graph stored across machines (e.g., Neo4j cluster, JanusGraph) loses edges during partitions. Reachability queries return false negatives. Mitigation: quorum reads, or accept eventual consistency and document that reachability is "best effort."

5. **Reachability under failures.** Network reachability assumes the underlying graph is intact. With node/edge failures, the right question is "is $v$ reachable with probability $\geq p$?" — a *stochastic* reachability problem on a probabilistic graph. Standard BFS gives the wrong answer.

6. **Dijkstra's negative-weight trap.** Feeding a graph with a negative-weight edge to Dijkstra silently produces wrong shortest paths. The bug is invisible until you compare to a ground truth. Mitigation: precondition assertion `min(weights) >= 0`, or use Bellman–Ford / Johnson's algorithm.

7. **SCC computation correctness under mutation.** Tarjan's algorithm assumes the graph is not mutated during traversal. A reactive system that mutates the graph in response to a callback (e.g., a graph database trigger) breaks the invariant. Mitigation: snapshot the graph, or use an online SCC algorithm.

8. **Quadric blowup from join ordering.** In query planning, the join graph's topology determines the cost; a chain `A-B-C-D` is linear, a star is OK, but a clique of $n$ relations has $n!$ join orders. The graph *shape* dictates the optimization cost — a graph-theoretic failure that masquerades as a query-planner bug.

9. **Representation mismatch (adjacency list vs matrix).** A dense graph with $10^6$ nodes and $10^{12}$ edges fits in a bitmatrix (125 GB) but not in an adjacency list (each edge needs ~16 bytes = 16 TB). A sparse graph is the opposite. Choosing the wrong representation makes the algorithm I/O-bound or memory-bound. Mitigation: profile the graph's density before choosing the representation; for moderately dense graphs, hybrid CSR/DCSR formats win.

## 6. Transfer tests

#sr
- **Terminology shift**: A CI/CD system declares "jobs" that "need" other jobs. Some jobs "fail-fast" their dependents. Without using the word *graph*, name the schema, the operation that detects "which jobs to cancel on failure of job X," and its complexity.
- **Representation shift**: You are given an $n \times n$ boolean matrix `R` where `R[i][j] = true` iff relation holds. You must answer "is there a path of length $\leq k$ from $i$ to $j$?" for many $(i, j, k)$ queries. Give the schema, the algorithm, and the data structure that gives sublinear query time.
- **Constraint shift**: Edges have *time windows* — edge $(u, v)$ is only traversable during $[t_1, t_2]$. Reachability is now time-dependent. What algorithm class solves this, and which invariant of plain BFS no longer holds?
- **Unnamed solution**: A spreadsheet recomputes cells when their dependencies change. It must avoid recomputing cells whose inputs haven't changed, and must handle circular references gracefully. Identify the schema, the two graph algorithms at the core, and the data structure that supports incremental recomputation.
- **Competing schemas**: A reinforcement learning agent's value function is stored as $V(s)$ for $s \in S$. The agent's transition model $P(s' \mid s, a)$ defines a labeled graph on $S$. Is value iteration primarily an instance of S1 (state machine), S2 (graph reachability), or S4 (optimization)? State the deciding evidence.
- **Adversarial shift**: An attacker can add a single edge to your dependency graph. Which single edge causes the most downstream recompilation? Identify the schema, the metric being maximized, and the algorithm that computes the answer in $O(|V| + |E|)$.
- **Scale shift**: Your graph has $10^{11}$ edges and does not fit on one machine. Describe a partitioning strategy that (a) keeps BFS correct, (b) minimizes cross-machine messages, and (c) tolerates a single machine failure. State which of (a), (b), (c) cannot be simultaneously optimized.
- **Stream shift**: Edges arrive as a stream; you cannot store the whole graph. Describe how to approximate reachability (BFS / SCC count / triangle count) under a bounded-memory streaming model. Identify the schema-level trade (sampling error vs. memory) and the formal object (graph sketch, count-min sketch on adjacency) that captures it.
- **Causality shift**: In a dependency graph, a node "depends on" another. In a causal graph (Bayesian network, Pearl's DAGs), an edge means "causes." Both are DAGs. Which invariants of the dependency-graph algorithms carry over to causal inference (do-calculus, back-door criterion), and which break?
- **Coverage shift**: A graph is stored in a database as an adjacency-list table. You must support "find all nodes within $k$ hops of $v$" for arbitrary $k$. Compare three implementation strategies (recursive CTE, materialized transitive closure, label-propagation pre-computation) on storage cost, query latency, and update cost.

## 7. Delayed retrieval

#sr
- **Recall**: Define graph, directed edge, undirected edge, path, cycle, SCC, DAG, topological order. One line each.
- **Explanation**: Why is the existence of a topological ordering equivalent to acyclicity? Give the proof in both directions.
- **Derivation**: Derive the $\Theta(|V| + |E|)$ bound for BFS. Where does the bound fail for adjacency-matrix representation?
- **Implementation**: Implement Tarjan's SCC algorithm. State the role of `lowlink`, the role of the recursion stack, and the bug you get if you pop a vertex off the stack too early.
- **Diagnosis**: A package manager hangs during dependency resolution. You have a core dump. Describe the diagnostic procedure to determine whether this is a cycle, an exponential search, or a deadlock in the parallel resolver. Which piece of evidence would settle each?
- **Transfer**: A type system computes "is type $A$ a subtype of $B$?" by traversing the subtype graph. Predict two ways this graph differs from a build-system dependency graph, and one invariant that is identical.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — graph traversal is one of the most-transferred schemas in CS.
- **Related schemas**: [[02_Schemas/S1 — State & Transition|S1 State & Transition]] (a state machine is a labeled graph; reachability = "can the machine enter state $q$?"), [[02_Schemas/S3 — Tree & Hierarchy|S3 Tree & Hierarchy]] (the connected-acyclic sub-case), [[02_Schemas/S10 — Search & Inference|S10 Search & Inference]] (graph traversal *is* search).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing a build system to a BGP routing table builds the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
