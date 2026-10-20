// Scene sequencer: crossfades + sweep transitions between VO-synced scenes.
const SCENES = [
  [0, 16.55, 'sHook'], [16.55, 27.4, 'sAITools'], [27.4, 35.05, 'sIdea'], [35.05, 56.75, 'sBrief'], [56.75, 64.1, 'sNext'],
  [64.1, 111.5, 'sCompare'], [111.5, 160.85, 'sCost'], [160.85, 202.3, 'sCanvas'], [202.3, 230.85, 'sTimeline'],
  [230.85, 264.6, 'sAgent'], [264.6, 295.1, 'sPolish'], [295.1, 330.15, 'sExport'], [330.15, 361.2, 'sRecap'],
  [361.2, 373.5, 'sUses'], [373.5, 386.7, 'sPrice'], [386.7, 397.9, 'sAlt'], [397.9, 411, 'sOutro'],
];
function sweep(ctx, t, tb) {
  const k = prog(t, tb - 0.3, 0.8); if (k <= 0 || k >= 1) return;
  const x = lerp(-900, W + 400, E.inOut(k));
  ctx.save(); ctx.transform(1, 0, -0.35, 1, 0, 0);
  [[C.violet, 0, 220], [C.cyan, 250, 60], [C.lime, 340, 18]].forEach(([c, off, w]) => { ctx.fillStyle = c; ctx.globalAlpha = 0.9; ctx.fillRect(x + off + H * 0.35, 0, w, H); });
  ctx.restore();
}
function drawFrame(ctx, t) {
  bg(ctx, t);
  SCENES.forEach(([a, b, name], i) => {
    if (t < a || t > b + 0.45) return;
    const fn = window[name]; if (!fn) return;
    const kin = i === 0 ? 1 : A(t, a, 0.5, E.out), kout = 1 - A(t, b, 0.45, E.in);
    const al = Math.min(kin, kout); if (al <= 0.001) return;
    const s = t < b ? lerp(1.035, 1, kin) : lerp(1, 0.97, 1 - kout);
    ctx.save(); ctx.globalAlpha = al; ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
    fn(ctx, t); ctx.restore();
  });
  SCENES.slice(1).forEach(([a]) => sweep(ctx, t, a));
  vignette(ctx);
  hud(ctx, t);
  const fo = Math.max(1 - A(t, 0, 0.6), A(t, END - 0.8, 0.8));
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}
