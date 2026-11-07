# Artemis at Ephesus / 以弗所亚底米神庙
30 seconds, 1920×1080, 24fps. Mandarin male narration, Chinese burned-in subtitles, original hot-band-like score. 1920s Newsreel inspired: 1.37 projected gate inside the requested 16:9 frame; monochrome, scratches, grain, weave, original ident and optical-track voice.

The historic engraving and plan are explicitly dated and described as historical interpretations. The modern ruins image is explicitly dated 2012. This film does not claim to contain actual 1920s moving footage or authentic footage of the intact ancient temple.

Rebuild from the prepared library:

    bash films/artemis-newsreel/build.sh

Requires the existing prepared Lemo-Opuscar Node/Python environment, Chromium and FFmpeg 7+. Assets and synthesized voice WAVs are retained; no network access is required for the normal rebuild. Default LIB is two directories above this folder; set LIB if placing the project elsewhere. Build does not fetch external source material or regenerate voice. Source/licence records are preserved in SOURCES.json/CREDITS; all used images are stored locally.

Optional speech regeneration: .venv/bin/python films/artemis-newsreel/synth_voice.py, requiring the local Kokoro model/voice pack and Misaki Chinese frontend. Optional ASR: check_voice.py requires sherpa-onnx and the separate cached SenseVoice model; model weights are not bundled.
