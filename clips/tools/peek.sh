#!/bin/sh
# quick look: renders a clip small and tiles a frame every $3 seconds (default 0.5) into the scratchpad
# usage: sh tools/peek.sh <clip> <variant> [step] <outdir>
clip=$1; variant=$2; step=${3:-0.5}; out=$4
F=$(cd .. && node -e "console.log(require('ffmpeg-static'))")
printf '{"variant":"%s"}' "$variant" > "$out/props-$variant.json"
npx remotion render "$clip" "$out/$clip-$variant.mp4" --props="$out/props-$variant.json" --scale=0.3 --concurrency=2 --log=error || exit 1
"$F" -y -loglevel error -i "$out/$clip-$variant.mp4" -vf "fps=1/$step,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=12:fontcolor=red,tile=8x3" -frames:v 1 "$out/peek-$clip-$variant.png"
