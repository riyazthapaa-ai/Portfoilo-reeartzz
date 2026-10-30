import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro.onnx", "voices.bin")
segs = [
 ("yo","Yo! I'm Mori.",1.15),
 ("guy","the little guy behind MO ARTZ.",1.25),
 ("share","Here for motion design, creative experiments,",1.35),
 ("oops","and a few questionable design decisions.",1.35),
 ("connect","Down to connect with cool people, studios, and clients.",1.4),
 ("move","Let's make some stuff MOVE!",1.3),
]
voice = np.add(k.get_voice_style("am_puck")*0.6, k.get_voice_style("am_liam")*0.4)
gap = 0.09; out=[]; t=0.12; meta=[]
sr=24000; out.append(np.zeros(int(sr*t)))
for key,txt,sp in segs:
    s,sr = k.create(txt, voice=voice, speed=sp, lang="en-us")
    meta.append({"k":key,"t0":round(t,3),"t1":round(t+len(s)/sr,3),"txt":txt})
    out.append(s); t += len(s)/sr + gap; out.append(np.zeros(int(sr*gap)))
a=np.concatenate(out); sf.write("voice.wav",a,sr)
json.dump(meta,open("timing.json","w"),indent=1); print(json.dumps(meta,indent=1), len(a)/sr)
