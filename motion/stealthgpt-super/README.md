# AIDEN AI × StealthGPT SUPER — motion graphic

The source for a 1920×1080, 30 fps motion-graphic video that is timed to the voiceover (5:46).

- `src/index.html`, `src/engine.js`, `src/scenes.js`: the animation. `renderAt(t)` draws the frame for time `t`, so every frame is deterministic.
  - A single "world" canvas holds 24 scenes, placed at different positions and angles. The camera flies between them with eased pans, rotations and zoom-outs, plus a little motion blur.
  - Each element appears at an absolute VO timestamp (`data-in`), so to retime something you edit that number in `scenes.js`.
- `script.txt`, `timing.json`, `align.py`: the VO script, with sentence timings found by aligning the script to the pauses in the audio.
- `src/rms.js`: the VO loudness per frame. It drives the waveform in the bottom-left HUD.

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
