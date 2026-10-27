const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{
  const clip=process.argv[2],fps=+process.argv[3]||60;
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+__dirname+'/../source/motion.html?clip='+clip);
  await p.waitForFunction(()=>window.READY);
  const dur=await p.evaluate(()=>DUR);const n=Math.round(dur*fps);
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p','-r',String(fps),`out/${clip}_silent.mp4`],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<n;i++){await p.evaluate(t=>seek(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:96});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%300==0)console.log(clip,i,'/',n);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log(clip,'done',n);
})();
