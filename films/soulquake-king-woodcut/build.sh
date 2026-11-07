#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/usr/bin/chromium}
cd "$LIB"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/master.py"
"$LIB/.venv/bin/python" "$HERE/export_download.py"
