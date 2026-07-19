---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S3 — Tree & Hierarchy

> A **tree** is the structure that arises whenever a system needs *unambiguous ancestry* — one parent per node — which makes it the natural shape for storage hierarchies, recursive decompositions, and any control flow that wants deterministic traversal; nearly every "fast" data structure and "scoped" language feature is a tree in disguise.

---

## 1. Formal core

A **tree** can be defined four equivalent ways:

1. **Graph-theoretic**: a connected acyclic undirected graph on $n$ vertices has exactly $n - 1$ edges.
2. **Rooted directed**: a directed graph with a distinguished root $r$ such that every non-root has exactly one incoming edge (parent pointer) and there is a unique directed path from $r$ to every vertex.
3. **Recursive**: a tree is either (a) empty, or (b) a root node with zero or more child trees.
4. **Order-theoretic**: a partially ordered set $(T, \leq)$ where every element $x$ has a unique minimal ancestor chain (a well-founded meet-semilattice with a bottom element).

The four definitions are equivalent for finite trees but expose different operations.

**Measurements**:
- **Depth** of node $v$: number of edges from root to $v$.
- **Height** of $v$: longest downward path from $v$ to a leaf.
- **Balance**: a tree is *height-balanced* if for every node, the heights of its children differ by at most $O(1)$ (AVL: $\leq 1$; red-black: $\leq 2\times$).
- **Arity / fanout**: maximum number of children per node.

**Traversal orders** (for binary trees):
- **Pre-order**: root, left, right. Yields top-down traversal; used for serialization, copying.
- **In-order**: left, root, right. Yields sorted order for BSTs.
- **Post-order**: left, right, root. Yields bottom-up; used for deletion, for evaluating expression trees, for computing subtree aggregates.
- **Level-order**: BFS by depth. Used for B-tree range scans and for serialization that preserves shape.

**Structural invariants** (define the classic tree types):
| Tree type | Invariant | Consequence |
|-----------|-----------|-------------|
| BST | For each node $x$, all keys in left subtree $< x.\text{key} <$ all keys in right subtree | In-order traversal is sorted; search $O(h)$ |
| AVL | BST + height-balanced ($|h_L - h_R| \leq 1$) recursively | $h = O(\log n)$; insert/delete need $\leq 2$ rotations |
| Red-Black | BST + coloring with red-children, black-height invariants | $h \leq 2\log(n+1)$; $O(1)$ rotations per insert |
| B-tree of order $m$ | Each internal node has $\lceil m/2 \rceil$ to $m$ children; all leaves at same depth | $O(\log_m n)$ height; fanout 100–1000 makes it cache-friendly |
| Heap | Complete binary tree + heap property (parent $\leq$ children for min-heap) | $O(\log n)$ insert / extract-min; array representation; no fast search |
| Trie | Edges labeled by symbols; key = root-to-leaf path | $O(L)$ lookup where $L$ = key length, independent of $n$ |
| Merkle tree | Each non-leaf hash = $H(\text{concat of children hashes})$ | Tamper-evidence; $O(\log n)$ proof of any leaf |

**Rotations** are the universal rebalancing primitive for binary search trees. A right rotation at node $x$ (with left child $y$) makes $y$ the new root, $x$ its right child, and transfers $y$'s right subtree to be $x$'s left subtree. The BST invariant is preserved because all keys in the transferred subtree lie between $y$ and $x$. AVL inserts perform at most one rotation; red-black inserts perform at most two; splay trees perform rotations on every access (amortizing cost over a sequence). The schema-level insight: *rotations are the only structural change that preserves the BST invariant while changing depth*. Every self-balancing tree algorithm is a policy for *when* to rotate; the rotation itself is invariant.

