# Knowledge Skills

面向用户自有的、由 AI 维护的 Markdown 知识库。此目录只保存 Skill 源文件；知识正文仍保存在独立的 LifeOS vault 或用户指定的其他目录。

- [knowledge](knowledge/SKILL.md) — 按需查找、记录、更新跨项目知识。明确要求“记下来”“从我的笔记里找”时使用；普通编程任务不自动沉淀。
- [knowledge-review](knowledge-review/SKILL.md) — 显式审查重复、矛盾、过期信息及链接问题。默认只读、基于证据，不自行删除/合并。

## 知识库定位

两个 Skill 共用优先级：用户明确指定的绝对路径 > KNOWLEDGE_HOME 环境变量 > 已有全局规则中的 LifeOS 路径（当前默认 D:\workspace\LifeOS）> 已验证的当前 LifeOS 目录。

Windows PowerShell：

~~~powershell
[Environment]::SetEnvironmentVariable('KNOWLEDGE_HOME', 'D:\workspace\LifeOS', 'User')
~~~

重启 AI 客户端后生效。Skill 不会替用户新建第二个 vault。已有 LifeOS 目录（10_工作 / 20_生活 / 30_资料）保持不变，Skill 本身也不复制到 LifeOS。

## 触发边界

- 搜索、记录、修改知识 → knowledge（自动匹配明确的知识操作意图，亦可手动调用）。
- 清理、审计、查重、发现过时内容 → knowledge-review（仅明确发起审查时）。
- 当前项目的设计文档/接口说明 → 项目内既有规范和 task-design/task-execution；不应分流到知识库。
- Git 提交/推送 → 遵守现有 git-commit 流程和权限，不通过 Skill 名称获得额外授权。

## 客户端安装

从本仓库将相应目录完整复制到 Codex 的 ~/.codex/skills/ 或 Claude Code 的 ~/.claude/skills/；Pi 根据其 Skill 发现路径配置安装。仓库更新不会自动部署到各客户端。
