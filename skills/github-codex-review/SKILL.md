---
name: github-codex-review
description: Trigger or resume GitHub's automated Codex review for a specified pull request by posting `@codex review`, then wait for and summarize the result for the current PR head. Use only when the user asks to trigger or rerun Codex's GitHub PR reviewer; do not use for ordinary local code review or generic PR review.
---

# GitHub Codex Review

Use `gh` to request and monitor the automated Codex review attached to a GitHub pull request. This skill posts a public PR comment when it starts a review; trigger it only when the user explicitly asks for `@codex review` or to run / rerun the Codex PR reviewer.

## Resolve the pull request

- Use the supplied PR URL or `owner/repo` plus PR number. If the user only says “this PR”, resolve it from the current checkout only when `gh pr status` identifies one unambiguous PR; otherwise ask which PR.
- Read the PR state and current `headRefOid`. Do not trigger a review for a closed or merged PR.
- Check GitHub CLI access without printing, copying, or requesting credentials.

## Avoid duplicate requests

- Read the latest Codex review summary before posting.
- If a review for the same head commit is already running, reuse that run and wait; do not post another comment.
- If no run for the current head is running, post exactly one top-level comment with `@codex review` and record the comment URL, time, and head commit. A previous completed review does not satisfy an explicit request to rerun.

## Wait for this review

- Poll the PR's Codex review summary and review records every 20–30 seconds. Give a brief progress update about once a minute during a long wait; do not use `ping` or tight polling loops.
- Treat the review as complete only when GitHub reports completion for the current `headRefOid`. Prefer a Codex summary updated after the request and tied to that commit; corroborate findings against Codex review comments on the same commit.
- A completed review for an earlier head does not apply to the current head. If the PR head changes while waiting, report that the run reviewed an older commit and stop; do not automatically queue another review.
- Wait up to 10 minutes in one invocation. If it is still running, report the latest status and request comment URL so a later invocation can resume monitoring without posting again.
- Report a clear service error or access failure without retrying by posting repeated comments.

## Report the result

- Identify the PR, reviewed commit, completion state, and link to the Codex summary.
- Summarize each finding with its severity and inline-comment link. State “no findings” only when the completed summary and current-commit review comments support that conclusion; preserve the reviewer's exact wording when it says only “no major issues”.
- Keep static review conclusions separate from build, test, or runtime evidence.
- This skill only requests and reports the review. Do not change code, reply to findings, resolve threads, or merge the PR unless the user separately asks.
