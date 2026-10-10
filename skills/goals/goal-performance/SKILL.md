---
name: goal-performance
description: Diagnose and improve meaningful runtime or resource bottlenecks with a baseline, profiling, correctness checks, and comparable before-and-after measurement. Auto-select for performance work that genuinely requires investigation or repeated measurement, not routine SQL edits, simple configuration changes, or generic quick lookups. Do not use for behavior-changing redesign; explicit invocation is allowed.
---

# Goal Performance

Use this workflow for latency, throughput, memory, startup, rendering, or resource-use improvements that warrant profiling and comparable measurement. Handle simple, well-understood tuning or factual performance questions directly.

## Approach

- Establish workload, environment, and baseline metric before editing.
- Profile or otherwise locate the bottleneck before substantial optimization.
- Define a target from the request or existing objectives; do not invent a material success threshold.
- Change the measured bottleneck while preserving correctness and public behavior.
- After meaningful changes, run relevant correctness and regression checks; faster but incorrect is a failed optimization.
- Re-measure with comparable workload, environment, and method; report before/after values, material variance, and limitations.

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
- Stop condition: target met with correctness checks passing, remaining gain marginal, or no defensible path remains within scope. Without a defensible baseline and comparable measurement, do not claim optimization success.

Repeat evidence-driven iterations within the active session. Loading a Skill does not start a persistent job or restart a stopped process; unattended rounds, cross-session resumption, and cross-machine orchestration require separately configured tooling such as Pi Goal or Hermes.

## Completion

Do not call code “faster” without comparable measurement. Report measured gain, correctness/regression results, trade-offs, and unmeasured dimensions. Failed regression checks mean the optimization is not complete.
