"""Make the page's images to the sizes in README.md (needs Pillow: pip install pillow).

Icons, straight from each game's Google Play listing:
    python tools/images.py icon com.online.pvp.shooter [more packages ...]
  writes icon/512/<package>.jpg (512 x 512, the original kept for later)
  and    icon/<package>.jpg     (128 x 128, the one the page loads)

Banner for the featured card, from a screenshot file or URL (16:9 is best;
other shapes are cropped to the centre):
    python tools/images.py banner <file or URL> featured-<game>
  writes img/featured-<game>.jpg (640 x 360)

Run from the repository root.
"""
import io
import os
import re
import sys
import urllib.request

from PIL import Image

UA = {"User-Agent": "Mozilla/5.0"}
ICON, ICON_FULL, BANNER = 128, 512, (640, 360)
LIMIT = {"icon": 12_000, "banner": 45_000}  # bytes; README explains the budget


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()


def save(im, path, kind):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "JPEG", quality=80 if kind != "banner" else 74, optimize=True, progressive=True)
    size = os.path.getsize(path)
    note = "" if kind not in LIMIT or size <= LIMIT[kind] else f"  <- over {LIMIT[kind] // 1000} KB, check it"
    print(f"{path}  {im.size[0]}x{im.size[1]}  {size // 1024} KB{note}")


def icon(pkg):
    page = fetch(f"https://play.google.com/store/apps/details?id={pkg}&hl=en&gl=US").decode("utf-8", "replace")
    m = re.search(r'<meta property="og:image" content="(https://play-lh\.googleusercontent\.com/[^"=]+)', page)
    if not m:
        sys.exit(f"{pkg}: no icon found (is the game live on Google Play?)")
    im = Image.open(io.BytesIO(fetch(m.group(1) + "=s512"))).convert("RGB")
    save(im.resize((ICON_FULL, ICON_FULL), Image.LANCZOS), f"icon/512/{pkg}.jpg", "full")
    save(im.resize((ICON, ICON), Image.LANCZOS), f"icon/{pkg}.jpg", "icon")


def banner(src, name):
    data = fetch(src) if re.match(r"https?://", src) else open(src, "rb").read()
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = im.size
    target = BANNER[0] / BANNER[1]
    if w / h > target:  # too wide: trim the sides
        nw = round(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:  # too tall: trim top and bottom
        nh = round(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    save(im.resize(BANNER, Image.LANCZOS), f"img/{name}.jpg", "banner")


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "icon":
        for p in sys.argv[2:]:
            icon(p)
    elif len(sys.argv) == 4 and sys.argv[1] == "banner":
        banner(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
