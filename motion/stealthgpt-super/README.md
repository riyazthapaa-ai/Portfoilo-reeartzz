# AIDEN AI × StealthGPT SUPER — motion graphic

The source for a 1920×1080, 30 fps motion-graphic video that is timed to the voiceover (5:46).

- `src/index.html`, `src/engine.js`, `src/scenes.js`: the animation. `renderAt(t)` draws the frame for time `t`, so every frame is deterministic.
  - A single "world" canvas holds 24 scenes, placed at different positions and angles. The camera flies between them with eased pans, rotations and zoom-outs, plus a little motion blur.
  - Each element appears at an absolute VO timestamp (`data-in`), so to retime something you edit that number in `scenes.js`.
- `script.txt`, `timing.json`, `align.py`: the VO script, with sentence timings found by aligning the script to the pauses in the audio.
- `src/rms.js`: the VO loudness per frame. It drives the waveform in the bottom-left HUD.

## v2 — bright "3D glossy" style (`src-v2/`)
Restyled after a reference ad:
- **Backgrounds:** bright scenes (white with pastel glows, a blue→pink gradient, solid blue) cut against dark scenes with glows and gold light-rays.
- **Cards and objects:** glossy, tilted 3D cards stacked in a cascade, with 3D emoji objects. The scene camera dollies in 3D.
- **Transitions:** whip pans with directional motion blur and rainbow swoosh streaks, a light burst with a white flash, an RGB dot-ring loader, zoom-throughs and 3D flips.
- **Type:** springy kinetic type, letter-by-letter gradient reveals, and Figma-style selection boxes on key words.
- **Extras:** a toggle switch, number tiles, and a Subscribe click with a bell.

## Preview / render

```bash
node preview.js src/index.html out 3.5 16.4 155   # screenshots at given seconds
node render.js src/index.html part.mp4 0 10428    # frames [a,b) -> mp4 (needs ffmpeg + playwright)
ffmpeg -i part.mp4 -i vo.mp3 -c:v copy -c:a aac -b:a 192k -shortest final.mp4
```

## Screen-recording slots
These scenes are placeholders for your real footage. Overlay your screen recordings on them:
- 2:02 prompt and first draft
- 2:18 pasting into SUPER
- 2:35 side-by-side result
- 3:07–3:50 detector scan and result (the result card has no score, so it never shows a number you didn't actually get)
- 3:50 StealthGPT's demo (the browser frame at stealthgpt.ai)

## v3 — fast-paced cut (`src-v3/`)
v2's look with faster pacing, to match the reference:
- **Camera beats:** the camera snaps with a springy overshoot to frame each new element as it appears, so it moves about every 1–1.5 s. Long gaps get extra filler moves.
- **Faster animation:** transitions are about 40% shorter, and element animations run 1.4× faster.
- **Movement everywhere:** emoji and objects float and bob continuously, and extra pop-in stickers fill the sparse moments.

## v4 — with the real screen recording (`src-v4/`)
`recs.js` splices the demo recording into the script. Each clip has a source start time and a playback speed so it fits its voiceover line:

| Video time | Source time in recording | What's on screen |
|---|---|---|
| 2:02 | 41.5 s | ChatGPT prompt |
| 2:05 | 50 s | AI first draft |
| 2:18 | 63 s | Pasted into SUPER |
| 2:32 | 67 s | Humanizing |
| 2:36 | 78 s | Side by side: draft vs. SUPER output |
| 2:54 | 96 s | Output close-ups |
| 3:11 | 116 s | ZeroGPT submit |
| 3:30 | 120 s | Detect |
| 3:32 | 122 s | Result: 8.6% AI GPT*, "Human written" |
| 3:36 | 126 s | Highlighted text |
| 3:50 | 4 s | StealthGPT site tour |

To render it, extract the recording to frames first: `ffmpeg -i demo.mp4 -vf scale=1600:-2 -q:v 4 src-v4/rec/f_%05d.jpg`. Then run `render-with-footage.js`, which waits for each frame image to decode before taking the screenshot.
