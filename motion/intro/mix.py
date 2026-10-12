"""Synthesises subtle UI sound effects from sfx-cues.json and mixes them under the voiceover.

    python3 mix.py   (needs voice.wav + sfx-cues.json)  ->  intro-mix.m4a
All sounds are generated here (no sample packs), so the mix is fully reproducible.
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
DIR = Path(__file__).resolve().parent
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def onepole_lp(x, cutoff):
    """Lowpass with a per-sample cutoff (Hz) so filter sweeps are possible."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def bandnoise(dur, lo, hi):
    n = rng.standard_normal(int(dur * SR))
    return onepole_lp(n, hi) - onepole_lp(n, lo)


def sweep(f0, f1, dur, curve=2.0):
    t = t_axis(dur)
    f = f1 + (f0 - f1) * np.power(1 - t / dur, curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def fade(x, a=0.002, r=0.01):
    n = len(x)
    ai, ri = max(1, int(a * SR)), max(1, int(r * SR))
    env = np.ones(n)
    env[:ai] = np.linspace(0, 1, ai)
    env[-ri:] *= np.linspace(1, 0, ri)
    return x * env


def pop():
    d = 0.11
    t = t_axis(d)
    body = sweep(950, 260, d, 3) * np.exp(-t / 0.035)
    click = bandnoise(d, 2000, 7000) * np.exp(-t / 0.004) * 0.6
    return fade(body * 0.8 + click), 0.0


def tick():
    d = 0.05
    t = t_axis(d)
    return fade(np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.008) * 0.5 + bandnoise(d, 3000, 9000) * np.exp(-t / 0.003) * 0.5), 0.0


def key():
    d = 0.04
    t = t_axis(d)
    f = 1500 + rng.uniform(-250, 250)
    return fade(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) * 0.35 + bandnoise(d, 1500, 6000) * np.exp(-t / 0.004) * 0.9), 0.0


def whoosh(d=0.6):
    t = t_axis(d)
    bell = np.sin(np.pi * t / d) ** 2
    n = rng.standard_normal(len(t))
    cut = 250 + 2600 * bell
    x = onepole_lp(n, cut) - onepole_lp(n, 120)
    return fade(x * bell * 1.6, 0.01, 0.05), d * 0.55  # peak lands on the cue


def swoosh():
    x, _ = whoosh(0.38)
    return x, 0.2


def swipe():
    d = 0.22
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    cut = 1200 + 5000 * (t / d)
    env = np.sin(np.pi * t / d) ** 1.5
    return fade((onepole_lp(n, cut) - onepole_lp(n, 900)) * env * 1.8), 0.04


def scratch():
    d = 0.2
    t = t_axis(d)
    body = sweep(700, 140, d, 1.5) * np.exp(-t / 0.08)
    grit = bandnoise(d, 400, 2500) * np.exp(-t / 0.06)
    return fade(body * 0.5 + grit * 0.9), 0.0


def impact():
    d = 0.9
    t = t_axis(d)
    boom = sweep(95, 42, d, 2) * np.exp(-t / 0.22)
    thump = bandnoise(d, 40, 900) * np.exp(-t / 0.03) * 1.6
    tail = bandnoise(d, 200, 3000) * np.exp(-t / 0.18) * 0.12
    return fade(boom * 1.1 + thump + tail), 0.0


def blip():
    d = 0.16
    t = t_axis(d)
    a = np.sin(2 * np.pi * 660 * t) * (t < 0.07)
    b = np.sin(2 * np.pi * 990 * t) * (t >= 0.06)
    return fade((a + b) * np.exp(-((t % 0.07) / 0.03)) * 0.45), 0.0


def check():
    d = 0.2
    t = t_axis(d)
    a = np.sin(2 * np.pi * 1046 * t) * (t < 0.06) * np.exp(-t / 0.03)
    b = np.sin(2 * np.pi * 1568 * t) * (t >= 0.06) * np.exp(-(t - 0.06).clip(0) / 0.05)
    return fade((a + b) * 0.4), 0.0


def ding():
    d = 1.4
    t = t_axis(d)
    x = sum(g * np.sin(2 * np.pi * f * t) for f, g in [(1318.5, 1), (2637, 0.28), (3955, 0.08), (659, 0.2)])
    return fade(x * np.exp(-t / 0.35) * 0.35), 0.0


def riser():
    d = 0.67
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    k = t / d
    x = onepole_lp(n, 200 + 6500 * k ** 2) - onepole_lp(n, 150)
    tone = sweep(220, 880, d, 0.5) * 0.15
    return fade((x + tone) * k ** 2.2 * 1.3, 0.01, 0.01), 0.0


SYNTHS = dict(pop=pop, tick=tick, key=key, whoosh=whoosh, swoosh=swoosh, swipe=swipe, scratch=scratch,
              impact=impact, blip=blip, check=check, ding=ding, riser=riser)
# per-type level (linear) – everything sits well under the voice
LEVEL = dict(pop=0.16, tick=0.09, key=0.07, whoosh=0.2, swoosh=0.16, swipe=0.11, scratch=0.14,
             impact=0.42, blip=0.12, check=0.12, ding=0.1, riser=0.18)
# stereo placement: -1 left .. 1 right
PAN = dict(whoosh=None, swoosh=None)


def main():
    with wave.open(str(DIR / 'voice.wav')) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        voice = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    voice = voice / np.abs(voice).max() * 0.89
    n = len(voice)
    sfx = np.zeros((n, 2))
    cues = json.loads((DIR / 'sfx-cues.json').read_text())
    for c in cues:
        x, pre = SYNTHS[c['type']]()
        x = x * LEVEL[c['type']] * c.get('gain', 1)
        start = int((c['t'] - pre) * SR)
        if start < 0:
            x, start = x[-start:], 0
        end = min(n, start + len(x))
        x = x[: end - start]
        if c['type'] in PAN:  # whooshes travel left -> right
            p = np.linspace(-0.6, 0.6, len(x))
        else:
            p = np.full(len(x), rng.uniform(-0.25, 0.25))
        sfx[start:end, 0] += x * np.sqrt((1 - p) / 2) * np.sqrt(2)
        sfx[start:end, 1] += x * np.sqrt((1 + p) / 2) * np.sqrt(2)

    # gentle ducking: pull SFX down a little while the voice is loud
    win = int(0.05 * SR)
    venv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, 'same'))
    duck = 1 - 0.35 * np.clip(venv / (venv.max() * 0.5), 0, 1)
    sfx *= duck[:, None]

    mix = np.stack([voice, voice], axis=1) + sfx
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    pcm = (mix * 32767).astype(np.int16)
    tmp = DIR / 'mix-tmp.wav'
    with wave.open(str(tmp), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-c:a', 'aac', '-b:a', '256k', str(DIR / 'intro-mix.m4a')], check=True)
    tmp.unlink()
    print('cues:', len(cues), 'sfx peak:', round(float(np.abs(sfx).max()), 3))


if __name__ == '__main__':
    main()
