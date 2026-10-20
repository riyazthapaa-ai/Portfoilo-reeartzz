// "Source footage" for the demo: plain product screens + a basic static promo frame
// for a fictional AI productivity tool called Planora.
const P = { bg: '#f4f5fa', panel: '#ffffff', ink: '#16172b', sub: '#6b6f86', line: '#e5e7f0', brand: '#5b4bff', brand2: '#14b8a6', soft: '#eeecff' };

function pText(ctx, s, x, y, size, weight = 500, color = P.ink, align = 'left') { txt(ctx, s, x, y, { size, weight, fam: BODY, color, align }); }
function pLogo(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, 0, 0, 44, 44, 12); const g = ctx.createLinearGradient(0, 0, 44, 44); g.addColorStop(0, P.brand); g.addColorStop(1, '#8f7bff'); ctx.fillStyle = g; ctx.fill();
  iSpark(ctx, 22, 22, 26, '#fff');
  pText(ctx, 'Planora', 58, 32, 28, 700);
  ctx.restore();
}
function shell(ctx, active) {
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.panel; ctx.fillRect(0, 0, 300, H); ctx.fillStyle = P.line; ctx.fillRect(300, 0, 1.5, H);
  pLogo(ctx, 36, 36);
  const nav = ['Today', 'Inbox', 'Projects', 'Calendar', 'AI Assistant', 'Reports'];
  nav.forEach((n, i) => {
    const y = 150 + i * 64;
    if (i === active) { rrect(ctx, 20, y - 22, 260, 52, 12); ctx.fillStyle = P.soft; ctx.fill(); }
    rrect(ctx, 44, y - 8, 20, 20, 6); ctx.fillStyle = i === active ? P.brand : '#c9cbe0'; ctx.fill();
    pText(ctx, n, 84, y + 10, 22, i === active ? 650 : 500, i === active ? P.brand : P.sub);
  });
  rrect(ctx, 24, H - 120, 252, 88, 16); ctx.fillStyle = P.soft; ctx.fill();
  pText(ctx, 'Focus time today', 44, H - 82, 18, 500, P.sub); pText(ctx, '3h 40m', 44, H - 50, 26, 700);
  // top bar
  rrect(ctx, 340, 28, 560, 52, 14); ctx.fillStyle = P.panel; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 1.5; ctx.stroke();
  pText(ctx, 'Search tasks, notes, people…', 380, 61, 20, 400, '#a0a3b8');
  ctx.beginPath(); ctx.arc(1852, 54, 24, 0, 7); ctx.fillStyle = '#ffd6a5'; ctx.fill(); pText(ctx, 'A', 1852, 63, 22, 700, '#8a4b00', 'center');
}

