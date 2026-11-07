# Hook edit: "Every Character Killed Off in Rick and Morty"

This folder has the hook edit, cut to your VO (`hook_vo.mp3`, which is 0:00–0:24.31 of the full VO file).
The VO was transcribed word by word, and each line is cut at a measured silence, so the edits land on the words.

| File | What it is |
|---|---|
| `hook_preview.mp4` | Timing animatic, full clip lengths (53.6s). Coloured cards stand in for the footage. |
| `hook_preview_tight.mp4` | Same animatic in tight mode, with clips trimmed to their VO lines (26.3s). |
| `hook_preview_captions.srt` / `.ass` | Captions for the full version. The `.ass` file has word-by-word highlighting. |
| `build_hook.py` | Renders the finished 1080p hook once you give it your episode files. |
| `hook_vo.mp3` | The hook part of the VO. |

## Timeline (full clip lengths)

| Time | Shot | VO | Treatment |
|---|---|---|---|
| 0:00.0 – 0:12.0 | S3E4 Vindicators 3 · 11:17–11:29 | "From a whole bunch of superheroes… rescue mission…" | Slow punch-in to 1.10×. Episode audio sits under the VO, then comes up to full after "mission". |
| 0:12.0 – 0:35.0 | S7E5 Unmortricken · 18:45–19:08 | "to important characters dying that changed the show forever." | Punch-in to 1.08×. Episode audio comes up to full after "forever". |
| 0:35.0 – 0:38.8 | Montage: 6 still frames taken from the three clips | "Rick and Morty has killed off a ridiculous number of characters…" | Alternating zoom in and out, with "KILLED OFF" slammed in red on "killed". |
| 0:38.8 – 0:42.3 | Desaturated still from S7E5 (19:05) | "But how many of these unlucky souls actually stayed dead?" | Push-in, then "STAYED" and "DEAD?" pop on the words. |
| 0:42.3 – 0:46.6 | Evidence board: opens on the whole board, then zooms in and moves from kill photo to kill photo, then dives into the S1E1 photo (`board_intro.mp4`) | "Today, we're digging through… character deaths." | See "Title card" below. No captions over it. |
| 0:46.6 – 0:53.6 | S1E1 Pilot · 05:50–05:57 | "Starting all the way back in Season One… very first victims." | "SEASON 1 · EPISODE 1 · PILOT" lower-third and a 1.12× push-in, ending on a white flash out of the hook. |

Captions are bold yellow, 1–3 words at a time, and each word lights up as it is spoken. Keywords like "killed", "dead?" and "Season One" are in portal green.

The final mix is normalised to -14 LUFS, which is YouTube's loudness target.

## Title card

`title_card.py` renders "Every Character / KILLED OFF / Rick and Morty" in the Rick and Morty logo style. The style follows the 3D title pops in the reference reel.

- **Font:** Get Schwifty (`fonts/get_schwifty.ttf`), a fan-made recreation of the logo lettering. Check its licence before using it on a monetised channel.
- **Colours:** taken from the logo: cyan face, dark-teal inner line, lime outline and black edge.
- **3D look:** a deep green extrusion that leans toward the centre, a glossy top bevel and a drop shadow.
- **Rick and Morty logo:** your uploaded logo (`assets/rick_and_morty_logo.webp`) is extruded in 3D the same way and sits under the title.
- **Animation (4.25s):**
  - 0.00s: white flash and a zoom punch into the portal.
  - 0.05s: the "Every Character" letters tumble in one at a time, each spinning in 3D from a different direction.
  - 0.55s: "KILLED OFF" slams in with a zoom blur, an RGB split, speed lines, a spark burst and a big shake.
  - 1.12s: the Rick and Morty logo spins in from deep space and lands with a bounce, speed lines and sparks.
  - 1.95s: a light sweep shines across everything.
  - 3.63s: a hit on "deaths", with a scale pulse, shake, RGB split and sparks.
  - End: a whip-out with motion blur.
  - Throughout: 3D camera sway and dolly, a glow that pulses on every hit, a spinning portal and a handheld shake.
- **Background:** an animated green portal.
- **SFX:** letter whooshes and pops, a riser and boom on the slam, a spinning whoosh and boom for the logo, a shimmer on the light sweep, a hit on "deaths" and a whip-out whoosh. These are synthesised, so there are no licensing issues.
- **Outputs:**
  - `title_card.mp4` is the full frame with background and SFX. `build_hook.py` drops it in automatically.
  - `title_card_overlay.mov` / `title_card_overlay.webm`: a transparent overlay to put on a track above your footage. It has no portal background, but it keeps the text, logo, 3D depth, drop shadow, sparks, speed lines, the opening flash, shake and SFX. The wide glow and the faint impact flashes are left out, because their near-transparent pixels show up as solid green or white blocks in some editors.
    - `.mov` is ProRes 4444 with alpha (117 MB). Use it in Premiere, After Effects, DaVinci Resolve, Final Cut and CapCut desktop. It's too big for git, so run `python3 title_card.py --prores` to make it.
    - `.webm` is VP9 with alpha (6.5 MB). It's committed, and it works in browsers, OBS and some editors.

Requirements: `pip install numpy opencv-python-headless pillow`.

## Evidence board, intro dive and kill-to-kill transition

