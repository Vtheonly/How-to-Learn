---
aliases: [Mental Models, Schema Building Protocol]
tags: [schema, protocol]
---

# Building Robust Mental Models

---

## The Three Operations

(See [[MOC-Schema-Construction]] for the overview.)

### Operation 1 — Acquisition (new schema)

When you encounter a concept you have no schema for:

1. **Encounter**: read the definition + 2-3 examples
2. **Reformulate**: write the definition in your own words
3. **Generate examples**: produce 2-3 of your own
4. **Generate counter-examples**: things that *look* like the concept but aren't
5. **Find invariants**: what must be true for the concept to apply?
6. **Find boundary cases**: where does the concept break down?
7. **Name it**: give the schema a name in your notes (use the canonical name if it exists)

### Operation 2 — Elaboration (existing schema + new detail)

When you encounter new information about a concept you already have a schema for:

1. **Retrieve the existing schema**: close the source, write what you remember
2. **Identify the new detail**: what's the addition?
3. **Test for fit**: does this addition cohere with the existing schema? Does it contradict?
4. **Integrate**: write the updated schema, marking the new piece
5. **Re-derive implications**: what follows from the updated schema that didn't before?

### Operation 3 — Integration (connecting two schemas)

When you notice that two schemas you hold are related:

1. **Identify the relation**: are they the same schema in different forms? Does one specialize the other? Are they analogous (see [[Structure-Mapping-Theory]])?
2. **Build the bridge**: write a note explicitly connecting them (use [[Schema-Map-Note]] template)
3. **Identify shared structure**: what relations transfer?
4. **Identify divergence**: where do they differ?
5. **Update both schemas**: each should now reference the other

---

## Protocol: The Schema Acquisition Recipe

For each new concept you want to retain:

### Step 1 — Naming (1 min)
What is the canonical name? Are there aliases? (e.g., "consensus" / "agreement protocol" / "replicated state machine")

### Step 2 — Definition (5 min)
Write a precise definition in your own words. If you can't, you don't understand it yet. Use the [[Concept-Note-Template]].

### Step 3 — Worked example (10 min)
Find or construct one concrete example. Work through it. This is non-negotiable: a schema without an example is a definition, not a schema.

### Step 4 — Counter-example (5 min)
Construct something that *looks* like the concept but isn't. State precisely why it isn't. This sharpens the schema's boundaries.

### Step 5 — Invariants (5 min)
What must be true for the concept to apply? List 2-5 invariants.

### Step 6 — Boundary cases (5 min)
Where does the concept break down? What inputs are ambiguous? What scale does it fail at?

### Step 7 — Integration (10 min)
Connect to 2-3 existing schemas. What's similar? Different? Use the [[Schema-Map-Note]] template if integration is non-trivial.

### Step 8 — Retrieval (next day)
Close the note. Write what you remember. Compare.

### Step 9 — Application (within 1 week)
Find a way to apply the concept: implement it, use it in a design, identify it in someone else's code.

### Step 10 — Spaced retrieval (over months)
Add 2-3 cards to your [[Spaced-Repetition-Queue]].

Total time: ~45 min per concept, plus ongoing retrieval. Over 2 years, you'll have ~200-500 schemas — sufficient for senior-level expertise in most CS subdomains.

---

## Worked Example: Acquiring the "Write-Ahead Log" Schema

### Step 1 — Naming
"Write-Ahead Log" (WAL). Aliases: "redo log," "journal" (in filesystems), "transaction log."

### Step 2 — Definition
A WAL is an append-only sequence of records describing state changes, written *before* the corresponding state change is applied, used to recover consistent state after a crash.

### Step 3 — Worked example
PostgreSQL WAL: before updating a row, write a record "UPDATE row R to value V" to the WAL. If crash occurs before the update is flushed to the data file, replay the WAL on recovery.

### Step 4 — Counter-example
A database that writes updates to data files first, then to a log. This is a *write-behind log* — doesn't provide crash recovery. Many systems do this for performance (e.g., delayed write-back in filesystems), but it sacrifices durability.

### Step 5 — Invariants
- Append-only
- Writes are durable before the corresponding state change is committed
- Each record has a unique, monotonic sequence number (LSN)
- Recovery replays records in order

### Step 6 — Boundary cases
- What if the WAL itself is corrupted? (Need checksums.)
- What if a record is half-written at crash? (Need atomic write or recovery-time validation.)
- What if the WAL grows unboundedly? (Need checkpointing.)
- What if the WAL is on a slower device than the data? (Performance tradeoff.)

### Step 7 — Integration
- WAL isomorphic to: blockchain, event sourcing, message queue log, Paxos log, filesystem journal
- WAL specializes: persistent log (general)
- WAL differs from: snapshotting (which captures state, not changes)

### Step 8 — Retrieval (next day)
Close note. Write what you remember. (You'll likely forget boundary case #2.)

### Step 9 — Application
Implement a minimal KV store with WAL. Crash-test it.

### Step 10 — SR cards
- "What are the 4 invariants of a WAL?"
- "Why must WAL writes precede corresponding state changes?"
- "Name 4 systems that use a WAL."

---

## Common Failure Modes

- ❌ Building schemas without examples (yields brittle abstractions)
- ❌ Building examples without invariants (yields pattern-matching, not understanding)
- ❌ No integration with existing schemas (yields isolated fact islands)
- ❌ No retrieval practice (yields forgetting)
- ❌ No application (yields schemas that don't survive contact with reality)

---

## Cross-Links

- [[Schema-Theory-and-Anderson]] — the theory
- [[Concept-Note-Template]] — template for new schemas
- [[Schema-Map-Note]] — template for integrations
- [[Isomorphism-Detection]] — finding integrations
- [[Elaboration-Strategies]] — deepening existing schemas

← Back to [[MOC-Schema-Construction]]
