from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "gpt-chat-images" / "GPT生成-公主孙悟空后台.png"
ASSETS = ROOT / "assets"


def erase_letters(image, boxes, select):
    rgb = np.array(image)
    mask = np.zeros(rgb.shape[:2], np.uint8)
    for left, top, right, bottom in boxes:
        section = rgb[top:bottom, left:right]
        mask[top:bottom, left:right] = select(section).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8))
    return Image.fromarray(cv2.inpaint(rgb, mask, 4, cv2.INPAINT_TELEA))


def smooth_background(image, boxes):
    rgb = np.array(image, dtype=np.float32)
    for left, top, right, bottom in boxes:
        width = right - left
        height = bottom - top
        start = rgb[top - 4:top, left:right].mean(axis=0)
        end = rgb[bottom:bottom + 4, left:right].mean(axis=0)
        start = cv2.GaussianBlur(start[None], (25, 1), 0)[0]
        end = cv2.GaussianBlur(end[None], (25, 1), 0)[0]
        progress = np.linspace(0, 1, height)[:, None, None]
        fill = start[None] * (1 - progress) + end[None] * progress
        x = np.minimum(np.arange(width), np.arange(width)[::-1])
        y = np.minimum(np.arange(height), np.arange(height)[::-1])
        blend = (np.minimum(y[:, None], x[None]) / 5).clip(0, 1)[..., None]
        rgb[top:bottom, left:right] = fill * blend + rgb[top:bottom, left:right] * (1 - blend)
    return Image.fromarray(rgb.round().astype(np.uint8))


def main():
    source = Image.open(SOURCE).convert("RGB")
    if source.size != (1672, 941):
        raise ValueError(f"Unexpected source size: {source.size}")
    ASSETS.mkdir(exist_ok=True)

    crops = {
        "sidebar-palace.png": (0, 664, 229, 941),
        "header-cloud.png": (608, 0, 1024, 111),
        "profile-avatar.png": (1488, 28, 1536, 78),
        "pose-standing.png": (667, 656, 802, 825),
        "pose-running.png": (814, 656, 950, 825),
        "pose-battle.png": (963, 656, 1099, 825),
        "pose-happy.png": (1111, 656, 1247, 825),
    }
    for name, box in crops.items():
        source.crop(box).save(ASSETS / name, optimize=True)

    brand = source.crop((0, 0, 229, 201))
    brand = erase_letters(
        brand,
        [(99, 27, 208, 81), (103, 83, 207, 102)],
        lambda rgb: (rgb[:, :, 1] > 172) & (rgb[:, :, 2] > 171),
    )
    brand.save(ASSETS / "sidebar-brand.png", optimize=True)

    banner = source.crop((261, 247, 1242, 560))
    banner = smooth_background(banner, [(24, 178, 351, 212), (24, 222, 317, 281)])
    banner.save(ASSETS / "hero-art.png", optimize=True)

if __name__ == "__main__":
    main()
