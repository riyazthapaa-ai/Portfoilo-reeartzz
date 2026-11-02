const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file://'+path.resolve(process.argv[2]));await p.evaluate(()=>document.fonts.ready);
const ts=process.argv.slice(4).map(Number);
for(const t of ts){const t0=Date.now();await p.evaluate(t=>renderAt(t),t);await p.screenshot({path:`${process.argv[3]}/t${t.toFixed(1).padStart(6,'0')}.jpg`,type:'jpeg',quality:70});console.log(t,Date.now()-t0,'ms')}
await b.close()})();
