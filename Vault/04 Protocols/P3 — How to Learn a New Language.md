---
type: Protocol
tags: [Protocol]
created: 2026-07-20
updated: 2026-07-20
---

# P3 — How to Learn a New Language

> You do not learn a language by memorizing its syntax — you learn it by implementing five canonical programs in it, comparing each to a language you already know, and isolating the features that are genuinely new.

**When to use:** Adding a new programming language to your working set (Rust, Kotlin, Elixir, OCaml, Zig, etc.). Not for adding a library or framework in a language you already know.
**Inputs:** A known base language you are fluent in (the "base"), a target language with a syntax overview and a working toolchain, 1-2 weeks.
**Outputs:** 5 canonical implementations with side-by-side comparison to the base language, an idioms note, a comparison table, and a small OSS contribution or PR.
**Time:** 1-2 weeks at ~1 hour/day; the first 3-4 hours are the highest leverage.

---

## Steps

### Step 1 — Pick a base language (5 min)

Choose **one** language you are already fluent in as the base. Fluency means: you can implement a hash map, a parser, and a small HTTP server from memory. The base provides the relational structure that the new language will hang from — without a base, every new construct is a fact without a hook, and facts without hooks decay (see [[01_Theory/T1 — Schema Transfer|T1]]).

If you are fluent in two languages, pick the one **most different in paradigm** from the target. Learning Rust? Pick a non-systems base (Python or Haskell) so the comparison highlights Rust's uniqueness. Learning Haskell? Pick an imperative base (Python or Go) so the comparison highlights purity and laziness.

Concrete example — learning Rust, base = Python. The contrast highlights: ownership (no analog in Python), borrowing (no analog), traits vs. duck typing, algebraic data types vs. classes, `Result`/`Option` vs. exceptions/`None`.

Record the base and target in your note. The base choice is load-bearing; do not skip it.

### Step 2 — Skim the syntax overview, note differences only (30 min)

Read the language's official tour or "Learn X in Y Minutes" page. **Do not** study syntax comprehensively. **Do not** memorize operator precedence. Capture only:

