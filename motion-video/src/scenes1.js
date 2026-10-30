// Scenes 1-6: hook, the problem, the idea, the brief, refine-vs-rebuild, before/after.

// 1 ─ Hook: motion graphics look great, getting there is hard (0 – 16.5)
function sHook(ctx, t) {
  const tb = WT(1, 'traditional');
  withA(ctx, 1 - A(t, S(1) - 0.35, 0.4), () => {
    say(ctx, 'Motion graphics', 450, t, WT(0, 'motion') - 0.15, { size: 170, weight: 900 });
    const g = gradText(ctx, 600, 1320, C.violet, C.cyan);
    say(ctx, 'look great.', 640, t, WT(0, 'looks') - 0.1, { size: 170, weight: 900, color: g });
    const k = A(t, WT(0, 'but'), 0.5, E.expo);
    withA(ctx, k, () => {
      txt(ctx, 'Getting there?', W / 2, 800 + (1 - k) * 20, { size: 54, weight: 700, color: C.pink, align: 'center' });
    });
    fadeTxt(ctx, 'A completely different story.', W / 2, 870, t, WT(0, 'completely'), { align: 'center', size: 34 });
  });
  if (t < S(1) - 0.4) return;
  kicker(ctx, 'What it takes', t, S(1));
  const items = [['Animated typography', 'animated'], ['Custom graphics', 'custom'], ['Precise timing', 'precise'], ['Transitions', 'transitions']];
  const dim = 1 - 0.55 * A(t, tb, 0.6);
  items.forEach(([label, w], i) => {
    const t0 = WT(1, w) - 0.1, k = A(t, t0, 0.7, E.expo); if (k <= 0) return;
    const x = 150 + i * 412, y = 190 + (1 - k) * 60, tw0 = 380, th = 400 - 120 * A(t, tb, 0.7, E.inOut);
    withA(ctx, k * dim, () => {
      card(ctx, x, y, tw0, th, { fill: 'rgba(255,255,255,0.04)', r: 26 });
      const cx = x + tw0 / 2, cy = y + th / 2 - 30, lt = t - t0;
      ctx.save(); rrect(ctx, x, y, tw0, th, 26); ctx.clip();
      if (i === 0) { // bouncing letters
        'Aa'.split('').forEach((ch, j) => { const s = 1 + 0.18 * Math.sin(lt * 5 - j * 1.4); at(ctx, cx - 50 + j * 100, cy + 40, s, () => txt(ctx, ch, 0, 0, { size: 150, weight: 900, align: 'center', color: j ? C.cyan : C.ink })); });
      } else if (i === 1) { // rotating shapes
        at(ctx, cx - 90, cy, 1, () => { ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fillStyle = C.pink; ctx.fill(); }, 0);
        at(ctx, cx, cy - 10, 1, () => { ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(46, 34); ctx.lineTo(-46, 34); ctx.closePath(); ctx.fillStyle = C.amber; ctx.fill(); }, lt * 1.6);
        at(ctx, cx + 90, cy, 1, () => { rrect(ctx, -40, -40, 80, 80, 14); ctx.fillStyle = C.violet; ctx.fill(); }, -lt * 1.2);
      } else if (i === 2) { // stopwatch + ruler
        iClock(ctx, cx, cy - 20, 130, C.ink, lt * 6);
        for (let j = 0; j < 25; j++) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 40 + j * 12.5, cy + 80, 2, j % 5 ? 12 : 24); }
        ctx.fillStyle = C.lime; ctx.fillRect(x + 40 + ((lt * 60) % 300), cy + 66, 4, 44);
      } else { // A→B wipe
        const p = (lt * 0.7) % 1, kk = E.inOut(clamp((p - 0.2) / 0.5));
        rrect(ctx, cx - 120, cy - 70, 240, 140, 16); ctx.fillStyle = C.violet; ctx.fill();
        ctx.save(); rrect(ctx, cx - 120, cy - 70, 240, 140, 16); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(cx - 120 + 240 * (1 - kk), cy - 70, 240, 140); ctx.restore();
        txt(ctx, kk < 0.5 ? 'A' : 'B', cx, cy + 22, { size: 64, weight: 900, align: 'center', color: '#0b0b12' });
      }
      ctx.restore();
      txt(ctx, label, x + 30, y + th - 34, { size: 28, weight: 700, fam: BODY });
    });
  });
  // keyframe chaos panel
  const pk = A(t, tb - 0.1, 0.8, E.expo); if (pk <= 0) return;
  withA(ctx, pk, () => {
    const x = 150, y = 520 + (1 - pk) * 80, w = 1620, h = 440;
    card(ctx, x, y, w, h, { fill: 'rgba(14,14,24,0.95)', r: 22 });
    sectionLabel(ctx, 'Traditional software · timeline', x + 30, y + 40);
    const layers = ['Title', 'Subtitle', 'Shape 1', 'Shape 2', 'Logo', 'Camera'];
    const r = rand(7);
    layers.forEach((L, li) => {
      const ry = y + 80 + li * 52;
      txt(ctx, L, x + 30, ry + 24, { size: 20, weight: 500, fam: BODY, color: C.dim });
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 160, ry + 2, 1040, 36);
      for (let j = 0; j < 34; j++) {
        const kx = x + 175 + r() * 1010, ka = tb + 0.1 + r() * 3.0;
        const kk = A(t, ka, 0.25, E.back); if (kk <= 0) continue;
        at(ctx, kx, ry + 20, kk, () => { ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(9, 0); ctx.lineTo(0, 9); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fillStyle = [C.violet, C.cyan, C.amber, C.pink][li % 4]; ctx.fill(); });
      }
    });
    const n = Math.round(1284 * E.out(prog(t, tb + 0.1, 3.2)));
    txt(ctx, n.toLocaleString('en-US'), x + w - 40, y + 170, { size: 96, weight: 900, align: 'right', color: C.ink, ls: -3 });
    txt(ctx, 'keyframes', x + w - 40, y + 210, { size: 26, weight: 600, fam: BODY, color: C.dim, align: 'right' });
    const hk = A(t, WT(1, 'hours'), 0.5, E.back);
    if (hk > 0) at(ctx, x + w - 210, y + 320, hk, () => { iClock(ctx, -90, 0, 70, C.amber, t * 9); txt(ctx, 'hours', -40, 14, { size: 46, weight: 850, color: C.amber }); });
    fadeTxt(ctx, '+ manual adjustments', x + w - 40, y + 400, t, WT(1, 'manual'), { align: 'right', size: 24 });
  });
}

