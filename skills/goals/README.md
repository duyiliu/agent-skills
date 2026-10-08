# Goal Skills

跨工具复用的专项 / 探索型长任务 Skill。按“能力”归类，不归属于 Codex、Claude Code 或其他单一客户端。

## Skill 列表

| Skill | 默认意图 | 触发建议 |
|---|---|---|
| `goal-fix` | Bug 根因与修复 | 自动 + 手动 |
| `goal-refactor` | 保持行为稳定的重构 | 自动 + 手动 |
| `goal-performance` | 基于测量的性能优化 | 自动 + 手动 |
| `goal-investigate` | 根因调查 | 自动 + 手动 |
| `goal-polish` | UI、交互和游戏手感的体验打磨 | **仅手动进入长循环** |

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
- UI、交互、游戏手感等主观持续打磨需要显式进入 `goal-polish`；普通一次性修改仍按有边界的任务处理
- 小改动不要因为匹配到关键词就进入 Goal 长循环
- 任一 Goal 执行中如果发现必须改变高成本契约，立即回到 `task-design`

## 触发模型

Skill 核心描述只说明“什么时候适用”，不在正文绑定某个客户端的命令语法。

- 自动触发：运行器根据 Skill description 判断任务匹配
- 手动触发：用户使用当前运行器提供的 Skill 调用方式
- Skill 内迭代：在当前会话按证据循环，不隐含持久任务、后台进程或自动重启。无人值守、跨会话恢复或跨机器调度需另配 Pi Goal / Hermes 等编排工具

`goal-fix / goal-refactor / goal-performance / goal-investigate` 默认允许自动 + 手动。

`goal-polish` 是一个明确的 **Mode Skill**：只有用户显式调用时才进入持续迭代。单纯说“把页面优化一下”不会自动进入长循环。

## 运行器适配

### Codex

Codex 的显式调用示例：

```text
$goal-polish 把当前工作台持续打磨到成熟商业 SaaS 水准
```

`goal-polish/agents/openai.yaml`：

```yaml
policy:
  allow_implicit_invocation: false
```

用于禁止 Codex 隐式选择该 Skill；不能据此假定特定 Codex 版本、入口的显式调用必然可靠。

### Claude Code

Claude Code 的显式调用示例：

```text
/goal-polish 把当前工作台持续打磨到成熟商业 SaaS 水准
```

`goal-polish/SKILL.md` frontmatter：

```yaml
disable-model-invocation: true
```

用于禁止 Claude 自动选择该 Skill。

### Codex 安装兼容

本仓库源文件保留 Claude Code 的 `disable-model-invocation` 扩展；Codex 安装副本应移除这个 Claude 专用字段，同时保留 `agents/openai.yaml`：

```powershell
$src = ".\skills\goals"
$dst = "$HOME\.codex\skills"

"goal-fix","goal-refactor","goal-polish","goal-performance","goal-investigate" |
  ForEach-Object {
    Copy-Item "$src\$_" "$dst\$_" -Recurse -Force
  }

$polish = Join-Path $dst "goal-polish\SKILL.md"
(Get-Content $polish) |
  Where-Object { $_ -notmatch '^disable-model-invocation:\s*true\s*$' } |
  Set-Content $polish -Encoding utf8
```

这样同一份能力定义仍然复用，只在安装层处理运行器扩展差异。

**Codex 显式调用验证：** 安装后在真实 Codex 对话中输入小写规范名 `$goal-polish`，确认 Skill 正文确实加载，而不只是显示文字。已知某些版本的 `$` 选择器会提交带大写的显示名，导致大小写不匹配；此时优先手动输入小写名。`codex debug prompt-input` 不经过完整的 turn-time Skill 注入流程，不能单独用来判断调用失败。参见 [Codex #40600](https://github.com/openai/codex/issues/40600) 和 [#43727](https://github.com/openai/codex/issues/43727)。

若所在入口仍不能显式加载，明确报告本次为兼容性受限，可在对话中**手动读取并遵循** `goal-polish/SKILL.md`（不宣称已通过 Skill 机制调用）；不要悄悄移除 `allow_implicit_invocation: false`，以免无意启用自动选择。

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
