---
title: 'SignalWeaver'
description: 'A lightweight toolkit for stitching audio embeddings, lyric prompts, and photography metadata into one creative dataset.'
author: 'Audiofool'
pubDate: '2025-01-12'
status: 'in progress'
tags: ['project', 'AI', 'audio', 'multimodal']
category: 'Audio'
featured: true
image:
    url: '/images/gallery/moonrise.webp'
    alt: 'Moonrise over campus'
---

## Why

My practice spans notes, playlists, and small camera rolls. SignalWeaver is a glue layer: combine *audio descriptors* (chroma, MFCCs, beat grid), *language* (lyric or prompt snippets), and *photo EXIF* (time, place, camera) into one tidy dataset so models can learn cross-modal cues.

## Architecture (MVP)

- **Ingest**: watch a folder of WAV/FLAC, Markdown snippets, and JPEG/PNG; extract metadata via `essentia`, `pylangchain`, and `exiftool`.
- **Embed**: compute CLAP / Jukebox-style audio embeddings + SentenceTransformers for text; downsample GPS/time for privacy.
- **Store**: pack everything into parquet with versioned schema, cache to DuckDB for local querying.
- **Serve**: a tiny FastAPI that returns *“give me 8 guitar riffs shot after 10pm with ISO > 1600”*.

## Early experiments

```bash
# 1) Extract audio features
python scripts/extract_audio.py --input data/stems --out data/features.parquet

# 2) Merge with photo EXIF + note metadata
python scripts/merge_modalities.py \
  --audio data/features.parquet \
  --notes data/notes_index.csv \
  --photos data/exif.csv \
  --out data/signalweaver.parquet

# 3) Query candidates for an Audioshow setlist
python scripts/query.py --prompt "late-night guitar, melancholic, ISO high"
```

- First pass shows vibe clustering: night photos + minor key songs cluster together using UMAP on the fused embeddings.
- Audio-to-photo retrieval hits ~0.42 mAP on a toy validation set — good enough to pick B-roll for Audioshow posters automatically.

## Next steps

- Train a small contrastive model on my archive; target: robust to microphone hiss + film grain.
- Build a *“playlist explainability”* view: why did this track match this photo?
- Ship a CLI into the blog so each project post links to a live query example.