// 2 ─ Basic AI video tools: impressive but imprecise (16.55 – 27.4)
function genFrame(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#ff8a3d'); g.addColorStop(1, '#ff3d7f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glow(ctx, 1400, 300, 800, '#ffe259', 0.5);
  txt(ctx, 'Planoar', 140, 120, { size: 44, weight: 800, fam: BODY, color: '#fff3' });
  at(ctx, 150, 360, 1, () => { txt(ctx, 'Get mroe done,', 0, 0, { size: 96, weight: 900, color: '#fff' }); txt(ctx, 'evrey dya wtih', 40, 104, { size: 88, weight: 900, color: '#fff' }); }, -0.06);
  ctx.save(); ctx.translate(1350, 640); ctx.rotate(0.12); ctx.drawImage(productShot(), -520, -292, 1040, 585); ctx.restore();
  rrect(ctx, 260, 720, 330, 90, 45); ctx.fillStyle = '#2bd94a'; ctx.fill();
  txt(ctx, 'Try Fre e', 425, 778, { size: 36, weight: 800, fam: BODY, color: '#fff', align: 'center' });
  txt(ctx, 'Save 1O hourz', 1080, 1010, { size: 54, weight: 900, color: '#fff' });
  // shimmer
  const sx = ((t * 700) % 3400) - 700; const sg = ctx.createLinearGradient(sx, 0, sx + 400, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.22)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
}
function sAITools(ctx, t) {
  kicker(ctx, 'Basic AI video tools', t, S(2), { col: C.pink });
  const r = [150, 230, 1000, 562], fk = A(t, S(2) + 0.2, 0.9, E.expo);
  withA(ctx, fk, () => {
    at(ctx, r[0] + r[2] / 2, r[1] + r[3] / 2 + (1 - fk) * 60, 1, () => frameInto(ctx, 1, -r[2] / 2, -r[3] / 2, r[2], r[3], c => genFrame(c, t)));
    const ik = win(t, WT(2, 'impressive') - 0.1, WT(2, 'getting'));
    withA(ctx, ik, () => { pill(ctx, r[0] + 30, r[1] - 40, 'Looks impressive', { size: 24, dot: C.lime, fill: 'rgba(20,20,30,0.9)' }); });
    const marks = [['text', 0.06, 0.25, 0.5, 0.2], ['layouts', 0.6, 0.45, 0.42, 0.55], ['brand', 0.05, 0.05, 0.2, 0.13]];
    marks.forEach(([w, fx, fy, fw, fh], i) => {
      const k = A(t, WT(2, w), 0.45, E.out); if (k <= 0) return;
      withA(ctx, k, () => { ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); rrect(ctx, r[0] + fx * r[2], r[1] + fy * r[3], fw * r[2], fh * r[3], 12); ctx.stroke(); ctx.setLineDash([]); });
      numBadge(ctx, i + 1, r[0] + fx * r[2], r[1] + fy * r[3], t, WT(2, w), C.red);
    });
  });
  const x = 1230;
  [['Text', 'typos & odd wording', 'text'], ['Layout', 'off-grid, crowded', 'layouts'], ['Brand details', 'wrong colors & logo', 'brand']].forEach(([a, b, w], i) => {
    const t0 = WT(2, w), k = A(t, t0, 0.5, E.expo); if (k <= 0) return;
    withA(ctx, k, () => {
      const y = 290 + i * 128 + (1 - k) * 20;
      card(ctx, x, y, 560, 104, { fill: 'rgba(255,90,90,0.07)', stroke: 'rgba(255,90,90,0.35)', r: 18, shadow: false });
      txt(ctx, String(i + 1), x + 34, y + 64, { size: 30, weight: 800, fam: MONO, color: C.red });
      txt(ctx, a, x + 80, y + 46, { size: 32, weight: 750 }); txt(ctx, b, x + 80, y + 80, { size: 22, weight: 500, fam: BODY, color: C.dim });
    });
  });
  const ek = A(t, WT(2, 'editing') - 0.3, 0.6, E.expo);
  withA(ctx, ek, () => {
    txt(ctx, '= just as much editing afterward', x, 720, { size: 30, weight: 700, color: C.pink });
    rrect(ctx, x, 750, 560, 18, 9); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    rrect(ctx, x, 750, 560 * E.inOut(prog(t, WT(2, 'editing'), 1.4)), 18, 9); ctx.fillStyle = C.pink; ctx.fill();
  });
}

