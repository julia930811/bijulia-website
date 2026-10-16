#!/usr/bin/env python3
"""Original illustrated placeholders and page shells for the BiJulia site."""

import re
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
DESIGN = {
    "rose-gate-pendant": "rose",
    "dusty-bloom-choker": "choker",
    "garden-letter-locket": "locket",
    "lace-bow-necklace": "bow",
    "ivory-lace-collar": "collar",
    "ribbon-pearl-strand": "ribbon",
    "antique-cameo-necklace": "cameo",
    "forgotten-key-pendant": "key",
    "heirloom-coin-chain": "coins",
    "moonpearl-collar": "triple",
    "seed-pearl-strand": "seed",
    "baroque-pearl-drop": "baroque",
}


class Ids:
    n = 0

    @classmethod
    def next(cls):
        cls.n += 1
        return f"id{cls.n}"


def pearl(cx, cy, r, tone="white"):
    gid = Ids.next()
    if tone == "cream":
        c1, c2 = "#FFF6EA", "#E4CDB4"
    elif tone == "blush":
        c1, c2 = "#FFF8F6", "#E7D0C8"
    else:
        c1, c2 = "#FFFcf8", "#E3D6CC"
    return f'''<defs><radialGradient id="{gid}" cx="32%" cy="32%" r="75%">
      <stop offset="0%" stop-color="{c1}"/><stop offset="100%" stop-color="{c2}"/>
    </radialGradient></defs>
    <circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="url(#{gid})"/>
    <circle cx="{cx - r * 0.28:.1f}" cy="{cy - r * 0.32:.1f}" r="{r * 0.18:.1f}" fill="#fff" opacity="0.8"/>'''


def chain(p0, p1, p2, stroke, width=1.7):
    return (
        f'<path d="M {p0[0]} {p0[1]} Q {p1[0]} {p1[1]} {p2[0]} {p2[1]}" '
        f'fill="none" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round"/>'
    )


def quad(p0, p1, p2, t):
    u = 1 - t
    return (
        u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
        u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    )


def rose(cx, cy, r, colors):
    parts = [f'<ellipse cx="{cx}" cy="{cy + r * 0.2}" rx="{r * 0.72}" ry="{r * 0.28}" fill="#C9B6AA" opacity="0.18"/>']
    for i, color in enumerate(colors):
        radius = r * (1 - i * 0.22)
        for k in range(6):
            angle = k * 60 + i * 16
            parts.append(
                f'<ellipse cx="{cx}" cy="{cy - radius * 0.38}" rx="{radius * 0.36}" ry="{radius * 0.52}" '
                f'fill="{color}" transform="rotate({angle} {cx} {cy})"/>'
            )
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r * 0.22}" fill="#F6D5CE"/>')
    return "".join(parts)


def leaf(cx, cy, rx, ry, rot, color="#8EA48A"):
    return (
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{color}" '
        f'transform="rotate({rot} {cx} {cy})" opacity="0.92"/>'
    )


def bow(cx, cy, color="#E7C4C0", stroke="#C98986"):
    return f'''
      <path d="M {cx} {cy} C {cx - 20} {cy - 46}, {cx - 78} {cy - 36}, {cx - 70} {cy + 4}
               C {cx - 62} {cy + 28}, {cx - 18} {cy + 18}, {cx} {cy}" fill="{color}" stroke="{stroke}"/>
      <path d="M {cx} {cy} C {cx + 20} {cy - 46}, {cx + 78} {cy - 36}, {cx + 70} {cy + 4}
               C {cx + 62} {cy + 28}, {cx + 18} {cy + 18}, {cx} {cy}" fill="{color}" stroke="{stroke}"/>
      <path d="M {cx - 8} {cy + 6} C {cx - 36} {cy + 36}, {cx - 28} {cy + 78}, {cx - 8} {cy + 70}" fill="none" stroke="{stroke}" stroke-width="6" stroke-linecap="round"/>
      <path d="M {cx + 8} {cy + 6} C {cx + 36} {cy + 36}, {cx + 22} {cy + 82}, {cx + 4} {cy + 64}" fill="none" stroke="{stroke}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="{cx}" cy="{cy + 2}" r="8" fill="#C98986"/>
    '''


