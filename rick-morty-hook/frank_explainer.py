#!/usr/bin/env python3
"""
Explainer-style intro for kill #1 (Frank Palicky), timed word-for-word to the VO:

  "Remember Frank Palicky? No? Well, he was the bully who apparently thought
   threatening a fourteen-year-old kid with a knife was a perfectly reasonable
   way to start the school day."   (VO 0:24.31 - 0:33.09, 8.78s)

Rick and Morty art style: flat cartoon school-hallway lockers with black
outlines, sticker cut-outs of Frank and Morty (white sticker border), clean
labels (Inter Display), pop-in emoji, a BULLY stamp, a knife swap, and a
"perfectly reasonable" sign that gets crossed out. Synthesised SFX on every beat.

  python3 frank_explainer.py                 # -> frank_explainer.mp4 (SFX only, to lay under your VO)
  python3 frank_explainer.py --vo VO.mp3     # also -> frank_explainer_with_vo.mp4 (preview)
"""
import argparse, math, os, subprocess, wave
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, *p)
W, H, FPS, SR = 1920, 1080, 30, 48000
DUR = 8.78
VO_START = 24.31
F_BLACK = A("fonts", "InterDisplay-Black.otf")
F_XBOLD = A("fonts", "InterDisplay-ExtraBold.otf")
F_EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

INK = (20, 20, 26)
CREAM = (250, 246, 232)
CYAN = (0, 181, 204)
CYAN_DK = (0, 140, 160)
RED = (220, 40, 40)

# word start times relative to the start of this segment (from the VO transcription)
T = dict(remember=0.09, frank=0.41, palicky=0.73, no=1.53, well=1.85, bully=2.41, who=2.73,
         threatening=3.61, fourteen=4.17, kid=4.89, knife=5.45, perfectly=6.41, reasonable=6.81,
         way=7.37, start=7.77, school=8.17, day=8.49)

# ------------------------------------------------------------------ sprites
def to_sprite(pil):
    a = np.asarray(pil.convert("RGBA")).astype(np.float32) / 255
    a[..., :3] *= a[..., 3:]
    return a

def emoji(ch, px=220):
    f = ImageFont.truetype(F_EMOJI, 109)
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((80, 80), ch, font=f, embedded_color=True, anchor="mm")
    im = im.crop(im.getbbox()).resize((px, px), Image.LANCZOS)
    return to_sprite(im)

