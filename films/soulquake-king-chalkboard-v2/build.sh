#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/usr/bin/chromium}
cd "$LIB"
node core/render/events.mjs "$HERE"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 30 --workers 3 --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/master.py"
"$LIB/.venv/bin/python" "$HERE/export_download.py"
node core/render/readcheck.mjs "$HERE" --step 0.25 > "$HERE/out/readcheck.txt"
