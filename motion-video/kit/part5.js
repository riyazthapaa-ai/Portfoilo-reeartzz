addCSS(`
.plan{position:absolute;width:660px;border-radius:28px;padding:30px 34px;font-family:Inter}
.ph{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.ph b{display:block;font-family:'Inter Display';font-size:32px;font-weight:800;letter-spacing:-.02em}.ph small{display:block;font-size:17px;color:rgba(255,255,255,.5);margin-top:2px}
.pf{position:relative;display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);margin-bottom:10px;font-size:21px}
.pf span{color:rgba(255,255,255,.5);font-weight:500}.pf em{font-style:normal;font-weight:700;position:relative}
.ck{display:flex;align-items:center;gap:12px;padding:10px 4px;font-size:20px;font-weight:500;color:rgba(255,255,255,.8)}
.ck i{width:24px;height:24px;border-radius:7px;border:2px solid rgba(255,255,255,.35);display:grid;place-items:center;flex:none}
.ck i svg{width:16px;height:16px;stroke:#062;stroke-width:3;fill:none}
.ck.new{border-radius:12px;padding:10px 12px;background:rgba(47,210,143,.10);border:1px solid rgba(47,210,143,.45)}
.ck.pend{border-radius:12px;padding:10px 12px;border:2px dashed rgba(255,200,87,.6);color:#ffd77a}
.tg{font-size:13px;font-weight:800;letter-spacing:.08em;padding:4px 9px;border-radius:8px;margin-left:auto}
.mail{position:absolute;left:1080px;top:330px;width:560px;border-radius:26px;padding:26px 30px;font-family:Inter}
.mail .mh2{display:flex;align-items:center;gap:14px;margin-bottom:16px}.mail .mh2 b{font-size:22px}.mail .mh2 small{display:block;font-size:16px;color:rgba(255,255,255,.5)}
.ml{padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.05);margin-top:10px;font-size:21px;font-weight:600}
.step{position:absolute;left:470px;width:820px;height:110px;border-radius:24px;display:flex;align-items:center;gap:22px;padding:0 30px;font-size:34px;font-weight:700;letter-spacing:-.02em}
.step .n{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;font-size:26px;font-weight:800;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);flex:none}
.watch{position:absolute;left:1380px;top:470px;width:300px;height:300px;border-radius:50%;display:grid;place-items:center;text-align:center}
.watch b{display:block;font-size:72px;font-weight:800;letter-spacing:-.03em}.watch small{font-family:Inter;font-size:20px;color:rgba(255,255,255,.55)}
.xstamp{position:absolute;padding:10px 26px;border:6px solid #ff6b6b;border-radius:16px;color:#ff6b6b;font-size:44px;font-weight:900;white-space:nowrap;background:rgba(7,8,15,.6)}
.vtag{position:absolute;padding:10px 18px;border-radius:14px;font-family:Inter;font-size:20px;font-weight:700;white-space:nowrap}
.prog{height:14px;border-radius:7px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:18px}.prog div{height:100%;border-radius:7px;background:linear-gradient(90deg,#7c5cff,#3ab8ff)}
`);
const OKs=`<svg viewBox="0 0 24 24">${ICON.check}</svg>`;
const plan=(id,x,y,ver)=>`<div class="plan glass" id="${id}" style="left:${x}px;top:${y}px">
 <div class="ph">${icx('target','#6ee7b7')}<div><b>Glow Serum · 60s Reel</b><small>Campaign plan</small></div></div>
 <div class="pf"><span>Deadline</span><em id="${id}dl">Fri 17 Oct</em></div>
 <div class="pf"><span>Deliverable</span><em>1 × 60s Reel</em></div>
 <div class="pf"><span>Talking points</span><em>Hydration · 3-step routine</em></div>
 <div style="margin-top:16px;font-size:16px;font-weight:700;letter-spacing:.14em;color:rgba(255,255,255,.45)">CONTENT CHECKLIST</div>
 <div class="ck"><i style="background:#2fd28f;border-color:#2fd28f">${OKs}</i>Hook script</div>
 <div class="ck"><i>${''}</i>B-roll: routine close-ups</div>
 <div class="ck"><i>${''}</i>Disclosure line</div>
 <div class="ck ${ver=='new'?'new':'pend'}" id="${id}cta"><i ${ver=='new'?'style="background:#2fd28f;border-color:#2fd28f"':''}>${ver=='new'?OKs:''}</i>${ver=='new'?'CTA: “Link in bio for 15% off”':'+ CTA requirement'}${ver=='new'?'<span class="tg" style="background:rgba(47,210,143,.2);color:#7ef0c0">NEW</span>':''}</div>
 ${ver=='new'?`<div class="prog"><div id="${id}bar"></div></div>`:''}
</div>`;
// ---- 1: the real test
scene('q1',171.55,175.7,HL(400,[['q1a',"But here's the [real test.]",120,'font-weight:800'],['q1b',"My projects {don't stay the same.}",100,'font-weight:800']]),(lt,T)=>{
  kin($('q1a'),T,171.71,173.4,.08);kin($('q1b'),T,173.59,1e9,.07);
});
// ---- 2: brand changes the deadline + adds a CTA
const chT=at('deadline',179.8),ctaT=at('c',182.5);
scene('q2',175.7,184.18,HL(120,[['q2a','A brand changes the [deadline] and adds a [new requirement.]',66],['q2b','The {deadline has changed,}',76],['q2c','and the brand added a {CTA requirement.}',76]])+plan('q2p',280,290,'old')+
  `<div class="mail glass" id="q2m"><div class="mh2">${icx('comment','#ffc857')}<div><b>Glow Serum team</b><small>Quick update on the Reel!</small></div></div><div class="ml" id="q2m1">📅 New deadline: <b style="color:#ff9a8a">Wed 15 Oct</b></div><div class="ml" id="q2m2">📣 Please add a CTA: “Link in bio for 15% off”</div></div>`,(lt,T)=>{
  kin($('q2a'),T,175.83,179.75,.05);kin($('q2b'),T,179.91,181.2,.06);kin($('q2c'),T,181.35,1e9,.05);
  enter($('q2p'),T,175.8,{y:70,s:.94});enter($('q2m'),T,176.6,{x:200,y:0,s:.9});
  enter($('q2m1'),T,at('deadline',177.5),{y:20,s:.9});enter($('q2m2'),T,at('requirement',178.8),{y:20,s:.9});
  const dl=$('q2pdl');const f=p(T,chT,.6);dl.style.color=f>0?'#ff8a7a':'';dl.style.transform=`translateX(${Math.sin(f*Math.PI*6)*8*(1-f)}px)`;
  dl.innerHTML=f>0?`<s style="opacity:.6">Fri 17 Oct</s> → Wed 15 Oct?`:'Fri 17 Oct';
  const c=$('q2pcta');c.style.display=T>ctaT?'flex':'none';const ck=back(p(T,ctaT,.5));c.style.opacity=clamp(ck*2)*(.75+.25*Math.sin(T*6));c.style.transform=`scale(${lerp(.7,1,ck)})`;
});
cue(176.8,'ding');cue(chT+.05,'error');cue(ctaT+.1,'pop');
// ---- 3: the manual way
const STEPS=[['Find the original campaign document','find',185.3],['Update it','update',187.5],['Check my checklist','check',188.3],['Make sure everything else is still correct','make',189.5]];
const stT=STEPS.map(s=>at(s[1],s[2]));
scene('q3',184.18,192.1,HL(130,[['q3a',"Normally, I'd have to…",84,'font-weight:600;color:rgba(255,255,255,.88)']])+
  STEPS.map((s,i)=>`<div class="step glass" id="q3s${i}" style="top:${300+i*140}px"><div class="n">${i+1}</div>${s[0]}</div>`).join('')+
  `<div class="watch glass" id="q3w"><div><b id="q3wt">0</b><small>minutes</small></div></div>`,(lt,T)=>{
  kin($('q3a'),T,184.31,1e9,.07);
  STEPS.forEach((s,i)=>enter($('q3s'+i),T,stT[i]-.05,{x:-120,y:0,s:.95}));
  enter($('q3w'),T,185.0,{s:.6});$('q3wt').textContent=Math.round(32*eio(p(T,185.3,6.0)));
  $('q3w').style.boxShadow=T>190?`0 0 0 ${3+2*Math.sin(T*8)}px rgba(255,107,107,.5)`:'';
});
stT.forEach(t=>cue(t+.15,'tick'));
// ---- 4: ask WorkBuddy to update the existing work
const q4s=at('update',195.8);
scene('q4',192.1,204.1,HL(110,[['q4a','Instead, I ask WorkBuddy to [update the existing work.]',70]])+
  `<div class="agentwin glass" id="q4w" style="top:240px;height:620px">${winBar()}<div class="pbub" id="q4pb" style="top:110px"></div></div>`,(lt,T)=>{
  kin($('q4a'),T,192.23,1e9,.05);
  const a=eo(p(T,192.6,.7));$('q4w').style.opacity=a;$('q4w').style.transform=`translateY(${(1-a)*60}px) scale(${lerp(.95,1,a)})`;
  const bb=eo(p(T,q4s-.35,.4));$('q4pb').style.opacity=bb;$('q4pb').style.transform=`scale(${lerp(.85,1,bb)})`;$('q4pb').style.transformOrigin='right bottom';
  Q4P.update(T);
});
const Q4P=promptBubble($('q4pb'),'Update the existing campaign plan with the new deadline and add the new CTA requirement to the content checklist. Keep everything else unchanged.',q4s,{2:'hl',3:'hl',4:'hl',7:'pa',8:'pa',12:'pa',13:'pa',14:'pa',19:'pa',20:'pa',21:'pa',22:'pa'});
// ---- 5: modify, not recreate
const scrT=at('scratch',208.9),modT=at('modify',210.4),soT=at('so',212.2);
scene('q5',204.1,215.42,HL(110,[['q5a','And this is an [important distinction.]',84,'font-weight:800'],['q5b','Not another version {from scratch…}',76],['q5c','…[modify the existing work.]',76],['q5d','So the project [continues from where it was.]',70]])+
  `<div class="plan glass" id="q5old" style="left:200px;top:330px;width:560px;opacity:.6"><div class="ph">${icx('copy','#8a8fa8')}<div><b style="font-size:28px">Campaign_plan_v2 (copy)</b><small>Rebuilt from scratch</small></div></div><div class="pf"><span>Deadline</span><em>?</em></div><div class="pf"><span>Talking points</span><em>?</em></div><div class="pf"><span>Checklist</span><em>re-do…</em></div></div>`+
  `<div class="xstamp" id="q5x" style="left:290px;top:520px">✕ NOT THIS</div>`+plan('q5p',980,250,'new')+
  `<div class="vtag" id="q5t1" style="left:1660px;top:383px;background:rgba(47,210,143,.18);color:#7ef0c0;border:1px solid rgba(47,210,143,.5)">UPDATED</div>`+
  `<div class="vtag" id="q5t2" style="left:1660px;top:455px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.55)">unchanged</div><div class="vtag" id="q5t3" style="left:1660px;top:527px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.55)">unchanged</div>`,(lt,T)=>{
  kin($('q5a'),T,204.24,206.2,.07);kin($('q5b'),T,206.4,209.5,.06);kin($('q5c'),T,209.68,212.15,.06);kin($('q5d'),T,soT,1e9,.05);
  const o=enter($('q5old'),T,206.6,{x:-100,y:0,s:.9});$('q5old').style.opacity=(+$('q5old').style.opacity*.75*(1-.4*p(T,scrT+.3,.5))).toFixed(3);
  const xs=p(T,scrT,.25);$('q5x').style.opacity=clamp(xs*3);$('q5x').style.transform=`rotate(-10deg) scale(${lerp(2.2,1,eo(xs))})`;
  enter($('q5p'),T,modT-.2,{x:100,y:0,s:.92});
  const dl=$('q5pdl');const u=p(T,modT+.3,.4);dl.innerHTML=u>0?'Wed 15 Oct':'Fri 17 Oct';dl.style.color=u>0?'#7ef0c0':'';dl.parentElement.style.borderColor=u>0?`rgba(47,210,143,${.6*u})`:'';
  const c=$('q5pcta');const ck=back(p(T,modT+.6,.5));c.style.opacity=clamp(ck*2);c.style.transform=`scale(${lerp(.6,1,ck)})`;
  enter($('q5t1'),T,modT+.35,{x:-30,y:0,s:.6});enter($('q5t2'),T,modT+.9,{x:-30,y:0,s:.6});enter($('q5t3'),T,modT+1.0,{x:-30,y:0,s:.6});
  $('q5pbar').style.width=(62+10*eio(p(T,soT+.3,2.2)))+'%';
});
cue(scrT+.05,'thud');cue(modT+.35,'ding');cue(modT+.65,'pop');cue(modT+.9,'tick');cue(modT+1.0,'tick');
