// Boreal hook — deterministic canvas animation. renderFrame(t) draws the frame at time t (seconds).
const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

const C = {
  bg: '#07080c', ink: '#f4f2ea', dim: '#7d8090', red: '#ff3b2b', redDeep: '#1a0406',
  lime: '#d6ff3c', teal: '#2ff3c6', green: '#72ff94', violet: '#9b72ff', pink: '#ff5ad1', gold: '#ffc83d',
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const P = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eb = x => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const ex = x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- primitives ----------
function T(str, x, y, o = {}) {
  const { size = 100, font = 'Anton', weight = '', color = C.ink, align = 'center', base = 'middle',
    alpha = 1, scale = 1, sx = 1, rot = 0, ls = 0, stroke = null, lw = 4, glow = null, blur = 30, skew = 0 } = o;
  if (alpha <= 0.001 || scale <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.translate(x, y); ctx.rotate(rot);
  if (skew) ctx.transform(1, 0, skew, 1, 0, 0);
  ctx.scale(scale * sx, scale);
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align; ctx.textBaseline = base; ctx.letterSpacing = ls + 'px';
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = blur; }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, 0, 0); }
  if (color) { ctx.fillStyle = color; ctx.fillText(str, 0, 0); }
  ctx.restore();
}
function measure(str, size, font = 'Anton', weight = '', ls = 0) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.letterSpacing = ls + 'px';
  return ctx.measureText(str).width;
}
// a line of words that pop in at their spoken timestamps: ws = [[text, time, color?], ...]
function words(ws, t, x, y, o = {}) {
  const size = o.size || 120, font = o.font || 'Anton', gap = o.gap ?? size * 0.24;
  const wd = ws.map(w => measure(w[0], size, font, o.weight || '', o.ls || 0));
  const total = wd.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let cx = o.align === 'left' ? x : x - total / 2;
  ws.forEach((w, i) => {
    const k = P(t, w[1], w[1] + 0.26);
    if (k > 0) {
      const s = o.noPop ? 1 : lerp(1.55, 1, eo(k));
      T(w[0], cx + wd[i] / 2, y + (1 - eo(k)) * 18, { ...o, align: 'center', size, font, color: w[2] || o.color || C.ink, scale: s, alpha: k * 3 * (o.alpha ?? 1) });
    }
    cx += wd[i] + gap;
  });
  return total;
}
function rr(x, y, w, h, r, fill, stroke, lw = 3) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function withA(a, fn) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); }
function at(x, y, s, fn, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); fn(); ctx.restore(); }

const HUES = [[255, 92, 60], [255, 190, 60], [60, 220, 255], [170, 110, 255], [255, 80, 180], [80, 255, 160], [255, 255, 255]];
function hue(i, a = 1) { const c = HUES[Math.floor(i) % HUES.length]; return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

// faux "video" thumbnail
function vid(x, y, w, h, seed, t, o = {}) {
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, o.r ?? 14); ctx.clip();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, hue(seed * 7, 0.95)); g.addColorStop(1, hue(seed * 7 + 3, 0.95));
  ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = o.sat ?? 0.85; ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  const lx = x + w * (0.5 + 0.35 * Math.sin(t * 1.7 + seed * 3)), ly = y + h * (0.45 + 0.25 * Math.cos(t * 1.3 + seed));
  const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * 0.6);
  rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rg; ctx.fillRect(x, y, w, h);
  // horizon / subject
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
  if (o.play !== false) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; const s = Math.min(w, h) * 0.12;
    ctx.beginPath(); ctx.moveTo(x + w / 2 - s * 0.6, y + h / 2 - s); ctx.lineTo(x + w / 2 + s, y + h / 2); ctx.lineTo(x + w / 2 - s * 0.6, y + h / 2 + s); ctx.fill();
  }
  ctx.restore();
}

// product bottle
function bottle(x, y, s, t, col = C.teal, sweep = true) {
  at(x, y, s, () => {
    const g = ctx.createLinearGradient(-60, 0, 60, 0);
    g.addColorStop(0, '#0d1418'); g.addColorStop(0.5, col); g.addColorStop(1, '#0d1418');
    rr(-60, -70, 120, 190, 26, g);
    rr(-24, -112, 48, 44, 8, '#e9e6dc');
    rr(-34, -150, 68, 42, 10, '#1b1b1f');
    rr(-42, -10, 84, 70, 6, 'rgba(255,255,255,0.88)');
    T('BOREAL', 0, 12, { size: 18, font: 'JB', weight: 700, color: '#111', ls: 3 });
    T('serum', 0, 38, { size: 14, font: 'JB', color: '#333' });
    if (sweep) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(-60, -70, 120, 190, 26); ctx.clip();
      const sx = -120 + ((t * 120) % 360);
      const sg = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.fillRect(-60, -70, 120, 190); ctx.restore();
    }
  });
}

// ---------- background layers ----------
function bg(col) { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
function dotGrid(t, col = 'rgba(255,255,255,0.07)', sp = 60, drift = 12) {
  ctx.fillStyle = col;
  const ox = (t * drift) % sp, oy = (t * drift * 0.5) % sp;
  for (let x = -sp + ox; x < W + sp; x += sp) for (let y = -sp + oy; y < H + sp; y += sp) ctx.fillRect(x, y, 3, 3);
}

// aurora: drawn on a small offscreen canvas and scaled up (cheap + naturally soft)
const AU = document.createElement('canvas'); AU.width = 480; AU.height = 270; const ax = AU.getContext('2d');
const RIBBONS = [
  { c: [47, 243, 198], base: 150, amp: 34, f: 0.012, s: 0.55, h: 120, p: 0 },
  { c: [114, 255, 148], base: 175, amp: 26, f: 0.018, s: -0.4, h: 90, p: 2 },
  { c: [155, 114, 255], base: 120, amp: 40, f: 0.009, s: 0.3, h: 110, p: 4 },
  { c: [255, 90, 209], base: 95, amp: 22, f: 0.015, s: -0.25, h: 70, p: 1 },
];
function aurora(t, alpha = 1, lift = 0) {
  ax.globalCompositeOperation = 'source-over';
  ax.clearRect(0, 0, 480, 270);
  ax.globalCompositeOperation = 'lighter';
  for (const r of RIBBONS) {
    const g = ax.createLinearGradient(0, -r.h, 0, 6);
    g.addColorStop(0, `rgba(${r.c},0)`); g.addColorStop(0.75, `rgba(${r.c},0.28)`); g.addColorStop(0.97, `rgba(${r.c},0.85)`); g.addColorStop(1, `rgba(${r.c},0)`);
    ax.fillStyle = g;
    for (let x = 0; x < 480; x += 3) {
      const y = r.base - lift + Math.sin(x * r.f + t * r.s + r.p) * r.amp + Math.sin(x * r.f * 2.7 - t * r.s * 1.6) * r.amp * 0.35;
      const hh = 0.6 + 0.4 * Math.sin(x * 0.05 + t * 2 + r.p);
      ax.save(); ax.translate(x, y); ax.scale(1, hh); ax.fillRect(0, -r.h, 3.4, r.h + 6); ax.restore();
    }
  }
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'lighter';
  ctx.filter = 'blur(6px)'; ctx.drawImage(AU, 0, 0, W, H); ctx.filter = 'none';
  ctx.restore();
}
function auroraGrad(x0, x1, t) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  const o = (t * 0.25) % 1;
  const stops = [C.teal, C.green, C.violet, C.pink, C.teal];
  stops.forEach((c, i) => g.addColorStop(clamp((i / 4 + o) % 1.0001), c));
  // keep gradient monotonic-ish by also pinning the ends
  return g;
}
function auroraFill(x0, x1, t) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  const s = Math.sin(t * 0.9) * 0.15;
  g.addColorStop(0, C.teal); g.addColorStop(clamp(0.35 + s), C.green); g.addColorStop(clamp(0.7 - s), C.violet); g.addColorStop(1, C.pink);
  return g;
}

