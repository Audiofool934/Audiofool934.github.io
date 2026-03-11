---
title: 'Bias-Variance: The Irreducible Geometry of Prediction'
updatedDate: 2026-03-10
tags: ["ml", "machine learning", "probability", "regression"]
parents: []
related: ["Conditional-Expectation-Variance", "svd"]
---

## The Decomposition Everyone Gets Wrong

The bias-variance tradeoff is usually presented as a vague heuristic: simple models underfit, complex models overfit, find the sweet spot. This misses the actual mathematics—which is both cleaner and more revealing than the cartoon.


### 1. Setup: What Are We Decomposing?

Fix an input $x$. The target is $Y = f(x) + \varepsilon$ where $f(x) = \mathbb{E}[Y|X=x]$ and $\varepsilon$ is noise with $\mathbb{E}[\varepsilon|X=x] = 0$, $\operatorname{Var}(\varepsilon|X=x) = \sigma^2$.

We train a model $\hat{f}$ on a random training set $\mathcal{D}$. The **expected prediction error** at $x$ is:

$$
\mathbb{E}_\mathcal{D}\left[(Y - \hat{f}(x))^2\right]
$$

The expectation is over both the noise in $Y$ and the randomness in $\mathcal{D}$.


### 2. The Decomposition

Expand the squared loss:

$$
\mathbb{E}\left[(Y - \hat{f}(x))^2\right] = \underbrace{\sigma^2}_{\text{Irreducible}} + \underbrace{\left(f(x) - \mathbb{E}[\hat{f}(x)]\right)^2}_{\text{Bias}^2} + \underbrace{\mathbb{E}\left[(\hat{f}(x) - \mathbb{E}[\hat{f}(x)])^2\right]}_{\text{Variance}}
$$

Three terms:

1. **Irreducible error $\sigma^2$**: The noise in $Y$ that no model can predict. This is $\mathbb{E}[\operatorname{Var}(Y|X)]$—the exact quantity from the [Law of Total Variance](/wiki/Conditional-Expectation-Variance/).

2. **Bias²**: How far the average prediction (over all possible training sets) deviates from the truth. This is systematic error—the model class cannot express $f$.

3. **Variance**: How much the prediction fluctuates across training sets. This is sensitivity to the particular sample drawn.


### 3. The Geometric View

Recall from [Conditional Expectation as Projection](/wiki/Conditional-Expectation-Variance/): in $L^2$ space, $f(x) = \mathbb{E}[Y|X=x]$ is the **orthogonal projection** of $Y$ onto the subspace of functions of $X$.

Now introduce a model class $\mathcal{H}$ (linear functions, decision trees, neural networks). This is a **further restriction**—a subspace within the subspace of all measurable functions of $X$.

$$
Y = \underbrace{f(x)}_{\text{Best possible}} + \underbrace{\varepsilon}_{\text{Irreducible}} = \underbrace{\hat{f}_\mathcal{H}(x)}_{\text{Best in } \mathcal{H}} + \underbrace{(f(x) - \hat{f}_\mathcal{H}(x))}_{\text{Approximation error (Bias)}} + \underbrace{\varepsilon}_{\text{Noise}}
$$

The **bias** measures the distance from $f$ to the model subspace $\mathcal{H}$. A richer $\mathcal{H}$ (higher-dimensional subspace) reduces this distance—at the cost of **variance**, because a higher-dimensional subspace is harder to estimate from finite data.

The tradeoff is geometric: **the subspace that best approximates $f$ is not the one most reliably estimable from $n$ samples**.


### 4. Concrete Example: Polynomial Regression

Fit degree-$k$ polynomials to data from $f(x) = \sin(x)$ with noise.

- $k = 1$ (linear): High bias (a line cannot approximate a sine wave), low variance (only 2 parameters to estimate).
- $k = 15$: Low bias (the polynomial can fit the sine wave closely), high variance (16 parameters estimated from noisy data → wildly different fits for different samples).
- **Optimal $k$**: Somewhere in between. The sweet spot depends on $n$ (more data → can afford higher $k$) and $\sigma^2$ (more noise → need lower $k$).

The singular values of the design matrix $X$ (cf. [SVD](/wiki/svd/)) reveal this directly: the $k$-th singular value determines how well the $k$-th polynomial component can be estimated. When $\sigma_k$ is small relative to the noise level, that component's estimate is dominated by variance.


### 5. Why This Tradeoff Is Fundamental

The bias-variance decomposition is not specific to any algorithm. It is a **property of the estimation problem itself**.

For **any** estimator $\hat{f}$:
- If $\hat{f}$ is deterministic (e.g., $\hat{f}(x) = 0$): variance is zero, bias can be large.
- If $\hat{f}$ interpolates the training data exactly: bias is zero on training points, variance can be enormous.
- The Bayes-optimal predictor $f(x) = \mathbb{E}[Y|X=x]$ has zero bias, zero variance—but it requires knowing the true conditional distribution, which is exactly what we don't have.

**The irreducible error is the floor**. No model, no matter how flexible, no matter how much data, can go below $\sigma^2$. This connects directly to the total variance decomposition: $\operatorname{Var}(\mathbb{E}[Y|X])$ is the maximum achievable explained variance. The rest—$\mathbb{E}[\operatorname{Var}(Y|X)]$—is noise forever.


### The Modern Wrinkle: Double Descent

Classical wisdom: error is U-shaped as model complexity increases (underfit → sweet spot → overfit). But modern neural networks often exhibit **double descent**: error decreases, rises, then decreases *again* as model size grows far past the interpolation threshold.

This does not violate the bias-variance decomposition—both terms still sum correctly. What changes is the implicit regularization: overparameterized models trained with gradient descent converge to the **minimum-norm interpolant**, which has surprising statistical properties. The variance term, which should explode at the interpolation threshold, gets tamed by the geometry of gradient descent.

The decomposition remains the right lens. The surprise is in **how** each term behaves, not whether they exist.
