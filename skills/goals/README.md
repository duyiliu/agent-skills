# Goal Skills

跨工具复用的专项 / 探索型长任务 Skill。按“能力”归类，不归属于 Codex、Claude Code 或其他单一客户端。

## Skill 列表

| Skill | 默认意图 | 触发建议 |
|---|---|---|
| `goal-fix` | Bug 根因与修复 | 仅手动 |
| `goal-refactor` | 保持行为稳定的重构 | 仅手动 |
| `goal-performance` | 基于测量的性能优化 | 仅手动 |
| `goal-investigate` | 根因调查 | 仅手动 |
| `goal-improve` | 自主发现问题、修改、验证、反复优化直到收敛 | 仅手动 |

`goal-feature` 已移除。确定性新功能统一走：

```text
task-design
→ Design Review
→ 用户确认
→ task-execution
```

这样不再维护两套互相重叠的新功能流程。

## 路由原则

- 企业确定性新功能、系统集成、DB / 公共 API / 权限 / 状态机等高成本契约变化 → `engineering/task-design + task-execution`
- 不改变高成本契约的 Bug 修复 / 只读调查 / 性能优化 / 行为不变重构 → 对应 `goal-*`；即使持续多轮也不因任务时长转交 `task-execution`
- 需要 Agent 自己找问题、决定每轮改什么并持续优化时，显式进入 `goal-improve`；UI、游戏、交互只是例子，普通一次性修改不进入自主循环
- 小改动不要因为匹配到关键词就进入 Goal 长循环
- 任一 Goal 执行中如果发现必须改变高成本契约，立即回到 `task-design`

## 触发边界（全部仅手动）

Goal Skill 一律**禁止自动触发**：各 `SKILL.md` frontmatter 已加 `disable-model-invocation: true`（Agent Skills 规范字段，Pi 等运行器强制隐藏；Codex 另有 `agents/openai.yaml` 的 `allow_implicit_invocation: false`），description 同时声明 Manual-invocation-only。只在用户显式调用时进入。

- 即使出现“为什么、调查、修复、优化、重构”等关键词，也直接按普通任务完成，不自动进入 Goal。
- 文件或目录从哪来、谁提交的、Git 历史、文档查找、普通代码定位 → 直接查文件 / Git / 文档。
- 用户显式调用具体 Skill 时，不以任务复杂度拒绝调用。
- 运行器对 description 的路由不再适用；显式调用是唯一入口。

## 触发模型

Skill 核心描述只说明“什么时候适用”，不在正文绑定某个客户端的命令语法。

- 自动触发：已禁用。所有 Goal Skill 通过 `disable-model-invocation: true`（及 Codex 的 `allow_implicit_invocation: false`）从自动模型选择中隐藏
- 手动触发：用户使用当前运行器的 Skill 调用方式，显式调用是唯一入口
- Skill 内迭代：在当前会话按证据循环，不隐含持久任务、后台进程或自动重启。无人值守、跨会话恢复或跨机器调度需另配 Pi Goal / Hermes 等编排工具

`goal-fix / goal-refactor / goal-performance / goal-investigate` 与 `goal-improve` 一致：仅手动。

`goal-improve` 是一个明确的**自主优化模式**：用户只给目标和边界，Agent 自己检查 → 找问题 → 计划 → 修改 → 测试 → 评审 → 继续，直到达到停止条件。只有用户显式调用时才进入；普通优化请求不会自动变成长循环。

## 运行器适配

### Codex

Codex 的显式调用示例：

```text
$goal-improve 把当前工作台持续打磨到成熟商业 SaaS 水准
```

`goal-improve/agents/openai.yaml`：

```yaml
policy:
  allow_implicit_invocation: false
```

用于禁止 Codex 隐式选择该 Skill；不能据此假定特定 Codex 版本、入口的显式调用必然可靠。

### Claude Code

Claude Code 的显式调用示例：

```text
/goal-improve 把当前工作台持续打磨到成熟商业 SaaS 水准
```

`goal-improve/SKILL.md` frontmatter：

```yaml
disable-model-invocation: true
```

用于禁止 Claude 自动选择该 Skill。

### 安装与一致性检查（Codex / Claude Code）

统一通过仓库脚本从**同一份源文件**生成运行器安装副本，避免手工复制时漏文件或忘记移除 Codex 不识别的 Claude 字段。无需额外 npm 包：

```powershell
node scripts/install-skills.mjs --runner codex
node scripts/install-skills.mjs --runner codex --check
node scripts/install-skills.mjs --runner claude
node scripts/install-skills.mjs --runner claude --check
```

默认安装到用户主目录的 `~/.codex/skills` 或 `~/.claude/skills`，也可使用 `--dest <路径>` 安装到临时目录进行检查。脚本只更新本仓库中同名 Skill 的文件，不删除旧文件或无关 Skill；如目标目录是未识别的已有目录则拒绝覆盖。

`goal-improve` 源文件保留 Claude 的 `disable-model-invocation: true` 与 Codex 的 `agents/openai.yaml`；安装 Codex 时只在副本删除 Claude 专用字段，且检查模式验证该适配。升级后重新运行安装脚本并在真实客户端验证显式调用；不能用脚本检查代替运行器的真实加载验证。

**Codex 显式调用验证：** 输入小写规范名 `$goal-improve`，确认 Skill 正文确实加载。已知部分版本 `$` 选择器显示名大小写可能不匹配；此时直接输入小写。见 [Codex #40600](https://github.com/openai/codex/issues/40600) 和 [#43727](https://github.com/openai/codex/issues/43727)。

## 多 Agent 协作原则

- 默认单 Agent，不固定子 Agent 数量，也不因使用 Goal Skill 自动开启多 Agent。
- 只有任务相互独立、可划清读写边界且收益明显时才按需委派；调查与评审优先只读，写入任务避免同时修改同一文件。
- 主 Agent 负责整合证据、处理冲突、执行最终验证与交付；运行器不支持委派时退回单 Agent。
- 用户提示词可提出本次并行 / 禁止并行偏好，Skill 定义默认策略与安全边界，实际调度能力由运行器决定。

## 共同行为边界

- 本地代码修改和安全的本地验证属于 Skill 正常工作范围。
- commit / push / deploy / release、生产或共享数据写入、凭据使用、不可逆外部动作，不因进入 Goal Skill 自动获得授权。
- `goal-investigate` 始终作为只读工作流；从一开始要求“调查并修复”则直接用 `goal-fix`，后续追加修复则先退出调查并切换工作流。
- `goal-fix` 能安全复现时，优先按“修前复现 → 修复 → 同条件复验”闭环。

## 使用原则

- 任务性质决定主 Skill，步骤数量只影响是否记录执行状态或使用外部编排器；不会因为修复、重构、性能任务变长就自动换成 `task-execution`。
- 简单的一次性修改，不必使用 Goal Skill。
- 需要多轮证据驱动推进时再进入对应 Goal。
- 不要为了保持循环而机械重复无效方案。
- 长任务的关键不是“持续做”，而是持续根据证据缩小与目标之间的差距。
