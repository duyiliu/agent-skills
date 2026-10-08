---
name: goal-polish
description: Manual-invocation mode for sustained evidence-based polish of an existing UI, interactive experience, or game feel against rendered or playable results. Not for one-off edits or automatic invocation.
disable-model-invocation: true
---

# Goal Polish

Use this workflow for subjective UI/UX, interactive-product, and game-feel improvement where quality must be judged against the actual rendered or playable experience rather than code alone.

## Trigger intent

This is a **deliberate iterative mode** and should be entered only when the user explicitly invokes this Skill through the current runtime's Skill command.

A natural-language UI/game request without explicit Skill invocation remains a normal bounded task. Do not silently turn “adjust this spacing”, “make the combat feel better”, or even a broad polish request into an open-ended loop.

## Approach

- Inspect the running/rendered interface or playable interaction when available; for games, use real input, gameplay capture, and replays rather than judging source code alone.
- Find only the highest-value issues: visual hierarchy, readability, spacing, consistency, responsiveness; or input feel, camera, feedback, combat rhythm, and interaction clarity where relevant.
- Define a repeatable observation or interaction for each meaningful issue; do not invent objective thresholds for subjective quality.
- Make focused improvements that preserve working behavior and fit the product direction.
- Reinspect the rendered or playable result and relevant regression checks after changes.
- Continue while clear high-value gaps remain.
- Stop when remaining changes are marginal or require a product preference from the user. Do not invent new defects just to keep the loop running.

If the work reveals a required change to business flow/state, DB schema, public API, permissions, messages, migration/compatibility, concurrency/idempotency/transaction semantics, stop and route that change through `task-design`.

## Agent coordination

- Default to one Builder making changes. When useful, ask independent, read-only reviewers to inspect distinct aspects of the real rendered/playable experience; do not create a fixed reviewer team for every iteration.
- Avoid concurrent edits to overlapping UI/game files or shared state. The main agent merges feedback, verifies the experience, and remains responsible for the final quality claim. Fall back to single-agent inspection if delegation is unavailable.

## Side-effect boundary

Local UI/game-code edits and safe local verification are allowed. Commit, push, deploy/release, production or shared-data writes, credentials use, and irreversible external actions require project-level permission or explicit user authorization.

## Long-running mode

Define:

- Outcome: intended UI or gameplay experience improvement.
- Verification: rendered / playable / interaction evidence appropriate to the product.
- Constraints: existing behavior, product direction, accessibility, input devices, responsiveness, and regressions as applicable.
- Iteration: identify a high-value gap → make a focused change → observe the same interaction → reassess.
- Stop condition: two consecutive real rendered/playable checks reveal no actionable high-priority issues, the remaining benefit is marginal, or a user decision is needed. If actual experience inspection is unavailable, state the verification limit instead of claiming convergence.

This mode can iterate within the active session, but does not create a persistent service or automatically resume after exit. For unattended retries or cross-session continuation, configure a separate orchestrator (such as Pi Goal or Hermes).

## Completion

Summarize concrete experience changes and rendered/playable evidence. Separate observed experience from source-level inference and identify untested input devices or interaction paths.
