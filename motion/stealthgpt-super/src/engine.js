(function(){
const TOTAL=347.6, FPS=30;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const eOut=p=>1-Math.pow(1-p,3);
const eInOut=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const eBack=p=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2)};
const lerp=(a,b,p)=>a+(b-a)*p;
const smooth=p=>p*p*(3-2*p);
function hash(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}

const SC=window.SCENES, world=document.getElementById('world');
const ROT=[0,-6,5,-4,7,-5,4,-7,6,-3,5,-6,4,-5,6,-4,7,-6,5,-4,6,-5,4,0];
SC.forEach((s,i)=>{
  s.x=i*2250+(i%3)*160; s.y=Math.round(Math.sin(i*1.9)*700); s.r=ROT[i%ROT.length];
  s.dip=[0.52,0.6,0.48,0.56][i%4];
  const d=document.createElement('div'); d.className='scene';
  d.style.left=(s.x-960)+'px'; d.style.top=(s.y-540)+'px'; d.style.transform=`rotate(${s.r}deg)`;
  d.innerHTML=s.html; world.appendChild(d); s.el=d;
  s.anims=[...d.querySelectorAll('[data-in]')].map(el=>({el,t:+el.dataset.in,k:el.dataset.a||'up',o:el.dataset.out!==undefined?+el.dataset.out:null,d:+(el.dataset.d||0.7),last:''}));
  if(i>0)s.anims.forEach(a=>{if(a.t<s.s+1.5&&!a.el.parentElement.closest('[data-in]'))a.t=s.s-0.35+Math.max(0,a.t-s.s)*0.4});
  s.tys=[...d.querySelectorAll('.ty')].map(el=>({el,t:+el.dataset.ty,c:+el.dataset.cps,full:el.textContent,last:-1}));
});
const $=id=>document.getElementById(id);
function offIn(el,root){let x=0,y=0;while(el&&el!==root){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent}return{x,y}}

// ---- hud
const wave=$('wave'); for(let i=0;i<29;i++){wave.appendChild(document.createElement('i'))}
const bars=[...wave.children];

// ---- background canvas
const cv=$('fx'),cx=cv.getContext('2d');
const P=[];for(let i=0;i<140;i++)P.push({x:hash(i)*4000,y:hash(i+99)*4000,z:.15+hash(i+7)*.75,h:hash(i+3)});
function drawBg(cam,t){
  cx.clearRect(0,0,1920,1080);
  // orbs
  const orbs=[[0.25,0.3,'139,108,255'],[0.78,0.7,'34,211,238'],[0.6,0.15,'255,77,141']];
  orbs.forEach((o,i)=>{const ox=1920*o[0]+Math.sin(t*.13+i*2)*220-(cam.x*0.05%400),oy=1080*o[1]+Math.cos(t*.11+i)*160-(cam.y*.05%300);
    const g=cx.createRadialGradient(ox,oy,0,ox,oy,700);g.addColorStop(0,`rgba(${o[2]},${i==2?.10:.16})`);g.addColorStop(1,`rgba(${o[2]},0)`);cx.fillStyle=g;cx.fillRect(0,0,1920,1080)});
  // grid (parallax 0.5)
  cx.save();cx.translate(960,540);cx.rotate(-cam.r*Math.PI/180*0.6);const s=cam.s*0.5+0.5;cx.scale(s,s);
  const sp=140,ox=-((cam.x*0.5)%sp),oy=-((cam.y*0.5)%sp);
  cx.strokeStyle='rgba(255,255,255,0.045)';cx.lineWidth=1.5/s;cx.beginPath();
  for(let x=-1800;x<=1800;x+=sp){cx.moveTo(x+ox,-1300);cx.lineTo(x+ox,1300)}
  for(let y=-1300;y<=1300;y+=sp){cx.moveTo(-1800,y+oy);cx.lineTo(1800,y+oy)}
  cx.stroke();cx.restore();
  // particles
  P.forEach(p=>{let x=((p.x-cam.x*p.z+t*12*p.z)%4000+4000)%4000-1040, y=((p.y-cam.y*p.z-t*8*p.z)%4000+4000)%4000-1460;
    if(x<-20||x>1940||y<-20||y>1100)return; const r=1+p.z*3.2*(0.6+cam.s*0.4);
    cx.fillStyle=p.h<.33?`rgba(139,108,255,${.25+p.z*.5})`:p.h<.66?`rgba(34,211,238,${.2+p.z*.45})`:`rgba(255,255,255,${.15+p.z*.4})`;
    cx.beginPath();cx.arc(x,y,r,0,7);cx.fill()});
}

