const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1920,height:1080}});
const logs=new Set();p.on('console',m=>logs.add(m.text()));p.on('pageerror',e=>logs.add('ERR '+e.message));
await p.goto('file://'+path.resolve('main.html'));await p.evaluate(()=>window.ready);
const t0=Date.now();const r=await p.evaluate(()=>{const ts=[];for(let t=0;t<410.5;t+=0.5){const a=performance.now();drawFrame(ctx,t);ts.push(performance.now()-a);}return ts;});
console.log('avg ms',(r.reduce((a,b)=>a+b)/r.length).toFixed(1),'max',Math.max(...r).toFixed(0),'at',r.indexOf(Math.max(...r))/2);
console.log([...logs].join('\n'));await b.close();})();
