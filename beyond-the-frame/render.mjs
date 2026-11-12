// Render the film page frame by frame with headless Chromium.
//   node render.mjs                     → frames/0000.png … 0899.png  (all frames)
//   node render.mjs --stills 1 4.5 7    → stills/t_<s>.png at those seconds
//   node render.mjs --from 0 --to 95    → re-render a frame range in place
//   options: --workers N  --samples N (motion-blur sub-frames, default 3)
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const WORKERS = parseInt(opt('--workers', '4'));
const SAMPLES = parseInt(opt('--samples', '3'));
const stillsAt = args.includes('--stills') ? args.slice(args.indexOf('--stills') + 1).filter(a => !a.startsWith('--') && !isNaN(+a)).map(Number) : null;

const MIME = { '.html': 'text/html', '.otf': 'font/otf', '.ttf': 'font/ttf', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html?render=1`;

const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--font-render-hinting=none'] });
async function worker(jobs, outDir) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exitCode = 1; });
  await page.goto(url);
  await page.evaluate(() => window.ready);
  const canvas = await page.$('#out');
  for (const [t, name] of jobs) {
    await page.evaluate(([t, s]) => window.renderFrame(t, s), [t, SAMPLES]);
    await canvas.screenshot({ path: path.join(outDir, name), type: 'png' });
  }
  await page.close();
}

const t0 = Date.now();
let jobs, outDir;
if (stillsAt) {
  outDir = path.join(ROOT, 'stills');
  jobs = stillsAt.map(t => [t, `t_${t.toFixed(2).padStart(5, '0')}.png`]);
} else {
  outDir = path.join(ROOT, 'frames');
  const from = parseInt(opt('--from', '0')), to = parseInt(opt('--to', '899'));   // inclusive frame range
  if (from === 0 && to === 899) fs.rmSync(outDir, { recursive: true, force: true });
  jobs = Array.from({ length: to - from + 1 }, (_, k) => from + k).map(i => [i / 30, `${String(i).padStart(4, '0')}.png`]);
}
fs.mkdirSync(outDir, { recursive: true });
const buckets = Array.from({ length: WORKERS }, () => []);
jobs.forEach((j, i) => buckets[i % WORKERS].push(j));
await Promise.all(buckets.filter(b => b.length).map(b => worker(b, outDir)));
await browser.close(); server.close();
console.log(`rendered ${jobs.length} frame(s) → ${path.relative(process.cwd(), outDir) || '.'} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
