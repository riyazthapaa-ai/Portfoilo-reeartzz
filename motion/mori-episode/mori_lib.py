"""Mori: fully procedural scribble-ink character + drawing helpers."""
import math, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "fonts")
W, H = 1080, 1920
PAPER = np.array([233, 228, 216], np.float32)
INK = np.array([18, 16, 16], np.float32)
LIGHT = np.array([243, 240, 232], np.float32)
TAPE = np.array([205, 200, 186], np.float32)
SHADE = np.array([206, 200, 189], np.float32)

# ---------------------------------------------------------------- math / easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def lerp(a, b, t): return a + (b - a) * t
def ease_io(t): t = clamp(t); return t * t * (3 - 2 * t)
def ease_out(t): t = clamp(t); return 1 - (1 - t) ** 3
def ease_out_back(t, s=2.0): t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s)
def prog(t, a, b): return clamp((t - a) / (b - a + 1e-9))
def pop(t, t0, d=0.28): return ease_out_back(prog(t, t0, t0 + d))
def bump(t, a, b): return math.sin(math.pi * prog(t, a, b))

def track(keys, t, ease=ease_io):
    """keys: [(time, value)], value float or tuple."""
    if t <= keys[0][0]: return keys[0][1]
    for (a, va), (b, vb) in zip(keys, keys[1:]):
        if a <= t <= b:
            u = ease((t - a) / (b - a + 1e-9))
            if isinstance(va, tuple): return tuple(x + (y - x) * u for x, y in zip(va, vb))
            return va + (vb - va) * u
    return keys[-1][1]

def bez(p0, p1, p2, n=24):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2 = (np.asarray(p, float) for p in (p0, p1, p2))
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2

def ellipse_pts(cx, cy, rx, ry, n=64, a0=0, a1=2 * math.pi):
    th = np.linspace(a0, a1, n)
    return np.stack([cx + np.cos(th) * rx, cy + np.sin(th) * ry], 1)

def partial(pts, t):
    pts = np.asarray(pts, float)
    if t >= 1: return pts
    if t <= 0: return pts[:1]
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
    L = cum[-1] * t; i = int(np.clip(np.searchsorted(cum, L) - 1, 0, len(seg) - 1))
    f = (L - cum[i]) / (seg[i] + 1e-9)
    return np.vstack([pts[:i + 1], pts[i] + (pts[i + 1] - pts[i]) * f])

def resample(pts, step=6.0):
    pts = np.asarray(pts, float)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
    if cum[-1] < 1e-6: return pts
    s = np.linspace(0, cum[-1], max(2, int(cum[-1] / step)))
    return np.stack([np.interp(s, cum, pts[:, 0]), np.interp(s, cum, pts[:, 1])], 1)

# ---------------------------------------------------------------- ink drawing
BOIL = [0]  # global boil index (changes every 2 frames)

def wob(pts, amp, seed):
    """smooth hand wobble along arc length (re-seeded per boil frame)."""
    pts = resample(pts, 5.0)
    r = np.random.default_rng(seed * 7 + BOIL[0] * 1013)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); s = np.concatenate([[0], np.cumsum(seg)])
    ph = r.uniform(0, 6.28, 4); f = r.uniform(0.6, 1.4, 2)
    ox = amp * (np.sin(s / (38 * f[0]) + ph[0]) + 0.5 * np.sin(s / 11 + ph[1]))
    oy = amp * (np.sin(s / (38 * f[1]) + ph[2]) + 0.5 * np.sin(s / 13 + ph[3]))
    return pts + np.stack([ox, oy], 1)

def _col(c): return tuple(float(v) for v in c)

def line(c, pts, w=4.0, col=INK, seed=0, passes=2, amp=1.3, over=0.0):
    pts = np.asarray(pts, float)
    if len(pts) < 2: return
    if over > 0:   # sketchy overshoot at both ends
        d0 = pts[0] - pts[1]; d1 = pts[-1] - pts[-2]
        pts = np.vstack([pts[0] + d0 / (np.linalg.norm(d0) + 1e-9) * over, pts, pts[-1] + d1 / (np.linalg.norm(d1) + 1e-9) * over])
    for k in range(passes):
        p = wob(pts, amp * (1 + 0.6 * k), seed + k * 31)
        ww = max(1, int(round(w * (1.0 if k == 0 else 0.5))))
        cv2.polylines(c, [np.round(p * 4).astype(np.int32)], False, _col(col), ww, cv2.LINE_AA, shift=2)

def fill(c, pts, col=PAPER):
    cv2.fillPoly(c, [np.round(np.asarray(pts) * 4).astype(np.int32)], _col(col), cv2.LINE_AA, shift=2)

def shape(c, pts, w=4.0, fillcol=PAPER, col=INK, seed=0, passes=2, amp=1.3):
    pts = np.asarray(pts, float)
    if fillcol is not None: fill(c, pts, fillcol)
    closed = np.vstack([pts, pts[:3]])  # overlap the start = hand-drawn loop
    line(c, closed, w, col, seed, passes, amp)

def taper(c, pts, w0, w1, col=INK):
    pts = resample(pts, 4.0)
    if len(pts) < 2: return
    d = np.gradient(pts, axis=0); n = np.stack([-d[:, 1], d[:, 0]], 1)
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
    w = np.linspace(w0, w1, len(pts))[:, None] / 2
    poly = np.vstack([pts + n * w, (pts - n * w)[::-1]])
    fill(c, poly, col)

