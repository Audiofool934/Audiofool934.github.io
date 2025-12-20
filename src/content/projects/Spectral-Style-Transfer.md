---
title: 'Spectral Style Transfer'
pubDate: '2023-11-20'
description: 'Applying computer vision style transfer techniques to audio spectrograms for sound design.'
author: 'Audiofool'
category: 'Audio'
featured: false
stack: ['Python', 'Librosa', 'TensorFlow']
type: 'Experiment'
url: '#'
image:
    url: '/images/placeholder.png'
    alt: 'Spectrogram Style Transfer'
---

## The Idea

Can we make a recording of a city street "sound" like a Van Gogh painting looks? By treating audio spectrograms as images and applying Neural Style Transfer (Gatys et al.), this project explores cross-modal aesthetics.

### Methodology

1.  **STFT**: Convert audio to visual spectrogram representation.
2.  **Style Transfer**: Apply the texture of a target image to the spectrogram content.
3.  **Phase Reconstruction**: Use the Griffin-Lim algorithm (or a trained Vocoder) to invert the modified spectrogram back to audio.

### Challenges

Typical image style transfer creates visual artifacts that sound like harsh noise or phasing issues in the audio domain. To mitigate this, I implemented a **Total Variation Loss** specifically tuned for frequency continuity, ensuring the resulting audio remains coherent.

> "The sound of a melting clock."
