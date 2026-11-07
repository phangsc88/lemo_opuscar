import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {makePost} from '/core/three/post.js';
import {brick,plate,mesh,roundGeo,COL} from './bricks.js';
const W=1920,H=1080,r=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});
r.setSize(W,H);r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.toneMapping=T.NeutralToneMapping;document.body.prepend(r.domElement);
const scene=new T.Scene();scene.background=new T.Color('#d9e1e4');
const pm=new T.PMREMGenerator(r);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.45;
const camera=new T.PerspectiveCamera(36,W/H,.3,600);
const post=makePost(r,scene,camera,W,H,{ssaa:2,ao:true,aoRadius:2.2,aoThickness:2,aoAmt:.8});post.bloom.strength=.04;post.vig.uniforms.amt.value=.15;post.vig.uniforms.warm.value=-.1;
const key=new T.DirectionalLight('#fffaf2',3);key.position.set(-25,55,35);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:.5,far:150});key.shadow.normalBias=.035;scene.add(key);
RectAreaLightUniformsLib.init();for(const [p,c,i] of [[[5,35,20],'#ffffff',5],[[25,25,-20],'#cfddff',7]]){let l=new T.RectAreaLight(c,i,35,24);l.position.set(...p);l.lookAt(0,3,0);scene.add(l)}
// Deterministically drawn fine wood grain: real-scale tabletop rather than floating baseplate.
let c=document.createElement('canvas');c.width=1024;c.height=1024;let x=c.getContext('2d');x.fillStyle='#b99673';x.fillRect(0,0,1024,1024);for(let i=0;i<2300;i++){let y=i*1024/2300;x.strokeStyle=`rgba(77,48,29,${.03+(i%9)*.008})`;x.beginPath();x.moveTo(0,y);for(let j=0;j<=16;j++)x.lineTo(j*64,y+Math.sin(j*.8+i*.06)*3);x.stroke()}let wood=new T.CanvasTexture(c);wood.colorSpace=T.SRGBColorSpace;wood.wrapS=wood.wrapT=T.RepeatWrapping;wood.repeat.set(3,3);
let desk=new T.Mesh(new T.BoxGeometry(300,2,200),new T.MeshStandardMaterial({map:wood,roughness:.67}));desk.position.y=-1;desk.receiveShadow=true;scene.add(desk);
let stage=new T.Group();scene.add(stage);
const put=(o,p,g=stage)=>{o.position.set(...p);g.add(o);return o};
function b(w,d,col,p,h=1.2,g=stage){return put(brick(w,d,col,{h}),p,g)}
function person(px,pz,col,pose='open',rot=0){let g=new T.Group();g.position.set(px,.1,pz);g.rotation.y=rot;stage.add(g);for(let a of [-.65,.65]){b(1,2,COL.dgray,[a,0,0],.4,g);b(1,1,COL.blue,[a,.4,0],2.4,g)}b(2,2,col,[0,2.8,0],2.4,g);put(mesh(roundGeo(1,1.4),COL.yellow),[0,5.4,0],g);for(let a of [-1,1]){let arm=new T.Group();arm.position.set(a*1.5,4.8,0);arm.rotation.z=a*(pose==='share'?.9:pose==='pray'?.22:.3);arm.rotation.x=pose==='pray'?-1.2:pose==='share'?-.7:0;g.add(arm);put(mesh(roundGeo(.43,2.3),col),[0,-2.3,0],arm)}for(let a of [-.35,.35]){let e=new T.Mesh(new T.SphereGeometry(.12,12,8),new T.MeshStandardMaterial({color:'#17293b'}));put(e,[a,6.2,.97],g)}return g}
function paperTower(px,pz,done=false){let g=new T.Group();stage.add(g);g.position.set(px,0,pz);let mat=new T.MeshStandardMaterial({color:'#f8f7f0',side:T.DoubleSide,roughness:.9});for(let k=0;k<(done?3:2);k++){for(let side of [-1,1]){let o=new T.Mesh(new T.BoxGeometry(.1,4.2,3.8),mat);o.rotation.z=side*.25;put(o,[side*.95,2+k*4,pz*0],g)}put(new T.Mesh(new T.BoxGeometry(3.2,.12,4.5),mat),[0,4+k*4,0],g)}return g}
function clock(px,pz){const g=new T.Group();put(g,[px,.2,pz]);let face=new T.Mesh(new T.CylinderGeometry(8,8,.4,64),new T.MeshStandardMaterial({color:'#eeeae2',roughness:.55}));g.add(face);for(let i=0;i<24;i++){let a=i*Math.PI/12;b(1,1,i%6===0?COL.blue:COL.tan,[Math.sin(a)*6.7,.2,Math.cos(a)*6.7],.4,g)}let hand=b(1,5,COL.black,[0,.6,-1.7],.25,g);hand.rotation.y=.7;return g}
function book(px,pz){let g=new T.Group();put(g,[px,.1,pz]);b(6,4,COL.blue,[0,0,0],.4,g);for(let a of [-1,1]){let p=b(3,4,COL.white,[a*1.55,.4,0],.4,g);p.rotation.z=a*.09}return g}
function cross(px,pz){for(let k=0;k<7;k++)b(2,2,COL.tan,[px,k*1.2,pz]);for(let k of [-2,0,2])b(2,2,COL.tan,[px+k,6,pz]);}
function bridge(){for(let px of [-7,7])for(let k=0;k<3;k++)b(3,4,COL.blue,[px,k*1.2,0]);for(let px=-6;px<=6;px+=2)b(2,4,COL.yellow,[px,3.6,0],.4);for(let px=-6;px<=6;px+=2)for(let z of [-1.7,1.7])b(1,1,COL.red,[px,4,z],1.2);}
const lines=['纸塔游戏提醒我们：忙碌，不等于做好重要的事。','谁来决定，时间该花在哪里？','基督已经救赎我们，使我们成为光明的子女。','所以，要明白主的旨意，爱惜光阴。','靠着圣灵，学习爱神、爱人。','主啊，帮助我，把时间用在你所喜悦的事上。'];
const names=['忙碌 ≠ 重要','时间听谁的？','身份先于行动','分辨主的旨意','靠圣灵，活出爱','把时间用在光中'];
const starts=[0,4,8,14,19,25,30];
window.DUR=30;window.render=t=>{let s=Math.min(5,starts.findIndex((v,i)=>t>=v&&t<starts[i+1]));if(s<0)s=5;while(stage.children.length)stage.remove(stage.children[0]);
let eye,at;
if(s===0){paperTower(-4,-2);person(3,1,COL.blue,'share',-.3);for(let i=0;i<5;i++)b(2,2,[COL.red,COL.yellow,COL.green][i%3],[6+i*1.6,.15,-5+i*2]);clock(-13,-12);eye=[22,19,34];at=[-1,3,0]}
if(s===1){clock(0,0);paperTower(0,0);person(13,3,COL.blue,'open',-.7);for(let i=0;i<6;i++){let a=i*Math.PI/3;b(2,2,i%2?COL.red:COL.yellow,[Math.sin(a)*12,.1,Math.cos(a)*12]);}eye=[0,44,26];at=[0,1,0]}
if(s===2){cross(-5,-4);person(2,3,COL.blue,'open',-.15);for(let yy=0;yy<4;yy++)for(let xx=0;xx<5;xx++)if(xx===0||xx===4||yy===3)b(2,2,COL.lgray,[5+xx*2,yy*1.2,-7]);put(mesh(roundGeo(2,1.4),COL.dgray),[16,0,-2]).rotation.z=-Math.PI/2;eye=[24,15,34];at=[2,4,-2]}
if(s===3){book(-2,1);person(-7,1,COL.blue,'share',.9);for(let xx=0;xx<3;xx++)for(let zz=0;zz<3;zz++)b(2,2,COL.green,[4+xx*2,0,-1+zz*2],.4);b(2,2,COL.yellow,[6,1,1]);eye=[22,17,28];at=[0,2,1]}
if(s===4){bridge();person(-11,3,COL.blue,'share',1);person(11,3,COL.red,'share',-1);book(0,-8);eye=[26,18,34];at=[0,3,0]}
if(s===5){bridge();person(-10,4,COL.blue,'pray',.3);person(10,3,COL.red,'open',-.3);paperTower(-18,-9,true);clock(20,-14);book(-4,-12);eye=[38,40,56];at=[0,2,-1]}
// Background stationery at full human scale makes the toy world tangible.
let pencil=new T.Mesh(new T.CylinderGeometry(.7,.7,33,6),new T.MeshStandardMaterial({color:'#ba6241',roughness:.5}));pencil.rotation.z=Math.PI/2;put(pencil,[-12,1,-24]);
camera.position.set(...eye);camera.lookAt(...at);post.dof.focus=camera.position.distanceTo(new T.Vector3(...at));post.dof.aper=190;post.dof.maxCoc=9;post.composer.render();
document.querySelector('#badge').textContent=`0${s+1}  /  ${names[s]}`;document.querySelector('#sub').textContent=lines[s];};
window.READY=true;
