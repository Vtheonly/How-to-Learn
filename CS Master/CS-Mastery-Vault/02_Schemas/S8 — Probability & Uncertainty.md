---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S8 — Probability & Uncertainty

> A **probability model** is the structure that arises whenever a system must reason or act under uncertainty, and the engineering question is always how to represent a **distribution** over unknowns, **update** it in light of evidence (Bayes), and **make decisions** (expectation, risk) — with the central risk being that the model's **independence assumptions** do not match the world's actual dependence structure.

---

## 1. Formal core

A **probability space** is a triple $(\Omega, \mathcal{F}, P)$: a sample space $\Omega$ of outcomes, a $\sigma$-algebra $\mathcal{F}$ of measurable events, and a probability measure $P: \mathcal{F} \to [0, 1]$ satisfying Kolmogorov's axioms: $P(\Omega) = 1$; $P(E) \ge 0$; and countable additivity over disjoint events.

A **random variable** $X: \Omega \to \mathcal{X}$ maps outcomes to a measurable space (typically $\mathbb{R}$ or a finite set). Its distribution is fully specified by its **cumulative distribution function** $F(x) = P(X \le x)$, or equivalently by its **probability mass function** (discrete) or **density** (continuous). Two derived quantities dominate practice:

- **Expectation**: $\mathbb{E}[X] = \sum_x x \cdot P(X = x)$ (discrete) or $\int x \cdot f(x)\, dx$ (continuous). The long-run average; the central value for decisions under linear utility.
- **Variance**: $\text{Var}(X) = \mathbb{E}[(X - \mathbb{E}[X])^2] = \mathbb{E}[X^2] - \mathbb{E}[X]^2$. The spread; squared because expectation of deviation is zero. Standard deviation $\sigma = \sqrt{\text{Var}}$ restores the original units.

**Conditional probability** and **Bayes' theorem** are the update rule. $P(A \mid B) = P(A \cap B) / P(B)$. Bayes inverts the conditioning:

