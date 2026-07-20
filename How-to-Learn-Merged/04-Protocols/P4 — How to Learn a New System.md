---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P4 — How to Learn a New System

> A system like Postgres, Kubernetes, or Kafka is too complex to read top to bottom — you learn it by reading the architecture overview, mapping it onto schemas you already know, running the simplest example, tracing one operation end-to-end, reading the canonical paper, reading one core module, reimplementing a minimal version, and then breaking it intentionally to learn its failure modes.

**When to use:** Onboarding to any complex production system: databases, orchestrators, message brokers, stream processors, storage engines, distributed filesystems. Also when preparing to operate a system in production (the failure-mode step is the operations on-ramp).
**Inputs:** System docs, the canonical paper (if any), 2-4 weeks.
**Outputs:** An architecture diagram, schema dossier updates, a minimal reimplementation (50-500 LOC), and a failure-mode catalog.
**Time:** 2-4 weeks at ~5 hours/week; the first week is the highest leverage.

---

## Steps

### Step 1 — Read the official architecture overview (1-2 hours)

Find the system's official architecture documentation — not the marketing page, not the "getting started" tutorial. Look for a section titled "Architecture," "Design," "Internals," or "Concepts." Read it cover to cover. Take notes on:

- The **components** and their responsibilities.
- The **data flow**: how a request moves through the components.
- The **control flow**: how components coordinate (synchronous? asynchronous? consensus? leader election?).
- The **state model**: what state each component holds, what state is shared.
- The **failure model**: what failures the system handles and how.

Concrete example — Postgres architecture overview: components are the postmaster (process supervisor), backend processes (one per connection), shared buffer pool, WAL buffer, background writer, WAL writer, checkpointer, autovacuum launcher/workers, stats collector. Data flow: client connects via postmaster → postmaster forks a backend → backend parses, plans, executes the query → reads from shared buffer pool (or disk) → writes to WAL buffer → WAL writer flushes WAL → background writer flushes dirty buffers → checkpointer periodically checkpoints. Control flow: process-per-connection (no shared thread pool), shared memory for buffer pool and locks. State model: shared buffer pool is the hot state; WAL is the durability log; catalog tables hold schema. Failure model: crash recovery replays WAL from the last checkpoint; MVCC handles concurrent transactions; two-phase commit handles distributed transactions.

This step is the territory map — see [[03_Methods/M10 — Strategic Triage|M10]] and [[01_Theory/T2 — Cognitive Load Theory|T2]]. Without it, every detail of the system is unmoored.

### Step 2 — Identify the schemas the system instantiates (30 min)

Map the architecture from Step 1 onto [[02_Schemas/S1 — State & Transition|S1]]–[[02_Schemas/S10 — Search & Inference|S10]]. Most complex systems instantiate 3-5 primary schemas. For each, identify the **concrete component** that is the schema's instance:

| Schema | Postgres instance |
|--------|-------------------|
| S1 State & Transition | Backend process lifecycle; transaction state machine (BEGIN → ... → COMMIT/ROLLBACK) |
| S2 Graph & Reachability | Query plan as a tree of plan nodes; planner's search over plan space |
| S4 Optimization & Constraints | Cost-based query optimizer; constraint-based planner |
| S5 Information Flow | WAL propagation from buffer → disk → standby |
| S6 Memory & Locality | 8 KB page size; buffer pool LRU with clock sweep; WAL sequential write pattern |
| S7 Concurrency & Coordination | MVCC; lock manager; LWLocks for shared data structures |
| S9 Representation & Transformation | Tuple format; TOAST for large values; indexes (B-tree, Hash, GiST, GIN, BRIN) |
| S10 Search & Inference | Planner's dynamic programming over join orders |

This table is the spine of your system understanding. Every detail you encounter later either confirms an entry or refines it. When a Postgres behavior surprises you, ask: which schema's invariant is being violated? The answer almost always points to the responsible component.

This step is the engine of [[01_Theory/T1 — Schema Transfer|T1]]: a system you have never seen becomes familiar the moment you map it onto schemas you have. A learner without schemas spends 4 weeks on Postgres; a learner with schemas spends 1.

### Step 3 — Install and run the simplest example (1 hour)

Install the system from source if possible (binary packages hide too much). Configure it with defaults. Run it. Perform the simplest operation:

- Postgres: `createdb test; psql test -c 'CREATE TABLE t (id int); INSERT INTO t VALUES (1); SELECT * FROM t;'`
- Kubernetes: `kind create cluster; kubectl run nginx --image=nginx; kubectl get pods`
- Kafka: `kafka-topics --create --topic test ...; kafka-console-producer --topic test; kafka-console-consumer --topic test --from-beginning`

The point is not the operation itself — it is to verify that you have a working system, can see its logs, can inspect its state, and can stop and restart it cleanly. Capture in your note:

