import numpy as np, soundfile as sf
SR=48000; D=10.0; n=int(SR*D); r=np.random.default_rng(3)
v,vsr=sf.read("tts/voice.wav")
v=np.interp(np.arange(int(len(v)*SR/vsr))/SR, np.arange(len(v))/vsr, v)
mix=np.zeros(n); mix[:len(v)]+=v*0.95
def add(sig,t,g=1.0):
    i=int(t*SR); j=min(n,i+len(sig)); mix[i:j]+=sig[:j-i]*g
def env(N,a=0.003,d=0.1):
    t=np.arange(N)/SR; return np.minimum(t/a,1)*np.exp(-t/d)
def pop(f0=900,f1=300,dur=0.09):
    N=int(SR*dur); t=np.arange(N)/SR; f=np.geomspace(f0,f1,N); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(N,0.002,dur/3)
def whoosh(dur=0.3):
    N=int(SR*dur); x=r.normal(0,1,N); 
    from numpy.fft import rfft,irfft
    X=rfft(x); fr=np.fft.rfftfreq(N,1/SR); X*=np.exp(-((fr-1800)/1500)**2); x=irfft(X,N)
    w=np.sin(np.pi*np.arange(N)/N)**2; return x/np.abs(x).max()*w
def boing(dur=0.45):
    N=int(SR*dur); t=np.arange(N)/SR; f=220+180*np.sin(2*np.pi*14*t)*np.exp(-t*5)+t*200
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(N,0.003,0.18)
def thud(dur=0.35):
    N=int(SR*dur); t=np.arange(N)/SR; f=np.geomspace(140,45,N)
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*env(N,0.002,0.12) + r.normal(0,1,N)*env(N,0.001,0.02)*0.4)
def kick(): return thud(0.25)*0.9
def hat():
    N=int(SR*0.05); x=r.normal(0,1,N); x=np.diff(np.concatenate([[0],x])); return x*env(N,0.001,0.012)*0.5
def snare():
    N=int(SR*0.18); return r.normal(0,1,N)*env(N,0.001,0.05)*0.5 + pop(260,180,0.18)*0.3
# lo-fi beat 100bpm, ducked under voice
beat=np.zeros(n); bpm=100; sp=60/bpm
def addb(sig,t,g):
    i=int(t*SR); j=min(n,i+len(sig)); beat[i:j]+=sig[:j-i]*g
k=0; t=0.0
while t<D:
    if k%4 in (0,): addb(kick(),t,0.8)
    if k%4==2: addb(snare(),t,0.6)
    addb(hat(),t,0.35); addb(hat(),t+sp/2,0.22)
    t+=sp; k+=1
# bass blips (pentatonic quirk)
notes=[55,55,65.4,73.4,55,82.4,73.4,65.4]
for i in range(int(D/sp)):
    N=int(SR*sp*0.8); tt=np.arange(N)/SR; f=notes[i%8]
    addb(np.tanh(2*np.sin(2*np.pi*f*tt))*env(N,0.005,0.25)*0.25, i*sp, 1)
vv=np.abs(mix); duck=np.convolve(vv,np.ones(4800)/4800,'same'); duck=1-0.55*np.clip(duck/0.05,0,1)
mix+=beat*duck*0.35
# sfx
for t in [0.12,0.6,1.3,3.0,3.8,3.95,5.15,5.6,6.5,6.9,7.45,7.95,8.55,8.85,9.7]: add(pop(r.uniform(700,1100),r.uniform(250,350)),t,0.35)
for t in [0.25,2.05,4.95,6.6,8.7]: add(whoosh(0.3),t,0.18)
add(thud(),2.15,0.55); add(boing(),5.3,0.25); add(boing(0.5),8.85,0.3)
add(thud(0.5),9.25,0.7); add(whoosh(0.5),9.15,0.25)
for t in [6.9,7.45,7.95]: add(pop(1500,900,0.05),t+0.2,0.25)  # finger-gun pew
fade=np.ones(n); fade[-int(SR*0.25):]=np.linspace(1,0,int(SR*0.25)); mix*=fade
mix/=max(1,np.abs(mix).max()/0.95)
sf.write("mix.wav",mix,SR)
