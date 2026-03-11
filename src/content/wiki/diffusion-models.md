---
title: 'Diffusion Models: Score, Noise, and Reversal'
updatedDate: 2026-03-10
tags: ["generative", "diffusion", "deep learning", "probability"]
parents: []
related: ["flow-matching", "measure-theory"]
---

## The Idea: Destroy, Then Reconstruct

A diffusion model learns to generate data by learning to **reverse** a destruction process. Gradually add noise until data becomes pure Gaussian noise, then train a neural network to undo each step of corruption.

The forward process is trivial (just add noise). The reverse process is learned. The insight is that learning to denoise is **far easier** than learning to generate from scratch.


### 1. The Forward Process: A Prescribed Destruction

Define a forward SDE that smoothly transforms data $x_0 \sim p_{\text{data}}$ into noise:

$$
dx_t = f(x_t, t) \, dt + g(t) \, dW_t
$$

The standard choice (Variance Preserving SDE):

$$
dx_t = -\frac{1}{2}\beta(t) x_t \, dt + \sqrt{\beta(t)} \, dW_t
$$

where $\beta(t)$ is a noise schedule. At $t = 0$, we have data. At $t = T$, we have (approximately) $\mathcal{N}(0, I)$.

The key property: the marginal at any time $t$ has a closed-form Gaussian expression:

$$
q(x_t | x_0) = \mathcal{N}\left(\sqrt{\bar{\alpha}_t} \, x_0, \, (1 - \bar{\alpha}_t) I\right)
$$

where $\bar{\alpha}_t = \exp\left(-\int_0^t \beta(s) \, ds\right)$. This means we can sample $x_t$ directly from $x_0$ without simulating the SDE step by step—essential for efficient training.


### 2. The Score Function: Gradient of Log-Density

The **score** of a distribution $p_t$ is the gradient of its log-density:

$$
s(x, t) = \nabla_x \log p_t(x)
$$

Why this matters: the score tells you the direction of **steepest increase** in probability density at any point. It points from low-density regions toward high-density regions—from noise toward data.

**Anderson's Theorem (1982)**: the forward SDE has a time-reversed counterpart:

$$
dx_t = \left[f(x_t, t) - g(t)^2 \nabla_x \log p_t(x_t)\right] dt + g(t) \, d\bar{W}_t
$$

The reverse SDE has the same diffusion coefficient but a modified drift that involves the score $\nabla_x \log p_t$. **If we know the score at every noise level, we can exactly reverse the destruction process.**


### 3. Denoising Score Matching: Tweedie's Identity

We don't know $p_t(x)$—that's the whole problem. But we can **learn** the score via a beautiful connection to denoising.

**Tweedie's formula**: For the Gaussian perturbation $q(x_t | x_0) = \mathcal{N}(\sqrt{\bar{\alpha}_t} x_0, (1 - \bar{\alpha}_t}  )I)$:

$$
\nabla_{x_t} \log q(x_t | x_0) = -\frac{x_t - \sqrt{\bar{\alpha}_t} x_0}{1 - \bar{\alpha}_t} = -\frac{\varepsilon}{\sqrt{1 - \bar{\alpha}_t}}
$$

where $\varepsilon \sim \mathcal{N}(0, I)$ is the noise that was added. So the score is proportional to the **negative noise**. Predicting the score is equivalent to predicting the noise—which is a standard denoising problem.

The training loss (denoising score matching):

$$
\mathcal{L} = \mathbb{E}_{t, x_0, \varepsilon}\left[\| \epsilon_\theta(x_t, t) - \varepsilon \|^2\right]
$$

Sample a data point $x_0$, a noise level $t$, add noise $\varepsilon$ to get $x_t = \sqrt{\bar{\alpha}_t} x_0 + \sqrt{1 - \bar{\alpha}_t} \varepsilon$, and train the network to predict $\varepsilon$. The learned noise predictor $\epsilon_\theta$ gives the score via $s_\theta(x, t) = -\epsilon_\theta(x, t) / \sqrt{1 - \bar{\alpha}_t}$.


### 4. Why the Noise Schedule Matters

The schedule $\beta(t)$ controls how quickly information is destroyed. It profoundly affects both training and generation:

**Too fast** (aggressive schedule): The transition from data to noise happens in a few steps. The intermediate distributions change rapidly, making the score function highly nonlinear—harder for the network to approximate.

**Too slow** (conservative schedule): Requires many reverse steps to generate, increasing inference cost. But the score varies smoothly, making it easier to learn.

**The SNR perspective**: At time $t$, the signal-to-noise ratio is $\text{SNR}(t) = \bar{\alpha}_t / (1 - \bar{\alpha}_t)$. The training loss at each $t$ is weighted by the SNR. High-SNR timesteps (early, low noise) focus on large-scale structure. Low-SNR timesteps (late, high noise) focus on fine details.

The noise schedule implicitly defines a **curriculum**: the model learns coarse structure first (from high-noise denoising) and fine details later (from low-noise denoising). This coarse-to-fine hierarchy is a key reason why diffusion models produce such coherent outputs.


### 5. Diffusion vs. Flow Matching: The Fundamental Difference

Both learn a time-dependent transformation from noise to data. The difference is in the **path**:

| Aspect | Diffusion | Flow Matching |
|--------|-----------|---------------|
| Forward process | Stochastic (SDE) | Deterministic (ODE) |
| Paths | Curved, noisy | Straight lines |
| Training target | Noise $\varepsilon$ (score) | Velocity $x_1 - z$ |
| Inference steps | 50-1000 | 10-50 |
| Theoretical framework | Score matching | Optimal transport |

The diffusion framework is richer theoretically (connections to statistical physics, Langevin dynamics, thermodynamics). Flow matching is simpler practically (straight paths, fewer steps, no noise schedule).

Both converge to the same learned distribution. The paths between noise and data differ, but the endpoints are the same. Flow matching can be seen as the **deterministic limit** of diffusion (the "probability flow ODE"), with the added innovation of straight-line conditional paths.


### 6. The Score Is All You Need

The score function $\nabla_x \log p_t(x)$ is the central object. From it, you can:

- **Generate** (reverse the SDE/ODE)
- **Compute likelihoods** (via the probability flow ODE and the instantaneous change-of-variables formula)
- **Inpaint** (condition on partial observations by modifying the score)
- **Guide** (classifier-free guidance adds a conditional score term)

This is why diffusion models are so flexible: the score is a **local** quantity (a gradient at a point), and local modifications to the score produce global changes in the generated distribution. Classifier-free guidance, for instance, simply interpolates between the conditional and unconditional score—a one-line modification that dramatically improves sample quality.


### The Takeaway

Diffusion models convert the hard problem of generation into the easy problem of denoising, mediated by the score function. The forward process destroys structure; the learned reverse process reconstructs it. The noise schedule determines the curriculum. And the score—the gradient of log-density—is the thread that connects destruction to reconstruction, training to inference, and probability theory to practical generative modeling.
