import numpy as np, wave
SR=44100; END=63.6; N=int(SR*END)
out=np.zeros(N)
rng=np.random.default_rng(7)
def add(sig,t,g=1.0):
    i=int(t*SR); j=min(N,i+len(sig)); 
    if i<N: out[i:j]+=sig[:j-i]*g
def lp(x,a):  # one-pole lowpass, a in (0,1)
    y=np.empty_like(x); s=0.0
    for k in range(len(x)): s+= a[k]*(x[k]-s) if hasattr(a,'__len__') else a*(x[k]-s); y[k]=s
    return y
def whoosh(d=0.45):
    n=int(SR*d); x=rng.standard_normal(n); tt=np.linspace(0,1,n)
    a=0.02+0.35*np.sin(np.pi*tt)**2
    y=lp(x,a); env=np.sin(np.pi*tt)**1.5
    return y*env/np.abs(y).max()
def boom(d=0.7):
    n=int(SR*d); tt=np.arange(n)/SR
    f=50+90*np.exp(-tt*18); ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-tt*5.5)
    click=rng.standard_normal(n)*np.exp(-tt*120)*0.5
    return s+click
def tick(f=2200,d=0.05):
    n=int(SR*d); tt=np.arange(n)/SR
    return np.sin(2*np.pi*f*tt)*np.exp(-tt*90)
def riser(d):
    n=int(SR*d); tt=np.linspace(0,1,n); x=rng.standard_normal(n)
    y=lp(x,0.01+0.5*tt**2)*tt**2
    tone=np.sin(2*np.pi*np.cumsum(200+900*tt**2)/SR)*tt**3*0.3
    return (y/np.abs(y).max()+tone)
def shimmer(d=2.5):
    n=int(SR*d); tt=np.arange(n)/SR; s=np.zeros(n)
    for k,f in enumerate([523.25,659.25,783.99,1046.5,1318.5]):
        s+=np.sin(2*np.pi*f*tt+k)*np.exp(-tt*(1.2+k*0.3))*(0.5+0.5*np.sin(2*np.pi*(3+k)*tt))
    return s/np.abs(s).max()
CUTS=[2.2,4.24,10.24,14.0,20.84,31.1,36.6,43.4,50.1,61.2]
IMPACTS=[0.7,2.8,5.84,9.52,13.3,35.34,41.6,48.92]
for c in CUTS: add(whoosh(),c-0.22,0.22)
for i in IMPACTS: add(boom(),i,0.38)
add(riser(24.75-22.6),22.6,0.18)
add(boom(1.2),25.83,0.55); add(shimmer(3.0),25.83,0.16)
add(boom(1.0),62.8,0.5); add(whoosh(0.6),62.95,0.3)
# ticks: variation cards, checklist, tiles
for tt in [15.76,16.52,17.68,19.08,32.14,33.06]: add(tick(1800),tt,0.18)
for tt in [53.47,55.51,56.99,59.43,60.75]: add(tick(2600),tt,0.2)
for k in range(90): add(tick(3000+k*15,0.03),45.4+k*0.016,0.05)
for k in range(0,int((0.66-0.2)*20)): add(tick(1500,0.03),0.2+k*0.05,0.08)
print("raw peak",np.abs(out).max()); out=out/np.abs(out).max()*0.9
w=wave.open('sfx.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
print('peak',np.abs(out).max())
