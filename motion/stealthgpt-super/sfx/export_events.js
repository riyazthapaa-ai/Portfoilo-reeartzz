const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+path.resolve(process.argv[2]));await p.evaluate(()=>document.fonts.ready);
// render once in every scene so beats/anims exist
const ev=await p.evaluate(()=>{const out=[];const SC=window.SCENES;
 SC.forEach((s,i)=>{ if(i>0) out.push({t:s.s,type:'tr_'+s.tr,i});
  const seen=new Set();
  // need anims: engine stores on scene objects
  (s.anims||[]).forEach(a=>{const nested=!!a.el.parentElement.closest('[data-in]');
    const small=a.el.querySelector('.em')&&a.el.offsetWidth<300; const isEm=a.el.firstElementChild&&a.el.firstElementChild.classList.contains('em');
    out.push({t:+a.t.toFixed(3),type:a.k,nested,em:isEm,i});});
  (s.tys||[]).forEach(y=>out.push({t:y.t,type:'type',n:y.full.length,cps:y.c,i}));
 });return out});
fs.writeFileSync(process.argv[3],JSON.stringify(ev));console.log(ev.length);await b.close()})();
