---
title: 'CC-Copilot'
pubDate: '2026-06-13'
description: 'A read-only cockpit for supervising long-running AI coding-agent sessions with recaps, safety verdicts, and grounded chat.'
category: 'Agent'
status: 'active'
featured: true
pinned: true
stack: ['Python', 'Textual', 'TUI', 'Coding Agents', 'Observability']
type: 'Product'
githubRepo: 'Audiofool934/cc-copilot'
githubReadme: true
---

## Overview

**CC-Copilot** is a supervision layer for AI coding agents.

It treats long-running coding sessions as something that needs its own cockpit: a way to see what happened, ask grounded questions, compare sessions, and decide whether the work is ready for a human move.

The main product surface is a terminal-native TUI that reads local agent transcripts and project state without editing the working agent's context.

## Why It Belongs Here

CC-Copilot fits the Agent shelf because it focuses on the second-order problem created by useful coding agents.

Once agents can run for hours, retry failures, edit many files, and leave partial work behind, the hard part is not only writing code. It is re-entering the workflow with enough evidence to make a decision.

The project turns that supervision problem into a concrete interface: re-entry recaps, safety verdicts, handoffs, attention queues, and grounded chat with citations.

## Product Shape

The cockpit is intentionally read-only.

It can inspect Claude Code and Codex session logs, summarize recent changes, surface risk signals, and answer questions from cited transcript evidence. The working agent stays focused, while the human gets a separate panel for oversight and judgment.

## Direction

The goal is not to make another coding agent.

It is to make agentic coding more legible: more inspectable, more accountable, and easier to resume after the context has moved on.
