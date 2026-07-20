---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S6 — Memory & Locality

> A **memory hierarchy** is the structure that arises whenever a system stores data across layers of decreasing speed and increasing capacity, and its performance is governed entirely by **locality** — the tendency of accesses to cluster in space (nearby addresses) and time (recently referenced addresses) — so that a small, fast layer holding a *working set* can satisfy most requests even though it holds a tiny fraction of the total data.

---

## 1. Formal core

A memory hierarchy is a sequence of levels $L_1, L_2, \dots, L_k$ ordered by increasing latency $\ell_i$, increasing capacity $C_i$, and decreasing cost per byte. Each level caches a subset of the level below. A reference to address $a$ is served by the lowest $L_i$ that contains $a$; if no level above main memory contains $a$, the access goes to the backing store. The reference pattern is what the hierarchy *exploits*; the hierarchy itself is just a probability-weighted shortcut.

**Typical parameters** (desktop/server class, 2024):

| Level | Latency | Capacity | Bandwidth | Managed by |
|-------|---------|----------|-----------|-----------|
| Register | 1 cycle | ~1 KB | ~TB/s | Compiler |
| L1 cache | 4 cycles, ~1 ns | 32-64 KB | ~1 TB/s | Hardware |
| L2 cache | 10-14 cycles | 256 KB - 1 MB | ~500 GB/s | Hardware |
| L3 cache | 30-50 cycles | 8-64 MB | ~200 GB/s | Hardware |
| DRAM | 200-300 cycles, ~80 ns | 16-256 GB | ~50 GB/s | OS (pages) |
| NVMe SSD | ~10 μs | 1-8 TB | ~5 GB/s | OS / filesystem |
| SATA SSD | ~100 μs | 1-8 TB | ~500 MB/s | OS / filesystem |
| Network (LAN) | ~100 μs - 1 ms | ∞ | ~10 GB/s | NIC / kernel |
| Network (WAN) | 10-100 ms | ∞ | ~1 GB/s | NIC / kernel |

The ratio between adjacent levels is roughly $10\times$-$1000\times$ in latency. This non-uniformity is the single most important fact in systems design: an algorithm that is $O(n)$ in *references* can be anywhere from $O(n)$ to $O(n \cdot 1000)$ in *time* depending on which references hit which level.

**Locality** is the property that makes the hierarchy work. It comes in two forms, and they are independent:

- **Temporal locality**: an address accessed at time $t$ is likely to be accessed again at $t + \delta$ for small $\delta$. Justifies keeping recently used data in fast storage (LRU and friends).
- **Spatial locality**: an address $a$ accessed at time $t$ is likely to be accessed together with $a \pm \delta$ for small $\delta$. Justifies block-based transfer (cache lines, pages, prefetch).

**Working set** $W(\tau)$ is the set of distinct addresses accessed in a time window of length $\tau$. If $|W(\tau)| \le C_i$ for some level $L_i$, that level can absorb the working set and hit rate approaches 1 once warm. If $|W(\tau)| > C_i$ for *every* $i$ below the backing store, the hierarchy thrashes — every access misses.

**Cache line** is the unit of transfer between adjacent levels. It is typically 64 B for L1/L2/L3, 4 KB for OS pages, and variable for higher levels. The line size is the spatial-locality knob: larger lines exploit more spatial locality but waste bandwidth on irrelevant bytes (and risk *false sharing* in concurrent code, where two threads writing different fields of the same line bounce the line between caches).

**Hit rate** $h$ = fraction of accesses served by a given level. **Miss rate** $m = 1 - h$. **Average access time** for a two-level hierarchy:

$$T_{\text{avg}} = h \cdot T_{\text{hit}} + (1 - h) \cdot T_{\text{miss}}$$

