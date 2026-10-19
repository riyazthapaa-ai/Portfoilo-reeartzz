// Renders index.html frame-by-frame to MP4 (or stills) with headless Chromium.
// Usage:
//   node render.mjs                       -> out/ai-tools.mp4 (captions on)
//   node render.mjs --no-captions         -> out/ai-tools-clean.mp4
//   node render.mjs --stills 3,12.5,40    -> out/still-<t>.png
//   options: --fps 30 --workers 4 --from 0 --to 118
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.execPath, '../../lib/node_modules/playwright'))); }

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const fps = +opt('fps', 30), workers = +opt('workers', 4);
const captions = !args.includes('--no-captions');
const out = path.join(dir, 'out'); mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(dir, 'index.html')).href + `?render=1&captions=${captions ? 1 : 0}`;

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return page;
}

const browser = await chromium.launch();
const stills = opt('stills', null);
if (stills) {
  const page = await openPage(browser);
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: path.join(out, `still-${t}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const dur = await (await openPage(browser)).evaluate(() => window.DUR);
const from = +opt('from', 0), to = +opt('to', dur);
const total = Math.round((to - from) * fps);
const per = Math.ceil(total / workers);
const name = captions ? 'ai-tools' : 'ai-tools-clean';
const tmp = path.join(out, `.parts-${name}`); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp);

let done = 0;
async function renderPart(w) {
  const a = w * per, b = Math.min(total, a + per);
  if (a >= b) return null;
  const file = path.join(tmp, `p${w}.mp4`);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(fps), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const page = await openPage(browser);
  for (let f = a; f < b; f++) {
    await page.evaluate(t => window.seek(t), from + f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (++done % 150 === 0) console.log(`${done}/${total} frames`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', c => c ? j(new Error('ffmpeg ' + c)) : r()));
  return file;
}
const parts = (await Promise.all([...Array(workers).keys()].map(renderPart))).filter(Boolean);
await browser.close();

writeFileSync(path.join(tmp, 'list.txt'), parts.map(p => `file '${p}'`).join('\n'));
const final = path.join(out, `${name}.mp4`);
await new Promise((r, j) => spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'),
  '-ss', String(from), '-i', path.join(dir, 'voiceover.mp3'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart', final], { stdio: 'inherit' }).on('close', c => c ? j(new Error('mux ' + c)) : r()));
rmSync(tmp, { recursive: true, force: true });
console.log('wrote', final);
