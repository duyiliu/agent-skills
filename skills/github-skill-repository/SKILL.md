---
name: github-skill-repository
description: Create, migrate, organize, and maintain GitHub repositories that serve as a source of reusable agent Skills. Use when establishing a dedicated Skills repository or moving and synchronizing Skill collections across repositories.
---

# GitHub Skill Repository

Use this workflow when creating or maintaining a GitHub repository whose primary content is reusable agent Skills.

## Repository shape

- Keep each Skill as a complete directory named after its `SKILL.md` frontmatter `name`; retain references, templates, scripts, assets, and runner-specific metadata it needs.
- Maintain a concise repository index with category, purpose, source/provenance, and installation guidance where useful.
- Treat the dedicated repository as the canonical source after a migration. Keep consumer repositories pointed to it instead of maintaining divergent copies.

## Create or migrate

- Inspect the source repository, destination, current Git state, Skill inventory, references, and supporting files before changing anything.
- Match destination visibility to source sensitivity. Keep a migration from a private repository private unless the user explicitly requests public exposure.
- Copy or split history according to the user's need; preserve complete Skill folders and provenance. Do not discard local adaptations or supporting files silently.
- Validate names, frontmatter, internal links, and required resources. Update indexes and consumer references so moved Skills remain discoverable.
- For a move, verify the destination commit is pushed and retrievable before removing canonical source files. Keep installed user copies separate from repository source unless the user asks to resynchronize them.

## Maintain GitHub state

- Fetch before syncing. Fast-forward only when local history permits; inspect and preserve local changes before integrating upstream work.
- Scope staging to the requested Skill paths and related indexes. Review the staged diff before commit or push.
- Repository creation, visibility changes, deletion, commit, and push require authorization in the current task. A Skill request alone does not authorize unrelated external actions.
- Avoid concurrent edits to the same Skill directory. Update its README or catalog when adding, removing, or renaming a Skill.

## Completion

Report the repository URL and visibility, Skills migrated or changed, commit and push state, validation performed, and any retained source or local copies.