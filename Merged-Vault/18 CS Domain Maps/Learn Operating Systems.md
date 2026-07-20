---
aliases: [Learn Operating Systems, Operating Systems Learning Map]
tags: [domain-map, operating-systems]
---

# 🗺️ Learn Operating Systems



---

## Threshold Concepts

- **The process abstraction** — virtual CPU + virtual memory + open files
- **Virtual memory** — pages, page tables, TLBs, demand paging
- **System calls vs function calls** — the kernel/user boundary
- **Context switching** — what it actually costs
- **Scheduling** — preemptive, fair, real-time; the trade-offs
- **Concurrency primitives** — locks, semaphores, condition variables
- **The file abstraction** — bytes, seek, file descriptors
- **The page cache** — why disk I/O is faster than it looks
- **The fork/exec distinction** — Unix process creation

---

## Canonical Sources (Tier 1 — read deeply)

- **OSTEP** (Remzi Arpaci-Dusseau) — free, modern, the best intro
- **Silberschatz, Galvin, Gagne, *Operating System Concepts*** (the "dinosaur book") — comprehensive reference
- **Tanenbaum & Woodhull, *Operating Systems: Design and Implementation*** — MINIX-based; instructive
- **Bovet & Cesati, *Understanding the Linux Kernel*** — for Linux specifically

---

## Reference Index (Tier 2 — on demand)

- *Linux Kernel Development* (Love) — practical kernel internals
- *The Design of the UNIX Operating System* (Bach) — classic
- Linux man pages (especially `man 2`)
- LWN.net for current kernel topics
- OSDev wiki (for writing your own OS)

---

## Common Failure Modes

- **Reading OS books without implementing.** Read OSTEP chapter, then implement the concept.
- **Treating "OS course" as enough.** Build a real OS, or at least modify one.
- **Avoiding the kernel source.** Read Linux kernel code; it's instructive.
- **Not using strace/ltrace/perf.** These tools reveal what the OS is actually doing.
- **Skipping concurrency.** Concurrency is the hardest OS topic; don't skip it.

---

## Build Projects

1. Implement a basic shell (parsing, fork/exec, pipes, redirects)
2. Implement a tiny log-structured filesystem (FUSE)
3. Implement a userspace thread library (ucontext-based)
4. Build a minimal OS (OSDev wiki; xv6 modifications)
5. Implement a simple page replacement simulator (compare FIFO, LRU, LFU)
6. Add a syscall to xv6 or Linux
7. Implement a basic scheduler with MLFQ

---

## Triage Shortcuts

- OSTEP first, then Silberschatz for completeness
- For each OSTEP chapter, do the corresponding homework
- xv6 source code is the best "real OS" to read
- Linux kernel source is too complex for beginners; use xv6 first
- Read `man 2` pages alongside textbooks

---

## Estimated Time

**300-500 hours** for solid OS competence.
~12 months at 10 hours/week.

Prerequisite: systems programming (C).

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
