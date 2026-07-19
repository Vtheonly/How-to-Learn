---
type: Schema
tags: [Schema]
created: 2026-07-20
updated: 2026-07-20
mastery: 3-derivation
---

# S9 — Representation & Transformation

> A **representation** is a mapping $\phi$ that encodes an entity as a structured object (typically a vector), and a **transformation** is a function $T$ that maps one representation to another; the engineering question is always how to choose $\phi$ so that the relevant operations (similarity, distance, composition) become *cheap and meaningful*, and how to choose $T$ so that it preserves the structure the task requires (linearity, invertibility, isometry, equivariance).

---

## 1. Formal core

A **representation** is a function $\phi: \mathcal{E} \to \mathcal{R}$ from a (typically unstructured) entity space $\mathcal{E}$ to a representation space $\mathcal{R}$ that supports computation. The canonical choice is $\mathcal{R} = \mathbb{R}^d$ — a $d$-dimensional vector space — but $\mathcal{R}$ can be any structured object: a tensor, a graph, a sequence, a probability distribution, a quaternion.

A **transformation** is a function $T: \mathcal{R} \to \mathcal{R}'$ that maps representations. The transformation's properties determine what computations it supports:

- **Linear**: $T(v) = Av$ for a matrix $A \in \mathbb{R}^{m \times d}$. Preserves vector-space structure: $T(\alpha v + \beta w) = \alpha T(v) + \beta T(w)$. Composes by matrix multiplication: $T_2 \circ T_1 = A_2 A_1$. Linear transformations are the workhorse of representation theory because they are tractable (closed-form analysis), composable (matrix multiply), and expressive enough for most engineering tasks when combined with non-linearities between layers.
- **Affine**: $T(v) = Av + b$. Adds translation; the standard form of a neural network layer.
- **Non-linear**: any other $T$. Required for universal approximation (a purely linear deep network is equivalent to a single linear layer). Non-linearities (ReLU, GELU, sigmoid, attention softmax) are what make depth meaningful.
- **Invertible**: $T^{-1}$ exists. Lossless transformations; the original representation can be recovered. Examples: rotation, permutation, change of basis, Fourier transform, normalizing flows.
- **Lossy / projection**: $T^{-1}$ does not exist (e.g., dimensionality reduction, pooling). Information is lost; the loss is the engineering tradeoff.
- **Isometry**: $\|T(v) - T(w)\| = \|v - w\|$. Preserves distances. Rotations and orthonormal projections are isometries; PCA's projection onto the top-$k$ principal axes is not (it shrinks distances in the discarded directions).
- **Equivariant**: $T(g \cdot v) = g \cdot T(v)$ for a group action $g$. The transformation commutes with the symmetry. Translation-equivariant: CNNs (translating the input translates the feature map). Rotation-equivariant: spherical CNNs. Permutation-equivariant: transformers (with attention), DeepSets.
- **Invariant**: $T(g \cdot v) = T(v)$. The transformation ignores the symmetry. Translation-invariant: image classification (a cat is a cat regardless of position). Permutation-invariant: set-input networks.

**Change of basis** is the canonical representation transformation. If $P$ is invertible, $v' = P^{-1} v$ expresses $v$ in a new basis. The entity $\phi$-represented is unchanged; only its coordinate description changes. This is the deep point: the representation is a *choice*, not a fact about the entity. The eigenbasis is the special basis in which a linear transformation $A$ becomes diagonal: $A = P \Lambda P^{-1}$, where $\Lambda = \text{diag}(\lambda_1, \dots, \lambda_d)$. Eigenvalues $\lambda_i$ and eigenvectors (columns of $P$) are invariants of $A$ — they do not depend on the coordinate choice.

**Eigenvalues and eigenvectors**: $Av = \lambda v$ for eigenvector $v$ and eigenvalue $\lambda$. The eigenvalue is the factor by which $A$ stretches the eigendirection. The set of eigenvalues is the **spectrum**; the largest eigenvalue dominates the long-term behavior of $A^n$ — this is why PageRank converges to the leading eigenvector, why power iteration works, and why the spectral radius bounds matrix powers. **Singular values** (SVD: $A = U \Sigma V^\top$) generalize eigenvalues to non-square matrices; the top-$k$ singular values give the best rank-$k$ approximation (Eckart-Young theorem).

