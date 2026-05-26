---
title: 'What Makes an Agent Agentic?'
kind: Essay
updatedDate: 2026-05-26
tags: ["agents", "harness", "context", "memory", "openclaw"]
parents: []
related: ["openclaw-as-an-agent-runtime"]
---

## The Word Is Doing Too Much Work

"Agent" has become one of those words that expands until it starts hiding the thing it was supposed to name.

Sometimes it means a chatbot with tools. Sometimes it means a coding assistant. Sometimes it means a background worker, a browser automation script, a swarm of LLM calls, a personal assistant with memory, or a product demo where a model clicks through a website.

The word still points at something real. The useful question is what changes when a model becomes agentic.

My current answer is:

> An agent is a model embedded in a loop where it can remember, act, observe, and steer toward a goal.

The loop matters. A single model response can be brilliant, but it is still a response. Agentic behavior begins when reasoning sits inside an ongoing cycle of state, action, feedback, and correction.

That makes agenticness a spectrum. A chatbot that answers once has almost none of it. A coding assistant that reads a codebase, edits files, runs tests, sees failures, patches again, and stops when the build passes has more. A personal runtime with memory, skills, scheduled jobs, messaging surfaces, permissions, and durable project workflows sits further along the same line.

The important shift is from producing text to participating in a process.

## The Minimal Loop

An agentic system needs several pieces working together.

It needs a goal. The goal can come from a human, a schedule, a workflow, or a standing instruction. "Fix this bug," "publish this essay," "monitor the daily brief," and "summarize this paper" all count. The system needs some direction of travel.

It needs state. State can live in the context window, a scratchpad, a file, a database, a task record, or long-term memory. Without state, every step starts from fog. The system may still answer well, but it cannot reliably continue.

It needs action. Tools let the system change something outside its own text stream: edit a file, run a test, fetch a page, send a message, schedule a job, update a database, open a browser, or call an API. Action gives the loop teeth.

It needs feedback. Tests, screenshots, logs, compiler errors, browser snapshots, user corrections, diffs, and deployment results tell the system what happened after it acted. This is where agency becomes practical. A model can guess. An agent can check.

It needs autonomy within boundaries. The system should choose intermediate steps: what to inspect, which tool to use, when to retry, when to ask, when to stop. That freedom needs limits: permissions, sandboxes, rate limits, approval gates, budgets, and clear failure conditions.

A compact formula is:

> agent = model + goal + state + action + feedback + boundaries

The model supplies generalization and judgment. The loop supplies agency. The boundaries keep the agency from becoming uncontrolled automation.

## Prompt, Context, Harness

