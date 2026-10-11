// ---------- shared kit: author everything in absolute VO seconds ----------
const VO0=__VO0__, VOW=__VOW__;
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
function at(w,after=0){const n=norm(w);for(const [t,x] of VOW){if(t>=after-.005&&norm(x).startsWith(n))return t}console.warn('no word',w,after);return after}
const CUES=[];const cue=(t,type)=>CUES.push([t-VO0,type]);
const S=[];const FN={};
let STRESS=()=>0,FADE=()=>0;
function addCSS(c){const s=document.createElement('style');s.textContent=c;document.head.appendChild(s)}
function scene(id,a,b,html,fn){const d=document.createElement('div');d.className='scene';d.id=id;d.innerHTML=html;$('stage').insertBefore(d,$('grain'));
  d.querySelectorAll('[data-k]').forEach(e=>build(e,e.dataset.k));S.push({id,a:a-VO0,b:b-VO0});FN[id]=fn;return d}
// stacked headline slots: HL(top,[[id,text,fontSize,css]...])
const HL=(top,rows)=>`<div class="abs center" style="top:${top}px">${rows.map(([id,t,fs,css])=>`<div class="line abs" id="${id}" data-k="${t.replace(/"/g,'&quot;')}" style="font-size:${fs||72}px;${css||''}"></div>`).join('')}</div>`;
function enter(el,T,t0,o={}){const {y=60,x=0,s=.7,dur=.55,r=0,out=1e9,outDur=.35}=o;const k=back(p(T,t0,dur)),op=clamp(p(T,t0,.2))*(1-eio(p(T,out,outDur)));
  el.style.opacity=op.toFixed(3);el.style.transform=`translate(${((1-k)*x).toFixed(1)}px,${((1-k)*y).toFixed(1)}px) rotate(${((1-k)*r).toFixed(2)}deg) scale(${lerp(s,1,k).toFixed(3)})`;return k}
