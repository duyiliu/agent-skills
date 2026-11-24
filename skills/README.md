# Skills 收纳目录

本仓库的可复用 Skill 按能力分类，不按 Codex、Claude Code、Kilo 等运行器分类。

## 分类

- [engineering](engineering/README.md) — 企业研发流程、验证与工程规则
- [goals](goals/README.md) — Bug、调查、性能、重构和自主迭代优化工作流
- [knowledge](knowledge/README.md) — 非 LifeOS 的通用 Markdown 知识库查询、写入与审查
- [github-codex-review](github-codex-review/SKILL.md) — 在指定 GitHub PR 上触发/恢复 Codex 评审；显式授权后可自动修复、验证、提交推送并复审（最多三轮修复）
- [github-skill-repository](github-skill-repository/SKILL.md) — GitHub Skill 仓库的创建、迁移与维护
- [Skill 开发与使用说明](SKILL-开发与使用说明.md)

## 默认路由

**本节是仓库内任务路由的权威索引**。其他指南引用这里，不另维护完整路由表。

- 企业完整业务功能、系统集成、DB / 公共 API / 权限 / 状态机等高成本契约变化，进入实际设计交付/实施时 → `engineering/task-design + task-execution`；单纯探讨方案先直接在对话中讨论，不默认创建 design 或触发 Review
- 不改变高成本契约的 Bug / 只读调查 / 性能 / 行为不变重构 → 仅在用户显式调用时进入对应 `goals/goal-*`，与任务耗时无关
- 希望 Agent 自主发现问题并多轮优化（如 UI、游戏手感）→ 用户显式进入 `goals/goal-improve`
- 小而明确的一次性修改、简单事实查询、目录 / 文件来源和 Git 历史查询 → 直接完成，不因“为什么 / 调查 / 修复 / 优化”等关键词强行调用 Goal Skill
- 明确提出跨任务知识的查找 / 记录 / 更新，且目标不是 LifeOS → knowledge；显式要求通用知识库审查 / 清理 → knowledge-review（默认只读）。目标为 LifeOS 时使用 LifeOS 仓库内的 lifeos Skill。

`goal-feature` 已移除；确定性新功能统一由 `task-design → task-execution` 覆盖。

## 触发与兼容

- Skill 描述说明适用范围；具体调用方式由运行器决定。
- 所有 Goal Skill（`goal-fix / goal-refactor / goal-performance / goal-investigate / goal-improve`）均仅限手动调用。Pi / Claude 副本 frontmatter 带 `disable-model-invocation: true`，不会出现在自动模型选择中；Codex 副本移除该字段（Codex 不识别）且不使用 `agents/openai.yaml`（0.146 会连显式调用一起隐藏），仅靠 description 的 Manual-invocation-only 措辞约束。
- 安装和触发规则见 [Skill 开发与使用说明](SKILL-开发与使用说明.md)。

本仓库是这里收录的 Skill 源文件权威来源；已独立迁出的工具型 Skill（如 [project-runner](https://github.com/duyiliu/project-runner)）在其独立仓库维护。客户端安装副本由运行器发现和加载，不会因仓库更新自动变化。
