---
name: github-codex-review
description: Trigger or resume Codex GitHub PR review; when the user explicitly requests a fix-and-review loop, repair actionable findings, verify, commit/push and request review of each new PR head, within bounded rounds. Never start public review or auto-fix from an ordinary review request.
---

# GitHub Codex PR Review

Use `gh` to operate on a specified GitHub PR. Two explicit modes:

- **Review-only (default):** when asked to run `@codex review`, request or resume that review and report findings; do not edit, push, or merge.
- **Fix-and-review loop (opt-in):** only when the user explicitly asks to fix Codex findings and continue submitting for review. Each cycle is **review → triage → repair → verify → commit/push → review new head**. Stop on PASS, blocked/unsafe changes, or after **three repair-and-rereview rounds** (initial review does not count). An open-ended "keep reviewing" request still uses this cap. The same agent coordinates the loop; reviewers must not recursively invoke this skill or spawn further review loops.

## Locate and authorize

- Require an unambiguous PR URL or `owner/repo#number`. "This PR" is acceptable only if `gh pr status` resolves exactly one open PR.
- Read PR state, `headRefOid`, `headRefName`, `headRepositoryOwner`, base and fork relationships, current checkout, worktree status, authentication, and permission to push. Never operate on merged/closed PRs, protected/foreign branches, or ambiguous checkouts.
- Posting `@codex review` is a public PR comment: do so only when requested to trigger Codex. Editing and pushing require separately explicit permission to run the fix loop. Never expose tokens or credentials.
- Before any mutation, check for unrelated/uncommitted user changes, divergent remote branch, concurrent collaborators, or changed HEAD. Preserve user changes. Do not stash, reset, force-push, rebase, delete files, or update unrelated paths silently.
- Ordinary bug fixes within the approved PR scope can proceed in loop mode; pause for user confirmation before schema/API/permission/architecture/product-design changes, destructive migrations, broad refactors, sensitive configuration, or materially expanded scope. If the change is not safe to automate, report the finding and stop rather than guessing.
- Keep `task-design` approvals and `task-execution` verification gates intact when applicable. This skill orchestrates PR review; it does not override higher-level project rules.

## Find or resume the exact review (idempotent)

- Read current HEAD and Codex review summaries, review records, top-level comments, and relevant inline comments; identify the real Codex integration identity from PR evidence.
- Record for each cycle: PR URL, full head SHA, request timestamp, trigger-comment ID/URL, Codex status, reviewed SHA, finding links, and repair-round number. Use existing task context or a task-local state note when available; do not commit state files into the PR.
- Inspect recent authenticated-user `@codex review` trigger comments and their Codex-bot reactions (via `gh api repos/{owner}/{repo}/issues/comments/{comment_id}/reactions`). Codex 👀 on an unresolved trigger counts as in progress even without a review summary; correlate with request time and SHA. If SHA cannot be established, treat the request as unresolved, report uncertainty, and **do not duplicate**.
- Give a newly posted trigger up to 60 seconds to be acknowledged. Reuse any in-progress review for the same HEAD. Do not post again solely due to a timeout, restart, missing summary, or lost state.
- When a **new code commit changes HEAD**, the prior review is stale. After validating no pending trigger applies to the new SHA, submit **exactly one** new top-level `@codex review` comment for the new HEAD. For an explicit manual rerun of a completed same-head review, permit a new request only after verifying no active trigger remains.
- If HEAD changes from outside this loop or cannot be correlated to our push, stop and report instead of overwriting or reviewing stale state.

## Await and interpret Codex

- Poll summary/review records at most every 20–30 seconds; provide occasional progress updates, not a busy loop. Wait at most 10 minutes **per invocation**. If still running, return the current SHA, trigger URL, status, and next action so a subsequent invocation can resume without retriggering. Do not imply work continues in the background without a separate scheduler.
- Consider review complete only if completion is demonstrably tied to the current HEAD and is newer than its trigger. Cross-check inline comments. Do not call "no findings" when Codex merely says "no major issues".
- Classify findings as **actionable**, **false positive / already addressed**, **needs human decision**, or **unverified**. Record severity, evidence, affected files, and links. Do not blindly implement suggestions.
- **PASS:** current-HEAD Codex review completed with no unresolved actionable findings, and the required local verification is successful. Stop and report; do not fabricate a PASS on missing or ambiguous review evidence.
- For false positives, document why and stop or seek clarification rather than repeatedly changing harmless code to appease the reviewer.

## Repair, verify, submit (opt-in loop only)

1. Confirm the review SHA still equals PR HEAD and local/remote tracked branch matches. Reproduce or substantiate each actionable finding; prioritize correctness and security. Reuse `goal-fix` principles if helpful, without recursive reviewer delegation.
2. Make the smallest coherent changes **only in the PR scope**. Do not modify application code merely to silence Codex; retain behavior/contracts. Keep one implementation owner and one bounded review loop.
3. Run targeted tests, lint/typecheck/build and relevant regression checks. Record commands, results, and skipped checks. **Do not commit/push known-failing changes**; if verification cannot run, assess risk and ask for approval before proceeding, otherwise stop with evidence. Static Codex review is not a substitute for tests.
4. Inspect the diff and staged paths. Stage only intentional files. Make an atomic, descriptive commit (e.g. `fix: address Codex PR review findings`) and push normally to the **same PR head branch**. Never force-push, change the base, auto-merge, or resolve/comment on review threads without separate authorization.
5. Re-read remote PR `headRefOid` and verify it matches the pushed commit. If remote changed or push fails, stop and report; do not retry by rewriting collaborators' history.
6. Increment the repair-round counter **only after a successful repair commit/push**. Request/reuse Codex review for this new HEAD and wait for its completion using the idempotent process above.
7. If new actionable findings remain and repair-round count is below **3**, repeat. Otherwise stop with a clear list of unresolved findings. No automated fourth repair round, even when findings change.

Avoid zero-change loops: when no safe code change is justified, do not create empty commits or request another automated review just to advance the loop. When consecutive review results repeat the same issue after a fix, stop and escalate with evidence instead of spinning.

## Resume / terminal report

- On invocation expiry or a paused review, return a compact checkpoint: PR, latest remote HEAD, mode, repair rounds used (0–3), trigger comment URL, Codex state, pending findings, validation evidence, and the exact safe next step. On resume, **revalidate** all remote/current state before action.
- Stop immediately on revoked authorization, inaccessible GitHub/Codex, ambiguous active request, outdated review, external HEAD change, conflict, failed tests, blocked push, unsafe change, or user-decision gate. Report blockers rather than silently skipping gates.
- At completion give PR link, current reviewed commit, each repair commit, number of review/repair rounds, Codex completion evidence and finding links, test results, remaining risks, and status (**PASS / BLOCKED / LIMIT_REACHED / REVIEW_PENDING**). Distinguish Codex's opinion from verified test/build/runtime evidence.
- Do not auto-merge the PR. Review-only mode never edits code.
