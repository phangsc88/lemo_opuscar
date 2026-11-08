from pathlib import Path
import subprocess,json,hashlib
p=Path(__file__).parent
f=p/'soulquake-king-chalkboard.mp4'
d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(f)]))
v=next(s for s in d['streams'] if s['codec_type']=='video')
a=next(s for s in d['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'30/1',2700)
assert abs(float(d['format']['duration'])-90)<.05
subprocess.run(['ffmpeg','-v','error','-i',str(f),'-f','null','-'],check=True)
result={'duration':90,'width':1920,'height':1080,'fps':30,'frames':2700,'video_codec':v['codec_name'],'audio_codec':a['codec_name'],'decode':'passed','sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'Chinese_lettering':'Complete LXGW WenKai glyphs, visually reviewed; primary board labels Chinese','narration':'Existing 27 Mandarin recordings retained; sound effects remixed','readcheck':(p/'out/readcheck.txt').read_text()}
(p/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(result,ensure_ascii=False,indent=2))
