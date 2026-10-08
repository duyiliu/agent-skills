---
name: task-execution
description: 将已确认的设计或明确的工程交付目标拆为 tasks.md，持续实现、真实验证、对抗式审查和返工。高成本契约变更必须先经 task-design 审查与人工确认；专项修复、只读调查、行为不变重构和指标型优化仍走对应 goal-*。
---

# Task Execution

## 入口检查

- 按交付性质路由，不因任务长就接管 `goal-fix`、`goal-investigate`、`goal-refactor`、`goal-performance`。
- 读取项目规则、现有实现、已有 `design.md` / `tasks.md` 及可用的 `work-convention`。
- 涉及高成本契约或完整业务设计时先走 `task-design`；只有设计审查 PASS、阻塞确认项为零且用户已明确确认，才允许生成任务和修改业务代码。
- 用户只要求设计时停止；用户的附条件确认若改变契约，必须回到设计审查。

## 建立任务与基线

- 持续工程任务使用 `tasks.md`，默认 `work/任务/<任务名>/tasks.md`，遵循项目约定；创建时读取 `templates/tasks-template.md`。
- 尽量记录 branch、起始 HEAD 和任务前已有工作区修改；不得 reset、checkout 或 revert 用户原有修改来清理 diff。
- 按可独立验收的能力拆分，不按 Controller / Service / Mapper 层拆；任务记录目标、依赖、验收、验证方法和状态。
- 有 `design.md` 时每个 `ACxx` 必须由任务或最终核验覆盖；任务验收不得违背设计。
- 状态仅为 `pending / in_progress / blocked / done`，动态进展只写 `tasks.md`，不回填 `design.md`。

## 实现与验证循环

1. 选择依赖已满足的 pending 任务，标为 in_progress；先读相关代码，再做范围内的实现。
2. 运行适用的确定性检查：编译、测试、API/场景测试、约束检查等；不能以“看起来正确”或子 Agent 自报代替真实结果。
3. 失败则依据新证据修复、复验；连续三次无新证据的盲目重试应停止并标为 blocked。
4. 验收满足且验证通过才标记 done，并记录关键证据；自动推进下一项，不逐项请求用户批准。
5. 可并行处理真正独立且无文件/共享状态冲突的任务；默认单 Agent，主 Agent 负责集成与最终验证，不强制多 Agent 编排。

## 阻塞与设计偏差

- 仅在缺失核心业务规则、无法判断的不兼容方案、必要授权/凭据、不可逆或生产风险、环境阻止验证时中断请用户决策。
- 发现核心流程/状态、DB、公共 API、权限、消息、迁移/兼容、并发/幂等/事务等高成本契约必须变化时：暂停受影响任务，更新 `design.md`，重置审查与确认，返回 `task-design`；用户重新确认后同步调整任务和 AC 覆盖。
- 低成本实现细节可自行决定，无需更新设计或逐项确认。

## 对抗式实现审查

- 所有普通任务 done 后必须 Review；优先独立只读 Reviewer，不可用则同上下文审查，记录 `实现审查模式：independent | same-context`，不得伪装成独立评审。
- Reviewer 核对已确认设计、AC、任务前代码基线、当前 diff 和真实验证证据；重点查状态异常、权限、幂等/并发/事务、兼容、失败路径、回归及测试假阳性。
- Findings 分 Critical / High / Medium / Low，附证据；Critical/High 必须返工，Medium/Low 记录但默认不阻塞。
- FAIL 时将阻塞问题追加为返工任务，Builder 修复、复验、复审；最多自动返工 3 轮，仍 FAIL 则 blocked 并保留证据。
- PASS 要求 Critical = 0、High = 0、全部 AC 有真实通过证据、必要构建/测试通过，且无已知设计违约。

## 完成、恢复与权限

- 交付前确认任务状态、AC 覆盖、真实验证及最终 Review PASS；报告完成内容、设计/任务文档、审查模式、遗留问题。
- 中断恢复时先读取项目规则、设计、任务和当前 Git 状态；复核旧 in_progress 的实际代码与验证，不信任历史自报。
- 不擅自 commit、push、deploy、写入生产/共享数据、使用凭据或执行不可逆操作；遵守项目既有授权及用户明确许可。
