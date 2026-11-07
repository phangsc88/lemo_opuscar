import * as W from './engine/wb.js';
import {clamp,lerp,mulberry} from '/core/lib.js';

await W.loadFont('tech','fonts/EMSTech.json');
await document.fonts.load('700 72px BoardCJK');
const cues=await(await fetch('timeline.json')).json();
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const {INK}=W,BLACK=INK.black,BLUE=INK.blue,RED='#c8413a';
const tl=new W.Timeline(),K=new W.Pen('black',BLACK,{park:[2180,1320]}),B=new W.Pen('blue',BLUE,{park:[2200,1180]}),R=new W.Pen('red',RED,{park:[2250,1100]});
const D=(pen,shapes,a,b,o={})=>tl.draw(pen,shapes,a,{by:b,...o}),T=W.text;
const items=[];
const text=(s,x,y,t0,t1,color=BLACK,size=72,o={})=>items.push({s,x,y,t0,t1,color,size,align:o.align||'center',ghost:o.ghost||null,max:o.max||1200});
const person=(x,y,col=BLACK,s=1)=>[W.circle(x,y-95*s,34*s,{w:9*s,color:col}),...W.rect(x-42*s,y-48*s,84*s,115*s,{w:9*s,color:col,over:5*s}),W.line(x-24*s,y+67*s,x-42*s,y+132*s,{w:9*s,color:col}),W.line(x+24*s,y+67*s,x+42*s,y+132*s,{w:9*s,color:col})];
const crown=(x,y,col=BLUE,s=1)=>W.poly([[x-100*s,y+55*s],[x-92*s,y-52*s],[x-46*s,y-5*s],[x,y-78*s],[x+46*s,y-5*s],[x+92*s,y-52*s],[x+100*s,y+55*s],[x-100*s,y+55*s]],{w:12*s,color:col,over:8});
const throne=(x,y,col=BLUE)=>[...W.rect(x-80,y-150,160,180,{w:11,color:col,over:7}),...W.rect(x-112,y+24,224,42,{w:10,color:col,over:6})];
const heart=(x,y,col=BLACK,s=1)=>W.curve([[x,y+115*s],[x-130*s,y-15*s],[x-108*s,y-128*s],[x-12*s,y-82*s],[x,y-25*s],[x+12*s,y-82*s],[x+108*s,y-128*s],[x+130*s,y-15*s],[x,y+115*s]],{w:13*s,color:col,smooth:3,over:10});
const tomb=(x,y)=>[W.arc(x,y,145,Math.PI,Math.PI*2,{ry:190,w:13,color:BLACK}),W.line(x-145,y,x+145,y,{w:13,color:BLACK}),W.circle(x+190,y-25,82,{w:11,color:RED})];

// Ghosts from old lessons: pale residue under the current argument.
const ghosts=[];const gr=mulberry(41);
for(let i=0;i<40;i++){let x=200+gr()*7600,y=180+gr()*4100,o={w:8+gr()*6,alpha:.045+gr()*.035,color:gr()<.25?'#8aa0c8':'#9aa0a8'};if(i%3===0)ghosts.push(W.circle(x,y,40+gr()*90,o));else if(i%3===1)ghosts.push(...W.arrow(x,y,x+(gr()-.5)*420,y+(gr()-.5)*250,o));else ghosts.push(W.line(x,y,x+150+gr()*380,y+(gr()-.5)*60,o))}

// A · present-day question, 0–14.
D(K,[W.arc(900,690,170,-2.7,.35,{w:24,color:BLACK}),W.curve([[1060,725],[1030,820],[930,860],[920,945]],{w:24,color:BLACK}),W.circle(920,1055,16,{w:22,color:BLACK})],.3,2.6);
text('谁能解决一切？',900,1250,2.0,4.3,BLACK,118);
D(B,person(430,1630,BLUE,.85),4.2,5.4);D(B,person(900,1630,BLUE,.85),5.0,6.2);D(B,person(1370,1630,BLUE,.85),5.8,7.0);
text('领袖',430,1850,4.7,5.5,BLUE,62);text('老板',900,1850,5.5,6.3,BLUE,62);text('伴侣',1370,1850,6.3,7.1,BLUE,62);
D(B,crown(900,1460,BLUE,1.0),7.2,8.4);D(K,T('IF I FIND THE RIGHT PERSON...',340,2070,{h:62,w:8,color:BLACK}),8.6,11.4);
D(K,W.arrow(1480,2050,2380,1550,{w:12,color:BLACK,head:42,curve:[1900,1930]}),12.0,14.5);

