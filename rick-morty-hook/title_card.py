#!/usr/bin/env python3
"""
Animated 3D title card: "Every Character / KILLED OFF / [Rick and Morty logo]".

Look: Get Schwifty lettering (the Rick and Morty logo font) in the logo colours
(cyan face, dark teal inner line, lime outline, black edge) with a deep green 3D
extrusion and glossy bevel; the real logo (assets/rick_and_morty_logo.webp) is
extruded the same way. (The O in "Off" uses the font's 0 glyph: its o has a tiny
counter that reads as a c.)

Beats (default 4.25s card):
  0.00  white flash + portal zoom punch
  0.05  "EVERY CHARACTER" letters tumble in one by one with full 3D spins
  0.55  "KILLED OFF" slams in: zoom blur, RGB split, speed lines, sparks, big shake
  1.15  Rick and Morty logo spins in from deep space, lands with bounce + shake
  1.95  light sweep across everything
  3.63  "deaths" hit: scale pulse, shake, RGB split, sparks
  end   whip-out (zoom + motion blur)
  throughout: 3D camera sway/dolly, glow pulse, spinning
  portal, handheld shake, and synthesised SFX for every beat.

Outputs
  title_card.mp4          full frame, animated green portal background + SFX
  title_card_overlay.mov  transparent overlay (ProRes 4444 + SFX) with --prores:
                          text, logo, glow, sparks, speed lines, flashes; no portal
  title_card_overlay.webm same overlay as VP9 with alpha (small file)

  python3 title_card.py [--dur 4.25] [--deaths-at 3.63] [--outdir .] [--prores]
"""
import argparse, math, os, subprocess, wave
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "fonts", "get_schwifty.ttf")
LOGO = os.path.join(HERE, "assets", "rick_and_morty_logo.webp")
W, H, FPS = 1920, 1080, 30
SR = 48000

CYAN = np.array([0x00, 0xB5, 0xCC]) / 255
CYAN_HI = np.array([0x8F, 0xF3, 0xFF]) / 255
TEAL_DK = np.array([0x0E, 0x3B, 0x40]) / 255
LIME = np.array([0xB1, 0xDF, 0x27]) / 255
LIME_HI = np.array([0xE8, 0xFF, 0x9A]) / 255
EXT_NEAR = np.array([0x4E, 0x7A, 0x12]) / 255
EXT_FAR = np.array([0x0A, 0x1C, 0x05]) / 255

# ---------------------------------------------------------------- helpers
def disk(r):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))

def shift(a, dx, dy):
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(a, M, (a.shape[1], a.shape[0]), flags=cv2.INTER_LINEAR)

def over(dst, rgb, a):
    """Composite colour `rgb` (HxWx3 or 3,) with coverage `a` over premultiplied dst."""
    a = a[..., None]
    dst[..., :3] = rgb * a + dst[..., :3] * (1 - a)
    dst[..., 3:] = a + dst[..., 3:] * (1 - a)

def ease_out_back(x, s=2.2):
    x = min(max(x, 0.0), 1.0) - 1
    return x * x * ((s + 1) * x + s) + 1

def ease_in(x):
    x = min(max(x, 0.0), 1.0); return x * x * x

def clamp01(x):
    return min(max(x, 0.0), 1.0)

def smooth_noise(seed, n, step):
    """1-D smooth random curve sampled at n points (value noise, cosine interp)."""
    rng = np.random.default_rng(seed)
    k = rng.uniform(-1, 1, int(n * step) + 3)
    out = np.empty(n)
    for i in range(n):
        x = i * step; i0 = int(x); f = (1 - math.cos((x - i0) * math.pi)) / 2
        out[i] = k[i0] * (1 - f) + k[i0 + 1] * f
    return out

