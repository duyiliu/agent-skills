---
name: goal-investigate
description: Trace an unclear behavior or failure to its strongest evidence-supported explanation and recommend a concrete next action. Use automatically when the user primarily asks why or asks to investigate without a repair; when a fix is requested, goal-fix owns diagnosis and repair. Can also be invoked explicitly for sustained investigation.
---

# Goal Investigate

Use this workflow when the main request is to understand a behavior, discrepancy, or suspected cause.

## Approach

- Restate observed symptom and expected behavior.
- Trace the real path end to end where possible.
- Prefer read-only inspection first and keep source facts, runtime observations, data facts, and hypotheses distinct.
- Check the most plausible competing explanations and record evidence for/against each.
- Do not modify project code unless the user also requested a fix/change.
- Stop when the cause is adequately established or the next missing observation is clear.

If the user subsequently requests repair, use `goal-fix` for a focused fix under existing contracts. If repair would redefine a high-cost contract (business flow/state, DB schema, public API, permissions, messages, migration/compatibility, concurrency/idempotency/transaction semantics), route through `task-design` instead.

## Agent coordination

- Default to one investigator. Parallelize only genuinely independent, read-only hypotheses or evidence sources when doing so improves confidence or efficiency.
- Consolidate conflicting findings against observable evidence before concluding. Do not use subagents as a pretext to modify code; proceed alone if delegation is unavailable.

## Side-effect boundary

Investigation is read-only by default. Production or shared-data writes, commit, push, deploy/release, credentials use, and irreversible external actions require project-level permission or explicit user authorization.

## Long-running mode

Define:

- Outcome: the question to answer and required confidence.
- Verification: observations that support or rule out candidate explanations.
- Constraints: read/write boundaries and environments in scope.
- Iteration: follow evidence to the next most informative observation.
- Stop condition: cause established or progress requires unavailable access/data/user decision.

When explicitly invoked for long-running work and the runtime supports a persistent Goal, establish that Goal and continue toward it.

## Completion

Report the conclusion first, then verified facts, ruled-out alternatives, remaining uncertainty, and the next action. State clearly whether any code change was made.
