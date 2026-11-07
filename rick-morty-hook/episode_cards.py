#!/usr/bin/env python3
"""
Episode title cards: one transparent PNG per episode, Rick and Morty art style
(flat colours, thick black outlines, flat drop shadow) with clean, readable
lettering (Inter Display).

  [ portal badge "S1" ] [ cyan tab "SEASON 1 · EPISODE 3" ]
                        [ cream plate "Anatomy Park"       ]

  python3 episode_cards.py                 # all episodes -> episode_cards/
  python3 episode_cards.py --only S1E3     # one card
  python3 episode_cards.py --scale 1       # half size (default 2 = crisp at 4K)

Cards are tightly cropped with a little transparent padding, so they can be
scaled and placed anywhere in the edit.
"""
import argparse, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
F_BLACK = os.path.join(HERE, "fonts", "InterDisplay-Black.otf")
F_XBOLD = os.path.join(HERE, "fonts", "InterDisplay-ExtraBold.otf")
OUT = os.path.join(HERE, "episode_cards")

INK = (20, 20, 26, 255)
CREAM = (250, 246, 232, 255)
CREAM_SH = (226, 219, 196, 255)
CYAN = (0, 181, 204, 255)
CYAN_DK = (0, 140, 160, 255)
GREEN = (151, 206, 76, 255)
GREEN_DK = (78, 138, 18, 255)
GREEN_LT = (214, 245, 150, 255)
SHADOW = (0, 0, 0, 110)

EPISODES = {
    1: ["Pilot", "Lawnmower Dog", "Anatomy Park", "M. Night Shaym-Aliens!", "Meeseeks and Destroy",
        "Rick Potion #9", "Raising Gazorpazorp", "Rixty Minutes", "Something Ricked This Way Comes",
        "Close Rick-counters of the Rick Kind", "Ricksy Business"],
    2: ["A Rickle in Time", "Mortynight Run", "Auto Erotic Assimilation", "Total Rickall", "Get Schwifty",
        "The Ricks Must Be Crazy", "Big Trouble in Little Sanchez", "Interdimensional Cable 2: Tempting Fate",
        "Look Who's Purging Now", "The Wedding Squanchers"],
    3: ["The Rickshank Rickdemption", "Rickmancing the Stone", "Pickle Rick",
        "Vindicators 3: The Return of Worldender", "The Whirly Dirly Conspiracy", "Rest and Ricklaxation",
        "The Ricklantis Mixup", "Morty's Mind Blowers", "The ABC's of Beth", "The Rickchurian Mortydate"],
    4: ["Edge of Tomorty: Rick Die Rickpeat", "The Old Man and the Seat", "One Crew over the Crewcoo's Morty",
        "Claw and Hoarder: Special Ricktim's Morty", "Rattlestar Ricklactica", "Never Ricking Morty",
        "Promortyus", "The Vat of Acid Episode", "Childrick of Mort", "Star Mort Rickturn of the Jerri"],
    5: ["Mort Dinner Rick Andre", "Mortyplicity", "A Rickconvenient Mort", "Rickdependence Spray",
        "Amortycan Grickfitti", "Rick & Morty's Thanksploitation Spectacular", "Gotron Jerrysis Rickvangelion",
        "Rickternal Friendshine of the Spotless Mort", "Forgetting Sarick Mortshall", "Rickmurai Jack"],
    6: ["Solaricks", "Rick: A Mort Well Lived", "Bethic Twinstinct", "Night Family", "Final DeSmithation",
        "JuRicksic Mort", "Full Meta Jackrick", "Analyze Piss", "A Rick in King Mortur's Mort",
        "Ricktional Mortpoon's Rickmas Mortcation"],
    7: ["How Poopy Got His Poop Back", "The Jerrick Trap", "Air Force Wong", "That's Amorte", "Unmortricken",
        "Rickfending Your Mort", "Wet Kuat Amortican Summer", "Rise of the Numbericons: The Movie",
        "Mort: Ragnarick", "Fear No Mort"],
    8: ["Summer of All Fears", "Valkyrick", "The Rick, the Mort & the Ugly", "The Last Temptation of Jerry",
        "Cryo Mort a Rickver", "The CuRicksous Case of Bethjamin Button", "Ricker than Fiction", "Nomortland",
        "Morty Daddy", "Hot Rick"],
}

def font(path, size):
    return ImageFont.truetype(path, int(size))

def text_w(f, s):
    l, t, r, b = f.getbbox(s); return r - l

def wrap(title, f, max_w):
    """One line if it fits, else split into two balanced lines (prefer after ':')."""
    if text_w(f, title) <= max_w:
        return [title]
    if ":" in title:
        a, b = title.split(":", 1)
        a, b = a + ":", b.strip()
        if text_w(f, a) <= max_w and text_w(f, b) <= max_w:
            return [a, b]
    words = title.split(); best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        m = max(text_w(f, a), text_w(f, b))
        if best is None or m < best[0]:
            best = (m, [a, b])
    return best[1]

