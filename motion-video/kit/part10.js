addCSS(`
.pl10{position:absolute;left:0;top:0;height:76px;padding:0 26px 0 14px;margin:-38px 0 0 0;border-radius:22px;display:flex;align-items:center;gap:12px;font-family:Inter;font-size:24px;font-weight:700;white-space:nowrap}
.pl10 .ic{width:46px;height:46px;border-radius:14px}.pl10 svg.i{width:26px;height:26px}
.pl10.gray{filter:grayscale(1);opacity:.7}
.arw{position:absolute;left:0;top:0;width:36px;height:36px;margin:-18px 0 0 -18px}
.arw svg{width:36px;height:36px;stroke:rgba(255,255,255,.4);stroke-width:2.4;fill:none}
.rowlbl{position:absolute;left:0;right:0;text-align:center;font-family:Inter;font-size:20px;font-weight:700;letter-spacing:.24em;text-transform:uppercase}
.stepc{position:absolute;top:470px;width:360px;height:250px;border-radius:28px;padding:28px;font-size:30px;font-weight:700;letter-spacing:-.02em;line-height:1.2}
.stepc .ic{width:64px;height:64px;border-radius:18px;margin-bottom:20px}.stepc svg.i{width:34px;height:34px}
.stepc .num{position:absolute;right:24px;top:22px;font-family:Inter;font-size:20px;font-weight:800;color:rgba(255,255,255,.35)}
.track{position:absolute;left:150px;top:790px;width:1620px;height:10px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden}
.track div{height:100%;border-radius:5px;background:linear-gradient(90deg,#7c5cff,#3ab8ff)}
.zero{position:absolute;left:860px;top:430px;width:200px;height:200px;border-radius:50%;display:grid;place-items:center;font-size:150px;font-weight:800;color:rgba(255,255,255,.5);border:3px solid rgba(255,255,255,.2)}
.trybtn{position:absolute;left:660px;top:600px;width:600px;height:110px;border-radius:55px;display:flex;align-items:center;justify-content:center;gap:18px;font-size:42px;font-weight:800;background:linear-gradient(135deg,#7c5cff,#3ab8ff);box-shadow:0 30px 80px rgba(110,90,255,.5)}
.trybtn svg{width:40px;height:40px;stroke:#fff;stroke-width:2.6;fill:none}
.desc{position:absolute;left:0;right:0;top:760px;display:flex;flex-direction:column;align-items:center;gap:6px;font-family:Inter;font-size:28px;font-weight:600;color:rgba(255,255,255,.75)}
.desc svg{width:44px;height:44px;stroke:#8fe6ff;stroke-width:2.4;fill:none}
.subbtn{position:absolute;left:760px;top:560px;width:400px;height:104px;border-radius:52px;display:flex;align-items:center;justify-content:center;gap:16px;font-size:38px;font-weight:800;background:#ff3b3b;box-shadow:0 30px 70px rgba(255,59,59,.4)}
.subbtn svg{width:36px;height:36px;stroke:#fff;stroke-width:2.2;fill:none}
`);
const CUR=`<svg viewBox="0 0 24 24" style="width:44px;height:44px"><path d="M4 3l7 18 2.5-7.5L21 11z" fill="#fff" stroke="#111" stroke-width="1.2"/></svg>`;
// ---- 1: traditional AI vs real work
const TR=[['Prompt','chat','prompt',350.7],['Generate','spark','generate',351.3],['Done','check','done',352]];
const RW=[['Create','plus','create',354.1],['Save','save','save',354.7],['Edit','edit','edit',355.1],['Collaborate','user','collaborate',355.7],['Update','redo','update',356.4],['Publish','send','publish',357],['Reuse','copy','reuse',357.5]];
const trT=TR.map(c=>at(c[2],c[3])),rwT=RW.map(c=>at(c[2],c[3])),tradT=at('traditional',348.6),butT10=at('but',352.7);
scene('x1',343.85,358.5,HL(150,[['x1a','So if I compare this to how I normally use AI…',72,'font-weight:600;color:rgba(255,255,255,.88)'],['x1b','…the difference is [pretty simple.]',90,'font-weight:800']])+
  `<div class="rowlbl" id="x1l1" style="top:340px;color:rgba(255,255,255,.5)">Traditional AI</div><div class="rowlbl" id="x1l2" style="top:600px;color:#a493ff">Real work</div>`+
  `<svg id="x1sv" class="abs" width="1920" height="1080" style="left:0;top:0"><path id="x1loop" fill="none" stroke="#8f7dff" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 12"/></svg>`+
  TR.map((c,i)=>`<div class="pl10 glass gray" id="x1t${i}">${icx(c[1],'#a0a4b8')}${c[0]}</div>`).join('')+RW.map((c,i)=>`<div class="pl10 glass" id="x1r${i}">${icx(c[1],['#a493ff','#5fd8ff','#6ee7b7','#ffc857','#7c9cff','#ff8a7a','#c9bfff'][i])}${c[0]}</div>`).join('')+
  [0,1].map(i=>`<div class="arw" id="x1ta${i}"><svg viewBox="0 0 24 24">${ICON.arrow}</svg></div>`).join('')+[0,1,2,3,4,5].map(i=>`<div class="arw" id="x1ra${i}"><svg viewBox="0 0 24 24">${ICON.arrow}</svg></div>`).join(''),(lt,T)=>{
  kin($('x1a'),T,344.05,346.75,.05);kin($('x1b'),T,346.93,tradT-.2,.07);
  $('x1l1').style.opacity=eo(p(T,tradT,.4));$('x1l2').style.opacity=eo(p(T,butT10,.4));
  const lay=(ids,y,gap)=>{const ws=ids.map(id=>$(id).offsetWidth);const tot=ws.reduce((a,b)=>a+b,0)+gap*(ids.length-1);let x=960-tot/2;return ids.map((id,i)=>{const r=[x,y,ws[i]];x+=ws[i]+gap;return r})};
  const tp=lay(['x1t0','x1t1','x1t2'],430,80),rp=lay(RW.map((c,i)=>'x1r'+i),690,46);
  TR.forEach((c,i)=>{const el=$('x1t'+i);el.style.left=tp[i][0]+'px';el.style.top=tp[i][1]+'px';enter(el,T,trT[i]-.05,{y:30,s:.6});el.style.opacity=(+el.style.opacity*.75).toFixed(3)});
  [0,1].forEach(i=>{const a=$('x1ta'+i);a.style.left=(tp[i][0]+tp[i][2]+40)+'px';a.style.top='430px';a.style.opacity=eo(p(T,trT[i+1]-.15,.3))*.8});
  RW.forEach((c,i)=>{const el=$('x1r'+i);el.style.left=rp[i][0]+'px';el.style.top=rp[i][1]+'px';enter(el,T,rwT[i]-.05,{y:30,s:.6});const on=1-p(T,rwT[i],.6);el.style.boxShadow=T>rwT[i]?`0 0 0 2px rgba(143,125,255,${.3+.5*on})`:''});
  [0,1,2,3,4,5].forEach(i=>{const a=$('x1ra'+i);a.style.left=(rp[i][0]+rp[i][2]+23)+'px';a.style.top='690px';a.style.opacity=eo(p(T,rwT[i+1]-.15,.3))});
  const x0=rp[0][0]+rp[0][2]/2,x6=rp[6][0]+rp[6][2]/2;$('x1loop').setAttribute('d',`M${x6} 730 C${x6} 860, ${x0} 860, ${x0} 730`);
  const lp=$('x1loop'),L=lp.getTotalLength(),k=eio(p(T,rwT[6]+.3,.6));lp.style.strokeDasharray=k<1?`${L*k} ${L}`:'10 12';lp.style.strokeDashoffset=k<1?0:-T*40;lp.style.opacity=k;
});
trT.forEach(t=>cue(t+.1,'tick'));rwT.forEach(t=>cue(t+.1,'tick'));cue(rwT[6]+.5,'ding');
// ---- 2: AI should stay in the work
const aiT=at('ai',361.8),itT=at('it',364.2);
scene('x2',358.5,365.95,`<div class="abs center" style="top:300px"><div class="wm" id="x2wm" style="transform-origin:center"><div class="logo"><svg class="i" viewBox="0 0 24 24">${ICON.spark}</svg></div><div class="wmtext" style="font-size:120px">Work<span class="acc">Buddy</span></div></div></div>`+
  HL(560,[['x2a','The idea that [stood out to me:]',76],['x2b','AI shouldn’t just [generate] your work.',92,'font-weight:800']])+HL(420,[['x2c','It should {stay in the work.}',140,'font-weight:800']]),(lt,T)=>{
  const w=back(p(T,358.7,.6)),wo=eio(p(T,itT-.2,.4));$('x2wm').style.opacity=clamp(w*2)*(1-wo);$('x2wm').style.transform=`scale(${lerp(.6,1,w)*lerp(1,.8,wo)})`;
  kin($('x2a'),T,358.9,aiT-.2,.05);kin($('x2b'),T,aiT,itT-.2,.06);kin($('x2c'),T,itT,1e9,.09);
});
cue(358.8,'shimmer');cue(itT+.6,'pop');
// ---- 3: instead of starting from zero
const ST=[['Keep my project materials together','lib','#a493ff','i',368.5],['Let the agent work from that context','spark','#5fd8ff','let',371.1],['Continue editing the existing work','edit','#6ee7b7','continue',373.6],['Keep moving the project forward','arrow','#ffc857','and',375.7]];
const sT=ST.map(s=>at(s[3],s[4])),zeroT=at('zero',367.1);
scene('x3',365.95,377.6,HL(160,[['x3a','Instead of starting from {zero} every time…',80],['x3b','I can:',64,'font-weight:600;color:rgba(255,255,255,.8)']])+
  `<div class="zero glass" id="x3z">0<div class="xline" id="x3zx" style="left:20px;right:20px;transform-origin:left center"></div></div>`+
  ST.map((s,i)=>`<div class="stepc glass" id="x3s${i}" style="left:${150+i*420}px"><span class="num">0${i+1}</span>${icx(s[1],s[2])}<div>${s[0]}</div></div>`).join('')+`<div class="track" id="x3tr"><div id="x3tb"></div></div>`,(lt,T)=>{
  kin($('x3a'),T,366.12,sT[0]-.25,.05);kin($('x3b'),T,sT[0],1e9,.06);
  enter($('x3z'),T,zeroT-.3,{s:.5,y:0,out:sT[0]-.3,outDur:.3});$('x3zx').style.transform=`rotate(-30deg) scaleX(${eio(p(T,zeroT+.4,.3))})`;
  ST.forEach((s,i)=>{enter($('x3s'+i),T,sT[i]-.05,{y:60,s:.85});const on=T>sT[i]&&T<(sT[i+1]||1e9);$('x3s'+i).style.borderColor=on?s[2]+'aa':''});
  $('x3tr').style.opacity=eo(p(T,sT[0],.4));$('x3tb').style.width=(100*eio(p(T,sT[0],377.1-sT[0])))+'%';
});
cue(zeroT+.45,'tick');sT.forEach(t=>cue(t+.1,'pop'));
// ---- 4: outro / CTA
const tryT=at('if',377.6),linkT=at('ill',380.5),moreT=at('and',382.6),subT=at('subscribe',386.4),seeT=at('see',387);
scene('x4',377.6,389.65,`<div class="abs center" style="top:330px"><div class="wm" id="x4wm"><div class="logo" style="width:110px;height:110px"><svg class="i" viewBox="0 0 24 24">${ICON.spark}</svg></div><div class="wmtext" style="font-size:120px">Work<span class="acc">Buddy</span></div></div></div>`+
  `<div class="trybtn" id="x4try">Try it for your workflow<svg viewBox="0 0 24 24">${ICON.arrow}</svg></div><div class="desc" id="x4desc">Link in the description<svg viewBox="0 0 24 24">${ICON.down}</svg></div>`+
  HL(300,[['x4a','More [practical AI workflows] like this',80],['x4c','See you in the [next one.]',100,'font-weight:800']])+
  `<div class="subbtn" id="x4sub"><svg viewBox="0 0 24 24">${ICON.play}</svg><span id="x4st">Subscribe</span></div><div class="abs" id="x4cur" style="left:0;top:0">${CUR}</div>`,(lt,T)=>{
  const wo=eio(p(T,moreT-.2,.4));
  const w=back(p(T,tryT,.6));$('x4wm').style.opacity=clamp(w*2)*(1-wo);$('x4wm').style.transform=`scale(${lerp(.6,1,w)})`;
  enter($('x4try'),T,tryT+.5,{y:40,s:.8,out:moreT-.2,outDur:.4});$('x4try').style.boxShadow=`0 30px ${80+20*Math.sin(T*4)}px rgba(110,90,255,.5)`;
  enter($('x4desc'),T,linkT,{y:-20,s:.8,out:moreT-.2,outDur:.4});$('x4desc').lastChild.style.transform=`translateY(${Math.abs(Math.sin(T*4))*12}px)`;
  kin($('x4a'),T,moreT,seeT-.2,.05);kin($('x4c'),T,seeT,1e9,.07);
  const sb=back(p(T,moreT+.8,.55));const press=p(T,subT+.4,.25);const sbo=1-eio(p(T,seeT-.2,.4));
  $('x4sub').style.opacity=clamp(sb*2)*sbo;$('x4sub').style.transform=`scale(${lerp(.6,1,sb)*(1-.08*Math.sin(Math.PI*press))})`;
  const done=T>subT+.55;$('x4sub').style.background=done?'#2a2d3d':'#ff3b3b';$('x4st').textContent=done?'Subscribed ✓':'Subscribe';$('x4sub').firstChild.innerHTML=done?ICON.bell:ICON.play;
  const cm=eio(p(T,subT-.5,.85));$('x4cur').style.opacity=T>subT-.5?sbo:0;$('x4cur').style.transform=`translate(${lerp(1400,1010,cm)}px,${lerp(900,630,cm)}px) scale(${1-.15*Math.sin(Math.PI*press)})`;
});
cue(tryT+.1,'shimmer');cue(tryT+.6,'pop');cue(linkT+.1,'tick');cue(moreT+.9,'pop');cue(subT+.45,'pop');cue(subT+.6,'ding');
FADE=t=>eio(p(t,388.35,1.3));
