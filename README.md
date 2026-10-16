# Agent Skills

Cross-project reusable Skills, organized by capability. Each Skill directory is complete and may include references, templates, scripts, and runner-specific metadata.

This repository is the canonical source for the migrated LifeOS Skills. Preserve provenance notes in each Skill and check its description and project-specific boundaries before installing it.

## 单一维护源（Single Source of Truth）

**本仓库是其所收录通用 Agent Skills 的唯一维护位置。** 工具型 Skill 可以独立建仓并拥有各自的单一维护源；例如 [project-runner](https://github.com/duyiliu/project-runner) 已迁出。 [LifeOS](https://github.com/duyiliu/LifeOS) 只保留 Skill 仓库链接；[ai-dev-handbook](https://github.com/duyiliu/ai-dev-handbook) 仅维护规则、配置、MCP 和工具工程资料，不再保留 `skills/` 目录。

- 本仓库已收录的通用 Skill 只在本仓库维护；已独立的工具 Skill 在其各自仓库维护，不再复制进本仓库。
- Codex、Claude Code 等用户级安装目录是运行时副本，更新后需按对应运行器规则同步，不视为新的权威来源。
- 历史来源仓库的旧提交仅供溯源；尤其不要把已废弃的 `goal-feature` 重新迁入。确定性新功能统一使用 `task-design → 用户确认 → task-execution`。


Browse the public [Agent Skills website](https://duyiliu.github.io/agent-skills/) to search, read, copy, and download Skill files. Editing opens the corresponding GitHub file and requires repository write access. GitHub Actions rebuilds and publishes the website after changes to Skills or website code. See [website maintenance](website/README.md).

## 安装与校验（Codex / Claude Code）

从本仓库克隆后，在仓库根目录运行（需要 Node.js 22+）：

```powershell
node scripts/install-skills.mjs --runner codex
node scripts/install-skills.mjs --runner codex --check
# Claude Code 使用 --runner claude
```

安装副本不会随 GitHub 更新自动同步；拉取仓库新版本后重新执行安装。可用 `--dest <路径>` 指定目标位置，`--check` 仅对比不修改。脚本不清理历史安装目录（因此旧 `jrebel-start` 本机副本不会自动移除，迁移后需手动卸载）；详情见 [Goal Skills 安装与兼容](skills/goals/README.md#安装与一致性检查codex--claude-code)。任务路由的权威索引见 [Skills 默认路由](skills/README.md#默认路由)。

## Engineering

- [task-design](skills/engineering/task-design/SKILL.md) — establish a design baseline for substantial or high-contract changes.
- [task-execution](skills/engineering/task-execution/SKILL.md) — implement and verify work against an approved design or goal.
- [ai-test-checkpoints](skills/engineering/ai-test-checkpoints/SKILL.md) — black-box quality checks for Web management interfaces.
- [git-commit](skills/engineering/git-commit/SKILL.md) — prepare and create scoped, atomic Git commits.
- [ext-plus-backend-dev-rules](skills/engineering/ext-plus-backend-dev-rules/SKILL.md) — development rules for Ext Plus backend projects.
- [work-convention](skills/engineering/work-convention/SKILL.md) — organize design and execution materials under `work/`.
- [Engineering index](skills/engineering/README.md)

## Independent tool Skills

- [project-runner](https://github.com/duyiliu/project-runner) — Java/JRebel project startup and logging; moved from `jrebel-start`, maintained independently. Install with `npx skills add duyiliu/project-runner --skill project-runner -g`.

## Knowledge

- [knowledge](skills/knowledge/knowledge/SKILL.md) — query, capture, and maintain the existing LifeOS Markdown knowledge base without creating a new vault.
- [knowledge-review](skills/knowledge/knowledge-review/SKILL.md) — explicitly audit duplication, contradictions, stale notes, and links; review is read-only by default.
- [Knowledge index](skills/knowledge/README.md)

## Goals

- [goal-fix](skills/goals/goal-fix/SKILL.md) — diagnose and repair a focused bug under existing contracts.
- [goal-investigate](skills/goals/goal-investigate/SKILL.md) — investigate unclear behavior and report evidence-supported causes.
- [goal-performance](skills/goals/goal-performance/SKILL.md) — improve performance using comparable measurements.
- [goal-refactor](skills/goals/goal-refactor/SKILL.md) — restructure code while preserving observable behavior.
- [goal-improve](skills/goals/goal-improve/SKILL.md) — manually start an autonomous improvement loop.
- [Goal index](skills/goals/README.md)

## Windows utilities

- [LifeOS knowledge auto-sync](scripts/README.md) — scheduled PowerShell Git sync for Markdown; no model calls.

## Repository management

- [github-skill-repository](skills/github-skill-repository/SKILL.md) — create, migrate, and maintain GitHub repositories of Skills.
- [Skill development and usage guide](skills/SKILL-开发与使用说明.md)

## GitHub collaboration

- [github-codex-review](skills/github-codex-review/SKILL.md) — trigger/resume Codex PR review; explicitly opt into a bounded fix → verify → commit/push → rereview loop (max 3 repair rounds).
