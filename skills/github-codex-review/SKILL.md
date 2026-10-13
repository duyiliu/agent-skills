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

- Read the current PR head, latest Codex review summary, and review records before posting. Resolve the authenticated GitHub user and identify the Codex integration bot from existing PR metadata.
- On the first trigger, record the full `headRefOid`, the top-level trigger comment URL / ID and creation time, and the request time in the current task context.
- When resuming, inspect the authenticated user's existing `@codex review` trigger comments since the recorded request time. Query each candidate comment's reactions with `gh api repos/{owner}/{repo}/issues/comments/{comment_id}/reactions`.
- A `👀` reaction from the Codex integration bot means the run is active even when no summary or review record exists yet. Reuse that run and wait; do not post another trigger. Correlate the reaction with the recorded trigger comment, request time, and head commit.
- If the task context with the recorded head is unavailable, treat the latest unresolved trigger comment with a Codex `👀` reaction as active until its completion summary identifies the reviewed commit. If its head cannot be established, report that uncertainty and resume monitoring later; do not risk a duplicate request.
- If a trigger comment was just posted and has not received a reaction or summary yet, allow up to 60 seconds for the integration to start before deciding that no run exists.
- If a review for the same head commit is already running in the summary or review records, reuse it and wait; do not post another comment. A completed review for an earlier request does not satisfy an explicit request to rerun.
- Only when no same-head run or unresolved trigger exists, read the PR head once more, then post exactly one top-level comment with `@codex review` and record its URL, ID, time, and head commit.

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
