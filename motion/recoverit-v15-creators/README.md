# Recoverit V15 — "For creators" section

Kinetic-type animation for the VO section from 4:16.9 to 4:50.5 ("For photographers, videographers, filmmakers…" → "…much more comprehensive."), styled to match the Hook edit.

- `index.html` — the whole animation as a pure function `render(t)`; open `index.html#12.4` to preview any moment (seconds into the section).
- `render.js` — renders frames with Playwright → ffmpeg.
  `node render.js $PWD/index.html video silent.mp4`
  `node render.js $PWD/index.html stills ./out 2.6 9.5 33.0`
- `sfx.py` — synthesizes the whooshes / pops / impacts at the cue times (`python3 sfx.py sfx.wav`).

Mix and mux:

```sh
ffmpeg -ss 256.9 -t 33.6 -i Aiden_1.mp3 -ar 48000 -ac 2 vo_sec.wav
ffmpeg -i vo_sec.wav -i sfx.wav -filter_complex "[0][1]amix=inputs=2:normalize=0:duration=first" mix.wav
ffmpeg -i silent.mp4 -i mix.wav -c:v copy -c:a aac -b:a 256k -shortest final.mp4
```

Word cue times in `index.html` (`data-t`) come from a word-level transcription of the VO, relative to 4:16.9.
