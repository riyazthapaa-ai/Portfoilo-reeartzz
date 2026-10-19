const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
(async()=>{
  const [,, html, out, a, b]=process.argv; const F0=+a, F1=+b;
  const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
  const br=await chromium.launch(); const p=await br.newPage({viewport:{width:1920,height:1080}});
  await p.goto('file://'+html); await p.evaluate(()=>document.fonts.ready);
  for(let f=F0;f<F1;f++){
    await p.evaluate(t=>render(t),f/30);
    const buf=await p.screenshot({type:'jpeg',quality:95});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
    if(f%300===0) console.log(out,f);
  }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await br.close();
})();
