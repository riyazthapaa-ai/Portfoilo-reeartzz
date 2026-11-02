// ---------- helpers ----------
function A(t, kind, html, style, attrs){return `<div class="a" data-in="${t}" data-a="${kind||'up'}" style="${style||''}" ${attrs||''}>${html}</div>`}
function O(t, tout, kind, html, style, attrs){return A(t,kind,html,style,`data-out="${tout}" ${attrs||''}`)}
function W(text,t0,step,cls,kind){ // word by word
  return text.split(' ').map((w,i)=>`<span class="a ${cls||''}" data-in="${(t0+i*step).toFixed(2)}" data-a="${kind||'up'}" style="display:inline-block;margin-right:.24em">${w}</span>`).join('');
}
function lines(n,hl){let s='';for(let i=0;i<n;i++){const w=[100,94,98,72,100,88,96,60][i%8];s+=`<div class="ln" style="width:${w}%"></div>`}return s}
const CHK='&#10003;';

// ---------- scenes (absolute times in seconds, from VO alignment) ----------
window.SCENES=[
// 1 HOOK
{s:0,e:8.7,ch:'Intro',html:`
 <div class="abs" style="left:0;top:0;width:1920px;height:1080px">
  ${O(0.0,4.75,'fade',`<div class="lbl" style="color:var(--m)">&gt; prompt_</div>`,'position:absolute;left:760px;top:250px')}
  ${O(0.2,4.75,'up',`<div class="h2" style="text-align:center;width:1400px">${W('AI can help you write',0.25,0.17)}</div>`,'position:absolute;left:260px;top:320px')}
  ${O(1.25,4.75,'pop',`<div class="pill" style="font-size:44px;padding:24px 44px"><span class="dot"></span>Scripts</div>`,'position:absolute;left:250px;top:560px;transform-origin:center')}
  ${O(1.85,4.75,'pop',`<div class="pill" style="font-size:44px;padding:24px 44px"><span class="dot" style="background:var(--v);box-shadow:0 0 20px var(--v)"></span>Emails</div>`,'position:absolute;left:640px;top:640px')}
  ${O(2.45,4.75,'pop',`<div class="pill" style="font-size:44px;padding:24px 44px"><span class="dot" style="background:var(--a);box-shadow:0 0 20px var(--a)"></span>Articles</div>`,'position:absolute;left:1010px;top:560px')}
  ${O(3.3,4.75,'pop',`<div class="pill" style="font-size:44px;padding:24px 44px;background:linear-gradient(90deg,rgba(139,108,255,.35),rgba(34,211,238,.25))">&amp; pretty much anything&hellip;</div>`,'position:absolute;left:560px;top:780px')}
  ${A(4.77,'zoom',`<div id="glitch" class="h0" style="text-align:center">BUT&hellip;</div>`,'position:absolute;left:0;width:1920px;top:250px')}
  ${A(5.6,'up',`<div class="h3 mut" style="text-align:center">there&rsquo;s one problem:</div>`,'position:absolute;left:0;width:1920px;top:470px')}
  ${A(6.2,'up',`<div class="h1" style="text-align:center">it doesn&rsquo;t sound <span class="gradp">natural.</span></div>`,'position:absolute;left:0;width:1920px;top:580px')}
  <svg id="flatline" class="abs" style="left:360px;top:780px" width="1200" height="160"><path id="flp" d="" fill="none" stroke="#ff4d8d" stroke-width="6" stroke-linecap="round" style="filter:drop-shadow(0 0 12px #ff4d8d)"/></svg>
 </div>`},
// 2 REWRITE PAIN
{s:8.7,e:16.4,ch:'The Problem',html:`
 <div class="row" style="gap:120px">
  ${A(9.0,'left',`<div class="doc" style="width:600px;transform:rotate(-3deg)"><div class="tt">Draft_v1.docx</div>${lines(3)}<div style="position:relative">${lines(2)}<div class="strike a" data-in="11.2" data-a="grow" style="width:105%;top:30%"></div></div><div style="position:relative">${lines(2)}<div class="strike a" data-in="12.6" data-a="grow" style="width:95%;top:30%"></div></div><div style="position:relative">${lines(2)}<div class="strike a" data-in="13.9" data-a="grow" style="width:100%;top:30%"></div></div></div>`)}
  <div class="col" style="gap:30px;align-items:flex-start">
   ${A(9.4,'up',`<div class="lbl">Creating content professionally?</div>`)}
   ${A(11.6,'pop',`<div class="row" style="gap:28px"><svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="16"/><circle id="clk" cx="100" cy="100" r="86" fill="none" stroke="#ff4d8d" stroke-width="16" stroke-linecap="round" stroke-dasharray="540" stroke-dashoffset="540" transform="rotate(-90 100 100)"/><line id="hand" x1="100" y1="100" x2="100" y2="34" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg><div><div class="h0" style="font-size:170px"><span id="mins">0</span><span style="font-size:80px;letter-spacing:-2px"> min</span></div></div></div>`)}
   ${A(13.6,'up',`<div class="h3">spent <span class="gradp">rewriting</span> what AI<br>already helped you write.</div>`)}
  </div>
 </div>`},
// 3 TODAY: SUPER + plan
{s:16.4,e:28.3,ch:'Today’s Test',html:`
 ${O(16.5,20.5,'up',`<div class="lbl" style="text-align:center">Today I&rsquo;m testing</div>`,'position:absolute;top:250px;width:1920px;text-align:center')}
 ${O(17.6,20.5,'up',`<div class="h2" style="text-align:center">StealthGPT&rsquo;s newest model</div>`,'position:absolute;top:320px;width:1920px')}
 ${O(19.0,20.5,'zoom',`<div class="h0 grad glow" style="font-size:300px;text-align:center;letter-spacing:-12px">SUPER</div>`,'position:absolute;top:470px;width:1920px')}
 <div class="row abs" style="top:380px;left:0;width:1920px;justify-content:center;gap:40px">
  ${A(20.9,'up',`<div class="card" style="width:440px;padding:44px"><div class="lbl" style="color:var(--m)">Step 01</div><div class="h3" style="margin-top:22px">AI-generated<br>writing</div></div>`)}
  ${A(22.6,'pop',`<div class="h2 mut">&rarr;</div>`)}
  ${A(23.0,'up',`<div class="card" style="width:440px;padding:44px;border-color:rgba(139,108,255,.6);box-shadow:0 0 80px rgba(139,108,255,.35)"><div class="lbl">Step 02</div><div class="h3 grad" style="margin-top:22px">Process<br>with SUPER</div></div>`)}
  ${A(24.8,'pop',`<div class="h2 mut">&rarr;</div>`)}
  ${A(25.2,'up',`<div class="card" style="width:440px;padding:44px"><div class="lbl" style="color:var(--p)">Step 03</div><div class="h3" style="margin-top:22px">Real AI detector<br><span class="mut" style="font-size:36px">&#9679; on camera</span></div></div>`)}
 </div>`},
// 4 CRITERIA
{s:28.3,e:36.6,ch:'Today’s Test',html:`
 <div class="row" style="gap:140px">
  <div class="col" style="gap:34px">
   ${A(28.6,'up',`<div class="lbl">What we&rsquo;ll look at</div>`)}
   ${A(29.3,'left',`<div class="row" style="gap:30px"><div class="check">1</div><div class="h3">Writing quality</div></div>`)}
   ${A(30.7,'left',`<div class="row" style="gap:30px"><div class="check" style="background:var(--c)">2</div><div class="h3">Meaning stays intact</div></div>`)}
   ${A(32.5,'left',`<div class="row" style="gap:30px"><div class="check" style="background:var(--v)">3</div><div class="h3">What the detector reports</div></div>`)}
  </div>
  ${A(34.1,'stamp',`<div style="border:10px solid var(--p);color:var(--p);border-radius:24px;padding:26px 44px;transform:rotate(-8deg);font:900 76px/1 Inter;letter-spacing:-2px;text-align:center">NO EDITED<br>RESULTS</div>`)}
 </div>
 ${A(35.8,'up',`<div class="h4 mut">Let&rsquo;s see what happens &rarr;</div>`,'position:absolute;bottom:170px')}`},
// 5 AI FOR WORK
{s:36.6,e:48.95,ch:'AI at Work',html:`
 ${A(36.9,'up',`<div class="h2" style="text-align:center">AI is <span class="grad">genuinely useful</span> at work</div>`,'position:absolute;top:200px;width:1920px')}
 <div class="row abs" style="top:430px;left:0;width:1920px;justify-content:center;gap:70px">
  ${A(41.4,'up',`<div class="card col" style="width:440px;padding:46px;gap:28px"><div class="icon" style="background:rgba(251,191,36,.15);color:var(--a)">&#10022;</div><div class="h3">Brainstorm<br>ideas</div></div>`)}
  ${A(43.1,'up',`<div class="card col" style="width:440px;padding:46px;gap:28px"><div class="icon" style="background:rgba(34,211,238,.15);color:var(--c)">&#9638;</div><div class="h3">Organize<br>information</div></div>`)}
  ${A(44.6,'up',`<div class="card col" style="width:440px;padding:46px;gap:28px"><div class="icon" style="background:rgba(139,108,255,.18);color:var(--v)">&#10148;</div><div class="h3">Speed up the<br>workflow</div></div>`)}
 </div>`},
// 6 FIRST DRAFT PROBLEMS
{s:48.95,e:59.85,ch:'The Problem',html:`
 <div class="row" style="gap:110px">
  ${A(49.2,'left',`<div style="position:relative"><div class="doc" style="width:640px"><div class="tt">First draft</div>${lines(2)}<div style="position:relative">${lines(2)}<div class="hl a" data-in="51.4" data-a="grow" style="left:-8px;top:6px;height:72px;width:104%;background:rgba(255,77,141,.28);border:3px solid var(--p)"></div></div>${lines(1)}<div style="position:relative">${lines(2)}<div class="hl a" data-in="53.2" data-a="grow" style="left:-8px;top:6px;height:72px;width:90%;background:rgba(251,191,36,.3);border:3px solid var(--a)"></div></div>${lines(1)}<div style="position:relative">${lines(2)}<div class="hl a" data-in="55.3" data-a="grow" style="left:-8px;top:6px;height:72px;width:100%;background:rgba(139,108,255,.3);border:3px solid var(--v)"></div></div></div></div>`)}
  <div class="col" style="gap:36px">
   ${A(49.3,'up',`<div class="h2" style="font-size:72px">First draft <span class="gradp">&ne;</span> final draft</div>`)}
   ${A(51.4,'right',`<div class="pill"><span class="dot" style="background:var(--p);box-shadow:0 0 20px var(--p)"></span>Repetitive sentences</div>`)}
   ${A(53.2,'right',`<div class="pill"><span class="dot" style="background:var(--a);box-shadow:0 0 20px var(--a)"></span>Predictable transitions</div>`)}
   ${A(55.3,'right',`<div class="pill"><span class="dot" style="background:var(--v);box-shadow:0 0 20px var(--v)"></span>Tone that isn&rsquo;t <i>you</i></div>`)}
  </div>
 </div>`},
// 7 GOAL
{s:59.85,e:69.95,ch:'The Goal',html:`
 <div class="col" style="gap:40px;align-items:center">
  ${A(60.1,'up',`<div class="lbl">The goal isn&rsquo;t just&hellip;</div>`)}
  ${A(60.5,'up',`<div style="position:relative"><div class="h1 mut">Generate text faster</div><div class="strike a" data-in="62.4" data-a="grow" style="width:104%"></div></div>`)}
  ${A(63.0,'pop',`<div class="h1" style="text-align:center">Communicate <span class="grad">clearly.</span><br>Sound like <span class="gradp">you.</span></div>`)}
  ${A(66.1,'up',`<div class="pill" style="margin-top:20px"><span class="dot"></span>The problem StealthGPT&rsquo;s new SUPER model is trying to address</div>`)}
 </div>`},
// 8 MEET SUPER
{s:69.95,e:83.3,ch:'Meet SUPER',html:`
 ${O(70.2,74.0,'zoom',`<div class="col" style="align-items:center;gap:20px"><div class="lbl">Introducing &middot; StealthGPT</div><div class="h0 grad glow" style="font-size:280px;letter-spacing:-12px">SUPER</div><div class="h3 mut">its newest AI humanizer model</div></div>`,'position:absolute;top:250px;width:1920px;display:flex;justify-content:center')}
 ${A(74.2,'up',`<div class="h3" style="text-align:center">The idea is straightforward</div>`,'position:absolute;top:190px;width:1920px')}
 <div class="row abs" style="top:330px;left:0;width:1920px;justify-content:center;gap:50px">
  ${A(75.0,'left',`<div class="doc" style="width:420px;padding:36px"><div class="lbl" style="color:#6b6790;letter-spacing:2px;font-size:20px">AI-assisted text</div>${lines(6)}</div>`)}
  ${A(76.6,'pop',`<div class="col" style="align-items:center;gap:20px"><div id="core" style="width:230px;height:230px;border-radius:50%;background:conic-gradient(from 0deg,#8b6cff,#22d3ee,#ff4d8d,#8b6cff);display:flex;align-items:center;justify-content:center;box-shadow:0 0 120px rgba(139,108,255,.7)"><div style="width:190px;height:190px;border-radius:50%;background:#0d0b1d;display:flex;align-items:center;justify-content:center;font:900 48px Inter">SUPER</div></div><div class="lbl" style="font-size:20px">refines how it reads</div></div>`)}
  <div class="col" style="gap:26px">
   ${A(79.6,'right',`<div class="pill"><span class="check" style="width:44px;height:44px;font-size:24px">${CHK}</span>Original message</div>`)}
   ${A(81.0,'right',`<div class="pill"><span class="check" style="width:44px;height:44px;font-size:24px">${CHK}</span>Context</div>`)}
   ${A(81.9,'right',`<div class="pill"><span class="check" style="width:44px;height:44px;font-size:24px">${CHK}</span>Tone</div>`)}
  </div>
 </div>`},
// 9 CLAIM
{s:83.3,e:91.6,ch:'Meet SUPER',html:`
 ${A(83.5,'up',`<div class="card" style="width:1400px;padding:80px 90px;position:relative"><div style="position:absolute;top:-40px;left:70px;font:900 200px/1 Inter;color:var(--v)">&ldquo;</div><div class="lbl" style="color:var(--m)">According to StealthGPT</div><div class="h2" style="margin-top:30px;font-size:70px">SUPER is designed to <span class="grad">improve readability</span> without the quality compromises of older humanization tools.</div></div>`)}`},
// 10 TEST IT
{s:91.6,e:104.7,ch:'The Plan',html:`
 ${O(91.9,96.9,'up',`<div class="row" style="gap:60px;align-items:center"><div class="h1 mut" style="position:relative">Claim<div class="strike a" data-in="94.0" data-a="grow" style="width:110%"></div></div><div class="h1">&rarr;</div><div class="h1 grad">Test it.</div></div>`,'position:absolute;top:440px;width:1920px;display:flex;justify-content:center')}
 ${A(97.2,'up',`<div class="lbl" style="text-align:center">The test plan</div>`,'position:absolute;top:260px;width:1920px')}
 <div class="row abs" style="top:360px;left:0;width:1920px;justify-content:center;gap:28px">
  ${A(97.6,'up',`<div class="card col" style="width:380px;height:300px;padding:40px;gap:20px"><div class="num grad">01</div><div class="h4">Start with AI-generated writing</div></div>`)}
  ${A(99.6,'up',`<div class="card col" style="width:380px;height:300px;padding:40px;gap:20px"><div class="num grad">02</div><div class="h4">Run it through SUPER</div></div>`)}
  ${A(101.0,'up',`<div class="card col" style="width:380px;height:300px;padding:40px;gap:20px"><div class="num grad">03</div><div class="h4">Compare original vs processed</div></div>`)}
  ${A(103.0,'up',`<div class="card col" style="width:380px;height:300px;padding:40px;gap:20px"><div class="num gradp">04</div><div class="h4">Test them</div></div>`)}
 </div>`},
// 11 TOPIC + USE CASES
{s:104.7,e:122.3,ch:'The Sample',html:`
 <div class="row" style="gap:100px">
  ${A(105.0,'left',`<div class="doc" style="width:620px;transform:rotate(-2deg)"><div class="lbl" style="color:#6b6790;font-size:18px;letter-spacing:2px">Short professional article</div><div class="tt" style="margin-top:18px;font-size:38px">How AI Tools Are Changing the Way Small Businesses Create Content</div>${lines(5)}</div>`)}
  <div class="col" style="gap:28px;width:760px">
   ${A(112.2,'up',`<div class="h3">A normal, work-related example</div>`)}
   ${A(113.6,'up',`<div class="h4 mut">where AI is genuinely useful:</div>`)}
   <div class="row" style="flex-wrap:wrap;gap:22px;margin-top:10px">
    ${A(118.0,'pop',`<div class="pill">Marketing copy</div>`)}
    ${A(119.1,'pop',`<div class="pill">Newsletters</div>`)}
    ${A(120.0,'pop',`<div class="pill">Website content</div>`)}
    ${A(121.0,'pop',`<div class="pill">Creative projects</div>`)}
   </div>
  </div>
 </div>`},
// 12 PROMPT + DRAFT
{s:122.3,e:138.2,ch:'The Sample',html:`
 <div class="row" style="gap:70px;align-items:flex-start">
  <div class="col" style="gap:30px">
  ${A(122.5,'up',`<div class="win" style="width:760px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">prompt</div></div><div style="padding:40px"><div class="lbl" style="font-size:20px">The prompt</div><div class="mono" style="font-size:30px;line-height:1.45;margin-top:20px;min-height:180px"><span class="ty" data-ty="122.6" data-cps="38">Write a short professional article about how AI tools are changing the way small businesses create content.</span></div></div></div>`)}
  ${A(130.3,'up',`<div class="card row" style="width:760px;padding:30px 36px;gap:24px;border-color:rgba(52,211,153,.5)"><div class="check">${CHK}</div><div class="h4" style="font-size:30px">Actual AI-generated text &mdash; <span class="mut">not written to manipulate a detector</span></div></div>`)}
  </div>
  ${A(124.0,'right',`<div style="position:relative"><div class="doc" style="width:560px"><div class="lbl" style="color:#6b6790;font-size:18px;letter-spacing:2px">First draft &middot; AI</div><div class="tt" style="margin-top:14px">How AI Tools Are Changing the Way Small Businesses Create Content</div><div class="ln a" data-in="124.3" data-a="wipe"></div><div class="ln a" data-in="124.45" data-a="wipe" style="width:92%"></div><div class="ln a" data-in="124.6" data-a="wipe"></div><div class="ln a" data-in="124.75" data-a="wipe" style="width:70%"></div><div class="ln a" data-in="124.9" data-a="wipe"></div><div class="ln a" data-in="125.05" data-a="wipe" style="width:96%"></div><div class="ln a" data-in="125.2" data-a="wipe" style="width:60%"></div></div>${A(125.8,'stamp',`<div style="position:absolute;right:-50px;bottom:-40px;background:var(--g);color:#06150f;font:800 30px Inter;padding:18px 28px;border-radius:18px;box-shadow:0 20px 60px rgba(52,211,153,.4)">&#128190; Saved: original_v1</div>`)}</div>`)}
 </div>`},
// 13 INTO SUPER
{s:138.2,e:155.6,ch:'Running SUPER',html:`
 <div class="row" style="gap:70px;align-items:center">
  ${A(138.5,'up',`<div class="win" style="width:980px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">stealthgpt.ai &middot; SUPER</div></div><div style="padding:40px;display:flex;flex-direction:column;gap:26px"><div class="row" style="justify-content:space-between"><div class="lbl" style="font-size:20px">Input &middot; exact first draft</div><div class="pill" style="font-size:22px;padding:10px 22px;border-color:rgba(139,108,255,.6)">Model: <b class="grad">SUPER</b></div></div><div style="background:#0b0a17;border-radius:18px;padding:30px;border:1px solid var(--line)">${['100%','94%','98%','80%','100%','66%'].map((w,i)=>`<div class="a" data-in="${(139.6+i*0.18).toFixed(2)}" data-a="wipe" style="height:16px;border-radius:8px;background:#2a2648;margin:12px 0;width:${w}"></div>`).join('')}</div><div class="row" style="gap:24px"><div id="runbtn" style="padding:24px 50px;border-radius:18px;background:linear-gradient(90deg,#8b6cff,#22d3ee);font:800 30px Inter;color:#07060f">&#9654; Humanize</div><div style="flex:1;height:14px;border-radius:7px;background:#1d1a35;overflow:hidden"><div id="runbar" style="height:100%;width:0;background:linear-gradient(90deg,#8b6cff,#22d3ee)"></div></div><div id="runpct" class="mono" style="font-size:26px;color:var(--m);width:90px">0%</div></div></div></div>`)}
  <div class="col" style="gap:26px;width:620px">
   ${A(142.4,'up',`<div class="h4 mut">Not just: does the wording change?</div>`)}
   ${A(146.6,'right',`<div class="pill" style="font-size:30px"><span class="dot"></span>Same ideas communicated?</div>`)}
   ${A(149.8,'right',`<div class="pill" style="font-size:30px"><span class="dot" style="background:var(--v);box-shadow:0 0 20px var(--v)"></span>Reads naturally?</div>`)}
   ${A(151.6,'right',`<div class="pill" style="font-size:30px"><span class="dot" style="background:var(--a);box-shadow:0 0 20px var(--a)"></span>Still useful for its purpose?</div>`)}
   ${A(155.0,'pop',`<div class="h3 grad">Let&rsquo;s run it.</div>`)}
  </div>
 </div>
 <svg id="cursor" class="abs" style="left:0;top:0;opacity:0" width="48" height="48" viewBox="0 0 24 24"><path d="M3 2l7 19 2.5-8L21 10z" fill="#fff" stroke="#07060f" stroke-width="1.5"/></svg>`},
// 14 RESULT side by side
{s:155.6,e:173.5,ch:'The Result',html:`
 ${A(155.8,'up',`<div class="lbl" style="text-align:center">Here&rsquo;s the result &middot; side by side</div>`,'position:absolute;top:120px;width:1920px')}
 <div class="row abs" style="top:200px;left:0;width:1920px;justify-content:center;gap:60px">
  ${A(156.9,'left',`<div class="doc" style="width:700px;padding:40px"><div class="row" style="justify-content:space-between"><div class="tt" style="font-size:26px">Original</div><div class="mono" style="font-size:18px;color:#6b6790">AI draft</div></div>${lines(10)}</div>`)}
  ${A(157.3,'right',`<div class="doc" style="width:700px;padding:40px;box-shadow:0 0 0 4px #8b6cff,0 40px 120px rgba(139,108,255,.45)"><div class="row" style="justify-content:space-between"><div class="tt" style="font-size:26px">Processed</div><div class="mono" style="font-size:18px;color:#8b6cff">SUPER</div></div>${lines(10)}</div>`)}
 </div>
 <div class="row abs" style="bottom:120px;gap:22px">
  ${A(160.0,'pop',`<div class="pill" style="font-size:28px">&#9312; Opening</div>`)}
  ${A(161.3,'pop',`<div class="pill" style="font-size:28px">&#9313; Sentence structure</div>`)}
  ${A(162.6,'pop',`<div class="pill" style="font-size:28px">&#9314; Transitions</div>`)}
  ${A(163.8,'pop',`<div class="pill" style="font-size:28px">&#9315; Practical info kept?</div>`)}
 </div>
 <div id="scanbox" class="abs" style="left:0;top:0;border:4px solid var(--c);border-radius:14px;box-shadow:0 0 40px rgba(34,211,238,.5);opacity:0"></div>
 ${A(166.4,'zoom',`<div class="card" style="padding:60px 80px;text-align:center;background:rgba(10,8,24,.92)"><div class="lbl" style="color:var(--a)">For professional writing</div><div class="h2" style="margin-top:24px">Different wording + confusing text<br>= <span class="gradp">not an improvement.</span></div></div>`,'position:absolute;top:330px;width:1920px;display:flex;justify-content:center')}`},
// 15 BOTH VERSIONS
{s:173.5,e:187.65,ch:'The Result',html:`
 <div class="col" style="gap:40px;align-items:center">
  ${A(173.8,'up',`<div class="h2" style="text-align:center">Same writing.<br><span class="grad">A different approach.</span></div>`)}
  <div class="row" style="gap:40px;margin-top:20px">
   ${A(179.4,'up',`<div class="card" style="padding:40px 50px;width:520px"><div class="lbl">Goal</div><div class="h3" style="margin-top:16px">Easier to read</div></div>`)}
   ${A(180.6,'pop',`<div class="h2 mut">+</div>`)}
   ${A(181.4,'up',`<div class="card" style="padding:40px 50px;width:620px"><div class="lbl" style="color:var(--g)">Keep</div><div class="h3" style="margin-top:16px">Original ideas &amp; info intact</div></div>`)}
  </div>
  ${A(185.0,'up',`<div class="pill" style="margin-top:20px;border-color:rgba(255,77,141,.6)"><span class="dot" style="background:var(--p);box-shadow:0 0 20px var(--p)"></span>Next: put it to the test</div>`)}
 </div>`},
// 16 DETECTOR
{s:187.65,e:212.3,ch:'Detector Test',html:`
 ${O(187.8,191.3,'zoom',`<div class="col" style="align-items:center;gap:20px"><div class="lbl" style="color:var(--p)">The part everyone wants to see</div><div class="h0">The <span class="gradp">detector</span> test</div></div>`,'position:absolute;top:340px;width:1920px;display:flex;justify-content:center')}
 <div class="row abs" style="top:170px;left:0;width:1920px;justify-content:center;gap:80px;align-items:flex-start">
  ${A(191.6,'left',`<div class="win" style="width:820px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">HumanizeReval &middot; AI detector</div></div><div style="padding:40px;position:relative;overflow:hidden"><div class="lbl" style="font-size:20px;color:var(--m)">Submitted &middot; processed text</div><div style="background:#f6f5ff;border-radius:16px;padding:26px;margin-top:20px">${['100%','94%','98%','80%','100%','90%','66%'].map(w=>`<div style="height:15px;border-radius:8px;background:#d9d6ea;margin:12px 0;width:${w}"></div>`).join('')}</div><div id="laser" style="position:absolute;left:30px;right:30px;height:6px;top:120px;background:var(--c);box-shadow:0 0 30px 8px rgba(34,211,238,.6);opacity:0;border-radius:3px"></div><div class="row" style="margin-top:26px;gap:18px"><div class="dot" id="recdot" style="background:var(--p);box-shadow:0 0 20px var(--p)"></div><div id="scanst" class="mono" style="font-size:24px;color:var(--m)">Ready</div></div></div></div>`)}
  <div class="col" style="gap:30px;width:740px">
   ${A(194.5,'up',`<div class="pill" style="font-size:28px"><span class="dot" style="background:var(--p);box-shadow:0 0 20px var(--p)"></span>Result shown directly on screen</div>`)}
   ${A(198.8,'up',`<div class="card" style="padding:44px;border-color:rgba(251,191,36,.5)"><div class="lbl" style="color:var(--a)">&#9888; Remember</div><div class="h3" style="margin-top:18px;font-size:46px">AI detectors are <u>not</u> definitive proof of who wrote something.</div></div>`)}
   ${A(204.5,'up',`<div class="h4 mut">Different tools &rarr; different results.<br>One scan &ne; a universal verdict.</div>`)}
  </div>
 </div>`},
// 17 DETECTOR RESULT
{s:212.3,e:230.75,ch:'Detector Test',html:`
 <div class="row" style="gap:110px">
  ${A(212.6,'zoom',`<div class="card col" style="width:640px;padding:60px;align-items:center;gap:26px"><svg width="360" height="360" viewBox="0 0 360 360"><circle cx="180" cy="180" r="150" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="26"/><circle id="ring" cx="180" cy="180" r="150" fill="none" stroke="url(#rg)" stroke-width="26" stroke-linecap="round" stroke-dasharray="943" stroke-dashoffset="943" transform="rotate(-90 180 180)"/><defs><linearGradient id="rg"><stop offset="0" stop-color="#8b6cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><text x="180" y="200" text-anchor="middle" fill="#fff" font-family="Inter" font-weight="900" font-size="64">${CHK}</text></svg><div class="h3">Scan complete</div><div class="lbl" style="color:var(--m);font-size:20px">Result from the live scan</div></div>`)}
  <div class="col" style="gap:30px">
   ${A(216.4,'up',`<div class="h3" style="width:720px">Detector&rsquo;s assessment <span class="mut">alongside the actual text</span></div>`)}
   <div class="row" style="gap:24px;margin-top:20px">
    ${A(222.5,'pop',`<div class="card col" style="width:220px;padding:34px;align-items:center"><div class="num grad">1</div><div class="h4" style="font-size:28px">detector</div></div>`)}
    ${A(224.2,'pop',`<div class="card col" style="width:220px;padding:34px;align-items:center"><div class="num grad">1</div><div class="h4" style="font-size:28px">sample</div></div>`)}
    ${A(227.6,'pop',`<div class="card col" style="width:220px;padding:34px;align-items:center;border-color:rgba(255,77,141,.6)"><div class="num gradp">1</div><div class="h4" style="font-size:28px">data point</div></div>`)}
   </div>
   ${A(228.6,'up',`<div class="h4 mut">&mdash; not a universal verdict.</div>`)}
  </div>
 </div>`},
// 18 DEMO
{s:230.75,e:245.1,ch:'Product Demo',html:`
 ${A(231.0,'up',`<div class="lbl" style="text-align:center">StealthGPT product demo</div>`,'position:absolute;top:110px;width:1920px')}
 ${A(231.4,'zoom',`<div class="win" style="width:1400px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">https://www.stealthgpt.ai</div></div><div style="height:690px;position:relative;background:radial-gradient(600px 400px at 50% 40%,rgba(139,108,255,.25),transparent),#0b0a17;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:30px"><div id="play" style="width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:60px;padding-left:12px">&#9654;</div><div class="h3 grad">SUPER in action</div><div style="position:absolute;left:40px;right:40px;bottom:34px;height:8px;border-radius:4px;background:rgba(255,255,255,.12)"><div id="demobar" style="height:100%;width:0;border-radius:4px;background:linear-gradient(90deg,#8b6cff,#22d3ee)"></div></div></div></div>`)}
 ${A(238.8,'up',`<div class="pill" style="font-size:28px">Try the workflow on <b>&nbsp;your own&nbsp;</b> writing</div>`,'position:absolute;bottom:60px')}`},
// 19 WORKFLOW
{s:245.1,e:271.0,ch:'Real Workflows',html:`
 ${A(245.4,'up',`<div class="h2" style="text-align:center">Where does it fit in a <span class="grad">real workflow?</span></div>`,'position:absolute;top:150px;width:1920px')}
 <div class="row abs" style="top:370px;left:0;width:1920px;justify-content:center;gap:50px">
  ${A(248.8,'up',`<div class="card col" style="width:520px;height:480px;padding:50px;gap:24px"><div class="icon" style="background:rgba(255,77,141,.15);color:var(--p)">&#9673;</div><div class="h3" style="font-size:46px">Content creators</div><div class="h4 mut" style="font-size:28px;line-height:1.4">AI-assisted script &rarr; refine the writing &rarr; record</div></div>`)}
  ${A(255.5,'up',`<div class="card col" style="width:520px;height:480px;padding:50px;gap:24px"><div class="icon" style="background:rgba(251,191,36,.15);color:var(--a)">&#9650;</div><div class="h3" style="font-size:46px">Marketing</div><div class="h4 mut" style="font-size:28px;line-height:1.4">Campaign draft &rarr; review for clarity, tone &amp; brand consistency</div></div>`)}
  ${A(264.6,'up',`<div class="card col" style="width:520px;height:480px;padding:50px;gap:24px"><div class="icon" style="background:rgba(34,211,238,.15);color:var(--c)">&#9993;</div><div class="h3" style="font-size:46px">Newsletters &amp; emails</div><div class="h4 mut" style="font-size:28px;line-height:1.4">One more step in your editing process</div></div>`)}
 </div>`},
// 20 REVIEW
{s:271.0,e:286.0,ch:'Real Workflows',html:`
 <div class="row" style="gap:120px">
  <div class="col" style="gap:30px;width:760px">
   ${A(271.2,'up',`<div class="lbl" style="color:var(--a)">Before you publish</div>`)}
   ${A(271.6,'up',`<div class="h2" style="font-size:76px">Always review it <span class="grad">yourself.</span></div>`)}
  </div>
  <div class="col" style="gap:28px">
   ${A(275.0,'right',`<div class="row" style="gap:26px"><div class="check">${CHK}</div><div class="h3" style="font-size:46px">Check the facts</div></div>`)}
   ${A(276.3,'right',`<div class="row" style="gap:26px"><div class="check">${CHK}</div><div class="h3" style="font-size:46px">Tone fits your audience</div></div>`)}
   ${A(278.3,'right',`<div class="row" style="gap:26px"><div class="check">${CHK}</div><div class="h3" style="font-size:46px">Says what you mean</div></div>`)}
  </div>
 </div>
 ${A(282.0,'up',`<div class="pill" style="font-size:32px;border-color:rgba(139,108,255,.6)">The tool helps the workflow &mdash; <b class="grad">&nbsp;your judgment still matters</b></div>`,'position:absolute;bottom:150px')}`},
// 21 TAKEAWAY
{s:286.0,e:303.3,ch:'Takeaway',html:`
 ${O(286.2,293.8,'up',`<div class="col" style="align-items:center;gap:30px"><div class="lbl">My main takeaway</div><div class="h1" style="text-align:center;font-size:100px">Generating a draft is<br><span class="grad">only one part</span> of good content.</div></div>`,'position:absolute;top:300px;width:1920px;display:flex;justify-content:center')}
 ${A(294.3,'up',`<div class="h3" style="text-align:center">What actually matters</div>`,'position:absolute;top:230px;width:1920px')}
 <div class="row abs" style="top:380px;left:0;width:1920px;justify-content:center;gap:50px">
  ${A(294.6,'up',`<div class="card col" style="width:500px;padding:50px;gap:20px"><div class="num grad">01</div><div class="h3" style="font-size:44px">How the writing reads</div></div>`)}
  ${A(296.5,'up',`<div class="card col" style="width:500px;padding:50px;gap:20px"><div class="num grad">02</div><div class="h3" style="font-size:44px">Whether meaning survives editing</div></div>`)}
  ${A(299.3,'up',`<div class="card col" style="width:500px;padding:50px;gap:20px"><div class="num grad">03</div><div class="h3" style="font-size:44px">Right for the audience</div></div>`)}
 </div>`},
// 22 RECAP
{s:303.3,e:315.0,ch:'Recap',html:`
 ${A(303.5,'up',`<div class="lbl" style="text-align:center">In this test</div>`,'position:absolute;top:220px;width:1920px')}
 <div class="row abs" style="top:330px;left:0;width:1920px;justify-content:center;gap:30px;align-items:center">
  ${A(304.3,'pop',`<div class="card" style="padding:40px 50px"><div class="h3" style="font-size:44px">Original draft</div></div>`)}
  ${A(305.9,'pop',`<div class="h2 mut">&rarr;</div>`)}
  ${A(306.0,'pop',`<div class="card" style="padding:40px 50px;border-color:rgba(139,108,255,.6)"><div class="h3 grad" style="font-size:44px">Processed with SUPER</div></div>`)}
  ${A(307.8,'pop',`<div class="h2 mut">&rarr;</div>`)}
  ${A(308.0,'pop',`<div class="card" style="padding:40px 50px;border-color:rgba(255,77,141,.6)"><div class="h3" style="font-size:44px">Live detector</div></div>`)}
 </div>
 ${A(310.3,'up',`<div class="h2" style="text-align:center">Real output. Real scan.<br><span class="grad">You be the judge.</span></div>`,'position:absolute;top:600px;width:1920px')}`},
// 23 WORTH EXPLORING
{s:315.0,e:328.1,ch:'Verdict',html:`
 <div class="col" style="gap:40px;align-items:center">
  ${A(315.4,'up',`<div class="lbl">Work with AI-assisted writing?</div>`)}
  ${A(316.5,'zoom',`<div class="h1" style="text-align:center"><span class="grad">SUPER</span> is worth exploring<br>in your editing workflow.</div>`)}
  ${A(321.9,'up',`<div class="card row" style="padding:36px 50px;gap:26px;border-color:rgba(251,191,36,.5)"><div class="h3" style="color:var(--a)">&#9888;</div><div class="h4" style="font-size:34px">Detector results vary &mdash; <span class="mut">no single scan guarantees how every tool responds.</span></div></div>`)}
 </div>`},
// 24 OUTRO
{s:328.1,e:347,ch:'Thanks for watching',html:`
 ${O(328.4,335.0,'zoom',`<div class="col" style="align-items:center;gap:34px"><div class="lbl">Explore StealthGPT SUPER</div><div class="h0 grad glow" style="font-size:200px">stealthgpt.ai</div><div class="pill" style="font-size:34px"><span id="arr">&darr;</span>&nbsp;Link in the description</div></div>`,'position:absolute;top:270px;width:1920px;display:flex;justify-content:center')}
 ${O(335.2,343.9,'up',`<div class="col" style="align-items:center;gap:40px"><div class="row" style="gap:30px"><div style="width:150px;height:150px;border-radius:40px;background:conic-gradient(from 200deg,#8b6cff,#22d3ee,#ff4d8d,#8b6cff);box-shadow:0 0 80px rgba(139,108,255,.6)"></div><div><div class="h1">AIDEN AI</div><div class="h4 mut" style="font-size:30px">Walkthroughs &middot; experiments &middot; practical AI workflows</div></div></div><div class="row" style="gap:30px;margin-top:20px"><div id="subbtn" style="padding:30px 64px;border-radius:999px;background:#ff2d2d;font:800 44px Inter;box-shadow:0 20px 60px rgba(255,45,45,.4)">SUBSCRIBE</div><div id="bell" style="font-size:80px">&#128276;</div></div></div>`,'position:absolute;top:300px;width:1920px;display:flex;justify-content:center')}
 ${A(344.1,'zoom',`<div class="col" style="align-items:center;gap:20px"><div class="h0" style="font-size:150px">Thanks for watching</div><div class="h3 grad">See you in the next one.</div></div>`,'position:absolute;top:360px;width:1920px;display:flex;justify-content:center')}
 <svg id="cursor2" class="abs" style="left:0;top:0;opacity:0" width="56" height="56" viewBox="0 0 24 24"><path d="M3 2l7 19 2.5-8L21 10z" fill="#fff" stroke="#07060f" stroke-width="1.5"/></svg>`}
];
