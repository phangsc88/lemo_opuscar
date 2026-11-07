const W=1920,H=1080,GX=220,GW=1480,g=document.querySelector('canvas').getContext('2d');
await Promise.all([document.fonts.load('60px Display'),document.fonts.load('38px Caption')]);
const images={};await Promise.all(['engraving','plan','ruins'].map(async n=>{let im=new Image();im.src=`assets/${n}.jpg`;await im.decode();images[n]=im}));
const subs=await(await fetch('subtitles.json')).json();
const pg=document.createElement('canvas');pg.width=GW;pg.height=H;const x=pg.getContext('2d');
const clamp=a=>Math.max(0,Math.min(1,a)),ss=a=>{a=clamp(a);return a*a*(3-2*a)},rand=n=>{const v=Math.sin(n*78.233)*43758.5453;return v-Math.floor(v)};
function text(ctx,s,xx,yy,font=48,face='Display',col='#eee7d9'){ctx.font=`${font}px ${face}`;ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,xx,yy)}
function photo(name,t,{z=1,xx=740,yy=470,fit='cover',angle=0}={}){let im=images[name];let scale=(fit==='contain'?Math.min(1360/im.width,950/im.height):Math.max(GW/im.width,980/im.height))*z;x.save();x.translate(xx,yy);x.rotate(angle);x.drawImage(im,-im.width*scale/2,-im.height*scale/2,im.width*scale,im.height*scale);x.restore()}
function deco(ctx,cx,cy,w,h){ctx.strokeStyle='#e8e1d3';ctx.lineWidth=3;ctx.strokeRect(cx-w/2,cy-h/2,w,h);ctx.lineWidth=1;ctx.strokeRect(cx-w/2+12,cy-h/2+12,w-24,h-24);for(let a of [-1,1])for(let b of [-1,1]){ctx.beginPath();ctx.moveTo(cx+a*w/2,cy+b*h/2+a*0);ctx.lineTo(cx+a*(w/2-50),cy+b*h/2);ctx.lineTo(cx+a*w/2,cy+b*(h/2-50));ctx.closePath();ctx.fillStyle='#c9c3b8';ctx.fill()}}
function ident(t,end=false){x.fillStyle='#161716';x.fillRect(0,0,GW,H);x.save();x.translate(740,390);for(let i=0;i<36;i++){let a=i*Math.PI/18+t*.03;x.fillStyle=i%2?'#33332e':'#20231f';x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*1300,Math.sin(a)*1300);x.lineTo(Math.cos(a+.075)*1300,Math.sin(a+.075)*1300);x.fill()}x.restore();
 for(let dir of [-1,1]){let a=dir*(.3+Math.sin(t*.8)*.25);x.save();x.translate(740+dir*380,850);x.rotate(a);let b=x.createLinearGradient(0,0,0,-1000);b.addColorStop(0,'rgba(235,231,216,.06)');b.addColorStop(1,'rgba(235,231,216,.35)');x.fillStyle=b;x.beginPath();x.moveTo(0,0);x.lineTo(-300,-1000);x.lineTo(300,-1000);x.closePath();x.fill();x.restore()}
 x.save();x.translate(740,320);x.strokeStyle='#c2c5ba';x.lineWidth=3;let rr=145;for(let k=-2;k<=2;k++){x.beginPath();x.ellipse(0,0,rr*Math.max(.12,Math.abs(Math.cos(k*.55+t*.18))),rr,0,0,7);x.stroke()}for(let k=-2;k<=2;k++){x.beginPath();x.ellipse(0,k*45,Math.sqrt(rr*rr-k*k*2025),20,0,0,7);x.stroke()}x.restore();deco(x,740,552,1220,360);
 text(x,end?'遗迹尚存 · 故事未终':'环球古迹快讯',740,508,end?64:76);text(x,end?'EPHESUS — THE STORY ENDURES':'HISTORIC DISPATCH',740,608,end?38:47,'Caption');text(x,end?'亚底米神庙 · 以弗所':'亚底米神庙 · 以弗所',740,702,35,'Caption');}