function stars(t, n = 120, a = 1) {
  for (let i = 0; i < n; i++) {
    const x = rnd(i) * W, y = rnd(i + 99) * H * 0.75, tw = 0.4 + 0.6 * Math.sin(t * (1 + rnd(i + 7) * 3) + i);
    ctx.fillStyle = `rgba(255,255,255,${0.5 * tw * a})`; ctx.fillRect(x, y, 2, 2);
  }
}

// grain + vignette (precomputed)
const GRAIN = [0, 1, 2].map(k => {
  const c = document.createElement('canvas'); c.width = 960; c.height = 540; const g = c.getContext('2d');
  const id = g.createImageData(960, 540);
  let s = 1234 + k * 999;
  for (let i = 0; i < id.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s / 2147483647) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
});
const VIG = (() => {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const rg = g.createRadialGradient(CX, CY, H * 0.35, CX, CY, H * 1.05);
  rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.75)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H); return c;
})();
const BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; const bx = BUF.getContext('2d');

// ---------- timeline ----------
const CUTS = [2.2, 4.24, 10.24, 14.0, 20.84, 24.75, 31.1, 36.6, 43.4, 50.1, 61.2];
const IMPACTS = [0.7, 2.8, 5.84, 9.52, 13.3, 25.83, 35.34, 41.6, 48.92, 62.8];
const END = 63.6;

function money(v) { return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function tc(t) { const f = Math.floor((t % 1) * 30); const s = Math.floor(t); return `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`; }

function hud(t) {
  const a = 1 - P(t, 62.9, 63.2);
  withA(a, () => {
    if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(74, 66, 9, 0, 7); ctx.fill(); }
    T('REC', 94, 67, { font: 'JB', weight: 700, size: 22, align: 'left', ls: 3 });
    T(tc(t), 160, 67, { font: 'JB', size: 22, align: 'left', color: C.dim, ls: 2 });
    // corner brackets
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
    const m = 40, l = 36;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x + dx * l, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * l); ctx.stroke();
    });
    // bill
    const boreal = t >= 25.83;
    const glitching = t >= 24.75 && t < 25.83;
    let label = 'RENDER BILL', val = '$0.00', col = C.ink;
    if (t >= 4.4 && !boreal) {
      const v = 2.5 * (Math.exp(0.42 * (Math.min(t, 24.75) - 4.4)) - 1);
      val = money(v); col = t > 5.6 ? C.red : C.ink;
    }
    if (glitching) { val = '$' + Math.floor(rnd(Math.floor(t * 30)) * 99999).toLocaleString('en-US'); col = rnd(Math.floor(t * 30) + 3) > 0.5 ? C.red : C.teal; }
    if (boreal) { label = 'BOREAL RATE'; val = '~$0.01/SEC'; col = C.teal; }
    const bw = 330;
    rr(W - 70 - bw, 40, bw, 58, 10, 'rgba(0,0,0,0.45)', boreal ? 'rgba(47,243,198,0.6)' : 'rgba(255,255,255,0.2)', 2);
    T(label, W - 70 - bw + 18, 69, { font: 'JB', size: 15, align: 'left', color: C.dim, ls: 2 });
    T(val, W - 88, 70, { font: 'JB', weight: 700, size: 26, align: 'right', color: col, glow: boreal ? C.teal : (t > 5.6 && !glitching ? C.red : null), blur: 14 });
  });
  // chapter progress bar
  withA(0.9 * a, () => {
    const y = H - 10;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, y, W, 10);
    ctx.fillStyle = t >= 25.83 ? auroraFill(0, W, t) : C.red; ctx.fillRect(0, y, W * (t / END), 10);
    ctx.fillStyle = '#000'; CUTS.forEach(c => ctx.fillRect(W * c / END - 2, y, 4, 10));
  });
}

// ================= SCENES =================

// 1 — "I've tested a lot of AI video models"
function s1(t) {
  bg(C.bg); dotGrid(t);
  const speed = 300 + t * 900;
  for (let row = 0; row < 3; row++) {
    const y = 180 + row * 280, dir = row % 2 ? 1 : -1, tw = 340, gap = 30;
    const off = (t * speed * (0.8 + row * 0.25)) % (tw + gap);
    for (let i = -1; i < 7; i++) {
      const x = dir < 0 ? i * (tw + gap) - off : i * (tw + gap) + off - (tw + gap);
      withA(0.32, () => {
        vid(x, y, tw, 190, row * 11 + i + 3, t);
        T(`MODEL_${String(((row * 7 + i) % 40) + 10).padStart(2, '0')}`, x + 16, y + 26, { font: 'JB', weight: 700, size: 18, align: 'left', ls: 2 });
      });
    }
  }
  // dark band behind type
  const band = ctx.createLinearGradient(0, 260, 0, 840);
  band.addColorStop(0, 'rgba(7,8,12,0)'); band.addColorStop(0.2, 'rgba(7,8,12,0.88)'); band.addColorStop(0.8, 'rgba(7,8,12,0.88)'); band.addColorStop(1, 'rgba(7,8,12,0)');
  ctx.fillStyle = band; ctx.fillRect(0, 260, W, 580);

  words([["I'VE", 0.0], ['TESTED', 0.24]], t, CX, 250, { size: 96, ls: 2 });
  // slot counter -> "A LOT"
  if (t < 0.66) {
    const n = Math.floor(rnd(Math.floor(t * 40)) * 98) + 1;
    T(String(n).padStart(2, '0'), CX, 520, { size: 300, color: C.ink, alpha: P(t, 0.1, 0.25), sx: 1 });
    T('MODELS', CX, 545, { size: 300, color: null, stroke: 'rgba(255,255,255,0.15)', lw: 2, alpha: 0 });
  } else {
    const k = P(t, 0.66, 0.95);
    T('A LOT', CX, 520, { size: 300, color: C.lime, scale: lerp(1.5, 1, eb(k)), glow: 'rgba(214,255,60,0.5)', blur: 40 });
  }
  words([['OF', 1.0], ['AI', 1.12, C.lime], ['VIDEO', 1.28, C.lime], ['MODELS', 1.8]], t, CX, 800, { size: 96 });
}

