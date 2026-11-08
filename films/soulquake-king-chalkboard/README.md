# SoulQuake Episode 0 — Chalkboard edition

90 seconds at 1920×1080 and 30 fps. Mandarin male narration and bilingual Chinese/English captions. The supplied script and 27 retained narration clauses match the earlier editions; the classroom-board performance and soundtrack are newly directed for Chalkboard.

## Rebuild

From the prepared Lemo-Opuscar root:

    bash films/soulquake-king-chalkboard/build.sh

The retained voice WAVs, original score, subtitle font and sliced CC0 chalk grains permit an offline rebuild. Required tools are Python with numpy/scipy/soundfile/soxr/fonttools/brotli, Node dependencies, Chromium and FFmpeg. Rendering produces 2700 frames via `core/render/video.mjs`, masters H.264/AAC and exports a compact browser copy to `/workspace/shared/downloads`.

`js/film.js` contains the original one-equation lesson, sliding-panel reveal, tracked orange `王`, write–wipe–rewrite correction, board diagrams, camera and bilingual subtitle schedule. The supporting files under `js/` are MIT-licensed Lemo-Opuscar Chalkboard helpers. The demo lesson, writing, board layout, historical forms, camera route and score were not copied.

`mix.py` uses the retained original score when present. It layers two CC0 chalk recordings cut into grains with procedural felt, panel, room and bell sounds. The only sampled instrument is VSCO2 CE pizzicato contrabass (CC0); plucked and wooden tones are procedural.

The cross and empty tomb are symbolic Christian images required by the supplied script. No historical likeness or documentary image is claimed. Build scripts do not publish the cloud environment.