function drawDashboard(ctx, t, still = false) {
  shell(ctx, 0);
  pText(ctx, 'Good morning, Alex', 340, 160, 46, 750);
  pText(ctx, 'Tuesday · 6 tasks planned · 2 meetings', 340, 200, 22, 500, P.sub);
  // task list
  rrect(ctx, 340, 240, 900, 640, 20); ctx.fillStyle = P.panel; ctx.fill(); ctx.strokeStyle = P.line; ctx.stroke();
  pText(ctx, 'Today', 376, 292, 26, 700);
  const tasks = [['Finalize launch checklist', 'High', '#ff6b6b'], ['Review Q3 content calendar', 'Med', '#ffb547'], ['Reply to partner emails', 'Low', '#14b8a6'],
    ['Record product walkthrough', 'High', '#ff6b6b'], ['Update pricing page copy', 'Med', '#ffb547'], ['Team sync notes', 'Low', '#14b8a6']];
  const doneAt = [1.6, 2.6, -1, -1, -1, -1];
  tasks.forEach((tk, i) => {
    const y = 350 + i * 86, done = doneAt[i] >= 0 && t > doneAt[i];
    ctx.fillStyle = P.line; ctx.fillRect(376, y + 40, 828, 1.5);
    rrect(ctx, 376, y - 16, 30, 30, 9);
    if (done) { ctx.fillStyle = P.brand; ctx.fill(); iCheck(ctx, 391, y - 1, 26, '#fff'); } else { ctx.strokeStyle = '#c4c7da'; ctx.lineWidth = 2; ctx.stroke(); }
    pText(ctx, tk[0], 428, y + 8, 24, 550, done ? '#a0a3b8' : P.ink);
    if (done) { ctx.fillStyle = '#a0a3b8'; ctx.fillRect(428, y, tw(ctx, tk[0], 24, 550, BODY), 2); }
    rrect(ctx, 1110, y - 14, 70, 30, 15); ctx.fillStyle = rgba(tk[2], 0.14); ctx.fill(); pText(ctx, tk[1], 1145, y + 7, 17, 650, tk[2], 'center');
  });
  // right column
  rrect(ctx, 1280, 240, 600, 250, 20); ctx.fillStyle = P.panel; ctx.fill(); ctx.strokeStyle = P.line; ctx.stroke();
  pText(ctx, 'Weekly progress', 1316, 292, 24, 700);
  const bars = [0.45, 0.62, 0.8, 0.55, 0.7];
  bars.forEach((b, i) => { const h = 130 * b; rrect(ctx, 1330 + i * 105, 460 - h, 56, h, 10); ctx.fillStyle = i === 2 ? P.brand : '#d9d5ff'; ctx.fill(); pText(ctx, 'MTWTF'[i], 1358 + i * 105, 482, 16, 600, P.sub, 'center'); });
  // AI suggestion card
  const k = A(t, 3.2, 0.5);
  if (k > 0) withA(ctx, k, () => {
    const y = 520 + (1 - k) * 20;
    rrect(ctx, 1280, y, 600, 250, 20); ctx.fillStyle = P.soft; ctx.fill(); ctx.strokeStyle = '#d4ceff'; ctx.stroke();
    iSpark(ctx, 1320, y + 48, 28, P.brand); pText(ctx, 'AI suggestion', 1346, y + 56, 22, 700, P.brand);
    pText(ctx, 'Batch your emails at 4:00 PM', 1316, y + 110, 26, 650); pText(ctx, 'to free up a 45-minute focus block.', 1316, y + 146, 22, 500, P.sub);
    const applied = t > 6.0;
    rrect(ctx, 1316, y + 176, 140, 50, 12); ctx.fillStyle = applied ? P.brand2 : P.brand; ctx.fill();
    pText(ctx, applied ? 'Applied' : 'Apply', 1386, y + 208, 20, 650, '#fff', 'center');
    pText(ctx, 'Dismiss', 1500, y + 208, 20, 600, P.sub);
  });
  const tk = A(t, 6.2, 0.4) * (1 - A(t, 8.8, 0.4));
  if (tk > 0) withA(ctx, tk, () => { rrect(ctx, 1280, 990 + (1 - tk) * 30, 420, 60, 14); ctx.fillStyle = P.ink; ctx.fill(); iCheck(ctx, 1312, 1020 + (1 - tk) * 30, 22, '#7cf0c2'); pText(ctx, 'Schedule updated · +45 min focus', 1336, 1028 + (1 - tk) * 30, 20, 550, '#fff'); });
  if (still) return;
  const [cx, cy] = path(t, [[0, 1500, 900], [1.2, 391, 334], [1.7, 391, 334], [2.2, 391, 420], [2.8, 391, 420], [4.6, 1386, 744], [6.4, 1386, 744], [9.5, 1600, 860]]);
  clickRing(ctx, 391, 334, t, 1.55, P.brand); clickRing(ctx, 391, 420, t, 2.55, P.brand); clickRing(ctx, 1386, 721, t, 5.95, P.brand);
  cursor(ctx, cx, cy, 1.1, (t > 1.5 && t < 1.7) || (t > 2.5 && t < 2.7) || (t > 5.9 && t < 6.1) ? 1 : 0);
}

