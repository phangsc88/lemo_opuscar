from pathlib import Path
import shutil
p=Path(__file__).parent
out=Path('/workspace/shared/downloads')
out.mkdir(parents=True,exist_ok=True)
name='SoulQuake_EP0_Chalkboard_V2_90s_1080p'
shutil.copy2(p/'soulquake-king-chalkboard.mp4',out/(name+'.mp4'))
shutil.copy2(p/'soulquake-king.srt',out/(name+'.srt'))
print(out/(name+'.mp4'))
