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

## "Bad" first-version promo (to improve on camera)

`bad.html` + `src/badpromo.js` render `out/bad_promo_first_version.mp4`: a deliberately weak 30 s promo with a loud music bed.

```bash
node render.js bad.html out/bad_silent.mp4 30 0 30 3   # then mux any music track
```

Built-in problems, matching the fixes in the script:

| Time | Problem | Script fix |
| --- | --- | --- |
| 0–3 s | Plain white title card, linear fade | Animate the opening title (Agent) |
| 3–10 s | Title lower third only appears at 8.2 s, is too long, and covers the sidebar | Move the title clip earlier and trim it (Timeline) |
| 10–20 s | Static "Save 10 hours" box sits on top of the product | Turn the number into an animated visual |
| 20–30 s | Long headline, low in the frame, weak hierarchy, cyan accent off-brand, stat card overlaps the product | Shorten the headline, change the accent, resize/move up, reposition the graphic (Canvas) |
| Cuts | Hard cuts between every clip | Add a controlled transition |
| Look | Flat footage | Test a filter |
| Audio | Music too loud (about −11 dB average, peaks at 0 dB) | Lower the level in the timeline |
| Export | 1080p | Re-export at native 4K |

## Badly animated 20 s motion graphics (to redo properly)

`badmg.html` + `src/badmg.js` render `out/bad_motion_graphics_20s.mp4`: the opening of the script in the main video's style, animated badly on purpose. Problems to fix: no easing (linear moves that stop dead), overdone elastic bounces, letters spinning in, choppy 6 fps wobble, overlapping boxes with text spilling out, mixed fonts, a rainbow background and lens flare, camera shake, white flash frames, spin and star wipes, text running off the frame edges, and an abrupt cut to black at the end.