A 99% L1 hit rate is not "almost perfect" — it is $0.99 \cdot 1\text{ns} + 0.01 \cdot 80\text{ns} \approx 1.8$ ns per access, which is $1.8\times$ the L1 latency. A 90% hit rate is $0.9 \cdot 1 + 0.1 \cdot 80 = 9$ ns — $9\times$ slower. Miss rate dominates because miss penalty is $100\times$-$1000\times$ the hit cost.

**Replacement policy** decides which line to evict on a miss when the cache is full. LRU (Least Recently Used) exploits temporal locality and is optimal under the **stack property**: the set of items in an $n$-way LRU cache is always a subset of the items in an $(n+1)$-way LRU cache, so increasing capacity never decreases hit rate. LFU (Least Frequently Used) is better for skewed, stable distributions but slow to adapt. ARC (Adaptive Replacement Cache) and LIRS keep dual histories (recently evicted, frequently used) to adapt between recency and frequency. Random replacement is surprisingly competitive under high churn because it has no pathological worst case.

**Inclusion policies** (multi-level caches):
- **Inclusive**: $L_2 \supseteq L_1$. An L1 eviction does not require L2 action; an L2 eviction must invalidate the line in L1. Wastes some capacity but simplifies coherence (snoop L2 only).
- **Exclusive**: $L_2 \cap L_1 = \emptyset$. An L1 miss moves the line from L2 to L1 (not copied). Better capacity utilization but coherence must snoop all levels.
- **Non-inclusive / non-exclusive (NINE)**: no enforced relation; cheapest to build, used by modern Intel/AMD L3s.

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Fast level | Slow level | Line size | Replacement |
|--------|----------|-----------|-----------|-----------|-------------|
| CPU hardware | L1/L2/L3 caches | SRAM | DRAM | 64 B | Pseudo-LRU |
| OS virtual memory | Page cache | DRAM pages | SSD/swap | 4 KB (huge: 2 MB) | Active/inactive LRU (Linux) |
| Database | PostgreSQL `shared_buffers` | RAM | Disk + OS cache | 8 KB (block) | Clock-sweep (LRU approx) |
| Web/CDN | Cloudflare / Akamai edge | Edge POP | Origin | Varies (object) | LRU + TTL |
| In-memory cache | Redis / Memcached | RAM | (none; eviction only) | Varies | LRU / LFU / RANDOM |
| Distributed cache | Hazelcast / memcached cluster | One node's RAM | Other nodes (via network) | Varies | Consistent hashing + LRU |
| NUMA | Local DRAM | Local node DRAM | Remote node DRAM | 64 B (cache line) | First-touch page placement |
| GPU | Shared memory / L1 | SM shared mem | Global VRAM | 32 B (coalesced) | Manual (`__shared__`) |
| Browser | HTTP cache | Disk cache | Network | Object | Heuristic freshness + LRU |
| Compilers | Register allocation | Registers | Stack frame | 4/8 B | Graph coloring / linear scan |

Across every instance the schema is identical: a small fast layer holds a working set, an admission/eviction policy decides membership, and performance is set by hit rate under the workload's locality. The engineering questions are always (a) what is the working set, (b) what granularity to cache at, (c) what policy to evict with, (d) how to handle coherence when multiple caches share data, and (e) how to handle invalidation when the backing store mutates.

A cross-instance pattern worth internalizing: **every level caches a probability distribution over future accesses**. LRU caches the distribution "recently accessed will be re-accessed"; LFU caches "frequently accessed will be re-accessed"; the OS page cache caches "pages touched once will be touched again soon"; a CDN caches "objects requested from this region will be requested again from this region." When the distribution shifts (a batch job scans cold data; a hot key moves), the policy's hit rate collapses until it re-converges. This is why cache design is fundamentally *adaptive estimation* of a non-stationary distribution.

