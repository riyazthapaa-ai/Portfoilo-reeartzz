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

---

# Part 3: Section 2, "Let's ask the agent to find the context" (VO 1:21.37–2:05.85)

`part3.html`:
- "Let's say it's Monday": a weekday strip with Monday lighting up
- the prompt appears word by word as it's spoken; sources (briefs, scripts, notes) pop in as they're named, and the three asks become a numbered list
- "open this file, then this file, then this spreadsheet": three instruction cards, each struck out
- "I'm giving it the task": a task card goes to the agent, which scans the Library, lights up the 3 relevant sources and shows "Context ready"
- "a much clearer picture": a "This week" result panel (deliverables, missing requirements, top priority)
- "I already had it" → scattered resources pull together into one bundle, "every time"

Outputs: `out/part3-vo-sfx.mp4`, `out/part3-sfx-only.mp4`, `out/part3-sfx.wav`, and `out/full-so-far-vo-sfx.mp4` (hook + Part 2 + Part 3, 0:00–2:06).
```
node render.mjs --html part3.html out/p3-silent.mp4
node sfx.mjs out/part3-sfx.wav cues-part3.json 44.48 subtle
```

---

# Parts 4–10: the rest of the script

Built with a small shared toolkit (`kit/`): every scene is timed in absolute VO seconds and looked up from the VO word timestamps (`vo-words.json`, transcribed from the voiceover), so visuals land on the spoken words.

| Part | VO | Section |
|---|---|---|
| `part4.html` | 2:05.9–2:51.6 | 3. From a collection of files to a working system |
| `part5.html` | 2:51.6–3:35.4 | 4. Now let's change something |
| `part6.html` | 3:35.4–4:07.1 | 5. A completely different request |
| `part7.html` | 4:07.1–4:40.6 | 6. The work doesn't stop after the first output |
| `part8.html` | 4:40.6–5:15.2 | 7. Collaboration |
| `part9.html` | 5:15.2–5:43.9 | 8. Why the Library matters |
| `part10.html` | 5:43.9–end | 9. Final takeaway + outro (fades to black) |

Rebuild a part (run from `motion-video/`):
```
python3 kit/build.py part5 "WorkBuddy Update" 171.55 215.42   # kit/part5.js -> part5.html
kit/make.sh part5 171.55 215.42                                 # render + subtle SFX + VO mix
```
`out/workbuddy-full-1080p.mp4` is the full video (hook + Parts 2–10). `out/workbuddy-full-720p-preview.mp4` is a small preview copy.

---

# MVLAND outro (separate video, 42.6 s)

`mvland-outro.html`. There's no recorded VO yet, so it's timed to a natural speaking pace (word timings in `mvland-words.json`). Outputs: `out/mvland-outro-sfx.mp4` (video + subtle SFX, for laying your VO under) and `out/mvland-outro-sfx.wav`.

| Time | Line | On screen |
|---|---|---|
| 0:00–0:11 | If you've got your own song, a story idea, or even just a visual concept… check out MVLAND. | Song / story / visual cards merge into a music-video player → MVLAND logo |
| 0:11–0:16.6 | I'll leave the link in the description so you can explore it yourself. | Description box with the link glowing, "Explore it yourself" |
| 0:16.6–0:24 | And if you try it, my recommendation is to start with the music and the story you want to tell. | "01 The music" (live waveform) + "02 The story" (Intro · Build · Payoff) |
| 0:24–0:27 | Then build the visuals around that. | Shot thumbnails orbit a Music + Story core |
| 0:27–0:42.6 | Because from the music and storytelling to the characters, individual shots, and final cut, MVLAND gives you a way to turn your creative idea into a music video. | Music → Storytelling → Characters → Shots → Final cut, then the player plays the shots, end logo, fade to black |

Re-time to a real recording: transcribe it to `[[seconds, word], …]`, then
`WORDS=that.json CODE=kit/mvland.js python3 kit/build.py mvland-outro "MVLAND Outro" 0 <end>`.
