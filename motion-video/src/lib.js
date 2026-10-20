// Shared drawing toolkit for the motion graphics + footage pages.
const W = 1920, H = 1080;
const C = {
  bg: '#07070d', ink: '#f4f4fb', dim: 'rgba(244,244,251,0.62)', faint: 'rgba(244,244,251,0.32)',
  violet: '#8b5cff', cyan: '#2fe0ff', pink: '#ff4f9a', lime: '#c8ff3c', amber: '#ffb547', red: '#ff5a5a',
  card: 'rgba(255,255,255,0.045)', line: 'rgba(255,255,255,0.11)',
};
const DISPLAY = '"Inter Display", Inter, sans-serif', BODY = 'Inter, sans-serif', MONO = '"DejaVu Sans Mono", monospace';

// ---------- math / easing ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, d) => clamp((t - a) / d);
const E = {
  lin: k => k,
  out: k => 1 - Math.pow(1 - k, 3),
  in: k => k * k * k,
  inOut: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  expo: k => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  back: k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  elastic: k => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
const A = (t, a, d = 0.6, e = E.out) => e(prog(t, a, d));
// in/out envelope: rises at a, falls at b
const env = (t, a, b, din = 0.4, dout = 0.35) => Math.min(A(t, a, din), 1 - A(t, b - dout, dout, E.in));
const mixHex = (h1, h2, k) => {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = p(h1), b = p(h2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
};
const rgba = (hex, a) => { const p = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return `rgba(${p.join(',')},${a})`; };

// ---------- canvas helpers ----------
function mkCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function font(ctx, size, weight = 700, fam = DISPLAY) { ctx.font = `${weight} ${size}px ${fam}`; }
function txt(ctx, s, x, y, o = {}) {
  font(ctx, o.size || 40, o.weight || 700, o.fam || DISPLAY);
  ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.fillText(s, x, y);
  ctx.letterSpacing = '0px';
}
function tw(ctx, s, size, weight = 700, fam = DISPLAY, ls = 0) {
  font(ctx, size, weight, fam); ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w;
}
function withA(ctx, a, fn) { if (a <= 0.001) return; ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); }
function at(ctx, x, y, s, fn, rot = 0) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (s !== 1) ctx.scale(s, s); fn(); ctx.restore(); }

// Word-by-word rise reveal. align: left|center|right. returns width
function wordsIn(ctx, s, x, y, t, t0, o = {}) {
  const size = o.size || 80, weight = o.weight || 800, fam = o.fam || DISPLAY, ls = o.ls ?? -size * 0.02;
  const words = s.split(' '), gap = size * 0.26, stag = o.stagger ?? 0.07, dur = o.dur ?? 0.55;
  const ws = words.map(w => tw(ctx, w, size, weight, fam, ls));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  words.forEach((w, i) => {
    const k = A(t, t0 + i * stag, dur, E.expo);
    if (k > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - 10, y - size * 1.1, ws[i] + 20, size * 1.45); ctx.clip();
      const col = (o.colors && o.colors[i]) || o.color || C.ink;
      txt(ctx, w, cx, y + (1 - k) * size * 1.1, { size, weight, fam, color: col, ls });
      ctx.restore();
    }
    cx += ws[i] + gap;
  });
  return total;
}
// Typewriter
function typed(s, t, t0, cps = 28) { const n = Math.floor(clamp((t - t0) * cps, 0, s.length)); return s.slice(0, n); }
function caret(t) { return Math.floor(t * 2.2) % 2 === 0; }

