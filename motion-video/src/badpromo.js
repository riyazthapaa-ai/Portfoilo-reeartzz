// Deliberately weak "first version" promo (30 s) for the demo: everything the script later fixes is built in.
// Flaws on purpose: long headline, weak hierarchy, cyan accent off-brand, headline sits low, stat card
// overlaps the product, title shows up late, hard cuts, linear fades, a static number instead of a visual.
const B = { bg: '#e9edf3', ink: '#2b2d38', sub: '#5d6170', accent: '#2fe0ff', box: '#ffffff' };
const fadeLin = (t, a, d = 1) => clamp((t - a) / d);

function badText(ctx, s, x, y, size, color = B.ink, weight = 600, align = 'left') { txt(ctx, s, x, y, { size, weight, fam: BODY, color, align }); }
function badBox(ctx, x, y, w, h) { ctx.fillStyle = B.box; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); }

// 0-3 s: intro card
function badIntro(ctx, t) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  withA(ctx, fadeLin(t, 0.3), () => {
    badText(ctx, 'Planora', W / 2, 520, 72, B.ink, 700, 'center');
    badText(ctx, 'The planner for creators and small businesses', W / 2, 590, 40, B.sub, 500, 'center');
  });
}
// 3-10 s: dashboard footage with a lower third that appears too late
function badDash(ctx, t) {
  drawDashboard(ctx, t - 3);
  withA(ctx, fadeLin(t, 8.2, 0.6), () => {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 930, W, 110);
    badText(ctx, 'Meet Planora - get more done every day with your new AI planner for your whole team', 60, 998, 36, '#ffffff', 500);
  });
}
// 10-20 s: assistant footage, stat box parked on top of the product
function badAssist(ctx, t) {
  drawAssistant(ctx, t - 10);
  withA(ctx, fadeLin(t, 12, 1), () => {
    badBox(ctx, 1180, 560, 560, 200);
    badText(ctx, 'Save 10 hours', 1210, 640, 54, B.ink, 700);
    badText(ctx, 'every week*', 1210, 710, 44, B.sub, 500);
  });
}
// 20-30 s: static promo end card (the "original" for before/after)
const BAD_HEADLINE = ['Get more done, every single day of the week,', 'with Planora'];
function badEnd(ctx, t) {
  ctx.fillStyle = B.bg; ctx.fillRect(0, 0, W, H);
  pLogo(ctx, 80, 70, 1);
  ctx.drawImage(productShot(), 860, 150, 960, 540);
  ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 2; ctx.strokeRect(860, 150, 960, 540);
  withA(ctx, fadeLin(t, 20.4), () => {
    badText(ctx, BAD_HEADLINE[0], 80, 790, 50, B.ink, 700);
    badText(ctx, BAD_HEADLINE[1], 80, 852, 50, B.accent, 700);
    badText(ctx, 'The AI planner for creators and small businesses. Plan tasks, meetings and', 80, 920, 30, B.sub, 500);
    badText(ctx, 'projects in one place and let the assistant organize your week.', 80, 960, 30, B.sub, 500);
  });
  withA(ctx, fadeLin(t, 21.5), () => {
    badBox(ctx, 640, 420, 420, 170);
    badText(ctx, '10 hours', 670, 500, 56, B.ink, 700);
    badText(ctx, 'saved every week', 670, 552, 30, B.sub, 500);
  });
  withA(ctx, fadeLin(t, 22.5), () => {
    ctx.fillStyle = B.accent; ctx.fillRect(1560, 900, 260, 80);
    badText(ctx, 'Try it free', 1690, 952, 32, '#0d3640', 700, 'center');
  });
}

function drawBad(ctx, t) {
  ctx.globalAlpha = 1;
  if (t < 3) badIntro(ctx, t);
  else if (t < 10) badDash(ctx, t);
  else if (t < 20) badAssist(ctx, t);
  else badEnd(ctx, t);
}
