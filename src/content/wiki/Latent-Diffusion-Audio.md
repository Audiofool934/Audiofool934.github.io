---
title: 'Latent Diffusion for Audio'
pubDate: '2024-04-12'
description: 'How Stable Audio and MusicLM approach generation.'
tags: ['Generative AI', 'Diffusion', 'Audio']
---

Just as Stable Diffusion revolutionized image generation by operating in a compressed latent space, Audio LDMs apply the same principle to spectrograms or audio codec embeddings.

## The Pipeline

1.  **Compression (Autoencoder)**:
    *   **VAE / MAC (Masked Audio Modeling)**: Compresses high-dimensional audio into a lower-dimensional latent vector $z$.
    *   *Example*: DAC (Descript Audio Codec) provides high-fidelity reconstruction at low bitrates.

2.  **Diffusion (The Prior)**:
    *   A transformer (DiT) or U-Net learns to denoise random Gaussian noise in the latent space $z$, conditioned on text embeddings (CLAP/T5).
    *   $p(z \mid \text{text})$

3.  **Reconstruction**:
    *   The decoder converts the denoised latent $z$ back to a waveform.

### Challenges vs Images

*   **Phase**: Audio requires phase coherence. Operating on mel-spectrograms often requires a separate vocoder (HifiGAN) to reconstruct phase.
*   **Subjectivity**: Unlike "a cat on a table," "sad jazz" is highly subjective. Evaluation metrics (FAD) are notoriously unstable.
