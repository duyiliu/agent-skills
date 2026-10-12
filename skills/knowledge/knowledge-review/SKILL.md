---
name: knowledge-review
description: Audit an existing Markdown knowledge base for duplicated, conflicting, stale, unsupported, or misplaced knowledge and propose evidence-based corrections. Use only when the user explicitly asks for knowledge review, cleanup, deduplication, or a periodic audit; do not trigger for ordinary note lookup or general code review.
---

# Knowledge Review

只审查长期知识的质量；不替代 knowledge 的日常记录/检索，也不承担项目代码审查或持续后台任务。

## 范围与前提

- 使用 knowledge Skill 的**同一套知识库定位协议**：本次明确绝对路径 > KNOWLEDGE_HOME > 既有全局 LifeOS 路径（默认 D:\workspace\LifeOS）> 已验证的当前 LifeOS 根目录。
- 验证 Home.md 与既有 LifeOS 目录结构；未找到时不创建新仓库、不跨目录扫描个人磁盘。
- 默认只读；审查时不 checkout、reset、清空工作区、不修改项目仓库。
- 按用户限定的范围或最近发生变化的笔记开展；未给范围时，先从 30_资料/知识/ 的索引和高复用文档做小批量审查，不全库盲扫。

## 审查检查点

1. **重复**：标题不同但实质相同；区分真正重复与不同适用环境的合理分支。
2. **冲突**：同一主题的版本、路径、命令、架构决策不一致；优先检查来源、日期、运行环境和项目权威资料。
3. **时效**：软件版本、模型、价格、政策、接口等是否可能过期；能验证则给证据，不能联网或缺证据则标记“待验证”，禁止仅凭日期认定错误。
4. **可信度**：缺少来源、把推断写成事实、未实际测试却写成已验证、过于绝对的结论。
5. **归属和安全**：项目专属资料是否复制进 LifeOS；是否误包含凭据、密钥、个人/客户敏感信息。发现泄露风险先报告，避免在输出中复述秘密。
6. **索引和链接**：Home、目录 README、Obsidian wikilink 是否指向存在的文件；是否有孤立资料。不要为美观大规模重排目录。

## 工作流程

1. 确认审查范围，读取现有 Git 状态和相关索引、正文；记录候选问题的位置。
2. 每个问题用原文、仓库代码、明确日期或权威来源交叉核验；不能验证时降低置信度。
3. 按 P0（敏感泄露或严重误导）、P1（互相矛盾或明显过期）、P2（重复、索引问题）排序。
4. 输出紧凑审查表：路径、问题、证据、建议、可信度、是否需人工确认。没有足够证据的项不得标“已确认错误”。
5. **默认到此为止**。用户明确要求“审查并修复”时，可以修改高置信度且可逆的低风险文本/索引；删除、批量合并、改写重要决策仍需逐项确认。
6. 修改后重查引用与 diff，确保没有破坏链接、覆盖并发修改或引入新的矛盾。提交/推送规则遵循 knowledge 及仓库现有权限规则。

## 完成与停止条件

- 输出审查范围、已确认问题、待验证项、建议修订和实际改动（如有）。
- 没有问题时明确说明“在已审查范围内未发现”，不要声称全库无问题。
- 缺少知识库访问、来源核验能力、需要用户判断的决策取舍、Git 冲突或敏感数据风险时，停止相应操作并说明下一步。
- 不启动后台循环；定期审查只能由用户手动调用或外部已授权调度触发。
