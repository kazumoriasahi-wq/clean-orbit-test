import {random,LANE,ROBOT_T,WORLD_R,clamp} from './engine.js';
const TAU=Math.PI*2, COLORS=['#f2ac79','#a6d4d8','#cfbded'];
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.fillStyle=fill;c.fill();}
function line(c,points,color,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.w=390;this.h=844;this.particles=[];this.rings=[];this.floaters=[];this.shake=0;this.reduced=false;this.skin=0;this.now=0;const rng=random(128);this.stars=Array.from({length:90},()=>({x:rng(),y:rng(),r:.4+rng()*1.2,a:.15+rng()*.45}));this.decor=Array.from({length:110},(_,i)=>({lon:(rng()<.5?-1:1)*(.98+rng()*2),t:rng()*TAU,size:.65+rng()*.65,kind:i%5}));this.resize();}
 resize(){const rect=this.canvas.getBoundingClientRect();this.w=rect.width;this.h=rect.height;const d=Math.min(2,window.devicePixelRatio||1);this.canvas.width=Math.round(this.w*d);this.canvas.height=Math.round(this.h*d);this.c.setTransform(d,0,0,d,0,0);}
 project(lon,t,scale=1){const x=Math.sin(lon)*Math.cos(t),y=Math.sin(t),z=Math.cos(lon)*Math.cos(t);return{x:this.cx+this.r*x*scale,y:this.cy+this.r*y*scale,z,k:.46+.54*Math.max(0,z)};}
 position(o,g){return this.project(o.lane*LANE-g.lane*LANE,ROBOT_T-(o.d-g.distance)/WORLD_R);}
 event(e,g){if(e.object){const p=this.position(e.object,g);if(e.type==='collect'||e.type==='repair'||e.type==='magnet'){
   const end=this.project(0,ROBOT_T);this.particles.push({x:p.x,y:p.y-14*p.k,ex:end.x,ey:end.y-28,vx:0,vy:0,age:0,life:.38,kind:'suck',color:e.type==='collect'?COLORS[e.object.kind]:'#b7edca',size:6*p.k});
   if(e.combo%5===0)this.floaters.push({x:p.x,y:p.y-25,age:0,text:`+${e.points}`,color:'#fff0c6'});
  }else{this.shake=e.type==='hit'?9:3;for(let i=0;i<15;i++)this.particles.push({x:p.x,y:p.y-10,vx:(Math.random()-.5)*170,vy:-30-Math.random()*90,age:0,life:.6+Math.random()*.4,kind:'spark',color:e.type==='hit'?'#ffc293':'#c3d3bf',size:3+Math.random()*3});}}
  if(e.type==='burst'||e.type==='combo'||e.type==='finish')this.rings.push({age:0,life:.85,color:e.type==='combo'?'#ffd79e':'#b7f3d5'});
  if(e.type==='end'&&e.mode==='win')for(let i=0;i<85;i++)this.particles.push({x:this.w*.5,y:this.h*.37,vx:(Math.random()-.5)*310,vy:-70-Math.random()*200,age:-Math.random()*.5,life:2.6,kind:'spark',color:COLORS[i%3],size:3+Math.random()*3});
 }
 render(g,dt,view='game'){
  this.now+=dt;this.cx=this.w/2;this.cy=this.h*(view==='intro'?.575:.605);this.r=Math.min(this.w*.63,this.h*.285);if(this.w>this.h*1.3){this.cx=this.w*.52;this.cy=this.h*.75;this.r=this.h*.5;}
  const c=this.c,w=this.w,h=this.h,t=this.now,playing=view==='game',spin=playing?g.distance/WORLD_R:t*.055,yaw=playing?-g.lane*LANE:Math.sin(t*.14)*.15;
  const bg=c.createLinearGradient(0,0,w*.4,h);bg.addColorStop(0,['#132e40','#243347','#273b42'][g.zone]);bg.addColorStop(.65,'#1b444b');bg.addColorStop(1,'#12323d');c.fillStyle=bg;c.fillRect(0,0,w,h);
  for(const s of this.stars){const blink=this.reduced?1:.75+.25*Math.sin(t*.6+s.x*99);ellipse(c,s.x*w,s.y*h,s.r,s.r,`rgba(206,224,204,${s.a*blink})`);}
  // A tiny neighboring moon and a drifting orbital trail.
  const moonX=w*.84,moonY=h*.25;let mg=c.createRadialGradient(moonX-4,moonY-5,1,moonX,moonY,17);mg.addColorStop(0,'#c7cdb0');mg.addColorStop(1,'#526e6c');ellipse(c,moonX,moonY,17,17,mg);ellipse(c,moonX+5,moonY+4,4,4,'#71878055');
  c.save();c.translate(this.cx,this.cy);c.rotate(-.22);c.beginPath();c.ellipse(0,0,this.r*1.25,this.r*.34,0,Math.PI,TAU);c.strokeStyle='#bdd7c71c';c.lineWidth=1;c.stroke();c.restore();
  if(this.shake>0&&!this.reduced){c.save();c.translate(Math.sin(t*76)*this.shake,Math.cos(t*65)*this.shake*.5);}else c.save();this.shake=Math.max(0,this.shake-dt*26);
  // Atmosphere, ocean and curved, shaded terrain all share the same spherical projection.
  let glow=c.createRadialGradient(this.cx,this.cy,this.r*.86,this.cx,this.cy,this.r*1.1);glow.addColorStop(0,'#9fddd126');glow.addColorStop(.7,'#a7e5d825');glow.addColorStop(1,'#b6e8de00');ellipse(c,this.cx,this.cy,this.r*1.1,this.r*1.1,glow);
  const base=c.createRadialGradient(this.cx-this.r*.4,this.cy-this.r*.5,this.r*.06,this.cx+this.r*.2,this.cy+this.r*.2,this.r*1.5);base.addColorStop(0,'#89c2ac');base.addColorStop(.52,'#568f89');base.addColorStop(1,'#245d68');ellipse(c,this.cx,this.cy,this.r,this.r,base);
  c.save();c.beginPath();c.arc(this.cx,this.cy,this.r,0,TAU);c.clip();
  const cells=[];const step=TAU/40;
  for(let iy=0;iy<40;iy++)for(let ix=0;ix<28;ix++){
   const lo=-Math.PI+ix*TAU/28,la=iy*step+spin;
   const points=[this.project(lo+yaw,la),this.project(lo+TAU/28+yaw,la),this.project(lo+TAU/28+yaw,la+step),this.project(lo+yaw,la+step)];
   if(points.some(p=>p.z<-.08))continue;
   let land=Math.sin(lo*2.3+Math.sin(iy*.42))+.6*Math.sin(iy*.65+lo*3)>.08;
   const route=Math.abs(lo)<.89;
   if(route)land=true;if(!land)continue;
   const hash=(Math.sin(ix*41.2+iy*71.7)+1)*.5;const light=route?59+Math.sin(iy*.35)*.7+hash*.6:51+Math.sin(iy*.4+lo)*2+hash;
   const fill=route?`hsl(${g.zone===2?92:114},${22+hash*5}%,${light}%)`:`hsl(${130+hash*13},26%,${light}%)`;
   cells.push({points,z:points.reduce((a,p)=>a+p.z,0)/4,fill});
  }
  cells.sort((a,b)=>a.z-b.z);for(const cell of cells){c.beginPath();cell.points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=cell.fill;c.fill();c.strokeStyle=cell.fill;c.lineWidth=.8;c.stroke();}
  // Delicate meridian guides; no color-only navigation cues.
  for(let l=-2;l<=2;l++){const points=[];for(let a=-1.55;a<=1.55;a+=.035){const p=this.project(l*LANE+yaw,a);if(p.z>.02)points.push(p);}c.setLineDash([2,8]);line(c,points,'#f6edcc38',1);c.setLineDash([]);}
  const shadow=c.createRadialGradient(this.cx-this.r*.42,this.cy-this.r*.46,this.r*.05,this.cx,this.cy,this.r);shadow.addColorStop(0,'#f1f2c01a');shadow.addColorStop(.6,'#123e4a00');shadow.addColorStop(1,'#12364285');ellipse(c,this.cx,this.cy,this.r,this.r,shadow);
  c.restore();
  const drawables=[];
  for(const d of this.decor){const p=this.project(d.lon+yaw,d.t+spin);if(p.z>.03)drawables.push({p,kind:'decor',item:d});}
  if(playing){for(const o of g.objects){if(o.done||o.d<g.distance-7||o.d>g.distance+65)continue;const p=this.position(o,g);if(p.z>.025&&p.y<this.cy+this.r*.75)drawables.push({p,kind:'object',item:o});}}
  else {for(let i=0;i<9;i++){const p=this.project((i%3-1)*.36+yaw,-1.2+Math.floor(i/3)*.3);if(p.z>0)drawables.push({p,kind:'object',item:{type:'trash',kind:i%3,id:i}});}}
  drawables.sort((a,b)=>a.p.y-b.p.y);const foot=this.project(0,playing?ROBOT_T:-.37);let robotDrawn=false;
  for(const d of drawables){if(!robotDrawn&&d.p.y>foot.y){this.robot(foot,g,view);robotDrawn=true;}if(d.kind==='decor')this.decorative(d.p,d.item,t);else this.object(d.p,d.item,t);}
  if(!robotDrawn)this.robot(foot,g,view);
  // Landing pad identifies exactly where collection and collision happen.
  if(playing){c.save();c.globalAlpha=.55;ellipse(c,foot.x,foot.y+4,31,9,'#d3f3b52b');c.beginPath();c.ellipse(foot.x,foot.y+4,31,9,0,0,TAU);c.strokeStyle=g.burst>0?'#eef9d7':'#e1eacb';c.lineWidth=1.2;c.stroke();c.restore();}
  for(const ring of this.rings){ring.age+=dt;if(this.reduced)continue;const f=ring.age/ring.life;c.globalAlpha=Math.max(0,1-f)*.7;c.beginPath();c.ellipse(foot.x,foot.y+2,30+f*160,10+f*55,0,0,TAU);c.strokeStyle=ring.color;c.lineWidth=2;c.stroke();c.globalAlpha=1;}this.rings=this.rings.filter(p=>p.age<p.life);
  for(const p of this.particles){p.age+=dt;if(p.age<0)continue;const f=clamp(p.age/p.life,0,1);let x=p.x,y=p.y;if(p.kind==='suck'){const q=f*f;x+=(p.ex-x)*q;y+=(p.ey-y)*q-Math.sin(f*Math.PI)*28;}else{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;x=p.x;y=p.y;}c.globalAlpha=1-f;ellipse(c,x,y,p.size*(p.kind==='suck'?1-f*.6:1),p.size*(p.kind==='suck'?1-f*.6:.6),p.color);c.globalAlpha=1;}this.particles=this.particles.filter(p=>p.age<p.life);
  for(const p of this.floaters){p.age+=dt;c.globalAlpha=Math.max(0,1-p.age);c.fillStyle=p.color;c.font='bold 12px system-ui';c.textAlign='center';c.fillText(p.text,p.x,p.y-p.age*28);c.globalAlpha=1;}this.floaters=this.floaters.filter(p=>p.age<1);
  if(g.mode==='finishing'){const f=g.finishTime/4;const p=this.project(0,-.75+Math.min(.2,f*.4));c.save();c.translate(p.x,p.y);c.scale(Math.max(.03,1-f),Math.max(.03,1-f));this.salvage(0,0,t);c.restore();}
  c.restore();
  // Foreground orbit and soft vignette frame the world without hiding the route.
  c.save();c.translate(this.cx,this.cy);c.rotate(-.22);c.beginPath();c.ellipse(0,0,this.r*1.25,this.r*.34,0,0,Math.PI);c.strokeStyle='#d8e9c72b';c.lineWidth=1;c.stroke();c.restore();
  const shade=c.createLinearGradient(0,h*.74,0,h);shade.addColorStop(0,'#102f3800');shade.addColorStop(1,'#102f38ed');c.fillStyle=shade;c.fillRect(0,h*.74,w,h*.26);
 }
 decorative(p,d,t){const c=this.c,s=d.size*p.k*this.r/230;c.save();c.translate(p.x,p.y);c.scale(s,s);ellipse(c,0,1,13,4,'#264c4e36');if(d.kind<3){c.strokeStyle='#50776a';c.lineWidth=4;c.beginPath();c.moveTo(0,0);c.lineTo(-1,-18);c.stroke();let col=['#769d6d','#8bad77','#abb67b'][d.kind];ellipse(c,0,-23,11,13,col);ellipse(c,-8,-18,8,10,col);ellipse(c,7,-19,7,10,col);ellipse(c,-4,-29,6,6,'#b8cf8b66');}else if(d.kind===3){c.fillStyle='#d2b583';rr(c,-9,-9,18,10,4);c.fill();c.fillStyle='#749887';rr(c,-5,-17,9,11,3);c.fill();}else{for(let i=0;i<3;i++){c.strokeStyle='#5a8c76';c.lineWidth=1.5;c.beginPath();c.moveTo(i*6-6,0);c.lineTo(i*6-6,-8-i%2*4);c.stroke();ellipse(c,i*6-6,-9-i%2*4,3,3,i===1?'#ead097':'#dba392');}}c.restore();}
 object(p,o,t){const c=this.c;const s=p.k*this.r/225;c.save();c.translate(p.x,p.y);c.scale(s,s);ellipse(c,0,2,o.type==='rock'?16:10,4,'#23494d42');if(o.type==='rock'){
  c.beginPath();c.moveTo(-17,0);c.lineTo(-15,-18);c.lineTo(-4,-29);c.lineTo(12,-23);c.lineTo(19,-7);c.lineTo(13,3);c.closePath();c.fillStyle='#5c7271';c.fill();c.strokeStyle='#304e53';c.lineWidth=1.5;c.stroke();c.beginPath();c.moveTo(-15,-18);c.lineTo(-4,-29);c.lineTo(12,-23);c.lineTo(2,-13);c.closePath();c.fillStyle='#8c9c8b';c.fill();line(c,[{x:2,y:-13},{x:5,y:1}],'#405b60',1.5);c.fillStyle='#d3be88';c.beginPath();c.moveTo(-7,-7);c.lineTo(-1,-17);c.lineTo(5,-7);c.closePath();c.fill();
 }else if(o.type==='magnet'||o.type==='repair'){
  const bob=Math.sin(t*4)*2;ellipse(c,0,-14+bob,15,15,'#d2edc8');c.strokeStyle='#f3f2d5';c.lineWidth=1.5;c.stroke();c.font='bold 18px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#355d60';c.fillText(o.type==='magnet'?'∩':'+',0,-14+bob);
 }else{
  const bob=Math.sin(t*3+o.id)*1.5;c.translate(0,-9+bob);c.rotate(Math.sin(o.id*2)*.22);c.lineWidth=1.2;
  if(o.kind===0){let grad=c.createLinearGradient(-7,-9,8,8);grad.addColorStop(0,'#ffc191');grad.addColorStop(1,'#d47d54');c.fillStyle=grad;rr(c,-7,-9,14,18,4);c.fill();ellipse(c,0,-8,7,2,'#f8d7b8');line(c,[{x:-3,y:-3},{x:3,y:-3}],'#f6dbc1',2);line(c,[{x:-3,y:1},{x:3,y:1}],'#f6dbc1',2);}
  else if(o.kind===1){c.fillStyle='#7cacb3';rr(c,-6,-6,12,15,3);c.fill();c.fillStyle='#b6dfd9';rr(c,-5,-6,8,13,2);c.fill();c.fillStyle='#5c8e9b';rr(c,-3,-12,6,7,2);c.fill();c.fillStyle='#e1e5c9';c.fillRect(-5,0,10,5);}
  else{c.fillStyle='#b5a6d0';c.beginPath();c.moveTo(-10,-6);c.lineTo(1,-11);c.lineTo(11,-4);c.lineTo(9,8);c.lineTo(-4,11);c.lineTo(-11,4);c.closePath();c.fill();line(c,[{x:-10,y:-6},{x:0,y:0},{x:11,y:-4}],'#e4d4ee',1.3);line(c,[{x:0,y:0},{x:-4,y:11}],'#8b80ad',1);}
 }c.restore();}
 robot(p,g,view){const c=this.c,t=this.now,playing=view==='game',s=this.r/225*(playing?1:1.2);const bounce=this.reduced?0:Math.sin(t*(playing?16:3))*1.4;const lean=playing?(g.targetLane-g.lane)*.16:Math.sin(t*.6)*.035;c.save();c.translate(p.x,p.y);c.scale(s,s);ellipse(c,0,4,29,8,'#21494c66');c.translate(0,bounce);c.rotate(lean);
  if(g.invulnerable>0&&Math.sin(t*24)>0)c.globalAlpha=.45;
  if(g.burst>0||g.magnet>0){c.save();c.globalAlpha=.15+.08*Math.sin(t*8);ellipse(c,0,-30,44,48,g.burst>0?'#fff0ac':'#bcf3d4');c.restore();}
  // Articulated caterpillar wheels and a little utility backpack.
  const body=['#eee9d0','#f1b288','#a8cee0'][this.skin];c.fillStyle='#64888a';rr(c,16,-48,16,32,6);c.fill();c.fillStyle='#b9d7be';rr(c,19,-46,8,23,3);c.fill();
  for(const side of [-1,1]){c.save();c.translate(side*22,0);c.rotate(side*.06);c.fillStyle='#274b54';rr(c,-9,-18,18,24,7);c.fill();c.strokeStyle='#507b7b';c.lineWidth=2;rr(c,-6,-15,12,18,5);c.stroke();for(let i=0;i<4;i++){let y=-12+((i*5+t*(playing?24:0))%18);line(c,[{x:-5,y},{x:5,y}],'#94aaa0',1.4);}c.restore();}
  let b=c.createLinearGradient(-24,-59,22,-10);b.addColorStop(0,'#fff7df');b.addColorStop(.2,body);b.addColorStop(1,this.skin===1?'#bd7c5b':this.skin===2?'#6b9eac':'#b6c8b3');c.fillStyle=b;rr(c,-23,-51,46,45,15);c.fill();c.strokeStyle='#153d4f55';c.lineWidth=1.2;c.stroke();
  c.strokeStyle='#789a8c';c.lineWidth=3;c.beginPath();c.moveTo(0,-53);c.quadraticCurveTo(5,-67,0,-73);c.stroke();ellipse(c,0,-74,4,4,'#ffbb83');ellipse(c,-1,-75,2,2,'#ffe6ad');
  const face=c.createLinearGradient(-18,-43,18,-21);face.addColorStop(0,'#163744');face.addColorStop(1,'#365e60');c.fillStyle=face;rr(c,-18,-44,36,23,10);c.fill();line(c,[{x:-12,y:-41},{x:5,y:-41}],'#a5d6c133',1.5);
  const blink=Math.sin(t*.7)> .998;for(const side of [-1,1]){if(blink){line(c,[{x:side*8-3,y:-33},{x:side*8+3,y:-33}],'#b8efcf',2);}else{ellipse(c,side*8,-33,3.2,4.4,'#b8efcf');ellipse(c,side*8+.8,-34,1,1.5,'#edffe1');}}
  c.fillStyle='#8daea0';rr(c,-8,-17,16,6,3);c.fill();ellipse(c,0,-14,2,2,g.burst>0?'#ffd091':'#d7edb0');
  // Segmented arms, flexible vacuum hose and angled nozzle.
  c.strokeStyle='#426a6b';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-23,-28);c.lineTo(-31,-20+Math.sin(t*8)*1.5);c.lineTo(-30,-8);c.stroke();ellipse(c,-31,-20,4,4,'#c2d8c0');c.beginPath();c.moveTo(22,-26);c.bezierCurveTo(40,-20,43,-43,30,-48);c.stroke();c.strokeStyle='#91aaa1';c.lineWidth=2;c.stroke();c.fillStyle='#e6e4c9';rr(c,24,-57,15,17,4);c.fill();c.fillStyle='#42696b';rr(c,25,-59,13,6,2);c.fill();
  if(playing){for(let i=0;i<3;i++){const f=((t*2+i/3)%1);c.globalAlpha=(1-f)*.32;c.strokeStyle=g.burst>0?'#ffecad':'#e9efce';c.lineWidth=1.2;c.beginPath();c.ellipse(31,-62-f*25,3+f*8,1.5+f*3,0,0,Math.PI);c.stroke();}c.globalAlpha=1;}
  c.restore();
 }
 salvage(x,y,t){const c=this.c;ellipse(c,x,y,50,12,'#214a4b66');for(let i=0;i<9;i++){c.save();c.translate((i%3-1)*22,-Math.floor(i/3)*17);c.rotate(Math.sin(i)*.35);c.fillStyle=['#bbaf95','#91b2a5','#b79d7e'][i%3];rr(c,-13,-17,26,20,5);c.fill();c.restore();}c.fillStyle='#e3cb96';c.font='bold 22px system-ui';c.textAlign='center';c.fillText('✳',0,-35+Math.sin(t*10)*2);}
}

