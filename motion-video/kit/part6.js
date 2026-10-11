addCSS(`
.ans{position:absolute;left:1000px;top:330px;width:700px;border-radius:28px;padding:32px 36px;font-family:Inter}
.ans .ah{display:flex;align-items:center;gap:16px;margin-bottom:20px}.ans .ah b{display:block;font-family:'Inter Display';font-size:30px;font-weight:800}.ans .ah small{display:block;font-size:17px;color:rgba(255,255,255,.5)}
.ans .due2{display:inline-block;padding:8px 14px;border-radius:12px;background:rgba(255,107,107,.14);border:1px solid rgba(255,107,107,.5);color:#ff9a8a;font-size:19px;font-weight:700;margin-bottom:18px}
.ans .qt{display:block;font-size:26px;line-height:1.45;font-weight:600;padding:20px 24px;border-left:4px solid #8f7dff;background:rgba(143,125,255,.08);border-radius:0 14px 14px 0}
.ans .srcs{margin-top:20px;font-size:16px;color:rgba(255,255,255,.5);display:flex;gap:10px;align-items:center}
.ans .srcs span{padding:5px 10px;border-radius:8px;background:rgba(255,255,255,.06)}
.tbar{position:absolute;left:310px;top:560px;width:1300px;height:110px;border-radius:24px;overflow:hidden;display:flex}
.tbar div{height:100%;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;white-space:nowrap;overflow:hidden}
.sbar2{position:absolute;left:510px;top:400px;width:900px;height:100px;border-radius:50px;display:flex;align-items:center;gap:20px;padding:0 36px;font-family:Inter;font-size:32px;color:rgba(255,255,255,.6)}
.fold2{position:absolute;width:150px;text-align:center;font-family:Inter;font-size:18px;color:rgba(255,255,255,.6)}
.fold2 svg{width:110px;height:88px;display:block;margin:0 auto 6px}
`);
// ---- 1: a different question
const friT=at('friday',220.8);
scene('r1',215.42,221.85,HL(150,[['r1a','Now, a completely [different question.]',84,'font-weight:800'],['r1b','Which campaign needs attention before {Friday?}',76]])+
  `<div class="abs center" style="top:440px"><div id="r1days" style="display:flex;gap:28px">${['MON','TUE','WED','THU','FRI'].map(d=>`<div class="day glass"><b>${d}</b><div class="q"></div><div class="q"></div><div class="q"></div></div>`).join('')}</div></div>`,(lt,T)=>{
  kin($('r1a'),T,215.6,218.25,.07);kin($('r1b'),T,218.44,1e9,.05);
  [...$('r1days').children].forEach((d,i)=>{enter(d,T,218.6+i*.07,{y:70,s:.85});const on=i==4?eo(p(T,friT,.35)):0;
    d.style.borderColor=on?`rgba(255,107,107,${on})`:'';d.style.boxShadow=on?`0 0 ${60*on}px rgba(255,107,107,${.45*on})`:'';d.firstChild.style.color=on?'#ff9a8a':'';
    if(i==4)d.style.transform+=` scale(${1+.08*on})`;else d.style.opacity=(+d.style.opacity*(1-.5*on)).toFixed(3)});
});
[0,1,2,3,4].forEach(i=>cue(218.8+i*.07,'tick'));cue(friT+.05,'pop');
// ---- 2: the prompt
const r2s=at('which',223);
scene('r2',221.85,228.45,`<div class="abs center label" style="top:150px" id="r2l">So I'll ask</div><div class="agentwin glass" id="r2w" style="top:270px;height:440px">${winBar()}<div class="pbub" id="r2pb" style="top:130px"></div></div>`,(lt,T)=>{
  const l=eo(p(T,221.96,.4));$('r2l').style.opacity=l;
  const a=eo(p(T,221.9,.7));$('r2w').style.opacity=a;$('r2w').style.transform=`translateY(${(1-a)*60}px) scale(${lerp(.95,1,a)})`;
  const bb=eo(p(T,r2s-.35,.4));$('r2pb').style.opacity=bb;$('r2pb').style.transform=`scale(${lerp(.85,1,bb)})`;$('r2pb').style.transformOrigin='right bottom';
  R2P.update(T);
});
const R2P=promptBubble($('r2pb'),'Which campaign needs a revision before Friday, and what exactly does the brand want changed?',r2s,{4:'pa',5:'pa',6:'pa',8:'pa',9:'pa',13:'pa',14:'pa'});
// ---- 3: no searching, just asked
const srT=at('searching',229.5),jaT=at('i',231.5);
const FOLD=(c)=>`<svg viewBox="0 0 100 80"><path d="M6 10a5 5 0 0 1 5-5h22l8 8h48a5 5 0 0 1 5 5v52a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5z" fill="${c}" opacity=".55"/><path d="M6 24a5 5 0 0 1 5-5h78a5 5 0 0 1 5 5v46a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5z" fill="${c}"/></svg>`;
scene('r3',228.45,232.98,HL(150,[['r3a',"Again, I didn't go {searching through my files} first.",72],['r3b','I just [asked the question.]',90,'font-weight:800']])+
  `<div class="sbar2 glass" id="r3s">${svg('search','stroke:rgba(255,255,255,.6)')}<span>Searching through my files…</span><div class="xline" id="r3x" style="left:30px;right:30px"></div></div>`+
  ['Briefs','Scripts','Feedback','Campaigns','Old'].map((n,i)=>`<div class="fold2" id="r3f${i}" style="left:${470+i*200}px;top:600px">${FOLD('#4f8dff')}${n}</div>`).join(''),(lt,T)=>{
  kin($('r3a'),T,228.6,jaT-.25,.05);kin($('r3b'),T,jaT,1e9,.07);
  enter($('r3s'),T,228.8,{y:30,s:.9,out:jaT,outDur:.4});$('r3x').style.transform=`scaleX(${eio(p(T,srT+.6,.4))})`;
  [0,1,2,3,4].forEach(i=>{enter($('r3f'+i),T,229.0+i*.06,{y:40,s:.6,out:jaT,outDur:.4});$('r3f'+i).style.filter=`grayscale(${p(T,srT+.6,.4)})`});
});
cue(srT+.7,'tick');
// ---- 4: agent pulls the relevant briefs, scripts, review info -> answer
const SRC6=[['Sponsorship briefs','doc','#ff6b6b','briefs',234.5],['Scripts','film','#5fd8ff','scripts',235.2],['Review notes','comment','#ffc857','review',235.9]];
const s6T=SRC6.map(s=>at(s[3],s[4])),ansT=at('available',237.4);
scene('r4',232.98,239.2,HL(130,[['r4a','The agent pulls the relevant [briefs, scripts & review notes.]',64]])+
  `<svg id="r4sv" class="abs" width="1920" height="1080" style="left:0;top:0"></svg>`+SRC6.map((s,i)=>`<div class="chipc glass" id="r4c${i}" style="left:180px;top:${440+i*130}px;margin:0">${icx(s[1],s[2])}${s[0]}</div>`).join('')+`<div id="r4o"></div>`+
  `<div class="ans glass" id="r4ans"><div class="ah">${icx('film','#ffc857')}<div><b>Nova Audio · YouTube</b><small>Integration script</small></div></div><div class="due2">Revision due Thu 16 Oct</div><div class="qt">“Shorten the intro to 10 seconds and mention battery life earlier.”</div><div class="srcs">Sources: <span>Brief</span><span>Script v3</span><span>Review notes</span></div></div>`,(lt,T)=>{
  kin($('r4a'),T,233.08,1e9,.05);
  SRC6.forEach((s,i)=>{enter($('r4c'+i),T,s6T[i]-.05,{x:-80,y:0});link(R4L[i],R4D[i],T,s6T[i]+.3,180+$('r4c'+i).offsetWidth+8,471+i*130,760,600,i*.3)});
  R4O.update(T,233.4,760,600);
  enter($('r4ans'),T,ansT,{x:80,y:0,s:.92});link(R4L[3],null,T,ansT-.2,760,600,1000,600);
});
const R4L=[0,1,2,3].map(()=>mkline($('r4sv'))),R4D=[0,1,2].map(()=>mkdot($('r4sv')));const R4O=orb($('r4o'),'Agent');
s6T.forEach(t=>cue(t+.15,'pop'));cue(ansT+.1,'ding');
// ---- 5: don't spend half my time preparing context
const halfT=at('half',243.4),ctxT=at('context',244.9);
scene('r5',239.2,247.1,HL(150,[['r5a','That’s the workflow I actually [want from AI.]',80],['r5b',"I don't want to spend {half my time} preparing context.",72]])+
  `<div class="tbar glass" id="r5bar"><div id="r5c" style="background:linear-gradient(90deg,rgba(255,107,107,.55),rgba(255,138,122,.4))">Preparing context</div><div id="r5w" style="background:linear-gradient(90deg,rgba(124,92,255,.6),rgba(58,168,255,.5))">Actual work</div></div>`+
  `<div class="abs center" style="top:710px;font-family:Inter;font-size:24px;color:rgba(255,255,255,.55)" id="r5cap">My time</div>`,(lt,T)=>{
  kin($('r5a'),T,239.32,242.3,.06);kin($('r5b'),T,242.44,1e9,.05);
  enter($('r5bar'),T,halfT-.3,{y:40,s:.9});$('r5cap').style.opacity=eo(p(T,halfT,.4));
  const sh=eio(p(T,ctxT+.6,1.0)),cw=lerp(50,7,sh);$('r5c').style.width=cw+'%';$('r5w').style.width=(100-cw)+'%';
  $('r5c').textContent=sh>.5?'':'Preparing context';$('r5w').textContent=sh>.5?'Actual work ✓':'Actual work';
  $('r5cap').textContent=sh>.5?'With the context already in my Library':'My time';
});
cue(halfT,'pop');cue(ctxT+.7,'tick');cue(ctxT+1.5,'ding');
