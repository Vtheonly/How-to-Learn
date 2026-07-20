---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S5 — Information Flow

> A **pipeline** is the structure that arises whenever a system must transform data through a sequence of stages, each consuming the previous stage's output; the pipeline's throughput is set by its slowest stage, its latency by the sum of its stages, and the engineering question is always how to balance the two under bounded buffers and backpressure.

---

## 1. Formal core

A pipeline is a sequence of stages $P = (S_1, S_2, \dots, S_n)$ where stage $S_i$ consumes input $d_{i-1} \in D_{i-1}$ and produces output $d_i \in D_i$. The composition $S_n \circ S_{n-1} \circ \dots \circ S_1$ is the pipeline's overall transformation.

**Performance metrics**:

- **Latency** (per item): $L = \sum_{i=1}^{n} t_i$, where $t_i$ is the per-item processing time of stage $i$. This is *serial* — each item waits for every stage.
- **Throughput** (steady-state items/sec): $T = 1 / \max_i t_i$ when stages run in parallel with perfect pipelining. The slowest stage is the **bottleneck**; pipeline throughput is exactly the bottleneck's throughput.
- **Pipeline fill / drain**: with $k$-stage parallelism and $n$ items, total time $= (n + k - 1) \cdot \max_i t_i$. The $(k - 1) \cdot \max_i t_i$ term is the fill/drain overhead, amortized for large $n$.

**Buffering and backpressure**:

Each inter-stage buffer $B_i$ has bounded capacity $c_i$. When $B_i$ is full, $S_{i-1}$ must **block** (synchronous backpressure) or **drop** (lossy backpressure). The decision propagates upstream: if $S_n$ is slow, $B_{n-1}$ fills, $S_{n-1}$ blocks, $B_{n-2}$ fills, etc. — backpressure is a *propagation* phenomenon, not a point decision.

**Liveness invariants**:
- **No deadlock**: at least one stage must be able to make progress in every reachable state.
- **No starvation**: every stage that has work must eventually run.
- **Ordering**: depending on the contract, items may need to arrive in FIFO order (compilers, video) or may be reordered (commutative operations like counters).

