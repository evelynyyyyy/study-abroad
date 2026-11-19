/* Lightweight synthesized UI feedback; independent of IME, scheduler and speech. */
(function(root){
 'use strict';
 const SoundManager={
  context:null,mode:'light',active:0,maxVoices:5,lastKey:0,keyIndex:0,unlocked:false,lastPlayed:{},clickBuffers:null,clickContext:null,samples:null,sampleContext:null,sampleLoading:null,lastKeyTarget:null,deleteRepeat:0,
  init(){
   if(this.mode==='off'||typeof (root.AudioContext||root.webkitAudioContext)!=='function')return;
   try{if(!this.context)this.context=new (root.AudioContext||root.webkitAudioContext)();
    if(this.context.state==='closed')this.context=new (root.AudioContext||root.webkitAudioContext)();
    if(this.context.state==='suspended'&&!document.hidden){const p=this.context.resume();if(p&&p.catch)p.catch(error=>console.debug('[Sound] resume failed',error));}
    this.loadSamples();
   }catch(error){console.debug('[Sound] init failed',error)}
  },
  loadSamples(){
   const ctx=this.context;if(!ctx||this.sampleContext===ctx)return;
   this.sampleContext=ctx;this.samples={};
   const files={key:'key-click.ogg',delete:'delete-click.ogg',modifier:'modifier-click.ogg'};
   this.sampleLoading=Promise.allSettled(Object.entries(files).map(async ([kind,file])=>{
    const response=await fetch('./assets/sounds/'+file+'?v=3.7.11');
    if(!response.ok)throw new Error('HTTP '+response.status);
    const audio=await response.arrayBuffer();
    const decoded=await ctx.decodeAudioData(audio);
    if(this.sampleContext===ctx)this.samples[kind]=decoded;
   })).then(results=>{if(root.TOPIK_SOUND_DEBUG)console.debug('[Sound] sample loading',results.map(x=>x.status))});
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
    if(type==='key'||type==='function'||type==='delete'||type==='modifier'){
     // Original, programmatically generated iOS-style approximation; not Apple audio.
     // Precompute independent PCM samples once per AudioContext.
     const target=this.lastKeyTarget;
     const descriptor=target?.dataset||{};
     const keyName=String(descriptor.hangul||descriptor.pinyinKey||descriptor.hangulMode||descriptor.pinyinMode||'').toLowerCase();
     const isDelete=type==='delete'||(type==='function'&&/backspace|delete/.test(keyName));
     const isModifier=type==='modifier'||(type==='function'&&!isDelete);
     const kind=isDelete?'delete':isModifier?'modifier':'key';
     if(!this.samples?.[kind]&&(this.clickContext!==ctx||!this.clickBuffers)){
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
        // Low-frequency rumble suppressed by differentiation; no oscillator or pitch.
        out[i]=Math.max(-1,Math.min(1,band*(first*.85+tail*(kind==='delete'?.58:.34))));
       }
       return buffer;
      };
      this.clickBuffers={key:createClick('key'),delete:createClick('delete'),modifier:createClick('modifier')};
      this.clickContext=ctx;
     }
     const source=ctx.createBufferSource(),gain=ctx.createGain();
     source.buffer=this.samples?.[kind]||this.clickBuffers[kind];
     const isRepeat=isDelete&&stamp-(this.lastDeleteAt||0)<140;
     if(isDelete)this.lastDeleteAt=stamp;
     gain.gain.value=(kind==='key'?.36:kind==='delete'?.43:.39)*(this.mode==='standard'?1:.58)*scale*(isRepeat?.43:1);
     source.connect(gain);gain.connect(ctx.destination);
     this.active++;
     source.onended=()=>{this.active=Math.max(0,this.active-1);try{source.disconnect();gain.disconnect()}catch(_){}};
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
  const unlock=e=>{SoundManager.unlocked=true;SoundManager.init();if(e.target?.closest)SoundManager.lastKeyTarget=e.target.closest('[data-hangul],[data-pinyin-key],[data-hangul-shift],[data-pinyin-shift],[data-hangul-mode],[data-pinyin-mode],[data-smart-submit]')};
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