// 3 ─ What if… one workspace → this test (27.4 – 35.05)
function sIdea(ctx, t) {
  const tt = S(4);
  withA(ctx, 1 - A(t, tt - 0.1, 0.4), () => {
    say(ctx, 'What if…', 250, t, S(3), { size: 80, color: C.dim });
    const nodes = [['Generate', 'the visuals', 'generate', C.violet], ['Edit', 'them directly', 'edit', C.cyan], ['Refine', 'the animation', 'refine', C.lime]];
    const wk = A(t, WT(3, 'one'), 0.8, E.inOut);
    nodes.forEach(([a, b, w, col], i) => {
      const k = A(t, WT(3, w) - 0.1, 0.6, E.back); if (k <= 0) return;
      const x = 960 + (i - 1) * lerp(470, 400, wk), y = 560;
      at(ctx, x, y, k, () => {
        card(ctx, -180, -120, 360, 240, { fill: 'rgba(255,255,255,0.05)', stroke: rgba(col, 0.6), r: 28 });
        if (i === 0) iSpark(ctx, 0, -40, 70, col); else if (i === 1) cursor(ctx, -12, -70, 1.8); else {
          ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.bezierCurveTo(-10, -10, 10, -80, 60, -80); ctx.stroke();
        }
        txt(ctx, a, 0, 50, { size: 40, weight: 800, align: 'center' }); txt(ctx, b, 0, 88, { size: 24, weight: 500, fam: BODY, color: C.dim, align: 'center' });
      });
    });
    if (wk > 0) {
      withA(ctx, wk, () => {
        ctx.strokeStyle = rgba(C.lime, 0.8); ctx.lineWidth = 3; rrect(ctx, 960 - 640 * wk, 400, 1280 * wk, 320, 40); ctx.stroke();
        pill(ctx, 960, 780, 'One workspace', { size: 30, align: 'center', dot: C.lime, fill: 'rgba(200,255,60,0.12)', stroke: rgba(C.lime, 0.5) });
      });
    }
  });
  const k = A(t, tt, 0.8, E.expo); if (k <= 0) return;
  withA(ctx, k, () => {
    txt(ctx, 'TESTING', W / 2, 420, { size: 26, weight: 600, fam: MONO, color: C.lime, align: 'center', ls: 8 });
    say(ctx, 'Fotor Agent', 600, t, tt + 0.05, { size: 190, weight: 900 });
    const uk = A(t, tt + 0.5, 0.8, E.inOut); ctx.fillStyle = gradText(ctx, 560, 1360, C.violet, C.cyan); rrect(ctx, 960 - 400 * uk, 660, 800 * uk, 10, 5); ctx.fill();
    fadeTxt(ctx, 'AI generation + direct editing, in one place', W / 2, 740, t, tt + 0.8, { align: 'center', size: 32 });
  });
}

