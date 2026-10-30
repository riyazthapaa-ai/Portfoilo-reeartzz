"""MO ARTZ intro - puppet rig + ink motion graphics renderer."""
import json, math, os, sys
import numpy as np, cv2, soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "images", "1.webp")
OUT = os.path.join(HERE, "frames")
os.makedirs(OUT, exist_ok=True)

W, H, FPS, DUR = 1080, 1920, 24, 10.0
N = int(FPS * DUR)
PAPER = np.array([234, 230, 222], np.uint8)          # warm off-white (RGB)
INK = np.array([16, 14, 14], np.uint8)
PINK = np.array([226, 176, 216], np.uint8)
rng = np.random.default_rng(7)

def F(name, size):
    return ImageFont.truetype(os.path.join(HERE, "fonts", name + ".woff"), size)

# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def lerp(a, b, t): return a + (b - a) * t
def ease_io(t): t = clamp(t); return t * t * (3 - 2 * t)
def ease_out_back(t, s=2.2):
    t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s)
def ease_out_elastic(t):
    t = clamp(t)
    if t in (0, 1): return t
    return 2 ** (-9 * t) * math.sin((t * 10 - 0.75) * (2 * math.pi) / 3) + 1
def prog(t, a, b): return clamp((t - a) / (b - a))
def pop(t, t0, d=0.28): return ease_out_back(prog(t, t0, t0 + d))

# ---------------------------------------------------------------- audio
voice, SR = sf.read(os.path.join(HERE, "tts", "voice.wav"))
timing = json.load(open(os.path.join(HERE, "tts", "timing.json")))
win = SR // FPS
env = np.array([np.sqrt(np.mean(voice[i*win:(i+1)*win]**2)) if i*win < len(voice) else 0 for i in range(N)])
env = env / (env.max() + 1e-9)
env = np.convolve(env, [0.25, 0.5, 0.25], mode="same")

# ---------------------------------------------------------------- character prep
src = np.array(Image.open(SRC).convert("L")).astype(np.float32)
SH, SW = src.shape
ink = np.clip((228 - src) / (228 - 70), 0, 1)

def erase_box(x0, y0, x1, y1): ink[y0:y1, x0:x1] = 0
for b in [(212, 730, 312, 848), (312, 822, 332, 842), (728, 618, 840, 728), (738, 1000, 862, 1148),
          (684, 120, 712, 160), (776, 836, 802, 884), (172, 638, 192, 656), (286, 1140, 348, 1232),
          (248, 1068, 266, 1086), (370, 1030, 392, 1060)]:
    erase_box(*b)
