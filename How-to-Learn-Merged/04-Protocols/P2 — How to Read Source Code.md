---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P2 — How to Read Source Code

> A codebase is a graph of modules — you read it by entering at one point, tracing one end-to-end flow with a debugger, mapping the dependency graph, and then zooming into one module at a time, never top to bottom.

**When to use:** First time entering any non-trivial codebase (>1k LOC), or returning to a codebase you only ever skimmed. Also when onboarding to a new team's codebase.
**Inputs:** The code checked out and building locally, a working debugger, the project's README and docs, ~3 hours.
**Outputs:** A dependency graph sketch, one end-to-end trace with annotated breakpoints, one module summary note per module you read in full, and schema dossier updates identifying which of S1-S10 the codebase instantiates.
**Time:** 3 hours for a focused first pass; the deep module-by-module pass continues over days.

---

## Steps

### Step 1 — Skim README and directory structure (10 min)

Do not open a single source file yet. Read the README. Then run `tree -L 2` (or `ls -R` piped to a head) and sketch the directory layout in your note. For each top-level directory, write a one-line guess about its purpose based on the name; you will verify or correct these guesses in Step 2. Note the build system (`Cargo.toml`, `go.mod`, `package.json`, `CMakeLists.txt`, `BUILD` files) — the build file is a roadmap of dependencies and entry points.

Concrete example — entering Redis for the first time: the README says "in-memory data structure store, used as database, cache, message broker." Top-level layout: `src/` (server code), `tests/` (integration), `deps/` (vendored hiredis, jemalloc, lua), `utils/` (scripts), `redis.conf` (default config). Build: plain `Makefile` that compiles everything in `src/` into a single `redis-server` binary. Initial guess: this is a single-binary, single-threaded-event-loop architecture (you will confirm in Step 3).

This step is a triage act — see [[03_Methods/M10 — Strategic Triage|M10]]. You are building the *territory map* before reading any *terrain*.

### Step 2 — Identify entry points (15 min)

Find where execution begins. For each language/ecosystem, the entry point has a conventional location:

- C/C++: `main()` in `src/main.c` or `src/<binary>.c`.
- Rust: `fn main()` or `#[tokio::main]` in `src/main.rs`; libraries export from `src/lib.rs`.
- Go: `main()` in `cmd/<binary>/main.go`; libraries export from package directories.
- Python: `if __name__ == "__main__":` blocks, `setup.py` console_scripts, `__main__.py`.
- Java/Kotlin: `public static void main(String[])`.

Beyond `main`, identify **export entry points**: the public API of a library. In Rust these are `pub` items in `lib.rs`; in Go they are capitalized exports; in Python they are names in `__all__` or `__init__.py`. For a web framework, the entry points include the HTTP handler registration and the request dispatch loop.

Concrete example — entering Postgres: the server entry point is `src/backend/main/main.c::main()`, which calls `PostgresMain()` in `src/backend/tcop/postgres.cpp` (the traffic-cop loop that reads queries). The library entry point for an extension is `_PG_init()` in `src/include/fmgr.h`. Sketch the call from `main` to `PostgresMain` to `exec_simple_query` to `pg_parse_query` to `pg_analyze_and_rewrite` to `pg_plan_queries` to `PortalRun` — this is the spine of query execution.

Write the entry-point chain in your note as a 5-7 step call list. This chain is the spine you will trace in Step 3. This step operationalizes [[03_Methods/M5 — Elaboration & Self-Explanation|M5]]: write a one-sentence "responsibility" for each entry point.

### Step 3 — Trace one end-to-end flow with a debugger (30 min)

Pick the simplest end-to-end flow you can construct and **run it under a debugger**, not by reading. Set breakpoints at each entry-point-chain step from Step 2. Step through, watching variables and call stack. The debugger reveals what the code *does*, not what you think it does — the gap is always larger than you expect.

Concrete example — Redis: build with `make CFLAGS="-g -O0"`, run `./src/redis-server`, attach `gdb`. Issue `SET foo bar` from `redis-cli`. Breakpoints:

1. `main()` in `server.c` — startup, parse config, init event loop.
2. `readQueryFromClient()` in `networking.c` — fired by the event loop on socket readable.
3. `processCommand()` in `server.c` — lookup command in the command table.
4. `setCommand()` in `string.c` — the actual SET handler.
5. `addReplyBulkCBuffer()` in `networking.c` — write the response to the client output buffer.

Watch the client object (`client *c`) evolve: `c->argv` holds the parsed command, `c->cmd` points to the resolved command struct, `c->buf` accumulates the reply. You have now seen the entire event-loop dispatch path for one command. You have also seen where the schema lives: the **reactor pattern** (event loop + per-connection state machine) is S1, and the **command table dispatch** is a textbook S10 (lookup-then-execute).