# ---------------------------------------------------------------- letters
def build_letter(ch, font, cx_screen, depth):
    """Return premultiplied RGBA sprite for one glyph + its anchor offset."""
    pad = 40 + depth
    l, t, r, b = font.getbbox(ch)
    gw, gh = r - l, b - t
    img = Image.new("L", (gw + 2 * pad, gh + 2 * pad), 0)
    ImageDraw.Draw(img).text((pad - l, pad - t), ch, font=font, fill=255)
    m = np.asarray(img, np.float32) / 255

    sc = font.size / 200.0
    m1 = cv2.dilate(m, disk(max(2, int(3 * sc))))     # dark teal inner line
    m2 = cv2.dilate(m, disk(max(4, int(9 * sc))))     # lime outline
    m3 = cv2.dilate(m, disk(max(6, int(13 * sc))))    # black edge
    hh, ww = m.shape
    spr = np.zeros((hh, ww, 4), np.float32)

    # 3D extrusion: painter's algorithm far -> near, leaning toward screen centre
    lean = (W / 2 - cx_screen) / W * 0.9
    for k in range(depth, 0, -1):
        f = k / depth
        col = EXT_NEAR * (1 - f) + EXT_FAR * f
        layer = shift(m3, lean * k, k)
        over(spr, col, layer)
    # side edge line between extrusion and face
    over(spr, np.zeros(3), m3)

    yy = np.linspace(0, 1, hh, dtype=np.float32)[:, None, None]
    lime = LIME * (0.85 + 0.25 * (1 - yy))
    over(spr, np.clip(lime, 0, 1), m2)
    # lime bevel (top edges)
    edge2 = np.clip(m2 - shift(m2, 0, 7 * sc), 0, 1)
    over(spr, LIME_HI, cv2.GaussianBlur(edge2, (0, 0), 2) * 0.9)

    over(spr, TEAL_DK, m1)
    rng = np.random.default_rng(abs(hash(ch)) % 2**32)
    grain = cv2.GaussianBlur(rng.normal(0, 1, (hh, ww)).astype(np.float32), (0, 0), 3)[..., None]
    cyan = CYAN * (0.82 + 0.35 * (1 - yy)) + grain * 0.04
    over(spr, np.clip(cyan, 0, 1), m)
    # glossy bevel on cyan face: bright top edge, darker bottom edge
    top = np.clip(m - shift(m, 0, 9 * sc), 0, 1)
    bot = np.clip(m - shift(m, 0, -7 * sc), 0, 1)
    over(spr, CYAN_HI, cv2.GaussianBlur(top, (0, 0), 2.5) * 0.85)
    over(spr, CYAN * 0.45, cv2.GaussianBlur(bot, (0, 0), 2) * 0.6)
    return spr, pad, (l, t, gw, gh)

class Line:
    def __init__(self, text, size, cy, depth):
        self.font = ImageFont.truetype(FONT, size)
        adv = [self.font.getlength(c) for c in text]
        track = -0.02 * size
        total = sum(adv) + track * (len(text) - 1)
        x = W / 2 - total / 2
        self.letters = []
        for c, a in zip(text, adv):
            if c != " ":
                l, t, r, b = self.font.getbbox(c)
                cx = x + (l + r) / 2
                spr, pad, (gl, gt, gw, gh) = build_letter(c, self.font, cx, depth)
                # screen position of sprite top-left at rest
                asc = self.font.getmetrics()[0]
                px = x + gl - pad
                py = cy - asc / 2 - size * 0.15 + gt - pad
                self.letters.append(dict(spr=spr, x=px, y=py, cx=cx))
            x += a + track

def paste(canvas, spr, x, y, alpha=1.0):
    h, w = spr.shape[:2]
    x0, y0 = int(round(x)), int(round(y))
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if xa >= xb or ya >= yb:
        return
    s = spr[ya - y0:yb - y0, xa - x0:xb - x0] * alpha
    canvas[ya:yb, xa:xb] = s + canvas[ya:yb, xa:xb] * (1 - s[..., 3:])

# ---------------------------------------------------------------- 3D camera
def perspective(layer, yaw, pitch, roll, zoom, tx, ty, f=1700.0):
    cx, cy = W / 2, H / 2
    pts = np.array([[-cx, -cy, 0], [cx, -cy, 0], [cx, cy, 0], [-cx, cy, 0]], np.float64)
    cyw, syw = math.cos(yaw), math.sin(yaw)
    cp, sp = math.cos(pitch), math.sin(pitch)
    cr, sr = math.cos(roll), math.sin(roll)
    Ry = np.array([[cyw, 0, syw], [0, 1, 0], [-syw, 0, cyw]])
    Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
    Rz = np.array([[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]])
    p = pts @ (Rz @ Rx @ Ry).T
    z = p[:, 2] + f
    dst = np.stack([p[:, 0] * f / z * zoom + cx + tx, p[:, 1] * f / z * zoom + cy + ty], 1)
    src = np.float32([[0, 0], [W, 0], [W, H], [0, H]])
    M = cv2.getPerspectiveTransform(src, dst.astype(np.float32))
    return cv2.warpPerspective(layer, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))