// 2 — "there's one problem that keeps coming up"
function s2(t) {
  bg(C.redDeep);
  // background repeating rows "COMING UP"
  const k = P(t, 3.3, 4.24);
  if (k > 0) {
    const scroll = (t - 3.3) * 620;
    for (let i = 0; i < 14; i++) {
      const y = H + 60 + i * 150 - scroll;
      T('KEEPS COMING UP · KEEPS COMING UP · KEEPS COMING UP', CX + (i % 2 ? 120 : -120), y, { size: 130, color: null, stroke: 'rgba(255,59,43,0.35)', lw: 2, alpha: clamp(k * 4) });
    }
  }
  // warning triangle
  const wk = P(t, 2.2, 2.5);
  at(CX, 260, eb(wk) * (1 + 0.04 * Math.sin(t * 20)), () => {
    ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(80, 60); ctx.lineTo(-80, 60); ctx.closePath();
    ctx.fillStyle = C.red; ctx.fill();
    T('!', 0, 18, { size: 96, color: C.redDeep });
  });
  words([["THERE'S", 2.36]], t, CX, 400, { size: 70, font: 'JB', weight: 700, ls: 6 });
  // ONE PROBLEM stamp
  const sk = P(t, 2.6, 2.9);
  if (sk > 0) {
    at(CX, 560, lerp(2.2, 1, eo(sk)), () => {
      const w = 1180;
      ctx.save(); ctx.globalAlpha = clamp(sk * 3);
      rr(-w / 2, -105, w * eo(P(t, 2.75, 2.95)), 210, 8, C.red);
      T('ONE PROBLEM', 0, 8, { size: 210, color: C.ink, ls: 4 });
      ctx.restore();
    }, -0.035);
  }
  words([['THAT', 3.24], ['KEEPS', 3.4], ['COMING', 3.72], ['UP', 4.04, C.red]], t, CX, 790, { size: 92 });
}

// 3 — cost curve, then footage strip
function s3(t) {
  bg('#0a0a0e'); dotGrid(t, 'rgba(255,255,255,0.06)');
  const pan = eio(P(t, 6.95, 7.35)) * H; // chart slides up
  ctx.save(); ctx.translate(0, -pan);
  if (pan < H) {
    const ox = 330, oy = 900, x1 = 1600, y1 = 230;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ox, y1 - 30); ctx.lineTo(ox, oy); ctx.lineTo(x1 + 40, oy); ctx.stroke();
    T('MODEL QUALITY →', x1 + 40, oy + 44, { font: 'JB', weight: 700, size: 24, align: 'right', color: C.dim, ls: 3 });
    T('COST ↑', ox - 20, y1 - 50, { font: 'JB', weight: 700, size: 24, align: 'left', color: C.dim, ls: 3 });
    for (let i = 1; i < 5; i++) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(ox, oy - i * 160, x1 - ox, 2); }
    const p = eio(P(t, 4.4, 6.5));
    const f = x => (Math.exp(4 * x) - 1) / (Math.exp(4) - 1);
    const g = ctx.createLinearGradient(ox, 0, x1, 0); g.addColorStop(0, C.ink); g.addColorStop(0.6, C.gold); g.addColorStop(1, C.red);
    ctx.strokeStyle = g; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.shadowColor = C.red; ctx.shadowBlur = 20;
    ctx.beginPath();
    for (let i = 0; i <= 100 * p; i++) { const x = i / 100; const px = lerp(ox, x1, x), py = lerp(oy, y1, f(x)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.shadowBlur = 0;
    if (p > 0) {
      const px = lerp(ox, x1, p), py = lerp(oy, y1, f(p));
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 14, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,59,43,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 14 + 12 * ((t * 2) % 1), 0, 7); ctx.stroke();
      const v = 2.5 * (Math.exp(0.42 * (t - 4.4)) - 1);
      T(money(Math.max(0, v)), px - 30, py - 50, { font: 'JB', weight: 700, size: 34, align: 'right', color: t > 5.6 ? C.red : C.ink });
    }
    words([['THE', 4.24], ['BETTER', 4.4, C.lime], ['THE', 4.64], ['MODEL', 4.84], ['GETS', 5.24]], t, 420, 330, { size: 80, align: 'left', noPop: false });
    const ek = P(t, 5.64, 5.95);
    if (ek > 0) {
      at(1060, 560, lerp(1.8, 1, eb(ek)), () => {
        T('THE MORE', 0, -80, { size: 72, align: 'center' });
        T('EXPENSIVE', 0, 30, { size: 170, color: C.red, glow: 'rgba(255,59,43,0.6)', blur: 30 });
      }, -0.06);
    }
  }
  ctx.restore();
  // ---- part B: footage strip
  if (t > 6.95) {
    ctx.save(); ctx.translate(0, H - pan);
    words([['TO', 7.0], ['GENERATE', 7.16]], t, CX, 170, { size: 54, font: 'JB', weight: 700, ls: 4, color: C.dim });
    words([['ENOUGH', 7.68], ['FOOTAGE', 7.92, C.lime]], t, CX, 290, { size: 150 });
    // film strip
    const sy = 420, sh = 300, fw = 380;
    ctx.fillStyle = '#121216'; ctx.fillRect(0, sy, W, sh);
    const off = (t * 520) % (fw + 20);
    for (let i = -1; i < 7; i++) {
      const x = i * (fw + 20) - off + 20;
      ctx.fillStyle = '#000';
      for (let h = 0; h < 10; h++) { rr(x + h * 40 + 6, sy + 12, 22, 16, 3, '#2a2a30'); rr(x + h * 40 + 6, sy + sh - 28, 22, 16, 3, '#2a2a30'); }
      vid(x, sy + 44, fw, sh - 88, i + Math.floor((t * 520) / (fw + 20)) + 5, t, { r: 6, play: false });
      const idx = i + Math.floor((t * 520) / (fw + 20));
      const tag = '$' + (8 + Math.floor(rnd(idx) * 40)) + '.' + String(Math.floor(rnd(idx + 5) * 99)).padStart(2, '0');
      at(x + fw - 80, sy + 80, 1, () => { rr(-66, -24, 132, 48, 24, C.red); T(tag, 0, 2, { font: 'JB', weight: 700, size: 24 }); }, 0.12);
    }
    words([['TO', 8.32], ['ACTUALLY', 8.48], ['USE', 8.92], ['IT', 9.16], ['IN', 9.32]], t, CX, 810, { size: 66 });
    const pk = P(t, 9.52, 9.8);
    if (pk > 0) at(CX, 930, lerp(2, 1, eo(pk)), () => {
      ctx.globalAlpha = clamp(pk * 3);
      rr(-300, -62, 600, 124, 6, null, C.lime, 6);
      T('PRODUCTION', 0, 6, { size: 104, color: C.lime });
    }, -0.03);
    ctx.restore();
  }
}

