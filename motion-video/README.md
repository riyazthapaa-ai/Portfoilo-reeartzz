# Motion graphics video: "Fotor Agent: I Created 4K Motion Graphics for $1.80?"

Everything is drawn in code on a 1920×1080 canvas in headless Chromium and synced to the voice-over using word-level timing (`data/timing.js`).

| File | What it is |
| --- | --- |
| `main.html` + `src/core.js`, `src/scenes*.js`, `src/main.js` | Main YouTube video: 17 scenes, 10 chapters, synced to the VO |
| `footage.html` + `src/footage.js` | Plain 30 s "source footage" of a fictional product (Planora) to show in the demo |
| `src/promo.js` | The "enhanced" promo treatment used in the before/after comparisons |
| `render.js` | Frame-accurate renderer (Playwright → ffmpeg, parallel workers) |
| `make_srt.js` | Generates `out/captions.srt` from the VO timing |

## Render

```bash
node render.js main.html out/main_silent.mp4 30 0 410.5 4
ffmpeg -i out/main_silent.mp4 -i data/vo.mp3 -c:v copy -c:a aac -b:a 192k -shortest out/motion_graphics_video.mp4
node render.js footage.html out/source_footage_30s.mp4 30 0 30 3
node make_srt.js > out/captions.srt
```

Preview stills: `node snap.js main.html /tmp/still 12 95 180`.

The top-left corner stays empty (no logo or AI name), and the video has no channel branding.
