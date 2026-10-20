// Scenes 7-12: cost, canvas editing, timeline, agent instructions, polish, export.

// $0.06 × 30 s ≈ $1.80 equation, centered at (cx, cy), each block keyed to its own time
function costEq(ctx, cx, cy, t, t1, t2, t3) {
  const blocks = [[-620, '$0.06', 'per second', t1, C.ink], [0, '30 s', 'sequence', t2, C.ink], [620, '$1.80', 'approx. total', t3, C.lime]];
  blocks.forEach(([dx, big, small, t0, col], i) => {
    const k = A(t, t0, 0.6, E.back); if (k <= 0) return;
    at(ctx, cx + dx, cy, 0.75 + 0.25 * k, () => withA(ctx, clamp(k * 1.5), () => {
      card(ctx, -250, -150, 500, 300, { fill: i === 2 ? 'rgba(200,255,60,0.07)' : 'rgba(255,255,255,0.045)', stroke: i === 2 ? rgba(C.lime, 0.5) : C.line, r: 30 });
      const s = i === 2 ? '$' + (1.8 * E.out(prog(t, t0, 1.3))).toFixed(2) : big;
      txt(ctx, s, 0, 40, { size: 120, weight: 900, align: 'center', color: col, ls: -4 });
      txt(ctx, small, 0, 100, { size: 26, weight: 600, fam: BODY, align: 'center', color: C.dim });
    }));
    if (i > 0) withA(ctx, A(t, t0 - 0.1, 0.4), () => txt(ctx, i === 1 ? '×' : '≈', cx + dx - 310, cy + 30, { size: 90, weight: 300, fam: BODY, align: 'center', color: C.faint }));
  });
}

// 7 ─ Cost & production efficiency (111.5 – 160.85)
function sCost(ctx, t) {
  withA(ctx, 1 - A(t, S(17) - 0.3, 0.4), () => {
    say(ctx, 'Cost &', 440, t, S(16), { size: 120, weight: 900, color: C.dim });
    say(ctx, 'production efficiency', 590, t, WT(16, 'production'), { size: 120, weight: 900 });
  });
  // equation (moves up for the "polished" beat)
  const eqOn = 1 - A(t, S(19) - 0.3, 0.4);
  if (t > S(17) - 0.3 && eqOn > 0) withA(ctx, eqOn, () => {
    kicker(ctx, 'Demo estimate', t, S(17));
    const up = A(t, S(18) - 0.2, 0.8, E.inOut);
    at(ctx, W / 2, lerp(500, 330, up), lerp(1, 0.72, up), () => costEq(ctx, 0, 0, t, WT(17, 'six'), WT(17, '30'), WT(17, 'approximately')));
    withA(ctx, (1 - up) * A(t, WT(17, 'revised'), 0.5), () => txt(ctx, 'Based on the revised pricing figure used for this demonstration', W / 2, 760, { size: 28, weight: 500, fam: BODY, color: C.faint, align: 'center' }));
    // polished treatment, assembled automatically
    const pk = A(t, S(18), 0.6, E.expo);
    withA(ctx, pk, () => {
      txt(ctx, 'A polished treatment —', 260, 640, { size: 46, weight: 850 });
      txt(ctx, 'without hand-building every animation.', 260, 700, { size: 34, weight: 500, fam: BODY, color: C.dim });
      for (let i = 0; i < 12; i++) {
        const k = A(t, S(18) + 0.5 + i * 0.28, 0.45, E.back); const x = 260 + (i % 6) * 235, y = 760 + Math.floor(i / 6) * 130;
        card(ctx, x, y, 215, 110, { fill: 'rgba(255,255,255,0.03)', shadow: false, r: 16 });
        if (k > 0) at(ctx, x + 107, y + 55, k, () => {
          const col = [C.violet, C.cyan, C.lime, C.pink, C.amber][i % 5], ph = t * 2 + i;
          if (i % 3 === 0) { rrect(ctx, -60, -10, 120 * (0.5 + 0.5 * Math.sin(ph)), 20, 10); ctx.fillStyle = col; ctx.fill(); }
          else if (i % 3 === 1) { ctx.beginPath(); ctx.arc(Math.sin(ph) * 40, 0, 22, 0, 7); ctx.fillStyle = col; ctx.fill(); }
          else at(ctx, 0, 0, 1, () => { rrect(ctx, -24, -24, 48, 48, 10); ctx.fillStyle = col; ctx.fill(); }, ph);
        });
      }
    });
  });
  // traditional vs AI-assisted
  const c0 = S(19), c1 = EN(20) + 0.3;
  withA(ctx, win(t, c0, c1), () => {
    kicker(ctx, 'Where the time goes', t, c0);
    const cols = [[160, 'Traditional', 'e.g. After Effects', C.amber, [['Keyframes', 19, 'keyframes'], ['Effects', 19, 'effects'], ['Individual properties', 19, 'individual']], [19, 'setting'], 0.96, 'Setup + timing refinement'],
      [1000, 'AI-assisted + direct editing', 'the Fotor Agent approach', C.cyan, [['Generate a first pass', 20, 'aiassisted'], ['Edit directly', 20, 'direct'], ['Refine what matters', 20, 'editing']], [20, 'shorten'], 0.42, 'Aims for a shorter path']];
    cols.forEach(([x, title, sub, col, rows, [bi, bw], frac, blab], ci) => {
      const t0 = ci ? S(20) : c0 + 0.2, k = A(t, t0, 0.7, E.expo); if (k <= 0) return;
      withA(ctx, k, () => {
        const y = 200 + (1 - k) * 40;
        card(ctx, x, y, 760, 720, { fill: 'rgba(255,255,255,0.04)', stroke: rgba(col, 0.4), r: 28 });
        txt(ctx, title, x + 44, y + 84, { size: 44, weight: 850, color: col });
        txt(ctx, sub, x + 44, y + 124, { size: 24, weight: 500, fam: BODY, color: C.faint });
        rows.forEach(([r, i, w], j) => chip(ctx, r, x + 44, y + 210 + j * 86, t, WT(i, w) - 0.1, { align: 'left', col, size: 28 }));
        if (!ci) fadeTxt(ctx, '→ extensive control', x + 44, y + 470, t, WT(19, 'control') - 0.4, { size: 30, weight: 700, color: C.ink, fam: BODY });
        const bk = A(t, WT(bi, bw), 0.5); if (bk <= 0) return;
        withA(ctx, bk, () => {
          txt(ctx, blab, x + 44, y + 570, { size: 26, weight: 600, fam: BODY, color: C.dim });
          rrect(ctx, x + 44, y + 600, 672, 28, 14); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
          const p = E.inOut(prog(t, WT(bi, bw), ci ? 1.2 : 3.5)) * frac;
          rrect(ctx, x + 44, y + 600, 672 * p, 28, 14); ctx.fillStyle = col; ctx.fill();
          txt(ctx, ci ? 'shorter' : 'significant work', x + 716, y + 680, { size: 24, weight: 700, fam: BODY, color: col, align: 'right' });
        });
      });
    });
  });
  // estimate, not a guarantee
  const d0 = S(21);
  withA(ctx, A(t, d0 - 0.1, 0.5), () => {
    kicker(ctx, 'Fine print', t, d0, { col: C.amber });
    say(ctx, 'An estimate,', 330, t, WT(21, 'cost'), { size: 100, weight: 900 });
    say(ctx, 'not a guarantee.', 450, t, WT(21, 'not'), { size: 100, weight: 900, color: C.amber });
    fadeTxt(ctx, 'Actual cost depends on', W / 2, 600, t, WT(21, 'actual'), { align: 'center', size: 32 });
    [['Your plan', 'plan'], ['Credits', 'credits'], ['Output settings', 'output'], ['Refinement needed', 'refinement']].forEach(([s, w], i) => {
      const k = A(t, WT(21, w) - 0.1, 0.6, E.back); if (k <= 0) return;
      at(ctx, 330 + i * 420, 760, k, () => {
        card(ctx, -190, -90, 380, 180, { fill: 'rgba(255,181,71,0.07)', stroke: rgba(C.amber, 0.4), r: 24 });
        txt(ctx, String(i + 1).padStart(2, '0'), -150, -30, { size: 22, weight: 700, fam: MONO, color: C.amber });
        txt(ctx, s, -150, 40, { size: 36, weight: 800 });
      });
    });
  });
}

