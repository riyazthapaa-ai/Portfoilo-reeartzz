"""MO ARTZ intro - puppet rig + ink motion graphics renderer."""
import json, math, os, sys
import numpy as np, cv2, soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "images", "1.webp")
OUT = os.path.join(HERE, "frames2")
os.makedirs(OUT, exist_ok=True)

W, H, FPS, DUR = 1080, 1920, 24, 15.3
N = int(FPS * DUR)
PAPER = np.array([233, 228, 216], np.uint8)          # warm off-white (RGB)
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
voice, SR = sf.read(os.path.join(HERE, "tts", "voice2.wav"))
timing = json.load(open(os.path.join(HERE, "tts", "timing2.json")))
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
HEAD = part_rgba(head_m); TORSO = part_rgba(torso_m)
LEG_L = part_rgba(legs_m * (xx < 540)); LEG_R = part_rgba(legs_m * (xx >= 540))

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


# ================================================================ v2: walking, expressions, transitions
LIGHT = np.array([243, 240, 232], np.uint8)
TAPE = np.array([205, 200, 186], np.uint8)
seg = {m["k"]: (m["t0"], m["t1"]) for m in timing}

# ---------------------------------------------------------------- scene timeline (seconds)
T_WIPE_A = (3.30, 3.62, 3.95)     # scribble wipe: start, fully covered, done
T_IRIS = (9.30, 9.47, 9.68)       # ink iris close/open
T_SPLAT = (13.08, 13.30)          # ink splat floods into dark scene
T_END = 14.72                     # end card

def keyed(keys, t, ease=ease_io):
    for i in range(len(keys) - 1):
        (a, va), (b, vb) = keys[i], keys[i + 1]
        if a <= t <= b:
            u = ease((t - a) / (b - a + 1e-9))
            return va + (vb - va) * u if not isinstance(va, tuple) else tuple(x + (y - x) * u for x, y in zip(va, vb))
    return keys[-1][1] if t > keys[-1][0] else keys[0][1]

# character x offset (stage px) and scale; jumps happen while the screen is covered
POS_X = [(0, -820.0), (0.05, -820.0), (1.35, 0.0), (T_WIPE_A[1], 0.0), (T_WIPE_A[1] + 0.001, 330.0),
         (3.75, 330.0), (5.25, -170.0), (6.95, -170.0), (7.95, 0.0), (T_IRIS[1], 0.0),
         (T_IRIS[1] + 0.001, 0.0), (9.75, 0.0), (10.65, -100.0), (13.25, -100.0), (13.30, 0.0), (20, 0.0)]
SCALE = [(0, 0.98), (T_WIPE_A[1], 0.98), (T_WIPE_A[1] + 0.001, 0.84), (6.95, 0.84), (7.95, 0.98),
         (T_IRIS[1], 0.98), (T_IRIS[1] + 0.001, 0.86), (13.29, 0.86), (13.30, 0.96), (20, 0.96)]
def lin(u): return clamp(u)

TS = np.arange(N + 1) / FPS
XS = np.array([keyed(POS_X, t, lin) for t in TS])
dist = np.concatenate([[0], np.cumsum(np.abs(np.diff(XS)) * (np.abs(np.diff(XS)) < 50))])
STRIDE = 105.0
PHASE = dist / STRIDE * math.pi
SPEED = np.concatenate([[0], np.abs(np.diff(XS)) * FPS]); SPEED[SPEED > 3000] = 0
WALK = np.clip(np.convolve(SPEED, np.ones(5) / 5, "same") / 250, 0, 1)

def steps():
    """foot-plant times (for footstep SFX)."""
    out = []
    for i in range(1, N + 1):
        if WALK[i] > 0.2 and int(PHASE[i] / math.pi) != int(PHASE[i - 1] / math.pi): out.append(round(TS[i], 3))
    return out

# ---------------------------------------------------------------- expressions (from the character sheet)
EXPR = {
    "neutral":      dict(lid=(0.05, 0.05), pupil=1.0, mouth="flat"),
    "happy":        dict(lid=(0.12, 0.12), pupil=1.0, mouth="smile"),
    "shocked":      dict(lid=(0.0, 0.0), pupil=0.55, mouth="o", extra="!"),
    "curious":      dict(lid=(0.0, 0.22), pupil=1.0, mouth="small"),
    "excited":      dict(lid=(0.0, 0.0), pupil=1.3, mouth="grin", extra="sparkle"),
    "confused":     dict(lid=(0.0, 0.38), pupil=0.8, mouth="wavy", extra="?"),
    "overthinking": dict(lid=(0.32, 0.32), pupil=0.9, mouth="wavy", extra="cloud"),
    "sus":          dict(lid=(0.48, 0.48), pupil=1.0, mouth="smirk"),
}
EXPR_KEYS = [(0, "neutral"), (0.55, "happy"), (2.05, "shocked"), (2.45, "curious"), (2.85, "excited"),
             (3.62, "happy"), (4.5, "curious"), (5.3, "excited"), (6.9, "confused"), (7.85, "overthinking"),
             (8.75, "sus"), (T_IRIS[1], "happy"), (12.25, "sus"), (12.95, "happy"), (13.3, "excited")]
def expr_at(t):
    e = EXPR_KEYS[0][1]
    for k, n in EXPR_KEYS:
        if t >= k: e = n
    return EXPR[e], e

