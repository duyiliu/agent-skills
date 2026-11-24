---
name: knowledge
description: Search, capture, update, and maintain a user-designated generic Markdown knowledge base. Use when the user explicitly asks to save, remember, retrieve, or update reusable knowledge. Do not use for LifeOS, routine coding, simple file navigation, or project-specific documentation.
---

# Generic Markdown Knowledge

将 AI 作为用户指定 Markdown 知识库的维护助手；用户负责提出意图并确认关键事实与重大变更。

## 适用边界

- 本 Skill 只用于**非 LifeOS** 的通用 Markdown 知识库。
- 如果目标目录包含 Home.md、MEMORY.md、memory/README.md 和 tools/memory_search.py，应改用 LifeOS 仓库内的 lifeos Skill，不要在这里执行 LifeOS 操作。
- 普通代码项目的设计文档、接口契约和实现说明应留在项目仓库，不自动写入个人知识库。
- 不因普通对话、编程任务完成或 Agent 自己认为“有价值”就自动记录。

## 定位知识库

按以下顺序解析：

1. 用户本次明确指定的绝对路径。
2. 当前进程的 KNOWLEDGE_HOME 环境变量（必须解析为有效目录）。
3. 当前目录或其上级仅在用户明确指定它为知识库时使用。

验证目标目录存在且可访问；不猜测其他磁盘路径、不扫描整个用户目录、不隐式创建新知识库。找不到时询问用户，不要把笔记写入 Skill 仓库或当前代码仓库。

## 同步与安全

- 读取前先阅读目标知识库的 AGENTS.md、README 或其他项目约定。
- 若仓库定义了 Git 同步前置，严格遵循；若没有，不要假定分支名或自动修改工作区。
- 存在未解决冲突时停止。写入前检查目标文件是否有未提交修改，保留用户现场。
- 查询保持只读。不得因 Skill 本身自动 commit、push、stash、reset、rebase 或 force。
- 不记录密码、Token、私钥、Cookie、恢复码、完整账号凭据、客户敏感数据或未经授权的公司资料。

## 检索

1. 先查索引、文件名和关键词，再读取少量相关上下文。
2. 优先查原始事实源，不把搜索片段当成完整证据。
3. 回答时标注相对路径、来源和日期；区分已确认事实、推断与待验证信息。
4. 不将整个知识库注入每次会话，只取当前任务所需的最小上下文。

## 记录与更新

仅在用户明确要求记下、保存、更新，或明确授权某种自动归档流程时写入。

1. 检查是否已有同主题文档，优先更新或链接原文档，避免重复。
2. 记录最小必要内容，并保留来源、日期、适用范围和可信度。
3. 用户提出的想法、AI 建议和未经确认的推断不得改写为用户已决定的事实。
4. 重要决策发生变化时保留历史，并注明新旧记录之间的关系；不要悄悄覆盖。
5. 对重大改写、删除、批量合并或不确定的事实，先展示差异并取得用户确认。

## 完成报告

说明写入或更新的文件路径、来源和仍待确认的内容。只有在实际执行并验证后，才报告 commit 或 push 成功。
