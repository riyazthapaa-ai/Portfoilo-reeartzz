// "One idea → entire commercial" hook — editorial / cinematic style. renderFrame(t) draws the frame at t seconds.
const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const cv = document.getElementById('c');
const MAIN = cv.getContext('2d');
let ctx = MAIN;

const C = {
  paper: '#efe7da', paper2: '#e4d8c4', ink: '#16120e', soft: '#6b6155', faint: 'rgba(22,18,14,0.14)',
  gold: '#b8873a', goldL: '#e6c27e', wine: '#7d1f2c', night: '#0c0a09', cream: '#f6efe2',
};
const BAR = 72; // letterbox bar height
const END = 38.4;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const P = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eq = x => 1 - Math.pow(1 - x, 5);
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- primitives ----------
function T(str, x, y, o = {}) {
  const { size = 100, font = 'Serif', style = '', weight = '', color = C.ink, align = 'center', base = 'alphabetic',
    alpha = 1, scale = 1, rot = 0, ls = 0, blur = 0 } = o;
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
  ctx.font = `${style} ${weight} ${size}px ${font}`;
  ctx.textAlign = align; ctx.textBaseline = base; ctx.letterSpacing = ls + 'px';
  if (blur > 0.3) ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = color; ctx.fillText(str, 0, 0);
  ctx.restore();
}
function measure(str, size, font = 'Serif', style = '', weight = '', ls = 0) {
  ctx.font = `${style} ${weight} ${size}px ${font}`; ctx.letterSpacing = ls + 'px';
  return ctx.measureText(str).width;
}
// editorial word reveal: each word rises + un-blurs at its spoken time. ws = [[word, time, color?, style?]]
function words(ws, t, x, y, o = {}) {
  const size = o.size || 100, font = o.font || 'Serif', gap = o.gap ?? size * 0.26;
  const wd = ws.map(w => measure(w[0], size, font, w[3] ?? o.style ?? '', o.weight || '', o.ls || 0));
  const total = wd.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
  ws.forEach((w, i) => {
    const k = P(t, w[1] - 0.04, w[1] + 0.42);
    if (k > 0) T(w[0], cx, y + (1 - eq(k)) * size * 0.35, { ...o, align: 'left', size, font, style: w[3] ?? o.style ?? '', color: w[2] || o.color || C.ink, alpha: eo(k) * (o.alpha ?? 1), blur: (1 - eq(k)) * 10 });
    cx += wd[i] + gap;
  });
  return total;
}
function rr(x, y, w, h, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function withA(a, fn) { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); }
function at(x, y, s, fn, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); fn(); ctx.restore(); }
function hair(x0, y0, x1, y1, col = C.ink, lw = 1.5) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
function label(str, x, y, o = {}) { T(str, x, y, { font: 'JB', size: 18, ls: 4, color: C.soft, align: 'left', ...o }); }