// phone mock
function phone(x, y, s, t, seed, label, inner) {
  at(x, y, s, () => {
    rr(-170, -300, 340, 600, 38, '#0c0c10', 'rgba(255,255,255,0.4)', 4);
    ctx.save(); ctx.beginPath(); ctx.roundRect(-156, -286, 312, 572, 28); ctx.clip();
    if (inner) inner(); else vid(-156, -286, 312, 572, seed, t, { r: 0, play: false });
    ctx.restore();
    rr(-40, -278, 80, 16, 8, '#000');
    if (label) T(label, 0, 340, { font: 'JB', weight: 700, size: 22, color: C.dim, ls: 3 });
  });
}

// 4 — "And when you're making ads, you don't just need one generation"
function s4(t) {
  bg(C.bg); dotGrid(t);
  const pk = eo(P(t, 10.24, 10.7));
  phone(1590, 520 + (1 - pk) * 700, 0.9, t, 4, 'AD_FINAL_v1.mp4', () => {
    vid(-156, -286, 312, 572, 4, t, { r: 0, play: false });
    bottle(0, 40, 1.4, t, C.gold);
    T('NEW DROP', 0, -200, { size: 54 });
  });
  words([['AND', 10.24], ['WHEN', 10.56], ["YOU'RE", 10.76]], t, 160, 300, { size: 64, align: 'left', font: 'JB', weight: 700, color: C.dim });
  words([['MAKING', 11.0], ['ADS', 11.36, C.lime]], t, 160, 420, { size: 160, align: 'left' });
  words([['YOU', 11.76], ["DON'T", 11.92], ['JUST', 12.16], ['NEED', 12.36]], t, 160, 590, { size: 76, align: 'left' });
  const ok = P(t, 12.68, 12.95);
  if (ok > 0) {
    T('ONE', 160 + 0, 760, { size: 200, align: 'left', scale: 1, alpha: ok * 3 });
    words([['GENERATION', 12.88]], t, 520, 760, { size: 200, align: 'left' });
    // strike-through
    const sk = eo(P(t, 13.3, 13.5));
    if (sk > 0) { ctx.fillStyle = C.red; ctx.save(); ctx.translate(150, 760); ctx.rotate(-0.06); ctx.fillRect(0, -14, (measure('ONE', 200) + 30) * sk, 28); ctx.restore(); }
  }
}

// variation card content
function varCard(i, x, y, w, h, t, active) {
  rr(x, y, w, h, 22, '#101015', active ? 'rgba(214,255,60,0.85)' : 'rgba(255,255,255,0.18)', 3);
  ctx.save(); ctx.beginPath(); ctx.roundRect(x + 8, y + 8, w - 16, h - 16, 16); ctx.clip();
  const cx = x + w / 2, cy = y + h / 2;
  if (!active) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let k = -h; k < w + h; k += 34) { ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k + 18, y); ctx.lineTo(x + k + 18 - h, y + h); ctx.lineTo(x + k - h, y + h); ctx.fill(); }
    T('?', cx, cy, { size: 120, color: 'rgba(255,255,255,0.15)' });
  } else if (i === 0) {
    vid(x, y, w, h, 2, t, { r: 0, play: false, sat: 0.5 });
    const hooks = ['WAIT.', 'STOP\nSCROLLING', 'POV:', "NOBODY\nTALKS\nABOUT\nTHIS", 'DAY 1'];
    const hk = hooks[Math.floor(t * 3) % hooks.length].split('\n');
    hk.forEach((l, j) => T(l, cx, cy + (j - (hk.length - 1) / 2) * 62, { size: 60, color: C.ink, stroke: '#000', lw: 8 }));
  } else if (i === 1) {
    vid(x, y, w, h, 9, t, { r: 0, play: false, sat: 0.5 });
    const shots = [['WIDE', 0.7], ['CLOSE-UP', 1.9], ['LOW ANGLE', 1.2], ['TOP DOWN', 0.95]];
    const sh = shots[Math.floor(t * 2.6) % shots.length];
    bottle(cx, cy + 30, sh[1], t, C.violet);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; const m = 30, l = 30;
    [[x + m, y + m, 1, 1], [x + w - m, y + m, -1, 1], [x + m, y + h - m, 1, -1], [x + w - m, y + h - m, -1, -1]].forEach(([a, b, dx, dy]) => { ctx.beginPath(); ctx.moveTo(a + dx * l, b); ctx.lineTo(a, b); ctx.lineTo(a, b + dy * l); ctx.stroke(); });
    T(sh[0], cx, y + 70, { font: 'JB', weight: 700, size: 22, ls: 3 });
  } else if (i === 2) {
    const bgs = ['#2a1606', '#06202a', '#1b0a2a', '#1f2a06'];
    ctx.fillStyle = bgs[Math.floor(t * 2.2) % 4]; ctx.fillRect(x, y, w, h);
    const rg = ctx.createRadialGradient(cx, cy - 60, 10, cx, cy, h * 0.6); rg.addColorStop(0, 'rgba(255,255,255,0.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(x, y, w, h);
    bottle(cx, cy + 20, 1.25, t, [C.gold, C.teal, C.pink, C.lime][Math.floor(t * 2.2) % 4]);
  } else {
    vid(x, y, w, h, 13 + Math.floor(t * 3), t, { r: 0, play: false, sat: 0.7 });
    T('ABCD'[Math.floor(t * 3) % 4], cx, cy, { size: 280, color: C.ink, stroke: '#000', lw: 10 });
  }
  ctx.restore();
}

