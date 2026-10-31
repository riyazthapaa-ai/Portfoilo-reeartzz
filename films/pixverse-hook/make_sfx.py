# make_sfx.py: a small synthesized sound kit for mix.py (no Scenario MCP in this build).
# Writes audio/sfx/<name>.wav for the core cue names; deterministic (fixed seeds).
import os, wave, numpy as np
SR = 48000
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audio', 'sfx'); os.makedirs(D, exist_ok=True)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR

def lp(x, a):   # one-pole low-pass, a may vary per sample
    y = np.empty_like(x); s = 0.; a = np.broadcast_to(a, x.shape)
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def env(t, att, dec): return np.minimum(t / att, 1) * np.exp(-np.maximum(t - att, 0) / dec)
def save(name, x):
    x = x / (np.abs(x).max() or 1) * .9
    with wave.open(os.path.join(D, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())

def whoosh(d, lo, hi, seed):
    t = t_(d); n = np.random.default_rng(seed).standard_normal(len(t)); u = t / d
    sweep = lo + (hi - lo) * np.sin(np.pi * u) ** 2
    bright = lp(n, sweep) - lp(n, sweep * .25)
    return bright * np.sin(np.pi * u) ** 1.5
def thump(d, f0, f1, dec, noise=.3, seed=1):
    t = t_(d); ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 30)) / SR
    body = np.sin(ph) * env(t, .002, dec)
    click = lp(np.random.default_rng(seed).standard_normal(len(t)), .5) * env(t, .0005, .012)
    return body + noise * click

save('whoosh', whoosh(.35, .03, .35, 1))
save('whoosh_big', whoosh(.6, .02, .3, 2) + .4 * whoosh(.6, .01, .08, 3))
save('slash', whoosh(.18, .1, .6, 4))
save('impact', thump(.5, 160, 48, .16, .5, 5))
save('impact_big', thump(1.1, 140, 38, .38, .6, 6) + .3 * lp(rng.standard_normal(int(1.1 * SR)), .06) * env(t_(1.1), .003, .3))
save('hit', thump(.4, 220, 60, .11, .7, 7))
save('logo_hit', thump(1.6, 120, 36, .55, .5, 8) + .25 * np.sin(2 * np.pi * 880 * t_(1.6)) * env(t_(1.6), .003, .5))
for i in range(1, 5):   # key clicks, four variants
    t = t_(.05); save(f'key_{i}', lp(np.random.default_rng(20 + i).standard_normal(len(t)), .55 + .08 * i) * env(t, .0004, .006))
t = t_(.04); save('tick', np.sin(2 * np.pi * 3200 * t) * env(t, .0003, .006))
t = t_(.09); save('pop', np.sin(2 * np.pi * (900 - 4000 * t) * t) * env(t, .001, .02))
t = t_(.12); save('thock', np.sin(2 * np.pi * 300 * t) * env(t, .001, .03))
t = t_(.5); save('sparkle', sum(np.sin(2 * np.pi * f * t) * env(t - d, .001, .08) * (t > d) for f, d in [(2637, 0), (3136, .06), (3951, .12), (5274, .18)]))
t = t_(.25); save('glitch', np.sign(np.sin(2 * np.pi * 70 * t)) * (np.random.default_rng(30).random(len(t)) > .5) * env(t, .001, .1))
t = t_(1.2); save('riser', lp(np.random.default_rng(31).standard_normal(len(t)), .02 + .4 * (t / 1.2) ** 2) * (t / 1.2) ** 2)
t = t_(.6); save('power_down', np.sin(2 * np.pi * np.cumsum(400 * np.exp(-t * 5)) / SR) * env(t, .002, .25))
t = t_(.4); save('draw', whoosh(.4, .05, .15, 32))
print('kit ->', D, sorted(os.listdir(D)))
