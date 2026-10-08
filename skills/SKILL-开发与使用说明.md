# Skill 开发与使用说明

本文是 本仓库 Skill 的统一开发、组织、触发和使用约定。目标不是把所有开发动作都做成 Skill，而是把真正可复用、可稳定触发、能明显改善 Agent 行为的工作流沉淀下来。

## 1. Skill 是什么

Skill 是给 AI Agent 使用的可复用工作规程。

最小结构：

~~~text
<skill-name>/
└── SKILL.md
~~~

复杂 Skill 可以增加：

~~~text
<skill-name>/
├── SKILL.md
├── references/      # 详细规范、知识、判定规则
├── templates/       # 稳定输出模板
├── scripts/         # 必要的确定性脚本
└── agents/          # 特定运行器适配
~~~

本仓库按能力组织 Skill，不按 Codex / Claude Code / Kilo 等运行器组织：

~~~text
skills/
├── engineering/     # 确定性研发流程、工程规则
└── goals/           # 专项问题、探索型或长循环工作流
~~~

## 2. 什么时候应该做成 Skill

适合沉淀为 Skill：

- 同一类任务会反复出现；
- Agent 容易遗漏关键步骤；
- 有稳定的方法、边界、验证方式或停止条件；
- 需要跨项目复用；
- 需要稳定自动触发，或需要一个明确的手动工作模式；
- 单靠一句 prompt 很容易执行漂移。

不适合做成 Skill：

- 只会出现一次的任务；
- 单文件、小范围、低风险修改；
- 普通字段、SQL、配置、文案修改；
- 只是为了分类好看而拆分；
- 已经被现有 Skill 清楚覆盖；
- 某次任务的过程记录。

> 复杂任务靠工作流，专项问题靠 Goal，小事直接做。

新增 Skill 前先问：如果没有这个 Skill，现有 Skill + 项目规则是否已经能稳定完成？如果答案是能，通常不要新增。

## 3. SKILL.md 基本结构

推荐最小结构：

~~~yaml
---
name: goal-fix
description: Diagnose and repair a specific bug or regression using evidence and focused verification.
---

# Goal Fix

## Approach
...

## Completion
...
~~~

### 3.1 name

- 稳定、简短、表达能力；
- 不绑定运行器；
- 除非本身就是项目/技术栈专用 Skill，否则不要绑定项目名。

示例：`task-design`、`task-execution`、`goal-fix`、`goal-investigate`、`goal-performance`。

### 3.2 description

`description` 同时承担两件事：告诉 Agent 这个 Skill 做什么，以及什么时候应该使用。

自动触发型 Skill 必须把边界写清楚，避免互相抢任务。手动 Mode Skill 应明确写成 manual-invocation mode。

不要写成 `Helps with development.` 这类无法形成可靠路由的描述。

### 3.3 正文

正文优先只保留真正改变执行行为的内容：

- 适用边界；
- 核心步骤；
- 证据/验证；
- 停止条件；
- 风险和副作用边界；
- 与其他 Skill 的切换条件。

大量细节下沉到 `references/`，不要把 `SKILL.md` 写成长篇知识文章。

## 4. 自动触发与手动触发

本仓库不自造 `trigger: auto` / `trigger: manual` 字段，触发由运行器决定。

### 4.1 自动 + 手动

适合方法型 Skill：

~~~text
goal-fix
goal-investigate
goal-refactor
goal-performance
task-design
task-execution
~~~

Agent 可以根据 description 自动选择，用户也可以显式调用。

### 4.2 仅手动

适合进入一种特殊工作模式的 Skill。当前典型是 `goal-polish`。

它表示：

~~~text
检查 → 找最高价值问题 → 修改 → 重新观察 → 再判断 → 持续迭代 → 达到停止条件
~~~

因此只有用户明确进入该模式时才启动长循环。

### 4.3 内部能力

不是所有流程都需要单独 Skill。Design Review、Implementation Review、AC coverage 都属于 `task-design / task-execution` 的内部能力，不再拆独立 Skill。

## 5. Codex 与 Claude Code 适配

> Skill 按能力组织；运行器差异只做最小适配。

### 5.1 Codex

Codex 一般允许符合策略的 Skill 被隐式选择，也支持显式调用；仅手动 Skill 在具体版本与入口需实际验证，而不是仅凭配置推断。

显式调用示例：

~~~text
$goal-fix 修复第二次请求拿不到变量的问题
~~~

只允许手动进入的 Skill 使用 `agents/openai.yaml`：

~~~yaml
policy:
  allow_implicit_invocation: false
~~~

