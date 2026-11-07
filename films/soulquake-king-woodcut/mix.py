from pathlib import Path
import json,sys,numpy as np,soundfile as sf,soxr
from scipy.signal import butter,sosfilt

p=Path(__file__).parent;(p/'out').mkdir(exist_ok=True);root=p.parents[1]
sys.path.insert(0,str(root/'core/audio'))
import sampler as S

SR=48000;N=90*SR;t=np.arange(N)/SR;rng=np.random.default_rng(119)
voice=np.zeros(N,np.float32);music=np.zeros((N,2),np.float32);foley=np.zeros((N,2),np.float32)
cues=json.loads((p/'timeline.json').read_text())
def add(buf,a,st,vol=1,pan=0):
 i=int(st*SR)
 if i<0 or i>=N:return
 a=np.asarray(a);n=min(len(a),N-i)
 if buf.ndim==1:buf[i:i+n]+=a[:n]*vol
 else:
  buf[i:i+n,0]+=a[:n]*vol*np.sqrt((1-pan)/2);buf[i:i+n,1]+=a[:n]*vol*np.sqrt((1+pan)/2)
for q in cues:
 a,sr=sf.read(p/f"voice/{q['id']}.wav");a=soxr.resample(a,sr,SR);a=np.tanh(a*1.5);a*=.10/(np.sqrt(np.mean(a*a))+1e-10);a=.55*np.tanh(a/.55);add(voice,a,q['start'])

score=p/'assets/woodcut-score.flac'
if score.exists():
 music,sr=sf.read(score,dtype='float32');assert sr==SR and len(music)==N
else:
 S.seed(119)
 # New 72 BPM / 3-4 D-Dorian cue. Low sustained relief-print mass plus sparse carved attacks.
 for bar in range(36):
  st=bar*2.5
  if st<31: chord=[[50,57,62],[48,55,60],[46,53,58]][bar%3]
  elif st<44: chord=[[45,52,57],[46,53,58]][bar%2]
  elif st<62: chord=[[50,57,66],[55,62,67],[57,64,69]][bar%3]
  elif st<74: chord=[[50,57,62],[53,60,65]][bar%2]
  else: chord=[[50,57,66],[50,57,62]][bar%2]
  for j,note in enumerate(chord):
   a=S.note('cellos',note,2.35,vel=.34,attack=.28);a*=.012/(np.sqrt(np.mean(a*a))+1e-10);add(music,a,st,.72,(-.35+j*.35))
  for beat in range(3):
   note=chord[(beat+bar)%3]-12;a=S.note('contrabass_pizz',note,.48,vel=.42);a*=.011/(np.sqrt(np.mean(a*a))+1e-10);add(music,a,st+beat*5/6,.62,(-.45 if beat%2==0 else .4))
 sf.write(score,music,SR,subtype='PCM_24')

mask=np.zeros(N,np.float32)
for q in cues:mask[int(max(0,q['start']-.22)*SR):int(min(90,q['start']+q['duration']+.28)*SR)]=1
mask=sosfilt(butter(1,4,fs=SR,output='sos'),mask);music*=(1-.84*mask)[:,None]
for a,b in [(43.25,44.25),(75.7,76.8)]:music[(t>=a)&(t<b)]*=.018

def wood(st,g=.04,pitch=115,pan=0):
 tt=np.arange(int(.32*SR))/SR;n=rng.normal(size=len(tt));fib=sosfilt(butter(2,[420,3600],btype='bandpass',fs=SR,output='sos'),n);a=(np.sin(2*np.pi*pitch*tt)*.65+fib*.24)*(1-np.exp(-tt*310))*np.exp(-tt*22);add(foley,a,st,g,pan)
def knife(st,d=.7,g=.018,pan=-.4):
 tt=np.arange(int(d*SR))/SR;n=rng.normal(size=len(tt));a=sosfilt(butter(2,[750,6200],btype='bandpass',fs=SR,output='sos'),n)*(np.sin(np.pi*np.minimum(1,tt/d))**.55)*g;add(foley,a,st,1,pan)
def metal(st,g=.014):
 tt=np.arange(int(2.4*SR))/SR;a=np.zeros_like(tt)
 for f,v,dec in [(311,1,2.0),(722,.52,2.7),(1322,.25,3.3),(2062,.12,4.1)]:a+=np.sin(2*np.pi*f*tt+.2*f)*v*np.exp(-tt*dec)
 a*=(1-np.exp(-tt*440))*g;add(foley,a,st,1,.25)

knife(.25,1.4,.02,-.5);wood(3.2,.034,88,-.25);wood(14,.042,105,.35)
wood(31,.05,77,-.3);wood(37.1,.043,81,.3);wood(41.2,.058,62,0)
knife(44,.9,.019,.45);wood(44.15,.06,74,-.3);metal(45.1,.012)
# Brayer tack, paper air, baren rasp and wet peel for the native transition.
for st in np.arange(62,63.2,.18):wood(float(st),.008,160,float(np.sin(st*3)*.55))
tt=np.arange(int(3*SR))/SR;paper=sosfilt(butter(2,[180,3300],btype='bandpass',fs=SR,output='sos'),rng.normal(size=len(tt)))*np.sin(np.pi*tt/3)**.8*.009;add(foley,paper,62,1,.1)
metal(65,.013);wood(74,.032,92,-.25);wood(86,.048,68,0);wood(89.45,.055,58,0)
air=sosfilt(butter(2,[80,900],btype='bandpass',fs=SR,output='sos'),rng.normal(size=N)).astype(np.float32)*.0012
foley*=(1-.7*mask)[:,None]
fade=np.minimum(1,t/.16)*np.minimum(1,(90-t)/.7)
out=(voice[:,None]+music+foley+air[:,None])*fade[:,None]
peak=float(np.max(np.abs(out)));print('mix peak',peak,flush=True);assert peak<.99
sf.write(p/'out/mix.wav',out,SR,subtype='PCM_24');sf.write(p/'out/voice.wav',voice,SR,subtype='PCM_24')
(p/'SAMPLE-CREDITS.txt').write_text('\n'.join(S.credits(['cellos','contrabass_pizz']))+'\n')
print('Woodcut score, material foley and 90-second Mandarin mix ready.',flush=True)
