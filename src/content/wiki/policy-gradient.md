---
title: 'Policy Gradient: The Log-Derivative Trick'
updatedDate: 2026-03-10
tags: ["rl", "reinforcement learning", "probability", "ml"]
parents: []
related: ["martingales", "bias-variance"]
---

## The Fundamental Problem of RL

In supervised learning, the loss function is differentiable with respect to model parameters. In reinforcement learning, the "loss" (negative reward) depends on actions sampled from the policy. **You cannot differentiate through a sample.**

An agent with policy $\pi_\theta(a|s)$ generates a trajectory $\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \ldots)$ and receives total reward $R(\tau)$. We want to maximize:

$$
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)]
$$

The expectation is over trajectories sampled from the policy. The policy determines the distribution, the reward is evaluated on the sample, and we need $\nabla_\theta J$.


### 1. The Log-Derivative Trick

The key identity: for any distribution $p_\theta(x)$,

$$
\nabla_\theta \mathbb{E}_{x \sim p_\theta}[f(x)] = \mathbb{E}_{x \sim p_\theta}[f(x) \, \nabla_\theta \log p_\theta(x)]
$$

**Proof** (one line):

$$
\nabla_\theta \int f(x) p_\theta(x) \, dx = \int f(x) \nabla_\theta p_\theta(x) \, dx = \int f(x) \, p_\theta(x) \frac{\nabla_\theta p_\theta(x)}{p_\theta(x)} \, dx
$$

We multiplied and divided by $p_\theta(x)$. The ratio $\nabla_\theta p_\theta / p_\theta = \nabla_\theta \log p_\theta$ is the **score function** (of the parameter, not the data).

This transforms the gradient of an expectation into an expectation of a gradient—which we can estimate by Monte Carlo sampling.


### 2. REINFORCE

Applying the log-derivative trick to the RL objective:

$$
\nabla_\theta J = \mathbb{E}_{\tau \sim \pi_\theta}\left[R(\tau) \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t | s_t)\right]
$$

The gradient estimate from a single trajectory:

$$
\hat{g} = R(\tau) \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t | s_t)
$$

**Interpretation**: Increase the log-probability of actions that led to high reward. Decrease it for low reward. The gradient is proportional to both the reward and the score of each action.

This is REINFORCE (Williams, 1992). It is **unbiased**: $\mathbb{E}[\hat{g}] = \nabla_\theta J$. But it has a devastating problem.


### 3. The Variance Problem

REINFORCE has enormous variance. Two sources:

**Credit assignment**: The total reward $R(\tau)$ multiplies every action's score, even though action $a_0$ had nothing to do with reward $r_{99}$. All actions are "credited" equally for the total outcome.

**Scale sensitivity**: If $R(\tau)$ is always positive (e.g., rewards in $[0, 100]$), the gradient always increases the probability of every action taken. The learning signal comes only from the *relative magnitude* of the reward, which is buried under a large mean.

Both issues inflate the variance of the gradient estimate, requiring many samples per update.


### 4. Baselines: Variance Reduction Without Bias

**Key insight**: For any function $b(s)$ that depends only on the state (not the action):

$$
\mathbb{E}_{a \sim \pi_\theta}[\nabla_\theta \log \pi_\theta(a|s) \cdot b(s)] = 0
$$

This is because $\nabla_\theta \log \pi_\theta(a|s)$ has zero mean under $\pi_\theta$ (a consequence of $\nabla_\theta \int \pi_\theta(a|s) \, da = \nabla_\theta 1 = 0$).

Therefore, subtracting $b(s)$ from the reward does not change the expected gradient:

$$
\nabla_\theta J = \mathbb{E}\left[(R(\tau) - b(s_t)) \nabla_\theta \log \pi_\theta(a_t | s_t)\right]
$$

But it can dramatically reduce the **variance**. The optimal baseline is $b^*(s) = \mathbb{E}[R(\tau) | s_t = s]$—the expected return from state $s$. This is the **value function** $V^\pi(s)$.

With baseline, the gradient becomes:

$$
\hat{g} = \sum_t (R_t - V(s_t)) \nabla_\theta \log \pi_\theta(a_t | s_t)
$$

The term $A_t = R_t - V(s_t)$ is the **advantage**: how much better this action was compared to the average. Actions better than expected get reinforced; worse-than-expected get suppressed.

**Connection to martingales**: The advantage $A_t$ is a martingale difference sequence—its conditional expectation given $s_t$ is zero. This orthogonality (cf. [Martingales](/wiki/martingales/)) is precisely why the baseline reduces variance without introducing bias.


### 5. From REINFORCE to Actor-Critic

| Method | Gradient estimate | Variance | Bias |
|--------|------------------|----------|------|
| REINFORCE | $R(\tau) \nabla \log \pi$ | Very high | None |
| + Baseline | $(R_t - b) \nabla \log \pi$ | High | None |
| Actor-Critic | $(r_t + \hat{V}(s_{t+1}) - \hat{V}(s_t)) \nabla \log \pi$ | Low | Some (from $\hat{V}$) |
| GAE ($\lambda$) | $\hat{A}^\lambda_t \nabla \log \pi$ | Tunable | Tunable |

**Actor-Critic** replaces the Monte Carlo return $R_t$ with the one-step TD error $\delta_t = r_t + \gamma \hat{V}(s_{t+1}) - \hat{V}(s_t)$. This introduces bias (because $\hat{V}$ is approximate) but drastically reduces variance (only one step of randomness instead of the full trajectory).

**GAE** (Generalized Advantage Estimation) interpolates between the two extremes via a parameter $\lambda \in [0,1]$:
- $\lambda = 1$: Full Monte Carlo return (unbiased, high variance)
- $\lambda = 0$: One-step TD (biased, low variance)

This is exactly the [bias-variance tradeoff](/wiki/bias-variance/) in a new guise: more bootstrapping (lower $\lambda$) reduces variance at the cost of bias from the value function approximation.


### The Takeaway

Policy gradient is built on a single algebraic trick—the log-derivative identity—that converts an intractable gradient-through-sampling into a tractable expectation. Everything that follows (baselines, advantages, actor-critic, GAE) is **variance reduction**: the ongoing struggle to extract a clean learning signal from the inherent noise of sampled trajectories. The tools are orthogonality (baselines), bootstrapping (TD learning), and the bias-variance tradeoff—the same ideas that recur across all of statistical learning.
