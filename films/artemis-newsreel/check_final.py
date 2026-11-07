from pathlib import Path
import json,subprocess,re,difflib
import sherpa_onnx,numpy as np,soundfile as sf
p=Path(__file__).parent;m=Path('/workspace/.cache/asr/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17')
subprocess.run(['ffmpeg','-v','error','-y','-i',str(p/'artemis-newsreel.mp4'),'-ar','16000','-ac','1',str(p/'out/final-audio.wav')],check=True)
a,sr=sf.read(p/'out/final-audio.wav',dtype='float32')
r=sherpa_onnx.OfflineRecognizer.from_sense_voice(str(m/'model.int8.onnx'),str(m/'tokens.txt'),num_threads=4,language='zh',use_itn=False)
report=[]
for row,st in zip(json.loads((p/'lines.json').read_text()),[2.6,7.35,11.05,14.8,19.0,24.05]):
 b=a[int((st-.2)*sr):int((st+row['duration']+.3)*sr)];s=r.create_stream();s.accept_waveform(sr,np.pad(b,(8000,8000)));r.decode_stream(s)
 got=re.sub(r'<\|.*?\|>','',s.result.text);norm=lambda v:re.sub(r'[^\u4e00-\u9fff]','',v);score=difflib.SequenceMatcher(None,norm(row['text']),norm(got)).ratio()
 report.append({'id':row['id'],'expected':row['text'],'recognized':got,'similarity':score,'pass':score>=.92});print(report[-1],flush=True)
(p/'final-audio-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(0 if all(row['pass'] for row in report) else 1)