**Embeddings** map discrete entities to continuous vectors preserving similarity. The encoder $\phi: \mathcal{E} \to \mathbb{R}^d$ is learned so that $\langle \phi(e_1), \phi(e_2) \rangle$ (or cosine, or Euclidean distance) reflects a task-relevant similarity. Word2vec trains $\phi$ so that $\phi(\text{king}) - \phi(\text{man}) + \phi(\text{woman}) \approx \phi(\text{queen})$ — the embedding captures analogical structure as linear directions. Modern LLM embeddings (BERT, GPT, sentence-transformers) extend this to sentences and documents. The key property: **the geometry of the embedding space encodes semantic relations as spatial relations.** Cosine similarity = semantic similarity; vector arithmetic = relation composition; cluster structure = categorical structure.

**The representation determines the operation's cost.** A graph stored as an adjacency matrix makes edge lookup $O(1)$ but neighbor enumeration $O(n)$; stored as an adjacency list, the reverse. A 3D rotation stored as Euler angles makes composition trig-heavy and suffers from gimbal lock; stored as a quaternion, composition is $O(1)$ and the representation is gimbal-lock-free; stored as a rotation matrix, composition is a matrix multiply. **Choosing the representation is choosing the complexity of the operations you care about.** This is the schema-level reason "premature optimization" is wrong but "premature representation choice" is catastrophic — the latter cannot be optimized away.

## 2. Canonical instances (≥3 domains)

| Domain | Entity | Representation $\phi$ | Transformation $T$ | Key property |
|--------|--------|----------------------|---------------------|--------------|
| Linear algebra / ML | Data point | Feature vector $x \in \mathbb{R}^d$ | Linear layer $Ax + b$ | Compositional |
| NLP | Word, sentence | Embedding (word2vec, BERT) | Attention, MLP | Semantic geometry |
| Signal processing | Time-domain signal | Sample array | Fourier transform | Invertible, sparsifies periodic signals |
| Image compression | Image | Pixel array | DCT (JPEG), wavelet (JPEG 2000) | Energy compaction |
| Dimensionality reduction | High-dim vector | Low-dim projection | PCA / SVD / t-SNE / UMAP | Best rank-$k$ approximation (PCA) |
| Computer vision | 3D point / pose | Homogeneous coordinates | Rigid transform $[R \mid t]$ | Invertible, composable |
| Neural rendering | 3D scene | NeRF (MLP weights) / Gaussian splats | Volume rendering | Differentiable |
| Recommendation | User, item | Latent factor $u_i, v_j \in \mathbb{R}^k$ | Inner product $u_i^\top v_j$ | Matrix factorization |
| Graph ML | Node, graph | Node embedding (node2vec, GNN) | Message passing | Permutation-equivariant |
| Cryptography | Message | Ciphertext | Block cipher (AES), RSA | Invertible with key |
| Quantum computing | Qubit state | Complex vector $|\psi\rangle \in \mathbb{C}^{2^n}$ | Unitary $U$ | Invertible, preserves $\ell_2$ norm |
| Databases | Relation | Table (set of tuples) | Relational algebra (selection, projection, join) | Closed under composition |

Across every instance the same four design questions recur: (a) what is the entity and what is the representation space, (b) what operations does the task require (similarity, composition, inversion, projection), (c) what structure must the representation preserve (distances, symmetries, ordering), and (d) what is the cost (memory, compute, training data) of the representation.

A cross-instance pattern worth internalizing: **a good representation makes the downstream task linear (or trivial).** A trained image-classifier embedding makes classes linearly separable; a trained word embedding makes analogies linear; a Fourier transform makes linear time-invariant filtering diagonal (each frequency is independent); a PCA makes the data axes-independent. The representation's job is to absorb the non-linearity of the task so the final operation is simple. This is why "learn the representation, then apply a linear model" is the universal recipe — from PCA + linear regression to BERT + linear probe to ResNet + softmax.

A second pattern: **transformations compose, and composition is the lever.** A 100-layer neural network is 100 transformations composed; a 100-step shader pipeline is 100 transformations composed; a 100-step SQL query plan is 100 relational-algebra operators composed. The schema-level question is always: what are the primitive transformations, what are their composition rules, and what invariants does composition preserve? Linear transformations compose to linear (closed under composition); affine + nonlinearity composes to universal approximation; invertible transformations compose to invertible (normalizing flows exploit this to build complex distributions from simple ones).

