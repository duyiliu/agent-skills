# Agent Skills 回归验证

本目录包含无需模型密钥、不会写业务仓库的确定性 Smoke Tests，以及真实 Agent 行为评估用例。

运行：node --test tests/skills-contract.test.mjs

## 覆盖范围

- Skill 名称/frontmatter、references 与 templates 实际存在。
- design 人工确认闸门、execution 审查与验证条件，以及原 work-convention 迁移后的文件结构。
- 在操作系统临时目录中真实调用 Codex / Claude Skill 安装器并执行 --check；测试结束后清除临时目录。
- agent-eval-cases.json 定义 10 个真实 Agent 路由与执行验收场景，CI 只检查用例定义。

## 真实 Agent 行为验收（尚未自动化）

选择真实 Codex/Claude/Pi 客户端，将 Skills 安装到隔离目录，在临时示例仓库中逐条执行 agent-eval-cases.json 的 prompt，记录：

1. 实际触发的 Skill、实际生成的文件与 diff。
2. 是否未经确认进入实现，是否生成多余文档，是否重复无意义 Review。
3. 是否真的编译、测试或执行场景，而不是仅自称通过。
4. 是否保留原始运行证据、隔离任务副作用。

**CI 绿色不代表 Agent 路由准确率、实现质量或模型行为测试通过。** 避免在真实业务仓库中直接运行可能修改/删除文件的用例。
