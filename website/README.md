# 公开 Skill 网站

公开地址：https://duyiliu-agent-skills.zhangqianfeng1990.chatgpt.site

网站读取由仓库源文件生成的公开快照，支持分类、名称/描述/正文搜索、完整文件阅读、复制和下载。编辑按钮进入 GitHub 对应文件的编辑页，由 GitHub 验证登录和仓库写入权限。

生成静态网站：

```powershell
node website/build.mjs
python -m http.server 4173 --directory website/dist
```

构建产物是 `website/dist/`，包含全部 Skill 及其支持文件的公开内容。私有仓库的 Token 不进入网页。

GitHub 提交会更新仓库源文件；已发布网站展示最近一次部署的快照。源文件变化后，重新执行构建并通过 Sites 发布，网站才会展示新内容。客户端已安装 Skill 的同步独立进行。

部署使用独立的 Sites checkout：`D:\workspace\git\agent-skills-site`，它保存发布快照和 Sites manifest。Skill 源文件及网站实现以本仓库为准。
