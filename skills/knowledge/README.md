# Generic Knowledge Skills

面向用户明确指定的、由 AI 维护的 Markdown 知识库。此目录只保存通用 Skill 源文件，不绑定某个固定仓库、目录结构或个人记忆模型。

- [knowledge](knowledge/SKILL.md) — 按需查找、记录、更新通用 Markdown 知识库。
- [knowledge-review](knowledge-review/SKILL.md) — 显式审查重复、矛盾、过期信息及链接问题；默认只读。

## 适用范围

- 适用于用户明确指定的 Markdown 知识库，或通过 KNOWLEDGE_HOME 明确配置的知识库。
- **不适用于 LifeOS。** 如果目标目录同时具有 Home.md、MEMORY.md、memory/README.md 和 tools/memory_search.py，应使用 LifeOS 仓库维护的 skills/lifeos/SKILL.md。
- 不创建第二个知识库，不猜测磁盘路径，不把当前代码项目自动当作个人知识库。

## 通用约定

- 用户明确提出搜索、记录、更新或审查时才触发；普通编程任务不自动沉淀。
- 优先更新原文档，保留来源、日期和适用范围；不把 AI 推测写成用户事实。
- 读取和写入前遵守目标知识库自身的 AGENTS.md、README 和 Git 约定。
- 不因 Skill 自身而获得 commit、push、删除或批量改写权限。
- 不存密码、Token、私钥、Cookie、账号恢复码或未经授权的敏感数据。