ICON.spark='<path d="M12 3l2 5.5 5.5 2-5.5 2L12 18l-2-5.5-5.5-2 5.5-2z"/>';
ICON.lib='<path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-1 2.5 15.5-3.5 1z"/>';
ICON.user='<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>';
ICON.check='<path d="M5 12.5l4.5 4.5L19 7.5"/>';
ICON.upload='<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>';
ICON.edit='<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>';
ICON.eye='<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
ICON.comment='<path d="M4 5h16v11H9l-5 4z"/>';
ICON.save='<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>';
ICON.plus='<path d="M12 5v14M5 12h14"/>';
ICON.send='<path d="M4 12l16-8-6 16-3-6z"/>';
ICON.copy='<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>';
ICON.down='<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>';
ICON.flag='<path d="M5 21V4h11l-2 4 2 4H5"/>';
ICON.arrow='<path d="M5 12h14M13 6l6 6-6 6"/>';
ICON.bell='<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>';
ICON.play='<path d="M8 5l11 7-11 7z"/>';
ICON.zero='<ellipse cx="12" cy="12" rx="6" ry="8"/>';
const RES=[
 ['Sponsorship briefs','12 files','doc','#ff6b6b'],
 ['Brand guidelines','6 files','spark','#a493ff'],
 ['Past & current scripts','48 files','film','#5fd8ff'],
 ['Product notes','19 files','note','#ffc857'],
 ['Campaign requirements','9 files','target','#6ee7b7'],
 ['Content calendar','Oct–Dec','cal','#7c9cff'],
 ['Performance reports','Q1–Q3','chart','#ff8a7a'],
];
const ic=(r)=>`<div class="ic" style="background:${r[3]}2b;border:1px solid ${r[3]}55;display:grid;place-items:center">${svg(r[2],'stroke:'+r[3])}</div>`;
const icx=(k,c)=>ic(['','',k,c]);
// prompt bubble whose words light up exactly when spoken
function promptBubble(el,text,startVO,cls={}){
  const words=text.split(' ');let idx=VOW.findIndex(([t])=>t>=startVO-.01);let prev=startVO;
  const times=words.map(d=>{const n=norm(d);let f=-1;for(let k=idx;k<Math.min(VOW.length,idx+5);k++){const m=norm(VOW[k][1]);if(m&&n&&(m.startsWith(n)||n.startsWith(m))){f=k;break}}
    if(f>=0){prev=VOW[f][0];idx=f+1}else prev+=.18;return prev});
  el.innerHTML='';const spans=words.map((w,i)=>{const s=document.createElement('span');s.className='pw '+(cls[i]||'');s.textContent=w;el.appendChild(s);if(i%2==0)cue(times[i]+.02,'key');return s});
  return {times,end:times[times.length-1],update(T){spans.forEach((s,i)=>{const x=eo(p(T,times[i]-.04,.28));s.style.opacity=(.08+.92*x).toFixed(3);s.style.transform=`translateY(${((1-x)*14).toFixed(1)}px)`;s.style.filter=blur((1-x)*4)})}};
}
function orb(parent,label){const w=document.createElement('div');w.innerHTML=`<div class="pulse"></div><div class="pulse"></div><div class="orb"><svg class="i" viewBox="0 0 24 24">${ICON.spark}</svg></div>${label?`<div class="orblbl">${label}</div>`:''}`;parent.appendChild(w);const [p1,p2,o,lb]=w.children;
  return {update(T,t0,x,y,sc=1,out=1e9){const k=back(p(T,t0,.6)),fo=1-eio(p(T,out,.35));o.style.left=x+'px';o.style.top=y+'px';o.style.opacity=clamp(k*2)*fo;o.style.transform=`scale(${(lerp(.3,1,k)*sc*(1+.03*Math.sin(T*4))).toFixed(3)})`;
    if(lb){lb.style.left=x+'px';lb.style.top=(y+95*sc)+'px';lb.style.opacity=eo(p(T,t0+.3,.4))*fo}
    [[p1,0],[p2,.9]].forEach(([e,off])=>{const r=T>t0+.3?((T-t0-.3+off)%1.8)/1.8:0;e.style.left=x+'px';e.style.top=y+'px';e.style.opacity=T>t0+.3?(1-r)*.7*clamp(k)*fo:0;e.style.transform=`scale(${sc*(1+r*1.3)})`})}};}
const NS='http://www.w3.org/2000/svg';
function mkline(svgEl,color='#8f7dff',w=3){const l=document.createElementNS(NS,'line');l.setAttribute('stroke',color);l.setAttribute('stroke-width',w);l.setAttribute('stroke-linecap','round');svgEl.appendChild(l);return l}
function mkdot(svgEl){const c=document.createElementNS(NS,'circle');c.setAttribute('r','6');c.setAttribute('fill','#c9f4ff');svgEl.appendChild(c);return c}
function link(l,d,T,t0,x1,y1,x2,y2,ph=0,fo=1){const k=eio(p(T,t0,.45));l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',lerp(x1,x2,k));l.setAttribute('y2',lerp(y1,y2,k));l.style.opacity=k*.55*fo;
  if(d){const u=T>t0+.45?((T*1.1+ph)%1):0;d.setAttribute('cx',lerp(x1,x2,u));d.setAttribute('cy',lerp(y1,y2,u));d.style.opacity=T>t0+.45?Math.sin(Math.PI*u)*fo:0}}
const winBar=(title='Agent')=>`<div class="bar"><svg class="i" viewBox="0 0 24 24" style="stroke:#a493ff;fill:rgba(164,147,255,.25)">${ICON.spark}</svg><span style="font-size:22px;font-weight:700">Work<span class="acc">Buddy</span></span><span style="margin-left:14px;font-family:Inter;font-size:19px;color:rgba(255,255,255,.45)">${title}</span></div>`;
