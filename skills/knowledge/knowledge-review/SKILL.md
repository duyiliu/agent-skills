---
name: knowledge-review
description: Audit a user-designated generic Markdown knowledge base for duplicated, conflicting, stale, unsupported, or misplaced knowledge. Use only when the user explicitly asks for review, cleanup, deduplication, or stale-note checks. Do not use for LifeOS or ordinary code review.
---

# Generic Knowledge Review

只审查用户指定的通用 Markdown 知识库质量；不替代日常检索/记录，也不承担项目代码审查或后台持续任务。

## 范围与前提

- 仅用于非 LifeOS 的通用 Markdown 知识库。
- 如果目标目录包含 Home.md、MEMORY.md、memory/README.md 和 tools/memory_search.py，应使用 LifeOS 仓库内的 lifeos Skill。
- 使用用户明确指定的绝对路径或 KNOWLEDGE_HOME；不要猜测路径、扫描整盘或隐式创建知识库。
- 开始前阅读目标库的 AGENTS.md、README 和现有审查约定。
- 默认只读；不得 checkout、reset、清空工作区、自动提交或修改项目仓库。
- 按用户指定范围或最近变更的小批量文件审查；不全库盲扫。

## 审查检查点

1. **重复**：标题不同但实质相同；区分真正重复与适用范围不同的合理分支。
2. **冲突**：同一主题的版本、路径、命令、结论不一致；优先核对来源、日期和适用环境。
3. **时效**：软件版本、价格、政策、接口等是否可能过期；不能验证时标记待验证，不仅凭日期认定错误。
4. **可信度**：缺少来源、把推断写成事实、未实际测试却写成已验证、表述过于绝对。
5. **归属与安全**：项目专属资料是否被不必要复制；是否包含凭据或敏感个人/客户数据。发现风险先报告，不复述秘密。
6. **索引与链接**：目录导航和相对链接是否有效；不为美观大规模重排。

## 工作流程

1. 确认审查范围和目标库当前状态；存在未解决冲突时停止。
2. 对每个候选问题查原文和可用证据；证据不足时降低置信度。
3. 按 P0（敏感泄露或严重误导）、P1（明显冲突或过期）、P2（重复、链接和索引问题）排序。
4. 输出路径、问题、证据、建议、可信度和是否需要人工确认。
5. 默认不修改。用户明确要求“审查并修复”时，只修复高置信度且可逆的小问题；删除、批量合并和重要结论改写仍需逐项确认。
6. 修复后重新检查链接和 diff，说明实际变更；没有实际执行就不声称已修复。

## 完成与停止条件

- 说明审查范围、已确认问题、待验证项和未覆盖范围。
- 没有发现问题时，只能说“在已审查范围内未发现”，不得声称全库无问题。
- 同步失败、目标库不可访问、存在冲突或缺乏证据时，停止相关操作并说明原因。
- 不启动后台循环；周期审查只能由用户手动或明确授权的调度触发。