**Push vs pull**:
- **Push-based**: upstream produces, downstream consumes; backpressure flows upstream.
- **Pull-based**: downstream requests, upstream produces; "backpressure" is implicit (downstream simply doesn't pull).
- **Reactive streams** (e.g., `java.util.concurrent.Flow`, Reactive Extensions): a hybrid where downstream subscribes and requests $N$ items; upstream never pushes more than requested.

**Parallelism within the pipeline**:
- **Stage parallelism** (Kahn process network): each stage runs as a coroutine / thread; items flow through.
- **Data parallelism**: replicate each stage $k$ times; partition items across replicas. Requires a shuffling/synchronization boundary between stages.
- **Pipeline + data parallel**: the standard "map-reduce-style" hybrid (each map task is a stage replica; reduce is the next stage).

**Little's Law** is the fundamental invariant that ties throughput, latency, and buffer occupancy: $L = \lambda W$, where $L$ is the long-run average number of items in the system, $\lambda$ is the arrival rate, and $W$ is the average time an item spends in the system. Little's Law holds for *any* stable queueing system, regardless of distribution — it is a conservation law. Engineering consequences: if you measure $\lambda = 1000$ req/s and $W = 50$ ms, then $L = 50$ items are in flight at all times; your buffers must hold at least this many or you will drop. If you want to *reduce* $W$ without changing $\lambda$, you must increase the bottleneck stage's throughput — there is no other lever. Little's Law is why "just add more buffer" is a doomed strategy for latency reduction: it increases $L$ but not $\lambda$, so $W$ must rise.

**Streams and pull-pushing**. Modern stream-processing frameworks (Reactive Streams, Java Flow, Kotlin Flows, async/await) converge on a *subscription* model: the downstream subscribes to the upstream and requests $N$ items; the upstream never pushes more than requested. This is "pull-pushing" — the upstream pushes, but only what the downstream has pulled permission for. The mechanism implements backpressure as an explicit credit protocol rather than implicit blocking. The schema-level point: backpressure is *always* a credit protocol at some level (TCP window, Akka credit, Kanban token), even when it appears as blocking — the blocking is implemented via a credit of 0.

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Stages | Bottleneck typically | Ordering |
|--------|----------|--------|----------------------|----------|
| Compilers | lex → parse → semantic → IR → optimize → codegen | 6 phases | Often parsing or optimization passes | Strict FIFO |
| Deep learning | Forward pass: layer 1 → layer 2 → ... → layer $L$ | $L$ layers | Often the widest layer or attention | Strict FIFO per sample |
| CPU architecture | Fetch → decode → execute → memory → writeback | 5+ stages | Memory (cache miss) | FIFO with bypass for out-of-order |
| Streaming | Kafka Streams / Flink / Spark Structured Streaming | Source → transform → window → sink | Stateful joins, shuffle stages | Per-partition FIFO |
| Data engineering | ETL: extract → validate → transform → load | 4+ stages | Network I/O for extract; DB for load | Per-record (or per-batch) FIFO |
| AI / LLM apps | RAG: retrieve → rerank → generate | 3 stages | LLM generation (slow, expensive) | Per-query FIFO; rerank may parallelize |
| OS | Unix pipes: `cmd1 \| cmd2 \| cmd3` | Arbitrary | Usually I/O on the producer or consumer | Byte-stream FIFO |
| Graphics | Render pipeline: vertex → tessellation → geometry → rasterization → fragment → blend | 6+ GPU stages | Fragment shading (usually) | Strict FIFO per draw call |
| Networking | TCP send stack: app → socket buffer → TCP → IP → driver → NIC | 5+ stages | Network bandwidth or socket buffer | Strict byte-order |

Across all of these the same five design questions recur: stage boundaries, buffer sizes, backpressure mechanism, failure semantics (drop / block / retry), and ordering guarantees.

A useful cross-instance pattern: every mature pipeline implementation converges on the same small set of primitives — bounded queues, backpressure signaling, sequence numbers for ordering, and a metrics surface that exposes per-stage depth and latency. The names change (`Channel` in Go, `Flow` in Java, `Actor` mailbox in Akka, `Stream` in Haskell, `Iterable` in Python), but the schema is invariant. Recognizing this lets you read a new framework's documentation in minutes rather than hours: find the bounded-queue primitive, find the backpressure contract, find the ordering guarantee — you have understood 80% of the framework.

A second cross-instance pattern worth internalizing: the *depth of the pipeline* tracks the *granularity of parallelism*. A 5-stage CPU pipeline extracts 5× instruction-level parallelism; a 10-stage database query plan extracts 10× operator-level parallelism; a 100-task DAG workflow extracts 100× task parallelism. Deeper pipelines trade latency (more stages = more fill time) for throughput (more in-flight work). The optimal depth is set by the ratio of stage compute time to inter-stage communication cost — when communication dominates (GPU shader pipeline), deep pipelines win; when communication is cheap (in-process coroutines), shallower pipelines suffice.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: a sequence of stage functions $S_1 \circ S_2 \circ \dots \circ S_n$; throughput, latency, Little's Law.
- *Hardware*: CPU instruction pipeline (fetch/decode/execute/memory/writeback), GPU pipeline, NIC packet pipeline.
- *Language/runtime*: function composition in Haskell, iterator chains in Python/Rust, async/await task graphs.
- *Operating system*: Unix pipes, `socketpair`-based filters, `splice` zero-copy pipelines.
- *Distributed system*: Kafka topologies, Flink job graphs, Spark stages, Lambda step functions.
- *Production practice*: per-stage metrics in Prometheus, distributed traces with span hierarchy, SLO budgets per stage.

The transfer exercise that builds the schema: take one canonical pipeline (e.g., a Unix one-liner) and rebuild it at each layer — first as in-process function composition, then as OS pipes, then as a Kafka topology. The invariants that survive all three layers (backpressure, ordering, failure semantics) are the schema. The invariants that break (latency, throughput, exactly-once) are the layer-specific concerns.

## 3. Contrastive cases

### 3.1 Branching pipelines (DAGs, not chains)

A "pipeline" that fans out (one stage produces for multiple downstream stages) or fans in (multiple upstream stages feed one downstream) is no longer a chain — it is a DAG. This is the structure of build systems (S2), MapReduce, Spark, and modern ML compilers (XLA, TVM). The pipeline schema's "slowest stage = bottleneck" rule no longer holds; the critical path through the DAG determines latency, and the width determines throughput. Treating a DAG as a chain serializes independent work and loses parallelism.

### 3.2 Streaming vs batch

A streaming pipeline processes one item at a time (or small micro-batches); a batch pipeline processes a fixed dataset. The schemas overlap — a batch job is a streaming pipeline with `B = \infty` buffer and `n = \text{dataset size}` items — but the engineering tradeoffs differ: streaming emphasizes low latency and backpressure; batch emphasizes throughput and fault tolerance (re-reading the input is cheap). Spark's evolution from batch to micro-batch structured streaming is the explicit unification.

### 3.3 Pull-based vs push-based

A push-based pipeline (producer-driven) is natural when data arrives externally (network, sensor). A pull-based pipeline (consumer-driven) is natural when the consumer knows what it wants (lazy evaluation, generator functions, SQL query execution). The contrast: push pipelines need backpressure machinery; pull pipelines are inherently backpressured (you don't pull when you can't process). The bug: mixing the two without a clear contract (e.g., a push source feeding a pull consumer through an unbounded queue) creates unbounded memory growth.

### 3.4 Synchronous vs asynchronous stages

A synchronous pipeline stage blocks until it produces output; an asynchronous stage returns a `Future` / `Promise` / callback immediately. The schema is the same; the failure modes differ. Synchronous stages are easy to reason about (sequential code) but waste threads on I/O. Asynchronous stages use resources efficiently but introduce ordering hazards (out-of-order completion, lost callbacks). Modern async/await is the syntactic unification — it *looks* synchronous but is implemented as a state machine.

### 3.5 Pipelines vs loops

A loop applies the same transformation repeatedly to a state; a pipeline applies different transformations in sequence to data. The confusion: a CPU instruction loop is a pipeline *of stages*, while the loop *itself* is iterating. The distinction is whether the structure is "data flows through stages" (pipeline) or "state evolves over time" (loop, S1). The two compose: the CPU pipeline processes one instruction per cycle, and the loop iterates instructions over time.

### 3.6 Backpressure as flow control vs backpressure as admission control

In *flow-control* backpressure (TCP, Akka streams), the downstream signals upstream to slow down, but the producer is the source of truth. In *admission-control* backpressure (load shedders, token buckets, circuit breakers), the system actively rejects or sheds work rather than queuing it. The two have different cost models: flow-control adds latency under load; admission-control adds error rate under load. Modern systems combine both — they shed load at the edge *and* backpressure within the pipeline. Mis-choosing leads to either OOM (pure flow control with unbounded queues) or user-visible failures (pure admission control with too-aggressive thresholds).

### 3.7 Fan-in vs fan-out pipelines

A *fan-out* pipeline splits one input into many parallel sub-pipelines and merges their outputs (MapReduce, scatter-gather, broadcast). A *fan-in* pipeline merges many inputs into one (reduce, join, aggregation). The two patterns have different bottlenecks: fan-out is bottlenecked by the slowest sub-pipeline (the straggler problem); fan-in is bottlenecked by the merge stage's coordination cost. Most real pipelines are mixed: a fan-out middle section (parallel map) bracketed by fan-in at the end (reduce). The schema-level fix: explicitly identify which stages are fan-out, which are fan-in, and which are pure passthrough; the optimization strategy differs for each.

### 3.8 Synchronous dataflow vs dynamic dataflow

A *synchronous dataflow* (SDF) pipeline has fixed rates: each stage consumes $k_i$ items and produces $k_{i+1}$ items per "firing" — these rates are known at design time. An SDF pipeline admits a static schedule that bounds buffer sizes and guarantees no deadlock. A *dynamic dataflow* pipeline has data-dependent rates (e.g., a decompression stage whose output size depends on the input content) and cannot be statically scheduled. The contrast matters because SDF can be verified offline (Kahn process networks), while dynamic dataflow requires runtime backpressure and may deadlock in patterns no static analysis can predict. Most real pipelines are dynamic; most engineering effort goes into making them look synchronous to the scheduler (batching, rate limiting, fixed-size chunks).

## 4. Implementation

**Build a 5-stage image processing pipeline.** Target: ~300 lines.

Stages:
1. **Decode**: read JPEG bytes from disk, decode to RGB array.
2. **Resize**: downsample to 256×256 using bilinear interpolation.
3. **Filter**: apply Gaussian blur (separable kernel).
4. **Encode**: re-encode as JPEG at quality 80.
5. **Write**: persist to an output directory.

Specifications:
- Each stage runs in its own thread (or asyncio task). Stages communicate through bounded blocking queues of capacity 8.
- Producer: a directory scanner feeds filenames into the decode stage at the rate the pipeline can accept (i.e., scanner blocks when the decode queue is full — this is backpressure).
- Consumer: the write stage's output queue is the final sink.
- Support a `--jobs N` flag that replicates the *filter* stage $N$ times (data parallelism) with round-robin distribution. Items may arrive out-of-order at the encode stage; restore order with a small reordering buffer keyed by sequence number.
- Metrics: print per-stage throughput, average end-to-end latency, and queue depths every second.

Test cases:
- 1000 small images: verify all are processed, all outputs are valid JPEGs at 256×256.
- Inject a slow filter stage (sleep 50 ms per image) and verify that the decode stage's queue fills and the scanner eventually blocks — i.e., backpressure works.
- Set `--jobs 4` and verify throughput roughly quadruples (modulo the I/O-bound decode stage).
- Inject a poison image (corrupt JPEG) and verify the pipeline's failure contract: log the error, drop that image, continue.

**Difficulty**: medium-hard. **Sub-skills tested**: bounded queue design, blocking semantics, ordering restoration under parallelism, metric collection without distorting measurements, failure isolation. The bugs you will hit: (a) deadlock when the reordering buffer is full but the expected sequence number is stuck behind a slow stage; (b) "phantom throughput" where the producer floods the input queue and metrics report high throughput that doesn't reflect end-to-end latency; (c) closure-capture bugs in the parallel filter dispatch.

**Extension ladder**:
1. After the base pipeline works, replace the per-stage threads with an event loop (epoll / io_uring / asyncio). Observe that the schema is invariant under the runtime; only the implementation changes.
2. Add a metrics stage that exposes per-stage queue depth and latency over Prometheus. Plot a heatmap of latency vs. queue depth — the correlation is the visual signature of backpressure.
3. Add a circuit breaker on the write stage: after N consecutive failures, short-circuit the whole pipeline for a cool-down period. This is the schema-level primitive that makes pipelines survive partial outages.
4. Replace the in-process queues with a Kafka topic between two of the stages. Now you have a distributed pipeline. The schema is invariant; the failure modes explode (network partitions, consumer group rebalancing, exactly-once semantics).

## 5. Failure analysis

1. **Head-of-line blocking.** A slow item at the head of a FIFO blocks every item behind it. The classic case: HTTP/1.1 over a single TCP connection; HTTP/2 multiplexing solves it at the application layer but TCP loss still HoL-blocks (HTTP/3 over QUIC fixes this with per-stream reliability). Mitigation: parallel queues, out-of-order processing with reordering, or per-stream connections.

2. **Buffer bloat.** Oversized buffers absorb bursts but add latency. The classic case: home routers with 10 MB transmit buffers — pings go from 5 ms to 500 ms under load. Mitigation: active queue management (CoDel, FQ-CoDel), bounded buffers sized to bandwidth-delay product.

3. **Pipeline stalls (branch mispredictions, data hazards).** A 20-stage CPU pipeline pays 20 cycles of penalty on a misprediction. Mitigation: branch prediction (PHT, perceptron predictors), predication, out-of-order execution to find independent work. The general principle: stalls are the cost of pipelining deep narrow stages; wider superscalar execution amortizes them.

4. **Starvation.** A fast upstream stage continuously fills the buffer; a slow consumer stage processes only the items that arrive in a "good" window; other items (e.g., low-priority traffic) never get service. Mitigation: fair queuing (deficit round-robin, WFQ), strict priority with bounded bypass, or priority inheritance.

5. **Backpressure loops.** Downstream blocks → upstream blocks → ... → root producer blocks. This is *correct* behavior, but if the root producer is, e.g., a TCP socket with a keepalive timeout, the timeout fires and the connection drops. Mitigation: explicit timeout-vs-block tradeoff; partial results; idempotent retry on restart.

6. **Ordering violations.** Parallel stages complete out of order; downstream code assumes FIFO. The bug manifests as intermittent miscomputations. Mitigation: explicit ordering barriers (sequence numbers, barrier syncs), or design downstream to be order-insensitive (commutative operations).

7. **Stage coupling through shared state.** Two stages secretly share a cache, a DB connection pool, or a global variable. The pipeline's clean abstraction leaks; backpressure analysis becomes invalid. Mitigation: explicit dependency injection, per-stage resource pools, observability of shared-resource contention.

8. **Failure propagation semantics.** When stage $S_i$ fails on item $d$, what happens? Options: drop $d$ (lossy), retry $d$ (at-least-once), halt the pipeline (exactly-once via upstream rewind), or quarantine $d$ for manual review. Each has different downstream implications. The failure: choosing one in code and documenting another in the API.

9. **Skew-induced stragglers.** In data-parallel pipelines, one partition receives 10× the data; the pipeline's effective throughput is set by the slowest partition (the "straggler"). Mitigation: dynamic repartitioning, speculative execution (Hadoop's backup tasks), or work-stealing.

