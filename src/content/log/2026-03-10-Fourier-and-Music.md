---
title: "Fourier and Music"
pubDate: 2026-03-10
tags: ["Math", "Music", "DSP"]
description: "The uncertainty principle is about music, too."
---

Writing the [Fourier transform](/wiki/fourier-transform/) and [sampling theorem](/wiki/sampling-theorem/) notes back to back revealed something I should have noticed earlier: the uncertainty principle isn't just a physics result — it's a statement about music.

A perfectly localized click has no pitch. A perfect sine tone has no rhythm. Every real sound lives in the tension between these extremes. A snare hit is *mostly* localized in time; a sustained organ chord is *mostly* localized in frequency. Neither is fully one or the other.

This is exactly $\Delta t \cdot \Delta \omega \geq \frac{1}{2}$ — you can't have both. Every mix engineer knows this intuitively: a tight kick drum and a resonant bass pad occupy different ends of the same tradeoff. The math just gives it a name.

The [MUSE project](/muse/) operates in this space too — the mel spectrogram is literally a time-frequency representation, and the diffusion model has to learn which regions of that plane matter for a given prompt.
