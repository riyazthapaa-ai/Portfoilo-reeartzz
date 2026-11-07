#!/usr/bin/env python3
"""
Cartoon evidence board (Rick and Morty art style: flat colours, thick black
outlines) with kill-scene polaroids, red string, pins, sticky notes, a knife,
a pistol, a portal gun and a newspaper clipping, plus camera moves that dive
into a photo and turn it into the actual scene.

Photos sit on the board blurred (mystery); when the camera dives into one it
sharpens and "comes alive" into the full-frame scene, so the next cut can go
straight to the episode clip that starts on that frame.

  python3 evidence_board.py intro       # title section: board + 3D title, then dive into #1
  python3 evidence_board.py transition --from 1 --to 3     # kill-to-kill transition
  python3 evidence_board.py still       # PNG of the whole board

Photo slots, their images and captions are in SLOTS below. To use a real kill
frame for a slot, point its "img" at a screenshot of the first frame of that
scene's clip (and the transition's --from-img at the LAST frame of the previous
clip).
"""
import argparse, math, os, subprocess, wave
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, *p)
F_MARK = A("fonts", "PermanentMarker-Regular.ttf")
F_BANG = A("fonts", "Bangers-Regular.ttf")
OUT_W, OUT_H, FPS, SR = 1920, 1080, 30, 48000
WW, WH = 5760, 3240           # world (board) units
RS = 2                        # board raster scale (pixels per world unit)
SS = 3                        # hero-photo sprite scale

INK = (22, 22, 28)
WALL = (46, 58, 66)
CORK = (201, 147, 91)
CORK_DK = (172, 118, 66)
CORK_LT = (222, 172, 112)
WOOD = (122, 74, 38)
WOOD_LT = (156, 101, 58)
PAPER = (243, 239, 226)
NOTE = (247, 227, 122)
NOTE_DK = (228, 203, 92)
RED = (214, 40, 40)
RED_DK = (140, 18, 22)

# ------------------------------------------------------------------ layout
# img: source image; variant: crop/tint for placeholder blur photos
SLOTS = {
    1: dict(c=(1350, 1330), w=760, rot=-4, cap="S1E1  FRANK", img="assets/board/s1e1_frank.webp"),
    2: dict(c=(2700, 1200), w=560, rot=5, cap="S1E3  ???", img="assets/board/s1e1_frank.webp",
            variant=dict(flip=True, crop=(0.35, 0.0, 1.0, 0.8), tint=(1.1, 0.75, 0.75))),
    3: dict(c=(4400, 1050), w=680, rot=-6, cap="S7E5", img="assets/board/rick_bloody.webp"),
    4: dict(c=(4650, 2280), w=640, rot=4, cap="S7E5  ???", img="assets/board/rick_dead.png"),
    5: dict(c=(2550, 2300), w=540, rot=-7, cap="S?E?", img="assets/board/rick_dead.png",
            variant=dict(flip=True, crop=(0.0, 0.2, 0.6, 1.0), tint=(0.8, 0.9, 1.15))),
    6: dict(c=(780, 2380), w=520, rot=6, cap="???", img="assets/board/rick_bloody.webp",
            variant=dict(flip=True, crop=(0.2, 0.0, 0.85, 0.7), tint=(1.15, 0.9, 0.7))),
    7: dict(c=(3580, 1720), w=480, rot=3, cap="S2?", img="assets/board/s1e1_frank.webp",
            variant=dict(crop=(0.0, 0.1, 0.55, 0.9), tint=(0.75, 1.1, 0.85))),
    8: dict(c=(5020, 1650), w=430, rot=-3, cap="S4?", img="assets/board/rick_dead.png",
            variant=dict(crop=(0.45, 0.0, 1.0, 0.75), tint=(1.0, 0.8, 1.1))),
}
NOTES = [  # (centre, rot, text, colour)
    ((830, 1000), -8, "#1", INK), ((3150, 870), 6, "#2", INK), ((4960, 640), -5, "#3", INK),
    ((3150, 2350), 7, "DEAD?", RED_DK), ((5040, 2800), -6, "STILL\nDEAD??", RED_DK),
    ((2950, 1700), -4, "CLONE?", INK), ((1200, 1870), 9, "?", RED_DK), ((4320, 2850), 4, "#4", INK),
]
STRINGS = [(1, 2), (2, 3), (3, 8), (8, 4), (4, 7), (7, 2), (1, 6), (6, "news"), (5, 1), (5, 4), (7, 5)]
NEWS = dict(c=(1650, 2500), w=900, h=640, rot=-3)
HEADER = dict(c=(2880, 470), w=1750, h=230, rot=-1.5)

# ------------------------------------------------------------------ helpers
def rot2(deg):
    """2x2 matrix for a visual counter-clockwise rotation in y-down coordinates (PIL convention)."""
    r = math.radians(deg); c, s = math.cos(r), math.sin(r)
    return np.array([[c, s], [-s, c]])

