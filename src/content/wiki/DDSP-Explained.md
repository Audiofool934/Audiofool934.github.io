---
title: 'DDSP: Deep Differentiable Signal Processing'
pubDate: '2024-02-01'
description: 'Understanding how to combine classical DSP with deep learning.'
tags: ['Audio', 'Deep Learning', 'DSP']
---

**DDSP** (Differentiable Digital Signal Processing) bridges the gap between the interpretability of classical DSP and the expressivity of deep learning.

## The Core Concept

Instead of having a neural network output raw waveform samples (like WaveNet) or spectral frames (like Tacotron), DDSP networks output **parameters for DSP components** (oscillators, filters, reverb).

### The Signal Chain

1.  **Encoder**: Takes audio or control signals (f0, loudness) and produces a latent embedding.
2.  **Decoder**: Maps the latent embedding to control parameters:
    *   **Harmonic Oscillator**: Amplitudes $A(t)$ and Harmonic distribution $c(t)$.
    *   **Filtered Noise**: Transfer function $H(z)$ for subtractive synthesis.

### Why it matters

*   **Efficiency**: Synthesizing audio via oscillators is much faster than predicting sample-by-sample.
*   **Inductive Bias**: By explicitly modeling pitch and timbre, the model generalizes better with less data.
*   **Interpretability**: You can "open up" the model and tweak the reverb decay or the harmonic brightness manually.