// 4 ─ The brief, the assets, the first version (35.05 – 56.75)
function sBrief(ctx, t) {
  const tg = S(7);
  withA(ctx, 1 - A(t, tg - 0.2, 0.5), () => {
    kicker(ctx, 'The test project', t, S(5));
    const bk = A(t, S(5), 0.8, E.expo);
    withA(ctx, bk, () => {
      const x = 130, y = 180 + (1 - bk) * 50;
      card(ctx, x, y, 700, 500, { fill: 'rgba(255,255,255,0.045)', r: 26 });
      sectionLabel(ctx, 'Creative brief', x + 40, y + 58, C.lime);
      txt(ctx, 'Promo video', x + 40, y + 120, { size: 52, weight: 850 });
      const rows = [['Format', 'Promotional video', 'promotional'], ['Product', 'AI productivity tool', 'productivity'], ['Audience', 'Creators & small businesses', 'creators']];
      rows.forEach(([a, b, w], i) => {
        const yy = y + 210 + i * 92; ctx.fillStyle = C.line; ctx.fillRect(x + 40, yy - 44, 620, 1);
        txt(ctx, a, x + 40, yy, { size: 22, weight: 500, fam: BODY, color: C.faint });
        const s = typed(b, t, WT(5, w) - 0.2, 34);
        txt(ctx, s, x + 40, yy + 38, { size: 30, weight: 650, fam: BODY });
      });
    });
    const ak = A(t, S(6), 0.8, E.expo);
    withA(ctx, ak, () => {
      const x = 890, y = 180 + (1 - ak) * 50;
      card(ctx, x, y, 900, 500, { fill: 'rgba(255,255,255,0.045)', r: 26 });
      sectionLabel(ctx, 'Prepared assets', x + 40, y + 58, C.cyan);
      const thumbs = [['Source footage', 'source', c => drawFootage(c, (t * 1.2) % 20)], ['Product screens', 'product', c => drawAssistant(c, 9.5)],
        ['Visual direction', 'simple', c => { c.fillStyle = '#0d0b26'; c.fillRect(0, 0, W, H); [P.brand, '#8f7bff', C.cyan, '#f4f5fa'].forEach((col, j) => { c.beginPath(); c.arc(330 + j * 420, 430, 160, 0, 7); c.fillStyle = col; c.fill(); }); txt(c, 'Aa  Inter Display', 960, 860, { size: 150, weight: 850, align: 'center' }); }]];
      thumbs.forEach(([lab, w, fn], i) => {
        const k = A(t, WT(6, w) - 0.1, 0.6, E.back); if (k <= 0) return;
        const tx = x + 40 + i * 280, ty = y + 110;
        at(ctx, tx + 130, ty + 120, 0.8 + 0.2 * k, () => withA(ctx, clamp(k * 1.5), () => {
          frameInto(ctx, 2 + i, -130, -120, 260, 146, fn, { r: 12 });
          txt(ctx, lab, -130, 70, { size: 22, weight: 650, fam: BODY });
          txt(ctx, ['30s · 1080p', '2 screens', 'palette + type'][i], -130, 100, { size: 18, weight: 500, fam: MONO, color: C.faint });
        }));
      });
      fadeTxt(ctx, 'Same material for every comparison in this test', x + 40, y + 440, t, WT(6, 'simple') + 0.6, { size: 22, color: C.faint });
    });
    const goals = [['Real commercial feel', 'real'], ['Clear message', 'clear'], ['Animated typography', 'animated'], ['Graphics that explain', 'explain']];
    fadeTxt(ctx, 'THE GOAL', 130, 780, t, WT(6, 'want'), { size: 20, fam: MONO, weight: 600, color: C.lime, ls: 4 });
    let gx = 130;
    goals.forEach(([g, w]) => { const k = A(t, WT(6, w) - 0.1, 0.5); if (k > 0) { const ww = chip(ctx, g, gx, 860, t, WT(6, w) - 0.1, { align: 'left', size: 28 }); gx += (ww || tw(ctx, g, 28, 650, BODY) + 81) + 24; } else gx += tw(ctx, g, 28, 650, BODY) + 81 + 24; });
  });
  // prompt → first version
  const pk = A(t, tg, 0.7, E.expo); if (pk <= 0) return;
  withA(ctx, pk, () => {
    kicker(ctx, 'Step 1 · First version', t, tg);
    const y = 400 + (1 - pk) * 40;
    card(ctx, 360, y, 1200, 110, { fill: 'rgba(255,255,255,0.06)', stroke: rgba(C.violet, 0.6), r: 55 });
    iSpark(ctx, 425, y + 55, 36, C.violet);
    const s = typed('Build a 30-second promo from this brief and these assets.', t, tg + 0.2, 48);
    txt(ctx, s + (t < tg + 1.6 && caret(t) ? '|' : ''), 470, y + 66, { size: 32, weight: 550, fam: BODY });
    const gp = clamp((t - tg - 1.6) / 1.5);
    const bk = A(t, tg + 1.4, 0.4);
    withA(ctx, bk, () => {
      txt(ctx, gp < 1 ? 'Building first version…' : 'First version ready', 360, y + 220, { size: 28, weight: 650, fam: BODY, color: gp < 1 ? C.dim : C.lime });
      txt(ctx, Math.round(gp * 100) + '%', 1560, y + 220, { size: 28, weight: 700, fam: MONO, align: 'right' });
      rrect(ctx, 360, y + 245, 1200, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      rrect(ctx, 360, y + 245, 1200 * E.inOut(gp), 12, 6); ctx.fillStyle = gradText(ctx, 360, 1560, C.violet, C.cyan); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const k = A(t, tg + 1.7 + i * 0.2, 0.4, E.back); if (k <= 0) continue;
        at(ctx, 460 + i * 200, y + 380, k, () => frameInto(ctx, 6 + (i % 2), -85, -48, 170, 96, c => i % 2 ? drawPromoBasic(c) : drawFootage(c, i * 3.3), { r: 8 }));
      }
    });
  });
}

