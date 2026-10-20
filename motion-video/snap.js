// node snap.js page.html out_prefix t1 t2 ... -> PNG stills for review
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{const [page,pre,...ts]=process.argv.slice(2);const b=await chromium.launch({args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log(m.text()));
await p.goto('file://'+path.resolve(page));await p.evaluate(()=>window.ready);
for(const t of ts){const s=await p.evaluate(t=>window.frameJPEG(+t),t);fs.writeFileSync(`${pre}_${t}.jpg`,Buffer.from(s,'base64'));}
await b.close();})();
