from pathlib import Path
import json,numpy as np,soundfile as sf,soxr
from scipy.signal import butter,sosfilt
p=Path(__file__).parent;(p/'out').mkdir(exist_ok=True);SR=48000;N=30*SR;t=np.arange(N)/SR;rng=np.random.default_rng(1928)
voice=np.zeros(N);subs=[];starts=[2.6,7.35,11.05,14.8,19.0,24.05]
lines=json.loads((p/'lines.json').read_text())
for row,st in zip(lines,starts):
 a,sr=sf.read(p/f"voice/{row['id']}.wav");a=soxr.resample(a,sr,SR)
 # Optical-track character, retaining clear narration.
 a=sosfilt(butter(2,[260,3700],fs=SR,btype='bandpass',output='sos'),a);a=np.tanh(a*2)
 a*=.10/(np.sqrt(np.mean(a*a))+1e-9)
 i=int(st*SR);voice[i:i+len(a)]+=a
 for delay,amp in [(.031,.12),(.067,.06)]:
  j=i+int(delay*SR);n=min(len(a),N-j);voice[j:j+n]+=a[:n]*amp
 subs.append({'t0':st-.22,'t1':min(29.8,st+len(a)/SR+.7),'text':row['text']})
for i in range(len(subs)-1):
 subs[i]['t1']=min(subs[i]['t1'],subs[i+1]['t0']-.05)
# 200BPM original hot-band-like orchestration, 25 bars = 30sec.
beat=.3;band=np.zeros(N);foley=np.zeros(N)
def add(buf,a,st,g=1):
 i=int(st*SR)
 if i<0 or i>=N:return
 n=min(len(a),N-i);buf[i:i+n]+=a[:n]*g

def tone(note,dur,typ):
 tt=np.arange(int(dur*SR))/SR;f=440*2**((note-69)/12)
 if typ=='tuba':a=sum(np.sin(2*np.pi*f*k*tt)/k**1.9 for k in range(1,7));env=(1-np.exp(-tt*70))*np.exp(-tt*11);gain=.025
 elif typ=='brass':a=sum(np.sin(2*np.pi*f*k*tt)/k**1.25 for k in range(1,9));env=(1-np.exp(-tt*110))*np.exp(-tt*8);gain=.018
 else:a=sum(np.sin(2*np.pi*f*k*tt)*np.exp(-tt*(10+7*k))/k for k in range(1,7));env=(1-np.exp(-tt*700));gain=.018
 return a*env*gain
for b in range(100):
 st=b*beat;root=[48,53,55,48][(b//4)%4]
 if b%2==0:add(band,tone(root-12,.32,'tuba'),st)
 for n in [root+12,root+16,root+19]:add(band,tone(n,.25,'banjo'),st, .8 if b%2 else .6)
 if b%4 in [0,2]:
  for n in [root+12,root+16,root+19]:add(band,tone(n,.23,'brass'),st+(.15 if b%4==2 else 0),.65)
 if b%2:
  tt=np.arange(int(.12*SR))/SR;noise=rng.normal(size=len(tt));noise=sosfilt(butter(1,2200,fs=SR,btype='highpass',output='sos'),noise);add(band,noise*np.exp(-tt*45)*.013,st)
 # Cheerful muted upper-register melody, few notes per bar.
 if b%4 in [0,1,3]:
  n=[72,76,79,77,76,74,72,67][(b//2)%8];add(band,tone(n,.28,'brass'),st,.55)
# Intro brass fanfare and closing da-DA.
for st,ns in [(0,[48,60,64,67]),(.6,[53,65,69,72]),(1.2,[55,67,71,74]),(1.8,[48,60,64,72]),(28.5,[55,67,71]),(29.1,[48,60,64,67,72])]:
 for n in ns:add(band,tone(n,.65,'brass'),st,1.1)
# Two editorial stops leave only the projector and announcer.
quiet=np.ones(N)
for a,b in [(10.65,11.05),(23.65,24.05),(26.95,28.5)]:quiet[(t>=a)&(t<b)]=0
mask=np.zeros(N)
for s in subs:mask[int(max(0,s['t0']-.1)*SR):int(s['t1']*SR)]=1
mask=sosfilt(butter(1,5,fs=SR,output='sos'),mask)
band=sosfilt(butter(2,[95,7500],btype='bandpass',fs=SR,output='sos'),band)*quiet*(1-.68*mask)
# Foley tied to actual transitions, deterministic projector claw bed.
for st in [2.4,7.2,10.8,14.4,18,22.8,27.6]:
 tt=np.arange(int(.18*SR))/SR;add(foley,rng.normal(size=len(tt))*np.exp(-tt*30)*.018,st)
proj=.0012*np.sin(2*np.pi*95*t)+rng.normal(size=N)*.0004
for st in np.arange(0,30,1/24):
 tt=np.arange(int(.006*SR))/SR;add(proj,rng.normal(size=len(tt))*.003*np.exp(-tt*500),st)
fade=np.minimum(1,t/.025)*np.minimum(1,(30-t)/.25)
mix=(voice+band+foley+proj)*fade
assert np.max(np.abs(mix))<.99
sf.write(p/'out/mix.wav',np.stack([mix,np.roll(band,400)*.08+mix],axis=1),SR,subtype='PCM_24')
(p/'subtitles.json').write_text(json.dumps(subs,ensure_ascii=False,indent=2))
def tc(v):
 m=round(v*1000);return f'{m//3600000:02}:{m//60000%60:02}:{m//1000%60:02},{m%1000:03}'
(p/'artemis-newsreel.srt').write_text('\n\n'.join(f"{i+1}\n{tc(s['t0'])} --> {tc(s['t1'])}\n{s['text']}" for i,s in enumerate(subs))+'\n')
print('30s mix prepared',subs)
