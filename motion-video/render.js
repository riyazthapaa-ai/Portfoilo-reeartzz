// Frame-accurate renderer: drives a canvas page in headless Chromium and pipes JPEG frames to ffmpeg.
// usage: node render.js <page.html> <out.mp4> <fps> <startSec> <endSec> [workers]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const [page, out, fpsS, s0, s1, wS] = process.argv.slice(2);
const fps = +fpsS, start = +s0, end = +s1, workers = +(wS || 4);
const total = Math.round((end - start) * fps);

async function renderChunk(idx, f0, f1, file) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const pg = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('console', m => console.log(`[w${idx}]`, m.text()));
  pg.on('pageerror', e => console.log(`[w${idx}] ERR`, e.message));
  await pg.goto('file://' + path.resolve(page));
  await pg.evaluate(() => window.ready);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const b64 = await pg.evaluate(t => window.frameJPEG(t), start + f / fps);
    const buf = Buffer.from(b64, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 300 === 0) console.log(`[w${idx}] ${f - f0}/${f1 - f0} ${((Date.now() - t0) / Math.max(1, f - f0)).toFixed(0)}ms/f`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
}

(async () => {
  const per = Math.ceil(total / workers), files = [];
  const jobs = [];
  for (let i = 0; i < workers; i++) {
    const f0 = i * per, f1 = Math.min(total, f0 + per);
    if (f0 >= f1) break;
    const file = `${out}.part${i}.mp4`; files.push(file);
    jobs.push(renderChunk(i, f0, f1, file));
  }
  await Promise.all(jobs);
  const list = `${out}.txt`;
  fs.writeFileSync(list, files.map(f => `file '${path.resolve(f)}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
  files.forEach(f => fs.unlinkSync(f)); fs.unlinkSync(list);
  console.log('done', out);
})();
