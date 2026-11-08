"""fonts/wenkai-sub.woff2: LXGW WenKai (OFL) cut down to the characters in timeline.json
plus printable ASCII. The chalk writing on the board is our own stroke data and needs no font.
usage: python styles/chalkboard/demo/tools/subset.py"""
import os, json
from fontTools import subset
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
timeline = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
block = ''.join(q['text'] + q['en'] for q in timeline)
chars = {c for c in block if not c.isspace()} | set('王罪应许基督永恒的’‘“”…·→←×—') | {chr(c) for c in range(0x20, 0x7f)}
opt = subset.Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']
font = subset.load_font(os.path.join(HERE, 'fonts/LXGWWenKai-Regular.ttf'), opt)
s = subset.Subsetter(opt); s.populate(text=''.join(sorted(chars))); s.subset(font)
cmap = font.getBestCmap(); miss = sorted(c for c in chars if ord(c) not in cmap and c != ' ')
if miss: raise SystemExit('subset.py: the font has no glyph for ' + ''.join(miss))
subset.save_font(font, os.path.join(HERE, 'fonts/wenkai-sub.woff2'), opt)
print(f'wenkai-sub.woff2: {len(chars)} characters')