def hatch(c, poly, ang=60, gap=9, w=2, seed=0, col=INK, amt=1.0):
    poly = np.asarray(poly, float)
    x0, y0 = np.floor(poly.min(0)).astype(int) - 2
    x1, y1 = np.ceil(poly.max(0)).astype(int) + 2
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 <= x0 or y1 <= y0: return
    hh, ww = y1 - y0, x1 - x0
    m = np.zeros((hh, ww), np.float32)
    cv2.fillPoly(m, [np.round((poly - (x0, y0)) * 4).astype(np.int32)], 1.0, cv2.LINE_AA, shift=2)
    lay = np.zeros((hh, ww), np.float32)
    r = np.random.default_rng(seed + BOIL[0] * 17)
    a = math.radians(ang); dx, dy = math.cos(a), math.sin(a)
    L = hh + ww
    for k in np.arange(-L, L, gap):
        ox, oy = -dy * k + ww / 2, dx * k + hh / 2
        p0 = (ox - dx * L + r.normal(0, 2), oy - dy * L); p1 = (ox + dx * L, oy + dy * L + r.normal(0, 2))
        cv2.line(lay, (int(p0[0] * 4), int(p0[1] * 4)), (int(p1[0] * 4), int(p1[1] * 4)), 1.0, w, cv2.LINE_AA, shift=2)
    al = (m * lay * amt)[..., None]
    c[y0:y1, x0:x1] = c[y0:y1, x0:x1] * (1 - al) + np.asarray(col, np.float32) * al

def blob_pts(cx, cy, r, seed, n=9, k=(0.65, 1.35)):
    rr = np.random.default_rng(seed)
    kk = rr.uniform(*k, n)
    ang = np.linspace(0, 2 * math.pi, n, endpoint=False)
    th = np.linspace(0, 2 * math.pi, 90)
    rad = np.interp(th, np.concatenate([ang, [2 * math.pi]]), np.concatenate([kk, [kk[0]]]))
    rad = np.convolve(np.concatenate([rad[-6:], rad, rad[:6]]), np.ones(7) / 7, "same")[6:-6]
    return np.stack([cx + np.cos(th) * rad * r, cy + np.sin(th) * rad * r], 1)

def splat(c, x, y, r, t, seed, col=INK):
    if t <= 0: return
    s = ease_out_back(t, 1.6)
    fill(c, blob_pts(x, y, r * s, seed), col)
    rr = np.random.default_rng(seed + 1)
    for i in range(8):
        a = rr.uniform(0, 2 * math.pi); d = r * rr.uniform(1.3, 2.2) * s; dr = r * rr.uniform(0.07, 0.18) * clamp(t * 2)
        cv2.circle(c, (int((x + math.cos(a) * d) * 4), int((y + math.sin(a) * d) * 4)), max(1, int(dr * 4)), _col(col), -1, cv2.LINE_AA, shift=2)

def star_pts(cx, cy, r, rot=0):
    return [(cx + math.cos(math.radians(rot + i * 144 - 90)) * r, cy + math.sin(math.radians(rot + i * 144 - 90)) * r) for i in range(6)]

def crown(c, x, y, s, col=INK, seed=0, w=5):
    line(c, [(x - 40 * s, y + 22 * s), (x - 44 * s, y - 22 * s), (x - 20 * s, y + 2 * s), (x, y - 30 * s), (x + 20 * s, y + 2 * s),
             (x + 44 * s, y - 22 * s), (x + 40 * s, y + 22 * s), (x - 40 * s, y + 22 * s)], w, col, seed)

def tape(c, cx, cy, w, rot, seed, alpha=0.75):
    r = np.random.default_rng(seed); h = w * 0.32
    top = [(x, -h / 2) for x in np.linspace(-w / 2, w / 2, 8)]
    right = [(w / 2 + r.uniform(-6, 6), y) for y in np.linspace(-h / 2, h / 2, 5)]
    bot = [(x, h / 2) for x in np.linspace(w / 2, -w / 2, 8)]
    left = [(-w / 2 + r.uniform(-6, 6), y) for y in np.linspace(h / 2, -h / 2, 5)]
    p = np.array(top + right + bot + left)
    cs, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    p = p @ np.array([[cs, sn], [-sn, cs]]) + (cx, cy)
    lay = c.copy(); fill(lay, p, TAPE)
    c[...] = c * (1 - alpha) + lay * alpha

def rot_pts(pts, ang, cx, cy):
    a = math.radians(ang); cs, sn = math.cos(a), math.sin(a)
    p = np.asarray(pts, float) - (cx, cy)
    return np.stack([p[:, 0] * cs - p[:, 1] * sn, p[:, 0] * sn + p[:, 1] * cs], 1) + (cx, cy)

