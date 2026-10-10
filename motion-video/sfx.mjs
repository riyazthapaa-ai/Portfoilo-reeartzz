// Synthesizes a WAV sound-design bed from cues.json (written by render.mjs).
// Usage: node sfx.mjs [out.wav]
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || path.join(dir, 'out', 'sfx.wav');
const cues = JSON.parse(readFileSync(path.join(dir, 'cues.json'), 'utf8'));
const SR = 44100, DUR = 57.5, N = Math.ceil(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;

function add(t0, len, fn, pan = 0) {
  const s0 = Math.floor(t0 * SR), n = Math.floor(len * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && s0 + i < N; i++) { if (s0 + i < 0) continue; const v = fn(i / SR, i); L[s0 + i] += v * gl; R[s0 + i] += v * gr; }
}
// state-variable filter factory
function svf() { let lp = 0, bp = 0; return (x, fc, q = .7) => { const f = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR); const hp = x - lp - bp / q; bp += f * hp; lp += f * bp; return { lp, bp, hp }; }; }

const SFX = {
  whoosh(t) { const F = svf(), d = .75; add(t, d, (x) => { const u = x / d; const env = Math.sin(Math.PI * u) ** 2; return F(rnd(), 300 + 3200 * Math.sin(Math.PI * u) ** 1.5, 1.4).bp * env * .55; }, rnd() * .4); },
  shimmer(t) { add(t, 1.6, (x) => { let v = 0; for (const f of [1760, 2217, 2637, 3520]) v += Math.sin(2 * Math.PI * f * x * (1 + x * .02)); return v * .025 * Math.exp(-x * 2.2) * Math.min(1, x * 30); }); SFX.whoosh(t - .1); },
  tick(t) { add(t, .08, (x) => Math.sin(2 * Math.PI * 1500 * x) * Math.exp(-x * 60) * .12, rnd() * .5); },
  tick2(t) { add(t, .5, (x) => (Math.sin(2 * Math.PI * 880 * x) + .5 * Math.sin(2 * Math.PI * 1320 * x)) * Math.exp(-x * 9) * .13); },
  pop(t) { add(t, .15, (x) => Math.sin(2 * Math.PI * (300 + 700 * Math.exp(-x * 40)) * x) * Math.exp(-x * 28) * .32, rnd() * .6); },
  ding(t) { add(t, .9, (x) => (Math.sin(2 * Math.PI * 1318 * x) + .6 * Math.sin(2 * Math.PI * 1975 * x)) * Math.exp(-x * 6) * .1 * Math.min(1, x * 200), rnd() * .3); },
  key(t) { const F = svf(); const g = .05 + Math.abs(rnd()) * .05; add(t + rnd() * .01, .03, (x) => F(rnd(), 4000).hp * Math.exp(-x * 220) * g, rnd() * .3); },
  error(t) { add(t, .35, (x) => (Math.sin(2 * Math.PI * 220 * x) + Math.sin(2 * Math.PI * 233 * x)) * .08 * (x < .12 || (x > .18 && x < .3) ? 1 : 0) * Math.exp(-x * 4)); },
  swipe(t) { const F = svf(); add(t, .4, (x) => F(rnd(), 1500 + 5000 * x / .4, 2).bp * Math.sin(Math.PI * x / .4) * .4); },
  flip(t) { const F = svf(); add(t, .12, (x) => F(rnd(), 2500).bp * Math.exp(-x * 40) * .5); add(t + .2, .12, (x) => F(rnd(), 2000).bp * Math.exp(-x * 40) * .4); },
  thud(t) { const F = svf(); add(t, .7, (x) => Math.sin(2 * Math.PI * (45 + 90 * Math.exp(-x * 12)) * x) * Math.exp(-x * 6) * .9 + F(rnd(), 900).lp * Math.exp(-x * 25) * .6); },
};
for (const [t, type] of cues) SFX[type]?.(t);

// ambient pad: slow chord progression, filtered, gently swelling
const chords = [[174.6, 220, 261.6, 329.6], [220, 261.6, 329.6, 392], [146.8, 220, 261.6, 349.2], [196, 246.9, 293.7, 392]]; // Fmaj7 Am7 Dm7 G
const padF = [svf(), svf()];
for (let i = 0; i < N; i++) {
  const t = i / SR, ci = Math.floor(t / 7.2) % 4, cf = (t % 7.2) / 7.2;
  const prev = chords[(ci + 3) % 4], cur = chords[ci], xf = Math.min(1, cf * 4);
  let v = 0;
  for (let k = 0; k < 4; k++) {
    const det = 1 + .003 * Math.sin(t * .7 + k);
    v += (1 - xf) * (Math.sin(2 * Math.PI * prev[k] * t * det) + .3 * Math.sin(4 * Math.PI * prev[k] * t)) + xf * (Math.sin(2 * Math.PI * cur[k] * t * det) + .3 * Math.sin(4 * Math.PI * cur[k] * t));
  }
  v += .6 * Math.sin(2 * Math.PI * cur[0] / 2 * t) * xf + .6 * Math.sin(2 * Math.PI * prev[0] / 2 * t) * (1 - xf);
  const env = Math.min(1, t / 2.5) * Math.min(1, (DUR - .5 - t) / 2) * (.8 + .2 * Math.sin(t * .9));
  const g = .028 * Math.max(0, env);
  L[i] += padF[0](v, 1200 + 500 * Math.sin(t * .3)).lp * g; R[i] += padF[1](v, 1200 + 500 * Math.cos(t * .27)).lp * g;
}

// soft limit + write 16-bit stereo WAV
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.tanh(L[i] * 1.2) * 32000), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * 1.2) * 32000), 46 + i * 4); }
writeFileSync(out, buf);
console.log('wrote', out);
