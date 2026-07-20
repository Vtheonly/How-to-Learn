---
title: Evidence-Based CS Study Checklist
type: technique
chapter: 5
tags: [cs-education, checklist, summary, technique]
---

# 5.8 Evidence-Based CS Study Checklist

This is a printable summary of Chapter 5. Print it, post it next to your monitor, and audit your study sessions against it.

## The Checklist

### Before Writing Code

- [ ] Can I trace the algorithm on paper with a small example? ([[5.2 Code Comprehension and Tracing]])
- [ ] Have I studied at least one worked example of this pattern? ([[5.3 Worked Examples and the Completion Method]])
- [ ] Have I solved a Parsons Problem for this pattern? ([[5.4 Parsons Problems]])
- [ ] Can I explain the notional machine (stack, heap, references) for the language I am using? ([[5.5 Notional Machines and Mental Models]])
- [ ] Have I predicted the output before running? ([[5.2 Code Comprehension and Tracing]])

### While Writing Code

- [ ] Am I applying a known pattern, or am I inventing from scratch?
- [ ] Can I trace through my code line by line on paper?
- [ ] Am I managing cognitive load (working in small chunks, not multitasking)? ([[5.7 Cognitive Load Theory in Programming]])
- [ ] Have I predicted what each section will do before running it?

### After Writing Code

- [ ] Did the actual output match my prediction? If not, where did my mental model diverge?
- [ ] Have I traced the bug rather than guessing fixes?
- [ ] Have I written test cases, including edge cases (empty, single, maximum, invalid)?
- [ ] Can I explain the code aloud using the Feynman Technique? ([[2.5 The Feynman Technique]])

### During Review

- [ ] Can I reconstruct the algorithm signature from memory? ([[5.6 Retrieval Practice for Algorithmic Thinking]])
- [ ] Can I implement the algorithm from scratch, without references?
- [ ] Can I state the time and space complexity, with reasoning?
- [ ] Can I solve a novel problem using the same pattern?
- [ ] Have I added new facts (syntax, complexity) to Anki for spaced repetition? ([[2.3 Spaced Repetition]])

### Weekly

- [ ] Have I reconstructed the week's algorithms from memory?
- [ ] Have I reviewed my Anki cards daily?
- [ ] Have I solved at least one Parsons Problem or completion problem?
- [ ] Have I read and traced at least one piece of high-quality code written by someone else?
- [ ] Have I identified and recorded any notional machine misconceptions I discovered?

## The Big Five Techniques (Ranked by Impact)

If you only adopt five techniques from Chapter 5, adopt these:

1. **Tracing** ([[5.2 Code Comprehension and Tracing]]) — the foundation.
2. **Worked examples** ([[5.3 Worked Examples and the Completion Method]]) — the primary learning activity.
3. **Parsons Problems** ([[5.4 Parsons Problems]]) — the bridge from reading to writing.
4. **Notional machine construction** ([[5.5 Notional Machines and Mental Models]]) — the mental model.
5. **Retrieval practice for algorithms** ([[5.6 Retrieval Practice for Algorithmic Thinking]]) — the consolidation.

## The Big Five Anti-Patterns (Avoid These)

1. **Writing code from scratch as the first activity.** (Cognitive overload, no schema construction.)
2. **Trial-and-error programming.** (Random changes until the compiler stops complaining. No learning.)
3. **Treating the computer as a black box.** (No notional machine, no debugging ability.)
4. **Re-reading documentation instead of retrieving.** (Passive review, no schema strengthening.)
5. **Avoiding tracing because "I can do it in my head."** (You cannot, for any code longer than 5 lines.)

## Daily Protocol

For a 90-minute study session on a new CS topic:

1. **Pretest (5 min)** — Attempt 3-5 practice problems on the topic. Get them wrong. ([[2.4 Pretesting and Hypercorrection]])
2. **Worked example study (20 min)** — Trace a fully worked example. Predict before running. ([[5.3 Worked Examples and the Completion Method]])
3. **Modification (10 min)** — Modify the worked example. Predict and verify each modification.
4. **Parsons Problem (10 min)** — Solve a Parsons Problem for the same pattern. ([[5.4 Parsons Problems]])
5. **Completion problem (15 min)** — Complete a partial implementation. ([[5.3 Worked Examples and the Completion Method]])
6. **From-scratch implementation (15 min)** — Implement a similar problem from scratch. ([[5.6 Retrieval Practice for Algorithmic Thinking]])
7. **Free recall (5 min)** — Close everything. Write down what you learned.
8. **Anki cards (5 min)** — Add new facts to your spaced repetition deck. ([[2.3 Spaced Repetition]])
9. **Teach back (5 min)** — Explain the concept aloud using the Feynman Technique. ([[2.5 The Feynman Technique]])

This protocol integrates all five techniques and the Big Five anti-patterns avoidance. It fits in 90 minutes and produces measurable progress per session.

## Cross-References

- All five techniques are detailed in their respective notes: [[5.2 Code Comprehension and Tracing]], [[5.3 Worked Examples and the Completion Method]], [[5.4 Parsons Problems]], [[5.5 Notional Machines and Mental Models]], [[5.6 Retrieval Practice for Algorithmic Thinking]].
- The cognitive load framework is in [[5.7 Cognitive Load Theory in Programming]].
- The general learning techniques are in Chapter 2: [[2.1 MOC - Learning Techniques]].
- The daily integration is in [[6.3 Active Learning Sessions]].

#cs-education #checklist #summary #technique