A third pattern worth internalizing: **the representation, the transformation, and the task form a co-design triangle.** A representation is never good or bad in isolation — it is good or bad *for a task under a set of operations*. One-hot encoding is bad for similarity (orthogonal vectors) but excellent for lookup (constant-time index). A dense embedding is good for similarity but bad for lookup (no natural index — hence approximate nearest-neighbor indexes). A Fourier representation is good for shift-invariant filtering but bad for localization (the uncertainty principle). The schema-level skill is to name all three vertices — representation, transformation, task — and ask whether the representation's structure aligns with the transformation's requirements under the task's constraints. Most representation failures are misalignments in this triangle: the representation was chosen for one task and reused for another, and the structure that helped in the first task actively hurts in the second.

**Horizontal layering** (apply to each instance for full transfer):
- *Mathematical model*: vector spaces, linear maps, eigenvalues, change of basis, isometries, group actions.
- *Algorithmic layer*: SVD, PCA, FFT, DCT, learned embeddings, attention as a learned linear-combination operator.
- *Systems layer*: columnar storage formats (Parquet) as representations optimized for projection; tensor layouts (NCHW vs NHWC) optimized for different GPU convolution kernels.
- *Hardware layer*: GPU tensor cores accelerate dense matrix multiplications; sparse accelerators (Groq, Cerebras) favor different representations.
- *Production practice*: embedding versioning, drift monitoring on embedding distributions, A/B testing of new representations against downstream metrics.
- *Evaluation layer*: reconstruction error, downstream task accuracy, isotropy / anisotropy metrics, nearest-neighbor retrieval recall.

**Common confusions to surface early** (each is a schema-level misconception):
- Confusing the representation with the entity — the map is not the territory; a BERT embedding is not the sentence, it is one projection of the sentence.
- Confusing "low-dimensional" with "good" — a low-rank projection that discards the discriminative direction is worse than useless.
- Confusing invariance with equivariance — invariant representations discard a symmetry; equivariant ones preserve it. Choosing wrong either loses information or fails to exploit structure.
- Confusing the basis with the space — changing basis does not change the vector; it changes the coordinates. Eigenvalues are basis-independent; components are not.
- Confusing "learned" with "correct" — a learned representation encodes the biases of its training data; a confident embedding can be confidently wrong.
- Confusing dimensionality with capacity — a 1000-dim embedding of a 10-entity problem is mostly empty; the effective capacity is set by the data, not the dimension.
- Confusing representation drift with model bug — when a representation silently shifts between training and serving, the downstream model degrades without any code change.
- Confusing sparsity with inefficiency — a sparse representation that matches the workload's locality can outperform a dense one on memory, cache, and compute simultaneously.

The transfer exercise that builds the schema: take one canonical representation (e.g., a 2D image as a pixel array) and re-represent it at each layer — as a DCT coefficient block (JPEG), as a learned CNN feature map, as a flattened transformer patch sequence. The invariants that survive all representations (the image is recoverable, up to loss; downstream classification accuracy is comparable) are the schema. The invariants that break (storage size, the natural unit of locality, the appropriate convolution kernel) are the representation-specific concerns.

## 3. Contrastive cases

### 3.1 Sparse vs dense representations

A **sparse** representation has most entries zero — e.g., one-hot encoding, bag-of-words, TF-IDF. Pro: interpretable, cheap to update, memory-efficient when sparse storage is used (CSR, COO). Con: high-dimensional ($|\mathcal{E}|$ dimensions for one-hot), no similarity structure (two one-hot vectors are orthogonal regardless of semantic relation). A **dense** representation packs information into a low-dimensional continuous vector — e.g., word embeddings. Pro: low-dimensional, captures similarity, supports arithmetic. Con: opaque, requires training, no guarantee of interpretability. The bug: applying sparse representations where similarity matters (one-hot words → no semantic structure); applying dense representations where interpretability matters (a dense "feature importance" vector is hard to audit).

### 3.2 Explicit (one-hot) vs learned (embedding)

