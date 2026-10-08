---
name: goal-performance
description: Improve runtime or resource performance using a measured baseline, profiling evidence, and comparable before-and-after measurements. Use automatically for focused performance work that does not alter high-cost contracts, or when explicitly invoked for a deliberate optimization loop.
---

# Goal Performance

Use this workflow for latency, throughput, memory, startup, rendering, or resource-use improvements.

## Approach

- Establish workload, environment, and baseline metric before editing.
- Profile or otherwise locate the bottleneck before substantial optimization.
- Define a target from the request or existing objectives; do not invent a material success threshold.
- Change the measured bottleneck while preserving correctness and public behavior.
- Re-measure under comparable conditions and report before/after values and limitations.

If a proposed optimization changes high-cost contracts or core business semantics, stop and route through `task-design`.

## Agent coordination

- Default to one agent. Delegate independent profiling or bottleneck analysis only if environments and measurements stay comparable; avoid concurrent load tests that contaminate each other's baseline.
- Assign one owner for overlapping code changes. The main agent owns the final before/after comparison and correctness checks; use one agent when parallelism is not beneficial.

## Side-effect boundary

Local code edits and safe local measurement/verification are allowed. Commit, push, deploy/release, production or shared-data writes, credentials use, and irreversible external actions require project-level permission or explicit user authorization.

## Long-running mode

Define:

- Outcome: the metric and meaningful improvement sought.
- Verification: comparable measurement method.
- Constraints: correctness, workload, environment, and resource limits.
- Iteration: profile → change → measure.
- Stop condition: target met, remaining gain marginal, or no defensible path remains within scope.

When explicitly invoked for long-running work and the runtime supports a persistent Goal, establish that Goal and continue toward it.

## Completion

Do not call code “faster” without comparable measurement. Report gain, trade-offs, and unmeasured dimensions.
