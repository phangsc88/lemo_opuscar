# SoulQuake Episode 0 — Whiteboard Explainer edition

90 seconds at 1920×1080 and 24 fps. Mandarin male narration and bilingual Chinese/English captions. The supplied script and 27 retained narration clauses match the earlier editions; the board performance and soundtrack are newly directed for Whiteboard Explainer.

## Rebuild

From the prepared Lemo-Opuscar root:

    bash films/soulquake-king-whiteboard/build.sh

The retained voice WAVs and `assets/whiteboard-score.flac` permit an offline rebuild. Required tools are Python with numpy/scipy/soundfile/soxr, Node dependencies, Chromium and FFmpeg. Rendering produces 2160 frames via `core/render/video.mjs`, then masters H.264/AAC and exports a compact browser copy to `/workspace/shared/downloads`.

`film.js` contains the original crown-shaped question map, live markers, magnets, eraser, continuous camera and bilingual caption labels. `engine/wb.js` is the MIT-licensed Lemo-Opuscar Whiteboard helper. The demo lesson, board layout, drawings, route and score were not copied.

`mix.py` uses the retained original score when present. If it must regenerate the score from notes, install the toolkit's VSCO2 CE instrument pack; pizzicato contrabass samples are CC0. Wooden-bar tones, glassy signals, marker strokes, magnet clicks, eraser rub and room sound are procedural.

The cross and empty tomb are symbolic Christian images required by the supplied script. No historical likeness or documentary image is claimed. Build scripts do not publish the cloud environment.
