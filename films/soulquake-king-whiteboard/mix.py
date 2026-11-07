from pathlib import Path
import json, sys
import numpy as np
import soundfile as sf
import soxr
from scipy.signal import butter, sosfilt

p = Path(__file__).parent
(p / "out").mkdir(exist_ok=True)
root = p.parents[1]
sys.path.insert(0, str(root / "core/audio"))
import sampler as S

SR = 48000
N = 90 * SR
t = np.arange(N) / SR
rng = np.random.default_rng(127)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
foley = np.zeros((N, 2), np.float32)
cues = json.loads((p / "timeline.json").read_text())


def add(buf, audio, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i < 0 or i >= N:
        return
    audio = np.asarray(audio)
    if audio.ndim == 2:
        audio = audio.mean(axis=1)
    n = min(len(audio), N - i)
    if buf.ndim == 1:
        buf[i:i+n] += audio[:n] * gain
    else:
        buf[i:i+n, 0] += audio[:n] * gain * np.sqrt((1-pan)/2)
        buf[i:i+n, 1] += audio[:n] * gain * np.sqrt((1+pan)/2)


for cue in cues:
    audio, sr = sf.read(p / f"voice/{cue['id']}.wav")
    audio = soxr.resample(audio, sr, SR)
    audio = np.tanh(audio * 1.5)
    audio *= .10 / (np.sqrt(np.mean(audio * audio)) + 1e-10)
    audio = .55 * np.tanh(audio / .55)
    add(voice, audio, cue["start"])


score = p / "assets/whiteboard-score.flac"
if score.exists():
    music, sr = sf.read(score, dtype="float32")
    assert sr == SR and len(music) == N
else:
    S.seed(127)
    # Original 72 BPM clockwork cue: dry pizzicato, wooden bars and tiny glassy signals.
    for bar in range(36):
        start = bar * 2.5
        if start < 31:
            chord = [[50, 57, 62], [48, 55, 60], [46, 53, 58]][bar % 3]
        elif start < 44:
            chord = [[45, 52, 57], [46, 53, 58]][bar % 2]
        elif start < 62:
            chord = [[50, 57, 66], [55, 62, 67], [57, 64, 69]][bar % 3]
        elif start < 74:
            chord = [[50, 57, 62], [53, 60, 65]][bar % 2]
        else:
            chord = [[50, 57, 66], [50, 57, 62]][bar % 2]
        for beat in range(3):
            note = chord[(beat + bar) % len(chord)] - 12
            audio = S.note("contrabass_pizz", note, .48, vel=.38)
            audio *= .012 / (np.sqrt(np.mean(audio * audio)) + 1e-10)
            add(music, audio, start + beat * 5/6, .55, -.42 if beat % 2 == 0 else .38)
        for beat, note in enumerate(chord):
            st = start + beat * 5/6 + .16
            tt = np.arange(int(.9 * SR)) / SR
            f = 440 * 2 ** ((note + 12 - 69) / 12)
            wooden = (np.sin(2*np.pi*f*tt) + .38*np.sin(2*np.pi*3.02*f*tt))
            wooden *= (1-np.exp(-tt*140)) * np.exp(-tt*6.7) * .0055
            add(music, wooden, st, 1, -.25 + beat*.25)
        if bar in (0, 6, 12, 18, 24, 30, 34):
            tt = np.arange(int(2.2 * SR)) / SR
            f = 880 * 2 ** ((chord[-1] - 69) / 12)
            bell = (np.sin(2*np.pi*f*tt) + .34*np.sin(2*np.pi*2.71*f*tt))
            bell *= (1-np.exp(-tt*500)) * np.exp(-tt*2.6) * .004
            add(music, bell, start + .08, 1, .35)
    sf.write(score, music, SR, subtype="PCM_24")

mask = np.zeros(N, np.float32)
for cue in cues:
    a = int(max(0, cue["start"]-.22) * SR)
    b = int(min(90, cue["start"]+cue["duration"]+.28) * SR)
    mask[a:b] = 1
mask = sosfilt(butter(1, 4, fs=SR, output="sos"), mask)
music *= (1 - .84 * mask)[:, None]
for a, b in [(43.2, 44.2), (75.7, 76.8)]:
    music[(t >= a) & (t < b)] *= .018


def marker(start, duration, colour="black", pan=0.0, gain=.010):
    tt = np.arange(int(duration * SR)) / SR
    noise = rng.normal(size=len(tt))
    bands = {"black": (650, 5300), "blue": (820, 6100), "red": (980, 6900)}
    lo, hi = bands[colour]
    rub = sosfilt(butter(2, [lo, hi], btype="bandpass", fs=SR, output="sos"), noise)
    pressure = np.sin(np.pi * np.minimum(1, tt / duration)) ** .55
    chatter = .68 + .32 * np.sin(2*np.pi*(23 + 2*np.sin(tt*3))*tt) ** 2
    add(foley, rub * pressure * chatter * gain, start, 1, pan)
    tick_t = np.arange(int(.08 * SR)) / SR
    tick = rng.normal(size=len(tick_t)) * np.exp(-tick_t*75) * gain * 1.8
    add(foley, tick, start, 1, pan)


def magnet(start, pitch=290, pan=0.0, gain=.020):
    tt = np.arange(int(1.2 * SR)) / SR
    audio = np.zeros_like(tt)
    for f, level, decay in [(pitch, 1, 5.4), (pitch*2.17, .42, 7.2), (pitch*4.01, .18, 9.5)]:
        audio += np.sin(2*np.pi*f*tt) * level * np.exp(-tt*decay)
    audio *= (1-np.exp(-tt*650)) * gain
    add(foley, audio, start, 1, pan)


def eraser(start, duration, pan=0.0):
    tt = np.arange(int(duration * SR)) / SR
    noise = rng.normal(size=len(tt))
    rub = sosfilt(butter(2, [110, 2100], btype="bandpass", fs=SR, output="sos"), noise)
    strokes = .4 + .6 * np.maximum(0, np.sin(2*np.pi*2.3*tt)) ** .5
    edge = np.minimum(1, tt/.15) * np.minimum(1, (duration-tt)/.18)
    add(foley, rub * strokes * edge * .015, start, 1, pan)


for args in [
    (.2, 4.2, "black", -.35), (5.0, 7.8, "blue", .25),
    (14.1, 5.0, "blue", -.35), (19.5, 10.2, "black", .18),
    (31.0, 5.5, "blue", -.35), (35.6, 5.2, "black", .32),
    (44.1, 15.1, "red", .30), (60.0, 6.7, "red", -.30),
    (66.9, 6.2, "black", .30), (74.1, 5.0, "black", -.30),
    (79.3, 6.2, "red", .28), (86.0, 3.2, "red", 0.0),
]:
    marker(*args)
eraser(39.5, 3.6, .1)
for args in [(.35, 310, .2, .022), (15.8, 276, -.25, .019), (32.0, 294, -.2, .017),
             (35.6, 330, .25, .017), (69.1, 390, .25, .023), (89.35, 230, 0, .025)]:
    magnet(*args)

room = sosfilt(butter(2, [70, 850], btype="bandpass", fs=SR, output="sos"), rng.normal(size=N)).astype(np.float32) * .00085
foley *= (1 - .70 * mask)[:, None]
fade = np.minimum(1, t/.16) * np.minimum(1, (90-t)/.7)
out = (voice[:, None] + music + foley + room[:, None]) * fade[:, None]
peak = float(np.max(np.abs(out)))
print("mix peak", peak, flush=True)
assert peak < .99
sf.write(p / "out/mix.wav", out, SR, subtype="PCM_24")
sf.write(p / "out/voice.wav", voice, SR, subtype="PCM_24")
(p / "SAMPLE-CREDITS.txt").write_text("\n".join(S.credits(["contrabass_pizz"])) + "\n")
print("Whiteboard score, marker foley and 90-second Mandarin mix ready.", flush=True)
