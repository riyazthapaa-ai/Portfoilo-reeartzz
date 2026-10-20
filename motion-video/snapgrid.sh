#!/bin/bash
# usage: snapgrid.sh page.html outdir t1 t2 t3 t4 [...]  -> 2x2 contact sheets
page=$1; out=$2; shift 2; mkdir -p "$out"
node "$(dirname "$0")/snap.js" "$page" "$out/s" "$@" 2>&1 | sort -u | head -20
while [ $# -ge 4 ]; do
  ffmpeg -v error -y -i "$out/s_$1.jpg" -i "$out/s_$2.jpg" -i "$out/s_$3.jpg" -i "$out/s_$4.jpg" -filter_complex "[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0,scale=1920:-1" "$out/grid_$1.jpg"; echo "$out/grid_$1.jpg"; shift 4
done