A second cross-instance pattern: **the unit of caching tracks the unit of locality**. CPU caches use 64 B lines because spatial locality in compiled code is ~64 B (a cache line holds ~8 instructions or ~8 pointers). OS pages are 4 KB because file spatial locality is ~4 KB. Database blocks are 8 KB (or 16 KB) because B-tree fanout at 8 KB gives a 3-level tree for 100 GB. CDN objects are whole files because HTTP locality is per-object. Mismatching the cache unit to the locality unit (caching whole pages when only headers are reused; caching 64 B lines when the access pattern is random 4 KB jumps) destroys hit rate without saving memory.

A third cross-instance pattern worth internalizing: **every cache is a predictor of the future access distribution, and every replacement policy is a different predictor.** LRU predicts "the recent past predicts the near future." LFU predicts "the long-run frequency predicts the future." ARC predicts "the right balance of recency and frequency depends on the workload — and I will adapt." A CDN's geographic placement predicts "objects requested from this region will be requested again from this region." When the predictor matches the workload, hit rate is high; when the workload shifts (a batch scan, a viral key, a migration), the predictor's hit rate collapses until it re-converges. This reframes cache design as *online learning under distribution shift* — the cache is constantly trying to track a non-stationary access distribution with a bounded memory budget. The schema-level implication: there is no universally optimal replacement policy, only policies that adapt faster or slower to distribution shifts.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: the working-set curve, hit rate as a function of capacity and locality, the stack property of LRU.
- *Hardware*: L1/L2/L3 SRAM, TLB, NUMA, GPU shared memory, DMA engines.
- *Operating system*: the page cache, the buffer cache, the dentry/inode caches, transparent huge pages, `madvise` hints.
- *Database*: `shared_buffers`, the WAL buffer, the OS page cache as a second-level cache (the "double cache" debate).
- *Distributed system*: CDNs, Redis clusters, memcached tiers, consistent hashing for cache distribution.
- *Production practice*: per-level hit-rate SLOs, eviction-rate alerts, warm-up procedures on deploy, cache-stampede mitigations (singleflight, jittered TTL).

The transfer exercise that builds the schema: take one canonical cache (e.g., the OS page cache) and rebuild the same logical structure at each layer — as an in-process LRU map, as a Redis instance, as a CDN edge, as a CPU L1. The invariants that survive all layers (hit rate as a function of working-set-to-capacity ratio; miss penalty dominates average access time; replacement policy tracks the access distribution) are the schema. The invariants that break (coherence model, the meaning of a "cache line," the failure semantics under crash) are the layer-specific concerns.

## 3. Contrastive cases

### 3.1 Write-through vs write-back

A **write-through** cache propagates every write to the backing store immediately; the cache exists only to accelerate reads. Coherence is trivial (read from backing store after a write is always current). Cost: every write incurs the slow-level latency. A **write-back** cache marks the line dirty and flushes it later (on eviction, on a barrier, on a sync). Writes are fast; coherence is hard (other readers may see stale data until the flush). CPU L1 caches are write-back because a 1 ns write that costs 80 ns to propagate is unacceptable. Most CDN and Redis caches are write-through (or write-around) because the source of truth is the origin database and the cache is dispensable. The bug: choosing write-back without solving coherence — the cache holds the only current copy, and a crash before flush loses data.

### 3.2 Inclusive vs exclusive (and NINE) multi-level caches

See §1. Inclusive caches waste capacity (data duplicated in L1 and L2) but simplify coherence snoops (only the outer level must be queried). Exclusive caches use capacity more efficiently (a line lives in exactly one level) but require snooping every level. Modern server CPUs use NINE because it is the cheapest to verify and has no inclusion-induced evictions. The choice is invisible to software but matters for coherence-protocol complexity and for whether an L3 eviction invalidates L1 (it does in inclusive, does not in NINE).

### 3.3 Cold cache vs warm cache

A **warm** cache has the working set resident; hit rate reflects steady state. A **cold** cache starts empty; the first access to each address is a compulsory miss. Benchmarks that don't separate warm-up from steady-state overstate or understate performance by $2\times$-$10\times$ depending on working-set size. The "five-nine" cache-hit SLO is meaningless without specifying the warm-up: a 99.999% hit rate over a 10-minute window that includes a 30-second cold start is 99.95% over the window — the cold start ate the budget. The fix is always: report cold-start and steady-state separately, with the warm-up explicitly excluded.

