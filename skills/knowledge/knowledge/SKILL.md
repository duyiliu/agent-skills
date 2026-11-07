---
name: knowledge
description: Search, capture, update, and maintain the user's persistent Markdown knowledge base (LifeOS). Use when the user explicitly asks to remember/save ("记下来", "存进知识库"), retrieve/summarize from prior notes ("查我的笔记", "知识库里有没有"), or update reusable knowledge. Do not auto-activate for routine coding, simple file navigation, or every completed task; project documents remain in their own repositories.
---

# Knowledge

将 AI 作为知识库的主要作者和维护者；用户负责提出意图、确认关键事实与重大变更。首选既有 LifeOS vault，不另建一套“第二大脑”。

## 定位知识库（所有知识类 Skill 使用同一协议）

按以下优先级寻找知识库根目录：

1. 用户本次明确指定的**绝对路径**。
2. 当前进程环境变量 KNOWLEDGE_HOME 指向的绝对路径。
3. 已有全局用户规则明确声明的 LifeOS vault 路径；当前 LifeOS 的默认位置是 Windows 下 D:\workspace\LifeOS。
4. 当前工作目录或其上级确实是 LifeOS 根目录时，可直接使用。

必须验证目录存在，并具有 Home.md 和 10_工作、20_生活、30_资料 等现有结构特征；不满足时停止写入并报告所需配置。不要猜测其他磁盘路径、隐式创建新 vault，也不要把知识写到当前代码项目或 Skill 仓库。

Windows 用户级配置示例：

~~~powershell
[Environment]::SetEnvironmentVariable('KNOWLEDGE_HOME', 'D:\workspace\LifeOS', 'User')
~~~

修改用户环境变量后须重启对应终端/AI 客户端；跨设备分别配置即可。环境变量未设置时可采用已验证存在的默认位置。

## 同步前置（任何读写笔记之前必须执行）

未完成同步，不得读取笔记正文、不得给出基于笔记的结论、不得写入。目的不是"顺手更新一下"，而是避免在无法确认版本的状态下静默使用可能过期的内容。查询、检索、审查、写入一视同仁。

1. 确认 vault 根目录就是 Git 仓库根，且当前分支跟踪同名远端分支（如 master → origin/master）；不满足时停止并报告所需配置。
2. 执行 `git fetch --quiet origin <branch>`。网络、凭据或远端不可达时**停止**，报告"无法确认是否为最新"，不得把失败解释成"已是最新"。
3. 检查 `git status --porcelain`：存在未解决冲突（unmerged）时**停止**；存在已暂存文件时记录并报告，不擅自暂存或提交，查询可继续、写入前需用户确认。保留现场，不代替用户决定。
4. 用 `git rev-list --left-right --count HEAD...@{upstream}` 判断 ahead / behind：
   - `behind > 0`：执行 `git pull --ff-only`；若因本地未提交改动冲突而失败，**停止并报告**，不 stash、不 reset、不 rebase、不 merge、不 force。
   - `ahead > 0`：本地有未推送提交，本地内容不比远端旧，查询可继续，但须在结论中注明"基于本地未推送的 commit X，另一端可能看不到"；写入前提示用户，由用户决定是否先推送，不自动 push。
   - 两者皆为 0：已对齐。
5. 校验 `git rev-parse HEAD` 与 `git rev-parse @{upstream}` 一致后，才算同步完成；记录同步到的分支与 commit，随结论一并说明。`pull` 拉入新提交后，重新读取受影响的目标文档再作答或写入，不得使用同步前的缓存内容。

在 vault 根目录按固定顺序一次执行（`<branch>` 替换为当前分支，通常 master）：

~~~bash
git fetch --quiet origin <branch>
git status --porcelain=v1                                  # 已暂存 / 未暂存改动
git diff --name-only --diff-filter=U                       # 有输出 = 未解决冲突，停止
git rev-list --left-right --count 'HEAD...@{upstream}'     # 左=ahead 右=behind
git pull --ff-only                                          # 仅 behind>0 时执行
git rev-parse HEAD && git rev-parse '@{upstream}'          # 两者必须一致
~~~

`@{upstream}` 在代码块中一律加引号，PowerShell 下不加会被解析为哈希表字面量。

禁止项：不得用 `git stash`、`reset --hard`、`pull --rebase`、`checkout --`、`force push` 来"修复"同步；不得覆盖无关的未提交修改；不得在同步失败时继续读写。

边界（必须如实说明，不得声称"文档绝对最新"）：同步只保证本机与 origin 上该分支对齐；另一端未推送的改动、离线期间、以及多 Agent 并发写入都不在此保证范围内。能给出的是"已同步到 origin/<branch> 的 <commit>"这一可验证事实。

