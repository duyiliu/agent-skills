# 公开 Skill 网站

公开地址：https://duyiliu.github.io/agent-skills/

网站读取由仓库源文件生成的公开快照，支持分类、名称/描述/正文搜索、完整文件阅读、复制和下载。编辑按钮进入 GitHub 对应文件的编辑页，由 GitHub 验证登录和仓库写入权限。

生成静态网站：

```powershell
node website/build.mjs
python -m http.server 4173 --directory website/dist
```

构建产物是 `website/dist/`，包含全部 Skill 及其支持文件的公开内容。私有仓库的 Token 不进入网页。

GitHub 提交会更新仓库源文件；`.github/workflows/pages.yml` 会自动生成并发布最新网站快照。客户端已安装 Skill 的同步独立进行。