// 5 ─ What happens next: refine, don't rebuild (56.75 – 64.1)
function sNext(ctx, t) {
  say(ctx, 'The important part:', 330, t, S(8), { size: 60, weight: 700, color: C.dim });
  say(ctx, 'what happens next.', 450, t, WT(8, 'what') - 0.05, { size: 110, weight: 900 });
  const rk = A(t, WT(8, 'refine') - 0.1, 0.6, E.back);
  if (rk > 0) at(ctx, 620, 700, rk, () => {
    card(ctx, -260, -100, 520, 200, { fill: 'rgba(200,255,60,0.08)', stroke: rgba(C.lime, 0.6), r: 30 });
    iCheck(ctx, -170, 0, 70, C.lime, A(t, WT(8, 'refine'), 0.5)); txt(ctx, 'Refine', -110, 26, { size: 76, weight: 900, color: C.lime });
  });
  const bk = A(t, WT(8, 'rebuilding') - 0.1, 0.6, E.back);
  if (bk > 0) at(ctx, 1300, 700, bk, () => {
    card(ctx, -260, -100, 520, 200, { fill: 'rgba(255,90,90,0.07)', stroke: 'rgba(255,90,90,0.5)', r: 30 });
    iCross(ctx, -170, 0, 60, C.red); txt(ctx, 'Rebuild', -110, 26, { size: 76, weight: 900, color: 'rgba(255,255,255,0.55)' });
    const sk = A(t, WT(8, 'entire'), 0.4); ctx.fillStyle = C.red; ctx.fillRect(-118, -6, 300 * sk, 8);
  });
  fadeTxt(ctx, 'without redoing the whole video by hand', W / 2, 900, t, WT(8, 'manually') - 0.2, { align: 'center', size: 30 });
}

