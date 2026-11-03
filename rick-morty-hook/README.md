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
| 0:42.3 – 0:46.6 | Title card over a blurred still from S3E4 | "Today, we're digging through… character deaths." | "EVERY CHARACTER / KILLED OFF / IN RICK AND MORTY" |
| 0:46.6 – 0:53.6 | S1E1 Pilot · 05:50–05:57 | "Starting all the way back in Season One… very first victims." | "SEASON 1 · EPISODE 1 · PILOT" lower-third and a 1.12× push-in, ending on a white flash out of the hook. |

Captions are bold yellow, 1–3 words at a time, and each word lights up as it is spoken. Keywords like "killed", "dead?" and "Season One" are in portal green.

The final mix is normalised to -14 LUFS, which is YouTube's loudness target.

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
