# PixVerse Canvas — YouTube motion graphics (Revideo)

Motion-graphic sections for the Lex AI video *"PixVerse Canvas: I Turned One Image Into a
Cinematic AI Video"*, built with [Revideo](https://github.com/midrender/revideo) (v0.11.0).

Only three sections of the script are animated here; the rest of the video is screen recording.

| File | Script section | Length | VO source |
| --- | --- | --- | --- |
| `output/hook.mp4` | 01 · 0:00–0:30 Hook: one image, a whole visual world | 34.9s | `Lex-…37158…mp3` 0:00.0–0:34.75 |
| `output/intro.mp4` | 02 · 0:30–1:05 Introducing PixVerse Canvas | 38.8s | `Lex-…37158…mp3` 0:34.8–1:13.5 |
| `output/cta.mp4` | 09 · 6:45–7:25 Final thoughts and CTA | 56.6s | `Lex-…38172…mp3` 0:20.6–end |

All are 1920×1080, 30 fps, H.264 + AAC, with the voiceover already mixed in and
loudness-normalised to −14 LUFS (YouTube's target). Drop them straight onto the timeline in
place of those sections. There is no music bed, so you can add your own under the whole video.

## What's on screen

- **Hook**: cold open on the finished video, then a cut to the original reference image, which
  expands into the full world. A pile of separate "AI tool" windows gets crossed out and pulled
  into the PixVerse Canvas title. Random clips are struck out, the NOTICE → APPROACH → REVEAL
  sequence assembles and docks into a timeline, and it ends on original image → final result.
- **Intro**: title reveal, then a canvas-style workspace: image gen, video gen and editor nodes
  wrapped in "one project". Next comes the idea → visuals → editor → finished piece flow. The
  concept breakdown zooms on the lone traveler, then the futuristic city and the moon (night).
  After that come a mood board (atmospheric / cinematic / dramatic lighting / reflections) and
  shot progression. It ends with scattered shots snapping into orbit around one reference image.
- **CTA**: blurred montage bed with "beginning → end", then the 4-step pipeline and the creator
  chips with "connected workflow". Three meters show what the result still depends on, and the
  creation and editing panels merge into one workspace. Then "Got an idea?" with an animated
  **link in the description** button click, the first-concept → final-shot journey, and an end
  card with avatar, handle and a subscribe animation.

## Editing timings

Every animation is keyed to the voiceover with `cue(seconds)` calls in `src/scenes/*.tsx`,
so if you re-record a line, shift the matching cue. Colours, fonts and shared building blocks
live in `src/lib.tsx`.

## Rendering

```bash
npm install
```

```bash
CHROME_PATH=/path/to/chrome-headless-shell node render.mjs            # all three
```

```bash
DRAFT=1 CHROME_PATH=/path/to/chrome-headless-shell node render.mjs cta # quick 10fps half-res preview
```

`WORKERS` (default 3) sets the number of parallel render workers per section. `npm run dev`
opens the Revideo editor for live previewing.

## Assets (`public/`)

- `reference.jpg`: the original reference image
- `final.mp4`: the exported PixVerse Canvas result (`Video_Editing.mp4`)
- `vo-*.wav`: voiceover cuts for each section
- `avatar.jpg`: Lex AI avatar (from the script PDF)
