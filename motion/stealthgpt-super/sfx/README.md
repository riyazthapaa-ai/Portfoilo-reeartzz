# SFX pass (v3 fast-paced cut)

- `events.json`: every transition, element animation and typed character in the video, with its exact time. It's exported from the scene engine by `export_events.js`.
- `make_sfx.py`: turns the events into 376 sound cues and renders `sfx.wav`. Every sound is synthesised procedurally (whooshes, risers, impacts, card swipes, pops, bloops, glass pings, clicks, keyboard, glitch, loader blips, chimes, bell, scanner).
- `cues.json`: the cue sheet. Each sound category has a ready-made **audio-studio-mcp** prompt (`audio_type: sfx` plus `sound_source`, `sound_action`, `sound_material` and `sound_space`) and every time it plays.

## Upgrading the sounds with audio-studio-mcp (on your Mac or NVIDIA PC)
The sounds in the video were made procedurally, because audio-studio-mcp needs Apple Silicon or an NVIDIA GPU, plus Hugging Face downloads.

1. Install [audio-studio-mcp](https://github.com/kanaworksai-hue/audio-studio-mcp) and add it to Claude Code.
2. Ask Claude: *"For each entry in cues.json, generate the sound with audio-studio-mcp using its prompt, keep it under 1.5 s (scanner: 2 s, bell: 1.6 s), peak-normalize it and save it as `samples/<file>`."*
3. Re-render the SFX bed. Any category you didn't generate keeps its synthesised sound:
   ```bash
   python make_sfx.py events.json sfx.wav --samples samples/
   ```
4. Mix it under the voiceover. The SFX duck by about 3:1 under your voice, and the mix is normalised to −14 LUFS:
   ```bash
   ffmpeg -i vo.mp3 -i sfx.wav -filter_complex "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[vo][key];[1:a]volume=-6dB[s];[s][key]sidechaincompress=threshold=0.04:ratio=3:attack=15:release=250[d];[vo][d]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11" -ar 48000 mix.wav
   ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k final.mp4
   ```
