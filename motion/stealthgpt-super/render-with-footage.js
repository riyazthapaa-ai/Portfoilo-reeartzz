const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
const [html,out,a,b]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5]];
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.resolve(html));await p.evaluate(()=>document.fonts.ready);
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-r','30',out]);
ff.stderr.on('data',d=>process.stderr.write(d));
// warm state: render a few frames before the start so cached anim states are consistent
await p.evaluate(t=>renderAt(t),Math.max(0,a/30-0.1));
for(let f=a;f<b;f++){await p.evaluate(t=>renderAt(t),f/30);await p.evaluate(()=>Promise.all([...document.querySelectorAll('img.vid')].filter(i=>i.offsetParent&&i.src).map(i=>i.decode().catch(()=>{}))));const buf=await p.screenshot({type:'jpeg',quality:93});
 if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%500==0)console.log(out,f)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();console.log('done',out)})();