# pupils, mouth, original neck (redrawn procedurally)
yy, xx = np.mgrid[0:SH, 0:SW]
for cx, cy, rx, ry in [(446, 520, 16, 23), (667, 460, 16, 22)]:
    ink[((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 < 1] = 0
erase_box(504, 594, 548, 611)
erase_box(522, 655, 566, 702)

binm = (ink > 0.35).astype(np.uint8)
closed = cv2.morphologyEx(binm, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
ff = closed.copy(); mask = np.zeros((SH + 2, SW + 2), np.uint8)
cv2.floodFill(ff, mask, (0, 0), 1)
holes = (ff == 0).astype(np.uint8)
sil = np.clip(closed + holes, 0, 1)
sil = cv2.erode(sil, np.ones((5, 5), np.uint8))
closed2 = cv2.morphologyEx(binm, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
ff2 = closed2.copy(); m2 = np.zeros((SH + 2, SW + 2), np.uint8); cv2.floodFill(ff2, m2, (0, 0), 1)
sil2 = np.clip(closed2 + (ff2 == 0), 0, 1)
sil[1090:] = sil2[1090:]
sil = cv2.GaussianBlur(sil.astype(np.float32), (5, 5), 0)
# eyes/face interior must be opaque paper
for cx, cy, rx, ry in [(405, 508, 70, 80), (620, 458, 74, 86)]:
    sil[((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 < 1] = 1

def part_rgba(m):
    rgba = np.zeros((SH, SW, 4), np.float32)
    a_fill = sil * m; a_ink = ink * m
    rgb = PAPER[None, None, :] * (1 - a_ink[..., None]) + INK[None, None, :] * a_ink[..., None]
    rgba[..., :3] = rgb
    rgba[..., 3] = np.clip(np.maximum(a_fill, a_ink), 0, 1) * 255
    return rgba.astype(np.uint8)

head_m = ((yy < 653) | ((yy < 702) & ((xx < 470) | (xx > 622)))).astype(np.float32)
legs_m = (yy >= 1042).astype(np.float32)
torso_m = (1 - head_m) * (1 - legs_m)
HEAD = part_rgba(head_m); TORSO = part_rgba(torso_m); LEGS = part_rgba(legs_m)

EYES = [dict(c=(405, 508), r=(66, 76), p=(446, 520)), dict(c=(620, 458), r=(70, 82), p=(667, 460))]
MOUTH = (527, 603)
NECK_PIVOT = (542, 654)   # head pivot (head space)
WAIST = (540, 1040)
FEET = (540, 1430)
SHOULDERS = [(452, 884), (628, 918)]  # viewer-left, viewer-right (torso space)

# ---------------------------------------------------------------- affine helpers (3x3)
def T(x, y): return np.array([[1, 0, x], [0, 1, y], [0, 0, 1]], float)
def R(deg): c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg)); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], float)
def S(sx, sy): return np.array([[sx, 0, 0], [0, sy, 0], [0, 0, 1]], float)
def about(M, p): return T(*p) @ M @ T(-p[0], -p[1])
def apply(M, p): v = M @ np.array([p[0], p[1], 1.0]); return (v[0], v[1])

def warp(rgba, M, canvas):
    out = cv2.warpAffine(rgba, M[:2], (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    over(canvas, out)

def over(canvas, layer):
    a = layer[..., 3:4].astype(np.float32) / 255
    canvas[...] = canvas * (1 - a) + layer[..., :3].astype(np.float32) * a

# ---------------------------------------------------------------- drawing helpers (on float RGB canvas)
def wobble_line(pts, amp=1.4, seed=0):
    r = np.random.default_rng(seed)
    pts = np.asarray(pts, float)
    return pts + r.normal(0, amp, pts.shape)

def stroke(canvas, pts, w=5, col=INK, seed=0, passes=2, amp=1.2):
    pts = np.asarray(pts, float)
    if len(pts) < 2: return
    for k in range(passes):
        p = wobble_line(pts, amp, seed + k * 31)
        ww = max(1, int(round(w * (1.0 if k == 0 else 0.55))))
        cv2.polylines(canvas, [np.round(p * 4).astype(np.int32)], False, tuple(float(c) for c in col), ww, cv2.LINE_AA, shift=2)

def partial(pts, t):
    pts = np.asarray(pts, float)
    if t >= 1: return pts
    if t <= 0: return pts[:1]
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
    L = cum[-1] * t; i = np.searchsorted(cum, L) - 1; i = max(0, min(i, len(seg) - 1))
    f = (L - cum[i]) / (seg[i] + 1e-9)
    return np.vstack([pts[:i + 1], pts[i] + (pts[i + 1] - pts[i]) * f])

def bez(p0, p1, p2, n=24):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2 = map(np.array, (p0, p1, p2))
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2

def tube(canvas, pts, w_out, w_in, seed=0):
    """outlined noodle: ink outline, paper fill."""
    p = np.round(np.asarray(pts) * 4).astype(np.int32)
    cv2.polylines(canvas, [p], False, tuple(map(float, INK)), w_out, cv2.LINE_AA, shift=2)
    cv2.polylines(canvas, [p], False, tuple(map(float, PAPER)), w_in, cv2.LINE_AA, shift=2)
    # sketchy extra edge strokes
    d = np.gradient(np.asarray(pts, float), axis=0); n = np.stack([-d[:, 1], d[:, 0]], 1)
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
    off = (w_out + w_in) / 4
    stroke(canvas, np.asarray(pts) + n * off, 2, seed=seed, passes=1, amp=0.9)
    stroke(canvas, np.asarray(pts) - n * off, 2, seed=seed + 5, passes=1, amp=0.9)

HANDS = {  # finger (angle offset deg, length) list; thumb flagged by angle sign side
    "open":  [(-62, 22), (-24, 30), (0, 33), (24, 30), (50, 26)],
    "point": [(0, 42), (-70, 18), (30, 9), (50, 8), (65, 8)],
    "gun":   [(0, 40), (-85, 26), (35, 9), (55, 8), (70, 8)],
    "fist":  [(-60, 12), (-20, 10), (5, 10), (28, 10), (50, 10)],
    "peace": [(-12, 36), (14, 36), (-70, 14), (40, 9), (60, 8)],
}

def hand(canvas, c, ang, pose, sc, mirror=False, seed=0):
    r = 17 * sc
    fingers = HANDS[pose]
    for i, (da, ln) in enumerate(fingers):
        a = math.radians(ang + (-da if mirror else da))
        p0 = (c[0] + math.cos(a) * r * 0.6, c[1] + math.sin(a) * r * 0.6)
        p1 = (c[0] + math.cos(a) * (r + ln * sc), c[1] + math.sin(a) * (r + ln * sc))
        tube(canvas, bez(p0, ((p0[0]+p1[0])/2, (p0[1]+p1[1])/2), p1, 6), int(13 * sc), int(6 * sc), seed + i)
    cv2.circle(canvas, (int(c[0] * 4), int(c[1] * 4)), int(r * 4 + 6), tuple(map(float, INK)), -1, cv2.LINE_AA, shift=2)
    cv2.circle(canvas, (int(c[0] * 4), int(c[1] * 4)), int(r * 4 - 10), tuple(map(float, PAPER)), -1, cv2.LINE_AA, shift=2)
    stroke(canvas, [(c[0] + math.cos(t) * (r + 1), c[1] + math.sin(t) * (r + 1)) for t in np.linspace(0, 6.6, 20)], 2, seed=seed + 9, passes=1)

# ---------------------------------------------------------------- arm keyframes
# per arm: (time, dx, dy [torso-space offset of hand from shoulder], bend, pose, hand-angle-offset)
REST_L = (-38, 205, -30, "open", 0)
REST_R = (36, 200, 30, "open", 0)
def K(*rows): return [(r[0],) + tuple(r[1:]) for r in rows]
ARM_L = K(  # viewer-left arm (character's right) -> pointing at self / presenting
    (0.00, *REST_L), (0.45, *REST_L),
    (0.70, 70, 10, 50, "point", 170),     # "I'm Mori" point to chest
    (1.10, 70, 10, 50, "point", 170),
    (1.35, 55, -20, 60, "fist", 0),       # "little guy" thumbs self
    (1.80, 60, -10, 60, "point", 175),
    (2.15, -170, -230, -40, "open", 0),   # present MO ARTZ up-left
    (2.80, -175, -240, -40, "open", 0),
    (3.05, -150, -40, -60, "peace", 0),   # motion design
    (3.70, -160, -70, -60, "peace", 0),
    (3.95, -140, 30, -50, "open", 0),     # creative experiments jazz
    (4.70, -150, 10, -50, "open", 0),
    (5.05, -150, -20, -70, "open", 0),    # shrug
    (6.35, -150, -20, -70, "open", 0),
    (6.65, -40, 60, 40, "gun", 0),        # finger guns
    (7.0, -60, 40, 40, "gun", 0),
    (7.5, -50, 50, 40, "gun", 0),
    (8.0, -60, 40, 40, "gun", 0),
    (8.45, -60, 40, 40, "gun", 0),
    (8.75, -150, -330, -40, "open", 0),   # MOVE arms up
    (10.0, -150, -330, -40, "open", 0),
)
ARM_R = K(  # viewer-right arm -> waving
    (0.00, *REST_R), (0.05, *REST_R),
    (0.30, 150, -300, 60, "open", 0),     # wave
    (1.05, 150, -300, 60, "open", 0),
    (1.35, *REST_R), (2.05, *REST_R),
    (2.35, 120, -120, 50, "point", 0),    # point at logo
    (2.85, 120, -120, 50, "point", 0),
    (3.10, 150, -60, 60, "open", 0),
    (4.70, 160, -40, 60, "open", 0),
    (5.05, 155, -20, 70, "open", 0),      # shrug
    (6.35, 155, -20, 70, "open", 0),
    (6.65, 40, 60, -40, "gun", 0),
    (8.45, 40, 60, -40, "gun", 0),
    (8.75, 150, -330, 40, "open", 0),
    (10.0, 150, -330, 40, "open", 0),
)

def sample_arm(keys, t):
    for i in range(len(keys) - 1):
        a, b = keys[i], keys[i + 1]
        if a[0] <= t <= b[0]:
            u = ease_out_back((t - a[0]) / (b[0] - a[0] + 1e-9), 1.4)
            vals = [lerp(a[j], b[j], u) for j in (1, 2, 3)]
            pose = a[4] if u < 0.5 else b[4]
            hang = lerp(a[5], b[5], clamp(u))
            return vals + [pose, hang]
    k = keys[-1]; return [k[1], k[2], k[3], k[4], k[5]]

# ---------------------------------------------------------------- paper + boil
def paper_tex(seed):
    r = np.random.default_rng(seed)
    n = r.normal(0, 1, (H // 4, W // 4)).astype(np.float32)
    n = cv2.resize(cv2.GaussianBlur(n, (0, 0), 3), (W, H)) * 5
    fine = r.normal(0, 4, (H, W)).astype(np.float32)
    base = np.ones((H, W, 3), np.float32) * PAPER
    vy, vx = np.mgrid[0:H, 0:W]
    vig = 1 - 0.10 * (((vx - W / 2) / W) ** 2 + ((vy - H / 2) / H) ** 2) * 4
    return np.clip((base + (n + fine)[..., None]) * vig[..., None], 0, 255)
PAPERS = [paper_tex(s) for s in range(3)]

def boil_map(seed, amp=1.7):
    r = np.random.default_rng(100 + seed)
    def field():
        f = r.normal(0, 1, (H // 24 + 2, W // 24 + 2)).astype(np.float32)
        return cv2.resize(f, (W, H), interpolation=cv2.INTER_CUBIC) * amp
    gy, gx = np.mgrid[0:H, 0:W].astype(np.float32)
    return gx + field(), gy + field()
BOILS = [boil_map(s) for s in range(3)]

# ---------------------------------------------------------------- text sprites (ink-bled)
def text_sprite(txt, font, size, rot=0, bleed=2.2, col=INK, pad=40):
    ft = F(font, size)
    bb = ImageDraw.Draw(Image.new("L", (1, 1))).textbbox((0, 0), txt, font=ft)
    w, h = bb[2] - bb[0] + pad * 2, bb[3] - bb[1] + pad * 2
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).text((pad - bb[0], pad - bb[1]), txt, font=ft, fill=255)
    a = np.array(m).astype(np.float32)
    # rough organic edges: noise displace + blur + threshold
    r = np.random.default_rng(len(txt) * 13 + size)
    nz = cv2.resize(r.normal(0, 1, (h // 6 + 1, w // 6 + 1)).astype(np.float32), (w, h)) * 35
    a = cv2.GaussianBlur(a + nz, (0, 0), bleed)
    a = np.clip((a - 110) * 6, 0, 255)
    rgba = np.zeros((h, w, 4), np.uint8); rgba[..., :3] = col; rgba[..., 3] = a.astype(np.uint8)
    im = Image.fromarray(rgba)
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    return im

def place(canvas, sprite, cx, cy, scale=1.0, rot=0.0, alpha=1.0):
    if scale <= 0.02 or alpha <= 0.01: return
    im = sprite
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if abs(scale - 1) > 0.01:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BICUBIC)
    arr = np.array(im)
    if alpha < 1: arr = arr.copy(); arr[..., 3] = (arr[..., 3] * alpha).astype(np.uint8)
    x0, y0 = int(cx - arr.shape[1] / 2), int(cy - arr.shape[0] / 2)
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + arr.shape[1]), min(H, y0 + arr.shape[0])
    if xa >= xb or ya >= yb: return
    sub = arr[ya - y0:yb - y0, xa - x0:xb - x0]
    a = sub[..., 3:4].astype(np.float32) / 255
    canvas[ya:yb, xa:xb] = canvas[ya:yb, xa:xb] * (1 - a) + sub[..., :3] * a

TX = {
    "yo": text_sprite("yo,", "knewave", 230, 8),
    "im": text_sprite("i'm", "caveat-brush", 120, -6),
    "mori": text_sprite("MORI", "knewave", 280, -4),
    "little": text_sprite("(little guy)", "caveat-brush", 90, 10),
    "moartz": text_sprite("MO ARTZ", "knewave", 270, -3),
    "behind": text_sprite("the guy behind", "caveat-brush", 84, 2),
    "motion": text_sprite("motion design", "sedgwick-ave-display", 120, -8),
    "creative": text_sprite("creative", "knewave", 140, 6),
    "experiments": text_sprite("experiments", "sedgwick-ave-display", 110, 4),
    "questionable": text_sprite("questionable", "rubik-dirt", 112, -5),
    "decisions": text_sprite("design decisions", "caveat-brush", 105, 4),
    "qq": text_sprite("??", "knewave", 220, 12),
    "cool": text_sprite("cool people", "caveat-brush", 100, -4),
    "studios": text_sprite("studios", "knewave", 125, 5),
    "clients": text_sprite("clients", "caveat-brush", 110, -3),
    "connect": text_sprite("let's connect", "sedgwick-ave-display", 95, -2),
    "lets": text_sprite("let's make", "caveat-brush", 120, -4),
    "stuff": text_sprite("stuff", "knewave", 170, 4),
    "move": text_sprite("MOVE!", "knewave", 300, -6),
    "move_p": text_sprite("MOVE!", "knewave", 300, -6, col=PINK),
}

# ---------------------------------------------------------------- doodles
def star_pts(cx, cy, r, rot=0):
    return [(cx + math.cos(math.radians(rot + i * 144 - 90)) * r, cy + math.sin(math.radians(rot + i * 144 - 90)) * r) for i in range(6)]
def spiral_pts(cx, cy, r, turns=3, rot=0):
    t = np.linspace(0, turns * 2 * math.pi, 90)
    return np.stack([cx + np.cos(t + rot) * r * t / t[-1], cy + np.sin(t + rot) * r * t / t[-1]], 1)
def zig_pts(x, y, w, h, n=4):
    return [(x + (i % 2) * w, y + i * h / n) for i in range(n + 1)]
def circle_pts(cx, cy, rx, ry, turns=1.15, rot=0):
    t = np.linspace(0, turns * 2 * math.pi, 70) + rot
    wob = 1 + 0.04 * np.sin(t * 3)
    return np.stack([cx + np.cos(t) * rx * wob, cy + np.sin(t) * ry * wob], 1)
def flower(canvas, cx, cy, r, rot, t, seed):
    n = 6
    for i in range(n):
        if t * n < i: break
        a = math.radians(rot + i * 360 / n)
        tt = np.linspace(-0.55, 0.55, 18)
        pts = [(cx + math.cos(a + u) * r * math.cos(u * 2.6) , cy + math.sin(a + u) * r * math.cos(u * 2.6)) for u in tt]
        stroke(canvas, pts, 6, seed=seed + i)
    if t > 0.3:
        stroke(canvas, circle_pts(cx, cy, r * 0.22, r * 0.22, 1.1), 6, seed=seed + 40)
def arrow(canvas, p0, p1, bend, t, seed, w=6):
    mid = ((p0[0] + p1[0]) / 2 + bend[0], (p0[1] + p1[1]) / 2 + bend[1])
    pts = partial(bez(p0, mid, p1, 30), t)
    stroke(canvas, pts, w, seed=seed)
    if t >= 1:
        d = np.array(p1) - np.array(mid); d /= np.linalg.norm(d)
        for s in (1, -1):
            a = math.atan2(d[1], d[0]) + math.pi + s * 0.5
            stroke(canvas, [p1, (p1[0] + math.cos(a) * 34, p1[1] + math.sin(a) * 34)], w, seed=seed + s)
def check(canvas, cx, cy, t, seed):
    stroke(canvas, partial([(cx - 22, cy), (cx - 6, cy + 20), (cx + 30, cy - 30)], t), 8, seed=seed)
def blob(canvas, cx, cy, r, t, seed, col=INK):
    rr = np.random.default_rng(seed)
    k = rr.uniform(0.6, 1.4, 9)
    ang = np.linspace(0, 2 * math.pi, 9, endpoint=False)
    th = np.linspace(0, 2 * math.pi, 80)
    rad = np.interp(th, np.concatenate([ang, [2 * math.pi]]), np.concatenate([k, [k[0]]]))
    rad = cv2.GaussianBlur(rad.reshape(1, -1).astype(np.float32), (1, 9), 3).ravel()
    s = r * ease_out_elastic(t)
    pts = np.stack([cx + np.cos(th) * rad * s, cy + np.sin(th) * rad * s], 1)
    cv2.fillPoly(canvas, [np.round(pts * 4).astype(np.int32)], tuple(map(float, col)), cv2.LINE_AA, shift=2)
def speed_lines(canvas, cx, cy, t, seed, n=18, r0=520, r1=760):
    rr = np.random.default_rng(seed)
    for i in range(n):
        a = rr.uniform(0, 2 * math.pi); l = rr.uniform(0.4, 1)
        ph = (t * 3 + rr.uniform()) % 1
        a0 = r0 + ph * 160; a1 = a0 + (r1 - r0) * l * 0.5
        stroke(canvas, [(cx + math.cos(a) * a0, cy + math.sin(a) * a0), (cx + math.cos(a) * a1, cy + math.sin(a) * a1)], 6, seed=seed + i, passes=1)

# ---------------------------------------------------------------- character placement in stage
CHAR_SCALE = 0.98
CHAR_BASE = T(W / 2 - FEET[0] * CHAR_SCALE, 1875 - FEET[1] * CHAR_SCALE) @ S(CHAR_SCALE, CHAR_SCALE)

def blink_amt(t):
    for b in (1.25, 3.0, 5.0, 7.1, 8.5):
        if b <= t <= b + 0.14: return math.sin((t - b) / 0.14 * math.pi)
    return 0.0

def look_dir(t):
    keys = [(0, (0.1, 0.2)), (0.3, (0.6, -0.4)), (0.9, (0.6, -0.4)), (1.1, (0, 0.6)), (1.9, (0, 0.6)),
            (2.15, (-0.6, -0.7)), (2.8, (-0.6, -0.7)), (3.05, (-0.7, 0)), (3.8, (0.7, 0)), (4.7, (0.7, 0.1)),
            (4.95, (0.8, -0.6)), (5.6, (-0.8, -0.6)), (6.3, (-0.7, -0.5)), (6.6, (0.05, 0.1)), (8.5, (0.05, 0.1)),
            (8.8, (0, -0.8)), (10, (0, -0.8))]
    for i in range(len(keys) - 1):
        (a, pa), (b, pb) = keys[i], keys[i + 1]
        if a <= t <= b:
            u = ease_io(prog(t, a, a + min(0.18, b - a)))
            return (lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u))
    return keys[-1][1]

def draw_face(head, t, fi):
    h = head.copy().astype(np.float32)
    lx, ly = look_dir(t)
    bl = blink_amt(t)
    squint = 0.0
    for i, e in enumerate(EYES):
        cx, cy = e["c"]; rx, ry = e["r"]
        px, py = cx + lx * (rx - 22), cy + ly * (ry - 26)
        big = 1.25 if 8.75 < t < 10 else (0.8 if 5.0 < t < 6.4 and i == 1 else 1.0)  # quirky asym
        cv2.ellipse(h, (int(px * 4), int(py * 4)), (int(12 * big * 4), int(19 * big * 4)), 0, 0, 360, (*map(float, INK), 255.0), -1, cv2.LINE_AA, shift=2)
        cv2.circle(h, (int((px + 4) * 4), int((py - 7) * 4)), int(4 * 4), (*map(float, PAPER), 255.0), -1, cv2.LINE_AA, shift=2)
        if bl > 0.02:
            lid = int(ry * 2 * bl)
            sub = np.zeros_like(h[..., 0])
            cv2.ellipse(sub, (cx, cy), (rx + 2, ry + 2), 0, 0, 360, 1.0, -1)
            sub[cy - ry - 4 + lid:, :] = 0
            h[sub > 0] = (*PAPER, 255)
            yl = cy - ry + lid
            pts = [(cx - rx + 6, yl), (cx, yl + 10 * bl), (cx + rx - 6, yl)]
            cv2.polylines(h, [np.int32(bez(*pts, 12))], False, (*map(float, INK), 255.0), 5, cv2.LINE_AA)
    # mouth
    m = env[fi]
    mx, my = MOUTH
    if 4.95 < t < 6.4 and m < 0.15:   # smirk on "questionable"
        pts = bez((mx - 20, my + 2), (mx, my + 4), (mx + 22, my - 8), 10)
        cv2.polylines(h, [np.int32(pts)], False, (*map(float, INK), 255.0), 4, cv2.LINE_AA)
    elif m < 0.12:
        cv2.line(h, (mx - 13, my), (mx + 13, my + 1), (*map(float, INK), 255.0), 4, cv2.LINE_AA)
    else:
        oh = 6 + 26 * m; ow = 12 + 10 * m
        cv2.ellipse(h, (mx * 4, int((my + oh * 0.3) * 4)), (int(ow * 4), int(oh * 4)), 0, 0, 360, (*map(float, INK), 255.0), -1, cv2.LINE_AA, shift=2)
        if m > 0.45:
            cv2.ellipse(h, (mx * 4, int((my + oh * 0.75) * 4)), (int(ow * 0.55 * 4), int(oh * 0.35 * 4)), 0, 0, 360, (210.0, 120.0, 150.0, 255.0), -1, cv2.LINE_AA, shift=2)
    return np.clip(h, 0, 255).astype(np.uint8)

def char_motion(t, fi):
    """returns global matrix (feet), torso rot, head rot, head offset, neck stretch."""
    talk = env[fi]
    bob = math.sin(t * 2 * math.pi * 1.6) * 0.012
    sq = bob + talk * 0.015
    hop = 0.0; trot = math.sin(t * 2.3) * 1.5; hrot = math.sin(t * 3.1) * 3 + talk * 3; neck = 0.0
    hx = 0.0
    # "little guy": shrink
    sq -= 0.10 * math.sin(math.pi * prog(t, 1.4, 2.0))
    # MO ARTZ presentation lean
    trot += -4 * math.sin(math.pi * prog(t, 2.0, 2.9))
    # motion design head wiggle
    hrot += 7 * math.sin(t * 14) * math.sin(math.pi * prog(t, 2.95, 4.7))
    # shrug: head tilt, torso lift
    sh = math.sin(math.pi * prog(t, 4.9, 6.45))
    hrot += 12 * sh; sq += 0.025 * sh
    # connect: bounce on each item
    for b in (6.6, 7.2, 7.75, 8.25):
        k = prog(t, b, b + 0.3); sq += 0.035 * math.sin(math.pi * k); trot += 3 * math.sin(math.pi * k) * (1 if int(b * 10) % 2 else -1)
    # MOVE: anticipation squash then hop + neck stretch
    if t > 8.6:
        k = prog(t, 8.6, 8.85)
        sq -= 0.08 * math.sin(math.pi * k)
        u = prog(t, 8.85, 9.6)
        hop = -170 * math.sin(math.pi * u) if t < 9.6 else -60 * abs(math.sin((t - 9.6) * 9)) * math.exp(-(t - 9.6) * 3)
        neck = 40 * math.sin(math.pi * prog(t, 8.85, 9.8))
        hrot += 6 * math.sin(t * 22) * prog(t, 9.2, 9.4)
        if 8.85 < t < 9.6: sq += 0.05 * math.sin(math.pi * u)
    G = CHAR_BASE @ T(0, hop / CHAR_SCALE) @ about(S(1 - sq * 0.5, 1 + sq), FEET)
    return G, trot, hrot, hx, neck

# ---------------------------------------------------------------- motion graphics
def graphics_back(c, t):
    # ink blobs splatted behind MO ARTZ
    if 2.1 < t < 2.95:
        for i, (x, y, r) in enumerate([(200, 330, 60), (880, 260, 40), (150, 520, 28), (930, 470, 34)]):
            blob(c, x, y, r, prog(t, 2.1 + i * 0.05, 2.6 + i * 0.05), 300 + i)
    # flowers during "here for motion design"
    if 2.85 < t < 4.85:
        fl = [(170, 760, 70, 0), (900, 820, 60, 1), (130, 1210, 50, 2), (950, 1290, 66, 3)]
        for x, y, r, i in fl:
            k = prog(t, 2.9 + i * 0.15, 3.3 + i * 0.15)
            if k > 0: flower(c, x, y + math.sin(t * 4 + i) * 8, r * ease_out_back(k), t * 80 * (1 if i % 2 else -1), k, 500 + i * 10)
    # pink card flash on MOVE
    if t > 8.8:
        k = ease_out_back(prog(t, 8.8, 9.15), 1.6)
        hw, hh = 480 * k, 860 * k
        cx, cy = W / 2, 960
        pts = np.array([(cx - hw, cy - hh), (cx + hw, cy - hh * 0.98), (cx + hw * 1.01, cy + hh), (cx - hw * 0.99, cy + hh * 1.01)])
        cv2.fillPoly(c, [np.int32(pts)], tuple(map(float, PINK)), cv2.LINE_AA)
        stroke(c, np.vstack([pts, pts[:1]]), 6, seed=900)
        speed_lines(c, W / 2, 1100, t, 950, 22, 560, 820)

def graphics_front(c, t):
    # 0) "yo," + wave lines
    if t < 1.15:
        s = pop(t, 0.12); place(c, TX["yo"], 250, 200, s * (1 + 0.04 * math.sin(t * 20)), math.sin(t * 9) * 4)
        for i in range(3):
            k = prog(t, 0.3 + i * 0.08, 0.6 + i * 0.08)
            ox = 880 + i * 34
            stroke(c, partial([(ox, 560 - i * 40), (ox + 28, 520 - i * 40), (ox + 12, 480 - i * 40)], k), 7, seed=10 + i)
    # 1) i'm MORI
    if 0.45 < t < 1.25:
        place(c, TX["im"], 170, 400, pop(t, 0.45))
        s = pop(t, 0.6, 0.32) * (1 - 0.6 * prog(t, 1.1, 1.25))
        place(c, TX["mori"], 600, 390, s, math.sin(t * 6) * 3)
        stroke(c, partial([(380, 500), (600, 515), (860, 490), (810, 525)], prog(t, 0.75, 1.0)), 10, seed=40)
        star = star_pts(880, 190, 50 * pop(t, 0.8), t * 120)
        stroke(c, partial(star, prog(t, 0.8, 1.0)), 6, seed=44)
    # 2) (little guy) arrow
    if 1.25 < t < 2.1:
        place(c, TX["little"], 820, 690, pop(t, 1.3), math.sin(t * 8) * 4, 1 - prog(t, 2.0, 2.1))
        arrow(c, (820, 760), (680, 900), (60, 40), prog(t, 1.4, 1.7), 60)
    # 3) MO ARTZ logo
    if 1.95 < t < 2.95:
        place(c, TX["behind"], 540, 200, pop(t, 1.95), 0, 1 - prog(t, 2.85, 2.95))
        s = pop(t, 2.15, 0.3) * (1 - prog(t, 2.8, 2.95))
        shake = (math.sin(t * 70) * 6 * (1 - prog(t, 2.15, 2.45)))
        place(c, TX["moartz"], 540 + shake, 360, s, -2)
        stroke(c, partial(zig_pts(900, 450, 50, 120, 4), prog(t, 2.3, 2.55)), 6, seed=70)
    # 4) motion design / creative experiments
    if 2.95 < t < 4.85:
        a = 1 - prog(t, 4.7, 4.85)
        place(c, TX["motion"], 380, 220, pop(t, 3.0), math.sin(t * 5) * 3, a)
        stroke(c, partial(circle_pts(380, 220, 330, 100, 1.1, -0.4), prog(t, 3.2, 3.6)), 6, seed=80)
        place(c, TX["creative"], 680, 390, pop(t, 3.8), math.sin(t * 6 + 1) * 4, a)
        place(c, TX["experiments"], 660, 510, pop(t, 3.95), -math.sin(t * 5) * 3, a)
        stroke(c, partial(spiral_pts(960, 330, 55, 3, t * 3), prog(t, 3.9, 4.3)), 5, seed=84)
        stroke(c, partial(star_pts(130, 520, 36, -t * 90), prog(t, 4.0, 4.3)), 6, seed=86)
    # 5) questionable design decisions ??
    if 4.85 < t < 6.5:
        a = 1 - prog(t, 6.35, 6.5)
        place(c, TX["questionable"], 420, 240, pop(t, 5.15), math.sin(t * 3) * 2, a)
        place(c, TX["decisions"], 520, 380, pop(t, 5.6), 0, a)
        k = prog(t, 5.95, 6.15)   # cross out "design"
        if k > 0: stroke(c, partial([(270, 375), (540, 400)], k), 9, seed=96)
        place(c, TX["qq"], 970, 200 + math.sin(t * 7) * 14, pop(t, 5.3), math.sin(t * 9) * 12, a)
        if t > 5.75:   # "better" scribble
            place(c, text_cache("good?", "caveat-brush", 80, -8), 880, 500, pop(t, 5.95), 0, a)
    # 6) connect list
    if 6.45 < t < 8.7:
        a = 1 - prog(t, 8.55, 8.7)
        place(c, TX["connect"], 540, 180, pop(t, 6.5), 0, a)
        stroke(c, partial(circle_pts(540, 180, 330, 75, 1.1, 2.6), prog(t, 6.6, 6.95)), 5, seed=110)
        items = [("cool", 230, 360, 6.9), ("studios", 560, 450, 7.45), ("clients", 870, 350, 7.95)]
        for i, (k_, x, y, t0) in enumerate(items):
            place(c, TX[k_], x, y + math.sin(t * 5 + i) * 6, pop(t, t0), 0, a)
            if a > 0.5: check(c, x - 20, y + 75, prog(t, t0 + 0.15, t0 + 0.35), 120 + i)
        # heart doodle
        if t > 8.0 and a > 0.5:
            th = np.linspace(0, 2 * math.pi, 60); s = 2.4 * pop(t, 8.05)
            hp = np.stack([130 + s * 16 * np.sin(th) ** 3, 700 - s * (13 * np.cos(th) - 5 * np.cos(2 * th) - 2 * np.cos(3 * th) - np.cos(4 * th))], 1)
            stroke(c, hp, 6, seed=130)
    # 7) let's make stuff MOVE!
    if t > 8.55:
        place(c, TX["lets"], 330, 210, pop(t, 8.55), -4)
        place(c, TX["stuff"], 790, 230, pop(t, 8.85), 6)
        s = pop(t, 9.25, 0.25)
        jit = 1 - prog(t, 9.25, 9.7)
        sx = math.sin(t * 80) * 10 * jit; sy = math.cos(t * 67) * 8 * jit
        place(c, TX["move_p"], 540 + sx + 14, 430 + sy + 14, s, math.sin(t * 10) * 3)
        place(c, TX["move"], 540 + sx, 430 + sy, s, math.sin(t * 10) * 3)
        for i, (x, y) in enumerate([(120, 620), (960, 640), (110, 1500), (970, 1460)]):
            k = prog(t, 9.3 + i * 0.05, 9.55 + i * 0.05)
            if k > 0: stroke(c, partial(star_pts(x, y, 44, t * 200 * (1 if i % 2 else -1)), k), 7, seed=150 + i)
        if t > 9.7:
            place(c, text_cache("mo artz", "caveat-brush", 64, 0), 540, 1880, pop(t, 9.7), 0)

_tc = {}
def text_cache(txt, font, size, rot):
    k = (txt, font, size, rot)
    if k not in _tc: _tc[k] = text_sprite(txt, font, size, rot)
    return _tc[k]

# ---------------------------------------------------------------- frame loop
def render(fi):
    t = fi / FPS
    tq = math.floor(t * 12) / 12            # graphics + boil on twos (12fps), character on ones
    c = PAPERS[(fi // 2) % 3].copy()
    graphics_back(c, tq)

    G, trot, hrot, hx, neck = char_motion(t, fi)
    # ground shadow
    sx_, sy_ = apply(CHAR_BASE, FEET)
    hop_k = (apply(G, FEET)[1] - sy_)
    sw = 330 * (1 + hop_k / 600)
    cv2.ellipse(c, (int(sx_ * 4), int((sy_ - 6) * 4)), (int(sw * 4), int(18 * 4)), 0, 0, 360, (200.0, 195.0, 188.0), -1, cv2.LINE_AA, shift=2)

    warp(LEGS, G, c)
    MT = G @ about(R(trot), WAIST)
    # neck (procedural, stretchy) behind head, over torso
    nb = apply(MT, (542, 712))
    MH = MT @ T(hx, -neck) @ about(R(hrot), NECK_PIVOT)
    nt = apply(MH, (542, 650))
    warp(TORSO, MT, c)
    sc = CHAR_SCALE
    for off in (-10, 10):
        stroke(c, bez((nb[0] + off * sc, nb[1]), ((nb[0] + nt[0]) / 2 + off * sc, (nb[1] + nt[1]) / 2), (nt[0] + off * sc, nt[1] + 12), 10), 4, seed=200 + off, passes=1)
    warp(draw_face(HEAD, t, fi), MH, c)

    # arms
    for side, (keys, sh) in enumerate([(ARM_L, SHOULDERS[0]), (ARM_R, SHOULDERS[1])]):
        dx, dy, bend, pose, hang = sample_arm(keys, t)
        if side == 1 and 0.3 < t < 1.1:      # wave
            dx += math.sin(t * 22) * 45
        if 6.6 < t < 8.5:                    # finger gun recoil
            for b in (6.9, 7.45, 7.95):
                k = prog(t, b, b + 0.2)
                if 0 < k < 1 and (side == 0) == (b != 7.45): dy -= 30 * math.sin(math.pi * k)
        if t > 9.0:                          # MOVE wiggle
            dx += math.sin(t * 25 + side) * 25
        if 5.0 < t < 6.4:                    # shrug bounce
            dy -= 15 * abs(math.sin(t * 6))
        S0 = apply(MT, sh)
        Hd = apply(MT, (sh[0] + dx, sh[1] + dy))
        ctrl_l = ((sh[0] + sh[0] + dx) / 2, (sh[1] + sh[1] + dy) / 2)
        L = math.hypot(dx, dy) + 1e-6
        nx, ny = -dy / L, dx / L
        ctrl = apply(MT, (ctrl_l[0] + nx * bend, ctrl_l[1] + ny * bend))
        pts = bez(S0, ctrl, Hd, 26)
        tube(c, pts, int(22 * sc), int(12 * sc), seed=300 + side * 7 + (fi // 2) % 3)
        d = pts[-1] - pts[-3]
        ang = math.degrees(math.atan2(d[1], d[0])) + hang
        hand(c, Hd, ang, pose, sc, mirror=(side == 0), seed=400 + side * 20 + (fi // 2) % 3)
        # sleeve cuff redrawn over arm root
        cuff = [apply(MT, (sh[0] - 26, sh[1] - 4 + side * 6)), apply(MT, (sh[0] + 26, sh[1] + 4 + side * 2))]
        stroke(c, cuff, 4, seed=500 + side, passes=2)

    graphics_front(c, tq)

    # line boil (displace everything except the paper)
    mx, my = BOILS[(fi // 2) % 3]
    paper = PAPERS[(fi // 2) % 3]
    diff = c - paper
    diff = cv2.remap(diff.astype(np.float32), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    out = np.clip(paper + diff, 0, 255)
    # grain
    out += rng.normal(0, 3, (H, W, 1)).astype(np.float32)
    out = np.clip(out, 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, f"f{fi:04d}.png"), cv2.cvtColor(out, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_PNG_COMPRESSION, 1])

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] != "all":
        for fi in [int(x) for x in sys.argv[1].split(",")]: render(fi)
    else:
        from multiprocessing import Pool
        with Pool(int(sys.argv[2]) if len(sys.argv) > 2 else 4) as p:
            for i, _ in enumerate(p.imap_unordered(render, range(N))):
                if i % 24 == 0: print("done", i, flush=True)
