const {chromium}=require('playwright');
(async()=>{
  const [clip,...ts]=process.argv.slice(2);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+__dirname+'/../source/motion.html?clip='+clip);
  await p.waitForFunction(()=>window.READY);
  for(const t of ts){await p.evaluate(t=>seek(+t),t);await p.screenshot({path:`still_${clip}_${t}.jpg`,quality:80});}
  await b.close();
})();
