/* Lightweight synthesized UI feedback; independent of IME, scheduler and speech. */
(function(root){
 'use strict';
 const SoundManager={
  context:null,mode:'light',active:0,maxVoices:5,lastKey:0,keyIndex:0,unlocked:false,lastPlayed:{},needsGestureResume:false,resumePending:null,wasBackgrounded:false,needsAudioRebuild:false,activeNodes:new Set(),
  init(){
   if(this.mode==='off'||typeof (root.AudioContext||root.webkitAudioContext)!=='function')return;
   try{
    if(!this.context||this.context.state==='closed'){
     this.context=new (root.AudioContext||root.webkitAudioContext)();
     this.needsGestureResume=this.context.state!=='running';
    }
   }catch(error){console.debug('[Sound] init failed',error)}
  },
  resumeAudioContext(){
   const ctx=this.context;
   if(!ctx||this.mode==='off')return false;
   if(ctx.state==='running'){this.needsGestureResume=false;return true}
   if(ctx.state==='suspended'||ctx.state==='interrupted'){
    // Never await: iOS WebKit may leave this Promise pending.
    try{
     const pending=ctx.resume();
     if(pending&&pending.catch)pending.catch(error=>{
      if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] resume failed',error);
     });
    }catch(error){if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] resume exception',error)}
   }
   this.needsGestureResume=ctx.state!=='running';
   return ctx.state==='running';
  },
  rebuildAudioContext(){
   if(this.mode==='off')return false;
   const AudioContextClass=root.AudioContext||root.webkitAudioContext;
   if(typeof AudioContextClass!=='function')return false;
   const old=this.context;
   // Invalidate and stop all old-context nodes; never reuse their connections.
   for(const nodes of this.activeNodes){
    for(const node of nodes){try{node.stop?.()}catch(_){}try{node.disconnect()}catch(_){}}
   }
   this.activeNodes.clear();
   this.active=0;
   this.context=null;
   this.resumePending=null;
   try{
    // Must be constructed directly inside pointerdown/touchstart user activation.
    const ctx=new AudioContextClass();
    this.context=ctx;
    this.needsAudioRebuild=false;
    this.needsGestureResume=ctx.state!=='running';
    if(ctx.state==='suspended'||ctx.state==='interrupted')this.resumeAudioContext();
    if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] rebuilt',{state:ctx.state,mode:this.mode});
   }catch(error){
    this.needsAudioRebuild=true;
    console.debug('[Sound] rebuild failed',error);
   }
   // Do not block the new context on an old close() Promise.
   if(old&&old!==this.context){try{const closing=old.close();if(closing?.catch)closing.catch(()=>{})}catch(_){}}
   return !!this.context;
  },
  setMode(mode){this.mode=['off','light','standard'].includes(mode)?mode:'light';if(this.mode==='off'&&this.context){try{this.context.suspend().catch(()=>{})}catch(_){}}else this.init()},
  play(type,scale=1){
   try{
    if(this.mode==='off'||document.hidden)return;
    if(this.needsAudioRebuild)return;
    this.init();const ctx=this.context;if(ctx&&(ctx.state==='suspended'||ctx.state==='interrupted'))this.resumeAudioContext();if(!ctx||ctx.state!=='running'||this.active>=this.maxVoices){if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] skipped',type,ctx?.state);return;}
    const stamp=performance.now();if(stamp-(this.lastPlayed[type]||0)<22)return;this.lastPlayed[type]=stamp;
    if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound]',{type,mode:this.mode,contextState:ctx.state});
    const now=ctx.currentTime;
    if(type==='key'){if(now-this.lastKey<.012)return;this.lastKey=now;}
    const preset={
     key:[1250,.032,.21,'triangle'],
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
     const nodes=[osc,gain];this.activeNodes.add(nodes);
     osc.onended=()=>{this.activeNodes.delete(nodes);this.active=Math.max(0,this.active-1);try{osc.disconnect();gain.disconnect()}catch(_){}};
     osc.start(at);osc.stop(at+len+.005);
    };
    if(type==='key'||type==='function'){
     // Short, dry iOS-style synthetic click: filtered transient + subdued body.
     // Keep the whole click in one voice to avoid exhausting the polyphony cap.
     const isFunction=type==='function';
     const duration=isFunction?.032:.025,noiseLength=isFunction?.021:.017;
     const samples=Math.ceil(ctx.sampleRate*noiseLength);
     const buffer=ctx.createBuffer(1,samples,ctx.sampleRate),data=buffer.getChannelData(0);
     // Deterministic transient: identical timbre and loudness on every press.
     let seed=0x45d9f3b;for(let i=0;i<samples;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=((seed>>>0)/2147483648)-1;}
     const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),noiseGain=ctx.createGain();
     const body=ctx.createOscillator(),bodyGain=ctx.createGain();
     const output=ctx.createGain();this.active++;
     noise.buffer=buffer;filter.type='lowpass';
     filter.frequency.setValueAtTime(isFunction?1050:1250,now);
     filter.Q.value=.55;
     noiseGain.gain.setValueAtTime(.0001,now);
     noiseGain.gain.linearRampToValueAtTime(1,now+.001);
     noiseGain.gain.exponentialRampToValueAtTime(.0001,now+noiseLength);
     body.type='triangle';
     body.frequency.setValueAtTime(isFunction?520:610,now);
     bodyGain.gain.setValueAtTime(.0001,now);
     bodyGain.gain.linearRampToValueAtTime(isFunction?.018:.011,now+.001);
     bodyGain.gain.exponentialRampToValueAtTime(.0001,now+(isFunction?.018:.012));
     output.gain.value=(isFunction?.25:.22)*(this.mode==='standard'?1:.58)*scale;
     noise.connect(filter);filter.connect(noiseGain);noiseGain.connect(output);
     body.connect(bodyGain);bodyGain.connect(output);output.connect(ctx.destination);
     const nodes=[noise,filter,noiseGain,body,bodyGain,output];this.activeNodes.add(nodes);
     body.onended=()=>{this.activeNodes.delete(nodes);this.active=Math.max(0,this.active-1);
      try{noise.disconnect();filter.disconnect();noiseGain.disconnect();body.disconnect();bodyGain.disconnect();output.disconnect()}catch(_){}};
     noise.start(now);noise.stop(now+noiseLength+.001);
     body.start(now);body.stop(now+duration);
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
  const markForeground=()=>{
   if(document.hidden)return;
   if(SoundManager.wasBackgrounded){
    SoundManager.needsAudioRebuild=true;
    SoundManager.wasBackgrounded=false;
    if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] foreground: rebuild on next gesture');
   }
  };
  document.addEventListener('visibilitychange',()=>{
   if(document.hidden){SoundManager.wasBackgrounded=true;return}
   markForeground();
  });
  root.addEventListener('pageshow',markForeground);
  root.addEventListener('focus',markForeground);
  const unlock=()=>{
   SoundManager.unlocked=true;
   if(SoundManager.mode==='off')return;
   if(SoundManager.needsAudioRebuild){
    SoundManager.rebuildAudioContext();
    return;
   }
   SoundManager.init();
   if(SoundManager.context?.state!=='running')SoundManager.resumeAudioContext();
  };
  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
  document.addEventListener('touchstart',unlock,{capture:true,passive:true});
  document.addEventListener('keydown',unlock,{capture:true});
  const attachTest=()=>{
   const choice=document.getElementById('sound-mode');
   if(!choice||document.getElementById('sound-test'))return;
   const button=document.createElement('button');
   button.id='sound-test';button.type='button';button.className='line-btn';
   button.textContent='测试音效';
   // Keep controls in the existing setting row, without diagnostic text.
   button.style.cssText='display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;white-space:nowrap;width:auto;min-width:0;max-width:100%;margin:4px 0 4px 8px;padding:6px 10px;';
   choice.insertAdjacentElement('afterend',button);
   button.addEventListener('click',()=>{
    if(SoundManager.needsAudioRebuild)SoundManager.rebuildAudioContext();
    else SoundManager.init();
    if(SoundManager.context?.state!=='running')SoundManager.resumeAudioContext();
    SoundManager.play('test');
    if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound]',{state:SoundManager.context?.state,needsAudioRebuild:SoundManager.needsAudioRebuild,mode:SoundManager.mode});
   });
   // Troubleshooting remains available only in explicitly enabled debug mode.
   if(root.TOPIK_SOUND_DEBUG){
    const details=document.createElement('details');
    details.style.cssText='margin-top:6px;max-width:100%;';
    const summary=document.createElement('summary');summary.textContent='音效故障排查';
    const status=document.createElement('small');
    const reset=document.createElement('button');
    reset.type='button';reset.className='line-btn';reset.textContent='重新初始化音频';
    reset.style.cssText='display:inline-block;width:auto;margin:6px 0;padding:5px 9px;';
    const update=()=>{status.textContent='Audio: '+(SoundManager.context?.state||'unavailable')+' · needsAudioRebuild: '+SoundManager.needsAudioRebuild;};
    details.append(summary,status,document.createElement('div'),reset);
    button.insertAdjacentElement('afterend',details);
    reset.addEventListener('click',()=>{SoundManager.needsAudioRebuild=true;SoundManager.rebuildAudioContext();update()});
    button.addEventListener('click',update);
    update();
   }
  };
  new MutationObserver(attachTest).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});attachTest();
 }
})(window);