// B · Israel asks for a king, 14–31.
D(B,[...person(2670,1840,BLUE,.55),...person(2840,1840,BLUE,.55),...person(3010,1840,BLUE,.55),...person(3180,1840,BLUE,.55),...person(3350,1840,BLUE,.55)],14.5,16.6,{travel:5000,minGap:.02,maxGap:.08});
D(B,crown(3010,1390,BLUE,1.15),16.8,18.0);D(B,W.arrow(3010,1540,3010,1645,{w:11,color:BLUE,head:35}),18.1,18.6);
text('给我们一个王',3010,1170,17.0,18.5,BLUE,96);D(B,[...W.rect(3460,1430,330,250,{w:11,color:BLUE,over:8}),W.line(3510,1695,3460,1770,{w:10,color:BLUE})],19.0,20.4);
text('争战',3625,1535,19.5,20.3,BLUE,58);text('安全感',3625,1625,20.1,21.0,BLUE,58);
D(K,T('1 SAMUEL 8:7',2530,2250,{h:74,w:10,color:BLACK}),22.5,24.4);text('不是厌弃你',2820,2425,24.8,26.5,BLACK,70);text('乃是厌弃我',3260,2535,26.2,28.3,BLACK,78);text('不要我作他们的王',3240,2680,28.1,30.7,BLACK,68);
D(K,W.arrow(3860,2030,4310,1650,{w:12,color:BLACK,head:42,curve:[4100,1950]}),29.4,31.2);

// C · Saul, David and the heart, 31–44.
D(B,throne(4600,1570,BLUE),31.0,32.0);D(B,person(4600,1580,BLUE,.72),31.5,32.4);text('扫罗',4600,1270,31.2,32.0,BLUE,72);text('不顺服',4600,1815,32.2,33.4,BLUE,62,{ghost:39.5});
D(B,throne(5200,1570,BLUE),34.2,35.1);D(B,person(5200,1580,BLUE,.72),34.7,35.6);text('大卫',5200,1270,34.4,35.2,BLUE,72);text('同样犯罪',5200,1815,35.4,36.7,BLUE,62,{ghost:39.5});
D(K,heart(4900,2300,BLACK,.9),36.7,38.0);text('罪',4900,2300,37.6,38.4,BLACK,105);D(K,W.arrow(4600,1900,4820,2180,{w:10,color:BLACK,head:32}),38.2,38.8);D(K,W.arrow(5200,1900,4980,2180,{w:10,color:BLACK,head:32}),38.5,39.1);
const erase=tl.erase(W.zigzag(4400,1170,1020,760,6,-1),39.5,3.6,{width:210,strength:.9});
D(K,W.arrow(5100,2510,5850,1870,{w:12,color:BLACK,head:42,curve:[5550,2450]}),43.2,45.3);

// D · covenant promise, 44–60.
text('然而',5900,1440,44.1,45.0,BLACK,84);text('神没有放弃祂的计划',6400,1440,44.8,47.3,BLACK,78);
D(R,W.curve([[5870,1790],[6150,1690],[6500,1780],[6830,1610]],{w:16,color:RED,over:24}),45.0,47.5);
text('应许',6250,1970,46.8,48.2,RED,112);D(R,T('2 SAMUEL 7:16',5920,2240,{h:78,w:11,color:RED}),48.0,50.3);
D(R,[W.line(6080,2460,6800,2460,{w:13,color:RED}),W.line(6080,2454,6080,2570,{w:10,color:RED}),W.line(6800,2454,6800,2570,{w:10,color:RED})],50.6,51.6);
text('你的家和你的国',6440,2720,51.7,53.8,BLACK,72);text('永远坚立',6440,2860,54.0,55.8,RED,86);text('国位坚定 · 直到永远',6440,3010,56.0,59.5,BLACK,70);
D(R,W.arrow(6900,2830,7180,3250,{w:15,color:RED,head:48,curve:[7140,2940]}),58.5,60.5);

