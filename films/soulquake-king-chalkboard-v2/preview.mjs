import {openDemo,closeServer} from '../../core/render/page.mjs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const dir=new URL('.',import.meta.url).pathname;
const {browser,page}=await openDemo(dir,{w:1280,h:720});
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','fast','-pix_fmt','yuv420p',dir+'motion-test.mp4']);
ff.stderr.pipe(process.stderr);
for(let i=0;i<300;i++){
 await page.evaluate(t=>window.render(t),43+i/30);
 if(!ff.stdin.write(await page.screenshot({type:'jpeg',quality:90})))await once(ff.stdin,'drain');
}
const ended=once(ff,'close');ff.stdin.end();const [code]=await ended;
await browser.close();closeServer();if(code)process.exit(code);