def portal(d, cx, cy, r, ow):
    """Flat cartoon portal: green disc with a spiral and a bright core."""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GREEN, outline=INK, width=ow)
    for k in range(3):                                   # spiral arms
        pts = []
        for i in range(60):
            t = i / 59
            a = k * 2 * math.pi / 3 + t * 3.2
            rr = r * (0.12 + 0.78 * t)
            pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
        d.line(pts, fill=GREEN_DK, width=max(3, int(r * 0.11)), joint="curve")
    d.ellipse([cx - r * 0.38, cy - r * 0.38, cx + r * 0.38, cy + r * 0.38], fill=GREEN_LT)

def card(season, ep, title, sc=2):
    pad = 24 * sc
    ow = 7 * sc                                           # outline width
    sh = 10 * sc                                          # flat shadow offset
    f_title = font(F_BLACK, 74 * sc)
    f_tab = font(F_XBOLD, 34 * sc)
    f_badge = font(F_BLACK, 70 * sc)
    lines = wrap(title, f_title, 1250 * sc)
    asc, desc = f_title.getmetrics()
    line_h = int((asc + desc) * 0.98)
    tw = max(text_w(f_title, s) for s in lines)
    plate_w = tw + 70 * sc
    plate_h = line_h * len(lines) + 46 * sc
    tab_txt = f"SEASON {season}  ·  EPISODE {ep}"
    tab_w = text_w(f_tab, tab_txt) + 50 * sc
    tab_h = 62 * sc
    R = 108 * sc                                          # portal badge radius

    plate_x = pad + 2 * R - 34 * sc                       # plate tucks under the badge
    plate_y = pad + tab_h - 14 * sc
    W = int(max(plate_x + plate_w, plate_x + 60 * sc + tab_w) + pad + sh)
    H = int(max(plate_y + plate_h, pad + 2 * R) + pad + sh)
    cy_badge = (plate_y + plate_h / 2 + pad + R) / 2

    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ds = ImageDraw.Draw(shadow)

    def shapes(d, dx=0, dy=0, flat=None):
        # plate
        d.rounded_rectangle([plate_x + dx, plate_y + dy, plate_x + plate_w + dx, plate_y + plate_h + dy],
                            radius=26 * sc, fill=flat or CREAM, outline=flat or INK, width=ow)
        # tab
        tx, ty = plate_x + 60 * sc, pad
        d.rounded_rectangle([tx + dx, ty + dy, tx + tab_w + dx, ty + tab_h + dy], radius=18 * sc,
                            fill=flat or CYAN, outline=flat or INK, width=ow)
        # badge
        cx = pad + R
        if flat:
            d.ellipse([cx - R + dx, cy_badge - R + dy, cx + R + dx, cy_badge + R + dy], fill=flat)
        return tx, ty, cx

    shapes(ds, sh, sh, SHADOW)
    im.alpha_composite(shadow)
    d = ImageDraw.Draw(im)
    tx, ty, cx = shapes(d)
    # plate: cartoon single-tone shade along the bottom
    d.rounded_rectangle([plate_x + ow, plate_y + plate_h - 16 * sc, plate_x + plate_w - ow, plate_y + plate_h - ow],
                        radius=12 * sc, fill=CREAM_SH)
    # tab: darker lower band
    d.rounded_rectangle([tx + ow, ty + tab_h * 0.62, tx + tab_w - ow, ty + tab_h - ow], radius=8 * sc, fill=CYAN_DK)
    d.text((tx + tab_w / 2, ty + tab_h / 2 + 1 * sc), tab_txt, font=f_tab, fill=(255, 255, 255, 255), anchor="mm",
           stroke_width=int(4 * sc), stroke_fill=INK)
    # title
    y0 = plate_y + (plate_h - line_h * len(lines)) / 2
    for i, s in enumerate(lines):
        d.text((plate_x + 38 * sc, y0 + i * line_h + asc * 0.5 + 6 * sc), s, font=f_title, fill=INK, anchor="lm")
    # portal badge on top
    portal(d, cx, cy_badge, R, ow)
    d.text((cx, cy_badge + 2 * sc), f"S{season}", font=f_badge, fill=(255, 255, 255, 255), anchor="mm",
           stroke_width=int(9 * sc), stroke_fill=INK)
    return im

def safe(s):
    return "".join(c if c.isalnum() else "_" for c in s).strip("_").replace("__", "_")

def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--only", help="e.g. S1E3")
    p.add_argument("--scale", type=float, default=2)
    p.add_argument("-o", "--outdir", default=OUT)
    a = p.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    made = []
    for s, eps in EPISODES.items():
        for e, title in enumerate(eps, 1):
            tag = f"S{s}E{e}"
            if a.only and a.only.upper() != tag:
                continue
            im = card(s, e, title, a.scale)
            fn = os.path.join(a.outdir, f"S{s:02d}E{e:02d}_{safe(title)}.png")
            im.save(fn, optimize=True)
            made.append(fn)
    print(f"{len(made)} cards -> {a.outdir}")
    return made

if __name__ == "__main__":
    main()