`evidence_board.py` draws a detective-style evidence board in Rick and Morty art style: flat colours with thick black outlines. It has a cork board with a wooden frame, polaroids of kill scenes, red string, pushpins, sticky notes ("#1", "CLONE?", "STILL DEAD??"), a bloody knife, a pistol, a portal gun, a "TEEN FROZEN SOLID" newspaper clipping and a "CASE FILE: WHO STAYED DEAD?" header.

- **Blurred photos:** the photos on the board are blurred, so the deaths stay a mystery. When the camera dives into one, it sharpens and comes alive as the full-frame scene, and the cut goes straight into the episode clip.
- **`board_intro.mp4` (5.7s):** used for the title section of the hook.
  - Over "Today, we're digging through…", the video opens on the whole board (about 1 second, with a slow drift). Then the camera pushes in to photo #3 and moves from kill photo to kill photo (#3 → #4 → #5), whipping along the string between them and holding briefly on each. No title text.
  - On "Starting all the way back in Season One", it pulls back and flies across the board, then dives into the S1E1 Frank photo.
  - The photo turns into the scene, ready to cut to the Pilot clip at 05:50.
- **`transition_1_to_3.mp4` (2.6s):** a reusable transition between kill sections.
  - The camera pulls back from the scene into its photo.
  - It whips along the red string to the next photo.
  - It dives in, and that photo comes alive as the next scene.
- **Sound:** synthesised whooshes, paper rustles, thumps and a camera shutter are included.
- **`transition_1_to_2.mp4` (2.6s):** the real transition out of kill #1.
  - It starts on the last frame of the Frank section, from the "So, congratulations, Frank" part (`assets/board/s1e1_frank_end.webp`).
  - It whips to #2 (S1E3, Anatomy Park) and dives in.
  - It lands on the first frame of the S1E3 clip, Reuben on the table (`assets/board/s1e3_reuben.png`), so you can cut straight into the Anatomy Park clip.

```bash
python3 evidence_board.py intro                        # rebuild the intro (--overlay adds a transparent title on top)
python3 evidence_board.py transition --from 1 --to 2 \
    --from-img last_frame_of_clip1.png --to-img first_frame_of_clip2.png
python3 evidence_board.py still                        # full board as a PNG
```

The photo slots, their positions, captions and images are in `SLOTS` at the top of `evidence_board.py`. Slots without a real frame yet use blurred placeholder crops of the frames in `assets/board/`. For a seamless cut, give each slot a screenshot of the first frame of its clip (`--to-img`), and give `--from-img` the last frame of the previous clip.

Fonts: Permanent Marker (Apache 2.0) and Bangers (OFL). Their licence files are in `fonts/`.

## Episode title cards

`episode_cards/` has one transparent PNG per episode, Season 1 to Season 8 (81 cards). They're drawn in Rick and Morty art style: flat colours, thick black outlines, a flat drop shadow, a portal-green season badge, a cyan "SEASON · EPISODE" tab and a cream title plate. The lettering is clean Inter Display, not the wiggly font.

- **Size:** cards are rendered at 2× (about 250–470 px tall) and tightly cropped, so you can scale them down and place them anywhere.
- **Long titles** wrap onto two lines.
- **Overview:** `episode_cards_preview.png` shows all of them.
- **Rebuild:** `python3 episode_cards.py`, or `--only S1E3` for one card. Edit the `EPISODES` list to fix or add titles.
- **Check Season 8:** I'm less sure of the Season 8 titles than Seasons 1–7. Check them before you use them.

## Frank explainer (kill #1 intro)

`frank_explainer.py` builds an explainer-style intro for the line "Remember Frank Palicky? No? Well, he was the bully who apparently thought threatening a fourteen-year-old kid with a knife was a perfectly reasonable way to start the school day." It's timed word for word to VO 0:24.31–0:33.09 (8.8s).

- **Style:** Rick and Morty art style. Flat cartoon school lockers with black outlines, and sticker cut-outs of Frank and Morty (`assets/explainer/`, cut from your frames). Name plates use clean Inter Display in the episode-card style. There are no emoji or text pop-ups.
- **Beats:**
  - Frank pops in. His name plate ("S1E1 · THE BULLY / Frank Palicky") lands on "Frank".
  - A red BULLY stamp slams down with a shake on "bully".
  - Morty slides in. "AGE 14 / Morty Smith" appears on "fourteen".
  - On "knife", Frank swaps to his knife pose with a red danger flash and a shake, and Morty trembles.
  - "…perfectly reasonable way to start the school day" plays as a slow push-in on the two of them, with a final hit on "day".
- **Sound:** synthesised pops, whooshes, a stamp thud and a knife "shing".
- **Files:**
  - `frank_explainer.mp4` has SFX only, to lay under your VO.
  - `frank_explainer_with_vo.mp4` is a preview with the VO mixed in.

```bash
python3 frank_explainer.py --vo "<full VO .mp3>"
```

## Rendering the real thing

You need Python 3 and ffmpeg. Use episode files from a legal source, such as your own copies.

```bash
python3 build_hook.py --vo hook_vo.mp3 \
  --s3e4 "S03E04.mkv" --s7e5 "S07E05.mkv" --s1e1 "S01E01.mkv" \
  -o hook_final.mp4                # add --tight for the 26s version
                                   # add --music bed.mp3 for a music bed that ducks under the VO
```

Clip in/out points and still-frame times are in the `build_edl()` function near the top of `build_hook.py`.
The still frames are my guesses inside your timestamp ranges, so check them against the real footage and adjust.
