from pathlib import Path
import subprocess,shutil
p=Path(__file__).parent;out=Path('/workspace/shared/downloads');out.mkdir(parents=True,exist_ok=True)
dst=out/'SoulQuake_EP0_Woodcut_Print_90s_1080p.mp4'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(p/'soulquake-king-woodcut.mp4'),'-vf','scale=in_range=auto:out_range=limited,format=yuv420p','-c:v','libx264','-threads','3','-preset','fast','-crf','27','-tune','grain','-maxrate','2600k','-bufsize','5200k','-profile:v','high','-level:v','4.1','-tag:v','avc1','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy','-t','90','-movflags','+faststart',str(dst)],check=True)
shutil.copy2(p/'soulquake-king.srt',out/'SoulQuake_EP0_Woodcut_Print_90s.srt')
print(dst,dst.stat().st_size,flush=True)
