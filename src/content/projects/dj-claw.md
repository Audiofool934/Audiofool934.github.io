---
title: 'DJ Claw'
pubDate: '2026-05-14'
description: 'A personal radio agent for music generation, taste memory, and station-like creative workflows.'
category: 'Agent'
status: 'active'
featured: true
stack: ['OpenClaw', 'Agents', 'Music Generation', 'Memory', 'Radio']
type: 'Experiment'
---

## Overview

**DJ Claw** is a personal radio agent built around music generation, curation, feedback, and taste memory.

The project started from a simple question: what happens when AI music is treated less like a file generator and more like a living station?

A normal generation tool waits for prompts. DJ Claw is designed as an operating environment. It keeps track of station state, remembers feedback, organizes generated tracks, and decides what kind of musical move should happen next.

## Product Shape

DJ Claw combines several roles:

- **station brain** — tracks the current mode, mood, queue, and next move,
- **music generator** — uses available music models as backends,
- **taste memory** — records what worked, what failed, and what deserves another pass,
- **curator** — organizes outputs into a listening shelf instead of a pile of files,
- **co-producer** — asks for human judgment when the creative fork matters.

The point is continuity. A good radio agent should learn from each generation and each piece of feedback.

## OpenClaw Application

DJ Claw is also a concrete application of OpenClaw as a personal agent runtime.

It uses the runtime idea directly: a separate agent identity, its own workspace, durable memory, recurring workflows, messaging routes, and tools that can keep operating beyond a single chat session.

The backend can change. The agent layer is the product.

## Direction

The long-term direction is **personal radio**: a system that can generate and organize music around a person’s taste, moods, references, and private rituals.

Music generation makes sound cheap. The interesting layer becomes direction: taste, memory, context, and selection.

DJ Claw is where those pieces meet.