// ---------- the perfume bottle (line art → lit glass) ----------
const BODY = [[-118, -10], [118, -10], [150, 22], [150, 236], [118, 268], [-118, 268], [-150, 236], [-150, 22]];
function polyPath(pts, inset = 0) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const px = x - Math.sign(x) * inset, py = y + (y < 120 ? inset : -inset); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.closePath();
}
// draw = 0..1 line drawing progress, lit = 0..1 glass/liquid fill, dark = ink colour for lines
function bottle(x, y, s, t, draw = 1, lit = 1, o = {}) {
  const line = o.line || C.ink;
  at(x, y, s, () => {
    // shadow
    if (lit > 0) withA(lit * 0.35, () => {
      const sg = ctx.createRadialGradient(0, 290, 10, 0, 290, 230); sg.addColorStop(0, 'rgba(0,0,0,0.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.save(); ctx.scale(1, 0.18); ctx.beginPath(); ctx.arc(0, 290 / 0.18, 240, 0, 7); ctx.fill(); ctx.restore();
    });
    // glass + liquid
    if (lit > 0) withA(lit, () => {
      polyPath(BODY);
      const g = ctx.createLinearGradient(-150, 0, 150, 0);
      g.addColorStop(0, 'rgba(255,248,235,0.25)'); g.addColorStop(0.5, 'rgba(255,248,235,0.06)'); g.addColorStop(1, 'rgba(255,248,235,0.3)');
      ctx.fillStyle = g; ctx.fill();
      ctx.save(); polyPath(BODY, 18); ctx.clip();
      const lg = ctx.createLinearGradient(0, 40, 0, 268);
      lg.addColorStop(0, '#e9b765'); lg.addColorStop(0.55, '#c1803a'); lg.addColorStop(1, '#7a3f17');
      ctx.fillStyle = lg; ctx.fillRect(-160, 40 + Math.sin(t * 1.6) * 3, 320, 260);
      // moving caustic highlight
      const hx = -60 + Math.sin(t * 0.8) * 50;
      const hg = ctx.createLinearGradient(hx - 40, 0, hx + 40, 0);
      hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(0.5, 'rgba(255,250,235,0.55)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hg; ctx.fillRect(hx - 40, -10, 80, 280);
      ctx.restore();
      // cap
      const cg = ctx.createLinearGradient(-58, 0, 58, 0);
      cg.addColorStop(0, '#6e4c1c'); cg.addColorStop(0.35, '#f2d79c'); cg.addColorStop(0.6, '#b8873a'); cg.addColorStop(1, '#5a3c14');
      rr(-58, -196, 116, 136, 6, cg);
      rr(-30, -60, 60, 50, 3, 'rgba(240,225,200,0.5)');
      // label
      rr(-78, 120, 156, 86, 2, 'rgba(246,239,226,0.92)');
      T('N° 01', 0, 160, { size: 34, style: 'italic', color: C.ink });
      T('EAU DE PARFUM', 0, 190, { font: 'JB', size: 11, ls: 3, color: C.soft });
    });
    // line drawing
    if (draw > 0) {
      ctx.save();
      ctx.strokeStyle = line; ctx.lineWidth = 2.5 / s * (o.lw || 1); ctx.lineJoin = 'round';
      const L = 2600; ctx.setLineDash([L * draw, L]);
      polyPath(BODY); ctx.stroke();
      ctx.setLineDash([L * clamp(draw * 1.4 - 0.2), L]); polyPath(BODY, 18); ctx.globalAlpha = 0.45; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.setLineDash([700 * clamp(draw * 1.6 - 0.3), 700]);
      ctx.beginPath(); ctx.rect(-58, -196, 116, 136); ctx.stroke();
      ctx.beginPath(); ctx.rect(-30, -60, 60, 50); ctx.stroke();
      ctx.beginPath(); for (let i = 1; i < 6; i++) { ctx.moveTo(-58 + i * 19.3, -190); ctx.lineTo(-58 + i * 19.3, -66); } ctx.globalAlpha = 0.3; ctx.stroke();
      ctx.restore();
    }
  });
}

// ---------- backgrounds ----------
function paper(t, col = C.paper) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  // faint ruled grid like a director's notebook
  ctx.strokeStyle = 'rgba(22,18,14,0.05)'; ctx.lineWidth = 1;
  ctx.beginPath(); for (let x = 0; x < W; x += 48) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y < H; y += 48) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
}
function night(col = C.night) { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
function bokeh(t, n = 26, a = 1, warm = true) {
  for (let i = 0; i < n; i++) {
    const x = (rnd(i) * W + t * (8 + rnd(i + 2) * 20)) % (W + 200) - 100, y = rnd(i + 9) * H, r = 20 + rnd(i + 4) * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = warm ? '230,180,110' : '255,255,255';
    g.addColorStop(0, `rgba(${c},${0.12 * a * (0.5 + 0.5 * Math.sin(t + i))})`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

// grain / dust / vignette
const GRAIN = [0, 1, 2].map(k => {
  const c = document.createElement('canvas'); c.width = 960; c.height = 540; const g = c.getContext('2d');
  const id = g.createImageData(960, 540); let s = 777 + k * 4321;
  for (let i = 0; i < id.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s / 2147483647) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
});
const VIG = (() => {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const rg = g.createRadialGradient(CX, CY, H * 0.4, CX, CY, H * 1.1);
  rg.addColorStop(0, 'rgba(30,18,8,0)'); rg.addColorStop(1, 'rgba(30,18,8,0.5)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H); return c;
})();
const BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; const bx = BUF.getContext('2d');

// ================= SCENES =================

// A — "This entire commercial started with one idea."
function sA(t) {
  night();
  bokeh(t, 18, P(t, 0.3, 2));
  words([['THIS', 0.0], ['ENTIRE', 0.24], ['COMMERCIAL', 0.76], ['STARTED', 1.24], ['WITH', 1.8]], t, CX, 330, { font: 'JB', size: 22, ls: 9, color: 'rgba(246,239,226,0.7)', gap: 26 });
  // the idea: a single drop of gold light
  const k = P(t, 0.1, 1.6), pulse = P(t, 2.28, 2.9);
  const r = 6 + 6 * eo(k) + 10 * Math.sin(Math.PI * pulse);
  const gl = ctx.createRadialGradient(CX, 470, 0, CX, 470, 120 + 140 * pulse);
  gl.addColorStop(0, `rgba(230,194,126,${0.5 * k})`); gl.addColorStop(1, 'rgba(230,194,126,0)');
  ctx.fillStyle = gl; ctx.fillRect(CX - 300, 170, 600, 600);
  ctx.fillStyle = C.goldL; ctx.beginPath(); ctx.arc(CX, 470, r * eo(k), 0, 7); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const rk = P(t, 2.28 + i * 0.15, 2.28 + i * 0.15 + 0.7);
    if (rk > 0 && rk < 1) { ctx.strokeStyle = `rgba(230,194,126,${0.6 * (1 - rk)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(CX, 470, 20 + rk * 260, 0, 7); ctx.stroke(); }
  }
  words([['one', 2.0, C.cream, 'italic'], ['idea.', 2.28, C.goldL, 'italic']], t, CX, 720, { size: 190 });
}

// B1 — the brief: cinematic perfume ad, product shots
function sB1(t) {
  paper(t);
  // left column: the brief
  label('THE BRIEF  —  01', 160, 200, { alpha: P(t, 3.0, 3.4) });
  hair(160, 220, 160 + 520 * eo(P(t, 3.0, 3.8)), 220, C.ink, 1.5);
  words([['I', 3.0], ['wanted', 3.16], ['to', 3.52], ['create', 3.64]], t, 160, 320, { size: 64, align: 'left', color: C.soft });
  words([['a', 4.04, null, 'italic'], ['cinematic', 4.16, C.gold, 'italic']], t, 160, 450, { size: 138, align: 'left' });
  words([['advertisement', 4.72]], t, 160, 580, { size: 138, align: 'left' });
  words([['for', 5.48, C.soft], ['a', 5.64, C.soft], ['perfume', 5.76, C.wine, 'italic'], ['brand.', 6.24]], t, 160, 700, { size: 90, align: 'left' });
  // product shot tag
  const pk = P(t, 6.84, 7.2);
  withA(pk, () => {
    label('WITH', 160, 820, { size: 18 });
    words([['professional-looking', 6.84, C.ink, 'italic'], ['product', 7.72], ['shots', 8.12, C.gold]], t, 160, 880, { size: 54, align: 'left' });
  });
  // right: the bottle sketch → lit
  const draw = eio(P(t, 3.3, 6.0)), lit = eio(P(t, 6.84, 7.8));
  const bxp = 1380, byp = 470;
  // studio light cone when lit
  withA(lit, () => {
    const lg = ctx.createRadialGradient(bxp, byp - 100, 20, bxp, byp, 620);
    lg.addColorStop(0, 'rgba(255,240,210,0.95)'); lg.addColorStop(1, 'rgba(239,231,218,0)');
    ctx.fillStyle = lg; ctx.fillRect(bxp - 700, 0, 1400, H);
  });
  bottle(bxp, byp, 1.15, t, draw, lit);
  // construction marks while sketching
  withA((1 - lit) * P(t, 3.4, 4.0), () => {
    ctx.setLineDash([6, 8]); hair(bxp - 260, byp + 310, bxp + 260, byp + 310, C.soft, 1); hair(bxp, byp - 300, bxp, byp + 360, C.soft, 1); ctx.setLineDash([]);
    label('Ø 300', bxp + 190, byp + 300, { size: 14 });
    label('H 464', bxp + 30, byp - 270, { size: 14 });
  });
  // camera framing corners lock on when "product shots"
  const fk = eo(P(t, 7.72, 8.2));
  if (fk > 0) {
    const w = lerp(900, 560, fk), h = lerp(1000, 640, fk), x0 = bxp - w / 2, y0 = byp - h / 2 + 30, l = 46;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0, y0 + h, 1, -1], [x0 + w, y0 + h, -1, -1]].forEach(([x, y, dx, dy]) => { ctx.beginPath(); ctx.moveTo(x + dx * l, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * l); ctx.stroke(); });
    withA(fk, () => { ctx.fillStyle = C.wine; ctx.beginPath(); ctx.arc(x0 + 30, y0 + 30, 7, 0, 7); ctx.fill(); label('REC  SHOT 01', x0 + 48, y0 + 36, { size: 15, color: C.ink }); });
  }
}

// storyboard panel with the bottle at a given framing
function panel(x, y, w, h, t, shot, idx, k) {
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 + (1 - eq(k)) * 80); ctx.rotate((1 - eq(k)) * (idx - 1) * 0.08);
  ctx.globalAlpha = eo(k);
  rr(-w / 2 - 14, -h / 2 - 14, w + 28, h + 70, 4, C.cream, 'rgba(22,18,14,0.25)', 1.5);
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#2a1d12'); g.addColorStop(1, '#0d0907'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  const lg = ctx.createRadialGradient(shot.lx * w, -h * 0.2, 10, 0, 0, w * 0.8); lg.addColorStop(0, 'rgba(240,200,140,0.45)'); lg.addColorStop(1, 'rgba(240,200,140,0)'); ctx.fillStyle = lg; ctx.fillRect(-w / 2, -h / 2, w, h);
  bottle(shot.x * w, shot.y * h, shot.s, t + idx, 0, 1);
  ctx.restore();
  T(shot.n, -w / 2, h / 2 + 40, { font: 'JB', weight: 700, size: 16, ls: 3, align: 'left', color: C.ink });
  T(shot.d, w / 2, h / 2 + 40, { size: 26, style: 'italic', align: 'right', color: C.soft });
  ctx.restore();
}
const SHOTS = [
  { n: 'SHOT 01 · WIDE', d: 'hero on stone', x: 0, y: 0.12, s: 0.42, lx: -0.2 },
  { n: 'SHOT 02 · MACRO', d: 'the gold cap', x: 0.05, y: 0.75, s: 1.6, lx: 0.3 },
  { n: 'SHOT 03 · LOW', d: 'looking up', x: -0.12, y: 0.0, s: 0.8, lx: 0.1 },
];
// B2 — different camera angles, consistent visual style
function sB2(t) {
  paper(t);
  words([['different', 8.44, C.ink, 'italic'], ['camera', 8.8], ['angles,', 9.16]], t, CX, 210, { size: 96 });
  const pw = 460, ph = 300, gx = 70, x0 = CX - (pw * 3 + gx * 2) / 2;
  SHOTS.forEach((s, i) => panel(x0 + i * (pw + gx), 330, pw, ph, t, s, i, P(t, 8.44 + i * 0.3, 8.44 + i * 0.3 + 0.6)));
  // consistent visual style: a gold thread + palette strip binding the frames
  const ck = eo(P(t, 9.8, 10.5));
  if (ck > 0) {
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x0 - 40, 760); ctx.lineTo(x0 - 40 + (pw * 3 + gx * 2 + 80) * ck, 760); ctx.stroke();
    for (let i = 0; i < 3; i++) if (ck > (i + 0.5) / 3) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x0 + pw / 2 + i * (pw + gx), 760, 7, 0, 7); ctx.fill(); }
    const sw = ['#16120e', '#7a3f17', '#c1803a', '#e6c27e', '#efe7da'];
    sw.forEach((c, i) => { const k2 = P(t, 10.3 + i * 0.07, 10.6 + i * 0.07); if (k2 > 0) rr(CX - 190 + i * 76, 800 + (1 - eo(k2)) * 20, 64, 64, 32, c, 'rgba(22,18,14,0.3)', 1.5); });
  }
  words([['and', 9.56, C.soft], ['a', 9.72, C.soft], ['consistent', 9.8, C.gold, 'italic'], ['visual', 10.4], ['style.', 10.84]], t, CX, 960, { size: 72 });
}

// C — one good image is only the beginning
function sC(t) {
  night('#0f0d0b');
  bokeh(t, 14, 0.6);
  words([['But', 11.6], ['when', 11.92], ["you're", 12.12], ['working', 12.4], ['with', 12.76], ['AI,', 13.06, C.goldL]], t, CX, 190, { size: 62, color: 'rgba(246,239,226,0.8)' });
  // pull back: z goes from 1 to 0.42 on "the beginning"
  const z = lerp(1, 0.42, eio(P(t, 15.0, 15.9)));
  const fw = 620, fh = 420;
  ctx.save(); ctx.translate(CX, 570); ctx.scale(z, z);
  // empty slots revealed by pull-back
  for (let i = 1; i <= 8; i++) {
    const a = P(t, 15.1 + i * 0.05, 15.5 + i * 0.05);
    withA(a, () => {
      ctx.setLineDash([14, 12]); rr(i * (fw + 80) - fw / 2, -fh / 2, fw, fh, 6, null, 'rgba(246,239,226,0.35)', 3); ctx.setLineDash([]);
      T(String(i + 1).padStart(2, '0'), i * (fw + 80), 30, { font: 'JB', size: 60, color: 'rgba(246,239,226,0.2)' });
    });
  }
  // the one good image
  const ik = eo(P(t, 13.36, 14.0));
  if (ik > 0) {
    ctx.save(); ctx.globalAlpha = ik; ctx.translate(0, (1 - ik) * -60); ctx.rotate((1 - ik) * -0.05);
    rr(-fw / 2 - 18, -fh / 2 - 18, fw + 36, fh + 100, 4, C.cream);
    ctx.save(); ctx.beginPath(); ctx.rect(-fw / 2, -fh / 2, fw, fh); ctx.clip();
    const g = ctx.createLinearGradient(0, -fh / 2, 0, fh / 2); g.addColorStop(0, '#3a2614'); g.addColorStop(1, '#0d0907'); ctx.fillStyle = g; ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
    const dev = P(t, 13.5, 14.4); // "developing" photo
    bottle(0, 10, 0.62, t, 0, dev);
    ctx.fillStyle = `rgba(246,239,226,${(1 - dev) * 0.9})`; ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
    ctx.restore();
    T('IMAGE_01.png', -fw / 2, fh / 2 + 56, { font: 'JB', weight: 700, size: 20, ls: 2, align: 'left' });
    const gk = P(t, 14.12, 14.4);
    if (gk > 0) T('one good image ✓', fw / 2, fh / 2 + 58, { size: 34, style: 'italic', align: 'right', color: C.gold, alpha: gk });
    ctx.restore();
  }
  ctx.restore();
  words([['is', 14.72, 'rgba(246,239,226,0.7)'], ['only', 14.92, 'rgba(246,239,226,0.7)'], ['the', 15.16, 'rgba(246,239,226,0.7)'], ['beginning.', 15.36, C.goldL, 'italic']], t, CX, 960, { size: 96 });
}

// D — more shots, video clips, bring everything together
function sD(t) {
  night('#0f0d0b');
  const items = [];
  for (let i = 0; i < 12; i++) {
    const isClip = i >= 6;
    const t0 = isClip ? 17.7 + (i - 6) * 0.08 : 17.06 + i * 0.07;
    const gx = (i % 6), gy = Math.floor(i / 6);
    items.push({ i, isClip, t0, x: 220 + gx * 262, y: 380 + gy * 210 });
  }
  const tog = eio(P(t, 19.3, 20.2)); // fly into timeline
  // timeline
  const tlY = 760;
  withA(P(t, 19.2, 19.6), () => {
    rr(160, tlY - 20, 1600, 250, 10, '#17130f', 'rgba(246,239,226,0.15)', 1.5);
    ['V2', 'V1', 'A1'].forEach((n, r) => { T(n, 190, tlY + 30 + r * 72, { font: 'JB', weight: 700, size: 16, ls: 2, align: 'left', color: 'rgba(246,239,226,0.5)' }); hair(240, tlY + 52 + r * 72, 1730, tlY + 52 + r * 72, 'rgba(246,239,226,0.08)', 1); });
    // audio waveform
    ctx.fillStyle = 'rgba(184,135,58,0.6)';
    for (let x = 0; x < 1480 * tog; x += 6) { const a = 6 + Math.abs(Math.sin(x * 0.05) * Math.sin(x * 0.013)) * 22; ctx.fillRect(250 + x, tlY + 168 - a / 2, 3, a); }
    const ph = 250 + ((t - 19.3) * 500) % 1480;
    if (tog > 0.9) hair(ph, tlY - 20, ph, tlY + 230, C.goldL, 2);
  });
  items.forEach(it => {
    const k = eq(P(t, it.t0, it.t0 + 0.45));
    if (k <= 0) return;
    const tw = 230, th = 150;
    const tx = 250 + it.i * 122, ty = it.isClip ? tlY + 8 : tlY + 82;
    const x = lerp(it.x, tx, tog), y = lerp(it.y, ty, tog);
    const w = lerp(tw, 118, tog), h = lerp(th, 52, tog);
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 40);
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.clip();
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, it.isClip ? '#3b2a17' : '#2a1d12'); g.addColorStop(1, '#0d0907'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const lx = x + w * (0.3 + 0.4 * rnd(it.i)) + (it.isClip ? Math.sin(t * 2 + it.i) * w * 0.15 : 0);
    const lg = ctx.createRadialGradient(lx, y + h * 0.3, 2, lx, y + h * 0.5, w * 0.6); lg.addColorStop(0, 'rgba(240,200,140,0.6)'); lg.addColorStop(1, 'rgba(240,200,140,0)'); ctx.fillStyle = lg; ctx.fillRect(x, y, w, h);
    bottle(x + w * (0.35 + 0.3 * rnd(it.i + 3)), y + h * (0.45 + 0.25 * rnd(it.i + 5)), (h / 160) * (0.2 + rnd(it.i + 1) * 0.35), t, 0, 1);
    ctx.restore();
    if (it.isClip && tog < 0.5) withA(1 - tog * 2, () => {
      ctx.fillStyle = 'rgba(246,239,226,0.9)'; ctx.beginPath(); ctx.moveTo(x + 14, y + h - 34); ctx.lineTo(x + 34, y + h - 24); ctx.lineTo(x + 14, y + h - 14); ctx.fill();
      T(`00:0${3 + (it.i % 5)}`, x + w - 12, y + h - 16, { font: 'JB', size: 14, align: 'right', color: C.cream });
    });
    ctx.restore();
  });
  // copy
  withA(1 - P(t, 18.15, 18.4), () => {
    words([['You', 16.1, 'rgba(246,239,226,0.6)'], ['still', 16.42, 'rgba(246,239,226,0.6)'], ['need', 16.74, 'rgba(246,239,226,0.6)']], t, 240, 190, { size: 58, align: 'left' });
    words([['more', 17.06, C.cream, 'italic'], ['shots,', 17.22, C.cream], ['video', 17.7, C.goldL, 'italic'], ['clips', 17.98, C.goldL]], t, 240, 300, { size: 100, align: 'left' });
  });
  words([['and', 18.42, 'rgba(246,239,226,0.6)'], ['a', 18.58, 'rgba(246,239,226,0.6)'], ['way', 18.7, 'rgba(246,239,226,0.6)'], ['to', 18.86, 'rgba(246,239,226,0.6)'], ['bring', 19.02, C.cream], ['everything', 19.3, C.cream, 'italic'], ['together.', 19.78, C.goldL, 'italic']], t, CX, 250, { size: 84 });
}

// E — every new generation repeats the process (the loop)
const STEPS = ['write the prompt', 'set the style', 'pick the model', 'tweak settings', 'generate'];
function sE(t) {
  paper(t, '#ebe2d3');
  const cx = 1240, cy = 560, R = 290;
  const gen = Math.max(0, Math.floor((t - 22.04) / 0.9) + 1);
  const spin = (t - 20.6) * (0.6 + P(t, 22.04, 24.0) * 2.2);
  // ring
  withA(P(t, 20.6, 21.0), () => {
    ctx.strokeStyle = 'rgba(22,18,14,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    // arrowhead chase
    const a = spin;
    ctx.strokeStyle = C.wine; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R, a, a + 1.2); ctx.stroke();
    const ex = cx + Math.cos(a + 1.2) * R, ey = cy + Math.sin(a + 1.2) * R, d = a + 1.2 + Math.PI / 2;
    ctx.fillStyle = C.wine; ctx.beginPath(); ctx.moveTo(ex + Math.cos(d) * 20, ey + Math.sin(d) * 20); ctx.lineTo(ex + Math.cos(d + 2.4) * 16, ey + Math.sin(d + 2.4) * 16); ctx.lineTo(ex + Math.cos(d - 2.4) * 16, ey + Math.sin(d - 2.4) * 16); ctx.fill();
    STEPS.forEach((s, i) => {
      const ang = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      const x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
      const hot = Math.abs(((a + 1.2 - ang) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) < 0.5;
      rr(x - 130, y - 30, 260, 60, 30, hot ? C.ink : C.cream, 'rgba(22,18,14,0.4)', 1.5);
      T(s, x, y + 10, { size: 30, style: 'italic', color: hot ? C.cream : C.ink });
    });
    T(gen > 0 ? `GEN ${String(gen).padStart(2, '0')}` : 'GEN 01', cx, cy - 6, { font: 'JB', weight: 700, size: 44, ls: 4, color: C.ink });
    T(gen > 1 ? 'starting over…' : 'new generation', cx, cy + 44, { size: 34, style: 'italic', color: C.wine });
  });
  // stacked "again" ghosts on repeating
  const rk = P(t, 23.64, 24.2);
  if (rk > 0) for (let i = 0; i < 5; i++) T('again.', 1690, 330 + i * 70, { align: 'left', size: 54, style: 'italic', color: C.wine, alpha: P(t, 23.64 + i * 0.12, 23.9 + i * 0.12) * (1 - i * 0.15) });
  // copy (left)
  words([['And', 20.6, C.soft], ['every', 20.88], ['time', 21.24]], t, 160, 300, { size: 80, align: 'left' });
  words([['you', 21.44, C.soft], ['start', 21.64], ['a', 21.96, C.soft], ['new', 22.04, C.ink, 'italic']], t, 160, 400, { size: 80, align: 'left' });
  words([['generation,', 22.24, C.ink, 'italic']], t, 160, 500, { size: 80, align: 'left' });
  words([["you're", 22.8, C.soft], ['potentially', 23.08, C.soft]], t, 160, 650, { size: 56, align: 'left' });
  words([['repeating', 23.64, C.wine, 'italic']], t, 160, 760, { size: 120, align: 'left' });
  words([['parts', 24.12], ['of', 24.4], ['the', 24.52], ['process.', 24.68, C.ink, 'italic']], t, 160, 860, { size: 64, align: 'left' });
}

// F — "So today, I'm trying a different approach."
function sF(t) {
  paper(t);
  // the loop unrolls into a straight line
  const k = eio(P(t, 25.4, 26.6));
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  ctx.beginPath();
  const R = 120 * (1 - k) + 1;
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const ang = -Math.PI / 2 + u * Math.PI * 2 * (1 - k);
    const xc = CX + (u - 0.5) * 1400 * k + Math.cos(ang) * R * (1 - k);
    const yc = 420 + Math.sin(ang) * R * (1 - k) + R * (1 - k) * 0;
    i ? ctx.lineTo(xc, yc) : ctx.moveTo(xc, yc);
  }
  ctx.stroke();
  if (k > 0.95) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(CX + 700, 420, 9, 0, 7); ctx.fill(); }
  words([['So', 25.4, C.soft], ['today,', 25.6, C.soft], ["I'm", 26.04, C.soft], ['trying', 26.32, C.soft]], t, CX, 560, { size: 64 });
  words([['a', 26.64, C.ink, 'italic'], ['different', 26.8, C.gold, 'italic'], ['approach.', 27.24, C.ink, 'italic']], t, CX, 760, { size: 180 });
}

// node card for the flow canvas
function node(x, y, w, kind, title, sub, k, t, hot = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= eo(k); ctx.translate(x, y); const s = lerp(0.85, 1, eq(k)); ctx.scale(s, s);
  const h = 128;
  ctx.shadowColor = 'rgba(30,18,8,0.18)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  rr(-w / 2, -h / 2, w, h, 16, C.cream, hot > 0 ? `rgba(184,135,58,${0.4 + 0.6 * hot})` : 'rgba(22,18,14,0.2)', hot > 0 ? 3 : 1.5);
  ctx.shadowColor = 'transparent';
  const col = { idea: C.gold, prompt: C.ink, image: '#7a3f17', video: C.wine, voice: '#3d4a3a', out: C.ink }[kind];
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-w / 2 + 30, -h / 2 + 32, 8, 0, 7); ctx.fill();
  T(kind.toUpperCase(), -w / 2 + 48, -h / 2 + 38, { font: 'JB', weight: 700, size: 15, ls: 3, align: 'left', color: C.soft });
  T(title, -w / 2 + 26, 22, { size: 42, style: 'italic', align: 'left', color: C.ink });
  T(sub, -w / 2 + 26, 50, { font: 'JB', size: 14, align: 'left', color: C.soft });
  // ports
  ctx.fillStyle = C.cream; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
  [[-w / 2, 0], [w / 2, 0]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, 8, 0, 7); ctx.fill(); ctx.stroke(); });
  ctx.restore();
}
function bez(a, b, u) {
  const c1 = [a[0] + 140, a[1]], c2 = [b[0] - 140, b[1]], m = 1 - u;
  return [m * m * m * a[0] + 3 * m * m * u * c1[0] + 3 * m * u * u * c2[0] + u * u * u * b[0], m * m * m * a[1] + 3 * m * m * u * c1[1] + 3 * m * u * u * c2[1] + u * u * u * b[1]];
}
function cable(a, b, p, t, pulseT) {
  if (p <= 0) return;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let i = 0; i <= 40 * p; i++) { const q = bez(a, b, i / 40); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
  ctx.stroke();
  if (p >= 1 && pulseT !== undefined && pulseT >= 0 && pulseT <= 1) {
    const q = bez(a, b, pulseT);
    const g = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 26); g.addColorStop(0, 'rgba(230,194,126,1)'); g.addColorStop(1, 'rgba(230,194,126,0)');
    ctx.fillStyle = g; ctx.fillRect(q[0] - 26, q[1] - 26, 52, 52);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, 7); ctx.fill();
  }
}

// G — reusable AI workflow → one idea becomes an entire commercial
function sG(t) {
  paper(t);
  // dotted canvas
  ctx.fillStyle = 'rgba(22,18,14,0.12)';
  for (let x = 24; x < W; x += 40) for (let y = 24; y < H; y += 40) ctx.fillRect(x, y, 2, 2);
  const join = eio(P(t, 30.92, 32.3)); // separate → arranged flow
  const NW = 300;
  const nodes = [
    { kind: 'idea', title: 'one idea', sub: 'perfume · cinematic', sep: [300, 270], pos: [250, 500], t0: 28.0 },
    { kind: 'prompt', title: 'the brief', sub: 'style · palette · tone', sep: [860, 690], pos: [620, 500], t0: 28.25 },
    { kind: 'image', title: 'product shots', sub: 'image model', sep: [1520, 300], pos: [990, 320], t0: 28.6 },
    { kind: 'video', title: 'video clips', sub: 'video model', sep: [1180, 450], pos: [990, 640], t0: 29.28 },
    { kind: 'voice', title: 'voiceover', sub: 'voice model', sep: [420, 760], pos: [990, 800], t0: 29.76 },
    { kind: 'out', title: 'commercial', sub: 'final edit', sep: [1620, 770], pos: [1520, 500], t0: 30.0 },
  ];
  nodes.forEach((n, i) => {
    const drift = (1 - join) * 14;
    n.x = lerp(n.sep[0], n.pos[0], join) + Math.sin(t * 0.9 + i) * drift;
    n.y = lerp(n.sep[1], n.pos[1], join) + Math.cos(t * 0.7 + i * 2) * drift;
  });
  // "separately" dashed isolation rings
  withA((1 - join) * P(t, 29.76, 30.1), () => {
    ctx.setLineDash([8, 10]); ctx.strokeStyle = C.wine; ctx.lineWidth = 1.5;
    nodes.forEach(n => { ctx.beginPath(); ctx.ellipse(n.x, n.y, NW / 2 + 40, 104, 0, 0, 7); ctx.stroke(); });
    ctx.setLineDash([]);
  });
  // cables
  const links = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]];
  const run = (t - 35.04) / 2.0; // signal run on "one creative idea → commercial"
  links.forEach(([a, b], i) => {
    const A = [nodes[a].x + NW / 2, nodes[a].y], B = [nodes[b].x - NW / 2, nodes[b].y];
    const p = eo(P(t, 31.6 + i * 0.12, 32.2 + i * 0.12));
    const stage = a === 0 ? 0 : a === 1 ? 1 : 2;
    const pt = run * 3 - stage;
    cable(A, B, p, t, run > 0 ? pt : undefined);
    // idle pulse after connecting (reusable flow is "alive")
    if (p >= 1 && run <= 0) { const q = bez(A, B, ((t * 0.6) + i * 0.17) % 1); ctx.fillStyle = 'rgba(184,135,58,0.8)'; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill(); }
  });
  nodes.forEach((n, i) => {
    let hot = 0;
    if (run > 0) { const stage = i === 0 ? 0 : i === 1 ? 1 : i === 5 ? 3.2 : 2; hot = clamp(1 - Math.abs(run * 3 - stage) * 1.2); }
    if (i === 0) hot = Math.max(hot, P(t, 35.04, 35.4) * (1 - P(t, 36.0, 36.4)));
    node(n.x, n.y, NW, n.kind, n.title, n.sub, P(t, n.t0, n.t0 + 0.5), t, hot);
  });
  // ARTLIST FLOWS tag
  const ak = P(t, 33.16, 33.6);
  if (ak > 0 && P(t, 36.5, 36.8) < 1) at(CX, 175, lerp(0.9, 1, eq(ak)), () => {
    ctx.globalAlpha = eo(ak) * (1 - P(t, 36.5, 36.8));
    rr(-210, -34, 420, 68, 34, C.ink);
    T('using ARTLIST FLOWS', 0, 11, { font: 'JB', weight: 700, size: 22, ls: 2, color: C.cream });
  });
  // copy along bottom
  withA(1 - P(t, 30.2, 30.35), () => words([['Instead', 28.0, C.soft], ['of', 28.4, C.soft], ['generating', 28.6], ['everything', 29.28], ['separately,', 29.76, C.wine, 'italic']], t, CX, 950, { size: 58 }));
  withA(P(t, 30.25, 30.4) * (1 - P(t, 33.85, 34.0)), () => words([["I'm", 30.28, C.soft], ['going', 30.56, C.soft], ['to', 30.76, C.soft], ['build', 30.92], ['a', 31.2], ['reusable', 31.28, C.gold, 'italic'], ['AI', 31.92], ['workflow', 32.28, C.ink, 'italic']], t, CX, 950, { size: 58 }));
  withA(P(t, 34.0, 34.1), () => words([['and', 34.0, C.soft], ['see', 34.12, C.soft], ['if', 34.28, C.soft], ['I', 34.44, C.soft], ['can', 34.6, C.soft], ['turn', 34.8], ['one', 35.04, C.gold, 'italic'], ['creative', 35.28, C.gold, 'italic'], ['idea', 35.76, C.gold, 'italic']], t, CX, 950, { size: 58 }));
  // finale: output node blooms into a letterboxed film frame
  const fk = eio(P(t, 36.5, 37.3));
  if (fk > 0) {
    const o = nodes[5];
    const w = lerp(NW, W, fk), h = lerp(128, H, fk), x = lerp(o.x, CX, fk), y = lerp(o.y, CY, fk);
    ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 16 * (1 - fk)); ctx.clip();
    const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#2b1c10'); g.addColorStop(1, '#070504'); ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    bokeh(t, 22, 1.5);
    const lg = ctx.createRadialGradient(CX + 300, 300, 20, CX + 300, 560, 800); lg.addColorStop(0, 'rgba(240,200,140,0.45)'); lg.addColorStop(1, 'rgba(240,200,140,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    bottle(lerp(o.x, CX + 380, fk), lerp(o.y, 560, fk), lerp(0.15, 1.05 + (t - 37.3) * 0.03, fk), t, 0, 1);
    ctx.restore();
    withA(P(t, 36.64, 37.0), () => {
      words([['into', 36.24, 'rgba(246,239,226,0.7)'], ['an', 36.48, 'rgba(246,239,226,0.7)']], t, 260, 430, { size: 64, align: 'left' });
      words([['entire', 36.64, C.cream, 'italic']], t, 260, 590, { size: 170, align: 'left' });
      words([['commercial.', 37.08, C.goldL, 'italic']], t, 260, 760, { size: 170, align: 'left' });
    });
  }
  const bk = P(t, 37.9, 38.4);
  if (bk > 0) { ctx.fillStyle = `rgba(0,0,0,${bk})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- timeline & transitions ----------
const SCENES = [
  [0, sA, 'ONE IDEA'], [3.0, sB1, 'THE BRIEF'], [8.44, sB2, 'THE SHOTS'], [11.6, sC, 'THE BEGINNING'],
  [16.1, sD, 'THE EDIT'], [20.6, sE, 'THE LOOP'], [25.4, sF, 'THE TURN'], [28.0, sG, 'THE FLOW'],
];
const TRANS = { 3.0: 'iris', 8.44: 'wipe', 11.6: 'wipe', 16.1: 'dissolve', 20.6: 'wipe', 25.4: 'dissolve', 28.0: 'iris' };
const TD = 0.55;

function drawInto(target, fn, t) { const prev = ctx; ctx = target; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; fn(t); ctx = prev; }

function renderFrame(t) {
  ctx = MAIN;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let idx = 0; SCENES.forEach((s, i) => { if (t >= s[0]) idx = i; });
  const [start, fn] = SCENES[idx];
  const kind = TRANS[start], k = (t - start) / TD;
  // slow push-in on every scene (camera breathing)
  const push = 1 + 0.025 * P(t, start, start + 6);
  const drawScene = (f, tt) => { ctx.save(); ctx.translate(CX, CY); ctx.scale(push, push); ctx.translate(-CX, -CY); f(tt); ctx.restore(); };
  if (kind && k < 1 && idx > 0) {
    drawScene(SCENES[idx - 1][1], t);
    drawInto(bx, tt => drawScene(fn, tt), t);
    const e = eio(clamp(k));
    ctx.save();
    if (kind === 'dissolve') { ctx.globalAlpha = e; ctx.drawImage(BUF, 0, 0); }
    else if (kind === 'iris') {
      const r = e * Math.hypot(CX, CY) * 1.05;
      ctx.beginPath(); ctx.arc(CX, idx === 1 ? 470 : CY, r, 0, 7); ctx.clip(); ctx.drawImage(BUF, 0, 0);
      ctx.restore(); ctx.save();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CX, idx === 1 ? 470 : CY, r, 0, 7); ctx.stroke();
    } else {
      const x = e * (W + 200) - 100;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x + 100, 0); ctx.lineTo(x - 100, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip(); ctx.drawImage(BUF, 0, 0);
      ctx.restore(); ctx.save();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 100, 0); ctx.lineTo(x - 100, H); ctx.stroke();
    }
    ctx.restore();
  } else drawScene(fn, t);

  // film finish
  ctx.drawImage(VIG, 0, 0);
  ctx.save(); ctx.globalAlpha = 0.06; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(GRAIN[Math.floor(t * 24) % 3], 0, 0, W, H); ctx.restore();
  // dust specks
  const f = Math.floor(t * 24);
  for (let i = 0; i < 3; i++) if (rnd(f * 7 + i) > 0.7) { ctx.fillStyle = 'rgba(20,14,8,0.35)'; ctx.beginPath(); ctx.arc(rnd(f + i * 3) * W, rnd(f * 2 + i) * H, 1 + rnd(f + i) * 2.5, 0, 7); ctx.fill(); }
  // letterbox + slate text
  const bar = BAR * eo(P(t, 0, 0.8));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  withA(P(t, 0.5, 1.2) * (1 - P(t, 37.9, 38.3)), () => {
    const sc = SCENES[idx];
    T(`SC. ${String(idx + 1).padStart(2, '0')}  —  ${sc[2]}`, 64, bar / 2 + 6, { font: 'JB', size: 15, ls: 5, align: 'left', color: 'rgba(246,239,226,0.65)' });
    T('ONE IDEA → ONE COMMERCIAL', W - 64, bar / 2 + 6, { font: 'JB', size: 15, ls: 5, align: 'right', color: 'rgba(246,239,226,0.45)' });
    const fr = Math.floor(t * 24);
    T(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t) % 60).padStart(2, '0')}:${String(fr % 24).padStart(2, '0')}`, 64, H - bar / 2 + 6, { font: 'JB', size: 15, ls: 4, align: 'left', color: 'rgba(246,239,226,0.45)' });
    // progress hairline
    ctx.fillStyle = 'rgba(246,239,226,0.15)'; ctx.fillRect(260, H - bar / 2, W - 520, 2);
    ctx.fillStyle = C.goldL; ctx.fillRect(260, H - bar / 2, (W - 520) * (t / END), 2);
    SCENES.forEach(s => { ctx.fillStyle = 'rgba(246,239,226,0.5)'; ctx.fillRect(260 + (W - 520) * s[0] / END, H - bar / 2 - 4, 2, 10); });
  });
}
window.renderFrame = renderFrame;
window.END = END;
window.fontsReady = Promise.all(['italic 100px Serif', '100px Serif', '700 20px JB', '400 20px JB'].map(f => document.fonts.load(f)));
