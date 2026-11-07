# SoulQuake Episode 0 — Woodcut Print edition

90 seconds at 1920×1080 and 24 fps. Mandarin male narration and bilingual Chinese/English captions. The supplied script and 27 retained narration clauses match the earlier editions; the picture and soundtrack are newly directed for Woodcut Print.

## Rebuild

From the prepared Lemo-Opuscar root:

    bash films/soulquake-king-woodcut/build.sh

The retained voice WAVs and `assets/woodcut-score.flac` permit an offline rebuild. Required tools are Python with numpy/scipy/soundfile/soxr, Node dependencies, Chromium and FFmpeg. Rendering produces 2160 frames via `core/render/video.mjs`, then masters H.264/AAC and exports a compact browser copy to `/workspace/shared/downloads`.

`film.js` contains the original seven-plate story, figures, crown/throne/covenant/cross/tomb drawings, camera, paper transition and bilingual letterpress captions. `engine/` and `trans.js` are MIT-licensed Lemo-Opuscar Woodcut Print helpers. The demo story, characters, plate layout, shots and score were not copied.

`mix.py` uses the retained original score when present. If it must regenerate the score from notes, install the toolkit's VSCO2 CE instrument pack; cello and pizzicato contrabass samples are CC0. Knife, chips, block strikes, brayer, baren, paper and modal metal sounds are procedural.

The cross and empty tomb are symbolic Christian images required by the supplied script. No historical likeness, extant print or documentary image is claimed. Build scripts do not publish the cloud environment.
