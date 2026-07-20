---
aliases: [Build to Learn, Implementation as Learning, Build First]
tags: [workflow, build]
---

# Build to Learn

> *Implementation is the highest form of retrieval. It reveals every gap in your schema.*

---

## Principle

Reading a paper tells you what the author *says*. Implementing it tells you what they *meant*. The gaps in your understanding become apparent the moment you try to translate abstract claims into working code.

Build-to-learn is the deliberate use of implementation as a learning method. It's not "learning by doing" in the vague sense; it's a specific protocol:

1. Learn a concept (read paper, study chapter)
2. *Immediately* (within 1 week) build a minimal version
3. Build *from scratch*, without reference to existing implementations
4. Compare your implementation to a reference
5. Document the gaps

This is the [[Testing-Effect-Retrieval-Practice|testing effect]] scaled up to entire systems. Implementation is high-effort retrieval.

---

## CS Translation

In CS, "building" is cheap relative to other fields. You can implement a Paxos-like consensus algorithm in 200 lines of code in a weekend. You can implement a B-tree in 500 lines in a day. The cost is low enough that you should *always* implement what you learn.

Compare to physics (you can't build a particle accelerator in your garage) or chemistry (you can't easily synthesize compounds). CS is unusual in that the implementation cost is so low that not building is a waste.

---

## Protocol: Build-to-Learn Cycle

### Step 1 — Identify the build target

After learning a concept, identify the minimal interesting build:

- For an algorithm: implement it
- For a data structure: implement it with full CRUD
- For a system: implement a minimal version (KV store, scheduler, parser)
- For a paper: reproduce one experiment or implement the core algorithm
- For a protocol: implement both ends (client + server)

Constraint: **the build should be small enough to complete in 4-12 hours of focused work.** Larger builds should be decomposed.

### Step 2 — Build from scratch

Critical: *do not* read an existing implementation first. Build from your understanding of the concept. The gaps in your understanding *are the point*.

Allowed:
- The original paper / textbook chapter
- Standard library documentation
- Your own notes from when you learned the concept

Forbidden:
- Existing implementations (Redis, PostgreSQL, etc.)
- Tutorials that walk through the implementation
- LLM-generated code for the core algorithm (use LLM only for boilerplate)

### Step 3 — Run into walls

You will get stuck. *This is the learning*. Common walls:

- "I don't understand the algorithm well enough to implement it"
- "The paper doesn't specify X — what should I do?"
- "My implementation works on the happy path but fails on edge cases"
- "Performance is terrible — where's the bottleneck?"

For each wall:
1. Articulate precisely what you don't understand
2. Re-read the relevant section of the source
3. If still stuck, *now* consult an existing implementation for *that specific part*
4. Continue

### Step 4 — Test against a reference

Once your implementation works on your tests:

1. Find a reference implementation (e.g., for Paxos, etcd's implementation)
2. Generate test cases (random inputs, edge cases, stress tests)
3. Run both implementations
4. Compare outputs
5. Where they differ, find the bug (could be in yours or in the reference)

This is the *feedback* that closes the loop.

### Step 5 — Document the gaps

After completing the build, write a [[Project-Implementation-Log]] entry:

```markdown
## Project: <name>
- Concept: <what schema this build consolidated>
- Time: <X hours>
- What I got wrong:
  - <gap 1>
  - <gap 2>
- What the reference taught me:
  - <insight 1>
  - <insight 2>
- What's still unclear:
  - <question 1>
- Next build: <related concept to build next>
```

The "what I got wrong" list is the learning. Without it, you've built but not learned.

---

## Worked Example: Building a B-tree

### Step 1 — Target
Implement a B+tree of order 4 with insert, search, range query. (~6 hours.)

### Step 2 — Build from scratch
- Read the Wikipedia article on B+trees
- Implement node structure
- Implement search (easy)
- Implement insert (hard — splits propagate up)
- Implement range query (medium)

### Step 3 — Walls hit
- "What happens when the root splits? I need a new root."
- "How do I handle leaf links in a B+tree?"
- "What's the right invariant for the number of children?"

Each wall → re-read Wikipedia → continue.

### Step 4 — Test against reference
- Use Python's `sqlite3` to create a B-tree index
- Generate 10,000 random key-value pairs
- Insert into both
- Compare range queries
- Find: your implementation returns different results for empty ranges

### Step 5 — Document gaps
- "I forgot to handle empty key sets in range queries"
- "I didn't realize leaf links in B+trees are bidirectional in some implementations"
- "I still don't understand the deletion algorithm — that's the next build"

After this build, your B+tree schema is *robust*. You'll never forget the algorithm because you've fought with it.

---

## The Build Curriculum

For each CS subdomain, 3-5 builds produce solid competence. See [[MOC-Domain-Maps]] for specific build suggestions per domain.

A 4-year curriculum should produce 30-50 substantial builds. Each one consolidates 1-3 schemas permanently.

---

## Anti-Patterns

- ❌ Reading existing implementations before building — defeats the purpose
- ❌ Using LLMs for the core algorithm — defeats the purpose
- ❌ Skipping Step 5 (documentation) — you'll forget the gaps
- ❌ Not finishing — incomplete builds teach less than half of complete ones
- ❌ Building too large — 4-12 hours is the sweet spot
- ❌ Building without testing against a reference — no feedback

---

## Cross-Links

- [[Testing-Effect-Retrieval-Practice]] — the underlying mechanism
- [[Deliberate-Practice]] — build-to-learn is the operational form for CS
- [[Project-Implementation-Log]] — template for tracking builds
- [[MOC-Domain-Maps]] — build suggestions per domain

← Back to [[MOC-Workflows]]
