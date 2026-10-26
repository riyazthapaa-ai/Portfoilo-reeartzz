// 20 s motion-graphics piece in the style of the main video, animated badly on purpose:
// linear easing, abrupt stops, elastic overkill, choppy stepped motion, spin/star wipes,
// clashing colors, mixed fonts, off-center layout, text clipping the frame edges, camera shake.
const SERIF = '"DejaVu Serif", serif';
const RAINBOW = ['#ff0000', '#ff9900', '#ffee00', '#00dd00', '#0099ff', '#9900ff'];
const lin = (t, a, d) => clamp((t - a) / d);           // no easing anywhere
const choppy = (t, fps = 6) => Math.floor(t * fps) / fps; // stepped, low-frame-rate motion
const elasticBig = k => (k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, -4 * k) * Math.sin((k * 10 - 0.75) * 2.4) * 1.6 + 1);

function loudText(ctx, s, x, y, size, col, o = {}) {
  ctx.save();
  font(ctx, size, o.weight || 900, o.fam || DISPLAY); ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 12; ctx.shadowOffsetY = 12;
  ctx.fillStyle = col; ctx.fillText(s, x, y);
  ctx.shadowColor = 'transparent'; ctx.lineWidth = o.lw ?? 6; ctx.strokeStyle = o.stroke || '#ffffff'; ctx.strokeText(s, x, y);
  ctx.restore();
}
function badBg(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  const sh = (t * 0.35) % 1;
  RAINBOW.forEach((c, i) => g.addColorStop((i / RAINBOW.length + sh) % 1, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(20,0,40,0.55)'; ctx.fillRect(0, 0, W, H);
  // cheesy lens flare drifting at constant speed
  const fx = 300 + ((t * 260) % 1700);
  glow(ctx, fx, 260, 260, '#ffffff', 0.55); glow(ctx, fx * 0.6 + 200, 520, 90, '#ffee00', 0.6);
}

// 0-4 s: letters spin in one by one, linear, rainbow, off-center
function bm1(ctx, t) {
  const word = 'MOTION GRAPHICS';
  let x = 260;
  word.split('').forEach((ch, i) => {
    const k = lin(t, 0.1 + i * 0.09, 0.4);
    if (k > 0) at(ctx, x + 30, 430, k, () => loudText(ctx, ch, -30, 40, 130, RAINBOW[i % 6], { fam: i % 2 ? SERIF : DISPLAY }), (1 - k) * Math.PI * 4);
    x += tw(ctx, ch, 130, 900, i % 2 ? SERIF : DISPLAY) + 6;
  });
  const k2 = elasticBig(lin(t, 1.8, 1.2));
  if (t > 1.8) at(ctx, 1150, 700, k2, () => loudText(ctx, 'look GREAT!!!', 0, 0, 150, '#00ff66', { align: 'center', fam: SERIF }), Math.sin(t * 9) * 0.08);
}
// 4-8 s: slides at constant speed and overshoots off-screen, wrong font mix
function bm2(ctx, t) {
  const x = -900 + lin(t, 4, 1.0) * 1600;           // stops dead, too far right
  loudText(ctx, 'But getting there...', x, 470, 120, '#ffee00', { fam: MONO, weight: 700 });
  if (t > 5.4) {
    const y = 1200 - lin(t, 5.4, 0.5) * 520;
    loudText(ctx, 'is a COMPLETELY', 1300, y, 96, '#ff3df2', { align: 'center', fam: SERIF });
    if (t > 6.2) loudText(ctx, 'different story', 1300, y + 120, 96, '#00e5ff', { align: 'center' });
  }
}
// 8-13 s: four boxes pop at once, overlap, wobble, choppy 6 fps, text overflows
function bm3(ctx, t) {
  const tc = choppy(t);
  const items = [['ANIMATED TYPOGRAPHY', '#ff0055'], ['Custom Graphics', '#00cc44'], ['precise timing', '#ffaa00'], ['TRANSITIONS!!', '#3355ff']];
  items.forEach(([s, col], i) => {
    const k = lin(tc, 8.1, 0.35);
    const x = 180 + i * 400 + Math.sin(tc * 7 + i) * 40, y = 380 + (i % 2) * 140 + Math.cos(tc * 5 + i) * 30;
    at(ctx, x + 200, y + 150, k * (1 + 0.15 * Math.sin(tc * 12 + i)), () => {
      ctx.fillStyle = col; ctx.fillRect(-200, -150, 440, 300);
      ctx.lineWidth = 10; ctx.strokeStyle = '#ffffff'; ctx.strokeRect(-200, -150, 440, 300);
      loudText(ctx, s, -180, 20, 64, '#ffffff', { fam: i === 2 ? SERIF : DISPLAY, stroke: '#000000', lw: 4 });
    }, Math.sin(tc * 3 + i) * 0.2);
  });
  loudText(ctx, 'You need:', 120, 200 + Math.sin(tc * 6) * 20, 90, '#ffffff', { fam: SERIF });
}
// 13-17 s: keyframes flash, "HOURS" zooms past the frame edges, camera shake
function bm4(ctx, t) {
  const r = rand(11);
  for (let i = 0; i < 90; i++) {
    const x = 120 + r() * 1680, y = 260 + r() * 520, a = r() * 3;
    if (t > 13 + a * 0.6 && Math.floor(t * 10 + i) % 3) at(ctx, x, y, 1, () => { ctx.fillStyle = RAINBOW[i % 6]; ctx.fillRect(-14, -14, 28, 28); }, Math.PI / 4);
  }
  const k = lin(t, 14.2, 1.6);
  at(ctx, 900, 620, 0.4 + k * 2.6, () => loudText(ctx, 'HOURS', 0, 60, 220, '#ff2200', { align: 'center' }), k * 0.6);
  loudText(ctx, 'of keyframes & manual adjustments', 1500, 1040, 54, '#ffffff', { fam: MONO, weight: 700 });
}
// 17-20 s: star wipe into a wobbling end card, then an abrupt cut to black
function bm5(ctx, t) {
  ctx.fillStyle = '#1a0033'; ctx.fillRect(0, 0, W, H);
  const k = elasticBig(lin(t, 17.3, 1.0));
  at(ctx, 960, 520, k, () => {
    loudText(ctx, 'Fotor Agent???', 0, 0, 170, '#ffee00', { align: 'center', fam: SERIF });
    loudText(ctx, 'is THIS the answer', 0, 140, 70, '#00ffcc', { align: 'center', fam: MONO, weight: 700 });
  }, Math.sin(t * 6) * 0.12);
  iSpark(ctx, 1600 + Math.sin(t * 8) * 40, 300, 160 + Math.sin(t * 20) * 40, '#ffffff');
}
function starWipe(ctx, t, a, d, draw) {
  const k = lin(t, a, d); if (k <= 0) return;
  ctx.save(); ctx.beginPath();
  const R = k * 1500;
  for (let i = 0; i < 10; i++) { const ang = i * Math.PI / 5 - Math.PI / 2 + k * 3, rr = i % 2 ? R * 0.45 : R; ctx.lineTo(960 + Math.cos(ang) * rr, 540 + Math.sin(ang) * rr); }
  ctx.closePath(); ctx.clip(); draw(); ctx.restore();
}

function drawBadMG(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  if (t >= 19.6) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; } // abrupt ending
  const shake = t > 14 && t < 16.5 ? 18 : 3;
  ctx.save(); ctx.translate(Math.sin(t * 53) * shake, Math.cos(t * 47) * shake);
  badBg(ctx, t);
  if (t < 4) bm1(ctx, t);
  else if (t < 8) {
    // spin transition at the cut
    const k = lin(t, 4, 0.5);
    if (k < 1) at(ctx, 960, 540, 1 - k, () => { ctx.translate(-960, -540); bm1(ctx, 3.99); }, k * Math.PI * 3);
    bm2(ctx, t);
  } else if (t < 13) bm3(ctx, t);
  else if (t < 17) bm4(ctx, t);
  else { bm4(ctx, 16.99); starWipe(ctx, t, 17, 0.7, () => bm5(ctx, t)); }
  // flash frames on every cut
  [4, 8, 13, 17].forEach(c => { if (t > c && t < c + 0.12) { ctx.fillStyle = '#ffffff'; ctx.fillRect(-50, -50, W + 100, H + 100); } });
  ctx.restore();
}
