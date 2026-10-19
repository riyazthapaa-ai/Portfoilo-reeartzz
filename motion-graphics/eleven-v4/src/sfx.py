import numpy as np, wave, sys
SR=48000; DUR=171.5
rng=np.random.default_rng(7)
L=np.zeros(int(SR*DUR)); Rr=np.zeros_like(L)
def t_(d): return np.arange(int(SR*d))/SR
def lp(x,a):  # one-pole lowpass, a in (0,1)
    y=np.empty_like(x); s=0.
    for i,v in enumerate(x): s+=a*(v-s); y[i]=s
    return y
def bp_sweep(x,f0,f1):
    # time-varying state-variable bandpass
    n=len(x); f=np.geomspace(f0,f1,n); q=0.7
    low=band=0.; y=np.empty(n)
    for i in range(n):
        F=2*np.sin(np.pi*f[i]/SR); high=x[i]-low-q*band; band+=F*high; low+=F*band; y[i]=band
    return y
def add(sig,at,gain=1.,pan=0.):
    i=int(at*SR); n=min(len(sig),len(L)-i)
    L[i:i+n]+=sig[:n]*gain*np.sqrt((1-pan)/2)*1.414; Rr[i:i+n]+=sig[:n]*gain*np.sqrt((1+pan)/2)*1.414
def whoosh(d=.7,f0=300,f1=4000,rev=False):
    t=t_(d); x=rng.standard_normal(len(t)); y=bp_sweep(x,f0,f1)
    env=np.sin(np.pi*np.clip(t/d,0,1))**2 if not rev else (t/d)**3*np.exp(-0*t)
    y*=env; return y/np.max(np.abs(y))
def impact(d=1.6):
    t=t_(d); f=45+80*np.exp(-t*18); ph=2*np.pi*np.cumsum(f)/SR
    sub=np.sin(ph)*np.exp(-t*2.8)
    nz=lp(rng.standard_normal(len(t)),.15)*np.exp(-t*22)
    y=sub+0.6*nz; y=np.tanh(y*1.6); return y/np.max(np.abs(y))
def pop(f=900):
    d=.12; t=t_(d); fr=f*np.exp(-t*25)+250; y=np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-t*40)*(1-np.exp(-t*2000)); return y/np.max(np.abs(y))
def click():
    d=.04; t=t_(d); y=rng.standard_normal(len(t))*np.exp(-t*300)+np.sin(2*np.pi*2400*t)*np.exp(-t*180); return y/np.max(np.abs(y))
def ding(f=1318.5,d=1.6):
    t=t_(d); y=sum(a*np.sin(2*np.pi*f*m*t)*np.exp(-t*k) for m,a,k in [(1,1,3),(2.01,.45,5),(2.76,.25,7),(5.4,.12,10)])
    y*=(1-np.exp(-t*800)); return y/np.max(np.abs(y))
def riser(d=1.8):
    t=t_(d); x=rng.standard_normal(len(t)); y=bp_sweep(x,200,6000)*(t/d)**2
    tone=np.sin(2*np.pi*np.cumsum(np.geomspace(200,900,len(t)))/SR)*(t/d)**2*.3
    y=y/np.max(np.abs(y))+tone; return y/np.max(np.abs(y))
def shimmer(d=1.4):
    t=t_(d); y=np.zeros_like(t)
    for k,f in enumerate([1568,1976,2349,2637,3136]):
        st=k*0.07; m=t>=st; tt=t[m]-st; y[m]+=np.sin(2*np.pi*f*tt)*np.exp(-tt*4)*(1-np.exp(-tt*500))
    return y/np.max(np.abs(y))
W=whoosh
# ---------- HOOK (0 – 17.1) ----------
add(riser(1.4),0.0,.18)
add(W(.6,400,5000),0.3,.20,-.3)
add(W(.5,600,6000),1.55,.14,.3)
add(impact(),2.0,.55)
add(W(.7,300,3000),3.55,.22,.2)
add(ding(1318.5),4.55,.20)
for t0,f in [(6.54,820),(8.14,900),(11.06,980)]: add(pop(f),t0,.30)
for k in range(10): add(click(),8.9+k*.12,.07)
for k in range(10): add(click(),11.3+k*.1,.07)
add(W(.6,500,5000),12.6,.18,-.3)
for t0 in [13.15,14.85,15.85]: add(click(),t0,.30); add(pop(1200),t0,.15)
add(W(.8,3000,250,),16.75,.28)   # transition out of hook
# ---------- OUTRO (161.3 – end) ----------
add(W(.6,400,5000),161.05,.22)
add(pop(800),162.84,.30); add(shimmer(),162.9,.12)
add(W(.7,300,4000),164.2,.20,.3)
add(pop(1000),164.52,.22)
add(W(.5,600,6000),165.8,.15,-.2)
add(click(),166.3,.45); add(pop(1400),166.3,.2)
add(ding(1760,2.0),166.55,.18); add(ding(2217,2.0),166.65,.12)
add(shimmer(1.6),168.6,.12)
add(impact(2.2),170.1,.30); add(W(1.0,4000,300),170.0,.15)
m=np.max(np.abs(np.stack([L,Rr]))); print('peak',m)
st=np.clip(np.stack([L,Rr],1),-1,1)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
