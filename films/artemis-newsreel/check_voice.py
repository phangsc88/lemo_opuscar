from pathlib import Path
import json,re,difflib
import numpy as np,soundfile as sf,soxr,sherpa_onnx
p=Path(__file__).parent;m=Path('/workspace/.cache/asr/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17')
r=sherpa_onnx.OfflineRecognizer.from_sense_voice(str(m/'model.int8.onnx'),str(m/'tokens.txt'),num_threads=4,language='zh',use_itn=False)
norm=lambda s:re.sub(r'[^\u4e00-\u9fff]','',s)
report=[]
for line in json.loads((p/'lines.json').read_text()):
 a,sr=sf.read(p/f"voice/{line['id']}.wav",dtype='float32');a=soxr.resample(a,sr,16000)
 s=r.create_stream();s.accept_waveform(16000,np.pad(a,(8000,8000)));r.decode_stream(s)
 got=re.sub(r'<\|.*?\|>','',s.result.text);score=difflib.SequenceMatcher(None,norm(line['text']),norm(got)).ratio()
 row={'id':line['id'],'expected':line['text'],'recognized':got,'similarity':score,'pass':score>=.92};report.append(row);print(row,flush=True)
(p/'voice-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(0 if all(a['pass'] for a in report) else 1)