A recent thread by [yan5xu](https://x.com/yan5xu/status/2059117572826746979) framed the evolution of LLM engineering as a movement from prompt engineering to context engineering to harness engineering. I like the frame, with one adjustment: these are layers, not eras.

Prompt engineering shapes the immediate instruction. It tells the model what role it is playing, what task it should solve, what constraints matter, and what style to use.

Context engineering shapes what the model can know at a given moment. It decides what files, memories, examples, documents, tool outputs, task history, and user preferences enter the working context.

Harness engineering shapes the environment around the model. It provides tools, feedback loops, permissions, state stores, task boundaries, evals, recovery paths, and ways to observe what the agent did.

The layers stack. A good harness still needs good prompts. A good context strategy still depends on model capability. A strong model still fails inside a bad environment.

The useful claim is narrower and stronger:

> As models become capable enough to act, the quality of the surrounding loop becomes a dominant factor in the quality of the agent.

That is why "the harness is the agent" feels too strong. The model still supplies reasoning, taste, and generalization. The harness gives that capability a shape.

The same base model can behave like a polite autocomplete box, a coding assistant, a research aide, or a personal runtime depending on the environment it is placed in. That environment decides what the model can see, what it can change, how it receives feedback, and what kinds of failure become visible.

## The Harness Gives the Model a Body

A harness is easy to underestimate because it often looks like plumbing.

Files. Tools. Shell access. Browser control. Message routing. Memory. Cron. Task state. Build scripts. Test runners. Permissions. Logs.

These pieces look ordinary. Together they decide whether a model can become useful over time.

In a coding setup, the harness might include a repository, terminal, package manager, test suite, linter, type checker, browser screenshots, git diff, and CI. The agent can run the test, read the failure, and patch the code with contact from the actual system.

In a personal runtime, the harness widens. It may include long-term memory, a user profile, skills, scheduled workflows, messaging channels, websites, Notion databases, browser sessions, media tools, and deployment pipelines.

That is the difference between a clever answer and durable assistance.

When this site gets updated through an agent, prose is one part of a larger loop: reading the existing content style, choosing the right collection, creating the file, checking frontmatter, building the Astro site, reviewing git status, committing, pushing, and relying on the deploy path. Each step gives the agent a chance to be corrected by the environment.

The intelligence is in the model. The responsibility emerges in the loop.

## Sycophancy as a Loop Failure

Harness design also affects epistemic quality.

The paper ["Sycophantic Chatbots Cause Delusional Spiraling, Even in Ideal Bayesians"](https://arxiv.org/abs/2602.19141) is useful because it treats sycophancy as more than a tone problem. A chatbot can distort belief by selecting evidence that validates the user's current view. It can do this even when the selected evidence is true.

That matters for agents.

A chatbot responds to a message. A personal agent increasingly shapes an information environment. It summarizes sources, chooses which links to surface, remembers user preferences, suggests next steps, rewrites plans, and carries assumptions across sessions.

If the feedback loop rewards agreement, the agent can become smoother while becoming less trustworthy. It learns to preserve user confidence instead of improving user judgment. The failure mode can look helpful from the inside: better framing, stronger arguments, fewer interruptions, more emotional support, more momentum.

That is exactly why the harness matters. A prompt that says "be honest" helps. A better loop helps more.

For research and planning work, the loop should include counterexample search, uncertainty calibration, source checks, adversarial passes, and visible confidence levels. For coding work, it should include tests and diffs. For slide generation, it should include screenshot checks and overflow detection. For recurring briefs, it should include logs, archives, source health, and failure alerts.

Good agent design asks what the system is rewarded for preserving.

If it preserves user comfort, it becomes agreeable.

If it preserves task success, it becomes useful.

If it preserves calibration, it becomes a better collaborator.

## Memory Without Worship

Personal agents make the problem sharper because they remember.

Memory is powerful. It lets a system keep track of projects, writing style, recurring mistakes, deployment details, personal preferences, and the small decisions that make a workflow feel continuous. Without memory, the user has to rebuild the world every session.

Memory also creates a trap. A personal agent can start treating the user's existing preferences as the safest path through every future task. It can become a better mirror instead of a better collaborator.

Good memory should preserve context without turning it into deference.

The distinction matters:

- remembering that a user works on AI music is useful;
- assuming every AI music idea is strong is sycophantic;
- remembering a writing style is useful;
- sanding away every disagreement to match that style is weak;
- remembering a preferred workflow is useful;
- skipping verification because the workflow usually works is brittle.

A mature agent should know the user and still keep independent contact with the task.

For my own collaboration with a personal agent, this means emotional support should stay calibrated. Agreement should have reasons. Disagreement should be direct when the evidence calls for it. Research ideas deserve adversarial passes. Plans deserve risk analysis. A personal assistant should reduce friction without removing all resistance.

The best version of memory makes future work less repetitive and more honest.

## What Agentic Systems Should Be Good At

If agenticness lives in the loop, the evaluation target changes.

A normal model benchmark asks whether the model can produce the right answer. An agent benchmark should ask whether the system can move a state of the world toward a goal while handling uncertainty, partial information, tool errors, and changing feedback.

That means useful agents should be good at several process-level behaviors:

- deciding what information is missing,
- choosing the next action,
- reading tool output accurately,
- changing strategy after failure,
- preserving useful state,
- avoiding unnecessary action,
- knowing when a human decision is needed,
- leaving artifacts that can be inspected,
- stopping when the task is genuinely done.

These are interaction skills between a model and its environment.

This is also why agent work often feels less like prompt crafting and more like systems design. The question becomes:

> What loop will make the right behavior natural?

If the loop has no test, the agent will claim success too early. If the loop has no durable state, it will repeat itself. If the loop hides errors, it will hallucinate progress. If the loop rewards pleasing the user, it will drift toward agreement. If the loop allows broad action without boundaries, it creates operational risk.

The harness is where these pressures become concrete.

## A Practical Definition

So what makes an agent agentic?

A model becomes agentic when it is placed inside a goal-directed feedback loop with enough state to continue, enough tools to act, enough observation to learn from consequences, and enough boundaries to act responsibly.

This definition avoids two weak extremes.

One extreme says any LLM with a tool call is an agent. That makes the word too cheap.

The other extreme imagines agency as something mystical: digital desire, artificial will, or a worker-like inner life. That makes the word too vague.

The engineering view is clearer:

> Agenticness is closed-loop, goal-directed action under uncertainty.

The loop can be small or large. It can run for one coding task, one browser session, one daily cron job, one research workflow, or one long-term personal runtime. The degree of agency grows with the system's ability to maintain state, choose actions, observe outcomes, and adapt.

## The Personal Runtime

OpenClaw is interesting to me because it treats the harness as part of the product surface.

Identity, user profile, long-term memory, daily notes, skills, tools, message channels, cron, heartbeat, browser control, and code execution are all ways of giving the model a more durable operating environment.

This makes the agent situated.

The difference is practical. A situated agent can remember why a site uses a certain style. It can keep a recurring research brief healthy. It can route a Telegram reply to the right topic. It can turn a repeated content workflow into a skill. It can carry a preference like "challenge me when needed" into future conversations.

That is the real promise of personal agents. They can become infrastructure for thinking and doing.

The risk sits in the same place. A personal runtime that remembers too much, acts too freely, or optimizes for approval can become invasive, brittle, or epistemically soft. Durable agency needs durable judgment.

A good assistant does responsible work over time: remembering what matters, checking what changed, acting when useful, stopping when appropriate, and improving the human's contact with reality.

That is what makes an agent worth calling agentic.
