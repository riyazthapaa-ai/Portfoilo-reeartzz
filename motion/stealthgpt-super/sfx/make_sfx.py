"""Build the SFX track for the StealthGPT SUPER video (v3 fast-paced cut).

  python make_sfx.py events.json sfx.wav                 # synthesise every sound procedurally
  python make_sfx.py events.json sfx.wav --samples dir/   # use your own files where they exist
                                                          # (dir/<category>.wav, e.g. whoosh.wav)

events.json is exported from the scene engine (see export_events.js). It holds every
transition and element animation with its exact time. cues.json (written next to the output)
lists each category, its prompt for audio-studio-mcp and every time it is used.
"""
from __future__ import annotations
import json, sys, wave
from pathlib import Path
import numpy as np
from scipy import signal

SR = 48000
DUR = 348.6
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- dsp helpers
def t_(d): return np.arange(int(d * SR)) / SR

def noise(d): return rng.standard_normal(int(d * SR))

def sweep_bp(x, f0, f1, q=2.0, curve=1.0):
    """Band-pass with a centre frequency sweeping f0->f1 (block-wise biquad)."""
    out = np.zeros_like(x); n = len(x); blk = 256; zi = None
    for i in range(0, n, blk):
        p = (i / max(1, n - 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        fc = min(fc, SR * 0.45)
        b, a = signal.iirpeak(fc, q, fs=SR)
        if zi is None: zi = signal.lfilter_zi(b, a) * 0
        out[i:i + blk], zi = signal.lfilter(b, a, x[i:i + blk], zi=zi)
    return out

def lp(x, fc): b, a = signal.butter(2, fc, 'low', fs=SR); return signal.lfilter(b, a, x)
def hp(x, fc): b, a = signal.butter(2, fc, 'high', fs=SR); return signal.lfilter(b, a, x)

def bell_env(n, peak=0.6, sharp=2.0):
    x = np.linspace(0, 1, n)
    e = np.where(x < peak, (x / peak), ((1 - x) / (1 - peak)))
    return np.clip(e, 0, 1) ** sharp

def exp_env(n, decay, attack=0.002):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)

def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak

def chirp_sine(d, f0, f1, curve=1.0):
    t = t_(d); p = (t / d) ** curve
    f = f0 * (f1 / f0) ** p
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def stereo(x, pan=0.0, pan_to=None):
    n = len(x)
    p = np.full(n, pan) if pan_to is None else np.linspace(pan, pan_to, n)
    l = np.cos((p + 1) * np.pi / 4); r = np.sin((p + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1)


# ---------------------------------------------------------------- sound design
def whoosh(d=0.5, f0=350, f1=4200, peak=0.62, pan=-0.6, pan_to=0.6, pitch=1.0):
    x = sweep_bp(noise(d), f0 * pitch, f1 * pitch, q=1.4, curve=0.9)
    x = x * bell_env(len(x), peak, 2.2)
    air = hp(noise(d), 5000) * bell_env(len(x), peak, 3) * 0.25
    return stereo(norm(x + air, 0.9), pan, pan_to)

def whoosh_down(d=0.55, pitch=1.0):
    x = sweep_bp(noise(d), 3800 * pitch, 260 * pitch, q=1.3, curve=0.7) * bell_env(int(d * SR), 0.5, 2)
    return stereo(norm(x, 0.9), 0.4, -0.4)

def riser(d=0.6, pitch=1.0):
    n = int(d * SR)
    x = sweep_bp(noise(d), 400 * pitch, 7000 * pitch, q=2.5, curve=1.6) * np.linspace(0, 1, n) ** 2.5
    s = chirp_sine(d, 220 * pitch, 1400 * pitch, 1.8) * np.linspace(0, 1, n) ** 3 * 0.25
    return stereo(norm(x + s, 0.8))

def impact(d=0.9, big=1.0, pitch=1.0):
    n = int(d * SR)
    sub = chirp_sine(d, 140 * pitch, 42 * pitch, 0.35) * exp_env(n, 0.28 * big)
    body = lp(noise(d), 1400) * exp_env(n, 0.06)
    click = hp(noise(d), 3000) * exp_env(n, 0.006)
    x = sub * 1.0 + body * 0.55 + click * 0.35
    return stereo(norm(np.tanh(x * 1.6), 0.95))

def pop(pitch=1.0, pan=0.0):
    d = 0.14; n = int(d * SR)
    s = chirp_sine(d, 1100 * pitch, 260 * pitch, 0.25) * exp_env(n, 0.035)
    c = hp(noise(d), 2500) * exp_env(n, 0.004) * 0.4
    return stereo(norm(s + c, 0.9), pan)

def bubble(pitch=1.0, pan=0.0):
    d = 0.12; n = int(d * SR)
    s = chirp_sine(d, 400 * pitch, 1300 * pitch, 0.6) * exp_env(n, 0.03)
    return stereo(norm(s, 0.8), pan)

def swish(d=0.24, pitch=1.0, pan=0.0):
    x = sweep_bp(noise(d), 1200 * pitch, 5200 * pitch, q=1.6, curve=1) * bell_env(int(d * SR), 0.7, 2.4)
    return stereo(norm(x, 0.8), pan - 0.3, pan + 0.3)

def thud(pitch=1.0):
    d = 0.22; n = int(d * SR)
    s = chirp_sine(d, 160 * pitch, 70 * pitch, 0.4) * exp_env(n, 0.05)
    b = lp(noise(d), 700) * exp_env(n, 0.02) * 0.5
    return stereo(norm(s + b, 0.9))

def card(pitch=1.0, pan=0.0):  # swish leading into a soft thud on landing
    w = swish(0.22, pitch, pan); th = thud(pitch) * 0.8
    out = np.zeros((len(w) + len(th), 2)); out[:len(w)] += w; out[int(0.16 * SR):int(0.16 * SR) + len(th)] += th
    return out

def tick(pitch=1.0, pan=0.0):
    d = 0.05; n = int(d * SR)
    x = sweep_bp(noise(d), 4200 * pitch, 4200 * pitch, q=6) * exp_env(n, 0.008)
    return stereo(norm(x, 0.7), pan)

def ping(freq=2600.0, pan=0.0):
    d = 0.35; n = int(d * SR); t = t_(d)
    x = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.01 * t)) * exp_env(n, 0.07)
    return stereo(norm(x, 0.6), pan)

