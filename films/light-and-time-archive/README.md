# 把时间用在光中
Final: light-and-time.mp4 — 30 s, 1920×1080, 24 fps, Mandarin narration, burned-in Chinese captions. Separate captions: light-and-time.srt.

Rebuild from /workspace/lemo_opuscar:

    bash films/light-and-time-archive/build.sh

Requires the prepared Lemo-Opuscar environment, core Python dependencies, Playwright, system Chromium and FFmpeg 7+. Voice WAVs and fonts are retained. Build does not require external archive sites or online speech services.

To regenerate speech: install kokoro-onnx and misaki[zh], fetch the verified library voice pack with sh tools/fetch.sh voice, then run .venv/bin/python films/light-and-time-archive/synth_voice.py. Run mix.py afterwards to regenerate exact subtitle timings. ASR checking additionally requires sherpa-onnx and the official SenseVoice int8 model at the path in check_voice.py; it is not required for a normal rebuild.

Source: index.html, film.js, assets/, voice/, lines.json, subtitles.json, mix.py, synth_voice.py, check_voice.py, build.sh. CREDITS records provenance; FACTS.md identifies the scripture references. Prior storyboard/layout documents are retained as development history outside the final source bundle.
