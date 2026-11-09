# AI Shorts — Motion Graphics (Batch 01)

Motion graphics for four 9:16 Shorts (1080×1920, 30 fps):

| # | Channel | Short |
|---|---------|-------|
| 01 | Aiden AI | I Gave AI One Idea. It Built an Entire Brand. |
| 02 | Aiden AI | AI Is Changing How We Make Videos |
| 03 | Eren AI  | You Can Build an App Without Writing Code |
| 04 | Eren AI  | Stop Using AI Tools the Wrong Way |

## Look

- **Aiden AI** takes its style from the channel banner: royal-blue `#2358F5`, white, deep navy, heavy italic caps, skewed highlight bars, and the *"Where Intelligence Evolves"* tagline on the end card.
- **Eren AI** uses the same system in violet `#7C4DFF` and cyan `#22D3EE`, so the two channels look related without looking the same. There was no Eren banner to work from, so the handle `@erenai` and the tagline are **placeholders**. Change them in `CHANNELS` at the top of `shorts.js`.

## What each Short gets

- A hook title card (0–4 s) with strike-throughs, slams and flashes.
- Graphics for each beat of the body, timed to the spoken word, for example:
  - 01: a prompt card that types itself, then a rejected "boring list", then 5 brand tiles, then a big "1 PROMPT".
  - 02: browser tabs that collapse into one workflow, then concept frames, then version steps.
  - 03: a prompt that builds a dashboard, which then gets a login page, buttons and a layout swap.
  - 04: a chat that ends with "tab closed", then a Research → Slides → Visuals workflow graph.
- An ending statement card, then a branded end card with the wordmark and a follow button.
- Kinetic captions: 1–3 words at a time, with the key words highlighted.
- A channel badge and light-sweep and flash transitions. Everything stays inside the Shorts safe zone, clear of the bottom caption UI and the right-hand buttons.

## Files rendered to `out/`

| File | Use |
|------|-----|
| `shortXX_graphics.mov` | ProRes 4444 **with alpha**. Put it on the track above your footage. |
| `shortXX_captions.mov` | ProRes 4444 **with alpha**. Captions only, on their own track. |
| `shortXX_preview.mp4` | Everything over placeholder footage, for review. |
| `shortXX_words.json` | The word timings the render used. |

## Syncing to your real voiceover

The timings come from an estimated speaking pace of about 3 words per second. Every graphic is tied to a **word** (`cue("phrase")`), not to a fixed time. So to sync with your real VO:

1. Get word timestamps, for example from Whisper / `whisper-timestamped`, CapCut auto-captions or Premiere's transcript.
2. Save them as `timings/shortXX.json` in the form `[{ "start": 0.12, "end": 0.40 }, ...]`, with one entry per script word in order. Use `out/shortXX_words.json` as a template.
3. Run `node render.mjs XX` again. Every graphic and caption moves to match.

If you change the wording, edit `script` in `shorts.js`. Wrap a word in `*stars*` to highlight it in the captions.

## Commands

```bash
npm i playwright && npx playwright install chromium   # once; ffmpeg must be installed
node render.mjs              # all shorts
node render.mjs 01 03        # some shorts
node render.mjs --stills 02  # fast contact sheet for checking
```

To scrub through a Short live in a browser, serve the folder (for example `npx serve .`) and open
`index.html?short=01&bg=1&play=1`. Add `&guides=1` to show the safe zone, or `&layer=graphics` / `&layer=captions` to show one layer.

The fonts are Inter Display (SIL Open Font License), bundled in `fonts/`.
