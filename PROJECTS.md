# Installed toolkit and film projects

This repository imports the Lemo-Opuscar toolkit from [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar), upstream commit `5c05490cc55dfb54f8f4c333f0f0e79cb6500564`. Its original licence and notices are preserved.

## Our film source

- [SoulQuake Episode 0 — Chalkboard](films/soulquake-king-chalkboard/README.md): completed 90-second Mandarin sliding-classroom-board film, 1920×1080 at 30 fps, with bilingual captions, real CC0 chalk foley and an original plucked/wood score.
- [SoulQuake Episode 0 — Whiteboard Explainer](films/soulquake-king-whiteboard/README.md): completed 90-second Mandarin continuous-board film, 1920×1080, with bilingual captions and an original pizzicato/wood score.
- [SoulQuake Episode 0 — Woodcut Print](films/soulquake-king-woodcut/README.md): completed 90-second Mandarin relief-print film, 1920×1080, with bilingual captions and an original low-string/wood score.
- [SoulQuake Episode 0 — Stained Glass](films/soulquake-king-glass/README.md): completed 90-second Mandarin stained-glass film, 1920×1080, with bilingual captions and an original organ/glass score.
- [Artemis newsreel](films/artemis-newsreel/README.md): completed 30-second Mandarin newsreel, 1920×1080, with real licensed source images.
- [Light and Time](films/light-and-time-archive/README.md): completed 30-second Mandarin parchment/loupe film based on the supplied visual direction.
- [Original Brick Toy storyboard](films/light-and-time/TREATMENT.md): draft source retained before the style change.

Project folders include code, local image/font assets, voice WAVs, subtitles, source/credit records and validation reports. Each completed project includes `build.sh`; run it from the prepared toolkit environment. Model weights, installed dependencies, generated intermediate frames and source ZIP exports are excluded from project folders. Compact finished videos are stored under `exports/` when a browser-downloadable GitHub copy is needed.

The toolkit normally ignores `/films/`. These existing project source files are explicitly tracked; their later edits are tracked normally. To add a *new* film project here, explicitly add its chosen source/assets with `git add -f`, keeping large renders, models and dependencies out.

Font licence text accompanies bundled fonts in each project's `assets/FONT-LICENSE.txt`. Image and voice provenance and licensing are recorded in each project's `CREDITS`.