// 5 — "You need variations: hooks, camera angles, product shots, versions of the same concept"
function s5(t) {
  bg(C.bg); dotGrid(t);
  const labels = ['HOOKS', 'CAMERA ANGLES', 'PRODUCT SHOTS', 'VERSIONS'];
  const times = [15.76, 16.52, 17.68, 19.08];
  const split = eo(P(t, 14.6, 15.1));
  const zoom = lerp(1, 0.3, eio(P(t, 19.9, 20.7)));
  const cw = 330, ch = 560, gap = 60, rowW = cw * 4 + gap * 3;
  const drawRow = (ox, oy, tt, full) => {
    for (let i = 0; i < 4; i++) {
      const tx = -rowW / 2 + i * (cw + gap);
      const x = ox + lerp(-cw / 2, tx, split), y = oy - ch / 2;
      const act = full || t >= times[i];
      const ak = full ? 1 : P(t, times[i], times[i] + 0.3);
      at(x + cw / 2, y + ch / 2, act && !full ? lerp(1.12, 1, eo(ak)) : 1, () => varCard(i, -cw / 2, -ch / 2, cw, ch, tt, act));
      if (!full && act) T(`0${i + 1}  ${labels[i]}`, x + cw / 2, oy + ch / 2 + 50, { font: 'JB', weight: 700, size: 26, ls: 2, color: C.lime, alpha: ak * 2 });
    }
  };
  ctx.save(); ctx.translate(CX, 600); ctx.scale(zoom, zoom); ctx.translate(-CX, -600);
  if (zoom < 0.999) {
    for (let r = -3; r <= 3; r++) for (let c = -2; c <= 2; c++) {
      if (r === 0 && c === 0) continue;
      withA(P(t, 19.95, 20.4) * 0.9, () => drawRow(CX + c * (rowW + gap), 600 + r * (ch + 140), t + r * 0.37 + c * 0.81, true));
    }
  }
  drawRow(CX, 600, t, false);
  ctx.restore();
  // title
  const tk = 1 - P(t, 19.9, 20.1);
  withA(tk, () => {
    words([['YOU', 14.0], ['NEED', 14.15], ['VARIATIONS', 14.6, C.lime]], t, CX, 150, { size: 120 });
  });
  const sk = P(t, 20.2, 20.45);
  if (sk > 0) {
    rr(CX - 560, 470, 1120, 200, 10, 'rgba(7,8,12,0.85)');
    words([['SAME', 19.92], ['CONCEPT.', 20.2, C.lime]], t, CX, 575, { size: 170 });
    T('∞ VARIATIONS', CX, 700, { font: 'JB', weight: 700, size: 30, ls: 8, color: C.ink, alpha: sk });
  }
}

// 6 — "So today I'm testing something built specifically around that problem"
function s6(t) {
  bg('#040507'); dotGrid(t, 'rgba(47,243,198,0.06)');
  // implode particles
  const ik = P(t, 20.84, 21.3);
  if (ik < 1) for (let i = 0; i < 90; i++) {
    const a = rnd(i) * 7, d = (1 - eio(ik)) * (300 + rnd(i + 3) * 900);
    ctx.fillStyle = hue(i, 1 - ik); ctx.fillRect(CX + Math.cos(a) * d - 12, CY + Math.sin(a) * d - 20, 24, 40);
  }
  words([['//', 20.84, C.teal], ['TODAY', 21.12], ["I'M", 21.52], ['TESTING', 21.76]], t, CX, 180, { size: 44, font: 'JB', weight: 700, ls: 4 });
  // target box with locking corners
  const bk = eo(P(t, 21.6, 22.3));
  const bw = 760, bh = 380, bx0 = CX - bw / 2, by0 = 300;
  const spread = (1 - bk) * 260;
  ctx.strokeStyle = C.teal; ctx.lineWidth = 5; const l = 60;
  withA(P(t, 21.5, 21.7), () => {
    [[bx0 - spread, by0 - spread, 1, 1], [bx0 + bw + spread, by0 - spread, -1, 1], [bx0 - spread, by0 + bh + spread, 1, -1], [bx0 + bw + spread, by0 + bh + spread, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x + dx * l, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * l); ctx.stroke();
    });
    ctx.fillStyle = 'rgba(47,243,198,0.05)'; ctx.fillRect(bx0, by0, bw, bh);
    // scanline
    const sy = by0 + ((t * 300) % bh);
    const sg = ctx.createLinearGradient(0, sy - 60, 0, sy); sg.addColorStop(0, 'rgba(47,243,198,0)'); sg.addColorStop(1, 'rgba(47,243,198,0.35)');
    ctx.fillStyle = sg; ctx.fillRect(bx0, sy - 60, bw, 60);
    T('SOMETHING', CX, by0 + bh / 2 - 30, { size: 130, color: rnd(Math.floor(t * 12)) > 0.15 ? C.ink : C.teal, alpha: P(t, 22.16, 22.3) });
    T('MODEL: ██████  ·  STATUS: CLASSIFIED', CX, by0 + bh / 2 + 80, { font: 'JB', size: 22, ls: 3, color: C.teal, alpha: P(t, 22.3, 22.5) });
  });
  words([['BUILT', 22.48], ['SPECIFICALLY', 22.76, C.teal]], t, CX, 790, { size: 96 });
  words([['AROUND', 23.44], ['THAT', 23.84], ['PROBLEM', 24.08, C.red]], t, CX, 900, { size: 70 });
  // loader
  const lp = eio(P(t, 21.5, 24.6));
  withA(P(t, 21.5, 21.7), () => {
    rr(CX - 380, 990, 760, 12, 6, 'rgba(255,255,255,0.12)');
    rr(CX - 380, 990, 760 * lp, 12, 6, C.teal);
    T(`LOADING MODEL ${Math.floor(lp * 100)}%`, CX + 380, 970, { font: 'JB', weight: 700, size: 18, align: 'right', color: C.teal, ls: 2 });
  });
}

// 7 — reveal: "This is Creatify Boreal..."
function s7(t) {
  bg('#02040a');
  stars(t, 160, P(t, 24.75, 25.5));
  aurora(t, P(t, 24.9, 26.0) * (0.85 + 0.15 * Math.sin(t * 3)), 0);
  words([['THIS', 24.75], ['IS', 24.95]], t, CX, 190, { size: 34, font: 'JB', weight: 700, ls: 10, color: C.dim });
  const ck = P(t, 25.15, 25.5);
  T('C R E A T I F Y', CX, 270, { font: 'JB', weight: 700, size: 40, ls: 6, alpha: ck, scale: lerp(0.9, 1, eo(ck)) });
  // BOREAL letters
  const L = 'BOREAL'.split(''), size = 330;
  const total = measure('BOREAL', size, 'Anton', '', 14);
  let x = CX - total / 2;
  const g = auroraFill(CX - total / 2, CX + total / 2, t);
  L.forEach((ch, i) => {
    const w = measure(ch, size, 'Anton', '', 14);
    const k = P(t, 25.83 + i * 0.05, 25.83 + i * 0.05 + 0.4);
    if (k > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 340, W, 400); ctx.clip();
      ctx.font = `${size}px Anton`; ctx.letterSpacing = '14px'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = g; ctx.shadowColor = 'rgba(47,243,198,0.55)'; ctx.shadowBlur = 50;
      ctx.fillText(ch, x, 540 + (1 - ex(k)) * 360);
      ctx.restore();
    }
    x += w;
  });
  // light sweep across the letters
  const sw = P(t, 26.5, 27.3);
  if (sw > 0 && sw < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const sx = lerp(CX - total / 2 - 200, CX + total / 2 + 200, sw);
    const sg = ctx.createLinearGradient(sx - 140, 0, sx + 140, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.7)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.font = `${size}px Anton`; ctx.letterSpacing = '14px'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = sg; ctx.fillText('BOREAL', CX - total / 2, 540); ctx.restore();
  }
  words([["CREATIFY'S", 26.39], ['OWN', 27.19, C.teal], ['AI', 27.55], ['VIDEO', 27.75], ['MODEL', 28.11]], t, CX, 790, { size: 52, font: 'Inter', weight: 800, ls: 1 });
  const bk = P(t, 28.43, 28.8);
  if (bk > 0) at(CX, 895, lerp(0.8, 1, eb(bk)), () => {
    ctx.globalAlpha = clamp(bk * 2);
    rr(-430, -38, 860, 76, 38, 'rgba(47,243,198,0.08)', 'rgba(47,243,198,0.7)', 2);
    ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(-390, 0, 8, 0, 7); ctx.fill();
    T('BUILT BY CREATIFY LABS  ·  RESEARCH TEAM', 10, 2, { font: 'JB', weight: 700, size: 26, ls: 3, color: C.ink });
  });
}

