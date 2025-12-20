---
title: 'Harmonic GAN: Neural Timbre Synthesis'
pubDate: '2024-06-15'
description: 'Generative Adversarial Network designed for high-fidelity instrument timbre synthesis and interpolation.'
author: 'Audiofool'
category: 'Research'
featured: true
stack: ['Python', 'PyTorch', 'GANs', 'DSP']
type: 'Research'
url: '#'
image:
    url: '/images/projects/harmonic-gan.png'
    alt: 'Harmonic GAN Architecture'
---

## Overview

Harmonic GAN allows for the synthesis of realistic instrument tones by separately modeling the harmonic content and the noise floor of the signal. Unlike traditional synthesizers that rely on fixed oscillators, this model learns the latent manifold of instrument timbres, enabling smooth interpolation between, for example, a Violin and a Flute.

### Architecture

The model utilizes a dual-discriminator setup:
1.  **Spectral Discriminator**: Ensures the frequency content matches the target domain.
2.  **Temporal Discriminator**: Focuses on the attack and decay transients.

The generator is conditioned on pitch and velocity, outputting raw audio waveforms at 44.1kHz.

### Results

| Metric                 | Harmonic GAN | WaveGAN | Baseline |
| :--------------------- | :----------- | :------ | :------- |
| Inception Score        | **4.2**      | 3.1     | 2.5      |
| Fréchet Audio Distance | **1.8**      | 3.5     | 5.2      |

*Detailed listening tests suggest that Harmonic GAN captures the "breathiness" of wind instruments significantly better than autoregressive baselines.*
