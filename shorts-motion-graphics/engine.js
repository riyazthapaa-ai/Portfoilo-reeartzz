/* ============================================================
   Tiny deterministic motion engine.
   Everything is a paused Web Animation, so window.seek(t) lands
   on the exact same frame every time (needed for rendering).
   ============================================================ */
(() => {
  const anims = [];
  const ticks = [];
  const stage = document.getElementById('stage');
  const EASE = {
    out: 'cubic-bezier(.16,1,.3,1)',
    back: 'cubic-bezier(.34,1.56,.64,1)',
    in: 'cubic-bezier(.7,0,.84,0)',
    io: 'cubic-bezier(.65,0,.35,1)',
    lin: 'linear',
  };

  // ---------- core ----------
  function A(el, keyframes, start, dur, easing = EASE.out) {
    el._n = (el._n || 0) + 1;
    // First animation on an element fills backwards (sets the "before" state);
    // later ones only take over once they begin, so they never clobber earlier ones.
    const fill = el._n === 1 ? 'both' : 'forwards';
    const a = el.animate(keyframes, { duration: Math.max(1, dur * 1000), delay: start * 1000, fill, easing });
    a.pause();
    anims.push(a);
    return a;
  }
  function tick(fn) { ticks.push(fn); }
  function seek(t) {
    for (const a of anims) a.currentTime = t * 1000;
    for (const f of ticks) f(t);
  }

  function h(html) {
    const d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }
  function put(html, css = {}, parent = stage) {
    const el = typeof html === 'string' ? h(html) : html;
    Object.assign(el.style, css);
    parent.appendChild(el);
    return el;
  }

  // ---------- presets ----------
  const FX = {
    fade: [{ opacity: 0 }, { opacity: 1 }],
    pop: [
      { opacity: 0, transform: 'scale(.55)' },
      { opacity: 1, transform: 'scale(1.07)', offset: .65 },
      { opacity: 1, transform: 'scale(1)' },
    ],
    slam: [
      { opacity: 0, transform: 'scale(2.2)', filter: 'blur(14px)' },
      { opacity: 1, transform: 'scale(.96)', filter: 'blur(0px)', offset: .7 },
      { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
    ],
    up: [{ opacity: 0, transform: 'translateY(90px)' }, { opacity: 1, transform: 'translateY(0)' }],
    down: [{ opacity: 0, transform: 'translateY(-90px)' }, { opacity: 1, transform: 'translateY(0)' }],
    left: [{ opacity: 0, transform: 'translateX(160px)' }, { opacity: 1, transform: 'translateX(0)' }],
    right: [{ opacity: 0, transform: 'translateX(-160px)' }, { opacity: 1, transform: 'translateX(0)' }],
    blur: [
      { opacity: 0, transform: 'scale(1.15)', filter: 'blur(24px)' },
      { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
    ],
    wipe: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
    wipeUp: [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }],
    flip: [
      { opacity: 0, transform: 'perspective(1200px) rotateX(-80deg)' },
      { opacity: 1, transform: 'perspective(1200px) rotateX(0deg)' },
    ],
  };
  const rev = (k) => k.slice().reverse().map((f) => (f.offset != null ? { ...f, offset: 1 - f.offset } : f));

  /** Animate el in at t0 and (optionally) out at t1. */
  function show(el, t0, t1 = null, fin = 'pop', fout = 'fade', dIn = .5, dOut = .3) {
    const kin = FX[fin] || fin;
    A(el, kin, t0, dIn, fin === 'pop' ? EASE.out : EASE.out);
    if (t1 != null) {
      const kout = typeof fout === 'string' ? rev(FX[fout]) : fout;
      A(el, kout, t1 - dOut, dOut, EASE.in);
    }
    return el;
  }
  /** Stagger children in. */
  function stagger(els, t0, gap = .08, fin = 'up', dIn = .5) {
    els.forEach((e, i) => A(e, FX[fin] || fin, t0 + i * gap, dIn));
  }
  /** Small attention punch on an element that is already visible. */
  function punch(el, t, amt = 1.12) {
    A(el, [{ transform: 'scale(1)' }, { transform: `scale(${amt})`, offset: .35 }, { transform: 'scale(1)' }], t, .45, EASE.io);
  }
  function shake(el, t, d = .4) {
    A(el, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ transform: `translate(${i % 2 ? -14 : 14}px, ${i % 3 ? 6 : -6}px) rotate(${i % 2 ? -1.5 : 1.5}deg)` })).concat([{ transform: 'none' }]), t, d, EASE.lin);
  }
  /** Gentle continuous drift so nothing feels frozen. */
  function float(el, t0, t1, px = 10) {
    A(el, [{ translate: `0 ${px}px` }, { translate: `0 -${px}px` }], t0, Math.max(.1, t1 - t0), EASE.io);
  }
  function typewriter(el, text, t0, cps = 26, caret = true) {
    const span = el;
    tick((t) => {
      const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps)));
      const blink = Math.floor(t * 2.2) % 2 === 0 || (n > 0 && n < text.length);
      span.innerHTML = escapeHtml(text.slice(0, n)) + (caret && t >= t0 - .4 ? `<span class="caret" style="opacity:${blink ? 1 : 0}"></span>` : '');
    });
  }
  function counter(el, from, to, t0, d, fmt = (v) => Math.round(v)) {
    tick((t) => {
      const p = Math.max(0, Math.min(1, (t - t0) / d));
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
    });
  }
  function strikeIn(el, t, d = .28) {
    const bar = el.querySelector('.strike i') || el.querySelector('i');
    A(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], t, d, EASE.out);
  }

  // ---------- global transitions ----------
  function flash(t, strength = .85, d = .35) {
    const f = put('<div class="flash"></div>');
    A(f, [{ opacity: 0 }, { opacity: strength, offset: .15 }, { opacity: 0 }], t, d, EASE.lin);
  }
  function sweep(t, d = .55) {
    const s = put('<div class="sweep"></div>');
    A(s, [{ left: '-600px', opacity: 0 }, { opacity: .95, offset: .2 }, { opacity: .95, offset: .8 }, { left: '1500px', opacity: 0 }], t, d, EASE.io);
  }
  function brackets(x, y, w, hgt, t0, t1) {
    const b = put('<div class="brackets"><i></i></div>', { left: x + 'px', top: y + 'px', width: w + 'px', height: hgt + 'px' });
    A(b, [{ opacity: 0, transform: 'scale(1.35)' }, { opacity: 1, transform: 'scale(1)' }], t0, .35, EASE.out);
    if (t1 != null) A(b, [{ opacity: 1 }, { opacity: 0 }], t1 - .2, .2, EASE.in);
    return b;
  }

  // ---------- captions ----------
  /**
   * script: sections joined; *word* = emphasis; "/" forces a chunk break.
   * Timing comes from a speaking-rate model unless timings/<id>.json exists
   * (array of {start,end} per word, e.g. from Whisper word timestamps).
   */
  function buildWords(script, wps = 3.05, overrides = null) {
    const words = [];
    let t = .15;
    const sections = script;
    sections.forEach((sec, si) => {
      const toks = sec.split(/\s+/).filter(Boolean);
      toks.forEach((raw) => {
        if (raw === '/') { if (words.length) words[words.length - 1].brk = true; return; }
        const em = /\*/.test(raw);
        const text = raw.replace(/\*/g, '');
        const clean = text.replace(/[^\p{L}\p{N}'’%-]/gu, '').toLowerCase();
        const len = clean.length || 1;
        const dur = (0.11 + 0.042 * len) * (3.05 / wps);
        const w = { text, clean, em, start: t, end: t + dur };
        t += dur;
        if (/[.?!]$/.test(text)) { t += .32; w.brk = true; }
        else if (/[,:;]$/.test(text)) { t += .13; w.soft = true; }
        else if (/[—–]$/.test(text) || text === '—') { t += .18; }
        words.push(w);
      });
      t += .25; // breath between sections
      if (words.length) words[words.length - 1].brk = true;
      if (si === 0) words.hookEnd = t;
    });
    if (overrides && overrides.length === words.length) {
      overrides.forEach((o, i) => { words[i].start = o.start; words[i].end = o.end; });
    } else if (overrides) {
      console.warn(`timings file has ${overrides.length} words, script has ${words.length} — ignoring`);
    }
    words.total = words[words.length - 1].end;
    return words;
  }

  function cueFactory(words) {
    let last = 0;
    return function cue(phrase, opts = {}) {
      const target = phrase.toLowerCase().split(/\s+/).map((s) => s.replace(/[^\p{L}\p{N}'’%-]/gu, ''));
      const from = opts.from != null ? opts.from : 0;
      for (let i = from; i <= words.length - target.length; i++) {
        if (target.every((tw, j) => words[i + j].clean.startsWith(tw))) {
          last = i;
          return opts.end ? words[i + target.length - 1].end : words[i].start;
        }
      }
      console.warn('cue not found:', phrase);
      return words[last].start;
    };
  }

  function chunkWords(words, maxWords = 3, maxChars = 16) {
    const chunks = [];
    let cur = [];
    let chars = 0;
    words.forEach((w) => {
      if (cur.length && (cur.length >= maxWords || chars + w.text.length > maxChars)) { chunks.push(cur); cur = []; chars = 0; }
      cur.push(w);
      chars += w.text.length + 1;
      if (w.brk || w.soft || w.em) { chunks.push(cur); cur = []; chars = 0; }
    });
    if (cur.length) chunks.push(cur);
    return chunks;
  }

  function captions(words) {
    const box = put('<div id="captions"></div>');
    const chunks = chunkWords(words);
    chunks.forEach((c, ci) => {
      const t0 = c[0].start;
      const next = chunks[ci + 1];
      const t1 = next ? Math.min(next[0].start, c[c.length - 1].end + .9) : c[c.length - 1].end + 1.2;
      const el = put('<div class="cap-chunk"></div>', {}, box);
      el.style.visibility = 'hidden';
      tick((t) => { el.style.visibility = t >= t0 && t < t1 ? 'visible' : 'hidden'; });
      c.forEach((w) => {
        const sp = put(`<span class="cap-word${w.em ? ' em' : ''}">${escapeHtml(w.text.replace(/[,;:]$/, ''))}</span>`, {}, el);
        A(sp, w.em ? FX.pop : [
          { opacity: 0, transform: 'translateY(26px) scale(.9)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ], w.start - .04, w.em ? .32 : .18, EASE.out);
      });
    });
    return box;
  }

  function escapeHtml(s) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // ---------- icons ----------
  const I = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5l2.4 7.1 7.1 2.4-7.1 2.4L12 20.5l-2.4-7.1-7.1-2.4 7.1-2.4z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    cursor: '<svg viewBox="0 0 32 32"><path d="M5 3l20 11.5-8.6 2.2L12 25z" fill="#fff" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    slides: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M12 17v4M8 21h8M6.5 13l3-3.5 2.5 2.5 2-2 3.5 3"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 16l-5-5-9 10"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18.2v.1"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.7 0 4.5 1.9 4.5 4.6"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  };

  // ---------- shared brand pieces ----------
  function bug(ch, t0, t1) {
    const el = put(`<div class="bug"><div class="mark">${ch.mark}</div><div class="name">${ch.name}</div></div>`);
    show(el, t0, t1, 'right', 'fade', .6, .3);
    return el;
  }
  function endCard(ch, t0, t1) {
    const wm = put(`<div class="wordmark center-x"><div class="big">${ch.wordmark}</div><div class="tag">${ch.tagline}</div></div>`, { top: '470px' });
    show(wm, t0, t1, 'slam', 'fade', .6, .3);
    const cta = put(`<div class="cta center-x"><div class="av">${ch.mark}</div><div>${ch.handle}</div><div class="sub">FOLLOW</div></div>`, { top: '820px' });
    show(cta, t0 + .45, t1, 'up', 'fade', .55, .3);
    punch(cta.querySelector('.sub'), t0 + 1.3, 1.18);
    const cur = put(`<div class="cursor">${I.cursor}</div>`, { left: '820px', top: '930px' });
    A(cur, [{ opacity: 0, transform: 'translate(160px,160px)' }, { opacity: 1, transform: 'translate(0,0)' }], t0 + .8, .45);
    A(cur, [{ transform: 'scale(1)' }, { transform: 'scale(.8)' }, { transform: 'scale(1)' }], t0 + 1.28, .2, EASE.io);
    if (t1 != null) A(cur, [{ opacity: 1 }, { opacity: 0 }], t1 - .3, .3);
    return { wm, cta };
  }

  window.MG = { A, tick, seek, h, put, FX, rev, show, stagger, punch, shake, float, typewriter, counter, strikeIn, flash, sweep, brackets, buildWords, cueFactory, captions, I, EASE, bug, endCard, stage, escapeHtml };
  window.seek = seek;
})();
