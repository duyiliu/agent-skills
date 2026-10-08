# Skills 收纳目录

本仓库的可复用 Skill 按能力分类，不按 Codex、Claude Code、Kilo 等运行器分类。

## 分类

- [engineering](engineering/README.md) — 企业研发流程、验证与工程规则
- [goals](goals/README.md) — Bug、调查、性能、重构及 UI / 游戏体验打磨工作流
- [github-skill-repository](github-skill-repository/SKILL.md) — GitHub Skill 仓库的创建、迁移与维护
- [Skill 开发与使用说明](SKILL-开发与使用说明.md)

## 默认路由

- 企业业务功能、系统集成、DB / 公共 API / 权限 / 状态机等高成本契约变化 → `engineering/task-design + task-execution`
- 不改变高成本契约的 Bug / 只读调查 / 性能 / 行为不变重构 → 对应 `goals/goal-*`，与任务耗时无关
- UI / UX / 游戏手感持续打磨等主观长循环 → 用户显式进入 `goals/goal-polish`
- 小而明确的一次性修改 → 直接完成，不为了“有 Skill”强行进入长流程

`goal-feature` 已移除；确定性新功能统一由 `task-design → task-execution` 覆盖。

## 触发与兼容

- Skill 描述说明适用范围；具体调用方式由运行器决定。
- `goal-fix / goal-refactor / goal-performance / goal-investigate` 默认允许自动和手动调用。
- `goal-polish` 是仅手动进入的 Mode Skill。Codex 安装副本保留 `agents/openai.yaml`，并移除 Claude 专用 frontmatter 字段。
- 安装和触发规则见 [Skill 开发与使用说明](SKILL-开发与使用说明.md)。

本仓库是 Skill 源文件的权威来源；客户端安装副本由运行器发现和加载，不会因仓库更新自动变化。