This step is the deliberate-practice core (see [[01_Theory/T3 — Deliberate Practice|T3]]): effortful, observable, gap-producing. Reading source without running it produces "I think it works like this"; debugging produces "I watched it work like this."

### Step 4 — Map the module dependency graph (30 min)

Generate the actual dependency graph, do not guess. Tools: `cloc` for size, `dependency-cruiser` for JS, `cargo depgraph` for Rust, `go mod graph` for Go, `clang -H` for C/C++ includes, `pydeps` for Python. Sketch the result as a directed graph in your note (pen and paper, or a Mermaid block). Identify:

- **Leaves** — modules that depend on nothing. These are usually utility libraries; read them last.
- **Roots** — modules depended on by many. These are the load-bearing abstractions; read them first.
- **Cycles** — any cycle is a design smell worth noting; large cycles are architectural debt.
- **Layering violations** — a "low-level" module depending on a "high-level" one. These reveal the codebase's true layering, not its declared layering.

Concrete example — Redis modules (simplified): `server.c` depends on `networking.c`, `db.c`, `object.c`, `commands.c`, `ae.c` (event loop). `ae.c` depends only on platform headers. `networking.c` depends on `server.c` (for the client struct) — this **bidirectional dependency** between `server.c` and `networking.c` is the architectural reality: there is no clean layering, only a tightly coupled core. This is normal for a high-performance single-binary server; do not impose a foreign layering mental model.

Tie this step to [[03_Methods/M9 — Concept Mapping|M9]]: the dependency graph *is* the concept map of the codebase, with edges being `#include` / `use` / `import` relations.

### Step 5 — Pick one module, read in full, summarize (45 min)

Choose **one** module from the dependency graph — ideally a "root" module that many others depend on (high leverage), or the module that handled the flow you traced in Step 3. Read it cover to cover. For every function:

- Write one sentence on its responsibility.
- Mark its inputs, outputs, side effects, and error paths.
- Note any non-obvious invariant the function maintains.

Write a one-page module summary in your note with this structure:

```
# Module: <name> (<file>, <LOC>)
## Responsibility (1 sentence)
## Public API (functions/types exported)
## Internal invariants (2-4 bullets)
## Dependencies (imports)
## Failure modes (how it can fail; what the caller sees)
## Schema links (which of S1-S10?)
```

