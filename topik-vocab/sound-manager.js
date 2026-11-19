/* Lightweight synthesized UI feedback; independent of IME, scheduler and speech. */
(function(root){
 'use strict';
 const SoundManager={
  context:null,mode:'light',active:0,maxVoices:5,lastKey:0,keyIndex:0,
  init(){
   if(this.mode==='off'||typeof (root.AudioContext||root.webkitAudioContext)!=='function')return;
   try{if(!this.context)this.context=new (root.AudioContext||root.webkitAudioContext)();
    if(this.context.state==='suspended'&&!document.hidden){const p=this.context.resume();if(p&&p.catch)p.catch(()=>{});}
   }catch(_){}
  },
  setMode(mode){this.mode=['off','light','standard'].includes(mode)?mode:'light';if(this.mode==='off'&&this.context){try{this.context.suspend().catch(()=>{})}catch(_){}}else this.init()},
  play(type,scale=1){
   try{
    if(this.mode==='off'||document.hidden)return;
    this.init();const ctx=this.context;if(!ctx||ctx.state!=='running'||this.active>=this.maxVoices)return;
    const now=ctx.currentTime;
    if(type==='key'){if(now-this.lastKey<.012)return;this.lastKey=now;this.keyIndex=(this.keyIndex+1)%3;}
    const preset={
     key:[790+this.keyIndex*13,.028,.11,'triangle'],
     function:[480,.035,.13,'triangle'],
     candidate:[690,.027,.09,'sine'],
     ui:[570,.026,.105,'sine'],
     neutral:[520,.035,.10,'sine'],
     acceptable:[740,.055,.12,'sine'],
     incorrect:[310,.085,.14,'sine'],
     correct:[680,.125,.15,'sine']
    }[type]||[570,.026,.1,'sine'];
    const [freq,duration,volume,wave]=preset;
    const master=this.mode==='standard'?1:.58;
    const playTone=(hz,at,len,amp)=>{
     if(this.active>=this.maxVoices)return;
     const osc=ctx.createOscillator(),gain=ctx.createGain();this.active++;
     osc.type=wave;osc.frequency.setValueAtTime(hz,at);
     gain.gain.setValueAtTime(.0001,at);
     gain.gain.linearRampToValueAtTime(Math.max(.0001,amp*master*scale),at+.003);
     gain.gain.exponentialRampToValueAtTime(.0001,at+len);
     osc.connect(gain);gain.connect(ctx.destination);
     osc.onended=()=>{this.active=Math.max(0,this.active-1);try{osc.disconnect();gain.disconnect()}catch(_){}};
     osc.start(at);osc.stop(at+len+.005);
    };
    if(type==='correct'){playTone(freq,now,.065,volume);playTone(freq*1.25,now+.062,.065,volume*.72)}
    else playTone(freq,now,duration,volume);
   }catch(_){}
  }
 };
 root.TOPIK_SOUND=SoundManager;
 if(typeof document!=='undefined'){
  document.addEventListener('visibilitychange',()=>{
   try{if(document.hidden)SoundManager.context?.suspend().catch(()=>{});else if(SoundManager.mode!=='off')SoundManager.init()}catch(_){}
  });
  document.addEventListener('pointerdown',()=>SoundManager.init(),{capture:true,passive:true});
  document.addEventListener('touchstart',()=>SoundManager.init(),{capture:true,passive:true});
 }
})(window);