// ---- camera
function camAt(t){
  let i=0;while(i<SC.length-1&&t>=SC[i+1].s)i++;
  const s=SC[i];
  const base=(sc,tt)=>{const lt=clamp((tt-sc.s)/Math.max(1,sc.e-sc.s));return{x:sc.x+Math.sin(tt*.35+sc.x)*10,y:sc.y+Math.cos(tt*.3+sc.y)*8,r:sc.r+Math.sin(tt*.25)*0.4,s:1+0.045*smooth(lt)}};
  let cam=base(s,t), vel=0;
  // incoming transition (into scene i)
  const W0=0.6,W1=0.5;
  if(i>0&&t<s.s+W1){const pr=SC[i-1];const p=eInOut(clamp((t-(s.s-W0))/(W0+W1)));const a=base(pr,t),b=base(s,t);
    cam={x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p),r:lerp(a.r,b.r,p),s:lerp(a.s,b.s,p)*(1-s.dip*Math.sin(Math.PI*p))};vel=Math.sin(Math.PI*p)}
  else if(i<SC.length-1&&t>SC[i+1].s-W0){const nx=SC[i+1];const p=eInOut(clamp((t-(nx.s-W0))/(W0+W1)));const a=base(s,t),b=base(nx,t);
    cam={x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p),r:lerp(a.r,b.r,p),s:lerp(a.s,b.s,p)*(1-nx.dip*Math.sin(Math.PI*p))};vel=Math.sin(Math.PI*p)}
  // hook intro: fly-in from far
  if(t<1.4){const p=eOut(clamp(t/1.4));cam.s*=lerp(2.4,1,p);cam.r+=lerp(-14,0,p);cam.y+=lerp(260,0,p)}
  // glitch shake
  if(t>4.77&&t<5.35){const k=(5.35-t)/0.58;cam.x+=(hash(t*90)-.5)*40*k;cam.y+=(hash(t*77)-.5)*30*k;cam.r+=(hash(t*31)-.5)*2*k}
  // outro pull-back
  if(t>344.1){const p=eInOut(clamp((t-344.1)/3.3));cam.s*=lerp(1,0.82,p);cam.r+=lerp(0,-3,p)}
  cam.vel=vel;cam.i=i;return cam;
}

function animEl(a,t){
  let p=clamp((t-a.t)/a.d);let op=1,tr='',f=0,clip='';
  if(t<a.t){op=0}
  else{const e=eOut(p);
    switch(a.k){
      case 'up':op=e;tr=`translateY(${(1-e)*60}px)`;f=(1-e)*10;break;
      case 'left':op=e;tr=`translateX(${-(1-e)*110}px)`;f=(1-e)*8;break;
      case 'right':op=e;tr=`translateX(${(1-e)*110}px)`;f=(1-e)*8;break;
      case 'pop':{const b=eBack(p);op=clamp(p*2.5);tr=`scale(${0.4+0.6*b})`;break}
      case 'zoom':op=e;tr=`scale(${1.3-0.3*e})`;f=(1-e)*14;break;
      case 'fade':op=e;break;
      case 'grow':tr=`scaleX(${eInOut(p)})`;break;
      case 'wipe':clip=`inset(0 ${(1-e)*100}% 0 0)`;break;
      case 'stamp':{const b=eBack(clamp((t-a.t)/0.45));op=clamp((t-a.t)*6);tr=`scale(${2.4-1.4*b})`;break}
    }}
  if(a.o!==null&&t>a.o){const q=eOut(clamp((t-a.o)/0.45));op*=1-q;tr+=` translateY(${-40*q}px) scale(${1-0.06*q})`;f+=q*10}
  const st=`${op.toFixed(3)}|${tr}|${f.toFixed(1)}|${clip}`; if(st===a.last)return; a.last=st;
  const s=a.el.style; s.opacity=op.toFixed(3); s.transform=tr; if(a.k==='grow')s.transformOrigin='left center';
  s.filter=f>0.2?`blur(${f.toFixed(1)}px)`:'none'; if(a.k==='wipe')s.clipPath=clip; s.visibility=op<=0.001?'hidden':'visible';
}

