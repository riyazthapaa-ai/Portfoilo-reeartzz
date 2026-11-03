#!/usr/bin/env python3
"""
Animated 3D title card: "Every Character / Killed Off", Rick and Morty logo style.
(The O in "Off" uses the font's 0 glyph: its o has a tiny counter that reads as a c.)

Look: Get Schwifty lettering (the Rick and Morty logo font) with the logo
colours (cyan fill, dark teal inner line, lime outline, black edge) and a deep
green 3D extrusion with a glossy top bevel.

Motion (reference: 3D title pops in the "Alex Edit" reel):
  * "EVERY CHARACTER" letters flip in one by one on the X axis with overshoot.
  * "KILLED OFF" slams in from 3x scale with a zoom blur, RGB split, a white hit
    and a heavy camera shake.
  * The whole title sways in 3D perspective, letters bob, handheld shake runs
    throughout, a second shake punch lands on "deaths", and it whips out
    (zoom + motion blur) at the end.
  * Synthesised SFX: letter pops, riser, impact boom, whip-out whoosh.

Outputs
  title_card.mp4         full frame with an animated green portal background + SFX
  title_card_alpha.mov   ProRes 4444 with transparency (text only), for your NLE

  python3 title_card.py [--dur 4.25] [--deaths-at 3.63] [--outdir .]
"""
import argparse, math, os, subprocess, wave
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "fonts", "get_schwifty.ttf")
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

# ---------------------------------------------------------------- render
def render(dur=4.25, deaths_at=3.63, outdir=HERE, alpha_out=True):
    n = int(round(dur * FPS))
    l1 = Line("Every Character", 230, H / 2 - 190, depth=34)
    l2 = Line("Killed 0ff", 390, H / 2 + 150, depth=52)
    portal = Portal()

    t_slam0, t_hit = 0.72, 0.90
    pop_times = [0.08 + i * 0.045 for i in range(len(l1.letters))]
    hand_x = smooth_noise(1, n, 0.12) * 6
    hand_y = smooth_noise(2, n, 0.12) * 5
    hand_r = smooth_noise(3, n, 0.10) * 0.006
    shk_x = smooth_noise(4, n, 1.6)
    shk_y = smooth_noise(5, n, 1.6)
    t_out = dur - 0.24

    mp4 = os.path.join(outdir, "title_card.mp4")
    mov = os.path.join(outdir, "title_card_alpha.mov")
    wav = os.path.join(outdir, ".title_sfx.wav")
    write_sfx(wav, dur, pop_times, t_slam0, t_hit, deaths_at, t_out)

    enc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "16",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", mp4], stdin=subprocess.PIPE)
    encA = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-i", wav, "-c:v", "prores_ks", "-profile:v", "4444",
         "-pix_fmt", "yuva444p10le", "-c:a", "pcm_s16le", "-shortest", mov],
        stdin=subprocess.PIPE) if alpha_out else None

    for i in range(n):
        t = i / FPS
        layer = np.zeros((H, W, 4), np.float32)

        # --- line 1: letters flip in on X axis
        for j, L in enumerate(l1.letters):
            lt = t - pop_times[j]
            if lt <= 0:
                continue
            p = ease_out_back(lt / 0.30)
            sy = max(0.02, abs(math.cos((1 - p) * math.pi / 2)))
            spr = L["spr"]
            if sy < 0.999:
                h0, w0 = spr.shape[:2]
                spr = cv2.resize(spr, (w0, max(1, int(h0 * sy))), interpolation=cv2.INTER_AREA)
                spr = spr * (0.55 + 0.45 * sy)                       # darker while edge-on
                spr[..., 3] /= (0.55 + 0.45 * sy)
            bob = math.sin(t * 4.2 + j * 0.7) * 4 if lt > 0.3 else 0
            dy = (1 - clamp01(lt / 0.18)) * -60
            dy += 170 * (1 - ease_out_back(clamp01((t - t_slam0) / 0.3), 1.2))  # centred until line 2 lands
            y = L["y"] + (L["spr"].shape[0] - spr.shape[0]) / 2 + dy + bob
            paste(layer, spr, L["x"], y, clamp01(lt / 0.06))

        # --- line 2: slam
        if t >= t_slam0:
            g = np.zeros((H, W, 4), np.float32)
            for j, L in enumerate(l2.letters):
                bob = math.sin(t * 3.6 + j * 0.9 + 2) * 5 if t > t_hit + 0.3 else 0
                paste(g, L["spr"], L["x"], L["y"] + bob)
            k = clamp01((t - t_slam0) / (t_hit - t_slam0))
            s = 3.2 - 2.2 * ease_in(k)
            if t > t_hit:   # squash-and-settle after impact
                s = 1 + 0.06 * math.exp(-(t - t_hit) * 14) * math.cos((t - t_hit) * 40)
            gy = H / 2 + 150
            if k < 1:       # zoom blur while flying in
                acc = np.zeros_like(g)
                for q in range(9):
                    acc += scale_about(g, s * (1 + q * 0.025), W / 2, gy)
                g = acc / 9 * clamp01(k * 3)
            else:
                g = scale_about(g, s, W / 2, gy)
            layer = g + layer * (1 - g[..., 3:])

        # --- drop shadow
        sh = cv2.GaussianBlur(layer[..., 3], (0, 0), 14)
        sh = shift(sh, 10, 18) * 0.65
        shadow = np.zeros_like(layer); shadow[..., 3] = sh
        layer = layer + shadow * (1 - layer[..., 3:])

        # --- camera: 3D sway + handheld + impact shakes
        imp = 0.0
        if t >= t_hit:
            imp += 34 * math.exp(-(t - t_hit) / 0.16)
        if t >= deaths_at:
            imp += 16 * math.exp(-(t - deaths_at) / 0.12)
        yaw = math.radians(9 * math.sin(t * 1.3 - 0.6))
        pitch = math.radians(8 + 3 * math.sin(t * 0.9))
        roll = hand_r[i] + math.radians(imp * 0.04 * shk_x[i])
        zoom = 0.97 + 0.04 * t / dur
        tx = hand_x[i] + imp * shk_x[i]
        ty = hand_y[i] + imp * shk_y[i]

        # whip out
        if t > t_out:
            o = clamp01((t - t_out) / (dur - t_out))
            zoom *= 1 + 1.2 * o * o
            tx += 900 * o * o
        layer = perspective(layer, yaw, pitch, roll, zoom, tx, ty)
        if t > t_out:
            o = clamp01((t - t_out) / (dur - t_out))
            ksz = int(2 + 120 * o) | 1
            kern = np.zeros((1, ksz), np.float32); kern[0, :] = 1 / ksz
            layer = cv2.filter2D(layer, -1, kern)

        # RGB split on impact frames
        if t_hit <= t < t_hit + 0.12:
            d = int(14 * (1 - (t - t_hit) / 0.12)) + 1
            layer[..., 0] = shift(layer[..., 0], -d, 0)
            layer[..., 2] = shift(layer[..., 2], d, 0)

        # --- full-frame composite over portal
        bg = portal.frame(t)
        if t > t_out:
            bg = cv2.blur(bg, (int(2 + 80 * clamp01((t - t_out) / (dur - t_out))) | 1, 1))
        bgs = np.roll(bg, (int(ty * 0.5), int(tx * 0.5)), (0, 1))   # bg shakes less (parallax)
        out = layer[..., :3] + bgs * (1 - layer[..., 3:])
        flash = 0.0
        if t < 0.12:
            flash = 1 - t / 0.12
        if t_hit <= t < t_hit + 0.07:
            flash = max(flash, 0.2 * (1 - (t - t_hit) / 0.07))
        out = out + (1 - out) * flash
        enc.stdin.write((np.clip(out, 0, 1) * 255).astype(np.uint8).tobytes())

        if encA:
            a = np.clip(layer[..., 3:], 1e-6, 1)
            rgb = np.clip(layer[..., :3] / a, 0, 1)                    # un-premultiply
            rgba = np.concatenate([rgb, layer[..., 3:]], -1)
            encA.stdin.write((np.clip(rgba, 0, 1) * 255).astype(np.uint8).tobytes())

    for e in (enc, encA):
        if e:
            e.stdin.close(); e.wait()
    os.remove(wav)
    return mp4, (mov if alpha_out else None)

