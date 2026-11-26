"""复刻还原度验收工具。

对比「参考图」和「渲染截图」，输出：全图 SSIM、像素差异、区域分项、墨量（字重）体检。

用法：
    python replica_check.py --ref 原图.png --shot 渲染截图.png
    python replica_check.py --ref 原图.png --shot a.png b.png --label 旧版 新版
    python replica_check.py --ref 原图.png --shot 渲染.png --ink "我的任务:283,598,365,626"
    python replica_check.py --ref 原图.png --shot 渲染.png --regions regions.json

设计要点（来自 2026-11-26 公主孙悟空实跑）：
- 整体 SSIM 会掩盖短板，必须看区域分项：旧版整体 0.745，姿势卡只有 0.425。
- 字重偏差肉眼不可见，用「暗像素占比」一量就现形：偏粗 5-11% 会让 SSIM 掉 0.013。
- 2-3 轮收敛即停，剩下的是 AI 生成图的柔化边缘，属媒介差异。
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as ssim

DEFAULT_REGIONS: dict[str, tuple[int, int, int, int]] = {
    "sidebar": (0, 0, 253, 941),
    "topbar": (253, 0, 1672, 88),
    "kpi_row": (253, 88, 1672, 236),
    "banner": (253, 236, 1252, 570),
    "chart": (1252, 236, 1672, 570),
    "tasks": (253, 570, 625, 941),
    "poses": (625, 570, 1252, 941),
    "activity": (1252, 570, 1672, 941),
}


def load_rgb(path: str) -> Image.Image:
    return Image.open(path).convert("RGB")


def pixel_diff_pct(ref: np.ndarray, shot: np.ndarray, threshold: int = 25) -> float:
    """单通道最大差值超过 threshold 的像素占比（百分比）。"""
    return float((np.abs(ref - shot).max(axis=2) > threshold).mean() * 100)


def ink_ratio(arr: np.ndarray, box: tuple[int, int, int, int], thr: int = 128) -> float:
    """区域内暗像素占比（百分比），用于判断文字笔画粗细。"""
    x0, y0, x1, y1 = box
    sub = arr[y0:y1, x0:x1]
    return float((sub.min(axis=2) < thr).mean() * 100)


def check(ref_path: str, shot_path: str, label: str,
          regions: dict[str, tuple[int, int, int, int]],
          ink_boxes: dict[str, tuple[int, int, int, int]]) -> dict:
    ref_img = load_rgb(ref_path)
    shot_img = load_rgb(shot_path)
    if shot_img.size != ref_img.size:
        print(f"[{label}] 尺寸不一致 {shot_img.size} vs {ref_img.size}，已缩放对齐", file=sys.stderr)
        shot_img = shot_img.resize(ref_img.size, Image.LANCZOS)

    ref = np.asarray(ref_img).astype(np.float64)
    shot = np.asarray(shot_img).astype(np.float64)

    result: dict = {
        "label": label,
        "size": list(ref_img.size),
        "ssim": round(float(ssim(ref, shot, channel_axis=2, data_range=255)), 5),
        "pixel_diff_pct": round(pixel_diff_pct(ref, shot), 2),
        "mae": round(float(np.abs(ref - shot).mean()), 2),
        "regions": {},
        "ink": {},
    }

    for name, (x0, y0, x1, y1) in regions.items():
        if x1 > ref.shape[1] or y1 > ref.shape[0]:
            continue
        region_ssim = ssim(ref[y0:y1, x0:x1], shot[y0:y1, x0:x1],
                           channel_axis=2, data_range=255)
        result["regions"][name] = {
            "ssim": round(float(region_ssim), 4),
            "diff_pct": round(pixel_diff_pct(ref[y0:y1, x0:x1], shot[y0:y1, x0:x1]), 2),
        }

    for name, box in ink_boxes.items():
        ref_ink = ink_ratio(ref, box)
        shot_ink = ink_ratio(shot, box)
        result["ink"][name] = {
            "ref": round(ref_ink, 2),
            "shot": round(shot_ink, 2),
            "delta": round(shot_ink - ref_ink, 2),
        }

    return result


def parse_box(text: str) -> tuple[int, int, int, int]:
    parts = [int(v) for v in text.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError(f"坐标必须是 x0,y0,x1,y1 四个整数：{text}")
    return parts[0], parts[1], parts[2], parts[3]


def print_report(results: list[dict], has_ink: bool) -> None:
    print()
    header = f"{'指标':<14}" + "".join(f"{r['label']:>14}" for r in results)
    print(header)
    print("-" * len(header))
    for key, name in (("ssim", "全图 SSIM"), ("pixel_diff_pct", "像素差异%"), ("mae", "平均色差")):
        print(f"{name:<14}" + "".join(f"{r[key]:>14}" for r in results))

    region_names = list(results[0]["regions"])
    if region_names:
        print(f"\n{'区域 SSIM':<14}" + "".join(f"{r['label']:>14}" for r in results))
        print("-" * (14 + 14 * len(results)))
        for rn in region_names:
            row = f"{rn:<14}"
            for r in results:
                row += f"{r['regions'][rn]['ssim']:>14}"
            print(row)

    if has_ink:
        ink_names = list(results[0]["ink"])
        print(f"\n{'墨量(字重)':<14}{'原图':>10}" +
              "".join(f"{r['label'] + '差':>12}" for r in results))
        print("-" * (24 + 12 * len(results)))
        for name in ink_names:
            ref_val = results[0]["ink"][name]["ref"]
            row = f"{name:<14}{ref_val:>10.2f}"
            for r in results:
                row += f"{r['ink'][name]['delta']:>+12.2f}"
            print(row)

    print("\n判读：")
    best = max(results, key=lambda r: r["ssim"])
    print(f"  · 最佳：{best['label']}  SSIM {best['ssim']}  差异 {best['pixel_diff_pct']}%")
    if region_names:
        weakest = min(best["regions"].items(), key=lambda kv: kv[1]["ssim"])
        print(f"  · 最弱区域：{weakest[0]}  SSIM {weakest[1]['ssim']}  差异 {weakest[1]['diff_pct']}%")
        if weakest[1]["ssim"] < 0.90:
            print("    → 低于 0.90，优先查这一块：多半是素材没切（用占位/线稿代替）")
    if has_ink:
        worst_ink = max(best["ink"].items(), key=lambda kv: abs(kv[1]["delta"]))
        if abs(worst_ink[1]["delta"]) > 1.5:
            direction = "偏粗" if worst_ink[1]["delta"] > 0 else "偏细"
            print(f"  · 字重异常：{worst_ink[0]} {direction} {abs(worst_ink[1]['delta']):.1f} 个百分点"
                  " → 查 -webkit-text-stroke 和 font-weight")
        else:
            print("  · 字重：各区域均在 ±1.5 个百分点内，正常")
    print("  · 提醒：剩余差异多为 AI 生成图的柔化边缘/抗锯齿，属媒介差异，追不到 0")


def main() -> int:
    parser = argparse.ArgumentParser(description="复刻还原度验收")
    parser.add_argument("--ref", required=True, help="参考图（原图）")
    parser.add_argument("--shot", required=True, nargs="+", help="渲染截图，可多张对比")
    parser.add_argument("--label", nargs="*", help="每张截图的名称")
    parser.add_argument("--regions", help="区域定义 JSON：{\"名称\": [x0,y0,x1,y1]}")
    parser.add_argument("--ink", action="append", default=[],
                        help="墨量检测框，格式 名称:x0,y0,x1,y1，可多次指定")
    parser.add_argument("--json", help="把结果写成 JSON 到这个路径")
    args = parser.parse_args()

    labels = args.label or [Path(p).stem for p in args.shot]
    if len(labels) != len(args.shot):
        parser.error("--label 数量必须和 --shot 一致")

    regions = dict(DEFAULT_REGIONS)
    if args.regions:
        regions.update({k: tuple(v) for k, v in json.loads(Path(args.regions).read_text("utf-8")).items()})

    ink_boxes: dict[str, tuple[int, int, int, int]] = {}
    for item in args.ink:
        name, _, coords = item.partition(":")
        if not coords:
            parser.error(f"--ink 格式应为 名称:x0,y0,x1,y1，收到：{item}")
        ink_boxes[name] = parse_box(coords)

    results = [check(args.ref, shot, label, regions, ink_boxes)
               for shot, label in zip(args.shot, labels)]
    print_report(results, bool(ink_boxes))

    if args.json:
        Path(args.json).write_text(json.dumps(results, ensure_ascii=False, indent=2), "utf-8")
        print(f"\n结果已写入 {args.json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
