from pathlib import Path
import json, sys
import numpy as np
import soundfile as sf
import soxr
from scipy.signal import butter, sosfilt

p = Path(__file__).parent
(p / 'out').mkdir(exist_ok=True)
root = p.parents[1]
sys.path.insert(0, str(root / 'core/audio'))
import sampler as S

SR = 48000
N = 90 * SR
t = np.arange(N) / SR
rng = np.random.default_rng(211)
voice = np.zeros((N, 2), np.float32)
music = np.zeros((N, 2), np.float32)
fx = np.zeros((N, 2), np.float32)
events = json.loads((p / 'events.json').read_text())['ev']
timeline = json.loads((p / 'timeline.json').read_text())


def add(buf, audio, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i < 0 or i >= N:
        return
    audio = np.asarray(audio)
    if audio.ndim == 2:
        if buf.ndim == 2 and audio.shape[1] == 2:
            n = min(len(audio), N-i)
            buf[i:i+n] += audio[:n] * gain
            return
        audio = audio.mean(axis=1)
    n = min(len(audio), N-i)
    if buf.ndim == 1:
        buf[i:i+n] += audio[:n] * gain
    else:
        buf[i:i+n, 0] += audio[:n] * gain * np.sqrt((1-pan)/2)
        buf[i:i+n, 1] += audio[:n] * gain * np.sqrt((1+pan)/2)


def filt(audio, lo=None, hi=None):
    if lo and hi:
        sos = butter(2, [lo, hi], btype='bandpass', fs=SR, output='sos')
    elif lo:
        sos = butter(2, lo, btype='highpass', fs=SR, output='sos')
    else:
        sos = butter(2, hi, btype='lowpass', fs=SR, output='sos')
    return sosfilt(sos, audio)


PITCH = {'A1':55.00,'Bb1':58.27,'C2':65.41,'D2':73.42,'F2':87.31,'G1':49.00,
         'Bb2':116.54,'C3':130.81,'D3':146.83,'F3':174.61,'G3':196.00,'A3':220.00,
         'C4':261.63,'C#5':554.37,'D4':293.66,'E4':329.63,'F#4':369.99,'F4':349.23,
         'A4':440.00,'B4':493.88}


def guqin(note, duration=2.4, harmonic=False):
    freq = PITCH[note]
    tt = np.arange(int(duration*SR))/SR
    partials = (np.sin(2*np.pi*freq*tt) + .44*np.sin(2*np.pi*2.01*freq*tt+.3)
                + .22*np.sin(2*np.pi*3.96*freq*tt+.7))
    if harmonic:
        partials = .15*np.sin(2*np.pi*freq*tt) + np.sin(2*np.pi*2.01*freq*tt)
    attack = filt(rng.normal(size=len(tt)), 700, 6200)*np.exp(-tt*45)*.12
    return ((partials*.28+attack)*(1-np.exp(-tt*420))*np.exp(-tt*(1.25 if harmonic else 1.65))).astype(np.float32)


def wooden(note, duration=.5):
    freq = PITCH[note]
    tt = np.arange(int(duration*SR))/SR
    tone = np.sin(2*np.pi*freq*tt)+.36*np.sin(2*np.pi*3.02*freq*tt+.2)
    return (tone*(1-np.exp(-tt*180))*np.exp(-tt*8.2)).astype(np.float32)


for cue in timeline:
    audio, sr = sf.read(p / f"voice/{cue['id']}.wav", dtype='float32')
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    audio = soxr.resample(audio, sr, SR)
    if cue['id'] == '9':
        audio = np.tanh(audio*1.5).astype(np.float32)
        audio *= .10 / (np.sqrt(np.mean(audio*audio)) + 1e-10)
    else:
        audio = filt(audio, lo=90).astype(np.float32)
        audio *= .092 / (np.sqrt(np.mean(audio*audio)) + 1e-10)
    audio = .55 * np.tanh(audio/.55)
    add(voice, audio, cue['start'])


# Real chalk grains cut from the three licensed recordings listed in CREDITS.
index = json.loads((p / 'foley/cc0/index.json').read_text())
strokes = [g for g in index if g['kind'] == 'stroke']
taps = [g for g in index if g['kind'] == 'tap']
cache = {}


def grain(g):
    if g['file'] not in cache:
        audio, sr = sf.read(p / 'foley/cc0' / g['file'], dtype='float32')
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        if sr != SR:
            audio = soxr.resample(audio, sr, SR)
        cache[g['file']] = audio / (np.max(np.abs(audio)) + 1e-10)
    return cache[g['file']]


def chalk(duration, level, orange=False):
    out = np.zeros(int((duration + .06)*SR), np.float32)
    pos = 0
    while pos < len(out)-int(.03*SR):
        g = grain(strokes[int(rng.integers(len(strokes)))])
        n = min(len(g), len(out)-pos)
        fade = min(n//4, int(.01*SR))
        q = g[:n].copy()
        q[:fade] *= np.linspace(0,1,fade)
        q[-fade:] *= np.linspace(1,0,fade)
        out[pos:pos+n] += q
        pos += max(int(.62*n), int(.035*SR))
    edge = min(int(.018*SR), len(out)//4)
    out[:edge] *= np.linspace(.25,1,edge)
    out[-int(.05*SR):] *= np.linspace(1,0,int(.05*SR))
    out = filt(out, hi=3600) if orange else filt(out, lo=480)
    return (out*level).astype(np.float32)


for event in events:
    if event['type'] != 'chalk' or event['t'] < 0:
        continue
    duration = max(.04, event['d'])
    size = min(1.0, event['len']/700)
    level = (.035 + .095*size) * (1.2 if event.get('big') else .8)
    add(fx, chalk(duration, level, event.get('color') == 'orange'), event['t'], 1, event.get('pan', 0))
    if duration > .12 and rng.random() < .38:
        tap = grain(taps[int(rng.integers(len(taps)))]) * level * .25
        add(fx, tap, event['t']-.004, 1, event.get('pan', 0))


def slide(start, duration):
    tt = np.arange(int((duration+.3)*SR))/SR
    roll = filt(rng.normal(size=len(tt)), hi=260)
    roll *= np.sin(np.pi*np.minimum(1, tt/(duration+.3)))**.7 * .010
    tick = np.zeros_like(roll)
    for i in range(0, len(tick)-300, int(.046*SR)):
        tick[i:i+300] += np.exp(-np.arange(300)/42)*.004
    add(fx, roll+filt(tick,hi=1200), start, 1, .2)
    knock_t = np.arange(int(.8*SR))/SR
    knock = np.sin(2*np.pi*64*knock_t)*np.exp(-knock_t*12)*.020
    add(fx, knock, start+duration, 1, .35)


def wipe(start, duration):
    tt = np.arange(int((duration+.1)*SR))/SR
    rub = filt(rng.normal(size=len(tt)), 260, 2200)
    env = np.sin(np.pi*np.minimum(1, tt/(duration+.1)))**1.2
    rub *= env*(1+.32*np.sin(2*np.pi*2.2*tt))*.012
    add(fx, rub, start, 1, 0)


for event in events:
    if event['type'] == 'slide': slide(event['t'], event['d'])
    elif event['type'] == 'wipe': wipe(event['t'], event['d'])

# A distant school bell and the final chalk knock.
for start in [e['t'] for e in events if e['type'] == 'bell']:
    tt = np.arange(int(2.1*SR))/SR
    bell = (np.sin(2*np.pi*982*tt)+.42*np.sin(2*np.pi*1964*tt))*np.exp(-tt*1.5)*.005
    add(fx, filt(bell, 600, 3000), start, 1, .45)
for start in [e['t'] for e in events if e['type'] == 'tap']:
    tt = np.arange(int(.5*SR))/SR
    knock = (np.sin(2*np.pi*390*tt)+.3*np.sin(2*np.pi*860*tt))*np.exp(-tt*24)*.012
    add(fx, knock, start, 1, 0)

score = p / 'assets/chalkboard-score.flac'
if score.exists():
    music, sr = sf.read(score, dtype='float32')
    assert sr == SR and len(music) == N
else:
    S.seed(211)
    # Original 72 BPM / 3-4 cue. Sparse guqin-like plucks, wooden bars and pizzicato bass.
    for bar in range(36):
        start = bar*2.5
        if start < 15: chord = ['D3','A3','D4']
        elif start < 43: chord = [['D3','A3','F4'],['C3','G3','E4'],['Bb2','F3','D4']][bar%3]
        elif start < 47: chord = ['D3','A3','D4']
        elif start < 61: chord = [['D3','A3','F#4'],['G3','D4','B4'],['A3','E4','C#5']][bar%3]
        elif start < 74: chord = [['D3','A3','D4'],['F3','C4','A4']][bar%2]
        else: chord = [['D3','A3','F#4'],['D3','A3','D4']][bar%2]
        for beat in range(3):
            st = start + beat*5/6
            add(music, guqin(chord[beat], 2.4, harmonic=(bar in (18,27,34) and beat==2)), st, .006, -.28+beat*.28)
            if start >= 15 and not (43 <= start < 47):
                add(music, wooden(chord[beat], .5), st+.12, .0045, .24-beat*.24)
        if start >= 15 and bar%2==0 and not (43 <= start < 47):
            bass = {'D':'D2','C':'C2','B':'Bb1','G':'G1','A':'A1','F':'F2'}[chord[0][0]]
            add(music, S.note('contrabass_pizz', bass, .55, .42), start, .007, 0)
    sf.write(score, music, SR, subtype='PCM_24')

mask = np.zeros(N, np.float32)
for cue in timeline:
    mask[int(max(0,cue['start']-.22)*SR):int(min(90,cue['start']+cue['duration']+.28)*SR)] = 1
mask = sosfilt(butter(1,4,fs=SR,output='sos'),mask)
music *= (1-.85*mask)[:,None]
for a,b in [(43.0,46.7),(77.0,79.7)]:
    music[(t>=a)&(t<b)] *= .018

room = filt(rng.normal(size=N),70,900).astype(np.float32)*.00065
fx[:,0] += room
fx[:,1] += np.roll(room,997)
fx *= (1-.85*mask)[:,None]
for a,b in [(25.8,28.25)]:
    music[(t>=a)&(t<b)] *= .018
    fx[(t>=a)&(t<b)] *= .018
fade = np.minimum(1,t/.15)*np.minimum(1,(90-t)/.7)
mix = (voice + music + fx)*fade[:,None]
peak = float(np.max(np.abs(mix)))
print('mix peak',peak,flush=True)
assert peak < .99
sf.write(p/'out/mix.wav',mix,SR,subtype='PCM_24')
sf.write(p/'out/voice.wav',voice,SR,subtype='PCM_24')
(p/'SAMPLE-CREDITS.txt').write_text('\n'.join(S.credits(['contrabass_pizz']))+'\n')
print('Chalkboard score, licensed chalk foley and 90-second Mandarin mix ready.',flush=True)
