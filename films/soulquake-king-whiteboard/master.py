from pathlib import Path
import subprocess, json, re

p = Path(__file__).parent
(p / "out").mkdir(exist_ok=True)
assert (p / "out/mix.wav").stat().st_mtime >= max(f.stat().st_mtime for f in (p / "voice").glob("*.wav"))
r = subprocess.run([
    "ffmpeg", "-hide_banner", "-nostats", "-i", str(p / "out/mix.wav"),
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"
], capture_output=True, text=True, check=True)
j = json.loads(re.findall(r"\{[\s\S]*?\}", r.stderr)[-1])
(p / "out/loudnorm.json").write_text(json.dumps(j, indent=2))
num = lambda k: format(float(j[k]), ".5f")
af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={num('input_i')}:measured_TP={num('input_tp')}:measured_LRA={num('input_lra')}:measured_thresh={num('input_thresh')}:offset={num('target_offset')}:linear=true"
af += ",aresample=192000,alimiter=limit=0.7586:attack=10:release=200:level=disabled:latency=1,aresample=48000"
cmd = [
    "ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(p / "out/video.mp4"), "-i", str(p / "out/mix.wav"),
    "-map", "0:v:0", "-map", "1:a:0", "-vf", "scale=in_range=auto:out_range=limited,format=yuv420p", "-af", af,
    "-c:v", "libx264", "-threads", "3", "-preset", "fast", "-crf", "22", "-maxrate", "10000k", "-bufsize", "20000k",
    "-profile:v", "high", "-level:v", "4.1", "-tag:v", "avc1", "-color_range", "tv", "-colorspace", "bt709",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
    "-r", "24", "-t", "90", "-movflags", "+faststart", str(p / "soulquake-king-whiteboard.mp4")
]
with (p / "out/master.log").open("w") as log:
    subprocess.run(cmd, check=True, stdout=log, stderr=subprocess.STDOUT)
print(p / "soulquake-king-whiteboard.mp4", flush=True)
