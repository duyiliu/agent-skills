---
name: goal-polish
description: Manual-invocation mode for iteratively improving the usability, visual quality, or product completeness of an existing interface against the rendered result. Use for deliberate sustained polish loops, not ordinary one-off UI edits.
disable-model-invocation: true
---

# Goal Polish

Use this workflow for subjective UI/UX and product-quality improvement where quality must be judged against the actual rendered experience.

## Trigger intent

This is a **deliberate iterative mode** and should be entered only when the user explicitly invokes this Skill through the current runtime's Skill command.

A natural-language UI request without explicit Skill invocation remains a normal bounded task. Do not silently turn “adjust this spacing”, “make this button clearer”, or even a broad polish request into an open-ended loop.

## Approach

- Inspect the running/rendered interface when available.
- Identify only the highest-value issues affecting hierarchy, readability, spacing, consistency, interaction clarity, responsiveness, or unfinished appearance.
- Make focused improvements that preserve working behavior and fit the product direction.
- Reinspect the rendered result after changes.
- Continue while clear high-value gaps remain.
- Stop when remaining changes are marginal or require a product preference from the user. Do not invent new defects just to keep the loop running.

If the work reveals a required change to business flow/state, DB schema, public API, permissions, messages, migration/compatibility, concurrency/idempotency/transaction semantics, stop and route that change through `task-design`.

## Agent coordination

- Default to one Builder making UI changes. When useful, ask independent, read-only reviewers to inspect different aspects of the actual rendered experience; do not create a fixed reviewer team for every iteration.
- Avoid concurrent edits to the same UI files or components. The main agent merges feedback, checks the rendered result, and remains responsible for the final quality claim. Fall back to single-agent inspection if delegation is unavailable.

## Side-effect boundary

Local UI/code edits and safe local verification are allowed. Commit, push, deploy/release, production or shared-data writes, credentials use, and irreversible external actions require project-level permission or explicit user authorization.

## Long-running mode

Define:

- Outcome: intended experience improvement.
- Verification: rendered/interaction evidence.
- Constraints: existing behavior, product direction, accessibility, responsive requirements.
- Iteration: fix highest-value gap → reinspect → reassess.
- Stop condition: two consecutive rendered/interaction checks reveal no actionable high-priority issues, the remaining benefit is marginal, or a user decision is needed. If rendered inspection is unavailable, state the verification limit instead of claiming visual convergence.

If the runtime supports a persistent Goal, establish it after explicit invocation and continue toward it.

## Completion

Summarize concrete experience changes and rendered evidence. Separate visually observed results from source-level inference.
