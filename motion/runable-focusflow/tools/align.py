import sys,json,re
from pocketsphinx import Decoder
import numpy as np
a=np.fromfile('vo.raw',dtype=np.int16)
name,s,e=sys.argv[1],float(sys.argv[2]),float(sys.argv[3])
text=open(name+'.txt').read()
words=[re.sub(r"[^a-z']","",w.lower()) for w in text.split()]
words=[w for w in words if w]
seg=a[int(s*16000):int(e*16000)]
d=Decoder(samprate=16000,bestpath=False,beam=1e-100,wbeam=1e-80,pbeam=1e-100)
for w,p in [('runable','R AH N AH B AH L'),('focusflow','F OW K AH S F L OW')]:
    try:d.add_word(w,p,True)
    except Exception as ex:print('addword',w,ex)
for w in set(words):
    if d.lookup_word(w) is None: print('MISSING',w)
d.set_align_text(' '.join(words))
d.start_utt(); d.process_raw(seg.tobytes(),full_utt=True); d.end_utt()
al=list(d.seg())
out=[]
for wd in al:
    if wd.word in('<s>','</s>','<sil>'):continue
    out.append([wd.word,round(s+wd.start_frame/100,2),round(s+wd.end_frame/100,2)])
json.dump(out,open(name+'.json','w'))
print(' '.join(f"{w}@{t}" for w,t,_ in out))
