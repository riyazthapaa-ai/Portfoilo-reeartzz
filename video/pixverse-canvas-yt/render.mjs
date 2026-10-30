import {execSync} from 'node:child_process';
import fs from 'node:fs';
import {renderVideo} from '@revideo/renderer';

// Usage: node render.mjs [hook|intro|cta ...]
//   CHROME_PATH  Chrome/Chromium binary (a chrome-headless-shell works best)
//   WORKERS      parallel render workers per section (default 3)
//   DRAFT=1      fast 10fps / half-res preview (outputs *-draft.mp4)
const parts = process.argv.slice(2);
const targets = parts.length ? parts : ['hook', 'intro', 'cta'];
const draft = process.env.DRAFT === '1';
const workers = Number(process.env.WORKERS ?? 3);

process.env.DISABLE_TELEMETRY ??= 'true';

/**
 * Revideo forces Chrome into --single-process mode, and in this container the
 * browser sometimes never returns from browser.close() after the last frame,
 * even though every worker's file is already written. Once all worker files
 * exist and stop growing, kill the headless browser so the renderer can go on
 * to merge audio and video.
 */
function watchdog(name, progress) {
  const files = Array.from({length: workers}, (_, i) => `output/${name}-${i}.mp4`);
  const sizes = new Map();
  let stableTicks = 0;
  const timer = setInterval(() => {
    if ([...progress.values()].length < workers || [...progress.values()].some(p => p < 1)) return;
    if (!files.every(f => fs.existsSync(f))) return;
    const now = files.map(f => fs.statSync(f).size).join(',');
    stableTicks = sizes.get('last') === now ? stableTicks + 1 : 0;
    sizes.set('last', now);
    if (stableTicks >= 4) {
      killChildBrowsers();
      clearInterval(timer);
    }
  }, 2000);
  return () => clearInterval(timer);
}

/** Kill Chrome processes descended from this Node process (and nothing else). */
function killChildBrowsers() {
  const rows = execSync('ps -eo pid=,ppid=,comm=').toString().trim().split('\n');
  const procs = rows.map(r => r.trim().split(/\s+/)).map(([pid, ppid, comm]) => ({pid: +pid, ppid: +ppid, comm}));
  const mine = new Set([process.pid]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const p of procs) {
      if (!mine.has(p.pid) && mine.has(p.ppid)) {
        mine.add(p.pid);
        grew = true;
      }
    }
  }
  for (const p of procs) {
    if (p.pid !== process.pid && mine.has(p.pid) && /chrom/i.test(p.comm)) {
      try {
        process.kill(p.pid, 'SIGKILL');
      } catch {}
    }
  }
}

async function render() {
  for (const name of targets) {
    const outName = `${name}${draft ? '-draft' : ''}`;
    console.log(`Rendering ${outName}...`);
    const progress = new Map();
    const stop = watchdog(outName, progress);
    const file = await renderVideo({
      projectFile: `./src/projects/${name}.ts`,
      settings: {
        outFile: `${outName}.mp4`,
        outDir: './output',
        logProgress: true,
        progressCallback: (worker, p) => progress.set(worker, p),
        viteConfig: {define: {__DRAFT__: JSON.stringify(draft)}},
        workers,
        viteBasePort: Number(process.env.PORT ?? 9000),
        puppeteer: {
          executablePath: process.env.CHROME_PATH,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    });
    stop();
    console.log(`Rendered ${name} to ${file}`);
  }
}

render();