function drawAssistant(ctx, t) {
  shell(ctx, 4);
  // chat panel
  rrect(ctx, 340, 110, 640, 940, 20); ctx.fillStyle = P.panel; ctx.fill(); ctx.strokeStyle = P.line; ctx.stroke();
  iSpark(ctx, 384, 160, 30, P.brand); pText(ctx, 'AI Assistant', 412, 170, 26, 700);
  const q = 'Plan my week around the product launch.';
  const qt = typed(q, t, 0.6, 22), sent = t > 3.0;
  if (sent) {
    rrect(ctx, 520, 230, 430, 96, 18); ctx.fillStyle = P.brand; ctx.fill();
    pText(ctx, 'Plan my week around the', 548, 270, 22, 550, '#fff'); pText(ctx, 'product launch.', 548, 302, 22, 550, '#fff');
    if (t < 4.2) { [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(390 + i * 22, 380, 7, 0, 7); ctx.fillStyle = (Math.floor(t * 6) % 3 === i) ? P.brand : '#c9cbe0'; ctx.fill(); }); }
    else {
      const lines = ['Here’s a plan for your launch week:', '• Mon–Tue: deep work on launch assets', '• Wed: review + team sync', '• Thu: launch day, keep calendar light', '• Fri: follow-ups and recap'];
      rrect(ctx, 370, 350, 580, 250, 18); ctx.fillStyle = '#f2f3f8'; ctx.fill();
      lines.forEach((l, i) => withA(ctx, A(t, 4.2 + i * 0.35, 0.3), () => pText(ctx, l, 396, 392 + i * 44, 21, i ? 500 : 650, i ? '#3b3e58' : P.ink)));
    }
  }
  rrect(ctx, 370, 960, 580, 64, 16); ctx.fillStyle = '#f2f3f8'; ctx.fill();
  pText(ctx, sent ? 'Ask anything…' : qt + (caret(t) ? '|' : ''), 396, 1000, 21, 500, sent ? '#a0a3b8' : P.ink);
  rrect(ctx, 890, 972, 44, 40, 10); ctx.fillStyle = P.brand; ctx.fill(); iPlay(ctx, 912, 992, 18, '#fff');
  // calendar
  rrect(ctx, 1010, 110, 870, 940, 20); ctx.fillStyle = P.panel; ctx.fill(); ctx.strokeStyle = P.line; ctx.stroke();
  pText(ctx, 'This week', 1046, 170, 26, 700);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], cw = 160;
  days.forEach((d, i) => { pText(ctx, d, 1046 + i * cw + cw / 2 - 8, 226, 19, 650, P.sub, 'center'); ctx.fillStyle = P.line; ctx.fillRect(1046 + i * cw - 8, 250, 1.5, 770); });
  for (let h = 0; h < 8; h++) { ctx.fillStyle = '#f0f1f6'; ctx.fillRect(1038, 260 + h * 95, 812, 1.5); }
  const blocks = [[0, 0, 2.2, 'Launch assets', P.brand], [1, 0, 2.6, 'Deep work', P.brand], [0, 4, 1.2, 'Email batch', P.brand2], [2, 0.6, 1, 'Review', '#ffb547'],
    [2, 3, 1, 'Team sync', P.brand2], [3, 0.4, 1.4, 'Launch day', '#ff6b6b'], [3, 3, 0.8, 'Monitor', '#ffb547'], [4, 1, 1.2, 'Follow-ups', P.brand2], [4, 3.4, 1, 'Recap', P.brand]];
  blocks.forEach((b, i) => {
    const k = A(t, 4.6 + i * 0.22, 0.45, E.back); if (k <= 0) return;
    const x = 1046 + b[0] * cw, y = 268 + b[1] * 95, h = b[2] * 95 - 8;
    at(ctx, x + (cw - 22) / 2, y + h / 2, 0.6 + 0.4 * k, () => withA(ctx, clamp(k * 1.5), () => {
      rrect(ctx, -(cw - 22) / 2, -h / 2, cw - 22, h, 12); ctx.fillStyle = rgba(b[4], 0.16); ctx.fill();
      ctx.fillStyle = b[4]; ctx.fillRect(-(cw - 22) / 2, -h / 2 + 8, 4, Math.max(10, h - 16));
      pText(ctx, b[3], -(cw - 22) / 2 + 14, -h / 2 + 30, 17, 650, P.ink);
    }));
  });
  const [cx, cy] = path(t, [[0, 1200, 700], [0.5, 700, 990], [2.7, 700, 990], [2.95, 912, 992], [3.6, 1150, 640], [9.5, 1300, 700]]);
  clickRing(ctx, 912, 992, t, 2.95, P.brand); cursor(ctx, cx, cy, 1.1, t > 2.9 && t < 3.1 ? 1 : 0);
}

// Static promo frame: headline, product screenshot, plain stat. Used as the "original" in comparisons.
let _shot = null;
function productShot() {
  if (!_shot) { _shot = mkCanvas(); drawDashboard(_shot.getContext('2d'), 9.6, true); }
  return _shot;
}
const HEADLINE = ['Get more done, every day,', 'with Planora'];
function drawPromoBasic(ctx) {
  ctx.fillStyle = '#ecebff'; ctx.fillRect(0, 0, W, H);
  pLogo(ctx, 110, 90, 1.1);
  pText(ctx, HEADLINE[0], 110, 360, 58, 750); pText(ctx, HEADLINE[1], 110, 434, 58, 750);
  pText(ctx, 'The AI planner for creators and small businesses.', 110, 510, 28, 500, P.sub);
  rrect(ctx, 110, 590, 520, 150, 16); ctx.fillStyle = '#fff'; ctx.fill();
  pText(ctx, 'Save 10 hours every week', 140, 645, 28, 700);
  rrect(ctx, 140, 680, 460, 22, 11); ctx.fillStyle = '#e1defa'; ctx.fill(); rrect(ctx, 140, 680, 300, 22, 11); ctx.fillStyle = P.brand; ctx.fill();
  rrect(ctx, 110, 800, 230, 70, 14); ctx.fillStyle = P.brand; ctx.fill(); pText(ctx, 'Try it free', 225, 845, 26, 650, '#fff', 'center');
  ctx.save(); rrect(ctx, 940, 290, 880, 495, 16); ctx.clip(); ctx.drawImage(productShot(), 940, 290, 880, 495); ctx.restore();
  rrect(ctx, 940, 290, 880, 495, 16); ctx.strokeStyle = '#d4d0f5'; ctx.lineWidth = 3; ctx.stroke();
}

// Assembled 30s source clip: 0-10 dashboard, 10-20 assistant, 20-30 static promo.
function drawFootage(ctx, t) {
  if (t < 10) drawDashboard(ctx, t);
  else if (t < 20) drawAssistant(ctx, t - 10);
  else drawPromoBasic(ctx);
}
