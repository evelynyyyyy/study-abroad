/* Lightweight synthesized UI feedback; independent of IME, scheduler and speech. */
(function(root){
 'use strict';
 const SoundManager={
  context:null,mode:'light',active:0,maxVoices:5,lastKey:0,keyIndex:0,unlocked:false,lastPlayed:{},
  init(){
   if(this.mode==='off'||typeof (root.AudioContext||root.webkitAudioContext)!=='function')return;
   try{if(!this.context)this.context=new (root.AudioContext||root.webkitAudioContext)();
    if(this.context.state==='closed')this.context=new (root.AudioContext||root.webkitAudioContext)();
    if(this.context.state==='suspended'&&!document.hidden){const p=this.context.resume();if(p&&p.catch)p.catch(error=>console.debug('[Sound] resume failed',error));}
   }catch(error){console.debug('[Sound] init failed',error)}
  },
  setMode(mode){this.mode=['off','light','standard'].includes(mode)?mode:'light';if(this.mode==='off'&&this.context){try{this.context.suspend().catch(()=>{})}catch(_){}}else this.init()},
  play(type,scale=1){
   try{
    if(this.mode==='off'||document.hidden)return;
    this.init();const ctx=this.context;if(!ctx||ctx.state!=='running'||this.active>=this.maxVoices){if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] skipped',type,ctx?.state);return;}
    const stamp=performance.now();if(stamp-(this.lastPlayed[type]||0)<22)return;this.lastPlayed[type]=stamp;
    if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound]',{type,mode:this.mode,contextState:ctx.state});
    const now=ctx.currentTime;
    if(type==='key'){if(now-this.lastKey<.012)return;this.lastKey=now;this.keyIndex=(this.keyIndex+1)%3;}
    const preset={
     key:[1250+this.keyIndex*16,.032,.21,'triangle'],
     function:[810,.042,.24,'triangle'],
     candidate:[980,.032,.17,'triangle'],
     ui:[840,.035,.16,'triangle'],
     neutral:[720,.040,.17,'triangle'],
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
    if(type==='key'||type==='function'){
     // Two tightly spaced, band-limited PCM impulses; no pitched oscillator.
     const isFunction=type==='function';
     const sampleRate=ctx.sampleRate, length=Math.ceil(sampleRate*(isFunction?.028:.023));
     const buffer=ctx.createBuffer(1,length,sampleRate),samples=buffer.getChannelData(0);
     const jitter=1+(Math.random()-.5)*.045;
     // High-pass colored noise avoids hiss and removes any discernible note.
     let previous=0;
     for(let i=0;i<length;i++){
      const t=i/sampleRate;
      const white=Math.random()*2-1;
      const high=white-previous*.86;previous=white;
      const tick=t<.012?Math.exp(-t/(isFunction?.0038:.0031)):0;
      const tockTime=t-.0042;
      const tock=tockTime>=0?Math.exp(-tockTime/(isFunction?.0065:.0047)):0;
      samples[i]=Math.max(-1,Math.min(1,high*(tick*.75+tock*.38)*jitter));
     }
     const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
     source.buffer=buffer;filter.type='lowpass';
     filter.frequency.value=(isFunction?3200:4200)*(1+(Math.random()-.5)*.05);
     gain.gain.value=(isFunction?.36:.29)*(this.mode==='standard'?1:.58)*scale;
     source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
     this.active++;
     source.onended=()=>{this.active=Math.max(0,this.active-1);
      try{source.disconnect();filter.disconnect();gain.disconnect()}catch(_){}};
     source.start(now);
     return;
    }
    if(type==='test'){playTone(950,now,.09,.30);playTone(1180,now+.09,.09,.27)}
    else if(type==='correct'){playTone(freq,now,.065,volume);playTone(freq*1.25,now+.062,.065,volume*.72)}
    else playTone(freq,now,duration,volume);
   }catch(error){console.debug('[Sound] play failed',type,error)}
  }
 };
 root.TOPIK_SOUND=SoundManager;
 if(typeof document!=='undefined'){
  document.addEventListener('visibilitychange',()=>{
   try{if(document.hidden)SoundManager.context?.suspend().catch(()=>{});else if(SoundManager.mode!=='off')SoundManager.init()}catch(_){}
  });
  console.debug('[Sound] module loaded');
  const unlock=()=>{SoundManager.unlocked=true;SoundManager.init()};
  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
  document.addEventListener('touchstart',unlock,{capture:true,passive:true});
  document.addEventListener('click',unlock,{capture:true,passive:true});
  document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('pageshow',()=>{if(SoundManager.unlocked)SoundManager.init()});
  const attachTest=()=>{const choice=document.getElementById('sound-mode');if(!choice||document.getElementById('sound-test'))return;
   const button=document.createElement('button');button.id='sound-test';button.type='button';button.className='line-btn';button.textContent='测试音效';button.style.marginLeft='8px';choice.insertAdjacentElement('afterend',button);
   const status=document.createElement('small');status.id='sound-status';status.style.marginLeft='8px';button.insertAdjacentElement('afterend',status);
   button.addEventListener('click',()=>{SoundManager.init();SoundManager.play('test');status.textContent='Audio: '+(SoundManager.context?.state||'unavailable')});
  };
  new MutationObserver(attachTest).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});attachTest();
 }
})(window);
