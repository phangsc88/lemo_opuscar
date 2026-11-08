import {clamp,lerp,eio} from '/core/lib.js';
import {Stroke,catmull} from './chalk.js';
import {writeLine,writeLatin,latinWidth} from './hand.js';
const TL=await(await fetch(new URL('../timeline.json',import.meta.url))).json();
export function build(W=1920,H=1080){
const S=[],GLYPHS=[],TX=[],EV=TL.map(q=>({t:q.start,type:'vo',id:q.id})),SUBS=TL.map(q=>({id:q.id,t0:q.t0,t1:q.t1,zh:q.text,en:q.en}));
const T={back0:999,DUR:90},G1={x:350,y:1400,size:150},G2={x:2800,y:1400,size:150},SMALL=[];
let layer='FL',phase='pre',wipeMe=true,seed=1,visible=null;
function add(arr){for(const s of arr){Object.assign(s,{layer,phase,wiped:wipeMe,visible});S.push(s);}return arr;}
function path(p,t,d=.6,color='white',w=10,smooth=false){let s=new Stroke(smooth?catmull(p,12):p,{kind:'write',color,w,taper:.18,taperLen:.2,land:.6,skip:.12,specks:.5,endSpecks:true,seed:seed++});s.t0=t;s.t1=t+d;add([s]);return s;}
function reg(id,txt,a,end){let p=a.flatMap(s=>s.pts);TX.push({id,text:txt,layer,box:[Math.min(...p.map(p=>p[0]))-10,Math.min(...p.map(p=>p[1]))-10,Math.max(...p.map(p=>p[0]))+10,Math.max(...p.map(p=>p[1]))+10],t0:a.at(-1).t1,t1:end});}
function label(id,txt,x,y,size,t,end=90,color='white'){let a=add(writeLatin(txt,x-latinWidth(txt,size)/2,y,size,t,{lspeed:100,color,seed:seed++,lw:.065}));reg(id,txt,a,end);}
function han(id,txt,x,y,size,t,end=90,color='white'){
 const chars=[...txt];
 chars.forEach((ch,i)=>{GLYPHS.push({ch,x:x+i*size*1.04,y,size,t0:t+i*.65,t1:t+i*.65+.55,layer,color,visible,wiped:wipeMe,phase});EV.push({t:t+i*.65,type:'chalk',d:.55,len:size*2,color,pan:0,big:1});});
 TX.push({id,text:txt,layer,box:[x,y-size*.52,x+chars.length*size*1.04,y+size*.52],t0:t+(chars.length-1)*.65+.55,t1:end});
}
function crown(x,y,s,t,color='orange'){
path([[x-s*.5,y+s*.15],[x-s*.63,y-s*.36],[x-s*.28,y-s*.12],[x,y-s*.58],[x+s*.28,y-s*.12],[x+s*.63,y-s*.36],[x+s*.5,y+s*.15],[x-s*.5,y+s*.15]],t,.85,color,12);
path([[x-s*.49,y+s*.24],[x+s*.49,y+s*.24]],t+.8,.3,color,13);
for(let i=-2;i<=2;i++)path([[x+i*s*.17,y+s*.04],[x+i*s*.17+12,y+s*.08]],t+1+i*.03,.07,color,7);
}
function heart(x,y,s,t,color='white'){path([[x,y+s*.57],[x-s*.55,y+.05*s],[x-s*.52,y-s*.32],[x-s*.24,y-s*.47],[x,y-s*.22],[x+s*.25,y-s*.47],[x+s*.53,y-s*.31],[x+s*.54,y+s*.04],[x,y+s*.57]],t,.85,color,11,true);}
function circle(x,y,r,t,color='white',w=8){path(Array.from({length:33},(_,i)=>[x+Math.cos(i*Math.PI/16)*r,y+Math.sin(i*Math.PI/16)*r]),t,.45,color,w,true);}
function hatch(x,y,n,t,color='white'){for(let i=0;i<n;i++)path([[x+i*25,y],[x+i*25-50,y+110]],t+i*.035,.13,color,4);}
crown(1070,480,570,.05);
wipeMe=false;heart(1070,1050,190,1.35);wipeMe=true;
han('opening','找对人就能安心？',550,1450,135,2.0,14,'kid');
path([[1570,680],[1810,680]],4,.28,'kid');path([[1570,760],[1810,760]],4.3,.28,'kid');
path([[2150,420],[2550,560],[2510,960],[2350,1160],[2190,960],[2150,420]],4.6,.95,'kid',14);
path([[2250,760],[2330,860],[2480,650]],5.5,.4,'kid',12);
path([[780,1190],[780,1320],[780,1200],[900,1200],[875,1260],[780,1250]],7,.5,'kid',7);
path([[1470,1260],[1650,1260],[1650,1370],[1470,1370],[1470,1260],[1520,1260],[1520,1225],[1600,1225],[1600,1260]],8,.6,'kid',7);
heart(2230,1310,65,9,'kid');heart(2340,1310,65,9.4,'kid');
layer='BK';wipeMe=false;visible=[14,31];
crown(1570,400,350,15);
han('israel','以色列',1300,680,180,15.8,31);
for(let i=0;i<5;i++){let x=650+i*450,y=1050;
path([[x-130,y],[x-130,y-190],[x,y-290],[x+130,y-190],[x+130,y],[x-130,y]],17+i*.12,.5);
path([[x-30,y],[x-30,y-100],[x+30,y-100],[x+30,y]],17.6+i*.12,.25);hatch(x-80,y-180,3,18.2+i*.1);}
han('verse','撒母耳记上 8:7',820,1300,130,19.0,31);
path([[1250,500],[1450,620],[1660,510]],27,.65,'white',13);
path([[1440,520],[1530,620]],28,.25,'white',15);
layer='WORLD';visible=[31,44];
crown(750,430,430,31);han('saul','扫罗',540,740,200,31.2,44);
path([[420,1160],[480,770],[490,650],[530,790],[480,770]],32.6,.7);
path([[550,970],[900,950],[970,1220],[550,1220],[550,970]],33.2,.6);hatch(580,1010,7,33.8);
crown(2390,430,430,35);han('david','大卫',2180,740,200,35.2,44);
path([[2160,1000],[2260,1140],[2390,980],[2460,840]],36.4,.6,'white',9,true);
circle(2250,1190,60,37);path([[2490,890],[2600,1060],[2560,1210]],37.1,.5,'white',8,true);
heart(1570,1020,280,38.4);han('sin','罪',1450,1010,250,39.2,44);
path([[1500,840],[1600,945],[1520,1040],[1640,1190]],41,.65,'white',8);
layer='FL';phase='post';visible=null;
han('promise','应许',720,450,340,47.3,60,'orange');
han('covenant-ref','撒母耳记下',1710,390,170,47.3,90);
han('covenant-number','7:16',2020,610,110,49.5,90);
path([[520,750],[1470,750]],51,.8,'white',10);
path([[1940,1170],[1940,900],[2010,900],[2010,690],[2320,690],[2320,900],[2390,900],[2390,1170]],52.2,.9,'white',12);
path([[2010,950],[2320,950],[2320,1100],[2010,1100],[2010,950]],53.2,.6);hatch(2050,780,8,54);
han('forever','永恒',1970,1360,180,55.9,90);
layer='FR';
han('christ','基督',4560,390,390,60,90,'orange');
path([[4130,580],[4130,1230]],62.2,.65,'orange',18);path([[3880,790],[4400,790]],62.85,.45,'orange',18);
for(let i=0;i<6;i++)path([[4080+i*15,850],[4080+i*15,1160]],63.4+i*.05,.22,'orange',3);
path([[5000,1250],[5020,930],[5160,700],[5420,620],[5660,740],[5790,990],[5790,1250]],65,.9,'white',13,true);
path([[5220,1240],[5220,990],[5280,860],[5400,800],[5500,870],[5560,990],[5560,1240]],65.7,.75,'white',11,true);
circle(5920,1110,170,66.6,'white',12);hatch(5840,1030,5,67.1);path([[4930,1270],[6140,1270]],67.4,.6);
han('eternal','永恒的王',4500,1370,175,65.9,90,'orange');
layer='FL';han('question','？',1390,1020,290,75,90);han('trust','你信靠谁？',620,1350,140,76,90);
layer='WORLD';visible=[83,90];
label('brand','SOULQUAKE',1600,180,155,83,90);
han('episode','撒母耳记概论',1150,1610,130,81.5,90);
EV.push({t:14,type:'slide',d:1.2},{t:44.1,type:'wipe',d:2.8},{t:60,type:'slide',d:1.2},{t:.02,type:'bell'},{t:89,type:'tap'});
const wp=[];for(let j=0;j<5;j++){let y=230+j*310;wp.push([j%2?2920:280,y],[j%2?280:2920,y]);}
const wipe={t0:44.1,t1:46.9,w:420,path:catmull(wp,12)};
const slideX=t=>3200*eio(clamp((t-14)/1.2))*(1-eio(clamp((t-60)/1.2)));
const shots=[
[0,[[0,1250,700,.82],[3.9,1560,820,.59],[13.99,1560,820,.59]]],
[14,[[14,3200,800,.29],[15.3,3200,800,.29]]],
[15.3,[[15.3,1570,780,.59],[22,1570,780,.59],[23,1570,880,.63],[30.99,1570,880,.63]]],
[31,[[31,850,760,.88],[34.8,850,760,.88],[35.5,2300,760,.88],[37.8,2300,760,.88],[39,1570,810,.59],[44,1570,810,.59]]],
[44,[[44,4760,820,.59],[48,4760,820,.59],[59.99,4760,820,.59]]],
[60,[[60,3200,800,.29],[61.3,3200,800,.29]]],
[61.3,[[61.3,4900,850,.59],[66.8,4900,850,.59],[70.9,4900,850,.59]]],
[71,[[71,1500,1000,.79],[76.8,1500,1000,.79],[80,3200,800,.29],[83,3200,800,.29]]],
[83,[[83,3200,800,.29],[85,3200,800,.29],[90,3200,800,.29]]]];
function camAt(t){let si=0;while(si+1<shots.length&&t>=shots[si+1][0])si++;let K=shots[si][1],k=0;while(k+1<K.length-1&&t>K[k+1][0])k++;let a=K[k],b=K[Math.min(k+1,K.length-1)],u=b[0]>a[0]?eio(clamp((t-a[0])/(b[0]-a[0]))):1;return{cx:lerp(a[1],b[1],u),cy:lerp(a[2],b[2],u),s:lerp(a[3],b[3],u),shot:si};}
for(const st of S){let t=(st.t0+st.t1)/2,c=camAt(t),p=st.at(st.len/2),x=p[0]+(st.layer==='FL'?slideX(t):0),pan=clamp((x-c.cx)*c.s/960*.6,-.7,.7);if(st.t0>=0)EV.push({t:st.t0,type:'chalk',d:st.t1-st.t0,len:st.len*c.s,color:st.color,pan,big:st.w>12?1:0});}
return{S,GLYPHS,TX,EV,SUBS,T,G1,G2,SMALL,wet:null,wipe,slideX,camAt,DUR:90};
}