function shot(t){x.fillStyle='#141511';x.fillRect(0,0,GW,H);
 if(t<2.4){ident(t);return}
 if(t<7.2){let u=ss((t-2.4)/.9);photo('engraving',t,{z:(.06+.94*u)*(1+.03*(t-3)),xx:740,yy:475,fit:'contain',angle:(1-u)*Math.PI*5});return}
 if(t<10.8){photo('plan',t,{z:1.28+.02*(t-7.2),xx:740+(t-9)*35,yy:490,fit:'contain'});return}
 if(t<14.4){photo('engraving',t,{z:1.02,fit:'contain'});x.fillStyle='rgba(8,8,7,.77)';x.fillRect(0,0,GW,H);deco(x,740,450,1160,550);text(x,'356 BCE',740,360,136,'Caption');text(x,'公元前356年 · 大火',740,520,62);return}
 if(t<18){photo('engraving',t,{z:1.09+.02*(t-14.4),xx:720,yy:500,fit:'contain'});x.strokeStyle='#f4eee4';x.lineWidth=5;let u=ss((t-14.8)/.7);x.beginPath();x.ellipse(780,425,255,220,-.08,-Math.PI/2,-Math.PI/2+u*2*Math.PI);x.stroke();return}
 if(t<22.8){photo('plan',t,{z:1.1+.01*(t-18),yy:490,xx:720,fit:'contain'});x.fillStyle='rgba(10,10,9,.87)';x.fillRect(350,365,780,205);text(x,'19世纪',740,420,72);text(x,'考古发掘 · 遗迹重现',740,510,44);return}
 if(t<27.6){photo('ruins',t,{z:1+.012*(t-22.8),yy:470,xx:740-8*(t-22.8)});return}
 ident(t,true);
}
const changes=[{t:7.2,type:'wipe'},{t:10.8,type:'blinds'},{t:14.4,type:'flip'},{t:18,type:'diagonal'},{t:22.8,type:'clock'}];
const prior=document.createElement('canvas');prior.width=GW;prior.height=H;
function stableCard(line1,line2){g.save();g.fillStyle='rgba(8,8,7,.88)';g.fillRect(GX+42,45,660,105);g.strokeStyle='#ded7cb';g.lineWidth=2;g.strokeRect(GX+51,54,642,87);g.textAlign='left';g.textBaseline='middle';g.font='28px Caption';g.fillStyle='#f4eee4';g.fillText(line1,GX+72,82);g.font='24px Caption';g.fillText(line2,GX+72,122);g.restore()}
window.DUR=30;window.render=t=>{t=Math.min(29.999,Math.max(0,t));shot(t);
 for(let tr of changes){let u=(t-tr.t)/.3;if(u<0||u>1)continue;prior.getContext('2d').drawImage(pg,0,0);shot(tr.t-.001);const old=document.createElement('canvas');old.width=GW;old.height=H;old.getContext('2d').drawImage(pg,0,0);x.drawImage(prior,0,0);x.save();
  if(tr.type==='wipe'){x.beginPath();x.rect(GW*u,0,GW*(1-u),H);x.clip();x.drawImage(old,0,0)}
  if(tr.type==='blinds'){for(let i=0;i<12;i++){let h=H/12*(1-u);x.drawImage(old,0,i*H/12,GW,h,0,i*H/12,GW,h)}}
  if(tr.type==='flip'){x.translate(740,0);x.scale(1-u,1);x.drawImage(old,-740,0)}
  if(tr.type==='diagonal'){x.beginPath();x.moveTo(GW*u-400,0);x.lineTo(GW+1,0);x.lineTo(GW+1,H);x.lineTo(GW*u+400,H);x.closePath();x.clip();x.drawImage(old,0,0)}
  if(tr.type==='clock'){x.beginPath();x.moveTo(740,540);x.arc(740,540,1100,-Math.PI/2+u*2*Math.PI,1.5*Math.PI);x.closePath();x.clip();x.drawImage(old,0,0)}x.restore();break}
 // Picture layer gate weave, silver grade, mild exposure flicker.
 g.fillStyle='#000';g.fillRect(0,0,W,H);g.save();g.beginPath();g.roundRect(GX,0,GW,H,26);g.clip();let frame=Math.floor(t*24);let wx=(rand(Math.floor(t*5))-0.5)*3.2,wy=(rand(Math.floor(t*6)+100)-.5)*4.4;g.drawImage(pg,GX+wx,wy);
 g.globalCompositeOperation='multiply';g.fillStyle='#efe7d6';g.fillRect(GX,0,GW,H);g.globalCompositeOperation='source-over';let flick=(rand(frame+7)-.5)*.04+.012*Math.sin(t*6*Math.PI);g.fillStyle=flick>0?`rgba(255,255,245,${flick})`:`rgba(0,0,0,${-flick})`;g.fillRect(GX,0,GW,H);
 let v=g.createRadialGradient(960,500,320,960,540,1080);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=v;g.fillRect(GX,0,GW,H);
 let seed=Math.floor(frame/9);if(rand(seed+33)>.4){let sx=GX+rand(seed+15)*GW;g.strokeStyle=`rgba(245,239,222,${.06+rand(seed)*.1})`;g.lineWidth=1;g.beginPath();g.moveTo(sx,0);g.lineTo(sx+2,H);g.stroke()}
 for(let i=0;i<3;i++){g.fillStyle='rgba(5,5,4,.45)';g.beginPath();g.ellipse(GX+rand(frame*13+i)*GW,rand(frame*21+i)*H,1+rand(frame+i)*2,2+rand(frame+7+i)*3,0,0,7);g.fill()}
 // Sharp steady type layer inside gate.
 if(t>=2.9&&t<7.2)stableCard('EPHESUS · ARTEMIS','亚底米神庙 · 1608年想象图');
 if(t>=7.5&&t<10.8)stableCard('BORRA · 1750','历史图纸 · 非现状复原');
 if(t>=14.7&&t<18)stableCard('REBUILT','重建神庙 · 历史想象图');
 if(t>=18.3&&t<22.8)stableCard('BORRA · 1750','早期图纸配图 · 旁述19世纪发掘');
 if(t>=23.1&&t<27.6)stableCard('EPHESUS · 2012','遗址照片 · LWYang / CC BY 2.0');
 const sub=subs.find(a=>t>=a.t0&&t<a.t1);
 if(t>=2.3&&t<27.6){let band=g.createLinearGradient(0,875,0,970);band.addColorStop(0,'rgba(8,8,7,0)');band.addColorStop(1,'rgba(8,8,7,.95)');g.fillStyle=band;g.fillRect(GX,875,GW,205)}
 if(sub){g.font='38px Caption';g.textAlign='center';g.textBaseline='middle';g.strokeStyle='#090908';g.lineWidth=7;g.strokeText(sub.text,960,997);g.fillStyle='#f5eee1';g.fillText(sub.text,960,997)}
 g.restore();};window.READY=true;
