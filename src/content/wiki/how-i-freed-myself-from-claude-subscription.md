---
title: 'How I "Freed" Myself From Claude Subscription'
kind: Essay
pubDate: 2026-06-19
updatedDate: 2026-06-19
tags: ["agents", "claude", "open models", "coding", "research"]
parents: ["openclaw-as-an-agent-runtime"]
related: ["what-makes-an-agent-agentic"]
---

Last week I started rethinking my dependence on Claude.

The trigger was Anthropic itself.

Over the past half year, Anthropic has made a series of choices that feel increasingly unfriendly to consumer users, independent developers, and independent researchers. Some of those choices are product decisions. Some are policy decisions. Some are safety decisions. Taken together, they changed how I think about Claude as a foundation for my own work.

Claude can still be useful. Claude Code is still an extraordinary agent framework. But I no longer want Claude to be the center of my AI workflow.

That is the real shift.

## Why I Started Reconsidering

Anthropic's recent decisions made the dependency visible.

The recent Fable / Mythos discussion was one part of it. Anthropic framed the release around new capability, but the community quickly focused on the "non-core" model and safeguard controversy: routing, fallback behavior, research restrictions, and the question of whether some frontier-adjacent work receives a different version of the model experience.

For me, the issue is more practical than philosophical. Claude Code made subscription-backed automation feel normal: pay USD 100 or USD 200 a month, then let the agent run long tasks, edit files, recover from mistakes, and keep going. The recent Anthropic turbulence made me ask whether I actually need that subscription layer for automation at all.

The same thing has been happening at the product layer. Claude Code, Agent SDK usage, subscription limits, third-party tools, and long-running automation have all gone through policy turbulence. Some changes were walked back after backlash. Some were justified by economics. I understand why a company would want to control abuse and margin. That still does not make the platform feel stable.

That is the part I care about. A closed model is not just a model. It is also a policy surface, a pricing surface, a routing surface, and a company strategy. If I build my workflow around it, I inherit all of that.

## GLM-5.2 Crossed a Psychological Line

Then GLM-5.2 arrived, and the calculation changed.

I am not claiming that one open model beats every closed model on every task. That is not the point. The point is that GLM-5.2 feels like a Claude Opus 4.6-level model in the places that matter for my workflow: long context, coding, agentic tasks, and sustained reasoning over a messy project.

Z.ai describes GLM-5.2 as a long-horizon model with a solid 1M-token context, MIT licensing, and explicit work on agentic coding. Their own results put it close to Opus 4.8 on several long-horizon coding benchmarks, while still showing gaps on the hardest ultra-long tasks. Artificial Analysis ranked it as the leading open-weight model on its Intelligence Index v4.1, and also placed it on the intelligence-vs-cost Pareto frontier.

The pricing is the other part. If reaching Claude's USD 100 subscription value is the mental anchor, GLM-5.2-class inference can get surprisingly close for a fraction of the marginal cost. Depending on the workload and provider, the rough feeling is that the same practical amount of coding-agent work can cost around one-fifth as much.

That changes the default. I do not need every task to go through Claude. I need a model portfolio that gives me capability, cost control, and exit options.

## The Model and the Harness Are Different Things

The most important realization was about Claude Code.

For a long time, I thought I used Claude Code because I wanted Claude. That was only partly true. What I really wanted was the automation loop: file access, command execution, patching, planning, recovery, compaction, and the ability to let an agent work on a long task while I stayed in a supervisory role.

Claude Code turns model intelligence into work. That is why it feels different from a normal chat interface.

It may still be the best agent framework in the world. But that does not mean Claude Opus 4.8 is the best model in the world. These are different questions.

Once I separate the harness from the model, the stack becomes much clearer:

- use the strongest model for research, planning, and taste;
- use the best framework for automation and long-horizon execution;
- use cheaper open models when the task is token-heavy;
- use closed frontier models only when they earn the cost;
- avoid making long-running work depend on one vendor's rules.

Claude Code can remain excellent while Claude stops being my default model identity.

## My New Stack

My current workflow is more like routing than loyalty.

For deep research, planning, and writing, I trust GPT-5.5 Pro more than Claude Opus 4.8. My personal split is around 60/40. That is subjective, but it is stable across the things I care about: coding judgment, intellectual sharpness, and language. GPT tends to feel less mannered, more direct, and more willing to hold a broad research state without turning the prose into Claude-flavored politeness.

For coding and automation, I care about the framework as much as the model. Cursor remains valuable because it is an editing environment, not merely a model wrapper. It gives the model a live relationship with the codebase. Pairing that kind of framework with Gemini 1.5 Pro, GLM-5.2, or whichever model fits the task is often better than asking one subscription to be the whole operating system.

For long-term tasks, cost matters. A model that can run large coding trajectories at a much lower marginal cost changes the shape of automation. It means I can let the agent spend tokens exploring, testing, and recovering without feeling like every detour is burning premium frontier-model money.

For Claude, the role is narrower now. I will still use Claude Code when its loop is the right tool. I may still use Claude when it clearly wins a specific task. But I no longer want it to be the default layer under my research, coding, and automation life.

## What Freedom Means Here

Freeing myself from Claude does not mean deleting Claude. It means removing the dependency.

Claude helped define what a long-horizon coding agent could feel like. I still respect that. But the next step is not to stay inside one company's model stack. The next step is to build a workflow where models can be swapped, frameworks can be chosen independently, and long-running automation survives pricing changes, policy changes, and product strategy shifts.

That is the practical meaning of "freeing myself from Claude":

not rejecting the tool,

but refusing to let it be the whole system.

## References

- [Anthropic: Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Anthropic: Higher usage limits for Claude and a compute deal with SpaceX](https://www.anthropic.com/news/higher-limits-spacex)
- [Artificial Analysis: GLM-5.2 is the new leading open weights model](https://artificialanalysis.ai/articles/glm-5-2-is-the-new-leading-open-weights-model-on-the-artificial-analysis-intelligence-index)
- [Z.ai: GLM-5.2: Built for Long-Horizon Tasks](https://z.ai/blog/glm-5.2)
- [Nathan Lambert: Claude Fable 5 and new safety fables](https://www.interconnects.ai/p/claude-fable-5-and-new-ai-safety)
