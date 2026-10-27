// Renders scene.html frame-by-frame and muxes it with the VO.
// usage: node render.js [out.mp4]          full video
//        node render.js --stills 1,5,10    PNG stills at given seconds
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30;
const DUR = 42.71;
const dir = __dirname;

(async () => {
  const args = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(dir, 'scene.html'));
  await page.evaluate(() => window.ready);

  if (args[0] === '--stills') {
    for (const s of args[1].split(',').map(Number)) {
      await page.evaluate(t => window.render(t), s);
      await page.screenshot({ path: path.join(args[2] || dir, `still_${s}.png`) });
    }
    await browser.close();
    return;
  }

  const out = args[0] || path.join(dir, 'teamily-edit-collaborate.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', path.join(dir, 'vo.mp3'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });

  const total = Math.ceil(DUR * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
