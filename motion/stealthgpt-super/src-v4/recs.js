// Splices the real screen recording (rec/f_00001.jpg… at 24 fps) into the scene list.
// clip: {id, s0: source start (s), rate: source seconds per video second, s1: source end}
(function(){
const SC=window.SCENES;
const at=s=>SC.findIndex(x=>Math.abs(x.s-s)<0.01);
const flat=c=>cam(c,c);
const VID=(id,w,h)=>`<div class="recf" style="width:${w}px;height:${h}px"><img class="vid" id="${id}" alt=""></div>`;
const LBL=(t,txt,em)=>A(t,'spring',`<div class="pillw" style="font-size:30px"><span class="em">${em}</span>${txt}</div>`);
const DUMMY=ids=>ids.map(i=>`<div id="${i}" style="display:none"><i></i></div>`).join('');
function REC(s,e,bg,tr,clip,label,extra,camc){
  return {s,e,bg,tone:bg==='white'?'light':'dark',tr,noBeats:true,cam:camc||cam({rx:6,ry:-5,rz:-1.2,z:-60,x:0,y:0},{rx:3,ry:4,rz:.8,z:10,x:0,y:0}),
    clips:[{id:clip.id,s0:clip.s0,rate:clip.rate,s1:clip.s1}],
    html:`${A(s,'flip',VID(clip.id,1560,878),'position:absolute;top:150px')}
      ${label?`<div class="abs" style="top:50px;left:0;width:1920px;display:flex;justify-content:center">${LBL(s+.1,label[0],label[1])}</div>`:''}${extra||''}`};
}
const out=[];
SC.forEach(sc=>{
  const s=sc.s;
  if(Math.abs(s-122.3)<.01){ // prompt + draft
    out.push(REC(122.3,124.9,'grad','zoom',{id:'v1',s0:41.5,rate:2.1,s1:47.2},['The prompt · ChatGPT','💬']));
    out.push(REC(124.9,138.2,'white','whip',{id:'v2',s0:50,rate:.94,s1:62.6},['First draft · straight from AI','🤖'],
      `${A(125.8,'stamp',`<div class="pillw" style="font-size:30px;background:#34d97f;color:#063"><span class="em">💾</span>Saved: original version</div>`,'position:absolute;right:120px;bottom:70px')}
       ${A(130.3,'spring',`<div class="pillw" style="font-size:30px"><span class="em">✅</span>Real AI text &mdash; not written to game a detector</div>`,'position:absolute;left:120px;bottom:70px')}`));
    return;
  }
  if(Math.abs(s-138.2)<.01){ // into SUPER
    out.push(REC(138.2,142.3,'blue','whip',{id:'v3',s0:63,rate:1.02,s1:67.3},['Same draft → StealthGPT · SUPER','⚡']));
    out.push({s:142.3,e:152.4,bg:'white',tone:'light',tr:'zoom',cam:cam({rx:8,ry:10,rz:0,z:-60,x:0,y:0},{rx:4,ry:-6,rz:0,z:30,x:0,y:0}),html:`
      ${A(142.4,'up',`<div class="t2" style="text-align:center"><span style="font-size:56px;font-weight:600;letter-spacing:-1px">Not just: does the wording change?</span><br><span class="gB">What I&rsquo;m checking</span></div>`,'position:absolute;top:170px')}
      <div class="row abs" style="top:520px;left:0;width:1920px;justify-content:center;gap:30px">
       ${A(146.6,'flip',C3('blue','Same ideas?','💬',[],520,300))}
       ${A(149.8,'flip',C3('purple','Reads naturally?','🗣️',[],520,300))}
       ${A(151.6,'flip',C3('orange','Still useful?','🎯',[],520,300))}
      </div>${DUMMY(['runbtn','runbar','runpct','cursor'])}`});
    out.push(REC(152.4,155.6,'grad','whip',{id:'v4',s0:67.2,rate:3.06,s1:77.5},['Humanizing with SUPER','✨'],
      A(155.0,'slam',`<div class="t1" style="color:#fff;text-shadow:0 10px 40px rgba(0,0,0,.4)">Let&rsquo;s run it.</div>`,'position:absolute;top:440px')));
    return;
  }
  if(Math.abs(s-155.6)<.01){ // side by side
    out.push({s:155.6,e:173.5,bg:'grad',tone:'dark',tr:'burst',noBeats:true,cam:cam({rx:8,ry:0,rz:0,z:-60,x:0,y:20},{rx:4,ry:0,rz:0,z:10,x:0,y:-10}),
      clips:[{id:'v5a',s0:50,rate:.67,s1:62.4},{id:'v5b',s0:78,rate:1,s1:96}],html:`
      <div class="abs" style="top:60px;left:0;width:1920px;display:flex;justify-content:center">${LBL(155.8,'Here&rsquo;s the result &middot; side by side','🎉')}</div>
      <div class="row abs" style="top:190px;left:0;width:1920px;justify-content:center;gap:40px">
       ${A(156.9,'flip',`<div class="col" style="gap:14px"><div class="sm" style="opacity:.9">Original &middot; AI draft</div>${VID('v5a',880,495)}</div>`,'transform-style:flat')}
       ${A(157.3,'flip',`<div class="col" style="gap:14px"><div class="sm">Processed &middot; <b class="gG">SUPER</b></div><div class="ui" style="border-radius:30px;padding:0;background:none;box-shadow:none">${VID('v5b',880,495)}</div></div>`,'transform-style:flat')}
      </div>
      <div id="scanbox" class="abs sel" style="position:absolute;left:0;top:0;opacity:0;padding:0;background:rgba(255,208,74,.18);outline-color:#ffd04a"></div>
      <div class="row abs" style="bottom:110px;left:0;width:1920px;justify-content:center;gap:20px">
       ${A(160.0,'spring',`<div class="pillw" style="font-size:28px">① Opening</div>`)}
       ${A(161.3,'spring',`<div class="pillw" style="font-size:28px">② Structure</div>`)}
       ${A(162.6,'spring',`<div class="pillw" style="font-size:28px">③ Transitions</div>`)}
       ${A(163.8,'spring',`<div class="pillw" style="font-size:28px">④ Info kept?</div>`)}
      </div>
      ${A(166.4,'slam',`<div class="uiw" style="padding:56px 76px;text-align:center"><div class="cap" style="color:#ff5e00;opacity:1">for professional writing</div><div class="t2" style="margin-top:18px;font-size:76px">New wording + confusing text<br>= <span class="gO">not an improvement</span> <span class="em">🙅</span></div></div>`,'position:absolute;top:300px')}`});
    return;
  }
  if(Math.abs(s-173.5)<.01){ // both versions over the SUPER output
    out.push(REC(173.5,187.65,'white','whip',{id:'v6',s0:96,rate:1.27,s1:114.2},['Same writing · a different approach','🔀'],
      `<div class="row abs" style="bottom:60px;left:0;width:1920px;justify-content:center;gap:24px">
        ${A(179.4,'spring',`<div class="pillw"><span class="em">📖</span>Easier to read</div>`)}
        ${A(181.4,'spring',`<div class="pillw"><span class="em">🧩</span>Original ideas kept</div>`)}
        ${A(185.0,'spring',`<div class="pillw" style="background:#ff2d55;color:#fff"><span class="em">🔥</span>Next: the test</div>`)}</div>`));
    return;
  }
  if(Math.abs(s-191.4)<.01){ // detector: submit, disclaimer, detect
    out.push(REC(191.4,198.6,'white','burst',{id:'v7',s0:115.8,rate:.62,s1:120.3},['ZeroGPT · submitting the processed text','🔍']));
    out.push({s:198.6,e:210.4,bg:'white',tone:'light',tr:'zoom',cam:cam({rx:8,ry:10,rz:0,z:-60,x:0,y:0},{rx:4,ry:-6,rz:0,z:20,x:0,y:0}),html:`
      <div class="col abs" style="top:170px;left:0;width:1920px;align-items:center;gap:36px">
       ${A(198.8,'flip',C3('gold','Remember','⚠️',[],900,300))}
       ${A(200.0,'up',`<div class="t3" style="text-align:center;width:1400px">AI detectors are <u>not</u> definitive proof of who wrote something.</div>`)}
       ${A(204.5,'spring',`<div class="pillw" style="font-size:32px"><span class="em">🔀</span>Different tools &rarr; different results &middot; one scan &ne; a universal verdict</div>`)}
      </div>${DUMMY(['laser','scanst','recdot'])}`});
    out.push(REC(210.4,212.3,'grad','whip',{id:'v8',s0:119.8,rate:.95,s1:121.6},['Detect text','⏳']));
    return;
  }
  if(Math.abs(s-212.3)<.01){ // detector result: footage, then summary card
    out.push(REC(212.3,216.4,'gold','burst',{id:'v9',s0:121.6,rate:.95,s1:125.6},null,
      A(213.9,'stamp',`<div class="pillw" style="font-size:36px;background:#34d97f;color:#063"><span class="em">✅</span>ZeroGPT: 8.6% AI GPT* &middot; &ldquo;Human written&rdquo;</div>`,'position:absolute;top:50px')));
    out.push(REC(216.4,222.3,'white','whip',{id:'v10',s0:126,rate:2.7,s1:142},['The assessment &mdash; alongside the actual text','👀']));
    sc.s=222.3;sc.tr='zoom';
    sc.html=sc.html.replace('&#10003;</text>','8.6%</text>').replace('font-size="100">8.6%','font-size="84">8.6%')
      .replace('Scan complete','Your text is Human written').replace(`The detector&rsquo;s assessment &mdash; alongside the actual text`,`ZeroGPT &middot; 8.6% AI GPT*`);
    out.push(sc);return;
  }
  if(Math.abs(s-230.75)<.01){ // StealthGPT product demo
    out.push(REC(230.75,245.1,'blue','whip',{id:'v11',s0:4,rate:1.81,s1:30.2},['StealthGPT &middot; product demo','🎬'],
      `${A(238.8,'spring',`<div class="pillw" style="font-size:30px"><span class="em">🧪</span>Try it on <b>&nbsp;your own&nbsp;</b> writing</div>`,'position:absolute;bottom:40px')}${DUMMY(['play','demobar'])}`));
    return;
  }
  out.push(sc);
});
SC.length=0;out.forEach(x=>SC.push(x));
})();