- Where the **logs** live (file path, log level controls).
- Where the **data** lives (data directory, file layout).
- How to **inspect state** (psql's `\d`, kubectl's describe, kafka's `--describe`).
- How to **restart** cleanly and uncleanly (kill -9 to simulate a crash).

Concrete example — Postgres: `initdb /tmp/pgdata` initializes a data directory; `pg_ctl -D /tmp/pgdata start` starts the server; `tail -f /tmp/pgdata/log` follows the log; `ls -la /tmp/pgdata/base/` shows the per-database directories with files named by OID. Killing the postmaster with `kill -9` and restarting triggers crash recovery — watch the log for "redo starts at" and "redo done at" lines. You have now seen the WAL replay path from the outside; Step 4 will trace it from the inside.

### Step 4 — Trace one operation end-to-end with logs and strace (2-3 hours)

Pick one operation — the simplest non-trivial one (a single-row INSERT, a single-pod deploy, a single-message produce-consume). Run it under tracing:

- **Strace** the server process: `strace -f -e trace=openat,write,fsync -p <pid>`. Watch the actual syscalls.
- **Enable verbose logging**: turn the log level up to DEBUG for the operation's path.
- **Use the system's introspection**: `EXPLAIN ANALYZE` for Postgres, `kubectl describe` for K8s, `kafka-console-consumer --property print.key=true` for Kafka.
- **Use a debugger** if the system is C/C++/Rust (see [[04_Protocols/P2 — How to Read Source Code|P2]] Step 3): attach gdb, set breakpoints at the entry point of the operation, step through.

Map the operation's path through the components from Step 1. Annotate the architecture diagram with the path: which components are touched, in what order, with what data.

Concrete example — Postgres single-row INSERT traced end-to-end:

1. Client sends `INSERT INTO t VALUES (1)` to the backend.
2. Backend parses the query (`postgres.c` → `pg_parse_query`).
3. Backend rewrites and plans (`pg_analyze_and_rewrite` → `pg_plan_queries`). For a single-row INSERT, planning is trivial.
4. Backend executes (`ExecutorRun` → `ExecInsert`). The tuple is formed and inserted into the table's heap.
5. The heap insertion writes to the **shared buffer pool** (`StorageManager` → `BufferAlloc`). The dirty buffer is not yet on disk.
6. The INSERT writes to the **WAL buffer** (`XLogInsert`).
7. At COMMIT, the WAL buffer is flushed to disk (`XLogFlush` → `fsync`). This is the durability point.
8. The heap page is flushed later by the background writer or checkpointer.

Strace shows: `openat` on the table file (or hit in buffer pool), `write` on the WAL file, `fsync` on the WAL file. The `fsync` is the latency spike every Postgres commit pays for durability.

This step is the deliberate-practice core (see [[01_Theory/T3 — Deliberate Practice|T3]]): you watch the system actually work, you cross-check your mental model against reality, and the gaps are visible immediately.

### Step 5 — Read the canonical paper (2-4 hours, via P1)

Most important systems have a canonical paper:

- Postgres — Stonebraker & Rowe (1986), "The Design of POSTGRES"; plus Hellerstein et al. (2007) for architecture evolution.
- Kubernetes — Burns et al. (2016), "Borg, Omega, and Kubernetes"; Verma et al. (2015) Borg paper.
- Kafka — Kreps et al. (2011), "Kafka: a Distributed Messaging System for Log Processing."
- MapReduce, GFS, Bigtable, Spanner, Dynamo, Raft, Paxos — each has its canonical paper.

Apply [[04_Protocols/P1 — How to Read a Research Paper|P1]] in full. The paper's formal model will explain **why** the architecture is the way it is — the design rationale that the docs omit. For Postgres, the Stonebraker paper explains the no-overwrite storage model and the WAL design as deliberate choices against the prevailing (Ingres) overwrite model.

If there is no canonical paper, find the canonical technical report or design doc (e.g., Kubernetes design proposals, Postgres developer documentation).

### Step 6 — Read one core module's source (3-5 hours, via P2)

Pick the module that handles the operation you traced in Step 4. Apply [[04_Protocols/P2 — How to Read Source Code|P2]] Steps 1-5: skim README/directory, find the entry point, trace the flow with a debugger, map dependencies, read the module in full, write a module summary note.

Concrete example — Postgres: read `src/backend/access/transam/xlog.c` (the WAL implementation). This is the module that produces the `fsync` you saw in Step 4. After reading it you should understand: how WAL records are formatted (`XLogRecord`), how they are inserted (`XLogInsert`), how they are flushed (`XLogFlush`), how the buffer ring works, how crash recovery replays them. You will also understand the failure modes: partial writes (torn pages), checksum mismatches, WAL corruption.

This step is the bridge from user to operator. Reading the source is what separates someone who can run the system from someone who can debug it when it breaks.

### Step 7 — Reimplement a minimal version (4-10 hours)

Build a 50-500 LOC toy version of the system's core. The bar is not production quality — it is "implements the system's central trick." Examples:

- Postgres → a key-value store with WAL-based durability: append-only log of operations, in-memory hash index, crash recovery by replaying the log.
- Kafka → a topic log with consumer offsets: append-only file per topic, offset-indexed reads, consumer-group offset tracking.
- Kubernetes → a reconciliation loop: a desired-state store, an actual-state store, a controller that diffs them and applies patches.
- Raft → leader election + log replication for 3 nodes: leader election by randomized timeouts, log replication by AppendEntries RPCs, commit by majority quorum.

The reimplementation surfaces every assumption you did not realize the system was making. Postgres's WAL seems simple until you implement it and discover the torn-page problem (a 4 KB page write is not atomic on disk; partial writes corrupt the page). The toy version will hit this bug; the fix (full-page writes in WAL) is what Postgres does, and you will now understand it from the inside.

This step is generative production at scale — see [[03_Methods/M8 — Generative Production|M8]]. It is the single highest-leverage activity in the protocol; a learner who reimplements the system's core in 200 lines understands it more deeply than one who reads 10,000 lines of the original.

### Step 8 — Break it intentionally; catalog failure modes (3-5 hours)

Now operate the system to failure. For each failure mode:

- **Trigger it** (kill a process, saturate disk, partition the network, corrupt a file, exhaust memory).
- **Observe** (logs, metrics, behavior).
- **Recover** (restart, restore from backup, re-sync from a replica).
- **Document** (one paragraph per failure: trigger, symptom, detection, recovery, prevention).

Concrete example — Postgres failure modes to trigger:

1. **Kill -9 the postmaster mid-transaction.** Symptom: client gets connection-reset. On restart, Postgres replays WAL from last checkpoint. Detection: log shows "database system was interrupted; last record ... ". Recovery: automatic. Prevention: N/A — this is the normal crash-recovery path.
2. **Fill the disk.** Symptom: INSERTs fail with "no space left on device." Detection: `pg_stat_progress_*` views or disk-full alerts. Recovery: `VACUUM FULL` or add disk. Prevention: monitor disk usage; enable auto-vacuum aggressively.
3. **Corrupt a heap file with `dd`.** Symptom: SELECT returns garbage or error. Detection: `pg_checksums` (if enabled) or row-level errors. Recovery: restore from backup or PITR. Prevention: enable checksums; monitor for corruption.
4. **Kill -STOP a backend holding a long lock.** Symptom: other backends hang on the lock. Detection: `pg_locks` view shows the blocked lock; `pg_stat_activity` shows the stuck backend. Recovery: `pg_terminate_backend(pid)`. Prevention: statement_timeout; application-level lock hygiene.
5. **Set up streaming replication, then partition the network between primary and standby.** Symptom: standby falls behind; primary accumulates WAL. Detection: `pg_stat_replication` shows increasing lag. Recovery: restore connectivity or fail over. Prevention: monitor replication lag; alert before it exceeds RPO.

The failure-mode catalog is the operations on-ramp. A system you have only ever run successfully is a system you cannot operate; the catalog converts theoretical knowledge into operational readiness.

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Tutorial hell | You finish 10 tutorials and cannot explain the architecture. | Step 1 (architecture overview) before any tutorial; tutorials clarify details, not structure. |
| Never reading the source | You "know" Postgres from the docs but cannot debug a corrupted WAL. | Step 6 (read core module via P2) is non-negotiable; the docs hide the failure modes. |
| Not running it | You read about Kubernetes but never deployed a pod. | Step 3 (run the simplest example) before reading any source. |
| Never building a minimal version | You can configure the system but cannot explain its core trick. | Step 7 (reimplement) is the single highest-leverage step; a 200-LOC toy beats 10,000 lines of reading. |
| Not connecting to schemas | Every system is a unique snowflake; you relearn from scratch. | Step 2 (schema mapping) is the engine of transfer; without it, the 4th system takes as long as the 1st. |
| Skipping the canonical paper | You miss the design rationale that explains the architecture. | Step 5 (P1) surfaces the why; the docs surface the what. |
| Skipping the failure-mode step | You can run the system but not operate it. | Step 8 is the operations on-ramp; a system you cannot break is a system you cannot run. |
| Reading every module equally | You spend a week in the parser and never reach the storage engine. | Use Step 4's traced path to pick the core module for Step 6. |
| Stopping after running the example | You declare victory after `kubectl run nginx` works. | Steps 4-8 are the bulk of the protocol; Step 3 is the prelude. |
| Memorizing config flags | You can recite `postgresql.conf` but cannot explain MVCC. | Config is reference material; understanding is the architecture + the core module + the reimplementation. |

## Linked methods

- [[03_Methods/M10 — Strategic Triage|M10]] — Step 1's architecture overview triages which components to study in depth.
- [[03_Methods/M9 — Concept Mapping|M9]] — Steps 1 and 4 produce the architecture diagram annotated with the traced path.
- [[03_Methods/M4 — Worked Examples|M4]] — Step 4's traced operation is a worked example of the system.
- [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] — Step 2's schema mapping forces self-explanation of each component.
- [[03_Methods/M8 — Generative Production|M8]] — Step 7's minimal reimplementation is generative production at the system scale.
- [[03_Methods/M1 — Retrieval Practice|M1]] — After 1 week, re-draw the architecture diagram from memory; the diff is your study plan.

## Linked theory

- [[01_Theory/T1 — Schema Transfer|T1]] — Step 2 is the engine of transfer; without it, complex systems do not generalize.
- [[01_Theory/T2 — Cognitive Load Theory|T2]] — The architecture overview (Step 1) reduces extraneous load by giving structure before detail.
- [[01_Theory/T3 — Deliberate Practice|T3]] — Step 4's tracing and Step 7's reimplementation are effortful, gap-producing.
- [[01_Theory/T4 — Long-Term Working Memory|T4]] — Reading the core module (Step 6) builds the LT-WM chunks that make you fluent.
- [[01_Theory/T8 — Adaptive Expertise|T8]] — Step 8's failure-mode catalog is what separates the routine operator from the adaptive one.

## Adaptations

The protocol adapts to different system classes:

| System class | Step 5 (canonical paper) | Step 7 (minimal reimpl) | Step 8 (failure modes) |
|--------------|--------------------------|-------------------------|------------------------|
| Database (Postgres, SQLite) | Stonebraker / Hellerstein | KV store with WAL | crash recovery, corruption, lock contention |
| Orchestrator (K8s, Mesos) | Borg / Omega | reconciliation loop | stuck reconcile, controller crash, etcd partition |
| Message broker (Kafka, NATS) | Kreps et al. | append-only log + consumer offsets | consumer lag, partition imbalance, broker failure |
| Storage engine (RocksDB, LMDB) | Bigtable / O'Neil LSF | LSM-tree with compaction | write amplification, read amplification, compaction storm |
| Consensus (Raft, Paxos) | Ongaro / Lamport | 3-node Raft | leader election split, log divergence, network partition |
| Stream processor (Flink, Spark) | Spark / Flink papers | map-reduce with windowing | late events, watermark stall, checkpoint failure |

The structure of P4 is invariant; the artifacts differ. The protocol's value is precisely that the structure transfers: a learner who has run P4 on Postgres runs P4 on Kafka faster, because Steps 1-4 and 6-8 are mechanical once the schema-mapping habit is in place. Only Step 5 (the paper) and Step 7 (the reimplementation) are system-specific.

For systems without a canonical paper (e.g., newer OSS projects), substitute the project's design doc, RFC, or architecture-decision records (ADRs). For systems without source access (proprietary), Steps 6-7 are restricted to black-box observation; deepen Step 4 (tracing) and Step 8 (failure modes) to compensate.

## Retrieval queue

#sr
- List the eight steps of P4 in order, with the time budget for each. Which step is described as "highest leverage," and why?
- Step 2 maps the system onto schemas S1-S10. Why is this step described as the engine of T1 (schema transfer)? Predict the time investment for a learner with schemas vs. without.
- Step 7 (minimal reimplementation) is described as the highest-ROI activity. Justify this claim using M8 (generative production) and the gap between reading and building.
- You are assigned to operate Postgres in production next quarter. Which steps of P4 are most critical for the operations on-ramp, and which are optional?
- Step 8 asks you to trigger five failure modes. Why is a system you have only run successfully a system you cannot operate? Cite T8 (adaptive expertise).

---

## Cross-links

- Related protocols: [[04_Protocols/P1 — How to Read a Research Paper|P1 Read Paper]] (Step 5 applies P1 to the canonical paper), [[04_Protocols/P2 — How to Read Source Code|P2 Read Source]] (Step 6 applies P2 to the core module), [[04_Protocols/P5 — How to Debug a System|P5 Debug]] (Step 8's failure modes are P5's inputs), [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]] (Step 2's schema mapping feeds P7).
- Related schemas: [[02_Schemas/S1 — State & Transition|S1]], [[02_Schemas/S5 — Information Flow|S5]], [[02_Schemas/S6 — Memory & Locality|S6]], [[02_Schemas/S7 — Concurrency & Coordination|S7]] — the schemas most often instantiated by production systems.