Concrete example — Redis `ae.c` (the event loop, ~700 LOC): responsibility = platform-abstracted event loop (epoll/kqueue/select) that dispatches file and time events. Public API: `aeCreateEventLoop`, `aeCreateFileEvent`, `aeCreateTimeEvent`, `aeMain`, `aeDeleteEventLoop`. Internal invariants: (1) the loop is single-threaded by construction (no locks); (2) time events are processed in a single batch per iteration with a hard cap (the `ae_time_limit_in_ms`); (3) file events fire level-triggered, not edge-triggered. Failure modes: event-loop starvation if a time event runs long (Redis's "latency spikes" almost always trace here). Schema links: S1 (the event loop is a state machine over file/time event queues), S6 (cache-line-aligned struct layout), S7 (single-threaded coordination, no shared-state races by construction).

### Step 6 — Modify one feature, run the tests (45 min)

Reading is necessary but not sufficient. Pick a small, well-scoped modification:

- Add a new command (e.g., `DEBUG STRESS` that allocates 1MB and frees it).
- Add a new config flag and use it in one location.
- Add a metric counter to a hot path.
- Add a CLI flag.

Implement it, build, run the test suite. If the suite passes you have done it correctly; if it fails you have a concrete signal about your misunderstanding. Write the modification summary in your note: what you changed, why it worked (or did not), what you learned.

Concrete example — Redis: add a new command `HELLO.WORLD` that returns `+WORLD\r\n`. Steps: (1) add a `helloCommand` function in a new file `src/hello.c`; (2) register it in the command table in `src/commands.c`; (3) rebuild; (4) connect with `redis-cli` and run `HELLO.WORLD`. If you forget step (2), the command is undefined and `redis-cli` returns an error — a one-minute diagnostic that teaches you the command-table registration pattern.

This step is generative production — see [[03_Methods/M8 — Generative Production|M8]]. Producing a working modification encodes the codebase's conventions (naming, error handling, test structure) far more durably than reading does.

### Step 7 — Identify schemas used; update dossiers (15 min)

Just as in [[04_Protocols/P1 — How to Read a Research Paper|P1]] Step 5, ask: which of [[02_Schemas/S1 — State & Transition|S1]]–[[02_Schemas/S10 — Search & Inference|S10]] does this codebase instantiate? Most production systems instantiate 3-5 schemas at their core. For each, identify the **concrete module/function** that is the schema's instance and add a row to the schema's "Canonical instances" table with a wikilink to your module note.

Concrete example — Redis schema dossier updates:

| Schema | Instance (module) | Notes |
|--------|-------------------|-------|
| S1 State & Transition | `ae.c` event loop + client state machine | level-triggered, single-threaded |
| S4 Optimization & Constraints | eviction policies in `evict.c` (LRU approx, LFU) | trade memory for access patterns |
| S6 Memory & Locality | `object.c` encoding (int / embstr / raw), sds | small-string optimization |
| S7 Concurrency & Coordination | single-threaded model; I/O threads opt-in | no shared-state races by construction |
| S9 Representation & Transformation | `t_string.c`, `t_list.c`, `t_hash.c`, `t_set.c`, `t_zset.c` | type-dispatch via `obj->type` |

The fifth row is the most interesting: Redis's type dispatch is a canonical instance of S9 (representation & transformation) — each type has its own encoding, its own commands, and the dispatch happens via `obj->type` lookups in `object.c`. This deserves a row in S9's dossier.

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Reading top to bottom | You spend an hour in `utils/` and never reach the core. | Start at the entry point (Step 2), trace one flow (Step 3); read modules in dependency order, not file order. |
| Not running the code | You "understand" the code but cannot explain a single runtime behavior. | Step 3 with a debugger is non-negotiable; reading without running produces illusions of comprehension. |
| Getting lost in tests | You start in `tests/` and never reach the production code. | Read tests only after reading the module they test (Step 5); tests clarify intent but do not replace the source. |
| Missing the entry point | You read random files and never build the call spine. | Step 2 forces you to find `main` and the export API before reading anything else. |
| Passive scrolling | You scroll through files without taking notes. | The module summary template (Step 5) is non-negotiable; a module read without a summary is a module not read. |
| Treating the codebase as a unique snowflake | You never connect it to schemas you know. | Step 7 (schema extraction) is the highest-ROI step; a codebase without schema links does not strengthen the vault. |
| Reading every module equally | You spend 3 hours on a utility module and never read the core. | Use the dependency graph (Step 4): read roots (high in-degree) first; leaves last. |
| Skipping the modification step | You "know" the code but cannot change it. | Step 6 (modify + test) is generative production; without it the encoding is shallow. |
| Imposing a foreign mental model | You expect clean layering in a codebase that has none. | Map the actual graph (Step 4); document cycles and violations as findings, not as defects to fix. |
| Stopping after one module | You read `ae.c`, declare victory, never read `networking.c`. | The protocol produces one module note per session; schedule follow-up sessions until the core is covered. |

## Linked methods

- [[03_Methods/M10 — Strategic Triage|M10]] — Step 1 builds the territory map; you triage which modules to read in depth.
- [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] — Step 2 forces a one-sentence responsibility per entry point; Step 5 forces per-function responsibility statements.
- [[03_Methods/M4 — Worked Examples|M4]] — Step 3's debugger trace is a worked example of the runtime; you watch the code execute one command.
- [[03_Methods/M9 — Concept Mapping|M9]] — Step 4 produces the dependency graph, which is the codebase's concept map.
- [[03_Methods/M8 — Generative Production|M8]] — Step 6's modify-and-test is generative production of the codebase's conventions.
- [[03_Methods/M6 — Analogical Comparison|M6]] — Step 7 compares the codebase's instances to existing schema dossiers.

## Linked theory

- [[01_Theory/T1 — Schema Transfer|T1]] — Step 7 is the engine of transfer; without it the codebase is a one-off skill.
- [[01_Theory/T2 — Cognitive Load Theory|T2]] — Step 1's territory map reduces extraneous load by giving structure before detail.
- [[01_Theory/T3 — Deliberate Practice|T3]] — Step 3's debugger trace is effortful, observable, gap-producing.
- [[01_Theory/T4 — Long-Term Working Memory|T4]] — Reading modules builds the LT-WM chunks that make future codebase work fast.
- [[01_Theory/T7 — Generative Learning|T7]] — Step 6's modification generates new artifacts from learned structures.

## Worked example

You are onboarding to Redis for the first time. The codebase is ~80k LOC of C; you have 3 hours.

- **Step 1 (10 min)** — `tree -L 2` shows `src/`, `tests/`, `deps/`, `utils/`, `redis.conf`. README says "in-memory data structure store." Makefile compiles everything in `src/` into one `redis-server` binary. Initial guess: single-binary, single-threaded event loop.
- **Step 2 (15 min)** — entry point is `main()` in `src/server.c`. Call chain: `main` → `initServer` → `aeMain` (the event loop). The library export is the **command table** in `src/commands.c`: every Redis command is a struct `{name, function, arity, flags}`. The spine: `aeMain` → `aeProcessEvents` → `readQueryFromClient` → `processCommand` → `<command>Command` (e.g., `setCommand`).
- **Step 3 (30 min)** — `make CFLAGS="-g -O0"`, run `redis-server`, attach `gdb -p <pid>`. Issue `SET foo bar` from `redis-cli`. Set breakpoints at `readQueryFromClient`, `processCommand`, `setCommand`, `addReply`. Step through; watch `client *c`: `c->argv[0]` is `SET`, `c->argv[1]` is `foo`, `c->argv[2]` is `bar`. `c->cmd` is resolved by `processCommand`'s lookup in the command table. The reply `+OK\r\n` is written to `c->buf` by `addReply`. You have now watched one command flow through the entire reactor.
- **Step 4 (30 min)** — `cloc src/` shows the largest files: `server.c` (8k LOC), `networking.c` (4k), `db.c` (2k), `t_string.c` / `t_list.c` / `t_hash.c` / `t_set.c` / `t_zset.c` (the type modules), `ae.c` (event loop, 700 LOC). Sketch the graph: `server.c` ↔ `networking.c` (bidirectional — there is no clean layering), `ae.c` is a leaf, the type modules depend on `db.c` and `object.c`. Cycle: `server.c` ↔ `networking.c`. Roots: `server.c`, `db.c`, `object.c` (read these first).
- **Step 5 (45 min)** — read `ae.c` in full (700 LOC). Module note:
  ```
  # Module: ae.c (src/ae.c, ~700 LOC)
  ## Responsibility
  Platform-abstracted event loop (epoll/kqueue/select) that dispatches file and time events.
  ## Public API
  aeCreateEventLoop, aeCreateFileEvent, aeCreateTimeEvent, aeMain, aeDeleteEventLoop, aeProcessEvents
  ## Internal invariants
  - Single-threaded by construction (no locks).
  - Time events processed in a single batch per iteration with a hard cap.
  - File events fire level-triggered (not edge-triggered).
  ## Dependencies
  Platform headers only (sys/epoll.h, sys/event.h, sys/select.h). True leaf.
  ## Failure modes
  Event-loop starvation if a time event runs long (the source of Redis's "latency spikes").
  ## Schema links
  S1 (state machine over file/time event queues), S6 (cache-line-aligned struct layout), S7 (single-threaded coordination).
  ```
- **Step 6 (45 min)** — modify: add a new command `HELLO.WORLD` returning `+WORLD\r\n`. Add `helloCommand` in `src/hello.c`, register it in the command table in `src/commands.c` (`{"hello.world", helloCommand, 2, 0, NULL, 1, 1, 1, 0, 0}`), rebuild, `redis-cli HELLO.WORLD` returns `WORLD`. First try: you forget the command-table registration; `redis-cli` returns `ERR unknown command 'hello.world'`. The diagnostic teaches you the registration pattern permanently.
- **Step 7 (15 min)** — schema dossier updates: S1 (ae.c event loop as a level-triggered state machine), S4 (eviction policies in evict.c), S6 (object.c small-string encoding), S7 (single-threaded model), S9 (type-dispatch via `obj->type` in object.c). Add rows to S1 and S9 dossiers with wikilinks to your module notes.

Total time: ~3 hours. You now have: a dependency graph sketch, a debugger-traced call spine, one full module note (`ae.c`), a working modification with a regression test in your local branch, and 5 schema dossier updates. The codebase is no longer a black box; the next session (probably `networking.c` or `db.c`) will be 30% faster because the spine and the schema links are already in place.

## Retrieval queue

#sr
- List the seven steps of P2 in order, with the time budget for each.
- Why does the protocol require a debugger trace (Step 3) rather than reading the entry point statically? Cite the relevant theory.
- Describe the module summary template (Step 5). Why is the "schema links" row the most important?
- You enter a 100k-LOC codebase with no docs. What is your first 30 minutes, step by step?
- The protocol's Step 7 says "most production systems instantiate 3-5 schemas at their core." Justify this claim using T1 and the structure of CS as a discipline.

---

## Cross-links

- Related protocols: [[04_Protocols/P1 — How to Read a Research Paper|P1 Read Paper]] (the codebase's design paper is often the best companion), [[04_Protocols/P4 — How to Learn a New System|P4 Learn System]] (P2 is Steps 3-6 of P4 in many cases), [[04_Protocols/P5 — How to Debug a System|P5 Debug]] (Step 3's trace is also P5 Step 4's bisect).
- Related schemas: [[02_Schemas/S1 — State & Transition|S1]], [[02_Schemas/S5 — Information Flow|S5]], [[02_Schemas/S6 — Memory & Locality|S6]], [[02_Schemas/S7 — Concurrency & Coordination|S7]], [[02_Schemas/S9 — Representation & Transformation|S9]] — the schemas most often instantiated by production codebases.