function card(ctx, x, y, w, h, o = {}) {
  ctx.save();
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = o.blur ?? 40; ctx.shadowOffsetY = 18; }
  rrect(ctx, x, y, w, h, o.r ?? 22); ctx.fillStyle = o.fill || 'rgba(20,20,32,0.92)'; ctx.fill();
  ctx.restore();
  rrect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, o.r ?? 22); ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = o.lw || 1.5; ctx.stroke();
}
function pill(ctx, x, y, label, o = {}) {
  const size = o.size || 26, padX = size * 0.75, h = size * 1.9;
  const w = tw(ctx, label, size, o.weight || 600, BODY) + padX * 2 + (o.dot ? size * 0.9 : 0);
  const bx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  rrect(ctx, bx, y - h / 2, w, h, h / 2);
  ctx.fillStyle = o.fill || 'rgba(255,255,255,0.07)'; ctx.fill();
  ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.5; ctx.stroke();
  let tx = bx + padX;
  if (o.dot) { ctx.beginPath(); ctx.arc(tx + size * 0.25, y, size * 0.22, 0, 7); ctx.fillStyle = o.dot; ctx.fill(); tx += size * 0.9; }
  txt(ctx, label, tx, y + 1, { size, weight: o.weight || 600, fam: BODY, color: o.color || C.ink, base: 'middle' });
  return w;
}
function glow(ctx, x, y, r, col, a = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function gradText(ctx, x0, x1, c0, c1) { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }

// ---------- icons ----------
function iCheck(ctx, x, y, s, col = C.lime, k = 1) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const p = [[-0.38, 0.02], [-0.1, 0.3], [0.4, -0.28]];
  const L1 = Math.hypot(0.28, 0.28), L2 = Math.hypot(0.5, 0.58), tot = (L1 + L2) * k;
  ctx.beginPath(); ctx.moveTo(x + p[0][0] * s, y + p[0][1] * s);
  if (tot <= L1) { const f = tot / L1; ctx.lineTo(x + lerp(p[0][0], p[1][0], f) * s, y + lerp(p[0][1], p[1][1], f) * s); }
  else { ctx.lineTo(x + p[1][0] * s, y + p[1][1] * s); const f = (tot - L1) / L2; ctx.lineTo(x + lerp(p[1][0], p[2][0], f) * s, y + lerp(p[1][1], p[2][1], f) * s); }
  ctx.stroke(); ctx.restore();
}
function iCross(ctx, x, y, s, col = C.red) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.3); ctx.lineTo(x + s * 0.3, y + s * 0.3); ctx.moveTo(x + s * 0.3, y - s * 0.3); ctx.lineTo(x - s * 0.3, y + s * 0.3); ctx.stroke(); ctx.restore();
}
function iSpark(ctx, x, y, s, col = C.ink) {
  ctx.save(); ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? s * 0.18 : s * 0.5; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function iLock(ctx, x, y, s, col = C.ink) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.12;
  ctx.beginPath(); ctx.arc(x, y - s * 0.12, s * 0.24, Math.PI, 0); ctx.stroke();
  rrect(ctx, x - s * 0.36, y - s * 0.12, s * 0.72, s * 0.52, s * 0.08); ctx.fill(); ctx.restore();
}
function iPlay(ctx, x, y, s, col = C.ink) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.4); ctx.lineTo(x + s * 0.42, y); ctx.lineTo(x - s * 0.3, y + s * 0.4); ctx.closePath(); ctx.fill(); ctx.restore(); }
function iClock(ctx, x, y, s, col = C.ink, ang = 0) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.08; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ang) * s * 0.3, y - Math.cos(ang) * s * 0.3);
  ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ang / 12) * s * 0.2, y - Math.cos(ang / 12) * s * 0.2); ctx.stroke(); ctx.restore();
}
function cursor(ctx, x, y, s = 1, press = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - press * 0.12), s * (1 - press * 0.12));
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(13, 34); ctx.lineTo(18, 32); ctx.lineTo(13, 21); ctx.lineTo(23, 21); ctx.closePath();
  ctx.fillStyle = '#111'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
function clickRing(ctx, x, y, t, t0, col = C.cyan) {
  const k = prog(t, t0, 0.5); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.strokeStyle = rgba(col, 1 - k); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + 40 * E.out(k), 0, 7); ctx.stroke(); ctx.restore();
}
// cursor path through keyframes [[t,x,y],...]
function path(t, keys) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const a = keys[i - 1], b = keys[i], k = E.inOut((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
}

// ---------- deterministic noise ----------
function rand(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
