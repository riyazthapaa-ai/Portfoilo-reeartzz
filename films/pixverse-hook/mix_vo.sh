#!/bin/sh
# mix_vo.sh: the soundtrack = the voiceover on top, the film's effects (mix.py, no music) under it, -14 LUFS.
# usage: sh mix_vo.sh   (from the film folder; needs audio/vo.wav and audio/sfx/)
set -e
K=../../.claude/skills/scenario-kinetic-film
python3 make_sfx.py > /dev/null
python3 $K/scripts/mix.py . --no-music --out out/sfx.wav
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/sfx.wav)
ffmpeg -v error -y -i audio/vo.wav -i out/sfx.wav -filter_complex \
  "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad[v];[1:a]volume=-13dB[s];[v][s]amix=inputs=2:normalize=0:duration=longest,atrim=0:$DUR,loudnorm=I=-14:TP=-1:LRA=11[o]" \
  -map "[o]" -ar 48000 out/mix.wav
echo "out/mix.wav ($DUR s)"
