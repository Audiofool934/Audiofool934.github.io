---
title: 'BeatNet Realtime'
pubDate: '2024-03-10'
description: 'Embedded real-time beat tracking system for live performance synchronization.'
author: 'Audiofool'
category: 'Dev'
featured: false
stack: ['C++', 'Rust', 'JUCE', 'OnnxRuntime']
type: 'Product'
url: '#'
image:
    url: '/images/placeholder.png'
    alt: 'BeatNet Schematic'
---

## Concept

BeatNet Realtime is an optimized inference engine running a lightweight TCN (Temporal Convolutional Network) for downbeat detection. It is designed to run on embedded hardware like the Raspberry Pi 4 or specialized DSP chips inside DJ equipment.

### Key Features

*   **Ultra-Low Latency**: < 10ms processing overhead.
*   **Tempo Drift Correction**: Adjusts to live drummers who fluctuate in tempo.
*   **Cross-Platform**: Runs on Linux (Embedded), macOS, and Windows.

### Implementation

The core logic is rewritten in **Rust** for memory safety, exposing C-bindings for integration with **JUCE** audio plugins. The model was quantized to int8 to fit within the memory constraints of older hardware revisions.

```rust
// Simplified beat detection loop
fn process_audio_buffer(buffer: &[f32]) -> BeatEvent {
    let transient = onset_detector.detect(buffer);
    let phase = phase_locked_loop.update(transient);
    
    if phase > THRESHOLD {
        return BeatEvent::Downbeat;
    }
    BeatEvent::None
}
```
