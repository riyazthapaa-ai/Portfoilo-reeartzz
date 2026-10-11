addCSS(`
.doc{position:absolute;width:700px;height:720px;border-radius:28px;font-family:Inter;overflow:hidden}
.doc .dh{display:flex;align-items:center;gap:16px;padding:26px 30px 0}
.doc .dh b{font-family:'Inter Display';font-size:28px;font-weight:800}.doc .dh small{display:block;font-size:16px;color:rgba(255,255,255,.5)}
.blk{position:absolute;left:30px;right:30px;border-radius:16px;padding:16px 20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:19px;font-weight:700;overflow:hidden}
.blk .ln{height:10px;border-radius:5px;background:rgba(255,255,255,.12);margin-top:12px}
.blk.cta{background:linear-gradient(135deg,rgba(124,92,255,.35),rgba(58,168,255,.25));border-color:rgba(143,125,255,.6)}
.cmt{position:absolute;width:560px;border-radius:26px;padding:24px 28px;font-family:Inter}
.cmt .who{display:flex;align-items:center;gap:14px;margin-bottom:14px;font-size:20px;font-weight:700}
.cmt .who small{display:block;font-size:15px;font-weight:500;color:rgba(255,255,255,.5)}
.av{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:20px;flex:none}
.cmt .txt{font-size:28px;line-height:1.4;font-weight:600}
.cmt .txt .pw{margin-right:.24em}
.res2{display:inline-block;margin-top:14px;padding:6px 12px;border-radius:10px;font-size:16px;font-weight:700;background:rgba(47,210,143,.15);color:#7ef0c0;border:1px solid rgba(47,210,143,.5)}
.cursor{position:absolute;left:0;top:0}
.cursor svg{width:34px;height:34px}
.cursor span{position:absolute;left:28px;top:26px;padding:4px 10px;border-radius:8px;background:#ffc857;color:#1a1300;font-family:Inter;font-size:15px;font-weight:700;white-space:nowrap}
.person{position:absolute;width:200px;margin-left:-100px;text-align:center;font-family:Inter;font-size:22px;font-weight:700}
.person .av{width:120px;height:120px;font-size:44px;margin:0 auto 12px}
.fcopy{position:absolute;left:0;top:0;height:64px;padding:0 20px 0 12px;margin:-32px 0 0 0;border-radius:16px;display:flex;align-items:center;gap:10px;font-family:Inter;font-size:19px;font-weight:600;white-space:nowrap}
.fcopy .ic{width:40px;height:40px;border-radius:11px}.fcopy svg.i{width:22px;height:22px}
.sat{position:absolute;left:0;top:0;height:72px;padding:0 26px 0 14px;margin:-36px 0 0 0;border-radius:22px;display:flex;align-items:center;gap:12px;font-family:Inter;font-size:24px;font-weight:700;white-space:nowrap}
.sat .ic{width:46px;height:46px;border-radius:14px}.sat svg.i{width:26px;height:26px}
`);
const AV=(c,l)=>`<div class="av" style="background:${c}33;border:2px solid ${c};color:${c}">${l}</div>`;
// campaign doc with movable blocks; layout(order,heights) positions them
const BL=[['Hook','hook',90,''],['Product story','story',230,''],['Routine demo','demo',130,''],['CTA · “Link in bio for 15% off”','cta',80,'cta']];
const docHTML=(id,x,y)=>`<div class="doc glass" id="${id}" style="left:${x}px;top:${y}px"><div class="dh">${icx('doc','#5fd8ff')}<div><b>Glow Serum · Campaign doc</b><small>Shared with Sam</small></div></div>`+
  BL.map(b=>`<div class="blk ${b[3]}" id="${id}${b[1]}">${b[0]}${b[3]?'':'<div class="ln" style="width:92%"></div><div class="ln" style="width:80%"></div><div class="ln" style="width:86%"></div><div class="ln" style="width:70%"></div><div class="ln" style="width:88%"></div><div class="ln" style="width:60%"></div>'}</div>`).join('')+`</div>`;
