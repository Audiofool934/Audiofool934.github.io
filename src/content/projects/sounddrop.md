---
title: 'SoundDrop'
pubDate: '2026-05-20'
description: 'A campus music map where people turn places, images, and short stories into generated music.'
category: 'Music Generation'
status: 'active'
featured: true
pinned: true
stack: ['React', 'TypeScript', 'Leaflet', 'Express', 'PostgreSQL', 'MERIC']
type: 'Product'
url: 'https://sounddrop.audiofool.blog/'
githubRepo: 'Audiofool934/sounddrop-ui'
githubReadme: true
---

## Overview

**SoundDrop** is a campus music map for generating and publishing place-based music.

A user chooses a location on the map, uploads an image, writes a short memory or prompt, and receives a small set of generated music versions. The chosen version can be published to the public map or saved privately.

The project treats music generation as a local, social object. A song is attached to a corner, a path, a building, a photo, and a moment.

## Product Shape

SoundDrop is built around a compact flow:

- **choose a place** on a campus map,
- **add visual and textual context** through an image and short story,
- **generate music** through the MERIC backend,
- **select, download, and save** one version,
- **publish publicly or keep it private**.

The map is the interface. Existing works stay visible as context while new pieces are being placed, so the site feels like a growing layer of campus memory.

## System

The public product combines a React frontend, an Express API, PostgreSQL storage, object uploads, and a GPU inference service running MERIC.

The open-source surface is the frontend UI. The production backend and model infrastructure remain private, while the public UI repository documents the interaction layer and visual system.

## Direction

SoundDrop is an experiment in making generated music feel situated.

Instead of treating output as isolated files, it gives music a place, a prompt, an image, and a publishing decision. The result is closer to a living sound map than a generation demo.