// 8 — text-to-video, image-to-video, 1 cent per second
function s8(t) {
  bg('#03050a'); aurora(t, 0.35, -60); dotGrid(t, 'rgba(255,255,255,0.05)');
  const out = eio(P(t, 34.2, 34.6));
  words([['IT', 31.1], ['CAN', 31.42], ['GENERATE', 31.6, C.teal]], t, CX, 140 - out * 300, { size: 60, font: 'JB', weight: 700, ls: 4 });
  const card = (x, t0, title, inner) => {
    const k = eo(P(t, t0, t0 + 0.4));
    if (k <= 0) return;
    at(x, 590 + (1 - k) * 600 + out * 900, 1, () => {
      rr(-400, -330, 800, 660, 28, 'rgba(10,12,18,0.92)', 'rgba(47,243,198,0.5)', 3);
      T(title, 0, -270, { size: 76, color: C.ink });
      inner();
    }, (1 - k) * 0.15 + out * 0.2);
  };
  card(500, 32.14, 'TEXT → VIDEO', () => {
    const prompt = 'glass serum bottle on wet black stone, slow push-in, golden rim light';
    const n = Math.floor(clamp((t - 32.3) * 40, 0, prompt.length));
    rr(-340, -200, 680, 120, 14, '#16181f', 'rgba(255,255,255,0.15)', 2);
    ctx.save(); ctx.font = '500 26px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = C.ink; ctx.letterSpacing = '0px';
    const s = prompt.slice(0, n) + (Math.floor(t * 4) % 2 ? '▍' : '');
    const cut = s.length > 38 ? s.lastIndexOf(' ', 38) : -1;
    if (cut > 0) { ctx.fillText(s.slice(0, cut), -315, -180); ctx.fillText(s.slice(cut + 1), -315, -140); } else ctx.fillText(s, -315, -180);
    ctx.restore();
    const vk = P(t, 33.0, 33.4);
    rr(-340, -50, 680, 340, 14, '#0c0d12', 'rgba(255,255,255,0.12)', 2);
    withA(vk, () => {
      ctx.save(); ctx.beginPath(); ctx.roundRect(-340, -50, 680, 340, 14); ctx.clip();
      const gg = ctx.createLinearGradient(0, -50, 0, 290); gg.addColorStop(0, '#1d1206'); gg.addColorStop(1, '#050505'); ctx.fillStyle = gg; ctx.fillRect(-340, -50, 680, 340);
      bottle(0, 140, 0.95 + (t - 33) * 0.05, t, C.gold);
      ctx.restore();
    });
  });
  card(1420, 33.06, 'IMAGE → VIDEO', () => {
    rr(-340, -200, 260, 340, 14, '#14161c', 'rgba(255,255,255,0.2)', 2);
    ctx.save(); ctx.beginPath(); ctx.roundRect(-340, -200, 260, 340, 14); ctx.clip(); bottle(-210, 10, 0.8, 0, C.teal, false); ctx.restore();
    T('product.jpg', -210, 170, { font: 'JB', size: 18, color: C.dim });
    T('→', -10, -30, { size: 90, color: C.teal });
    rr(60, -200, 280, 340, 14, '#0c0d12', 'rgba(47,243,198,0.6)', 3);
    ctx.save(); ctx.beginPath(); ctx.roundRect(60, -200, 280, 340, 14); ctx.clip();
    const fl = ctx.createRadialGradient(200 + Math.sin(t * 2) * 80, -100, 10, 200, -30, 260); fl.addColorStop(0, 'rgba(47,243,198,0.45)'); fl.addColorStop(1, 'rgba(47,243,198,0)');
    ctx.fillStyle = fl; ctx.fillRect(60, -200, 280, 340);
    bottle(200 + Math.sin(t * 1.5) * 10, 10, 0.8 + 0.06 * Math.sin(t * 2), t, C.teal);
    ctx.restore();
    T('clip.mp4  ▶', 200, 170, { font: 'JB', weight: 700, size: 18, color: C.teal });
  });
  // pricing
  words([['THE', 34.22], ['PRICING', 34.46], ['IS', 34.86], ['ABOUT', 35.02]], t, CX, 200, { size: 46, font: 'JB', weight: 700, ls: 6, color: C.dim });
  const pk = P(t, 35.34, 35.9);
  if (pk > 0) {
    const spin = Math.cos((1 - ex(pk)) * Math.PI * 6);
    at(CX - 300, 560, lerp(0.4, 1, eb(P(t, 35.34, 35.7))), () => {
      ctx.save(); ctx.scale(Math.max(0.06, Math.abs(spin)), 1);
      const cg = ctx.createRadialGradient(-60, -80, 20, 0, 0, 260); cg.addColorStop(0, '#fff3b0'); cg.addColorStop(0.5, C.gold); cg.addColorStop(1, '#a86b00');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, 240, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 205, 0, 7); ctx.stroke();
      T('1¢', 0, 12, { size: 230, color: '#4a2e00' });
      ctx.restore();
    });
    words([['ONE', 35.34, C.gold], ['CENT', 35.58, C.gold]], t, 1240, 470, { size: 170 });
    words([['PER', 35.9], ['SECOND', 36.06, C.teal]], t, 1240, 650, { size: 150 });
  }
}