# ---------------------------------------------------------------- text
_fc = {}
def font(name, size):
    k = (name, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(os.path.join(FONTS, name + ".woff"), size)
    return _fc[k]

_tc = {}
def text_sprite(txt, fnt, size, rot=0, col=INK, bleed=1.6):
    k = (txt, fnt, size, rot, tuple(np.asarray(col).astype(int)), bleed)
    if k in _tc: return _tc[k]
    ft = font(fnt, size); pad = 30
    bb = ImageDraw.Draw(Image.new("L", (1, 1))).textbbox((0, 0), txt, font=ft)
    w, h = bb[2] - bb[0] + pad * 2, bb[3] - bb[1] + pad * 2
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).text((pad - bb[0], pad - bb[1]), txt, font=ft, fill=255)
    a = np.array(m).astype(np.float32)
    r = np.random.default_rng(len(txt) * 13 + size)
    nz = cv2.resize(r.normal(0, 1, (h // 6 + 1, w // 6 + 1)).astype(np.float32), (w, h)) * 30
    a = np.clip((cv2.GaussianBlur(a + nz, (0, 0), bleed) - 110) * 6, 0, 255)
    rgba = np.zeros((h, w, 4), np.uint8); rgba[..., :3] = np.asarray(col).astype(np.uint8); rgba[..., 3] = a.astype(np.uint8)
    im = Image.fromarray(rgba)
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    _tc[k] = im
    return im

def place(c, sprite, cx, cy, scale=1.0, rot=0.0, alpha=1.0):
    if scale <= 0.02 or alpha <= 0.01: return
    im = sprite
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if abs(scale - 1) > 0.01: im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BICUBIC)
    arr = np.array(im)
    x0, y0 = int(cx - arr.shape[1] / 2), int(cy - arr.shape[0] / 2)
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + arr.shape[1]), min(H, y0 + arr.shape[0])
    if xa >= xb or ya >= yb: return
    sub = arr[ya - y0:yb - y0, xa - x0:xb - x0]
    a = sub[..., 3:4].astype(np.float32) / 255 * alpha
    c[ya:yb, xa:xb] = c[ya:yb, xa:xb] * (1 - a) + sub[..., :3] * a

# ================================================================ MORI
# character units: origin at ground between feet, y up is negative. ~1330 units tall.
HEAD_RX, HEAD_RY = 262, 200
HIP_Y, ANKLE_Y = -405, -58
L_THIGH, L_SHIN = 178, 176

def _hair_set():
    r = np.random.default_rng(42)
    strands = []
    for i in range(130):                     # mop around the crown
        a = r.uniform(math.pi - 0.35, 2 * math.pi + 0.35)
        top = -math.sin(a)
        rr = r.uniform(0.78, 0.98)
        base = (math.cos(a) * HEAD_RX * rr, math.sin(a) * HEAD_RY * rr - 6)
        d = a + r.normal(0, 0.45)
        dirv = (math.cos(d), math.sin(d))
        if top < 0.3: dirv = (dirv[0] * 0.6, abs(dirv[1]) * 0.5 + 0.6)   # side hair hangs down
        ln = r.uniform(35, 85) + max(0, top) * r.uniform(10, 70)
        strands.append((base, dirv, ln, r.normal(0, 0.3), r.uniform(3.0, 5.5)))
    for a, ln in ((-1.62, 250), (-1.35, 170), (-1.95, 150), (-0.6, 130), (-2.6, 140)):   # signature spikes
        base = (math.cos(a) * HEAD_RX * 0.8, math.sin(a) * HEAD_RY * 0.8)
        strands.append((base, (math.cos(a), math.sin(a)), ln, r.normal(0, 0.1), 7.0))
    fringe = []
    for i in range(26):                      # bangs over the forehead
        x = r.uniform(-HEAD_RX * 0.8, HEAD_RX * 0.8)
        y = -HEAD_RY * math.sqrt(max(0.05, 1 - (x / HEAD_RX) ** 2)) * 0.95
        ang = math.pi / 2 + r.normal(0, 0.3) + x / HEAD_RX * 0.35
        fringe.append(((x, y), (math.cos(ang), math.sin(ang)), r.uniform(60, 125), r.normal(0, 0.3), r.uniform(3.0, 5.0)))
    scrib = [(r.uniform(math.pi - 0.1, 2 * math.pi + 0.1), r.uniform(0.8, 1.08), r.uniform(-0.6, 0.6), r.uniform(25, 55)) for _ in range(110)]
    return strands, fringe, scrib
HAIR, FRINGE, HAIR_SCRIB = _hair_set()

HANDS = {
    "open":  [(-62, 22), (-24, 30), (0, 33), (24, 30), (50, 26)],
    "point": [(0, 44), (-70, 18), (30, 9), (50, 8), (65, 8)],
    "gun":   [(0, 42), (-85, 26), (35, 9), (55, 8), (70, 8)],
    "fist":  [(-60, 12), (-20, 10), (5, 10), (28, 10), (50, 10)],
    "peace": [(-12, 36), (14, 36), (-70, 14), (40, 9), (60, 8)],
    "pencil": [(-70, 16), (-10, 12), (10, 11), (30, 10), (50, 9)],
}

def tube(c, pts, w_out, w_in, seed=0):
    pts = resample(pts, 4)
    p = np.round(np.asarray(pts) * 4).astype(np.int32)
    cv2.polylines(c, [p], False, _col(INK), max(1, int(w_out)), cv2.LINE_AA, shift=2)
    cv2.polylines(c, [p], False, _col(PAPER), max(1, int(w_in)), cv2.LINE_AA, shift=2)
    d = np.gradient(np.asarray(pts, float), axis=0); n = np.stack([-d[:, 1], d[:, 0]], 1)
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
    off = (w_out + w_in) / 4
    line(c, pts + n * off, 2, seed=seed, passes=1, amp=0.8)
    line(c, pts - n * off, 2, seed=seed + 5, passes=1, amp=0.8)

def hand(c, ctr, ang, pose, sc, mirror=False, seed=0):
    r = 19 * sc
    for i, (da, ln) in enumerate(HANDS[pose]):
        a = math.radians(ang + (-da if mirror else da))
        p0 = (ctr[0] + math.cos(a) * r * 0.6, ctr[1] + math.sin(a) * r * 0.6)
        p1 = (ctr[0] + math.cos(a) * (r + ln * sc * 1.1), ctr[1] + math.sin(a) * (r + ln * sc * 1.1))
        tube(c, [p0, p1], 14 * sc, 6.5 * sc, seed + i)
    cv2.circle(c, (int(ctr[0] * 4), int(ctr[1] * 4)), int((r + 2.5 * sc) * 4), _col(INK), -1, cv2.LINE_AA, shift=2)
    cv2.circle(c, (int(ctr[0] * 4), int(ctr[1] * 4)), int((r - 2.5 * sc) * 4), _col(PAPER), -1, cv2.LINE_AA, shift=2)
    line(c, ellipse_pts(ctr[0], ctr[1], r + 1, r + 1, 24, 0, 6.6), 2, seed=seed + 9, passes=1)
    if pose == "pencil":
        a = math.radians(ang - 30 * (-1 if mirror else 1))
        tip = (ctr[0] + math.cos(a) * 70 * sc, ctr[1] + math.sin(a) * 70 * sc)
        back = (ctr[0] - math.cos(a) * 30 * sc, ctr[1] - math.sin(a) * 30 * sc)
        cv2.line(c, (int(back[0] * 4), int(back[1] * 4)), (int(tip[0] * 4), int(tip[1] * 4)), _col(INK), max(2, int(9 * sc)), cv2.LINE_AA, shift=2)

def ik(hip, ank, l1, l2, sign):
    hip, ank = np.asarray(hip, float), np.asarray(ank, float)
    d = ank - hip; L = np.linalg.norm(d) + 1e-9
    L2 = min(L, l1 + l2 - 0.5)
    a = (l1 ** 2 - l2 ** 2 + L2 ** 2) / (2 * L2)
    h = math.sqrt(max(0.0, l1 ** 2 - a ** 2))
    u = d / L; n = np.array([-u[1], u[0]]) * sign
    return hip + u * a + n * h

def default_state():
    return dict(x=540.0, y=1650.0, sc=0.62, yaw=0.0, head_yaw=None, tilt=0.0, lean=0.0, sq=0.0, hop=0.0, neck=0.0,
                phase=0.0, walk=0.0, feet=None, arms=None, expr="neutral", look=(0, 0.2), blink=0.0, talk=0.0,
                ink=0.0, hair_kick=0.0, seed=0)

EXPR = {
    "neutral":      dict(lid=(0.05, 0.05), pupil=1.0, mouth="flat"),
    "happy":        dict(lid=(0.12, 0.12), pupil=1.0, mouth="smile"),
    "shocked":      dict(lid=(0.0, 0.0), pupil=0.55, mouth="o"),
    "curious":      dict(lid=(0.0, 0.22), pupil=1.0, mouth="small"),
    "excited":      dict(lid=(0.0, 0.0), pupil=1.3, mouth="grin"),
    "confused":     dict(lid=(0.0, 0.38), pupil=0.8, mouth="wavy"),
    "focused":      dict(lid=(0.3, 0.3), pupil=0.9, mouth="small"),
    "sus":          dict(lid=(0.5, 0.5), pupil=1.0, mouth="flat"),
    "smug":         dict(lid=(0.42, 0.42), pupil=1.0, mouth="smirk"),
}

def draw_mori(c, st):
    sc, X, Y = st["sc"], st["x"], st["y"]
    yaw = clamp(st["yaw"], -1, 1); ay = abs(yaw); fac = 1 if yaw >= 0 else -1
    hyaw = st["head_yaw"] if st["head_yaw"] is not None else yaw
    sq, hop = st["sq"], st["hop"]
    sx, sy = sc * (1 - sq * 0.5), sc * (1 + sq)
    sd = st["seed"]
    wf = lerp(1.0, 0.7, ay)
    pelvis = np.array([0.0, HIP_Y])

    def P(u, v):  # character units -> screen
        return np.array([X + u * sx, Y - hop + v * sy])
    def cz(v): return v if v >= -390 else -390 + (v + 390) * 0.8   # shorter torso
    def PT(u, v, comp=True):  # torso space (leans around pelvis)
        if comp: v = cz(v)
        a = math.radians(st["lean"]); du, dv = u - pelvis[0], v - pelvis[1]
        return P(pelvis[0] + du * math.cos(a) - dv * math.sin(a), pelvis[1] + du * math.sin(a) + dv * math.cos(a))
    def PTs(pts): return np.array([PT(*p) for p in pts])

    lw = 5.5 * sc  # base ink weight

    # ---------------- legs
    bob = st.get("bob", 0.0)
    legs = []
    for side in (0, 1):  # 0 = A (screen-left in front view), 1 = B
        sgn = -1 if side == 0 else 1
        hip = np.array([sgn * 64 * (1 - ay) + (-fac * 8 if side == 1 else fac * 8) * ay, HIP_Y + bob])
        fx, lift = st["feet"][side] if st["feet"] is not None else (0.0, 0.0)
        ank = np.array([hip[0] * (1 - ay) + sgn * 30 * (1 - ay) + fac * fx * ay, ANKLE_Y - lift])
        knee_sign = (fac if ay > 0.3 else -sgn * 0.3) * -1
        if ay > 0.3: knee_sign = -fac
        knee = ik(hip, ank, L_THIGH, L_SHIN, knee_sign) if ay > 0.3 else (hip + ank) / 2 + np.array([sgn * 6, 0])
        legs.append((hip, knee, ank, lift))
    near = 0 if yaw >= 0 else 1   # facing right -> A is near

    def draw_leg(side):
        hip, knee, ank, lift = legs[side]
        path = np.vstack([bez(hip, knee, knee, 8), bez(knee, knee, ank, 8)[1:]])
        path = np.array([P(*p) for p in path])
        widths = np.interp(np.linspace(0, 1, len(path)), [0, 0.45, 0.8, 1], [150, 136, 138, 156]) * sc / 2
        d = np.gradient(path, axis=0); n = np.stack([-d[:, 1], d[:, 0]], 1); n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
        poly = np.vstack([path + n * widths[:, None], (path - n * widths[:, None])[::-1]])
        shape(c, poly, lw, seed=sd + 40 + side, amp=1.1)
        # baggy folds + shading on the inner edge
        kp = P(*knee); ap = P(*ank)
        line(c, [kp + (-30 * sc, -10 * sc), kp + (10 * sc, 8 * sc)], lw * 0.6, seed=sd + 50 + side, passes=1)
        line(c, [ap + (-40 * sc, -40 * sc), ap + (-5 * sc, -20 * sc), ap + (30 * sc, -38 * sc)], lw * 0.6, seed=sd + 52 + side, passes=1)
        inner = np.vstack([path[2:-2] - n[2:-2] * widths[2:-2, None], (path[2:-2] - n[2:-2] * widths[2:-2, None] * 0.55)[::-1]])
        hatch(c, inner, 70, 7 * sc + 3, 2, seed=sd + 54 + side, amt=0.8)
        # sneaker
        gx = ank[0] + fac * 50 * ay + (0 if ay > 0.3 else (-1 if side == 0 else 1) * 14); gy = -50 - lift
        rx, ry = lerp(100, 122, ay) * sc, 60 * sc
        ctr = P(gx, gy)
        toe_tilt = 0.0
        if st["walk"] > 0.05 and ay > 0.5: toe_tilt = -fac * 14 * math.sin(min(lift / 55.0, 1.0) * math.pi)
        sh_pts = ellipse_pts(ctr[0], ctr[1], rx, ry, 48)
        sh_pts[:, 1] = np.where(sh_pts[:, 1] > ctr[1], ctr[1] + (sh_pts[:, 1] - ctr[1]) * 0.8, sh_pts[:, 1])  # flat sole
        sh_pts = rot_pts(sh_pts, toe_tilt, *ctr)
        shape(c, sh_pts, lw * 1.05, seed=sd + 60 + side)
        sole = rot_pts([(ctr[0] - rx * 0.95, ctr[1] + ry * 0.35), (ctr[0] + rx * 0.95, ctr[1] + ry * 0.35)], toe_tilt, *ctr)
        line(c, sole, lw * 0.8, seed=sd + 62 + side, passes=1)
        toe_c = (ctr[0] + fac * rx * 0.55 * ay, ctr[1] + ry * 0.05)
        cap = ellipse_pts(toe_c[0], toe_c[1], rx * lerp(0.55, 0.42, ay), ry * 0.6, 20, math.pi * 1.05, math.pi * 1.95)
        line(c, rot_pts(cap, toe_tilt, *ctr), lw * 0.6, seed=sd + 64 + side, passes=1)
        lx = ctr[0] - fac * rx * 0.15 * ay
        for k in range(3):
            yy = ctr[1] - ry * 0.55 + k * 9 * sc
            line(c, rot_pts([(lx - 12 * sc, yy - 5 * sc), (lx + 12 * sc, yy + 5 * sc)], toe_tilt, *ctr), lw * 0.45, seed=sd + 66 + k, passes=1)
        # pant hem bunched over the shoe
        hem = [P(ank[0] - 76, ank[1] + 4), P(ank[0] - 25, ank[1] + 16), P(ank[0] + 22, ank[1] + 8), P(ank[0] + 76, ank[1] + 14)]
        line(c, hem, lw * 0.9, seed=sd + 68 + side, passes=2)

    # ---------------- arms (targets relative to shoulder, character units, screen-oriented)
    shoulder_l = [(-100 * wf + fac * 18 * ay, -728), (100 * wf + fac * 18 * ay, -728)]
    if ay > 0.35:
        shoulder_l = [(fac * 10 * (1 if s == near else -1) + fac * 8, -728) for s in (0, 1)]
    arms = st["arms"] or [dict(t=(-70, 300), bend=-25, pose="open", hang=0), dict(t=(70, 300), bend=25, pose="open", hang=0)]

    def draw_arm(side):
        a = arms[side]
        sh = np.array(shoulder_l[side], float)
        tgt = sh + np.array(a["t"], float)
        d = tgt - sh; L = np.linalg.norm(d) + 1e-9; u = d / L
        reach = 115.0
        e = sh + u * reach                       # sleeve end
        # sleeve
        n = np.array([-u[1], u[0]])
        sl = [sh + n * 46, e + n * 62 + u * 6, e - n * 62 - u * 2, sh - n * 46]
        slp = PTs(sl)
        # arm noodle from sleeve end to hand
        bend = a.get("bend", 0)
        ctrl = (e + tgt) / 2 + n * bend
        pts = PTs(bez(e - u * 10, ctrl, tgt, 20))
        tube(c, pts, 23 * sc, 12 * sc, seed=sd + 80 + side)
        fill(c, slp, PAPER)
        line(c, slp, lw, seed=sd + 84 + side)
        line(c, PTs(bez(e + n * 62, e + u * 14, e - n * 62, 10)), lw * 0.8, seed=sd + 86 + side, passes=1)
        hatch(c, PTs([sh - n * 40, e - n * 58, e - n * 30, sh - n * 20]), 60, 7 * sc + 3, 2, seed=sd + 88 + side, amt=0.7)
        dd = pts[-1] - pts[-3]
        hand(c, pts[-1], math.degrees(math.atan2(dd[1], dd[0])) + a.get("hang", 0), a.get("pose", "open"), sc, mirror=(side == 0), seed=sd + 90 + side * 10)

    # ---------------- torso (baggy tee)
    def draw_torso():
        hw = 104 * wf; hem_w = 158 * wf; fwd = fac * 14 * ay
        right = [(34 * wf, -772), (hw, -742), (hw + 26, -620), (hem_w + 4, -386)]
        pts = [(-x + fwd * (1 if i > 1 else 0), y) for i, (x, y) in enumerate(right)][::-1]
        pts = [(x, y) for x, y in pts] + [(x + fwd * (1 if i > 1 else 0), y) for i, (x, y) in enumerate(right)]
        hem = [(hem_w + 4 + fwd, -392), (hem_w * 0.4 + fwd, -380), (-hem_w * 0.3 + fwd, -386), (-hem_w - 4 + fwd, -394)]
        body = PTs(np.vstack([resample(pts, 10), resample(hem[1:], 10)]))
        shape(c, body, lw, seed=sd + 20)
        collar = PTs(bez((-36 * wf + fac * 20 * ay, -770), (fac * 22 * ay, -735), (36 * wf + fac * 20 * ay, -770), 10))
        line(c, collar, lw * 0.8, seed=sd + 22)
        line(c, PTs([(-60 * wf + fwd, -560), (-20 * wf + fwd, -470), (-40 * wf + fwd, -420)]), lw * 0.5, seed=sd + 24, passes=1)
        line(c, PTs([(70 * wf + fwd, -650), (55 * wf + fwd, -520)]), lw * 0.5, seed=sd + 25, passes=1)
        line(c, PTs([(10 * wf + fwd, -700), (30 * wf + fwd, -640)]), lw * 0.4, seed=sd + 26, passes=1)
        shade = PTs([(-hem_w + fwd - fac * 0, -400), (-hw - 10, -700), (-hw + 22, -690), (-hem_w + 30 + fwd, -400)] if fac > 0 or ay < 0.3 else
                    [(hem_w + fwd, -400), (hw + 10, -700), (hw - 22, -690), (hem_w - 30 + fwd, -400)])
        hatch(c, shade, 65, 8 * sc + 3, 2, seed=sd + 27, amt=0.75)

    # ---------------- head
    neck_base = np.array([fac * 14 * ay, -762.0])
    pivot = neck_base + np.array([0, -48 - st["neck"]])
    def PH(u, v):  # head space: center-relative, rotated by tilt around pivot
        a = math.radians(st["tilt"])
        hu, hv = u, v - HEAD_RY - 4   # relative to pivot
        ru, rv = hu * math.cos(a) - hv * math.sin(a), hu * math.sin(a) + hv * math.cos(a)
        return PT(pivot[0] + ru, cz(pivot[1]) + rv, comp=False)
    def PHs(pts): return np.array([PH(*p) for p in pts])

    def draw_neck():
        for off in (-12, 12):
            p0 = PT(neck_base[0] + off, neck_base[1] + 8); p1 = PH(off * 0.9 + hyaw * 10, HEAD_RY - 4)
            line(c, [p0, (p0 + p1) / 2 + (off * 0.1, 0), p1], lw * 0.8, seed=sd + 100 + off, passes=1)

    phi = hyaw * 1.25
    ex = EXPR[st["expr"]]

    def ear(side, front):
        th = (-1.5 if side == 0 else 1.5) + phi
        vis = math.cos(th)
        if (vis > 0.12) != front or vis < -0.55: return
        x = HEAD_RX * 1.0 * math.sin(th); y = 72 if side == 0 else 62
        w = 64 * (0.55 + 0.45 * abs(math.sin(th))); h = 78
        out = np.sign(math.sin(th)) or 1
        pts = [(x - out * 8, y - h / 2), (x + out * w * 0.8, y - h / 2 - 4), (x + out * w, y + 4), (x + out * w * 0.75, y + h / 2), (x - out * 8, y + h / 2 + 2)]
        shape(c, PHs(pts), lw * 0.9, seed=sd + 110 + side)
        cx, cy = x + out * w * 0.45, y + 4
        line(c, PHs([(cx - 9, cy - 9), (cx + 9, cy + 9)]), lw * 0.6, seed=sd + 112, passes=1)
        line(c, PHs([(cx + 9, cy - 9), (cx - 9, cy + 9)]), lw * 0.6, seed=sd + 113, passes=1)

    def draw_head():
        ear(0, False); ear(1, False)
        # back hair silhouette (behind the head)
        for i, (base, dirv, ln, bend, wd) in enumerate(HAIR[::4]):
            b = (base[0] * 1.02 - hyaw * 25, base[1])
            tip = (b[0] + dirv[0] * ln * 0.7 - hyaw * 50, b[1] + dirv[1] * ln * 0.7)
            taper(c, PHs(bez(b, ((b[0] + tip[0]) / 2, (b[1] + tip[1]) / 2), tip, 6)), wd * sc, 0.8)
        head = ellipse_pts(0, 0, HEAD_RX, HEAD_RY, 72)
        head[:, 1] = np.where(head[:, 1] > 0, head[:, 1] * 0.96, head[:, 1])
        shape(c, PHs(head), lw * 1.1, seed=sd + 120)
        ear(0, True); ear(1, True)
        # eyes
        lx, ly = st["look"]
        bl = st["blink"]
        eyes = [(-0.50, 18, 94, 102), (0.46, -8, 98, 106)]
        order = sorted(range(2), key=lambda i: math.cos(eyes[i][0] + phi))
        for i in order:
            th, ey, erx, ery = eyes[i]
            cth = math.cos(th + phi)
            if cth < 0.08: continue
            k = max(0.32, cth)
            exx = HEAD_RX * 0.93 * math.sin(th + phi) * 0.92
            lim = HEAD_RX * 0.97 - erx * k
            exx = max(-lim, min(lim, exx))
            el = ellipse_pts(exx, ey, erx * k, ery, 40)
            shape(c, PHs(el), lw * 1.25, seed=sd + 130 + i, passes=2, amp=1.0)
            if st["ink"] > 0.5: pass
            ps = ex["pupil"] * (0.8 if ex["mouth"] == "wavy" and i == 0 else 1.0)
            pxx = exx + (lx + hyaw * 0.3) * (erx * k - 24) ; pyy = ey + ly * (ery - 28)
            fill(c, PHs(ellipse_pts(pxx, pyy, 13 * ps * max(k, 0.6), 20 * ps, 20)), INK)
            fill(c, PHs(ellipse_pts(pxx + 4, pyy - 7, 4.5, 4.5, 10)), PAPER)
            lid = max(ex["lid"][i], bl)
            if lid > 0.02:
                yl = ey - ery + 2 * ery * lid
                top = ellipse_pts(exx, ey, erx * k + 3, ery + 3, 40, math.pi, 2 * math.pi)
                top = top[top[:, 1] <= yl] if (top[:, 1] <= yl).any() else top[:1]
                half = erx * k * math.sqrt(max(0.0, 1 - ((yl - ey) / ery) ** 2))
                poly = np.vstack([[(exx - half, yl)], top, [(exx + half, yl)]])
                fill(c, PHs(poly), PAPER)
                line(c, PHs(bez((exx - half, yl), (exx, yl + 8 * bl), (exx + half, yl), 10)), lw * 1.1, seed=sd + 136 + i)
        # nose + mouth
        thn = -0.08 + phi
        if math.cos(thn) > 0.1:
            nx = HEAD_RX * 0.9 * math.sin(thn)
            line(c, PHs([(nx - 6, 82), (nx + 6, 80)]), lw * 0.8, seed=sd + 140, passes=1)
            mx, my = HEAD_RX * 0.88 * math.sin(thn + 0.02), 140
            m = st["talk"]; mode = ex["mouth"]
            if m > 0.12:
                oh = 6 + 28 * m; ow = (17 if mode in ("grin", "smile") else 12) + 10 * m
                fill(c, PHs(ellipse_pts(mx, my + oh * 0.3, ow * max(0.5, math.cos(thn)), oh, 24)), INK)
                if m > 0.45: fill(c, PHs(ellipse_pts(mx, my + oh * 0.75, ow * 0.5, oh * 0.33, 16)), (200, 110, 120))
            elif mode == "smile":
                line(c, PHs(bez((mx - 22, my - 4), (mx, my + 14), (mx + 22, my - 4), 10)), lw * 0.9, seed=sd + 142, passes=1)
            elif mode == "grin":
                fill(c, PHs(bez((mx - 24, my - 4), (mx, my + 32), (mx + 24, my - 4), 14)), INK)
            elif mode == "o":
                fill(c, PHs(ellipse_pts(mx, my + 4, 9, 12, 16)), INK)
            elif mode == "wavy":
                xs = np.linspace(-20, 20, 14)
                line(c, PHs(np.stack([mx + xs, my + 4 * np.sin(xs / 4 + st.get("t", 0) * 6)], 1)), lw * 0.8, seed=sd + 144, passes=1)
            elif mode == "smirk":
                line(c, PHs(bez((mx - 18, my + 2), (mx + 2, my + 5), (mx + 24, my - 10), 10)), lw * 0.9, seed=sd + 146, passes=1)
            elif mode == "small":
                line(c, PHs([(mx - 8, my), (mx + 8, my)]), lw * 0.8, seed=sd + 148, passes=1)
            else:
                line(c, PHs([(mx - 14, my), (mx + 14, my + 1)]), lw * 0.8, seed=sd + 149, passes=1)
        # ink-splat face gag
        if st["ink"] > 0:
            k = st["ink"]
            bp = blob_pts(20 + hyaw * 60, 30, 175 * min(1, k * 1.4), 777, 11, (0.75, 1.25))
            bp[:, 0] = np.clip(bp[:, 0], -HEAD_RX * 0.98, HEAD_RX * 0.98)
            bp[:, 1] = np.clip(bp[:, 1], -HEAD_RY * 0.7, HEAD_RY * 0.95)
            fill(c, PHs(bp), INK)
            for j, dx in enumerate((-90, 10, 120)):   # drips
                dl = (40 + 50 * j % 3) * clamp((k - 0.4) * 2)
                taper(c, PHs([(dx, 120), (dx + 2, 120 + dl)]), 16 * sc, 6 * sc)
            for i, (th, ey, erx, ery) in enumerate(eyes):   # eye whites peek through
                cth = math.cos(th + phi)
                if cth < 0.08: continue
                exx = HEAD_RX * 0.93 * math.sin(th + phi) * 0.92; kk = max(0.32, cth)
                lid = max(0.35, st["blink"])
                fill(c, PHs(ellipse_pts(exx, ey + ery * 0.15, erx * kk * 0.55, ery * 0.5 * (1 - st["blink"]) + 2, 24)), PAPER)
                if st["blink"] < 0.7: fill(c, PHs(ellipse_pts(exx + lx * 10, ey + 12, 9, 13, 12)), INK)
        # hair (front): dark mop with a jagged hairline, then loose strands
        kick = st["hair_kick"]
        hs = -hyaw * 0.22 * HEAD_RX
        rr_ = np.random.default_rng(5)
        outer = []
        for k_, a in enumerate(np.linspace(math.pi - 0.12, 2 * math.pi + 0.12, 56)):
            rad = 1.0 + (rr_.uniform(0.08, 0.2) if k_ % 2 else rr_.uniform(0, 0.05))
            outer.append((math.cos(a) * HEAD_RX * rad * (1 - 0.1 * abs(hyaw)) + hs, math.sin(a) * HEAD_RY * rad - 6))
        hl = []
        xs_ = np.linspace(HEAD_RX * 0.98, -HEAD_RX * 0.98, 27)
        for k_, xx_ in enumerate(xs_):
            yy_ = -HEAD_RY * 0.52 + (rr_.uniform(15, 60) if k_ % 2 else rr_.uniform(-10, 5))
            if abs(xx_) > HEAD_RX * 0.78: yy_ = -HEAD_RY * 0.12 + (rr_.uniform(20, 70) if k_ % 2 else 0)
            hl.append((xx_ * (1 - 0.15 * abs(hyaw)) + hyaw * 0.3 * HEAD_RX, yy_))
        mop = np.array(outer + hl)
        fill(c, PHs(mop), INK)
        for k_ in range(45):   # paper scratches inside the mop
            a = rr_.uniform(math.pi + 0.2, 2 * math.pi - 0.2); r0 = rr_.uniform(0.7, 0.98)
            p0 = (math.cos(a) * HEAD_RX * r0 + hs, math.sin(a) * HEAD_RY * r0)
            p1 = (p0[0] + math.cos(a + 1.3) * 40, p0[1] + math.sin(a + 1.3) * 30)
            line(c, PHs([p0, p1]), max(1.0, lw * 0.3), col=PAPER, seed=sd + 170 + k_, passes=1, amp=0.5)
        for i, (base, dirv, ln, bend, wd) in enumerate(HAIR):
            b = (base[0] * (1 - 0.12 * abs(hyaw)) - hyaw * 22, base[1])
            dv = (dirv[0] - hyaw * 0.25, dirv[1] - kick * 0.4)
            tip = (b[0] + dv[0] * ln, b[1] + dv[1] * ln)
            mid = ((b[0] + tip[0]) / 2 - dv[1] * ln * bend, (b[1] + tip[1]) / 2 + dv[0] * ln * bend)
            taper(c, PHs(bez(b, mid, tip, 8)), wd * sc, 0.8)
        for (a, rr, dd, ln) in HAIR_SCRIB:
            p = (math.cos(a) * HEAD_RX * rr - hyaw * 22, math.sin(a) * HEAD_RY * rr)
            q = (p[0] + math.cos(a + dd + 1.4) * ln, p[1] + math.sin(a + dd + 1.4) * ln * 0.6)
            line(c, PHs([p, q]), lw * 0.55, seed=sd + 160, passes=1, amp=0.6)
        for i, (base, dirv, ln, bend, wd) in enumerate(FRINGE):
            b = (base[0] * (1 - 0.25 * abs(hyaw)) + hyaw * 70, base[1])
            tip = (b[0] + (dirv[0] + hyaw * 0.35) * ln, b[1] + (dirv[1] - kick * 0.3) * ln)
            mid = ((b[0] + tip[0]) / 2 + ln * bend * 0.4, (b[1] + tip[1]) / 2)
            taper(c, PHs(bez(b, mid, tip, 8)), wd * sc, 0.8)

    # ---------------- draw order (depth)
    side_view = ay > 0.35
    if side_view:
        far = 1 - near
        draw_arm(far); draw_leg(far); draw_leg(near); draw_torso(); draw_neck(); draw_head(); draw_arm(near)
    else:
        draw_leg(0); draw_leg(1); draw_torso(); draw_neck(); draw_head(); draw_arm(0); draw_arm(1)

def shadow(c, x, y, sc, hop, dark=False):
    w = 210 * sc * (1 - min(hop, 300) / 700)
    col = (40, 37, 36) if dark else SHADE
    fill(c, ellipse_pts(x, y - 4, w, 16 * sc + 4, 40), col)
    line(c, [(x - w * 1.1, y + 6), (x + w * 1.05, y + 4)], 2.5, seed=999, passes=1)

def walk_feet(phase, walk, step=200.0):
    """phase in cycles. returns [(fx, lift)] for A,B in character units (forward = +)."""
    out = []
    for side in (0, 1):
        q = (phase + 0.5 * side) % 1.0
        if q < 0.5:
            fx = step / 2 - (q / 0.5) * step; lift = 0.0
        else:
            s = (q - 0.5) / 0.5
            fx = -step / 2 + step * ease_io(s); lift = math.sin(math.pi * s) * 62
        out.append((fx * walk + (1 - walk) * (24 if side == 0 else -24), lift * walk))
    return out
