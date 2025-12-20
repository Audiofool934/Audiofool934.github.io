---
title: 'FFT: A Visual Guide'
pubDate: '2023-12-05'
description: 'Intuitive breakdown of the Fast Fourier Transform.'
tags: ['DSP', 'Math']
---

The **Fast Fourier Transform (FFT)** is the algorithm that powers almost all digital audio processing. It converts a signal from the **Time Domain** (amplitude over time) to the **Frequency Domain** (magnitude over frequency).

## The Intuition

Imagine you have a smoothie (the signal). The FFT is a machine that un-mixes the smoothie and tells you exactly how many strawberries, bananas, and oranges (sine waves of different frequencies) went into it.

$$ X[k] = \sum_{n=0}^{N-1} x[n] e^{-j 2\pi k n / N} $$

## Key Parameters

*   **Window Size ($N$)**: Determines the "time vs frequency" trade-off.
    *   Large $N$: High frequency resolution (you can tell C4 from C#4), poor time resolution (smears transients).
    *   Small $N$: Good time resolution (snappy drums), poor frequency resolution.
*   **Overlap**: We typically slide the window with 50% or 75% overlap to prevent data loss at the edges (spectral leakage).
*   **Window Function**: (Hann, Hamming, Blackman) shapes the slice of audio to reduce artifacts at the boundaries.

## Applications

*   **EQ**: Attenuating specific bins in the frequency domain.
*   **Pitch Correction**: Detecting the fundamental peak.
*   **Mp3 Compression**: Throwing away frequency bins masking by louder sounds (psychoacoustics).
