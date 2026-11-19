/* Korean speech controller for static GitHub Pages.
 * Requires a Korean-locale installed voice. No silent fallback to a non-Korean voice.
 * Speech quality depends on the device voice and needs native-speaker listening QA.
 */
(function(root){
 'use strict';
 const NORMAL_RATE=1, SLOW_RATE=.78;
 function koreanVoices(voices){
  return (voices||[]).filter(v=>/^ko(?:-|$)/i.test(String(v.lang||'')));
 }
 function preferredVoice(voices){
  const ko=koreanVoices(voices);
  // Prefer an installed local Korean voice; avoid generic or remote voices when possible.
  return ko.find(v=>/^ko-kr$/i.test(v.lang)&&v.localService)||
         ko.find(v=>/^ko-kr$/i.test(v.lang))||
         ko.find(v=>v.localService)||ko[0]||null;
 }
 function createController(env){
  const synth=env.speechSynthesis;
  let active=null,sequence=0;
  function available(){return !!(synth&&env.SpeechSynthesisUtterance)}
  function voices(){return available()?koreanVoices(synth.getVoices()):[]}
  function play(text,slow=false){
   const value=String(text||'').trim();
   if(!value)return {ok:false,reason:'empty'};
   if(!available())return {ok:false,reason:'unsupported'};
   const voice=preferredVoice(synth.getVoices());
   if(!voice)return {ok:false,reason:'no-ko-voice'};
   sequence++;const token=sequence;
   try{
    synth.cancel();
    const utterance=new env.SpeechSynthesisUtterance(value);
    utterance.lang='ko-KR';
    utterance.voice=voice;
    utterance.rate=slow?SLOW_RATE:NORMAL_RATE;
    utterance.pitch=1;
    utterance.volume=1;
    utterance.onend=()=>{if(sequence===token)active=null};
    utterance.onerror=event=>{
     if(sequence===token){active=null;env.onError?.(event.error||'unknown')}
    };
    active=utterance;
    synth.speak(utterance);
    return {ok:true,voice:voice.name,rate:utterance.rate};
   }catch(error){active=null;return {ok:false,reason:'playback-error'}}
  }
  function stop(){sequence++;active=null;synth?.cancel()}
  return {play,stop,voices,available,preferredVoice:()=>preferredVoice(synth?.getVoices?.()||[]),
   rates:{normal:NORMAL_RATE,slow:SLOW_RATE}};
 }
 root.TOPIK_PRONUNCIATION={createController,koreanVoices,preferredVoice};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.TOPIK_PRONUNCIATION;
})(typeof window!=='undefined'?window:globalThis);
