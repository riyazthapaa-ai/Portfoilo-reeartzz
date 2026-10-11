addCSS(`
.cn{position:absolute;width:190px;margin-left:-95px;text-align:center;font-size:26px;font-weight:700}
.cn .c{width:110px;height:110px;border-radius:30px;margin:0 auto 14px;display:grid;place-items:center}
.cn svg.i{width:48px;height:48px}
.arr{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px}
.arr svg{width:44px;height:44px;stroke:rgba(255,255,255,.4);stroke-width:2.2;fill:none}
.v1doc{position:absolute;left:760px;top:420px;width:400px;height:260px;border-radius:28px;padding:30px;font-family:Inter}
.v1doc b{display:block;font-family:'Inter Display';font-size:30px;font-weight:800}
.v1doc .ln{height:12px;border-radius:6px;background:rgba(255,255,255,.12);margin-top:14px}
.ver{position:absolute;right:24px;top:24px;padding:6px 14px;border-radius:12px;background:rgba(143,125,255,.2);color:#c9bfff;font-weight:800;font-size:20px}
.act{position:absolute;left:0;top:0;height:70px;padding:0 24px 0 14px;margin:-35px 0 0 0;border-radius:20px;display:flex;align-items:center;gap:12px;font-family:Inter;font-size:24px;font-weight:700;white-space:nowrap}
.act .ic{width:44px;height:44px;border-radius:13px}.act svg.i{width:24px;height:24px}
.cyc{position:absolute;width:160px;margin-left:-80px;text-align:center;font-family:Inter;font-size:22px;font-weight:700}
.cyc .c{width:96px;height:96px;border-radius:50%;margin:0 auto 10px;display:grid;place-items:center;border:2px solid rgba(255,255,255,.15)}
.cyc svg.i{width:42px;height:42px}
.otr{position:absolute;left:1500px;top:820px;padding:16px 24px;border-radius:18px;font-family:Inter;font-size:22px;font-weight:600;color:rgba(255,255,255,.6);border:1px dashed rgba(255,255,255,.25)}
`);
// ---- 1: the usual linear AI flow
const CH=[['Prompt','chat','prompt',252.5],['Generate','spark','generate',253.1],['Copy','copy','copy',253.7],['Download','down','download',254.2],['Start over','redo','start',254.8]];
const chT=CH.map(c=>at(c[2],c[3])),butT=at('but',255.6);
scene('t1',247.1,257.95,HL(170,[['t1a','Another thing I like about [this approach.]',80],['t1b','A lot of AI workflows look like this:',76,'font-weight:600;color:rgba(255,255,255,.88)'],['t1c',"But that's not how [real projects] work.",84,'font-weight:800']])+
  `<svg id="t1sv" class="abs" width="1920" height="1080" style="left:0;top:0"><path id="t1loop" d="M1680 720 C1680 900, 240 900, 240 720" fill="none" stroke="#ff8a7a" stroke-width="4" stroke-dasharray="10 12" stroke-linecap="round"/></svg>`+
  CH.map((c,i)=>`<div class="cn" id="t1n${i}" style="left:${240+i*360}px;top:500px"><div class="c glass" style="${i==4?'border-color:rgba(255,107,107,.6)':''}">${svg(c[1],'stroke:'+(i==4?'#ff8a7a':'#a493ff'))}</div>${c[0]}</div>`).join('')+
  [0,1,2,3].map(i=>`<div class="arr" id="t1a${i}" style="left:${420+i*360}px;top:556px"><svg viewBox="0 0 24 24">${ICON.arrow}</svg></div>`).join(''),(lt,T)=>{
  kin($('t1a'),T,247.32,249.85,.06);kin($('t1b'),T,250.04,butT-.25,.05);kin($('t1c'),T,butT,1e9,.06);
  const dim=eio(p(T,butT+.2,.5));
  CH.forEach((c,i)=>{enter($('t1n'+i),T,chT[i]-.05,{y:50,s:.6});$('t1n'+i).style.opacity=(+$('t1n'+i).style.opacity*(1-.65*dim)).toFixed(3);$('t1n'+i).style.filter=`grayscale(${dim})`});
  [0,1,2,3].forEach(i=>{const k=eo(p(T,chT[i+1]-.15,.3));$('t1a'+i).style.opacity=k*(1-.65*dim);$('t1a'+i).style.transform=`translateX(${(1-k)*-20}px)`});
  const lp=$('t1loop'),L=lp.getTotalLength(),x=eio(p(T,chT[4]+.25,.6));lp.style.strokeDasharray=x<1?`${L*x} ${L}`:'10 12';lp.style.strokeDashoffset=x<1?0:-T*40;lp.style.opacity=x*(1-.6*dim);
});
chT.forEach(t=>cue(t+.1,'tick'));cue(chT[4]+.3,'error');
// ---- 2: projects keep going after the first output
const ACT=[['Edit','edit','#5fd8ff','edit',262],['Review','eye','#a493ff','review',263],['Get feedback','comment','#ffc857','feedback',264.4],['Update','redo','#6ee7b7','update',265.2]];
const acT=ACT.map(a=>at(a[3],a[4])),sevT=at('several',267.2);
const APOS=[[420,470],[1240,470],[420,690],[1240,690]];
scene('t2',257.95,268.35,HL(150,[['t2a',"My projects don't end at the [first output.]",80],['t2b','Edit. Review. Feedback. Update. {Repeat.}',80]])+
  `<div class="v1doc glass" id="t2d"><span class="ver" id="t2v">v1</span><b>Glow Serum script</b><div style="font-size:18px;color:rgba(255,255,255,.5);margin-top:4px" id="t2s">First output</div><div class="ln" style="width:90%"></div><div class="ln" style="width:75%"></div><div class="ln" style="width:85%"></div><div class="ln" style="width:55%"></div></div>`+
  ACT.map((a,i)=>`<div class="act glass" id="t2a${i}">${icx(a[1],a[2])}${a[0]}</div>`).join('')+`<div class="badge" id="t2x" style="left:885px;top:720px">×3 rounds</div>`,(lt,T)=>{
  kin($('t2a'),T,258.08,261.5,.06);kin($('t2b'),T,261.68,1e9,.12);
  enter($('t2d'),T,258.3,{y:60,s:.85});
  let v=1;ACT.forEach((a,i)=>{const k=enter($('t2a'+i),T,acT[i]-.05,{x:(i%2?-80:80),y:0,s:.6});if(T>acT[i])v=i+2;
    $('t2a'+i).style.left=APOS[i][0]+'px';$('t2a'+i).style.top=APOS[i][1]+'px';
    const pulse=1-p(T,acT[i],.6);$('t2a'+i).style.boxShadow=T>acT[i]?`0 0 0 2px ${a[2]}${Math.round(pulse*200).toString(16).padStart(2,'0')}`:''});
  $('t2v').textContent='v'+v;$('t2s').textContent=v>1?'Edited · reviewed · updated':'First output';
  $('t2d').style.transform+=` scale(${1+.04*Math.sin(Math.PI*clamp(acT.reduce((m,t)=>T>t&&T<t+.35?(T-t)/.35:m,0)))})`;
  const b=back(p(T,sevT,.5));$('t2x').style.opacity=clamp(b*2);$('t2x').style.transform=`scale(${lerp(.5,1,b)})`;
});
acT.forEach(t=>cue(t+.1,'pop'));cue(sevT+.1,'ding');
// ---- 3: the WorkBuddy cycle
const CY=[['Create','plus','create',270.6],['Save','save','save',271.2],['Edit','edit','edit',271.7],['Collaborate','user','collaborate',272.1],['Update','redo','update',272.8],['Publish','send','publish',273.4],['Reuse','copy','reuse',274]];
const cyT=CY.map(c=>at(c[2],c[3])),soT7=at('so',274.9),ratT=at('rather',278.5);
const CX=960,CYc=650,R=270,ang=i=>(-90+i*360/7)*Math.PI/180;
scene('t3',268.35,280.55,HL(120,[['t3a','With WorkBuddy, it’s more like:',76,'font-weight:600;color:rgba(255,255,255,.88)'],['t3b','The AI output becomes part of an [ongoing workflow]',70],['t3c','…not a {one-time response.}',80]])+
  `<svg id="t3sv" class="abs" width="1920" height="1080" style="left:0;top:0"><defs><linearGradient id="t3g" x1="0" x2="1"><stop offset="0" stop-color="#a493ff"/><stop offset="1" stop-color="#5fd8ff"/></linearGradient></defs></svg>`+
  CY.map((c,i)=>`<div class="cyc" id="t3n${i}" style="left:${CX+Math.cos(ang(i))*R}px;top:${CYc+Math.sin(ang(i))*R-48}px"><div class="c glass">${svg(c[1],'stroke:#c9bfff')}</div>${c[0]}</div>`).join('')+
  `<div class="otr" id="t3o">One-time response</div><div class="abs center" style="top:${CYc-30}px;font-size:40px;font-weight:800" id="t3c0"><span class="acc">WorkBuddy</span></div>`,(lt,T)=>{
  kin($('t3a'),T,268.48,soT7-.25,.05);kin($('t3b'),T,soT7,ratT-.2,.05);kin($('t3c'),T,ratT,1e9,.06);
  CY.forEach((c,i)=>{const k=enter($('t3n'+i),T,cyT[i]-.08,{y:0,s:.4});const on=eo(p(T,cyT[i],.3));const cc=$('t3n'+i).firstChild;
    cc.style.borderColor=on?`rgba(143,125,255,${.8*on})`:'';cc.style.boxShadow=on?`0 0 ${40*on}px rgba(124,92,255,${.5*on})`:'';
    const a0=ang(i),a1=ang((i+1)%7)+(i==6?Math.PI*2:0),x=eio(p(T,cyT[i]+.1,.45)),am=a0+.22,ae=lerp(am,a1-.22,x);
    T3A[i].setAttribute('d',x>0?`M${CX+Math.cos(am)*R} ${CYc+Math.sin(am)*R} A${R} ${R} 0 0 1 ${CX+Math.cos(ae)*R} ${CYc+Math.sin(ae)*R}`:'')});
  const cm=T>cyT[6]+.6?(T-cyT[6]-.6)*1.6:-1;const ca=ang(0)+cm*Math.PI*2/7;T3C.setAttribute('cx',CX+Math.cos(ca)*R);T3C.setAttribute('cy',CYc+Math.sin(ca)*R);T3C.style.opacity=cm>0?1:0;
  $('t3c0').style.opacity=eo(p(T,cyT[6]+.4,.5));
  const o=enter($('t3o'),T,ratT+.2,{x:80,y:0,s:.8});$('t3o').style.opacity=(+$('t3o').style.opacity*(1-p(T,ratT+1.2,.6)*.7)).toFixed(3);$('t3o').style.textDecoration=T>ratT+1.0?'line-through':'none';
});
const T3A=CY.map(()=>{const pth=document.createElementNS(NS,'path');pth.setAttribute('fill','none');pth.setAttribute('stroke','url(#t3g)');pth.setAttribute('stroke-width','5');pth.setAttribute('stroke-linecap','round');$('t3sv').appendChild(pth);return pth});
const T3C=document.createElementNS(NS,'circle');T3C.setAttribute('r','12');T3C.setAttribute('fill','#fff');$('t3sv').appendChild(T3C);
cyT.forEach(t=>cue(t+.08,'tick'));cue(cyT[6]+.5,'ding');