// ---- custom per-scene updates
let built=false, pos={};
function buildPos(){
  const sc13=SC[12].el; const btn=$('runbtn'); const o=offIn(btn,sc13); pos.btn={x:o.x+btn.offsetWidth*0.55,y:o.y+btn.offsetHeight*0.6};
  const sc14=SC[13].el; const docs=sc14.querySelectorAll('.doc'); const d=docs[1]; const od=offIn(d,sc14); pos.doc={x:od.x,y:od.y,w:d.offsetWidth,h:d.offsetHeight};
  const sb=$('subbtn'); const os=offIn(sb,SC[23].el); pos.sub={x:os.x+sb.offsetWidth*0.6,y:os.y+sb.offsetHeight*0.6};
  built=true;
}
function custom(t){
  // glitch
  const g=$('glitch'); if(t>4.7&&t<6.4){const k=clamp((5.6-t)/0.8);const j=(hash(Math.floor(t*30))-.5)*28*k;g.style.textShadow=k>0?`${j}px 0 #ff4d8d, ${-j}px 0 #22d3ee`:'none';g.style.transform=`translateX(${(hash(Math.floor(t*30)+5)-.5)*20*k}px) skewX(${(hash(Math.floor(t*30)+9)-.5)*14*k}deg)`}
  // flash
  let fl=0; if(t>4.77)fl=Math.max(fl,0.45*Math.exp(-(t-4.77)*10)); if(t>0)fl=Math.max(fl,0.5*Math.exp(-t*6)*(t<1?1:0));
  $('flash').style.opacity=fl.toFixed(3);
  // flatline
  if(t>6.4&&t<9.5){const p=eInOut(clamp((t-6.6)/1.6));let d='';const N=120;for(let k=0;k<=N*p;k++){const x=k/N*1200;const amp=60*Math.pow(1-k/N,2.2);d+=(k?'L':'M')+x.toFixed(1)+' '+(80+Math.sin(k*0.55)*amp).toFixed(1)}$('flp').setAttribute('d',d||'M0 80');$('flatline').style.opacity=clamp((t-6.5)*3)}
  else if(t<=6.4)$('flatline').style.opacity=0;
  // clock
  if(t>8&&t<17){const m=30*eInOut(clamp((t-11.8)/1.8));$('mins').textContent=Math.round(m);$('clk').setAttribute('stroke-dashoffset',(540*(1-m/60)).toFixed(1));$('hand').setAttribute('transform',`rotate(${m*6} 100 100)`)}
  // SUPER core spin
  if(t>69&&t<84){$('core').style.background=`conic-gradient(from ${(t*90)%360}deg,#8b6cff,#22d3ee,#ff4d8d,#8b6cff)`}
  // run SUPER
  if(t>137&&t<157){const c=$('cursor');const p=eInOut(clamp((t-153.6)/1.3));const sx=pos.btn.x+420,sy=pos.btn.y+260;
    c.style.opacity=clamp((t-153.4)*4);c.style.transform=`translate(${lerp(sx,pos.btn.x,p)}px,${lerp(sy,pos.btn.y,p)}px) scale(${t>155.05&&t<155.25?0.85:1})`;
    const b=$('runbtn');b.style.transform=`scale(${t>155.05&&t<155.3?0.93:1})`;b.style.boxShadow=t>155.05?`0 0 ${40+20*Math.sin(t*20)}px rgba(139,108,255,.8)`:'none';
    const r=clamp((t-155.15)/0.45);$('runbar').style.width=(eInOut(r)*100)+'%';$('runpct').textContent=Math.round(eInOut(r)*100)+'%'}
  // scan box over processed doc
  if(t>158&&t<168){const sb=$('scanbox');const d=pos.doc;const regs=[[d.y+70,110],[d.y+180,170],[d.y+340,150],[d.y+480,200]];const times=[160,161.3,162.6,163.8];
    let k=0;for(let q=0;q<4;q++)if(t>=times[q])k=q;const prev=Math.max(0,k-1);const p=eInOut(clamp((t-times[k])/0.5));const rg=k==0?regs[0]:[lerp(regs[prev][0],regs[k][0],p),lerp(regs[prev][1],regs[k][1],p)];
    sb.style.left=(d.x-14)+'px';sb.style.width=(d.w+28)+'px';sb.style.top=rg[0]+'px';sb.style.height=rg[1]+'px';sb.style.opacity=(clamp((t-160)*3)*(1-clamp((t-166.2)*4))).toFixed(2)}
  // detector scan
  if(t>190&&t<213){const L=$('laser');const on=t>210.5&&t<212.3;L.style.opacity=on?1:0;if(on){L.style.top=(120+Math.abs(Math.sin((t-210.5)*2.6))*300)+'px'}
    $('scanst').textContent=t>212.1?'Scan complete':t>210.5?'Scanning'+'.'.repeat(1+Math.floor(t*4)%3):t>194.5?'Processed text submitted':'Ready';
    $('recdot').style.opacity=(Math.floor(t*2)%2)?1:.25}
  if(t>212&&t<232){$('ring').setAttribute('stroke-dashoffset',(943*(1-eInOut(clamp((t-212.9)/1.4)))).toFixed(1))}
  // demo
  if(t>230&&t<246){$('play').style.transform=`scale(${1+0.06*Math.sin(t*4)})`;$('demobar').style.width=(clamp((t-232)/13)*100)+'%'}
  // outro
  if(t>328&&t<348){$('arr').style.display='inline-block';$('arr').style.transform=`translateY(${Math.abs(Math.sin(t*4))*8}px)`;
    const c=$('cursor2');const p=eInOut(clamp((t-336.6)/1.0));const sx=pos.sub.x+380,sy=pos.sub.y+240;c.style.opacity=(clamp((t-336.4)*4)*(1-clamp((t-343.5)*3))).toFixed(2);
    c.style.transform=`translate(${lerp(sx,pos.sub.x,p)}px,${lerp(sy,pos.sub.y,p)}px) scale(${t>337.7&&t<337.9?0.85:1})`;
    const sb=$('subbtn');const done=t>337.8;sb.style.background=done?'#2b2940':'#ff2d2d';sb.textContent=done?'SUBSCRIBED ✓':'SUBSCRIBE';sb.style.boxShadow=done?'none':'0 20px 60px rgba(255,45,45,.4)';sb.style.transform=`scale(${t>337.7&&t<337.95?0.92:1})`;
    const bl=$('bell');const w=t>338.3&&t<339.8?Math.sin((t-338.3)*30)*18*(1-(t-338.3)/1.5):0;bl.style.transform=`rotate(${w}deg)`;bl.style.transformOrigin='50% 10%'}
}