def cameo(cx, cy):
    return f'''
      <ellipse cx="{cx}" cy="{cy}" rx="58" ry="74" fill="url(#metalGold)"/>
      <ellipse cx="{cx}" cy="{cy}" rx="46" ry="60" fill="#F4E4D4"/>
      <path d="M {cx - 8} {cy - 18} C {cx - 4} {cy - 8}, {cx + 6} {cy - 6}, {cx + 10} {cy - 16}" fill="none" stroke="#C4A488" stroke-width="2"/>
      <path d="M {cx - 18} {cy + 8} Q {cx} {cy + 28} {cx + 22} {cy + 6}" fill="none" stroke="#D7BBA4" stroke-width="8" stroke-linecap="round"/>
      <circle cx="{cx - 2}" cy="{cy - 28}" r="16" fill="#E7CDB8"/>
    '''


def key(cx, cy):
    return f'''
      <circle cx="{cx}" cy="{cy - 28}" r="22" fill="none" stroke="url(#metalGold)" stroke-width="7"/>
      <circle cx="{cx}" cy="{cy - 28}" r="8" fill="none" stroke="#C4AE7A" stroke-width="3"/>
      <rect x="{cx - 4}" y="{cy - 8}" width="8" height="78" rx="3" fill="url(#metalGold)"/>
      <rect x="{cx - 4}" y="{cy + 42}" width="22" height="6" fill="url(#metalGold)"/>
      <rect x="{cx - 4}" y="{cy + 56}" width="16" height="6" fill="url(#metalGold)"/>
    '''


def locket(cx, cy):
    return f'''
      <ellipse cx="{cx}" cy="{cy}" rx="46" ry="60" fill="url(#metalGold)"/>
      <ellipse cx="{cx}" cy="{cy}" rx="34" ry="46" fill="#F8F1E6" stroke="#E2D0AE"/>
      <path d="M {cx} {cy - 16} C {cx - 14} {cy - 16}, {cx - 16} {cy + 2}, {cx} {cy + 16}
               C {cx + 16} {cy + 2}, {cx + 14} {cy - 16}, {cx} {cy - 16}" fill="#E7B7B2"/>
    '''


def coin(cx, cy, r=22):
    return f'''
      <circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#metalGold)"/>
      <circle cx="{cx}" cy="{cy}" r="{r - 6}" fill="none" stroke="#F3E6C8" stroke-width="1.4"/>
      <circle cx="{cx}" cy="{cy}" r="3" fill="#F8F1E4"/>
    '''


def neckline(deep=980, y=270, left=250, right=550, stroke="url(#metalRose)", width=1.7):
    p0, p1, p2 = (left, y), ((left + right) / 2, deep), (right, y)
    return chain(p0, p1, p2, stroke, width), p0, p1, p2


def pearls_along(p0, p1, p2, count, radius, tone="white"):
    parts = []
    for i in range(count):
        t = 0.5 if count == 1 else i / (count - 1)
        if count > 2:
            t = 0.18 + (0.64 * i / (count - 1))
        x, y = quad(p0, p1, p2, t)
        parts.append(pearl(x, y, radius, tone))
    return "".join(parts)


def draw_piece(kind):
    if kind == "rose":
        path, *_ = neckline(stroke="url(#metalRose)")
        return path + rose(400, 620, 58, ["#E8C4C0", "#D7A3A0", "#C98986"]) + pearl(400, 618, 8)
    if kind == "choker":
        path, p0, p1, p2 = neckline(deep=620, y=340, left=210, right=590, stroke="url(#metalRose)", width=1.5)
        blooms = []
        for i, t in enumerate((0.28, 0.4, 0.5, 0.6, 0.72)):
            x, y = quad(p0, p1, p2, t)
            blooms.append(rose(x, y + 8, 18 + (i % 2) * 4, ["#E7C8C4", "#D4A09C"]))
        return path + "".join(blooms)
    if kind == "locket":
        path, *_ = neckline(stroke="url(#metalGold)")
        return path + locket(400, 640)
    if kind == "bow":
        path, *_ = neckline(deep=760, stroke="#C8B4A4", width=1.3)
        return path + bow(400, 560) + pearl(400, 562, 7, "blush")
    if kind == "collar":
        parts = []
        for i, x in enumerate(range(230, 590, 42)):
            y = 430 + abs(x - 400) * 0.15
            parts.append(
                f'<path d="M {x} {y} Q {x + 21} {y + 54} {x + 42} {y}" fill="none" stroke="#C5BFB6" stroke-width="2"/>'
            )
            parts.append(pearl(x + 21, y + 28, 4))
        return "".join(parts)
    if kind == "ribbon":
        path, p0, p1, p2 = neckline(deep=900, stroke="#E7D3CC", width=1.2)
        return path + pearls_along(p0, p1, p2, 11, 11, "cream") + bow(470, 500, "#F0D2CE", "#D7AAA6")
    if kind == "cameo":
        path, *_ = neckline(stroke="url(#metalGold)")
        return path + cameo(400, 630)
    if kind == "key":
        path, *_ = neckline(stroke="url(#metalGold)", width=1.4)
        return path + key(400, 600)
    if kind == "coins":
        path, *_ = neckline(deep=860, stroke="url(#metalGold)")
        return path + coin(360, 560, 20) + coin(430, 640, 26) + coin(390, 730, 18)
    if kind == "triple":
        parts = []
        for extra, count, radius in ((0, 9, 10), (36, 11, 11), (72, 13, 12)):
            p0, p1, p2 = (230, 300 + extra * 0.2), (400, 820 + extra * 6), (570, 300)
            parts.append(chain(p0, p1, p2, "#E7D5CC", 1.2))
            parts.append(pearls_along(p0, p1, p2, count, radius))
        return "".join(parts)
    if kind == "seed":
        path, p0, p1, p2 = neckline(deep=980, stroke="#E6D5CC", width=1.1)
        return path + pearls_along(p0, p1, p2, 17, 5.5)
    if kind == "baroque":
        path, *_ = neckline(deep=900, stroke="#D9D3CC", width=1.3)
        return path + pearl(400, 660, 34, "cream") + f'<ellipse cx="392" cy="648" rx="10" ry="14" fill="#fff" opacity="0.35" transform="rotate(-20 392 648)"/>'
    return ""


