# 示例：公主孙悟空后台（1672×941）

本 Skill 对照实验的完整产物，可直接打开 `index.html` 查看。

| 文件 | 说明 |
|---|---|
| `index.html` / `styles.css` | 复刻页面源码，纯 CSS 布局与图标，无内联样式堆砌 |
| `assets/` | 9 张切片素材（角色、插画、头像、宫殿云海、云纹、四张姿势图） |
| `result-1672x941.png` | 最终渲染截图，与参考图同尺寸 |
| `../../assets/reference-princess-wukong.png` | 参考原图 |

## 实测结果

| 指标 | 数值 |
|---|---:|
| 全图 SSIM | 0.9453 |
| 像素差异（Pixelmatch，阈值 0.1，排除抗锯齿） | 3.20% |
| 最大 RGB 通道差 > 25 的像素占比 | 3.64% |
| 迭代轮次 | 3 轮 + 1 轮字重修正 |

区域分项：姿势卡 0.9901、Banner 角色 1.0000、侧栏品牌插画 0.9548。

## 复算

```bash
python ../../scripts/replica_check.py \
  --ref ../../assets/reference-princess-wukong.png \
  --shot result-1672x941.png
```

剩余约 5% 差异来自 AI 生成图的柔化边缘与亚像素抗锯齿，属媒介差异，不是布局或素材问题。
