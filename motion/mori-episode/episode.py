"""MO ARTZ - 'Yo, I'm Mori' : a short episode. Every frame is drawn from scratch."""
import json, math, os, sys
import numpy as np, cv2, soundfile as sf
from mori_lib import *

OUT = os.path.join(HERE, "frames")
os.makedirs(OUT, exist_ok=True)
FPS, DUR = 24, 15.5
N = int(FPS * DUR)
GROUND = 1700.0
SC = 0.72
STEP_PX = 200 * SC

# ---------------------------------------------------------------- voice envelope (lip sync)
voice, SR = sf.read(os.path.join(HERE, "..", "tts", "voice2.wav"))
win = SR // FPS
env = np.array([np.sqrt(np.mean(voice[i * win:(i + 1) * win] ** 2)) if i * win < len(voice) else 0 for i in range(N + 1)])
env = np.convolve(env / (env.max() + 1e-9), [0.25, 0.5, 0.25], mode="same")

# ---------------------------------------------------------------- scene timing
WIPE = (3.30, 3.62, 3.95)
IRIS = (9.30, 9.47, 9.68)
FLOOD = (14.58, 14.78)
def scene_of(t):
    if t < WIPE[1]: return 1
    if t < IRIS[1]: return 2
    if t < FLOOD[1]: return 3
    return 4

# ---------------------------------------------------------------- Mori tracks (world x per scene)
X_KEYS = {
    1: [(0.0, -60.0), (1.5, 400.0), (20, 400.0)],
    2: [(3.62, -170.0), (4.70, 455.0), (20, 455.0)],
    3: [(9.47, -120.0), (10.9, 300.0), (20, 300.0)],
    4: [(0, 540.0), (20, 540.0)],
}
def lin(u): return clamp(u)
def ease_stop(u): u = clamp(u); return 1 - (1 - u) ** 1.6
def world_x(t):
    sc_ = scene_of(t)
    return track(X_KEYS[sc_], t, ease_stop)

TS = np.arange(N + 1) / FPS
WX = np.array([world_x(t) for t in TS])
dx = np.abs(np.diff(WX, prepend=WX[0])); dx[dx > 60] = 0
PHASE = np.cumsum(dx) / (2 * STEP_PX)
SPEED = dx * FPS
WALK = np.clip(np.convolve(SPEED, np.ones(3) / 3, "same") / 160, 0, 1)

def cam_x(t, wx):
    """scene 3 tracks Mori; other scenes are locked."""
    if scene_of(t) == 3: return wx - lerp(300, 360, prog(t, 9.5, 10.9))
    return 0.0

YAW = [(0, 1.0), (1.45, 1.0), (1.75, 0.15), (2.7, 0.15), (2.9, 0.3), (3.62, 0.3),
       (3.621, 1.0), (4.65, 1.0), (4.85, 0.55), (8.0, 0.55), (8.35, 0.06), (9.47, 0.06),
       (9.471, 1.0), (10.85, 1.0), (11.1, 0.2), (13.35, 0.2), (13.55, 0.0), (20, 0.0)]
HEAD_YAW = [(0, 0.9), (0.4, 0.9), (0.6, 0.35), (1.45, 0.35), (1.75, 0.1), (2.7, 0.1), (2.9, 0.45), (3.62, 0.45),
            (3.621, 0.9), (4.65, 0.9), (4.85, 0.45), (8.0, 0.45), (8.35, 0.0), (9.47, 0.0),
            (9.471, 0.9), (10.85, 0.9), (11.1, 0.0), (11.3, -0.25), (11.6, -0.25), (11.8, 0.15), (12.3, 0.15),
            (12.5, 0.35), (12.9, 0.35), (13.1, 0.0), (20, 0.0)]
TILT = [(0, 0), (1.75, 0), (2.0, -6), (2.55, -6), (2.8, 5), (3.3, 5), (3.62, 0), (6.9, 0), (7.3, 7), (7.75, 7),
        (7.8, -4), (8.6, 0), (8.8, 12), (9.3, 12), (9.47, 0), (12.3, 0), (12.5, -8), (12.9, -8), (13.1, 0), (20, 0)]
LOOK = [(0, (0.5, 0.0)), (0.5, (0.2, 0.1)), (1.5, (0.0, 0.2)), (2.0, (0.0, 0.6)), (2.7, (0.6, -0.8)), (3.62, (0.6, -0.8)),
        (3.65, (0.8, 0.0)), (4.7, (0.7, 0.4)), (5.15, (-0.5, -0.7)), (5.45, (0.7, 0.4)), (5.75, (-0.6, 0.6)), (6.1, (0.7, 0.4)),
        (6.45, (0.5, -0.8)), (6.8, (0.7, 0.4)), (7.75, (0.7, 0.2)), (8.35, (0.0, 0.1)), (9.47, (0.0, 0.1)),
        (9.5, (0.8, 0.0)), (10.9, (0.0, 0.1)), (11.05, (-0.7, -0.8)), (11.6, (0.1, 0.1)), (11.75, (0.3, -0.9)),
        (12.3, (0.0, 0.1)), (12.5, (0.8, -0.6)), (12.9, (0.0, 0.1)), (13.6, (0.0, -0.8)), (20, (0.0, -0.8))]
