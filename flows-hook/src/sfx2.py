import numpy as np, wave
SR=44100; END=38.4; N=int(SR*END)
out=np.zeros(N); rng=np.random.default_rng(3)
def add(sig,t,g=1.0):
    i=int(t*SR); j=min(N,i+len(sig))
    if 0<=i<N: out[i:j]+=sig[:j-i]*g
def lp(x,a):
    y=np.empty_like(x); s=0.0
    for k in range(len(x)):
        s+=(a[k] if hasattr(a,'__len__') else a)*(x[k]-s); y[k]=s
    return y
def whoosh(d=0.8):
    n=int(SR*d); tt=np.linspace(0,1,n); y=lp(rng.standard_normal(n),0.01+0.12*np.sin(np.pi*tt)**2)
    return y*np.sin(np.pi*tt)**2/np.abs(y).max()
def chime(f=880,d=2.5):
    tt=np.arange(int(SR*d))/SR
    s=sum(np.sin(2*np.pi*f*m*tt)*np.exp(-tt*(2+m))*a for m,a in [(1,1),(2.01,0.4),(3.0,0.2),(4.2,0.1)])
    return s/np.abs(s).max()
def shutter():
    n=int(SR*0.12); tt=np.arange(n)/SR; x=rng.standard_normal(n)
    return (x*np.exp(-tt*80)+0.6*x*np.exp(-(tt-0.06).clip(0)*90)*(tt>0.06))*0.7
def click(f=1800):
    tt=np.arange(int(SR*0.06))/SR; return np.sin(2*np.pi*f*tt)*np.exp(-tt*70)
def hit(d=3.0):
    tt=np.arange(int(SR*d))/SR; f=55+40*np.exp(-tt*10)
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*1.6)
    return s+0.4*chime(440,d)*0.6
def swell(d):
    n=int(SR*d); tt=np.linspace(0,1,n); y=lp(rng.standard_normal(n),0.005+0.08*tt**2)*tt**2.5
    return y/np.abs(y).max()
# warm drone pad (A minor-ish), slow fades, dips during the "loop" for tension
tt=np.arange(N)/SR
pad=np.zeros(N)
for f,a in [(110,1),(164.81,0.6),(220,0.5),(261.63,0.35),(329.63,0.25)]:
    pad+=a*np.sin(2*np.pi*f*tt+np.sin(2*np.pi*0.1*tt)*2)
pad*=np.clip(tt/3,0,1)*np.clip((END-tt)/1.5,0,1)
pad=pad/np.abs(pad).max()*0.10
out+=pad
for c in [3.0,8.44,11.6,16.1,20.6,25.4,28.0]: add(whoosh(),c-0.35,0.25)
add(chime(880),2.28,0.22); add(chime(1320),2.4,0.1)
for s in [7.72,8.44,8.74,9.04,14.32]: add(shutter(),s,0.35)
for k in range(12): add(click(2400),17.06+k*0.07 if k<6 else 17.7+(k-6)*0.08,0.08)
for k in range(6): add(click(1500+k*120),22.04+k*0.9,0.15)
for i in range(7): add(click(1200+i*150),31.6+i*0.12+0.5,0.18)
add(chime(660,2),33.16,0.12)
add(swell(37.08-34.8),34.8,0.22)
add(hit(),37.08,0.5)
out=out/np.abs(out).max()*0.9
w=wave.open('sfx2.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('ok')
