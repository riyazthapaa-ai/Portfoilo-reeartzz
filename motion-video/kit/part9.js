addCSS(`
.biglib{position:absolute;left:810px;top:400px;width:300px;height:300px;border-radius:80px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(124,92,255,.35),rgba(58,168,255,.25));border:1px solid rgba(143,125,255,.6)}
.biglib svg.i{width:150px;height:150px;stroke-width:1.2;stroke:#e4deff}
.drop{position:absolute;left:560px;top:420px;width:800px;height:300px;border-radius:30px;border:3px dashed rgba(255,255,255,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font-family:Inter;font-size:30px;font-weight:600;color:rgba(255,255,255,.6)}
.drop svg.i{width:70px;height:70px;stroke:rgba(255,255,255,.6)}
.row9{position:absolute;left:260px;width:1400px;height:124px;border-radius:26px;display:flex;align-items:center;gap:26px;padding:0 34px;font-size:40px;font-weight:700;letter-spacing:-.02em}
.row9 .old{width:70px;height:70px;border-radius:20px;display:grid;place-items:center;background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.4);position:relative;flex:none}
.row9 .old svg.i{width:36px;height:36px;stroke:#ff8a7a}
.row9 .old:after{content:'';position:absolute;left:10px;right:10px;top:50%;height:4px;margin-top:-2px;background:#ff6b6b;transform:rotate(-45deg);border-radius:2px}
.row9 .okc{margin-left:auto;width:58px;height:58px;border-radius:50%;background:#2fd28f;display:grid;place-items:center;flex:none}
.row9 .okc svg{width:34px;height:34px;stroke:#063;stroke-width:3;fill:none}
.libw{position:absolute;left:640px;top:330px;width:640px;height:480px;border-radius:30px;overflow:hidden}
`);
// ---- 1: why the library matters / not just uploads
const notT9=at('its',318.2);
scene('w1',315.2,321.7,HL(150,[['w1a','This is the real reason the [Library] matters.',80],['w1b','It’s not simply {“a place to upload my files.”}',76]])+
  `<div class="biglib" id="w1l">${svg('lib')}</div><div class="drop" id="w1d">${svg('upload')}Drop files here to upload<div class="xline" id="w1x" style="left:40px;right:40px"></div></div>`,(lt,T)=>{
  kin($('w1a'),T,315.33,318.1,.06);kin($('w1b'),T,318.29,1e9,.05);
  enter($('w1l'),T,315.6,{s:.5,y:0,out:318.3,outDur:.4});$('w1l').style.boxShadow=`0 0 ${60+20*Math.sin(T*3)}px rgba(124,92,255,.5)`;
  enter($('w1d'),T,318.6,{s:.85,y:30});$('w1x').style.transform=`scaleX(${eio(p(T,320.9,.35))})`;$('w1d').style.filter=`grayscale(${p(T,320.9,.4)})`;
});
cue(315.7,'pop');cue(318.7,'tick');cue(321.0,'tick');
// ---- 2: the four "I don't have to…" lines
const R9=[['I don’t have to find the same files again.','search','its',321.7,'again',323.4],['…or repeatedly feed the same context to AI.','chat','i',324.1,'ai',326.8],['…or create a new version every time something changes.','copy','i',327.7,'changes',330.8],['…or keep moving information between different tools.','arrow','and',331.7,'going',335.9]];
const r9in=R9.map(r=>at(r[2],r[3])),r9ok=R9.map(r=>at(r[4],r[5]));
scene('w2',321.7,336.65,`<div class="abs center label" style="top:150px" id="w2l">The real difference</div>`+R9.map((r,i)=>`<div class="row9 glass" id="w2r${i}" style="top:${260+i*160}px"><div class="old">${svg(r[1])}</div><span>${r[0]}</span><div class="okc"><svg viewBox="0 0 24 24">${ICON.check}</svg></div></div>`).join(''),(lt,T)=>{
  $('w2l').style.opacity=eo(p(T,321.8,.4));
  R9.forEach((r,i)=>{const el=$('w2r'+i);enter(el,T,r9in[i]-.05,{x:-100,y:0,s:.96});const nx=r9in[i+1]||1e9;el.style.opacity=(+el.style.opacity*(T>nx?.55:1)).toFixed(3);
    const ok=back(p(T,r9ok[i]+.2,.45));el.lastChild.style.opacity=clamp(ok*2);el.lastChild.style.transform=`scale(${ok})`;
    el.style.borderColor=T>r9in[i]&&T<nx?'rgba(143,125,255,.55)':''});
});
r9in.forEach(t=>cue(t+.1,'tick'));r9ok.forEach(t=>cue(t+.25,'pop'));
// ---- 3: my work produces information -> the library keeps it useful
const theT=at('the',340);
const TL=RES.map((r,i)=>[745+(i%3)*190,450+Math.floor(i/3)*120]);
scene('w3',336.65,343.85,HL(130,[['w3a','My creator work already [produces all this information.]',68],['w3b','The Library gives it somewhere to [stay useful.]',76]])+
  `<div class="libw glass" id="w3w">${winBar('Library')}</div><svg id="w3sv" class="abs" width="1920" height="1080" style="left:0;top:0"></svg>`+
  RES.map((r,i)=>`<div class="chipc glass" id="w3c${i}" style="margin:0;height:56px">${ic(r)}${r[0].split(' ')[0]}</div>`).join('')+`<div id="w3o"></div><div class="badge" id="w3bd" style="left:1450px;top:760px">Ready for the agent</div>`,(lt,T)=>{
  kin($('w3a'),T,336.77,theT-.25,.05);kin($('w3b'),T,theT,1e9,.05);
  enter($('w3w'),T,336.8,{s:.9,y:40});
  RES.forEach((r,i)=>{const s=337.4+i*.28,x=eio(p(T,s,.8)),[tx,ty]=TL[i];const el=$('w3c'+i);
    el.style.opacity=clamp(p(T,s,.15));el.style.transform=`translate(${lerp(-200,tx-70,x)}px,${lerp(300+i*90,ty,x)-Math.sin(Math.PI*x)*80}px) scale(${lerp(.8,1,x)})`;
    const g=eo(p(T,theT+.3+i*.05,.4));el.style.boxShadow=g?`0 0 0 2px ${r[3]}88,0 0 30px ${r[3]}44`:''});
  W3O.update(T,theT+.4,1560,570);link(W3L,W3D,T,theT+.7,1280,570,1560,570);
  const b=back(p(T,theT+1.3,.5));$('w3bd').style.opacity=clamp(b*2);$('w3bd').style.transform=`scale(${lerp(.5,1,b)})`;
});
const W3O=orb($('w3o')),W3L=mkline($('w3sv')),W3D=mkdot($('w3sv'));
RES.forEach((r,i)=>cue(337.4+i*.28+.7,'tick'));cue(theT+.5,'pop');cue(theT+1.4,'ding');
