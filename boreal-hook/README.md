# Boreal hook — animated intro

YouTube-style hook animation for the first ~63s of the Creatify Boreal review VO
("I've tested a lot of AI video models…" → "…let's see what it can actually do").

- `boreal-hook.mp4` — final 1920×1080 / 30fps render with VO + sound design.
- `src/anim.js` — the whole animation; `renderFrame(t)` draws frame at time `t`.
  Every beat is keyed to word timestamps from the VO.
- `src/render.mjs` — renders frames headlessly (Playwright) into ffmpeg.
- `src/sfx.py` — synthesizes whooshes / impacts / riser / ticks to `sfx.wav`.

Rebuild: `npm i playwright-core` in `src/`, then `node render.mjs video`,
`python3 sfx.py`, and mux with the VO (trimmed to 63.6s).
Preview a single frame: `node render.mjs stills 25.9 35.5`.