$$P(H \mid E) = \frac{P(E \mid H) \cdot P(H)}{P(E)} = \frac{P(E \mid H) \cdot P(H)}{\sum_{H'} P(E \mid H') \cdot P(H')}$$

$P(H)$ is the **prior**, $P(E \mid H)$ the **likelihood**, $P(H \mid E)$ the **posterior**, $P(E)$ the **evidence** (a normalizing constant). Bayes is the canonical "learning rule": prior beliefs + evidence = posterior beliefs. Every Bayesian system (Kalman filters, Bayesian networks, Bayesian A/B testing, variational inference) is a structured application of this formula.

**Independence** is the modeling lever. $X \perp Y$ iff $P(X, Y) = P(X) P(Y)$. Independent variables factor the joint distribution: $P(X_1, \dots, X_n) = \prod_i P(X_i)$, reducing the parameter count from exponential to linear. Real systems are never truly independent; the modeling question is which independencies to *assume* and at what cost. Naive Bayes assumes all features are independent given the class — wildly false for text, but the model works because classification needs only *relative* posterior comparison, not accurate joint probabilities.

**Markov chains** model sequences where the future depends on the past only through the present. The **Markov property**: $P(X_{t+1} \mid X_t, X_{t-1}, \dots, X_0) = P(X_{t+1} \mid X_t)$. A Markov chain on a finite state space is fully specified by its transition matrix $T$ where $T_{ij} = P(X_{t+1} = j \mid X_t = i)$. The chain's $n$-step transition is $T^n$. A distribution $\pi$ is **stationary** if $\pi T = \pi$; under mild conditions (irreducible, aperiodic), the chain converges to $\pi$ from any start. This is the basis of PageRank (a random walk on the web graph), MCMC sampling, and queueing-theory steady states.

**Hidden Markov Models** (HMMs) extend Markov chains with observations. The state $X_t$ is hidden; an observation $Y_t$ is emitted with probability $P(Y_t \mid X_t)$. Three canonical problems: (1) **evaluation** — $P(Y_1, \dots, Y_T)$ for a given model (the forward algorithm, $O(T \cdot K^2)$); (2) **decoding** — the most likely state sequence $\arg\max_{X_{1:T}} P(X_{1:T} \mid Y_{1:T})$ (the Viterbi algorithm, dynamic programming on the trellis); (3) **learning** — estimate parameters from observations (the Baum-Welch algorithm, an instance of EM).

**Markov Decision Processes** (MDPs) extend Markov chains with actions and rewards. $(\mathcal{S}, \mathcal{A}, T, R, \gamma)$: states, actions, transition function $T(s' \mid s, a)$, reward $R(s, a)$, discount $\gamma \in [0, 1)$. A policy $\pi: \mathcal{S} \to \mathcal{A}$ induces a Markov chain on states. The value of $\pi$ is $V^\pi(s) = \mathbb{E}_\pi[\sum_t \gamma^t R(s_t, a_t) \mid s_0 = s]$. The optimal value $V^*$ satisfies the **Bellman equation** $V^*(s) = \max_a [R(s, a) + \gamma \sum_{s'} T(s' \mid s, a) V^*(s')]$. Reinforcement learning is MDP solving under unknown $T$ and $R$.

**Concentration** bounds the deviation of empirical averages from their expectation. **Hoeffding's inequality**: for bounded i.i.d. $X_i \in [a, b]$, $P(|\bar{X} - \mu| \ge \epsilon) \le 2 \exp(-2 n \epsilon^2 / (b-a)^2)$. Concentration is what makes statistical inference possible — a few hundred samples suffice to bound the error of an A/B test. **Heavy-tailed distributions** (Pareto, Cauchy) violate the boundedness assumption and concentration fails — this is why averages of web-page load times are misleading.

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Stochastic object | Update rule | Decision |
|--------|----------|-------------------|-------------|----------|
| Probabilistic reasoning | Bayesian networks (medical diagnosis) | Joint distribution over variables | Belief propagation | MAP diagnosis |
| Speech / NLP | HMMs, CRFs | Hidden state sequence | Forward / Viterbi | POS tag, phone sequence |
| Web search | PageRank | Stationary distribution of random walk | Power iteration | Rank pages |
| Generative ML | Diffusion models (Stable Diffusion) | Reverse Markov chain on pixels | Score matching | Sample images |
| Reinforcement learning | Atari / Go agents | MDP value function | Q-learning / TD | Greedy policy |
| Queueing | M/M/1, M/M/c | Customer count process | Steady-state analysis | Capacity planning |
| Reliability | MTBF, failure rates | Failure time distribution (Weibull, exponential) | Bayesian update on observed failures | Maintenance schedule |
| Randomized algorithms | Quicksort, hashing, sketching | Random pivot / hash function | Concentration bounds | Expected runtime / collision rate |
| Experimentation | A/B testing | Conversion-rate distribution | Beta posterior | Ship / don't ship |
| Cryptography | Random oracles, lattice noise | Uniform / Gaussian distributions | — | Security proofs |
| Distributed systems | Probabilistic quorums, Bloom filters | Hash collisions, quorum intersection | False-positive analysis | Membership queries |
| Finance | Portfolio optimization | Asset return distribution | Bayesian portfolio update | Allocate capital |

Across every instance the same four design questions recur: (a) what is the stochastic object (a single distribution, a sequence, a process), (b) what independence assumptions does the model make, (c) how is the distribution updated given evidence, and (d) what decision is made and what is its risk.

A cross-instance pattern worth internalizing: **every probabilistic model is a trade between expressiveness and tractability.** A full joint distribution over $n$ binary variables has $2^n - 1$ parameters — infeasible to specify or learn. The model's structure (Bayesian network DAG, Markov random field graph, HMM trellis, MDP state space) imposes conditional independencies that factor the joint and reduce the parameter count to linear in the structure's size. The trade: more structure = fewer parameters = faster inference, but more assumptions = more model mismatch. Choosing the structure is the modeling act; everything else is computation.

A second pattern: **the same algorithm recurs across domains with renamed variables.** Forward-backward on an HMM is the same dynamic program as Viterbi, as belief propagation on a chain-structured Bayesian network, as the Kalman filter's predict-update, as the inside-outside algorithm for probabilistic context-free grammars. Each is "dynamic programming over a trellis of latent states given observations." Recognizing the schema lets you learn one and apply it everywhere.

A third pattern worth internalizing: **every probabilistic system has a generative story and an inference procedure, and the two are decoupled.** The generative story ("how the data was produced") specifies the joint distribution — e.g., an HMM generates $X_t$ from $X_{t-1}$, then $Y_t$ from $X_t$. The inference procedure ("given the data, what can we conclude") computes posteriors over hidden variables — e.g., the forward algorithm computes $P(X_t \mid Y_{1:T})$. The two are decoupled: the same generative story supports many inference questions (filtering, smoothing, decoding, learning); the same inference algorithm applies to many generative stories (forward-backward works on any chain-structured model). Confusing the two — asking "what is the inference algorithm for naive Bayes" when you mean "what is the generative story" — is a common beginner's error. The schema-level skill is to state the generative story explicitly, then choose the inference procedure that matches the question.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: probability space, random variables, Bayes' theorem, the Markov property, Bellman equations.
- *Algorithmic layer*: forward-backward, Viterbi, EM, MCMC, variational inference, power iteration for stationary distributions.
- *Systems layer*: A/B testing infrastructure, online learning systems, Bayesian bandits in production recommendation.
- *Evaluation layer*: calibration plots, held-out log-likelihood, posterior predictive checks, online-vs-offline metric gap analysis.
- *Production practice*: monitoring distribution drift, retraining triggers, shadow deployment of new probabilistic models, uncertainty-aware alerting.
- *Failure layer*: p-hacking audits, multiple-comparison corrections, confounder audits on observational data, heavy-tail-aware percentile reporting.
- *Cognitive layer*: the base-rate fallacy, the conjunction fallacy, the planning fallacy — all instances of probability schema bugs in human reasoning.

**Common confusions to surface early** (each is a schema-level misconception):
- Confusing $P(A \mid B)$ with $P(B \mid A)$ — the prosecutor's fallacy, and the reason Bayes' theorem is non-trivial.
- Confusing "no evidence against $H$" with "evidence for $H$" — absence of evidence is not evidence of absence, unless the test would have found evidence if it existed.
- Confusing the mean with the median under heavy tails — the mean is dominated by the tail; the median is robust.
- Confusing statistical significance with practical significance — a tiny effect can be statistically significant with enough data.
- Confusing correlation with causation — the schema requires an intervention or a quasi-experiment, not just observed correlation.

The transfer exercise that builds the schema: take one canonical probabilistic model (e.g., an HMM for POS tagging) and rebuild it at each layer — first as a hand-coded forward-backward, then as a probabilistic-programming-language specification (Pyro, Stan), then as a production system with drift monitoring. The invariants that survive all three layers (the Markov assumption, the forward-backward structure, the calibration requirement) are the schema.

## 3. Contrastive cases

### 3.1 Frequentist vs Bayesian

**Frequentist** probability treats probability as long-run frequency; parameters are fixed unknowns; inference produces point estimates and confidence intervals with coverage guarantees. **Bayesian** probability treats probability as degree of belief; parameters are random variables with priors; inference produces posteriors and credible intervals. The two yield similar answers with large data and uninformative priors, but diverge with small data, multiple comparisons, and hierarchical structure. The bug: applying frequentist p-values to a single rare event ("this A/B test's p-value is 0.04") — frequentist guarantees are over repeated experiments, not single ones.

### 3.2 Stationary vs non-stationary distributions

A **stationary** distribution does not change over time; the standard machinery (Markov chain convergence, MLE, concentration) applies. A **non-stationary** distribution drifts (concept drift in ML, changing user behavior in A/B tests, regime shifts in finance). The bug: fitting a stationary model to non-stationary data — the model "works" in training, fails in deployment. Mitigation: time-decayed weighting, online learning with forgetting, change-point detection, or explicit time-varying parameters (state-space models, dynamic linear models).

### 3.3 Independent vs correlated

Independence factorizes the joint, enabling closed-form analysis and concentration bounds. Correlation requires modeling the joint, which is exponentially harder. Real data is correlated: users in the same cohort behave similarly, web pages link to similar pages, sensor readings cluster. The bug: assuming independence when correlations exist — confidence intervals are too narrow, p-values too small, "significant" results fail to replicate. Mitigation: cluster-robust standard errors, hierarchical models, block bootstrap, or explicit correlation modeling (Gaussian processes, copulas).

### 3.4 Discrete vs continuous

Discrete distributions (Bernoulli, categorical, Poisson) model counts and categories; continuous distributions (Gaussian, exponential, Pareto) model measurements. The math differs (sums vs integrals; PMF vs PDF) but the schema is the same. The bug: discretizing a continuous variable (binning age into brackets) loses information; modeling a discrete variable as continuous (counts as Gaussian) breaks for small counts (use Poisson). The deeper bug: treating discretization as lossless — it isn't.

### 3.5 Generative vs discriminative

A **generative** model (naive Bayes, HMM, diffusion) models $P(X, Y) = P(X) P(Y \mid X)$ — the joint of features and labels. A **discriminative** model (logistic regression, SVM, neural nets) models $P(Y \mid X)$ directly. Generative models can sample new data, handle missing features, and use unlabeled data; discriminative models achieve higher accuracy when labeled data is abundant. The bug: applying a generative model when only classification is needed (wasted capacity modeling $P(X)$); applying a discriminative model when sampling or anomaly detection is needed (no $P(X)$ to evaluate).

### 3.6 Exact vs approximate inference

**Exact** inference (variable elimination, junction tree) computes the true posterior; tractable only for small or specially-structured models. **Approximate** inference (MCMC, variational inference, loopy belief propagation) trades accuracy for scalability. The bug: using approximate inference without diagnostics — MCMC may not have converged, variational inference may have collapsed to a bad mode. Mitigation: convergence diagnostics (effective sample size, $\hat{R}$, trace plots), held-out likelihood, posterior predictive checks.

### 3.7 Parametric vs non-parametric

**Parametric** models (Gaussian, HMM with fixed $K$) have a fixed number of parameters; the model class is fixed regardless of data. **Non-parametric** models (Gaussian processes, Dirichlet processes, k-NN) grow parameters with data. The bug: a parametric model is too rigid (misses structure); a non-parametric model is too flexible (overfits, slow at inference). The trade tracks the bias-variance tradeoff: parametric = high bias, low variance; non-parametric = low bias, high variance.

## 4. Implementation

**Build an HMM with forward, backward, and Viterbi from scratch in NumPy.** Target: ~250 lines.

Data structure:
- States: $K$ hidden states (e.g., POS tags: NOUN, VERB, ADJ, ADP, ...).
- Observations: $V$ vocabulary symbols (words).
- Initial distribution $\pi \in \mathbb{R}^K$.
- Transition matrix $A \in \mathbb{R}^{K \times K}$, $A_{ij} = P(X_{t+1} = j \mid X_t = i)$.
- Emission matrix $B \in \mathbb{R}^{K \times V}$, $B_{iw} = P(Y_t = w \mid X_t = i)$.

Algorithms:
1. **Forward**: $\alpha_t(i) = P(Y_1, \dots, Y_t, X_t = i)$. Initialization $\alpha_1(i) = \pi_i B_{i, Y_1}$. Recurrence $\alpha_{t+1}(j) = [\sum_i \alpha_t(i) A_{ij}] B_{j, Y_{t+1}}$. Termination $P(Y_{1:T}) = \sum_i \alpha_T(i)$. Implement as vectorized NumPy over the trellis.
2. **Backward**: $\beta_t(i) = P(Y_{t+1}, \dots, Y_T \mid X_t = i)$. Symmetric to forward. Termination $\beta_T(i) = 1$. Recurrence $\beta_t(i) = \sum_j A_{ij} B_{j, Y_{t+1}} \beta_{t+1}(j)$.
3. **Viterbi**: $\delta_t(i) = \max_{X_{1:t-1}} P(X_{1:t-1}, X_t = i, Y_{1:t})$. Same recurrence as forward but with $\max$ instead of $\sum$, plus backpointers $\psi_t(i) = \arg\max_j \delta_{t-1}(j) A_{ji}$. Backtrack from $\arg\max_i \delta_T(i)$.
4. **Baum-Welch** (EM): $\gamma_t(i) = \alpha_t(i) \beta_t(i) / P(Y)$ (posterior of state at time $t$); $\xi_t(i, j) = \alpha_t(i) A_{ij} B_{j, Y_{t+1}} \beta_{t+1}(j) / P(Y)$ (posterior of transition). M-step: re-estimate $\pi, A, B$ from $\gamma, \xi$.

Test cases:
- Synthetic: generate a sequence from a known HMM; run Viterbi; verify the recovered path matches the true path on >90% of positions.
- Scaling: a 1000-word sentence; verify forward and Viterbi run in well under a second (the $O(T K^2)$ complexity).
- Numerical stability: a 1000-word sentence causes $\alpha$ to underflow to 0 in naive implementation. Fix with **log-space** arithmetic (use log-sum-exp) or per-step normalization. Verify the log-likelihood is finite.
- POS tagging: train on a 10k-sentence corpus (Brown or Universal Dependencies), test on held-out 1k sentences. Report per-tag accuracy. Compare against a baseline (always predict the most frequent tag).
- Convergence: run Baum-Welch for 100 iterations; verify the log-likelihood is monotonically non-decreasing (it must be, by EM's guarantee). If it decreases, you have a bug in the M-step.

**Difficulty**: medium-hard. **Sub-skills tested**: dynamic programming over a trellis, log-space numerics, EM derivation, evaluation methodology (per-tag vs per-sentence accuracy; baseline comparison). The bugs you will hit: (a) underflow in long sequences — fix with log-sum-exp; (b) index errors in the trellis — the $t$ vs $t+1$ indexing is the canonical off-by-one; (c) EM diverges because you forgot to renormalize $A$ and $B$ row-wise after the M-step.

**Extension ladder**:
1. Replace the categorical emissions with **Gaussian** emissions (continuous observations). The math changes only in $B$; the algorithms are identical.
2. Add **supervised** training (use labeled data to estimate $A, B$ with additive smoothing). Compare against Baum-Welch on the same data — supervised wins with enough labels.
3. Extend to a **CRF** (conditional random field) — the discriminative counterpart. The inference (forward, Viterbi) is the same; training uses gradient descent on the log-likelihood. Compare HMM and CRF on the same task; CRF usually wins on accuracy.
4. Implement a **Kalman filter** for a linear-Gaussian state-space model. Recognize that it is the continuous analogue of forward-backward — the same trellis, Gaussian instead of categorical emissions.

## 5. Failure analysis

1. **Wrong independence assumptions.** Naive Bayes assumes features are independent given the class — wildly false for text (words are correlated), yet the model works because classification needs only *relative* posterior. The bug: applying naive Bayes to a task that needs *accurate* probabilities (calibrated risk scoring) — the independence violation makes probabilities overconfident. Mitigation: use a model that captures correlations (logistic regression, tree ensembles), or calibrate the naive Bayes output (Platt scaling, isotonic regression).

2. **Non-stationary distributions.** A model trained on January data drifts by July; the deployed model silently degrades. Diagnosis: monitor input distribution (KL divergence from training), monitor output distribution, monitor per-slice performance. Mitigation: retrain on a sliding window, detect change-points, or use online learning with forgetting.

3. **Sampling bias.** Training data is collected from a non-representative sample; the model learns the bias, not the underlying distribution. The classic case: facial recognition trained on light-skinned faces, deployed on all skin tones. Mitigation: stratified sampling, audit per-slice performance, reweight underrepresented groups.

4. **Exploding variance in Monte Carlo.** A Monte Carlo estimator $\hat{\mu} = (1/n) \sum X_i$ has variance $\sigma^2 / n$. For rare events (e.g., estimating $P(\text{tail event}) = 10^{-6}$), the relative variance is enormous — direct sampling needs $10^8$ samples for one significant digit. Mitigation: **importance sampling** (sample from a distribution that over-weights the rare event, reweight), **stratified sampling**, or **quasi-Monte Carlo** (low-discrepancy sequences).

5. **Vanishing probabilities in long chains.** A Markov chain over 1000 steps has likelihood $P(Y_{1:1000}) = \prod_t P(Y_t \mid Y_{t-1})$ — each factor $< 1$, so the product underflows to 0 in floating point. Mitigation: **log-space** arithmetic (sum of log-probabilities); **per-step normalization** (track the normalizer separately). The bug is invisible in short test cases; it appears only in production-length sequences.

6. **Mode collapse in generative models.** A GAN or VAE learns to generate only a few modes of the true distribution; the model "looks good" per-sample but the generated distribution is far from the true distribution. Diagnosis: low diversity, repeated samples. Mitigation: minibatch discrimination, mode-seeking GAN objectives, or train a diffusion model (which is much less prone to mode collapse by construction).

7. **p-hacking and the replication crisis.** Running 20 A/B tests with $\alpha = 0.05$ yields on average 1 false positive *by construction*. The bug: reporting significant results without correcting for multiple comparisons. Mitigation: Bonferroni correction (conservative), Benjamini-Hochberg (less conservative), pre-registration, or hierarchical Bayesian models that share strength across tests.

8. **Overconfident priors.** A Bayesian model with a tight prior on the wrong value cannot update away from it without enormous data. The classic case: pre-2020 pandemic models with strong priors on low respiratory-disease R0. Mitigation: weakly-informative priors, prior predictive checks (sample from the prior; do the samples look reasonable?), sensitivity analysis (rerun with different priors).

9. **Confounding in observational data.** Ice cream sales correlate with drowning — not because ice cream causes drowning, but because both are driven by heat. The bug: interpreting correlation as causation. Mitigation: randomized experiments (A/B tests), instrumental variables, difference-in-differences, or do-calculus (Pearl). Pure observational data cannot establish causation without assumptions.

10. **MCMC non-convergence.** A Markov Chain Monte Carlo sampler runs for 10k iterations; you report the posterior mean. But the chain hasn't mixed — it's stuck in one mode of a multimodal posterior. Diagnosis: $\hat{R} > 1.1$ across multiple chains; effective sample size much less than iteration count; trace plots show trends. Mitigation: longer runs, multiple chains from different starts, better proposals (Hamiltonian Monte Carlo, NUTS), or reparametrize to reduce multimodality.

11. **Probability calibration drift.** A classifier reports "80% confident this is spam" — but only 60% of 80%-confident predictions are actually spam. The model is uncalibrated. Diagnosis: reliability diagrams (bin predictions by confidence; plot predicted vs empirical accuracy). Mitigation: post-hoc calibration (Platt scaling for sigmoid, isotonic regression for non-parametric), or train with a proper scoring rule (log-loss, Brier score).

12. **Heavy tails break the mean.** Estimating the "average" web-page load time as the mean is dominated by the 0.01% of requests that take 100× the median. The mean is theoretically infinite for Pareto with shape $\alpha \le 1$. Mitigation: report percentiles (p50, p95, p99) instead of mean; use robust estimators (median, trimmed mean); model the tail explicitly (extreme value theory).

## 6. Transfer tests

#sr
- **Terminology shift**: A product manager asks "what's the probability this feature increased conversion?" Without using the word *Bayes*, identify the schema, the prior (baseline conversion rate), the likelihood (observed conversions in treatment), and the decision rule (posterior probability of positive effect > 95%).
- **Representation shift**: You are given a sequence of audio frames and a sequence of phoneme labels. The task is to align them. Identify the schema (HMM / dynamic programming over a trellis), the algorithm (Viterbi or forward-backward), and the failure mode if the audio is non-stationary (the Markov assumption breaks).
- **Constraint shift**: Each sample must be drawn in less than 1ms. Compare three sampling methods (rejection sampling, importance sampling, MCMC) on the axes of bias, variance, and latency. Which method is appropriate for a 1000-dimensional Gaussian posterior?
- **Unnamed solution**: A team reports "our recommendation model has high offline accuracy but users don't click more." Identify the schema (offline-vs-online distribution shift), the likely causes (training-serving skew, non-stationary preferences, optimization-vs-engagement mismatch), and the diagnostic (compare offline AUC with online CTR; check feature distribution drift).
- **Competing schemas**: A self-driving car models other cars as MDPs and plans its own trajectory. Is this S8 (Probability) or S1 (State & Transition)? State the structural feature that decides (the transition is stochastic = MDP), and explain when each schema is the right lens.
- **Failure shift**: An MCMC sampler reports a posterior mean of 0.5 with a 95% credible interval of [0.4, 0.6]. The true value is 0.2. Identify the schema (MCMC), the bug (non-convergence — the chain is stuck in a wrong mode), and the diagnostic ($\hat{R}$, effective sample size, trace plots).
- **Scale shift**: A system must score 1M documents per second for spam probability. Identify which model class (naive Bayes, logistic regression, transformer) satisfies the throughput, the calibration guarantee needed (probabilities must be accurate, not just rankings), and the tradeoff (transformer accuracy vs naive Bayes throughput).
- **Layer shift**: The same logical "uncertainty over a parameter" is represented as (a) a point estimate with a confidence interval, (b) a Beta posterior, (c) a Bayesian neural network's weight distribution. Identify which invariants of (a) survive into (b) and (c), and which new failure modes each layer introduces (interval undercoverage, prior sensitivity, inference cost).

## 7. Delayed retrieval

#sr
- **Recall**: State Bayes' theorem. State the Markov property in one sentence. State Hoeffding's inequality.
- **Explanation**: Why does naive Bayes work for text classification despite the (false) independence assumption? Give the schema-level reason (classification needs only *relative* posterior, not accurate joint).
- **Derivation**: Derive the forward algorithm recurrence for an HMM. State the complexity $O(T K^2)$ and explain why Viterbi has the same complexity but different semantics ($\max$ vs $\sum$).
- **Implementation**: Implement Viterbi in NumPy. State the underflow failure mode and the fix (log-space with $\max$ and log-add). State the test that catches a wrong backpointer (compare to brute-force on small $T$).
- **Diagnosis**: An A/B test reports $p = 0.04$ on the 20th metric tested. Describe the diagnostic procedure to identify whether the result is real or a multiple-comparisons artifact, and the correction (Bonferroni / Benjamini-Hochberg) you would apply.
- **Transfer**: You move from an HMM for POS tagging to a Kalman filter for object tracking. Predict two invariants that *carry over* (forward-backward / predict-update structure; trellis dynamic programming) and two that *break* (discrete vs continuous state; categorical vs Gaussian emission). Justify via the probability schema.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — probability models recur from queueing theory to deep learning.
- **Related schemas**: [[02_Schemas/S1 — State & Transition|S1 State & Transition]] (Markov chains are probabilistic state machines), [[02_Schemas/S4 — Optimization & Constraints|S4 Optimization & Constraints]] (ML training is optimization under uncertainty; variational inference is constrained optimization), [[02_Schemas/S10 — Search & Inference|S10 Search & Inference]] (probabilistic search, MCTS, Bayes-optimal policies).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing an HMM to a Kalman filter to a Bayesian network reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