function layoutDoc(id,order,h){let y=120;order.forEach(k=>{const b=BL[k],e=$(id+b[1]);e.style.top=y+'px';e.style.height=h[k]+'px';y+=h[k]+14})}
// ---- 1: reviewer leaves a comment
const u1c=at('can',285.2);
const cursorSVG=`<svg viewBox="0 0 24 24"><path d="M4 3l7 18 2.5-7.5L21 11z" fill="#ffc857" stroke="#1a1300" stroke-width="1.2"/></svg>`;
scene('u1',280.55,288.9,HL(120,[['u1a','Someone else is [reviewing the campaign.]',76],['u1b','They leave a comment:',76,'font-weight:600;color:rgba(255,255,255,.88)']])+docHTML('u1d',300,240)+
  `<div class="cursor" id="u1cur">${cursorSVG}<span>Sam</span></div>`+
  `<div class="cmt glass" id="u1cm" style="left:1110px;top:360px"><div class="who">${AV('#ffc857','S')}<div>Sam<small>Reviewer · just now</small></div></div><div class="txt" id="u1tx"></div></div>`,(lt,T)=>{
  kin($('u1a'),T,280.86,283.9,.06);kin($('u1b'),T,284.06,1e9,.06);
  enter($('u1d'),T,280.9,{y:60,s:.92});layoutDoc('u1d',[0,1,2,3],[90,230,130,80]);
  const cx=lerp(1400,640,eio(p(T,282.3,1.2))),cy=lerp(900,500,eio(p(T,282.3,1.2)));$('u1cur').style.transform=`translate(${cx+Math.sin(T*2)*6}px,${cy+Math.cos(T*2.3)*6}px)`;$('u1cur').style.opacity=eo(p(T,282.2,.3));
  enter($('u1cm'),T,284.3,{x:60,y:0,s:.9});U1P.update(T);
  const sec=eo(p(T,U1P.times[4],.3)),cta=eo(p(T,U1P.times[9],.3));
  $('u1dstory').style.boxShadow=sec?`0 0 0 3px rgba(255,200,87,${.8*sec})`:'';$('u1dstory').style.background=sec?`rgba(255,200,87,${.1*sec})`:'';
  $('u1dcta').style.boxShadow=cta?`0 0 0 3px rgba(255,200,87,${.8*cta})`:'';
});
const U1P=promptBubble($('u1tx'),'“Can we make this section shorter and move the CTA higher?”',u1c);
cue(284.4,'ding');
// ---- 2: no more copies back and forth -> same artifact
const COPIES=['Campaign_v3.docx','Campaign_v3_edits.docx','Campaign_FINAL_v2.docx'];const cpT=[289.5,290.35,291.2];const sameT=at('i',292.3);
scene('u2',288.9,295.3,HL(130,[['u2a','No more copies sent {back and forth…}',80],['u2b','I keep working on the [same artifact.]',84,'font-weight:800']])+
  `<div class="person" id="u2p1" style="left:360px;top:430px">${AV('#a493ff','Me')}You</div><div class="person" id="u2p2" style="left:1560px;top:430px">${AV('#ffc857','S')}Sam</div>`+
  COPIES.map((c,i)=>`<div class="fcopy glass" id="u2c${i}">${icx('copy','#8a8fa8')}${c}</div>`).join('')+
  `<svg id="u2sv" class="abs" width="1920" height="1080" style="left:0;top:0"></svg><div class="doc glass" id="u2art" style="left:760px;top:420px;width:400px;height:240px"><div class="dh">${icx('doc','#5fd8ff')}<div><b style="font-size:24px">Campaign doc</b><small>One shared artifact</small></div></div><div style="padding:20px 30px"><div class="ln" style="height:10px;border-radius:5px;background:rgba(255,255,255,.12);width:90%"></div><div style="height:10px;border-radius:5px;background:rgba(255,255,255,.12);width:70%;margin-top:12px"></div><div style="height:10px;border-radius:5px;background:rgba(255,255,255,.12);width:80%;margin-top:12px"></div></div></div>`,(lt,T)=>{
  kin($('u2a'),T,289.02,sameT-.25,.06);kin($('u2b'),T,sameT,1e9,.06);
  enter($('u2p1'),T,289.1,{y:40,s:.7});enter($('u2p2'),T,289.2,{y:40,s:.7});
  const merge=eio(p(T,sameT+.1,.6));
  COPIES.forEach((c,i)=>{const s=cpT[i],x=eio(p(T,s,.8)),dir=i%2?-1:1;const sx=dir>0?600:1320,ex=dir>0?1320:600;
    const fx=lerp(lerp(sx,ex,x),960,merge),fy=lerp(640-Math.sin(Math.PI*x)*150+i*16,540,merge);
    const el=$('u2c'+i);el.style.opacity=clamp(p(T,s,.15))*(1-merge);el.style.transform=`translate(${fx-el.offsetWidth/2}px,${fy}px) rotate(${Math.sin(Math.PI*x)*dir*8}deg)`});
  enter($('u2art'),T,sameT+.4,{s:.5,y:0});
  link(U2L[0],U2D[0],T,sameT+.8,430,500,760,540);link(U2L[1],U2D[1],T,sameT+.9,1490,500,1160,540,.5);
});
const U2L=[mkline($('u2sv')),mkline($('u2sv'))],U2D=[mkdot($('u2sv')),mkdot($('u2sv'))];
cpT.forEach(t=>cue(t+.1,'tick'));cue(sameT+.5,'pop');
// ---- 3: the prompt
const u3s=at('apply',295.3);
scene('u3',295.3,303.2,`<div class="abs center label" style="top:150px" id="u3l">I ask the agent</div><div class="agentwin glass" id="u3w" style="top:250px;height:520px">${winBar()}<div class="pbub" id="u3pb" style="top:120px"></div></div>`,(lt,T)=>{
  $('u3l').style.opacity=eo(p(T,295.35,.4));
  const a=eo(p(T,295.3,.7));$('u3w').style.opacity=a;$('u3w').style.transform=`translateY(${(1-a)*60}px) scale(${lerp(.95,1,a)})`;
  const bb=eo(p(T,u3s-.3,.4));$('u3pb').style.opacity=bb;$('u3pb').style.transform=`scale(${lerp(.85,1,bb)})`;$('u3pb').style.transformOrigin='right bottom';U3P.update(T);
});
const U3P=promptBubble($('u3pb'),'Apply this feedback to the existing campaign document. Move the CTA higher and shorten this section, but leave the rest unchanged.',u3s,{5:'hl',6:'hl',7:'hl',8:'pa',10:'pa',11:'pa',13:'pa',15:'pa',17:'pa',18:'pa',19:'pa',20:'pa'});
// ---- 4: the same doc, updated in place
const notT8=at('so',307.8);
scene('u4',303.2,311.1,HL(120,[['u4a','Human feedback + AI, around the [same piece of work.]',70],['u4b',"Not just me {chatting with an AI.}",80]])+docHTML('u4d',300,240)+
  `<div class="cmt glass" id="u4cm" style="left:1110px;top:380px"><div class="who">${AV('#ffc857','S')}<div>Sam<small>Reviewer</small></div></div><div class="txt" style="font-size:24px;color:rgba(255,255,255,.75)">“Can we make this section shorter and move the CTA higher?”</div><span class="res2" id="u4ok">✓ Resolved · applied by agent</span></div>`,(lt,T)=>{
  kin($('u4a'),T,303.32,notT8-.25,.05);kin($('u4b'),T,notT8,1e9,.06);
  enter($('u4d'),T,303.25,{y:0,s:.97,dur:.4});enter($('u4cm'),T,303.4,{x:40,y:0,s:.95});
  const m=eio(p(T,303.9,.9)),h=lerp(230,120,eio(p(T,304.3,.8)));
  // CTA climbs from last to second place
  const ys=[];let y=120;[90,h,130,80].forEach(v=>{ys.push(y);y+=v+14});
  const ctaY=lerp(ys[3],ys[1],m),storyY=lerp(ys[1],ys[1]+80+14,m),demoY=lerp(ys[2],ys[2]+80+14-(230-h)*0,m);
  $('u4dhook').style.top=ys[0]+'px';$('u4dhook').style.height='90px';
  $('u4dcta').style.top=ctaY+'px';$('u4dcta').style.height='80px';$('u4dcta').style.zIndex=2;$('u4dcta').style.boxShadow=m>0&&m<1?'0 20px 50px rgba(0,0,0,.5)':'';
  $('u4dstory').style.top=storyY+'px';$('u4dstory').style.height=h+'px';
  $('u4ddemo').style.top=(storyY+h+14)+'px';$('u4ddemo').style.height='130px';
  const ok=back(p(T,305.0,.5));$('u4ok').style.opacity=clamp(ok*2);$('u4ok').style.transform=`scale(${lerp(.6,1,ok)})`;
});
cue(304.0,'tick');cue(304.5,'tick');cue(305.1,'ding');
// ---- 5: people, AI, revisions, new information
const SAT=[['People','user','#ffc857','people',312.1,-140,-170],['AI','spark','#a493ff','ai',312.6,250,-170],['Revisions','edit','#5fd8ff','revisions',313.1,-180,170],['New information','plus','#6ee7b7','new',313.8,270,170]];
const saT=SAT.map(s=>at(s[3],s[4]));
scene('u5',311.1,315.2,HL(130,[['u5a','The work can involve [people, AI, revisions & new information.]',60]])+
  `<svg id="u5sv" class="abs" width="1920" height="1080" style="left:0;top:0"></svg><div class="doc glass" id="u5art" style="left:780px;top:520px;width:360px;height:200px"><div class="dh">${icx('doc','#5fd8ff')}<div><b style="font-size:24px">Campaign doc</b><small>Living artifact</small></div></div></div>`+
  SAT.map((s,i)=>`<div class="sat glass" id="u5s${i}">${icx(s[1],s[2])}${s[0]}</div>`).join(''),(lt,T)=>{
  kin($('u5a'),T,311.25,1e9,.05);enter($('u5art'),T,311.3,{s:.7,y:0});
  SAT.forEach((s,i)=>{const el=$('u5s'+i),x=960+s[5],y=620+s[6];enter(el,T,saT[i]-.05,{s:.5,y:0});el.style.left=(x-el.offsetWidth/2)+'px';el.style.top=y+'px';link(U5L[i],U5D[i],T,saT[i]+.1,x,y,960,620,i*.25)});
});
const U5L=SAT.map(()=>mkline($('u5sv'))),U5D=SAT.map(()=>mkdot($('u5sv')));
saT.forEach(t=>cue(t+.1,'pop'));
