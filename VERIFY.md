# VERIFY — "Beyond the Frame"

Checks run on the delivered file `out/final.mp4` (encoded, not on the source PNGs).
Measurements come from `beyond-the-frame/verify.py`; raw output is in `beyond-the-frame/verify_report.json`.

## Result: all acceptance checks PASS

| # | Check (from SPEC.md) | Measured | Result |
| --- | --- | --- | --- |
| 1 | 1920×1080, 30 fps, 900 frames, 30.0 s, H.264 / yuv420p, no audio | h264 High, 1920×1080, yuv420p, 30/1, **900 frames**, **30.000 s**, 0 audio streams, 16.1 MB | PASS |
| 2 | Opens dark and minimal (first-frame mean luma < 12) | 7.86 / 255 | PASS |
| 3 | Title readable at 4–8 s and on the final frame | seen in the contact sheet (4–8 s) and the full-size last frame: "BEYOND THE FRAME" | PASS |
| 4 | No frozen stretch > 0.7 s before the end card | longest near-still run 0.47 s, at 0.0 s (the intended dark open); 1.6 % of all frames near-still | PASS |
| 5 | No pure-black or blown-out frames; no glitches at 1 fps | 0 frames with mean < 1, 0 with mean > 200; mean luma range 7.9 – 56.4; contact sheet clean | PASS |

Constraints from the brief: no narration, no TTS, no edge-tts or faster-whisper. The file has no audio
stream.

## How motion was measured

For every pair of consecutive frames, scaled to 480×270 grey, the 99.9th-percentile absolute pixel
change is computed. A frame counts as near-still when that value is < 5 (encoded grain alone measures
1–2). The 99.9th percentile is deliberate. This film is mostly dark negative space, and its moving
elements (a 2 px horizon line, glints, a comet) cover well under 0.5 % of the frame. A mean or 99.5th
percentile would call those seconds frozen when they are not.

Mean motion per second (a rough energy profile, which matches the beat sheet):

```
s  0–2   0.04 0.14 0.14        dark open, point ignites, line stretches
s  3–8   2.16 1.89 0.31 0.43 2.47 4.21   frame opens, title rises, title outgrows frame, fly-through
s  9–13  2.31 1.24 1.12 1.02 1.08        creativity: ribbons, comet circle
s 14–18  2.72 2.93 0.91 0.79 0.79        light wipe, scramble-in, technology grid
s 19–24  1.94 2.32 1.33 1.55 0.69 0.79   iris, circle meets square, fusion
s 25–29  3.27 1.90 0.27 0.21 0.20        collapse + flash, end card resolves, slow push to the end
```

## Issues found and fixed during verification

1. **Bloom halo too heavy and vignette greying outer letters** (first stills pass). Lowered bloom from
   0.55/0.45 to 0.38/0.32 and widened the vignette's clear centre (0.35 H → 0.55 H).
2. **Overlap lens in the convergence scene too saturated.** Lowered its fill alpha from 0.22 to 0.12.
3. **Encode too large at 387 MB.** Heavy temporal grain at CRF 16 is costly. Re-encoded with light grain
   (`noise=alls=2`), CRF 20, `-tune grain`, aq-mode 3, giving 16.1 MB with no visible banding in the dark
   gradients.
4. **1.7 s hold at 1.3 s.** The horizon line's exponential ease finished early and then parked. Changed
   it to a cubic ease over 1.2–3.0 s, added travelling glints along the line, made the ignition earlier
   (0.35 s), and added a soft halo ring. Only frames 0–95 were re-rendered.

## Evidence

- `beyond-the-frame/contact_1fps.png`: 30 frames, one per second, from the encoded MP4.
- `beyond-the-frame/last_frame.png`: the final frame at full size. It reads "BEYOND THE FRAME" with the
  caption "CREATIVITY × TECHNOLOGY".

## Reproduce

```bash
cd beyond-the-frame && node render.mjs --workers 4        # 900 PNG frames, ~7.5 min on 4 cores
```

```bash
ffmpeg -y -framerate 30 -i beyond-the-frame/frames/%04d.png -vf "noise=alls=2:allf=t,format=yuv420p" -c:v libx264 -preset slow -crf 20 -profile:v high -tune grain -x264-params aq-mode=3 -movflags +faststart out/final.mp4
```

```bash
python3 beyond-the-frame/verify.py out/final.mp4
```

## Not verified

- Playback on a hardware decoder or phone was not tested. The stream is H.264 High at 1080p30, which
  every common device supports.
- Judgments of taste (premium feel, elegance) come from the stills and the contact sheet, not from
  watching the film in real time.
