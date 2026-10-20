// "Enhanced" motion-graphics treatment of the same promo source material.
// o: { t0, headline:[l1,l2], accent, hs (headline scale), hy (headline y offset), gx, gy (stat card offset),
//      titleK (0..1 forced title scale-in progress, optional), still (skip intro anim) }
function drawPromoEnhanced(ctx, t, o = {}) {
  const t0 = o.still ? -99 : (o.t0 ?? 0), lt = t - t0;
  const acc = o.accent || C.cyan, hl = o.headline || HEADLINE;
  // background
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#120c3a'); g.addColorStop(0.55, '#1b1060'); g.addColorStop(1, '#0a0820');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glow(ctx, 1500 + Math.sin(t * 0.4) * 60, 380, 760, '#6d4bff', 0.55);
  glow(ctx, 300, 950 + Math.cos(t * 0.5) * 40, 620, acc, 0.22);
  // diagonal light streaks
  ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const x = ((i * 260 + t * 40) % 2600) - 400; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 500, H); ctx.stroke(); }
  ctx.restore();
  pLogoDark(ctx, 110, 90, 1.1, A(lt, 0.1, 0.6));
  // product shot with depth
  const pk = A(lt, 0.35, 1.1, E.expo);
  withA(ctx, pk, () => {
    ctx.save(); ctx.translate(1380 + (1 - pk) * 260, 540 + Math.sin(t * 0.8) * 8); ctx.rotate(-0.035 * pk);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 40;
    rrect(ctx, -460, -259, 920, 518, 22); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.save(); rrect(ctx, -460, -259, 920, 518, 22); ctx.clip(); ctx.drawImage(productShot(), -460, -259, 920, 518); ctx.restore();
    rrect(ctx, -460, -259, 920, 518, 22); ctx.strokeStyle = rgba(acc, 0.7); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  });
  // floating depth chips
  const chips = [['Task done', 1010, 300, 0.9], ['+45 min focus', 1700, 800, 1.1], ['AI plan ready', 1720, 250, 1.3]];
  chips.forEach(([s, x, y, d], i) => {
    const k = A(lt, d, 0.7, E.back); if (k <= 0) return;
    at(ctx, x, y + Math.sin(t * 1.3 + i * 2) * 10, k, () => {
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
      pill(ctx, 0, 0, s, { size: 24, align: 'center', fill: 'rgba(25,18,70,0.92)', stroke: rgba(acc, 0.6), dot: acc });
      ctx.shadowColor = 'transparent';
    });
  });
  // headline
  const hs = o.hs ?? 1, hy = o.hy ?? 0, size = 74 * hs;
  const tk = o.titleK ?? 1;
  ctx.save(); ctx.translate(110, 330 + hy);
  const sc = lerp(0.55, 1, E.out(tk)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(tk * 2);
  wordsIn(ctx, hl[0], 0, 0, lt, 0.2, { size, weight: 850, stagger: 0.08 });
  const w2 = hl[1];
  wordsIn(ctx, w2, 0, size * 1.08, lt, 0.2 + hl[0].split(' ').length * 0.08, { size, weight: 850, stagger: 0.08, color: acc });
  ctx.restore();
  // underline sweep
  const uk = A(lt, 1.0, 0.7, E.inOut);
  ctx.fillStyle = acc; rrect(ctx, 112, 330 + hy + size * 1.08 + 28, 300 * uk * hs, 8, 4); ctx.fill();
  withA(ctx, A(lt, 1.2, 0.6), () => txt(ctx, 'The AI planner for creators and small businesses.', 112, 330 + hy + size * 1.08 + 90, { size: 28, weight: 500, fam: BODY, color: 'rgba(255,255,255,0.75)' }));
  // animated stat card
  const gx = o.gx ?? 0, gy = o.gy ?? 0, sk = A(lt, 1.4, 0.8, E.expo);
  withA(ctx, sk, () => {
    const x = 110 + gx, y = 640 + gy + (1 - sk) * 60;
    card(ctx, x, y, 560, 210, { fill: 'rgba(20,14,56,0.88)', stroke: rgba(acc, 0.45), r: 26 });
    const n = Math.round(10 * E.out(prog(lt, 1.6, 1.4)));
    txt(ctx, String(n), x + 36, y + 128, { size: 120, weight: 900, color: acc, ls: -4 });
    const nw = tw(ctx, String(n), 120, 900, DISPLAY, -4);
    txt(ctx, 'hours', x + 52 + nw, y + 92, { size: 34, weight: 750 }); txt(ctx, 'saved every week', x + 52 + nw, y + 130, { size: 26, weight: 500, fam: BODY, color: 'rgba(255,255,255,0.7)' });
    const bars = [0.35, 0.5, 0.42, 0.68, 0.85, 1];
    bars.forEach((b, i) => { const k = A(lt, 1.8 + i * 0.1, 0.6, E.back), h = 46 * b * k; rrect(ctx, x + 36 + i * 30, y + 186 - h, 20, h, 5); ctx.fillStyle = i === 5 ? acc : 'rgba(255,255,255,0.25)'; ctx.fill(); });
  });
  // CTA
  withA(ctx, A(lt, 2.0, 0.6), () => {
    const x = 110 + gx, y = 900 + gy;
    rrect(ctx, x, y, 250, 70, 35); ctx.fillStyle = acc; ctx.fill();
    txt(ctx, 'Try it free  →', x + 125, y + 45, { size: 26, weight: 750, fam: BODY, color: '#0b0820', align: 'center' });
  });
}
function pLogoDark(ctx, x, y, s, a = 1) {
  withA(ctx, a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rrect(ctx, 0, 0, 44, 44, 12); const g = ctx.createLinearGradient(0, 0, 44, 44); g.addColorStop(0, P.brand); g.addColorStop(1, '#8f7bff'); ctx.fillStyle = g; ctx.fill();
    iSpark(ctx, 22, 22, 26, '#fff');
    txt(ctx, 'Planora', 58, 32, { size: 28, weight: 700, fam: BODY });
    ctx.restore();
  });
}
// Draw a full-frame composition (fn(ctx)) into a pooled offscreen and blit it into a rect.
const _pool = [];
function frameInto(ctx, slot, x, y, w, h, fn, o = {}) {
  if (!_pool[slot]) _pool[slot] = mkCanvas();
  const oc = _pool[slot], c2 = oc.getContext('2d');
  c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalAlpha = 1; c2.filter = 'none'; fn(c2);
  ctx.save();
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26; }
  rrect(ctx, x, y, w, h, o.r ?? 18); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.clip(); if (o.filter) ctx.filter = o.filter;
  ctx.drawImage(oc, x, y, w, h); ctx.restore();
  if (o.stroke !== false) { rrect(ctx, x, y, w, h, o.r ?? 18); ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.stroke(); }
  return oc;
}
