from pathlib import Path
import os,json
os.environ['OMP_NUM_THREADS']='4'
import onnxruntime as ort
from kokoro_onnx import Kokoro
from misaki import zh
import numpy as np,soundfile as sf
p=Path(__file__).parent
root=p.parents[1]
opts=ort.SessionOptions();opts.intra_op_num_threads=4;opts.inter_op_num_threads=1
session=ort.InferenceSession(str(root/'core/tts/kokoro-v1.0.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
k=Kokoro.from_session(session,str(root/'core/tts/voices-v1.0.bin'))
g2p=zh.ZHG2P()
texts=['纸塔游戏提醒我们：忙碌，不等于做好重要的事。','谁来决定，时间该花在哪里？','基督已经救赎我们，使我们成为光明的子女。','所以，要明白主的旨意，爱惜光阴。','靠着圣灵，学习爱神、爱人。','主啊，帮助我，把时间用在你所喜悦的事上。']
lines=[]
for i,text in enumerate(texts):
 ph,_=g2p(text)
 a,sr=k.create(ph,voice='zf_xiaoxiao',speed=.95,is_phonemes=True)
 nz=np.flatnonzero(np.abs(a)>max(np.abs(a))*.015)
 a=a[max(0,nz[0]-720):min(len(a),nz[-1]+2400)]
 sf.write(p/f'voice/{i+1}.wav',a,sr)
 line={'id':str(i+1),'text':text,'duration':len(a)/sr,'phonemes':ph}
 lines.append(line);print(i+1,line['duration'],text,flush=True)
(p/'lines.json').write_text(json.dumps(lines,ensure_ascii=False,indent=2))