- **What is structurally identical to the base** (e.g., `if`, `for`, function definition). Skip these.
- **What is structurally different** (e.g., pattern matching, ownership, async syntax). Note each.
- **What has no analog in the base** (e.g., Rust's lifetimes, Haskell's type classes, Elixir's macros). Mark these for Step 5.

Resist the urge to write a comprehensive syntax cheat sheet. Syntax memorized in isolation does not transfer (see [[03_Methods/M1 — Retrieval Practice|M1]] §5). The 5 canonical programs in Step 3 will surface the syntax you actually need, in context.

Concrete example — Rust vs. Python differences (after 30 min skim):

| Construct | Python | Rust | Note |
|-----------|--------|------|------|
| Variable binding | `x = 5` | `let x = 5;` | immutable by default in Rust |
| Type annotation | optional | `let x: i32 = 5;` | often inferred |
| Function | `def f(x):` | `fn f(x: i32) -> i32 {` | types required |
| Error handling | `try/except` | `Result<T, E>` + `?` | no exceptions |
| Pattern matching | `match` (3.10+) | `match x { ... }` | first-class, exhaustive |
| Ownership | n/a | `&`, `&mut`, move semantics | no analog |

The last row is the most important: Rust's ownership has no analog in Python. That marks it as the load-bearing concept to study in Step 5.

### Step 3 — Implement 5 canonical programs (4-8 hours over a week)

Implement, in the target language, with no copy-paste from tutorials:

1. **Hello world + CLI args** — exercise the toolchain, build, run, parse argv.
2. **File I/O: word count** — read a file, count lines/words/chars, write the result. Exercise the standard library's I/O and string handling.
3. **HTTP server** — implement a single-route server (`GET /` returns "hello"). Exercise the concurrency model (thread? async? actor?) and the standard library's networking.
4. **Sort + benchmark** — implement quicksort (or mergesort) on 1M random integers; benchmark it. Exercise the language's performance characteristics and how to write idiomatic data-structure code.
5. **A simple data structure** — implement a hash map (or a balanced BST) from scratch. Exercise the language's type system, generics, and memory model.

For each program, write the target version **first**, then write the equivalent in your base language if you do not have it on hand. The point is the comparison in Step 4, not the implementations themselves.

Concrete example — learning Rust, program 3 (HTTP server):

```rust
use std::net::TcpListener;
use std::io::{Read, Write};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    for stream in listener.incoming() {
        let mut stream = stream.unwrap();
        let mut buf = [0u8; 1024];
        stream.read(&mut buf).unwrap();
        let response = "HTTP/1.1 200 OK\r\n\r\nhello";
        stream.write(response.as_bytes()).unwrap();
    }
}
```

The Python equivalent is 3 lines with `http.server`. The contrast surfaces: (a) Rust forces you to handle the `Result` of every I/O call, (b) buffer management is explicit (no "read until EOF" sugar), (c) the `for stream in listener.incoming()` loop is single-threaded by default — adding concurrency requires explicit `std::thread::spawn` or async.

This step is generative production at scale — see [[03_Methods/M8 — Generative Production|M8]]. Producing the 5 programs forces engagement with the language's actual semantics, not its surface syntax.

### Step 4 — Compare each implementation to the base language (1-2 hours)

For each of the 5 programs, lay out the two implementations side by side. For each construct, ask:

- **What is structurally the same?** (The algorithm, the I/O sequence, the data flow.) This is the schema; it transfers.
- **What is surficially different?** (Syntax, naming, library calls.) Mark as surface; ignore for transfer.
- **What is genuinely different?** (Memory model, error model, concurrency model, type system.) These are the load-bearing differences; record them prominently.

Build a comparison table in your note, one row per program, with columns: program, same (schema), different (surface), different (load-bearing).

Concrete example — Rust vs. Python, program 5 (hash map):

| Aspect | Python | Rust | Category |
|--------|--------|------|----------|
| Algorithm (chaining or open addressing) | same | same | schema (S6, S9) |
| Hash function | built-in | `std::collections::hash_map::DefaultHasher` | surface |
| Memory ownership of values | GC manages | caller owns; `HashMap<K, V>` owns K and V | load-bearing |
| Generic types | duck-typed | `HashMap<K, V>` with trait bounds `K: Hash + Eq` | load-bearing |
| Handling collisions | hidden | explicit (you write the probing) | surface if using std; load-bearing if from-scratch |
| Resize strategy | amortized doubling | amortized doubling | schema (S4: amortized analysis) |

The load-bearing differences (ownership, generics with trait bounds) are what makes Rust *Rust* and not Python with different syntax. They are the only things you need to study deeply in Step 5.

This step is the engine of [[03_Methods/M6 — Analogical Comparison|M6]]: the side-by-side layout forces relational alignment, and the schema vs. surface distinction is the active ingredient.

### Step 5 — Identify language-unique features; study idiomatic usage (2-3 hours)

From the "load-bearing differences" in Step 4, pick the 2-3 features that have **no analog in the base**. For each:

- Read the canonical documentation (often a dedicated chapter in the language's book).
- Find 3-5 idiomatic uses in real code (search GitHub, read the standard library's source).
- Write a one-paragraph summary: "Feature X is the language's answer to [problem Y], which in the base is handled by [Z]. The idiomatic usage is [pattern]."

Concrete example — Rust unique features:

1. **Ownership and borrowing.** Rust's answer to memory safety without GC. The base (Python) handles this via GC and reference counting. Idiomatic: prefer `&T` borrows over `String`/`Vec` clones; use `Cow<'a, str>` for "maybe borrowed, maybe owned"; lifetime annotations on structs that hold references.
2. **Traits.** Rust's answer to ad-hoc polymorphism, analogous to Haskell type classes and roughly to Python's duck typing + ABCs. Idiomatic: prefer `impl Trait` and trait bounds over `Box<dyn Trait>` (static dispatch where possible); use `where` clauses for complex bounds; traits compose via supertraits.
3. **Algebraic data types (`enum` + `match`).** Rust's answer to representing data with alternatives. The base (Python) uses class hierarchies or tagged dicts. Idiomatic: model every domain type as an `enum` when there are alternatives; rely on exhaustive `match` to enforce handling of every variant; never use `if let` when `match` would surface missing cases.

For each feature, write a short code snippet that you would not have written in the base language. This is the *only* syntax worth memorizing; it is the syntax of features that make the language itself.

### Step 6 — Read 1 small open-source project in the language (3-4 hours)

Find a small, well-regarded project (≤10k LOC) in the target language. Apply [[04_Protocols/P2 — How to Read Source Code|P2]] to it. The goal is not to understand the project deeply but to **absorb idioms**: how do experienced users of the language structure modules, name functions, handle errors, organize tests?

Pay particular attention to:

- Patterns you would not have written (these are idioms you do not yet have).
- Patterns you would have written differently (these are transferable from your base).
- Places where the code looks "weird" or "too clever" (these are local idioms worth understanding before adopting).

Concrete example — learning Rust, reading `ripgrep` (or a small subset, since the full tree is large). The idioms that surface: `?` for error propagation everywhere; `Cow<str>` for performance-critical string handling; `tracing` crate for structured logging; `clap` derive macros for CLI; `impl Iterator` for lazy streams. Note 3-5 idioms to adopt; note 1-2 you find unidiomatic to your taste and would not adopt.

### Step 7 — Contribute a small PR (4-8 hours, spread over a week)

Find an OSS project in the language with `good-first-issue` tags. Pick an issue that is small (a few hours of work) but real (touches the codebase, not just docs). Implement it. Run the project's CI locally. Open the PR. Respond to review comments. Get it merged (or rejected — both are learning).

The PR forces you to:

- Use the project's toolchain, not your own.
- Match the project's idioms (reviewers will push back on foreign patterns).
- Handle the project's error model, test conventions, and commit-message style.
- Engage with a real maintainer, who will give you feedback a tutorial never would.

This step is the highest-ROI activity in the protocol. Reading tutorials gives you familiarity; opening a PR gives you fluency. The PR's review feedback is targeted exactly at your frontier — the gap between what you wrote and what an experienced user would have written.

If no OSS project fits, the alternative is to **reimplement a small library** you use (e.g., reimplement `clap`'s basic functionality, or a simple regex engine). The bar is: produce something that another user could run, with tests, and ship it (GitHub, crates.io, npm, etc.).

---

## Common traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Learning syntax as the primary thing | You can write a `for` loop but cannot implement a hash map. | Step 3's 5 programs force semantic engagement; syntax is acquired in context. |
| Not implementing, only reading | You finish 3 tutorials and cannot write a server. | Step 3 is non-negotiable; reading without writing produces illusions of competence. |
| Reading tutorials without writing | You "understand" the tutorial but cannot reproduce it. | Close the tutorial after each section; reproduce from memory; check. |
| Not leveraging transfer | You start from scratch as if Python never existed. | Step 1 (pick a base) and Step 4 (comparison table) are the transfer engine; without them everything is new. |
| Memorizing APIs | You can recite the standard library but cannot use it. | Look up APIs as needed during Step 3; do not memorize out of context. |
| Skipping the PR step | You "know" the language but have never shipped code in it. | Step 7 is the difference between familiarity and fluency; a merged PR is the bar. |
| Choosing a too-similar base | Learning Kotlin with Java as base — the comparison surfaces nothing. | Choose a base from a different paradigm; the contrast is the engine. |
| Choosing a too-different base | Learning Rust with Prolog as base — comparison is impossible. | The base must share enough structure (imperative, sequential, procedural) to map onto. |
| Skipping the idioms step | Your code "works" but reads like Python transliterated to Rust. | Step 5 (unique features) and Step 6 (read OSS) are what make your code idiomatic. |
| Stopping after one program | You implement hello world, declare victory, never build the server. | The 5-program set is chosen to surface distinct language features; stopping early misses load-bearing differences. |

## Linked methods

- [[03_Methods/M6 — Analogical Comparison|M6]] — Step 4's comparison table is the engine of transfer.
- [[03_Methods/M3 — Interleaving|M3]] — The 5 programs interleave distinct language features (I/O, concurrency, generics, memory), preventing rote single-feature study.
- [[03_Methods/M8 — Generative Production|M8]] — Steps 3, 6, and 7 are generative production at increasing scale.
- [[03_Methods/M5 — Elaboration & Self-Explanation|M5]] — Step 5's "feature X is the language's answer to Y" is elaborative self-explanation.
- [[03_Methods/M1 — Retrieval Practice|M1]] — Reimplement the 5 programs from memory one week later as retrieval practice.
- [[03_Methods/M2 — Spaced Repetition|M2]] — Schedule the idiom notes for retrieval at 1 week, 1 month, 3 months.

## Linked theory

- [[01_Theory/T1 — Schema Transfer|T1]] — The base language provides the relational structure that the new language hangs from.
- [[01_Theory/T2 — Cognitive Load Theory|T2]] — Memorizing syntax out of context imposes extraneous load; the 5 programs keep load intrinsic.
- [[01_Theory/T5 — Expert-Novice Differences|T5]] — Experts see the schema (algorithm, I/O sequence); novices see the surface (syntax). Comparison trains expert perception.
- [[01_Theory/T7 — Generative Learning|T7]] — Producing the 5 programs is generative; reading tutorials is not.
- [[01_Theory/T4 — Long-Term Working Memory|T4]] — Idioms (Step 5) and project patterns (Step 6) become the LT-WM chunks that make you fluent.

## Retrieval queue

#sr
- List the seven steps of P3 in order. Why is Step 1 (pick a base) load-bearing rather than ceremonial?
- Why does the protocol forbid comprehensive syntax study in Step 2? Which theory justifies this, and what is the failure mode if you violate it?
- Name the five canonical programs of Step 3 and the language feature each is designed to surface.
- Step 4 asks you to classify differences as "schema," "surface," or "load-bearing." Give an example of each from a language comparison of your choice.
- Why is the PR step (Step 7) the highest-ROI activity in the protocol? Contrast it with reading tutorials in terms of generative production (M8) and feedback.

---

## Cross-links

- Related protocols: [[04_Protocols/P2 — How to Read Source Code|P2 Read Source]] (Step 6 uses P2 to read an OSS project), [[04_Protocols/P4 — How to Learn a New System|P4 Learn System]] (a language's runtime is often a system worth learning via P4), [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]] (Step 4's "schema" column feeds P7).
- Related schemas: [[02_Schemas/S1 — State & Transition|S1]] (the concurrency model), [[02_Schemas/S6 — Memory & Locality|S6]] (the memory model), [[02_Schemas/S9 — Representation & Transformation|S9]] (the type system), [[02_Schemas/S10 — Search & Inference|S10]] (pattern matching as search).
