#!/bin/bash
# mux.sh <clip> <audio_start> <audio_end> <video_dur>
A="/root/.claude/uploads/f0dc1055-b07a-5d16-9965-43309636e888/b2d90391-Lex-20261027025654245Z.mp3"
ffmpeg -y -v error -i out/$1_silent.mp4 -ss $2 -to $3 -i "$A" -filter_complex "[1:a]afade=t=in:d=0.02,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -ar 48000 -t $4 out/$1.mp4
