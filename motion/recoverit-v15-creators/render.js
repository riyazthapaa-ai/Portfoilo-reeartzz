const {chromium}=require('playwright');
const {spawn}=require('child_process');
const [,,html,mode,out,...rest]=process.argv;
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1920,height:1080}});
  await p.goto('file://'+html);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
  if(mode==='stills'){for(const t of rest){await p.evaluate(t=>render(+t),t);await p.screenshot({path:`${out}/s_${t}.png`});}}
  else{const fps=30,D=await p.evaluate(()=>DURATION),N=Math.round(D*fps);
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',''+fps,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
    for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:95});
      if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150===0)console.log('frame',i,'/',N);}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));}
  await b.close();
})();