### 3.4 Cache vs buffer

A **cache** is a *performance optimization* — correct without it, just slower. A **buffer** is a *correctness mechanism* — needed to absorb rate mismatches between producer and consumer (S5). The two are often conflated because the same data structure (a hash map with eviction) implements both. The distinction matters for failure semantics: a cache miss is fine (fetch from backing store); a buffer miss is a bug (data was lost). The OS page cache is both: it's a *cache* for reads (file content is on disk anyway) and a *buffer* for writes (write-back semantics, must flush before crash). Confusing the two leads to "treat the cache as durable" bugs (the Redis-as-primary-database failure mode).

### 3.5 Write-allocate vs no-write-allocate

On a write miss, **write-allocate** fetches the line into the cache then writes (the line will likely be written again — temporal locality on writes). **No-write-allocate** writes directly to the backing store without caching (the line is unlikely to be reused soon — streaming writes). CPU caches are write-allocate for normal stores; DMA engines and streaming-store instructions (`MOVNTPS`, `__builtin_prefetch` with write hint) are no-write-allocate. The bug: using write-allocate for a streaming write workload — every cache line is fetched, written, then evicted, doubling bandwidth consumption and polluting the cache with soon-evicted lines.

### 3.6 Look-aside vs look-through caching

A **look-aside** cache sits next to the backing store: application queries cache first, on miss queries backing store and populates cache. The cache is bypassable; the backing store sees cache-miss traffic. A **look-through** cache sits in line: all queries go through the cache, which fetches from backing store on miss. The backing store never sees cache hits. CPU caches are look-through (every load goes through L1, L2, L3 in order); Redis-in-front-of-Postgres is look-aside (the application explicitly checks Redis first). Look-aside is easier to add to an existing system; look-through has lower per-hit latency (no application-level conditional). The bug: look-aside with no read-through on miss — the application must populate the cache, and a forgotten populate call leaves the cache permanently cold for that key.

### 3.7 Per-core private vs shared last-level cache

A **private** L1/L2 per core minimizes contention but duplicates data. A **shared** L3 (last-level) maximizes effective capacity and allows one core's prefetched data to benefit another. The hybrid (private L1/L2 + shared L3) is universal on modern CPUs because it gets both properties — at the cost of coherence traffic between private L1s (the MESI protocol, see S7). The same tradeoff recurs in distributed caches: per-node caches (private, low latency, duplicated) vs a cluster-wide cache (shared, higher latency, deduplicated). Consistent hashing gives a middle ground: each key has a designated owner, so the *effective* shared cache is the sum of all nodes.

## 4. Implementation

**Build a generic two-level cache with promotion and demotion.** Target: ~200 lines.

Level 1 (L1): small, fast, exact LRU. Capacity 256 entries, $O(1)$ `get`/`put` via a hash map + doubly linked list.
Level 2 (L2): larger, slower, ARC-like (adaptive replacement between recency and frequency). Capacity 4096 entries.