// 9 — real-time speed: 5s clip ≈ 5s generation
function s9(t) {
  bg('#03050a');
  // speed streaks
  for (let i = 0; i < 70; i++) {
    const y = rnd(i) * H, len = 100 + rnd(i + 1) * 500, sp = 1400 + rnd(i + 2) * 2400;
    const x = W - ((t * sp + rnd(i + 3) * 4000) % (W + len + 400));
    ctx.fillStyle = i % 3 ? 'rgba(47,243,198,0.12)' : 'rgba(155,114,255,0.14)'; ctx.fillRect(x, y, len, 3);
  }
  words([["IT'S", 36.6], ['ALSO', 36.88], ['DESIGNED', 37.16], ['TO', 37.56], ['GENERATE', 37.72], ['AT', 38.2], ['ROUGHLY', 38.4]], t, CX, 200, { size: 40, font: 'JB', weight: 700, ls: 3, color: C.dim });
  const up = eio(P(t, 39.6, 40.0));
  const rk = P(t, 38.84, 39.1);
  if (rk > 0) {
    const y = lerp(480, 330, up), s = lerp(1, 0.62, up);
    for (let k = 4; k >= 1; k--) T(t < 39.36 ? 'REAL-TIME' : 'REAL-TIME SPEED', CX - (t < 39.36 ? 230 * s : 0) - k * 40 * (1 - up * 0.7), y, { size: 230 * s, skew: -0.18, color: `rgba(47,243,198,${0.12 * (5 - k) / 4})`, alpha: rk });
    ctx.save(); ctx.translate(CX, y); ctx.scale(s, s);
    ctx.font = '230px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0px';
    ctx.transform(1, 0, -0.18, 1, 0, 0);
    ctx.globalAlpha = clamp(rk * 3);
    ctx.fillStyle = C.ink; ctx.fillText('REAL-TIME', -230, 0);
    ctx.globalAlpha = clamp(P(t, 39.36, 39.6) * 3);
    ctx.fillStyle = auroraFill(200, 700, t); ctx.fillText('SPEED', 500 + (1 - eo(P(t, 39.36, 39.6))) * 300, 0);
    ctx.restore();
  }
  // comparison bars
  const bar = (y, t0, label, val, fillT0, fillT1, col) => {
    const k = eo(P(t, t0, t0 + 0.3));
    if (k <= 0) return;
    withA(k, () => {
      T(label, 280, y - 58, { font: 'JB', weight: 700, size: 26, align: 'left', ls: 4, color: C.dim });
      rr(280, y - 30, 1200, 60, 12, 'rgba(255,255,255,0.08)');
      const p = fillT1 ? eio(P(t, fillT0, fillT1)) : 1;
      rr(280, y - 30, Math.max(24, 1200 * p), 60, 12, col);
      T(val(p), 1520, y + 2, { size: 84, align: 'left', color: col });
    });
  };
  bar(620, 40.0, 'CLIP LENGTH', () => '5.0s', 40.0, 40.5, C.ink);
  bar(820, 40.84, 'GENERATION TIME', p => (p * 5).toFixed(1) + 's', 41.24, 42.6, C.teal);
  const ak = P(t, 42.6, 42.85);
  if (ak > 0) at(1700, 470, lerp(2, 1, eo(ak)), () => {
    ctx.globalAlpha = clamp(ak * 3);
    rr(-150, -50, 300, 100, 8, C.teal);
    T('≈ 1:1', 0, 4, { size: 76, color: '#02150f' });
  }, 0.08);
}

// 10 — cost so low → multiple variations instead of one attempt
function s10(t) {
  bg(C.bg); dotGrid(t);
  words([['AND', 43.4], ['BECAUSE', 43.64], ['THE', 44.0], ['COST', 44.2], ['IS', 44.52]], t, CX, 130, { size: 46, font: 'JB', weight: 700, ls: 4, color: C.dim });
  words([['SO', 44.72, C.teal], ['LOW', 44.92, C.teal]], t, CX, 240, { size: 140 });
  // same budget, two lanes
  T('SAME BUDGET →', 160, 360, { font: 'JB', weight: 700, size: 24, align: 'left', ls: 4, color: C.dim, alpha: P(t, 45.2, 45.5) });
  // lane A
  withA(P(t, 45.24, 45.5), () => {
    T('BOREAL', 160, 420, { size: 48, align: 'left', color: C.teal });
    const cols = 30, rows = 3, tw = 44, th = 64, gx = 8;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const tt = 45.4 + idx * 0.016;
      const k = P(t, tt, tt + 0.18);
      if (k <= 0) continue;
      const x = 160 + c * (tw + gx), y = 460 + r * (th + gx);
      at(x + tw / 2, y + th / 2, eb(k), () => vid(-tw / 2, -th / 2, tw, th, idx, t, { r: 6, play: false }));
    }
    words([['MULTIPLE', 46.04], ['VARIATIONS', 46.56, C.teal]], t, 1440, 420, { size: 34, font: 'JB', weight: 700, ls: 2, gap: 14 });
  });
  // lane B
  withA(P(t, 47.16, 47.4), () => {
    T('INSTEAD OF', 160, 760, { size: 48, align: 'left', color: C.dim });
    const k = eo(P(t, 47.5, 48.2));
    rr(160, 800, 1560 * k, 200, 16, 'rgba(255,59,43,0.18)', C.red, 3);
    if (k > 0.5) {
      vid(176, 816, 340, 168, 1, t, { r: 10 });
      T('1 EXPENSIVE ATTEMPT', 560, 900, { size: 84, align: 'left', color: C.red, alpha: P(t, 47.9, 48.2) });
      T('= ENTIRE BUDGET', 1500, 900, { font: 'JB', weight: 700, size: 26, ls: 2, color: C.ink, alpha: P(t, 48.24, 48.5) });
    }
    const xk = P(t, 48.92, 49.15);
    if (xk > 0) at(940, 900, lerp(2.4, 1, eo(xk)), () => {
      ctx.globalAlpha = clamp(xk * 3);
      ctx.strokeStyle = C.red; ctx.lineWidth = 26; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-120, -120); ctx.lineTo(120, 120); ctx.moveTo(120, -120); ctx.lineTo(-120, 120); ctx.stroke();
    });
  });
}