def font(path, size):
    return ImageFont.truetype(path, max(8, int(size)))

def load_rgb(path):
    return Image.open(A(path)).convert("RGB")

def cover_169(im, w, h):
    """Crop to 16:9 (cover) and resize to w x h."""
    iw, ih = im.size; tr = 16 / 9
    if iw / ih > tr:
        nw = int(ih * tr); x0 = (iw - nw) // 2; im = im.crop((x0, 0, x0 + nw, ih))
    else:
        nh = int(iw / tr); y0 = (ih - nh) // 2; im = im.crop((0, y0, iw, y0 + nh))
    return im.resize((max(1, int(w)), max(1, int(h))), Image.LANCZOS)

def slot_image(sid):
    """Full-colour 'alive' image of a slot (16:9)."""
    s = SLOTS[sid]; im = load_rgb(s["img"]); v = s.get("variant")
    if v:
        iw, ih = im.size
        if "crop" in v:
            x0, y0, x1, y1 = v["crop"]; im = im.crop((int(x0 * iw), int(y0 * ih), int(x1 * iw), int(y1 * ih)))
        if v.get("flip"):
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if "tint" in v:
            a = np.asarray(im, np.float32) * np.array(v["tint"]); im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return cover_169(im, 1920, 1080)

def print_look(im, blur_frac):
    """Faded photo-print look (+ optional blur as a fraction of width)."""
    a = np.asarray(im, np.float32) / 255
    a = a * 0.82 + 0.07
    a = a * np.array([1.05, 1.0, 0.88])
    out = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    if blur_frac > 0:
        out = out.filter(ImageFilter.GaussianBlur(blur_frac * im.size[0]))
    return out

def outline_w(sc, k=1.0):
    return max(2, int(round(6 * sc * k)))

# ------------------------------------------------------------------ polaroid
def polaroid_geom(w):
    b = 0.045 * w; bot = 0.17 * w; h = w * 9 / 16
    PW, PH = w + 2 * b, h + b + bot
    return b, bot, h, PW, PH

