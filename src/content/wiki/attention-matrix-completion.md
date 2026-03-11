---
title: 'Attention Is Learned Association'
updatedDate: 2026-03-10
tags: ["deep learning", "neural network", "linear algebra"]
parents: []
related: ["svd", "flow-matching"]
---

## Beyond "Weighted Average"

Attention is typically described as "a weighted average over values, where the weights are determined by query-key similarity." This is accurate but shallow. The deeper question is: **why does this work so unreasonably well?**


### 1. The Mechanics, Concisely

Given input embeddings $X \in \mathbb{R}^{n \times d}$ (sequence length $n$, dimension $d$):

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V
$$

where $Q = XW_Q$, $K = XW_K$, $V = XW_V$ are learned linear projections.

The matrix $A = \text{softmax}(QK^T / \sqrt{d_k})$ is an $n \times n$ matrix of attention weights. Row $i$ sums to 1 and represents a probability distribution over positions: "how much should position $i$ attend to each other position?"

The output for position $i$ is a convex combination of value vectors, with coefficients determined by query-key similarity.


### 2. The Kernel Perspective: Attention as Soft Lookup

Strip away the neural network context. What is attention doing algebraically?

We have a set of **keys** $\{k_j\}$ associated with **values** $\{v_j\}$. Given a **query** $q_i$, we compute:

$$
\text{output}_i = \sum_j \frac{\exp(q_i \cdot k_j / \sqrt{d})}{\sum_{j'} \exp(q_i \cdot k_{j'} / \sqrt{d})} \, v_j
$$

This is **kernel smoothing** with a softmax kernel. It's the same operation as Nadaraya-Watson regression in nonparametric statistics: estimate the value at a query point by a weighted average of nearby observed values, with weights determined by a kernel function.

The innovation is that the "space" in which proximity is measured (the query-key projection) is **learned**, not fixed. The model discovers which dimensions of similarity are relevant for the task.


### 3. Why Low Rank Is the Key

Empirically, the attention matrix $A$ tends to be approximately **low-rank**. That is, out of $n^2$ possible attention patterns, the actual attention can be well-approximated by a few dominant modes.

Why? Because natural data has structure. In language, most tokens attend to a small number of syntactically or semantically relevant positions. In images, most patches attend to spatially or semantically nearby patches. The full $n \times n$ matrix has $n^2$ degrees of freedom, but the data only requires $O(n \cdot r)$ for some effective rank $r \ll n$.

This connects directly to the [SVD](/wiki/svd/): the dominant singular values of $A$ capture the essential attention patterns. The trailing singular values correspond to noise or irrelevant interactions.

**Practical consequence**: this is why efficient attention methods (linear attention, sparse attention, low-rank approximations) work. They exploit the fact that the information-theoretic content of $A$ is far less than $n^2$.


### 4. Multi-Head: Decomposing the Interaction Space

Single-head attention computes one set of associations. Multi-head attention runs $h$ independent attention operations in parallel, each with its own $W_Q^{(i)}, W_K^{(i)}, W_V^{(i)}$ of dimension $d/h$:

$$
\text{MultiHead}(X) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h) W_O
$$

The geometric interpretation: each head learns to attend along a **different subspace** of the embedding space. Head 1 might capture syntactic dependencies (subject-verb agreement), head 2 might capture semantic similarity, head 3 might capture positional proximity.

This is analogous to how the SVD decomposes a matrix into independent rank-1 components. Multi-head attention decomposes the full interaction pattern into independent "modes" of association, each operating in its own subspace.


### 5. Self-Attention as Message Passing

There is yet another framing. View the sequence positions as nodes in a fully connected graph. Self-attention computes, for each node:

$$
x_i' = \sum_j \alpha_{ij} \, v_j
$$

This is exactly **message passing** on the graph: each node aggregates information from its neighbors, with learned, data-dependent edge weights $\alpha_{ij}$.

One layer of self-attention = one round of message passing. Stacking $L$ layers allows information to propagate across $L$ hops. The difference from classical GNNs: the graph topology is not fixed but **learned per-input** through the QKV mechanism.


### 6. Why $\sqrt{d_k}$ Matters

The scaling factor $1/\sqrt{d_k}$ prevents the dot products $q_i \cdot k_j$ from growing with dimension. Without it, when $d_k$ is large, the dot products have variance $\sim d_k$, pushing the softmax into saturation (one weight near 1, rest near 0). The gradient vanishes.

The scaling normalizes the variance to $O(1)$ regardless of $d_k$, keeping the softmax in its sensitive regime where gradients flow. This is a simple but critical detail—the difference between a model that trains and one that doesn't.


### The Insight

Attention is not a single idea but a convergence of several:
- **Nonparametric regression** (kernel smoothing with learned metric)
- **Low-rank structure** (natural data doesn't need $n^2$ interactions)
- **Subspace decomposition** (multi-head as parallel rank-1 modes)
- **Dynamic graph construction** (topology determined by content, not position)

Its power comes from computing **data-dependent, asymmetric, differentiable associations** between all pairs of elements—and from the fact that real-world data has enough low-rank structure that this computation is both feasible and informative.
