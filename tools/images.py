"""Make app icons to the sizes in README.md (needs Pillow: pip install pillow).

Icons come straight from each game's Google Play listing:
    python tools/images.py icon com.online.pvp.shooter [more packages ...]
  writes icon/512/<package>.jpg (512 x 512, the original kept for later)
  and    icon/<package>.jpg     (128 x 128, the one the page loads)

Run from the repository root.
"""
import io
import os
import re
import sys
import urllib.request

from PIL import Image

UA = {"User-Agent": "Mozilla/5.0"}
ICON, ICON_FULL = 128, 512
ICON_LIMIT = 12_000  # bytes for the 128 px icon; README explains the budget


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()


def save(im, path, limit=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "JPEG", quality=80, optimize=True, progressive=True)
    size = os.path.getsize(path)
    note = f"  <- over {limit // 1000} KB, check it" if limit and size > limit else ""
    print(f"{path}  {im.size[0]}x{im.size[1]}  {size // 1024} KB{note}")


def icon(pkg):
    page = fetch(f"https://play.google.com/store/apps/details?id={pkg}&hl=en&gl=US").decode("utf-8", "replace")
    m = re.search(r'<meta property="og:image" content="(https://play-lh\.googleusercontent\.com/[^"=]+)', page)
    if not m:
        sys.exit(f"{pkg}: no icon found (is the game live on Google Play?)")
    im = Image.open(io.BytesIO(fetch(m.group(1) + "=s512"))).convert("RGB")
    save(im.resize((ICON_FULL, ICON_FULL), Image.LANCZOS), f"icon/512/{pkg}.jpg")
    save(im.resize((ICON, ICON), Image.LANCZOS), f"icon/{pkg}.jpg", ICON_LIMIT)


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "icon":
        for p in sys.argv[2:]:
            icon(p)
    else:
        sys.exit(__doc__)