def svg_wrap(inner, w, h, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img">
  <title>{title}</title>
  <defs>
    <radialGradient id="vg" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#FFFCF8"/>
      <stop offset="72%" stop-color="#F6F1EA"/>
      <stop offset="100%" stop-color="#EFE4DA"/>
    </radialGradient>
    <linearGradient id="metalRose" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F0D7C6"/><stop offset="50%" stop-color="#C6A288"/><stop offset="100%" stop-color="#A6856A"/>
    </linearGradient>
    <linearGradient id="metalGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F3E4BF"/><stop offset="50%" stop-color="#C4AE7A"/><stop offset="100%" stop-color="#9C8654"/>
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8EFE8"/><stop offset="55%" stop-color="#F3E4DA"/><stop offset="100%" stop-color="#E7D5C8"/>
    </linearGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#vg)"/>
  {inner}
</svg>'''


def product_svg(kind, title):
    return svg_wrap(draw_piece(kind), 800, 1000, title)


def scene_roses():
    parts = [
        leaf(180, 760, 34, 16, -30, "#9AAE96"),
        leaf(620, 780, 40, 18, 24, "#7E917C"),
        rose(220, 620, 70, ["#E7C2BE", "#D39A96", "#C48984"]),
        rose(560, 700, 86, ["#F0D0CB", "#E0AFAA", "#C98986"]),
        rose(390, 540, 36, ["#E8C8C4", "#D7A7A2"]),
    ]
    path, *_ = neckline()
    return "".join(parts) + path + rose(400, 620, 28, ["#E8C4C0", "#C98986"])


def scene_lace():
    parts = []
    for i, x in enumerate(range(120, 700, 46)):
        y = 280 + (i % 3) * 8
        parts.append(f'<path d="M {x} {y} Q {x + 23} {y + 36} {x + 46} {y}" fill="none" stroke="#E4D5CC" stroke-width="1.4"/>')
    return "".join(parts) + draw_piece("bow")


def scene_vintage():
    return draw_piece("cameo") + key(250, 760) + coin(560, 780, 28)


def scene_pearls():
    return draw_piece("triple")


def garden(w, h, mobile=False):
    """Open white gate, roses at the sides, pale center for the wordmark."""
    cx = w / 2
    posts_half = w * (0.28 if mobile else 0.34)
    left = cx - posts_half
    right = cx + posts_half
    arch_y = h * (0.18 if mobile else 0.16)
    post_top = h * (0.34 if mobile else 0.36)
    post_h = h * 0.50
    parts = [f'<rect width="{w}" height="{h}" fill="url(#sky)"/>']
    # pale opening so the HTML title stays readable
    parts.append(
        f'<ellipse cx="{cx}" cy="{h * 0.48}" rx="{w * 0.24}" ry="{h * 0.30}" fill="#FBF6F1" opacity="0.72"/>'
    )
    # side gardens
    clusters = []
    if mobile:
        spots = [
            (w * 0.16, h * 0.42, 54), (w * 0.08, h * 0.58, 70), (w * 0.20, h * 0.72, 48),
            (w * 0.84, h * 0.40, 50), (w * 0.92, h * 0.60, 74), (w * 0.80, h * 0.76, 46),
            (w * 0.30, h * 0.86, 36), (w * 0.70, h * 0.88, 40),
        ]
    else:
        spots = [
            (w * 0.08, h * 0.38, 70), (w * 0.16, h * 0.55, 90), (w * 0.06, h * 0.72, 64),
            (w * 0.22, h * 0.78, 48), (w * 0.92, h * 0.36, 76), (w * 0.84, h * 0.56, 96),
            (w * 0.94, h * 0.74, 60), (w * 0.78, h * 0.80, 46),
            (w * 0.32, h * 0.90, 34), (w * 0.68, h * 0.92, 38),
        ]
    for x, y, r in spots:
        clusters.append(leaf(x - r * 0.8, y + 10, r * 0.45, r * 0.22, -40))
        clusters.append(leaf(x + r * 0.7, y + 16, r * 0.4, r * 0.2, 30, "#7E917C"))
        clusters.append(rose(x, y, r, ["#F0D2CC", "#E0A9A4", "#C98986", "#D7A7A4"]))
    parts.append("".join(clusters))
    # path
    parts.append(
        f'<path d="M {cx - w * 0.08} {h} L {cx - w * 0.02} {h * 0.62} L {cx + w * 0.02} {h * 0.62} L {cx + w * 0.08} {h} Z" fill="#F7F1EA" opacity="0.85"/>'
    )
    # gate frame, open in the middle
    parts.append(
        f'<path d="M {left} {post_top} Q {cx} {arch_y} {right} {post_top}" fill="none" stroke="#E7D9CF" stroke-width="18" stroke-linecap="round"/>'
    )
    parts.append(
        f'<path d="M {left} {post_top} Q {cx} {arch_y - h * 0.015} {right} {post_top}" fill="none" stroke="#FFFcf8" stroke-width="10" stroke-linecap="round"/>'
    )
    for px in (left, right):
        parts.append(
            f'<rect x="{px - 8}" y="{post_top - 6}" width="16" height="{post_h}" rx="4" fill="#F7F4EF" stroke="#E6D9CF"/>'
        )
        parts.append(f'<circle cx="{px}" cy="{post_top - 4}" r="7" fill="#FFFcf8" stroke="#E6D9CF"/>')
    # outward scrolls at the base, kept low
    scroll_y = post_top + post_h - 10
    parts.append(
        f'<path d="M {left} {scroll_y} C {left - 50} {scroll_y}, {left - 70} {scroll_y + 40}, {left - 30} {scroll_y + 48}" fill="none" stroke="#F7F4EF" stroke-width="8" stroke-linecap="round"/>'
    )
    parts.append(
        f'<path d="M {right} {scroll_y} C {right + 50} {scroll_y}, {right + 70} {scroll_y + 40}, {right + 30} {scroll_y + 48}" fill="none" stroke="#F7F4EF" stroke-width="8" stroke-linecap="round"/>'
    )
    # a few climbing roses on the posts
    parts.append(rose(left - 24, post_top + post_h * 0.35, 28, ["#E8C4C0", "#C98986"]))
    parts.append(rose(right + 26, post_top + post_h * 0.42, 32, ["#F0D0CB", "#D7A09C"]))
    return svg_wrap("".join(parts), w, h, "A white garden gate and dusty roses")


def favicon():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#FBF8F4"/>
  <path d="M16 25c-1.2-2-6-4.2-6-8.2 0-2 1.4-3.4 3-3.4 1 0 1.8.6 2.2 1.4.4-.8 1.2-1.4 2.2-1.4 1.6 0 3 1.4 3 3.4 0 4-4.8 6.2-6 8.2z" fill="none" stroke="#C9B4C4" stroke-width="1.2"/>
  <path d="M8 20c2-6 4-9 8-11 4 2 6 5 8 11" fill="none" stroke="#9BB0C4" stroke-width="1.1"/>
</svg>'''


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)


