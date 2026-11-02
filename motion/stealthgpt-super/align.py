import re,json,sys
txt=open('script.txt').read()
sil=[]
s=None
for l in open('raw.txt'):
    k,v=l.strip().split(': ')
    if k=='silence_start': s=float(v)
    else: sil.append((s,float(v)))
sil=[x for x in sil if x[1]-x[0]>0.2]
# sentences
paras=[p for p in txt.split('\n') if p.strip()]
sents=[];pidx=[]
for i,p in enumerate(paras):
    for s_ in re.split(r'(?<=[.?!])\s+',p.strip()):
        sents.append(s_);pidx.append(i)
def syl(w):
    w=re.sub(r'[^a-z0-9]','',w.lower()); 
    if w.isdigit(): return 3
    return max(1,len(re.findall(r'[aeiouy]+',w)))
# weight words by syllables
words=[];cands=set()
for si,s_ in enumerate(sents):
    for w in s_.split():
        words.append(syl(w)+0.6)
        if re.search(r'[,:;]$',w): cands.add(len(words))
    cands.add(len(words))
cum=[0]
for w in words: cum.append(cum[-1]+w)
T0,T1=0.25,346.0
speech=T1-T0-sum(b-a for a,b in sil if a>1)
rate=cum[-1]/(T1-T0)
# DP: silences in order matched to cand boundaries (strictly increasing); sentence-end cand favored
cl=sorted(cands); send=set()
c=0
for s_ in sents: c+=len(s_.split()); send.add(c)
import math
N=len(sil);M=len(cl)
INF=1e18
# expected time of boundary b given anchor previous (local rate): use global estimate with cost on deviation of segment rate
dp=[[INF]*M for _ in range(N)];bk=[[None]*M for _ in range(N)]
def tpos(b): return T0+cum[b]/rate
for i in range(N):
    t=(sil[i][0]+sil[i][1])/2
    for j in range(M):
        b=cl[j]
        dev=abs(tpos(b)-t)
        if dev>25: continue
        pen=0 if b in send else 0.8
        if i==0:
            dp[i][j]=dev*0.3+pen;continue
        best=INF;bj=None
        tp=(sil[i-1][0]+sil[i-1][1])/2
        for k in range(j):
            if dp[i-1][k]>=INF: continue
            seg=cum[b]-cum[cl[k]]; dt=t-tp - (sil[i][1]-sil[i][0])/2-(sil[i-1][1]-sil[i-1][0])/2
            r=seg/max(dt,0.1)
            cost=dp[i-1][k]+abs(math.log(r/ (rate*1.08)))*6+pen
            # skipped sentence ends penalty (pauses usually at sentence ends)
            skipped=sum(1 for q in cl[k+1:j] if q in send)
            cost+=skipped*1.0
            if cost<best: best=cost;bj=k
        dp[i][j]=best+dev*0.05;bk[i][j]=bj
j=min(range(M),key=lambda j:dp[N-1][j]);
assign=[None]*N
for i in range(N-1,-1,-1):
    assign[i]=cl[j]; j=bk[i][j]
anch=[(0,T0)]+[(b,sil[i][0]) for i,b in enumerate(assign)]+[(len(words),T1)]
# end anchors use silence start; starts use silence end
startA=[(0,T0)]+[(b,sil[i][1]) for i,b in enumerate(assign)]
def interp(b,A):
    for (b0,t0),(b1,t1) in zip(A,A[1:]):
        if b0<=b<=b1 and b1>b0: return t0+(t1-t0)*(cum[b]-cum[b0])/(cum[b1]-cum[b0])
    return A[-1][1]
A=sorted(set(anch));SA=sorted(set(startA+[(len(words),T1)]))
amap={b:sil[i] for i,b in enumerate(assign)}
res=[];c=0
for si,s_ in enumerate(sents):
    b0=c;c+=len(s_.split())
    st=amap[b0][1] if b0 in amap else interp(b0,SA)
    en=amap[c][0] if c in amap else interp(c,A)
    res.append({"i":si,"p":pidx[si],"s":round(st,2),"e":round(en,2),"t":s_})
    print(f"{st:7.2f} {en:7.2f} {'*' if c in amap else ' '} {s_[:80]}")
json.dump(res,open('timing.json','w'),indent=0)
