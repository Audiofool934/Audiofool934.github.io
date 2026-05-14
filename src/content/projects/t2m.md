---
title: 'T2M'
pubDate: '2026-01-08'
description: 'A two-stage probabilistic text-to-music system using Flow Matching and audio diffusion.'
category: 'Music Generation'
status: 'research'
featured: true
stack: ['Python', 'Flow Matching', 'Text-to-Music', 'MuQ-MuLan', 'DiT']
type: 'Research'
---

## Overview

**T2M** is a probabilistic text-to-music generation system.

The project uses a two-stage architecture. The first stage maps text into a music-aligned latent representation. The second stage synthesizes audio from that representation with a diffusion-style audio generator.

## Core Idea

A text prompt should not map to one deterministic song. The same phrase can imply many valid musical outcomes. T2M treats that ambiguity as the point: sample a distribution, generate variations, and let selection become part of the creative process.

## Relationship to MUSE

T2M is part of the same research line as MUSE. It focuses on the text-to-music path and the probabilistic latent bridge that makes diverse generation possible.

## Public Status

This project is listed as a public-facing research dossier. The source repository is private, so the website does not sync its README or expose repository internals.
