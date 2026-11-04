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

## Video 2 — headphones product ad

The headphone product-ad version of the video (VO `Lex-…41705…mp3` /
`Lex-…41821…mp3`, result `Video_Editing.mp4`). It has the same elements and
pacing as video 1 but a deliberately different look, **"bold kinetic"**
(style option B, picked from the samples in `src/styles/`):

- huge condensed Anton headlines that slam in, with no bounce and no blur
- black, paper white and one acid-lime accent, with no glows
- hard cuts and full-screen lime block wipes between beats
- square-cornered image panels that mask open, with numbered label strips
- persistent chrome: a label, a shot counter and a lime marquee ticker

The style components live in `src/headphones/kinetic.tsx`.

| File | Section | Length | VO source |
| --- | --- | --- | --- |
| `output/hp-hook.mp4` | Hook: one product image → finished ad | 31.9s | `…41705…mp3` 0:00.0–0:31.75 |
| `output/hp-intro.mp4` | The project, the brief, the creative direction | 55.0s | `…41705…mp3` 0:32.0–1:26.8 |
| `output/hp-cta.mp4` | Final thoughts and CTA | 73.6s | `…41821…mp3` 3:24.5–end |

Code lives in `src/headphones/` (`theme.ts` swaps the media before the scenes
load, and `kinetic.tsx` holds the style kit) and assets in `public/hp/`: the original product photo, three
generated stills, the finished ad and the VO cuts. The intro stops just before
"The next step is deciding how the advertisement should look". In the
headphones scenes, cue times are written in source-VO seconds and converted
with `T()`.

`public/hp/final.mp4` has burnt-in subtitles from 4.4–12.6s (including a
"Default text" placeholder over the close-up), so the cards use the stills and
only play the video outside that range.

```bash
CHROME_PATH=/path/to/chrome-headless-shell node render.mjs hp-hook hp-intro hp-cta
```

### Style samples

`output/style-a.mp4`, `style-b.mp4` and `style-c.mp4` (with the board
`style-options.png`) are the three looks tried on the first 8.4s of the hook:
A is studio viewfinder, B is bold kinetic (the one chosen) and C is spec-sheet
HUD. Re-render them with `RANGE=0,8.4 node render.mjs style-a style-b style-c`.

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
