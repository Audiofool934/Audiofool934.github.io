---
title: 'Sampling Theorem: The Bridge Between Continuous and Discrete'
updatedDate: 2026-03-10
tags: ["dsp", "signal", "fourier", "math"]
parents: []
related: ["fourier-transform"]
---

## The Question

You have a continuous signal $f(t)$—a sound wave, a voltage, an electromagnetic field. You sample it at discrete intervals $T_s$, recording $f(nT_s)$ for $n = 0, 1, 2, \ldots$

**When can you perfectly reconstruct $f(t)$ from these samples?**

The answer is one of the most important theorems in engineering.


### 1. Nyquist-Shannon Sampling Theorem

**Theorem**: If $f(t)$ is bandlimited to $B$ Hz (i.e., $\hat{f}(\xi) = 0$ for $|\xi| > B$), then $f$ is completely determined by its samples at rate $f_s = 1/T_s > 2B$.

The reconstruction formula:

$$
f(t) = \sum_{n=-\infty}^{\infty} f(nT_s) \cdot \operatorname{sinc}\left(\frac{t - nT_s}{T_s}\right)
$$

where $\operatorname{sinc}(x) = \sin(\pi x) / (\pi x)$.

Each sample contributes a scaled sinc function. The sum of these sincs exactly reproduces the original continuous signal. **No information is lost.**


### 2. Why Sinc? The Fourier Perspective

The sampling theorem is a direct consequence of Fourier duality (see [Fourier Transform](/wiki/fourier-transform/)).

**Step 1**: Sampling in time = multiplication by a Dirac comb $\sum \delta(t - nT_s)$.

**Step 2**: By the convolution theorem, multiplication in time becomes convolution in frequency. Convolving $\hat{f}(\xi)$ with the Fourier transform of the Dirac comb (another Dirac comb, with spacing $f_s = 1/T_s$) produces **periodic copies** of $\hat{f}$:

$$
\hat{f}_{\text{sampled}}(\xi) = \frac{1}{T_s} \sum_{k=-\infty}^{\infty} \hat{f}(\xi - k f_s)
$$

**Step 3**: If $f_s > 2B$, the copies don't overlap. We can isolate the original $\hat{f}(\xi)$ by applying an ideal low-pass filter (a rectangle in frequency). The inverse Fourier transform of a rectangle is the sinc function—hence the reconstruction formula.

The entire proof is just: (1) sampling creates spectral copies, (2) if they don't overlap, we can separate them, (3) the filter that does the separation is the sinc.


### 3. Aliasing: When Copies Collide

If $f_s < 2B$, the spectral copies **overlap**. High frequencies fold back and masquerade as low frequencies. This is **aliasing**—and it is irreversible.

**Example**: A 15 kHz sinusoid sampled at 16 kHz. The spectral copy at $f_s - 15 = 1$ kHz perfectly coincides with a true 1 kHz signal. No amount of post-processing can distinguish them. The information is destroyed at the moment of sampling.

**Aliasing in everyday life**:
- Wagon wheels appearing to spin backward in film (temporal aliasing at 24 fps)
- Moiré patterns in digital photos of striped shirts (spatial aliasing)
- The anti-aliasing filter in every ADC—a mandatory analog low-pass before sampling

The Nyquist criterion $f_s > 2B$ is not a guideline. It is a **hard information-theoretic boundary**. Below it, aliasing corrupts the signal; above it, perfect reconstruction is possible.


### 4. The Uncertainty Connection

The sampling theorem is intimately connected to the [uncertainty principle](/wiki/fourier-transform/):

- A bandlimited signal ($\hat{f}$ has compact support in frequency) **cannot** be time-limited (it must extend over all time). This is the uncertainty principle in action.
- Sampling at rate $f_s$ gives frequency resolution up to $f_s/2$. Increasing time resolution (more samples per second) increases frequency resolution proportionally. You cannot have both arbitrarily fine time resolution and arbitrarily fine frequency resolution from a finite record.

The sampling theorem resolves this tension for bandlimited signals: if the frequency content is bounded, discrete samples suffice to capture the full continuous signal. The bandlimit is the **information-theoretic constraint** that makes discrete representation possible.


### 5. Practical Reality: No Signal Is Truly Bandlimited

A mathematically bandlimited signal must be infinite in duration (uncertainty principle). Real signals are time-limited, hence never perfectly bandlimited. Every real signal has some energy above any finite frequency.

The engineering solution: **approximately bandlimited** signals. Pass the analog signal through a low-pass anti-aliasing filter that attenuates frequencies above $f_s/2$. The residual above-Nyquist energy causes aliasing, but if the filter is good, it's negligible.

**Audio example**: CD audio uses $f_s = 44.1$ kHz, giving a Nyquist frequency of 22.05 kHz. Human hearing tops out around 20 kHz. The anti-aliasing filter removes content above ~20 kHz, and the 2.05 kHz guard band accommodates the filter's finite roll-off. The result: mathematically imperfect, perceptually transparent.


### 6. Beyond Nyquist: Compressed Sensing

The sampling theorem assumes the signal is bandlimited (sparse in frequency). What if the signal is sparse in some other basis?

**Compressed sensing** (Candès, Romberg, Tao, 2006) generalizes the sampling theorem: if a signal is **$k$-sparse** in any orthonormal basis, it can be recovered from $O(k \log n)$ random measurements—far fewer than the signal dimension $n$.

The Nyquist theorem says: bandlimited signals need $2B$ samples/second. Compressed sensing says: $k$-sparse signals need $O(k \log n)$ measurements, regardless of bandwidth. The generalization is from "sparse in Fourier basis" to "sparse in any basis."


### The Takeaway

The sampling theorem is the **terms of exchange** between the continuous and discrete worlds. It says exactly when—and why—discrete samples capture continuous reality, and exactly how aliasing destroys information when the terms are violated. The proof is pure Fourier analysis; the applications are everywhere an analog signal meets a digital system.
