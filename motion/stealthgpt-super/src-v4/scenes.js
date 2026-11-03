// helpers ---------------------------------------------------------------
function A(t,kind,html,style,attrs){return `<div class="a" data-in="${t}" data-a="${kind||'up'}" style="${style||''}" ${attrs||''}>${html}</div>`}
function O(t,tout,kind,html,style){return A(t,kind,html,style,`data-out="${tout}"`)}
function L(text,t0,step,cls){ // letter-by-letter
  let i=0;return text.split('').map(ch=>ch===' '?'<span style="display:inline-block;width:.26em"></span>':`<span class="a ${cls||''}" data-in="${(t0+(i++)*step).toFixed(3)}" data-a="let" style="display:inline-block">${ch}</span>`).join('');
}
function Wd(text,t0,step,kind){return text.split(' ').map((w,i)=>`<span class="a" data-in="${(t0+i*step).toFixed(2)}" data-a="${kind||'spring'}" style="display:inline-block;margin-right:.22em">${w}</span>`).join('')}
const COL={black:['#3a3a42','#121216','#000'],orange:['#ffab2e','#ff5e00','#c23f00'],blue:['#4d7bff','#1f45e0','#1530a8'],pink:['#ff4fa3','#d3125f','#8f0a40'],
 red:['#ff5a4a','#d21d10','#8e1108'],purple:['#9b6bff','#5b2ee6','#3a1aa8'],green:['#34d97f','#0ea153','#087238'],cyan:['#2fd6ff','#0a8fe0','#065f99'],gold:['#ffd04a','#ff8a00','#b85a00']};
function cv(k){const c=COL[k];return `--c1:${c[0]};--c2:${c[1]};--c3:${c[2]}`}
function C3(k,title,emoji,icons,w,h,ban){return `<div class="c3" style="${cv(k)};width:${w||820}px;height:${h||330}px"><div class="c3t">${title}${ban?' <span class="em" style="font-size:40px">🚫</span>':''}</div><div class="c3i">${(icons||[]).map(i=>`<div class="ic">${i}</div>`).join('')}</div><div class="c3e" style="${(w||820)<700?'font-size:140px;right:16px;top:64%':''}">${emoji}</div></div>`}
function LOGO(k,txt,size){return `<div class="logo" style="${cv(k)};${size?`width:${size}px;height:${size}px;border-radius:${size*0.23}px;font-size:${size*0.22}px`:''}">${txt}</div>`}
const CK='&#10003;';
const UIBAR=`<div class="dots3"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>`;
function lines(n,ws){let s='';for(let i=0;i<n;i++)s+=`<div class="ln" style="width:${(ws||[100,92,97,74,100,86,95,62])[i%8]}%"></div>`;return s}
const cam=(a,b)=>({a,b});

