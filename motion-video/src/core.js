// Main video infrastructure: VO timing lookups, background, chapter HUD, shared UI pieces.
const TM = window.TIMING;
const S = i => TM[i].s, EN = i => TM[i].e;
// start time of the n-th token in sentence i that starts with w (lowercase, alnum only)
function WT(i, w, n = 0) {
  let c = 0;
  for (const [s, a] of TM[i].tok) if (s.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(w) && c++ === n) return a;
  console.log('W miss', i, w); return TM[i].s;
}
const hexMix = (a, b, k) => '#' + [1, 3, 5].map(i => Math.round(lerp(parseInt(a.slice(i, i + 2), 16), parseInt(b.slice(i, i + 2), 16), clamp(k))).toString(16).padStart(2, '0')).join('');
const win = (t, a, b, din = 0.45, dout = 0.4) => env(t, a, b, din, dout);

// ---------- background ----------
let _dots = null, _vig = null;
function bg(ctx, t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  glow(ctx, 1450 + Math.sin(t * 0.13) * 260, 260 + Math.cos(t * 0.11) * 140, 980, C.violet, 0.2);
  glow(ctx, 380 + Math.cos(t * 0.09) * 240, 900 + Math.sin(t * 0.07) * 60, 860, C.cyan, 0.09);
  if (!_dots) {
    _dots = mkCanvas(W + 96, H + 96); const d = _dots.getContext('2d'); d.fillStyle = 'rgba(255,255,255,0.055)';
    for (let x = 0; x < W + 96; x += 48) for (let y = 0; y < H + 96; y += 48) d.fillRect(x, y, 2, 2);
    _vig = mkCanvas(); const v = _vig.getContext('2d'); const g = v.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.7)'); v.fillStyle = g; v.fillRect(0, 0, W, H);
  }
  ctx.drawImage(_dots, -((t * 6) % 48), -((t * 3) % 48));
}
function vignette(ctx) { ctx.drawImage(_vig, 0, 0); }

// ---------- chapters (top-right HUD + bottom progress) ----------
const CHAPTERS = [[0, 'The problem'], [35.05, 'The test'], [64.1, 'Before & after'], [111.5, 'Cost'], [160.85, 'Canvas editing'],
  [202.3, 'Timeline'], [230.85, 'Agent instructions'], [264.6, 'Polish'], [295.1, 'Export'], [330.15, 'Verdict']];
const END = 410.5;
function hud(ctx, t) {
  let ci = 0; CHAPTERS.forEach((c, i) => { if (t >= c[0]) ci = i; });
  const c0 = CHAPTERS[ci][0], k = A(t, c0 + 0.2, 0.6, E.expo);
  const a = Math.min(A(t, 1.0, 0.8), 1 - A(t, END - 3, 1));
  withA(ctx, a, () => {
    const label = CHAPTERS[ci][1].toUpperCase(), num = String(ci + 1).padStart(2, '0');
    font(ctx, 18, 600, MONO); ctx.letterSpacing = '3px';
    const lw = ctx.measureText(label).width; ctx.letterSpacing = '0px';
    const x = 1860;
    withA(ctx, k, () => {
      txt(ctx, label, x, 66 - (1 - k) * 12, { size: 18, weight: 600, fam: MONO, color: C.dim, align: 'right', ls: 3 });
      txt(ctx, num, x - lw - 22, 66 - (1 - k) * 12, { size: 18, weight: 700, fam: MONO, color: C.lime, align: 'right', ls: 2 });
    });
    // progress bar with chapter ticks
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, H - 4, W, 4);
    const pg = ctx.createLinearGradient(0, 0, W, 0); pg.addColorStop(0, C.violet); pg.addColorStop(1, C.cyan);
    ctx.fillStyle = pg; ctx.fillRect(0, H - 4, W * clamp(t / END), 4);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; CHAPTERS.forEach(c => ctx.fillRect(W * c[0] / END - 1, H - 4, 3, 4));
  });
}

