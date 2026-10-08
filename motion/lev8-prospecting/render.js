// Usage: node render.js <abs path to index.html> <voiceover audio/video> <out.mp4>  (needs playwright + ffmpeg)
const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const [html,audio,out]=process.argv.slice(2);const fps=30000/1001,N=Math.ceil(28.6286*fps);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.addInitScript(()=>{window.__capture=true});await p.goto('file://'+html);await p.waitForFunction(()=>window.__ready);
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30000/1001','-i','-','-i',audio,'-map','0:v','-map','1:a','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%120===0)console.log(i,'/',N);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();})();