10. **Backpressure hidden behind unbounded queues.** A developer wires up an unbounded `LinkedBlockingQueue` between stages to "avoid blocking"; memory grows without bound; the OOM killer eventually provides backpressure. This is the most common production failure in streaming systems. Mitigation: always bound queues; document the bound and the backpressure strategy.

11. **Metric distortion by in-flight items.** A pipeline reports "1M items/sec throughput" — but the items are stuck in a 10 GB buffer waiting for a slow stage. The throughput number reflects *enqueue rate*, not *completion rate*. Mitigation: report end-to-end latency percentiles alongside throughput; reject any pipeline design whose throughput and latency percentiles are reported from different stages.

12. **Cold-start / warm-start asymmetry.** A pipeline's first 1000 items take 10× longer because of JIT compilation, cache warming, lazy connection establishment. Throughput benchmarks that don't discard the warm-up period overstate steady-state performance by 2-5×. Mitigation: always run a warm-up batch before measurement; report both cold-start and steady-state numbers.

## 6. Transfer tests

#sr
- **Terminology shift**: A speech-to-text system does "audio chunking → VAD → ASR → punctuation → capitalization." The PM complains that "latency is too high." Without using the word *pipeline*, identify the schema, the two performance metrics in tension, and the three knobs you can adjust.
- **Representation shift**: You are given a function `process(items: Iterator[T]) -> Iterator[U]` and you must compose 5 such functions. The user wants to process 1M items with bounded memory. Identify the schema, the implementation pattern (lazy iterators / generators), and the failure mode if one stage eagerly materializes its input.
- **Constraint shift**: Each stage runs in a separate process (not thread). Items must be serialized to cross process boundaries. Compare three transport options (pipe, shared memory, unix domain socket) on the axes of latency, throughput, and failure isolation. Which invariant of the in-process pipeline no longer holds?
- **Unnamed solution**: A GPU shader pipeline processes vertices through 6 stages. A benchmark shows throughput is 40% of theoretical. Identify the schema, the likely bottleneck class (memory-bound vs compute-bound vs latency-bound), and the profiling technique that distinguishes them.
- **Competing schemas**: A workflow engine (Airflow, Temporal) executes a DAG of tasks. Is this S5 (information flow) or S2 (graph & reachability)? State the structural feature that decides, and explain when the workflow is best modeled as each.
- **Failure shift**: A stage in the pipeline fails irrecoverably on item $d$. The downstream contract is "exactly-once." Describe the three implementation strategies (transactional outbox, idempotent consumer + at-least-once delivery, distributed log with deterministic consumers) and the schema-level invariant each one preserves.
- **Scale shift**: The pipeline must process 1M items/sec with end-to-end latency under 100 ms. Identify which design choices (parallelism, batching, queue size, sync vs async) trade off against each other, and which single metric (utilization, queue depth, p99 latency) you would alert on first.
- **Layer shift**: The same logical pipeline is implemented as (a) a chain of Python generators, (b) a chain of OS pipes between processes, (c) a chain of Kafka topics between services. Identify which invariants of (a) survive into (b) and (c), and which new failure modes each layer introduces.
- **Observability shift**: A pipeline's metrics show 100% CPU at one stage and 0% at the next. Identify the schema, the bottleneck class, and the two diagnostic experiments (probe at queue boundaries; sample per-stage cycle counts) that distinguish "stage is compute-bound" from "stage is contention-bound" from "stage is waiting on downstream."

