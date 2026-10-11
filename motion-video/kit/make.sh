#!/bin/bash
# usage: make.sh part vo0 vo1   -> out/<part>-vo-sfx.mp4, out/<part>-sfx-only.mp4, out/<part>-sfx.wav
set -e
part=$1; vo0=$2; vo1=$3; dur=$(python3 -c "print(round($vo1-$vo0,3))"); fo=$(python3 -c "print(round($vo1-$vo0-0.15,3))")
VO="/root/.claude/uploads/3246498e-36f5-538e-9e2d-e8b0ae09e405/4d208e74-FINAL_WORK_BUDDY_VO.mp3"
cd /home/user/Portfoilo-reeartzz/motion-video
node render.mjs --html $part.html out/$part-silent.mp4 > /dev/null
node sfx.mjs out/$part-sfx.wav cues-$part.json $dur subtle > /dev/null
cd out
ffmpeg -loglevel error -y -i $part-silent.mp4 -i "$VO" -i $part-sfx.wav -filter_complex "[1:a]atrim=$vo0:$vo1,asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st=$fo:d=0.15,pan=stereo|c0=c0|c1=c0,apad[vo];[vo][2:a]amix=inputs=2:duration=shortest:normalize=0,alimiter=limit=0.95[a]" -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -t $dur -movflags +faststart $part-vo-sfx.mp4
ffmpeg -loglevel error -y -i $part-silent.mp4 -i $part-sfx.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -t $dur -movflags +faststart $part-sfx-only.mp4
rm -f $part-silent.mp4
echo "done $part $(ffprobe -v error -show_entries format=duration -of csv=p=0 $part-vo-sfx.mp4)"
