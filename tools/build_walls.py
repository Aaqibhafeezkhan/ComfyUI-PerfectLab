# -*- coding: utf-8 -*-
"""Rebuild the docs/tiles/*.jpg walls from the real 240x240 guide tiles.

One wall per category folder in web/guide/items/: 8 columns, 150 px tiles,
6 px gaps on the panel's dark background. Run after any library expansion:
python tools/build_walls.py
"""
import io, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "web", "guide", "items")
DST = os.path.join(ROOT, "docs", "tiles")

COLS, TILE, GAP, MARGIN = 8, 150, 6, 4
BG = (31, 31, 39)

def build(cat):
    tiles_dir = os.path.join(SRC, cat)
    files = sorted(f for f in os.listdir(tiles_dir) if f.endswith(".jpg"))
    if not files:
        return None
    rows = (len(files) + COLS - 1) // COLS
    w = MARGIN * 2 + COLS * TILE + (COLS - 1) * GAP
    h = MARGIN * 2 + rows * TILE + (rows - 1) * GAP
    wall = Image.new("RGB", (w, h), BG)
    for i, f in enumerate(files):
        r, c = divmod(i, COLS)
        im = Image.open(os.path.join(tiles_dir, f)).convert("RGB").resize((TILE, TILE), Image.LANCZOS)
        x = MARGIN + c * (TILE + GAP)
        y = MARGIN + r * (TILE + GAP)
        wall.paste(im, (x, y))
    out = os.path.join(DST, cat + ".jpg")
    wall.save(out, quality=88)
    return (cat, len(files), w, h)

def main():
    os.makedirs(DST, exist_ok=True)
    made = []
    for cat in sorted(os.listdir(SRC)):
        if os.path.isdir(os.path.join(SRC, cat)):
            r = build(cat)
            if r:
                made.append(r)
    for cat, n, w, h in made:
        print("%-16s %3d tiles  %dx%d" % (cat, n, w, h))
    print("walls:", len(made))

if __name__ == "__main__":
    main()
