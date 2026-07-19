---
aliases: [Learn Systems Programming, Systems Programming Learning Map]
tags: [domain-map, systems-programming]
---

# 🗺️ Learn Systems Programming



---

## Threshold Concepts

- **Pointers and memory layout** — the C model
- **The stack vs the heap** — and the consequences of each
- **Undefined behavior** — what it is, why it exists, why it's terrifying
- **Calling conventions** — how function calls actually work
- **System calls** — the boundary between user and kernel
- **Concurrency primitives** — mutexes, condition variables, atomics
- **Memory models** — what the CPU is allowed to reorder
- **Compilation pipeline** — preprocess, compile, assemble, link

---

## Canonical Sources (Tier 1 — read deeply)

- **Kernighan & Ritchie, *The C Programming Language*** (2nd ed.) — short, dense, canonical
- **Bryant & O'Hallaron, *Computer Systems: A Programmer's Perspective*** (CS:APP) — the canonical systems book
- **Ousterhout et al., OSTEP** (free, https://pages.cs.wisc.edu/~remzi/OSTEP/) — for OS concepts
- **Josephus, *Advanced Programming in the UNIX Environment*** (3rd ed., Stevens et al.) — POSIX API reference

---

## Reference Index (Tier 2 — on demand)

- *The C Programming Language* solutions and exercises
- Preshing's blog on memory models and atomics (preshing.com)
- Drepper's *What Every Programmer Should Know About Memory*
- *CppCon* talks on memory ordering (Albright, Williams)

---

## Common Failure Modes

- **Learning C without writing C.** You cannot learn systems programming by reading.
- **Avoiding pointers.** Pointers are the threshold. If you avoid them, you never cross.
- **Treating segfaults as "bugs to suppress."** A segfault is information. Read it.
- **Using higher-level languages as a crutch.** Python/Go/Rust hide the system. Learn C first.
- **Ignoring valgrind/ASAN.** Memory safety tools teach you what you're doing wrong.
- **Not reading assembly.** You don't need to write it, but you must read it occasionally.

---

## Build Projects

1. Implement a basic malloc/free (CS:APP malloc lab)
2. Implement a shell (CS:APP shell lab)
3. Implement a tiny HTTP server in C (using raw sockets)
4. Implement a concurrent queue using atomics only (no mutex)
5. Implement a simple thread pool
6. Implement a basic proxy server (CS:APP proxy lab)
7. Write a tiny filesystem in FUSE

---

## Triage Shortcuts

- Always compile with `-Wall -Wextra -Werror -fsanitize=address,undefined`
- Use valgrind for memory debugging
- Use `gdb` (not print statements) for serious debugging
- Read `strace` output to understand syscalls
- For concurrency: start with mutexes, then atomics, then lock-free (in that order)

---

## Estimated Time

**200-400 hours** for solid C/systems competence.
~9 months at 10 hours/week.

Prerequisite: basic algorithms + some OS exposure.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
