---
name: goal-investigate
description: Read-only, evidence-driven root-cause investigation of unexplained technical failures, behavior discrepancies, or suspected defects requiring multi-step tracing or competing-hypothesis checks. Auto-select only when systematic diagnosis is needed; do not use for simple facts, file or folder provenance, Git history or ownership queries, documentation lookup, or routine code navigation. If the user requests a fix, choose goal-fix. Explicit invocation is allowed.
---

# Goal Investigate

Use this workflow when the main request requires systematic, read-only diagnosis of a technical behavior, discrepancy, or suspected failure. For a straightforward question such as "Where did this directory come from?" or "Who added this file?", inspect Git history or file metadata directly without activating this Skill.

## Approach

- Restate observed symptom and expected behavior.
- Trace the real path end to end where possible.
- Prefer read-only inspection first and keep source facts, runtime observations, data facts, and hypotheses distinct.
- Check the most plausible competing explanations and record evidence for/against each.
- Keep this Skill read-only even when a repair seems obvious. If the user requested diagnosis plus repair, route to `goal-fix` before editing; if a repair is authorized later, exit investigation and switch workflows.
- Stop when the cause is adequately established or the next missing observation is clear.

If the user subsequently requests repair, exit this read-only workflow and use `goal-fix` for a focused fix under existing contracts. If repair would redefine a high-cost contract (business flow/state, DB schema, public API, permissions, messages, migration/compatibility, concurrency/idempotency/transaction semantics), route through `task-design` instead.

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

Repeat evidence-driven iterations within the active session. Loading a Skill does not start a persistent job or restart a stopped process; unattended rounds, cross-session resumption, and cross-machine orchestration require separately configured tooling such as Pi Goal or Hermes.

## Completion

Report the conclusion first, then verified facts, ruled-out alternatives, remaining uncertainty, and the next action. State clearly whether any code change was made.
