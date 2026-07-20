---
aliases: [Ericsson, Expert Performance, 10000 Hours]
tags: [theory, expertise, deliberate-practice]
---

# Expertise Research (Ericsson)

> Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. *Psychological Review, 100*(3), 363-406.

---

## Theory

Ericsson et al. (1993) studied expert performers (violinists, chess players, athletes) and concluded:

1. **Expert performance is predominantly the result of sustained, deliberate practice** — not innate talent. The "10,000 hour rule" popularized by Gladwell is a misreading; the actual finding is that *elite* performers had accumulated ~10,000 hours of *deliberate* practice by age 20, but the number is domain-dependent and the *quality* of practice matters more than the quantity.

2. **Deliberate practice is not the same as work or play.** It is:
   - Designed specifically to improve performance
   - Repetitive, with opportunities for refinement
   - Mentally effortful (not flow)
   - Includes immediate feedback
   - Not inherently enjoyable
   - Requires full concentration

3. **The 10,000-hour figure is a floor, not a target.** It applies to *international-level* performers in mature, competitive domains (violin, chess). For most CS subdomains, meaningful expertise (top 5% of practitioners) is reachable in 3,000-7,000 hours of deliberate practice.

4. **Sustained over ~10 years.** Expertise requires time for biological adaptation (myelination, neural reorganization). Compression below ~7 years appears to be a hard biological constraint for *broad* expertise.

---

## CS Translation

How this maps to learning computer science:

- **3,000-7,000 hours of deliberate practice** = roughly 3-7 years at 30 hours/week of focused, feedback-rich work
- "Work" (your day job coding) is often *not* deliberate practice. It is performance. You get better slowly.
- "Tutorials" are often *not* deliberate practice. They are too easy.
- **True deliberate practice in CS looks like:**
  - Implementing a system from a paper spec without tutorial hand-holding
  - Solving problems at the edge of your ability (Project Euler hard problems, Advent of Code days 15+, competitive programming)
  - Code review with a more expert reviewer who points out what you missed
  - Debugging an unfamiliar codebase to find a specific bug, with timing pressure
  - Writing a design doc and getting it critiqued
  - Reading a paper and reproducing its results

The "3-7 year" figure in the original prompt maps directly to Ericsson's lower bound. The user who masters CS in 3 years is doing ~60 hours/week of deliberate practice. The 7-year timeline corresponds to ~30 hours/week.

---

## Protocol: Engineering Your Own Deliberate Practice

1. **Identify the edge of your competence.** What can you *almost* do but not quite? That is where practice pays off. Below the edge = wasted time. Above = frustration.

2. **Define a measurable target.** "Get better at systems programming" is not a target. "Implement a malloc/free that passes all tests in the malloc-lab assignment, with fragmentation < 20%" is.

3. **Build or find a feedback loop.**
   - Tests (automated)
   - A more expert reviewer
   - A reference implementation to compare against
   - Benchmarks to beat
   - A property-based test suite

4. **Time-box to 90 minutes.** Deliberate practice is metabolically expensive. Beyond 90 min, quality collapses. See [[Session-Architecture]].

5. **Log your practice.** Use [[Daily-Learning-Log]]. Note: target, time spent, what was hard, what feedback you got, what you'll change tomorrow.

6. **Rest.** Skill consolidation happens during sleep and recovery, not during practice. Practice without rest produces fatigue, not expertise. See [[Burnout-Prevention]].

7. **Cycle through weak areas.** Avoid the trap of practicing what you're already good at. The curve flattens fast.

---

## Worked Example: A Week of Deliberate Practice for an Intermediate Engineer

| Day | Activity | Why it's deliberate practice |
|---|---|---|
| Mon | 90 min: Implement B-tree from scratch, no references | Edge of competence; immediate test feedback |
| Tue | 90 min: Read Lamport's Paxos paper, write a one-page summary | Hard reading; self-generated feedback (can I explain it?) |
| Wed | 90 min: Code review of own 2-week-old code, list every smell | Metacognitive; surfaces blind spots |
| Thu | 90 min: Reproduce a benchmark from a distributed systems paper | Reproducibility is high-feedback |
| Fri | 90 min: Solve 3 hard Advent of Code problems | Algorithmic edge; test feedback |
| Sat | 60 min: Write design doc for a side project; review with mentor | External feedback from expert |
| Sun | Rest | Recovery; consolidation |

This is ~10 hours of *deliberate practice* per week. Sustained over 4 years = ~2,000 hours, which combined with normal work and reading reaches the ~3,000-5,000 hour range for solid expertise.

---

## Common Misreadings

- **"I just need 10,000 hours and I'll be an expert."** No. 10,000 hours of *deliberate* practice. 10,000 hours of ordinary work produces... an experienced non-expert.
- **"Practice 12 hours a day to get there faster."** No. Quality collapses past ~4-5 hours/day of deliberate practice. The rest is recovery.
- **"Talent doesn't matter at all."** Ericsson did not claim this. He claimed practice is the *dominant* factor. Talent is a smaller multiplier (~1.2-1.5x).

---

## Key Citations

- Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. *Psychological Review, 100*(3), 363-406.
- Ericsson, K. A. (2006). The influence of experience and deliberate practice on the development of superior expert performance. In *The Cambridge Handbook of Expertise and Expert Performance*.
- Macnamara, B. N., Hambrick, D. Z., & Oswald, F. L. (2014). Deliberate practice and performance in music, games, sports, education, and professions. *Psychological Science, 25*(8), 1608-1618. [Meta-analysis: practice explains ~26% of performance variance in games, 21% in music, 18% in sports, 4% in education — practice matters, but isn't everything]

Full citations: [[Bibliography]]

---

## Cross-Links

- [[Deliberate-Practice]] — the operational protocol (this note is the theory, that one is the practice)
- [[Long-Term-Working-Memory]] — what deliberate practice actually builds
- [[Session-Architecture]] — structuring 90-min blocks
- [[The-3-7-Year-Arc]] — how the hours compose into years

← Back to [[MOC-Foundations]]
