# Engineering Skills

跨项目复用的工程开发技能。主文件与 references、templates 一并保存。

- 历史来源（仅供追溯）：[ai-dev-handbook 的迁移基线](https://github.com/duyiliu/ai-dev-handbook/tree/8a60811d76ba4d4dea1528bb5cdc855e1f636d01/skills/engineering)
- 来源提交：`8a60811d76ba4d4dea1528bb5cdc855e1f636d01`
- 核对日期：2026-10-07
- 适用范围：跨项目；Ext Plus 规则仅适用于采用该框架的项目。
- 可信度：高（Handbook 迁移内容按指定提交保存；本仓库新增技能单独维护）。

## 任务路由

先判断任务性质，不让两套工作流互相抢职责：

```text
企业确定性需求 / 会改变高成本契约
  → task-design → 人工确认 → task-execution

短小、低风险、可逆修改
  → 直接完成；需要持续状态时再用 task-execution

不改变高成本契约的 Bug / 根因调查 / 性能 / 重构专项
  → 可用 goals/ 下对应 goal-*

模糊探索 / UI 体验持续打磨 / “更高级、更好玩”
  → goal-polish（仅显式调用进入长循环）
```

**任何会改变高成本契约的任务，都必须回到 `task-design`；Goal 工作流不能绕过设计 Review + 人工确认闸门。**

## 日常研发主流程

```text
用户给目标
  → task-design（仅在值得先设计时）
  → Design Review（优先 independent；不可用则 same-context）
  → AI 修订到 PASS
  → 阻塞确认项清零
  → 用户确认 design.md（默认人工闸门）
  → task-execution
  → AC → Tasks 覆盖检查
  → 连续实现 / 确定性验证
  → Implementation Review（优先 independent；不可用则 same-context）
  → 未通过则返工回 tasks.md
  → PASS 后交给用户最终验收
```

默认单 Agent，只有独立任务收益明确、读写边界可隔离且能分别验证时才按需委派；Builder 负责最终集成与验证，Reviewer 保持独立优先，不固定 Agent 数量。运行器不支持委派时按原流程单 Agent 完成。

默认不需要 Hermes。设计确认后，`task-execution` 在当前运行中可以连续推进；`design.md + tasks.md` 负责跨会话恢复。

只有需要进程自动拉起、跨机器无人值守、定时恢复或多执行器并行时，再增加 Hermes / 外部 orchestrator；任务协议不变。

## 与 Goal Skills 的边界

`goal-feature` 已移除。新功能不再走另一套 Feature Goal：

```text
确定性新功能
→ task-design
→ 用户确认
→ task-execution
```

`goal-fix / goal-refactor / goal-performance / goal-investigate` 用于不改变高成本契约的专项任务；`goal-polish` 用于主观、反复迭代的体验打磨。

## 仓库内技能

- [task-design](task-design/SKILL.md) — 判断是否值得先设计；建立 AC、完成设计 Review，并在实施前等待用户确认
- [task-execution](task-execution/SKILL.md) — 将已确认 design / 目标转成 `tasks.md`，维护代码基线与 AC 覆盖，持续实现、验证、Review 和返工
- [ai-test-checkpoints](ai-test-checkpoints/SKILL.md) — AI 通用测试检查点：跨项目 Web 管理系统的 12 维度黑盒测试检查清单

## 已整合并在本仓库维护的工程 Skill

- [git-commit](git-commit/SKILL.md) — 原子提交、提交消息、暂存与推送流程
- [ext-plus-backend-dev-rules](ext-plus-backend-dev-rules/SKILL.md) — Ext Plus 后端规范，包含 7 份 references
- [work-convention](work-convention/SKILL.md) — `work/` 研发资料存放、分层与生命周期；design 保存稳定基线，tasks 保存动态执行状态

## 职责边界

- `task-design`：想清楚并把高成本契约变成可确认、可验收的 design；Review 是其内部能力
- `work-convention`：资料放哪里、各文件职责和生命周期
- `task-execution`：只在“设计审查 PASS + 阻塞确认项为 0 + 人工已确认”后拆任务、实现、验证和 Review
- Reviewer 的“独立”是优先级，不是硬依赖；无法独立时降级 same-context 并明确记录
- commit / push / deploy / 生产写入等外部动作不由 task-execution 自动授权

具体技术栈、数据库、API、错误码、权限和目录风格仍以当前项目规则和现有实现为准。

## 使用与更新

归档副本不会自动成为客户端的已安装 Skill。复用时复制完整技能目录，保留相对引用；执行时以用户指令及项目规则为准。

后续技能更新只修改本仓库；Handbook 仅保留历史提交供溯源，不再作为更新来源。