// ───────── editor shared: the enhanced promo inside an app window ─────────
const HL0 = HEADLINE, HL1 = ['Plan less.', 'Do more.'];
function canvasState(t) {
  const st = { t0: -99, still: true, headline: HL0, accent: C.cyan, hs: 1, hy: 0, gx: 0, gy: 0 };
  const tSel = 168.9, tType = 171.4;
  if (t > tType) st.headline = [typed(HL1[0], t, tType, 9), typed(HL1[1], t, tType + 1.3, 9)];
  else if (t > tSel + 0.2) st.headline = HL0;
  st.accent = hexMix(C.cyan, C.lime, A(t, 176.9, 0.5));
  st.hs = lerp(1, 1.3, A(t, 180.7, 1.0, E.inOut));
  st.hy = lerp(0, -70, A(t, 182.2, 1.0, E.inOut));
  st.gy = lerp(0, 40, A(t, 184.9, 1.0, E.inOut));
  st.gx = lerp(0, 0, 0);
  return st;
}
const FINAL = { headline: HL1, accent: C.lime, hs: 1.3, hy: -70, gx: 0, gy: 40 };

// 8 ─ Direct canvas editing (160.85 – 202.3)
function sCanvas(ctx, t) {
  kicker(ctx, 'Direct canvas editing', t, S(22), { y: 92 });
  const wk = A(t, S(22), 0.9, E.expo);
  const WX = 60, WY = 140 + (1 - wk) * 60, WWd = 1800, WH = 900;
  withA(ctx, wk, () => {
    appWindow(ctx, WX, WY, WWd, WH, 'Canvas');
    // tool rail
    for (let i = 0; i < 6; i++) { rrect(ctx, WX + 22, WY + 90 + i * 64, 44, 44, 12); ctx.fillStyle = i === 1 ? 'rgba(139,92,255,0.35)' : 'rgba(255,255,255,0.05)'; ctx.fill(); }
    txt(ctx, 'T', WX + 44, WY + 122 + 64, { size: 24, weight: 800, align: 'center' });
    const R = [WX + 110, WY + 90, 1240, 697.5];
    const st = canvasState(t);
    const split = win(t, S(27) - 0.1, EN(28) + 0.2);
    if (split > 0.5) {
      // before / after wipe
      const d = R[2] * (0.5 + 0.32 * Math.sin((t - S(27)) * 1.2));
      frameInto(ctx, 3, R[0], R[1], R[2], R[3], c => drawPromoEnhanced(c, t, { still: true }));
      ctx.save(); ctx.beginPath(); ctx.rect(R[0] + d, R[1], R[2] - d, R[3]); ctx.clip();
      frameInto(ctx, 4, R[0], R[1], R[2], R[3], c => drawPromoEnhanced(c, t, { still: true, ...FINAL }), { shadow: false });
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.fillRect(R[0] + d - 2, R[1], 4, R[3]);
      ctx.beginPath(); ctx.arc(R[0] + d, R[1] + R[3] / 2, 24, 0, 7); ctx.fill();
      txt(ctx, '‹ ›', R[0] + d, R[1] + R[3] / 2 + 8, { size: 24, weight: 800, fam: BODY, color: '#111', align: 'center' });
      pill(ctx, R[0] + 20, R[1] + R[3] - 40, 'Before', { size: 22, fill: 'rgba(0,0,0,0.6)' });
      pill(ctx, R[0] + R[2] - 20, R[1] + R[3] - 40, 'After', { size: 22, align: 'right', fill: 'rgba(0,0,0,0.6)', dot: C.lime });
    } else frameInto(ctx, 3, R[0], R[1], R[2], R[3], c => drawPromoEnhanced(c, t, st), { shadow: false });
    const nk = win(t, S(23), S(24));
    withA(ctx, nk, () => pill(ctx, R[0] + R[2] - 20, R[1] + 36, 'No regeneration needed', { size: 22, align: 'right', fill: 'rgba(10,10,20,0.85)', dot: C.lime }));
    // selections + cursor
    const size = 74 * st.hs, hx = mapX(R, 95), hy0 = mapY(R, 330 + st.hy - size * 0.95), hh = (size * 2.2) * R[3] / H;
    const hw = Math.max(tw(ctx, st.headline[0] || ' ', size, 850), tw(ctx, st.headline[1] || ' ', size, 850)) * R[2] / W + 30;
    selBox(ctx, hx, hy0, Math.max(hw, 120), hh, C.cyan, win(t, 168.7, 175.0) + win(t, 180.3, 183.6));
    if (t > 169.3 && t < 171.4) withA(ctx, 0.35, () => { ctx.fillStyle = C.cyan; ctx.fillRect(hx + 8, hy0 + 6, Math.max(hw, 120) - 16, hh - 12); });
    const sy = mapY(R, 640 + st.gy) - 10, sx = mapX(R, 100);
    selBox(ctx, sx, sy, 570 * R[2] / W, 230 * R[3] / H, C.pink, win(t, 184.4, 187.4));
    const keys = [[161, 1300, 900], [168.2, hx + 150, hy0 + 40], [175.3, hx + 150, hy0 + 40], [176.6, 1555, 455], [178.5, 1555, 455], [180.3, hx + Math.max(hw, 120), hy0 + hh],
      [183.6, hx + Math.max(hw, 120), hy0 + hh], [184.5, sx + 150, sy + 60], [187.3, sx + 150, sy + 60], [189, 1600, 950]];
    if (split < 0.5) {
      const [cx, cy] = path(t, keys);
      clickRing(ctx, hx + 150, hy0 + 40, t, 168.8); clickRing(ctx, 1555, 455, t, 176.8, C.lime);
      cursor(ctx, cx, cy, 1.15, (t > 168.7 && t < 169.0) || (t > 176.7 && t < 177.0) || (t > 180.6 && t < 183.4) || (t > 184.8 && t < 186.0) ? 1 : 0);
    }
    // properties panel
    const px = WX + 1390, py = WY + 90;
    rrect(ctx, px, py, 380, 790, 16); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill();
    sectionLabel(ctx, 'Text', px + 24, py + 40);
    rrect(ctx, px + 24, py + 58, 332, 92, 10); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
    txt(ctx, st.headline[0] || '', px + 40, py + 96, { size: 20, weight: 600, fam: BODY }); txt(ctx, st.headline[1] || '', px + 40, py + 128, { size: 20, weight: 600, fam: BODY });
    sectionLabel(ctx, 'Accent color', px + 24, py + 200);
    const sw = [C.cyan, C.violet, C.lime, C.pink, C.amber];
    sw.forEach((c, i) => {
      const x = px + 48 + i * 66, y = py + 250; ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fillStyle = c; ctx.fill();
      const on = (i === 0 && t < 176.9) || (i === 2 && t >= 176.9);
      if (on) { ctx.beginPath(); ctx.arc(x, y, 29, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
    });
    sectionLabel(ctx, 'Size', px + 24, py + 340);
    rrect(ctx, px + 24, py + 370, 332, 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
    const sk = (st.hs - 0.7) / 0.9; rrect(ctx, px + 24, py + 370, 332 * sk, 8, 4); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.beginPath(); ctx.arc(px + 24 + 332 * sk, py + 374, 12, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    txt(ctx, Math.round(74 * st.hs) + ' px', px + 356, py + 340, { size: 20, weight: 600, fam: MONO, align: 'right', color: C.dim });
    sectionLabel(ctx, 'Position', px + 24, py + 450);
    [['X', 110], ['Y', Math.round(330 + st.hy)]].forEach(([l, v], i) => {
      rrect(ctx, px + 24 + i * 172, py + 470, 160, 50, 10); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
      txt(ctx, l, px + 44 + i * 172, py + 503, { size: 20, weight: 600, fam: MONO, color: C.faint }); txt(ctx, String(v), px + 168 + i * 172, py + 503, { size: 20, weight: 600, fam: MONO, align: 'right' });
    });
    // live step log
    const steps = [['Headline rewritten', 171.4], ['Accent → lime', 176.9], ['Headline resized', 181.0], ['Headline moved up', 182.6], ['Stat card repositioned', 185.3]];
    sectionLabel(ctx, 'Changes', px + 24, py + 590);
    steps.forEach(([s, t0], i) => { const k = A(t, t0, 0.4); if (k > 0) withA(ctx, k, () => { iCheck(ctx, px + 38, py + 622 + i * 34, 18, C.lime); txt(ctx, s, px + 58, py + 629 + i * 34, { size: 19, weight: 550, fam: BODY, color: C.dim }); }); });
  });
  // closing thought over the window
  const ck = win(t, S(29), EN(29) + 0.5);
  if (ck > 0) withA(ctx, ck, () => {
    ctx.fillStyle = 'rgba(7,7,13,0.78)'; ctx.fillRect(0, 0, W, H);
    chip(ctx, 'AI: a good starting point', 640, 500, t, WT(29, 'ai'), { size: 36, col: C.violet });
    chip(ctx, 'You: the intentional details', 1280, 500, t, WT(29, 'control'), { size: 36, col: C.lime });
    fadeTxt(ctx, '+', W / 2, 516, t, WT(29, 'control'), { align: 'center', size: 60, color: C.dim });
  });
}

// 9 ─ Timeline (202.3 – 230.85)
function sTimeline(ctx, t) {
  kicker(ctx, 'Timing lives in the timeline', t, S(30), { y: 92 });
  const ik = A(t, S(30), 0.9, E.expo);
  withA(ctx, 1 - A(t, S(31) - 0.2, 0.4), () => {
    say(ctx, 'Canvas = layout.', 440, t, S(30) + 0.1, { size: 100 });
    say(ctx, 'Timeline = timing.', 580, t, WT(30, 'timing') - 0.1, { size: 100, color: C.cyan });
  });
  const wk = A(t, S(31), 0.9, E.expo); if (wk <= 0) return; void ik;
  withA(ctx, wk, () => {
    const WX = 60, WY = 140 + (1 - wk) * 60;
    appWindow(ctx, WX, WY, 1800, 900, 'Timeline');
    // timeline model
    const ts = lerp(17, 8.5, A(t, 211.0, 1.4, E.inOut)), td = lerp(5, 2.5, A(t, 213.2, 1.2, E.inOut));
    const gain = lerp(0, -6, A(t, 216.6, 1.4, E.inOut));
    const playing = t > 219.9, ph = playing ? Math.min(30, 7 + (t - 220.1) * 1.0) : 4;
    // preview
    const R = [WX + 500, WY + 80, 800, 450];
    frameInto(ctx, 5, R[0], R[1], R[2], R[3], c => {
      drawFootage(c, ph);
      const lt = ph - ts;
      if (lt >= 0 && lt <= td) {
        const k = E.back(clamp(lt / 0.5)), o = 1 - clamp((lt - td + 0.4) / 0.4);
        withA(c, o, () => at(c, W / 2, H / 2, 0.6 + 0.4 * k, () => {
          c.fillStyle = 'rgba(12,8,40,0.82)'; rrect(c, -560, -150, 1120, 300, 40); c.fill();
          txt(c, 'Meet Planora', 0, 40, { size: 130, weight: 900, align: 'center', color: '#fff' });
        }));
      }
      if (playing) { c.fillStyle = 'rgba(0,0,0,0.65)'; rrect(c, 560, 940, 800, 80, 16); c.fill(); txt(c, ['Your day, planned for you.', 'Ask the assistant anything.', 'Launch week, sorted.'][Math.floor(ph / 4) % 3], 960, 994, { size: 40, weight: 650, fam: BODY, align: 'center' }); }
    }, { shadow: false });
    txt(ctx, `00:${String(Math.floor(ph)).padStart(2, '0')}:${String(Math.floor((ph % 1) * 30)).padStart(2, '0')}`, R[0] + R[2] + 60, R[1] + R[3] - 14, { size: 26, weight: 600, fam: MONO, color: C.dim });
    if (playing) iPlay(ctx, R[0] + R[2] + 38, R[1] + R[3] - 23, 24, C.lime);
    // tracks
    const TX = WX + 200, TW = 1560, TY = WY + 560, px = s => TX + s * TW / 30;
    rrect(ctx, WX + 30, TY - 40, 1740, 370, 14); ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fill();
    for (let s = 0; s <= 30; s += 5) { txt(ctx, s + 's', px(s), TY - 12, { size: 16, weight: 500, fam: MONO, color: C.faint, align: 'center' }); }
    const lanes = [['Video', 0], ['Title', 1], ['Captions', 2], ['Audio', 3]];
    lanes.forEach(([n, i]) => { txt(ctx, n, WX + 50, TY + 42 + i * 72, { size: 19, weight: 600, fam: BODY, color: C.dim }); ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(TX, TY + 10 + i * 72, TW, 56); });
    [[0, 10, 'Dashboard', P.brand], [10, 20, 'Assistant', '#14b8a6'], [20, 30, 'Promo', C.pink]].forEach(([a, b, n, c]) => {
      rrect(ctx, px(a) + 2, TY + 14, px(b) - px(a) - 4, 48, 8); ctx.fillStyle = rgba(c, 0.55); ctx.fill(); txt(ctx, n, px(a) + 14, TY + 45, { size: 18, weight: 650, fam: BODY });
    });
    const tk = win(t, 210.6, 215.0);
    rrect(ctx, px(ts) + 2, TY + 86, px(ts + td) - px(ts) - 4, 48, 8); ctx.fillStyle = rgba(C.amber, 0.75); ctx.fill();
    if (tk > 0) { ctx.strokeStyle = rgba('#ffffff', tk); ctx.lineWidth = 3; rrect(ctx, px(ts) + 2, TY + 86, px(ts + td) - px(ts) - 4, 48, 8); ctx.stroke(); }
    txt(ctx, 'Title', px(ts) + 14, TY + 117, { size: 18, weight: 700, fam: BODY, color: '#1a1200' });
    for (let i = 0; i < 9; i++) { const a = 1 + i * 3.2; rrect(ctx, px(a), TY + 158, px(a + 2.6) - px(a), 48, 8); ctx.fillStyle = 'rgba(47,224,255,0.3)'; ctx.fill(); }
    // audio waveform + gain line
    const gk = Math.pow(10, gain / 20), r = rand(3), ay = TY + 262;
    ctx.fillStyle = 'rgba(200,255,60,0.55)';
    for (let x = 0; x < TW; x += 6) { const h = (8 + r() * 18 + 6 * Math.sin(x * 0.02)) * gk; ctx.fillRect(TX + x, ay - h, 3, h * 2); }
    const gy = ay - 26 - gain * 3; ctx.strokeStyle = C.lime; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(TX, gy); ctx.lineTo(TX + TW, gy); ctx.stroke();
    withA(ctx, win(t, 215.4, 219.6), () => pill(ctx, WX + 1600, ay - 60, `${gain.toFixed(1)} dB`, { size: 20, fill: 'rgba(20,20,30,0.95)', dot: C.lime }));
    // playhead
    ctx.fillStyle = C.red; ctx.fillRect(px(ph) - 1, TY - 30, 3, 330); ctx.beginPath(); ctx.moveTo(px(ph) - 9, TY - 34); ctx.lineTo(px(ph) + 9, TY - 34); ctx.lineTo(px(ph), TY - 22); ctx.fill();
    // action captions
    const notes = [['Move title before the demo', 210.6, 213.0], ['Trim duration 5s → 2.5s', 213.0, 215.2], ['Lower music −6 dB', 215.4, 219.5], ['Play it back', 219.6, 221.8]];
    notes.forEach(([s, a, b]) => withA(ctx, win(t, a, b), () => pill(ctx, WX + 60, WY + 110, s, { size: 24, dot: C.amber, fill: 'rgba(255,181,71,0.12)', stroke: rgba(C.amber, 0.5) })));
    // cursor
    if (!playing) {
      const [cx, cy] = path(t, [[208, 1200, 1000], [210.4, px(17) + 60, TY + 110], [211.0, px(17) + 60, TY + 110], [212.4, px(8.5) + 60, TY + 110], [212.9, px(13.5) - 4, TY + 110], [213.2, px(13.5) - 4, TY + 110], [214.4, px(11) - 4, TY + 110], [216.3, TX + TW - 200, gy], [216.6, TX + TW - 200, gy], [218.0, TX + TW - 200, ay - 26 + 18], [219.5, R[0] + R[2] + 38, R[1] + R[3] - 23]]);
      cursor(ctx, cx, cy, 1.15, (t > 211 && t < 212.4) || (t > 213.2 && t < 214.4) || (t > 216.6 && t < 218) ? 1 : 0);
    }
    // what timing controls
    [['Pacing', 'pacing'], ['Visuals', 'visuals'], ['Captions', 'captions'], ['Audio', 'audio']].forEach(([s, w], i) => chip(ctx, s, WX + 70, WY + 200 + i * 80, t, WT(35, w) - 0.1, { align: 'left', size: 26, col: C.cyan }));
    withA(ctx, A(t, WT(35, 'small'), 0.5), () => { txt(ctx, 'Small adjustments,', WX + 1340, WY + 240, { size: 34, weight: 850 }); txt(ctx, 'big change in feel.', WX + 1340, WY + 284, { size: 34, weight: 850, color: C.cyan }); });
  });
}

// 10 ─ Agent instructions (230.85 – 264.6)
function sAgent(ctx, t) {
  kicker(ctx, 'A targeted change, in words', t, S(36), { y: 92 });
  const wk = A(t, S(36), 0.9, E.expo);
  withA(ctx, wk, () => {
    const WX = 60, WY = 140 + (1 - wk) * 60;
    appWindow(ctx, WX, WY, 1800, 900, 'Agent');
    const R = [WX + 40, WY + 90, 1120, 630];
    const replay = t > S(40) - 0.1, per = 3.4, rk = replay ? clamp(((t - S(40) - 0.2) % per) / 1.0) : 1;
    frameInto(ctx, 3, R[0], R[1], R[2], R[3], c => drawPromoEnhanced(c, t, { still: true, ...FINAL, titleK: E.out(rk) }), { shadow: false });
    // selection on title
    const sk = win(t, WT(37, 'selected') - 0.1, S(40));
    const size = 74 * FINAL.hs, hy0 = mapY(R, 330 + FINAL.hy - size * 0.95);
    selBox(ctx, mapX(R, 95), hy0, tw(ctx, 'Plan less.', size, 850) * R[2] / W + 40, size * 2.2 * R[3] / H, C.violet, sk);
    withA(ctx, sk, () => pill(ctx, mapX(R, 95), hy0 - 28, 'Selected: opening title', { size: 18, fill: 'rgba(139,92,255,0.9)', stroke: 'transparent' }));
    // scale curve under the canvas
    const gk = A(t, S(40), 0.6);
    withA(ctx, gk, () => {
      const gx = R[0], gy = R[1] + R[3] + 40, gw = 560, gh = 110;
      sectionLabel(ctx, 'Title scale · 0 → 1.0 s', gx, gy);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.strokeRect(gx, gy + 14, gw, gh);
      ctx.strokeStyle = C.violet; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const k = i / 60; ctx.lineTo(gx + k * gw, gy + 14 + gh - (0.6 + 0.4 * E.out(k) - 0.6) / 0.4 * (gh - 10) - 5); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(gx + rk * gw, gy + 14 + gh - E.out(rk) * (gh - 10) - 5, 9, 0, 7); ctx.fillStyle = C.lime; ctx.fill();
      txt(ctx, Math.round(lerp(60, 100, E.out(rk))) + '%', gx + gw + 30, gy + 90, { size: 54, weight: 900, color: C.lime });
    });
    // chat panel
    const cx = WX + 1200, cy = WY + 90, cw = 560;
    rrect(ctx, cx, cy, cw, 780, 16); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill();
    const loop = A(t, S(41) + 0.2, 0.6);
    withA(ctx, 1 - loop, () => {
      iSpark(ctx, cx + 36, cy + 40, 26, C.violet); txt(ctx, 'Agent', cx + 60, cy + 49, { size: 24, weight: 750, fam: BODY });
      const m1 = 'Animate this title from a smaller size to its final size over about 1 second.';
      const m2 = 'Keep the font, color, position and product footage unchanged.';
      const lines = s => { const out = []; let cur = ''; s.split(' ').forEach(w => { if (tw(ctx, cur + ' ' + w, 22, 550, BODY) > cw - 110) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }); out.push(cur); return out; };
      const bubble = (s, y0, t0, col) => {
        const shown = typed(s, t, t0, 26); if (!shown) return y0;
        const ls = lines(shown), h = ls.length * 32 + 30;
        rrect(ctx, cx + 40, y0, cw - 70, h, 16); ctx.fillStyle = col; ctx.fill();
        ls.forEach((l, i) => txt(ctx, l, cx + 62, y0 + 40 + i * 32, { size: 22, weight: 550, fam: BODY }));
        return y0 + h + 18;
      };
      let y = cy + 90;
      y = bubble(m1, y, WT(37, 'asking') - 0.2, 'rgba(139,92,255,0.35)');
      y = bubble(m2, y, S(38), 'rgba(139,92,255,0.35)');
      [['Font', 'font'], ['Color', 'color'], ['Position', 'position'], ['Footage', 'footage']].forEach(([s, w], i) => {
        const k = A(t, WT(38, w), 0.4, E.back); if (k <= 0) return;
        at(ctx, cx + 100 + (i % 2) * 250, y + 30 + Math.floor(i / 2) * 64, k, () => { pill(ctx, -60, 0, s, { size: 20, fill: 'rgba(200,255,60,0.1)', stroke: rgba(C.lime, 0.5) }); iLock(ctx, -82, 2, 26, C.lime); });
      });
      y += 150;
      const rk2 = A(t, WT(39, 'specificity'), 0.5);
      if (rk2 > 0 && t < WT(39, 'specificity') + 1.2) [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(cx + 60 + i * 22, y + 20, 7, 0, 7); ctx.fillStyle = Math.floor(t * 6) % 3 === i ? C.violet : 'rgba(255,255,255,0.25)'; ctx.fill(); });
      else if (rk2 > 0) withA(ctx, A(t, WT(39, 'specificity') + 1.2, 0.4), () => {
        rrect(ctx, cx + 30, y, cw - 70, 200, 16); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
        txt(ctx, 'Updated 1 animation', cx + 54, y + 42, { size: 23, weight: 750, fam: BODY, color: C.lime });
        ['Title scale 60% → 100%', 'Duration 1.0 s · ease-out', 'Everything else unchanged'].forEach((s, i) => { iCheck(ctx, cx + 64, y + 84 + i * 38, 18, C.lime); txt(ctx, s, cx + 86, y + 91 + i * 38, { size: 21, weight: 550, fam: BODY, color: C.dim }); });
      });
    });
    // describe ⇄ edit loop
    withA(ctx, loop, () => {
      const ox = cx + cw / 2, oy = cy + 360, a = t * 1.4;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ox, oy, 170, 0, 7); ctx.stroke();
      [0, Math.PI].forEach(o => { ctx.beginPath(); ctx.arc(ox + Math.cos(a + o) * 170, oy + Math.sin(a + o) * 170, 8, 0, 7); ctx.fillStyle = C.lime; ctx.fill(); });
      [['Describe it', 'when that’s faster', -1, C.violet, 'natural'], ['Edit it directly', 'canvas · timeline', 1, C.cyan, 'direct']].forEach(([a1, b1, s, col, w]) => {
        const k = A(t, WT(41, w) - 0.1, 0.5, E.back); if (k <= 0) return;
        at(ctx, ox, oy + s * 170, k, () => { card(ctx, -190, -64, 380, 128, { fill: '#171726', stroke: rgba(col, 0.6), r: 22 }); txt(ctx, a1, 0, -4, { size: 32, weight: 850, align: 'center', color: col }); txt(ctx, b1, 0, 36, { size: 21, weight: 500, fam: BODY, align: 'center', color: C.dim }); });
      });
      fadeTxt(ctx, 'Words + direct control', ox, cy + 700, t, WT(41, 'refine'), { align: 'center', size: 32, weight: 800, color: C.ink, fam: DISPLAY });
    });
    withA(ctx, win(t, S(40), S(41) + 1.5), () => pill(ctx, R[0] + R[2] - 20, R[1] + 36, 'Result · replaying', { size: 20, align: 'right', fill: 'rgba(10,10,20,0.85)', dot: C.lime }));
  });
}

// 11 ─ Polish: filters + transitions (264.6 – 295.1)
const FILTER = 'contrast(1.1) saturate(1.25) brightness(1.03) hue-rotate(-6deg)';
function sPolish(ctx, t) {
  withA(ctx, 1 - A(t, S(43) - 0.2, 0.4), () => say(ctx, 'Polish the footage', 560, t, S(42) + 0.1, { size: 130, weight: 900 }));
  // filter test
  const f0 = S(43), f1 = EN(44) + 0.3;
  withA(ctx, win(t, f0, f1), () => {
    kicker(ctx, 'Filter test', t, f0, { y: 92 });
    const R = [360, 150, 1200, 675], src = (t - f0) % 9 < 4.5 ? 'd' : 'a';
    const draw = c => src === 'd' ? drawDashboard(c, 9.6, true) : drawAssistant(c, 9.5);
    const applied = t > f0 + 1.1, cmp = A(t, S(44), 0.6, E.inOut);
    frameInto(ctx, 3, R[0], R[1], R[2], R[3], draw, { filter: applied ? FILTER : 'none' });
    if (cmp > 0) {
      const d = R[2] * lerp(1, 0.5 + 0.25 * Math.sin((t - S(44)) * 1.3), cmp);
      ctx.save(); ctx.beginPath(); ctx.rect(R[0], R[1], d, R[3]); ctx.clip(); frameInto(ctx, 4, R[0], R[1], R[2], R[3], draw, { shadow: false }); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.fillRect(R[0] + d - 2, R[1], 4, R[3]);
      withA(ctx, cmp, () => { pill(ctx, R[0] + 20, R[1] + 40, 'Original', { size: 22, fill: 'rgba(0,0,0,0.7)' }); pill(ctx, R[0] + R[2] - 20, R[1] + 40, 'Filtered', { size: 22, align: 'right', fill: 'rgba(0,0,0,0.7)', dot: C.lime }); });
    }
    const filters = ['None', 'Clean contrast', 'Warm film', 'Mono'];
    let x = 560;
    filters.forEach((f, i) => { const on = applied ? i === 1 : i === 0; const w = pill(ctx, x, 900, f, { size: 24, fill: on ? 'rgba(200,255,60,0.15)' : 'rgba(255,255,255,0.05)', stroke: on ? rgba(C.lime, 0.7) : undefined, dot: on ? C.lime : undefined }); x += w + 20; });
    if (t < f0 + 1.6) { const [cx, cy] = path(t, [[f0, 1500, 1040], [f0 + 0.9, 845, 905], [f0 + 1.6, 845, 905]]); clickRing(ctx, 845, 900, t, f0 + 1.0, C.lime); cursor(ctx, cx, cy, 1.1, t > f0 + 0.95 && t < f0 + 1.15 ? 1 : 0); }
    chip(ctx, 'Product still clear & natural', 960, 990, t, WT(44, 'clear'), { size: 26 });
  });
  // transition editor
  const g0 = S(45), g1 = EN(46) + 0.3;
  withA(ctx, win(t, g0, g1), () => {
    kicker(ctx, 'Transition between clips', t, g0, { y: 92 });
    const R = [460, 150, 1000, 562.5], per = 3.2, lt = (t - g0) % per, k = E.inOut(clamp((lt - 1.2) / 0.6));
    const sel = t > WT(46, 'controlled') - 0.2 ? 'Slide' : 'Spin';
    frameInto(ctx, 3, R[0], R[1], R[2], R[3], c => {
      if (sel === 'Slide') {
        c.save(); c.translate(-W * 0.3 * k, 0); drawDashboard(c, 9.6, true); c.restore();
        c.save(); c.translate(W * (1 - k), 0); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 60; drawAssistant(c, 9.5); c.restore();
      } else {
        c.save(); c.translate(W / 2, H / 2); c.rotate(k * Math.PI * 4); c.scale(1 - 0.6 * Math.sin(k * Math.PI), 1 - 0.6 * Math.sin(k * Math.PI)); c.translate(-W / 2, -H / 2);
        if (k < 0.5) drawDashboard(c, 9.6, true); else drawAssistant(c, 9.5); c.restore();
      }
    });
    // clip strip
    const y = 780;
    [[460, 'Clip A · Dashboard', P.brand], [1000, 'Clip B · Assistant', '#14b8a6']].forEach(([x, n, c]) => { rrect(ctx, x, y, 460, 70, 12); ctx.fillStyle = rgba(c, 0.5); ctx.fill(); txt(ctx, n, x + 20, y + 44, { size: 22, weight: 650, fam: BODY }); });
    at(ctx, 960, y + 35, 1, () => { rrect(ctx, -60, -26, 120, 52, 12); ctx.fillStyle = C.ink; ctx.fill(); txt(ctx, sel, 0, 8, { size: 20, weight: 750, fam: BODY, color: '#111', align: 'center' }); });
    // curve + options
    ['Cut', 'Crossfade', 'Slide', 'Spin 720°'].forEach((o, i) => {
      const on = o.startsWith(sel), bad = o.startsWith('Spin');
      pill(ctx, 120, 220 + i * 74, o, { size: 22, fill: on ? 'rgba(47,224,255,0.15)' : 'rgba(255,255,255,0.04)', stroke: on ? rgba(C.cyan, 0.7) : undefined, dot: on ? (bad ? C.red : C.cyan) : undefined });
    });
    withA(ctx, A(t, WT(46, 'distracting'), 0.4), () => { ctx.fillStyle = C.red; ctx.fillRect(120, 220 + 3 * 74 - 2, 190, 4); txt(ctx, 'distracting', 120, 220 + 3 * 74 + 50, { size: 20, weight: 600, fam: BODY, color: C.red }); });
    withA(ctx, A(t, WT(46, 'controlled'), 0.5), () => {
      const gx = 1530, gy = 230, gw = 280, gh = 160;
      sectionLabel(ctx, 'Ease in-out · 0.6 s', gx, gy - 14);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.strokeRect(gx, gy, gw, gh);
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 40; i++) ctx.lineTo(gx + i / 40 * gw, gy + gh - E.inOut(i / 40) * gh); ctx.stroke();
      const kk = clamp((lt - 1.2) / 0.6); ctx.beginPath(); ctx.arc(gx + kk * gw, gy + gh - E.inOut(kk) * gh, 8, 0, 7); ctx.fillStyle = C.lime; ctx.fill();
      chip(ctx, 'Checked in playback', gx + 140, gy + 240, t, WT(46, 'playback'), { size: 20 });
    });
  });
  // bring it together
  const h0 = S(47);
  withA(ctx, A(t, h0, 0.4), () => {
    const jk = A(t, WT(47, 'together') - 0.4, 1.0, E.inOut);
    [['Graphics', C.violet, 'graphics'], ['Footage', C.cyan, 'footage'], ['Pacing', C.lime, 'pacing']].forEach(([s, col, w], i) => {
      const k = A(t, WT(47, w) - 0.1, 0.5, E.back); if (k <= 0) return;
      at(ctx, 960 + (i - 1) * lerp(480, 230, jk), 540, k, () => { ctx.beginPath(); ctx.arc(0, 0, 210, 0, 7); ctx.fillStyle = rgba(col, 0.2); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, s, 0, 16, { size: 48, weight: 850, align: 'center' }); });
    });
  });
}

