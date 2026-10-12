// Renders workflow.html frame-by-frame in headless Chromium and encodes it with the voiceover + SFX mix.
//   NODE_PATH=$(npm root -g) node render.js --cues           -> sfx-cues.json (then: python3 mix.py)
//   NODE_PATH=$(npm root -g) node render.js                  -> workflow-motion.mp4
//   NODE_PATH=$(npm root -g) node render.js --stills 1,5,12 -> still-<t>.png for quick checks
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS_NUM = 30000, FPS_DEN = 1001; // match the source video's 29.97 fps
const dir = __dirname;
const audio = path.join(dir, 'workflow-mix.m4a');
const out = path.join(dir, 'workflow-motion.mp4');

(async () => {
  const stillsArg = process.argv.indexOf('--stills');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(dir, 'workflow.html') + '?render');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const duration = await page.evaluate(() => window.DURATION);

  if (process.argv.includes('--cues')) {
    const cues = await page.evaluate(() => window.SFX);
    fs.writeFileSync(path.join(dir, 'sfx-cues.json'), JSON.stringify(cues, null, 1));
    await browser.close();
    return;
  }

  if (stillsArg > -1) {
    for (const t of process.argv[stillsArg + 1].split(',').map(Number)) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.join(process.env.STILLS_DIR || dir, `still-${t}.png`) });
    }
    await browser.close();
    return;
  }

  const frames = Math.round(duration * FPS_NUM / FPS_DEN);
  const ff = spawn('ffmpeg', [
    '-y', '-v', 'error',
    '-f', 'image2pipe', '-framerate', `${FPS_NUM}/${FPS_DEN}`, '-c:v', 'png', '-i', '-',
    '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'grain',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'copy', '-shortest', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.render(t), f * FPS_DEN / FPS_NUM);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write(`frame ${f}/${frames}\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
