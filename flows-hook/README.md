# Flows hook — animated intro

Editorial / cinematic hook animation for the first ~38s of the Artlist Flows perfume-commercial VO
("This entire commercial started with one idea…" → "…into an entire commercial").

- `flows-hook.mp4` — final 1920×1080 / 30fps render with VO + sound design.
- `src/anim2.js` — the animation; `renderFrame(t)` draws the frame at time `t`, keyed to VO word timestamps.
- `src/render.mjs` — headless Playwright renderer piping frames to ffmpeg (`node render.mjs video` / `stills 12.5 30`).
- `src/sfx2.py` — synthesizes the drone, chimes, shutters, clicks and final hit to `sfx2.wav`.
