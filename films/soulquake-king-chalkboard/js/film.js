// SoulQuake EP0: one classroom correction, authored for Chalkboard.
// World units: slate x 0…6400, y 0…1700. FL is panel-local and moves by slideX.
import { clamp, lerp, eio } from '/core/lib.js';
import { Stroke, catmull } from './chalk.js';
import { writeChar, writeLine, writeLatin, latinWidth } from './hand.js';
import { PW } from './stage.js';

const TIMELINE = await (await fetch(new URL('../timeline.json', import.meta.url))).json();
export const G1 = { x: 850, y: 1160, size: 520 }, G2 = { x: 2290, y: 1160, size: 520 };
export const SMALL = [{ x: 2460, y: 1150, size: 420 }];

export function build(W = 1920, H = 1080) {
  const S = [], TX = [], EV = [], SUBS = TIMELINE.map(q => ({ id: q.id, t0: q.t0, t1: q.t1, zh: q.text, en: q.en, vend: q.start + q.duration }));
  const T = { slide0: 14.45, slide1: 15.45, wipe0: 43.15, wipe1: 46.55, back0: 999, DUR: 90 };
  TIMELINE.forEach(q => EV.push({ t: q.start, type: 'vo', id: q.id }));
  const add = (arr, layer, phase = 'pre') => { arr.forEach(s => { s.layer = layer; s.phase = phase; S.push(s); }); return arr; };
  const line = (pts, o, t0, dur) => { const s = new Stroke(o.smooth ? catmull(pts, 12) : pts, { kind: 'write', taper: .16, taperLen: .2, land: .55, skip: .12, endSpecks: true, specks: .7, ...o }); s.t0 = t0; s.t1 = t0 + dur; return s; };
  const text = (id, txt, layer, strokes, t1 = 1e9, pad = 8) => {
    if (!strokes.length) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of strokes) for (const [x, y] of s.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    TX.push({ id, text: txt, layer, box: [x0-pad, y0-pad, x1+pad, y1+pad], t0: strokes[strokes.length-1].t1, t1 });
  };
  const latin = (txt, cx, by, cap, t, o = {}) => add(writeLatin(txt, cx - latinWidth(txt, cap)/2, by, cap, t, o), o.layer || 'FL', o.phase || 'pre');
  const crown = (cx, cy, w, t, layer = 'FL', color = 'white', phase = 'pre') => add([
    line([[cx-w/2,cy],[cx-w*.38,cy+w*.42],[cx-w*.12,cy+w*.12],[cx,cy+w*.48],[cx+w*.2,cy+w*.1],[cx+w*.42,cy+w*.38],[cx+w/2,cy]], { w: 10, color }, t, .5),
    line([[cx-w/2,cy],[cx-w*.42,cy+w*.68],[cx+w*.45,cy+w*.64],[cx+w/2,cy]], { w: 10, color }, t+.45, .35)
  ], layer, phase);
  const arrow = (x0,y0,x1,y1,t,layer='FL',color='white',phase='pre') => add([
    line([[x0,y0],[x1,y1]], { w: 9, color, smooth: true }, t, .35),
    line([[x1-55,y1-35],[x1,y1],[x1-60,y1+26]], { w: 9, color }, t+.32, .2)
  ], layer, phase);
  const heart = (cx,cy,s,t,layer='FL',phase='pre') => add([
    line([[cx,cy+s*.72],[cx-s*.55,cy+s*.2],[cx-s*.5,cy-s*.25],[cx-s*.2,cy-s*.45],[cx,cy-s*.17],[cx+s*.2,cy-s*.45],[cx+s*.5,cy-s*.25],[cx+s*.55,cy+s*.2],[cx,cy+s*.72]], { w: 11, color:'white', smooth:true }, t, .8)
  ], layer, phase);

  // Opening claim on the front panel.
  const king0 = add(writeChar('王', 1600, 300, 360, .12, { seed: 101, color: 'orange', speed: 10 }), 'FL');
  const q0 = latin('THE RIGHT PERSON?', 1600, 660, 120, 1.0, { color:'kid', hand:'child', lspeed:70 });
  const eq = latin('= EVERYTHING FIXED?', 1600, 865, 94, 4.1, { color:'kid', hand:'child', lspeed:95 });
  const a0 = latin('LEADER', 650, 1135, 65, 6.7, { color:'kid', hand:'child', lspeed:105 });
  const b0 = latin('BOSS', 1600, 1135, 65, 7.3, { color:'kid', hand:'child', lspeed:105 });
  const c0 = latin('PARTNER', 2520, 1135, 65, 7.8, { color:'kid', hand:'child', lspeed:105 });
  const k0e = latin('KING?', 1600, 1440, 74, 10.2, { color:'orange', lspeed:90 });
  [king0,q0,eq,a0,b0,c0,k0e].flat().forEach(s => s.wiped = true);
  text('opening-q','THE RIGHT PERSON?','FL',q0,T.wipe0+.2); text('opening-eq','= EVERYTHING FIXED?','FL',eq,T.wipe0+.2);

  // Sliding reveal: Israel's requested king on the clean back board.
  add(writeChar('王', 1500, 360, 330, 15.25, { seed:111, color:'orange', speed:11 }), 'BK');
  const give = add(writeLatin('GIVE US A KING', 740, 665, 92, 16.3, { seed:112, lspeed:110 }), 'BK');
  const crowd = [];
  for (let i=0;i<5;i++) {
    const x=760+i*290, y=900+(i%2)*30;
    crowd.push(line([[x,y-75],[x,y+45]],{w:7,color:'white'},17.4+i*.08,.2), line([[x-45,y-25],[x+45,y-25]],{w:7,color:'white'},17.55+i*.08,.16), line([[x,y+45],[x-35,y+110]],{w:7,color:'white'},17.66+i*.08,.15), line([[x,y+45],[x+35,y+110]],{w:7,color:'white'},17.76+i*.08,.15), line([[x-22,y-112],[x+22,y-112],[x+28,y-72],[x-27,y-72],[x-22,y-112]],{w:6,color:'white',smooth:true},17.32+i*.08,.25));
  }
  add(crowd,'BK');
  const ref1 = add(writeLatin('1 SAMUEL 8:7', 860, 1255, 76, 20.1, { seed:113, lspeed:105 }), 'BK');
  const quote1 = add(writeLatin('NOT YOU — ME', 860, 1440, 62, 23.0, { seed:114, lspeed:105 }), 'BK');
  text('king-request','GIVE US A KING','BK',give,31); text('samuel-1','1 SAMUEL 8:7','BK',ref1,31); text('verse-key','NOT YOU — ME','BK',quote1,31);

  // Human kings on the moved front panel.
  const saul = latin('SAUL', 840, 620, 100, 29.2, { color:'white', lspeed:85 });
  const david = latin('DAVID', 2360, 620, 100, 32.2, { color:'white', lspeed:85 });
  const cSaul = crown(840,250,360,29.8,'FL','orange'); const cDavid = crown(2360,250,360,32.8,'FL','orange');
  const kingSaul = add(writeChar('王',840,850,220,30.8,{seed:121,color:'orange',speed:12}),'FL');
  const kingDavid = add(writeChar('王',2360,850,220,33.8,{seed:122,color:'orange',speed:12}),'FL');
  const ar1 = arrow(850,980,1500,1210,35.5), ar2 = arrow(2350,980,1700,1210,36.4);
  heart(1600,1325,180,37.3);
  const sin = add(writeChar('罪',1600,1325,150,38.0,{seed:123,color:'white',speed:18}),'FL');
  [saul,david,cSaul,cDavid,kingSaul,kingDavid,ar1,ar2].flat().forEach(s => s.wiped = true);
  text('saul','SAUL','FL',saul,T.wipe0+.2); text('david','DAVID','FL',david,T.wipe0+.2); text('sin','罪','FL',sin,74);

  // One invisible felt pass removes the human answer while leaving the heart.
  const WP = [[180,260],[900,250],[1600,270],[2870,260],[2880,620],[1500,650],[220,640],[190,940],[1000,930],[1800,950],[2920,920],[2900,1370],[1900,1410],[900,1390],[180,1410]];
  const wipe = { t0:T.wipe0, t1:T.wipe1, w:430, path:catmull(WP,14) };
  EV.push({ t:T.slide0, type:'slide', d:T.slide1-T.slide0 }, { t:T.wipe0, type:'wipe', d:T.wipe1-T.wipe0 });

  // Rewrite: promise, then Christ and the eternal King in the same physical panel.
  const promise = add(writeLine('应许', 360, 340, 250, 46.65, { seed:131, color:'orange', speed:14 }), 'FL','post');
  const ref2 = latin('2 SAMUEL 7:16', 1950, 420, 80, 47.6, { color:'white', lspeed:115, phase:'post' });
  add([line([[450,600],[1100,610],[1800,590],[2750,610]],{w:12,color:'orange',smooth:true},49.2,1.0)],'FL','post');
  const covenant = latin('HOUSE · KINGDOM · THRONE', 1600, 790, 62, 51.0, { color:'white', lspeed:125, phase:'post' });
  text('promise','应许','FL',promise,71); text('samuel-2','2 SAMUEL 7:16','FL',ref2,71); text('covenant','HOUSE · KINGDOM · THRONE','FL',covenant,71);

  add([line([[780,910],[780,1430]],{w:14,color:'orange'},60.0,.55), line([[570,1080],[1000,1070]],{w:14,color:'orange'},60.4,.42)],'FL','post');
  add([line([[2300,1375],[2300,1140],[2380,980],[2520,910],[2670,980],[2750,1140],[2750,1375]],{w:11,color:'white',smooth:true},60.6,.85), line([[2210,1380],[2840,1370]],{w:11,color:'white'},61.3,.45)],'FL','post');
  const christ = add(writeLine('基督',1300,1030,260,61.6,{seed:141,color:'orange',speed:14}),'FL','post');
  const verbs = latin('OBEY · DIE · RISE', 1600, 900, 68, 64.2, { color:'white', lspeed:100, phase:'post' });
  const eternal = add(writeLine('永恒的',1230,1510,150,66.4,{seed:142,color:'white',speed:25}),'FL','post');
  const kingFinal = add(writeChar('王',2050,1510,190,68.0,{seed:143,color:'orange',speed:15}),'FL','post');
  text('christ','基督','FL',christ,90); text('verbs','OBEY · DIE · RISE','FL',verbs,84); text('eternal','永恒的王','FL',[...eternal,...kingFinal],90);

  // The personal verdict spans both boards and leads to the final room-wide summary.
  const ask = add(writeLatin('WHO DESERVES YOUR TRUST?', 1800, 290, 92, 71.2, { seed:151, lspeed:130 }), 'WORLD');
  add([line([[4380,820],[5150,820],[5150,1190],[4380,1190],[4380,820]],{w:12,color:'orange'},76.8,.8)],'WORLD');
  arrow(3200,520,4340,900,77.3,'WORLD','white');
  text('trust-question','WHO DESERVES YOUR TRUST?','WORLD',ask,90);

  const brand = add(writeLatin('SOULQUAKE', 900, 1540, 86, 84.05, { seed:161, lspeed:130 }), 'WORLD');
  const sign = add(writeLatin('TRUTH THAT SHAKES THE SOUL', 720, 1650, 42, 85.3, { seed:162, lspeed:150 }), 'WORLD');
  add([line([[700,1680],[2520,1670]],{w:12,color:'orange',smooth:true},88.1,.65)],'WORLD');
  EV.push({ t:0.02,type:'bell' }, { t:88.75,type:'tap' });
  text('brand','SOULQUAKE','WORLD',brand,90); text('signoff','TRUTH THAT SHAKES THE SOUL','WORLD',sign,90);

  const slideX = tt => PW * eio(clamp((tt-T.slide0)/(T.slide1-T.slide0)));
  const shots = [
    {t0:0, keys:[[0,1600,800,.58],[6,1600,800,.58],[14.44,1600,800,.58]]},
    {t0:14.45, keys:[[14.45,3200,830,.29],[15.45,3200,830,.29]]},
    {t0:15.46, keys:[[15.46,1550,830,.59],[28.9,1550,830,.59]]},
    {t0:29.0, keys:[[29.0,4800,830,.58],[43.0,4800,830,.58]]},
    {t0:43.01, keys:[[43.01,4800,830,.58],[47.0,4800,830,.58],[60.0,4800,830,.58]]},
    {t0:60.01, keys:[[60.01,4800,1080,.64],[70.9,4800,1080,.64]]},
    {t0:71.0, keys:[[71.0,3200,830,.29],[83.9,3200,830,.29]]},
    {t0:84.0, keys:[[84.0,3200,850,.276],[90,3200,850,.276]]},
  ];
  shots.forEach((s,i)=>s.t1=i+1<shots.length?shots[i+1].t0:1e9);
  const camAt = tt => {
    let i=0; while(i+1<shots.length && tt>=shots[i+1].t0)i++;
    const K=shots[i].keys; let k=0; while(k+1<K.length-1 && tt>K[k+1][0])k++;
    const a=K[k],b=K[Math.min(K.length-1,k+1)],u=b[0]>a[0]?eio(clamp((tt-a[0])/(b[0]-a[0]))):1;
    return {cx:lerp(a[1],b[1],u),cy:lerp(a[2],b[2],u),s:lerp(a[3],b[3],u),shot:i};
  };
  for(const st of S){
    if(st.t1<=0||st.t0>=T.DUR)continue;
    const c=camAt((st.t0+st.t1)/2),p=st.at(st.len/2),x=p[0]+(st.layer==='FL'?slideX(st.t0):st.layer==='FR'?PW:0),sx=(x-c.cx)*c.s/W*2;
    if(Math.abs(sx)>1.3)continue;
    EV.push({t:+st.t0.toFixed(3),type:'chalk',d:+(st.t1-st.t0).toFixed(3),len:Math.round(st.len*c.s),color:st.color,pan:+clamp(sx*.6,-.7,.7).toFixed(2),big:st.w>12?1:0});
  }
  EV.sort((a,b)=>a.t-b.t);
  return {S,TX,EV,SUBS,T,wet:null,wipe,slideX,camAt,shots,DUR:T.DUR,G1,G2,SMALL};
}
