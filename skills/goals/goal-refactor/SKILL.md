---
name: goal-refactor
description: Restructure existing code to improve clarity or maintainability while preserving observable behavior and interfaces. Use automatically for focused refactors that do not alter high-cost contracts, or when explicitly invoked for a deliberate multi-step refactor loop.
---

# Goal Refactor

Use this workflow when the requested outcome is internal structural improvement without a deliberate behavior change.

## Approach

- Inspect relevant code, callers, project instructions, and current behavior before choosing a boundary.
- State the structural problem in concrete terms.
- Preserve externally observable behavior, persistence semantics, and public APIs.
- Keep changes proportional to demonstrated benefit; avoid speculative abstractions and unrelated cleanup.
- Compare before/after behavior using evidence appropriate to the claim.

If the refactor requires changing business flow/state, DB schema, public API, permissions, messages, migration/compatibility, concurrency/idempotency/transaction semantics, stop and route through `task-design`.

## Agent coordination

- Default to one agent. Delegate independent, read-only module analysis when boundaries are clear; parallel edits are optional only for genuinely disjoint files/modules with separate verification.
- Never let agents modify overlapping files concurrently. The main agent reviews the combined diff and runs behavior-preservation checks; proceed alone when integration cost outweighs benefits.

## Side-effect boundary

Local code edits and safe local verification are allowed. Commit, push, deploy/release, production or shared-data writes, credentials use, and irreversible external actions require project-level permission or explicit user authorization.

## Long-running mode

Define:

- Outcome: the structural problem to improve.
- Verification: evidence that behavior remains stable.
- Constraints: interfaces, data semantics, and unrelated modules to preserve.
- Iteration: address the highest-value structural issue, then reassess.
- Stop condition: the stated improvement is achieved or remaining changes are mainly stylistic / too risky.

When explicitly invoked for long-running work and the runtime supports a persistent Goal, establish that Goal and continue toward it.

## Completion

Describe the structural change, evidence collected, and any behavior-preservation gap that remains unverified.
