// Render motion graphics to video.
//   node render.mjs                 -> all shorts, all outputs
//   node render.mjs 01 03           -> only those shorts
//   node render.mjs --stills 02     -> contact sheet PNGs only (fast check)
//   FPS=60 node render.mjs          -> change frame rate (default 30)
//
// Outputs (out/):
//   shortXX_graphics.mov   ProRes 4444 with alpha — drop above your footage
//   shortXX_captions.mov   ProRes 4444 with alpha — kinetic captions only
//   shortXX_preview.mp4    Everything over placeholder footage, for review
//   shortXX_words.json     The word timings used (edit + save to timings/ to re-sync)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// Works with a local `npm i playwright` or a global install on NODE_PATH.
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });
const FPS = +(process.env.FPS || 30);
const args = process.argv.slice(2);
const stillsOnly = args.includes('--stills');
const only = args.filter((a) => /^\d\d$/.test(a));
const ids = only.length ? only : ['01', '02', '03', '04'];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.ttf': 'font/ttf', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch();

async function open(id, layer, bg) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(`${BASE}?short=${id}&layer=${layer}${bg ? '&bg=1' : ''}`);
  await page.waitForFunction(() => window.READY === true);
  return page;
}

function ffmpeg(argsList) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...argsList], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, bad) => p.on('close', (c) => (c === 0 ? ok() : bad(new Error('ffmpeg ' + c)))));
  return { stdin: p.stdin, done };
}

async function renderLayer(id, layer, outFile, { alpha }) {
  const page = await open(id, layer, !alpha);
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.ceil(duration * FPS);
  const enc = alpha
    ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', '-qscale:v', '11']
    : ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart'];
  const ff = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...enc, '-r', String(FPS), outFile]);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'png', omitBackground: alpha });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % (FPS * 5) === 0) process.stdout.write(`  ${path.basename(outFile)} ${Math.round((f / frames) * 100)}%\n`);
  }
  ff.stdin.end();
  await ff.done;
  await page.close();
  return duration;
}

async function stills(id) {
  const page = await open(id, 'all', true);
  const duration = await page.evaluate(() => window.DURATION);
  const n = 24;
  const dir = path.join(OUT, `stills_${id}`);
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < n; i++) {
    const t = (i + .5) * duration / n;
    await page.evaluate((t) => window.seek(t), t);
    await page.screenshot({ path: path.join(dir, `${String(i).padStart(2, '0')}.png`) });
  }
  await page.close();
  await ffmpeg(['-i', path.join(dir, '%02d.png'), '-vf', 'scale=270:480,tile=8x3:padding=6', path.join(OUT, `short${id}_contact.png`)]).done;
  fs.rmSync(dir, { recursive: true });
}

for (const id of ids) {
  console.log(`Short ${id}`);
  if (stillsOnly) { await stills(id); continue; }
  const page = await open(id, 'all', false);
  fs.writeFileSync(path.join(OUT, `short${id}_words.json`), JSON.stringify(await page.evaluate(() => window.WORDS), null, 1));
  await page.close();
  await Promise.all([
    renderLayer(id, 'graphics', path.join(OUT, `short${id}_graphics.mov`), { alpha: true }),
    renderLayer(id, 'captions', path.join(OUT, `short${id}_captions.mov`), { alpha: true }),
    renderLayer(id, 'all', path.join(OUT, `short${id}_preview.mp4`), { alpha: false }),
  ]);
}
await browser.close();
server.close();
