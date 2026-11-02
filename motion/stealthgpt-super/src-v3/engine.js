(function(){
const TOTAL=348.6;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const eOut=p=>1-Math.pow(1-p,3);
const eOut5=p=>1-Math.pow(1-p,5);
const eIn=p=>p*p*p;
const eInOut=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const lerp=(a,b,p)=>a+(b-a)*p;
const spring=(x,k=7,w=13)=>x<=0?0:1-Math.exp(-k*x)*Math.cos(w*x);
function hash(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
const $=id=>document.getElementById(id);

const BG={
 white:`radial-gradient(800px 600px at 18% 22%,rgba(255,170,225,.38),transparent 70%),radial-gradient(900px 700px at 85% 80%,rgba(120,170,255,.38),transparent 70%),radial-gradient(600px 500px at 70% 15%,rgba(255,214,120,.25),transparent 70%),#f8f8fc`,
 grad:`radial-gradient(900px 700px at 12% 100%,rgba(255,255,255,.9),transparent 60%),radial-gradient(800px 600px at 100% 0%,rgba(255,140,240,.8),transparent 60%),linear-gradient(115deg,#167bff 0%,#7d8cff 48%,#f07cff 100%)`,
 dark:`radial-gradient(700px 520px at 28% 30%,rgba(139,92,255,.38),transparent 70%),radial-gradient(700px 520px at 76% 74%,rgba(255,79,163,.28),transparent 70%),#060609`,
 blue:`radial-gradient(1100px 700px at 50% -10%,#5c95ff,transparent 70%),radial-gradient(800px 600px at 90% 110%,#0d3fd0,transparent 70%),#1662f6`,
 gold:`radial-gradient(700px 600px at 50% 62%,rgba(255,170,20,.75),rgba(255,120,0,.25) 45%,transparent 70%),#050302`,
 rays:`#fafafe`
};
const TR={none:[0,0],whip:[.17,.2],whipv:[.17,.2],zoom:[.2,.26],flip:[.22,.24],burst:[.26,.34],dots:[.45,.42]};

const SC=window.SCENES, host=$('layers');
SC.forEach((s,i)=>{
  const L=document.createElement('div');L.className='layer';
  const bg=document.createElement('div');bg.className='bg';bg.style.background=BG[s.bg];L.appendChild(bg);
  if(s.bg==='gold'||s.bg==='rays'){const r=document.createElement('div');r.className='bg rays';
    r.style.cssText='position:absolute;left:-1000px;top:-1500px;width:3920px;height:3920px;'+(s.bg==='gold'
      ?'background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,190,40,.55) 0deg 5deg,transparent 5deg 15deg);-webkit-mask:radial-gradient(circle at 50% 50%,#000 0,#000 18%,transparent 45%)'
      :'background:conic-gradient(from 0deg at 50% 50%,#2b6bff 0 9deg,transparent 9deg 34deg,#ff8a00 34deg 44deg,transparent 44deg 70deg,#b44dff 70deg 76deg,transparent 76deg 105deg,#ffd000 105deg 116deg,transparent 116deg 150deg,#ff3d9a 150deg 158deg,transparent 158deg 190deg,#1fc8ff 190deg 200deg,transparent 200deg 232deg,#ff5a00 232deg 244deg,transparent 244deg 275deg,#6a3dff 275deg 284deg,transparent 284deg 318deg,#ff2d7a 318deg 326deg,transparent 326deg);-webkit-mask:radial-gradient(circle at 50% 50%,transparent 0,transparent 7%,#000 14%,#000 40%,transparent 60%);opacity:.95');
    r.style.top=(s.bg==='gold'?-1500+120:-1500)+'px';L.appendChild(r);s.rays=r}
  const rig=document.createElement('div');rig.className='rig '+s.tone;rig.innerHTML=s.html;L.appendChild(rig);
  host.appendChild(L);s.L=L;s.bgEl=bg;s.rig=rig;
  s.anims=[...rig.querySelectorAll('[data-in]')].map(el=>({el,t:+el.dataset.in,k:el.dataset.a,o:el.dataset.out!==undefined?+el.dataset.out:null,last:''}));
  // pull very first elements slightly ahead so the incoming shot is never empty during its transition
  if(i>0)s.anims.forEach(a=>{if(a.t<s.s+1.2&&a.k!=='let')a.t=s.s-0.15+Math.max(0,a.t-s.s)*0.5});
  s.floats=[...rig.querySelectorAll('.c3e,.em')].filter(e=>!e.id&&!e.closest('.pillw,.ic')).map((el,j)=>({el,c3:el.classList.contains('c3e'),ph:hash(i*31+j)*6}));
  s.tys=[...rig.querySelectorAll('.ty')].map(el=>({el,t:+el.dataset.ty,c:+el.dataset.cps,full:el.textContent,last:-1}));
  s.L.style.display='none';
});
function offIn(el,root){let x=0,y=0;while(el&&el!==root){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent}return{x,y}}

// motion blur filters (x and y)
const svgNS='http://www.w3.org/2000/svg';const defs=document.querySelector('svg');
function mkF(id){const f=document.createElementNS(svgNS,'filter');f.setAttribute('id',id);f.setAttribute('x','-30%');f.setAttribute('y','-30%');f.setAttribute('width','160%');f.setAttribute('height','160%');const g=document.createElementNS(svgNS,'feGaussianBlur');g.setAttribute('stdDeviation','0 0');f.appendChild(g);defs.appendChild(f);return g}
const FX=mkF('mx'),FY=mkF('my');

function animEl(a,t){
  const x=(t-a.t)*1.4;let op=1,tr='',f=0,clip='';
  if(x<0){op=0}
  else switch(a.k){
    case 'up':{const e=eOut5(clamp(x/.6));op=e;tr=`translateY(${(1-e)*70}px)`;f=(1-e)*12;break}
    case 'left':{const e=spring(x,8,12);op=clamp(x/.25);tr=`translateX(${(1-e)*-160}px)`;break}
    case 'pop':{const e=spring(x,6,15);op=clamp(x/.12);tr=`scale(${e}) rotate(${(1-e)*-30}deg)`;break}
    case 'spring':{const e=spring(x,6.5,14);op=clamp(x/.15);tr=`translateY(${(1-e)*90}px) scale(${0.6+0.4*e})`;break}
    case 'flip':{const e=spring(x,6,11);op=clamp(x/.15);tr=`translateY(${(1-e)*220}px) rotateX(${(1-e)*-75}deg) translateZ(${(1-e)*-200}px)`;f=clamp(1-x/.25)*8;break}
    case 'fly':{const e=spring(x,5.5,10);op=clamp(x/.2);tr=`translateZ(${(1-e)*-1600}px) rotateY(${(1-e)*50}deg) rotateZ(${(1-e)*-40}deg)`;f=clamp(1-x/.35)*14;break}
    case 'slam':{const p=clamp(x/.32);const e=eIn(p);const b=x>.32?spring(x-.32,9,22)*0+1-Math.exp(-9*(x-.32))*Math.sin(22*(x-.32))*0.06:0;op=clamp(x/.12);tr=`scale(${x<.32?lerp(2.8,1,e):1+b*0+ (x>.32?Math.exp(-9*(x-.32))*Math.sin(22*(x-.32))*0.06:0)})`;f=(1-p)*16;break}
    case 'stamp':{const p=clamp(x/.28);op=clamp(x/.1);tr=`scale(${x<.28?lerp(2.6,1,eIn(p)):1+Math.exp(-10*(x-.28))*Math.sin(25*(x-.28))*0.08})`;break}
    case 'let':{const e=eOut5(clamp(x/.45));op=e;tr=`translateY(${(1-e)*50}px) scale(${1.4-0.4*e})`;f=(1-e)*10;break}
    case 'whoosh':{const e=eOut5(clamp(x/.6));op=clamp(x/.15);tr=`translateX(${(1-e)*-900}px) skewX(${(1-e)*-25}deg)`;f=(1-e)*18;break}
    case 'wipe':{const e=eOut(clamp(x/.45));clip=`inset(-30px ${(1-e)*100}% -30px -30px)`;break}
    case 'grow':{tr=`scaleX(${eInOut(clamp(x/.45))})`;break}
    case 'fade':op=eOut(clamp(x/.5));break;
  }
  if(a.o!==null&&t>a.o){const q=eOut(clamp((t-a.o)/.4));op*=1-q;tr+=` scale(${1-0.1*q})`;f+=q*10}
  const st=op.toFixed(3)+tr+f.toFixed(1)+clip;if(st===a.last)return;a.last=st;
  const s=a.el.style;s.opacity=op.toFixed(3);s.transform=tr;s.filter=f>.3?`blur(${f.toFixed(1)}px)`:'none';
  if(a.k==='wipe')s.clipPath=clip;s.visibility=op<=.001?'hidden':'visible';
}

let pos=null;
const R=el=>el.closest('.rig');
function P(key){if(pos[key])return pos[key];let v;
  if(key==='btn'){const b=$('runbtn'),o=offIn(b,R(b));v={x:o.x+b.offsetWidth*.5,y:o.y+b.offsetHeight*.5};if(!b.offsetWidth)return v}
  if(key==='doc'){const sbx=$('scanbox'),d=R(sbx).querySelectorAll('.ui')[0],od=offIn(d,R(sbx));v={x:od.x,y:od.y,w:d.offsetWidth,h:d.offsetHeight};if(!d.offsetWidth)return v}
  if(key==='sub'){const sb=$('subbtn'),os=offIn(sb,R(sb));v={x:os.x+sb.offsetWidth*.55,y:os.y+sb.offsetHeight*.55};if(!sb.offsetWidth)return v}
  pos[key]=v;return v}

function custom(t){
  const g=$('glitch');if(g&&t>4.9&&t<6.6){const k=clamp((6.0-t)/1.0);const j=(hash(Math.floor(t*30))-.5)*36*k;g.style.textShadow=k>0?`${j}px 0 #ff2d7a,${-j}px 0 #1fc8ff`:'none'}
  // 30-min tiles bounce handled by anims. toggle
  if(t>91&&t<98){const p=eInOut(clamp((t-93.2)/.35));const tg=$('tog1');tg.style.background=p>.5?'#34d97f':'#d4d6e2';tg.firstChild.style.transform=`translateX(${p*110}px)`}
  if(t>137&&t<157){const c=$('cursor');const p=eInOut(clamp((t-153.7)/1.1));const sx=P('btn').x+480,sy=P('btn').y+300;
    c.style.opacity=clamp((t-153.5)*4);const press=t>155.0&&t<155.22;c.style.transform=`translate(${lerp(sx,P('btn').x,p)-30}px,${lerp(sy,P('btn').y,p)-10}px) rotate(-20deg) scale(${press?.85:1})`;
    $('runbtn').style.transform=`scale(${press?.92:1})`;const r=clamp((t-155.1)/.45);$('runbar').style.width=(eInOut(r)*100)+'%';$('runpct').textContent=Math.round(eInOut(r)*100)+'%'}
  if(t>158&&t<168){const sb=$('scanbox');const d=P('doc');const R=[[d.y+d.h*.2,d.h*.16],[d.y+d.h*.36,d.h*.26],[d.y+d.h*.6,d.h*.16],[d.y+d.h*.74,d.h*.2]],T=[160,161.3,162.6,163.8];let k=0;for(let q=0;q<4;q++)if(t>=T[q])k=q;
    const pr=Math.max(0,k-1),p=spring(t-T[k],8,12);const top=k?lerp(R[pr][0],R[k][0],p):R[0][0],h=k?lerp(R[pr][1],R[k][1],p):R[0][1];
    sb.style.left=(d.x-10)+'px';sb.style.width=(d.w+20)+'px';sb.style.top=top+'px';sb.style.height=h+'px';sb.style.transform='rotate(3deg)';sb.style.opacity=(clamp((t-160)*4)*(1-clamp((t-166.2)*4))).toFixed(2)}
  if(t>190&&t<213){const L=$('laser');const on=t>210.4&&t<212.3;L.style.opacity=on?1:0;if(on)L.style.top=(110+Math.abs(Math.sin((t-210.4)*2.8))*330)+'px';
    $('scanst').textContent=t>212.1?'Scan complete':t>210.4?'Scanning'+'.'.repeat(1+Math.floor(t*4)%3):t>194.5?'Processed text submitted':'Ready';$('recdot').style.opacity=Math.floor(t*2)%2?1:.25}
  if(t>212&&t<232)$('ring').setAttribute('stroke-dashoffset',(943*(1-eInOut(clamp((t-212.9)/1.4)))).toFixed(1));
  if(t>230&&t<246){$('play').style.transform=`scale(${1+.07*Math.sin(t*5)})`;$('demobar').style.width=(clamp((t-232)/13)*100)+'%'}
  if(t>328&&t<336)$('arr').style.transform=`translateY(${Math.abs(Math.sin(t*5))*12}px)`;
  if(t>334&&t<345){const c=$('cursor2');const p=eInOut(clamp((t-336.8)/1.0));const sx=P('sub').x+420,sy=P('sub').y+260;c.style.opacity=clamp((t-336.6)*4);
    const press=t>337.75&&t<337.95;c.style.transform=`translate(${lerp(sx,P('sub').x,p)-30}px,${lerp(sy,P('sub').y,p)-10}px) rotate(-20deg) scale(${press?.85:1})`;
    const sb=$('subbtn');const done=t>337.85;sb.style.background=done?'#2a2a35':'#ff2d2d';sb.style.boxShadow=done?'0 12px 0 #111,0 30px 60px rgba(0,0,0,.25)':'0 12px 0 #a50e0e,0 30px 60px rgba(255,45,45,.35)';sb.textContent=done?'SUBSCRIBED ✓':'SUBSCRIBE';sb.style.transform=`scale(${press?.92:1})`;
    const bl=$('bell');const w=t>338.3&&t<340?Math.sin((t-338.3)*28)*22*(1-(t-338.3)/1.7):0;bl.style.transform=`rotate(${w}deg)`;bl.style.transformOrigin='50% 10%'}
}

// overlay canvas: streaks, dots ring, burst
const cv=$('fx'),cx=cv.getContext('2d');
const RAINBOW=['#ff3d9a','#ffb31a','#2b6bff','#b44dff','#1fc8ff','#34d97f'];
function streaks(p,seed,dir){ // colorful swooshes crossing screen
  cx.save();cx.filter='blur(5px)';cx.lineCap='round';
  for(let k=0;k<3;k++){const h=hash(seed*10+k);const y=200+h*680;const len=500+h*400;const x=lerp(-700,2600,clamp(p*1.3-k*.12));
    const gr=cx.createLinearGradient(x-len,0,x,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,RAINBOW[(seed+k)%6]);gr.addColorStop(1,RAINBOW[(seed+k+2)%6]);
    cx.strokeStyle=gr;cx.lineWidth=22-k*5;cx.beginPath();
    if(dir==='v'){cx.translate(960,540);cx.rotate(Math.PI/2);cx.translate(-960,-540)}
    cx.moveTo(x-len,y+20);cx.quadraticCurveTo(x-len/2,y-30,x,y);cx.stroke();cx.setTransform(1,0,0,1,0,0)}
  cx.restore();
}
function burst(p,col){ // p 0..1: beams + disc expand
  const R=Math.hypot(960,540)*1.1;
  cx.save();cx.translate(960,540);
  const a=clamp(1-Math.abs(p-.45)/.55);
  for(let k=0;k<12;k++){const ang=k*Math.PI*2/12+p*1.2;cx.rotate(0);cx.fillStyle=RAINBOW[k%6];cx.globalAlpha=a*.9;
    cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,R*1.2*eOut(clamp(p*1.6)),ang,ang+0.16);cx.closePath();cx.fill()}
  cx.globalAlpha=1;const r=p<.5?R*eIn(p/.5):R;const al=p<.5?1:1-eOut((p-.5)/.5);
  const gr=cx.createRadialGradient(0,0,0,0,0,Math.max(1,r));gr.addColorStop(0,`rgba(255,255,255,${al})`);gr.addColorStop(.75,`rgba(${col},${al*.9})`);gr.addColorStop(1,`rgba(255,255,255,0)`);
  cx.fillStyle=gr;cx.beginPath();cx.arc(0,0,Math.max(1,r),0,7);cx.fill();cx.restore();
}
function dotsRing(p){ // p 0..1
  const cols=['#ff3d9a','#ff5a1f','#34d97f','#1fc8ff','#ff2d55','#ffb31a'];
  const rad=lerp(210,40,eInOut(clamp(p/.85)));const rot=p*7;cx.save();cx.translate(960,540);cx.filter='blur(3px)';
  cols.forEach((c,k)=>{const an=rot+k*Math.PI/3;const x=Math.cos(an)*rad,y=Math.sin(an)*rad;cx.shadowColor=c;cx.shadowBlur=40;cx.fillStyle=c;cx.beginPath();cx.ellipse(x,y,22,30,an,0,7);cx.fill()});
  cx.restore();
}

function buildBeats(s){
  const top=s.anims.filter(a=>!a.el.parentElement.closest('[data-in]')&&a.t<s.e-0.3);
  const ev=[];top.forEach(a=>{const o=offIn(a.el,s.rig);const w=a.el.offsetWidth,h=a.el.offsetHeight;if(!w)return;ev.push({t:Math.max(a.t,s.s),cx:o.x+w/2,cy:o.y+h/2,small:w<260&&h<260})});
  ev.sort((a,b)=>a.t-b.t);const B=[{t:s.s,dx:0,dy:0,dz:0,rx:0,ry:0,rz:0}];let k=0;
  const push=(t,cx,cy,filler)=>{const last=B[B.length-1];if(t-last.t<0.55)return;k++;const sg=k%2?1:-1;
    if(filler)B.push({t,dx:last.dx*.3,dy:last.dy*.3,dz:-30+(k%3)*30,rx:((k%3)-1)*3,ry:-sg*5,rz:sg*1.6});
    else B.push({t,dx:clamp(-(cx-960)*.24,-230,230),dy:clamp(-(cy-540)*.24,-140,140),dz:k%2?95:40,rx:((k%3)-1)*4,ry:sg*7,rz:-sg*2.4})};
  ev.forEach(e=>{let last=B[B.length-1].t;while(e.t-last>1.9){last+=1.35;push(last,0,0,true)}push(e.t,e.cx,e.cy,e.small)});
  let last=B[B.length-1].t;while(s.e-last>1.9){last+=1.35;push(last,0,0,true)}
  s.beats=B;
}
function beatOff(s,t){const B=s.beats;let j=0;while(j<B.length-1&&t>=B[j+1].t)j++;const c=B[j],p=j?B[j-1]:c;const e=j?spring(t-c.t,9,16):1;
  const o={};['dx','dy','dz','rx','ry','rz'].forEach(k=>o[k]=lerp(p[k],c[k],e));return o}
function setCam(s,t){
  if(!s.beats)buildBeats(s);const bo=beatOff(s,t);
  const p=eInOut(clamp((t-s.s)/Math.max(1,s.e-s.s)));const a=s.cam.a,b=s.cam.b;
  const settle=Math.exp(-4*Math.max(0,t-s.s));
  const rx=lerp(a.rx,b.rx,p)+bo.rx,ry=lerp(a.ry,b.ry,p)+bo.ry,rz=lerp(a.rz,b.rz,p)+bo.rz,z=lerp(a.z,b.z,p)-settle*160+bo.dz,x=lerp(a.x,b.x,p)+bo.dx,y=lerp(a.y,b.y,p)+bo.dy;
  return `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
}

window.renderAt=function(t){
  if(!pos)pos={};
  cx.clearRect(0,0,1920,1080);
  let i=0;while(i<SC.length-1&&t>=SC[i+1].s)i++;
  // determine active transition (into i, or into i+1)
  let tr=null;
  const nx=SC[i+1];
  if(nx){const d=TR[nx.tr];if(t>nx.s-d[0])tr={from:i,to:i+1,type:nx.tr,p:(t-(nx.s-d[0]))/(d[0]+d[1])}}
  if(!tr&&i>0){const d=TR[SC[i].tr];if(t<SC[i].s+d[1])tr={from:i-1,to:i,type:SC[i].tr,p:(t-(SC[i].s-d[0]))/(d[0]+d[1])}}
  const vis=new Set(tr?[tr.from,tr.to]:[i]);
  SC.forEach((s,k)=>{const on=vis.has(k);if(s._on!==on){s.L.style.display=on?'block':'none';s._on=on}});
  // reset layer styles
  vis.forEach(k=>{const L=SC[k].L.style;L.transform='none';L.opacity=1;L.filter='none';L.zIndex=1;L.clipPath='none'});
  FX.setAttribute('stdDeviation','0 0');FY.setAttribute('stdDeviation','0 0');
  if(tr){const p=clamp(tr.p),A=SC[tr.from].L.style,B=SC[tr.to].L.style;B.zIndex=2;const sw=Math.sin(Math.PI*p);
    switch(tr.type){
      case 'whip':{const e=eInOut(p);A.transform=`translateX(${-e*1920}px) skewX(${sw*-6}deg)`;B.transform=`translateX(${(1-e)*1920}px) skewX(${sw*-6}deg)`;FX.setAttribute('stdDeviation',`${(sw*70).toFixed(1)} 0`);A.filter=B.filter='url(#mx)';streaks(p,tr.to,'h');break}
      case 'whipv':{const e=eInOut(p);A.transform=`translateY(${-e*1080}px)`;B.transform=`translateY(${(1-e)*1080}px)`;FY.setAttribute('stdDeviation',`0 ${(sw*60).toFixed(1)}`);A.filter=B.filter='url(#my)';streaks(p,tr.to,'v');break}
      case 'zoom':{const e=eInOut(p);A.transform=`scale(${1+e*1.8}) rotate(${e*8}deg)`;A.filter=`blur(${(e*24).toFixed(1)}px)`;A.opacity=1-clamp((p-.35)/.4);B.transform=`scale(${lerp(.55,1,eOut(clamp((p-.25)/.75)))}) rotate(${(1-eOut(clamp((p-.25)/.75)))*-8}deg)`;B.opacity=clamp((p-.25)/.35);const bb=(1-clamp((p-.25)/.75))*18;B.filter=bb>.3?`blur(${bb.toFixed(1)}px)`:'none';streaks(p,tr.to,'h');break}
      case 'flip':{if(p<.5){const e=eIn(p/.5);A.transform=`rotateY(${-e*90}deg) scale(${1-e*.2})`;B.opacity=0}else{const e=eOut((p-.5)/.5);A.opacity=0;B.transform=`rotateY(${(1-e)*90}deg) scale(${.8+.2*e})`}break}
      case 'burst':{if(p<.5){B.opacity=0;A.transform=`scale(${1+eIn(p/.5)*.15})`}else{A.opacity=0;B.transform=`scale(${lerp(1.15,1,eOut((p-.5)/.5))})`}burst(p,'255,214,120');break}
      case 'dots':{if(p<.35){const e=eIn(p/.35);A.transform=`scale(${1-e*.85}) rotate(${e*40}deg)`;A.filter=`blur(${(e*20).toFixed(1)}px)`;A.opacity=1-e;B.opacity=0}else if(p<.78){A.opacity=0;B.opacity=0}else{A.opacity=0;B.opacity=1;B.transform=`scale(${lerp(.85,1,eOut((p-.78)/.22))})`}
        cx.fillStyle=`rgba(5,5,8,${clamp(p<.35?p/.35:(p<.9?1:1-(p-.9)/.1))})`;cx.fillRect(0,0,1920,1080);if(p>.2&&p<.85)dotsRing((p-.2)/.65);if(p>.74)burst(.5+(p-.74)/.26*.5,'255,255,255');break}
    }}
  // per-visible layer content
  vis.forEach(k=>{const s=SC[k];s.rig.style.transform=setCam(s,t);s.bgEl.style.transform=`translate(${Math.sin(t*.2+k)*60}px,${Math.cos(t*.17+k)*40}px) scale(1.05)`;
    if(s.rays)s.rays.style.transform=`rotate(${t*(s.bg==='gold'?6:10)}deg)`;
    s.anims.forEach(a=>animEl(a,t));
    s.floats.forEach(f=>{const y=Math.sin(t*2.6+f.ph)*12,r=Math.sin(t*1.9+f.ph)*7;f.el.style.transform=f.c3?`translateY(calc(-50% + ${y.toFixed(1)}px)) rotate(${(-10+r).toFixed(1)}deg)`:`translateY(${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg)`});
    s.tys.forEach(y=>{const n=t<y.t?0:Math.min(y.full.length,Math.floor((t-y.t)*y.c));const bl=Math.floor(t*2.2)%2===0||n<y.full.length;const key=n*2+(bl?1:0);if(key===y.last)return;y.last=key;
      y.el.innerHTML=y.full.slice(0,n)+`<span style="display:inline-block;width:4px;height:1em;background:#2b6bff;vertical-align:-.12em;margin-left:4px;opacity:${bl?1:0}"></span>`});
  });
  custom(t);custom(t);
  // opening flash + final fade
  let fl=0;if(t<.5)fl=1-eOut(t/.5);$('flash').style.opacity=fl.toFixed(3);
  const fo=clamp((t-347.4)/1.1);if(fo>0){cx.fillStyle=`rgba(255,255,255,${fo})`;cx.fillRect(0,0,1920,1080)}
};
window.TOTAL=TOTAL;
})();