EXPR_KEYS = [(0, "happy"), (1.9, "shocked"), (2.25, "happy"), (2.75, "excited"), (3.62, "happy"), (4.7, "focused"),
             (5.15, "excited"), (5.45, "focused"), (5.75, "excited"), (6.1, "focused"), (6.45, "excited"),
             (6.9, "focused"), (7.75, "shocked"), (8.1, "sus"), (8.75, "confused"), (9.47, "happy"),
             (11.0, "excited"), (12.3, "smug"), (12.95, "happy"), (13.35, "excited")]
BLINKS = [1.2, 3.0, 4.3, 6.6, 8.45, 8.65, 10.3, 11.5, 13.2]

def expr_at(t):
    e = EXPR_KEYS[0][1]
    for k, n in EXPR_KEYS:
        if t >= k: e = n
    return e
def blink_at(t):
    for b in BLINKS:
        if b <= t <= b + 0.14: return math.sin((t - b) / 0.14 * math.pi)
    return 0.0
def stepkeys(keys, t):
    """hold each key's value from its time, with a quick ease from the previous value."""
    i = 0
    for k, (a, v) in enumerate(keys):
        if t >= a: i = k
    a, v = keys[i]
    if i == 0: return v
    pv = keys[i - 1][1]
    u = ease_io(prog(t, a, a + 0.22))
    return tuple(x + (y - x) * u for x, y in zip(pv, v)) if isinstance(v, tuple) else pv + (v - pv) * u

# arm keys: (time, target or None=auto, bend, pose, hang)
A_KEYS = [  # A = near arm when facing right (screen-left in front view)
    (0, None, 0, "open", 0), (0.45, None, 0, "open", 0),
    (0.65, (110, -560), 40, "open", 0), (1.4, (110, -560), 40, "open", 0),        # wave while walking
    (1.65, None, 0, "open", 0), (1.85, None, 0, "open", 0),
    (2.0, (110, 40), 60, "point", 0), (2.55, (110, 40), 60, "point", 0),       # points at himself
    (2.8, None, 0, "open", 0), (3.62, None, 0, "open", 0),
    (4.7, None, 0, "open", 0), (4.85, (300, -130), -30, "pencil", 0),           # drawing at easel
    (6.8, (300, -130), -30, "pencil", 0), (7.6, (300, -130), -30, "pencil", 0),
    (7.85, (210, 60), -20, "pencil", 0), (8.7, (210, 60), -20, "pencil", 0),     # frozen
    (8.85, (-170, -20), -70, "open", 0), (9.3, (-170, -20), -70, "open", 0),     # shrug
    (9.47, None, 0, "open", 0), (10.95, None, 0, "open", 0),
    (11.1, (-210, -330), -40, "gun", 0), (11.55, (-210, -330), -40, "gun", 0),   # cool people
    (11.75, None, 0, "open", 0), (13.4, None, 0, "open", 0),
    (13.7, (-60, 120), -40, "fist", 0), (13.95, (-160, -370), -40, "open", 0), (20, (-160, -370), -40, "open", 0),
]
B_KEYS = [
    (0, None, 0, "open", 0), (2.7, None, 0, "open", 0),
    (2.9, (120, -390), 40, "point", 0), (3.4, (120, -390), 40, "point", 0),     # points up at sign
    (3.62, None, 0, "open", 0), (8.7, None, 0, "open", 0),
    (8.85, (170, -20), 70, "open", 0), (9.3, (170, -20), 70, "open", 0),       # shrug
    (9.47, None, 0, "open", 0), (11.6, None, 0, "open", 0),
    (11.8, (90, -400), 40, "gun", 0), (12.3, (90, -400), 40, "gun", 0),         # studios
    (12.5, (270, -300), 40, "gun", 0), (13.0, (270, -300), 40, "gun", 0),       # clients
    (13.2, None, 0, "open", 0), (13.4, None, 0, "open", 0),
    (13.7, (60, 120), 40, "fist", 0), (13.95, (160, -370), 40, "open", 0), (20, (160, -370), 40, "open", 0),
]

def auto_arm(side, yaw, phase, walk):
    ay = abs(yaw); fac = 1 if yaw >= 0 else -1
    rest = np.array([-70.0, 300.0]) if side == 0 else np.array([70.0, 300.0])
    sw = 85 * math.cos(2 * math.pi * phase) * (1 if side == 0 else -1) * walk
    side_rest = np.array([-fac * sw + fac * 10, 300.0])
    return lerp(rest, side_rest, clamp((ay - 0.2) / 0.6)) if ay > 0.2 else rest + np.array([0, 0])

def sample_arm(keys, side, t, yaw, phase, walk):
    auto = auto_arm(side, yaw, phase, walk)
    for (a, ta, ba, pa, ha), (b, tb, bb, pb, hb) in zip(keys, keys[1:]):
        if a <= t <= b:
            u = ease_out_back((t - a) / (b - a + 1e-9), 1.3)
            va = auto if ta is None else np.array(ta, float)
            vb = auto if tb is None else np.array(tb, float)
            bend = lerp(ba if ta is not None else (25 if side else -25), bb if tb is not None else (25 if side else -25), u)
            return dict(t=tuple(va + (vb - va) * u), bend=bend, pose=pa if u < 0.5 else pb, hang=0)
    return dict(t=tuple(auto), bend=25 if side else -25, pose="open", hang=0)

