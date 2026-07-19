---
aliases: [Learn Machine Learning, Machine Learning Learning Map]
tags: [domain-map, machine-learning]
---

# 🗺️ Learn Machine Learning



---

## Threshold Concepts

- **Bias-variance tradeoff** — the foundational tension
- **Gradient descent** — and why it's more general than it looks
- **The Universal Approximation Theorem** — and its limitations
- **Overfitting and regularization** — the core practical problem
- **Train/val/test split** — and why leakage destroys evaluations
- **Cross-validation** — when, why, and how
- **Loss functions** — and choosing the right one
- **Backpropagation** — and the chain rule underneath
- **The data determines the model** — more than the architecture

---

## Canonical Sources (Tier 1 — read deeply)

- **Bishop, *Pattern Recognition and Machine Learning*** (PRML) — the classic
- **Hastie, Tibshirani, Friedman, *The Elements of Statistical Learning*** (ESL, free) — the rigorous reference
- **Goodfellow, Bengio, Courville, *Deep Learning*** (free, https://www.deeplearningbook.org/)
- **Karpathy, "Neural Networks: Zero to Hero"** video series — best modern intro

---

## Reference Index (Tier 2 — on demand)

- *Dive into Deep Learning* (d2l.ai) — interactive
- Murphy, *Probabilistic Machine Learning* (newer than PRML)
- The original Transformer paper (Vaswani et al. 2017)
- Andrej Karpathy's `nanoGPT`, `micrograd`, `minBPE` — minimal implementations
- Distill.pub articles — for visualization

---

## Common Failure Modes

- **Skipping the math.** ML without linear algebra + probability is hand-waving.
- **Using sklearn without understanding.** Always implement at least once from scratch.
- **Avoiding calculus.** Backprop is the chain rule; you need to understand it.
- **Not reading papers.** ML moves fast; textbooks lag.
- **Only doing deep learning.** Linear models, trees, clustering are all foundational.
- **Ignoring evaluation.** A model without proper evaluation is noise.

---

## Build Projects

1. Implement linear regression from scratch (with gradient descent)
2. Implement logistic regression + a simple neural net for MNIST
3. Implement backprop by hand (Karpathy's `micrograd`)
4. Build a small Transformer from scratch (Karpathy's `nanoGPT`)
5. Reproduce a classic paper's result (e.g., AlexNet on CIFAR)
6. Build an end-to-end ML pipeline (data → train → eval → deploy)
7. Implement a small RL agent (DQN on CartPole)

---

## Triage Shortcuts

- Karpathy's videos first for intuition
- ESL or Bishop for math depth
- d2l.ai for interactive learning
- For deep learning specifically: Karpathy's minimal implementations are the best learning tool
- Don't chase SOTA papers; chase understanding of fundamentals
- PyTorch > TensorFlow for learning (more transparent)

---

## Estimated Time

**400-600 hours** for solid ML competence.
~15 months at 10 hours/week.

Prerequisite: linear algebra, probability, programming. The math prerequisite is non-negotiable.

---

## Cross-Links

- [[The-3-7-Year-Arc]] — where this domain fits in the timeline
- [[MOC-Foundations]] — the cognitive principles this map applies
- [[Three-Pass-Reading-Protocol]] — for the Tier 1 sources

← Back to [[MOC-Domain-Maps]]
