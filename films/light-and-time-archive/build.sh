#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/usr/bin/chromium}
cd "$LIB"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 2 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/light-and-time.mp4" 24 0
node core/render/still.mjs "$HERE" 16 --out "$HERE/poster-frames"
cp "$HERE/poster-frames/t_16.jpg" "$HERE/poster.jpg"
