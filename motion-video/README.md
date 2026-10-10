# Creator Info Overload: motion graphic

1920×1080, 30 fps, 57 s. Kinetic-type explainer for the "finding the right information" script.

- `out/creator-info-overload.mp4` has the sound design (ambient pad, whooshes, pops, typing, stamp)
- `out/creator-info-overload-no-audio.mp4` is a clean version for laying your own voiceover/music under

## Scene timing (for recording the voiceover)
| Time | Line |
|---|---|
| 0:00–0:06.6 | As a creator, I work with a ridiculous amount of information every single week. |
| 0:06.6–0:14.6 | Brand briefs, scripts, product notes, campaign requirements, content calendars, deadlines, performance reports… |
| 0:14.6–0:19.2 | And honestly, the hardest part isn't always doing the work. |
| 0:19.2–0:24.2 | It's finding the right information before I can even start. |
| 0:24.2–0:34.6 | Brand brief in one folder, script somewhere else, feedback in another doc, campaign info in a spreadsheet. |
| 0:34.6–0:39.4 | Then I open an AI tool and realize… |
| 0:39.4–0:47.4 | I have to find all of that information again and explain the entire project from scratch. |
| 0:47.4–0:57.0 | And if something changes tomorrow, I have to do it all over again. |

## Re-rendering
Open `index.html` in a browser to preview it live. Scene times are in the `S` array.
```
node render.mjs out/video-silent.mp4   # frames → MP4 (Playwright + ffmpeg)
node sfx.mjs out/sfx.wav               # synthesizes the sound track from cues.json
ffmpeg -i out/video-silent.mp4 -i out/sfx.wav -c:v copy -c:a aac -shortest out/creator-info-overload.mp4
```

---

# Hook cut (synced to FINAL_WORK_BUDDY_VO.mp3)

`hook.html` is the same animation retimed to the real voiceover (0:00–0:38.25, ending on "…all over again."), using word timestamps from the VO.

- `out/hook-vo-sfx.mp4` has the VO plus subtle UI SFX (no whooshes, no background music)
- `out/hook-sfx-only.mp4` has the same video with SFX only, to drop under your own VO track in the editor
- `out/hook-sfx.wav` is the SFX stem by itself

It ends on the last word with no fade to black, so the main video ("So today I'm testing…") can cut in straight after.

```
node render.mjs --html hook.html out/hook-silent.mp4
node sfx.mjs out/hook-sfx.wav cues-hook.json 38.25 subtle
```

---

# Part 2: "So today I'm testing…" → end of Section 1 (VO 0:38.12–1:21.37)

`part2.html`, same style, synced to the VO words:
- WorkBuddy wordmark reveal on "Workbuddy"
- files dropped into a "storage" box, which bursts into a resource library that an AI agent links to
- a Library window where each resource lands on its spoken word (sponsorship briefs → performance reports)
- "the important part": a dusty folder, then the resources becoming context for the agent
- a "Which files do I need…?" thought bubble, then a single prompt that pulls the library in automatically

Outputs: `out/part2-vo-sfx.mp4`, `out/part2-sfx-only.mp4`, `out/part2-sfx.wav`, and `out/hook+part2-vo-sfx.mp4` (both joined, 0:00–1:21).
```
node render.mjs --html part2.html out/p2-silent.mp4
node sfx.mjs out/part2-sfx.wav cues-part2.json 43.25 subtle
```