写入场景的额外一步：同步完成后，检查目标笔记本身是否有未提交改动；有则停止并报告，避免覆盖他人或另一设备的修改。

## 搜索和回答

1. 先按关键词、文件名和索引查找相关 Markdown，再按需阅读少量上下文，避免一次塞进全量 vault。
2. 优先复用已有结论；核对适用范围（全部 / 家机 / 公司机）、来源、时间和可信度，发现冲突时不要自行选一个当真。
3. 回答时给出文档相对路径；原笔记没有证据时明确区分事实、推测和待验证内容。
4. 用户仅要求查询时保持只读。

## 写入和更新

仅在用户明确要求记录/修改，或用户已明确授权的任务结束沉淀流程中执行写入。不因普通开发任务结束就强行触发本 Skill。

1. 确定内容是否值得跨会话长期保留；临时日志、原始聊天和一次性输出一般不存。
2. 搜索已有笔记，**优先更新原文档**而非重复创建。写前检查 Git 状态，保留无关的未提交修改。
3. 按 LifeOS 已有结构落位：
   - 跨项目 AI 工具、模型、Agent、排错经验 → 30_资料/知识/AI开发/ 的合适现有文档；
   - 通用知识 → 30_资料/知识/；
   - 家机/公司环境、部署资产 → 对应 10_工作/个人开发环境/ 或已有工作目录；
   - 项目设计、接口契约和测试资料 → **原项目 Git 仓库**，LifeOS 只记录跨项目索引或复用经验。
4. 沿用原文件结构、中文风格与相对链接（含 Obsidian wikilink）。新增或更新关键结论时说明“适用范围 / 来源及日期 / 可信度或待确认项”，不能伪造来源、测试结果和确定性。
5. 不存密码、Token、私钥、Cookie、真实患者信息、客户敏感数据；只允许记录凭据所在位置及脱敏说明。
6. 普通、可逆的补充可以在已授权范围内直接写；覆盖既有关键结论、删除文件、合并大量页面、改写历史决策必须先展示差异并获得用户确认。

## 写入后的提交与推送（必须执行）

写入完成后**必须 commit 并 push**，由本 Skill 当场执行，不得以"稍后自动同步"为由延后。用户已明确授权这一闭环；只读查询不产生提交。

1. 提交前先 `git fetch --quiet origin <branch>`；若 `behind > 0`，仅在不覆盖本次写入的前提下 `git pull --ff-only`，否则停止并报告，避免在分叉上提交。
2. **只暂存本次实际改动的笔记路径**（写操作时记录的明确清单）。禁止 `git add -A` / `git add .` / 目录通配；暂存后用 `git diff --cached --name-only` 核对，出现范围外文件立即 `git restore --staged` 并停止。
3. 对暂存内容做敏感检查：`git diff --cached | grep -iE 'password|passwd|token|secret|api[_-]?key|private key|ghp_|sk-|BEGIN .*PRIVATE KEY'`，无输出即通过（grep 退出码 1 属正常）。凭据、Token、私钥、Cookie、客户/患者数据一律不得提交；账号资料等范围外文件中的完整 Key 不得混入。命中后逐条人工复核，确属真实凭据则撤消暂存并停止（普通文档提到 token 一词不算泄露）。
4. 提交信息沿用仓库既有风格（如 `docs(knowledge): ...`），中文；不改写历史、不 amend 已推送提交。
5. `git push origin HEAD:<branch>`。失败（网络、凭据、非快进）时**停止并如实报告"本地已提交，未推送"**，不 force、不重试轰炸、不 reset 本地提交。非快进时再 `git fetch` 一次，报告与远端的差异及涉及文件，由用户决定合并方式。
6. 推送后校验 `git rev-parse HEAD` 与 `git rev-parse '@{upstream}'` 一致，才算推送完成。报告固定包含四项：同步到的 commit → 改动文件清单 → 本次 commit sha → 推送结果。推送未成功不得声称"已同步"。

## 并发

- 读写前的同步按上文「同步前置」执行。
- 写后检查 diff，并明确列出修改过的文档、信息来源、未验证点，以及本次同步到的 commit。
- 需要按仓库风格组织提交时可复用 git-commit Skill，不复制其流程；提交与推送的执行仍由本 Skill 完成。
- 多 Agent 不同时写同一文档；必要时隔离 worktree。出现 merge 冲突时停止并保留现场，不替用户猜测合并语义。

## 完成条件

查询：先完成同步前置、给出答案、出处和同步到的 commit；写入：确实修改了已验证的 vault、diff 仅覆盖预定范围、**已完成 commit 并 push**，并报告文件路径、commit 与推送结果。同步或提交/推送未完成、知识库不可访问、关键事实不可靠时，报告阻塞原因，不能声称已经保存，也不能声称文档已是最新。
