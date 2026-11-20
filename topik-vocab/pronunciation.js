/* Korean pronunciation controller.
 * Primary source: release-built, same-origin static audio on GitHub Pages.
 * Browser speechSynthesis is only a fallback for missing/failed hosted clips.
 */
(function(root){
 'use strict';
 const NORMAL_RATE=1, SLOW_RATE=.78,VOICE_WAIT_MS=900,AUDIO_CACHE_LIMIT=24;
 function koreanVoices(voices){return (voices||[]).filter(v=>/^ko(?:-|$)/i.test(String(v.lang||'')))}
 function preferredVoice(voices){
  const ko=koreanVoices(voices);
  return ko.find(v=>/^ko-kr$/i.test(v.lang)&&v.localService)||
   ko.find(v=>/^ko-kr$/i.test(v.lang))||ko.find(v=>v.localService)||ko[0]||null;
 }
 function createController(env={}){
  const synth=env.speechSynthesis,Utterance=env.SpeechSynthesisUtterance;
  const AudioCtor=env.Audio||root.Audio,doc=env.document||root.document;
  const manifest=env.manifest||root.TOPIK_PRONUNCIATION_AUDIO||{clips:{}};
  const audioCache=new Map();let activeAudio=null,activeUtterance=null,sequence=0;
  const available=()=>!!(synth&&Utterance);
  const voices=()=>available()?koreanVoices(synth.getVoices?.()||[]):[];
  const assetFor=text=>manifest?.clips?.[text]||null;
  const assetUrl=asset=>{
   const file=typeof asset==='string'?asset:asset?.file;if(!file)return null;
   try{return new URL(file,env.baseUrl||doc?.baseURI||root.location?.href).href}catch{return file}
  };
  function cachedAudio(url){
   if(audioCache.has(url)){const a=audioCache.get(url);audioCache.delete(url);audioCache.set(url,a);return a}
   if(!AudioCtor)return null;const a=new AudioCtor(url);a.preload='auto';audioCache.set(url,a);
   while(audioCache.size>AUDIO_CACHE_LIMIT){const first=audioCache.keys().next().value;if(first===url)break;const old=audioCache.get(first);try{old.pause()}catch(_){}audioCache.delete(first)}
   return a;
  }
  function stop(){
   sequence++;
   if(activeAudio){try{activeAudio.pause();activeAudio.currentTime=0}catch(_){}activeAudio=null}
   activeUtterance=null;try{synth?.cancel()}catch(_){}
  }
  async function hosted(text,slow,token){
   const asset=assetFor(text),url=assetUrl(asset);
   if(!url)return {ok:false,reason:'hosted-missing'};
   const audio=cachedAudio(url);if(!audio)return {ok:false,reason:'audio-unsupported'};
   try{
    if(activeAudio&&activeAudio!==audio){activeAudio.pause();activeAudio.currentTime=0}
    try{synth?.cancel()}catch(_){}
    activeAudio=audio;audio.pause();audio.currentTime=0;audio.playbackRate=slow?SLOW_RATE:NORMAL_RATE;
    if('preservesPitch' in audio)audio.preservesPitch=true;
    const done=audio.play();
    if(done&&typeof done.then==='function')await done;
    if(token!==sequence)return {ok:false,reason:'superseded'};
    return {ok:true,source:'hosted',url,rate:audio.playbackRate};
   }catch(error){
    if(token===sequence&&activeAudio===audio)activeAudio=null;
    return {ok:false,reason:'hosted-playback-error',error:String(error?.name||error?.message||error||'unknown')};
   }
  }
  function waitForVoice(){
   const immediate=preferredVoice(synth?.getVoices?.()||[]);if(immediate)return Promise.resolve(immediate);
   if(!available())return Promise.resolve(null);
   return new Promise(resolve=>{
    let settled=false,timer;
    const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);try{synth.removeEventListener?.('voiceschanged',changed)}catch(_){}resolve(preferredVoice(synth.getVoices?.()||[]))};
    const changed=()=>{if(preferredVoice(synth.getVoices?.()||[]))finish()};
    try{synth.addEventListener?.('voiceschanged',changed,{once:true})}catch(_){}
    timer=setTimeout(finish,VOICE_WAIT_MS);
   });
  }
  async function browser(text,slow,token){
   if(!available())return {ok:false,reason:'unsupported'};
   const voice=await waitForVoice();if(token!==sequence)return {ok:false,reason:'superseded'};
   if(!voice)return {ok:false,reason:'no-ko-voice'};
   try{
    if(activeAudio){activeAudio.pause();activeAudio.currentTime=0;activeAudio=null}
    synth.cancel();const utterance=new Utterance(text);utterance.lang='ko-KR';utterance.voice=voice;
    utterance.rate=slow?SLOW_RATE:NORMAL_RATE;utterance.pitch=1;utterance.volume=1;activeUtterance=utterance;
    utterance.onend=()=>{if(sequence===token)activeUtterance=null};
    utterance.onerror=e=>{if(sequence===token){activeUtterance=null;env.onFallbackError?.(e.error||'unknown')}};
    synth.speak(utterance);return {ok:true,source:'browser-tts',voice:voice.name,rate:utterance.rate};
   }catch(error){activeUtterance=null;return {ok:false,reason:'playback-error',error:String(error?.message||error)}}
  }
  async function play(text,slow=false){
   const value=String(text||'').trim();if(!value)return {ok:false,reason:'empty'};
   sequence++;const token=sequence;
   const primary=await hosted(value,slow,token);if(primary.ok||primary.reason==='superseded')return primary;
   const fallback=await browser(value,slow,token);if(fallback.ok||fallback.reason==='superseded')return fallback;
   env.onError?.({text:value,hosted:primary.reason,fallback:fallback.reason});
   return {ok:false,reason:'unavailable',hostedReason:primary.reason,fallbackReason:fallback.reason};
  }
  return {play,stop,voices,available,assetFor,preferredVoice:()=>preferredVoice(synth?.getVoices?.()||[]),
   source:()=>Object.keys(manifest?.clips||{}).length?'hosted-audio':'browser-fallback',
   manifest:()=>manifest,rates:{normal:NORMAL_RATE,slow:SLOW_RATE}};
 }
 root.TOPIK_PRONUNCIATION={createController,koreanVoices,preferredVoice};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.TOPIK_PRONUNCIATION;
})(typeof window!=='undefined'?window:globalThis);
