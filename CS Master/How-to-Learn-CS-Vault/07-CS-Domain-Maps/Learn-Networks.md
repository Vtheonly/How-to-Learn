---
aliases: [Learn Networks, Networks Learning Map]
tags: [domain-map, networks]
---

# 🗺️ Learn Networks



---

## Threshold Concepts

- **Layering** — why it works, when it leaks
- **Encapsulation** — headers at each layer
- **Reliability over unreliable medium** — TCP over IP
- **Addressing** — MAC, IP, port; the differences
- **The end-to-end principle** — Saltzer, Reed, Clark (1984)
- **Multiplexing** — time, frequency, statistical
- **The sliding window** — flow control and reliability in one mechanism
- **The DNS hierarchy** — and why it's surprisingly hard
- **The HTTP request/response cycle** — and how it's evolved (HTTP/2, /3)

---

## Canonical Sources (Tier 1 — read deeply)

- **Kurose & Ross, *Computer Networking: A Top-Down Approach*** — the modern standard
- **Stevens, *TCP/IP Illustrated, Volume 1: The Protocols*** — the canonical deep dive
- **RFC 1122, 1123** — Host Requirements (the foundational RFCs)
- **RFC 793** — TCP (original, but read 9293 for current)

---

## Reference Index (Tier 2 — on demand)

- RFC 1180 — A TCP/IP Tutorial
- *Unix Network Programming* (Stevens et al.) — sockets API reference
- *High Performance Browser Networking* (Grigorik) — modern web
- Aphyr's blog (aphyr.com) for distributed systems networking
- BEEJ's Guide to Network Programming (free, for socket programming)

---

## Common Failure Modes

- **Reading without implementing.** Implement TCP, HTTP, DNS — at least minimal versions.
- **Skipping the OSI model.** Yes, it's criticized; learn it anyway.
- **Ignoring the wire format.** Use Wireshark; see actual packets.
- **Treating "networking" as "web."** Web is one application of networking.
- **Not understanding TCP.** TCP is the most important protocol; understand it deeply.

---

## Build Projects

1. Implement a basic TCP stack (in userspace, on top of raw IP) — *hard, but transformative*
2. Implement an HTTP/1.1 server from scratch (no library)
3. Implement a DNS resolver
4. Build a simple load balancer (round-robin + health checks)
5. Implement a basic chat server (WebSocket)
6. Use Wireshark to capture and analyze your own traffic
7. Implement a tiny VPN (TUN/TAP interface)

---

## Triage Shortcuts

- Kurose-Ross first (top-down, easier)
- Then Stevens Vol. 1 for TCP depth
- Use Wireshark constantly — seeing packets makes everything concrete
- Read RFCs only after you have the schema; RFCs are too dense for first exposure
- Beej's Guide for socket programming

---

## Estimated Time

**200-400 hours** for solid network competence.
~9 months at 10 hours/week.

Prerequisite: systems programming.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
