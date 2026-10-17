import numpy as np, wave, sys
SR=48000; D=33.6; out=np.zeros(int(SR*D))
rng=np.random.default_rng(7)
def add(sig,t,g):
    i=int(t*SR); n=min(len(sig),len(out)-i); out[i:i+n]+=sig[:n]*g
def lp(x,a):  # one-pole lowpass, a in (0,1)
    y=np.empty_like(x); acc=0.
    for k in range(len(x)): acc+=a*(x[k]-acc); y[k]=acc
    return y
def whoosh(d=.45):
    n=int(SR*d); x=rng.standard_normal(n); tt=np.linspace(0,1,n)
    # sweep cutoff up then down
    env=np.sin(np.pi*tt)**2; a=.02+.25*np.sin(np.pi*tt)
    y=np.empty(n); acc=0.
    for k in range(n): acc+=a[k]*(x[k]-acc); y[k]=acc
    return y*env/ (np.abs(y).max()+1e-9)
def pop():
    n=int(SR*.09); tt=np.arange(n)/SR; f=np.linspace(1500,700,n)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*55)
def impact():
    n=int(SR*.9); tt=np.arange(n)/SR; f=np.linspace(95,42,n)
    sub=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*5)
    nz=lp(rng.standard_normal(n),.08)*np.exp(-tt*18)*3
    s=sub+nz; return s/np.abs(s).max()
def swipe():
    n=int(SR*.22); x=rng.standard_normal(n); x=x-lp(x,.3); tt=np.linspace(0,1,n)
    return x*np.sin(np.pi*tt)**1.5/np.abs(x).max()
def chime():
    n=int(SR*1.2); tt=np.arange(n)/SR
    s=np.sin(2*np.pi*1318.5*tt)*np.exp(-tt*4)+0.7*np.sin(2*np.pi*1760*np.clip(tt-.09,0,None))*np.exp(-np.clip(tt-.09,0,None)*4)*(tt>.09)
    return s/np.abs(s).max()
W=whoosh(); 
for t in [3.15,7.12,12.88,15.30,21.02,30.12,5.12]: add(W,t,.32)
for t in [.54,1.50,2.38,16.86,17.42,17.98,18.70,22.38,23.66,24.62,25.82,27.66,29.34]: add(pop(),t-.02,.16)
add(impact(),8.50,.45); add(impact(),9.22,.38); add(impact(),31.78,.42)
add(swipe(),14.98,.30); add(chime(),20.55,.16)
for i in range(16): add(pop()[:int(SR*.02)],19.45+i*.07,.05)  # progress ticks
out=np.clip(out,-1,1)
st=(np.stack([out,out],1)*32767).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close()