def mori_state(t, fi):
    st = default_state()
    st["t"] = t
    sc_ = scene_of(t)
    wx = WX[fi]
    st["x"] = wx - cam_x(t, wx); st["y"] = GROUND; st["sc"] = SC
    st["yaw"] = track(YAW, t); st["head_yaw"] = track(HEAD_YAW, t)
    st["tilt"] = track(TILT, t) + math.sin(t * 2.6) * 1.5 + env[fi] * 3
    st["look"] = stepkeys(LOOK, t)
    st["expr"] = expr_at(t); st["blink"] = blink_at(t); st["talk"] = env[fi]
    st["seed"] = 11
    ph, wk = PHASE[fi], WALK[fi]
    st["phase"], st["walk"] = ph, wk
    st["feet"] = walk_feet(ph, wk, 200)
    st["bob"] = 9 * math.cos(4 * math.pi * ph) * wk
    st["lean"] = (4 * wk) * (1 if st["yaw"] > 0 else -1)
    # idle breathing + talking bounce
    st["sq"] = math.sin(t * 2 * math.pi * 0.7) * 0.012 * (1 - wk) + env[fi] * 0.01
    st["sq"] -= 0.07 * bump(t, 2.0, 2.6)                       # "little guy" shrink
    st["sq"] += 0.03 * bump(t, 8.8, 9.3)                       # shrug
    st["hop"] = 0.0; st["neck"] = 0.0
    if 7.85 <= t < 8.05: st["sq"] -= 0.04 * bump(t, 7.85, 8.05)    # ink impact recoil
    for b in (11.1, 11.8, 12.5):
        st["sq"] += 0.03 * bump(t, b, b + 0.3)
    if t > 13.55:
        st["sq"] -= 0.08 * bump(t, 13.6, 13.95)
        u = prog(t, 13.95, 14.55)
        st["hop"] = 230 * math.sin(math.pi * u) * SC / 0.62 if t < 14.55 else 0
        st["neck"] = 50 * bump(t, 13.95, 14.6)
        st["hair_kick"] = 0.6 * math.sin(math.pi * u) if t < 14.55 else 0
        if t < 14.55: st["sq"] += 0.05 * math.sin(math.pi * u)
        st["feet"] = [(-20, 30 * math.sin(math.pi * u) if t < 14.55 else 0), (20, 30 * math.sin(math.pi * u) if t < 14.55 else 0)]
    # ink on face (scene 2 gag), a little smudge left in scene 3
    st["ink"] = 1.0 if 7.85 <= t < IRIS[1] else (prog(t, 7.78, 7.85) if 7.78 <= t < 7.85 else 0.0)
    st["arms"] = [sample_arm(A_KEYS, 0, t, st["yaw"], ph, wk), sample_arm(B_KEYS, 1, t, st["yaw"], ph, wk)]
    if 0.65 < t < 1.4:   # wave wiggle
        tx, ty = st["arms"][0]["t"]; st["arms"][0]["t"] = (tx + math.sin(t * 22) * 50, ty)
    if (4.85 < t < 5.1) or (5.45 < t < 5.7) or (6.1 < t < 6.4) or (6.95 < t < 7.6):   # scribbling at the easel
        tx, ty = st["arms"][0]["t"]
        st["arms"][0]["t"] = (tx + math.sin(t * 31) * 28, ty + math.cos(t * 23) * 22)
    if t > 14.0 and t < FLOOD[0]:
        for i in (0, 1):
            tx, ty = st["arms"][i]["t"]; st["arms"][i]["t"] = (tx + math.sin(t * 25 + i) * 30, ty)
    if 8.8 < t < 9.3:
        for i in (0, 1):
            tx, ty = st["arms"][i]["t"]; st["arms"][i]["t"] = (tx, ty - 18 * abs(math.sin(t * 7)))
    return st

