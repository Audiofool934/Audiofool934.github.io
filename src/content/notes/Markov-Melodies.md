---
title: 'Markov Melodies and Groove Chains'
description: 'Quick study on using Markov chains to generate riff-first rock phrases without losing harmonic context.'
author: 'Audiofool'
pubDate: '2025-01-11'
tags: ['music', 'probability', 'markov', 'notes']
---

## Why Markov chains for riffs?

The songs I loop most — AC/DC, Rush, Porcupine Tree — rely on *motif reuse* with tiny probabilistic switches (slide up, hold the bend, drop the backbeat). A first-order chain is a tiny notebook for exactly that behavior: keep the state small, but let the groove evolve.

## Building a tiny state space

Let each state be `(interval, rhythm)` where `interval ∈ {−5, −3, −2, 0, +2, +3, +5}` (relative to the key center) and `rhythm ∈ {kick, snare, rest}`. The transition matrix `P` is learned from 8-bar stems:

$$
P_{ij} = \frac{c(i \to j) + \alpha}{\sum_k c(i \to k) + \alpha |S|}
$$

- `c(i → j)` is the count over stems.
- `α = 0.1` adds exploration so the chain occasionally surprises you.

## Quick prototype (Python)

```python
import numpy as np

states = [
    ("0", "kick"), ("+2", "kick"), ("-2", "kick"),
    ("0", "snare"), ("+2", "snare"), ("-2", "snare"),
    ("0", "rest"), ("+2", "rest"), ("-2", "rest"),
]

P = np.load("data/markov_groove.npy")  # learned counts -> smoothed to probs

def sample_chain(length=16, start=0, rng=np.random.default_rng(42)):
    seq = [start]
    for _ in range(length - 1):
        seq.append(rng.choice(len(states), p=P[seq[-1]]))
    return [states[i] for i in seq]

for interval, rhythm in sample_chain():
    print(f"{interval:>2} | {rhythm}")
```

This outputs a 16-step riff you can immediately map to MIDI or a pedalboard.

## Guardrails

- **Key safety:** constrain intervals to the scale degrees of the song before sampling.
- **Cadence locks:** force the chain into `(0, kick)` on beats 4/8/12/16 for a strong rock cadence.
- **Humanization:** jitter the rhythm timestamps with a normal noise `𝒩(0, 10ms)` so it never sounds quantized.

## Where next

- Upgrade to *variable-order* chains (POMDP style) to remember octave jumps.
- Attach an LSTM-based *missing measure* predictor to recommend fills when entropy spikes.
- Pair this with the Audioshow playlist builder so each episode includes one generated riff demo.
