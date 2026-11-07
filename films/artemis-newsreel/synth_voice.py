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
texts=['特别快讯！这座神庙，位列古代七大奇观！','宏伟的神庙，吸引地中海各地的朝圣者。','公元前三百五十六年，神庙遭火焚毁。','当地人重建神庙，规模更胜从前！','十九世纪，考古学家重新发现神庙遗迹。','今天，遗迹尚存，历史的故事仍在继续！']
lines=[]
for i,text in enumerate(texts):
 ph,_=g2p(text)
 a,sr=k.create(ph,voice='zm_yunxi',speed=1.08,is_phonemes=True)
 nz=np.flatnonzero(np.abs(a)>max(np.abs(a))*.015)
 a=a[max(0,nz[0]-720):min(len(a),nz[-1]+2400)]
 sf.write(p/f'voice/{i+1}.wav',a,sr)
 line={'id':str(i+1),'text':text,'duration':len(a)/sr,'phonemes':ph}
 lines.append(line);print(i+1,line['duration'],text,flush=True)
(p/'lines.json').write_text(json.dumps(lines,ensure_ascii=False,indent=2))