## 7. Delayed retrieval

#sr
- **Recall**: State the formula for pipeline latency and pipeline throughput. State the one-line invariant that defines backpressure.
- **Explanation**: Why is pipeline throughput equal to the slowest stage's throughput, even when other stages are much faster? Give the intuitive argument and the formal one.
- **Derivation**: Derive the total time $(n + k - 1) \cdot \max_i t_i$ to process $n$ items through a $k$-stage pipeline. Identify the fill/drain overhead and the steady-state term.
- **Implementation**: Implement a bounded blocking queue in your language of choice. State the invariant that prevents the "lost wakeup" bug, and the test that catches it.
- **Diagnosis**: A streaming job's throughput is 10× lower than the bottleneck stage's theoretical rate. Describe the diagnostic procedure to identify whether the cause is (a) buffer bloat, (b) head-of-line blocking, (c) stragglers, (d) GC pauses, or (e) network jitter. Which metric settles each?
- **Transfer**: You move from a CPU instruction pipeline to a Kafka Streams application. Predict two invariants that *carry over* and two that *break*. Justify via the pipeline schema.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — pipelines recur in every layer of the stack, from silicon to distributed systems.
- **Related schemas**: [[02_Schemas/S1 — State & Transition|S1 State & Transition]] (each stage is a state machine over its input buffer), [[02_Schemas/S6 — Memory & Locality|S6 Memory & Locality]] (buffers between stages are caches; locality determines throughput), [[02_Schemas/S7 — Concurrency & Coordination|S7 Concurrency & Coordination]] (parallel stages coordinate through bounded queues).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing a CPU pipeline to a Kafka pipeline to a compiler pipeline reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