def plate(title, tab=None, size=64, tab_size=30):
    """Cream label plate with black outline + optional cyan tab (episode-card style)."""
    ft, fb = ImageFont.truetype(F_BLACK, size), ImageFont.truetype(F_XBOLD, tab_size)
    ow, sh, pad = 6, 9, 20
    l, t, r, b = ft.getbbox(title); tw, th = r - l, b - t
    pw, ph = tw + 64, int(size * 1.45)
    tab_h = int(tab_size * 1.75) if tab else 0
    tab_w = (fb.getbbox(tab)[2] - fb.getbbox(tab)[0] + 44) if tab else 0
    Wd = max(pw, tab_w + 40) + 2 * pad + sh
    Hd = ph + tab_h - (12 if tab else 0) + 2 * pad + sh
    im = Image.new("RGBA", (Wd, Hd), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    py = pad + (tab_h - 12 if tab else 0)
    d.rounded_rectangle([pad + sh, py + sh, pad + pw + sh, py + ph + sh], radius=22, fill=(0, 0, 0, 110))
    d.rounded_rectangle([pad, py, pad + pw, py + ph], radius=22, fill=CREAM, outline=INK, width=ow)
    d.rounded_rectangle([pad + ow, py + ph - 14, pad + pw - ow, py + ph - ow], radius=10, fill=(226, 219, 196))
    d.text((pad + pw / 2, py + ph / 2 - 2), title, font=ft, fill=INK, anchor="mm")
    if tab:
        tx = pad + 30
        d.rounded_rectangle([tx + sh, pad + sh, tx + tab_w + sh, pad + tab_h + sh], radius=16, fill=(0, 0, 0, 110))
        d.rounded_rectangle([tx, pad, tx + tab_w, pad + tab_h], radius=16, fill=CYAN, outline=INK, width=ow)
        d.rounded_rectangle([tx + ow, pad + tab_h * 0.62, tx + tab_w - ow, pad + tab_h - ow], radius=8, fill=CYAN_DK)
        d.text((tx + tab_w / 2, pad + tab_h / 2 + 1), tab, font=fb, fill=(255, 255, 255), anchor="mm",
               stroke_width=4, stroke_fill=INK)
    return to_sprite(im)

def stamp(text="BULLY"):
    f = ImageFont.truetype(F_BLACK, 150)
    l, t, r, b = f.getbbox(text); tw, th = r - l, b - t
    w, h = tw + 110, th + 90
    im = Image.new("RGBA", (w + 20, h + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([10, 10, w + 10, h + 10], radius=28, outline=RED + (255,), width=16)
    d.rounded_rectangle([30, 30, w - 10, h - 10], radius=18, outline=RED + (255,), width=5)
    d.text(((w + 20) / 2, (h + 20) / 2 + 4), text, font=f, fill=RED + (255,), anchor="mm")
    a = np.asarray(im).astype(np.float32) / 255                      # ink texture: knock out speckles
    rng = np.random.default_rng(4)
    speck = cv2.GaussianBlur(rng.random(a.shape[:2]).astype(np.float32), (0, 0), 2.2)
    a[..., 3] *= np.clip((speck - 0.38) * 6, 0.25, 1)
    return to_sprite(Image.fromarray((a * 255).astype(np.uint8)))

def lockers():
    """Flat cartoon school hallway (Rick and Morty style: flat fills, black outlines)."""
    Wb, Hb = W + 160, H + 90
    im = Image.new("RGB", (Wb, Hb), (196, 200, 196)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, Wb, 150], fill=(214, 216, 210))
    d.line([(0, 150), (Wb, 150)], fill=INK, width=6)
    floor_y = 900
    d.rectangle([0, floor_y, Wb, Hb], fill=(168, 176, 172)); d.line([(0, floor_y), (Wb, floor_y)], fill=INK, width=6)
    lw = 190; x = -40
    while x < Wb:
        d.rectangle([x, 200, x + lw, floor_y - 10], fill=(63, 143, 153), outline=INK, width=6)
        d.rectangle([x + 10, 210, x + 30, floor_y - 20], fill=(84, 168, 178))          # highlight strip
        for k in range(5):
            y = 290 + k * 22
            d.line([(x + 50, y), (x + lw - 50, y)], fill=INK, width=5)
        d.rectangle([x + 60, 236, x + lw - 60, 256], fill=(210, 214, 206), outline=INK, width=4)
        d.ellipse([x + lw - 58, 560, x + lw - 26, 592], fill=(150, 156, 160), outline=INK, width=4)
        d.rectangle([x + lw - 48, 610, x + lw - 36, 690], fill=(120, 128, 132), outline=INK, width=3)
        x += lw
    a = np.asarray(im).astype(np.float32) / 255
    a = a * 0.72 + 0.12 * np.array([0.6, 0.75, 0.8])                   # push back: lower contrast, cool
    yy, xx = np.mgrid[0:Hb, 0:Wb]
    r = np.sqrt(((xx - Wb / 2) / (Wb / 1.6)) ** 2 + ((yy - Hb / 2) / (Hb / 1.4)) ** 2)
    a *= np.clip(1.15 - 0.6 * r, 0.45, 1)[..., None]
    return a.astype(np.float32)

# ------------------------------------------------------------------ animation helpers
def clamp(x): return min(max(x, 0.0), 1.0)
def ease_out_back(x, s=2.4):
    x = clamp(x) - 1; return x * x * ((s + 1) * x + s) + 1
def ease_io(x):
    x = clamp(x); return x * x * (3 - 2 * x)
def pop(t, t0, d=0.32):
    return 0.0 if t < t0 else ease_out_back((t - t0) / d)

def put(canvas, spr, cx, cy, s=1.0, rot=0.0, alpha=1.0):
    if s <= 0.01 or alpha <= 0.01:
        return
    h, w = spr.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), rot, s)
    M[0, 2] += cx - w / 2; M[1, 2] += cy - h / 2
    out = cv2.warpAffine(spr, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    if alpha < 1:
        out *= alpha
    canvas[:] = out + canvas * (1 - out[..., 3:])

def shake(t, hits, amp=26, tau=0.14):
    x = y = 0.0
    for h, k in hits:
        if t >= h:
            e = math.exp(-(t - h) / tau) * amp * k
            x += e * math.sin((t - h) * 71 + h); y += e * math.cos((t - h) * 57 + 2 * h)
    return x, y

# ------------------------------------------------------------------ SFX
class Sfx:
    def __init__(self, dur):
        self.n = int(dur * SR); self.a = np.zeros(self.n); self.rng = np.random.default_rng(3)
    def add(self, t, sig, g=1.0):
        s = int(t * SR); e = min(self.n, s + len(sig))
        if 0 <= s < self.n: self.a[s:e] += g * sig[:e - s]
    def env(self, L, atk, dec):
        x = np.arange(int(L * SR)) / SR; return np.minimum(1, x / max(atk, 1e-4)) * np.exp(-x / dec)
    def noise(self, L, lo, hi):
        x = self.rng.normal(0, 1, max(8, int(L * SR))); X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
        X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, len(x)); return y / (np.abs(y).max() + 1e-9)
    def pop(self, t, f0=700, g=0.3):
        L = 0.09; x = np.arange(int(L * SR)) / SR
        self.add(t, np.sin(2 * np.pi * f0 * x * (1 + 6 * x)) * self.env(L, 0.002, 0.025), g)
    def whoosh(self, t, L=0.35, g=0.35):
        w = self.noise(L, 300, 6000); self.add(t, w * np.hanning(len(w)), g)
    def thud(self, t, g=0.8):
        L = 0.5; x = np.arange(int(L * SR)) / SR
        self.add(t, np.sin(2 * np.pi * (55 * x + 60 * (1 - np.exp(-x * 10)) / 10)) * self.env(L, 0.002, 0.12), g)
        self.add(t, self.noise(0.12, 800, 6000) * self.env(0.12, 0.001, 0.025), g * 0.5)
    def ding(self, t, g=0.3):
        L = 0.7; x = np.arange(int(L * SR)) / SR
        self.add(t, (np.sin(2 * np.pi * 1318 * x) + 0.5 * np.sin(2 * np.pi * 1976 * x)) * self.env(L, 0.002, 0.18), g)
    def buzz(self, t, g=0.3):
        L = 0.4; x = np.arange(int(L * SR)) / SR
        self.add(t, np.sign(np.sin(2 * np.pi * 110 * x)) * self.env(L, 0.005, 0.15) * 0.6, g)
    def shing(self, t, g=0.35):                       # knife scrape
        L = 0.45; self.add(t, self.noise(L, 3000, 12000) * self.env(L, 0.01, 0.12), g)
        x = np.arange(int(L * SR)) / SR; self.add(t, np.sin(2 * np.pi * 3400 * x) * self.env(L, 0.005, 0.1), g * 0.3)
    def write(self, path):
        a = np.tanh(self.a * 1.1) * 0.85; st = (np.stack([a, a], 1) * 32767).astype(np.int16)
        with wave.open(path, "wb") as f:
            f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())

