// Original procedural score. No recordings, downloads or third-party music.
const notes=[0,4,7,11,7,4,2,7, 0,4,9,12,9,7,4,2, -3,0,4,7,4,0,2,4, -5,-1,2,7,9,7,4,2];
export class Sound{
 constructor(){this.ctx=null;this.music=true;this.effects=true;this.active=false;this.step=0;this.next=0;this.lastCollect=0;this.timer=setInterval(()=>this.schedule(),75);}
 unlock(){try{if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.55;this.master.connect(this.ctx.destination);}if(this.ctx.state!=='running')this.ctx.resume().catch(()=>{});const b=this.ctx.createBuffer(1,1,22050),s=this.ctx.createBufferSource();s.buffer=b;s.connect(this.master);s.start();}catch{}}
 tone(f,time,duration=.15,type='sine',volume=.1){if(!this.ctx||this.ctx.state!=='running')return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,time);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.012);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(this.master);o.start(time);o.stop(time+duration+.02);}
 schedule(){const c=this.ctx;if(!c||c.state!=='running'||!this.active||!this.music){this.next=0;return;}if(!this.next)this.next=c.currentTime+.03;let scheduled=0;while(this.next<c.currentTime+.2&&scheduled++<8){const i=this.step%32,t=this.next;this.tone(261.626*Math.pow(2,notes[i]/12),t,.24,'sine',.075);if(i%4===0){const bass=[48,45,41,43][Math.floor(i/8)];this.tone(440*Math.pow(2,(bass-69)/12),t,.36,'triangle',.1);this.tone(80,t,.09,'sine',.12);}if(i%2===1)this.tone(1700,t,.025,'triangle',.015);this.step++;this.next+=60/112/2;}}
 setActive(v){this.active=v;if(!v)this.next=0;}
 fx(kind,n=0){if(!this.effects||!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime;
  if(kind==='collect'){if(t-this.lastCollect<.035)return;this.lastCollect=t;this.tone(523.25*Math.pow(2,([0,4,7,12,14,16][n%6])/12),t,.14,'sine',.17);this.tone(1300,t,.035,'triangle',.025);}
  if(kind==='hit'){this.tone(95,t,.23,'triangle',.19);this.tone(65,t+.05,.2,'sine',.2);}
  if(kind==='burst'||kind==='magnet'){[0,4,7,12].forEach((v,i)=>this.tone(392*2**(v/12),t+i*.055,.4,'triangle',.1));}
  if(kind==='combo'||kind==='zone'){[0,7,12].forEach((v,i)=>this.tone(523*2**(v/12),t+i*.09,.28,'sine',.14));}
  if(kind==='win'){[0,4,7,12,16,19,24].forEach((v,i)=>this.tone(261.6*2**(v/12),t+i*.11,.65,'triangle',.1));}
  if(kind==='start'||kind==='repair'){[0,7,12].forEach((v,i)=>this.tone(330*2**(v/12),t+i*.07,.25,'sine',.12));}
 }
}
