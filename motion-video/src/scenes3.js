// Scenes 13-17: finished project + recap, use cases, price recap, the alternative, outro.

// 13 ─ Finished project, workflow recap, takeaway (330.15 – 361.2)
function sRecap(ctx, t) {
  // finished promo, full bleed in a frame
  const f1 = WT(55, 'started') + 0.2;
  withA(ctx, 1 - A(t, f1, 0.5), () => {
    kicker(ctx, 'The finished project', t, S(54));
    const k = A(t, S(54) - 0.1, 0.9, E.expo), w = lerp(1300, 1500, k), h = w * 9 / 16;
    frameInto(ctx, 3, W / 2 - w / 2, 160 + (844 - h) / 2, w, h, c => drawPromoEnhanced(c, t, { t0: S(54) + 0.1, ...FINAL, titleK: E.out(A(t, S(54) + 0.2, 1.0)) }), { r: 24 });
  });
  // workflow path
  const p0 = f1 - 0.2, p1 = S(58) - 0.1;
  withA(ctx, A(t, p0, 0.5) * (1 - A(t, p1, 0.4)), () => {
    kicker(ctx, 'The complete workflow', t, p0);
    const nodes = [['Source + brief', 55, 'source'], ['First version', 55, 'initial'], ['Motion graphics', 55, 'refined'], ['Canvas layout', 56, 'layout'],
      ['Timeline timing', 56, 'timing'], ['Agent change', 56, 'agent'], ['Filters + transitions', 56, 'polished'], ['Native 4K export', 57, 'export']];
    const x0 = 180, dx = (1740 - 180) / 7, y = 520;
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x0, y - 3, 1560, 6);
    let last = -1; nodes.forEach(([, i, w], j) => { if (t >= WT(i, w) - 0.1) last = j; });
    if (last >= 0) {
      const lt = WT(nodes[last][1], nodes[last][2]) - 0.1, k = A(t, lt, 0.5, E.inOut);
      const ex = x0 + dx * Math.max(0, last - 1) + dx * (last ? k : 0);
      ctx.fillStyle = gradText(ctx, x0, 1740, C.violet, C.lime); ctx.fillRect(x0, y - 3, ex - x0, 6);
    }
    nodes.forEach(([s, i, w], j) => {
      const k = A(t, WT(i, w) - 0.1, 0.5, E.back), x = x0 + j * dx;
      ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); ctx.fillStyle = '#1a1a28'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.stroke();
      if (k > 0) at(ctx, x, y, k, () => {
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fillStyle = [C.violet, C.violet, C.cyan, C.cyan, C.amber, C.pink, C.pink, C.lime][j]; ctx.fill();
        txt(ctx, String(j + 1), 0, 9, { size: 24, weight: 800, fam: BODY, color: '#0b0b12', align: 'center' });
      });
      withA(ctx, clamp(k), () => {
        const parts = s.split(' '); const a1 = parts.slice(0, Math.ceil(parts.length / 2)).join(' '), a2 = parts.slice(Math.ceil(parts.length / 2)).join(' ');
        txt(ctx, a1, x, y + (j % 2 ? -90 : 90), { size: 26, weight: 700, fam: BODY, align: 'center' });
        txt(ctx, a2, x, y + (j % 2 ? -58 : 122), { size: 26, weight: 700, fam: BODY, align: 'center', color: C.dim });
      });
    });
    const bk = A(t, WT(57, 'together'), 0.8, E.inOut);
    if (bk > 0) withA(ctx, bk, () => {
      ctx.strokeStyle = rgba(C.lime, 0.7); ctx.lineWidth = 3; rrect(ctx, 960 - 870 * bk, 340, 1740 * bk, 360, 40); ctx.stroke();
      pill(ctx, 960, 780, 'One workflow', { size: 30, align: 'center', dot: C.lime, fill: 'rgba(200,255,60,0.12)', stroke: rgba(C.lime, 0.5) });
      fadeTxt(ctx, 'with export settings that control the final output', W / 2, 860, t, WT(57, 'export'), { align: 'center', size: 28 });
    });
  });
  // takeaway
  const q = S(58);
  withA(ctx, A(t, q, 0.5), () => {
    kicker(ctx, 'Biggest takeaway', t, q);
    const mk = A(t, WT(58, 'connected') - 0.5, 1.0, E.inOut);
    [['AI generation', C.violet, 'ai', -1], ['Hands-on editing', C.cyan, 'handson', 1]].forEach(([s, col, w, sd]) => {
      const k = A(t, WT(58, w) - 0.1, 0.6, E.back); if (k <= 0) return;
      at(ctx, 960 + sd * lerp(360, 150, mk), 500, k, () => { ctx.beginPath(); ctx.arc(0, 0, 250, 0, 7); ctx.fillStyle = rgba(col, 0.18); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, s, sd * 90 * mk, 14, { size: 42, weight: 850, align: 'center' }); });
    });
    const ck = A(t, WT(58, 'connected'), 0.6, E.expo);
    withA(ctx, ck, () => { txt(ctx, 'A more connected workflow', W / 2, 870 + (1 - ck) * 20, { size: 64, weight: 900, align: 'center', color: C.lime }); });
  });
}