def ui_click(pitch=1.0):
    d = 0.06; n = int(d * SR)
    x = sweep_bp(noise(d), 2400 * pitch, 2400 * pitch, q=8) * exp_env(n, 0.012) + hp(noise(d), 4000) * exp_env(n, 0.002) * 0.6
    return stereo(norm(x, 0.8))

def key(pan=0.0):
    d = 0.05; n = int(d * SR); f = rng.uniform(1800, 3200)
    x = sweep_bp(noise(d), f, f, q=5) * exp_env(n, 0.006) * rng.uniform(.6, 1)
    x += lp(noise(d), 600) * exp_env(n, 0.01) * 0.4
    return stereo(norm(x, rng.uniform(.5, .8)), pan)

def glitch(d=0.7):
    n = int(d * SR); x = np.zeros(n); i = 0
    while i < n:
        L = int(rng.uniform(0.015, 0.07) * SR); seg = min(L, n - i)
        k = rng.integers(3)
        if k == 0: x[i:i + seg] = np.sign(np.sin(2 * np.pi * rng.uniform(80, 1600) * np.arange(seg) / SR))
        elif k == 1: x[i:i + seg] = np.round(rng.standard_normal(seg) * 3) / 3
        else: x[i:i + seg] = 0
        i += L
    x = x * np.linspace(1, 0.3, n) * 0.6
    return stereo(norm(x, 0.7), -0.2, 0.2)