// 12 ─ Export at native 4K, then verify (295.1 – 330.15)
function sExport(ctx, t) {
  withA(ctx, 1 - A(t, S(49) - 0.2, 0.4), () => say(ctx, 'Export', 580, t, S(48) + 0.1, { size: 180, weight: 900 }));
  const dEnd = S(52) - 0.2;
  withA(ctx, A(t, S(49) - 0.1, 0.5) * (1 - A(t, dEnd, 0.4)), () => {
    kicker(ctx, 'Render settings', t, S(49), { y: 92 });
    const verify = A(t, S(51) + 0.3, 0.9, E.inOut);
    const x = lerp(510, 150, verify), y = 170, w = 900, h = 760;
    card(ctx, x, y, w, h, { fill: '#12121d', r: 26 });
    txt(ctx, 'Render settings', x + 50, y + 80, { size: 40, weight: 850 });
    const rows = [['Format', 'MP4 · H.264'], ['Frame rate', '30 fps'], ['Resolution', null]];
    rows.forEach(([a, b], i) => {
      const yy = y + 160 + i * 100;
      txt(ctx, a, x + 50, yy + 36, { size: 24, weight: 500, fam: BODY, color: C.dim });
      rrect(ctx, x + 330, yy, 520, 60, 12); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
      const val = b || (t > WT(50, 'selecting') ? 'Native 4K · 3840 × 2160' : '1080p · 1920 × 1080');
      txt(ctx, val, x + 354, yy + 39, { size: 24, weight: 650, fam: BODY, color: !b && t > WT(50, 'selecting') ? C.lime : C.ink });
      if (!b) txt(ctx, '▾', x + 820, yy + 39, { size: 22, weight: 600, fam: BODY, color: C.dim, align: 'right' });
    });
    // render button + progress
    const rb = y + 520, rStart = EN(50) - 0.2, rp = clamp((t - rStart) / 3.0);
    rrect(ctx, x + 50, rb, 800, 74, 37); ctx.fillStyle = t > rStart ? 'rgba(255,255,255,0.08)' : C.lime; ctx.fill();
    if (t > rStart) { rrect(ctx, x + 50, rb, 800 * E.inOut(rp), 74, 37); ctx.fillStyle = C.lime; ctx.fill(); }
    txt(ctx, t < rStart ? 'Render' : rp < 1 ? `Rendering… ${Math.round(rp * 100)}%` : 'Rendered', x + 450, rb + 48, { size: 28, weight: 800, fam: BODY, color: '#0b0b12', align: 'center' });
    clickRing(ctx, x + 450, rb + 37, t, rStart, C.lime);
    txt(ctx, 'output_native4k.mp4', x + 50, y + 680, { size: 22, weight: 500, fam: MONO, color: C.faint });
    // dropdown
    const dk = win(t, WT(49, 'resolution') - 0.2, WT(50, 'selecting') + 0.6);
    const opts = ['720p · 1280 × 720', '1080p · 1920 × 1080', '1440p · 2560 × 1440', 'Native 4K · 3840 × 2160'];
    const hov = t < WT(50, 'native') - 0.3 ? 1 : 3;
    if (dk > 0) withA(ctx, dk, () => {
      const yy = y + 160 + 2 * 100 + 70;
      card(ctx, x + 330, yy, 520, 4 * 62 + 16, { fill: '#1d1d2c', r: 14 });
      opts.forEach((o, i) => {
        if (i === hov) { rrect(ctx, x + 338, yy + 8 + i * 62, 504, 56, 10); ctx.fillStyle = i === 3 ? 'rgba(200,255,60,0.16)' : 'rgba(255,255,255,0.07)'; ctx.fill(); }
        txt(ctx, o, x + 360, yy + 45 + i * 62, { size: 23, weight: i === 3 ? 750 : 550, fam: BODY, color: i === 3 ? C.lime : C.ink });
      });
      const [cx, cy] = path(t, [[WT(49, 'resolution'), x + 700, y + 400], [WT(49, 'resolution') + 0.5, x + 700, yy + 8 + 62 + 28], [WT(50, 'native') - 0.3, x + 700, yy + 8 + 62 + 28], [WT(50, 'native') + 0.4, x + 700, yy + 8 + 3 * 62 + 28]]);
      cursor(ctx, cx, cy, 1.15, t > WT(50, 'selecting') - 0.1 && t < WT(50, 'selecting') + 0.15 ? 1 : 0);
    });
    // verification panel
    if (verify > 0) withA(ctx, verify, () => {
      const vx = 1110, vy = 170;
      card(ctx, vx, vy, 660, 760, { fill: '#0e0e16', stroke: rgba(C.cyan, 0.4), r: 26 });
      sectionLabel(ctx, 'Verify the actual file', vx + 44, vy + 60, C.cyan);
      txt(ctx, '$ inspect output_native4k.mp4', vx + 44, vy + 130, { size: 22, weight: 500, fam: MONO, color: C.dim });
      const v0 = WT(51, 'dimensions') - 0.6;
      [['width', '3840 px'], ['height', '2160 px'], ['fps', '30']].forEach(([a, b], i) => {
        const k = A(t, v0 + i * 0.35, 0.3); if (k <= 0) return;
        withA(ctx, k, () => { txt(ctx, a, vx + 44, vy + 210 + i * 60, { size: 30, weight: 500, fam: MONO, color: C.faint }); txt(ctx, b, vx + 600, vy + 210 + i * 60, { size: 30, weight: 700, fam: MONO, align: 'right' }); });
      });
      chip(ctx, 'Native 4K confirmed', vx + 330, vy + 470, t, v0 + 1.2, { size: 30 });
      withA(ctx, A(t, WT(51, 'label'), 0.5), () => { txt(ctx, 'A label in the UI', vx + 44, vy + 610, { size: 30, weight: 800 }); txt(ctx, 'isn’t proof on its own.', vx + 44, vy + 652, { size: 30, weight: 800, color: C.cyan }); });
    });
  });
  // loupe: fine details at 4K
  const l0 = S(52), l1 = EN(52) + 0.3;
  withA(ctx, win(t, l0 - 0.2, l1), () => {
    kicker(ctx, 'Check the details', t, l0, { y: 92 });
    const R = [160, 170, 1280, 720];
    const oc = frameInto(ctx, 3, R[0], R[1], R[2], R[3], c => drawPromoEnhanced(c, t, { still: true, ...FINAL }));
    const targets = [[400, 330, 'text'], [1250, 330, 'fine'], [330, 790, 'graphic']];
    let ti = 0; targets.forEach((tg, i) => { if (t > WT(52, tg[2]) - 0.3) ti = i; });
    const prev = targets[Math.max(0, ti - 1)], cur = targets[ti], mk = A(t, WT(52, cur[2]) - 0.3, 0.6, E.inOut);
    const fx = lerp(prev[0], cur[0], ti ? mk : 1), fy = lerp(prev[1], cur[1], ti ? mk : 1);
    const lx = mapX(R, fx), ly = mapY(R, fy), rr = 150, z = 2.6;
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, rr, 0, 7); ctx.clip();
    const sw = (rr * 2) / z * (W / R[2]);
    ctx.drawImage(oc, fx - sw / 2, fy - sw / 2, sw, sw, lx - rr, ly - rr, rr * 2, rr * 2); ctx.restore();
    ctx.beginPath(); ctx.arc(lx, ly, rr, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(0.8); rrect(ctx, rr, -14, 90, 28, 12); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
    [['Text', 'text'], ['Fine lines', 'fine'], ['Graphic details', 'graphic']].forEach(([s, w], i) => chip(ctx, s, 1500, 300 + i * 110, t, WT(52, w) - 0.1, { align: 'left', size: 30 }));
  });
  // prompt → render
  const p0 = S(53);
  withA(ctx, A(t, p0, 0.5), () => {
    const k = A(t, p0 + 0.3, 3.5, E.inOut);
    txt(ctx, 'Initial prompt', 300, 470, { size: 44, weight: 850, color: C.violet }); txt(ctx, 'Finished render', 1620, 470, { size: 44, weight: 850, color: C.lime, align: 'right' });
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(300, 560, 1320, 6); ctx.fillStyle = gradText(ctx, 300, 1620, C.violet, C.lime); ctx.fillRect(300, 560, 1320 * k, 6);
    ['Generate', 'Canvas', 'Timeline', 'Agent', 'Polish', 'Export'].forEach((s, i) => { const x = 300 + i * 264, on = k * 1320 >= i * 264 - 1; ctx.beginPath(); ctx.arc(x, 563, 14, 0, 7); ctx.fillStyle = on ? C.ink : '#2a2a3a'; ctx.fill(); txt(ctx, s, x, 630, { size: 24, weight: 600, fam: BODY, align: 'center', color: on ? C.ink : C.faint }); });
    ctx.beginPath(); ctx.arc(300 + 1320 * k, 563, 22, 0, 7); ctx.fillStyle = C.lime; ctx.fill();
  });
}