// E · Christ: obedience, cross, tomb, resurrection, 60–74.
text('耶稣基督',7000,3350,60.0,62.1,RED,108);
D(R,[W.line(6880,3500,6880,3970,{w:18,color:RED}),W.line(6710,3650,7050,3650,{w:18,color:RED})],62.0,63.4);
text('顺服',6500,3540,63.2,64.3,BLACK,68);text('舍命',6500,3690,64.4,65.6,BLACK,68);D(K,W.arrow(6590,3820,6820,3820,{w:10,color:BLACK,head:30}),65.3,66.0);
D(K,tomb(7380,3900),66.0,68.1);text('复活',7380,4190,68.0,69.2,RED,82);text('永恒的君王',7000,4380,69.4,71.5,RED,92);
D(R,W.circle(7000,4330,430,{w:15,color:RED,a0:-2.3}),71.3,73.7);
D(K,W.arrow(6500,4270,5600,3660,{w:13,color:BLACK,head:44,curve:[6050,4210]}),72.7,75.0);

// F · personal trust and return to the opening question.
text('谁真正值得一生信靠？',5000,3330,74.0,76.4,BLACK,105);
D(B,[W.roundRect(4300,3500,900,520,45,{w:12,color:BLUE}),crown(4750,3700,BLUE,.65)],76.0,78.1);text('能力 · 成功 · 安全感',4750,3920,77.8,79.5,BLUE,67);
D(R,[W.roundRect(5250,3500,900,520,45,{w:12,color:RED}),crown(5700,3700,RED,.65)],78.3,80.5);text('耶稣基督',5700,3920,79.9,81.2,RED,86);
D(K,W.arrow(5000,4100,2300,3420,{w:14,color:BLACK,head:48,curve:[3600,4370]}),81.0,84.2);
text('你把生命的安全感',2300,3240,81.8,83.8,BLACK,82);text('放在谁身上？',2300,3400,83.5,85.5,BLACK,98);
D(R,W.circle(2300,3340,610,{w:16,color:RED,a0:-2.4}),84.2,85.8);

// End-card writing, revealed in the full-board view.
D(K,T('SOULQUAKE',3200,4300,{h:130,w:16,color:BLACK}),86.0,87.5);text('用圣经回应真实 · 用真道震撼灵魂',5200,4300,86.5,88.4,BLACK,76);
D(R,W.curve([[3160,4370],[4100,4355],[5050,4374],[6140,4350]],{w:18,color:RED,over:28}),88.2,89.2);tl.cue(89.35,'capOn');
tl.end();

const cam=new W.Camera([
 [0,900,780,2.15,0,'io'],[4.2,900,1150,1.05,0,'io'],[12.5,1180,1600,.78,-.01,'io'],
 [15.4,3000,1600,.82,.008,'io'],[22.4,3240,2050,.88,0,'io'],[30.8,3560,2120,.68,0,'io'],
 [32.0,4880,1550,.85,0,'io'],[38.0,4900,2080,1.02,-.008,'io'],[43.8,5000,2100,.78,0,'io'],
 [46.4,6300,1700,.82,.006,'io'],[52.0,6440,2530,.9,0,'io'],[59.8,6620,2760,.68,0,'io'],
 [62.4,7000,3600,.82,-.008,'io'],[69.0,7170,3920,.92,0,'io'],[73.8,6640,3970,.66,0,'io'],
 [76.0,5250,3620,.75,.006,'io'],[81.0,4750,3750,.62,0,'io'],[84.8,2500,3340,.82,0,'io'],
 [86.0,3900,2450,.42,0,'io'],[89.8,4000,2250,.215,0,'io'],[90,4000,2250,.215,0,'io']
]);