def knock_out(src, dest):
    image = Image.open(src).convert("RGBA")
    arr = np.array(image)
    white = (arr[:, :, 0] > 247) & (arr[:, :, 1] > 247) & (arr[:, :, 2] > 247)
    labeled, _ = ndimage.label(white)
    border = set(labeled[0, :].tolist()) | set(labeled[-1, :].tolist()) | set(labeled[:, 0].tolist()) | set(labeled[:, -1].tolist())
    border.discard(0)
    if border:
        mask = np.isin(labeled, list(border))
        arr[mask, 3] = 0
    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 12)
    if len(xs) == 0:
        image.save(dest)
        return
    pad = 90
    left = max(int(xs.min()) - pad, 0)
    top = max(int(ys.min()) - pad, 0)
    right = min(int(xs.max()) + pad, arr.shape[1])
    bottom = min(int(ys.max()) + pad, arr.shape[0])
    cropped = Image.fromarray(arr[top:bottom, left:right], "RGBA")
    dest.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(dest)


def page(rel, title, name, slug=""):
    slug_attr = f' data-slug="{slug}"' if slug else ""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="BiJulia is handmade jewelry for romantic souls — necklaces and shell stickers inspired by vintage gardens, lace, and forgotten treasures.">
<meta name="theme-color" content="#FBF8F4">
<title>{title}</title>
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
</head>
<body data-page="{name}"{slug_attr}>
<noscript><p class="noscript">Please enable JavaScript to enter the BiJulia atelier.</p></noscript>
<script type="module" src="/js/main.js"></script>
</body>
</html>
"""
    write(ROOT / rel, html)


def main():
    data = (ROOT / "js" / "data.js").read_text()
    products = re.findall(
        r'slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*price:\s*\d+,\s*category:\s*"([^"]+)"',
        data,
    )
    collections = re.findall(r'slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*blurb:', data)
    articles = re.findall(r'slug:\s*"([^"]+)",\s*title:\s*"([^"]+)"', data)

    for slug, name, category in products:
        if category != "necklace":
            continue
        kind = DESIGN[slug]
        write(ROOT / "images" / "products" / f"{slug}.svg", product_svg(kind, name))

    scenes = {
        "rose-garden": scene_roses(),
        "lace-ribbons": scene_lace(),
        "vintage-treasures": scene_vintage(),
        "pearl-collection": scene_pearls(),
    }
    for slug, inner in scenes.items():
        write(ROOT / "images" / "collections" / f"{slug}.svg", svg_wrap(inner, 800, 1000, slug))

    write(ROOT / "images" / "about.svg", svg_wrap(scene_lace() + rose(180, 760, 48, ["#E8C4C0", "#C98986"]), 1200, 900, "Studio table"))
    write(ROOT / "images" / "journal" / "garden.svg", svg_wrap(scene_roses(), 1200, 800, "Garden notes"))
    write(ROOT / "images" / "journal" / "lace.svg", svg_wrap(scene_lace(), 1200, 800, "Lace study"))
    write(ROOT / "images" / "journal" / "pearls.svg", svg_wrap(scene_pearls(), 1200, 800, "Pearls"))
    write(ROOT / "images" / "hero.svg", garden(1600, 1000, mobile=False))
    write(ROOT / "images" / "hero-mobile.svg", garden(900, 1400, mobile=True))
    write(ROOT / "images" / "favicon.svg", favicon())

    knock_out(
        ROOT / "assets" / "stickers" / "Light pink shell.pdf.pdf.png",
        ROOT / "images" / "stickers" / "light-pink-shell.png",
    )
    knock_out(
        ROOT / "assets" / "stickers" / "Dark blue shell.pdf.pdf.png",
        ROOT / "images" / "stickers" / "dark-blue-shell.png",
    )

    page("index.html", "BiJulia — Handmade jewelry for romantic souls", "home")
    page("shop/index.html", "Shop — BiJulia", "shop")
    page("cart/index.html", "Your Bag — BiJulia", "cart")
    page("wishlist/index.html", "Wishlist — BiJulia", "wishlist")
    page("checkout/index.html", "Request an Order — BiJulia", "checkout")
    page("about/index.html", "About — BiJulia", "about")
    page("journal/index.html", "Journal — BiJulia", "journal")
    page("customer-care/index.html", "Customer Care — BiJulia", "care")
    page("collections/index.html", "Collections — BiJulia", "collections")
    page("404.html", "Page not found — BiJulia", "not-found")
    for slug, name in collections:
        page(f"collections/{slug}/index.html", f"{name} — BiJulia", "collection", slug)
    for slug, title in articles:
        page(f"journal/{slug}/index.html", f"{title} — BiJulia", "journal-article", slug)
    for slug, name, _category in products:
        page(f"product/{slug}/index.html", f"{name} — BiJulia", "product", slug)
    print(f"products {len(products)} collections {len(collections)} articles {len(articles)}")


if __name__ == "__main__":
    main()