### 5.2 Claude Code

Claude Code 默认允许自动 + 手动调用。

显式调用示例：

~~~text
/goal-fix 修复第二次请求拿不到变量的问题
~~~

只允许用户手动调用：

~~~yaml
disable-model-invocation: true
~~~

当前 `goal-polish/SKILL.md` 使用该字段。

### 5.3 当前兼容策略

本仓库源码中，`goal-polish` 同时保存 Claude 的 frontmatter 限制和 Codex 的 `agents/openai.yaml`。安装到 Codex 时，对安装副本移除 Claude 专用的 `disable-model-invocation` 字段，核心工作流仍只维护一份。

在真实 Codex 对话中用小写规范名 `$goal-polish` 验证是否加载；有版本报告称 `# Skill 开发与使用说明

本文是 本仓库 Skill 的统一开发、组织、触发和使用约定。目标不是把所有开发动作都做成 Skill，而是把真正可复用、可稳定触发、能明显改善 Agent 行为的工作流沉淀下来。

## 1. Skill 是什么

Skill 是给 AI Agent 使用的可复用工作规程。

最小结构：

~~~text
<skill-name>/
└── SKILL.md
~~~

复杂 Skill 可以增加：

~~~text
<skill-name>/
├── SKILL.md
├── references/      # 详细规范、知识、判定规则
├── templates/       # 稳定输出模板
├── scripts/         # 必要的确定性脚本
└── agents/          # 特定运行器适配
~~~

本仓库按能力组织 Skill，不按 Codex / Claude Code / Kilo 等运行器组织：

~~~text
skills/
├── engineering/     # 确定性研发流程、工程规则
└── goals/           # 专项问题、探索型或长循环工作流
~~~

## 2. 什么时候应该做成 Skill

适合沉淀为 Skill：

- 同一类任务会反复出现；
- Agent 容易遗漏关键步骤；
- 有稳定的方法、边界、验证方式或停止条件；
- 需要跨项目复用；
- 需要稳定自动触发，或需要一个明确的手动工作模式；
- 单靠一句 prompt 很容易执行漂移。

不适合做成 Skill：

- 只会出现一次的任务；
- 单文件、小范围、低风险修改；
- 普通字段、SQL、配置、文案修改；
- 只是为了分类好看而拆分；
- 已经被现有 Skill 清楚覆盖；
- 某次任务的过程记录。

> 复杂任务靠工作流，专项问题靠 Goal，小事直接做。

新增 Skill 前先问：如果没有这个 Skill，现有 Skill + 项目规则是否已经能稳定完成？如果答案是能，通常不要新增。

## 3. SKILL.md 基本结构

推荐最小结构：

~~~yaml
---
name: goal-fix
description: Diagnose and repair a specific bug or regression using evidence and focused verification.
---

# Goal Fix

## Approach
...

## Completion
...
~~~

### 3.1 name

- 稳定、简短、表达能力；
- 不绑定运行器；
- 除非本身就是项目/技术栈专用 Skill，否则不要绑定项目名。

示例：`task-design`、`task-execution`、`goal-fix`、`goal-investigate`、`goal-performance`。

### 3.2 description

`description` 同时承担两件事：告诉 Agent 这个 Skill 做什么，以及什么时候应该使用。

自动触发型 Skill 必须把边界写清楚，避免互相抢任务。手动 Mode Skill 应明确写成 manual-invocation mode。

不要写成 `Helps with development.` 这类无法形成可靠路由的描述。

### 3.3 正文

正文优先只保留真正改变执行行为的内容：

- 适用边界；
- 核心步骤；
- 证据/验证；
- 停止条件；
- 风险和副作用边界；
- 与其他 Skill 的切换条件。

大量细节下沉到 `references/`，不要把 `SKILL.md` 写成长篇知识文章。

## 4. 自动触发与手动触发

本仓库不自造 `trigger: auto` / `trigger: manual` 字段，触发由运行器决定。

### 4.1 自动 + 手动

适合方法型 Skill：

~~~text
goal-fix
goal-investigate
goal-refactor
goal-performance
task-design
task-execution
~~~

Agent 可以根据 description 自动选择，用户也可以显式调用。

### 4.2 仅手动

适合进入一种特殊工作模式的 Skill。当前典型是 `goal-polish`。

它表示：

~~~text
检查 → 找最高价值问题 → 修改 → 重新观察 → 再判断 → 持续迭代 → 达到停止条件
~~~

因此只有用户明确进入该模式时才启动长循环。

### 4.3 内部能力

不是所有流程都需要单独 Skill。Design Review、Implementation Review、AC coverage 都属于 `task-design / task-execution` 的内部能力，不再拆独立 Skill。

## 5. Codex 与 Claude Code 适配

> Skill 按能力组织；运行器差异只做最小适配。

### 5.1 Codex

Codex 一般允许符合策略的 Skill 被隐式选择，也支持显式调用；仅手动 Skill 在具体版本与入口需实际验证，而不是仅凭配置推断。

显式调用示例：

~~~text
$goal-fix 修复第二次请求拿不到变量的问题
~~~

只允许手动进入的 Skill 使用 `agents/openai.yaml`：

~~~yaml
policy:
  allow_implicit_invocation: false
~~~

### 5.2 Claude Code

Claude Code 默认允许自动 + 手动调用。

显式调用示例：

~~~text
/goal-fix 修复第二次请求拿不到变量的问题
~~~

只允许用户手动调用：

~~~yaml
disable-model-invocation: true
~~~

当前 `goal-polish/SKILL.md` 使用该字段。

### 5.3 当前兼容策略

 选择器的显示名大小写会影响匹配，`codex debug prompt-input` 也不能代替真实回合验证。详情及不解除手动限制的降级方案见 [goals/README.md](goals/README.md)。

## 6. 当前 Skill 路由

~~~text
小而明确、低风险、可逆
→ 直接做

完整业务需求 / 高成本契约变化
→ task-design
→ 用户确认
→ task-execution

Bug 修复
→ goal-fix

只要求查原因、不要求修改
→ goal-investigate

调查并修复
→ goal-fix

行为不变的结构优化
→ goal-refactor

性能问题
→ goal-performance

UI / 交互 / 游戏手感持续打磨
→ 显式 goal-polish
~~~

主 Skill 由任务性质决定，不能因为 Bug 修复、专项性能或重构需要多轮，就自动改由 `task-execution` 主导。需要跨步骤记录可在当前工作流维护任务状态；跨会话自动运行另需编排器。

高成本契约包括：核心业务流程/状态机、DB Schema/核心模型、公共 API、权限、消息/事件、迁移/兼容、并发/幂等/事务、多系统协作关系。

> 高成本契约前置，低成本实现细节渐进。

## 7. Engineering 主流程

### 7.1 task-design

负责判断是否值得先设计、建立唯一 `design.md`、明确高成本契约、建立 AC、执行 Design Review，并在 Review PASS 后等待用户确认。

~~~text
用户给目标
→ AI 起草 design.md
→ Design Review
→ AI 修订
→ Review PASS
→ 阻塞确认项清零
→ 用户确认
~~~

用户确认之前不进入实现。

### 7.2 task-execution

~~~text
design.md
→ tasks.md
→ AC 覆盖检查
→ 实现
→ 确定性验证
→ 下一任务
→ Implementation Review
→ 自动返工
→ PASS
→ 用户最终验收
~~~

默认不要求用户逐 Task 确认。只有高成本契约变化、缺失关键业务规则、权限/凭据、不可逆动作等真正阻塞才重新找用户。

### 7.3 work-convention

只负责 `design.md / tasks.md` 的位置、职责和生命周期，不重复定义设计方法和执行算法。

## 8. Goal Skills

- `goal-fix`：尽量按“修前复现 → 根因 → 最小修复 → 同条件复验”闭环。
- `goal-investigate`：只读；只要求解释时调查，要求“调查并修复”时直接交给 `goal-fix`。
- `goal-refactor`：保持外部行为不变，改善内部结构。
- `goal-performance`：基线 → profile → 修改 → 回归正确性验证 → 同条件重新测量；没有可比测量或回归未通过，不宣称优化完成。
- `goal-polish`：显式 Mode Skill；观察真实 UI / 游戏操作效果 → 找最高价值问题 → 修改 → 再观察 → 持续收敛。

任一 Goal 如果发现必须改变高成本契约，立即回到 `task-design`。

Goal Skill 只定义当前会话中的方法、证据、停止条件；并不赋予持久后台执行能力。Pi Goal / Hermes 等外部编排器负责跨会话恢复、重启和无人值守调度，按需使用，非默认依赖。

## 9. 多 Agent 使用约定

- 默认单 Agent；并行是任务级优化，不是 Goal Skill 必须启动的模式。
- 只有独立且边界清楚的调查、评审或实现适合委派；只读任务优先，避免并发编辑同一文件或共享状态。
- Skill 规定默认协作原则及停止条件，用户提示词只说明本次特殊偏好，运行器负责实际启动子 Agent；不要写死 Agent 数量。
- Builder / 主 Agent 负责整合、冲突处理及最终验证；审查优先独立，不支持多 Agent 时单 Agent 降级，不额外增加新的编排 Skill。
- `task-execution` 允许少量独立 Task 并行，但仍需明确读写范围、记录状态并通过集成验证；设计确认和权限边界不能绕过。

## 10. 副作用边界

进入 Skill 不等于获得所有操作权限。

默认允许：读取代码、本地修改、安全的本地验证、创建当前任务需要的本地过程文件。

默认不自动授权：commit、push、deploy/release、生产或共享数据写入、凭据使用、不可逆外部动作。

权限来自项目已有明确规则或用户明确授权。

## 11. references、templates、scripts、agents

### references/

放详细规范、判定规则、大量背景知识、技术栈约定。`SKILL.md` 负责导航和执行，references 负责深度。

### templates/

只有 Skill 需要稳定生成/维护某种文件时才建立模板。一个主题只保留一个权威模板。

当前示例：

~~~text
task-design/templates/design-template.md
task-execution/templates/tasks-template.md
work-convention/templates/决策模板.md
~~~

### scripts/

仅用于确定性检查、重复机械操作、纯 prompt 容易出错且脚本明显更可靠的事情。不要为了显得工程化强行加脚本。

### agents/

放运行器专属适配。当前示例：`goal-polish/agents/openai.yaml`。

不要复制成 `skills/codex/`、`skills/claude/` 两套业务 Skill。

## 12. 新 Skill 开发流程

~~~text
1. 发现重复问题
2. 确认现有 Skill 无法稳定覆盖
3. 明确输入、边界、输出、停止条件
4. 决定自动 / 手动 / Mode
5. 写 name + description
6. 写最小 SKILL.md
7. 必要时增加 references / templates / scripts / agents
8. 用真实任务跑
9. 修正触发冲突和遗漏
10. 更新 README 路由
~~~

不要先写一个很大的 Skill 再找使用场景。

## 13. Skill 设计检查清单

- [ ] 是否真的需要 Skill，而不是直接做？
- [ ] 与现有 Skill 是否职责重叠？
- [ ] name 是否稳定、按能力命名？
- [ ] description 是否说明“做什么 + 何时用”？
- [ ] 自动触发边界是否足够窄？
- [ ] Mode Skill 是否明确只手动进入？
- [ ] 是否定义停止条件？
- [ ] 是否定义验证/证据？
- [ ] 高成本契约变化时是否会切回 task-design？
- [ ] 是否有副作用权限边界？
- [ ] 大量细节是否下沉到 references？
- [ ] 是否重复维护模板？
- [ ] 运行器差异是否隔离到最小范围？
- [ ] README 路由是否同步更新？
- [ ] 是否至少经过一个真实任务验证？

## 14. 安装与使用

### Codex

用户级 Skill 目录：`~/.codex/skills/`。

示例：

~~~powershell
Copy-Item ".\skills\engineering\task-design" "$HOME\.codex\skills\task-design" -Recurse -Force
Copy-Item ".\skills\engineering\task-execution" "$HOME\.codex\skills\task-execution" -Recurse -Force
~~~

Goal Skills 的 Codex 安装和 `goal-polish` 兼容处理见 `skills/goals/README.md`。

### Claude Code

项目级通常放到 `.claude/skills/<skill-name>/`，用户级通常放到 `~/.claude/skills/<skill-name>/`。

复制完整 Skill 目录，不要只复制 `SKILL.md`，否则 references/templates/agents 可能丢失。

## 15. 日常使用示例

新功能：

~~~text
增加退款申请功能
→ task-design → Design Review → 用户确认 → task-execution
~~~

Bug：

~~~text
第二次请求偶发拿不到第一步提取的变量，修一下
→ goal-fix
~~~

调查：

~~~text
查清为什么 Node runtime 和浏览器 runtime 结果不一致
→ goal-investigate
~~~

UI 一次性修改：

~~~text
这个按钮间距调小一点
→ 直接做
~~~

UI 持续打磨：

~~~text
Codex:      $goal-polish 把工作台持续优化到成熟商业 SaaS 水准
Claude Code: /goal-polish 把工作台持续优化到成熟商业 SaaS 水准
~~~

## 16. 当前原则

> 按能力分类，不按工具分类。

> 自动触发的是方法，手动触发的是特殊工作模式。

> 人确认做什么、边界是什么；AI 决定具体怎么把它做出来。

> 高成本契约前置，低成本实现细节渐进。

> 能直接做的事情不要强行进入 Skill。

> 没有真实重复问题，就不要继续新增 Skill。
