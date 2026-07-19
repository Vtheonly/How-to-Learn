---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S4 — Optimization & Constraints

> **Optimization** is the schema that arises whenever a system must choose *the best* element from a set subject to *constraints* — and almost every non-trivial engineering decision (a model's weights, a query plan, a register allocation, a schedule, a route) is, at bottom, an instance of `minimize f(x) s.t. g(x) ≤ 0`.

---

## 1. Formal core

A mathematical program is

$$
\begin{aligned}
\min_{x \in \mathcal{X}} \quad & f(x) \\
\text{s.t.} \quad & g_i(x) \leq 0, \quad i = 1, \dots, m \\
& h_j(x) = 0, \quad j = 1, \dots, p
\end{aligned}
$$

where:
- $\mathcal{X} \subseteq \mathbb{R}^n$ (continuous) or $\mathcal{X} \subseteq \mathbb{Z}^n$ (integer / combinatorial) or a mix (mixed-integer).
- $f : \mathcal{X} \to \mathbb{R}$ is the objective.
- $g_i, h_j$ are inequality and equality constraints.

**Convexity** is the dividing line between tractable and hard:

- $f$ is *convex* if $f(\lambda x + (1-\lambda) y) \leq \lambda f(x) + (1-\lambda) f(y)$ for all $\lambda \in [0,1]$.
- A program is *convex* if $\mathcal{X}$ is convex, $f$ is convex, $g_i$ are convex, $h_j$ are affine.
- For convex programs, **every local optimum is global**. This is the structural property that makes gradient descent work.

**Optimality conditions**:
- **Unconstrained**: $\nabla f(x^*) = 0$ and $\nabla^2 f(x^*) \succeq 0$ (positive semidefinite Hessian).
- **Constrained (KKT)**: There exist multipliers $\lambda \geq 0, \mu$ such that
$$\nabla f(x^*) + \sum_i \lambda_i \nabla g_i(x^*) + \sum_j \mu_j \nabla h_j(x^*) = 0,$$
$$\lambda_i g_i(x^*) = 0 \text{ (complementary slackness)}, \quad g_i(x^*) \leq 0, \quad h_j(x^*) = 0.$$
- For convex programs satisfying a constraint qualification, KKT is *necessary and sufficient*.

**Lagrangian duality**: $L(x, \lambda, \mu) = f(x) + \sum_i \lambda_i g_i(x) + \sum_j \mu_j h_j(x)$. The dual function $d(\lambda, \mu) = \inf_x L(x, \lambda, \mu)$ is always concave. Weak duality: $d(\lambda, \mu) \leq f(x^*)$. Strong duality (zero duality gap) holds for convex programs under Slater's condition.

The dual is not just a theoretical curiosity — it is the structural reason many algorithms work. **Dual ascent** solves the dual directly: $\lambda \leftarrow \lambda + \eta \nabla d(\lambda)$. **ADMM** (alternating direction method of multipliers) splits the problem across variables and is the workhorse of distributed optimization (consensus problems, ML training across GPUs, matrix completion on clusters). **Shadow prices** in LP duality tell you *which constraint is binding* — the marginal value of relaxing it. This is the schema-level explanation for why ML practitioners care about the magnitude of Lagrange multipliers in constrained training (e.g., federated learning with privacy budgets).

**Algorithms** (continuous):
- **Gradient descent**: $x_{k+1} = x_k - \eta \nabla f(x_k)$. Converges at rate $O(1/k)$ for convex smooth; $O(1/k^2)$ with Nesterov acceleration; linear (geometric) for strongly convex.
- **Stochastic gradient descent (SGD)**: $x_{k+1} = x_k - \eta \nabla f_{i_k}(x_k)$ on random sub-samples. Variance limits the rate; mini-batches trade compute for variance.
- **Momentum**: $v_{k+1} = \beta v_k + \nabla f(x_k)$; $x_{k+1} = x_k - \eta v_{k+1}$.
- **Adam**: per-parameter learning rates via running estimates of $\nabla f$ and $(\nabla f)^2$.
- **Newton**: $x_{k+1} = x_k - [\nabla^2 f(x_k)]^{-1} \nabla f(x_k)$. Quadratic convergence near optimum; Hessian inversion is $O(n^3)$.

**Combinatorial optimization**: $\mathcal{X}$ is discrete. Approaches:
- Exact: branch-and-bound, dynamic programming, integer LP.
- Approximate: greedy, local search, simulated annealing, genetic algorithms.
- Approximation algorithms: PTAS, FPTAS with provable bounds.
- LP relaxation: solve the LP relaxation, then round (e.g., randomized rounding for set cover).

**The role of structure**. Real optimization problems rarely come with a clean convex-or-not label; they come with structure that can be *exploited*. Sparsity (most variables are zero), separability (the objective decomposes into independent subproblems), symmetry (invariance under permutation), and monotonicity (more is always better) are all forms of structure that an algorithm can exploit. The schema-level move: before choosing an algorithm, ask what structure the problem has, then match the algorithm to the structure. A sparse convex problem uses proximal gradient (FISTA); a separable problem uses dual decomposition; a symmetric problem can be reduced to its fundamental domain. This is why ML practitioners spend more time on *problem formulation* than on algorithm choice — the formulation determines the structure, which determines the tractability.

## 2. Canonical instances (≥3 domains)

| Domain | Instance | Objective $f$ | Constraints | Method |
|--------|----------|---------------|-------------|--------|
| Machine learning | Training a neural network | Empirical loss $\frac{1}{N}\sum \ell(f_\theta(x_i), y_i)$ | $L^2$ regularization, parameter bounds | SGD / Adam / AdamW |
| Database systems | Query planning | Estimated query execution cost | Algebraic equivalence of plans | Dynamic programming (System R) / branch-and-bound (Cascade) |
| Compilers | Register allocation | Spill cost (number of memory accesses) | $k$ registers available | Graph coloring (NP-hard; heuristic via Chaitin–Briggs) |
| Networking | Routing | Total latency / hop count | Link capacities, policy | Dijkstra (single-source) / min-cost max-flow (multi-commodity LP) |
| Scheduling | Job-shop scheduling | Makespan $\max_j C_j$ | Precedence, machine capacity | List scheduling; ILP; branch-and-bound |
| Algorithms | Knapsack, DP, A* | Total value / cost | Capacity bound; admissible heuristic | Dynamic programming; A* search |
| Cloud systems | Bin packing for VM placement | Number of physical hosts used | CPU / memory / network capacity per host | First-fit-decreasing; ILP; column generation |
| Control systems | MPC (model predictive control) | Quadratic cost over future trajectory | Dynamics constraints, actuator limits | Quadratic programming at each control step |
| Operations research | Airline crew scheduling | Total crew cost | Coverage (every flight covered); labor rules | Set partitioning ILP, solved by column generation + branch-and-price |

The schema's footprint: every domain where one picks "best" under "rules" — which is almost all engineering.

A useful cross-instance observation: the *same* LP solver (Gurobi, CPLEX, HiGHS) underlies airline scheduling, container loading, network design, and ad allocation. The mathematical structure is identical; only the variables and constraints differ. This is why an OR-trained engineer can move from supply-chain optimization to ML hyperparameter tuning in months, not years — the schema transfers cleanly. The converse is also true: an ML engineer who has never seen an LP solver will struggle with combinatorial problems that an OR engineer solves in an afternoon. Both groups are doing optimization; the *form* differs (continuous gradient vs combinatorial branch-and-bound), and that form determines which algorithmic toolkit applies.

## 3. Contrastive cases

### 3.1 Local search vs global optimization

A hill-climbing algorithm with restarts *looks* like optimization but provides no global guarantee. The structural difference: convex problems have the property "local = global"; non-convex problems do not. Treating a non-convex loss surface as if it were convex (e.g., assuming SGD convergence to global optimum on a deep network) is the central modeling assumption of modern ML — and it is empirically useful but formally unjustified.

### 3.2 Convex vs non-convex

Convex: single basin; gradient descent reaches global optimum; KKT is sufficient. Non-convex: many basins; gradient descent reaches *some* local optimum; KKT is necessary but not sufficient. The contrast matters for problem *modeling*: formulating a real-world problem as a convex LP (e.g., via a relaxation) often gives an answer that is "good enough," whereas formulating it as a non-convex program traps you in heuristics. The art of operations research is *convexification*.

### 3.3 Constrained vs unconstrained

Unconstrained: $\nabla f = 0$ suffices; gradient descent is the algorithm. Constrained: gradient descent violates constraints; you need projection (projected gradient), penalty methods (add $\lambda \cdot \text{violation}$), or barrier methods (log-barrier, interior point). The contrast matters when porting an ML algorithm to a constrained setting (e.g., physical constraints on robot control) — naive gradient descent produces infeasible solutions.

### 3.4 Continuous vs combinatorial

Continuous optimization uses gradients; combinatorial does not (or uses them as heuristics). The schema is the same (minimize over $\mathcal{X}$), but the algorithmic toolkit diverges entirely: gradient descent vs branch-and-bound. LP relaxation is the bridge — solve the continuous version, then round. This is the schema-level explanation for why ML (continuous) and OR (combinatorial) feel different despite sharing the optimization schema.

### 3.5 Single-objective vs multi-objective

Multi-objective optimization has no "best" — only Pareto optima (points where no objective can improve without worsening another). The schema extends with the dominance partial order. The contrast: a single scalarization (weighted sum) collapses to single-objective but misses non-convex Pareto fronts. Real engineering decisions are almost always multi-objective; pretending they are single-objective is a modeling choice with consequences.

### 3.6 Online vs offline optimization

An offline optimizer solves once on a fixed dataset; an online optimizer solves repeatedly as data arrives. Online convex optimization (OCO) and the multiplicative-weights-update family achieve regret bounds — they perform *almost as well* as the best fixed choice in hindsight, with $O(\sqrt{T})$ regret. This is the schema underlying online ad allocation, network routing under changing traffic, and modern portfolio rebalancing. The contrast with offline optimization is structural: there is no "global optimum" to converge to; the metric is comparative regret against an adversary.

### 3.7 Smooth vs non-smooth objectives

A smooth objective has a Lipschitz-continuous gradient (no kinks); a non-smooth one has discontinuities in the gradient (e.g., $|x|$, ReLU, hinge loss). Smoothness determines the algorithm class: smooth convex problems admit accelerated methods with $O(1/k^2)$ convergence; non-smooth problems are stuck at $O(1/\sqrt{k})$ via subgradient methods, unless one smooths the objective (Moreau envelope, Nesterov smoothing) and pays a small approximation error. The schema-level insight: smoothness is a *modeling choice* as much as a property of the problem — choosing softplus over ReLU, or Huber loss over L2, is the deliberate trading of non-smoothness for tractability.

### 3.8 Deterministic vs stochastic optimization

A deterministic optimizer sees the full objective; a stochastic one sees a stream of samples. The split is fundamental: deterministic methods (L-BFGS, Newton) achieve high-precision solutions on small problems; stochastic methods (SGD, Adam) scale to billion-example problems at the cost of low-precision optima. The contrast is why deep learning uses SGD even when L-BFGS would converge in fewer *steps* — each SGD step is $10^6$× cheaper, so wall-clock time favors stochastic. The schema-level move: choose the optimizer by the ratio of *per-step cost* to *gradient variance*, not by abstract convergence rate.

## 4. Implementation

**Implement gradient descent, momentum, and Adam for logistic regression on MNIST.** Target: ~200 lines of NumPy, no autograd framework.

Specifications:
- Load MNIST (60k train, 10k test). Use a binary task: "is this digit a 3?" for clarity.
- Logistic regression: $p(y=1 \mid x) = \sigma(w^\top x + b)$, loss $= -\frac{1}{N}\sum [y \log p + (1-y) \log(1-p)]$.
- Implement three optimizers from scratch:
  1. Vanilla SGD: $w \leftarrow w - \eta \nabla_w L$.
  2. Momentum: $v \leftarrow \beta v + \nabla L$; $w \leftarrow w - \eta v$.
  3. Adam: maintain $m, v$ (first and second moment estimates); bias-correct; update.
- Hand-derive the gradient $\nabla_w L = \frac{1}{N} X^\top (\sigma(Xw) - y)$.
- Train for 20 epochs with mini-batches of 64.
- Plot training loss and test accuracy for all three optimizers on the same axes.

Test cases:
- All three optimizers should reach > 90% accuracy.
- Adam should converge fastest (in epochs) and most stably.
- Vanilla SGD with too-large a learning rate should diverge — record this.
- Verify the gradient implementation with finite differences on a small sample.

**Difficulty**: medium. **Sub-skills tested**: deriving and verifying gradients by hand, implementing optimizers correctly (the Adam bias-correction term is the most common bug), choosing learning rates, recognizing divergence vs convergence, finite-difference gradient checking. The transferable insight: every modern optimizer is a variation on "estimate the gradient direction, scale the step." Once you see this, RMSProp, Adam, AdamW, Lion all become one schema.

**Extension ladder**:
1. Add L2 regularization (weight decay) and verify it improves generalization on the test set. Observe the train/test gap shrink.
2. Replace logistic regression with a 2-layer MLP (one hidden layer of 64 ReLU units). Re-derive the backprop gradients by hand. Watch vanilla SGD struggle; momentum and Adam become essential.
3. Add learning-rate warmup and cosine decay. Compare final accuracy against fixed learning rate — the gain is non-trivial.
4. Distribute training across 2 processes with parameter averaging (Hogwild-style async or synchronous all-reduce). Measure throughput and verify convergence is preserved.

## 5. Failure analysis

1. **Local optima.** Non-convex objectives have multiple basins; gradient descent reaches the basin determined by initialization. Mitigation: multiple restarts, simulated annealing, or warm-starting from a pre-trained model. In deep learning, the loss landscape has many "good" local optima (lottery-ticket hypothesis); in OR, local optima are often catastrophic.

2. **Vanishing / exploding gradients.** Deep networks have gradients that are products of many terms; the product either shrinks to zero (sigmoid) or blows up (ReLU with bad init). Mitigation: residual connections (skip-connections make the gradient path additive), normalization (BatchNorm, LayerNorm), careful initialization (Xavier, He), gradient clipping.

3. **Saddle points.** In high dimensions, saddle points vastly outnumber local minima (Dauphin et al. 2014). At a saddle, $\nabla f = 0$ but the Hessian is indefinite; pure gradient descent stalls. Mitigation: momentum (escapes saddles), or second-order methods, or noise injection (SGD's stochasticity helps).

4. **Infeasible constraints.** A program with no feasible point returns "infeasible" from a solver, but in production systems this often means the modeler chose bad constraints. Mitigation: relax with slack variables and penalize; infeasibility in the slack = which constraint is over-tight.

5. **Numerical instability.** log of zero, division by tiny variances (in Adam), overflow in exp (softmax), cancellation in subtraction. Mitigation: log-sum-exp trick, epsilon in denominators, gradient clipping, fp16 → fp32 fallback.

6. **Curse of dimensionality.** The volume of $\mathbb{R}^n$ grows exponentially; sampling-based methods (evolutionary algorithms, grid search) become useless beyond $n \approx 10$. Mitigation: exploit structure (convexity, sparsity, low intrinsic dimension); gradient methods are largely immune because gradients are $O(n)$ per step.

7. **Premature convergence.** Population-based methods (genetic algorithms, CMA-ES) collapse to a single basin before exploring. Mitigation: mutation rates, restart strategies, niching. In ML, this manifests as mode collapse in GANs.

8. **Stale / biased gradients in distributed training.** Async SGD workers compute gradients on stale parameters; the effective gradient is biased. Mitigation: sync SGD (slow but exact), or staleness-bounded async (Hogwild, EASGD).

9. **Bad local approximations.** Quasi-Newton methods (BFGS, L-BFGS) build a Hessian approximation from gradient differences; if the function is non-smooth (e.g., ReLU at 0) the approximation is garbage. Mitigation: smooth approximations (softplus instead of ReLU), subgradient methods, or trust-region methods.

10. **Constraint qualification failure.** KKT conditions require a constraint qualification (Slater, LICQ) to be necessary. Without it, KKT can miss optima (the KKT multipliers don't exist). Mitigation: verify CQ, or use sequential quadratic programming which handles degeneracy better.

11. **Step-size pathologies.** Too large a learning rate diverges; too small never converges; "just right" depends on the curvature. Line search (backtracking, Armijo) and trust-region methods adaptively tune the step. Without them, the user becomes a hyperparameter tuner. Mitigation: adaptive methods (Adam) help, but do not replace principled step-size control in non-convex optimization (robotics, scientific computing).

12. **Objective misspecification.** The hardest failure: optimizing the wrong thing. A recommender system that maximizes click-through rate maximizes engagement, not user welfare. The optimization converges beautifully to a globally bad outcome. No algorithm fixes this; only modeling and measurement do. Mitigation: hold-out metrics that differ from the training metric; causal inference for the long-term effect; offline policy evaluation before deployment.

## 6. Transfer tests

#sr
- **Terminology shift**: A compiler decides which variables to keep in registers and which to spill to the stack, given $k$ registers. Without using the words *optimization*, *constraint*, or *objective*, identify the schema, the three formal components, and the algorithm class.
- **Representation shift**: You are given a 2D matrix of pairwise distances between cities; you must visit each city exactly once and return to the start with minimum total distance. Frame this as the schema: what is $\mathcal{X}$, $f$, the constraints? Why does LP relaxation with subtour-elimination constraints give a lower bound?
- **Constraint shift**: A neural network's parameters must satisfy $\|w\|_2 \leq R$ (norm constraint). Compare three approaches: (a) projected gradient (project to $\ell_2$ ball after each step), (b) penalty method (add $\lambda \cdot \max(0, \|w\|_2 - R)$ to loss), (c) Lagrangian (dual variable $\lambda$ updated upward when constraint is violated). For each, state the asymptotic behavior and the failure mode.
- **Unnamed solution**: A power grid operator must dispatch generators every 5 minutes to meet demand at minimum cost while respecting ramp limits, transmission capacity, and generator min/max output. Identify the schema, the class of program (LP, QP, MIP, NLP?), and the algorithm used in production EMS systems.
- **Competing schemas**: A recommender system ranks items by predicted click-through rate. Is this S4 (optimization), S8 (probability), or S10 (search)? State the structural feature that decides.
- **Adversarial shift**: A model is trained with SGD against an adversary who can inject 1% of the training data. Which optimizer (vanilla SGD, momentum, Adam) is most robust, and why? Identify the schema-level move (robust loss, robust gradient, robust sampling) that addresses each attack class.
- **Scale shift**: The objective has $10^9$ parameters and $10^{12}$ training examples. Describe the distributed-training scheme that keeps convergence while bounding per-node memory. Which invariant of single-node SGD (exact gradient, deterministic order, synchronous update) must relax first?
- **Causality shift**: A user asks you to optimize "model quality" by tuning hyperparameters on a held-out set. The held-out set has been used 1000 times for the same purpose. Identify the schema-level failure (overfitting to the validation set), the formal object that captures it (PAC-Bayes bounds, generalization theory), and the structural fix (nested cross-validation, fresh holdout, causal inference).

## 7. Delayed retrieval

#sr
- **Recall**: State the KKT conditions and the role of complementary slackness.
- **Explanation**: Why does convexity imply that every local optimum is global? Give the one-paragraph proof.
- **Derivation**: Derive the Adam update rule from the requirements "per-parameter learning rate, invariant to gradient scale." Identify the bias-correction term and explain why it is needed in the first few steps.
- **Implementation**: Implement projected gradient descent onto the $\ell_2$ ball of radius $R$. State the projection formula, the convergence rate for a convex smooth objective, and the bug if you forget the projection.
- **Diagnosis**: A model's training loss plateaus at a high value. Describe the diagnostic procedure to distinguish (a) local optimum, (b) saddle point, (c) vanishing gradient, (d) too-small learning rate, (e) bug in gradient computation. Which single experiment settles each?
- **Transfer**: You move from training deep networks to solving vehicle routing problems. Predict two things that *carry over* (schema-level) and two that *break* (algorithm-level). Justify via the optimization schema.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — "every decision is an optimization" is one of the most transferable schemas in CS.
- **Related schemas**: [[02_Schemas/S8 — Probability & Uncertainty|S8 Probability & Uncertainty]] (stochastic optimization, MLE/MAP as optimization), [[02_Schemas/S9 — Representation & Transformation|S9 Representation & Transformation]] (optimization in transformed spaces — features, embeddings), [[02_Schemas/S10 — Search & Inference|S10 Search & Inference]] (combinatorial optimization *is* search).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing query planning to ML training reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
