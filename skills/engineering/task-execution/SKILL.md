---
name: task-execution
description: 将已确认设计或明确工程交付目标转成 tasks.md，连续实现、真实验证、对抗式审查和返工。高成本契约先经 task-design 审查与人工确认；专项修复、只读调查、行为不变重构和指标型优化仍走对应 goal-*。
---

# Task Execution

## 入口闸门

- 按交付性质路由，不因任务长就接管 `goal-fix`、`goal-investigate`、`goal-refactor`、`goal-performance`。
- 先读取项目规则、现有实现、已有 `design.md` / `tasks.md` 和可用的 `work-convention`。
- 任务触发 `task-design` 时，必须同时满足：`设计审查 = PASS`、`阻塞确认项 = 0`、`设计确认 = 已确认`；否则**不得生成 tasks.md 或修改业务代码**，返回设计审查/用户确认。
- 用户只要求设计则不进入执行；用户附条件改变高成本契约的“确认”不是有效确认。
- 不涉及高成本设计的明确工程交付可以直接执行，不强制补造 `design.md`。

## 任务与代码基线

- 持续任务维护 `tasks.md`；优先项目约定，否则 `work/任务/<任务名>/tasks.md`，创建时读取 `templates/tasks-template.md`。
- 修改代码前尽量记录 branch、起始 HEAD、已有工作区修改；不得 reset/checkout/revert 用户原有修改，也不能把既有改动误算为本任务成果。
- 按可独立交付、验证的能力单元拆任务，不按 Controller/Service/Mapper 层拆；每项写目标、依赖、验收、验证方法、状态。
- 有设计时，每个 `ACxx` 至少被任务或最终核验覆盖；验收与已确认设计不得冲突。无设计时也要有可观察的完成标准。
- 状态限定 `pending / in_progress / blocked / done`，进展仅写 `tasks.md`；默认同一时刻一个 in_progress。
- 默认单 Builder；仅对依赖满足、文件/共享状态不冲突、可独立验证的任务按需并行。主 Agent 负责集成，不信任子 Agent 的完成自报。

## 执行循环

1. 选择依赖已满足的 pending，标记 in_progress，读取相关代码后实施。
2. 运行与验收对应的确定性验证：编译、单测、API/场景测试、约束检查等；不得仅凭代码观感或自报标 done。
3. 验证失败时依据实际错误修复并复验；连续三次没有新证据仍失败，停止盲目重试，记录原因并标 blocked。
4. 验收通过后标 done，记录关键验证证据；自动选择下一项，不因类、SQL、DTO 等低成本选择中断。
5. 环境无法运行关键验证时，明确写出未验证范围，不得宣称对应 AC 已通过。

## 阻塞与设计变化

- 仅在核心业务规则缺失、不可兼容方案无法判断、必要授权/凭据、生产或不可逆风险、环境阻止必要验证时请求用户决策。
- 若实现需要改变核心业务流程/状态、DB Schema、公共 API、权限、消息、迁移/兼容、并发/幂等/事务边界：暂停受影响任务；更新 `design.md` 并重置审查/确认，回到 `task-design`。
- 设计复审 PASS、阻塞项清零且用户重新确认后，更新受影响任务及 AC 覆盖关系，才能继续；低成本实现细节不重走设计闸门。

## 对抗式实现审查

- 所有普通任务 done 后**必须**执行 Implementation Review；优先独立只读 Reviewer，不可用则 same-context 审查，记录 `实现审查模式：independent | same-context`；不能伪称独立。
- Reviewer 不修改业务代码；依据已确认设计、AC、任务前基线、当前 diff 和真实测试结果寻找反证，而非相信 Builder 自报。
- 重点检查非法状态、失败路径、权限绕过、幂等/并发/事务、旧数据/API 兼容、范围污染、测试假阳性及遗漏的 AC。
- Findings 按 `Critical / High / Medium / Low` 分级，记录证据位置、影响和验证建议；Critical/High 阻塞交付，Medium/Low 记录但默认不阻塞。
- FAIL 时将阻塞 finding 加入 `tasks.md` 作为返工任务，Builder 修复、复验、复审；**最多自动返工 3 轮**，仍 FAIL 则 blocked，保留问题与证据。
- PASS 必须同时满足：Critical = 0、High = 0、全部 AC 有真实通过证据、必要构建/测试通过、没有已知设计违约。无法验证时不得伪称 PASS。

## 完成与恢复

- 只有全部非阻塞任务 done、关键验证通过、AC 覆盖成立、最终 Review PASS，才能报告交付完成；列明审查模式、证据与遗留 Medium/Low。
- 中断恢复时读取规则、设计、任务和 Git 状态，核对已有修改与当前实现；旧 in_progress 需要重新验证，不信任历史状态。
- `tasks.md` 用于状态恢复，不意味着 Skill 能自行重启已退出的进程；不在本 Skill 规定外部编排工具。
- 不擅自 commit、push、deploy、写生产/共享数据、使用凭据或执行不可逆操作；遵守项目授权与用户明确许可。