// ---------- shared UI ----------
function kicker(ctx, label, t, t0, o = {}) {
  const k = A(t, t0, 0.6, E.expo); if (k <= 0) return;
  const y = o.y ?? 112, col = o.col || C.lime;
  withA(ctx, k, () => {
    font(ctx, 20, 600, MONO); ctx.letterSpacing = '4px'; const w = ctx.measureText(label.toUpperCase()).width; ctx.letterSpacing = '0px';
    const x = (o.x ?? W / 2) - (w + 34) / 2;
    ctx.beginPath(); ctx.arc(x + 6, y - 7, 6, 0, 7); ctx.fillStyle = col; ctx.fill();
    txt(ctx, label.toUpperCase(), x + 30, y, { size: 20, weight: 600, fam: MONO, color: C.dim, ls: 4 });
    ctx.fillStyle = rgba(col, 0.5); ctx.fillRect(x + 30, y + 16, w * E.out(k), 2);
  });
}
// centered big statement, word reveal
function say(ctx, s, y, t, t0, o = {}) { return wordsIn(ctx, s, o.x ?? W / 2, y, t, t0, { align: 'center', size: 96, weight: 850, ...o }); }
function fadeTxt(ctx, s, x, y, t, t0, o = {}) {
  const k = A(t, t0, o.d ?? 0.5); if (k <= 0) return;
  withA(ctx, k, () => txt(ctx, s, x, y + (1 - k) * (o.rise ?? 16), { size: 30, weight: 500, fam: BODY, color: C.dim, ...o }));
}
// check / cross chip that pops in
function chip(ctx, label, x, y, t, t0, o = {}) {
  const k = A(t, t0, 0.55, E.back); if (k <= 0) return 0;
  const size = o.size || 28, col = o.col || C.lime, bad = o.bad;
  let w = 0;
  at(ctx, x, y, 0.7 + 0.3 * k, () => withA(ctx, clamp(k * 1.6), () => {
    const tw0 = tw(ctx, label, size, 650, BODY), h = size * 2.1;
    w = tw0 + size * 2.9;
    const bx = o.align === 'left' ? 0 : -w / 2;
    rrect(ctx, bx, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || 'rgba(255,255,255,0.06)'; ctx.fill();
    ctx.strokeStyle = rgba(col, 0.45); ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx + size * 1.05, 0, size * 0.62, 0, 7); ctx.fillStyle = rgba(col, 0.18); ctx.fill();
    if (bad) iCross(ctx, bx + size * 1.05, 0, size * 0.7, col); else iCheck(ctx, bx + size * 1.05, 0, size * 0.8, col, A(t, t0 + 0.15, 0.4));
    txt(ctx, label, bx + size * 2.0, size * 0.36, { size, weight: 650, fam: BODY, color: o.color || C.ink });
    if (o.strike) { const sk = A(t, o.strike, 0.4); ctx.fillStyle = C.red; ctx.fillRect(bx + size * 1.9, -2, (tw0 + 10) * sk, 4); }
  }));
  return w;
}
function appWindow(ctx, x, y, w, h, tab, o = {}) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
  rrect(ctx, x, y, w, h, 20); ctx.fillStyle = '#10101a'; ctx.fill(); ctx.restore();
  rrect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 20); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y + 54, w, 1);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 28 + i * 22, y + 27, 7, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  const tabs = ['Canvas', 'Timeline', 'Agent'];
  let tx = x + w / 2 - 210;
  tabs.forEach(n => {
    const on = n === tab, tw0 = tw(ctx, n, 19, 600, BODY);
    if (on) { rrect(ctx, tx - 16, y + 12, tw0 + 32, 32, 9); ctx.fillStyle = 'rgba(139,92,255,0.22)'; ctx.fill(); }
    txt(ctx, n, tx, y + 34, { size: 19, weight: 600, fam: BODY, color: on ? C.ink : C.faint });
    tx += tw0 + 70;
  });
  txt(ctx, o.file || 'promo_v1.project', x + w - 28, y + 34, { size: 17, weight: 500, fam: MONO, color: C.faint, align: 'right' });
}
function sectionLabel(ctx, s, x, y, col = C.faint) { txt(ctx, s.toUpperCase(), x, y, { size: 15, weight: 600, fam: MONO, color: col, ls: 2.5 }); }
// map full-frame (1920) coordinate into a rect
const mapX = (r, x) => r[0] + x * r[2] / W, mapY = (r, y) => r[1] + y * r[3] / H;
function selBox(ctx, x, y, w, h, col = C.cyan, k = 1) {
  if (k <= 0) return;
  withA(ctx, k, () => {
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.strokeRect(x, y, w, h); ctx.setLineDash([]);
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([a, b]) => { ctx.fillStyle = '#fff'; ctx.fillRect(a - 6, b - 6, 12, 12); ctx.strokeStyle = col; ctx.strokeRect(a - 6, b - 6, 12, 12); });
  });
}
function arrowLine(ctx, x0, y0, x1, y1, k, col = C.ink, lw = 3) {
  if (k <= 0) return;
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); ctx.lineTo(x - Math.cos(a - 0.5) * 16, y - Math.sin(a - 0.5) * 16); ctx.lineTo(x - Math.cos(a + 0.5) * 16, y - Math.sin(a + 0.5) * 16); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function numBadge(ctx, n, x, y, t, t0, col = C.lime) {
  const k = A(t, t0, 0.5, E.back); if (k <= 0) return;
  at(ctx, x, y, k, () => {
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 22 + 10 * (1 - k) + 6 * (0.5 + 0.5 * Math.sin(t * 4)), 0, 7); ctx.strokeStyle = rgba(col, 0.4); ctx.lineWidth = 2; ctx.stroke();
    txt(ctx, String(n), 0, 8, { size: 22, weight: 800, fam: BODY, color: '#0b0b12', align: 'center' });
  });
}
