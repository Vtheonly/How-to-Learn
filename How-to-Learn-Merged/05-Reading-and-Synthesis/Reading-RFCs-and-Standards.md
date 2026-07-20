---
aliases: [RFC Reading, Standards Reading]
tags: [reading, protocol, rfc]
---

# Reading RFCs and Technical Standards

---

## The Problem with RFCs

RFCs are written by committees, for implementers, with extreme precision. They optimize for *unambiguity*, not *readability*. Implications:

- Prose is dense and conditional ("If X and not Y, then Z, unless W")
- Normative language (MUST, SHOULD, MAY) carries precise meaning (RFC 2119)
- The "interesting" content is scattered; the boring content is upfront
- Examples are minimal
- The rationale is often omitted (see the obsoleted-by chain for the original intent)

Reading an RFC linearly is the worst possible approach.

---

## Protocol: Reading an RFC

### Phase 0 — Context (5 min)

Before opening the RFC, gather:

- **What problem does it solve?** (Wikipedia or a blog post first — never RFC-first)
- **What is its status?** (Standards Track? Informational? Historic? Obsoleted?)
- **What does it obsolete/update?** (Read the *latest* version, not the original)
- **What does it depend on?** (Normative references in §2 — read those summaries first)

### Phase 1 — Topology (10 min)

Open the RFC. Read in this order:

1. **Title and abstract** — what is this?
2. **Table of contents** — how is it structured?
3. **Terminology section** — definitions of MUST/SHOULD/MAY (RFC 2119), plus any domain terms
4. **Last section (Security Considerations)** — usually reveals the failure modes the protocol was designed around
5. **Appendices** — often contain the worked examples and state machines

### Phase 2 — State Machine (15-30 min)

Most RFCs describe a state machine (TCP, TLS, BGP, OSPF, etc.). Extract it:

1. List all states (often in §"State Machine" or §"Connection States")
2. List all events/messages that cause transitions
3. List all actions on each transition
4. Draw the state diagram yourself, on paper or in Mermaid

The state diagram is the *operational* content of the RFC. Everything else is justification, edge cases, and encoding details.

### Phase 3 — On-Reference Reading (varies)

Read sections deeply only when:

- You're implementing that part
- You're debugging a behavior the RFC describes
- You're writing a test that needs the exact wire format

Do not read encoding details (packet layouts, byte orders) end-to-end unless you're implementing. Skim them otherwise; refer back when needed.

### Phase 4 — Companion Reading

For each RFC, find:

- The corresponding Wikipedia article (gentler intro)
- A reference implementation (e.g., Linux kernel source for TCP)
- A critique or "experience report" (often an IETF draft or a blog by an implementer)
- The original rationale (search for the IETF mailing list discussion or the precursor workshop paper)

These provide the *why* the RFC omits.

---

## Worked Example: Reading RFC 793 (TCP)

**Naive**: Read 85 pages linearly. Take 6 hours. Retain ~20%.

**Protocol-driven**:

- Phase 0 (5 min): TCP provides reliable, ordered, byte-stream delivery over IP. Status: Internet Standard. Obsoleted partially by RFC 1122, 7323, etc.
- Phase 1 (10 min): TOC + terminology. Note: "state machine" is implied by §3.4.
- Phase 2 (45 min): Extract the connection state machine. Draw it:

```mermaid
stateDiagram-v2
    [*] --> CLOSED
    CLOSED --> SYN-SENT: active OPEN
    CLOSED --> LISTEN: passive OPEN
    LISTEN --> SYN-RCVD: recv SYN
    SYN-SENT --> SYN-RCVD: recv SYN,ACK / send ACK
    SYN-SENT --> ESTABLISHED: recv SYN,ACK / send ACK
    SYN-RCVD --> ESTABLISHED: recv ACK
    ESTABLISHED --> FIN-WAIT-1: CLOSE / send FIN
    FIN-WAIT-1 --> FIN-WAIT-2: recv ACK
    FIN-WAIT-2 --> TIME-WAIT: recv FIN / send ACK
    TIME-WAIT --> CLOSED: timeout 2MSL
    ESTABLISHED --> CLOSE-WAIT: recv FIN / send ACK
    CLOSE-WAIT --> LAST-ACK: CLOSE / send FIN
    LAST-ACK --> CLOSED: recv ACK
```

- Phase 3 (as needed): Skip §2.6-2.8 (interface details) unless implementing. Skip §3.1 (header format) unless debugging wire format.
- Phase 4 (30 min): Read Stevens *TCP/IP Illustrated Vol. 1* chapter on TCP; check Linux `net/ipv4/tcp_*.c` for an implementation.

Total: ~2 hours. Retention: ~70%, focused on the operationally important parts.

---

## RFC-Specific Heuristics

- **MUST = non-negotiable; SHOULD = default; MAY = optional.** If you're implementing, treat SHOULD as MUST unless you have a documented reason.
- **If an RFC has been updated multiple times, read the latest version + the diff**. The diffs often reveal the actual implementation problems people hit.
- **Security Considerations sections are non-skippable.** They reveal the failure modes the protocol designers anticipated. Often more illuminating than the main body.
- **IANA Considerations** can be skipped unless you're registering something.
- **Appendices often contain the canonical state machines and examples.** Read them first.

---

## Cross-Links

- [[Schema-Driven-Querying]] — RFCs are query-driven par excellence
- [[Three-Pass-Reading-Protocol]] — RFC's topology phase is essentially pass 1
- [[Reading-Codebases-Systematically]] — RFC + reference implementation = full understanding
- [[Concept-Note-Template]] — for the state machine note you'll produce

← Back to [[MOC-Reading-and-Synthesis]]
