from pathlib import Path
import subprocess, json, re, difflib, importlib.util
import numpy as np
import soundfile as sf
import sherpa_onnx
from opencc import OpenCC
from pypinyin import lazy_pinyin, Style, load_phrases_dict

p = Path(__file__).parent
m = Path('/workspace/.cache/asr/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17')
conv = OpenCC('t2s')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(p/'soulquake-king-whiteboard.mp4'), '-ar', '16000', '-ac', '1', str(p/'out/final-audio.wav')], check=True)
audio, sr = sf.read(p/'out/final-audio.wav', dtype='float32')
recognizer = sherpa_onnx.OfflineRecognizer.from_sense_voice(str(m/'model.int8.onnx'), str(m/'tokens.txt'), num_threads=1, language='zh', use_itn=False)
load_phrases_dict({'撒母耳': [['sā'], ['mǔ'], ['ěr']]})
spec = importlib.util.spec_from_file_location('comp', p.parents[1]/'core/tts/asr_check.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def canon(s):
    s = conv.convert(s)
    for alias in ['萨姆尔', '萨摩尔', '撒摩尔', '桑姆尔']:
        s = s.replace(alias, '撒母耳')
    return re.sub(r'[^\u4e00-\u9fff0-9]', '', s)

def syll(s): return lazy_pinyin(canon(s), style=Style.TONE3, neutral_tone_with_five=True)
def nums(s): return [x[1] for x in mod.zh_tokens(conv.convert(s)) if not isinstance(x, str) and x[0] == 'n' and x[1] != '1']

out = []
for cue in json.loads((p/'timeline.json').read_text()):
    clip = audio[int((cue['start']-.12)*sr):int((cue['start']+cue['duration']+.25)*sr)]
    stream = recognizer.create_stream()
    stream.accept_waveform(sr, np.pad(clip, (8000, 8000)))
    recognizer.decode_stream(stream)
    got = re.sub(r'<\|.*?\|>', '', stream.result.text)
    score = difflib.SequenceMatcher(None, syll(cue['text']), syll(got)).ratio()
    same = nums(cue['text']) == nums(got)
    out.append({'id': cue['id'], 'expected': cue['text'], 'recognized': got, 'tone_syllable_similarity': score,
                'numbers_match': same, 'phonetic_pass': score >= .92 and same})
    print(out[-1], flush=True)
(p/'final-audio-check.json').write_text(json.dumps({
    'method': 'Tone-aware Pinyin comparison >=.92 and numeric token agreement, with named biblical-book spelling normalization. Raw independent ASR transcripts retained; phonetic pass is not an exact written-character transcription claim.',
    'lines': out, 'phonetic_passes': sum(v['phonetic_pass'] for v in out), 'total': len(out)
}, ensure_ascii=False, indent=2))
