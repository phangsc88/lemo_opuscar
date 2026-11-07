# SoulQuake Episode 0 — Stained Glass edition

90 seconds at 1920×1080 and 24 fps. Mandarin narration, bilingual Chinese/English subtitles. The script and voice clauses match the earlier Printed Long Take edition. All picture and soundtrack work is new to this edition.

## Build

From the installed Lemo-Opuscar root:

    bash films/soulquake-king-glass/build.sh

The build needs Python packages numpy, scipy, soundfile, soxr, Node dependencies, Chromium and FFmpeg. It uses the retained 27 voice WAVs and does not need an online speech service. Rendering is via `core/render/video.mjs`; the master is H.264/AAC with measured loudness and a true-peak limiter. A compact web MP4 is exported to `/workspace/shared/downloads`.

`film.js` draws the original window, room and camera. `glass.js` and `comp.js` are MIT-licensed toolkit helpers; see CREDITS. `timeline.json` is the fixed 90-second cue timing, and `soulquake-king.srt` carries the bilingual subtitles. `mix.py` creates an original synthesized organ/harp/glass score under the retained voice. The project uses no downloaded historical image or stock music.

The style's default secular-subject rule yields to the user's explicitly Christian script. Cross and tomb are symbolic; the film does not claim to reproduce an extant window or document historical appearance. No GitHub push or environment publication is part of the build script.
