// Renders index.html frame-by-frame to an MP4 (1920x1080).
// Usage: node render.mjs [out.mp4] [fps] [voiceover]   (needs playwright + ffmpeg)
//        node render.mjs --stills t1,t2,...    (writes PNG previews)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// resolve playwright locally or from the global install
const { chromium } = createRequire(import.meta.url)('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.join(dir, 'index.html') + '?render');
await page.evaluate(() => document.fonts.ready);

if (args[0] === '--stills') {
  for (const t of args[1].split(',').map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: path.join(args[2] || dir, `still-${t}.png`) });
  }
} else {
  const out = args[0] || path.join(dir, 'gamma5-hook.mp4');
  const fps = Number(args[1] || 30);
  const duration = await page.evaluate(() => window.DURATION);
  const audio = args[2] ? ['-i', args[2], '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k'] : [];
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', ...audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'ignore', 'inherit'] });
  const frames = Math.round(duration * fps);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.render(t), i / fps);
    ff.stdin.write(await page.screenshot({ type: 'png' }));
    if (i % fps === 0) process.stdout.write(`\r${(i / fps).toFixed(0)}s / ${duration}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log(`\nwrote ${out}`);
}
await browser.close();
