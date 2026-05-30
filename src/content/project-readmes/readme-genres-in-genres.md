---
project: "genres-in-genres"
repo: "Audiofool934/genres-in-genres"
sourceUrl: "https://github.com/Audiofool934/genres-in-genres"
syncedAt: "2026-05-30T10:16:37.757Z"
---

# Genres in Genres

Style evolution analysis for music collections using MuQ-MuLan embeddings.

## Project Overview

Genres in Genres is a music style evolution analysis tool that uses MuQ-MuLan embeddings (512-dim vectors) to analyze how an artist's sound changes over time. It identifies sub-genres within an artist's discography, visualizes style trajectories, and provides semantic interpretation of musical clusters.

## Features

- Automatic artist library scanning and caching
- Sub-genre identification using K-Means clustering (with Auto-K)
- 2D trajectory visualization (PCA/t-SNE/UMAP)
- Semantic radar charts for album comparison
- Streamgraph for temporal style distribution

## Installation

```bash
./run_demo.sh
```

This creates a virtual environment and installs dependencies.

## Usage

### 1. Preprocess Audio (Optional)

If you have your own music files:

```bash
# Organize files as: data/music/{Artist}/{Year}-{Album}/*.mp3
source venv/bin/activate
pip install muq
python scripts/preprocess.py --device cuda  # or mps/cpu
```

### 2. Cache Semantic Tags

```bash
python scripts/cache_tags.py --max_tags 2000 --format pickle
```

### 3. Run Dashboard

```bash
./run_demo.sh
# Or run on specific port
./run_demo.sh --port 8080
```

Open the URL in browser, go to **Library** tab, select an artist, click **Analyze**.

### 4. Run Tests

```bash
source venv/bin/activate
python -m pytest tests/
```

## Architecture

### Data Flow

1. **Audio Input** → `data/music/{Artist}/{Year}-{Album}/*.mp3`
2. **Feature Extraction** → `scripts/preprocess.py` uses MuQ-MuLan to generate 512-dim embeddings
3. **Cache Storage** → `data/cache/music/{Artist}.pkl` (pickled `ArtistCareer` objects)
4. **Analysis** → `StyleAnalyzer` performs clustering, dimensionality reduction, metrics calculation
5. **Visualization** → Gradio app renders trajectory plots, streamgraphs, radar charts

### Core Data Structures (`src/core.py`)

- `Track`: Single song with metadata (file_path, title, album, release_date)
- `StyleEmbedding`: 512-dim MuLan vector bound to a Track
- `ArtistCareer`: Collection of tracks and embeddings for an artist, sorted chronologically

### Key Modules

- `src/analysis.py`: `StyleAnalyzer` class - clustering (KMeans with auto-K via silhouette score), dimensionality reduction (PCA/t-SNE/UMAP), career report generation
- `src/metrics.py`: `MusicMetrics` class - computes style velocity (album-to-album change), novelty (departure from past work), cohesion (intra-album consistency)
- `src/semantics.py`: `SemanticMapper` - maps audio embeddings to human-readable tags using cached text embeddings
- `src/library_manager.py`: Handles filesystem scanning and pickle-based caching
- `src/visualization.py`: `GenreTrajectoryVisualizer` and `CareerStoryteller` for all plots

### Gradio App Structure (`app.py`)

- **Simulate tab**: Generate mock data for testing
- **Library tab**: Analyze cached artists with configurable clustering and visualization options
- **Insight Report tab**: AI-generated narrative about style evolution
- Dynamic cluster explorer with audio playback

## Directory Structure

```
genres-in-genres/
├── app.py                  # Gradio application
├── run_demo.sh             # Setup script
├── scripts/
│   ├── preprocess.py       # Audio feature extraction
│   ├── prepare_artist.py   # Library preparation
│   ├── cache_tags.py       # Tag caching
│   └── verify_semantics.py # Model verification
├── src/
│   ├── core.py             # Data structures
│   ├── library_manager.py  # Cache management
│   ├── muq.py              # MuQ-MuLan wrapper
│   ├── analysis.py         # Clustering logic
│   ├── semantics.py        # Semantic mapper
│   ├── metrics.py          # Style metrics
│   ├── mock_data.py        # Test data
│   └── visualization.py    # Plotting
└── data/
    ├── music/              # Input audio files
    ├── cache/              # Cached embeddings
    └── metadata/           # Music4All tags
```

## Music Directory Structure

```
data/music/{Artist}/{Year}-{Album}/*.mp3
```

Example: `data/music/Radiohead/1997-OK Computer/01 - Airbag.mp3`

The year prefix is parsed to order albums chronologically.

## Key Metrics

- **Velocity**: Cosine distance between consecutive album centroids (measures rate of style change)
- **Novelty**: Cosine distance from current album to cumulative past centroid (measures departure from established style)
- **Cohesion**: 1 - mean intra-album variance (measures stylistic consistency within an album)

## Requirements

- Python 3.8+
- torch, torchaudio
- muq (MuQ-MuLan)
- gradio
- scikit-learn, umap-learn
- matplotlib, seaborn