Specifications:
- API: `get(key) -> Option<Value>`, `put(key, value)`, `metrics() -> Metrics`.
- `get(k)`: if in L1, move to MRU position, return. If in L2, **promote** to L1 (evict L1's LRU to L2), return. If absent, return None (caller is responsible for fetching from the backing store and calling `put`).
- `put(k, v)`: insert into L1, evicting L1's LRU to L2 if full; if L2 is also full, evict L2's victim per ARC policy.
- ARC: maintain two lists `T1` (recent) and `T2` (frequent), and two histories `B1`, `B2` of recently evicted keys. Adapt the target size $p$ of `T1` based on whether evictions come from `B1` (favor recency) or `B2` (favor frequency).
- Thread safety: a single `RwLock` around the whole structure is acceptable for v1. Document the contention limit.
- Metrics: per-level hit count, miss count, promotion count, demotion count, eviction count. Expose hit rate as a rolling 1-second average.

Test cases:
- 100k random `get`s against a Zipfian key distribution (skew $s = 0.8$). Verify L1 hit rate > 60%, L1+L2 hit rate > 90%.
- A "scan" workload: 1k sequential accesses to keys not in cache, then 10k random accesses to a small hot set. Verify the scan does *not* permanently evict the hot set (ARC's frequency list should protect hot keys).
- 10k `put`s to the same key. Verify L1 size stays bounded (no leak); verify L2 size stays bounded.
- A concurrent test: 4 threads each doing 100k random `get`s. Verify no deadlocks, no panics, no lost updates (final metrics sum equals total accesses).

**Difficulty**: medium-hard. **Sub-skills tested**: $O(1)$ LRU implementation (hash map + linked list), ARC's adaptive policy, two-level coordination (promotion/demotion), concurrent metrics without locks in the hot path. The bugs you will hit: (a) the linked-list pointer manipulation on eviction has off-by-one errors at the head/tail; (b) ARC's $p$ adaptation can oscillate if the workload is exactly at the boundary between recency- and frequency-favorable — clamp the adaptation; (c) the metrics counter races under concurrency because you used a plain `u64` not an atomic.

**Extension ladder**:
1. Add a `peak` operation that returns the value without promoting — useful for inspection. Observe how this changes the hit-rate distribution.
2. Add **TTL** (time-to-live) with lazy expiration. Verify that expired entries are not counted as hits. Add a background sweeper; compare its overhead against lazy expiration.
3. Add **sharding** (16 shards by `hash(key) % 16`) to reduce lock contention. Measure the throughput improvement at 16 threads — it should scale nearly linearly until the shard count.
4. Replace the LRU with a **W-TinyLFU** (windowed frequency sketch + main LRU/LFU segments). Compare against ARC on a Zipfian workload with a slowly drifting hot set.

## 5. Failure analysis

1. **Cache thrashing (working set > cache).** The working set exceeds the cache's capacity, so every access evicts a soon-needed line. The classic case: a matrix transpose with $n^2 > L1$ — every load misses. The cache becomes a net negative (it pays eviction overhead without delivering hits). Diagnosis: miss rate near 100% regardless of policy. Mitigation: **block** / **tile** the computation so the working set fits in cache (the classic loop-tiling optimization). Thrashing is the cache equivalent of memory paging thrashing; both are diagnosed by working-set > capacity.

2. **Cache pollution by one-shot scans.** A sequential scan over cold data evicts the hot working set. After the scan, every hot access misses until the cache re-warms. Diagnosis: hit rate drops to ~0 immediately after a scan, recovers over minutes. Mitigation: `POSIX_FADV_DONTNEED` / `O_DIRECT` for the scan; bypass-cache hints (`__builtin_prefetch(..., 0, 0)`); separate scans onto a different cache (e.g., read replica for DB analytics). The general principle: cache policies assume locality, and scans *destroy* locality by definition.

3. **Coherence storms in multi-core.** Two cores repeatedly write the same cache line; the line ping-pongs between their L1s, each transfer costing ~40 cycles. Throughput collapses to single-threaded or worse. Diagnosis: per-instruction CPI is high; `perf c2c` shows high cache-line transfers. Mitigation: **sharding** (each thread writes its own cache line), **padding** (pad shared structures to a cache line, `alignas(64)`), **partitioning** (per-thread counters merged periodically). This is the canonical **false sharing** bug.

4. **False sharing on adjacent fields.** Two threads increment `counters[0]` and `counters[1]` — but the array fits in one cache line, so the line bounces. Performance is 10×-100× slower than expected. Diagnosis: scaling *degrades* with more threads. Mitigation: pad each counter to a cache line (`struct Counter { atomic<u64> v; u8 pad[56]; }`).

5. **NUMA far-memory penalty.** On a 2-socket NUMA system, a thread on socket 0 accessing memory allocated on socket 1 pays ~2× the latency (130 ns vs 80 ns). The cache hierarchy *looks* fine; the latency is in the inter-socket link. Diagnosis: `numastat` shows high inter-node traffic. Mitigation: **first-touch page placement** (the thread that first touches a page determines its NUMA node); `numactl --cpunodebind=0 --membind=0`; per-thread memory arenas ( jemalloc's `arena` per CPU).

6. **Stale reads in distributed cache.** A write updates the primary database; the cache still holds the old value; reads serve stale data for seconds-to-minutes. Diagnosis: read-after-write inconsistency that resolves itself after TTL. Mitigation: **write-through** (update cache on write), **cache-aside with invalidation** (delete cache key on write, let the next read repopulate), **TTL short enough to bound staleness**, or **versioned reads** (read with a monotonic version; reject stale). The cache-aside invalidation race — write invalidates cache, then DB; a concurrent read repopulates the cache from the stale DB *between* the two — is the most common subtle bug.

7. **Thundering herd on cache miss.** A hot key expires; 1000 concurrent requests all miss; all 1000 fetch from the backing store; the store is overwhelmed. Diagnosis: backend latency spikes correlate with cache expiry times. Mitigation: **request coalescing** (one miss triggers the fetch; others wait on a promise), **jittered TTLs** (so hot keys don't expire simultaneously), **probabilistic early expiration** (XCache's "refresh on 5% of TTL remaining"), **singleflight** pattern.

8. **Cache stampede on cold start.** A new cache instance starts empty; the first burst of traffic all misses; backing store overwhelmed; cache never warms because it's busy evicting to make room for the flood. Mitigation: **gradual warm-up** (pre-populate from a snapshot), **admission control** (TinyLFU-style: only admit keys that pass a frequency filter, so a flood of unique keys can't evict hot keys), **backpressure** to upstream.

9. **Cold-cache bias in benchmarks.** A benchmark runs once, reports 99% hit rate. The next run reports 60% because the first run evicted everything else. Mitigation: pin the working set, run multiple iterations, discard the first.

10. **Eviction-policy mismatch with workload.** LRU on a workload with strong frequency but weak recency (e.g., a small hot set accessed once per minute, plus a large warm set accessed once each) underperforms LFU. Diagnosis: ARC outperforms LRU significantly — this is the signal that frequency matters. Mitigation: profile the access distribution; match the policy to the workload's dominant locality axis.

11. **TLB shootdowns and large pages.** Small (4 KB) pages mean large working sets need many TLB entries; TLB misses cost 5-50 cycles each. The L1 data cache hits, but the TLB lookup misses. Diagnosis: `perf stat -e dTLB-load-misses`. Mitigation: **transparent huge pages** (2 MB or 1 GB), explicit `madvise(MADV_HUGEPAGE)`, or `mmap` with `MAP_HUGETLB`.

12. **Cache line poisoning by atomics.** An `atomic<u64>` contended by 8 threads bounces its cache line on every increment. Throughput drops to ~1/8 of single-threaded. Mitigation: sharded counters (each thread its own counter, merged on read), `RELAXED` memory ordering when the atomic is only a counter, or lock-free data structures designed for low contention.

## 6. Transfer tests

#sr
- **Terminology shift**: A PostgreSQL DBA notices that `pg_stat_database.blks_hit` is 99.99% of `blks_hit + blks_read`, yet query latency is poor. Without using the word *cache*, identify the schema, the metric the DBA is looking at, and the three other phenomena (table scan, buffer eviction by autovacuum, OS page cache double-caching) that could explain the discrepancy.
- **Representation shift**: You are given a `Vec<Vec<f64>>` (a matrix as a vector of row vectors) and a `Vec<f64>` (a flat matrix). A matrix-multiply benchmark is 4× slower on the first. Identify the schema (locality), the failure (row-pointer indirection + non-contiguous rows), and the cache-line analysis that explains the gap.
- **Constraint shift**: A GPU kernel processes a 4096×4096 matrix. Each thread reads one row sequentially. The kernel is memory-bound at 10% of peak bandwidth. Identify the schema (coalesced access), the failure (non-coalesced reads — threads in a warp access different cache lines), and the two fixes (transpose the access pattern; use shared memory tiling).
- **Unnamed solution**: A CDN caches video chunks. The hit rate is 95%. A live-streaming event causes hit rate to drop to 70% for 30 seconds, then recover. Identify the schema (working set shift), the cause (the new chunks have no locality yet), and the cache design change (longer prefetch window; chunk pre-warming at edge POPs).
- **Competing schemas**: An OS implements a page cache (Linux `page_cache`). Is this S6 (Memory & Locality) or S5 (Information Flow)? State the structural feature that decides (a cache stores; a pipeline transforms), and explain how the page cache instantiates *both* schemas at different layers.
- **Failure shift**: A multi-threaded counter (one `atomic<u64>`) scales worse than single-threaded past 4 cores. Identify the schema (cache coherence on contended atomics), the bug (false sharing is *true* sharing here — the line genuinely bounces), and the fix (sharded counter with `RELAXED` ordering and periodic merge).
- **Scale shift**: A 1 TB working set must be served with 5 ms p99 latency. DRAM is 256 GB. Identify which level(s) of the hierarchy can hold the working set, the cache hierarchy you would design (DRAM hot set + NVMe warm set + object storage cold set), and the eviction policy that bounds p99 under Zipfian access.
- **Layer shift**: The same logical cache is implemented as (a) an in-process LRU map, (b) a Redis instance on the same host, (c) a Redis cluster across 3 AZs. Identify which invariants of (a) survive into (b) and (c), and which new failure modes each layer introduces (consistency under eviction, network latency, split-brain on failover).

## 7. Delayed retrieval

#sr
- **Recall**: State the formula for average access time of a two-level cache. State the two forms of locality and one sentence each on what they justify.
- **Explanation**: Why does a 99% L1 hit rate yield ~1.8× the L1 latency, while a 90% hit rate yields ~9×? Give the arithmetic and the schema-level intuition (miss penalty dominates).
- **Derivation**: Derive the working-set argument for why loop tiling improves cache hit rate. State the condition on tile size $B$ relative to cache capacity $C$ that guarantees the tile fits.
- **Implementation**: Implement an $O(1)$ LRU cache using a hash map and doubly linked list. State the invariant that prevents the "use-after-evict" bug, and the test that catches a stale pointer in the linked list.
- **Diagnosis**: A service's p99 latency spikes every 4 hours exactly. Describe the diagnostic procedure to identify whether the cause is (a) cold cache after deploy, (b) TTL-induced thundering herd, (c) cache pollution by a scheduled batch job, or (d) coherence storm from a NUMA rebalance. Which metric settles each?
- **Transfer**: You move from a CPU L1 cache to a Redis cache for a web app. Predict two invariants that *carry over* (hit-rate-vs-working-set curve; miss penalty dominates) and two that *break* (coherence is now a distributed-systems problem; the "cache line" is now a whole object). Justify via the memory hierarchy schema.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — the memory hierarchy is the canonical schema that recurs from registers to CDNs.
- **Related schemas**: [[02_Schemas/S3 — Tree & Hierarchy|S3 Tree & Hierarchy]] (B-trees are designed around the cache-line / page boundary), [[02_Schemas/S5 — Information Flow|S5 Information Flow]] (caches sit between pipeline stages as buffers), [[02_Schemas/S7 — Concurrency & Coordination|S7 Concurrency & Coordination]] (cache coherence protocols are the coordination layer of multi-core).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing a CPU L1 cache to a Redis cache to a CDN reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
