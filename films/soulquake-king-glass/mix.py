from pathlib import Path
import json,numpy as np,soundfile as sf,soxr
from scipy.signal import butter,sosfilt,lfilter
p=Path(__file__).parent;(p/'out').mkdir(exist_ok=True)
SR=48000;N=90*SR;tt=np.arange(N)/SR;rng=np.random.default_rng(807)
voice=np.zeros(N,np.float32);music=np.zeros((N,2),np.float32);foley=np.zeros(N,np.float32)
def add(buf,a,st,vol=1):
 i=int(st*SR)
 if i<0 or i>=N:return
 n=min(len(a),N-i);buf[i:i+n]+=a[:n]*vol
for c in json.loads((p/'timeline.json').read_text()):
 a,sr=sf.read(p/f"voice/{c['id']}.wav");a=soxr.resample(a,sr,SR);a=np.tanh(a*1.5);a*=.10/(np.sqrt(np.mean(a*a))+1e-10);a=.55*np.tanh(a/.55);add(voice,a,c['start'])
def hz(midi):return 440*2**((midi-69)/12)
def note(kind,pitch,dur):
 n=int((dur+.7)*SR);t=np.arange(n)/SR;f=hz(pitch)
 if kind=='organ':
  phase=2*np.pi*f*t;w=np.sin(phase)*.64+np.sin(2*phase)*.23+np.sin(3*phase)*.1+np.sin(4*phase)*.05
  env=(1-np.exp(-t*7))*np.minimum(1,np.maximum(0,(dur+.35-t)/.5));return (w*env).astype(np.float32)
 if kind=='harp':
  phase=2*np.pi*f*t;w=np.sin(phase)+.44*np.sin(2.01*phase)+.2*np.sin(3.02*phase)+.1*np.sin(4.03*phase)
  env=(1-np.exp(-t*150))*np.exp(-t*2.3)*np.minimum(1,np.maximum(0,(dur+.5-t)/.3));return (w*env).astype(np.float32)
 phase=2*np.pi*f*t;w=sum(np.sin(phase*k+.3*j)*amp for j,(k,amp) in enumerate([(1,1), (2.32,.53),(4.25,.31),(6.63,.17),(9.38,.08)]))
 env=(1-np.exp(-t*400))*np.exp(-t*1.8);return (w*env).astype(np.float32)
# D Dorian; 72 bpm, 3/4. Each narrative section has its own harmonic pressure.
for bar in range(36):
 st=bar*2.5
 if st<14:root=[50,57,62]
 elif st<31:root=[50,55,60] if bar%2 else [50,57,62]
 elif st<44:root=[46,53,58] if bar%2 else [45,52,57]
 elif st<62:root=[50,57,66] if bar%2 else [55,62,67]
 elif st<74:root=[50,57,62]
 else:root=[50,57,66] if bar%2 else [50,57,62]
 for j,n in enumerate(root):
  a=note('organ',n,2.35);add(music[:,j%2],a,st,.012 if j==0 else .008);add(music[:,1-j%2],a,st+.011,.006)
 for j,n in enumerate([root[0]+12,root[1]+12,root[2]+12]):
  a=note('harp',n,.78);add(music[:,j%2],a,st+j*5/6,.008);add(music[:,1-j%2],a,st+j*5/6+.015,.006)
 if bar in [0,6,12,18,24,29,34]:
  a=note('glass',root[2]+24,2);add(music[:,0],a,st,.008);add(music[:,1],a,st+.013,.006)
# Simple stereo stone-hall echo, two uneven delayed returns.
for delay,gain in [(.19,.095),(.37,.05),(.61,.027)]:
 shift=int(delay*SR);music[shift:,0]+=music[:-shift,1]*gain;music[shift:,1]+=music[:-shift,0]*gain
mask=np.zeros(N,np.float32)
for c in json.loads((p/'timeline.json').read_text()):mask[int(max(0,c['start']-.2)*SR):int(min(90,c['start']+c['duration']+.25)*SR)]=1
mask=sosfilt(butter(1,4,fs=SR,output='sos'),mask);music*= (1-.8*mask)[:,None]
for a,b in [(43.15,44.35),(75.8,76.8)]:music[(tt>=a)&(tt<b)]*=.025
# Restrained material effects: tempered glass, lead, stone ambience.
for st,gain in [(14,.014),(36,.024),(41,.025),(44,.012),(64,.016),(67,.015),(84,.010)]:
 a=note('glass',74 if st in (36,41) else 86,.9);add(foley,a,st,gain)
 for off in [0,.07,.17]:
  dur=.15;t=np.arange(int(dur*SR))/SR;noise=rng.normal(size=len(t)).astype(np.float32)*np.exp(-t*23)*(1-np.exp(-t*220));add(foley,noise,st+off,gain*.38)
air=sosfilt(butter(2,[85,1100],btype='bandpass',fs=SR,output='sos'),rng.normal(size=N)).astype(np.float32)*.0013
fade=np.minimum(1,tt/.18)*np.minimum(1,(90-tt)/.7)
out=(voice[:,None]+music+foley[:,None]*(1-.55*mask[:,None])+air[:,None])*fade[:,None]
assert np.max(np.abs(out))<.99,float(np.max(np.abs(out)))
sf.write(p/'out/mix.wav',out,SR,subtype='PCM_24');sf.write(p/'out/voice.wav',voice,SR,subtype='PCM_24')
print('Glass / organ / harp score and 90-second Mandarin mix ready; peak',float(np.max(np.abs(out))),flush=True)