LOOK = [(0, (0.0, 0.2)), (0.6, (0.4, -0.3)), (1.5, (0.0, 0.3)), (2.0, (0.0, 0.7)), (2.5, (0.0, 0.3)),
        (2.85, (0.0, -0.8)), (3.6, (0.0, 0.1)), (4.2, (-0.5, 0.0)), (5.3, (0.4, -0.7)), (6.9, (0.7, -0.6)),
        (7.85, (-0.6, -0.8)), (8.75, (0.75, 0.15)), (9.5, (0.0, 0.1)), (10.9, (-0.6, -0.5)), (11.6, (0.7, -0.4)),
        (12.25, (0.6, 0.1)), (13.0, (0.0, 0.1)), (13.3, (0.0, -0.3)), (14.0, (0.0, -0.8))]
def look_dir(t):
    for i in range(len(LOOK) - 1):
        (a, pa), (b, pb) = LOOK[i], LOOK[i + 1]
        if a <= t <= b:
            u = ease_io(prog(t, a, a + min(0.2, b - a)))
            return (lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u))
    return LOOK[-1][1]

def blink_amt(t):
    for b in (1.55, 3.2, 4.4, 6.5, 9.9, 11.4, 12.9):
        if b <= t <= b + 0.15: return math.sin((t - b) / 0.15 * math.pi)
    return 0.0

def C4(col): return (*map(float, col), 255.0)