# ---------------------------------------------------------------- paper + boil
def paper_tex(seed):
    r = np.random.default_rng(seed)
    n = cv2.resize(cv2.GaussianBlur(r.normal(0, 1, (H // 4, W // 4)).astype(np.float32), (0, 0), 3), (W, H)) * 5
    base = np.ones((H, W, 3), np.float32) * PAPER + (n + r.normal(0, 3.5, (H, W)).astype(np.float32))[..., None]
    vy, vx = np.mgrid[0:H, 0:W]
    vig = 1 - 0.10 * (((vx - W / 2) / W) ** 2 + ((vy - H / 2) / H) ** 2) * 4
    return np.clip(base * vig[..., None], 0, 255).astype(np.float32)
PAPERS = [paper_tex(s) for s in range(3)]
def boil_map(seed, amp=1.2):
    r = np.random.default_rng(100 + seed)
    f = lambda: cv2.resize(r.normal(0, 1, (H // 24 + 2, W // 24 + 2)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC) * amp
    gy, gx = np.mgrid[0:H, 0:W].astype(np.float32)
    return gx + f(), gy + f()
BOILS = [boil_map(s) for s in range(3)]
BOILS_BIG = [boil_map(s + 10, 4.0) for s in range(3)]

# ---------------------------------------------------------------- props & sets
SIGN = text_sprite("MO ARTZ", "permanent-marker", 120, -2, bleed=2.0)
STUDIO_TXT = text_sprite("STUDIO", "architects-daughter", 40, 0, bleed=1.0)
OPEN_TXT = text_sprite("OPEN :)", "caveat-brush", 44, -6)
TIPS = text_sprite("TIPS", "permanent-marker", 34, 0)
P_TXT = [text_sprite("COOL PEOPLE", "architects-daughter", 38, 0, bleed=1.0),
         text_sprite("STUDIOS", "architects-daughter", 44, 0, bleed=1.0),
         text_sprite("CLIENTS", "architects-daughter", 44, 0, bleed=1.0)]
WANTED = text_sprite("LET'S CONNECT", "permanent-marker", 46, -3)
END_LOGO = text_sprite("MO ARTZ", "permanent-marker", 175, -4, col=PAPER, bleed=2.4)
END_SUB = text_sprite("MOTION DESIGN  *  TIPS  *  SHARING  *  OPPORTUNITIES", "architects-daughter", 29, 0, col=PAPER, bleed=1.0)
END_HI = text_sprite("say hi :)", "caveat-brush", 64, -4, col=PAPER)

def ground_line(c, seed, x0=-50, x1=W + 50):
    line(c, [(x0, GROUND + 4), (W / 2, GROUND + 1), (x1, GROUND + 6)], 4, seed=seed, passes=2)
    r = np.random.default_rng(seed)
    for i in range(14):
        x = r.uniform(0, W); y = GROUND + r.uniform(30, 260)
        line(c, [(x, y), (x + r.uniform(30, 90), y + r.uniform(-4, 4))], 2, seed=seed + i, passes=1)

def set_street(c, t):
    # building facade
    shape(c, [(90, 420), (990, 400), (1000, GROUND), (80, GROUND)], 5, fillcol=LIGHT, seed=301)
    line(c, [(60, 420), (1020, 395)], 7, seed=302)                      # roof edge
    hatch(c, [(90, 420), (990, 400), (990, 440), (90, 460)], 120, 9, 2, seed=303)
    # sign plank
    wig = 3 * math.sin(t * 40) * bump(t, 2.9, 3.4)
    sp = rot_pts([(300, 560), (880, 548), (885, 700), (296, 712)], wig, 590, 630)
    shape(c, sp, 5, fillcol=LIGHT, seed=304)
    place(c, SIGN, 590, 628, 1.0 + 0.12 * bump(t, 2.9, 3.3), -2 + wig)
    crown(c, 390, 560, 0.9 + 0.5 * bump(t, 2.95, 3.4), seed=305)
    for k in range(2): line(c, [(330 + k * 500, 470), (340 + k * 500, 556)], 3, seed=306 + k, passes=1)
    if 2.95 < t < 3.62:                                                   # sparkle on the sign
        for i in range(8):
            a = i / 8 * 2 * math.pi; r0 = 330 + 20 * math.sin(t * 25); r1 = r0 + 40
            line(c, [(590 + math.cos(a) * r0, 630 + math.sin(a) * r0 * 0.4), (590 + math.cos(a) * r1, 630 + math.sin(a) * r1 * 0.4)], 4, seed=310 + i, passes=1)
    # window
    shape(c, [(150, 860), (470, 852), (474, 1190), (146, 1196)], 5, fillcol=PAPER, seed=320)
    line(c, [(310, 856), (312, 1192)], 4, seed=321); line(c, [(148, 1022), (472, 1018)], 4, seed=322)
    for i in range(4): line(c, [(170 + i * 30, 880), (230 + i * 30, 840 + 80)], 2, seed=323 + i, passes=1)
    shape(c, [(150, 840), (474, 832), (490, 862), (136, 870)], 4, fillcol=LIGHT, seed=327)
    # door
    shape(c, [(610, 1010), (880, 1004), (884, GROUND), (606, GROUND)], 5, fillcol=PAPER, seed=330)
    shape(c, [(650, 1060), (840, 1056), (842, 1260), (648, 1264)], 4, fillcol=LIGHT, seed=331)
    hatch(c, [(650, 1060), (840, 1056), (842, 1260), (648, 1264)], 45, 14, 2, seed=332)
    fill(c, ellipse_pts(840, 1360, 12, 12, 16), INK)
    shape(c, [(660, 1300), (830, 1296), (832, 1380), (658, 1384)], 3, fillcol=LIGHT, seed=333)
    place(c, OPEN_TXT, 745, 1340, 0.9, 0)
    # potted plant
    shape(c, [(930, 1520), (1010, 1520), (995, GROUND), (945, GROUND)], 4, fillcol=LIGHT, seed=340)
    for i, a in enumerate((-60, -90, -120, -75, -105)):
        x0, y0 = 970, 1520; aa = math.radians(a + 6 * math.sin(t * 2 + i))
        line(c, bez((x0, y0), (x0 + math.cos(aa) * 50, y0 + math.sin(aa) * 60), (x0 + math.cos(aa) * 90, y0 + math.sin(aa) * 120), 10), 4, seed=341 + i, passes=1)
    ground_line(c, 350)

FLOWER_PATH = [(5.15, (740, 1010)), (5.6, (430, 640)), (6.2, (250, 560)), (8.0, (190, 520))]
STAR_PATH = [(5.75, (840, 1060))]
BOOK_PATH = [(6.45, (760, 1160)), (7.1, (950, 450)), (9.3, (980, 380))]

def flower(c, cx, cy, r, rot, t_draw, seed, col=INK):
    n = 6
    for i in range(n):
        if t_draw * n < i: break
        a = math.radians(rot + i * 360 / n)
        uu = np.linspace(-0.55, 0.55, 14)
        pts = [(cx + math.cos(a + u) * r * math.cos(u * 2.6), cy + math.sin(a + u) * r * math.cos(u * 2.6)) for u in uu]
        line(c, pts, 4, col=col, seed=seed + i, passes=1)
    if t_draw > 0.4: line(c, ellipse_pts(cx, cy, r * 0.22, r * 0.22, 16, 0, 6.8), 4, col=col, seed=seed + 40, passes=1)

def book(c, cx, cy, s, flap, t_draw, seed):
    if t_draw <= 0: return
    a = 35 * flap
    left = rot_pts([(cx, cy - 30 * s), (cx - 60 * s, cy - 40 * s), (cx - 60 * s, cy + 30 * s), (cx, cy + 40 * s)], -a, cx, cy)
    right = rot_pts([(cx, cy - 30 * s), (cx + 60 * s, cy - 40 * s), (cx + 60 * s, cy + 30 * s), (cx, cy + 40 * s)], a, cx, cy)
    shape(c, partial(left, t_draw * 2), 4, fillcol=LIGHT if t_draw >= 1 else None, seed=seed)
    if t_draw > 0.5: shape(c, partial(right, (t_draw - 0.5) * 2), 4, fillcol=LIGHT if t_draw >= 1 else None, seed=seed + 1)
    if t_draw >= 1: place(c, TIPS, cx + 30 * s, cy, s * 0.8, -a * 0.5)

def path_pos(path, t):
    return track([(a, p) for a, p in path], t, ease_io)

def set_studio(c, t):
    line(c, [(-20, 1450), (1100, 1440)], 4, seed=401)                   # wall/floor seam
    hatch(c, [(0, 1450), (W, 1440), (W, GROUND), (0, GROUND)], 160, 26, 2, seed=402, amt=0.5)
    # window with sky
    shape(c, [(80, 520), (430, 510), (436, 900), (76, 906)], 5, fillcol=LIGHT, seed=410)
    line(c, [(256, 514), (258, 902)], 4, seed=411); line(c, [(78, 710), (434, 704)], 4, seed=412)
    line(c, ellipse_pts(160, 600, 40, 22, 20, 0, 6.6), 3, seed=413, passes=1)
    line(c, ellipse_pts(350, 790, 50, 25, 20, 0, 6.6), 3, seed=414, passes=1)
    # shelf + books + plant
    line(c, [(600, 760), (1040, 752)], 6, seed=420)
    for i, (x, w, h, tl) in enumerate([(630, 40, 130, 0), (672, 34, 110, 0), (708, 46, 140, 0), (760, 40, 120, 14)]):
        p = rot_pts([(x, 758), (x + w, 758), (x + w, 758 - h), (x, 758 - h)], tl, x, 758)
        shape(c, p, 4, fillcol=LIGHT, seed=421 + i)
    shape(c, [(930, 700), (1000, 700), (990, 756), (940, 756)], 4, fillcol=LIGHT, seed=430)
    for i in range(4): line(c, bez((965, 700), (940 + i * 18, 650), (925 + i * 25, 600 + i * 6), 8), 3, seed=431 + i, passes=1)
    # rug
    shape(c, ellipse_pts(470, GROUND + 6, 330, 40, 40), 4, fillcol=LIGHT, seed=440)
    # easel
    shake = 0.0
    if 7.35 < t < 7.8: shake = math.sin(t * 90) * 6 * prog(t, 7.35, 7.75)
    line(c, [(690, GROUND), (785, 860)], 7, seed=450); line(c, [(880, GROUND), (785, 860)], 7, seed=451)
    line(c, [(785, 900), (800, GROUND - 20)], 5, seed=452)
    board = [(655 + shake, 900), (915 + shake, 894), (920 + shake, 1245), (650 + shake, 1250)]
    shape(c, board, 5, fillcol=LIGHT, seed=453)
    line(c, [(630, 1262), (940, 1256)], 8, seed=454)
    # doodles on the board (drawn by Mori, then they come alive)
    fdraw = prog(t, 4.85, 5.1)
    if t < 5.15: flower(c, 740 + shake, 1010, 55, 0, fdraw, 460)
    sdraw = prog(t, 5.45, 5.7)
    if t < 5.75 and sdraw > 0: line(c, partial(star_pts(840 + shake, 1060, 45, 0), sdraw), 5, seed=470)
    bdraw = prog(t, 6.1, 6.4)
    if t < 6.45: book(c, 760 + shake, 1160, 1.0, 0, bdraw, 480)
    spd = prog(t, 6.95, 7.6)                                            # the "questionable" experiment
    if spd > 0 and t < 7.85:
        th = np.linspace(0, 9 * math.pi * spd, 160)
        rr = 8 + 13 * th / (math.pi * 2)
        pts = np.stack([785 + shake + np.cos(th * 1.3) * rr * 1.4, 1070 + np.sin(th) * rr], 1)
        line(c, pts, 5, seed=490, passes=2)
    if 7.6 < t < 7.85:
        fill(c, blob_pts(785 + shake, 1070, 120 * ease_out_back(prog(t, 7.6, 7.75)), 495), INK)
    if t >= 7.85:   # board stays splattered
        splat(c, 785, 1070, 110, 1.0, 496)
    ground_line(c, 499)

def studio_flyers(c, t, face_xy):
    """doodles that escaped the board."""
    if t >= 5.15:
        p = path_pos(FLOWER_PATH, t); bob = math.sin(t * 3) * 14
        flower(c, p[0], p[1] + bob, 55 + 15 * bump(t, 5.15, 5.6), t * 120, 1.0, 460)
    if t >= 5.75:   # star bounces across the floor
        u = t - 5.75
        x = 840 - 260 * u + 0 * u; x = max(x, 140)
        y = GROUND - 60 - abs(math.sin(u * 7)) * 260 * math.exp(-u * 0.6)
        line(c, star_pts(x, y, 45, u * 400), 5, seed=470)
    if t >= 6.45:
        p = path_pos(BOOK_PATH, t)
        book(c, p[0], p[1] + math.sin(t * 6) * 10, 1.0, math.sin(t * 18), 1.0, 480)
    if 7.75 <= t < 7.86:   # ink shot flying at Mori's face
        u = prog(t, 7.75, 7.86)
        x = lerp(785, face_xy[0], u); y = lerp(1070, face_xy[1], u) - math.sin(math.pi * u) * 80
        fill(c, blob_pts(x, y, 60, 497), INK)

BRICK_SEED = np.random.default_rng(600)
BRICKS = []
for row in range(18):
    y = 330 + row * 72
    off = 0 if row % 2 else 85
    for k in range(-2, 22):
        if BRICK_SEED.uniform() < 0.45:
            BRICKS.append((k * 170 + off, y, BRICK_SEED.integers(0, 1000)))
POSTERS = [(300, 585, -5, 0), (610, 540, 4, 1), (910, 600, -3, 2)]   # world x, y, rot, idx

def poster(c, x, y, rot, idx, t, s=1.0, dance=0.0):
    w, h = 250 * s, 300 * s
    wig = 0.0
    for i, tb in enumerate((11.1, 11.8, 12.5)):
        if i == idx: wig = 6 * math.sin(t * 35) * bump(t, tb, tb + 0.45)
    rot = rot + wig + dance
    p = rot_pts([(x - w / 2, y - h / 2), (x + w / 2, y - h / 2), (x + w / 2, y + h / 2), (x - w / 2, y + h / 2)], rot, x, y)
    shape(c, p, 4, fillcol=LIGHT, seed=700 + idx * 9)
    dc = rot_pts([(x, y - 30 * s)], rot, x, y)[0]
    pulse = 1 + 0.15 * (bump(t, 11.1, 11.5) if idx == 0 else bump(t, 11.8, 12.2) if idx == 1 else bump(t, 12.5, 12.9))
    if idx == 0:
        line(c, ellipse_pts(dc[0], dc[1], 55 * s * pulse, 55 * s * pulse, 30, 0, 6.6), 4, seed=710, passes=1)
        wink = bump(t, 11.25, 11.45)
        line(c, [(dc[0] - 20 * s, dc[1] - 14 * s), (dc[0] - 20 * s, dc[1] - 14 * s + 10 * s * (1 - wink) + 1)], 6, seed=711, passes=1)
        line(c, [(dc[0] + 20 * s, dc[1] - 14 * s), (dc[0] + 20 * s, dc[1] - 4 * s)], 6, seed=712, passes=1)
        line(c, bez((dc[0] - 26 * s, dc[1] + 12 * s), (dc[0], dc[1] + 38 * s), (dc[0] + 26 * s, dc[1] + 12 * s), 10), 4, seed=713, passes=1)
    elif idx == 1:
        x0, y0 = dc
        line(c, [(x0 - 60 * s, y0 + 45 * s), (x0 - 60 * s, y0 - 5 * s), (x0 - 25 * s, y0 - 45 * s * pulse), (x0 + 10 * s, y0 - 5 * s),
                 (x0 + 10 * s, y0 - 35 * s), (x0 + 60 * s, y0 - 35 * s), (x0 + 60 * s, y0 + 45 * s), (x0 - 60 * s, y0 + 45 * s)], 4, seed=720)
        for k in range(3):   # chimney puffs
            u = (t * 0.9 + k / 3) % 1
            line(c, ellipse_pts(x0 + 40 * s + u * 20, y0 - 55 * s - u * 60 * s, 10 * s * (1 + u), 8 * s * (1 + u), 14, 0, 6.6), 2, seed=721 + k, passes=1)
    else:
        crown(c, dc[0], dc[1], 1.1 * s * pulse, seed=730)
        for k in range(3):
            line(c, [(dc[0] - 60 * s + k * 60 * s, dc[1] + 40 * s), (dc[0] - 55 * s + k * 60 * s, dc[1] + 50 * s)], 3, seed=731 + k, passes=1)
    lp = rot_pts([(x, y + 95 * s)], rot, x, y)[0]
    place(c, P_TXT[idx], lp[0], lp[1], s * 0.95, rot)
    tp = rot_pts([(x, y - h / 2)], rot, x, y)[0]
    tape(c, tp[0], tp[1], 100 * s, rot + 8, 740 + idx)

def set_alley(c, t, camx, dance_amt):
    line(c, [(-20, 300), (1100, 296)], 6, seed=601)                     # wall top
    for i in range(6):   # sky scribble clouds + birds
        x = (180 + i * 330 - camx * 0.3) % 1400 - 160
        if i % 2: line(c, ellipse_pts(x, 160 + (i % 3) * 30, 60, 22, 24, 0, 6.6), 3, seed=602 + i, passes=1)
        else: line(c, [(x - 16, 120), (x, 132), (x + 16, 120)], 3, seed=608 + i, passes=1)
    for bx, by, sd in BRICKS:
        x = bx - camx
        if -200 < x < W + 40:
            dy = math.sin(t * 9 + bx * 0.01) * 10 * dance_amt
            line(c, [(x, by + dy), (x + 150, by + dy), (x + 150, by + 62 + dy)], 2.5, seed=int(sd), passes=1)
    # drain pipe
    px = 120 - camx
    line(c, [(px, 300), (px, GROUND)], 5, seed=620); line(c, [(px + 30, 300), (px + 30, GROUND)], 5, seed=621)
    for y in (500, 900, 1300): line(c, [(px - 8, y), (px + 38, y)], 5, seed=622 + y, passes=1)
    place(c, WANTED, 610 - camx, 360, pop(t, 10.4) if t < 13.55 else 1.0, -3 + math.sin(t * 9) * 4 * dance_amt)
    for (wx_, wy, rot, idx) in POSTERS:
        d = 0.0; dy = 0.0
        if dance_amt > 0:
            d = 12 * math.sin(t * 12 + idx) * dance_amt; dy = -abs(math.sin(t * 10 + idx * 2)) * 60 * dance_amt
        poster(c, wx_ - camx, wy + dy, rot, idx, t if t < 13.3 else 0, 1.0, d)
    ground_line(c, 650)

def scribble_wipe(c, t):
    a, m, b = WIPE
    if not (a < t < b): return
    rr = np.random.default_rng(1100)
    pts = []
    for i in range(16):
        y = -60 + i * 135 + rr.normal(0, 15)
        pts += [(-120, y), (W + 120, y + 70 + rr.normal(0, 20))] if i % 2 == 0 else [(W + 120, y), (-120, y + 70)]
    seg = []
    for p0, p1 in zip(pts, pts[1:]):
        seg += list(bez(p0, ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 30), p1, 10))
    seg = np.array(seg)
    s_ = partial(seg, ease_io(prog(t, a, m))) if t < m else partial(seg[::-1], 1 - ease_io(prog(t, m, b)))
    line(c, s_, 230, seed=1101, passes=2, amp=6)

def iris(c, t, center):
    a, m, b = IRIS
    if not (a < t < b): return
    r = lerp(1400, 0, ease_io(prog(t, a, m))) if t < m else lerp(0, 1400, ease_io(prog(t, m, b)))
    th = np.linspace(0, 2 * math.pi, 90)
    hole = np.stack([center[0] + np.cos(th) * r * (1 + 0.05 * np.sin(th * 7 + t * 20)), center[1] + np.sin(th) * r], 1)
    mask = np.ones((H, W), np.uint8)
    if r > 2: cv2.fillPoly(mask, [np.int32(hole)], 0, cv2.LINE_AA)
    c[mask > 0] = INK

def end_card(c, t):
    c[...] = INK
    rr = np.random.default_rng(1310)
    for i in range(40):
        x0, y0 = rr.uniform(0, W), rr.uniform(0, H)
        line(c, [(x0, y0), (x0 + 60, y0 - 40)], 3, col=(40, 37, 36), seed=1320 + i, passes=1)
    place(c, END_LOGO, 540, 420, pop(t, 14.8, 0.3), -4)
    crown(c, 300, 270, pop(t, 14.9), col=PAPER, seed=1330, w=6)
    place(c, END_SUB, 540, 590, pop(t, 15.0), 0)
    place(c, END_HI, 800, 720, pop(t, 15.1), 0)
    for i, (sx_, sy_, r) in enumerate([(150, 1500, 30), (940, 1420, 36), (920, 180, 20), (120, 820, 18)]):
        splat(c, sx_, sy_, r, prog(t, 14.85 + i * 0.05, 15.2 + i * 0.05), 1340 + i, PAPER)

# ---------------------------------------------------------------- frame
def render(fi):
    t = fi / FPS
    BOIL[0] = (fi // 2) % 3
    pidx = BOIL[0]
    c = PAPERS[pidx].copy()
    sc_ = scene_of(t)
    st = mori_state(t, fi)
    dance = clamp((t - 14.0) / 0.3) if sc_ == 3 else 0.0
    if sc_ == 4:
        end_card(c, t)
        st.update(x=540, y=1750, sc=0.5, yaw=0.0, head_yaw=0.0, expr="happy", ink=0.0, hop=0, feet=None, walk=0,
                  look=(0.0, 0.1), talk=0.0, tilt=math.sin(t * 3) * 4, neck=0)
        st["arms"] = [dict(t=(-70, 300), bend=-25, pose="open"), dict(t=(170 + math.sin(t * 20) * 40, -330), bend=60, pose="open")]
        shadow(c, 540, 1750, 0.5, 0, dark=True)
        draw_mori(c, st)
    else:
        if sc_ == 1: set_street(c, t)
        elif sc_ == 2: set_studio(c, t)
        else:
            camx = cam_x(t, WX[fi])
            set_alley(c, t, camx, dance)
        shadow(c, st["x"], GROUND, SC, st["hop"])
        draw_mori(c, st)
        # head position for effects (approx)
        face = (st["x"] + 30 * st["head_yaw"] * SC * 3, GROUND - st["hop"] - 1000 * SC)
        if sc_ == 2: studio_flyers(c, t, face)
        if sc_ == 3 and t > 13.9:   # callback: the doodles fly back in and party
            for i in range(3):
                a = t * 2.2 + i * 2.1
                fx, fy = 540 + math.cos(a) * 380, 900 + math.sin(a * 1.3) * 300
                if i == 0: flower(c, fx, fy, 50, t * 200, 1.0, 460)
                elif i == 1: line(c, star_pts(fx, fy, 45, t * 300), 5, seed=470)
                else: book(c, fx, fy, 0.9, math.sin(t * 18), 1.0, 480)
            for i in range(14):
                a = i / 14 * 2 * math.pi; ph = (t * 3 + i * 0.37) % 1
                r0 = 470 + ph * 160
                cx_, cy_ = st["x"], GROUND - 500
                line(c, [(cx_ + math.cos(a) * r0, cy_ + math.sin(a) * r0), (cx_ + math.cos(a) * (r0 + 70), cy_ + math.sin(a) * (r0 + 70))], 5, seed=1400 + i, passes=1)
        if sc_ == 1 and 0.6 < t < 1.45:   # "yo" wave marks
            hx = st["x"] + 60 * SC + 60; hy = GROUND - 1090 * SC
            for i in range(3):
                k = prog(t, 0.7 + i * 0.07, 0.95 + i * 0.07)
                line(c, partial([(hx + 40 + i * 26, hy - i * 32), (hx + 64 + i * 26, hy - 26 - i * 32)], k), 5, seed=1500 + i, passes=1)
        scribble_wipe(c, t)
        iris(c, t, face)
        if FLOOD[0] <= t < FLOOD[1]:
            fill(c, blob_pts(540, 1000, lerp(40, 1500, ease_io(prog(t, *FLOOD))), 1600), INK)

    # camera push-in for the deadpan beat
    z = 1.0 + 0.35 * ease_io(prog(t, 7.95, 8.9)) if 7.95 <= t < IRIS[1] else 1.0
    if z > 1.001:
        fx, fy = st["x"], GROUND - 1000 * SC
        M = np.array([[z, 0, fx - z * fx], [0, z, fy - z * fy]], np.float32)
        c = cv2.warpAffine(c, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    paper = PAPERS[pidx]
    bm = BOILS_BIG[pidx] if dance > 0 else BOILS[pidx]
    diff = cv2.remap((c - paper).astype(np.float32), bm[0], bm[1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    out = np.clip(paper + diff + np.random.default_rng(fi).normal(0, 3, (H, W, 1)).astype(np.float32), 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, f"f{fi:04d}.png"), cv2.cvtColor(out, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_PNG_COMPRESSION, 1])

def steps():
    out = []
    for i in range(1, N + 1):
        if WALK[i] > 0.3 and int(PHASE[i] * 2) != int(PHASE[i - 1] * 2): out.append(round(TS[i], 3))
    return out

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "steps":
        json.dump(steps(), open(os.path.join(HERE, "steps.json"), "w")); print(steps())
    elif len(sys.argv) > 1 and sys.argv[1] != "all":
        for fi in [int(x) for x in sys.argv[1].split(",")]: render(fi)
    else:
        from multiprocessing import Pool
        with Pool(4) as p:
            for i, _ in enumerate(p.imap_unordered(render, range(N), chunksize=4)):
                if i % 60 == 0: print("done", i, flush=True)
