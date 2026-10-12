---
name: knowledge
description: Search, capture, update, and maintain the user's persistent Markdown knowledge base. Use when the user explicitly asks to remember, save, retrieve, summarize from prior notes, or update reusable knowledge. Do not auto-activate for routine coding, simple file navigation, or every completed task; project documents remain in their own repositories.
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

## Git 同步与并发

- 开始写之前检查工作区状态；远端同步只在安全且已有权限时进行，不能用 reset、force push 或覆盖未提交修改来“修复同步”。
- 写后检查 diff，并明确列出修改过的文档、信息来源和未验证点。
- 默认不自动 commit/push。仅在用户本次明确授权，或 vault 已有明确的自动同步授权规则时，按该规则执行；否则说明待同步状态。需要提交时可复用 git-commit Skill，不复制其流程。
- 多 Agent 不同时写同一文档；必要时隔离 worktree。出现 merge 冲突时停止并保留现场，不替用户猜测合并语义。

## 完成条件

查询：给出答案和出处；写入：确实修改了已验证的 vault、diff 仅覆盖预定范围，并报告文件路径及是否已提交/推送。若知识库不可访问或关键事实不可靠，报告阻塞原因，不能声称已经保存。
