addCSS(`
.tbl{position:absolute;left:250px;top:300px;width:1420px;border-radius:26px;overflow:hidden;font-family:Inter}
.tr{display:grid;grid-template-columns:2.2fr 1.3fr 1.6fr 1.3fr 1.6fr;align-items:center;height:80px;border-bottom:1px solid rgba(255,255,255,.07);padding:0 30px;font-size:22px;font-weight:500}
.th{height:88px;font-size:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.65);background:rgba(255,255,255,.04)}
.th span{display:inline-flex;align-items:center;gap:10px}.th svg.i{width:22px;height:22px}
.stt{display:inline-block;padding:6px 14px;border-radius:20px;font-size:17px;font-weight:700}
.kcol{position:absolute;top:280px;width:450px;height:640px;border-radius:26px;padding:24px}
.kcol h4{font-family:Inter;font-size:19px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.75)}
.kcol h4 i{width:12px;height:12px;border-radius:50%}
.kc{position:absolute;left:0;top:0;width:402px;padding:20px 22px;border-radius:18px;font-family:Inter;font-size:23px;font-weight:600}
.kc small{display:block;font-size:17px;font-weight:500;color:rgba(255,255,255,.5);margin-top:4px}
.kc .due{display:inline-block;margin:10px 8px 0 0;font-size:14px;font-weight:700;padding:5px 10px;border-radius:10px;background:rgba(95,216,255,.15);color:#8fe6ff;border:1px solid rgba(95,216,255,.4)}
.flag{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:7px 12px;border-radius:12px;font-size:16px;font-weight:700;color:#ff9a8a;background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.45)}
.flag svg.i{width:18px;height:18px;stroke:#ff8a7a}
.tool{position:absolute;left:0;top:0;width:170px;margin:-80px 0 0 -85px;text-align:center;font-family:Inter;font-size:21px;font-weight:600}
.tool .ic{width:112px;height:112px;border-radius:30px;margin:0 auto 12px}.tool svg.i{width:54px;height:54px}
.cell{position:absolute;width:92px;height:38px;border-radius:8px;background:rgba(95,216,255,.10);border:1px solid rgba(95,216,255,.3)}
.bigdoc{position:absolute;width:300px;height:96px;border-radius:22px;display:flex;align-items:center;gap:18px;padding:0 22px;font-family:Inter;font-size:22px;font-weight:600}
.pchip{position:absolute;height:64px;padding:0 24px 0 14px;border-radius:18px;display:flex;align-items:center;gap:12px;font-family:Inter;font-size:23px;font-weight:600;white-space:nowrap}
.pchip svg.i{width:26px;height:26px}
`);
// ---- A: not just documents -> structured information
const DOCS=[['Brief_Q4.pdf','doc','#ff6b6b'],['Script_v7.docx','film','#a493ff'],['Notes.txt','note','#ffc857']];
scene('p4a',125.85,131.55,HL(150,[['p4a1',"But creators don't just work with [documents.]",80],['p4a2','We also have a lot of [structured information.]',80]])+
  DOCS.map((d,i)=>`<div class="bigdoc glass" id="p4d${i}" style="left:300px;top:${470+i*130}px">${icx(d[1],d[2])}${d[0]}</div>`).join('')+
  `<div id="p4cells"></div>`,(lt,T)=>{
  kin($('p4a1'),T,126.0,128.55,.06);kin($('p4a2'),T,128.73,1e9,.05);
  DOCS.forEach((d,i)=>{const el=$('p4d'+i);enter(el,T,126.15+i*.2,{x:-80,y:0});const sh=eio(p(T,128.8,.6));el.style.opacity=(+el.style.opacity*(1-.55*sh)).toFixed(3)});
  [...$('p4cells').children].forEach((c,k)=>{enter(c,T,129.0+k*.025,{y:20,s:.4,dur:.4})});
});
for(let r=0;r<5;r++)for(let c=0;c<6;c++){const e=document.createElement('div');e.className='cell';e.style.left=(860+c*104)+'px';e.style.top=(470+r*56)+'px';if(r==0)e.style.background='rgba(164,147,255,.22)';$('p4cells').appendChild(e)}
cue(126.2,'pop');cue(129.1,'tick');cue(129.4,'tick');cue(129.7,'tick');
// ---- B: the campaign table = a database
const COLS=[['Campaign','target','campaign',131.5],['Deadline','clock','deadlines',132],['Deliverables','film','deliverables',133],['Status','chart','statuses',134],['Requirements','note','requirements',134.8]];
const ROWS=[['Glow Serum · Reel','Wed 15 Oct','60s Reel','In progress','#5fd8ff','CTA wording'],['Nova Audio · YouTube','Thu 16 Oct','90s integration','In review','#ffc857','Disclosure line'],['Peak Coffee · Shorts','Fri 17 Oct','3 Shorts','In progress','#5fd8ff','✓ Complete'],['Luma Fitness · Stories','Mon 20 Oct','5 Stories','Planned','#a493ff','Brief v2'],['Orbit Bank · Long-form','Fri 31 Oct','10-min video','Planned','#a493ff','Script review']];
const colT=COLS.map(c=>at(c[2],c[3]));const dbT=at('database',136);
scene('p4b',131.55,140.9,`<div class="abs center label" style="top:150px" id="p4lab">My campaign tracker</div>`+HL(140,[['p4b1',"That's basically a [database] of my whole workflow.",72]])+
  `<div class="tbl glass" id="p4tbl"><div class="tr th">${COLS.map((c,i)=>`<span id="p4h${i}">${svg(c[1],'stroke:#a493ff')}${c[0]}</span>`).join('')}</div>`+
  ROWS.map((r,i)=>`<div class="tr" id="p4r${i}"><span style="font-weight:700">${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span><span class="stt" style="background:${r[4]}22;color:${r[4]};border:1px solid ${r[4]}66">${r[3]}</span></span><span style="color:rgba(255,255,255,.7)">${r[5]}</span></div>`).join('')+`</div>`,(lt,T)=>{
  const l=eo(p(T,131.6,.4))*(1-eo(p(T,dbT-.6,.3)));$('p4lab').style.opacity=l;
  kin($('p4b1'),T,dbT-.45,1e9,.05);
  const a=eo(p(T,131.55,.6));$('p4tbl').style.opacity=a;$('p4tbl').style.transform=`translateY(${(1-a)*50}px)`;
  COLS.forEach((c,i)=>enter($('p4h'+i),T,colT[i]-.05,{y:-30,s:.6,dur:.45}));
  ROWS.forEach((r,i)=>enter($('p4r'+i),T,dbT+i*.12,{y:30,s:.96,dur:.45}));
});
colT.forEach(t=>cue(t+.1,'tick'));ROWS.forEach((r,i)=>cue(dbT+i*.12+.15,'tick'));
// ---- C: the prompt
const p4pStart=at('review',142.5);
const p4box=scene('p4c',140.9,at('now',150.5)-.12,HL(110,[['p4c1',"So let's [use that information.]",72]])+
  `<div class="agentwin glass" id="p4aw" style="top:230px;height:740px">${winBar()}<div class="pbub" id="p4pb" style="top:96px"></div><div class="sec" style="left:44px;top:500px" id="p4asl">The agent will</div></div>`+
  `<div class="pchip glass" id="p4k0" style="left:254px;top:790px">${svg('chart','stroke:#5fd8ff')}Organize by status</div><div class="pchip glass" id="p4k1" style="left:640px;top:790px">${svg('cal','stroke:#7c9cff')}Find what's due this week</div><div class="pchip glass" id="p4k2" style="left:1110px;top:790px">${svg('flag','stroke:#ff8a7a')}Flag missing deliverables</div>`,(lt,T)=>{
  kin($('p4c1'),T,141.0,1e9,.06);
  const a=eo(p(T,141.0,.7));$('p4aw').style.opacity=a;$('p4aw').style.transform=`translateY(${(1-a)*60}px) scale(${lerp(.95,1,a)})`;
  const bb=eo(p(T,p4pStart-.35,.4));$('p4pb').style.opacity=bb;$('p4pb').style.transform=`scale(${lerp(.85,1,bb)})`;$('p4pb').style.transformOrigin='right bottom';
  P4P.update(T);$('p4asl').style.opacity=eo(p(T,P4P.times[5],.4));
  [5,14,18].forEach((wi,k)=>enter($('p4k'+k),T,P4P.times[wi],{y:50}));
});
const P4P=promptBubble($('p4pb'),'Review my active campaigns and organize them by status. Show me which campaigns are due this week and flag anything that is missing a required deliverable.',p4pStart,{5:'pa',6:'pa',7:'pa',8:'pa',14:'pa',15:'pa',16:'pa',18:'pa',22:'pa',23:'pa',24:'pa',25:'pa'});
[5,14,18].forEach(wi=>cue(P4P.times[wi]+.2,'pop'));
// ---- D: spreadsheet -> working board
const nowT=at('now',150.5),turnT=at('turn',155.5),usefulT=at('useful',156.5);
const KC=[['In progress','#5fd8ff',[0,2]],['In review','#ffc857',[1]],['Planned','#a493ff',[3,4]]];
scene('p4d',nowT-.12,160.72,HL(120,[['p4dh1',"It's not just sitting in a {spreadsheet} anymore.",72],['p4dh2',"It's actually useful for [operating my workflow.]",72]])+
  KC.map((k,i)=>`<div class="kcol glass" id="p4col${i}" style="left:${240+i*490}px"><h4><i style="background:${k[1]}"></i>${k[0]}</h4></div>`).join('')+`<div id="p4kcs"></div>`,(lt,T)=>{
  kin($('p4dh1'),T,nowT,turnT-.25,.05);kin($('p4dh2'),T,turnT,1e9,.05);
  KC.forEach((k,i)=>enter($('p4col'+i),T,nowT+.1+i*.1,{y:60,s:.92}));
  p4cards.forEach(({el,ci,slot,ri},j)=>{const s=nowT+.8+j*.18,x=eio(p(T,s,.7));const tx=240+ci*490+24,ty=280+76+slot*200;
    const sx=250+30,sy=400+ri*80;el.style.left='0';el.style.top='0';el.style.opacity=clamp(p(T,s,.15));el.style.transform=`translate(${lerp(sx,tx,x)}px,${lerp(sy,ty,x)}px) rotate(${Math.sin(Math.PI*x)*(j%2?4:-4)}deg)`;
    el.querySelectorAll('.due').forEach(d=>{const k=back(p(T,usefulT+.1+j*.08,.4));d.style.opacity=clamp(k*2);d.style.transform=`scale(${k})`});
    el.querySelectorAll('.flag').forEach(f=>{const k=back(p(T,usefulT+.7+j*.1,.45));f.style.opacity=clamp(k*2);f.style.transform=`scale(${lerp(.5,1,k)})`});
  });
});
const p4cards=[];KC.forEach((k,ci)=>k[2].forEach((ri,slot)=>{const r=ROWS[ri];const e=document.createElement('div');e.className='kc glass';
  e.innerHTML=`${r[0]}<small>${r[2]} · ${r[1]}</small>${ri<3?'<span class="due">DUE THIS WEEK</span>':''}${ri<2?`<span class="flag">${svg('flag')}Missing: ${r[5]}</span>`:''}`;$('p4kcs').appendChild(e);p4cards.push({el:e,ci,slot,ri})}));
