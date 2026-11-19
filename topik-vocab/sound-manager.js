/* Lightweight synthesized UI feedback; independent of IME, scheduler and speech. */
(function(root){
 'use strict';
 const bufferRms=buffer=>{const data=buffer.getChannelData(0);let sum=0;for(let i=0;i<data.length;i++)sum+=data[i]*data[i];return Math.sqrt(sum/Math.max(1,data.length))};
 const SoundManager={
  context:null,mode:'light',active:0,maxVoices:5,lastKey:0,keyIndex:0,unlocked:false,lastPlayed:{},clickBuffers:null,clickContext:null,samples:null,sampleContext:null,sampleLoading:null,lastKeyTarget:null,deleteRepeat:0,audioUnlocked:false,unlockPending:null,masterGain:null,keyboardGain:null,limiter:null,keyboardSources:[],keyboardSoundReady:false,sampleLevels:null,
  init(){
   if(this.mode==='off'||typeof (root.AudioContext||root.webkitAudioContext)!=='function')return;
   try{
    if(!this.context||this.context.state==='closed'){
     this.context=new (root.AudioContext||root.webkitAudioContext)();
     this.audioUnlocked=false;this.unlockPending=null;this.sampleContext=null;
     this.samples=null;this.keyboardSoundReady=false;this.clickContext=null;
     this.masterGain=null;this.keyboardGain=null;this.limiter=null;this.keyboardSources=[];
    }
    const ctx=this.context;
    if(!this.masterGain){
     this.masterGain=ctx.createGain();this.masterGain.gain.value=1;
     this.keyboardGain=ctx.createGain();this.keyboardGain.gain.value=this.mode==='standard'?1:.58;
     this.limiter=ctx.createDynamicsCompressor();
     this.limiter.threshold.value=-12;this.limiter.knee.value=0;
     this.limiter.ratio.value=16;this.limiter.attack.value=.001;this.limiter.release.value=.055;
     this.keyboardGain.connect(this.masterGain);this.masterGain.connect(this.limiter);
     this.limiter.connect(ctx.destination);
    }
   }catch(error){console.debug('[Sound] init failed',error)}
  },
  ensureAudioUnlocked(){
   this.init();
   const ctx=this.context;
   if(!ctx)return Promise.resolve(false);
   if(ctx.state==='running'){this.audioUnlocked=true;this.loadSamples();return Promise.resolve(true)}
   if(ctx.state==='suspended'){
    if(!this.unlockPending){
     // resume() is called synchronously within the actual user gesture.
     this.unlockPending=ctx.resume().then(()=>{
      this.audioUnlocked=ctx.state==='running';
      if(this.audioUnlocked)this.loadSamples();
      return this.audioUnlocked;
     }).catch(error=>{console.debug('[Sound] resume failed',error);return false})
      .finally(()=>{this.unlockPending=null});
    }
    return this.unlockPending;
   }
   return Promise.resolve(false);
  },
  async ensureUnlocked(){return this.ensureAudioUnlocked()},
  playTestSound(){
   const ctx=this.context;
   if(!ctx||ctx.state!=='running')return false;
   // Diagnostic tone only: independent of keyboard samples, mode gain and PCM.
   const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
   osc.type='sine';osc.frequency.value=660;
   gain.gain.setValueAtTime(.35,now);
   gain.gain.exponentialRampToValueAtTime(.001,now+.2);
   osc.connect(gain);gain.connect(ctx.destination);
   osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch(_){}};
   osc.start(now);osc.stop(now+.21);
   return true;
  },
  loadSamples(){
   const ctx=this.context;if(!ctx||this.sampleContext===ctx)return;
   this.sampleContext=ctx;this.keyboardSoundReady=false;this.samples=null;
   const files={key:'key-click.ogg',delete:'delete-click.ogg',modifier:'modifier-click.ogg'};
   this.sampleLoading=Promise.all(Object.entries(files).map(async ([kind,file])=>{
    const response=await fetch('./assets/sounds/'+file+'?v=3.7.11');
    if(!response.ok)throw new Error('HTTP '+response.status);
    return [kind,await ctx.decodeAudioData(await response.arrayBuffer())];
   })).then(entries=>{
    if(this.sampleContext!==ctx)return;
    const buffers=Object.fromEntries(entries);
    // One deterministic gain match for all sample types; no per-key randomness.
    this.ensureFallbackBuffers(ctx);
    const levels={};
    for(const kind of Object.keys(buffers)){
     const rms=bufferRms(buffers[kind]),fallback=bufferRms(this.clickBuffers[kind]);
     levels[kind]=Math.min(2.5,Math.max(.2,fallback/Math.max(rms,.00001)));
    }
    this.sampleLevels=levels;this.samples=buffers;this.keyboardSoundReady=true;
    if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] all keyboard samples ready');
   }).catch(error=>{
    this.keyboardSoundReady=false;this.samples=null;
    console.debug('[Sound] keyboard samples unavailable; PCM fallback',error);
   });
  },
  ensureFallbackBuffers(ctx){
   if(this.clickContext===ctx&&this.clickBuffers)return;
   const createClick=(kind)=>{
    const rate=ctx.sampleRate;
    const length=Math.ceil(rate*(kind==='delete'?.027:kind==='modifier'?.024:.021));
    const buffer=ctx.createBuffer(1,length,rate),out=buffer.getChannelData(0);
    let low=0,high=0;
    for(let i=0;i<length;i++){
     const t=i/rate,white=Math.random()*2-1;
     low+=((kind==='delete'?.24:kind==='modifier'?.32:.42)*(white-low));
     const band=low-high;high+=.09*band;
     const first=Math.exp(-t/(kind==='delete'?.0037:.0026));
     const offset=kind==='delete'?.006:kind==='modifier'?.0048:.0038;
     const tail=t>=offset?Math.exp(-(t-offset)/(kind==='delete'?.0055:.0037)):0;
     out[i]=Math.max(-1,Math.min(1,band*(first*.85+tail*(kind==='delete'?.58:.34))));
    }
    return buffer;
   };
   this.clickBuffers={key:createClick('key'),delete:createClick('delete'),modifier:createClick('modifier')};
   this.clickContext=ctx;
  },
  setMode(mode){this.mode=['off','light','standard'].includes(mode)?mode:'light';if(this.mode==='off'&&this.context){try{this.context.suspend().catch(()=>{})}catch(_){}}else{this.init();if(this.keyboardGain)this.keyboardGain.gain.value=this.mode==='standard'?1:.58}},
  play(type,scale=1){
   try{
    if(this.mode==='off'||document.hidden)return;
    this.init();const ctx=this.context;const keyboardType=['key','function','delete','modifier'].includes(type);if(!ctx||ctx.state!=='running'||(!keyboardType&&this.active>=this.maxVoices)){if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] skipped',type,ctx?.state);return;}
    if(keyboardType)this.loadSamples();
    const stamp=performance.now();if(!keyboardType&&stamp-(this.lastPlayed[type]||0)<22)return;if(!keyboardType)this.lastPlayed[type]=stamp;
    if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound]',{type,mode:this.mode,contextState:ctx.state});
    const now=ctx.currentTime;
    if(type==='key'){this.keyIndex=0;}
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
    if(type==='key'||type==='function'||type==='delete'||type==='modifier'){
     const descriptor=this.lastKeyTarget?.dataset||{};
     const keyName=String(descriptor.hangul||descriptor.pinyinKey||descriptor.hangulMode||descriptor.pinyinMode||'').toLowerCase();
     const isDelete=type==='delete'||(type==='function'&&/backspace|delete/.test(keyName));
     const kind=isDelete?'delete':type==='modifier'||type==='function'?'modifier':'key';
     if(!this.keyboardSoundReady)this.ensureFallbackBuffers(ctx);
     const buffer=this.keyboardSoundReady?this.samples[kind]:this.clickBuffers[kind];
     const isRepeat=isDelete&&stamp-(this.lastDeleteAt||0)<140;
     if(isDelete)this.lastDeleteAt=stamp;
     // Oldest click is replaced rather than dropping the incoming keystroke.
     if(this.keyboardSources.length>=4){
      const oldest=this.keyboardSources.shift();
      try{oldest.source.stop()}catch(_){}
     }
     const source=ctx.createBufferSource(),gain=ctx.createGain();
     source.buffer=buffer;source.playbackRate.value=1;
     gain.gain.value=(kind==='key'?.36:kind==='delete'?.43:.39)*scale*
      (this.keyboardSoundReady?this.sampleLevels[kind]:1)*(isRepeat?.45:1);
     source.connect(gain);gain.connect(this.keyboardGain);
     const voice={source,gain};this.keyboardSources.push(voice);
     source.onended=()=>{
      const index=this.keyboardSources.indexOf(voice);
      if(index!==-1)this.keyboardSources.splice(index,1);
      try{source.disconnect();gain.disconnect()}catch(_){}
     };
     if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound]',{
      type,contextState:ctx.state,mode:this.mode,activeSources:this.keyboardSources.length,
      masterGain:this.masterGain.gain.value,keyboardGain:this.keyboardGain.gain.value,
      sampleReady:this.keyboardSoundReady,kind
     });
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
   try{if(document.hidden)SoundManager.context?.suspend().catch(()=>{});else if(SoundManager.mode!=='off')SoundManager.ensureAudioUnlocked()}catch(_){}
  });
  console.debug('[Sound] module loaded');
  const unlock=e=>{if(!SoundManager.audioUnlocked){SoundManager.unlocked=true;SoundManager.ensureAudioUnlocked()}if(e.target?.closest)SoundManager.lastKeyTarget=e.target.closest('[data-hangul],[data-pinyin-key],[data-hangul-shift],[data-pinyin-shift],[data-hangul-mode],[data-pinyin-mode],[data-smart-submit]')};
  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
  document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('pageshow',()=>{if(SoundManager.unlocked)SoundManager.ensureAudioUnlocked()});
  const attachTest=()=>{const choice=document.getElementById('sound-mode');if(!choice||document.getElementById('sound-test'))return;
   const button=document.createElement('button');button.id='sound-test';button.type='button';button.className='line-btn';button.textContent='测试音效';button.style.marginLeft='8px';choice.insertAdjacentElement('afterend',button);
   const status=document.createElement('small');status.id='sound-status';status.style.marginLeft='8px';button.insertAdjacentElement('afterend',status);
   const showStatus=()=>{status.textContent='Audio: '+(SoundManager.context?.state||'unavailable')+' · Sound: '+SoundManager.mode};
   button.addEventListener('click',async ()=>{
    // Do not call play('test'): that path can be muted or skipped.
    const ready=await SoundManager.ensureUnlocked();
    const ctx=SoundManager.context;
    const enabled=ready&&ctx?.state==='running';
    console.log('[Sound] test',{state:ctx?.state,enabled,mode:SoundManager.mode,masterGain:SoundManager.masterGain?.gain?.value});
    if(enabled)SoundManager.playTestSound();
    showStatus();
   });
   showStatus();
  };
  new MutationObserver(attachTest).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});attachTest();
 }
})(window);