def chime(freqs=(1046.5, 1568.0), gap=0.09):
    d = 0.9; out = np.zeros(int((d + gap * len(freqs)) * SR))
    for k, f in enumerate(freqs):
        t = t_(d); n = len(t)
        x = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2 * t) + 0.15 * np.sin(2 * np.pi * f * 3 * t)) * exp_env(n, 0.25)
        o = int(k * gap * SR); out[o:o + n] += x
    return stereo(norm(out, 0.7))

def bell():
    d = 1.6; t = t_(d); n = len(t); f = 1320
    x = sum(a * np.sin(2 * np.pi * f * m * t) * exp_env(n, dcy) for m, a, dcy in [(1, 1, .6), (2.76, .5, .3), (5.4, .3, .15), (8.9, .15, .08)])
    x *= 1 + 0.3 * np.sin(2 * np.pi * 9 * t)  # ringing wobble
    return stereo(norm(x, 0.7))

def scanner(d=1.9):
    t = t_(d); n = len(t)
    f = 700 + 500 * np.sin(2 * np.pi * 1.4 * t) + 300 * t
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + sweep_bp(noise(d), 1500, 3000, q=3) * 0.3
    x *= np.minimum(1, np.minimum(t / 0.08, (d - t) / 0.1))
    return stereo(norm(x, 0.5), -0.5, 0.5)

