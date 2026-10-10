// Renders index.html frame-by-frame into an MP4.
// Usage: node render.mjs [out.mp4] [--html index.html] [--fps 30] [--stills 1,5,10]
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const fps = +opt('--fps', 30);
const stills = opt('--stills', null);
const html = opt('--html', 'index.html');
const name = path.basename(html, '.html');
const out = args.find(a => a.endsWith('.mp4')) || path.join(dir, 'out', 'video-silent.mp4');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.join(dir, html) + '?capture');
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.DURATION);
writeFileSync(path.join(dir, `cues-${name}.json`), JSON.stringify(await page.evaluate(() => window.CUES)));

if (stills) {
  mkdirSync(path.join(dir, 'out', 'stills'), { recursive: true });
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: path.join(dir, 'out', 'stills', `${name}-t${t}.png`) });
  }
  await browser.close();
  process.exit(0);
}

mkdirSync(path.dirname(out), { recursive: true });
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
  { stdio: ['pipe', 'inherit', 'inherit'] });

const frames = Math.round(duration * fps);
for (let f = 0; f < frames; f++) {
  await page.evaluate(t => window.render(t), f / fps);
  const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
console.log('wrote', out);
