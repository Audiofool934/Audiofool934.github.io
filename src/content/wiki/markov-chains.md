---
title: 'Markov Chains: Forgetting and Mixing'
updatedDate: 2026-03-10
tags: ["stochastic", "probability", "math"]
parents: []
related: ["renewal-process", "Conditional-Expectation-Variance"]
---

## The Core Idea: Forgetting Is the Feature

A Markov chain is a system that **forgets**. At each step, the entire history collapses into a single state, and the future depends only on where you are, not how you got here. This sounds like a limitation—but it is precisely what makes Markov chains tractable.

The deep question is not *whether* the chain forgets its initial condition, but **how fast**.


### 1. Why Memorylessness Is Not Enough

The Markov property says $P(X_{n+1} | X_n, \ldots, X_0) = P(X_{n+1} | X_n)$. This is a **local** statement about one-step transitions. It says nothing about long-term behavior.

Consider two chains on $\{0, 1\}$:

- **Chain A**: $P(0 \to 1) = P(1 \to 0) = 0.5$. This chain mixes instantly—after one step, the distribution is uniform regardless of where you started.
- **Chain B**: $P(0 \to 0) = 0.999$, $P(1 \to 1) = 0.999$. This chain is also ergodic, but it takes thousands of steps to "forget" its starting state.

Both are Markov. Both converge to a stationary distribution. The difference is **mixing time**—and understanding what controls it is the central problem.


### 2. The Spectral Gap: Geometry of Forgetting

Let $P$ be the transition matrix of an irreducible, aperiodic chain on $n$ states with stationary distribution $\pi$. The eigenvalues of $P$ satisfy:

$$
1 = \lambda_1 > |\lambda_2| \geq \cdots \geq |\lambda_n|
$$

The **spectral gap** $\gamma = 1 - |\lambda_2|$ controls everything.

**Why?** The eigenvector for $\lambda_1 = 1$ is the stationary distribution $\pi$ itself. Every other eigenvector represents a "mode of deviation" from stationarity. After $t$ steps, the $k$-th mode decays as $\lambda_k^t$. So the slowest-decaying non-stationary mode determines the mixing time:

$$
t_{\text{mix}} \asymp \frac{1}{\gamma} = \frac{1}{1 - |\lambda_2|}
$$

**The geometric insight**: think of $P$ as a linear operator on the space of distributions. The stationary distribution $\pi$ is its **fixed point**. The spectral gap measures how strongly $P$ **contracts** directions orthogonal to $\pi$. A large gap means aggressive contraction—fast forgetting.

This is the same geometry as conditional expectation: $P$ acts as a projection-like operator, pushing all distributions toward $\pi$, and the spectral gap quantifies the rate.


### 3. Conductance: The Bottleneck Principle

The spectral gap has a beautiful combinatorial characterization via **Cheeger's inequality**. Define the conductance:

$$
\Phi = \min_{S: \pi(S) \leq 1/2} \frac{\sum_{i \in S, j \notin S} \pi_i P_{ij}}{\pi(S)}
$$

This measures the worst-case "flow" across any partition of the state space. If the chain has a bottleneck—two large clusters connected by a thin bridge—the conductance is small.

**Cheeger's inequality** relates the two:

$$
\frac{\Phi^2}{2} \leq \gamma \leq 2\Phi
$$

The insight: **mixing is slow if and only if the state space has a bottleneck**. This connects Markov chain theory to graph partitioning, expander graphs, and even differential geometry (where the original Cheeger inequality lives on Riemannian manifolds).


### 4. Coupling: Forgetting as Coalescence

There is an entirely different way to understand mixing that avoids eigenvalues altogether: **coupling**.

Suppose we run two copies of the chain, $(X_t, Y_t)$, starting from different initial states but using the same transition kernel (or a cleverly correlated one). A **coupling** is any joint process where both marginals are valid copies of the chain.

**Coupling Lemma**: $\|P^t(x, \cdot) - \pi\|_{TV} \leq P(\tau_{\text{couple}} > t)$, where $\tau_{\text{couple}}$ is the first time the two copies meet.

The mixing time is bounded by how quickly we can make two copies **coalesce**. This is powerful because:

1. It gives concrete upper bounds via explicit coupling constructions.
2. It provides physical intuition: the chain has "forgotten" its initial state when two independent trajectories become indistinguishable.

**Example**: For a random walk on the hypercube $\{0,1\}^n$, the "coupon collector" coupling flips coordinates one at a time. Both copies agree once every coordinate has been updated at least once, giving $t_{\text{mix}} \sim n \log n$.


### 5. The Dichotomy: Rapid Mixing vs. Torpid Mixing

In applications (MCMC, sampling algorithms), the fundamental question is:

> Is $t_{\text{mix}}$ polynomial or exponential in the problem size?

- **Rapid mixing** ($t_{\text{mix}} = \text{poly}(n)$): The Glauber dynamics for the Ising model above the critical temperature. The Metropolis-Hastings chain for log-concave distributions.
- **Torpid mixing** ($t_{\text{mix}} = \exp(\Omega(n))$): The Ising model below the critical temperature (phase coexistence creates an exponential bottleneck).

This is where the bottleneck picture becomes vivid: at low temperature, the Ising model has two dominant states (all $+$ and all $-$) separated by a free energy barrier. The chain must cross this barrier to mix, and the crossing probability is exponentially small.


### Why This Matters

The theory of mixing times is the mathematical foundation for:

- **MCMC**: Every Bayesian posterior sample relies on a chain that has (hopefully) mixed.
- **Simulated Annealing**: Optimization by slowly reducing temperature—but too fast and the chain fails to mix at each stage.
- **Card Shuffling**: The classic result that 7 riffle shuffles suffice for a 52-card deck is a mixing time calculation.

The unifying principle: **useful randomness requires forgetting, and the rate of forgetting is governed by the geometry of the state space**.