A **one-hot** encoding is the identity representation: $\phi(e_i) = e_i$ (the $i$-th standard basis vector). It loses no information but provides no structure. An **embedding** is learned: $\phi(e_i) = W e_i$ for a learned matrix $W$, equivalently "look up row $i$ of $W$." The embedding's quality depends entirely on the training signal. The bug: training an embedding on a too-small or too-biased corpus produces a representation that is confidently wrong (gender-biased word embeddings, racially-biased image embeddings). Mitigation: audit the embedding (probe for biased directions), debias (project out the bias direction), or train on more diverse data.

### 3.3 Linear vs non-linear transformations

A **linear** transformation $T(v) = Av$ is fully specified by a matrix; composition is matrix multiplication; analysis is tractable (eigenvalues, SVD, condition number). A **non-linear** transformation requires more structure to specify (a neural network's weights and architecture); composition is layer-stacking; analysis is hard (no general eigenvalue theory, no closed-form for condition number). The bug: applying linear models to non-linear phenomena (predicting house prices with linear regression when prices saturate) or applying non-linear models to linear phenomena (a deep network for a problem that linear regression solves — wasted capacity, overfitting). The fix: always try the linear baseline first.

### 3.4 Invertible vs lossy transformations

An **invertible** transformation loses no information; the original can be recovered exactly. Examples: rotation, permutation, Fourier transform, change of basis, normalizing flows, block ciphers. A **lossy** transformation discards information (typically high-frequency, low-magnitude, or task-irrelevant). Examples: JPEG (discards high-frequency DCT coefficients), pooling (discards spatial detail), dimensionality reduction (discards low-variance directions). The bug: applying a lossy transformation when the original must be recovered (lossy "compression" of a database backup), or applying an invertible transformation when the goal is compression (invertible transforms cannot compress below the entropy of the source).

### 3.5 Orthonormal vs oblique bases

An **orthonormal** basis has $\|v_i\| = 1$ and $\langle v_i, v_j \rangle = 0$ for $i \ne j$. Pro: the change-of-basis matrix is orthogonal ($P^{-1} = P^\top$), the projection onto a subspace is $P P^\top$, distances are preserved. An **oblique** basis (non-orthogonal) has none of these conveniences; the projection formula involves $P (P^\top P)^{-1} P^\top$ which is unstable when $P$ is ill-conditioned. The Fourier, DCT, and wavelet bases are orthonormal; PCA produces an orthonormal basis; learned representations are typically oblique. The bug: applying orthonormal-basis formulas to an oblique basis (assuming $P^{-1} = P^\top$ when it doesn't) — silently wrong projections.

### 3.6 Hand-crafted vs learned representations

A **hand-crafted** representation (SIFT features, SIFT, HOG, MFCC, n-grams) encodes domain knowledge; no training needed; interpretable; but limited to what the designer knew. A **learned** representation (CNN features, transformer embeddings) captures patterns the designer didn't know; requires training data and compute; opaque. The historical arc of ML (1990s hand-crafted → 2010s learned) is the schema-level recognition that learned representations dominate when data and compute are abundant. The bug: applying learned representations when data is scarce (overfitting) or when interpretability is required (medical, legal).

### 3.7 Global vs local representations

A **global** representation encodes the whole input in one vector (a sentence embedding; a global image feature). A **local** representation encodes parts (per-token embeddings; per-patch features). Global is cheaper and sufficient for classification; local is required for generation, detection, and structured prediction. The bug: using a global representation for a task that requires localization (image classification embedding for object detection — you've thrown away where the object is). The transformer architecture is fundamentally a **local-to-global** transformation: attention aggregates local token representations into context-aware local representations, repeated until the [CLS] token's representation is global.

## 4. Implementation

**Implement SVD from scratch using power iteration, then use it for image compression.** Target: ~200 lines.

Power iteration for the dominant eigenvector of $A^\top A$:
1. Start with random $v_0 \in \mathbb{R}^n$, $\|v_0\| = 1$.
2. Repeat: $v_{k+1} = A^\top A v_k / \|A^\top A v_k\|$.
3. Converges to the dominant eigenvector of $A^\top A$ (equivalently, the right singular vector $v_1$ of $A$). The singular value is $\sigma_1 = \|A v_1\|$, and the left singular vector is $u_1 = A v_1 / \sigma_1$.
4. **Deflate**: $A \leftarrow A - \sigma_1 u_1 v_1^\top$. Repeat to get the next singular triplet.

For numerical stability and convergence speed, use **block power iteration** (orthogonalize a block of $k$ vectors at each step via QR) or **Lanczos iteration** (Krylov-subspace method).

Image compression:
- Load a 512×512 grayscale image as $A \in \mathbb{R}^{512 \times 512}$.
- Compute the top-$k$ SVD: $A_k = U_k \Sigma_k V_k^\top$ where $U_k, V_k$ are the first $k$ columns and $\Sigma_k$ is the top-left $k \times k$ block.
- Storage: $k \cdot (m + n + 1)$ values vs $m \cdot n$. For $k = 50$ on a 512×512 image, that's $50 \cdot 1025 = 51{,}250$ vs $262{,}144$ — a 5× compression.
- Compute reconstruction error $\|A - A_k\|_F$ and verify it equals $\sqrt{\sum_{i > k} \sigma_i^2}$ (Eckart-Young).

Test cases:
- Synthetic: a rank-10 matrix; verify the SVD recovers exactly 10 nonzero singular values (within floating-point tolerance).
- Convergence: on a 100×100 random matrix, power iteration should converge in <100 iterations; verify the residual $\|A^\top A v - \lambda v\|$ drops geometrically.
- Deflation accumulation: after computing 50 singular triplets, verify $\|A - \sum_{i=1}^{50} \sigma_i u_i v_i^\top\|_F$ matches the analytic residual. If it's larger, deflation has accumulated numerical error — switch to block iteration.
- Image: at $k = 5, 20, 50, 100$, save the reconstructed image. Verify $k=5$ captures gross structure (blurry silhouette), $k=50$ is visually indistinguishable, $k=100$ is exact to the eye. Report the compression ratio and the relative Frobenius error at each $k$.

**Difficulty**: medium. **Sub-skills tested**: power iteration, deflation (and its numerical pitfalls), the Eckart-Young theorem, image I/O. The bugs you will hit: (a) power iteration converges slowly for close singular values — use block iteration or randomized SVD; (b) deflation accumulates floating-point error, making later singular vectors inaccurate — re-orthogonalize against previously found vectors at each step; (c) the SVD is not unique up to sign — $u_i$ and $v_i$ can both flip sign without changing $A$; don't compare singular vectors by equality.

**Extension ladder**:
1. Replace power iteration with **randomized SVD** (Halko, Martinsson, Tropp). The randomized version is $O(m n k)$ vs $O(m n \min(m, n))$ for the full SVD — essential for large matrices.
2. Implement **PCA** as SVD on the mean-centered data. Verify the principal components are the right singular vectors of the centered matrix.
3. Implement a **2D DCT** and compare its compression performance against SVD on the same image. The DCT achieves comparable compression with a fixed (non-data-dependent) basis — this is why JPEG uses DCT instead of SVD.
4. Implement a **low-rank neural network layer** (replace $W \in \mathbb{R}^{m \times n}$ with $U V^\top$, $U \in \mathbb{R}^{m \times k}, V \in \mathbb{R}^{n \times k}$). Verify the parameter count drops from $mn$ to $k(m+n)$ with minimal accuracy loss for $k$ around the spectrum's "knee."

## 5. Failure analysis

1. **Loss of information in low-rank projection.** PCA / SVD truncation discards the bottom singular directions, which are often *not* noise — they can be the discriminative directions for a minority class. The classic case: PCA on facial images retains the lighting direction (high variance) and discards subtle features (low variance) that distinguish identities. Mitigation: supervised dimensionality reduction (LDA, supervised PCA), or evaluate the projection on the downstream task, not on reconstruction error.

2. **Numerical instability in matrix inversion.** Computing $A^{-1}$ when $A$ is ill-conditioned (condition number $\kappa(A) = \sigma_{\max}/\sigma_{\min}$ large) amplifies error: $\|\Delta x\| / \|x\| \le \kappa(A) \cdot \|\Delta b\| / \|b\|$. The bug: solving $Ax = b$ by explicitly computing $A^{-1}$ then multiplying. The fix: never compute $A^{-1}$; solve $Ax = b$ directly via LU or QR, which is more stable and usually faster.

3. **Mode collapse in embeddings.** A trained embedding maps many distinct entities to nearby (or identical) vectors; the geometry has collapsed. The classic case: GAN generators collapse to a few modes; contrastive learning embeddings collapse to a single point if the loss is mis-specified. Mitigation: explicit anti-collapse losses (SimCLR's temperature, SwAV's clustering constraint, spectral regularization).

4. **Catastrophic cancellation.** Computing $a - b$ when $a \approx b$ loses precision — the leading digits cancel and the result has few significant figures. The classic case: computing variance as $\mathbb{E}[X^2] - \mathbb{E}[X]^2$ is numerically unstable for tight distributions; use Welford's online algorithm instead. The fix: prefer algebraically equivalent formulas that avoid subtracting nearly-equal quantities.

5. **Conditioning issues.** A matrix with condition number $10^k$ loses $k$ digits of precision when inverted or used in a linear solve. A matrix with condition number $10^{16}$ (near the precision of double) is effectively singular. The bug: fitting a polynomial regression of degree 20 — the Vandermonde matrix is catastrophically ill-conditioned. The fix: orthogonal polynomial bases (Chebyshev, Legendre), regularization (ridge regression), or lower degree.

6. **Drift in learned representations.** An embedding trained in 2020 has drifted by 2024 — new entities (new words, new products) have no good embedding; old entities' embeddings reflect stale context. The classic case: a recommendation system whose embeddings reflect pre-pandemic behavior. Mitigation: retrain on a sliding window; handle OOV (out-of-vocabulary) entities with a fallback (a "default" embedding plus fine-tuning on the fly); monitor embedding drift.

7. **Anisotropy in embedding spaces.** Learned embeddings (especially BERT) are anisotropic — the vectors cluster in a narrow cone rather than filling the sphere, so cosine similarities are all high and uninformative. The bug: using cosine similarity directly on BERT embeddings yields poor nearest-neighbor retrieval. Mitigation: **whitening** (transform the embeddings to be isotropic), or use a sentence-transformer that was trained to produce isotropic embeddings.

8. **Wrong group for equivariance.** A CNN is translation-equivariant but not rotation-equivariant — a rotated image produces a different feature map. The bug: applying a CNN to a task with rotational symmetry (medical imaging, satellite imagery) without augmentation or rotation-equivariant architecture. Mitigation: data augmentation (rotate the training data), group-equivariant CNNs, or transformer-based architectures with positional encodings that capture the symmetry.

9. **Representation-operation mismatch.** A representation is chosen for one operation but used for another. The classic case: storing a graph as an edge list (good for sparse traversal) then doing dense matrix operations (terrible — requires $O(n^2)$ materialization). The fix: choose the representation based on the *hot-path* operations, not the cold-path ones.

10. **Quantization error.** Reducing a float32 embedding to int8 (for inference speed) introduces quantization noise. The bug: int8 quantization of a deep network's activations can drop accuracy by 5-10% if the activation ranges are not calibrated. Mitigation: calibration (measure activation ranges on a calibration set), per-channel quantization, or mixed-precision (keep sensitive layers in float).

11. **Embedding dimension too small or too large.** Too small ($d = 16$ for a 100k-vocabulary NLP task): the embedding cannot express the distinctions the task needs; accuracy saturates. Too large ($d = 4096$ for a 1k-vocabulary task): overfitting, memory waste, slower training. The right $d$ scales with $\sqrt{|\mathcal{E}|}$ empirically — but the principled answer is to validate on a held-out set and pick the smallest $d$ that doesn't hurt downstream performance.

12. **Loss of ordering in permutation-invariant representations.** A permutation-invariant representation (DeepSets, sum-pooling) treats the input as a set — but if the input is a sequence, the order is information. The bug: applying set-based architectures to sequence tasks. Mitigation: positional encodings (transformers), recurrent architectures (RNNs, LSTMs), or causal attention masks.

## 6. Transfer tests

#sr
- **Terminology shift**: A recommender team reports "users and items are projected into a shared embedding space; we predict ratings as $u_i^\top v_j$." Without using the words *matrix* or *factorization*, identify the schema (representation + linear transformation), the entity (user, item), the representation (latent vector), and the operation (inner product = similarity).
- **Representation shift**: You are given a 3D rotation stored as Euler angles and the task is to compose 1000 rotations. Identify the schema (representation choice determines operation cost), the failure (gimbal lock + trig-heavy composition), and the fix (quaternions or rotation matrices).
- **Constraint shift**: Each representation must fit in 8 bytes (int64). Compare three representations of a set of 1000 elements (bitmap, sorted list, Bloom filter) on the axes of precision, recall, and operation cost. Which representation is appropriate for "is element $x$ in the set, with 1% false positive tolerance"?
- **Unnamed solution**: A team reports "our transformer's [CLS] embedding is anisotropic; cosine similarity is uninformative." Identify the schema (representation geometry), the bug (anisotropy), and the fix (whitening, or train with a contrastive loss).
- **Competing schemas**: A graph neural network applies message passing to node embeddings. Is this S9 (Representation) or S2 (Graph & Reachability)? State the structural feature that decides (the transformation is on *vectors* that live on graph nodes), and explain when each schema is the right lens.
- **Failure shift**: A linear regression on a degree-20 polynomial has condition number $10^{14}$ and the coefficients oscillate wildly. Identify the schema (conditioning), the bug (Vandermonde ill-conditioning), and the fix (orthogonal polynomial bases, regularization, or lower degree).
- **Scale shift**: A system must embed 100M documents for nearest-neighbor retrieval with 10ms p99 latency. Identify which representation (dense float32, int8-quantized, binary hash) and which index (brute-force, IVF, HNSW, ScaNN) satisfy the constraint, and the tradeoff (recall vs latency vs memory).
- **Layer shift**: The same logical "embedding" is implemented as (a) a one-hot vector, (b) a learned 300-dim word2vec, (c) a 768-dim BERT contextual embedding. Identify which invariants of (a) survive into (b) and (c), and which new failure modes each layer introduces (no semantic structure, biased training corpus, context-dependent representation that varies per call).

## 7. Delayed retrieval

#sr
- **Recall**: State the eigenvalue equation. State the Eckart-Young theorem. State the formula for the projection of $v$ onto a subspace spanned by orthonormal columns of $P$.
- **Explanation**: Why does PCA on facial images sometimes discard identity-discriminative directions? Give the schema-level reason (PCA maximizes variance, not discriminability; discriminative directions can be low-variance).
- **Derivation**: Derive the SVD of a rank-1 matrix $A = \sigma u v^\top$. Generalize to rank-$k$. Show that the best rank-$k$ approximation in Frobenius norm is the top-$k$ SVD truncation (Eckart-Young).
- **Implementation**: Implement power iteration with deflation. State the convergence failure mode (close singular values converge slowly) and the fix (block power iteration or randomized SVD). State the test that catches accumulated deflation error (compare residual to analytic value).
- **Diagnosis**: A trained embedding yields poor nearest-neighbor retrieval despite high training accuracy. Describe the diagnostic procedure to identify whether the cause is (a) anisotropy, (b) too-low dimension, (c) training-serving skew, or (d) wrong similarity metric. Which test settles each (reliability diagram of cosine vs ground-truth; raise $d$; measure input drift; compare cosine vs L2 vs Mahalanobis)?
- **Transfer**: You move from SVD for image compression to a low-rank neural network layer. Predict two invariants that *carry over* (low rank = top-$k$ singular subspace; Eckart-Young bounds the approximation error) and two that *break* (the layer is non-linear end-to-end; the "best" low rank is task-dependent, not variance-dependent). Justify via the representation schema.

---

## Cross-links

- **Theory**: [[01_Theory/T1 — Schema Transfer|T1 Schema Transfer]] — representations recur from PCA to NeRF to quaternions.
- **Related schemas**: [[02_Schemas/S4 — Optimization & Constraints|S4 Optimization & Constraints]] (fitting representations is optimization; the SVD solves a constrained least-squares problem), [[02_Schemas/S8 — Probability & Uncertainty|S8 Probability & Uncertainty]] (probabilistic representations: distributions, Bayesian embeddings, latent variable models), [[02_Schemas/S2 — Graph & Reachability|S2 Graph & Reachability]] (graph embeddings, message passing as representation transformation).
- **Methods**: [[03_Methods/M6 — Analogical Comparison|M6 Analogical Comparison]] — comparing PCA to Fourier to a CNN layer reveals the schema.
- **Protocol**: [[04_Protocols/P7 — How to Build a Schema Dossier|P7 Build Dossier]].