**Recursion and divide-and-conquer**. Trees are the natural data structure for recursive algorithms because their definition is recursive. The master theorem $T(n) = aT(n/b) + f(n)$ describes the cost of a divide-and-conquer algorithm that splits into $a$ subproblems of size $n/b$. Every divide-and-conquer algorithm (mergesort, FFT, Strassen, closest-pair) corresponds to a recursion tree; the algorithm's complexity is the tree's aggregate cost. This is the schema-level reason that "thinking recursively" and "thinking in trees" are the same skill.

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Tree type | Key invariant exploited |
|--------|----------|-----------|-------------------------|
| Databases | B+ tree index | B-tree of order 200–1000 | All leaves same depth; range scans via leaf chain |
| Frontend | DOM | Recursive node tree with parent pointers | Scoped event capture/bubble; CSS selector matching |
| Compilers | Parse tree / AST | Recursive grammar-driven tree | In-order traversal = inorder expression evaluation; post-order = code generation |
| Cryptography | Merkle tree (git, Bitcoin, IPFS) | Binary hash tree | $O(\log n)$ inclusion proofs; root hash commits to entire tree |
| Graphics | Quadtree / octree | Spatial subdivision tree | $O(\log n)$ point location; adaptive resolution |
| Game engines | Scene graph | DAG-of-trees (transforms inherited) | Hierarchical transform composition; culling by subtree |
| Compression | Huffman tree | Binary prefix-code tree | Optimality: $\sum p_i \cdot \ell_i$ is minimum for the source distribution |
| Machine learning | Decision tree / gradient-boosted trees | Recursive partition tree | Each path = a rule; leaf = prediction; impurity decreases monotonically down |
| Distributed systems | ZooKeeper / etcd znode tree | Persistent hierarchical namespace | Watches fire on subtree changes; atomic per-node operations |

A useful cross-instance observation: the choice of tree type tracks the choice of *operation profile*. B+ trees dominate databases because range scans (leaf chains) and point lookups (log-fanout height) are both fast. Tries dominate networking routing tables because longest-prefix match is $O(L)$, independent of table size. Merkle trees dominate distributed storage because they commit to *all* leaves with one hash and prove *any* leaf with $O(\log n)$ hashes. The schema is the same; the structural invariant differs to serve the dominant access pattern. When designing a tree, ask first: *what is the operation profile?* — the answer dictates the invariant.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: rooted tree, parent function, depth, balance, traversal orders.
- *Hardware*: page tables (radix tree), TLB hierarchy, GPU quad-tree for Z-culling.
- *Language/runtime*: AST in every compiler, scope chains in interpreters, prototype chains in JS.
- *Operating system*: directory trees, process trees, cgroup hierarchies.
- *Distributed system*: Spanner's directory tree, etcd znodes, DNS zones, MerkleMountainRanges in git.
- *Production practice*: call-stack flamegraphs, distributed trace trees (parent/child spans), exception stack traces.

A diagnostic habit: when you encounter a new system, ask "where is the tree?" Almost every system has at least one — usually more. The tree that is *implicit* (call stack, exception chain, request context) is often the one that determines the system's behavior under failure.

## 3. Contrastive cases

### 3.1 DAGs (allow shared children)

The critical difference: a DAG node can have multiple parents, a tree node cannot. This sounds minor but is enormous. SSA form, git commit DAGs, spreadsheets, and Bayesian networks are DAGs, not trees — collapsing them to trees duplicates shared substructures exponentially. The classic mistake: using memoized recursion and assuming the call graph is a tree; it is a DAG, and the memo table is what prevents exponential blowup.

### 3.2 Tries (keys on edges, not nodes)

A trie stores keys on the *edges* (one symbol per edge), not in the nodes. The "key" at any node is the concatenation of edge labels from root to that node. This gives $O(L)$ lookup where $L$ is the key length, *independent of the number of stored keys*. Contrast with a BST: $O(h)$ lookup, where $h$ depends on $n$. The schema is "tree," but the *content* lives on edges — collapsing the trie into a "regular" tree of keys loses the structure-matching property.

### 3.3 Forests (multiple roots)

A forest is a disjoint union of trees. Many systems are forests but are mistakenly modeled as single trees by introducing a synthetic root. The synthetic root works but obscures cases where operations are local to one tree (e.g., git branches, process trees). Modern process supervisors (systemd, supervisord) and modern frontends (multi-root React fragments) explicitly model forests.

### 3.4 Rose trees vs binary trees vs k-ary trees

A rose tree allows each node to have a list of children of arbitrary length; a binary tree forces exactly 0 or 2 children (or 0/1/2); a k-ary tree fixes $k$. The schema is the same, but the *encoding* differs: a rose tree is the natural shape of an AST, a binary tree is forced by BST balancing algorithms, and a k-ary tree is forced by B-trees. Choosing the wrong arity distorts the algorithms.

### 3.5 Linked-list trees vs array-backed trees

