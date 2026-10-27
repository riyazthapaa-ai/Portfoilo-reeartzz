# Runable × FocusFlow — motion graphics

Apple-style kinetic type in the Runable look — sky-blue cloud backdrop with dot texture, editorial serif headlines, black ink accents and white chip UI — with a subtle Vox-style mixed-media layer (torn paper, tape, hand-drawn marks, grain). FocusFlow outputs (site, deck, post) keep their own blue brand. The Runable mark is a hand-traced approximation; swap in the official SVG via `RLOGO` in `source/motion.html`.

| File | VO section | Length |
|---|---|---|
| `video/01_hook_0-00_to_0-30.mp4` | 0:00–0:30 Hook | 29.8 s |
| `video/02_intro_0-30_to_0-57.mp4` | 0:30–1:00 Introducing Runable | 27.45 s |
| `video/03_outro_final-verdict-cta.mp4` | Final verdict + CTA (VO 5:55.85 → end) | 34.55 s |

All three are 1920×1080, 60 fps, H.264, with the VO muxed in.
The hook and intro run back to back with no gap: hook ends at VO 29.80 s and intro starts there.
The outro holds about 2 s of silence after "next video" for the end card.

## Re-rendering
- `source/motion.html?clip=hook|intro|outro` previews the animation live in a browser.
- `tools/align.py` + `tools/cues.py` regenerate `source/cues.js` (word timings) from the VO.
- `node tools/render.js <clip> 60` renders frames with Playwright → `out/<clip>_silent.mp4`, then `tools/mux.sh` adds the audio.
