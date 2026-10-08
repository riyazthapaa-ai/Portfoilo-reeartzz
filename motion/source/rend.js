const { chromium } = require('playwright');
const fs = require('fs');
const [dir, only] = [process.argv[2], process.argv[3]];
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://127.0.0.1:8765/render.html'); await p.evaluate(() => window.ready);
  const { FPS, DUR } = await p.evaluate(() => window.META);
  const list = only ? only.split(',').map(Number) : [...Array(FPS * DUR).keys()];
  fs.mkdirSync(dir, { recursive: true });
  for (const i of list) {
    const d = await p.evaluate(i => window.frame(i), i);
    fs.writeFileSync(`${dir}/f${String(i).padStart(4, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close();
})();