A binary heap is a *complete* binary tree, so it can be represented as an array where the children of index $i$ are at $2i+1$ and $2i+2$. This representation gives cache locality, no pointer overhead, and $O(1)$ parent access. The contrast: a pointer-based BST loses locality but supports arbitrary shape. The choice of representation is independent of the tree *schema* but determines the *performance* — a textbook example of S6 (Memory & Locality) interacting with S3.

### 3.6 Persistent vs ephemeral trees

A *persistent* tree preserves old versions after updates (immutable, structural sharing via path-copying). An *ephemeral* tree mutates in place. Functional languages (Haskell, Clojure) default to persistent; imperative languages default to ephemeral. The schema is the same; the engineering differs drastically: persistent trees enable lock-free reads, time-travel queries (git history!), and STM, at the cost of $O(\log n)$ allocation per update. The contrast matters because porting an ephemeral-tree algorithm to a concurrent setting by "just adding locks" is often worse than porting to a persistent tree.

### 3.7 Self-balancing vs externally-balanced trees

AVL, red-black, and B-trees maintain balance through *structural rules* enforced on every update. Treaps and skip lists maintain balance through *randomization* — there is no invariant per node, only an expected-depth guarantee over the random choices. Splay trees maintain balance *amortized* over a sequence of operations, with no per-operation guarantee. The schema-level point: balance is a *contract*, not a *structure*. The contract determines the algorithmic toolkit (deterministic worst-case, randomized expected, amortized), and choosing the wrong contract can either leave performance on the table (using AVL when treaps would suffice) or invite adversarial DoS (using unbalanced BSTs when attackers control inputs).

### 3.8 Static vs dynamic trees

A *static* tree is built once and never mutated (Merkle trees, suffix arrays, RSS-trees for spatial data); a *dynamic* one supports inserts, deletes, and updates. The contrast matters because static trees admit dramatically tighter optimization: perfect balance, packed array layouts, cache-oblivious traversal, and even SIMD-accelerated search. Dynamic trees pay for the flexibility with structural metadata (parent pointers, balance bits, color flags). The schema-level move: when you can build a tree once and query it many times, do — the constant-factor speedup from static optimization is often 5–10×, enough to change the algorithmic choice entirely.

### 3.9 Balanced vs unbalanced (deliberate)

Some trees are deliberately unbalanced. A *ropes* data structure (used by editors for large text buffers) is unbalanced because rebalancing on every edit would cost more than the O(log n) worst case it prevents. A *splay tree* is unbalanced between operations but amortizes the cost. A *B-tree with append-only writes* (LSM-tree) is deliberately unbalanced in shape because the workload is monotonic and the amortized cost of merging dominates the cost of seeking. The schema-level insight: balance is not an end in itself; it is a means to a worst-case bound that some workloads do not need. Choosing to skip balance is as much a schema-level decision as choosing which kind of balance to enforce.

## 4. Implementation

**Build a B+ tree from scratch.** Target: ~400 lines.

Specifications:
- Order $m = 64$ (each internal node has 32 to 64 children; each leaf holds 32 to 64 key-value pairs).
- Operations: `insert(key, value)`, `get(key)`, `range(low, high)` returning an iterator.
- Splits and merges on overflow / underflow with proper key rotation through parent nodes.
- Leaves linked in a singly-linked list for range scans.
- Persist to a 4 KiB-page file. Each node = one page. Use `mmap` or `pread/pwrite`.

Test cases:
- Insert 10,000 random integer keys. Verify in-order traversal yields a sorted sequence.
- Range queries: `range(500, 600)` returns the correct 100 values in order.
- Stress test: insert 100k keys, delete 50k random keys, then verify the remaining 50k are correct and the tree has no underflowing nodes (every node except root has $\geq \lceil m/2 \rceil - 1$ keys).
- Concurrency smoke test: two threads inserting disjoint key ranges should not corrupt the tree (you do not need full locking, just demonstrate the issue).

**Difficulty**: hard. **Sub-skills tested**: recursive node manipulation, parent-pointer bookkeeping during splits, the subtle "borrow from sibling before merge" optimization, page-based I/O, and the discipline to test invariants (not just outcomes) — every test should assert the B-tree invariants explicitly.

**Extension ladder**:
1. Add prefix compression in leaves (store only the differing suffix of each key). This is what SQLite and PostgreSQL actually do; it roughly doubles effective fanout.
2. Add a write-ahead log (WAL) for crash recovery. Now you have a toy database. The tree schema is unchanged; you have added S7 Concurrency & Coordination concerns.
3. Add optimistic concurrency control with MVCC across snapshots. Now multiple readers see consistent snapshots even as a writer mutates the tree. This is the structural heart of every modern database engine.

