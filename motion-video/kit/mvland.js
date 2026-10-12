addCSS(`
.mag{background:linear-gradient(95deg,#ff6fb1 0%,#a493ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.06em}
.idea{position:absolute;left:0;top:0;width:360px;height:260px;margin:-130px 0 0 -180px;border-radius:30px;padding:26px;font-family:Inter}
.idea b{display:block;font-family:'Inter Display';font-size:30px;font-weight:800;margin-top:14px}
.idea small{display:block;font-size:17px;color:rgba(255,255,255,.5);margin-top:4px}
.idea .ic{width:60px;height:60px;border-radius:17px}.idea svg.i{width:32px;height:32px}
.wave{display:flex;align-items:center;gap:6px;height:60px;margin-top:10px}.wave i{display:block;width:8px;border-radius:4px;background:linear-gradient(180deg,#ff6fb1,#a493ff)}
.player{position:absolute;left:560px;top:300px;width:800px;height:450px;border-radius:30px;overflow:hidden;background:linear-gradient(135deg,#2a1440,#13234a 60%,#0d3340)}
.player .pbtn{position:absolute;left:50%;top:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:rgba(255,255,255,.15);backdrop-filter:blur(6px);display:grid;place-items:center;border:2px solid rgba(255,255,255,.35)}
.player .pbtn svg{width:54px;height:54px;fill:#fff;stroke:none;margin-left:8px}
.player .bar2{position:absolute;left:30px;right:30px;bottom:26px;height:8px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden}.player .bar2 div{height:100%;background:linear-gradient(90deg,#ff6fb1,#a493ff)}
.mvlogo{display:flex;align-items:center;gap:30px}
.mvlogo .lg{width:124px;height:124px;border-radius:34px;display:grid;place-items:center;background:linear-gradient(135deg,#ff6fb1,#7c5cff);box-shadow:0 30px 80px rgba(255,111,177,.4),inset 0 2px 0 rgba(255,255,255,.3)}
.mvlogo .lg svg{width:58px;height:58px;fill:#fff;margin-left:8px}
.mvlogo .tx{font-size:150px;font-weight:900;letter-spacing:-.04em}
.descbox{position:absolute;left:510px;top:560px;width:900px;border-radius:26px;padding:26px 32px;font-family:Inter}
.descbox .dl{height:12px;border-radius:6px;background:rgba(255,255,255,.1);margin:10px 0}
.descbox .lk{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:16px;background:rgba(255,111,177,.12);border:1px solid rgba(255,111,177,.5);font-size:26px;font-weight:700;margin:16px 0}
.descbox .lk svg.i{width:28px;height:28px;stroke:#ff9fca}
.big2{position:absolute;top:400px;width:620px;height:330px;border-radius:34px;padding:34px;font-family:Inter}
.big2 .ic{width:76px;height:76px;border-radius:22px}.big2 svg.i{width:40px;height:40px}
.big2 b{display:block;font-family:'Inter Display';font-size:46px;font-weight:800;margin-top:18px}
.big2 .n{position:absolute;right:30px;top:28px;font-size:22px;font-weight:800;color:rgba(255,255,255,.35)}
.beats{position:relative;height:110px;margin-top:26px}
.beats .ln{position:absolute;left:20px;right:20px;top:24px;height:4px;border-radius:2px;background:rgba(255,255,255,.15)}
.beats .bt{position:absolute;top:10px;width:120px;margin-left:-60px;text-align:center;font-size:19px;font-weight:700;color:rgba(255,255,255,.75)}
.beats .bt i{display:block;width:32px;height:32px;margin:0 auto 12px;border-radius:50%;background:linear-gradient(135deg,#ff6fb1,#a493ff);box-shadow:0 0 20px rgba(255,111,177,.5)}
.core{position:absolute;left:810px;top:490px;width:300px;height:300px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:radial-gradient(circle at 35% 30%,rgba(255,111,177,.5),rgba(124,92,255,.35) 55%,rgba(20,20,40,.6));border:1px solid rgba(255,111,177,.5);box-shadow:0 0 90px rgba(255,111,177,.35);font-size:26px;font-weight:800}
.thumb{position:absolute;left:0;top:0;width:220px;height:124px;margin:-62px 0 0 -110px;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.18);box-shadow:0 20px 50px rgba(0,0,0,.5)}
.thumb span{position:absolute;left:12px;bottom:10px;font-family:Inter;font-size:15px;font-weight:700;color:rgba(255,255,255,.85)}
.stp{position:absolute;left:0;top:0;width:250px;height:230px;margin:-115px 0 0 -125px;border-radius:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-size:28px;font-weight:800;letter-spacing:-.02em}
.stp .ic{width:84px;height:84px;border-radius:24px}.stp svg.i{width:44px;height:44px}
.stp .k{font-family:Inter;font-size:16px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.14em}
`);
ICON.note='<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>';
ICON.book='<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M21 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>';
ICON.image='<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="9" r="1.5"/>';
ICON.cam='<path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>';
ICON.film='<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>';
const PLAY='<svg viewBox="0 0 24 24"><path d="M7 4l14 8-14 8z"/></svg>';
const wave=(n,id)=>`<div class="wave" id="${id}">${Array.from({length:n},()=>'<i></i>').join('')}</div>`;
function animWave(id,T,amp=1){[...$(id).children].forEach((b,i)=>{b.style.height=(10+amp*44*Math.abs(Math.sin(T*3.1+i*.7)*Math.cos(T*1.7+i*.31)))+'px'})}
const GR=['linear-gradient(135deg,#ff6fb1,#7c5cff)','linear-gradient(135deg,#3ab8ff,#6ee7b7)','linear-gradient(135deg,#ffc857,#ff6b6b)','linear-gradient(135deg,#7c5cff,#2b6cff)','linear-gradient(135deg,#ff8a7a,#a493ff)','linear-gradient(135deg,#6ee7b7,#3ab8ff)'];
const logoHTML=(id,sc=1)=>`<div class="mvlogo" id="${id}" style="transform-origin:center"><div class="lg">${PLAY}</div><div class="tx"><span class="mag">MV</span>LAND</div></div>`;
// ---- 1: song / story idea / visual concept -> music video -> MVLAND
const IDEAS=[['Your own song','note','#ff6fb1','song',2],['A story idea','book','#ffc857','story',2.8],['A visual concept','image','#5fd8ff','visual',5]];
const idT=IDEAS.map(d=>at(d[3],d[4])),turnT=at('turn',7.4),mvT=at('music',8.3),chkT=at('check',9.4),mvlT=at('mvland',10);
scene('m1',0,11.2,HL(140,[['m1a','Your own [song], a [story idea], or a [visual concept]…',70],['m1b','…turned into a {music video.}',84,'font-weight:800']])+
  IDEAS.map((d,i)=>`<div class="idea glass" id="m1i${i}">${icx(d[1],d[2])}<b>${d[0]}</b>${i==0?wave(18,'m1w'):i==1?'<small>Scene 1 · Scene 2 · The twist</small><div class="dl" style="height:10px;border-radius:5px;background:rgba(255,255,255,.12);margin-top:18px;width:80%"></div><div style="height:10px;border-radius:5px;background:rgba(255,255,255,.12);margin-top:12px;width:60%"></div>':`<div style="margin-top:14px;height:70px;border-radius:14px;background:${GR[1]}"></div>`}</div>`).join('')+
  `<div class="player glass" id="m1p"><div class="pbtn">${PLAY}</div><div class="bar2"><div id="m1pb"></div></div></div>`+
  `<div class="abs center" style="top:420px">${logoHTML('m1lg')}</div>`,(lt,T)=>{
  kin($('m1a'),T,.5,turnT-.25,.18);kin($('m1b'),T,turnT,chkT-.15,.08);
  const merge=eio(p(T,turnT+.2,.8)),out=eio(p(T,chkT,.45));
  IDEAS.forEach((d,i)=>{const el=$('m1i'+i);const k=back(p(T,idT[i]-.05,.55));const x=lerp(560+i*400,960,merge),y=lerp(560,525,merge);
    el.style.opacity=clamp(p(T,idT[i]-.05,.2))*(1-merge);el.style.transform=`translate(${x}px,${y}px) rotate(${(i-1)*4*(1-k)}deg) scale(${lerp(.6,1,k)*lerp(1,.4,merge)})`});
  animWave('m1w',T);
  const pk=back(p(T,mvT-.3,.6));$('m1p').style.opacity=clamp(pk*2)*(1-out);$('m1p').style.transform=`scale(${lerp(.5,1,pk)*lerp(1,.6,out)}) translateY(${-out*120}px)`;
  $('m1pb').style.width=(100*clamp((T-mvT)/3))+'%';
  const lg=back(p(T,mvlT-.25,.6));$('m1lg').style.opacity=clamp(lg*2);$('m1lg').style.transform=`scale(${lerp(.6,1,lg)})`;$('m1lg').style.filter=blur((1-clamp(lg*1.5))*14);
});
idT.forEach(t=>cue(t+.1,'pop'));cue(mvT,'ding');cue(mvlT-.1,'shimmer');cue(mvlT,'pop');
// ---- 2: link in the description
const linkT=at('link',12.3),expT=at('explore',14.8);
scene('m2',11.2,16.6,`<div class="abs center" style="top:230px">${logoHTML('m2lg')}</div>`+
  `<div class="descbox glass" id="m2d"><div class="dl" style="width:70%"></div><div class="lk" id="m2lk">${svg('arrow')}<span><span class="mag">MV</span>LAND — link in the description</span></div><div class="dl" style="width:85%"></div><div class="dl" style="width:55%"></div></div>`+
  `<div class="badge" id="m2ex" style="left:840px;top:880px;background:rgba(255,111,177,.12);border-color:rgba(255,111,177,.5);color:#ffb3d6">Explore it yourself ✨</div>`,(lt,T)=>{
  const lg=eo(p(T,11.2,.5));$('m2lg').style.transform=`scale(${lerp(1,.75,lg)})`;
  enter($('m2d'),T,linkT-.35,{y:60,s:.92});
  const lk=$('m2lk');const g=eo(p(T,linkT,.4));lk.style.boxShadow=g?`0 0 ${30+15*Math.sin(T*5)}px rgba(255,111,177,${.45*g})`:'';lk.style.transform=`scale(${1+.03*Math.sin(Math.PI*p(T,linkT,.4))})`;
  enter($('m2ex'),T,expT,{y:30,s:.6});
});
cue(linkT+.05,'tick');cue(expT+.1,'pop');
// ---- 3: start with the music and the story
const recT=at('my',18.4),startT=at('start',20),musT=at('music',21),stoT=at('story',22);
scene('m3',16.6,24.2,HL(140,[['m3a','If you try it, my recommendation:',72,'font-weight:600;color:rgba(255,255,255,.88)'],['m3b','Start with the [music] and the {story} you want to tell.',70]])+
  `<div class="big2 glass" id="m3m" style="left:300px"><span class="n">01</span>${icx('note','#ff6fb1')}<b>The music</b>${wave(28,'m3w')}</div>`+
  `<div class="big2 glass" id="m3s" style="left:1000px"><span class="n">02</span>${icx('book','#ffc857')}<b>The story</b><div class="beats"><div class="ln"></div>${['Intro','Build','Payoff'].map((b,i)=>`<div class="bt" id="m3b${i}" style="left:${18+i*32}%"><i></i>${b}</div>`).join('')}</div></div>`,(lt,T)=>{
  kin($('m3a'),T,16.8,startT-.25,.05);kin($('m3b'),T,startT,1e9,.05);
  enter($('m3m'),T,musT-.1,{y:70,s:.85});enter($('m3s'),T,stoT-.1,{y:70,s:.85});
  animWave('m3w',T,1.1);[0,1,2].forEach(i=>enter($('m3b'+i),T,stoT+.3+i*.25,{y:20,s:.5}));
});
cue(musT,'pop');cue(stoT,'pop');[0,1,2].forEach(i=>cue(stoT+.4+i*.25,'tick'));
// ---- 4: build the visuals around that
const visT=at('visuals',25.3);
const TH=['Opening shot','Chorus','Close-up','Dance break','Bridge','Finale'];
scene('m4',24.2,27.2,HL(140,[['m4a','Then build the [visuals] around that.',84,'font-weight:800']])+
  `<div class="core" id="m4c">${wave(10,'m4w')}<span><span class="mag">Music</span> + Story</span></div>`+
  TH.map((t,i)=>`<div class="thumb" id="m4t${i}" style="background:${GR[i]}"><span>${t}</span></div>`).join(''),(lt,T)=>{
  kin($('m4a'),T,24.4,1e9,.06);
  enter($('m4c'),T,24.4,{s:.5,y:0});animWave('m4w',T,.6);
  TH.forEach((t,i)=>{const el=$('m4t'+i),k=back(p(T,visT+i*.1,.55)),a=(-90+i*60)*Math.PI/180+T*.15;
    el.style.opacity=clamp(p(T,visT+i*.1,.2));el.style.transform=`translate(${960+Math.cos(a)*lerp(150,380,k)}px,${640+Math.sin(a)*lerp(100,250,k)}px) scale(${lerp(.4,1,k)})`});
});
TH.forEach((t,i)=>cue(visT+i*.1+.2,'tick'));
// ---- 5: music -> storytelling -> characters -> shots -> final cut -> music video
const PIPE=[['Music','note','#ff6fb1','music',28.4],['Storytelling','book','#ffc857','storytelling',29],['Characters','user','#6ee7b7','characters',30.3],['Shots','cam','#5fd8ff','shots',31.9],['Final cut','film','#a493ff','final',32.9]];
const piT=PIPE.map(s=>at(s[3],s[4])),mvl2=at('mvland',33.8),vidT=at('video',38.4);
scene('m5',27.2,42.6,HL(130,[['m5a','From the [music & storytelling] to the {final cut}…',72],['m5b','MVLAND turns your creative idea into a [music video.]',66]])+
  `<svg id="m5sv" class="abs" width="1920" height="1080" style="left:0;top:0"></svg>`+PIPE.map((s,i)=>`<div class="stp glass" id="m5s${i}"><span class="k">0${i+1}</span>${icx(s[1],s[2])}${s[0]}</div>`).join('')+
  `<div class="player glass" id="m5p" style="top:290px"><div class="pbtn" id="m5pb2">${PLAY}</div>${TH.map((t,i)=>`<div id="m5f${i}" style="position:absolute;inset:0;background:${GR[i]};opacity:0"></div>`).join('')}<div class="bar2"><div id="m5pb"></div></div></div>`+
  `<div class="abs center" style="top:800px" id="m5end"><div style="transform:scale(.55)">${logoHTML('m5lg')}</div></div>`,(lt,T)=>{
  kin($('m5a'),T,27.4,mvl2-.25,.06);kin($('m5b'),T,mvl2,1e9,.05);
  const col=eio(p(T,mvl2+.1,.7));
  PIPE.forEach((s,i)=>{const el=$('m5s'+i),k=back(p(T,piT[i]-.05,.55));const x=lerp(240+i*360,960,col),y=lerp(560,560,col);
    el.style.opacity=clamp(p(T,piT[i]-.05,.2))*(1-col);el.style.transform=`translate(${x}px,${y}px) scale(${lerp(.5,1,k)*lerp(1,.5,col)})`;
    const on=T>piT[i]&&T<(piT[i+1]||mvl2);el.style.borderColor=on?s[2]+'aa':'';el.style.boxShadow=on?`0 0 40px ${s[2]}44`:'';
    if(i<4){const l=M5L[i],k2=eio(p(T,piT[i+1]-.2,.3));l.setAttribute('x1',240+i*360+125);l.setAttribute('y1',560);l.setAttribute('x2',lerp(240+i*360+125,240+(i+1)*360-125,k2));l.setAttribute('y2',560);l.style.opacity=k2*.6*(1-col)}});
  const pk=back(p(T,mvl2+.5,.6));$('m5p').style.opacity=clamp(pk*2);$('m5p').style.transform=`scale(${lerp(.5,1,pk)})`;
  const play=clamp((T-mvl2-1.1)/(vidT-mvl2-.6));$('m5pb').style.width=(100*play)+'%';$('m5pb2').style.opacity=play>0?1-p(T,mvl2+1.1,.3):1;
  TH.forEach((t,i)=>{const seg=play*6;$('m5f'+i).style.opacity=play>0?(i==5&&seg>5.5?1:clamp(1-Math.abs(seg-i-.5)*1.4)):0});
  const e=back(p(T,vidT+.2,.6));$('m5end').style.opacity=clamp(e*2);$('m5end').style.transform=`translateY(${(1-e)*40}px)`;
});
const M5L=[0,1,2,3].map(()=>mkline($('m5sv'),'#ff6fb1'));
piT.forEach(t=>cue(t+.08,'pop'));cue(mvl2+.5,'ding');cue(vidT+.3,'shimmer');
FADE=t=>eio(p(t,41.2,1.4));