// 14 ─ Who it's for (361.2 – 373.5)
function sUses(ctx, t) {
  kicker(ctx, 'Who could use this', t, S(59));
  const cols = [[140, 'Commercial creators', 'commercial', C.violet, [['Promotional ads', 'promotional'], ['Product launches', 'product'], ['Branded campaigns', 'branded']]],
    [1000, 'Social media teams', 'social', C.cyan, [['Animated captions', 'animated'], ['Short-form videos', 'shortform'], ['Quick data graphics', 'quick']]]];
  cols.forEach(([x, title, w, col, rows]) => {
    const k = A(t, WT(59, w) - 0.2, 0.8, E.expo); if (k <= 0) return;
    withA(ctx, k, () => {
      const y = 210 + (1 - k) * 50;
      card(ctx, x, y, 780, 680, { fill: 'rgba(255,255,255,0.04)', stroke: rgba(col, 0.45), r: 30 });
      ctx.beginPath(); ctx.arc(x + 80, y + 90, 36, 0, 7); ctx.fillStyle = rgba(col, 0.25); ctx.fill(); iSpark(ctx, x + 80, y + 90, 38, col);
      txt(ctx, title, x + 140, y + 106, { size: 50, weight: 900 });
      rows.forEach(([r, rw], j) => {
        const kk = A(t, WT(59, rw) - 0.1, 0.5, E.expo); if (kk <= 0) return;
        withA(ctx, kk, () => {
          const yy = y + 220 + j * 140;
          rrect(ctx, x + 40 + (1 - kk) * 30, yy, 700, 110, 20); ctx.fillStyle = rgba(col, 0.1); ctx.fill();
          txt(ctx, '0' + (j + 1), x + 80 + (1 - kk) * 30, yy + 68, { size: 26, weight: 700, fam: MONO, color: col });
          txt(ctx, r, x + 150 + (1 - kk) * 30, yy + 70, { size: 38, weight: 800 });
        });
      });
    });
  });
}

// 15 ─ Price recap (373.5 – 386.7)
function sPrice(ctx, t) {
  kicker(ctx, 'Price check (estimate)', t, S(60));
  say(ctx, 'A 30-second sequence', 270, t, WT(60, '30') - 0.1, { size: 84, weight: 900 });
  costEq(ctx, W / 2, 560, t, WT(60, 'six'), WT(60, '30') + 0.3, WT(60, 'dollar') - 0.2);
  const k = A(t, WT(60, 'actual'), 0.6, E.expo);
  withA(ctx, k, () => {
    card(ctx, 460, 790 + (1 - k) * 20, 1000, 120, { fill: 'rgba(255,181,71,0.08)', stroke: rgba(C.amber, 0.45), r: 60, shadow: false });
    txt(ctx, 'i', 530, 865 + (1 - k) * 20, { size: 40, weight: 900, fam: BODY, color: C.amber, align: 'center' });
    txt(ctx, 'Actual costs & output options depend on plan and workflow', 580, 862 + (1 - k) * 20, { size: 30, weight: 600, fam: BODY });
  });
}

