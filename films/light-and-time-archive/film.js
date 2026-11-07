const W=1920,H=1080,c=document.querySelector('#film'),g=c.getContext('2d');
await Promise.all([document.fonts.load('54px Scripture'),document.fonts.load('36px Caption')]);
const image=new Image();image.src='assets/parchment.png';await image.decode();
const plate=document.createElement('canvas');plate.width=W;plate.height=H;const p=plate.getContext('2d');
p.drawImage(image,0,0,W,H);p.font='54px Scripture';p.textAlign='center';p.textBaseline='middle';p.fillStyle='#291b0e';
const verses=['你们要谨慎行事，不要像愚昧人，当像智慧人。','要爱惜光阴，因为现今的世代邪恶。','不要作糊涂人，要明白主的旨意如何。'];
const ys=[356,490,624];verses.forEach((v,i)=>p.fillText(v,960,ys[i]));
p.strokeStyle='#6f4b20';p.lineWidth=1.4;p.beginPath();p.moveTo(560,755);p.lineTo(910,755);p.moveTo(1010,755);p.lineTo(1360,755);p.stroke();
p.font='26px Scripture';p.fillText('✦',960,755);p.font='22px Caption';p.fillStyle='#5b4023';p.fillText('以弗所书 5:15–17',960,807);
const target=(row,word)=>{const v=verses[row],before=v.slice(0,v.indexOf(word));p.font='54px Scripture';return {x:960-p.measureText(v).width/2+p.measureText(before).width+p.measureText(word).width/2,y:ys[row],w:p.measureText(word).width}};
const wise=target(0,'智慧人'),time=target(1,'爱惜光阴'),will=target(2,'主的旨意');
const clamp=x=>Math.max(0,Math.min(1,x)),ss=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,u)=>a+(b-a)*u;
const CAM=[{t:0,x:960,y:530,z:.91},{t:2.7,x:960,y:520,z:.96},{t:5.1,x:1280,y:420,z:1.09},{t:7.7,x:1250,y:430,z:1.12},{t:9.2,x:1000,y:440,z:1.03},{t:12.8,x:960,y:470,z:1.08},{t:14.2,x:800,y:470,z:1.1},{t:18,x:780,y:490,z:1.13},{t:19.5,x:1120,y:560,z:1.11},{t:23.4,x:1130,y:560,z:1.14},{t:25.2,x:960,y:530,z:.98},{t:29.999,x:960,y:530,z:.91}];
function camAt(t){let i=CAM.findIndex((k,i)=>t>=k.t&&t<=(CAM[i+1]?.t??100));if(i<0)i=CAM.length-2;const a=CAM[i],b=CAM[i+1]||a,u=ss((t-a.t)/(b.t-a.t||1));return {x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),z:lerp(a.z,b.z,u)}}
const SUBS=await (await fetch('subtitles.json')).json();
const source=(cam)=>g.drawImage(plate,960-cam.x*cam.z,520-cam.y*cam.z,W*cam.z,H*cam.z);
function roundRect(x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r)}
function caption(text,opacity=1){g.save();g.globalAlpha=opacity;g.font='36px Caption';g.textAlign='center';g.textBaseline='middle';let w=Math.min(1670,g.measureText(text).width+96),x=(W-w)/2;g.fillStyle='rgba(15,22,28,.91)';roundRect(x,944,w,80,5);g.fill();g.fillStyle='#ef9a4c';g.fillRect(x,944,3,80);g.fillStyle='#fffaf2';g.fillText(text,960,985);g.restore()}
function loupe(cam,at,start,end,t){const land=ss((t-start)/.45),lift=ss((t-(end-.45))/.45),alpha=land*(1-lift);if(alpha<=0)return;const cx=960+(at.x-cam.x)*cam.z,cy=520+(at.y-cam.y)*cam.z,rad=(at.w>200?215:175)*(1.15-.15*land+.15*lift);g.save();g.globalAlpha=alpha;
g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=28;g.shadowOffsetX=12;g.shadowOffsetY=24;g.fillStyle='#121a20';g.beginPath();g.arc(cx,cy,rad+14,0,7);g.fill();g.shadowColor='transparent';
g.save();g.beginPath();g.arc(cx,cy,rad-7,0,7);g.clip();const m=cam.z*1.54;g.drawImage(plate,cx-at.x*m,cy-at.y*m,W*m,H*m);
const u=ss((t-start-.5)/.65);g.strokeStyle='#de6d28';g.lineWidth=3;g.beginPath();g.moveTo(cx-at.w*m/2,cy+41);g.lineTo(cx-at.w*m/2+at.w*m*u,cy+41);g.stroke();
let gloss=g.createLinearGradient(cx-rad,cy-rad,cx+rad,cy+rad);gloss.addColorStop(0,'rgba(230,248,255,.14)');gloss.addColorStop(.5,'rgba(255,255,255,0)');gloss.addColorStop(1,'rgba(96,166,202,.08)');g.fillStyle=gloss;g.fillRect(cx-rad,cy-rad,rad*2,rad*2);g.restore();
let rim=g.createLinearGradient(cx-rad,cy-rad,cx+rad,cy+rad);rim.addColorStop(0,'#dae5ea');rim.addColorStop(.12,'#35434a');rim.addColorStop(.35,'#111b23');rim.addColorStop(.65,'#08131b');rim.addColorStop(.85,'#567382');rim.addColorStop(1,'#14232a');g.strokeStyle=rim;g.lineWidth=15;g.beginPath();g.arc(cx,cy,rad,0,7);g.stroke();g.strokeStyle='rgba(212,236,248,.72)';g.lineWidth=2;g.beginPath();g.arc(cx,cy,rad-10,Math.PI*1.08,Math.PI*1.8);g.stroke();g.strokeStyle='rgba(255,255,255,.47)';g.lineWidth=5;g.beginPath();g.arc(cx,cy,rad-20,Math.PI*1.17,Math.PI*1.45);g.stroke();g.restore()}
window.DUR=30;window.render=t=>{t=Math.max(0,Math.min(29.999,t));const cam=camAt(t);g.fillStyle='#15222c';g.fillRect(0,0,W,H);
// A cool illuminated rim remains separate from the warm artwork.
g.fillStyle='#a7c5cf';roundRect(960-cam.x*cam.z-6,520-cam.y*cam.z-6,W*cam.z+12,H*cam.z+12,3);g.fill();source(cam);
let vign=g.createRadialGradient(960,500,250,960,520,1150);vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(4,14,22,.24)');g.fillStyle=vign;g.fillRect(0,0,W,H);
// Lighting reveal at opening is gentle and never black.
if(t<.8){g.fillStyle=`rgba(9,17,22,${.38*(1-ss(t/.8))})`;g.fillRect(0,0,W,H)}
loupe(cam,wise,4.9,8.15,t);loupe(cam,time,14.05,18.8,t);loupe(cam,will,19.1,24.6,t);
if(t<4.65){let a=Math.min(ss(t/.6),1-ss((t-4.1)/.5));g.save();g.globalAlpha=a;g.fillStyle='rgba(19,29,37,.85)';roundRect(72,58,370,91,3);g.fill();g.fillStyle='#fffaf2';g.font='30px Scripture';g.fillText('把时间用在光中',101,99);g.font='17px Caption';g.fillStyle='#d4b18a';g.fillText('以弗所书 5:15–17',102,129);g.restore()}
if(t>=8.5&&t<13.6){let a=ss((t-8.5)/.45)*(1-ss((t-13.1)/.5));g.save();g.globalAlpha=a;g.fillStyle='rgba(18,29,37,.85)';roundRect(90,733,642,95,3);g.fill();g.fillStyle='#ef9a4c';g.fillRect(90,733,3,95);g.font='34px Scripture';g.fillStyle='#fffaf2';g.fillText('在基督里，成为光明的子女',121,794);g.restore()}
const sub=SUBS.find(s=>t>=s.t0&&t<s.t1);if(sub)caption(sub.text);
};window.READY=true;