# ------------------------------------------------------------------ render
def render(out=A("frank_explainer.mp4"), vo=None):
    bg = lockers()
    frank = to_sprite(Image.open(A("assets", "explainer", "frank_hi.png")))
    frank_k = to_sprite(Image.open(A("assets", "explainer", "frank_knife.png")))
    morty = to_sprite(Image.open(A("assets", "explainer", "morty_scared.png")))
    p_frank = plate("Frank Palicky", "S1E1 · THE BULLY", 66, 30)
    p_morty = plate("Morty Smith", "AGE 14", 58, 30)
    stp = stamp()

    sfx = Sfx(DUR)
    sfx.whoosh(0.0, 0.3); sfx.pop(0.08, 520, 0.35); sfx.whoosh(T["frank"] - 0.05, 0.3, 0.25)
    sfx.whoosh(T["bully"] - 0.18, 0.2, 0.3); sfx.thud(T["bully"])
    sfx.whoosh(3.35, 0.4); sfx.pop(T["fourteen"], 950)
    sfx.whoosh(T["knife"] - 0.1, 0.2, 0.3); sfx.shing(T["knife"]); sfx.thud(T["knife"] + 0.02, 0.45)
    sfx.whoosh(T["perfectly"] - 0.1, 0.9, 0.15)             # slow push-in
    sfx.thud(T["day"] + 0.05, 0.5)
    sfx.whoosh(DUR - 0.3, 0.3, 0.3)
    wav = out + ".wav"; sfx.write(wav)

    enc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", wav, "-c:v", "libx264",
                            "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                            "-shortest", out], stdin=subprocess.PIPE)
    hits = [(T["bully"], 1.0), (T["knife"], 0.9), (T["day"] + 0.05, 0.6)]
    n = int(round(DUR * FPS))
    for i in range(n):
        t = i / FPS
        sx, sy = shake(t, hits)
        z = 1.0 + 0.05 * t / DUR                                       # slow push
        # background (with parallax shake)
        M = np.float32([[z, 0, -80 * z + sx * 0.4 - (z - 1) * W / 2], [0, z, -45 * z + sy * 0.4 - (z - 1) * H / 2]])
        img = cv2.warpAffine(bg, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        lay = np.zeros((H, W, 4), np.float32)

        # --- Frank: pops in centre, slides left when Morty arrives, swaps to knife pose
        move = ease_io((t - 3.2) / 0.5)
        fx = 960 - 420 * move + sx; fy = 700 + sy + 6 * math.sin(t * 3)
        FS = 0.56
        head = fy - frank.shape[0] * FS / 2              # top of Frank's head
        lean = -4 * ease_io((t - 3.6) / 0.6)
        if t < T["knife"]:
            s = pop(t, 0.0, 0.4) * FS
            put(lay, frank, fx, fy, s, lean + 3 * (1 - clamp(t / 0.4)))
        else:
            k = clamp((t - T["knife"]) / 0.18)
            put(lay, frank_k, fx + 40, fy + 20, 0.6 * ease_out_back(k), lean + 6 * (1 - k))
        # --- name plate
        sp = pop(t, T["frank"], 0.35)
        put(lay, p_frank, fx, 1005 - 40 * (1 - clamp((t - T["frank"]) / 0.3)), sp * 0.95, -2)
        # --- BULLY stamp
        if t >= T["bully"] - 0.12:
            k = clamp((t - (T["bully"] - 0.12)) / 0.12)
            s = 3.0 - 2.0 * k * k
            fade = 1 - clamp((t - T["knife"] + 0.05) / 0.15)          # clears the way for the knife pose
            put(lay, stp, fx - 10, fy - 40, s * 0.55, -12, clamp(k * 2) * fade)
        # --- Morty slides in from the right
        mk = ease_out_back((t - 3.35) / 0.45, 1.6)
        mx = 2350 - (2350 - 1440) * mk + sx * 0.8
        tremble = 4 * math.sin(t * 60) * clamp((t - T["knife"]) / 0.1) if t > T["knife"] else 0
        if t > 3.3:
            put(lay, morty, mx + tremble, 700 + sy, 0.62, 2)
            put(lay, p_morty, mx - 20, 1000, pop(t, T["fourteen"], 0.35) * 0.95, 2)
        # (no emoji / text pop-ups: the last line plays as a slow push-in on Frank and Morty)

        # composite (+ red danger vignette on the knife beat)
        img = lay[..., :3] + img * (1 - lay[..., 3:])
        pz = 1 + 0.12 * ease_io((t - T["perfectly"]) / 2.0)
        if pz > 1.0001:
            Mz = np.float32([[pz, 0, (1 - pz) * 1000], [0, pz, (1 - pz) * 1040]])
            img = cv2.warpAffine(img, Mz, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        if T["knife"] <= t < T["knife"] + 0.5:
            k = 1 - (t - T["knife"]) / 0.5
            yy, xx = np.ogrid[:H, :W]
            r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
            v = np.clip(r - 0.55, 0, 1)[..., None] * k * 0.9
            img = img * (1 - v) + np.array([0.85, 0.05, 0.05]) * v
        if t < 0.08:
            img = img + (1 - img) * (1 - t / 0.08)
        enc.stdin.write((np.clip(img, 0, 1) * 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait(); os.remove(wav)

    if vo:
        prev = out.replace(".mp4", "_with_vo.mp4")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out, "-ss", str(VO_START), "-t", str(DUR), "-i", vo,
                        "-filter_complex", "[0:a]volume=0.6[s];[1:a]aresample=48000[v];[s][v]amix=inputs=2:normalize=0:duration=first[a]",
                        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", prev], check=True)
        return out, prev
    return out

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--vo", help="full VO file; the segment 0:24.31-0:33.09 is mixed into a preview")
    p.add_argument("-o", default=A("frank_explainer.mp4"))
    a = p.parse_args()
    print(render(a.o, a.vo))
