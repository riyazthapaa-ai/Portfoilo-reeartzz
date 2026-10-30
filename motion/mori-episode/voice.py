import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro.onnx", "voices.bin")
SP = float(sys.argv[1]) if len(sys.argv) > 1 else 1.1
segs = [
 ("yo","Yo! I'm Mori.", 1.0, 0.25),
 ("guy","The little guy behind MO ARTZ.", 1.0, 0.3),
 ("share","Here to share motion design, creative experiments, things I've learned,", 1.05, 0.1),
 ("oops","and probably a few questionable design decisions.", 1.0, 0.3),
 ("connect","Also looking to connect with cool people, studios, and potential clients.", 1.05, 0.22),
 ("move","Let's make some stuff move!", 1.0, 0.0),
]
voice = k.get_voice_style("am_puck")*0.6 + k.get_voice_style("am_liam")*0.4
sr=24000; t=0.6; out=[np.zeros(int(sr*t))]; meta=[]
for key,txt,sp,gap in segs:
    s,sr = k.create(txt, voice=voice, speed=sp*SP, lang="en-us")
    meta.append({"k":key,"t0":round(t,3),"t1":round(t+len(s)/sr,3),"txt":txt})
    out += [s, np.zeros(int(sr*gap))]; t += len(s)/sr + gap
a=np.concatenate(out); sf.write("voice2.wav",a,sr)
json.dump(meta,open("timing2.json","w"),indent=1)
for m in meta: print(m["k"], m["t0"], m["t1"])
print("total", len(a)/sr)