const board=new W.Board(tl,{W:8000,H:4500,ghosts});
function ease(a,b,t){let u=clamp((t-a)/(b-a));return u*u*(3-2*u)}
function worldText(g,q,t,c){if(t<q.t0)return;let k=ease(q.t0,q.t1,t),ghost=q.ghost&&t>=q.ghost?lerp(1,.11,ease(q.ghost,q.ghost+2.4,t)):1;W.applyCam(g,c);g.save();g.globalCompositeOperation='multiply';g.globalAlpha=.94*ghost;g.font=`700 ${q.size}px BoardCJK`;g.textAlign=q.align;g.textBaseline='middle';let w=Math.min(q.max,g.measureText(q.s).width+30),x=q.align==='center'?q.x-w/2:q.x;g.beginPath();g.rect(x,q.y-q.size,w*k,q.size*1.55);g.clip();g.strokeStyle=q.color;g.lineWidth=Math.max(1.4,q.size*.018);g.strokeText(q.s,q.x,q.y,q.max);g.fillStyle=q.color;g.globalAlpha=.79*ghost;g.fillText(q.s,q.x,q.y,q.max);g.restore()}
board.objs.push({draw:(g,t,c)=>{for(const q of items)worldText(g,q,t,c)}});

function crownPos(t){
 const P=[[.3,900,1420,1],[13.3,900,1420,0],[15.8,3010,1390,0],[30.8,3010,1390,0],[32.0,4600,1370,0],[34.6,4600,1370,0],[35.6,5200,1370,0],[40.0,5200,1370,0],[42.0,5200,1300,1]];
 let i=0;while(i<P.length-2&&t>P[i+1][0])i++;let a=P[i],b=P[Math.min(i+1,P.length-1)],u=ease(a[0],b[0],t);return {x:lerp(a[1],b[1],u),y:lerp(a[2],b[2],u),lift:lerp(a[3],b[3],u),vis:t>=.3&&t<42.2}
}
function drawCrownMagnet(g,x,y,c,o={}){let [sx,sy]=W.toScreen(c,x,y),z=Math.min(1.2,c.z),lift=o.lift||0,sc=(o.size||1)*z;g.setTransform(1,0,0,1,0,0);g.save();g.translate(sx,sy-lift*36*sc);g.scale(sc,sc);g.shadowColor='rgba(20,30,50,.35)';g.shadowBlur=12+lift*14;g.shadowOffsetX=9+lift*12;g.shadowOffsetY=12+lift*14;g.fillStyle=o.color||BLUE;g.beginPath();g.moveTo(-92,52);g.lineTo(-82,-45);g.lineTo(-40,-4);g.lineTo(0,-72);g.lineTo(42,-4);g.lineTo(82,-45);g.lineTo(92,52);g.closePath();g.fill();g.shadowColor='transparent';g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=7;g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-38,-28,18,7,-.5,0,Math.PI*2);g.fill();g.restore()}
board.objs.push({draw:(g,t,c)=>{let q=crownPos(t);if(q.vis)drawCrownMagnet(g,q.x,q.y,c,{lift:q.lift,color:BLUE,size:.7});if(t>=69){let lift=1-ease(69,69.45,t);drawCrownMagnet(g,7000,4210,c,{lift,color:RED,size:.62})}}});
for(const p of [K,B,R])board.objs.push({draw:(g,t,c,ca)=>W.drawMarker(g,p,W.penPose(p,t,ca),c,t)});
for(const e of tl.erasers)board.objs.push({draw:(g,t,c)=>W.drawEraser(g,e,t,c)});
function subtitle(g,t){let q=cues.find(v=>t>=v.t0-.04&&t<v.t1+.2);if(!q)return;let a=Math.min(ease(q.t0-.04,q.t0+.08,t),1-ease(q.t1,q.t1+.2,t));if(a<=0)return;g.save();g.globalAlpha=a;g.fillStyle='rgba(250,248,241,.94)';g.shadowColor='rgba(30,35,45,.18)';g.shadowBlur=18;g.beginPath();g.roundRect(150,916,1620,136,30);g.fill();g.shadowColor='transparent';g.fillStyle=RED;g.beginPath();g.roundRect(184,948,90,9,4);g.fill();g.fillStyle=BLACK;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${q.text.length>23?32:38}px BoardCJK`;g.fillText(q.text,1030,958,1400);g.font='24px BoardCJK';g.fillText(q.en,1030,1008,1400);g.restore()}
board.overlays.push({draw:(g,t)=>subtitle(g,t)});

window.DUR=90;window.render=t=>board.render(ctx,Math.max(0,Math.min(89.999,t)),cam);window.READY=true;window.render(0);