def draw_face(head, t, fi):
    h = head.copy().astype(np.float32)
    ex, _ = expr_at(t)
    lx, ly = look_dir(t)
    bl = blink_amt(t)
    for i, e in enumerate(EYES):
        cx, cy = e["c"]; rx, ry = e["r"]
        px, py = cx + lx * (rx - 22), cy + ly * (ry - 26)
        ps = ex["pupil"] * (1 + 0.15 * math.sin(t * 30) * (ex.get("extra") == "sparkle"))
        if ex["mouth"] == "wavy" and i == 0: ps *= 0.8               # mismatched pupils = confusion
        cv2.ellipse(h, (int(px * 4), int(py * 4)), (int(12 * ps * 4), int(19 * ps * 4)), 0, 0, 360, C4(INK), -1, cv2.LINE_AA, shift=2)
        cv2.circle(h, (int((px + 4 * ps) * 4), int((py - 7 * ps) * 4)), int(4 * ps * 4), C4(PAPER), -1, cv2.LINE_AA, shift=2)
        lid = max(ex["lid"][i], bl)
        if lid > 0.02:
            yl = int(cy - ry + 2 * ry * lid)
            sub = np.zeros(h.shape[:2], np.uint8)
            cv2.ellipse(sub, (cx, cy), (rx + 2, ry + 2), 0, 0, 360, 1, -1)
            sub[yl:, :] = 0
            h[sub > 0] = C4(PAPER)
            half = rx * math.sqrt(max(0.0, 1 - ((yl - cy) / ry) ** 2)) - 3
            cv2.polylines(h, [np.int32(bez((cx - half, yl), (cx, yl + 6 * bl), (cx + half, yl), 12))], False, C4(INK), 6, cv2.LINE_AA)
    m = env[fi]; mx, my = MOUTH; k = C4(INK); mode = ex["mouth"]
    if m > 0.12:
        oh = 6 + 26 * m; ow = (16 if mode in ("grin", "smile") else 11) + 10 * m
        cv2.ellipse(h, (mx * 4, int((my + oh * 0.3) * 4)), (int(ow * 4), int(oh * 4)), 0, 0, 360, k, -1, cv2.LINE_AA, shift=2)
        if m > 0.45:
            cv2.ellipse(h, (mx * 4, int((my + oh * 0.75) * 4)), (int(ow * 0.55 * 4), int(oh * 0.35 * 4)), 0, 0, 360, (200.0, 110.0, 120.0, 255.0), -1, cv2.LINE_AA, shift=2)
    elif mode == "smile":
        cv2.polylines(h, [np.int32(bez((mx - 20, my - 4), (mx, my + 14), (mx + 20, my - 4), 12))], False, k, 4, cv2.LINE_AA)
    elif mode == "grin":
        pts = np.vstack([bez((mx - 22, my - 4), (mx, my + 30), (mx + 22, my - 4), 14)])
        cv2.fillPoly(h, [np.int32(pts)], k, cv2.LINE_AA)
    elif mode == "o":
        cv2.ellipse(h, (mx, my + 4), (8, 11), 0, 0, 360, k, -1, cv2.LINE_AA)
    elif mode == "wavy":
        xs = np.linspace(-18, 18, 14)
        cv2.polylines(h, [np.int32(np.stack([mx + xs, my + 3 * np.sin(xs / 4 + t * 6)], 1))], False, k, 4, cv2.LINE_AA)
    elif mode == "smirk":
        cv2.polylines(h, [np.int32(bez((mx - 18, my + 2), (mx + 2, my + 5), (mx + 22, my - 9), 10))], False, k, 4, cv2.LINE_AA)
    elif mode == "small":
        cv2.line(h, (mx - 7, my), (mx + 7, my), k, 4, cv2.LINE_AA)
    else:
        cv2.line(h, (mx - 13, my), (mx + 13, my + 1), k, 4, cv2.LINE_AA)
    return np.clip(h, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- arms
REST_L = (-38, 205, -30, "open", 0)
REST_R = (36, 200, 30, "open", 0)
ARM_L = [
    (0.00, *REST_L), (0.95, *REST_L),
    (1.15, 70, 10, 50, "point", 170), (1.6, 70, 10, 50, "point", 170),     # "I'm Mori" -> me
    (1.95, 55, -20, 60, "fist", 0), (2.5, 55, -20, 60, "fist", 0),         # little guy
    (2.8, -170, -250, -40, "open", 0), (3.3, -175, -260, -40, "open", 0),  # present logo
    (3.62, *REST_L), (5.3, *REST_L),
    (5.55, -130, -30, -60, "peace", 0), (6.8, -140, -40, -60, "peace", 0),
    (7.0, *REST_L), (7.85, *REST_L),
    (8.05, 70, -250, 70, "fist", 0), (8.6, 70, -250, 70, "fist", 0),      # hand on chin (overthinking)
    (8.8, -150, -20, -70, "open", 0), (9.3, -150, -20, -70, "open", 0),   # shrug
    (T_IRIS[1], *REST_L), (10.8, *REST_L),
    (11.05, -170, -180, -40, "gun", 0), (11.5, -170, -180, -40, "gun", 0), # cool people (up-left)
    (11.75, -40, 60, 40, "gun", 0), (12.35, -40, 60, 40, "gun", 0),
    (12.55, -60, -20, 40, "gun", 0), (13.1, -60, -20, 40, "gun", 0),       # potential clients
    (13.3, *REST_L), (13.85, -60, 120, -40, "fist", 0),                    # anticipation
    (14.0, -150, -330, -40, "open", 0), (16, -150, -330, -40, "open", 0),
]
ARM_R = [
    (0.00, *REST_R), (0.5, *REST_R),
    (0.75, 150, -300, 60, "open", 0), (1.5, 150, -300, 60, "open", 0),     # wave
    (1.8, *REST_R), (2.6, *REST_R),
    (2.85, 70, -340, 40, "point", 0), (3.3, 70, -340, 40, "point", 0),    # point up at MO ARTZ
    (3.62, *REST_R), (5.3, *REST_R),
    (5.55, 120, -300, 50, "point", 0), (6.8, 130, -280, 50, "point", 0),  # point up at the list
    (7.0, *REST_R), (8.75, *REST_R),
    (8.8, 155, -20, 70, "open", 0), (9.3, 155, -20, 70, "open", 0),       # shrug
    (T_IRIS[1], *REST_R), (11.5, *REST_R),
    (11.75, 170, -160, -40, "gun", 0), (12.35, 170, -160, -40, "gun", 0), # studios (up-right)
    (12.55, 60, -20, -40, "gun", 0), (13.1, 60, -20, -40, "gun", 0),
    (13.3, *REST_R), (13.85, 60, 120, 40, "fist", 0),
    (14.0, 150, -330, 40, "open", 0), (16, 150, -330, 40, "open", 0),
]
def sample_arm(keys, t):
    for i in range(len(keys) - 1):
        a, b = keys[i], keys[i + 1]
        if a[0] <= t <= b[0]:
            u = ease_out_back((t - a[0]) / (b[0] - a[0] + 1e-9), 1.4)
            return [lerp(a[j], b[j], u) for j in (1, 2, 3)] + [a[4] if u < 0.5 else b[4], lerp(a[5], b[5], clamp(u))]
    k = keys[-1]; return [k[1], k[2], k[3], k[4], k[5]]

# ---------------------------------------------------------------- body motion
HIPS = [(470, 1060), (612, 1060)]
def char_motion(t, fi):
    talk = env[fi]; ph = PHASE[fi]; wk = WALK[fi]
    sc = keyed(SCALE, t, lin); x = XS[fi]
    sq = math.sin(t * 2 * math.pi * 1.4) * 0.01 * (1 - wk) + talk * 0.012
    trot = math.sin(t * 2.1) * 1.2 + math.sin(ph) * 3.0 * wk
    hrot = math.sin(t * 2.7) * 2.5 + talk * 2.5 - math.sin(ph) * 2.5 * wk
    bob = -abs(math.sin(ph)) * 16 * wk
    hop = 0.0; neck = 0.0
    sq -= 0.10 * math.sin(math.pi * prog(t, 1.95, 2.55))           # little guy shrink
    hrot += 6 * math.sin(math.pi * prog(t, 2.05, 2.4)) * math.sin(t * 40)  # shocked shiver
    hrot += 10 * math.sin(math.pi * prog(t, 6.9, 7.85))            # confused tilt
    hrot -= 8 * math.sin(math.pi * prog(t, 7.85, 8.7))
    sh = math.sin(math.pi * prog(t, 8.75, 9.3)); hrot += 9 * sh; sq += 0.03 * sh
    for b in (11.05, 11.75, 12.55):
        k = prog(t, b, b + 0.3); sq += 0.035 * math.sin(math.pi * k)
    if t > 13.6:
        sq -= 0.09 * math.sin(math.pi * prog(t, 13.6, 13.95))
        u = prog(t, 13.95, 14.7)
        hop = -200 * math.sin(math.pi * u) if t < 14.7 else -50 * abs(math.sin((t - 14.7) * 9)) * math.exp(-(t - 14.7) * 3)
        neck = 45 * math.sin(math.pi * prog(t, 13.95, 14.9))
        if t < 14.7: sq += 0.05 * math.sin(math.pi * u)
    base = T(W / 2 + x - FEET[0] * sc, 1875 - FEET[1] * sc) @ S(sc, sc)
    G = base @ T(0, (hop + bob) / sc) @ about(S(1 - sq * 0.5, 1 + sq), FEET)
    legs = []
    for side in (0, 1):
        lift = max(0.0, math.sin(ph + side * math.pi)) * 46 * wk
        legs.append(about(R((5 if side else -5) * math.sin(ph) * wk), HIPS[side]) @ T(0, -lift))
    return G, base, sc, x, trot, hrot, neck, legs

# ---------------------------------------------------------------- sheet-style graphics
TX = {
    "yo": text_sprite("yo,", "knewave", 220, 8),
    "mori": text_sprite("MORI", "permanent-marker", 120, 0, col=PAPER, bleed=1.6),
    "buddy": text_sprite("THE CREATIVE BUDDY OF MO ARTZ", "architects-daughter", 44, -2, bleed=1.2),
    "little": text_sprite("(LITTLE GUY)", "architects-daughter", 64, 8, bleed=1.3),
    "moartz": text_sprite("MO ARTZ", "permanent-marker", 185, -4, bleed=2.6),
    "behind": text_sprite("THE GUY BEHIND", "architects-daughter", 60, 2, bleed=1.2),
    "share": text_sprite("HERE TO SHARE:", "architects-daughter", 64, -2, bleed=1.3),
    "i1": text_sprite("MOTION DESIGN", "permanent-marker", 80, -2),
    "i2": text_sprite("CREATIVE EXPERIMENTS", "permanent-marker", 60, 1),
    "i3": text_sprite("THINGS I'VE LEARNED", "permanent-marker", 64, -1),
    "probably": text_sprite("probably a few...", "caveat-brush", 80, -3),
    "questionable": text_sprite("QUESTIONABLE", "rubik-dirt", 98, -4),
    "decisions": text_sprite("DESIGN DECISIONS", "permanent-marker", 84, 3),
    "q": text_sprite("?", "knewave", 120, 0),
    "bang": text_sprite("!", "knewave", 120, 0),
    "lbl_confused": text_sprite("CONFUSED", "architects-daughter", 50, -4, bleed=1.1),
    "lbl_over": text_sprite("OVERTHINKING", "architects-daughter", 50, 3, bleed=1.1),
    "lbl_sus": text_sprite("SUS", "architects-daughter", 60, -5, bleed=1.1),
    "connect": text_sprite("LOOKING TO CONNECT", "architects-daughter", 60, -1, bleed=1.2),
    "c1": text_sprite("COOL PEOPLE", "architects-daughter", 54, 0, bleed=1.1),
    "c2": text_sprite("STUDIOS", "architects-daughter", 58, 0, bleed=1.1),
    "c3": text_sprite("POTENTIAL CLIENTS", "architects-daughter", 48, 0, bleed=1.1),
    "lets": text_sprite("let's make", "caveat-brush", 120, -4, col=PAPER),
    "stuff": text_sprite("some stuff", "caveat-brush", 120, 4, col=PAPER),
    "move": text_sprite("MOVE!", "knewave", 300, -6, col=PAPER),
    "end_logo": text_sprite("MO ARTZ", "permanent-marker", 175, -4, col=PAPER, bleed=2.6),
    "end_sub": text_sprite("MOTION DESIGN  *  TIPS  *  SHARING  *  OPPORTUNITIES", "architects-daughter", 29, 0, col=PAPER, bleed=1.0),
    "end_hi": text_sprite("say hi :)", "caveat-brush", 70, -4, col=PAPER),
}

def rough_rect(cx, cy, w, h, rot, seed, j=5):
    r = np.random.default_rng(seed)
    pts = np.array([(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]) + r.normal(0, j, (4, 2))
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    return pts @ np.array([[c, s], [-s, c]]) + (cx, cy)

def tape(c, cx, cy, w, rot, seed, alpha=0.75):
    r = np.random.default_rng(seed); h = w * 0.32
    xs = np.linspace(-w / 2, w / 2, 2)
    top = [(x, -h / 2) for x in np.linspace(-w / 2, w / 2, 8)]
    right = [(w / 2 + r.uniform(-6, 6), y) for y in np.linspace(-h / 2, h / 2, 5)]
    bot = [(x, h / 2) for x in np.linspace(w / 2, -w / 2, 8)]
    left = [(-w / 2 + r.uniform(-6, 6), y) for y in np.linspace(h / 2, -h / 2, 5)]
    p = np.array(top + right + bot + left)
    cs, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    p = p @ np.array([[cs, sn], [-sn, cs]]) + (cx, cy)
    lay = c.copy(); cv2.fillPoly(lay, [np.int32(p * 4)], tuple(map(float, TAPE)), cv2.LINE_AA, shift=2)
    c[...] = c * (1 - alpha) + lay * alpha

def card(c, cx, cy, w, h, rot, s, seed, label, doodle):
    if s <= 0.02: return
    w, h = w * s, h * s
    p = rough_rect(cx, cy, w, h, rot, seed)
    cv2.fillPoly(c, [np.int32(p * 4)], tuple(map(float, LIGHT)), cv2.LINE_AA, shift=2)
    stroke(c, np.vstack([p, p[:1]]), 4, seed=seed)
    place(c, TX[label], cx, cy + h * 0.22, s * 0.95, rot)
    doodle(c, cx, cy - h * 0.18, s)
    tape(c, cx + 10 * s, cy - h / 2, 110 * s, rot + 6, seed + 1)

def d_smiley(c, x, y, s):
    stroke(c, circle_pts(x, y, 34 * s, 34 * s, 1.05), 5, seed=701)
    stroke(c, [(x - 12 * s, y - 8 * s), (x - 12 * s, y - 2 * s)], 6, seed=702, passes=1)
    stroke(c, [(x + 12 * s, y - 8 * s), (x + 12 * s, y - 2 * s)], 6, seed=703, passes=1)
    stroke(c, bez((x - 16 * s, y + 8 * s), (x, y + 24 * s), (x + 16 * s, y + 8 * s), 10), 5, seed=704)
def d_studio(c, x, y, s):
    stroke(c, [(x - 40 * s, y + 30 * s), (x - 40 * s, y - 10 * s), (x - 15 * s, y - 30 * s), (x + 10 * s, y - 10 * s), (x + 10 * s, y - 34 * s), (x + 40 * s, y - 34 * s), (x + 40 * s, y + 30 * s), (x - 40 * s, y + 30 * s)], 5, seed=711)
    for i in range(3): stroke(c, [(x - 28 * s + i * 22 * s, y + 4 * s), (x - 20 * s + i * 22 * s, y + 4 * s)], 6, seed=712 + i, passes=1)
def d_crown(c, x, y, s, col=INK, seed=721, w=5):
    stroke(c, [(x - 40 * s, y + 22 * s), (x - 44 * s, y - 22 * s), (x - 20 * s, y + 2 * s), (x, y - 30 * s), (x + 20 * s, y + 2 * s), (x + 44 * s, y - 22 * s), (x + 40 * s, y + 22 * s), (x - 40 * s, y + 22 * s)], w, col=col, seed=seed)
def bolt(c, x, y, s, col=INK, seed=731):
    p = [(x + 10 * s, y - 70 * s), (x - 30 * s, y + 5 * s), (x, y + 5 * s), (x - 15 * s, y + 70 * s), (x + 35 * s, y - 15 * s), (x + 5 * s, y - 15 * s), (x + 10 * s, y - 70 * s)]
    stroke(c, p, 6, col=col, seed=seed)
def splat(c, x, y, r, t, seed, col=INK):
    if t <= 0: return
    rr = np.random.default_rng(seed)
    blob(c, x, y, r, t, seed, col)
    for i in range(7):
        a = rr.uniform(0, 2 * math.pi); d = r * rr.uniform(1.3, 2.1) * ease_out_back(t); dr = r * rr.uniform(0.08, 0.2)
        cv2.circle(c, (int((x + math.cos(a) * d) * 4), int((y + math.sin(a) * d) * 4)), int(dr * 4 * clamp(t * 2)), tuple(map(float, col)), -1, cv2.LINE_AA, shift=2)
def checkbox(c, x, y, t_box, t_chk, seed):
    if t_box <= 0: return
    p = rough_rect(x, y, 56, 56, 3, seed, 3)
    stroke(c, partial(np.vstack([p, p[:1]]), t_box), 5, seed=seed)
    if t_chk > 0: stroke(c, partial([(x - 22, y), (x - 4, y + 22), (x + 34, y - 36)], t_chk), 9, seed=seed + 3)
def cloud_scribble(c, x, y, r, t, seed):
    rr = np.random.default_rng(seed)
    th = np.linspace(0, 14 * math.pi, 260)
    rad = r * (0.55 + 0.45 * np.abs(np.sin(th * 0.37 + rr.uniform())))
    pts = np.stack([x + np.cos(th * 1.03) * rad * 1.3, y + np.sin(th) * rad * 0.8], 1) + rr.normal(0, 3, (260, 2))
    stroke(c, partial(pts, t), 4, seed=seed, passes=1)
def hatch_block(c, x, y, w, h, t, seed, col=INK):
    rr = np.random.default_rng(seed)
    n = int(26 * t)
    for i in range(n):
        u = i / 26
        stroke(c, [(x - w / 2 + u * w - 30, y + h / 2 + rr.normal(0, 6)), (x - w / 2 + u * w + 30, y - h / 2 + rr.normal(0, 6))], 7, col=col, seed=seed + i, passes=1)

def head_anchor(MH, p): return apply(MH, p)

# ---------------------------------------------------------------- per-scene graphics
def g_back(c, t):
    # page furniture: tape in corners like the sheet
    if t < T_SPLAT[1]:
        tape(c, 120, 60, 170, -12, 11, 0.55); tape(c, 980, 1860, 170, -8, 12, 0.55)
    if T_WIPE_A[1] < t < 6.9:     # hatch swatch + star near list
        stroke(c, partial(star_pts(960, 1050, 34, t * 60), prog(t, 4.0, 4.3)), 5, seed=811)
    if 2.75 < t < T_WIPE_A[1]:
        for i, (x, y, r) in enumerate([(150, 560, 46), (930, 520, 34), (880, 170, 24)]):
            splat(c, x, y, r, prog(t, 2.85 + i * 0.05, 3.25 + i * 0.05), 820 + i)

def g_move(c, t):
    """big MOVE! sits behind Mori so the jump reads in front of it."""
    if T_SPLAT[1] <= t < T_END:
        a = 1 - prog(t, T_END - 0.08, T_END)
        s = pop(t, 14.15, 0.25) * a
        jit = 1 - prog(t, 14.15, 14.6)
        place(c, TX["move"], 540 + math.sin(t * 80) * 10 * jit, 520 + math.cos(t * 67) * 8 * jit, s * 1.15, math.sin(t * 10) * 3)

def g_front(c, t, MH, sc, x):
    hc = head_anchor(MH, (540, 330))
    # ---- scene 1: walk in, yo, MORI label
    if t < 1.85:
        a = 1 - prog(t, 1.75, 1.85)
        place(c, TX["yo"], 790, 230, pop(t, 0.6) * a, math.sin(t * 9) * 4)
        for i in range(3):
            k = prog(t, 0.8 + i * 0.07, 1.05 + i * 0.07)
            ox = 880 + i * 34
            if a > 0.5: stroke(c, partial([(ox, 600 - i * 40), (ox + 28, 560 - i * 40), (ox + 12, 520 - i * 40)], k), 7, seed=10 + i)
        s = pop(t, 1.05, 0.25) * a
        if s > 0.02:
            p = rough_rect(300, 400, 330 * s, 140 * s, -4, 31, 4)
            cv2.fillPoly(c, [np.int32(p * 4)], tuple(map(float, INK)), cv2.LINE_AA, shift=2)
            place(c, TX["mori"], 300, 398, s, -4)
            tape(c, 220, 335, 120 * s, -20, 33)
            place(c, TX["buddy"], 330, 525, pop(t, 1.3) * a, 0)
    # ---- scene 2: little guy, MO ARTZ + crown
    if 1.85 < t < T_WIPE_A[1]:
        place(c, TX["little"], 820, 760, pop(t, 1.95), math.sin(t * 8) * 4, 1 - prog(t, 2.6, 2.7))
        if t < 2.65: arrow(c, (790, 820), (650, 960), (60, 40), prog(t, 2.05, 2.35), 60)
        place(c, TX["behind"], 540, 170, pop(t, 2.6), 0)
        s = pop(t, 2.85, 0.3)
        shake = math.sin(t * 70) * 6 * (1 - prog(t, 2.85, 3.1))
        place(c, TX["moartz"], 540 + shake, 340, s, -3)
        d_crown(c, 300, 200, 1.0 * pop(t, 3.0), seed=741)
        if t > 3.0: stroke(c, partial([(260, 470), (540, 486), (830, 462)], prog(t, 3.0, 3.2)), 9, seed=742)
    # ---- scene 3: here to share list
    if T_WIPE_A[1] < t < 6.95:
        a = 1 - prog(t, 6.85, 6.95)
        place(c, TX["share"], 300, 170, pop(t, 3.75) * a, -2)
        stroke(c, partial([(90, 215), (330, 222), (500, 212)], prog(t, 3.85, 4.05)), 5, seed=850)
        items = [("i1", 300, 4.55), ("i2", 425, 5.4), ("i3", 550, 6.2)]
        for i, (k_, y, t0) in enumerate(items):
            checkbox(c, 110, y, prog(t, t0 - 0.2, t0) * a, prog(t, t0 + 0.15, t0 + 0.35) * a, 860 + i * 5)
            sp = TX[k_]; place(c, sp, 175 + sp.width / 2 * pop(t, t0), y, pop(t, t0) * a, 0)
        if t > 5.3: bolt(c, 960, 760 + math.sin(t * 6) * 8, 0.9 * pop(t, 5.35) * a, seed=870)
    # ---- scene 4: questionable design decisions (confused / overthinking / sus)
    if 6.85 < t < T_IRIS[1]:
        place(c, TX["probably"], 330, 190, pop(t, 6.9), 0)
        place(c, TX["questionable"], 540, 320, pop(t, 7.75), math.sin(t * 3) * 2)
        place(c, TX["decisions"], 560, 450, pop(t, 8.3), 0)
        if t > 8.7: stroke(c, partial([(330, 440), (560, 470)], prog(t, 8.7, 8.85)), 9, seed=896)
        _, en = expr_at(t)
        if en == "confused":
            for i, (hx, hy) in enumerate([(300, 40), (780, 0)]):
                p = head_anchor(MH, (hx, hy))
                place(c, TX["q"], p[0], p[1] + math.sin(t * 7 + i) * 10, pop(t, 6.95 + i * 0.12) * 0.8, math.sin(t * 6 + i) * 14)
            place(c, TX["lbl_confused"], 170, 1250, pop(t, 7.0), 0)
            arrow(c, (190, 1200), (300, 1010), (-30, 0), prog(t, 7.1, 7.35), 897, 4)
        if en == "overthinking":
            p = head_anchor(MH, (880, 120))
            cloud_scribble(c, p[0], p[1], 75 * sc, prog(t, 7.85, 8.3), 898)
            place(c, TX["lbl_over"], 860, 1290, pop(t, 7.9), 0)
            arrow(c, (860, 1240), (790, 1040), (30, 0), prog(t, 8.0, 8.25), 899, 4)
        if en == "sus":
            place(c, TX["lbl_sus"], 170, 1250, pop(t, 8.8), 0)
            arrow(c, (190, 1200), (300, 1010), (-30, 0), prog(t, 8.85, 9.05), 900, 4)
    # ---- scene 5: connect cards
    if T_IRIS[1] < t < T_SPLAT[1]:
        place(c, TX["connect"], 540, 140, pop(t, 9.75), -1)
        stroke(c, partial(circle_pts(540, 140, 360, 70, 1.1, 2.6), prog(t, 9.9, 10.3)), 5, seed=910)
        card(c, 250, 380, 330, 230, -5, pop(t, 10.95), 920, "c1", d_smiley)
        card(c, 820, 470, 300, 230, 6, pop(t, 11.65), 930, "c2", d_studio)
        card(c, 470, 650, 400, 210, -2, pop(t, 12.45), 940, "c3", lambda c_, x_, y_, s_: d_crown(c_, x_, y_, s_ * 0.9))
        _, en = expr_at(t)
        if en == "sus":
            place(c, TX["lbl_sus"], 900, 1240, pop(t, 12.3), 0)
            arrow(c, (880, 1190), (720, 1060), (30, 0), prog(t, 12.35, 12.55), 950, 4)
    # ---- scene 6 (dark): let's make some stuff MOVE! -> end card
    if t >= T_SPLAT[1]:
        if t < T_END:
            a = 1 - prog(t, T_END - 0.08, T_END)
            place(c, TX["lets"], 300, 150, pop(t, 13.35) * a, -4)
            place(c, TX["stuff"], 770, 250, pop(t, 13.75) * a, 4)
        else:
            place(c, TX["end_logo"], 540, 330, pop(t, T_END, 0.3), -4)
            d_crown(c, 230, 200, pop(t, T_END + 0.1), col=PAPER, seed=990, w=6)
            place(c, TX["end_sub"], 540, 500, pop(t, T_END + 0.15), 0)
            place(c, TX["end_hi"], 860, 640, pop(t, T_END + 0.3), 0)
        for i, (bx, by) in enumerate([(120, 820), (960, 860)]):
            bolt(c, bx, by + math.sin(t * 8 + i) * 10, 1.1 * pop(t, 13.9 + i * 0.1), col=PAPER, seed=960 + i)
        for i, (sx_, sy_, r) in enumerate([(150, 1450, 34), (940, 1400, 40), (900, 120, 22), (130, 650, 20)]):
            splat(c, sx_, sy_, r, prog(t, 14.15 + i * 0.05, 14.5 + i * 0.05), 970 + i, PAPER)
        if 13.95 < t: speed_lines_col(c, hc[0], hc[1] + 300, t, 980)

def speed_lines_col(canvas, cx, cy, t, seed, n=20, r0=560, r1=820):
    rr = np.random.default_rng(seed)
    for i in range(n):
        a = rr.uniform(0, 2 * math.pi); l = rr.uniform(0.4, 1)
        ph = (t * 3 + rr.uniform()) % 1
        a0 = r0 + ph * 160; a1 = a0 + (r1 - r0) * l * 0.5
        stroke(canvas, [(cx + math.cos(a) * a0, cy + math.sin(a) * a0), (cx + math.cos(a) * a1, cy + math.sin(a) * a1)], 6, col=PAPER, seed=seed + i, passes=1)

def head_extras(c, t, MH, sc):
    ex, en = expr_at(t)
    if ex.get("extra") == "sparkle":
        col = PAPER if t >= T_SPLAT[1] else INK
        cx, cy = apply(MH, (540, 380))
        for i in range(10):
            a = i / 10 * 2 * math.pi + 0.3
            r0 = (390 + 25 * math.sin(t * 20 + i)) * sc; r1 = r0 + 40 * sc
            stroke(c, [(cx + math.cos(a) * r0, cy + math.sin(a) * r0 * 0.9), (cx + math.cos(a) * r1, cy + math.sin(a) * r1 * 0.9)], 5, col=col, seed=1000 + i, passes=1)
    if ex.get("extra") == "!":
        p = apply(MH, (790, 40)); place(c, TX["bang"], p[0], p[1], pop(t, 2.05, 0.15) * 0.8, 10)

# ---------------------------------------------------------------- transitions
def scribble_cover(c, t):
    a, m, b = T_WIPE_A
    if not (a < t < b): return
    rr = np.random.default_rng(1100)
    pts = []
    for i in range(16):
        y = -60 + i * 135 + rr.normal(0, 15)
        pts += [(-120, y), (W + 120, y + 70 + rr.normal(0, 20))] if i % 2 == 0 else [(W + 120, y), (-120, y + 70)]
    pts = np.array(bez_chain(pts))
    if t < m: seg_ = partial(pts, ease_io(prog(t, a, m)))
    else: seg_ = partial(pts[::-1], 1 - ease_io(prog(t, m, b)))
    stroke(c, seg_, 230, seed=1101, passes=2, amp=6)

def bez_chain(pts, n=10):
    out = []
    for i in range(len(pts) - 1):
        p0, p1 = np.array(pts[i]), np.array(pts[i + 1])
        out += list(bez(p0, (p0 + p1) / 2 + (0, 30), p1, n))
    return out

def iris(c, t, center):
    a, m, b = T_IRIS
    if not (a < t < b): return
    r = lerp(1300, 0, ease_io(prog(t, a, m))) if t < m else lerp(0, 1300, ease_io(prog(t, m, b)))
    th = np.linspace(0, 2 * math.pi, 90)
    wob = 1 + 0.06 * np.sin(th * 7 + t * 20)
    hole = np.stack([center[0] + np.cos(th) * r * wob, center[1] + np.sin(th) * r * wob], 1)
    mask = np.ones((H, W), np.uint8)
    if r > 2: cv2.fillPoly(mask, [np.int32(hole)], 0, cv2.LINE_AA)
    c[mask > 0] = INK
    if r > 2: stroke(c, np.vstack([hole, hole[:1]]), 8, col=PAPER * 0 + INK, seed=1200)

def dark_bg(c, t):
    """ink flood: splat grows from the centre, then the scene stays dark with scribble texture."""
    a, b = T_SPLAT
    if t < a: return
    if t < b:
        r = lerp(40, 1500, ease_io(prog(t, a, b)))
        blob(c, W / 2, 900, r, 1.0, 1300)
        return
    c[...] = INK
    rr = np.random.default_rng(1310)
    for i in range(40):
        x0, y0 = rr.uniform(0, W), rr.uniform(0, H)
        stroke(c, [(x0, y0), (x0 + 60, y0 - 40)], 3, col=(40, 37, 36), seed=1320 + i, passes=1)

# ---------------------------------------------------------------- frame
def render(fi):
    t = fi / FPS
    tq = math.floor(t * 12) / 12
    pidx = (fi // 2) % 3
    c = PAPERS[pidx].copy()
    if t >= T_SPLAT[1]: dark_bg(c, t)
    g_back(c, tq)
    g_move(c, tq)

    G, base, sc, x, trot, hrot, neck, legs = char_motion(t, fi)
    fx, fy = apply(base, FEET)
    lift = apply(G, FEET)[1] - fy
    shade = (36.0, 33.0, 32.0) if t >= T_SPLAT[1] else (205.0, 199.0, 188.0)
    cv2.ellipse(c, (int(fx * 4), int((fy - 6) * 4)), (int(330 * sc * (1 + lift / 600) * 4), int(18 * 4)), 0, 0, 360, shade, -1, cv2.LINE_AA, shift=2)
    for side, LEG in ((0, LEG_L), (1, LEG_R)):
        warp(LEG, G @ legs[side], c)
    MT = G @ about(R(trot), WAIST)
    nb = apply(MT, (542, 712))
    MH = MT @ T(0, -neck) @ about(R(hrot), NECK_PIVOT)
    nt = apply(MH, (542, 650))
    warp(TORSO, MT, c)
    for off in (-10, 10):
        stroke(c, bez((nb[0] + off * sc, nb[1]), ((nb[0] + nt[0]) / 2 + off * sc, (nb[1] + nt[1]) / 2), (nt[0] + off * sc, nt[1] + 12), 10), 4, seed=200 + off, passes=1)
    warp(draw_face(HEAD, t, fi), MH, c)

    ph, wk = PHASE[fi], WALK[fi]
    for side, (keys, sh) in enumerate([(ARM_L, SHOULDERS[0]), (ARM_R, SHOULDERS[1])]):
        dx, dy, bend, pose, hang = sample_arm(keys, t)
        dx += math.sin(ph) * 34 * wk * (1 if side else -1) * -1
        dy -= abs(math.sin(ph)) * 8 * wk
        if side == 1 and 0.75 < t < 1.5: dx += math.sin(t * 22) * 45
        for b in (11.05, 11.75, 12.55):
            k = prog(t, b + 0.12, b + 0.32)
            if 0 < k < 1: dy -= 30 * math.sin(math.pi * k)
        if t > 14.1: dx += math.sin(t * 25 + side) * 25
        if 8.8 < t < 9.3: dy -= 15 * abs(math.sin(t * 6))
        S0 = apply(MT, sh); Hd = apply(MT, (sh[0] + dx, sh[1] + dy))
        L = math.hypot(dx, dy) + 1e-6; nx, ny = -dy / L, dx / L
        ctrl = apply(MT, (sh[0] + dx / 2 + nx * bend, sh[1] + dy / 2 + ny * bend))
        pts = bez(S0, ctrl, Hd, 26)
        tube(c, pts, int(22 * sc), int(12 * sc), seed=300 + side * 7 + pidx)
        d = pts[-1] - pts[-3]
        hand(c, Hd, math.degrees(math.atan2(d[1], d[0])) + hang, pose, sc, mirror=(side == 0), seed=400 + side * 20 + pidx)
        stroke(c, [apply(MT, (sh[0] - 26, sh[1] - 4 + side * 6)), apply(MT, (sh[0] + 26, sh[1] + 4 + side * 2))], 4, seed=500 + side)

    head_extras(c, tq, MH, sc)
    g_front(c, tq, MH, sc, x)
    scribble_cover(c, t)
    iris(c, t, apply(MH, (530, 470)))
    if T_SPLAT[0] <= t < T_SPLAT[1]: dark_bg(c, t)

    mx, my = BOILS[pidx]
    paper = PAPERS[pidx]
    diff = cv2.remap((c - paper).astype(np.float32), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    out = np.clip(paper + diff + rng.normal(0, 3, (H, W, 1)).astype(np.float32), 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, f"f{fi:04d}.png"), cv2.cvtColor(out, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_PNG_COMPRESSION, 1])

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "steps":
        json.dump(steps(), open(os.path.join(HERE, "steps.json"), "w")); print(steps())
    elif len(sys.argv) > 1 and sys.argv[1] != "all":
        for fi in [int(x) for x in sys.argv[1].split(",")]: render(fi)
    else:
        from multiprocessing import Pool
        with Pool(4) as p:
            for i, _ in enumerate(p.imap_unordered(render, range(N))):
                if i % 48 == 0: print("done", i, flush=True)
