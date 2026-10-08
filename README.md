# Agent Skills

Cross-project reusable Skills, organized by capability. Each Skill directory is complete and may include references, templates, scripts, and runner-specific metadata.

This repository is the canonical source for the migrated LifeOS Skills. Preserve provenance notes in each Skill and check its description and project-specific boundaries before installing it.

## 单一维护源（Single Source of Truth）

**本仓库是全部可复用 Agent Skills 的唯一维护位置。** [LifeOS](https://github.com/duyiliu/LifeOS) 只保留 Skill 仓库链接；[ai-dev-handbook](https://github.com/duyiliu/ai-dev-handbook) 仅维护规则、配置、MCP 和工具工程资料，不再保留 `skills/` 目录。

- 新增、审查和修改 Skill 只在本仓库进行；其他项目不得再维护 Skill 源文件副本。
- Codex、Claude Code 等用户级安装目录是运行时副本，更新后需按对应运行器规则同步，不视为新的权威来源。
- 历史来源仓库的旧提交仅供溯源；尤其不要把已废弃的 `goal-feature` 重新迁入。确定性新功能统一使用 `task-design → 用户确认 → task-execution`。


Browse the public [Agent Skills website](https://duyiliu.github.io/agent-skills/) to search, read, copy, and download Skill files. Editing opens the corresponding GitHub file and requires repository write access. GitHub Actions rebuilds and publishes the website after changes to Skills or website code. See [website maintenance](website/README.md).

## Engineering

- [task-design](skills/engineering/task-design/SKILL.md) — establish a design baseline for substantial or high-contract changes.
- [task-execution](skills/engineering/task-execution/SKILL.md) — implement and verify work against an approved design or goal.
- [ai-test-checkpoints](skills/engineering/ai-test-checkpoints/SKILL.md) — black-box quality checks for Web management interfaces.
- [git-commit](skills/engineering/git-commit/SKILL.md) — prepare and create scoped, atomic Git commits.
- [ext-plus-backend-dev-rules](skills/engineering/ext-plus-backend-dev-rules/SKILL.md) — development rules for Ext Plus backend projects.
- [work-convention](skills/engineering/work-convention/SKILL.md) — organize design and execution materials under `work/`.
- [Engineering index](skills/engineering/README.md)

## Goals

- [goal-fix](skills/goals/goal-fix/SKILL.md) — diagnose and repair a focused bug under existing contracts.
- [goal-investigate](skills/goals/goal-investigate/SKILL.md) — investigate unclear behavior and report evidence-supported causes.
- [goal-performance](skills/goals/goal-performance/SKILL.md) — improve performance using comparable measurements.
- [goal-refactor](skills/goals/goal-refactor/SKILL.md) — restructure code while preserving observable behavior.
- [goal-polish](skills/goals/goal-polish/SKILL.md) — explicitly enter an iterative UI/UX polish loop.
- [Goal index](skills/goals/README.md)

## Repository management

- [github-skill-repository](skills/github-skill-repository/SKILL.md) — create, migrate, and maintain GitHub repositories of Skills.
- [Skill development and usage guide](skills/SKILL-开发与使用说明.md)
