---
name: goal-fix
description: Diagnose and repair a bug or regression through root-cause evidence, a focused fix, and verification. Auto-select when the repair benefits from nontrivial diagnosis or regression checks, not for an obvious, small localized edit. Requested fixes stay in this workflow even across multiple rounds; do not use for read-only questions or contract redesign. Explicit invocation is also allowed.
---

# Goal Fix

Use this workflow for a reported failure, regression, or incorrect result that needs a deliberate diagnosis-and-verification loop and does not require redesigning high-cost contracts. For an obvious, safe, localized correction, fix and verify it directly without automatically entering this Skill. A multi-round repair remains `goal-fix`; task length alone does not route it to `task-execution`.

## Approach

- Reproduce the original failure when practical and safe before editing; if reproduction is not possible, record the strongest available evidence and the limitation.
- Trace the real path from symptom through relevant code, inputs, data, and environment.
- Keep observed facts and hypotheses separate; identify the root cause before changing code.
- Make the smallest change that addresses the cause and preserve unrelated behavior and public contracts.
- Verify the repair against the same observable condition when possible; do not treat compilation alone as proof that the original failure is fixed.
- Do not turn a local fix into a broad refactor.

Restoring behavior required by an existing, confirmed contract is a fix, not a contract change. If the repair instead requires redefining business flow/state, DB schema, public API, permissions, messages, migration/compatibility, or concurrency/idempotency/transaction semantics, stop and route through `task-design`.

## Agent coordination

- Default to one agent owning diagnosis, code changes, and verification. Delegate independent, read-only evidence collection only when its value exceeds coordination cost.
- Keep one owner for overlapping files and the actual fix. The main agent integrates findings and reruns verification; use a single agent if delegation is unavailable.

## Side-effect boundary

Local code edits and safe local verification are allowed. Commit, push, deploy/release, production or shared-data writes, credentials use, and irreversible external actions require project-level permission or explicit user authorization.

## Long-running mode

For multi-step fixes define:

- Outcome: what failure must disappear.
- Verification: how the result can be observed.
- Constraints: behavior, API, data, and environment boundaries to preserve.
- Iteration: use new evidence to guide the next smallest repair.
- Stop condition: the cause is repaired with adequate evidence, or a missing decision/access blocks further work.

Repeat evidence-driven iterations within the active session. Loading a Skill does not start a persistent job or restart a stopped process; unattended rounds, cross-session resumption, and cross-machine orchestration require separately configured tooling such as Pi Goal or Hermes.

## Completion

Report the root cause, what changed, verification evidence, and any remaining uncertainty. Do not present a hypothesis as a confirmed fix.
