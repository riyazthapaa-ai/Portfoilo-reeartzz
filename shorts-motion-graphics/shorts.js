/* ============================================================
   Batch 01 — four Shorts.
   Every graphic is anchored to a spoken word with cue("phrase"),
   so if you drop in real word timings (timings/<id>.json) the
   whole graphics track re-syncs to your voiceover automatically.
   ============================================================ */
const CHANNELS = {
  aiden: { theme: 'theme-aiden', name: 'AIDEN AI', mark: 'A', wordmark: 'AIDEN', tagline: 'Where Intelligence Evolves', handle: '@aidenai1' },
  // Eren AI: no banner provided yet — handle/tagline are placeholders, edit here.
  eren: { theme: 'theme-eren', name: 'EREN AI', mark: 'E', wordmark: 'EREN', tagline: 'AI Tools · Explained Fast', handle: '@erenai' },
};

const { A, put, show, stagger, punch, shake, float, typewriter, counter, strikeIn, flash, sweep, brackets, I, EASE, FX } = MG;

/* ---------- reusable compositions ---------- */
function headline(lines, top, size) {
  const el = put(`<div class="headline center-x">${lines.map((l) => `<span class="line">${l}</span>`).join('')}</div>`, { top: top + 'px' });
  if (size) el.style.fontSize = size + 'px';
  return { el, lines: [...el.querySelectorAll('.line')] };
}
const hl = (s, extra = '') => `<span class="hl" ${extra}><span>${s}</span></span>`;
const strike = (s) => `<span class="strike">${s}<i></i></span>`;

