---
aliases: [Modern Practitioners, Karpathy, tptacek, Bret Victor]
tags: [case-study, modern]
---

# Modern Practitioners

> *Contemporary CS practitioners who have publicly documented their learning workflows.*

---

## Andrej Karpathy

Former Director of AI at Tesla, OpenAI founding member. Known for extraordinarily clear pedagogy (CS231n lectures, "Neural Networks: Zero to Hero" series, minbpe, nanoGPT).

### Documented patterns
- **Read the original paper, then implement from scratch.** For each major ML architecture (Transformer, RNN, GAN), Karpathy reads the paper, then writes a minimal implementation in pure NumPy/PyTorch.
- **Minimal implementations as understanding.** His `minGPT`, `nanoGPT`, `micrograd` are deliberately small (300-600 lines) — small enough to read in one sitting. The size constraint forces clarity.
- **Teach to learn.** Each topic he learns, he teaches (lectures, blog posts). The teaching forces schema clarity.
- **Build the simplest possible version that works.** Avoid "enterprise" architecture; expose the core algorithm.
- **Long-form deep dives.** Multi-hour videos working through a single topic, no editing, real-time thinking.

### Extracted protocol
- For each new architecture: read paper → minimal implementation → blog/lecture
- Constrain implementations to ~500 LOC
- Teach every concept you learn

---

## Thomas Ptacek (tptacek)

Security researcher, founder of Matasano (now NCC Group), author of the Cryptographic Right Answers and frequent HN contributor.

### Documented patterns (from HN comments and blog posts)
- **Read the source.** For any security-relevant system, read the implementation. Documentation lies; source doesn't.
- **Read old papers and old code.** Security hasn't changed much in 30 years; the foundations are old.
- **Adversarial reading.** For any new "secure" system, ask: "How would I break this?" before reading why it's secure.
- **Be skeptical of new crypto.** Most new crypto is wrong. Stick to NaCl, libsodium, well-vetted primitives.
- **Don't optimize for credentialing.** Industry certifications (CISSP etc.) are noise. Build things, find bugs, write about them.

### Extracted protocol
- For security topics: read source code first, then papers
- Adopt an adversarial stance: how would this fail?
- Prefer old, vetted material over new
- Build and break things; the writing follows

---

## Bret Victor

Designer, researcher, former Apple Human Interface designer. Known for "Inventing on Principle," "Learnable Programming," and dynamic representations.

### Documented patterns
- **Climb the ladder of abstraction.** ([http://worrydream.com/LadderOfAbstraction/](http://worrydream.com/LadderOfAbstraction/)) For any concept, explore it at multiple levels of abstraction, with multiple representations.
- **Build the tool that lets you think the thought.** When you can't think a thought because the medium doesn't support it, build the medium first.
- **Multiple simultaneous representations.** Code + visual + timeline + spatial. Each representation reveals what others hide.
- **Demonstrations over explanations.** Where possible, *show* the system in action rather than describe it.
- **Long arcs on principles.** Victor works on single principles (reactive representations, dynamic media) for years.

### Extracted protocol
- For each concept: explore at multiple abstraction levels
- Build tools when existing tools constrain your thinking
- Use multiple representations (visual, code, math, narrative) simultaneously
- Demonstrate, don't just explain

---

## Patrick Collison (Stripe co-founder, reading list curator)

### Documented patterns
- **Read the canon.** Collison maintains a famous reading list (patio-stripe-internal, now partly public) of foundational CS and engineering works.
- **Read the original source.** For any concept, find the original paper or book, not the derivative explanation.
- **Track what you read.** He's spoken about maintaining reading logs since his teens.
- **Read across fields.** His recommendations include economics, history, philosophy, physics.

### Extracted protocol
- Read canonical works, not derivatives
- Maintain a reading log
- Read across fields for cross-domain transfer

---

## John Carmack

Co-founder of id Software, former CTO of Oculus. Famously productive across decades and domains.

### Documented patterns (from his Twitter, talks, and the book *Masters of Doom*)
- **Read source code.** Carmack famously read the source of every game engine he could get his hands on.
- **Just dive in.** His approach to new domains (VR, ML): buy the books, read them, build something, learn from the build.
- **Long stretches of deep work.** Reports working 10-14 hour days for years. (This is unsustainable; see [[Burnout-Prevention]]. Carmack himself has spoken about the cost.)
- **Math deficiency → math catch-up.** When VR required linear algebra he didn't have, he taught himself. When ML required calculus he didn't have, he taught himself.
- **Tweets of insight.** Daily short-form technical observations, many of which read like EWDs in miniature.

### Extracted protocol
- Read source code voraciously
- When you hit a knowledge gap, fill it directly (don't defer)
- Long deep work blocks (but be careful of burnout)
- Public note-taking in small units

---

## Cross-Cutting Patterns

Reading these workflows together:

1. **Read source.** Karpathy, tptacek, Carmack, Victor all emphasize reading implementations, not just descriptions.
2. **Build minimal versions.** Karpathy's `nanoGPT`, Victor's demos, Carmack's engines — all "from scratch" implementations.
3. **Teach / publish.** Karpathy's lectures, Victor's essays, tptacek's HN comments, Carmack's tweets. Teaching forces clarity.
4. **Long horizons.** Victor works on principles for years; Carmack on engines for years; Karpathy on educational materials for years.
5. **Fill gaps directly.** Don't defer. When you hit a gap, fill it.
6. **Cross-domain.** All four draw from outside their primary domain (math, design, history, philosophy).

---

## Anti-Patterns to Avoid

- ❌ Trying to copy any one workflow exactly
- ❌ Focusing on the productivity theater (Twitter threads, "I read N books this year") rather than the practice
- ❌ Mimicking Carmack's 14-hour days (the cost is real; even Carmack acknowledges this)
- ❌ Treating these as gurus rather than as case studies

---

## Cross-Links

- [[Knuth-Workflow]] · [[Dijkstra-Workflow]] · [[McCarthy-Workflow]] — historical antecedents
- [[Norvig-10000-Pages]] — the bridge between historical and modern
- [[Reading-Codebases-Systematically]] — the operational protocol
- [[Build-to-Learn]] — minimal implementations as a learning method

← Back to [[MOC-Case-Studies]]