let lastChap='';
window.renderAt=function(t){
  if(!built)buildPos();
  const cam=camAt(t);
  world.style.transform=`translate(960px,540px) scale(${cam.s}) rotate(${-cam.r}deg) translate(${-cam.x}px,${-cam.y}px)`;
  const wb=cam.vel>0.25?`blur(${((cam.vel-0.25)*3.2).toFixed(2)}px)`:'none';
  SC.forEach((s,i)=>{const vis=t>s.s-1.3&&t<s.e+1.3; s.el.style.display=vis?'flex':'none'; if(!vis)return; if(s._wb!==wb){s.el.style.filter=wb;s._wb=wb}
    s.anims.forEach(a=>animEl(a,t));
    s.tys.forEach(y=>{const n=t<y.t?0:Math.min(y.full.length,Math.floor((t-y.t)*y.c));const blink=Math.floor(t*2.2)%2===0||n<y.full.length;const key=n*2+(blink?1:0);if(key===y.last)return;y.last=key;
      y.el.innerHTML=y.full.slice(0,n).replace(/&/g,'&amp;')+(blink?'<span class="caret"></span>':'<span class="caret" style="opacity:0"></span>')});
  });
  custom(t);
  drawBg(cam,t);
  // hud
  const f=Math.floor(t*FPS), R=window.RMS||[];
  bars.forEach((b,k)=>{const v=R[Math.max(0,f-Math.abs(k-14))]||0;b.style.height=(6+44*v*(1-Math.abs(k-14)/18)).toFixed(1)+'px'});
  $('prog').style.width=(t/TOTAL*100).toFixed(3)+'%';
  const s=SC[cam.i];const ct=$('chapt');if(s.ch!==lastChap){ct.textContent=s.ch;lastChap=s.ch}
  const ca=clamp((t-s.s)*2.5);$('chap').style.opacity=ca.toFixed(2);$('chap').style.transform=`translateY(${(1-eOut(ca))*-14}px)`;
  const hudOp=clamp((t-1.2)*2)*(1-clamp((t-344.1)*2));$('hud').style.opacity=hudOp.toFixed(2);
  // final fade
  const fo=clamp((t-346.6)/1.0);document.getElementById('vig').style.background=fo>0?`rgba(0,0,0,${fo})`:'';
};
window.TOTAL=TOTAL;window.FPS=FPS;
})();
