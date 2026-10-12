# LifeOS 自动 Git 同步（Windows）

AI 负责写本地 Markdown；Windows 计划任务每 10 分钟确定性地同步 Git。无需 AI Token、SilverBullet、向量库或新服务。

## 范围与行为

- 知识库位置：优先 KNOWLEDGE_HOME，默认 D:\workspace\LifeOS；可用 -VaultPath 覆盖。
- 仅自动提交 30_资料/知识/**/*.md；LifeOS 其余内容（例如账号资料、工作资料）不自动纳入新提交。
- 工作区干净且远端有更新时：fetch → fast-forward pull。
- 远端没有新提交且允许范围内 Markdown 修改时：fetch → 受限暂存 → 安全检查 → commit → push。
- 本地有之前未推送的其他提交、远端分叉、冲突、已暂存文件、删除或疑似密钥时停止；不会 force push。
- 脚本只在 Windows 用户登录期间执行；不会在用户注销后持续运行。
- 不会替代人工审核重要决策。只能限制提交文件范围，不能理解 Markdown 的语义或百分之百识别密钥。

## 安装

先克隆或更新 agent-skills 仓库，确认本机 LifeOS 已经克隆且 Git 远端与登录凭据可用。于 agent-skills 根目录执行：

~~~powershell
# 如知识库不在 D:\workspace\LifeOS，请先设置，再打开新终端
[Environment]::SetEnvironmentVariable('KNOWLEDGE_HOME','D:\workspace\LifeOS','User')

# 建议先手动执行一次，检查 Git 凭据与效果
.\scripts\lifeos-knowledge-sync.ps1 -Action Run

# 为当前 Windows 用户安装每 10 分钟执行的计划任务
.\scripts\lifeos-knowledge-sync.ps1 -Action Install

# 检查计划任务
Get-ScheduledTask -TaskName 'LifeOS Knowledge Git Sync'
~~~

如执行策略阻止运行，可在 PowerShell 执行：

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\lifeos-knowledge-sync.ps1 -Action Run
~~~

安装到其他路径：

~~~powershell
.\scripts\lifeos-knowledge-sync.ps1 -Action Install -VaultPath 'E:\Notes\LifeOS'
~~~

计划任务会保存本脚本的绝对路径。移动 agent-skills 仓库后需要重新安装任务。建议先通过 Git Credential Manager 在交互式终端完成身份认证；计划任务不能弹出登录窗口。

## 排查与卸载

~~~powershell
Get-Content "$env:LOCALAPPDATA\LifeOSGitSync\sync.log" -Tail 30
.\scripts\lifeos-knowledge-sync.ps1 -Action Uninstall
~~~

安全机制：仅暂存 Markdown，禁用自动删除，限制单次最多 20 个文件和 1500 行新增，启发式检查敏感值。失败日志保留在本机 AppData；网络失败时仅重试脚本自己创建的一条提交。发生冲突时保留现场等待人工处理。

**注意**：限制新提交路径不等于对整个 LifeOS 历史内容脱敏。个人凭据和其他敏感资料仍需自行检查，勿认为私有 Git 仓库代表端到端加密。