# ---------------------------------------------------------------- SFX
def write_sfx(path, dur, pops, t_slam0, t_hit, deaths_at, t_out):
    n = int(dur * SR); a = np.zeros(n)
    rng = np.random.default_rng(11)
    tt = np.arange(n) / SR

    def add(start, sig):
        s = int(start * SR); e = min(n, s + len(sig))
        if s < n:
            a[s:e] += sig[:e - s]

    def env(length, atk, dec):
        x = np.arange(int(length * SR)) / SR
        return np.minimum(1, x / max(atk, 1e-4)) * np.exp(-x / dec)

    def bandnoise(length, lo, hi):
        x = rng.normal(0, 1, int(length * SR))
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
        X[(f < lo) | (f > hi)] = 0
        return np.fft.irfft(X, len(x))

    for k, p in enumerate(pops):                      # letter pops
        L = 0.07; x = np.arange(int(L * SR)) / SR
        f0 = 700 + 35 * k
        add(p, 0.22 * np.sin(2 * np.pi * f0 * x * (1 - 2.5 * x)) * env(L, 0.002, 0.018))
    L = t_hit - t_slam0 + 0.1                         # riser into the slam
    r = bandnoise(L, 300, 6000) * np.linspace(0, 1, int(L * SR)) ** 2
    add(t_slam0 - 0.1, 0.35 * r / (np.abs(r).max() + 1e-9))
    L = 1.4; x = np.arange(int(L * SR)) / SR          # impact boom
    boom = np.sin(2 * np.pi * (35 * x + 60 * (1 - np.exp(-x * 6)) / 6)) * env(L, 0.003, 0.35)
    crack = bandnoise(0.25, 1500, 9000) * env(0.25, 0.001, 0.04)
    add(t_hit, 0.9 * boom); add(t_hit, 0.35 * crack / (np.abs(crack).max() + 1e-9))
    L = 0.6; x = np.arange(int(L * SR)) / SR          # small hit on "deaths"
    add(deaths_at, 0.45 * np.sin(2 * np.pi * (45 * x + 40 * (1 - np.exp(-x * 8)) / 8)) * env(L, 0.003, 0.18))
    L = dur - t_out + 0.05                            # whip out
    w = bandnoise(L, 400, 7000) * np.hanning(int(L * SR))
    add(t_out - 0.05, 0.5 * w / (np.abs(w).max() + 1e-9))

    a = np.tanh(a * 1.2) * 0.85
    st = (np.stack([a, a], 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--dur", type=float, default=4.25)
    p.add_argument("--deaths-at", type=float, default=3.63, help="seconds into the card where VO says 'deaths'")
    p.add_argument("--outdir", default=HERE)
    p.add_argument("--no-alpha", action="store_true")
    a = p.parse_args()
    print(render(a.dur, a.deaths_at, a.outdir, not a.no_alpha))