The bugs you will hit: (a) forgetting to update the parent's separator key after a leaf split; (b) cascading merges that propagate up but stop one level too early; (c) `mmap` aliasing bugs where you mutate a page through one pointer and read it through another. Each of these is an invariant violation that a good test suite catches.

**Why this exercise matters**. The B+ tree is the single most-deployed data structure in production computing — every relational database index, every filesystem directory, every key-value store's secondary index is a B+ tree or a close cousin (LSM, fractal tree). By building one from scratch you build mental infrastructure that transfers to PostgreSQL internals, InnoDB, SQLite, LevelDB/RocksDB, and the index layer of every NoSQL store. The schema-level insight that transfers: *every persistent ordered map is a tree whose shape is dictated by the I/O unit (page size)*. Once you internalize this, you can read any storage engine's documentation in minutes.

## 5. Failure analysis

1. **Unbalanced trees (O(n) degradation).** Inserting sorted keys into a naive BST produces a linked list — every operation degrades from $O(\log n)$ to $O(n)$. This is the classic "libc qsort worst-case" attack vector (read URLs that hash to a chain to DoS a service). Mitigation: self-balancing trees (AVL, red-black, treap), or randomization (randomized BST, skip list).

2. **Concurrent mutation races.** Two writers racing on a BST can lose updates or corrupt structure (the classic "lost update" on rotation). Mitigation: coarse lock (simple, slow), hand-over-hand locking (fine-grained, complex), or copy-on-write (B-trees in LMDB, ZFS, Couchstore). The choice is a tradeoff between read concurrency, write throughput, and implementation complexity.

3. **Page-split thrashing in B-trees.** Sequential inserts into a B+ tree cause 50% page occupancy (every leaf splits at 100% and ends half-full). This doubles the disk footprint. Mitigation: bulk loading (sort keys, build leaves bottom-up at 100% occupancy), or "right-only" splits during append-only workloads (used by LSM-trees).

4. **Hash collisions in Merkle trees.** Two distinct subtrees hashing to the same value breaks tamper-evidence. SHA-256 makes this infeasible today, but a system that uses a weak hash (e.g., CRC32 for "Merkle-like" dedup) is vulnerable. Mitigation: cryptographic hash, and document the assumption explicitly.

5. **Overflow in fixed-arity trees.** A quadtree with 16 levels of subdivision can hold $4^{16} = 4$ billion leaves; an octree $8^{16}$. Storing the tree explicitly exhausts memory. Mitigation: sparse representation (only store non-empty leaves), hash-based spatial indices, or linear (Morton-code) layouts.

6. **Tree depth → stack overflow.** Naive recursive traversals on pathological trees (e.g., a 1M-node deep linked-list-as-tree) blow the call stack. Mitigation: explicit-stack traversal, tail-call optimization, or transform to iterative with parent pointers.

7. **Pointer-chasing cache misses.** Each BST node pointer dereference is a likely L2/L3 miss. A pointer-based BST does $\log_2 n$ dependent memory loads per search; on a 1M-key tree that's ~20 × 100 ns = 2 µs. A cache-oblivious layout (van Emde Boas) reduces this by a constant factor. This is why B-trees beat BSTs at scale — not asymptotic, but cache.

8. **Stale parent pointers after structural changes.** Rotations in AVL/red-black trees must update parent pointers on every rotated node; missing one breaks invariants silently. The bug surfaces only under specific query patterns. Mitigation: invariant assertion after every mutating operation; property-based testing with quickcheck-style generators.

9. **Rebalancing thrash under adversarial workloads.** An adversary constructs an insert/delete sequence that triggers rotations on every operation. Red-black trees guarantee $O(1)$ rotations per operation, but the *constant* matters in hot paths. Mitigation: treaps (randomized balance, expected $O(\log n)$ but no worst-case adversary), or splay trees (amortized $O(\log n)$, but a single operation can be $O(n)$).

10. **Fanout collapse in B-trees under updates.** Repeated insert/delete cycles can drive B-tree pages to 50% occupancy, doubling the tree height and slowing every lookup. Mitigation: periodic bulk-rebuild (VACUUM in Postgres), or online page merging when occupancy drops below a threshold.

## 6. Transfer tests