def scale_about(layer, s, cx, cy):
    M = np.float32([[s, 0, cx * (1 - s)], [0, s, cy * (1 - s)]])
    return cv2.warpAffine(layer, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))

# ---------------------------------------------------------------- background
class Portal:
    """Rick and Morty style green portal: spiral bands, bright core, dark rim."""
    def __init__(self):
        h, w = H // 2, W // 2
        y, x = np.mgrid[0:h, 0:w].astype(np.float32)
        x, y = x - w / 2, y - h / 2
        self.r = np.sqrt(x * x + (y * 1.15) ** 2) / (h / 2)
        self.th = np.arctan2(y, x)
        rng = np.random.default_rng(7)
        self.n = cv2.GaussianBlur(cv2.resize(rng.random((12, 20)).astype(np.float32), (w, h),
                                             interpolation=cv2.INTER_CUBIC), (0, 0), 25)
        self.lr = np.log(self.r + 0.08)

    def frame(self, t):
        a = self.th * 2 - self.lr * 5.5 + t * 4.0 + self.n * 4
        bands = 0.5 + 0.5 * np.sin(a)
        bands2 = 0.5 + 0.5 * np.sin(self.th * 3 - self.lr * 9 + t * 6.5 + 1.3)
        v = 0.65 * bands ** 2 + 0.35 * bands2 ** 3
        disc = 1 / (1 + np.exp((self.r - 1.05) * 9))          # portal disc falloff
        core = np.exp(-(self.r / 0.32) ** 2)
        g = (0.18 + 0.82 * v) * disc
        dark = np.array([0.02, 0.10, 0.03]); mid = np.array([0.20, 0.62, 0.10])
        hi = np.array([0.72, 0.98, 0.30]); white = np.array([0.93, 1.0, 0.82])
        g3 = g[..., None]
        img = np.where(g3 < 0.5, dark + (mid - dark) * (g3 / 0.5), mid + (hi - mid) * ((g3 - 0.5) / 0.5))
        img = img + (white - img) * (core * 0.85)[..., None]
        img = img * (0.25 + 0.75 * disc)[..., None]
        img = img * 0.8                                         # keep it behind the text
        img = cv2.resize(img.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
        return np.clip(img, 0, 1)

# ---------------------------------------------------------------- logo
def build_logo(width, depth):
    """Extruded 3D sprite of the Rick and Morty logo (black background keyed out)."""
    img = np.asarray(Image.open(LOGO).convert("RGB"), np.float32) / 255
    lum = img.max(-1)
    on = (lum > 0.12).astype(np.uint8)
    # drop tiny components (the TM mark)
    n, lab, st, _ = cv2.connectedComponentsWithStats(on, 8)
    keep = np.zeros_like(on)
    for k in range(1, n):
        if st[k, cv2.CC_STAT_AREA] > 4000:
            keep[lab == k] = 1
    ys, xs = np.nonzero(keep)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    img, keep = img[y0:y1 + 1, x0:x1 + 1], keep[y0:y1 + 1, x0:x1 + 1]
    s = width / img.shape[1]
    size = (width, int(img.shape[0] * s))
    img = cv2.resize(img, size, interpolation=cv2.INTER_AREA)
    m = cv2.resize(keep.astype(np.float32), size, interpolation=cv2.INTER_AREA)
    # fill the dark lines inside the logo so they stay part of it
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, disk(4))
    pad = 30 + depth
    img = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    m = cv2.copyMakeBorder(m, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    m3 = cv2.dilate(m, disk(7))
    hh, ww = m.shape
    spr = np.zeros((hh, ww, 4), np.float32)
    for k in range(depth, 0, -1):
        f = k / depth
        over(spr, EXT_NEAR * (1 - f) + EXT_FAR * f, shift(m3, 0, k))
    over(spr, np.zeros(3), m3)
    over(spr, img, m)
    top = np.clip(m - shift(m, 0, 7), 0, 1)
    over(spr, np.array([1.0, 1.0, 0.9]), cv2.GaussianBlur(top, (0, 0), 2) * 0.55)
    return spr

# ---------------------------------------------------------------- 3D sprite warp
def warp3d(spr, rx, ry, rz, s, f=1100.0):
    """Rotate a sprite in 3D about its centre and project it. Returns (img, ox, oy):
    the image and the offset of its top-left from the sprite centre."""
    h, w = spr.shape[:2]
    pts = np.array([[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]])
    cx_, sx_ = math.cos(rx), math.sin(rx)
    cy_, sy_ = math.cos(ry), math.sin(ry)
    cz_, sz_ = math.cos(rz), math.sin(rz)
    R = (np.array([[cz_, -sz_, 0], [sz_, cz_, 0], [0, 0, 1]]) @
         np.array([[1, 0, 0], [0, cx_, -sx_], [0, sx_, cx_]]) @
         np.array([[cy_, 0, sy_], [0, 1, 0], [-sy_, 0, cy_]]))
    p = pts @ R.T
    z = np.maximum(p[:, 2] + f, 50)
    d = np.stack([p[:, 0] * f / z, p[:, 1] * f / z], 1) * s
    lo = np.floor(d.min(0)); hi = np.ceil(d.max(0))
    ow, oh = int(min(hi[0] - lo[0], 3 * W)) + 2, int(min(hi[1] - lo[1], 3 * H)) + 2
    if ow < 2 or oh < 2:
        return None, 0, 0
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]),
                                    (d - lo).astype(np.float32))
    out = cv2.warpPerspective(spr, M, (ow, oh), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    shade = 0.6 + 0.4 * abs(math.cos(rx) * math.cos(ry))     # darker when turned away
    out[..., :3] *= shade
    return out, lo[0], lo[1]

def paste3d(canvas, spr, cx, cy, rx=0.0, ry=0.0, rz=0.0, s=1.0, alpha=1.0):
    if abs(rx) + abs(ry) + abs(rz) < 1e-3 and abs(s - 1) < 1e-3:
        h, w = spr.shape[:2]
        paste(canvas, spr, cx - w / 2, cy - h / 2, alpha); return
    img, ox, oy = warp3d(spr, rx, ry, rz, s)
    if img is not None:
        paste(canvas, img, cx + ox, cy + oy, alpha)

# ---------------------------------------------------------------- particles & lines
class Sparks:
    def __init__(self):
        self.p = np.zeros((0, 2)); self.v = np.zeros((0, 2)); self.age = np.zeros(0)
        self.life = np.zeros(0); self.col = np.zeros((0, 3)); self.r = np.zeros(0)
        self.rng = np.random.default_rng(21)

    def burst(self, x, y, n, spread_x=500, speed=1400):
        g = self.rng
        p = np.stack([x + g.uniform(-spread_x, spread_x, n), y + g.uniform(-60, 60, n)], 1)
        a = g.uniform(0, 2 * np.pi, n); sp = g.uniform(0.25, 1, n) ** 2 * speed
        v = np.stack([np.cos(a) * sp, np.sin(a) * sp - 350], 1)
        cols = np.where(g.random(n)[:, None] < 0.6, LIME_HI, CYAN_HI) * g.uniform(0.8, 1.3, (n, 1))
        self.p = np.vstack([self.p, p]); self.v = np.vstack([self.v, v])
        self.age = np.concatenate([self.age, np.zeros(n)])
        self.life = np.concatenate([self.life, g.uniform(0.35, 1.0, n)])
        self.col = np.vstack([self.col, cols]); self.r = np.concatenate([self.r, g.uniform(1.5, 5, n)])

    def step(self, dt):
        self.v[:, 1] += 1500 * dt; self.v *= 0.97
        self.p += self.v * dt; self.age += dt
        k = self.age < self.life
        for a in ("p", "v", "age", "life", "col", "r"):
            setattr(self, a, getattr(self, a)[k])

    def draw(self, img):
        return img + self.render()

    def render(self):
        lay = np.zeros((H, W, 3), np.float32)
        for (x, y), (vx, vy), c, r, a, l in zip(self.p, self.v, self.col, self.r, self.age, self.life):
            f = 1 - a / l
            p0 = (int(x), int(y)); p1 = (int(x - vx * 0.02), int(y - vy * 0.02))
            cv2.line(lay, p0, p1, tuple(float(q) * f for q in c), max(1, int(r * f)), cv2.LINE_AA)
        glow = cv2.GaussianBlur(lay, (0, 0), 6)
        return lay + glow * 1.5

def speed_lines(img, strength, seed):
    if strength <= 0.01:
        return img
    return img + (1 - img) * speed_mask(strength, seed)[..., None]

def speed_mask(strength, seed):
    if strength <= 0.01:
        return np.zeros((H, W), np.float32)
    rng = np.random.default_rng(seed)
    lay = np.zeros((H, W), np.float32)
    for _ in range(70):
        a = rng.uniform(0, 2 * np.pi); r0 = rng.uniform(380, 650); r1 = r0 + rng.uniform(300, 900)
        p0 = (int(W / 2 + math.cos(a) * r0), int(H / 2 + math.sin(a) * r0 * 0.7))
        p1 = (int(W / 2 + math.cos(a) * r1), int(H / 2 + math.sin(a) * r1 * 0.7))
        cv2.line(lay, p0, p1, 1.0, int(rng.integers(2, 7)), cv2.LINE_AA)
    return cv2.GaussianBlur(lay, (0, 0), 1.2) * strength * 0.85

# ---------------------------------------------------------------- render
def render(dur=4.25, deaths_at=3.63, outdir=HERE, alpha_out=True, prores=False):
    n = int(round(dur * FPS))
    l1 = Line("Every Character", 180, H / 2 - 345, depth=30)
    l2 = Line("Killed 0ff", 320, H / 2 - 30, depth=46)
    logo = build_logo(1060, 40)
    logo_cy = H / 2 + 330

    T_POP = [0.05 + i * 0.032 for i in range(len(l1.letters))]
    T_SLAM0, T_HIT = 0.55, 0.72
    T_LOGO0, T_LOGO = 1.12, 1.52
    T_SWEEP = 1.95
    T_OUT = dur - 0.24
    HITS = [(0.0, 0.6), (T_HIT, 1.0), (T_LOGO, 0.8), (deaths_at, 0.7)]

    rng = np.random.default_rng(3)
    spin = [(rng.uniform(-1.6, 1.6), rng.uniform(-1.2, 1.2), rng.uniform(-0.9, 0.9),
             rng.uniform(-420, 420), rng.uniform(-300, 200)) for _ in l1.letters]
    hand_x = smooth_noise(1, n, 0.12) * 7
    hand_y = smooth_noise(2, n, 0.12) * 6
    hand_r = smooth_noise(3, n, 0.10) * 0.008
    shk_x, shk_y = smooth_noise(4, n, 1.7), smooth_noise(5, n, 1.7)
    portal = Portal()
    sparks = Sparks()
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

    mp4 = os.path.join(outdir, "title_card.mp4")
    webm = os.path.join(outdir, "title_card_overlay.webm")
    mov = os.path.join(outdir, "title_card_overlay.mov")
    wav = os.path.join(outdir, ".title_sfx.wav")
    write_sfx(wav, dur, T_POP, T_SLAM0, T_HIT, T_LOGO0, T_LOGO, T_SWEEP, deaths_at, T_OUT)

    def pipe(fmt, args):
        return subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", fmt,
                                 "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", wav] + args,
                                stdin=subprocess.PIPE)
    encs = [("rgb", pipe("rgb24", ["-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p",
                                   "-c:a", "aac", "-b:a", "192k", "-shortest", mp4]))]
    if alpha_out:
        encs.append(("rgba", pipe("rgba", ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M",
                                           "-c:a", "libopus", "-shortest", webm])))
    if prores:
        encs.append(("rgba", pipe("rgba", ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le",
                                           "-qscale:v", "8", "-alpha_bits", "8", "-c:a", "pcm_s16le", "-shortest", mov])))

    def hit_env(t, tau):
        return sum(w * math.exp(-(t - h) / tau) for h, w in HITS if t >= h)

    for i in range(n):
        t = i / FPS
        layer = np.zeros((H, W, 4), np.float32)

        # --- line 1: letters tumble in with 3D spins, then hold still
        rise = 150 * (1 - ease_out_back(clamp01((t - T_SLAM0) / 0.3), 1.4))
        rise += 120 * (1 - ease_out_back(clamp01((t - T_LOGO0 - 0.2) / 0.3), 1.4))
        for j, L in enumerate(l1.letters):
            lt = t - T_POP[j]
            if lt <= 0:
                continue
            p = ease_out_back(lt / 0.32, 1.8)
            q = 1 - p
            rx, ry, rz, ox, oy = spin[j]
            h_, w_ = L["spr"].shape[:2]
            cx = L["x"] + w_ / 2 + ox * q
            cy = L["y"] + h_ / 2 + oy * q + rise
            wig = 0.0   # letters stay locked once landed
            paste3d(layer, L["spr"], cx, cy, rx * q * 3.2, ry * q * 3.2, rz * q * 3 + wig,
                    1 + 1.6 * q, clamp01(lt / 0.05))

        # --- line 2: slam
        if t >= T_SLAM0:
            k = clamp01((t - T_SLAM0) / (T_HIT - T_SLAM0))
            s = 3.4 - 2.4 * ease_in(k)
            if t >= T_HIT:
                s = 1 + 0.09 * math.exp(-(t - T_HIT) * 11) * math.cos((t - T_HIT) * 38)
            s *= 1 + 0.07 * (math.exp(-(t - deaths_at) / 0.15) if t >= deaths_at else 0)
            lift = 120 * (1 - ease_out_back(clamp01((t - T_LOGO0 - 0.2) / 0.3), 1.4))
            g = np.zeros((H, W, 4), np.float32)
            for j, L in enumerate(l2.letters):
                h_, w_ = L["spr"].shape[:2]
                wig, bob = 0.0, 0.0   # letters stay locked once landed
                paste3d(g, L["spr"], L["x"] + w_ / 2, L["y"] + h_ / 2 + bob + lift, rz=wig)
            gy = H / 2 - 30 + lift
            if k < 1:
                acc = np.zeros_like(g)
                for q in range(9):
                    acc += scale_about(g, s * (1 + q * 0.03), W / 2, gy)
                g = acc / 9 * clamp01(k * 3)
            else:
                g = scale_about(g, s, W / 2, gy)
            layer = g + layer * (1 - g[..., 3:])
            if T_HIT <= t < T_HIT + 1 / FPS:
                sparks.burst(W / 2, H / 2 - 40, 140)

        # --- Rick and Morty logo: spins in from deep space
        if t >= T_LOGO0:
            k = clamp01((t - T_LOGO0) / (T_LOGO - T_LOGO0))
            e = ease_out_back(k, 1.6)
            rz = -2.6 * math.pi * (1 - k) ** 2.2
            rx = 0.9 * (1 - k) ** 2
            s = 0.04 + 0.96 * e
            if t >= T_LOGO:
                s = 1 + 0.06 * math.exp(-(t - T_LOGO) * 10) * math.cos((t - T_LOGO) * 34)
                rz = 0.0; rx = 0.0
            s *= 1 + 0.06 * (math.exp(-(t - deaths_at) / 0.15) if t >= deaths_at else 0)
            cy = logo_cy + math.sin(t * 2.0) * 2
            paste3d(layer, logo, W / 2, cy, rx, 0.0, rz, s, clamp01(k * 4))
            if T_LOGO <= t < T_LOGO + 1 / FPS:
                sparks.burst(W / 2, logo_cy, 110, 450, 1200)
        if deaths_at <= t < deaths_at + 1 / FPS:
            sparks.burst(W / 2, H / 2, 90, 700, 1100)

        # --- light sweep
        if T_SWEEP <= t < T_SWEEP + 0.55:
            xs = -500 + (t - T_SWEEP) / 0.55 * (W + 1000)
            band = np.exp(-((xx - xs + 0.45 * (yy - H / 2)) / 70) ** 2)
            layer[..., :3] += (band[..., None] * layer[..., 3:] * 0.75)

        # --- glow + drop shadow
        a = layer[..., 3]
        glow = cv2.GaussianBlur(cv2.resize(a, (W // 4, H // 4)), (0, 0), 8)
        glow = cv2.resize(glow, (W, H)) * (0.35 + 0.9 * hit_env(t, 0.25) + 0.12 * math.sin(t * 7))
        sh = shift(cv2.GaussianBlur(a, (0, 0), 14), 10, 20) * 0.65
        shadow = np.zeros_like(layer); shadow[..., 3] = sh
        layer = layer + shadow * (1 - layer[..., 3:])

        # --- camera
        imp = 34 * hit_env(t, 0.15)
        yaw = math.radians(12 * math.sin(t * 1.5 - 0.5))
        pitch = math.radians(9 + 4 * math.sin(t * 1.1))
        roll = hand_r[i] + math.radians(imp * 0.05 * shk_x[i]) + math.radians(2.5 * math.sin(t * 0.9))
        zoom = 0.93 + 0.07 * t / dur + 0.05 * hit_env(t, 0.12)
        tx = hand_x[i] + imp * shk_x[i]
        ty = hand_y[i] + imp * shk_y[i]
        o = clamp01((t - T_OUT) / (dur - T_OUT)) if t > T_OUT else 0
        if o:
            zoom *= 1 + 1.4 * o * o; tx += 1000 * o * o
        layer = perspective(layer, yaw, pitch, roll, zoom, tx, ty)
        glow = perspective(np.dstack([glow] * 4), yaw, pitch, roll, zoom, tx, ty)[..., 0]
        if o:
            ksz = int(2 + 130 * o) | 1
            layer = cv2.filter2D(layer, -1, np.full((1, ksz), 1 / ksz, np.float32))
        rgbs = 0.0
        for h_, w_ in HITS[1:]:
            if h_ <= t < h_ + 0.13:
                rgbs = max(rgbs, 16 * (1 - (t - h_) / 0.13))
        if rgbs:
            d = int(rgbs) + 1
            layer[..., 0] = shift(layer[..., 0], -d, 0)
            layer[..., 2] = shift(layer[..., 2], d, 0)

        # --- background: spinning portal with zoom punches
        bg = portal.frame(t * 1.5 + 0.6 * hit_env(t, 0.3))
        bz = 1.0 + 0.04 * t + 0.18 * hit_env(t, 0.18)
        bg = scale_about(bg, bz, W / 2 - tx * 0.4, H / 2 - ty * 0.4)
        if o:
            bg = cv2.blur(bg, (int(2 + 90 * o) | 1, 1))
        bg = bg + glow[..., None] * LIME * 0.55
        sl = (speed_mask(max(0.0, 1 - (t - T_HIT) / 0.2) if t >= T_HIT else 0, 1) +
              speed_mask(max(0.0, 1 - (t - T_LOGO) / 0.2) * 0.8 if t >= T_LOGO else 0, 2))
        sl = np.clip(sl, 0, 1)
        bg = bg + (1 - bg) * sl[..., None]
        out = layer[..., :3] + bg * (1 - layer[..., 3:])
        sparks.step(1 / FPS)
        spk = sparks.render()
        out = out + spk
        flash = max(1 - t / 0.1, 0) if t < 0.1 else 0
        for h_, w_ in HITS[1:]:
            if h_ <= t < h_ + 0.07:
                flash = max(flash, 0.22 * w_ * (1 - (t - h_) / 0.07))
        out = out + (1 - out) * flash

        if alpha_out or prores:
            # transparent overlay: glow + speed lines + text + sparks + flashes, no portal
            # (no wide glow here: its near-transparent lime pixels show up as green blocks
            #  in editors that read the alpha as premultiplied)
            ov = np.dstack([np.repeat(sl[..., None], 3, -1), sl])
            ov = layer + ov * (1 - layer[..., 3:])
            spk = np.clip(spk, 0, 1); sa = spk.max(-1, keepdims=True)
            ov = np.concatenate([np.clip(ov[..., :3] + spk, 0, 1), sa + ov[..., 3:] * (1 - sa)], -1)
            f0 = max(1 - t / 0.1, 0) if t < 0.1 else 0   # opening flash only: faint full-frame hit
            ov = f0 * np.ones(4, np.float32) + ov * (1 - f0)  # flashes read as solid white in some editors
            ov[ov[..., 3] < 4 / 255] = 0          # clear near-invisible fringe pixels
        out += np.random.default_rng(i).uniform(-1.5 / 255, 1.5 / 255, (H, W, 1)).astype(np.float32)  # dither
        frame_rgb = (np.clip(out, 0, 1) * 255).astype(np.uint8).tobytes()
        if alpha_out or prores:
            al = np.clip(ov[..., 3:], 1e-6, 1)
            rgba = np.concatenate([np.clip(ov[..., :3] / al, 0, 1), ov[..., 3:]], -1)
            frame_rgba = (np.clip(rgba, 0, 1) * 255).astype(np.uint8).tobytes()
        for kind, e in encs:
            e.stdin.write(frame_rgb if kind == "rgb" else frame_rgba)

    for _, e in encs:
        e.stdin.close(); e.wait()
    os.remove(wav)
    return mp4

# ---------------------------------------------------------------- SFX
def write_sfx(path, dur, pops, t_slam0, t_hit, t_logo0, t_logo, t_sweep, deaths_at, t_out):
    n = int(dur * SR); a = np.zeros(n)
    rng = np.random.default_rng(11)

    def add(start, sig, gain=1.0):
        s = int(start * SR); e = min(n, s + len(sig))
        if 0 <= s < n:
            a[s:e] += gain * sig[:e - s]

    def env(length, atk, dec):
        x = np.arange(int(length * SR)) / SR
        return np.minimum(1, x / max(atk, 1e-4)) * np.exp(-x / dec)

    def bandnoise(length, lo, hi):
        x = rng.normal(0, 1, int(length * SR))
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
        X[(f < lo) | (f > hi)] = 0
        y = np.fft.irfft(X, len(x)); return y / (np.abs(y).max() + 1e-9)

    def boom(length, f_end, f_drop, dec):
        x = np.arange(int(length * SR)) / SR
        return np.sin(2 * np.pi * (f_end * x + f_drop * (1 - np.exp(-x * 7)) / 7)) * env(length, 0.003, dec)

    def riser(length):
        return bandnoise(length, 300, 7000) * np.linspace(0, 1, int(length * SR)) ** 2

    for k, p in enumerate(pops):                                    # letter whooshes + pops
        x = np.arange(int(0.07 * SR)) / SR
        add(p, np.sin(2 * np.pi * (650 + 40 * k) * x * (1 - 2.5 * x)) * env(0.07, 0.002, 0.016), 0.22)
        add(p - 0.03, bandnoise(0.09, 1500, 8000) * np.hanning(int(0.09 * SR)), 0.08)
    add(t_slam0 - 0.1, riser(t_hit - t_slam0 + 0.1), 0.35)          # slam
    add(t_hit, boom(1.4, 34, 70, 0.38), 0.95)
    add(t_hit, bandnoise(0.25, 1500, 9000) * env(0.25, 0.001, 0.04), 0.35)
    L = t_logo - t_logo0 + 0.05                                      # logo spin whoosh
    w = bandnoise(L, 200, 5000) * np.sin(np.linspace(0, np.pi, int(L * SR))) ** 2
    w *= 0.6 + 0.4 * np.sin(2 * np.pi * 14 * np.arange(len(w)) / SR)  # spinning flutter
    add(t_logo0, w, 0.45)
    add(t_logo, boom(1.2, 40, 60, 0.3), 0.8)
    add(t_logo, bandnoise(0.2, 2000, 10000) * env(0.2, 0.001, 0.035), 0.3)
    L = 0.55                                                          # shimmer on light sweep
    x = np.arange(int(L * SR)) / SR
    add(t_sweep, (np.sin(2 * np.pi * 2600 * x) + np.sin(2 * np.pi * 3900 * x)) * np.hanning(len(x)) * 0.5, 0.12)
    add(deaths_at, boom(0.7, 45, 50, 0.18), 0.55)                     # "deaths" hit
    L = dur - t_out + 0.05                                            # whip out
    add(t_out - 0.05, bandnoise(L, 400, 7000) * np.hanning(int(L * SR)), 0.5)

    a = np.tanh(a * 1.2) * 0.85
    st = (np.stack([a, a], 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--dur", type=float, default=4.25)
    p.add_argument("--deaths-at", type=float, default=3.63, help="seconds into the card where VO says 'deaths'")
    p.add_argument("--outdir", default=HERE)
    p.add_argument("--no-alpha", action="store_true", help="skip the transparent WebM")
    p.add_argument("--prores", action="store_true", help="also write a ProRes 4444 .mov with alpha")
    a = p.parse_args()
    print(render(a.dur, a.deaths_at, a.outdir, not a.no_alpha, a.prores))
