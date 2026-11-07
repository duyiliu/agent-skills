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
- Git 提交/推送 → 写入后由本 Skill 按受限文件范围执行 commit + push（用户已明确授权），不依赖后台计划任务；沿用 git-commit 的提交风格，但不通过 Skill 名称获得范围外授权。
- **任何知识检索、审查或写入之前** → 先执行两个 Skill 共用的同步前置（`git fetch` → `git pull --ff-only` → 校验 `HEAD` 与 `@{upstream}` 一致），失败即停止并报告，不得静默使用可能过期的内容。

## 客户端安装

从本仓库将相应目录完整复制到 Codex 的 ~/.codex/skills/ 或 Claude Code 的 ~/.claude/skills/；Pi 根据其 Skill 发现路径配置安装。仓库更新不会自动部署到各客户端。

## 完整闭环（由 Skill 自己执行，不依赖计划任务）

两个 Skill 的读写闭环全部由 Skill 当场完成，用户已明确授权：

1. **任何读写笔记之前**：同步前置 `git fetch` → `git pull --ff-only` → 校验 `HEAD` 与 `@{upstream}` 一致；失败即停止并报告，不得静默使用可能过期的内容。
2. **写入完成之后**：只暂存本次实际改动的笔记路径、做敏感检查、commit、`git push`；推送失败如实报告"本地已提交，未推送"，不 force。只读查询不产生提交。

同步前置只做拉取，不提交、不推送、不清理工作区，也不用 stash / reset / force 绕过冲突；它只保证本机与 origin 上该分支对齐，不保证另一端未推送的改动或并发写入。写入后的提交只用明确文件清单，禁止 `git add -A`，禁止把账号/凭据类文件混入。详见各 SKILL.md。

`scripts/lifeos-knowledge-sync.ps1` 计划任务不再是本闭环的必需环节，保留时仅作兜底；两者不得同时提交同一批改动。自动提交与推送授权已由用户明确授予本 Skill，不再局限于该计划任务。
