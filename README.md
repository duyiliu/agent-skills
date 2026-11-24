# Agent Skills

Cross-project reusable Skills, organized by capability. Each Skill directory is complete and may include references, templates, scripts, and runner-specific metadata.

This repository is the canonical source for **generic, cross-project Agent Skills**. LifeOS-specific memory and knowledge operations are maintained in the [LifeOS repository](https://github.com/duyiliu/LifeOS), which owns its own Skill and runtime sync tool.

## 单一维护源（Single Source of Truth）

**本仓库只维护这里收录的通用 Agent Skills。** 工具型 Skill 可以独立建仓并拥有各自的单一维护源；例如 [project-runner](https://github.com/duyiliu/project-runner) 在其独立仓库维护。[LifeOS](https://github.com/duyiliu/LifeOS) 自己维护个人记忆与知识操作 Skill，本仓库不再存放或定义 LifeOS 专属路径、目录和记忆规则；[ai-dev-handbook](https://github.com/duyiliu/ai-dev-handbook) 仅维护规则、配置、MCP 和工具工程资料。

- 本仓库的通用 Skill 只在本仓库维护；独立工具 Skill 在各自仓库维护。
- LifeOS 专属 Skill 的唯一源是 LifeOS/skills/，通过 LifeOS/tools/sync_skills.py 同步到客户端；不要复制到本仓库。
- Codex、Claude Code 等用户级安装目录是运行时副本，更新后需按各自来源仓库的同步方式更新，不视为新的权威来源。
- 历史来源仓库的旧提交仅供溯源；尤其不要把已废弃的 `goal-feature` 重新迁入。确定性新功能统一使用 `task-design → 用户确认 → task-execution`。


Browse the public [Agent Skills website](https://duyiliu.github.io/agent-skills/) to search, read, copy, and download Skill files. Editing opens the corresponding GitHub file and requires repository write access. GitHub Actions rebuilds and publishes the website after changes to Skills or website code. See [website maintenance](website/README.md).

## 安装与校验（Codex / Claude Code）

从本仓库克隆后，在仓库根目录运行（需要 Node.js 22+）：

```powershell
node scripts/install-skills.mjs --runner codex
node scripts/install-skills.mjs --runner codex --check
# Claude Code 使用 --runner claude
```

安装副本不会随 GitHub 更新自动同步；拉取仓库新版本后重新执行安装。可用 `--dest <路径>` 指定目标位置，`--check` 仅对比不修改。脚本不清理历史安装目录（已迁移的 `jrebel-start` 和合并的 `work-convention` 本机副本都不会自动移除，确认替代 Skill 可用后需手动卸载）；详情见 [Goal Skills 安装与兼容](skills/goals/README.md#安装与一致性检查codex--claude-code)。任务路由的权威索引见 [Skills 默认路由](skills/README.md#默认路由)。

## Engineering

- [task-design](skills/engineering/task-design/SKILL.md) — establish a design baseline for substantial or high-contract changes.
- [task-execution](skills/engineering/task-execution/SKILL.md) — implement and verify work against an approved design or goal.
- [ai-test-checkpoints](skills/engineering/ai-test-checkpoints/SKILL.md) — black-box quality checks for Web management interfaces.
- [git-commit](skills/engineering/git-commit/SKILL.md) — prepare and create scoped, atomic Git commits.
- [ext-plus-backend-dev-rules](skills/engineering/ext-plus-backend-dev-rules/SKILL.md) — development rules for Ext Plus backend projects.
- [研发资料约定](skills/engineering/工作资料约定.md) — decision, archival and release-document conventions (documentation, not an installable Skill).
- [Engineering index](skills/engineering/README.md)

## Independent tool Skills

- [project-runner](https://github.com/duyiliu/project-runner) — Java/JRebel project startup and logging; moved from `jrebel-start`, maintained independently. Install with `npx skills add duyiliu/project-runner --skill project-runner -g`.

## Knowledge

- [knowledge](skills/knowledge/knowledge/SKILL.md) — query and maintain user-designated generic Markdown knowledge bases; does not apply to LifeOS.
- [knowledge-review](skills/knowledge/knowledge-review/SKILL.md) — explicitly audit generic Markdown knowledge bases; LifeOS reviews use the Skill maintained in LifeOS.
- [Knowledge index](skills/knowledge/README.md)

## Goals

- [goal-fix](skills/goals/goal-fix/SKILL.md) — diagnose and repair a focused bug under existing contracts.
- [goal-investigate](skills/goals/goal-investigate/SKILL.md) — investigate unclear behavior and report evidence-supported causes.
- [goal-performance](skills/goals/goal-performance/SKILL.md) — improve performance using comparable measurements.
- [goal-refactor](skills/goals/goal-refactor/SKILL.md) — restructure code while preserving observable behavior.
- [goal-improve](skills/goals/goal-improve/SKILL.md) — manually start an autonomous improvement loop.
- [Goal index](skills/goals/README.md)

## Repository management

- [github-skill-repository](skills/github-skill-repository/SKILL.md) — create, migrate, and maintain GitHub repositories of Skills.
- [Skill development and usage guide](skills/SKILL-开发与使用说明.md)

## GitHub collaboration

- [github-codex-review](skills/github-codex-review/SKILL.md) — trigger/resume Codex PR review; explicitly opt into a bounded fix → verify → commit/push → rereview loop (max 3 repair rounds).
