# 5 Free AI Tools — motion graphics

Animated video for the "5 free AI tools" YouTube voiceover (`voiceover.mp3`, 1920×1080, 30 fps, 118 s).

- `index.html`: the whole animation. Every frame is a pure function of time (`window.seek(t)`).
  Open it in a browser to preview it with the audio (Space = play/pause, C = toggle captions).
- `data.js`: word timestamps (forced alignment of the script to the voiceover) and a loudness envelope used for the waveforms.
- `render.mjs`: renders frames with headless Chromium (Playwright) and encodes them with ffmpeg.

```sh
node render.mjs                 # out/ai-tools.mp4 (burned-in captions)
node render.mjs --no-captions   # out/ai-tools-clean.mp4
node render.mjs --stills 12,40  # out/still-12.png, out/still-40.png
```

Scene timing: intro 0–9.6 s, Goblin.tools 9.6–26.7, Ideogram 26.7–47.45, Gemini Notebook 47.45–69.7,
Gamma 69.7–86.8, Nano Banana 86.8–105.85, outro and end card 105.85–118.

The end card (109.3–118 s) leaves dashed frames for YouTube end-screen elements: a video on the right and a subscribe button on the left.
Tool icons are generic glyphs, not the products' official logos.
