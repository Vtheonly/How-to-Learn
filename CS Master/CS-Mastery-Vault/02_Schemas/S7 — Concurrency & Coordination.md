---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S7 — Concurrency & Coordination

> **Concurrency** is the structure that arises whenever a system has multiple threads of execution sharing resources, and the engineering question is always how to preserve **invariants** (safety: bad things don't happen) and **progress** (liveness: good things eventually happen) in the face of interleavings that the programmer cannot predict, using **coordination primitives** (locks, atomics, messages) that impose a **happens-before** order on events.

---

## 1. Formal core

Let $E$ be the set of events in an execution. Each event is an action by some thread $t$: a read, a write, a synchronization operation. An execution is a sequence of events from multiple threads, interleaved by the scheduler. The set of all legal interleavings is enormous; the programmer's task is to ensure that *every* legal interleaving satisfies the desired invariants.

**Concurrency vs parallelism.** *Concurrency* is a structural property — multiple threads of execution exist and may make progress. *Parallelism* is an execution property — multiple threads run simultaneously on different cores. Concurrency without parallelism (a single-core machine running multiple threads) is still concurrency; the interleavings happen via time-slicing. Parallelism without concurrency (SIMD vectorization) is just batch computation. The two are orthogonal: you can have either without the other, but in practice they co-occur and compound each other's difficulty.

**The happens-before relation** ($\rightarrow$), due to Lamport, is a partial order on events. The rules:

- **Program order**: within a single thread, event $a$ precedes event $b$ if $a$ occurs before $b$ in the source code ($a \rightarrow b$).
- **Synchronization**: if $a$ is a release on a lock / atomic / channel and $b$ is the matching acquire, then $a \rightarrow b$.
- **Transitivity**: $a \rightarrow b$ and $b \rightarrow c$ implies $a \rightarrow c$.

Two events $a, b$ are **concurrent** if neither $a \rightarrow b$ nor $b \rightarrow a$. Concurrent writes to the same location are a **data race** — undefined behavior in every memory model. The programmer's job is to use synchronization to ensure that any two accesses to the same shared location are ordered by $\rightarrow$.

**Safety and liveness** are the two classes of invariant:

- **Safety**: "bad things don't happen." Mutual exclusion (two threads never in the critical section simultaneously), atomicity (a transaction's effects appear all-or-nothing), consistency (invariants of the data structure hold at observed states).
- **Liveness**: "good things eventually happen." Progress (some thread makes progress), starvation-freedom (every thread that wants to enter the critical section eventually does), wait-freedom (every thread completes in bounded steps regardless of other threads' actions).

Every concurrency bug is either a safety violation (race, atomicity violation, deadlock — wait, deadlock is both) or a liveness violation (deadlock, livelock, starvation, priority inversion). The dichotomy is the first diagnostic question: *which class is this bug?*

**Mutual exclusion** is the simplest safety property: at most one thread in the critical section at a time. Lamport's Bakery algorithm achieves it with only reads and writes (no hardware atomics), but real systems use hardware support: `XCHG`, `LOCK CMPXCHG` (x86), `LDXR/STXR` (ARM). **Atomicity** extends mutual exclusion: a sequence of operations appears as a single indivisible action to other threads. **Ordering** is the third axis: even with atomicity, threads may observe operations in different orders unless the memory model enforces otherwise.

**Memory models** specify which orderings a CPU (or language) guarantees. The hierarchy, from strongest to weakest:

| Model | Guarantee | Cost | Example |
|-------|-----------|------|---------|
| Sequential consistency (SC) | All threads agree on a single total order of all operations, consistent with program order | High (every op is a full barrier) | Early MIPS, textbook algorithms |
| Release/acquire | A release on one thread synchronizes with an acquire on another; reads-after-acquire see writes-before-release | Medium | C++ `memory_order_acquire/release`, Java `volatile` |
| Release/consume | Like release/acquire but only for data dependent on the released value | Deprecated in practice | C++ `memory_order_consume` |
| Relaxed | No ordering guarantees beyond atomicity of the single op; other threads may see writes in any order | Lowest | C++ `memory_order_relaxed`, Java `VarHandle` weak ops |

Sequential consistency is what programmers intuit; relaxed is what hardware provides cheaply. The gap is the source of most memory-ordering bugs. Modern languages expose the spectrum so the programmer can pay for ordering only where needed.

**Consensus** is the distributed analogue: $N$ processes must agree on a single value. The **FLP impossibility result** (Fischer, Lynch, Paterson, 1985) proves that no asynchronous protocol can solve consensus if even one process may fail — there is always an execution that the protocol cannot terminate. The workaround is to weaken one of the assumptions: synchrony (Paxos, Raft assume partial synchrony), failure model (crash-stop vs Byzantine), or termination (probabilistic consensus). Paxos and Raft circumvent FLP by assuming *eventual* synchrony: the system is asynchronous most of the time but synchronizes long enough for consensus to complete.

**Progress guarantees** form a hierarchy:

- **Blocking**: a thread can prevent others from making progress (e.g., holding a lock and being swapped out). Locks are blocking.
- **Obstruction-free**: a thread makes progress if it executes in isolation (no other threads interfere for long enough).
- **Lock-free**: at least one thread makes progress in a bounded number of steps (the system as a whole progresses, but individual threads may starve).
- **Wait-free**: every thread makes progress in a bounded number of steps (no starvation).

Lock-free and wait-free algorithms use `CAS` (compare-and-swap) loops; they avoid deadlock and (for wait-free) starvation, at the cost of more complex reasoning and higher constant factors. The choice is rarely "lock-free is better"; it is "this workload cannot tolerate blocking, so we pay the cost."

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Coordination primitive | Memory model | Progress |
|--------|----------|------------------------|--------------|----------|
| Java language | `synchronized`, `volatile`, `Lock`, `Atomic*` | Monitors, atomics | Happens-before (JMM) | Blocking / lock-free |
| C++ | `std::atomic`, `std::mutex`, `std::thread` | Atomics, futex-backed mutex | SC / release-acquire / relaxed | Blocking / lock-free |
| Python | `threading.Lock`, `multiprocessing.Queue` | GIL + monitors | GIL serializes Python ops | Effectively serial (GIL) |
| Go | Channels, `sync.Mutex`, `sync/atomic` | CSP channels | Happens-before on channel ops | Blocking / goroutine-sched |
| Rust | `std::sync::{Mutex, Arc}`, `std::sync::atomic` | Ownership + Send/Sync | C++-style (LLVM) | Blocking / lock-free |
| OS | `futex`, `pthread_mutex`, `pthread_cond` | Kernel-assisted locks | Per-arch (TSO on x86) | Blocking |
| Database | 2PL, MVCC, OCC | Locks, timestamps, version numbers | Serializable / SI / RC | Blocking / abort-retry |
| Distributed consensus | Paxos, Raft, Zab, Viewstamped | Quorum + leader | Linearizability | Eventual under partial synchrony |
| Messaging | Kafka consumer groups, RabbitMQ | Offset commit, acks | Per-partition FIFO | At-least-once / exactly-once |
| Async runtime | JS `async/await`, Rust `tokio`, Python `asyncio` | Event loop, `Promise`, futures | Cooperative scheduling (no preemption) | Non-blocking |
| GPU | CUDA warps, cooperative groups | Barriers, atomics, `__syncthreads` | Relaxed within warp | SIMT lockstep |

Across every instance, the same five design questions recur: (a) what is the unit of concurrency (thread, goroutine, actor, transaction), (b) how do threads coordinate (shared memory, message passing, transactions), (c) what is the memory model / consistency guarantee, (d) what are the progress guarantees, and (e) how are failures handled (crash, timeout, partition).

A cross-instance pattern worth internalizing: **every coordination mechanism is, at bottom, a way of constructing a happens-before relation.** Locks: the unlock happens-before the next lock. Channels: the send happens-before the receive. Atomics: a release-store happens-before an acquire-load that reads the stored value. Database transactions: the commit happens-before any subsequent read that observes it. Paxos: a chosen value happens-before any learner that reads it. The schema is invariant; the surface syntax (`synchronized`, `chan <-`, `RAFT.AppendEntries`, `COMMIT`) varies.

A second pattern: **shared memory and message passing are dual.** You can implement message passing over shared memory (a synchronized queue) and shared memory over message passing (a single-writer server that responds to read/write requests — the actor model). The choice is a design decision driven by locality of reasoning: shared memory makes the state explicit and the coordination implicit; message passing makes the coordination explicit (the message) and the state encapsulated. CSP (Go), the actor model (Erlang, Akka), and Communicating Sequential Processes formalize the message-passing side; monitors, mutexes, and condition variables formalize the shared-memory side.

A third pattern worth internalizing: **every concurrency bug is a happens-before edge that should exist but doesn't.** A data race is a missing edge between two accesses to the same location. A deadlock is a set of edges that form a cycle when the wait-for graph is built. A lost wakeup is a missing edge between the signal and the wait. A memory-ordering bug is an edge that exists in the programmer's mental model but not in the memory model the hardware guarantees. The diagnostic discipline that follows: for any concurrency bug, draw the happens-before graph, identify the missing or wrongly-ordered edge, and add synchronization (a lock, an atomic with the right ordering, a channel send/receive pair) to create it. This is the schema-level skill that turns "concurrency is hard" into "concurrency is mechanical once you can draw the graph."

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: happens-before partial order, safety/liveness invariants, the FLP result, progress hierarchies.
- *Hardware*: cache coherence protocols (MESI, MOESI), memory barriers, `LOCK`-prefixed instructions, atomic load-link/store-conditional.
- *Language runtime*: monitors (Java `synchronized`), atomics with memory ordering (C++ `std::atomic`), channels (Go), async tasks (Rust `tokio`).
- *Operating system*: futexes, condition variables, `clone(2)` with `CLONE_THREAD`, scheduling classes.
- *Database*: 2PL, MVCC, OCC, serializable snapshot isolation (SSI), two-phase commit.
- *Distributed system*: Paxos, Raft, Zab, CRDTs, distributed locks (Redlock and its critics), service mesh coordination.

The transfer exercise that builds the schema: take one canonical coordination problem (mutual exclusion around a shared counter) and solve it at each layer — as a hardware `LOCK INC`, as a C++ `atomic` with `memory_order_relaxed`, as a Go channel that serializes increments, as a Postgres `SELECT FOR UPDATE`, as a Raft log entry. The invariants that survive all layers (mutual exclusion, progress under contention, well-defined failure semantics) are the schema. The invariants that break (cost, the unit of failure, the availability under partition) are the layer-specific concerns.

## 3. Contrastive cases

### 3.1 Shared memory vs message passing

**Shared memory** exposes mutable state to all threads; coordination is via locks and atomics. Pro: low latency (no copy), direct access. Con: races are easy; compositional reasoning is hard (any function may touch any shared state). **Message passing** (channels, actors) encapsulates state; coordination is via messages. Pro: race-freedom by construction (each piece of state has one owner), compositional. Con: overhead (serialization, copy), deadlock is still possible (cyclic waits on channels). The two are dual — Go's channels are implemented over shared memory; a shared-memory server can be modeled as an actor. The bug: treating them as opposites rather than duals leads to "channels are always safe" (no — channel deadlocks) or "shared memory is always faster" (no — cache coherence traffic can dominate).

### 3.2 Optimistic (OCC) vs pessimistic (2PL)

**Pessimistic** concurrency (2PL: two-phase locking) acquires all locks up front, holds them through the transaction, releases at commit. Pro: no conflicts at commit, no rollback. Con: lock contention, deadlocks, low concurrency under hot data. **Optimistic** concurrency (OCC: optimistic concurrency control) reads and writes without locking; at commit, validates that no concurrent transaction committed conflicting writes; if so, aborts and retries. Pro: high concurrency under low contention, no deadlocks. Con: wasted work on aborts under high contention. MVCC (multi-version concurrency control) is a third option: each transaction sees a consistent snapshot; writes create new versions; no read locks. Postgres, Oracle, MySQL-InnoDB all use MVCC. The choice tracks the contention profile: low contention favors OCC/MVCC; high contention favors 2PL (or partitioning to reduce contention).

### 3.3 Lock-free vs wait-free

**Lock-free** guarantees that *some* thread makes progress; individual threads may retry indefinitely (a CAS loop where another thread always wins). **Wait-free** guarantees that *every* thread makes progress in bounded steps. Wait-free is strictly stronger but harder to implement and slower (more coordination). Most "lock-free" data structures in production (Treiber stack, Michael-Scott queue) are lock-free, not wait-free — the wait-free variants exist (e.g., the wait-free Michael-Scott queue) but are rarely worth the complexity. The bug: assuming lock-free means no starvation — it doesn't.

### 3.4 Synchronous vs asynchronous

**Synchronous** calls block the caller until the callee responds. **Asynchronous** calls return immediately and deliver the result later (callback, future, channel). The schema is the same; the resource model differs. Synchronous: one OS thread per concurrent operation (expensive at 10k+ concurrency). Asynchronous: one thread per core, multiplexing thousands of operations via an event loop (epoll, io_uring, kqueue). The bug: confusing *concurrency* (lots of in-flight operations) with *parallelism* (lots of cores busy). An async runtime with 10k concurrent tasks on 4 cores has 10k concurrency, 4 parallelism — and the bottleneck may be either.

### 3.5 Cooperative vs preemptive scheduling

**Preemptive** (OS threads): the scheduler can interrupt a thread at (almost) any point. Pro: no thread can starve others by monopolizing the CPU. Con: races at every preemption point; need locks everywhere. **Cooperative** (async/await, goroutines pre-1.14): a thread runs until it explicitly yields (`await`, channel op). Pro: races are confined to yield points; reasoning is simpler. Con: a thread that doesn't yield blocks the whole runtime (the "one bad goroutine" problem). Modern Go uses preemptive scheduling at async-signal-safe points; older Go and most async runtimes (Node, Python asyncio) are cooperative.

### 3.6 Strong vs eventual consistency

**Strong consistency** (linearizability): every operation appears to take effect atomically at some instant between its invocation and response. All observers agree on the order. Pro: easy to reason about. Con: low availability under partitions (CAP theorem). **Eventual consistency**: in the absence of new updates, all replicas eventually converge. Pro: high availability. Con: readers may see stale data; conflict resolution is hard. The choice is rarely binary — modern systems offer tunable consistency (R + W > N for strong; R + W ≤ N for eventual; read-your-writes, monotonic-reads as middle grounds).

### 3.7 2PL vs MVCC for database transactions

**2PL** (two-phase locking): acquire all locks in the growing phase, release all in the shrinking phase. Produces serializable schedules. Concurrency is limited by lock contention; deadlocks require detection (cycle in wait-for graph — S2) or prevention (timestamp ordering). **MVCC** (multi-version): readers see a snapshot at their start timestamp; writers create new versions; no read locks. Concurrency is high (readers don't block writers, writers don't block readers). Snapshot isolation (the default in Postgres, Oracle) prevents some but not all anomalies (write skew); serializable SI adds SSI (serializable snapshot isolation) via dependency tracking. The bug: assuming "snapshot isolation" means "serializable" — it doesn't; write skew is a real bug class.

## 4. Implementation

**Build a lock-free single-producer single-consumer (SPSC) ring buffer, then extend to multi-producer.** Target: ~150 lines total.

Use C++ (with `std::atomic`) or Rust (with `std::sync::atomic`). The SPSC version demonstrates memory ordering; the MPMC version demonstrates CAS.

SPSC ring buffer:
- A fixed-size array of size $2^k$ (power of two for cheap modulo).
- `head` index (written by consumer), `tail` index (written by producer), both `atomic<size_t>`.
- `push(v)`: producer reads `tail`, computes `next = tail + 1`. If `next == head.load(acquire)` the buffer is full — return false (or spin / block in a wrapper). Otherwise write `buffer[tail & mask] = v`, then `tail.store(next, release)`.
- `pop()`: consumer reads `head`. If `head == tail.load(acquire)` the buffer is empty — return None. Otherwise read `v = buffer[head & mask]`, then `head.store(head + 1, release)`. Return `v`.
- The `acquire`/`release` pairing is the happens-before edge: producer's write to `buffer[tail]` happens-before `tail.store(release)`, which happens-before consumer's `tail.load(acquire)`, which happens-before consumer's read of `buffer[tail]`. Without these orderings, the consumer might see the new `tail` but the old (uninitialized) buffer slot.

MPMC extension (use the Dmitry Vyukov design):
- Each slot has an additional `atomic<size_t> sequence` whose value tracks the slot's lifecycle: initially `sequence[i] = i`. A producer claims slot $i$ by `CAS(sequence[i], expected = tail, desired = tail + 1)`; on success, writes the value, then `sequence[i].store(tail + 1, release)`. The consumer reads slot $i$ only when `sequence[i].load(acquire) == head + 1`, then advances `sequence[i]` to `head + capacity` to mark the slot free for the next lap.
- The per-slot sequence number solves the ABA problem (see §5.8) by giving each "lap" of the ring a distinct sequence.

Test cases:
- SPSC: producer thread pushes 10M integers; consumer thread pops them; verify all 10M arrive in order, no losses.
- SPSC: producer at 10M ops/sec, consumer at 1M ops/sec; verify the producer backpressures (returns false on full) and the consumer sees 1M of the items (the rest dropped or queued depending on policy).
- MPMC: 4 producer threads each push 2.5M integers; 4 consumer threads each pop until the total reaches 10M; verify the multiset of popped values matches the multiset of pushed values (order is not preserved across producers, but per-producer order may be).
- Stress: run all tests for 60 seconds; verify no use-after-free, no double-pop, no crash.
- Memory ordering: deliberately weaken `acquire` to `relaxed` on the consumer's `tail` load; verify (under stress) that the consumer occasionally reads uninitialized memory — this is the bug the ordering prevents.

**Difficulty**: hard. **Sub-skills tested**: ring buffer design, `acquire`/`release` pairing, ABA avoidance via sequence numbers, CAS loop design, stress testing under concurrency. The bugs you will hit: (a) using `relaxed` where `acquire`/`release` is needed — intermittent garbage reads; (b) the producer's `tail` and the consumer's `head` both at index 0 with a full buffer is indistinguishable from empty — use `size = capacity - 1` or a sequence-counted index; (c) the MPMC CAS loop spins forever if the slot is contended — add a backoff.

**Extension ladder**:
1. Add `try_push` / `try_pop` with timeout (bounded spin). Verify the timeout doesn't add measurable latency under no contention.
2. Replace the MPMC Vyukov queue with a **Michael-Scott queue** (linked list with CAS). Compare throughput on 4-producer/4-consumer. The ring buffer should win at low contention; the MS queue wins at high contention (no fixed capacity).
3. Add a **wait-free** `pop` (every consumer completes in bounded steps). This requires a helping mechanism where a stalled consumer is helped by the next one. Compare the constant-factor overhead against the lock-free version.
4. Wrap the ring buffer in a Go-channel-like interface with `select` semantics. The schema is invariant; the API ergonomics explode.

## 5. Failure analysis

1. **Race conditions.** Two threads read-modify-write a shared variable without synchronization; one's write is lost. Diagnosis: intermittent wrong results under stress; **ThreadSanitizer** reports the race. The classic case: `counter++` (read, increment, write — three steps, not atomic). Mitigation: `atomic` with `fetch_add`, or a lock around the critical section. The deep fix: make the race impossible to express (Rust's `Send`/`Sync` + ownership; Erlang's no-shared-state).

2. **Deadlocks (circular wait).** Thread A holds lock 1, waits for lock 2; thread B holds lock 2, waits for lock 1. Neither makes progress. One of the four Coffman conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Breaking any one prevents deadlock; the easiest is to **break circular wait** by imposing a global lock order. Diagnosis: `pstack` / `gdb` shows threads blocked on mutexes; the wait-for graph has a cycle (S2). Mitigation: lock ordering, lock timeouts (with retry), or deadlock detection via wait-for graph cycle detection.

3. **Livelocks.** Two threads detect a conflict, both back off, both retry, both detect the conflict again, indefinitely. They are not blocked (no deadlock) but no progress is made. The classic case: Ethernet collision-detect with synchronous backoff. Mitigation: **randomized** backoff (Ethernet's exponential backoff with random jitter); without randomness, livelock is nearly inevitable.

4. **Priority inversion.** A low-priority thread holds a lock that a high-priority thread needs; a medium-priority thread preempts the low-priority thread, so the high-priority thread waits for the medium-priority thread. The Mars Pathfinder reset (1997) was this bug. Mitigation: **priority inheritance** (the low-priority thread inherits the high-priority thread's priority until it releases the lock), or **priority ceiling** (each lock has a ceiling; a thread holding it runs at the ceiling).

5. **Lost wakeups.** Thread A checks a condition (false), prepares to wait on a condition variable; thread B sets the condition and signals the CV; thread A's wait call happens *after* the signal — the signal is lost; thread A blocks forever. Diagnosis: thread stuck in `pthread_cond_wait` forever. Mitigation: always hold the mutex while checking the condition and while signaling; the mutex makes the check-and-wait atomic with the set-and-signal. This is the canonical monitor pattern; forgetting it is the canonical concurrency bug.

6. **Memory ordering bugs.** Thread A writes `data = 42; ready = true;`. Thread B reads `if (ready) use(data);`. Under relaxed ordering, B may see `ready == true` but `data == 0` — the compiler or CPU reordered the writes (or B's reads). Diagnosis: intermittent "impossible" values under stress. Mitigation: `release` on the write of `ready`, `acquire` on the read; this establishes the happens-before edge that orders the `data` write before the `ready` write. **TSan does not catch memory-ordering bugs** — you need formal verification (CDSChecker, herd7) or careful reasoning.

7. **False sharing.** See S6 §5.4. Two threads write adjacent fields in the same cache line; the line bounces between cores; throughput collapses. Mitigation: align each contended field to a cache line (`alignas(64)`). This is a *concurrency* bug (the cache line is the unit of coherence) even though it manifests as a *performance* bug.

8. **ABA problem in lock-free structures.** Thread A reads `head == X` in a CAS loop; thread B pops X, pops Y, pushes X again; thread A's `CAS(head, X, Z)` succeeds (head is still X!) but the structure is corrupted (A's view was stale). The "X" passed twice is the ABA. Mitigation: **tagged pointers** (X with a version counter; each pop increments the version so the second X has a different tag), or **hazard pointers** / **epoch-based reclamation** to prevent X from being reused while A holds a reference to it.

9. **Distributed split-brain.** A network partition isolates two groups of nodes; each group elects its own leader; both accept writes; on partition heal, the writes conflict. Diagnosis: divergent logs after a partition. Mitigation: **quorum-based consensus** (Paxos, Raft) requiring majority on every write — a partitioned minority cannot make progress, so no split-brain. The cost: reduced availability under partition (CAP theorem's AP-vs-CP choice).

10. **FLP impossibility in practice.** An asynchronous consensus protocol (one without timeouts) can be driven into an execution where it never terminates — even with one failure. Real systems circumvent FLP with timeouts (assume eventual synchrony): if no leader is heard from for $T$ ms, elect a new one. The bug: timeouts too short cause spurious leader elections under load; timeouts too long cause unavailability after a real failure. There is no globally correct timeout.

11. **Thundering herd on a shared resource.** 1000 threads wake on a condition variable; one acquires the resource; 999 spin and contend. Mitigation: wake-one (`pthread_cond_signal` instead of `_broadcast`), or a fair lock that hands off the resource directly. The bug is invisible under low contention; it appears only at scale.

12. **Coarse locking vs fine-grained contention.** A single lock around a hot data structure serializes all access; throughput collapses past 1 core. The fix is finer locking (per-bucket, per-shard). The new bug: finer locks increase lock overhead (each lock op costs ~25 ns uncontended) and deadlock surface. The right granularity is workload-dependent; benchmark with 1, 2, 4, 8 cores and pick the lowest-contention design that doesn't regress at 1 core.

## 6. Transfer tests

#sr
- **Terminology shift**: A backend team reports "the service deadlocks under load." Without using the word *lock*, identify the schema, the four Coffman conditions, and the one condition you would break first (and how) to guarantee deadlock-freedom.
- **Representation shift**: You are given a Go program with `chan int` and `select`. The same program is rewritten in Java with `BlockingQueue` and `synchronized`. Identify the schema (coordination), the primitive-to-primitive mapping, and the invariant that both must preserve (happens-before).
- **Constraint shift**: Each thread runs in a separate process; shared state is in a Redis instance. Compare three coordination mechanisms (Redis `MULTI/EXEC`, Redlock, a single-owner server) on the axes of safety, liveness, and failure modes. Which invariant of in-process locking no longer holds (the lock-release-on-crash guarantee)?
- **Unnamed solution**: A team reports "our database has write skew." Identify the schema (transaction isolation), the isolation level that permits write skew (snapshot isolation), and the fix (serializable snapshot isolation via SSI, or explicit `SELECT ... FOR UPDATE`).
- **Competing schemas**: A workflow uses a distributed log (Kafka) to order events across services. Is this S7 (Concurrency) or S5 (Information Flow)? State the structural feature that decides (a log imposes a total order = coordination), and explain when the log is best modeled as each.
- **Failure shift**: A `std::atomic<int>` is read with `memory_order_relaxed` and observed to be 0 after another thread wrote 42. Identify the schema (memory model), the bug (no happens-before edge — relaxed allows the reorder), and the fix (release on the writer, acquire on the reader).
- **Scale shift**: A service must handle 1M concurrent connections with 10ms p99. Identify which concurrency model (thread-per-connection, thread pool with blocking I/O, async event loop) satisfies the constraint, and the system-level limit each model hits first (thread memory, thread context-switch cost, event-loop saturation).
- **Layer shift**: The same logical "lock" is implemented as (a) a `pthread_mutex`, (b) a Postgres `SELECT FOR UPDATE`, (c) a Redis `SETNX` with TTL. Identify which invariants of (a) survive into (b) and (c), and which new failure modes each layer introduces (deadlock detection, lock leakage on crash, split-brain on network partition).

## 7. Delayed retrieval

#sr
- **Recall**: State the four Coffman conditions for deadlock. State the happens-before rules (program order, synchronization, transitivity).
- **Explanation**: Why does `memory_order_relaxed` allow a reader to see `ready == true` but `data == 0`? Give the happens-before analysis and the fix (release/acquire).
- **Derivation**: Derive the FLP impossibility result's core argument — under asynchrony and one failure, a protocol can be driven into a bivalent state (no decided value) forever. Sketch the two lemmas (initial bivalence, bivalence preservation).
- **Implementation**: Implement a lock-free Treiber stack with `compare_exchange`. State the ABA failure mode and the two fixes (tagged pointer, hazard pointer). State the test that catches ABA (stress test with push-pop-push of the same node).
- **Diagnosis**: A multi-threaded service hangs under load. Describe the diagnostic procedure to identify whether the cause is (a) deadlock, (b) livelock, (c) lost wakeup, (d) priority inversion, or (e) lock convoy. Which tool settles each (`pstack`, CPU profile, CV inspection, scheduling trace, lock-queue depth)?
- **Transfer**: You move from a Java `synchronized` block to a Raft log replication. Predict two invariants that *carry over* (mutual exclusion — only one leader per term; happens-before — log order is total order) and two that *break* (the critical section is now asynchronous; failures are the norm, not the exception). Justify via the coordination schema.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — coordination recurs from CPU caches to distributed consensus.
- **Related schemas**: [[02_Schemas/S1 — State & Transition|S1 State & Transition]] (shared state is the resource coordinated), [[02_Schemas/S6 — Memory & Locality|S6 Memory & Locality]] (cache coherence is the hardware coordination layer), [[02_Schemas/S2 — Graph & Reachability|S2 Graph & Reachability]] (deadlock detection is cycle detection in the wait-for graph).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing a Java lock to a Postgres transaction to a Raft log reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
