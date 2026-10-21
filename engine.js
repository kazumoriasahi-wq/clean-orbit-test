export const LENGTH=900, TARGET=60, LANE=.34, ROBOT_T=.31, WORLD_R=50;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function random(seed=7813){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
// Each authored wave has an unobstructed collection route. Obstacles never close all lanes.
export function buildLevel(seed=7813){
 const rng=random(seed), objects=[];let route=0;
 for(let wave=0,d=28;d<858;wave++,d+=31){
  const limit=d<280?1:2;
  if(wave>1) route=clamp(route+(rng()<.5?-1:1),-limit,limit);
  const kind=wave%3;
  for(let j=0;j<5;j++)objects.push({type:'trash',lane:route,d:d+j*4,kind,id:objects.length,done:false});
  if(wave>1){const choices=[-2,-1,0,1,2].filter(l=>l!==route&&Math.abs(l)<=limit);const rockLane=choices[Math.floor(rng()*choices.length)];objects.push({type:'rock',lane:rockLane,d:d+8,kind:wave%2,id:objects.length,done:false});
   if(d>580&&wave%2===0){let other=choices.find(l=>l!==rockLane);objects.push({type:'rock',lane:other,d:d+16,kind:1,id:objects.length,done:false});}}
  if(wave===5||wave===14||wave===22)objects.push({type:'magnet',lane:route,d:d-7,kind:0,id:objects.length,done:false});
  if(wave===10||wave===19)objects.push({type:'repair',lane:route,d:d-7,kind:0,id:objects.length,done:false});
 }
 return objects.sort((a,b)=>a.d-b.d);
}
export class Expedition{
 constructor(seed=7813){this.reset(seed);}
 reset(seed=7813){this.seed=seed;this.mode='ready';this.distance=0;this.time=0;this.lane=0;this.targetLane=0;this.objects=buildLevel(seed);this.score=0;this.count=0;this.combo=0;this.bestCombo=0;this.misses=0;this.health=3;this.energy=0;this.burst=0;this.magnet=0;this.invulnerable=0;this.zone=0;this.events=[];this.finishTime=0;this.color=-1;this.colorChain=0;}
 start(){this.mode='running';this.events.push({type:'start'});}
 steer(dir){if(this.mode!=='running')return;this.targetLane=clamp(this.targetLane+dir,-2,2);}
 useBurst(){if(this.mode!=='running'||this.energy<100||this.burst>0)return false;this.energy=0;this.burst=4.5;this.events.push({type:'burst'});return true;}
 collect(o){o.done=true;if(o.type==='trash'){this.count++;this.combo++;this.misses=0;this.bestCombo=Math.max(this.combo,this.bestCombo);this.colorChain=o.kind===this.color?this.colorChain+1:1;this.color=o.kind;const points=20+Math.min(80,this.combo*2)+(this.colorChain%5===0?50:0);this.score+=points;this.energy=clamp(this.energy+5,0,100);this.events.push({type:'collect',object:o,points,combo:this.combo});if(this.combo%10===0)this.events.push({type:'combo',value:this.combo});}
  else if(o.type==='magnet'){this.magnet=6;this.events.push({type:'magnet',object:o});}
  else if(o.type==='repair'){this.health=Math.min(3,this.health+1);this.events.push({type:'repair',object:o});}}
 update(dt){
  if(this.mode==='finishing'){this.finishTime+=dt;if(this.finishTime>=4){this.mode=this.count>=TARGET?'win':'incomplete';this.score+=this.count>=TARGET?1000+this.health*300:0;this.events.push({type:'end',mode:this.mode});}return;}
  if(this.mode!=='running')return;
  dt=clamp(dt,0,.05);this.time+=dt;this.lane+=(this.targetLane-this.lane)*(1-Math.exp(-dt*14));
  this.burst=Math.max(0,this.burst-dt);this.magnet=Math.max(0,this.magnet-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);
  const prev=this.distance,speed=9+Math.min(3.5,this.distance/210);this.distance=Math.min(LENGTH,this.distance+speed*dt);
  const zone=Math.min(2,Math.floor(this.distance/300));if(zone!==this.zone){this.zone=zone;this.events.push({type:'zone',value:zone});}
  for(const o of this.objects){
   if(o.done||o.d>this.distance+10)continue;
   const delta=o.d-this.distance,side=Math.abs(o.lane-this.lane);
   if(o.type!=='rock'){
    const reach=this.burst>0?8:this.magnet>0?5:1.8,wide=this.burst>0?5:this.magnet>0?1.3:.48;
    if(delta<=reach&&delta>=-2.4&&side<wide)this.collect(o);
    else if(delta<-2.4){o.done=true;if(o.type==='trash'&&++this.misses>=3){this.combo=0;this.colorChain=0;}}
   }else if(o.d<=this.distance+1.6&&o.d>=prev-2.4){
    if(side<.57){o.done=true;if(this.burst>0){this.score+=30;this.events.push({type:'break',object:o});}
     else if(this.invulnerable<=0){this.health--;this.combo=0;this.colorChain=0;this.invulnerable=2.2;this.events.push({type:'hit',object:o});if(this.health<=0){this.mode='fail';this.events.push({type:'end',mode:'fail'});break;}}}
    else if(delta<-2.4)o.done=true;
   }else if(delta<-2.4)o.done=true;
  }
  if(this.mode==='running'&&this.distance>=LENGTH){this.mode='finishing';this.events.push({type:'finish'});}
 }
 drain(){return this.events.splice(0);}
}