def draw_polaroid(sid, sc, blur=True, with_pin=True):
    """Unrotated polaroid (RGBA PIL) at sc px/world-unit."""
    s = SLOTS[sid]; w = s["w"]
    b, bot, h, PW, PH = polaroid_geom(w)
    pad = int(40 * sc)
    im = Image.new("RGBA", (int(PW * sc) + 2 * pad, int(PH * sc) + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0, y0 = pad, pad
    ow = outline_w(sc)
    d.rectangle([x0, y0, x0 + PW * sc, y0 + PH * sc], fill=PAPER, outline=INK, width=ow)
    # paper shading strip (cartoon single-tone shadow on bottom/right)
    d.rectangle([x0 + ow, y0 + PH * sc - 0.035 * w * sc, x0 + PW * sc - ow, y0 + PH * sc - ow], fill=(222, 216, 198))
    photo = print_look(slot_image(sid), 0.035 if blur else 0.0)
    pw_, ph_ = int(w * sc), int(h * sc)
    im.paste(photo.resize((pw_, ph_), Image.LANCZOS), (int(x0 + b * sc), int(y0 + b * sc)))
    d.rectangle([x0 + b * sc, y0 + b * sc, x0 + b * sc + pw_, y0 + b * sc + ph_], outline=INK, width=max(2, ow // 2))
    fnt = font(F_MARK, 0.085 * w * sc)
    d.text((x0 + PW * sc / 2, y0 + (b + h + bot / 2) * sc), s["cap"], font=fnt, fill=(31, 42, 68), anchor="mm")
    if with_pin:
        draw_pin(d, x0 + PW * sc / 2, y0 + b * 0.55 * sc, 0.032 * w * sc, (225, 50, 50), ow)
    return im, (x0 + PW * sc / 2, y0 + PH * sc / 2)

def draw_pin(d, x, y, r, col, ow):
    d.ellipse([x - r * 0.6 + r * 0.5, y - r * 0.6 + r * 0.9, x + r * 0.6 + r * 0.5, y + r * 0.6 + r * 0.9],
              fill=(0, 0, 0, 90))
    d.ellipse([x - r, y - r, x + r, y + r], fill=col, outline=INK, width=ow)
    hr = r * 0.32
    d.ellipse([x - r * 0.45 - hr, y - r * 0.45 - hr, x - r * 0.45 + hr, y - r * 0.45 + hr], fill=(255, 255, 255))

def slot_points(sid):
    s = SLOTS[sid]; b, bot, h, PW, PH = polaroid_geom(s["w"]); R = rot2(s["rot"]); c = np.array(s["c"], float)
    pin = c + R @ np.array([0, b * 0.55 - PH / 2])
    img_c = c + R @ np.array([0, b + h / 2 - PH / 2])
    return pin, img_c

# ------------------------------------------------------------------ props
def poly(d, pts, fill, ow, outline=INK):
    d.polygon([tuple(p) for p in pts], fill=fill, outline=outline, width=ow)

def item_layer(size, sc):
    im = Image.new("RGBA", (int(size[0] * sc), int(size[1] * sc)), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)

def draw_knife(sc):
    im, d = item_layer((960, 220), sc); ow = outline_w(sc)
    S = lambda pts: [(x * sc, (y + 110) * sc) for x, y in pts]
    poly(d, S([(20, -55), (320, -55), (330, 55), (20, 55)]), (107, 62, 38), ow)           # handle
    for x in (90, 180, 270):
        d.ellipse([(x - 14) * sc, (110 - 14) * sc, (x + 14) * sc, (110 + 14) * sc], fill=(200, 200, 205), outline=INK, width=ow // 2)
    poly(d, S([(320, -70), (360, -70), (360, 70), (320, 70)]), (150, 155, 162), ow)       # bolster
    poly(d, S([(360, -62), (790, -62), (900, -20), (935, 12), (880, 45), (360, 62)]), (218, 223, 228), ow)
    poly(d, S([(360, 18), (890, 30), (880, 45), (360, 62)]), (170, 177, 186), 0, None)   # edge shade
    d.line(S([(380, -48), (770, -48)]), fill=(255, 255, 255), width=int(9 * sc))
    for (x, y, r) in [(905, 10, 34), (860, 30, 26), (800, 25, 20)]:                      # blood
        d.ellipse([(x - r) * sc, (y + 110 - r) * sc, (x + r) * sc, (y + 110 + r) * sc], fill=RED, outline=RED_DK, width=ow // 2)
    d.rectangle([840 * sc, 135 * sc, 860 * sc, 200 * sc], fill=RED)
    d.ellipse([832 * sc, 190 * sc, 868 * sc, 220 * sc], fill=RED)
    return im

def draw_pistol(sc):
    im, d = item_layer((760, 420), sc); ow = outline_w(sc)
    S = lambda pts: [(x * sc, y * sc) for x, y in pts]
    poly(d, S([(410, 150), (560, 150), (600, 390), (450, 405)]), (107, 62, 38), ow)        # grip
    for k in range(4):
        y = 200 + k * 45
        d.line(S([(450 + k * 6, y), (545 + k * 9, y)]), fill=(80, 45, 28), width=int(6 * sc))
    d.arc([330 * sc, 120 * sc, 470 * sc, 260 * sc], 20, 180, fill=INK, width=ow * 2)       # trigger guard
    poly(d, S([(395, 150), (415, 150), (405, 215)]), (60, 64, 72), ow // 2)               # trigger
    poly(d, S([(40, 70), (640, 70), (660, 90), (660, 160), (40, 160)]), (90, 97, 107), ow)  # slide
    poly(d, S([(10, 92), (45, 92), (45, 140), (10, 140)]), (60, 64, 72), ow)              # muzzle
    d.line(S([(70, 88), (620, 88)]), fill=(150, 158, 168), width=int(10 * sc))
    for x in range(480, 640, 30):
        d.line(S([(x, 100), (x, 150)]), fill=(60, 64, 72), width=int(6 * sc))
    return im

def draw_portal_gun(sc):
    im, d = item_layer((640, 330), sc); ow = outline_w(sc)
    S = lambda pts: [(x * sc, y * sc) for x, y in pts]
    d.rounded_rectangle(S([(60, 110), (470, 270)]), radius=50 * sc, fill=(232, 235, 236), outline=INK, width=ow)
    poly(d, S([(470, 140), (600, 165), (600, 215), (470, 240)]), (200, 205, 208), ow)     # nozzle
    d.ellipse(S([(580, 160), (630, 220)]), fill=(140, 255, 90), outline=INK, width=ow)
    d.rounded_rectangle(S([(110, 40), (400, 115)]), radius=35 * sc, fill=(130, 240, 70), outline=INK, width=ow)
    d.rounded_rectangle(S([(130, 52), (380, 72)]), radius=10 * sc, fill=(210, 255, 170))
    d.ellipse(S([(150, 160), (220, 230)]), fill=(220, 60, 50), outline=INK, width=ow)     # dial
    d.line(S([(185, 195), (205, 172)]), fill=INK, width=ow)
    d.rounded_rectangle(S([(250, 180), (430, 215)]), radius=10 * sc, fill=(170, 175, 178), outline=INK, width=ow // 2)
    return im

def draw_tape(sc, w=220, h=70):
    im = Image.new("RGBA", (int(w * sc), int(h * sc)), (236, 224, 190, 185))
    d = ImageDraw.Draw(im)
    for x in range(0, int(w * sc), int(18 * sc)):
        d.line([(x, 0), (x + 6 * sc, 6 * sc)], fill=(210, 196, 160, 200), width=int(3 * sc))
    return im

def draw_note(text, colour, sc, size=300):
    im = Image.new("RGBA", (int(size * sc), int(size * sc)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    ow = outline_w(sc); s = size * sc
    d.polygon([(0, 0), (s, 0), (s, s * 0.82), (s * 0.82, s), (0, s)], fill=NOTE, outline=INK, width=ow)
    d.rectangle([ow, ow, s - ow, s * 0.18], fill=NOTE_DK)
    d.polygon([(s, s * 0.82), (s * 0.82, s), (s * 0.84, s * 0.84)], fill=(214, 190, 80), outline=INK, width=ow // 2)
    lines = text.split("\n")
    fs = s * (0.42 if len(lines) == 1 and len(text) <= 3 else 0.2 if len(lines) == 1 else 0.19)
    d.multiline_text((s / 2, s * 0.56), text, font=font(F_MARK, fs), fill=colour, anchor="mm", align="center", spacing=4)
    return im

def draw_paper(w, h, sc, kind):
    im = Image.new("RGBA", (int(w * sc), int(h * sc)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    ow = outline_w(sc); W_, H_ = w * sc, h * sc
    d.rectangle([0, 0, W_ - 1, H_ - 1], fill=(237, 230, 211), outline=INK, width=ow)
    if kind == "news":
        d.text((W_ / 2, 66 * sc), "INTERDIMENSIONAL TIMES", font=font(F_BANG, 72 * sc), fill=INK, anchor="mm")
        d.line([(30 * sc, 105 * sc), (W_ - 30 * sc, 105 * sc)], fill=INK, width=ow)
        d.text((W_ / 2, 165 * sc), "TEEN FROZEN SOLID", font=font(F_BANG, 92 * sc), fill=INK, anchor="mm")
        d.text((W_ / 2, 245 * sc), "SHATTERED IN SCHOOL HALLWAY", font=font(F_BANG, 46 * sc), fill=(70, 70, 70), anchor="mm")
        ph = print_look(slot_image(1), 0.05).convert("L").convert("RGB").resize((int(330 * sc), int(186 * sc)))
        im.paste(ph, (int(40 * sc), int(290 * sc)))
        d.rectangle([40 * sc, 290 * sc, 370 * sc, 476 * sc], outline=INK, width=ow // 2)
        for k in range(9):
            y = (300 + k * 34) * sc
            d.line([(400 * sc, y), ((860 - (k % 3) * 40) * sc, y)], fill=(150, 145, 135), width=int(12 * sc))
        for k in range(4):
            y = (510 + k * 30) * sc
            d.line([(40 * sc, y), ((860 - (k % 2) * 90) * sc, y)], fill=(150, 145, 135), width=int(12 * sc))
    else:
        d.text((W_ / 2, H_ / 2), "CASE FILE:  WHO STAYED DEAD?", font=font(F_MARK, 88 * sc), fill=RED_DK, anchor="mm")
    return im

def paste_rot(canvas, item, centre, rot, sc, shadow=True):
    r = item.rotate(rot, resample=Image.BICUBIC, expand=True)
    x = int(centre[0] * sc - r.size[0] / 2); y = int(centre[1] * sc - r.size[1] / 2)
    if shadow:
        a = np.asarray(r)[..., 3].astype(np.float32) * 0.38
        sh = Image.new("RGBA", r.size, (20, 10, 5, 0)); sh.putalpha(Image.fromarray(a.astype(np.uint8)))
        canvas.alpha_composite(sh, (x + int(16 * sc), y + int(22 * sc)))
    canvas.alpha_composite(r, (x, y))

# ------------------------------------------------------------------ board
def build_board(sc=RS, seed=5):
    rng = np.random.default_rng(seed)
    im = Image.new("RGBA", (WW * sc, WH * sc), WALL + (255,))
    d = ImageDraw.Draw(im)
    for k in range(9):                                          # wall panel lines
        x = k * WW / 8 * sc
        d.line([(x, 0), (x, WH * sc)], fill=(40, 51, 58), width=int(10 * sc))
    ow = outline_w(sc, 1.4)
    fx0, fy0, fx1, fy1 = 300, 220, WW - 300, WH - 220
    d.rounded_rectangle([fx0 * sc + 30 * sc, fy0 * sc + 40 * sc, fx1 * sc + 30 * sc, fy1 * sc + 40 * sc],
                        radius=40 * sc, fill=(25, 32, 36))     # board shadow on wall
    d.rounded_rectangle([fx0 * sc, fy0 * sc, fx1 * sc, fy1 * sc], radius=40 * sc, fill=WOOD, outline=INK, width=ow)
    d.rounded_rectangle([(fx0 + 22) * sc, (fy0 + 18) * sc, (fx1 - 22) * sc, (fy0 + 40) * sc], radius=10 * sc, fill=WOOD_LT)
    bx0, by0, bx1, by1 = fx0 + 80, fy0 + 80, fx1 - 80, fy1 - 80
    d.rectangle([bx0 * sc, by0 * sc, bx1 * sc, by1 * sc], fill=CORK, outline=INK, width=ow)
    for _ in range(9000):                                        # cork speckles
        x = rng.uniform(bx0 + 10, bx1 - 10); y = rng.uniform(by0 + 10, by1 - 10); r = rng.uniform(3, 9)
        d.ellipse([(x - r) * sc, (y - r * 0.7) * sc, (x + r) * sc, (y + r * 0.7) * sc],
                  fill=CORK_DK if rng.random() < 0.7 else CORK_LT)

    paste_rot(im, draw_paper(HEADER["w"], HEADER["h"], sc, "header"), HEADER["c"], HEADER["rot"], sc)
    paste_rot(im, draw_paper(NEWS["w"], NEWS["h"], sc, "news"), NEWS["c"], NEWS["rot"], sc)
    for sid in SLOTS:
        p, _ = draw_polaroid(sid, sc)
        paste_rot(im, p, SLOTS[sid]["c"], SLOTS[sid]["rot"], sc)
    # props, taped on
    for item, c, r in [(draw_knife(sc), (1380, 640), -10), (draw_pistol(sc), (3780, 2640), 14),
                       (draw_portal_gun(sc), (640, 1640), 78)]:
        paste_rot(im, item, c, r, sc)
        for off in (-0.28, 0.28):
            R = rot2(r); tc = np.array(c) + R @ np.array([off * item.size[0] / sc, 0])
            paste_rot(im, draw_tape(sc), tc, r + 80, sc, shadow=False)
    for c, r, t, col in NOTES:
        paste_rot(im, draw_note(t, col, sc), c, r, sc)
    # red marker scribbles: X over #5, circle around note #1
    d = ImageDraw.Draw(im)
    _, ic5 = slot_points(5)
    for dx, dy in ((-200, -120), (200, -120)):
        d.line([((ic5[0] + dx) * sc, (ic5[1] + dy) * sc), ((ic5[0] - dx) * sc, (ic5[1] - dy) * sc)], fill=RED, width=int(18 * sc))
    for k in range(2):
        d.ellipse([(650 + k * 12) * sc, (830 - k * 8) * sc, (1010 - k * 6) * sc, (1170 + k * 10) * sc], outline=RED, width=int(12 * sc))
    # strings + pins
    pins = {sid: slot_points(sid)[0] for sid in SLOTS}
    pins["news"] = np.array(NEWS["c"]) + rot2(NEWS["rot"]) @ np.array([0, -NEWS["h"] / 2 + 14])
    for a_, b_ in STRINGS:
        draw_string(d, pins[a_], pins[b_], sc)
    for k, p in pins.items():
        draw_pin(d, p[0] * sc, p[1] * sc, 22 * sc, [(225, 50, 50), (60, 180, 90), (240, 200, 40)][hash(str(k)) % 3],
                 outline_w(sc))
    return np.asarray(im.convert("RGB"))

def draw_string(d, p0, p1, sc):
    p0, p1 = np.array(p0, float), np.array(p1, float)
    mid = (p0 + p1) / 2 + np.array([0, 0.07 * np.linalg.norm(p1 - p0)])
    ts = np.linspace(0, 1, 40)[:, None]
    pts = (1 - ts) ** 2 * p0 + 2 * (1 - ts) * ts * mid + ts ** 2 * p1
    P = [(x * sc, y * sc) for x, y in pts]
    d.line(P, fill=RED_DK, width=int(16 * sc), joint="curve")
    d.line(P, fill=RED, width=int(10 * sc), joint="curve")
    d.line([(x, y - 2 * sc) for x, y in P], fill=(255, 120, 110), width=int(3 * sc))

# ------------------------------------------------------------------ camera renderer
class Renderer:
    def __init__(self, hero_ids):
        print("building board ...")
        base = build_board(RS)
        self.mips = [(RS, base)]
        s, img = RS, base
        while s > 0.3:
            s /= 2; img = cv2.resize(img, (img.shape[1] // 2, img.shape[0] // 2), interpolation=cv2.INTER_AREA)
            self.mips.append((s, img))
        self.heroes = {}
        for sid in hero_ids:   # high-res sprite pairs (blurred print, sharp print)
            pb, cb = draw_polaroid(sid, SS, blur=True)
            ps, _ = draw_polaroid(sid, SS, blur=False)
            pair = []
            for p in (pb, ps):
                a = np.asarray(p).astype(np.float32) / 255
                a[..., :3] *= a[..., 3:]                       # premultiply
                lv = [(SS, a)]; s, x = SS, a
                while s > 0.4:
                    s /= 2; x = cv2.resize(x, (x.shape[1] // 2, x.shape[0] // 2), interpolation=cv2.INTER_AREA)
                    lv.append((s, x))
                pair.append(lv)
            self.heroes[sid] = (pair, np.array(cb))
        self.alive = {sid: np.asarray(slot_image(sid), np.float32) / 255 for sid in hero_ids}

    @staticmethod
    def _pick(levels, need):
        best = levels[0]
        for s, img in levels:
            if s >= need:
                best = (s, img)
        return best

    def view(self, cx, cy, z, phi, sharp=None):
        """Render camera (centre cx,cy in world, zoom z out-px per world unit, rotation phi deg).
        sharp: {sid: 0..1} un-blur amount per hero sprite."""
        R = rot2(phi); O = np.array([OUT_W / 2, OUT_H / 2]); c = np.array([cx, cy])
        s, img = self._pick(self.mips, z)
        A2 = R * (z / s); b = O - R @ (z * c)
        out = cv2.warpAffine(img, np.hstack([A2, b[:, None]]).astype(np.float32), (OUT_W, OUT_H),
                             flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=WALL)
        out = out.astype(np.float32) / 255
        for sid, (pair, sc_c) in self.heroes.items():
            u = (sharp or {}).get(sid, 0.0)
            spr = None
            for k, w_ in ((0, 1 - u), (1, u)):
                if w_ <= 0.001:
                    continue
                ls, lim = self._pick(pair[k], z)
                f = ls / SS
                Rt = rot2(SLOTS[sid]["rot"])
                A3 = (z / ls) * (R @ Rt)
                pc = np.array(SLOTS[sid]["c"], float)
                b3 = R @ (z * (pc - c)) + O - A3 @ (sc_c * f)
                w = cv2.warpAffine(lim, np.hstack([A3, b3[:, None]]).astype(np.float32), (OUT_W, OUT_H),
                                   flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
                spr = w * w_ if spr is None else spr + w * w_
            if spr is not None:
                out = spr[..., :3] + out * (1 - spr[..., 3:])
        return out

    def hero_fill(self, sid):
        """Camera that frames the hero photo's image area exactly (upright)."""
        _, ic = slot_points(sid)
        return ic[0], ic[1], OUT_W / SLOTS[sid]["w"], -SLOTS[sid]["rot"]

# ------------------------------------------------------------------ motion helpers
def ease_io(x):
    x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)

def ease_io5(x):
    x = min(max(x, 0.0), 1.0); return x ** 3 * (x * (6 * x - 15) + 10)

def zoom_to(cam0, cam1, e_pos, e_zoom):
    """Interpolate so cam1's centre glides to the screen centre while zooming in log space."""
    x0, y0, z0, r0 = cam0; x1, y1, z1, r1 = cam1
    z = math.exp(math.log(z0) + (math.log(z1) - math.log(z0)) * e_zoom)
    off0 = (np.array([x1, y1]) - np.array([x0, y0])) * z0       # target's screen offset at start
    off = off0 * (1 - e_pos)
    c = np.array([x1, y1]) - off / z
    return c[0], c[1], z, r0 + (r1 - r0) * e_pos

def grade_vignette(img, amt=0.35):
    yy, xx = np.ogrid[:OUT_H, :OUT_W]
    r = np.sqrt(((xx - OUT_W / 2) / (OUT_W / 2)) ** 2 + ((yy - OUT_H / 2) / (OUT_H / 2)) ** 2)
    v = np.clip(1 - amt * np.clip(r - 0.45, 0, 1) ** 1.5, 0, 1)
    warm = np.dstack([np.full_like(v, 1.04), np.ones_like(v), np.full_like(v, 0.94)])
    return img * v[..., None] * warm

VIG = None
def finish(img):
    global VIG
    if VIG is None:
        VIG = grade_vignette(np.ones((OUT_H, OUT_W, 3), np.float32), 0.45)
    return np.clip(img * VIG, 0, 1)

def alive_frame(R, sid, push=1.0):
    a = R.alive[sid]
    if push != 1.0:
        M = np.float32([[push, 0, OUT_W / 2 * (1 - push)], [0, push, OUT_H / 2 * (1 - push)]])
        a = cv2.warpAffine(a, M, (OUT_W, OUT_H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return a

# ------------------------------------------------------------------ SFX
class Sfx:
    def __init__(self, dur):
        self.n = int(dur * SR); self.a = np.zeros(self.n); self.rng = np.random.default_rng(9)

    def add(self, t, sig, g=1.0):
        s = int(t * SR); e = min(self.n, s + len(sig))
        if 0 <= s < self.n:
            self.a[s:e] += g * sig[:e - s]

    def noise(self, L, lo, hi):
        x = self.rng.normal(0, 1, max(8, int(L * SR))); X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
        X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, len(x)); return y / (np.abs(y).max() + 1e-9)

    def whoosh(self, t, L, g=0.5, lo=250, hi=6000, rising=True):
        w = self.noise(L, lo, hi); env = np.linspace(0, 1, len(w)) ** 2 if rising else np.hanning(len(w))
        self.add(t, w * env * np.sin(np.linspace(0, np.pi, len(w))) ** 0.5, g)

    def thump(self, t, g=0.6):
        x = np.arange(int(0.6 * SR)) / SR
        self.add(t, np.sin(2 * np.pi * (40 * x + 50 * (1 - np.exp(-x * 9)) / 9)) * np.exp(-x / 0.16), g)

    def shutter(self, t, g=0.35):
        for dt in (0.0, 0.06):
            self.add(t + dt, self.noise(0.03, 2000, 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR / 0.006), g)

    def paper(self, t, g=0.25):
        self.add(t, self.noise(0.18, 1200, 7000) * np.hanning(int(0.18 * SR)) * (0.5 + 0.5 * self.rng.random(int(0.18 * SR))), g)

    def write(self, path):
        a = np.tanh(self.a * 1.1) * 0.85
        st = (np.stack([a, a], 1) * 32767).astype(np.int16)
        with wave.open(path, "wb") as f:
            f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())

# ------------------------------------------------------------------ encoding
def encoder(path, wav, extra_audio=None):
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OUT_W}x{OUT_H}",
           "-r", str(FPS), "-i", "-", "-i", wav]
    if extra_audio:
        cmd += ["-i", extra_audio, "-filter_complex", "[1:a][2:a]amix=inputs=2:normalize=0:duration=first[a]", "-map", "0:v", "-map", "[a]"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
            "-shortest", path]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)

def overlay_frames(path):
    """Yield straight RGBA float frames of the transparent title overlay (VP9 alpha WebM or ProRes)."""
    dec = ["-c:v", "libvpx-vp9"] if path.endswith(".webm") else []
    p = subprocess.Popen(["ffmpeg", "-loglevel", "error"] + dec + ["-i", path, "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
                         stdout=subprocess.PIPE)
    sz = OUT_W * OUT_H * 4
    while True:
        b = p.stdout.read(sz)
        if len(b) < sz:
            break
        yield np.frombuffer(b, np.uint8).reshape(OUT_H, OUT_W, 4).astype(np.float32) / 255

def mblur(render, t, dt, n):
    if n <= 1:
        return render(t)
    return sum(render(t + dt * (k / (n - 1) - 0.5)) for k in range(n)) / n

# ------------------------------------------------------------------ intro: board + title, dive into #1
def render_intro(out=A("board_intro.mp4"), title_dur=4.25, dive=1.45, hero=1,
                 overlay=A("title_card_overlay.webm"), hold=0.0):
    R = Renderer([hero])
    dur = title_dur + dive + hold
    n = int(round(dur * FPS))
    camA = (2700, 1500, 0.40, 1.5)        # wide, slightly rotated
    camB = (3050, 1650, 0.47, -1.0)       # slow drift while the title plays
    fill = R.hero_fill(hero)
    sfx = Sfx(dur)
    sfx.whoosh(title_dur - 0.15, dive * 0.8, 0.55)
    sfx.paper(title_dur + dive - 0.35)
    sfx.thump(title_dur + dive - 0.12, 0.5)
    sfx.shutter(title_dur + dive - 0.05)
    wav = out + ".wav"; sfx.write(wav)
    has_ov = overlay and os.path.exists(overlay)
    ov_audio = None
    if has_ov:
        ov_audio = out + ".ov.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", overlay, "-vn", "-ac", "2", "-ar", str(SR), ov_audio], check=True)
    enc = encoder(out, wav, ov_audio)
    ovs = overlay_frames(overlay) if has_ov else iter(())

    def cam_at(t):
        if t < title_dur:
            e = ease_io(t / title_dur)
            x = camA[0] + (camB[0] - camA[0]) * e; y = camA[1] + (camB[1] - camA[1]) * e
            z = camA[2] + (camB[2] - camA[2]) * e; r = camA[3] + (camB[3] - camA[3]) * e
            return x + 6 * math.sin(t * 1.7), y + 5 * math.sin(t * 1.3 + 1), z, r
        k = (t - title_dur) / dive
        return zoom_to(cam_at(title_dur - 1e-6), fill, ease_io5(k), ease_io5(min(1, k * 1.05)))

    for i in range(n):
        t = i / FPS
        k = clamp((t - title_dur) / dive)
        sharp = {hero: ease_io(clamp((k - 0.45) / 0.45))}
        fast = 0.15 < k < 0.9
        img = mblur(lambda tt: R.view(*cam_at(min(tt, dur)), sharp=sharp), t, 0.5 / FPS, 9 if fast else 1)
        img = finish(img)
        if t < title_dur:                               # dim the board under the title
            img *= 0.62 + 0.38 * ease_io((t - (title_dur - 0.3)) / 0.3)
        if k > 0.8:                                     # photo comes alive into the real scene
            a = ease_io((k - 0.8) / 0.2)
            img = img * (1 - a) + alive_frame(R, hero) * a
            img = img + (1 - img) * (0.35 * math.sin(math.pi * a))   # soft flash
        if t >= title_dur + dive:
            img = alive_frame(R, hero)
        ov = next(ovs, None)
        if ov is not None:
            img = ov[..., :3] * ov[..., 3:] + img * (1 - ov[..., 3:])
        enc.stdin.write((np.clip(img, 0, 1) * 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    for p in (wav, ov_audio):
        if p and os.path.exists(p):
            os.remove(p)
    return out

# ------------------------------------------------------------------ transition: scene A -> board -> scene B
def render_transition(a, b, out=None, from_img=None, to_img=None, dur=2.6):
    out = out or A(f"transition_{a}_to_{b}.mp4")
    if from_img:
        SLOTS[a] = dict(SLOTS[a], img=from_img, variant=None)
    if to_img:
        SLOTS[b] = dict(SLOTS[b], img=to_img, variant=None)
    R = Renderer([a, b])
    n = int(round(dur * FPS))
    fa, fb = R.hero_fill(a), R.hero_fill(b)
    pa, pb = np.array(fa[:2]), np.array(fb[:2])
    T1, T2 = 0.75, 1.65                     # pull-back ends, whip ends
    zmid = 0.55
    mid_a = (fa[0], fa[1], zmid, fa[3] * 0.3)
    mid_b = (fb[0], fb[1], zmid, fb[3] * 0.3)
    sfx = Sfx(dur)
    sfx.paper(0.05); sfx.whoosh(0.0, 0.7, 0.35, rising=False)
    sfx.whoosh(T1 - 0.1, T2 - T1 + 0.15, 0.6, 300, 8000, rising=False)
    sfx.whoosh(T2 - 0.05, dur - T2 - 0.1, 0.5)
    sfx.paper(dur - 0.3); sfx.thump(dur - 0.1, 0.45); sfx.shutter(dur - 0.05)
    wav = out + ".wav"; sfx.write(wav)
    enc = encoder(out, wav)

    def cam_at(t):
        if t < T1:
            e = ease_io5(t / T1)
            # pull back from photo A (inverse dive)
            x, y, z, r = zoom_to(mid_a, fa, 1 - e, 1 - e)
            return x, y, z, r
        if t < T2:
            e = ease_io5((t - T1) / (T2 - T1))
            c = pa + (pb - pa) * e
            z = zmid * (1 - 0.18 * math.sin(math.pi * e))       # breathe out mid-whip
            r = mid_a[3] + (mid_b[3] - mid_a[3]) * e + 3 * math.sin(math.pi * e)
            return c[0], c[1], z, r
        e = (t - T2) / (dur - T2)
        return zoom_to(mid_b, fb, ease_io5(e), ease_io5(min(1, e * 1.05)))

    for i in range(n):
        t = i / FPS
        ka = clamp(t / T1); kb = clamp((t - T2) / (dur - T2))
        sharp = {a: 1 - ease_io(clamp(ka / 0.6)), b: ease_io(clamp((kb - 0.45) / 0.45))}
        fast = 0.12 < t < dur - 0.25
        img = mblur(lambda tt: R.view(*cam_at(min(max(tt, 0), dur)), sharp=sharp), t, 0.6 / FPS, 9 if fast else 1)
        img = finish(img)
        if ka < 0.25:                                    # leave scene A: it drains into the print
            q = 1 - ease_io(ka / 0.25)
            img = img * (1 - q) + alive_frame(R, a) * q
        if kb > 0.8:                                     # arrive in scene B
            q = ease_io((kb - 0.8) / 0.2)
            img = img * (1 - q) + alive_frame(R, b) * q
            img = img + (1 - img) * (0.35 * math.sin(math.pi * q))
        enc.stdin.write((np.clip(img, 0, 1) * 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait(); os.remove(wav)
    return out

def clamp(x):
    return min(max(x, 0.0), 1.0)

def render_still(out=A("board_still.png")):
    img = build_board(1)
    Image.fromarray(img).save(out)
    return out

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    i = sub.add_parser("intro"); i.add_argument("--title-dur", type=float, default=4.25)
    i.add_argument("--dive", type=float, default=1.45); i.add_argument("--hero", type=int, default=1)
    i.add_argument("--overlay", default=A("title_card_overlay.webm")); i.add_argument("-o", default=A("board_intro.mp4"))
    tr = sub.add_parser("transition"); tr.add_argument("--from", dest="a", type=int, default=1)
    tr.add_argument("--to", dest="b", type=int, default=3); tr.add_argument("--from-img"); tr.add_argument("--to-img")
    tr.add_argument("--dur", type=float, default=2.6); tr.add_argument("-o")
    st = sub.add_parser("still"); st.add_argument("-o", default=A("board_still.png"))
    a = p.parse_args()
    if a.cmd == "intro":
        print(render_intro(a.o, a.title_dur, a.dive, a.hero, a.overlay))
    elif a.cmd == "transition":
        print(render_transition(a.a, a.b, a.o, a.from_img, a.to_img, a.dur))
    else:
        print(render_still(a.o))
