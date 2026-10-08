---
name: goal-improve
description: Manual mode for autonomous, repeated improvement toward a user-defined quality goal. The agent finds issues, plans fixes, makes changes, checks results, and repeats without asking for instructions each round. Useful for UI, games, interactions, and other work that needs ongoing refinement; not for one-off edits.
disable-model-invocation: true
---

# Goal Improve

Improve an existing product or experience **on your own** until the result is good enough, progress stalls, or a decision is needed. The user sets the goal and limits; the agent chooses what to improve each round.

## Start

- Enter this mode only when the user explicitly calls `goal-improve`. Ordinary requests stay bounded tasks.
- At the start, identify the goal, what can be changed, how to check the result, and any time/round/cost limit. Use reasonable defaults when safe; ask only about a decision that blocks work.
- Do not require the user to provide a task list or approve each small change.

## Loop

Repeat independently:

1. **Check** the current result. Use the running app, screenshots, tests, gameplay, or other direct evidence where available.
2. **Find** the most important remaining issue. Keep a short, ranked list; do not invent problems to stay busy.
3. **Plan** the smallest useful improvement and its check.
4. **Change** the code or assets within the agreed limits.
5. **Test** the result, including relevant regression checks.
6. **Review** whether it is actually better. If not, revert or adjust; then pick the next issue.

Use direct observation for subjective quality. UI examples: layout, clarity, consistency, and interaction. Game examples: controls, feedback, camera, and combat feel. These are examples, **not limits on the Skill**. When direct inspection is unavailable, state what was not verified instead of claiming quality has converged.

## Working with agents

- One agent is the default. It may ask a separate read-only agent to review when that brings clear value; never require a fixed team.
- Keep one owner for overlapping files. The main agent decides, integrates changes, and runs the final check.

## Stop

Stop and hand over when any of these happens:

- Two consecutive checks find no important actionable issue.
- Further changes offer little benefit, repeat a failed approach, or exceed the agreed budget.
- A key choice requires the user's judgment, or safe verification is not possible.

Do not stop just because the first change worked. Do not continue forever or invent new work to keep the loop running.

If improvement requires changing core business rules, database schema, public APIs, permissions, migration, or other high-cost contracts, pause that part and route it to `task-design` for user confirmation.

## Limits

Local edits and safe checks are allowed. Commit, push, deploy, production/shared-data changes, secrets use, and irreversible actions require existing project permission or explicit user approval.

This Skill can run several rounds in the **current session**. It cannot keep a process alive or resume itself after exit. For unattended or cross-session work, use an external tool such as Pi Goal or Hermes.

## Finish

Report what improved, what was checked, what remains, and why the loop stopped. Distinguish observed results from guesses.