// 11 — today's plan checklist
function s11(t) {
  bg('#05070b'); aurora(t, 0.18, -90); dotGrid(t, 'rgba(255,255,255,0.05)');
  words([['//', 50.1, C.teal], ['TODAY', 50.3], ["I'M", 50.66], ['GOING', 50.98], ['TO', 51.18]], t, 180, 140, { size: 34, font: 'JB', weight: 700, ls: 4, align: 'left' });
  const items = [
    [51.34, 'BUILD AN AI AD', 'FROM SCRATCH', 53.14],
    [53.62, 'TEST BOREAL', 'WITH A REAL PRODUCT IMAGE', 54.54],
    [55.66, 'CREATE MULTIPLE', 'VARIATIONS', 56.54],
    [57.14, 'UGC-STYLE', 'CONTENT', 58.3],
    [59.58, 'CHARACTER', 'CONSISTENCY', 59.78],
  ];
  items.forEach(([t0, a, b, t1], i) => {
    const y = 260 + i * 150;
    const k = eo(P(t, t0, t0 + 0.35));
    if (k <= 0) return;
    const next = items[i + 1] ? items[i + 1][0] : 60.9;
    const active = t >= t0 && t < next;
    const done = t >= next - 0.15;
    ctx.save(); ctx.translate((1 - k) * -200, 0); ctx.globalAlpha = clamp(k * 2) * (active || i === 4 ? 1 : 0.55);
    if (active) { const hb = ctx.createLinearGradient(140, 0, 1780, 0); hb.addColorStop(0, 'rgba(47,243,198,0.18)'); hb.addColorStop(1, 'rgba(47,243,198,0)'); ctx.fillStyle = hb; ctx.fillRect(140, y - 62, 1640, 124); ctx.fillStyle = C.teal; ctx.fillRect(140, y - 62, 6, 124); }
    T(`0${i + 1}`, 190, y + 4, { font: 'JB', weight: 700, size: 46, align: 'left', color: active ? C.teal : C.dim });
    T(a, 310, y + 4, { size: 76, align: 'left' });
    const aw = measure(a, 76);
    const bk = P(t, t1, t1 + 0.3);
    T(b, 310 + aw + 24, y + 4, { size: 76, align: 'left', color: C.teal, alpha: bk * 3, scale: 1 });
    // checkbox
    rr(1660, y - 40, 80, 80, 16, null, done ? C.teal : 'rgba(255,255,255,0.3)', 4);
    if (done) {
      const ck = eo(P(t, next - 0.15, next + 0.15));
      ctx.strokeStyle = C.teal; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(1678, y); ctx.lineTo(1694, y + 18 * clamp(ck * 2)); if (ck > 0.5) ctx.lineTo(1694 + 30 * (ck - 0.5) * 2, y + 18 - 46 * (ck - 0.5) * 2); ctx.stroke();
    }
    ctx.restore();
  });
}

// 12 — "Let's see what it can actually do"
function s12(t) {
  bg('#02040a');
  aurora(t, 0.6 + 0.4 * P(t, 62.6, 63.2), lerp(0, 60, P(t, 61.2, 63.4)));
  stars(t, 120, 0.8);
  const z = 1 + Math.pow(P(t, 63.0, 63.45), 3) * 14;
  ctx.save(); ctx.translate(CX, 600); ctx.scale(z, z); ctx.translate(-CX, -600);
  words([["LET'S", 61.2], ['SEE', 61.44], ['WHAT', 61.64], ['IT', 61.88], ['CAN', 62.0]], t, CX, 380, { size: 150 });
  const ak = P(t, 62.24, 62.5);
  if (ak > 0) {
    const tw = measure('ACTUALLY', 270);
    ctx.save(); ctx.font = '270px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0px';
    ctx.globalAlpha = clamp(ak * 3); ctx.fillStyle = auroraFill(CX - 640, CX + 640, t);
    ctx.shadowColor = 'rgba(47,243,198,0.6)'; ctx.shadowBlur = 50;
    const dw = measure('DO', 270), gap = 50, total = tw + gap + dw, x0 = CX - total / 2;
    ctx.save(); ctx.translate(x0 + tw / 2, 640); ctx.scale(lerp(1.4, 1, eo(ak)), lerp(1.4, 1, eo(ak))); ctx.fillText('ACTUALLY', -tw / 2, 0); ctx.restore();
    const dk = P(t, 62.8, 62.98);
    if (dk > 0) { ctx.save(); ctx.translate(x0 + tw + gap + dw / 2, 640); ctx.scale(lerp(3, 1, eo(dk)), lerp(3, 1, eo(dk))); ctx.fillStyle = C.ink; ctx.fillText('DO', -dw / 2, 0); ctx.restore(); }
    ctx.restore();
  }
  ctx.restore();
  // white-out
  const wk = P(t, 63.1, 63.4);
  if (wk > 0) { ctx.fillStyle = `rgba(240,255,250,${wk})`; ctx.fillRect(0, 0, W, H); }
  const bk = P(t, 63.4, 63.6);
  if (bk > 0) { ctx.fillStyle = `rgba(0,0,0,${bk})`; ctx.fillRect(0, 0, W, H); }
}

const SCENES = [[0, s1], [2.2, s2], [4.24, s3], [10.24, s4], [14.0, s5], [20.84, s6], [24.75, s7], [31.1, s8], [36.6, s9], [43.4, s10], [50.1, s11], [61.2, s12]];

function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.shadowBlur = 0;
  let sc = SCENES[0][1];
  for (const [s, f] of SCENES) if (t >= s) sc = f;
  // camera: punch-in after cuts + shake on impacts
  let z = 1, sx = 0, sy = 0;
  for (const c of CUTS) { const k = P(t, c, c + 0.35); if (t >= c && k < 1) z *= 1 + 0.07 * (1 - eo(k)); }
  for (const im of IMPACTS) {
    const k = (t - im) / 0.35;
    if (k >= 0 && k < 1) { const a = 18 * (1 - k) * (1 - k); sx += Math.sin(t * 97) * a; sy += Math.cos(t * 83) * a; }
  }
  ctx.save();
  ctx.translate(CX + sx, CY + sy); ctx.scale(z, z); ctx.translate(-CX, -CY);
  sc(t);
  ctx.restore();
  // impact flash
  for (const im of IMPACTS) { const k = (t - im) / 0.12; if (k >= 0 && k < 1) { ctx.fillStyle = `rgba(255,255,255,${0.18 * (1 - k)})`; ctx.fillRect(0, 0, W, H); } }
  // glitch slices + rgb split on cuts
  for (const c of CUTS) {
    const k = (t - c) / 0.13;
    if (k >= 0 && k < 1) {
      bx.clearRect(0, 0, W, H); bx.drawImage(cv, 0, 0);
      const seed = Math.floor(t * 30) * 13;
      for (let i = 0; i < 9; i++) {
        const y = rnd(seed + i) * H, h = 20 + rnd(seed + i + 50) * 120, dx = (rnd(seed + i + 90) - 0.5) * 160 * (1 - k);
        ctx.drawImage(BUF, 0, y, W, h, dx, y, W, h);
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * (1 - k);
      ctx.drawImage(BUF, 14 * (1 - k), 0); ctx.restore();
      ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; ctx.fillRect(0, 0, W, H);
    }
  }
  hud(t);
  ctx.drawImage(VIG, 0, 0);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(GRAIN[Math.floor(t * 30) % 3], 0, 0, W, H); ctx.restore();
}
window.renderFrame = renderFrame;
window.END = END;
window.fontsReady = Promise.all(['100px Anton', '700 20px JB', '400 20px JB', '500 20px Inter', '800 20px Inter'].map(f => document.fonts.load(f)));
