#!/usr/bin/env python3
"""
Original sci-fi background music in a Rick-and-Morty-ish mood, synthesised from
scratch (no samples, no existing melodies), so it is free of copyright claims.

Key D minor, 120 BPM, chords Dm - Bb - Gm - A. Theremin-style lead with glide
and vibrato, square-wave arpeggios, saw bass, detuned pad, drums, portal "zaps".
Structure (72s, loops cleanly): intro 4 bars, groove 8, lead 8, breakdown 4,
full 8, outro 4.

  python3 music.py        # -> music/rm_theme_full.mp3      (with lead melody)
                          #    music/rm_theme_bed.mp3       (no lead, quieter: sits under VO)
                          #    music/rm_sting.mp3           (3s portal sting for transitions)
"""
import os, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "music")
SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(42)

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR

def lp(x, cutoff):
    """One-pole low-pass (cutoff may be an array)."""
    a = np.exp(-2 * np.pi * np.asarray(cutoff, float) / SR) * np.ones(len(x))
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y

def lp_fast(x, cutoff, order=2):
    """Fixed-cutoff low-pass via FFT (fast)."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X /= (1 + (f / cutoff) ** (2 * order)) ** 0.5
    return np.fft.irfft(X, len(x))

def saw(f, t): return 2 * ((f * t) % 1.0) - 1
def sq(f, t, pw=0.5): return np.where((f * t) % 1.0 < pw, 1.0, -1.0)

CHORDS = [  # (bass root midi, chord tones for arps)
    (38, [62, 65, 69]),   # Dm
    (34, [58, 62, 65]),   # Bb
    (31, [55, 58, 62]),   # Gm
    (33, [57, 61, 64]),   # A
]
# original theremin melody: (beat, length in beats, midi) over 8 bars
MELODY = [(0, 1.5, 81), (1.5, .5, 77), (2, 1, 74), (3, 1, 76),
          (4, 2, 77), (6, 1, 74), (7, 1, 77),
          (8, 1.5, 79), (9.5, .5, 81), (10, 1, 82), (11, 1, 81),
          (12, 3, 76), (15, 1, 81),
          (16, 1.5, 86), (17.5, .5, 84), (18, 1, 81), (19, 1, 77),
          (20, 1.5, 82), (21.5, .5, 81), (22, 2, 77),
          (24, 1, 79), (25, 1, 82), (26, 1, 86), (27, 1, 84),
          (28, 2, 85), (30, 1, 81), (31, 1, 76)]

SECTIONS = [("intro", 4), ("groove", 8), ("lead", 8), ("break", 4), ("full", 8), ("outro", 4)]

class Track:
    def __init__(self, dur):
        self.n = int(dur * SR) + SR * 3
        self.L = np.zeros(self.n); self.R = np.zeros(self.n)
    def add(self, t0, sig, g=1.0, pan=0.0):
        s = int(t0 * SR); e = min(self.n, s + len(sig))
        if s >= self.n or e <= s: return
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.L[s:e] += sig[:e - s] * g * l * 1.414; self.R[s:e] += sig[:e - s] * g * r * 1.414

def kick():
    t = tt(0.45); f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + 0.3 * np.exp(-t * 200) * rng.normal(0, 1, len(t))

def snare():
    t = tt(0.25); n = lp_fast(rng.normal(0, 1, len(t)), 6000)
    return (0.8 * n * np.exp(-t * 18) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25))

def hat(open_=False):
    t = tt(0.25 if open_ else 0.06); n = rng.normal(0, 1, len(t))
    n = n - lp_fast(n, 7000)
    return n * np.exp(-t * (14 if open_ else 70))

def pluck(m, d=0.16):
    t = tt(d); f = mtof(m)
    x = sq(f, t, 0.3) * 0.6 + saw(f * 1.004, t) * 0.4
    return lp_fast(x * np.exp(-t * 16), 3200)

def bass_note(m, d):
    t = tt(d); f = mtof(m)
    x = saw(f, t) + 0.6 * sq(f * 0.5, t)
    env = np.minimum(1, t / 0.005) * np.exp(-t * 3)
    return lp(x * env, 300 + 1500 * np.exp(-t * 12)) * 0.9

def pad(chord, d):
    t = tt(d); x = np.zeros(len(t))
    for m in chord:
        for det in (-0.12, 0.0, 0.11):
            x += saw(mtof(m - 12) * 2 ** (det / 12), t + rng.random())
    env = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.5)
    return lp_fast(x * env / 9, 1400)

def zap(d=0.5, f0=2400, f1=180):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 7)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.sin(2 * np.pi * 37 * t) * np.exp(-t * 4) * np.minimum(1, t / 0.01)

def theremin(phrase_start, beats, notes):
    """Continuous-pitch lead with portamento, vibrato and soft attacks."""
    d = beats * BEAT; t = tt(d); fcur = np.zeros(len(t)); amp = np.zeros(len(t))
    for b, L, m in notes:
        s, e = int(b * BEAT * SR), min(len(t), int((b + L) * BEAT * SR))
        fcur[s:] = mtof(m)
        nt = np.arange(e - s) / SR; nd = (e - s) / SR
        amp[s:e] = np.maximum(amp[s:e], np.minimum(1, nt / 0.05) * np.minimum(1, (nd - nt) / 0.06))
    fglide = lp(fcur, 6.0)                                  # portamento
    vib = 1 + 0.007 * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / 0.4)
    ph = 2 * np.pi * np.cumsum(fglide * vib) / SR
    x = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    return x * lp(amp, 20.0)

def reverb(L, R, wet=0.25, decay=2.2):
    n = int(decay * SR); t = np.arange(n) / SR
    out = []
    for ch, seed in ((L, 1), (R, 2)):
        ir = np.random.default_rng(seed).normal(0, 1, n) * np.exp(-t * 6.9 / decay)
        ir = lp_fast(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
        m = len(ch) + n
        y = np.fft.irfft(np.fft.rfft(ch, m) * np.fft.rfft(ir, m), m)[:len(ch)]
        out.append(ch * (1 - wet) + y * wet * 1.6)
    return out

def build(with_lead=True):
    total_bars = sum(b for _, b in SECTIONS)
    dur = total_bars * BAR
    dry, verb = Track(dur), Track(dur)
    bar = 0
    for name, nb in SECTIONS:
        t_sec = bar * BAR
        if name in ("groove", "lead", "full", "break"):
            verb.add(t_sec, zap(), 0.25, pan=-0.6 if bar % 8 else 0.6)
        for k in range(nb):
            t0 = (bar + k) * BAR
            root, chord = CHORDS[(bar + k) % 4]
            # pad everywhere (quieter in the busy parts)
            verb.add(t0, pad(chord, BAR + 0.3), 0.55 if name in ("intro", "break", "outro") else 0.32)
            # arps: 16ths cycling chord tones
            if name != "outro" or k < 2:
                seq = [0, 1, 2, 1, 0, 1, 2, 3] * 2
                for s16 in range(16):
                    tones = chord + [chord[0] + 12]
                    g = 0.16 if name not in ("intro",) else 0.1 * (k + 1) / nb + 0.04
                    verb.add(t0 + s16 * BEAT / 4, pluck(tones[seq[s16]]), g, pan=0.45 if s16 % 2 else -0.45)
            if name in ("groove", "lead", "full"):
                # drums
                for b in range(4):
                    if b in (0, 2): dry.add(t0 + b * BEAT, kick(), 0.85)
                    if b in (1, 3): verb.add(t0 + b * BEAT, snare(), 0.45)
                    dry.add(t0 + b * BEAT, hat(), 0.18, pan=0.3)
                    dry.add(t0 + (b + 0.5) * BEAT, hat(open_=(b == 3)), 0.22 if b == 3 else 0.14, pan=0.3)
                dry.add(t0 + 3.5 * BEAT, kick(), 0.45)
                # bass: syncopated 16ths
                for s16, oct_, ln in [(0, 0, 3), (3, 0, 2), (6, 12, 2), (8, 0, 2), (10, 7, 1), (11, 0, 2), (14, 12, 2)]:
                    dry.add(t0 + s16 * BEAT / 4, bass_note(root + oct_, ln * BEAT / 4 + 0.05), 0.55)
            elif name == "break":
                dry.add(t0, bass_note(root, BAR), 0.4)
        # theremin lead
        if with_lead and name in ("lead", "full"):
            for ph in range(nb // 8):
                verb.add(t_sec + ph * 8 * BAR, theremin(t_sec, 32, MELODY), 0.30, pan=0.1)
        if with_lead and name == "break":
            verb.add(t_sec, theremin(t_sec, 16, [(b, L, m - 12 if m > 84 else m) for b, L, m in MELODY if b < 16]), 0.24)
        bar += nb
    L, R = reverb(verb.L, verb.R)
    L += dry.L; R += dry.R
    n = int(dur * SR)
    # loop-friendly: fold the reverb tail back onto the start
    tail = int(2.5 * SR)
    L[:tail] += L[n:n + tail] * np.linspace(1, 0, tail); R[:tail] += R[n:n + tail] * np.linspace(1, 0, tail)
    L, R = L[:n], R[:n]
    m = np.stack([L, R], 1)
    m = np.tanh(m / (np.abs(m).max() + 1e-9) * 1.6) * 0.9
    return m

def sting():
    d = 3.2; tr = Track(d)
    tr.add(0, zap(0.7, 3000, 120), 0.6, pan=-0.3)
    tr.add(0.05, zap(0.6, 1500, 300), 0.4, pan=0.4)
    for m in (62, 65, 69, 76):
        t = tt(2.6); f = mtof(m)
        x = (saw(f, t) + saw(f * 1.006, t)) * np.exp(-t * 1.6) * np.minimum(1, t / 0.01)
        tr.add(0.12, lp_fast(x, 2500), 0.18)
    t = tt(0.6); tr.add(0.12, np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t * 20)) / SR) * np.exp(-t * 5), 0.8)
    L, R = reverb(tr.L, tr.R, 0.4, 2.5)
    m = np.stack([L, R], 1)[: int(d * SR)]
    return np.tanh(m / (np.abs(m).max() + 1e-9) * 1.4) * 0.9

def save(m, path, lufs):
    wav_path = path.replace(".mp3", ".wav")
    with wave.open(wav_path, "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(m, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11",
                    "-ar", str(SR), "-c:a", "libmp3lame", "-b:a", "320k", path], check=True)
    os.remove(wav_path)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    save(build(True), os.path.join(OUT, "rm_theme_full.mp3"), -16)
    save(build(False), os.path.join(OUT, "rm_theme_bed.mp3"), -24)
    save(sting(), os.path.join(OUT, "rm_sting.mp3"), -14)
    print("wrote", sorted(os.listdir(OUT)))