def loader_blips(d=0.55):
    out = np.zeros(int(d * SR) + SR // 5)
    for k in range(6):
        b = bubble(1.0 + k * 0.12)[:, 0]; o = int(k * d / 6 * SR); out[o:o + len(b)] += b * 0.8
    return stereo(out)

def shimmer(d=1.0):
    out = np.zeros(int(d * SR) + SR // 2)
    for k in range(10):
        p = ping(rng.uniform(2200, 5200), rng.uniform(-.8, .8)); o = int(k * d / 10 * SR)
        out[o:o + len(p)] += p[:, 0] * (1 - k / 12)
    return stereo(norm(out, 0.6))

def progress(d=0.45):
    return stereo(norm(chirp_sine(d, 500, 1600, 1) * np.minimum(1, (d - t_(d)) / 0.05) * 0.5, 0.5))


# ---------------------------------------------------------------- cue rules
# category -> (synth function, gain dB, prompt for audio-studio-mcp: source, action, material, space)
CATS = {
 'whoosh':   (lambda e: whoosh(pitch=e['p']), -9,  ('fast air whoosh', 'swipes past left to right', 'airy, clean', 'close, dry')),
 'whoosh_v': (lambda e: whoosh(0.45, 300, 3400, 0.6, 0, 0, e['p']), -9, ('vertical air whoosh', 'quick swipe upward', 'airy', 'close, dry')),
 'zoom':     (lambda e: whoosh_down(pitch=e['p']), -9, ('zoom whoosh', 'rushes in then drops in pitch', 'airy, deep tail', 'close, dry')),
 'riser':    (lambda e: riser(0.5, e['p']), -12, ('short noise riser', 'builds tension for half a second', 'bright, synthetic', 'wide stereo')),
 'impact':   (lambda e: impact(0.9, e.get('big', 1), e['p']), -8, ('cinematic sub impact', 'single deep hit with a quick click', 'punchy, modern', 'wide stereo')),
 'shimmer':  (lambda e: shimmer(), -18, ('sparkle shimmer', 'magical glitter tail', 'glassy, bright', 'wide stereo')),
 'card':     (lambda e: card(e['p'], e['pan']), -14, ('UI card swipe', 'slides in and lands softly', 'plastic, glossy', 'close, dry')),
 'pop':      (lambda e: pop(e['p'], e['pan']), -13, ('cartoon bubble pop', 'single quick pop', 'rubbery', 'close, dry')),
 'spring':   (lambda e: bubble(e['p'], e['pan']), -15, ('soft UI bloop', 'springy pop-in', 'soft', 'close, dry')),
 'swish':    (lambda e: swish(0.2, e['p'], e['pan']), -20, ('tiny text swish', 'very short swipe', 'airy', 'close, dry')),
 'slam':     (lambda e: impact(0.7, 0.7, 1.3 * e['p']), -10, ('text slam hit', 'punchy hit as big text lands', 'tight, modern', 'close')),
 'letter':   (lambda e: ping(e['f'], e['pan']), -26, ('tiny glass ping', 'one soft high note', 'glass', 'close')),
 'ui_click': (lambda e: ui_click(e['p']), -16, ('UI selection click', 'soft click', 'plastic', 'close, dry')),
 'key':      (lambda e: key(e['pan']), -20, ('mechanical keyboard key', 'single keystroke', 'plastic keycap', 'desk, close')),
 'mouse':    (lambda e: ui_click(0.8), -11, ('mouse click', 'one sharp click', 'plastic', 'close, dry')),
 'glitch':   (lambda e: glitch(), -13, ('digital glitch', 'stuttering data burst', 'bitcrushed, electronic', 'close')),
 'loader':   (lambda e: loader_blips(), -15, ('loading blips', 'six quick rising blips', 'synthetic, soft', 'close')),
 'chime':    (lambda e: chime(), -14, ('success chime', 'two-note ascending ding', 'bright bells', 'small room')),
 'bell':     (lambda e: bell(), -15, ('notification bell', 'rings and wobbles', 'brass bell', 'small room')),
 'scanner':  (lambda e: scanner(), -17, ('scanner beam', 'electronic scanning sweep for two seconds', 'synthetic laser hum', 'close')),
 'progress': (lambda e: progress(), -18, ('progress bar fill', 'rising beep sweep', 'synthetic', 'close')),
 'toggle':   (lambda e: ui_click(1.3), -12, ('toggle switch', 'switch flicks on', 'plastic', 'close, dry')),
}
# where each sound's attack/centre sits relative to the event time
OFFSET = {'whoosh': -0.31, 'whoosh_v': -0.27, 'zoom': -0.27, 'riser': -0.5, 'card': -0.02, 'swish': -0.06}


def build_cues(events):
    cues = []
    add = lambda t, c, **k: cues.append(dict(t=t, c=c, p=k.pop('p', float(rng.uniform(.9, 1.12))), pan=k.pop('pan', float(rng.uniform(-.5, .5))), **k))
    for e in events:
        t, ty = e['t'], e['type']
        if ty.startswith('tr_'):
            tr = ty[3:]
            if tr == 'whip': add(t, 'whoosh')
            elif tr == 'whipv': add(t, 'whoosh_v')
            elif tr == 'zoom': add(t, 'zoom'); add(t + 0.05, 'impact', big=0.5, p=1.3)
            elif tr == 'flip': add(t, 'whoosh', p=1.2)
            elif tr == 'burst': add(t, 'riser'); add(t, 'impact', big=1.0); add(t + 0.02, 'shimmer')
            elif tr == 'dots': add(t - 0.45, 'zoom', p=0.8); add(t - 0.2, 'loader'); add(t + 0.32, 'impact', big=1.2)
            continue
        if ty == 'type':
            for k in range(e['n']):
                if rng.random() < 0.92: add(t + k / e['cps'] + rng.uniform(-.006, .006), 'key')
            continue
        nested = e.get('nested')
        if ty == 'flip' and not nested: add(t, 'card')
        elif ty == 'fly': add(t - 0.05, 'whoosh', p=0.8); add(t + 0.32, 'impact', big=0.6, p=1.2)
        elif ty == 'pop': add(t, 'pop')
        elif ty == 'spring': add(t, 'spring')
        elif ty in ('slam', 'stamp'): add(t + 0.2, 'slam')
        elif ty == 'whoosh': add(t + 0.1, 'whoosh', p=0.9)
        elif ty == 'up' and not nested: add(t, 'swish')
        elif ty == 'left': add(t, 'swish', p=1.2)
        elif ty == 'wipe' and nested: pass
        elif ty == 'grow': add(t, 'whoosh', p=1.6)
        elif ty == 'let': add(t, 'letter', f=float(2000 + 160 * (len([c for c in cues if c['c'] == 'letter']) % 12)))
    # scene-specific moments (match engine.js custom())
    for t, c, k in [(0.0, 'impact', {'big': 1.3}), (0.02, 'shimmer', {}), (4.9, 'glitch', {}), (93.2, 'toggle', {}),
                    # screen-recording moments: SUPER 'Humanize' click + progress, ZeroGPT 'Detect' click, result, gauge
                    (152.6, 'mouse', {}), (152.7, 'progress', {}), (210.6, 'mouse', {}), (210.7, 'scanner', {}),
                    (212.35, 'chime', {}), (213.9, 'pop', {}), (223.4, 'chime', {}), (337.75, 'mouse', {}),
                    (337.9, 'chime', {}), (338.3, 'bell', {}), (344.1, 'impact', {'big': 1.3}), (344.15, 'shimmer', {})]:
        add(t, c, **k)
    # selection-box wipes (gradient highlight boxes) get a UI click
    for e in events:
        if e['type'] == 'wipe' and not e.get('nested'): add(e['t'], 'ui_click')
    # de-clutter: same category closer than 70 ms -> keep first; letters: max one per 50 ms
    cues.sort(key=lambda c: c['t']); out = []; last = {}
    for c in cues:
        gap = 0.02 if c['c'] == 'key' else 0.05 if c['c'] == 'letter' else 0.07
        if c['t'] - last.get(c['c'], -9) >= gap: out.append(c); last[c['c']] = c['t']
    return out


def load_sample(path):
    import subprocess
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', str(path), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def render(cues, samples_dir=None):
    bus = np.zeros((int((DUR + 2) * SR), 2))
    cache = {}
    for c in cues:
        fn, gain, _ = CATS[c['c']]
        if samples_dir and (Path(samples_dir) / f"{c['c']}.wav").exists():
            if c['c'] not in cache: cache[c['c']] = norm(load_sample(Path(samples_dir) / f"{c['c']}.wav"), 0.9)
            x = cache[c['c']]
        else:
            x = fn(c)
        x = x * 10 ** (gain / 20)
        s = int(max(0, c['t'] + OFFSET.get(c['c'], 0)) * SR)
        e = min(len(bus), s + len(x)); bus[s:e] += x[:e - s]
    # light room reverb send
    n = int(0.9 * SR); ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR / 0.22)[:, None]
    ir[:, 0] = lp(ir[:, 0], 6000); ir[:, 1] = lp(ir[:, 1], 6000); ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([signal.fftconvolve(bus[:, k], ir[:, k])[:len(bus)] for k in range(2)], 1)
    bus = bus + wet * 0.18
    bus = np.tanh(bus * 1.1) / 1.1  # soft safety limiter
    return bus[:int(DUR * SR)]


def write_wav(path, x):
    x = np.clip(x, -1, 1); pcm = (x * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    ev = json.load(open(sys.argv[1])); out = Path(sys.argv[2])
    samples = sys.argv[sys.argv.index('--samples') + 1] if '--samples' in sys.argv else None
    cues = build_cues(ev)
    write_wav(out, render(cues, samples))
    sheet = {}
    for c in cues:
        s = sheet.setdefault(c['c'], {'prompt': dict(zip(('sound_source', 'sound_action', 'sound_material', 'sound_space'), CATS[c['c']][2])),
                                      'audio_type': 'sfx', 'file': f"{c['c']}.wav", 'times': []})
        s['times'].append(round(c['t'], 3))
    json.dump(sheet, open(out.with_name('cues.json'), 'w'), indent=1)
    print(len(cues), 'cues;', {k: len(v['times']) for k, v in sheet.items()})
