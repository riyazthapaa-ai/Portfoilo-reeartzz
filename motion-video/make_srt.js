// Builds YouTube-ready captions from the word-level VO timing: node make_srt.js > out/captions.srt
global.window = {}; eval(require('fs').readFileSync(__dirname + '/data/timing.js', 'utf8'));
const f = s => { const ms = Math.round(s * 1000), p = (v, n = 2) => String(v).padStart(n, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
const join = c => c.map(x => x[0]).join(' ');
const cues = [];
for (const s of window.TIMING) {
  const chunks = []; let cur = [];
  for (const tk of s.tok) {
    if (cur.length && join([...cur, tk]).length > 44) { chunks.push(cur); cur = []; }
    cur.push(tk);
    if (join(cur).length > 24 && /[,.?:]$/.test(tk[0])) { chunks.push(cur); cur = []; }
  }
  if (cur.length) { if (chunks.length && join(cur).length < 12) chunks[chunks.length - 1].push(...cur); else chunks.push(cur); }
  chunks.forEach(c => cues.push([c[0][1], c[c.length - 1][2], join(c)]));
}
console.log(cues.map(([a, b, s], i) => `${i + 1}\n${f(a)} --> ${f(Math.min(b + 0.2, cues[i + 1] ? cues[i + 1][0] - 0.02 : b + 0.2))}\n${s}\n`).join('\n'));
