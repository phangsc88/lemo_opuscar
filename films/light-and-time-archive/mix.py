from pathlib import Path
import json,sys
import numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt
p=Path(__file__).parent;(p/'out').mkdir(exist_ok=True);SR=48000;N=30*SR;t=np.arange(N)/SR;rng=np.random.default_rng(9)
lines=json.loads((p/'lines.json').read_text());starts=[.4,5.2,8.65,14.4,19.4,25.1]
voice=np.zeros(N);subs=[];events=[]
import soxr
for line,st in zip(lines,starts):
 a,sr=sf.read(p/f"voice/{line['id']}.wav");a=soxr.resample(a,sr,SR)
 # Mild soft-knee compression, followed by RMS normalization.
 a=np.tanh(a*2)/2;a*=.105/(np.sqrt(np.mean(a*a))+1e-10)
 i=int(st*SR);voice[i:i+len(a)]+=a
 end=st+len(a)/SR
 subs.append({'t0':max(0,st-.2),'t1':min(29.85,end+.75),'text':line['text']})
subs[-1]['t1']=29.9
# Original 72 BPM score: nine bars, restrained reflective piano-like modal voicing.
bar=10/3;chords=[[50,57,62,65],[46,53,58,62],[53,60,65,69],[48,55,60,64],[50,57,62,65],[46,53,58,62],[55,62,67,70],[57,64,69,72],[50,57,62,65]]
L=np.zeros(N);R=np.zeros(N)
def add(buf,a,st,g=1):
 i=int(st*SR)
 if i>=N:return
 n=min(len(a),N-i);buf[i:i+n]+=a[:n]*g
def piano(note,dur=3):
 tt=np.arange(int(dur*SR))/SR;f=440*2**((note-69)/12)
 y=sum((1/k**1.8)*np.sin(2*np.pi*f*k*tt)*np.exp(-tt*(1.2+.6*k)) for k in range(1,6))
 return y*(1-np.exp(-tt*180))*.035
for j,notes in enumerate(chords):
 for k,n in enumerate(notes):
  st=j*bar+k*.4166667
  add(L,piano(n),st,.8+.2*(k%2));add(R,piano(n),st+.013,.9-.15*(k%2))
 # High restrained glass phrase, not a looped stock track.
 if j in [2,4,6,8]:
  for kk,n in enumerate([notes[2]+12,notes[1]+12]):
   tt=np.arange(int(1.6*SR))/SR;f=440*2**((n-69)/12)
   a=.008*np.sin(2*np.pi*f*tt)*np.exp(-tt*3)*(1-np.exp(-tt*100))
   add(L,a,j*bar+kk*.833);add(R,a,j*bar+kk*.833+.025)
# Light reverb tail and voice ducking.
for delay,gain in [(0.11,.18),(.23,.1),(.37,.06)]:
 i=int(delay*SR);L[i:]+=L[:-i].copy()*gain;R[i:]+=R[:-i].copy()*gain
mask=np.zeros(N)
for sub in subs:
 a=int(max(0,sub['t0']-.15)*SR);b=int(min(30,sub['t1'])*SR);mask[a:b]=1
mask=sosfilt(butter(1,4,fs=SR,output='sos'),mask);duck=1-.55*mask
quiet=np.ones(N)
for a,b in [(7.9,8.5),(24.5,25.1)]:
 q=(t>=a)&(t<b);quiet[q]=.04
L*=duck*quiet;R*=duck*quiet
# Low electrical/room bed, unobtrusive.
bed=.0006*np.sin(2*np.pi*100*t)+.00012*rng.normal(size=N)
foley=np.zeros(N)
for st in [4.95,14.1,19.15]:
 tt=np.arange(int(.28*SR))/SR;clack=(rng.normal(size=len(tt))*.05*np.exp(-tt*120)+.016*np.sin(2*np.pi*1450*tt)*np.exp(-tt*28))
 add(foley,clack,st)
for st in [0.12,.34]:
 tt=np.arange(int(.03*SR))/SR;add(foley,rng.normal(size=len(tt))*.018*np.exp(-tt*200),st)
fade=np.minimum(1,t/.25)*np.minimum(1,(30-t)/.8)
mix=np.stack([voice+L+foley+bed,voice+R+foley+bed],axis=1)*fade[:,None]
assert np.max(np.abs(mix))<1
sf.write(p/'out/mix.wav',mix,SR,subtype='PCM_24');sf.write(p/'out/voice.wav',voice,SR)
(p/'subtitles.json').write_text(json.dumps(subs,ensure_ascii=False,indent=2))
def tc(x):
 ms=round(x*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(p/'light-and-time.srt').write_text('\n\n'.join(f"{i+1}\n{tc(s['t0'])} --> {tc(s['t1'])}\n{s['text']}" for i,s in enumerate(subs))+'\n')
print('mixed',len(mix)/SR,'seconds; subtitle timings:',subs)