// 16 ─ Manual control vs combined approach (386.7 – 397.9)
function sAlt(ctx, t) {
  kicker(ctx, 'The alternative', t, S(61));
  const lk = A(t, S(61), 0.8, E.expo);
  withA(ctx, lk, () => {
    card(ctx, 140, 220, 620, 640, { fill: 'rgba(255,181,71,0.05)', stroke: rgba(C.amber, 0.4), r: 30 });
    txt(ctx, 'Traditional tools', 190, 300, { size: 26, weight: 600, fam: BODY, color: C.dim });
    txt(ctx, 'After Effects', 190, 370, { size: 58, weight: 900, color: C.amber });
    // control dial
    const a = -2.2 + 4.4 * (0.5 + 0.5 * Math.sin(t * 0.9));
    ctx.beginPath(); ctx.arc(450, 600, 130, 0, 7); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 16; ctx.stroke();
    ctx.beginPath(); ctx.arc(450, 600, 130, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * 0.92); ctx.strokeStyle = C.amber; ctx.stroke();
    at(ctx, 450, 600, 1, () => { ctx.fillStyle = '#1d1a14'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.fillStyle = C.amber; ctx.fillRect(-4, -84, 8, 40); }, a);
    fadeTxt(ctx, 'Deep manual control', 450, 810, t, WT(61, 'deep'), { align: 'center', size: 34, weight: 800, color: C.ink, fam: DISPLAY });
  });
  withA(ctx, A(t, WT(61, 'but'), 0.5), () => txt(ctx, 'vs', 880, 560, { size: 60, weight: 300, fam: BODY, color: C.faint, align: 'center' }));
  const rk = A(t, WT(61, 'combining') - 0.1, 0.8, E.expo);
  withA(ctx, rk, () => {
    card(ctx, 1000, 220, 780, 640, { fill: 'rgba(47,224,255,0.05)', stroke: rgba(C.cyan, 0.4), r: 30 });
    txt(ctx, 'Combined approach', 1050, 300, { size: 26, weight: 600, fam: BODY, color: C.dim });
    [['AI instructions', 'ai'], ['Canvas editing', 'canvas'], ['Timeline adjustments', 'timeline'], ['High-res rendering', 'highresolution']].forEach(([s, w], i) => chip(ctx, s, 1050, 390 + i * 100, t, WT(61, w) - 0.1, { align: 'left', size: 32, col: C.cyan }));
  });
  const ik = A(t, WT(61, 'interesting'), 0.6, E.expo);
  withA(ctx, ik, () => txt(ctx, 'An interesting alternative.', W / 2, 980 - (1 - ik) * -20, { size: 56, weight: 900, align: 'center', color: C.lime }));
}

// 17 ─ CTA, comment prompt, sign-off (397.9 – 411)
function sOutro(ctx, t) {
  const c1 = S(63) - 0.2;
  withA(ctx, 1 - A(t, c1, 0.4), () => {
    say(ctx, 'Try Fotor Agent', 420, t, S(62), { size: 130, weight: 900 });
    fadeTxt(ctx, 'Link in the description', W / 2, 560, t, WT(62, 'link') - 0.1, { align: 'center', size: 46, weight: 700, color: C.cyan, fam: BODY });
    const k = A(t, WT(62, 'description') - 0.2, 0.5);
    withA(ctx, k, () => { for (let i = 0; i < 3; i++) { const y = 680 + i * 50 + Math.sin(t * 5 - i) * 10; ctx.strokeStyle = rgba(C.cyan, 1 - i * 0.28); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(920, y); ctx.lineTo(960, y + 36); ctx.lineTo(1000, y); ctx.stroke(); } });
  });
  const p1 = S(64) - 0.2;
  withA(ctx, A(t, c1, 0.5) * (1 - A(t, p1, 0.4)), () => {
    kicker(ctx, 'Tell me in the comments', t, c1 + 0.1);
    say(ctx, 'How would you build motion graphics?', 300, t, c1 + 0.2, { size: 76, weight: 900 });
    const opts = [['Build them manually', 'manually', C.amber], ['Direct them with AI', 'direct', C.violet], ['Combine both', 'combine', C.lime]];
    opts.forEach(([s, w, col], i) => {
      const t0 = WT(63, w) - 0.1, k = A(t, t0, 0.6, E.expo); if (k <= 0) return;
      withA(ctx, k, () => {
        const y = 430 + i * 150 + (1 - k) * 20;
        rrect(ctx, 360, y, 1200, 110, 24); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
        txt(ctx, ['A', 'B', 'C'][i], 420, y + 72, { size: 38, weight: 900, fam: MONO, color: col });
        txt(ctx, s, 490, y + 70, { size: 40, weight: 800 });
        iSpark(ctx, 1490, y + 55, 34, rgba(col, 0.8));
      });
    });
  });
  withA(ctx, A(t, p1, 0.6), () => {
    say(ctx, 'Thanks for watching.', 500, t, p1 + 0.1, { size: 140, weight: 900 });
    fadeTxt(ctx, 'See you in the next video', W / 2, 620, t, WT(64, 'see') - 0.1, { align: 'center', size: 44, color: C.cyan, weight: 700, fam: BODY });
  });
}