// scenes ----------------------------------------------------------------
// tr = transition INTO this scene: whip|whipv|zoom|burst|dots|flip|scatter
window.SCENES=[
// 1 HOOK — cascade of glossy cards on white
{s:0,e:4.72,bg:'white',tone:'light',tr:'none',cam:cam({rx:32,ry:0,rz:-15,z:-220,x:40,y:230},{rx:26,ry:-6,rz:-12,z:-40,x:-80,y:-330}),html:`
 <div class="abs" style="left:560px;top:120px;width:900px">
  ${A(0.15,'flip',C3('black','Scripts','✍️',['📝','🎬','💡']),'position:absolute;left:0;top:0')}
  ${A(1.2,'flip',C3('orange','Emails','✉️',['📥','📤','⭐']),'position:absolute;left:90px;top:300px')}
  ${A(1.85,'flip',C3('blue','Articles','📰',['🗞️','📊','🔗']),'position:absolute;left:180px;top:600px')}
  ${A(2.45,'flip',C3('pink','Anything else','✨',['🚀','🎯','💬']),'position:absolute;left:270px;top:900px')}
 </div>
 ${A(0.3,'spring',`<div class="pillw"><span class="em">🤖</span>AI can help you write&hellip;</div>`,'position:absolute;left:120px;top:880px;transform-style:flat')}`},
// 1b BUT — dark, glitch
{s:4.72,e:8.7,bg:'dark',tone:'dark',tr:'dots',cam:cam({rx:0,ry:8,rz:0,z:-120,x:0,y:0},{rx:0,ry:-6,rz:0,z:60,x:0,y:0}),html:`
 ${A(5.05,'slam',`<div id="glitch" class="t0">But&hellip;</div>`,'position:absolute;top:200px','')}
 ${A(5.6,'up',`<div class="t3" style="opacity:.7">there&rsquo;s one problem</div>`,'position:absolute;top:470px')}
 ${A(6.2,'up',`<div class="t1">it doesn&rsquo;t sound ${L('natural.',6.9,0.06,'gO')}</div>`,'position:absolute;top:590px')}
 ${A(7.3,'pop',`<div class="em" style="font-size:170px;filter:drop-shadow(0 20px 30px rgba(255,61,154,.5))">🤖</div>`,'position:absolute;left:1580px;top:170px')}`},
// 2 30 MIN — gradient
{s:8.7,e:16.4,bg:'grad',tone:'dark',tr:'whip',cam:cam({rx:8,ry:-14,rz:0,z:-80,x:0,y:0},{rx:4,ry:8,rz:0,z:40,x:0,y:0}),html:`
 ${A(9.1,'up',`<div class="sm" style="opacity:.9">if you create content <b>professionally</b>&hellip;</div>`,'position:absolute;top:170px')}${A(9.5,'pop',`<div class="em" style="font-size:130px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">💼</div>`,'position:absolute;left:1500px;top:160px')}${A(10.3,'pop',`<div class="em" style="font-size:110px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">✍️</div>`,'position:absolute;left:260px;top:700px')}
 <div class="row abs" style="top:300px;gap:30px;align-items:flex-end">
  ${A(11.2,'flip',`<div class="tile">3</div>`)}
  ${A(11.45,'flip',`<div class="tile">0</div>`)}
  ${A(11.9,'spring',`<div class="col" style="gap:6px;margin-left:16px;margin-bottom:20px"><div class="t2" style="color:#fff">minutes</div><div class="t4" style="opacity:.85">of rewriting <span class="em">😩</span></div></div>`)}
 </div>
 ${A(12.4,'pop',`<div class="em" style="font-size:180px;filter:drop-shadow(0 26px 24px rgba(0,0,0,.25))">⏰</div>`,'position:absolute;left:250px;top:300px')}
 ${A(13.8,'up',`<div class="pillw" style="font-size:34px">&hellip;on something AI <b>&nbsp;already&nbsp;</b> helped you produce</div>`,'position:absolute;top:720px')}`},
// 3 TODAY / SUPER reveal with rays — white
{s:16.4,e:20.5,bg:'rays',tone:'light',tr:'burst',cam:cam({rx:0,ry:0,rz:-6,z:-260,x:0,y:0},{rx:0,ry:0,rz:4,z:40,x:0,y:0}),html:`
 ${A(16.6,'spring',`<div class="pillw"><span class="em">🧪</span>Today I&rsquo;m testing</div>`,'position:absolute;top:120px')}
 <div class="row abs" style="top:330px;gap:0">
  ${A(17.6,'fly',`<div style="transform:rotate(-12deg)">${LOGO('blue','StealthGPT',360)}</div>`)}
  ${A(19.0,'fly',`<div style="transform:rotate(10deg) translateX(-50px) translateY(40px)">${LOGO('orange','SUPER',400)}</div>`)}
 </div>
 ${A(19.0,'pop',`<div class="em" style="font-size:120px">⭐</div>`,'position:absolute;left:1240px;top:260px')}
 ${A(19.2,'pop',`<div class="em" style="font-size:90px">✨</div>`,'position:absolute;left:640px;top:720px')}
 ${A(18.0,'up',`<div class="cap" style="opacity:.8">newest model</div>`,'position:absolute;top:900px')}`},
// 3b PLAN — cards
{s:20.5,e:28.3,bg:'white',tone:'light',tr:'zoom',cam:cam({rx:22,ry:0,rz:-8,z:-120,x:60,y:220},{rx:18,ry:-4,rz:-6,z:0,x:-60,y:-60}),html:`
 <div class="abs" style="left:360px;top:110px;width:1300px">
  ${A(20.9,'flip',C3('black','01 · AI-generated writing','📄',['🤖','✍️']),'position:absolute;left:0;top:0')}
  ${A(23.0,'flip',C3('purple','02 · Process with SUPER','⚡',['🔁','✨']),'position:absolute;left:130px;top:290px')}
  ${A(25.2,'flip',C3('red','03 · Real AI detector','🎥',['🔍','🔴']),'position:absolute;left:260px;top:580px')}
 </div>
 ${A(26.6,'spring',`<div class="pillw"><span class="em">🔴</span>on camera</div>`,'position:absolute;left:1380px;top:820px')}`},
// 4 CRITERIA — blue UI
{s:28.3,e:36.6,bg:'white',tone:'light',tr:'whipv',cam:cam({rx:10,ry:12,rz:0,z:-60,x:0,y:0},{rx:4,ry:-8,rz:0,z:40,x:0,y:0}),html:`
 ${A(28.5,'up',`<div class="t2" style="text-align:center"><span style="font-size:52px;font-weight:600;letter-spacing:-1px">What we&rsquo;ll</span><br><span class="gB">look at</span></div>`,'position:absolute;top:70px')}
 ${A(28.8,'flip',`<div class="ui" style="width:1060px;padding-bottom:40px">${UIBAR}<div class="col" style="gap:28px;padding:30px 56px 0">
   ${A(29.3,'left',`<div class="row" style="gap:28px"><div class="chk">${CK}</div><div class="t3" style="font-size:54px">Writing quality</div></div>`)}
   ${A(30.7,'left',`<div class="row" style="gap:28px"><div class="chk">${CK}</div><div class="t3" style="font-size:54px">Meaning stays intact</div></div>`)}
   ${A(32.5,'left',`<div class="row" style="gap:28px"><div class="chk">${CK}</div><div class="t3" style="font-size:54px">What the detector reports</div></div>`)}
 </div></div>`,'position:absolute;top:330px')}
 ${A(34.1,'stamp',`<div class="stamp" style="transform:rotate(-10deg)">NO EDITED<br>RESULTS</div>`,'position:absolute;left:1230px;top:620px')}
 ${A(35.8,'pop',`<div class="em" style="font-size:130px">👀</div>`,'position:absolute;left:330px;top:770px')}`},
// 5 AI AT WORK — gradient
{s:36.6,e:48.95,bg:'grad',tone:'dark',tr:'flip',cam:cam({rx:0,ry:-16,rz:0,z:-100,x:0,y:0},{rx:6,ry:10,rz:0,z:20,x:0,y:0}),html:`
 ${A(36.9,'up',`<div class="t2" style="text-align:center">AI is <span class="sel">genuinely useful</span> at work</div>`,'position:absolute;top:150px')}
 ${A(38.0,'pop',`<div class="em" style="font-size:90px">😎</div>`,'position:absolute;left:1500px;top:90px')}
 <div class="row abs" style="top:420px;gap:50px">
  ${A(41.4,'flip',C3('gold','Brainstorm','💡',['🧠','🗒️'],470,360))}
  ${A(43.1,'flip',C3('cyan','Organize','🗂️',['📁','🔖'],470,360))}
  ${A(44.6,'flip',C3('pink','Speed up','⚡',['⏱️','🚀'],470,360))}
 </div>`},
// 6 FIRST DRAFT PROBLEMS — white cascade
{s:48.95,e:59.85,bg:'white',tone:'light',tr:'whip',cam:cam({rx:30,ry:0,rz:-14,z:-160,x:100,y:300},{rx:24,ry:-4,rz:-10,z:0,x:-60,y:-180}),html:`
 ${A(49.2,'up',`<div class="t2" style="line-height:1"><span style="font-size:52px;font-weight:600;letter-spacing:-1px;display:block">First draft</span><span class="gO">&ne; final draft</span></div>`,'position:absolute;left:150px;top:140px;transform-style:flat')}
 <div class="abs" style="left:700px;top:240px;width:1000px">
  ${A(51.4,'flip',C3('red','Repetitive','🔁',['📋','📋','📋'],820,330,1),'position:absolute;left:0;top:0')}
  ${A(53.2,'flip',C3('orange','Predictable','😴',['➡️','➡️','➡️'],820,330,1),'position:absolute;left:100px;top:300px')}
  ${A(55.3,'flip',C3('purple','Not your tone','🎭',['🗣️','🎙️','❓'],820,330,1),'position:absolute;left:200px;top:600px')}
 </div>`},
// 7 GOAL — dark
{s:59.85,e:69.95,bg:'dark',tone:'dark',tr:'zoom',cam:cam({rx:0,ry:0,rz:0,z:-160,x:0,y:0},{rx:0,ry:0,rz:0,z:40,x:0,y:0}),html:`
 ${A(60.1,'up',`<div class="cap">the goal isn&rsquo;t just</div>`,'position:absolute;top:190px')}
 ${A(60.5,'up',`<div style="position:relative"><div class="t2" style="opacity:.5">Generate text faster</div><div class="strike a" data-in="62.4" data-a="grow" style="width:104%"></div></div>`,'position:absolute;top:260px')}
 ${A(63.0,'up',`<div class="t1" style="text-align:center">${L('Communicate clearly.',63.0,0.035)}<br>${L('Sound like you.',64.6,0.05,'gO')}</div>`,'position:absolute;top:430px')}
 ${A(66.1,'spring',`<div class="pillw"><span class="em">🎯</span>The problem SUPER is trying to address</div>`,'position:absolute;top:800px')}`},
// 8 MEET SUPER — rays
{s:69.95,e:74.0,bg:'gold',tone:'dark',tr:'burst',cam:cam({rx:0,ry:0,rz:-4,z:-200,x:0,y:0},{rx:0,ry:0,rz:3,z:60,x:0,y:0}),html:`
 ${A(70.2,'fly',`<div style="transform:rotate(-8deg)">${LOGO('purple','SUPER',440)}</div>`,'position:absolute;top:200px')}
 ${A(70.6,'up',`<div class="cap" style="opacity:.9">Introducing &middot; StealthGPT</div>`,'position:absolute;top:110px')}
 ${A(72.0,'spring',`<div class="t3"><span class="gG">newest AI humanizer</span> model</div>`,'position:absolute;top:800px')}
 ${A(71.0,'pop',`<div class="em" style="font-size:110px">⭐</div>`,'position:absolute;left:1220px;top:190px')}`},
// 8b IDEA — white
{s:74.0,e:83.3,bg:'white',tone:'light',tr:'whip',cam:cam({rx:12,ry:-10,rz:0,z:-80,x:0,y:0},{rx:6,ry:8,rz:0,z:30,x:0,y:0}),html:`
 ${A(74.2,'up',`<div class="t3">The idea is <span class="sel">straightforward</span></div>`,'position:absolute;top:120px')}
 <div class="row abs" style="top:330px;gap:60px">
  ${A(75.0,'flip',`<div class="uiw" style="width:440px;padding:36px 40px;color:#14162b"><div class="cap" style="font-size:20px;letter-spacing:3px">AI-assisted text</div>${lines(6)}</div>`)}
  ${A(76.6,'fly',`<div id="core" style="transform:rotate(-8deg)">${LOGO('purple','SUPER',280)}</div>`)}
  <div class="col" style="gap:24px">
   ${A(79.6,'spring',`<div class="pillw"><span class="em">✅</span>Original message</div>`)}
   ${A(81.0,'spring',`<div class="pillw"><span class="em">✅</span>Context</div>`)}
   ${A(81.9,'spring',`<div class="pillw"><span class="em">✅</span>Tone</div>`)}
  </div>
 </div>`},
// 9 CLAIM — gradient + selection box
{s:83.3,e:91.6,bg:'grad',tone:'dark',tr:'zoom',cam:cam({rx:0,ry:-8,rz:0,z:-60,x:0,y:0},{rx:0,ry:6,rz:0,z:40,x:0,y:0}),html:`
 ${A(83.5,'up',`<div class="cap" style="opacity:.9">according to StealthGPT</div>`,'position:absolute;top:220px')}
 ${A(84.0,'up',`<div class="t2" style="text-align:center;width:1500px">SUPER is designed to <span class="sel a" data-in="85.6" data-a="wipe" style="display:inline-block;white-space:nowrap">improve readability</span><br>without the quality compromises<br><span style="opacity:.75">of older humanization tools.</span></div>`,'position:absolute;top:330px')}
 ${A(86.2,'pop',`<div class="em" style="font-size:120px;filter:drop-shadow(0 18px 20px rgba(0,0,0,.25))">🧐</div>`,'position:absolute;left:1560px;top:250px')}`},
// 10 CLAIM -> TEST with toggle — white
{s:91.6,e:97.0,bg:'white',tone:'light',tr:'whipv',cam:cam({rx:0,ry:0,rz:-3,z:-100,x:0,y:0},{rx:0,ry:0,rz:2,z:40,x:0,y:0}),html:`
 <div class="row" style="gap:60px">
  ${A(91.9,'up',`<div class="t1" style="opacity:.35">Claim</div>`)}
  ${A(92.4,'pop',`<div class="tog" id="tog1"><i></i></div>`)}
  ${A(93.6,'up',`<div class="t1 gB">Test it.</div>`)}
 </div>`},
// 10b PLAN — tiles
{s:97.0,e:104.7,bg:'blue',tone:'dark',tr:'burst',cam:cam({rx:18,ry:0,rz:-4,z:-100,x:0,y:60},{rx:10,ry:0,rz:2,z:30,x:0,y:-40}),html:`
 ${A(97.2,'up',`<div class="cap" style="opacity:.85">the test plan</div>`,'position:absolute;top:170px')}
 <div class="row abs" style="top:300px;gap:34px">
  ${A(97.6,'flip',`<div class="uiw col" style="width:360px;height:380px;padding:40px;gap:20px"><div class="em" style="font-size:90px">🤖</div><div class="t4" style="font-weight:800">Start with AI-generated text</div></div>`)}
  ${A(99.6,'flip',`<div class="uiw col" style="width:360px;height:380px;padding:40px;gap:20px"><div class="em" style="font-size:90px">⚡</div><div class="t4" style="font-weight:800">Run it through SUPER</div></div>`)}
  ${A(101.0,'flip',`<div class="uiw col" style="width:360px;height:380px;padding:40px;gap:20px"><div class="em" style="font-size:90px">🆚</div><div class="t4" style="font-weight:800">Compare both versions</div></div>`)}
  ${A(103.0,'flip',`<div class="uiw col" style="width:360px;height:380px;padding:40px;gap:20px"><div class="em" style="font-size:90px">🔍</div><div class="t4" style="font-weight:800">Test them</div></div>`)}
 </div>`},
// 11 TOPIC + USE CASES — white
{s:104.7,e:122.3,bg:'white',tone:'light',tr:'whip',cam:cam({rx:8,ry:14,rz:0,z:-80,x:0,y:0},{rx:4,ry:-10,rz:0,z:30,x:0,y:0}),html:`
 <div class="row" style="gap:90px">
  ${A(105.0,'flip',`<div class="uiw" style="width:640px;padding:46px;transform:rotate(-4deg)"><div class="cap" style="font-size:20px;letter-spacing:3px">short professional article</div><div style="font:800 44px/1.12 Inter;letter-spacing:-1.5px;margin-top:20px">How AI tools are changing the way <span class="gO">small businesses</span> create content</div>${lines(4)}</div>`)}
  <div class="col" style="gap:26px;width:760px">
   ${A(112.2,'up',`<div class="t3">A normal, <span class="sel">work-related</span> example</div>`)}
   ${A(113.6,'up',`<div class="t4" style="opacity:.6">where AI is genuinely useful</div>`)}
   <div class="row" style="flex-wrap:wrap;gap:22px;margin-top:10px">
    ${A(118.0,'spring',`<div class="pillw"><span class="em">📣</span>Marketing copy</div>`)}
    ${A(119.1,'spring',`<div class="pillw"><span class="em">📬</span>Newsletters</div>`)}
    ${A(120.0,'spring',`<div class="pillw"><span class="em">🌐</span>Website content</div>`)}
    ${A(121.0,'spring',`<div class="pillw"><span class="em">🎨</span>Creative projects</div>`)}
   </div>
  </div>
 </div>${A(106.2,'pop',`<div class="em" style="font-size:150px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">🏪</div>`,'position:absolute;left:120px;top:140px')}${A(107.3,'pop',`<div class="em" style="font-size:130px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">🤖</div>`,'position:absolute;left:760px;top:120px')}${A(108.4,'pop',`<div class="em" style="font-size:130px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">📈</div>`,'position:absolute;left:780px;top:780px')}${A(109.4,'spring',`<div class="pillw"><span class="em">🛍️</span>Small businesses</div>`,'position:absolute;left:1150px;top:300px')}${A(110.4,'pop',`<div class="em" style="font-size:110px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">✨</div>`,'position:absolute;left:1600px;top:700px')}`},
// 12 PROMPT + DRAFT — blue UI on gradient
{s:122.3,e:138.2,bg:'grad',tone:'dark',tr:'zoom',cam:cam({rx:6,ry:-12,rz:0,z:-80,x:0,y:0},{rx:2,ry:8,rz:0,z:30,x:0,y:0}),html:`
 <div class="row" style="gap:60px;align-items:flex-start">
  <div class="col" style="gap:34px">
   ${A(122.5,'flip',`<div class="uiw" style="width:780px;padding-bottom:40px">${UIBAR}<div style="padding:24px 44px 0"><div class="cap" style="font-size:20px;letter-spacing:3px;color:#2b6bff;opacity:1">the prompt</div><div class="mono" style="font:500 30px/1.5 Mono;margin-top:18px;min-height:180px"><span class="ty" data-ty="122.6" data-cps="38">Write a short professional article about how AI tools are changing the way small businesses create content.</span></div></div></div>`)}
   ${A(130.3,'spring',`<div class="pillw" style="font-size:30px"><span class="em">✅</span>Actual AI text &mdash; not written to game a detector</div>`)}
  </div>
  ${A(124.0,'flip',`<div style="position:relative"><div class="ui" style="width:560px;padding:0 0 40px">${UIBAR}<div style="padding:24px 44px 0"><div class="cap" style="font-size:20px;letter-spacing:3px;opacity:.8">first draft &middot; AI</div><div style="font:800 34px/1.15 Inter;margin-top:14px">How AI Tools Are Changing the Way Small Businesses Create Content</div>${[100,92,100,74,100,96,60].map((w,i)=>`<div class="ln a" data-in="${(124.3+i*0.15).toFixed(2)}" data-a="wipe" style="width:${w}%;opacity:.35"></div>`).join('')}</div></div>${A(125.8,'stamp',`<div class="pillw" style="position:absolute;right:-40px;bottom:-40px;font-size:30px;background:#34d97f;color:#063"><span class="em">💾</span>Saved: original_v1</div>`)}</div>`)}
 </div>`},
// 13 INTO SUPER — white UI + cursor
{s:138.2,e:155.6,bg:'white',tone:'light',tr:'whip',cam:cam({rx:10,ry:10,rz:0,z:-60,x:0,y:0},{rx:4,ry:-6,rz:0,z:30,x:0,y:0}),html:`
 <div class="row" style="gap:60px">
  ${A(138.5,'flip',`<div class="ui" style="width:960px;padding-bottom:40px">${UIBAR}<div style="padding:24px 44px 0;display:flex;flex-direction:column;gap:24px"><div class="row" style="justify-content:space-between"><div class="cap" style="font-size:20px;letter-spacing:3px;opacity:.85">input &middot; exact first draft</div><div class="pillw" style="font-size:24px;padding:12px 24px">Model: <b class="gO">SUPER</b></div></div><div style="background:rgba(255,255,255,.14);border-radius:24px;padding:24px 30px">${[100,94,98,80,100,66].map((w,i)=>`<div class="ln a" data-in="${(139.6+i*0.18).toFixed(2)}" data-a="wipe" style="width:${w}%;opacity:.45"></div>`).join('')}</div><div class="row" style="gap:24px"><div id="runbtn" style="padding:26px 54px;border-radius:24px;background:#fff;color:#1d4fe6;font:800 34px Inter;box-shadow:0 8px 0 rgba(0,0,0,.15)">Humanize &#10024;</div><div style="flex:1;height:18px;border-radius:9px;background:rgba(255,255,255,.2);overflow:hidden"><div id="runbar" style="height:100%;width:0;background:linear-gradient(90deg,#ffd04a,#ff4fa3)"></div></div><div id="runpct" style="font:800 30px Inter;width:90px">0%</div></div></div></div>`)}
  <div class="col" style="gap:24px;width:640px">
   ${A(142.4,'up',`<div class="t4" style="opacity:.6">Not just: does the wording change?</div>`)}
   ${A(146.6,'spring',`<div class="pillw"><span class="em">💬</span>Same ideas?</div>`)}
   ${A(149.8,'spring',`<div class="pillw"><span class="em">🗣️</span>Reads naturally?</div>`)}
   ${A(151.6,'spring',`<div class="pillw"><span class="em">🎯</span>Still useful?</div>`)}
   ${A(155.0,'slam',`<div class="t2 gO">Let&rsquo;s run it.</div>`)}
  </div>
 </div>
 <div id="cursor" class="abs em" style="left:0;top:0;font-size:90px;opacity:0">👆</div>`},
// 14 RESULT — gradient side-by-side
{s:155.6,e:173.5,bg:'grad',tone:'dark',tr:'burst',cam:cam({rx:14,ry:0,rz:0,z:-80,x:0,y:40},{rx:6,ry:0,rz:0,z:20,x:0,y:-20}),html:`
 ${A(155.8,'spring',`<div class="pillw"><span class="em">🎉</span>Here&rsquo;s the result</div>`,'position:absolute;top:80px')}
 <div class="row abs" style="top:220px;gap:60px">
  ${A(156.9,'flip',`<div class="uiw" style="width:700px;padding:40px;transform:rotate(-3deg)"><div class="row" style="justify-content:space-between"><div style="font:800 32px Inter">Original</div><div class="cap" style="font-size:18px;letter-spacing:3px">AI draft</div></div>${lines(9)}</div>`)}
  ${A(157.3,'flip',`<div class="ui" style="width:700px;padding:40px;transform:rotate(3deg)"><div class="row" style="justify-content:space-between"><div style="font:800 32px Inter">Processed</div><div class="cap" style="font-size:18px;letter-spacing:3px;opacity:.9">SUPER ⚡</div></div>${lines(9)}</div>`)}
 </div>
 <div id="scanbox" class="abs sel" style="position:absolute;left:0;top:0;opacity:0;padding:0;background:rgba(255,208,74,.25);outline-color:#ffd04a"></div>
 <div class="row abs" style="bottom:90px;gap:20px">
  ${A(160.0,'spring',`<div class="pillw" style="font-size:28px">① Opening</div>`)}
  ${A(161.3,'spring',`<div class="pillw" style="font-size:28px">② Structure</div>`)}
  ${A(162.6,'spring',`<div class="pillw" style="font-size:28px">③ Transitions</div>`)}
  ${A(163.8,'spring',`<div class="pillw" style="font-size:28px">④ Info kept?</div>`)}
 </div>
 ${A(166.4,'slam',`<div class="uiw" style="padding:60px 80px;text-align:center"><div class="cap" style="color:#ff5e00;opacity:1">for professional writing</div><div class="t2" style="margin-top:20px;font-size:80px">New wording + confusing text<br>= <span class="gO">not an improvement</span> <span class="em">🙅</span></div></div>`,'position:absolute;top:330px')}`},
// 15 BOTH VERSIONS — white
{s:173.5,e:187.65,bg:'white',tone:'light',tr:'whip',cam:cam({rx:0,ry:-10,rz:0,z:-80,x:0,y:0},{rx:0,ry:8,rz:0,z:30,x:0,y:0}),html:`
 ${A(173.8,'up',`<div class="t1" style="text-align:center"><span style="font-size:60px;font-weight:600;letter-spacing:-1px">Same writing.</span><br>${L('Different approach.',174.3,0.035,'gB')}</div>`,'position:absolute;top:140px')}
 <div class="row abs" style="top:520px;gap:40px">
  ${A(179.4,'flip',C3('blue','Easier to read','📖',['👌'],560,300))}
  ${A(181.4,'flip',C3('green','Ideas kept intact','🧩',['✅'],600,300))}
 </div>
 ${A(185.0,'spring',`<div class="pillw"><span class="em">🔥</span>Next: put it to the test</div>`,'position:absolute;top:900px')}`},
// 16 DETECTOR TITLE — dark (dots transition)
{s:187.65,e:191.4,bg:'dark',tone:'dark',tr:'dots',cam:cam({rx:0,ry:0,rz:-3,z:-200,x:0,y:0},{rx:0,ry:0,rz:2,z:60,x:0,y:0}),html:`
 ${A(187.9,'up',`<div class="cap" style="opacity:.8">the part everyone wants to see</div>`,'position:absolute;top:300px')}
 ${A(188.3,'slam',`<div class="t0" style="font-size:200px">The <span class="gO">detector</span> test</div>`,'position:absolute;top:400px')}
 ${A(189.0,'pop',`<div class="em" style="font-size:130px">🔍</div>`,'position:absolute;left:1600px;top:220px')}`},
// 16b DETECTOR SCAN — white
{s:191.4,e:212.3,bg:'white',tone:'light',tr:'burst',cam:cam({rx:8,ry:12,rz:0,z:-80,x:0,y:0},{rx:4,ry:-8,rz:0,z:20,x:0,y:0}),html:`
 <div class="row" style="gap:70px;align-items:flex-start">
  ${A(191.6,'flip',`<div class="ui" style="width:820px;padding-bottom:36px;position:relative">${UIBAR}<div style="padding:24px 44px 0;position:relative"><div class="cap" style="font-size:20px;letter-spacing:3px;opacity:.85">HumanizeReval &middot; AI detector</div><div style="background:#fff;border-radius:22px;padding:22px 30px;margin-top:20px;color:#14162b">${lines(7)}</div><div id="laser" style="position:absolute;left:30px;right:30px;height:8px;top:120px;background:#ffd04a;box-shadow:0 0 30px 10px rgba(255,208,74,.7);opacity:0;border-radius:4px"></div><div class="row" style="margin-top:24px;gap:16px"><div id="recdot" style="width:18px;height:18px;border-radius:50%;background:#ff2d55"></div><div id="scanst" style="font:700 26px Inter">Ready</div></div></div></div>`)}
  <div class="col" style="gap:30px;width:760px">
   ${A(194.5,'spring',`<div class="pillw" style="font-size:30px"><span class="em">📺</span>Result shown directly on screen</div>`)}
   ${A(198.8,'flip',C3('gold','Remember','⚠️',[],740,300))}
   ${A(200.0,'up',`<div class="t4" style="font-weight:800">AI detectors are <u>not</u> definitive proof of who wrote something.</div>`)}
   ${A(204.5,'up',`<div class="t4" style="opacity:.6">Different tools &rarr; different results. One scan &ne; a universal verdict.</div>`)}
  </div>
 </div>`},
// 17 RESULT — gold glow
{s:212.3,e:230.75,bg:'gold',tone:'dark',tr:'zoom',cam:cam({rx:0,ry:0,rz:-3,z:-120,x:0,y:0},{rx:0,ry:0,rz:2,z:40,x:0,y:0}),html:`
 ${A(212.6,'fly',`<div class="col" style="align-items:center;gap:20px"><svg width="360" height="360" viewBox="0 0 360 360"><circle cx="180" cy="180" r="150" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="28"/><circle id="ring" cx="180" cy="180" r="150" fill="none" stroke="#fff" stroke-width="28" stroke-linecap="round" stroke-dasharray="943" stroke-dashoffset="943" transform="rotate(-90 180 180)"/><text x="180" y="210" text-anchor="middle" fill="#fff" font-family="Inter" font-weight="900" font-size="100">&#10003;</text></svg><div class="t3 gG">Scan complete</div></div>`,'position:absolute;top:120px')}
 ${A(216.4,'up',`<div class="t4" style="opacity:.85">The detector&rsquo;s assessment &mdash; alongside the actual text</div>`,'position:absolute;top:660px')}
 <div class="row abs" style="top:770px;gap:28px">
  ${A(222.5,'flip',`<div class="pillw" style="font-size:36px"><b style="font-size:46px">1</b>&nbsp;detector</div>`)}
  ${A(224.2,'flip',`<div class="pillw" style="font-size:36px"><b style="font-size:46px">1</b>&nbsp;sample</div>`)}
  ${A(227.6,'flip',`<div class="pillw" style="font-size:36px;background:#ff2d55;color:#fff"><b style="font-size:46px">1</b>&nbsp;data point &mdash; not a verdict</div>`)}
 </div>${A(217.2,'pop',`<div class="em" style="font-size:140px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">📊</div>`,'position:absolute;left:300px;top:200px')}${A(219.0,'pop',`<div class="em" style="font-size:140px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">🧾</div>`,'position:absolute;left:1500px;top:220px')}${A(220.4,'pop',`<div class="em" style="font-size:120px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">👀</div>`,'position:absolute;left:1560px;top:620px')}`},
// 18 DEMO — blue
{s:230.75,e:245.1,bg:'blue',tone:'dark',tr:'whip',cam:cam({rx:12,ry:-10,rz:0,z:-80,x:0,y:0},{rx:6,ry:8,rz:0,z:20,x:0,y:0}),html:`
 ${A(231.0,'up',`<div class="cap" style="opacity:.85">StealthGPT product demo</div>`,'position:absolute;top:80px')}
 ${A(231.4,'flip',`<div class="uiw" style="width:1400px">${UIBAR}<div style="margin:20px 30px 30px;height:640px;border-radius:26px;position:relative;background:linear-gradient(135deg,#eef2ff,#ffe9f6);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:30px"><div id="play" style="width:170px;height:170px;border-radius:50%;background:linear-gradient(140deg,#4d7bff,#1f45e0);color:#fff;display:flex;align-items:center;justify-content:center;font-size:66px;padding-left:12px;box-shadow:0 12px 0 #1530a8,0 30px 60px rgba(31,69,224,.4)">&#9654;</div><div class="t3 gB">SUPER in action</div><div class="mono" style="font:500 24px Mono;opacity:.5">stealthgpt.ai</div><div style="position:absolute;left:40px;right:40px;bottom:34px;height:10px;border-radius:5px;background:rgba(0,0,0,.08)"><div id="demobar" style="height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#4d7bff,#ff4fa3)"></div></div></div></div>`,'position:absolute;top:150px')}
 ${A(238.8,'spring',`<div class="pillw" style="font-size:30px"><span class="em">🧪</span>Try it on <b>&nbsp;your own&nbsp;</b> writing</div>`,'position:absolute;top:960px')}${A(233.0,'pop',`<div class="em" style="font-size:140px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">🎬</div>`,'position:absolute;left:90px;top:250px')}${A(234.6,'pop',`<div class="em" style="font-size:140px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">⚡</div>`,'position:absolute;left:1720px;top:300px')}${A(236.4,'pop',`<div class="em" style="font-size:120px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.2))">✨</div>`,'position:absolute;left:120px;top:800px')}`},
// 19 WORKFLOW — white cascade
{s:245.1,e:271.0,bg:'white',tone:'light',tr:'burst',cam:cam({rx:30,ry:0,rz:-12,z:-160,x:80,y:320},{rx:22,ry:-4,rz:-8,z:0,x:-40,y:-240}),html:`
 ${A(245.4,'up',`<div class="t2" style="line-height:1"><span style="font-size:52px;font-weight:600;letter-spacing:-1px;display:block">Where does it fit in a</span><span class="gB">real workflow?</span></div>`,'position:absolute;left:140px;top:120px;transform-style:flat')}
 <div class="abs" style="left:640px;top:260px;width:1100px">
  ${A(248.8,'flip',C3('pink','Content creators','🎬',['📝','✨','🎙️'],880,340),'position:absolute;left:0;top:0')}
  ${A(255.5,'flip',C3('orange','Marketing','📣',['🎯','🎨','🏷️'],880,340),'position:absolute;left:110px;top:310px')}
  ${A(264.6,'flip',C3('blue','Newsletters & emails','📧',['📬','✍️','✅'],880,340),'position:absolute;left:220px;top:620px')}
 </div>`},
// 20 REVIEW — gradient
{s:271.0,e:286.0,bg:'grad',tone:'dark',tr:'whipv',cam:cam({rx:0,ry:12,rz:0,z:-80,x:0,y:0},{rx:0,ry:-8,rz:0,z:20,x:0,y:0}),html:`
 <div class="row" style="gap:100px">
  <div class="col" style="gap:20px;width:720px">
   ${A(271.2,'up',`<div class="cap" style="opacity:.9">before you publish</div>`)}
   ${A(271.6,'up',`<div class="t1" style="font-size:110px">Always review it <span class="sel">yourself.</span></div>`)}
  </div>
  ${A(274.6,'flip',`<div class="ui" style="width:640px;padding-bottom:40px">${UIBAR}<div class="col" style="gap:26px;padding:26px 46px 0">
   ${A(275.0,'left',`<div class="row" style="gap:24px"><div class="chk">${CK}</div><div class="t4" style="font-weight:800">Check the facts</div></div>`)}
   ${A(276.3,'left',`<div class="row" style="gap:24px"><div class="chk">${CK}</div><div class="t4" style="font-weight:800">Tone fits your audience</div></div>`)}
   ${A(278.3,'left',`<div class="row" style="gap:24px"><div class="chk">${CK}</div><div class="t4" style="font-weight:800">Says what you mean</div></div>`)}
  </div></div>`)}
 </div>
 ${A(282.0,'spring',`<div class="pillw" style="font-size:32px"><span class="em">🧠</span>Your judgment still matters</div>`,'position:absolute;top:900px')}`},
// 21 TAKEAWAY — dark
{s:286.0,e:294.1,bg:'dark',tone:'dark',tr:'zoom',cam:cam({rx:0,ry:0,rz:0,z:-160,x:0,y:0},{rx:0,ry:0,rz:0,z:40,x:0,y:0}),html:`
 ${A(286.2,'up',`<div class="cap">my main takeaway</div>`,'position:absolute;top:260px')}
 ${A(287.0,'up',`<div class="t1" style="text-align:center;font-size:110px">A draft is ${L('only one part',289.6,0.045,'gO')}<br>of good content.</div>`,'position:absolute;top:360px')}
 ${A(290.5,'pop',`<div class="em" style="font-size:120px">🧩</div>`,'position:absolute;left:1600px;top:230px')}`},
// 21b WHAT MATTERS — white cards
{s:294.1,e:303.3,bg:'white',tone:'light',tr:'burst',cam:cam({rx:16,ry:0,rz:-4,z:-100,x:0,y:60},{rx:8,ry:0,rz:2,z:20,x:0,y:-40}),html:`
 ${A(294.3,'up',`<div class="t3">What <span class="sel">actually</span> matters</div>`,'position:absolute;top:150px')}
 <div class="row abs" style="top:380px;gap:40px">
  ${A(294.6,'flip',C3('purple','How it reads','📖',[],520,330))}
  ${A(296.5,'flip',C3('cyan','Meaning survives','🧠',[],520,330))}
  ${A(299.3,'flip',C3('pink','Right audience','🎯',[],520,330))}
 </div>`},
// 22 RECAP — blue
{s:303.3,e:315.0,bg:'blue',tone:'dark',tr:'whip',cam:cam({rx:10,ry:-8,rz:0,z:-80,x:0,y:0},{rx:4,ry:6,rz:0,z:20,x:0,y:0}),html:`
 ${A(303.5,'up',`<div class="cap" style="opacity:.85">in this test</div>`,'position:absolute;top:180px')}
 <div class="row abs" style="top:300px;gap:26px">
  ${A(304.3,'flip',`<div class="pillw" style="font-size:40px;padding:30px 44px"><span class="em">📄</span>Original draft</div>`)}
  ${A(305.9,'pop',`<div class="t2">&rarr;</div>`)}
  ${A(306.0,'flip',`<div class="pillw" style="font-size:40px;padding:30px 44px"><span class="em">⚡</span>SUPER</div>`)}
  ${A(307.8,'pop',`<div class="t2">&rarr;</div>`)}
  ${A(308.0,'flip',`<div class="pillw" style="font-size:40px;padding:30px 44px"><span class="em">🔍</span>Live detector</div>`)}
 </div>
 ${A(310.3,'up',`<div class="t1" style="text-align:center;font-size:110px">Real output. Real scan.<br><span class="gG">You be the judge.</span></div>`,'position:absolute;top:540px')}`},
// 23 WORTH EXPLORING — gradient
{s:315.0,e:328.1,bg:'grad',tone:'dark',tr:'burst',cam:cam({rx:0,ry:-10,rz:0,z:-80,x:0,y:0},{rx:0,ry:8,rz:0,z:30,x:0,y:0}),html:`
 ${A(315.4,'up',`<div class="cap" style="opacity:.9">work with AI-assisted writing?</div>`,'position:absolute;top:200px')}
 ${A(316.5,'up',`<div class="t1" style="text-align:center"><span class="sel">SUPER</span> is worth exploring<br><span style="font-size:80px;letter-spacing:-2px">in your editing workflow.</span></div>`,'position:absolute;top:290px')}
 ${A(317.5,'pop',`<div class="em" style="font-size:120px">🤩</div>`,'position:absolute;left:1560px;top:200px')}
 ${A(321.9,'spring',`<div class="pillw" style="font-size:30px"><span class="em">⚠️</span>Detector results vary &mdash; no single scan guarantees every tool&rsquo;s response</div>`,'position:absolute;top:760px')}`},
// 24 CTA — blue logo
{s:328.1,e:335.1,bg:'blue',tone:'dark',tr:'dots',cam:cam({rx:0,ry:0,rz:0,z:-120,x:0,y:0},{rx:0,ry:0,rz:0,z:30,x:0,y:0}),html:`
 ${A(328.4,'up',`<div class="cap" style="opacity:.85">explore StealthGPT SUPER</div>`,'position:absolute;top:300px')}
 ${A(328.6,'whoosh',`<div class="t0" style="font-size:200px;letter-spacing:-8px">stealthgpt.ai</div>`,'position:absolute;top:380px')}
 ${A(330.4,'spring',`<div class="pillw" style="font-size:34px"><span id="arr" class="em">👇</span>Link in the description</div>`,'position:absolute;top:680px')}`},
// 25 SUBSCRIBE — white
{s:335.1,e:344.0,bg:'white',tone:'light',tr:'whip',cam:cam({rx:6,ry:-8,rz:0,z:-80,x:0,y:0},{rx:2,ry:6,rz:0,z:30,x:0,y:0}),html:`
 ${A(335.3,'fly',`<div style="transform:rotate(-6deg)">${LOGO('purple','AIDEN AI',300)}</div>`,'position:absolute;top:120px')}
 ${A(336.0,'up',`<div class="t4" style="opacity:.6">walkthroughs &middot; experiments &middot; practical AI workflows</div>`,'position:absolute;top:500px')}
 <div class="row abs" style="top:600px;gap:40px">
  ${A(336.2,'spring',`<div id="subbtn" style="padding:34px 70px;border-radius:999px;background:#ff2d2d;color:#fff;font:800 48px Inter;box-shadow:0 12px 0 #a50e0e,0 30px 60px rgba(255,45,45,.35)">SUBSCRIBE</div>`)}
  ${A(336.5,'pop',`<div id="bell" class="em" style="font-size:110px">🔔</div>`)}
 </div>
 <div id="cursor2" class="abs em" style="left:0;top:0;font-size:90px;opacity:0">👆</div>`},
// 26 THANKS — rays
{s:344.0,e:348,bg:'rays',tone:'light',tr:'burst',cam:cam({rx:0,ry:0,rz:-3,z:-120,x:0,y:0},{rx:0,ry:0,rz:2,z:40,x:0,y:0}),html:`
 ${A(344.1,'slam',`<div class="t1" style="text-align:center">Thanks for watching <span class="em">👋</span></div>`,'position:absolute;top:380px')}
 ${A(344.8,'spring',`<div class="pillw" style="font-size:38px">See you in the next one <span class="em">✨</span></div>`,'position:absolute;top:580px')}`}
];