p4cards.forEach((c,j)=>cue(nowT+.8+j*.18+.6,'tick'));cue(usefulT+.2,'ding');cue(usefulT+.8,'pop');cue(usefulT+.9,'pop');
// ---- E: not replacing tools, making them easier to work with
const TOOLS=[['Spreadsheets','sheet','#6ee7b7'],['Docs','doc','#5fd8ff'],['Calendar','cal','#7c9cff'],['Notes','note','#ffc857'],['Files','copy','#ff8a7a']];
const notT=at('not',163.2),aboutT=at('about',166.9);
const p4e=scene('p4e',160.72,171.55,HL(130,[['p4e1','And this is where WorkBuddy gets [interesting.]',76],['p4e2',"It's not about {replacing} the tools I already use.",72],['p4e3',"It's making what I already have [easier to work with.]",70]])+
  `<svg id="p4esv" class="abs" width="1920" height="1080" style="left:0;top:0"></svg>`+TOOLS.map((t,i)=>`<div class="tool" id="p4t${i}">${icx(t[1],t[2])}${t[0]}</div>`).join('')+`<div id="p4orbw"></div>`,(lt,T)=>{
  kin($('p4e1'),T,160.85,notT-.2,.06);kin($('p4e2'),T,notT,aboutT-.2,.05);kin($('p4e3'),T,aboutT,1e9,.05);
  const g=eio(p(T,aboutT+.2,.9));
  TOOLS.forEach((t,i)=>{const el=$('p4t'+i);const k=back(p(T,161.2+i*.1,.55));const a=(-90+i*72)*Math.PI/180;
    const x=lerp(560+i*200,960+Math.cos(a)*400,g),y=lerp(600,640+Math.sin(a)*250,g);
    el.style.opacity=clamp(k*2);el.style.transform=`translate(${x}px,${y}px) scale(${lerp(.5,1,k)*lerp(1,.85,g)})`;
    const stay=T>notT+1&&T<aboutT?.5+.5*Math.sin(T*5+i):0;el.firstChild.style.boxShadow=stay?`0 0 30px ${t[2]}66`:'';
    link(p4L[i],p4D[i],T,aboutT+1.0+i*.08,960,640,x,y,i*.2)});
  P4O.update(T,aboutT+.7,960,640);
});
const p4L=TOOLS.map(()=>mkline($('p4esv'))),p4D=TOOLS.map(()=>mkdot($('p4esv')));const P4O=orb($('p4orbw'),'WorkBuddy');
TOOLS.forEach((t,i)=>cue(161.4+i*.1,'tick'));cue(aboutT+.8,'pop');cue(aboutT+1.5,'ding');