// 6 ─ Before / after on the same source material (64.1 – 111.5)
const RL = [100, 200, 840, 472.5], RR = [980, 200, 840, 472.5];
// Real footage in the comparison: media/src = source footage, media/fin = the Fotor Agent result (30 fps JPEG frames).
// Each clip is cut to the VO beats: [main time, clip time, rate, max clip time]. Both panels share the same cuts
// once the enhanced version is shown, so the comparison always shows the same moment of the same material.
const CUTS = [[76.6, 0, 0], [77.5, 0], [80.4, 5.5], [82.6, 23.6, 1, 29.0], [96.2, 0]];
const SEG_L = [[64.1, 17.5, 1, 29.9], ...CUTS], SEG_R = [[0, 0, 0], ...CUTS];
function segTime(t, segs) {
  let g = segs[0]; for (const s of segs) if (t >= s[0]) g = s;
  return clamp(g[1] + Math.max(0, t - g[0]) * (g[2] ?? 1), 0, g[3] ?? 29.9);
}
const VID = { src: { dir: 'media/src', cache: new Map() }, fin: { dir: 'media/fin', cache: new Map() } };
const fidx = sec => Math.max(1, Math.min(900, Math.round(sec * 30) + 1));
function vidLoad(name, sec) {
  const v = VID[name], i = fidx(sec);
  if (v.cache.has(i)) return v.cache.get(i).p;
  const img = new Image(), p = new Promise(r => { img.onload = r; img.onerror = r; });
  img.src = `${v.dir}/${String(i).padStart(4, '0')}.jpg`;
  v.cache.set(i, { img, p });
  if (v.cache.size > 90) v.cache.delete(v.cache.keys().next().value);
  return p;
}
// called before each frame is drawn so the needed footage frames are decoded
window.prepareFrame = t => (t > 63.5 && t < 112.5 ? Promise.all([vidLoad('src', segTime(t, SEG_L)), vidLoad('fin', segTime(t, SEG_R))]) : null);
function drawVid(ctx, name, sec, x, y, w, h, o = {}) {
  const e = VID[name].cache.get(fidx(sec));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
  rrect(ctx, x, y, w, h, 18); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.clip();
  if (o.filter) ctx.filter = o.filter;
  if (e && e.img.complete && e.img.naturalWidth) ctx.drawImage(e.img, x, y, w, h);
  ctx.restore();
  rrect(ctx, x, y, w, h, 18); ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.stroke();
}
function sCompare(ctx, t) {
  kicker(ctx, 'Same footage · two treatments', t, S(9) + 0.1);
  const lk = A(t, S(9), 0.9, E.expo), rk = A(t, S(9) + 0.15, 0.9, E.expo);
  const leftOn = win(t, S(10), EN(10) + 0.2) * 1;
  withA(ctx, lk, () => {
    drawVid(ctx, 'src', segTime(t, SEG_L), RL[0] - (1 - lk) * 200, RL[1], RL[2], RL[3], { stroke: leftOn > 0.5 ? rgba(C.amber, 0.9) : undefined });
    pill(ctx, RL[0], RL[1] - 36, 'ORIGINAL', { size: 20, fill: 'rgba(20,20,30,0.9)', dot: C.amber });
  });
  withA(ctx, rk, () => {
    const enh = t > S(11) - 0.05;
    drawVid(ctx, 'fin', segTime(t, SEG_R), RR[0] + (1 - rk) * 200, RR[1], RR[2], RR[3],
      { filter: enh ? 'none' : 'grayscale(1) brightness(0.35)', stroke: enh ? rgba(C.lime, 0.9) : undefined });
    if (!enh) { txt(ctx, 'Enhanced version', RR[0] + RR[2] / 2, RR[1] + RR[3] / 2 + 12, { size: 34, weight: 750, align: 'center', color: C.dim }); }
    pill(ctx, RR[0], RR[1] - 36, 'ENHANCED', { size: 20, fill: 'rgba(20,20,30,0.9)', dot: C.lime });
    const fl = 1 - A(t, S(11) - 0.05, 0.5); if (fl < 1 && fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl * 0.6})`; ctx.fillRect(RR[0], RR[1], RR[2], RR[3]); }
  });
  const Y = 760;
  // a) the original
  withA(ctx, win(t, S(10), EN(10) + 0.3), () => {
    [['Static headline', 'static'], ['Basic graphics', 'basic'], ["Doesn't guide the eye", 'guide']].forEach(([s, w], i) => chip(ctx, s, 110, Y + i * 74, t, WT(10, w) - 0.1, { align: 'left', col: C.amber, bad: true, size: 26 }));
    fadeTxt(ctx, 'The information is there.', 980, Y + 30, t, WT(10, 'information'), { size: 40, weight: 750, color: C.ink, fam: DISPLAY });
    fadeTxt(ctx, 'The presentation does little with it.', 980, Y + 84, t, WT(10, 'presentation'), { size: 30 });
  });
  // b) the enhanced
  const b0 = S(12), b1 = EN(12) + 0.3;
  withA(ctx, win(t, b0, b1), () => {
    const pts = [['Headline moves into position', 'headline', 770, 455, 80.4], ['Graphics create depth', 'supporting', 155, 475, 82.6], ['Data becomes an animated visual', 'data', 115, 356, 99]];
    pts.forEach(([s, w, fx, fy, off], i) => {
      withA(ctx, 1 - A(t, off - 0.2, 0.2), () => numBadge(ctx, i + 1, mapX(RR, fx), mapY(RR, fy), t, WT(12, w)));
      const k = A(t, WT(12, w), 0.6, E.expo); if (k <= 0) return;
      withA(ctx, k, () => {
        const x = 160 + i * 560, y = Y + 50;
        card(ctx, x, y - 40 + (1 - k) * 20, 520, 120, { fill: 'rgba(200,255,60,0.06)', stroke: rgba(C.lime, 0.35), r: 20, shadow: false });
        txt(ctx, String(i + 1), x + 32, y + 36 + (1 - k) * 20, { size: 34, weight: 800, fam: MONO, color: C.lime });
        txt(ctx, s, x + 78, y + 32 + (1 - k) * 20, { size: 25, weight: 650, fam: BODY });
      });
    });
  });
  // c) alignment & spacing
  const c0 = S(13), c1 = EN(13) + 0.3;
  withA(ctx, win(t, c0, c1), () => {
    const gk = A(t, WT(13, 'alignment'), 0.8, E.inOut);
    ctx.save(); rrect(ctx, RR[0], RR[1], RR[2], RR[3], 18); ctx.clip();
    ctx.strokeStyle = rgba(C.cyan, 0.55); ctx.lineWidth = 1.5;
    for (let i = 0; i <= 12; i++) { const x = mapX(RR, 120 + i * (1700 / 12)); ctx.beginPath(); ctx.moveTo(x, RR[1]); ctx.lineTo(x, RR[1] + RR[3] * gk); ctx.stroke(); }
    ctx.strokeStyle = C.pink; ctx.lineWidth = 2; const lx = mapX(RR, 120); ctx.beginPath(); ctx.moveTo(lx, RR[1]); ctx.lineTo(lx, RR[1] + RR[3] * gk); ctx.stroke();
    ctx.restore();
    const sk = A(t, WT(13, 'spacing'), 0.6);
    if (sk > 0) withA(ctx, sk, () => {
      [[292, 356]].forEach(([y0, y1]) => { const x = mapX(RR, 870); arrowLine(ctx, x, mapY(RR, y0), x, mapY(RR, y1), 1, C.pink, 2); arrowLine(ctx, x, mapY(RR, y1), x, mapY(RR, y0), 1, C.pink, 2); });
    });
    txt(ctx, 'Alignment', 260, Y + 40, { size: 48, weight: 850, color: C.cyan }); fadeTxt(ctx, '+ spacing', 260, Y + 100, t, WT(13, 'spacing'), { size: 40, weight: 800, color: C.pink, fam: DISPLAY });
    const vk = A(t, WT(13, 'text'), 0.6, E.out), jk = A(t, WT(13, 'together') - 0.3, 0.9, E.inOut);
    [['Text', C.violet], ['Graphics', C.cyan], ['Footage', C.lime]].forEach(([s, col], i) => {
      const k = A(t, WT(13, 'text') + i * 0.35, 0.6, E.back); if (k <= 0) return;
      const sp = lerp(190, 105, jk), x = 1250 + (i - 1) * sp;
      at(ctx, x, Y + 70, k, () => { ctx.beginPath(); ctx.arc(0, 0, 105, 0, 7); ctx.fillStyle = rgba(col, 0.22); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, s, 0, 10, { size: 26, weight: 750, align: 'center' }); });
    });
    void vk;
  });
  // d) same source material
  const d0 = S(14), d1 = EN(14) + 0.3;
  withA(ctx, win(t, d0, d1), () => {
    const k = A(t, WT(14, 'same') - 0.2, 0.9, E.inOut);
    ctx.strokeStyle = C.lime; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(520, 700); ctx.lineTo(520, 740); ctx.lineTo(520 + 880 * k, 740); ctx.stroke();
    if (k >= 1) { ctx.beginPath(); ctx.moveTo(1400, 740); ctx.lineTo(1400, 700); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(960, 740); ctx.lineTo(960, 740 + 40 * k); ctx.stroke();
    fadeTxt(ctx, 'Same source material', W / 2, 860, t, WT(14, 'same'), { align: 'center', size: 64, weight: 900, color: C.ink, fam: DISPLAY });
    fadeTxt(ctx, 'We compare the visual treatment, not two different clips.', W / 2, 930, t, WT(14, 'visual'), { align: 'center', size: 32 });
  });
  // e) where it matters
  const e0 = S(15);
  withA(ctx, A(t, e0, 0.45), () => {
    [['Commercial promos', 'commercial'], ['Product launches', 'product'], ['Social content', 'social']].forEach(([s, w], i) => chip(ctx, s, 480 + i * 480, Y + 30, t, WT(15, w), { size: 30, col: C.cyan }));
    const k = A(t, WT(15, 'visual'), 0.6, E.expo);
    withA(ctx, k, () => {
      txt(ctx, 'Visual hierarchy', 900, Y + 175, { size: 52, weight: 900, align: 'right' });
      arrowLine(ctx, 930, Y + 158, 930 + 120 * A(t, WT(15, 'make'), 0.5), Y + 158, 1, C.lime);
      fadeTxt(ctx, 'feels deliberate', 1080, Y + 175, t, WT(15, 'deliberate') - 0.2, { size: 52, weight: 900, color: C.lime, fam: DISPLAY });
    });
  });
}
