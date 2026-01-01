---
title: 'Conditional Expectation as Projection'
updatedDate: 2026-01-01
tags: ["Probability", "Math", "Regression"]
parents: []
related: []
---

## The Geometry of Uncertainty

In introductory probability, we often treat "variance" as a monolithic number describing spread. But when we introduce information—represented by a $\sigma$-algebra or a random variable $X$—we can dissect this fluctuations with remarkable precision.

The core insight is geometric: if we view random variables as vectors in an $L^2$ space (the space of random variables with finite second moments), then **conditional expectation is nothing more than an orthogonal projection**.

### 1. The Projection Principle

Let $Y \in L^2(\Omega, \mathcal{F}, P)$ be our target variable. We observe some information $X$, which generates a sub-$\sigma$-algebra $\mathcal{G} = \sigma(X)$.

We seek the "best" approximation of $Y$ given only the information in $\mathcal{G}$. "Best" here means minimizing the mean squared error (the $L^2$ distance). The solution, $\mathbb{E}[Y|X]$, is the unique element $Z$ in the subspace of $\mathcal{G}$-measurable functions such that the error is orthogonal to the subspace.

$$
Y = \underbrace{\mathbb{E}[Y|X]}_{\text{Signal}} + \underbrace{(Y - \mathbb{E}[Y|X])}_{\text{Noise } \varepsilon}
$$

This isn't just a definition; it's a decomposition of the vector $Y$ into two orthogonal components:
1.  **The Projection**: $\mathbb{E}[Y|X]$ lies *in* the plane defined by $X$.
2.  **The Residual**: $\varepsilon$ is *perpendicular* to that plane.

### 2. Orthogonality and the Vanishing Cross-Term

The power of this perspective becomes clear when we look at the orthogonality condition. By definition of projection, the residual $\varepsilon$ is uncorrelated with any function of $X$ (technically, orthogonal in the inner product $\langle U, V \rangle = \mathbb{E}[UV]$).

$$
\mathbb{E}[\varepsilon \cdot g(X)] = 0 \quad \text{for any measurable } g
$$

This simple fact explains why there are no "cross terms" when we analyze variance.

### 3. The Law of Total Variance via Pythagoras

Since the decomposition $Y = \mathbb{E}[Y|X] + \varepsilon$ is orthogonal, the Pythagorean theorem applies directly to their "lengths" (variances):

$$
\|Y - \mathbb{E}[Y]\|^2 = \|\mathbb{E}[Y|X] - \mathbb{E}[Y]\|^2 + \|\varepsilon\|^2
$$

Translated back into probabilistic language, this is the **Law of Total Variance**:

$$
\operatorname{Var}(Y) = \operatorname{Var}(\mathbb{E}[Y|X]) + \mathbb{E}[\operatorname{Var}(Y|X)]
$$

*   **$\operatorname{Var}(\mathbb{E}[Y|X])$**: The "Explained Variance." This is how much our prediction moves around as $X$ changes. If $X$ tells us a lot about $Y$, this component is large.
*   **$\mathbb{E}[\operatorname{Var}(Y|X)]$**: The "Unexplained Variance." This is the average squared length of the residual $\varepsilon$. It’s the noise we're stuck with even after using $X$.

### 4. Why This Matters

This geometric structure repeats itself everywhere in statistics:

*   **Regression (ANOVA)**: SST = SSR + SSE is just finite-sample version of this same Pythagorean identity.
*   **Machine Learning**: The irreducible error (Bayes error) in the Bias-Variance decomposition corresponds exactly to the noise term $\mathbb{E}[\operatorname{Var}(Y|X)]$. No model, no matter how complex, can project onto a component of $Y$ that is orthogonal to the feature space $X$.

Viewing conditional expectation as a projection rather than an integral formula clarifies why we split errors the way we do: we are simply projecting a vector onto a subspace and measuring what's left.