#sr
- **Terminology shift**: A document object in a browser has child elements; CSS selectors like `.foo > .bar` match scoped descendants. Without using the word *tree*, identify the schema, the three traversal orders, and which order CSS specificity rules use to resolve cascade conflicts.
- **Representation shift**: You are given a flat array `P` where `P[i]` is the parent of node `i`, with `P[root] = -1`. Compute the depth of every node in $O(n)$ time. Then state why the same algorithm on an arbitrary graph fails.
- **Constraint shift**: A tree must support concurrent reads and writes. You may use either (a) a single reader-writer lock, (b) hand-over-hand locking, or (c) copy-on-write with atomic root swap. For each, state which invariant becomes harder to maintain and which workload favors it.
- **Unnamed solution**: A git repository stores commits; each commit points to its parent(s). `git merge` creates a commit with two parents. `git log` traverses history. Identify the schema, the special case git uses for fast-forward merges, and the structural reason rebasing produces a linear history.
- **Competing schemas**: A neural network's layer structure is a directed acyclic graph of tensor operations. Is this better modeled as S3 (tree) or S2 (graph)? What single feature of the network decides the answer?
- **Persistence shift**: A tree must support both reads and writes from multiple threads without locking the whole tree. Compare three implementations — copy-on-write B-tree (LMDB), MVCC B-tree (PostgreSQL), B-link tree with crabbing locking — and state which invariant each one trades off for concurrency.
- **Memory shift**: A tree must operate on a dataset 100× larger than RAM. Describe how B-trees, LSM-trees, and LSM-trees with Bloom filters each address this. Which invariant of in-RAM trees becomes *approximate* (i.e., not exact) in each approach?
- **Workload shift**: A workload is 99% point lookups and 1% range scans. Compare B+ trees, hash indexes, and LSM-trees for this workload. Identify the schema-level invariant each one optimizes for, and the workload shift that would change the ranking.
- **Schema shift**: A database stores JSON documents with nested structure. Should the index be a tree (B+ tree on a flattened key), a trie (on the path), or a graph (on the JSON tree itself)? For each, identify which query types it accelerates and which it makes harder.
- **Concurrency shift**: Two threads concurrently insert into a red-black tree. The naive lock-per-node strategy deadlocks. Describe the B-link tree solution (right-links on internal nodes, allowing concurrent search during split) and identify the schema-level invariant it preserves (logarithmic height) and the one it relaxes (transient inconsistency during a split).
- **Verification shift**: A colleague claims their hand-rolled red-black tree is correct. Describe a property-based test that (a) generates random insert/delete sequences, (b) verifies the red-black invariants after every operation, (c) verifies BST ordering. State why testing only outcomes (does the value exist?) misses invariant violations that will surface later.
- **Serialization shift**: A tree must be persisted to disk and reconstructed on a different machine. Compare three serialization formats (pointer-based dump, pre-order traversal with structural markers, level-order array) on size, reconstruction cost, and ability to support incremental updates.

## 7. Delayed retrieval

#sr
- **Recall**: Give the four equivalent definitions of a tree. State one operation each definition makes easy.
- **Explanation**: Why does a complete binary tree admit an array representation? What is the formula for the parent, left child, and right child of index $i$?
- **Derivation**: Derive the height bound $h \leq 1.44 \log_2(n+2) - 0.328$ for an AVL tree from the recurrence $N_h = N_{h-1} + N_{h-2} + 1$.
- **Implementation**: Implement `range(low, high)` for a B+ tree. Describe how the leaf-link traversal handles the case where the iterator is invalidated by a concurrent insert.
- **Diagnosis**: A database index degrades from $O(\log n)$ to $O(n)$ lookup after a bulk load of sorted data. Identify the schema, the specific invariant that was violated, and the two-line fix.
- **Transfer**: You move from B-trees to LSM-trees. Predict three structural invariants that *carry over* and three that *break*. Justify via the tree schema, not the database literature.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — the "every fast data structure is a tree" pattern.
- **Related schemas**: [[02_Schemas/S2 — Graph & Reachability|S2 Graph & Reachability]] (parent schema: trees are connected acyclic graphs), [[02_Schemas/S6 — Memory & Locality|S6 Memory & Locality]] (cache behavior is why B-trees beat BSTs at scale), [[02_Schemas/S10 — Search & Inference|S10 Search & Inference]] (tree search underpins branch-and-bound, A*, game-tree search).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing a B+ tree to a Merkle tree to a quadtree reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