function promptCard(label, text, top, t0, tClick, t1) {
  const el = put(`<div class="card prompt"><div class="label"><span class="dot"></span>${label}</div><div class="text"></div><div class="bar"><div class="btn">${I.spark}Generate</div></div></div>`, { top: top + 'px' });
  show(el, t0, t1, 'up', 'fade', .55, .3);
  typewriter(el.querySelector('.text'), text, t0 + .35, 34);
  const btn = el.querySelector('.btn');
  const cur = put(`<div class="cursor">${I.cursor}</div>`, { left: '820px', top: top + 300 + 'px' });
  A(cur, [{ opacity: 0, transform: 'translate(180px,220px)' }, { opacity: 1, transform: 'translate(0,0)' }], tClick - .55, .5);
  A(cur, [{ transform: 'scale(1)' }, { transform: 'scale(.78)' }, { transform: 'scale(1)' }], tClick, .22, EASE.io);
  A(cur, [{ opacity: 1 }, { opacity: 0 }], t1 - .3, .3);
  punch(btn, tClick, 1.12);
  const ring = put('<div></div>', { left: '840px', top: top + 300 + 'px', width: '40px', height: '40px', borderRadius: '50%', border: '6px solid var(--brand-2)' });
  A(ring, [{ opacity: 1, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(4)' }], tClick, .5, EASE.out);
  return el;
}

function checkTile(k, v, x, y, w, t, t1) {
  const el = put(`<div class="card tile" style="width:${w}px"><div style="display:flex;justify-content:space-between;align-items:center"><div class="k">${k}</div><div class="icon-circle ok" style="width:52px;height:52px">${I.check}</div></div><div class="v">${v}</div></div>`, { left: x + 'px', top: y + 'px' });
  show(el, t, t1, 'pop', 'fade', .45, .25);
  A(el.querySelector('.icon-circle'), FX.pop, t + .18, .4);
  return el;
}

function xPill(text, x, y, t, t1, center = false) {
  const el = put(`<div class="pill ${center ? 'center-x' : ''}"><span class="icon-circle no" style="width:54px;height:54px">${I.x}</span>${strike(text)}</div>`, { top: y + 'px', ...(center ? {} : { left: x + 'px' }) });
  show(el, t, t1, 'left', 'fade', .4, .25);
  strikeIn(el, t + .3);
  return el;
}

/* ============================================================ */
const SHORTS = {
  /* ---------------- AIDEN AI · 01 ---------------- */
  '01': {
    channel: 'aiden',
    title: 'I Gave AI One Idea. It Built an Entire Brand.',
    script: [
      'What if I told you that you could start an entire *brand* without hiring a *designer,* writing *copy,* or even coming up with a *name?*',
      'I tested this by giving AI just *one* simple idea. And instead of giving me a boring list of suggestions, it helped turn that idea into an *actual* *brand.* We\'re talking brand *names,* *logos,* product *concepts,* *packaging,* and even marketing *visuals.* The crazy part? Everything started with a *single* *prompt.*',
      'We\'re getting dangerously close to a world where your biggest limitation isn\'t your *budget.* It\'s your *imagination.*',
    ],
    build(cue, W) {
      const end = W.total;
      // HOOK
      sweep(0);
      const h1 = headline(['<span class="sm">Start an entire</span>', hl('BRAND'), '<span class="sm">without hiring a…</span>'], 360);
      show(h1.lines[0], .05, W.hookEnd, 'up', 'fade', .45);
      show(h1.lines[1], .3, W.hookEnd, 'slam', 'fade', .5);
      show(h1.lines[2], cue('without'), W.hookEnd, 'up', 'fade', .4);
      xPill('DESIGNER', 0, 780, cue('designer'), W.hookEnd, true);
      xPill('COPYWRITER', 0, 900, cue('copy'), W.hookEnd, true);
      xPill('BRAND NAME', 0, 1020, cue('name'), W.hookEnd, true);
      punch(h1.lines[1], cue('name', { end: true }), 1.1);

      // ONE IDEA → prompt
      const tA = cue('i tested');
      flash(tA - .05, .5);
      promptCard('Just one idea', 'A minimalist outdoor brand for weekend hikers.', 420, tA, cue('and instead') - .25, cue('boring'));

      // boring list gets rejected
      const tB = cue('boring');
      const list = put(`<div class="card center-x" style="width:820px;padding:40px 44px">
          <div class="label" style="color:#9aa3b5"><span class="dot" style="background:#9aa3b5;box-shadow:none"></span>The usual AI answer</div>
          ${['Try a nature theme', 'Use earthy colors', 'Consider your audience', 'Pick a catchy name'].map((s, i) => `<div style="margin-top:22px;font:600 42px 'MG Display';color:#b9c0cf">${i + 1}. ${s}</div>`).join('')}
        </div>`, { top: '420px' });
      show(list, tB, cue('actual') , 'up', 'fade', .45, .25);
      const stamp = put(`<div class="pill center-x" style="background:var(--bad);border-color:#fff;font-size:52px;transform:rotate(-8deg)">${I.x} BORING</div>`, { top: '600px' });
      show(stamp, cue('it helped'), cue('actual'), 'slam', 'fade', .4, .25);

      // ACTUAL BRAND
      const tC = cue('actual');
      sweep(tC - .1);
      const h2 = headline(['<span class="sm">into an</span>', hl('ACTUAL BRAND')], 520, 120);
      show(h2.el, tC, cue("we're talking") + .5, 'slam', 'blur', .5, .3);

      // deliverables grid
      const tGridOut = cue('the crazy');
      const g = [
        ['Brand name', 'NOMAD', 'names'],
        ['Logo', '▲ NOMAD', 'logos'],
        ['Products', 'Concepts', 'concepts'],
        ['Packaging', 'Mockups', 'packaging'],
        ['Marketing', 'Visuals', 'visuals'],
      ];
      g.forEach(([k, v, c], i) => {
        const x = i === 4 ? 310 : (i % 2 ? 560 : 100);
        const y = 330 + Math.floor(i / 2) * 250;
        checkTile(k, v, x, y, 420, cue(c), tGridOut);
      });
      const tLabel = put(`<div class="label center-x" style="font-size:34px">${I.spark.replace('<svg', '<svg width="34" height="34"')} From one prompt</div>`, { top: '1110px' });
      show(tLabel, cue('visuals') + .3, tGridOut, 'up', 'fade', .4, .25);

      // 1 PROMPT
      const tD = cue('the crazy');
      flash(tD, .4);
      const crazy = put('<div class="label center-x" style="font-size:40px">The crazy part?</div>', { top: '420px' });
      show(crazy, tD, cue("we're getting"), 'up', 'fade', .4);
      const one = put('<div class="headline center-x" style="font-size:360px;letter-spacing:-12px"><span class="grad">1</span></div>', { top: '480px' });
      show(one, cue('single'), cue("we're getting"), 'slam', 'blur', .55, .3);
      const prm = put(`<div class="pill brand center-x" style="font-size:56px">PROMPT ${I.arrow} FULL BRAND</div>`, { top: '880px' });
      show(prm, cue('prompt') , cue("we're getting"), 'up', 'fade', .45);

      // ENDING
      const tE = cue("we're getting");
      sweep(tE - .1);
      const lim = put('<div class="label center-x" style="font-size:38px">Your biggest limitation isn\'t</div>', { top: '400px' });
      show(lim, tE + .2, end + .2, 'up', 'fade', .45);
      const bud = put(`<div class="headline center-x" style="font-size:140px">${strike('BUDGET')}</div>`, { top: '480px' });
      show(bud, cue('budget'), end + .2, 'pop', 'fade', .45);
      strikeIn(bud, cue('budget', { end: true }));
      const its = put('<div class="label center-x" style="font-size:38px;color:#fff">It\'s your</div>', { top: '700px' });
      show(its, cue("it's your"), end + .2, 'up', 'fade', .4);
      const im = put('<div class="headline center-x" style="font-size:132px"><span class="grad">IMAGINATION</span></div>', { top: '770px' });
      show(im, cue('imagination'), end + .2, 'slam', 'fade', .55);
      flash(cue('imagination'), .55);
    },
  },

  /* ---------------- AIDEN AI · 02 ---------------- */
  '02': {
    channel: 'aiden',
    title: 'AI Is Changing How We Make Videos',
    script: [
      'Making a professional AI *video* used to mean jumping between a bunch of different *tools.* Not *anymore.*',
      'Now imagine having *one* workflow where you can *generate* visuals, experiment with different *styles,* and build an entire *commercial* without constantly switching *tabs.* You can test different *concepts,* change *scenes,* and keep *refining* your results until everything looks *right.* And the best part? You don\'t need a traditional *production* setup to get started.',
      'Honestly, the hardest part might just be deciding what to create *next.*',
    ],
    build(cue, W) {
      const end = W.total;
      // HOOK: tab chaos → collapse
      const tabs = [
        ['Image Gen', '#ff6b6b', 100, 360, -4],
        ['Video Gen', '#ffd166', 520, 430, 3],
        ['Upscaler', '#06d6a0', 120, 560, 2],
        ['Voiceover', '#4cc9f0', 510, 650, -3],
        ['Music', '#c77dff', 90, 780, -2],
        ['Editor', '#f72585', 520, 870, 4],
        ['Lip Sync', '#90be6d', 140, 1000, 3],
      ];
      const tCollapse = cue('not anymore');
      const tabEls = tabs.map(([name, c, x, y, r], i) => {
        const el = put(`<div class="tab"><span class="fav" style="background:${c}"></span>${name}<span class="x">✕</span></div>`, { left: x + 'px', top: y + 'px', rotate: r + 'deg' });
        show(el, .1 + i * (Math.max(.6, cue('tools') - .3) / tabs.length), null, 'pop', 'fade', .35);
        shake(el, cue('jumping') + i * .03, .35); // must be created before the collapse so it can't override it
        const dx = 330 - x, dy = 700 - y;
        A(el, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.15)`, opacity: 0 }], tCollapse, .45, EASE.in);
        return el;
      });
      const counterPill = put('<div class="pill center-x" style="background:var(--bad);font-size:46px"><span>0</span> TABS OPEN</div>', { top: '1120px' });
      show(counterPill, .3, tCollapse + .1, 'up', 'fade', .4, .2);
      counter(counterPill.querySelector('span'), 0, 7, .3, Math.max(.6, cue('tools') - .3));
      flash(tCollapse + .4, .7);

      // ONE WORKFLOW
      const tW = cue('one workflow');
      const tWOut = cue('you can test');
      const h = headline(['<span class="sm">Now imagine</span>', `ONE ${hl('WORKFLOW')}`], 340, 118);
      show(h.lines[0], tCollapse + .5, tWOut, 'up', 'fade', .4);
      show(h.lines[1], tW, tWOut, 'slam', 'fade', .5);
      [['generate', 'Generate visuals', I.image], ['styles', 'Experiment with styles', I.layers], ['commercial', 'Build the commercial', I.play]].forEach(([c, label, icon], i) => {
        const el = put(`<div class="pill" style="width:760px;font-size:44px"><span class="icon-circle brand">${icon}</span>${label}<span class="icon-circle ok" style="margin-left:auto;width:54px;height:54px">${I.check}</span></div>`, { left: '160px', top: 610 + i * 130 + 'px' });
        show(el, cue(c) - .1, tWOut, 'right', 'fade', .45);
        A(el.querySelector('.ok'), FX.pop, cue(c) + .35, .35);
      });
      const zero = put('<div class="pill brand center-x" style="font-size:44px">0 TAB SWITCHING</div>', { top: '1030px' });
      show(zero, cue('switching'), tWOut, 'pop', 'fade', .4);

      // CONCEPTS → refine
      const tCon = cue('you can test');
      const tConOut = cue('and the best');
      flash(tCon - .05, .45);
      const grads = [
        ['linear-gradient(160deg,#ff9a3c,#ff3c7d)', 'A'],
        ['linear-gradient(160deg,#3c8bff,#2235a8)', 'B'],
        ['linear-gradient(160deg,#21d4a2,#0f6e8c)', 'C'],
      ];
      const frames = grads.map(([g, l], i) => {
        const el = put(`<div class="frame" style="background:${g}"><div class="lbl">CONCEPT ${l}</div></div>`, { left: 100 + i * 290 + 'px', top: '400px', width: '240px' });
        show(el, cue('concepts') + i * .12, tConOut, 'up', 'fade', .45);
        A(el, [{ filter: 'hue-rotate(0deg)' }, { filter: 'hue-rotate(70deg)' }], cue('scenes') - .1, .5, EASE.io);
        return el;
      });
      const ver = put('<div class="pill center-x" style="font-size:46px">VERSION&nbsp;<span style="color:var(--brand-2)">v1</span></div>', { top: '860px' });
      show(ver, cue('refining'), tConOut, 'pop', 'fade', .4);
      counter(ver.querySelector('span'), 1, 4, cue('refining'), Math.max(.3, cue('right') - cue('refining')), (v) => 'v' + Math.round(v));
      brackets(370, 380, 280, 440, cue('right'), tConOut);
      frames.forEach((f, i) => { if (i !== 1) A(f, [{ filter: 'hue-rotate(70deg) brightness(1)' }, { filter: 'hue-rotate(70deg) brightness(.35)' }], cue('right'), .3); });
      const fin = put(`<div class="pill brand center-x" style="font-size:44px">${I.check} FINAL CUT</div>`, { top: '990px' });
      show(fin, cue('right'), tConOut, 'pop', 'fade', .4);

      // BEST PART — no production setup
      const tB = cue('and the best');
      const tBOut = cue('honestly');
      sweep(tB - .1);
      const bp = headline(['<span class="sm">The best part?</span>'], 380);
      show(bp.el, tB, tBOut, 'up', 'fade', .4);
      ['CAMERA CREW', 'LIGHTING RIG', 'STUDIO'].forEach((s, i) => xPill(s, 0, 560 + i * 130, cue('production') - .2 + i * .18, tBOut, true));
      const need = put('<div class="label center-x" style="font-size:36px;color:#fff">You don\'t need any of it</div>', { top: '960px' });
      show(need, cue('to get started'), tBOut, 'up', 'fade', .4);

      // ENDING
      const tE = cue('honestly');
      const h3 = headline(['<span class="sm">The hardest part?</span>', 'WHAT WILL', `YOU ${hl('CREATE')}`, '<span class="grad">NEXT?</span>'], 360, 124);
      show(h3.lines[0], tE, end + .2, 'up', 'fade', .4);
      show(h3.lines[1], cue('deciding'), end + .2, 'up', 'fade', .4);
      show(h3.lines[2], cue('create'), end + .2, 'slam', 'fade', .45);
      show(h3.lines[3], cue('next'), end + .2, 'slam', 'fade', .45);
      flash(cue('next'), .5);
    },
  },

  /* ---------------- EREN AI · 03 ---------------- */
  '03': {
    channel: 'eren',
    title: 'You Can Build an App Without Writing Code',
    script: [
      'You don\'t need to know how to *code* to build an actual *app* anymore.',
      'Imagine *describing* an app you want, and AI starts *building* the interface for you. Need a *dashboard?* Just describe it. Want to add a *login* page, *buttons,* or a completely different *layout?* Tell the AI what to *change.* Instead of spending *hours* writing code from scratch, you can focus on the *idea* and keep improving the result.',
      'So if you\'ve been putting off that app idea because you can\'t code, maybe it\'s time to give it a *shot.*',
    ],
    build(cue, W) {
      const end = W.total;
      // HOOK
      sweep(0);
      const h = headline([`NO ${strike('CODE')}`, hl('REAL APP')], 400, 150);
      show(h.lines[0], .05, W.hookEnd, 'slam', 'fade', .45);
      strikeIn(h.lines[0], cue('code', { end: true }));
      show(h.lines[1], cue('app'), W.hookEnd, 'slam', 'fade', .45);
      const codeIcon = put(`<div class="icon-circle no center-x" style="width:150px;height:150px">${I.code.replace('<svg', '<svg style="width:90px;height:90px"')}</div>`, { top: '800px' });
      show(codeIcon, cue('code'), W.hookEnd, 'pop', 'fade', .4);
      shake(codeIcon, cue('code') + .4);
      flash(cue('app'), .5);

      // PROMPT
      const tP = cue('imagine');
      const tBuild = cue('building');
      promptCard('Describe your app', 'Build a fitness tracker dashboard with weekly stats.', 440, tP, cue('and ai starts'), tBuild + .2);

      // APP ASSEMBLES
      const tAppOut = cue('instead of');
      const app = put(`<div class="card app">
        <div class="top"><b style="left:26px;background:#ff5f57"></b><b style="left:58px;background:#febc2e"></b><b style="left:90px;background:#28c840"></b></div>
        <div class="side"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="main">
          <div class="stat" style="left:0"><s></s><u>8.4k</u></div>
          <div class="stat" style="left:212px"><s></s><u>1.9k</u></div>
          <div class="stat" style="left:424px"><s></s><u>7.4h</u></div>
          <div class="chart">${[40, 65, 50, 85, 70, 95, 60].map((v) => `<span style="height:${v}%"></span>`).join('')}</div>
          <div class="rows"><i></i><i></i></div>
        </div></div>`, { top: '300px', height: '780px' });
      show(app, tBuild, tAppOut, 'blur', 'fade', .6, .3);
      stagger([...app.querySelectorAll('.side i')], tBuild + .3, .07, 'right', .4);
      stagger([...app.querySelectorAll('.stat')], tBuild + .45, .1, 'pop', .45);
      [...app.querySelectorAll('.chart span')].forEach((b, i) => A(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], tBuild + .6 + i * .06, .5, EASE.back));
      stagger([...app.querySelectorAll('.rows i')], tBuild + .9, .1, 'wipe', .45);

      // dashboard ✓
      const tDash = cue('dashboard');
      brackets(310, 470, 650, 380, tDash, cue('just describe', { end: true }) + .2);
      const dPill = put(`<div class="pill brand center-x" style="font-size:44px">${I.check} DASHBOARD</div>`, { top: '1110px' });
      show(dPill, tDash, cue('want to add'), 'pop', 'fade', .4);

      // login page + buttons
      const tLogin = cue('login');
      const login = put(`<div class="card login"><h4>Welcome back</h4><div class="f">Email</div><div class="f">Password</div><div class="go">Log in</div></div>`, { left: '260px', top: '400px' });
      show(login, tLogin - .05, cue('layout'), 'left', 'right', .5, .35);
      const tBtn = cue('buttons');
      const btns = put(`<div class="center-x" style="display:flex;gap:20px;top:1110px">
          <div class="btn">Start</div><div class="btn" style="background:#fff;color:#111">Track</div><div class="btn" style="background:var(--brand-2);color:#041">Share</div></div>`, { top: '1110px' });
      stagger([...btns.children], tBtn, .1, 'pop', .4);
      A(btns, [{ opacity: 1 }, { opacity: 0 }], cue('layout') - .1, .25);
      punch(login.querySelector('.go'), tBtn + .1, 1.1);

      // layout switch
      const tLay = cue('layout');
      const side = app.querySelector('.side');
      const main = app.querySelector('.main');
      A(side, [{ transform: 'translateX(0)' }, { transform: 'translateX(-200px)' }], tLay + .15, .5, EASE.io);
      A(main, [{ left: '220px' }, { left: '30px' }], tLay + .15, .5, EASE.io);
      const chart = app.querySelector('.chart');
      A(chart, [{ top: '180px' }, { top: '0px' }], tLay + .3, .5, EASE.io);
      app.querySelectorAll('.stat').forEach((s, i) => A(s, [{ transform: 'none', top: '0px' }, { transform: `translateX(${i * 34}px)`, top: '345px' }], tLay + .3 + i * .05, .5, EASE.io));
      A(app.querySelector('.rows'), [{ top: '530px' }, { top: '530px', opacity: 1 }, { top: '530px', opacity: 0 }], tLay + .3, .3);
      const upd = put(`<div class="pill brand center-x" style="font-size:44px">${I.spark} LAYOUT UPDATED</div>`, { top: '1110px' });
      show(upd, cue('change') - .1, tAppOut, 'pop', 'fade', .4);
      sweep(tLay + .1);

      // hours → idea
      const tH = cue('instead of');
      const tHOut = cue('so if');
      flash(tH - .05, .4);
      const hrs = put(`<div class="headline center-x" style="font-size:118px">${strike('HOURS<span class="sm" style="display:block;font-size:.6em">OF CODE</span>')}</div>`, { top: '380px' });
      show(hrs, cue('hours'), tHOut, 'pop', 'fade', .45);
      strikeIn(hrs, cue('from scratch'));
      const clk = put(`<div class="icon-circle no" style="width:110px;height:110px">${I.clock.replace('<svg', '<svg style="width:70px;height:70px"')}</div>`, { left: '820px', top: '330px' });
      show(clk, cue('hours') + .1, tHOut, 'pop', 'fade', .35);
      const focus = headline(['<span class="sm">Focus on the</span>', hl('IDEA')], 700, 140);
      show(focus.lines[0], cue('focus'), tHOut, 'up', 'fade', .4);
      show(focus.lines[1], cue('idea'), tHOut, 'slam', 'fade', .45);
      const imp = put(`<div class="pill center-x" style="font-size:40px">${I.arrow} keep improving</div>`, { top: '1060px' });
      show(imp, cue('keep improving'), tHOut, 'up', 'fade', .4);

      // ENDING
      const tE = cue('so if');
      sweep(tE - .1);
      const bulb = put(`<div class="icon-circle brand center-x" style="width:170px;height:170px">${I.bulb.replace('<svg', '<svg style="width:100px;height:100px"')}</div>`, { top: '340px' });
      show(bulb, tE, end + .2, 'pop', 'fade', .45);
      float(bulb, tE + .5, end);
      const h2 = headline(['THAT APP IDEA?', `<span class="sm">It's time to</span>`, hl('BUILD IT')], 560, 112);
      show(h2.lines[0], cue('that app'), end + .2, 'up', 'fade', .45);
      show(h2.lines[1], cue('maybe'), end + .2, 'up', 'fade', .4);
      show(h2.lines[2], cue('give it'), end + .2, 'slam', 'fade', .45);
      flash(cue('shot'), .5);
    },
  },

  /* ---------------- EREN AI · 04 ---------------- */
  '04': {
    channel: 'eren',
    title: 'Stop Using AI Tools the Wrong Way',
    script: [
      'You\'re probably using AI the *wrong* way. And it\'s costing you a lot of *time.*',
      'Most people open *ChatGPT,* ask a question, get an answer, and close the *tab.* But here\'s the thing. AI can do *much* *more* than answer questions. You can use one tool to *research* an idea, another to turn it into a *presentation,* and another to create *visuals* for it. The real productivity boost comes when you connect these tools into an actual *workflow.*',
      'Stop thinking about AI as just a *chatbot.* Start thinking about it as your entire *creative* *team.*',
    ],
    build(cue, W) {
      const end = W.total;
      // HOOK
      const warn = put(`<div class="pill center-x" style="background:var(--bad);font-size:44px;letter-spacing:3px">${I.warn} WARNING</div>`, { top: '360px' });
      show(warn, .05, W.hookEnd, 'pop', 'fade', .4);
      shake(warn, .45);
      const h = headline(['<span class="sm">You\'re using AI</span>', `<span class="hl" style="background:var(--bad);box-shadow:0 14px 40px rgba(255,77,94,.5)"><span>WRONG</span></span>`], 500, 160);
      show(h.lines[0], cue('using'), W.hookEnd, 'up', 'fade', .4);
      show(h.lines[1], cue('wrong'), W.hookEnd, 'slam', 'fade', .45);
      shake(h.lines[1], cue('wrong') + .45);
      flash(cue('wrong'), .5);
      const time = put(`<div class="pill center-x" style="font-size:46px"><span class="icon-circle no">${I.clock}</span>COSTING YOU TIME</div>`, { top: '860px' });
      show(time, cue('costing'), W.hookEnd, 'up', 'fade', .4);

      // MOST PEOPLE: ask → answer → close
      const tM = cue('most people');
      const tMOut = cue("but here's");
      flash(tM - .05, .4);
      const mp = put('<div class="label center-x" style="font-size:40px"><span class="dot"></span>What most people do</div>', { top: '350px' });
      show(mp, tM, tMOut, 'up', 'fade', .4);
      const q = put('<div class="bubble me">Give me a name for my brand</div>', { right: '140px', top: '450px' });
      show(q, cue('ask a'), tMOut, 'left', 'fade', .4);
      const a = put('<div class="bubble ai">Sure! Here are 5 ideas…</div>', { left: '100px', top: '620px' });
      show(a, cue('get an'), tMOut, 'right', 'fade', .4);
      const closed = put(`<div class="pill center-x" style="background:var(--bad);font-size:46px">${I.x} TAB CLOSED</div>`, { top: '820px' });
      show(closed, cue('close the'), tMOut, 'slam', 'fade', .4);
      // dim with filter only (an opacity dim would override the fade-out)
      [q, a].forEach((b) => A(b, [{ filter: 'grayscale(0) brightness(1)' }, { filter: 'grayscale(1) brightness(.45)' }], cue('close the'), .3));
      const end1 = put('<div class="label center-x" style="font-size:36px;color:#fff">…and that\'s it.</div>', { top: '960px' });
      show(end1, cue('tab', { end: true }), tMOut, 'up', 'fade', .4);

      // HERE'S THE THING
      const tT = cue("but here's");
      const tTOut = cue('you can use');
      sweep(tT - .1);
      const h2 = headline(['<span class="sm">AI can do</span>', hl('MUCH MORE'), '<span class="sm">than answer questions</span>'], 460, 130);
      show(h2.lines[0], cue('ai can'), tTOut, 'up', 'fade', .4);
      show(h2.lines[1], cue('much'), tTOut, 'slam', 'fade', .45);
      show(h2.lines[2], cue('than answer'), tTOut, 'up', 'fade', .4);

      // WORKFLOW NODES
      const tWOut = cue('stop thinking');
      const nodes = [
        ['Research', I.search, 100, 340, 'research'],
        ['Slides', I.slides, 640, 340, 'presentation'],
        ['Visuals', I.image, 370, 760, 'visuals'],
      ];
      const svg = put(`<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="left:0;top:0;overflow:visible">
          <path id="l1" d="M400 490 L640 490" stroke="var(--brand-2)" stroke-width="10" stroke-linecap="round" fill="none" stroke-dasharray="260" stroke-dashoffset="260"/>
          <path id="l2" d="M790 640 C790 760, 720 820, 670 860" stroke="var(--brand-2)" stroke-width="10" stroke-linecap="round" fill="none" stroke-dasharray="300" stroke-dashoffset="300"/>
          <path id="l3" d="M370 910 C 250 860, 240 740, 250 640" stroke="var(--brand-2)" stroke-width="10" stroke-linecap="round" fill="none" stroke-dasharray="320" stroke-dashoffset="320"/>
        </svg>`);
      A(svg, [{ opacity: 1 }, { opacity: 0 }], tWOut - .3, .3);
      const nEls = nodes.map(([n, icon, x, y, c], i) => {
        const el = put(`<div class="card node">${icon}<b>${n}</b><div class="label" style="font-size:22px;letter-spacing:3px">Tool ${i + 1}</div></div>`, { left: x + 'px', top: y + 'px' });
        show(el, cue(c), tWOut, 'pop', 'fade', .45);
        return el;
      });
      A(svg.querySelector('#l1'), [{ strokeDashoffset: 260 }, { strokeDashoffset: 0 }], cue('presentation') + .1, .45, EASE.io);
      A(svg.querySelector('#l2'), [{ strokeDashoffset: 300 }, { strokeDashoffset: 0 }], cue('visuals') + .1, .45, EASE.io);
      A(svg.querySelector('#l3'), [{ strokeDashoffset: 320 }, { strokeDashoffset: 0 }], cue('connect') , .5, EASE.io);
      const tWF = cue('workflow');
      nEls.forEach((n, i) => punch(n, tWF + i * .08, 1.08));
      const wf = put(`<div class="pill brand center-x" style="font-size:52px">${I.spark} = WORKFLOW</div>`, { top: '1110px' });
      show(wf, tWF, tWOut, 'slam', 'fade', .45);
      flash(tWF, .4);

      // ENDING
      const tE = cue('stop thinking');
      sweep(tE - .1);
      const chat = put(`<div class="headline center-x" style="font-size:130px;display:flex;align-items:center;gap:30px"><span class="icon-circle no" style="width:120px;height:120px">${I.chat.replace('<svg', '<svg style="width:70px;height:70px"')}</span>${strike('CHATBOT')}</div>`, { top: '400px' });
      show(chat, cue('chatbot') - .1, end + .2, 'pop', 'fade', .45);
      strikeIn(chat, cue('chatbot', { end: true }));
      const yr = put('<div class="label center-x" style="font-size:40px;color:#fff">Your entire</div>', { top: '650px' });
      show(yr, cue('start thinking'), end + .2, 'up', 'fade', .4);
      const team = headline(['<span class="grad">CREATIVE</span>', hl('TEAM')], 720, 140);
      show(team.lines[0], cue('creative'), end + .2, 'slam', 'fade', .45);
      show(team.lines[1], cue('team'), end + .2, 'slam', 'fade', .45);
      flash(cue('team'), .5);
      const users = put(`<div class="icon-circle brand center-x" style="width:130px;height:130px">${I.users.replace('<svg', '<svg style="width:80px;height:80px"')}</div>`, { top: '1010px' });
      show(users, cue('team'), end + .2, 'pop', 'fade', .4);
    },
  },
};
