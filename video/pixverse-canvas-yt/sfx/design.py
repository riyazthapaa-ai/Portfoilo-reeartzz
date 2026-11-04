"""Synthesise a slow cinematic ambient bed + SFX for the 16.8s headphones ad.

Shots: hero turn 0-4.4 | pedestal 4.4-8.2 | close-up glide 8.2-12.63 | final wide 12.63-16.81
Writes ambient.wav, sfx.wav (48 kHz stereo float) into the output dir.
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve


SR = 48000
DUR = 16.81
N = int(SR * DUR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR


def bp(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=4):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=4):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def env_adsr(n, a, r, curve=2.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def place(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < 0:
        sig, i = sig[-i:], 0
    buf[i:j] += sig[: j - i]


def stereo(mono, width=0.0, delay_ms=0.0):
    d = int(delay_ms * SR / 1000)
    l = mono.copy()
    r = np.concatenate([np.zeros(d), mono[: len(mono) - d]]) if d else mono.copy()
    return np.stack([l * (1 - width / 2), r * (1 + width / 2)], 1)


def reverb_ir(seconds=3.5, damp=6000):
    n = int(seconds * SR)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.linspace(0, 7, n))[:, None]
    ir = np.stack([lp(ir[:, 0], damp), lp(ir[:, 1], damp)], 1)
    return ir / np.abs(ir).max()


IR = reverb_ir()


def verb(st, wet=0.35):
    out = np.stack([fftconvolve(st[:, c], IR[:, c])[: len(st)] for c in range(2)], 1)
    out /= np.abs(out).max() + 1e-9
    dry = st / (np.abs(st).max() + 1e-9)
    return dry * (1 - wet) + out * wet


# ---------------------------------------------------------------- ambient bed
def ambient():
    # slow drone pad: D minor add9, detuned saw-ish partials, gently filtered
    notes = [73.42, 110.0, 146.83, 174.61, 220.0, 329.63]
    pad = np.zeros(N)
    for k, f in enumerate(notes):
        for det in (-0.12, 0.0, 0.13):
            ff = f * (2 ** (det / 12))
            ph = rng.uniform(0, 2 * np.pi)
            vib = 0.0015 * np.sin(2 * np.pi * 0.11 * t + k)
            for h in range(1, 6):
                pad += np.sin(2 * np.pi * ff * h * t * (1 + vib) + ph * h) / (h ** 1.6) / (1 + k * 0.35)
    # slowly breathing low-pass for movement
    pad = lp(pad, 900) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t - 1.2))
    pad *= env_adsr(N, 2.5, 2.0, curve=1.5)
    # air / room tone: brown-ish noise, band-limited, slow swell
    noise = np.cumsum(rng.standard_normal(N))
    noise = hp(noise - np.convolve(noise, np.ones(4800) / 4800, mode='same'), 60)
    air = bp(rng.standard_normal(N), 2500, 9000, 2) * 0.12
    room = lp(noise, 400) / (np.abs(lp(noise, 400)).max() + 1e-9) + air
    room *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * t)) * env_adsr(N, 1.5, 2.0)
    pad /= np.abs(pad).max()
    room /= np.abs(room).max()
    st = stereo(pad, 0.15, 11) + stereo(room * 0.35, 0.3, 17)
    return verb(st, 0.45)


# ---------------------------------------------------------------- sfx library
def boom(length=3.2, f0=62, f1=28, gain=1.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 3.5)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.4)
    thump = lp(rng.standard_normal(n), 180) * np.exp(-tt * 18) * 2.5
    crack = hp(rng.standard_normal(n), 2500) * np.exp(-tt * 40) * 0.25
    s = sub + thump + crack
    s[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return s / np.abs(s).max() * gain


def whoosh(length=1.2, lo=300, hi=5000, rise=True, gain=1.0):
    """Filtered-noise sweep; band centre moves up (rise) or down."""
    n = int(length * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 1024
    for i in range(0, n, seg):
        p = i / n
        c = lo * (hi / lo) ** (p if rise else 1 - p)
        out[i : i + seg] = bp(noise[max(0, i - 4096) : i + seg], c * 0.7, min(c * 1.4, SR / 2 - 100), 2)[-min(seg, n - i):]
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 if not rise else np.linspace(0, 1, n) ** 3.2
    out = lp(out * shape, 6500)
    return out / (np.abs(out).max() + 1e-9) * gain


def reverse_swell(length=1.4, gain=1.0):
    """Reverse cymbal / reversed shimmer into a cut."""
    n = int(length * SR)
    tt = np.arange(n) / SR
    metal = np.zeros(n)
    for f in (2093, 2637, 3136, 4186, 5274, 6271):
        metal += np.sin(2 * np.pi * f * tt * (1 + 0.002 * rng.standard_normal()))
    metal = metal * 0.25 + bp(rng.standard_normal(n), 3000, 8000, 2) * 0.6
    metal = lp(metal, 7500)
    metal *= np.exp(-tt * 3.0)
    s = metal[::-1]
    return s / np.abs(s).max() * gain


def shimmer(length=2.5, base=1318.5, gain=1.0):
    """Soft glint: bell partials with slow decay (light catching metal)."""
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for mult, amp in ((1, 1), (2.76, 0.5), (5.4, 0.3), (8.93, 0.15)):
        s += amp * np.sin(2 * np.pi * base * mult * tt) * np.exp(-tt * (1.5 + mult * 0.4))
    s *= env_adsr(n, 0.01, 0.4)
    return s / np.abs(s).max() * gain


def click(gain=1.0):
    """Precise mechanical tick — the headband slider detail."""
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    s = hp(rng.standard_normal(n), 3000) * np.exp(-tt * 180) + 0.6 * np.sin(2 * np.pi * 3400 * tt) * np.exp(-tt * 90)
    return s / np.abs(s).max() * gain


def sfx():
    mono_l = np.zeros(N)
    mono_r = np.zeros(N)

    def put(sig, at, pan=0.0, g=1.0):
        place(mono_l, sig * g * (1 - max(0, pan)), at)
        place(mono_r, sig * g * (1 + min(0, pan)), at)

    # 0.0 opening: soft sub hit + air whoosh as the hero shot fades up
    put(boom(3.5, 55, 27, 0.8), 0.02)
    put(whoosh(2.6, 200, 2400, rise=False, gain=0.35), 0.0, -0.2)
    # 0.6-4.0 hero turn: slow rotational air pass (L -> R) and a glint
    put(whoosh(3.2, 400, 1800, rise=False, gain=0.22), 0.7, 0.3)
    put(shimmer(2.8, 1318.5, 0.18), 1.6, -0.3)

    # 4.4 cut to pedestal: riser into a hit
    put(reverse_swell(1.3, 0.22), 4.4 - 1.3)
    put(whoosh(1.0, 250, 3500, rise=True, gain=0.22), 4.4 - 1.0)
    put(boom(2.8, 70, 32, 0.9), 4.4)
    put(shimmer(2.4, 987.8, 0.22), 4.45, 0.2)

    # 8.2 cut to close-up: intimate, no boom — swish + mechanical tick
    put(reverse_swell(1.0, 0.15), 8.2 - 1.0)
    put(whoosh(0.9, 400, 3500, rise=False, gain=0.3), 8.15, -0.4)
    put(click(0.35), 8.32, 0.3)
    # 8.6-12.4 the camera glides along the headband: long slow pass-by + glint
    put(whoosh(3.6, 250, 1500, rise=False, gain=0.2), 8.7, 0.4)
    put(shimmer(2.6, 1567.98, 0.16), 10.2, 0.4)
    put(click(0.22), 11.15, -0.2)

    # 12.63 final wide: biggest hit, swell before it, long tail
    put(reverse_swell(1.6, 0.28), 12.63 - 1.6)
    put(whoosh(1.4, 200, 4000, rise=True, gain=0.25), 12.63 - 1.4)
    put(boom(4.2, 80, 26, 1.0), 12.63)
    put(shimmer(3.8, 659.25, 0.28), 12.68)
    put(shimmer(3.5, 1318.5, 0.14), 12.75, 0.3)

    st = np.stack([mono_l, mono_r], 1)
    return verb(st, 0.25)


def write(path, st):
    st = st / (np.abs(st).max() + 1e-9) * 0.89
    try:
        import soundfile
        soundfile.write(path, st.astype(np.float32), SR, subtype='FLOAT')
    except Exception:
        from scipy.io import wavfile
        wavfile.write(path, SR, st.astype(np.float32))


if __name__ == '__main__':
    out = sys.argv[1]
    write(f'{out}/ambient.wav', ambient())
    write(f'{out}/sfx.wav', sfx())
    print('ok')
