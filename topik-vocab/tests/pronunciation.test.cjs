'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const P=require('../pronunciation.js');

const voices=[
 {name:'English',lang:'en-US',localService:true},
 {name:'Korean cloud',lang:'ko-KR',localService:false},
 {name:'Korean local',lang:'ko-KR',localService:true},
 {name:'Chinese',lang:'zh-CN',localService:true}
];
assert.equal(P.preferredVoice(voices).name,'Korean local');
assert.equal(P.preferredVoice(voices.slice(0,1)),null);
assert.equal(P.koreanVoices(voices).length,2);

function Utterance(text){this.text=text}
const synthCalls=[];
const synth={getVoices:()=>[],cancel:()=>synthCalls.push(['cancel']),speak:u=>synthCalls.push(['speak',u])};
let audioConstructed=0,failNext=false;
class MockAudio{
 constructor(url){this.url=url;this.currentTime=0;this.playbackRate=1;this.paused=true;audioConstructed++}
 pause(){this.paused=true}
 play(){this.paused=false;this.playCount=(this.playCount||0)+1;if(failNext){failNext=false;return Promise.reject(new Error('network'))}return Promise.resolve()}
}
const manifest={schemaVersion:1,source:{model:'test'},clips:{
 '한국어':{file:'./audio/clips/korean.wav'},
 '학교에 가요.':{file:'./audio/clips/sentence.wav'},
 '학교':{file:'./audio/clips/school.wav'}
}};
const doc={baseURI:'https://example.test/topik-vocab/'};

(async()=>{
 // Simulates iPhone with no installed Korean voice: hosted same-origin audio still works.
 const controller=P.createController({speechSynthesis:synth,SpeechSynthesisUtterance:Utterance,Audio:MockAudio,document:doc,manifest});
 let result=await controller.play('한국어',false);
 assert.equal(result.ok,true);assert.equal(result.source,'hosted');assert.equal(result.rate,1);
 assert.equal(result.url,'https://example.test/topik-vocab/audio/clips/korean.wav');
 assert.equal(synthCalls.filter(x=>x[0]==='speak').length,0,'hosted audio does not require system speech voices');

 result=await controller.play('한국어',true);
 assert.equal(result.ok,true);assert.equal(result.source,'hosted');assert.equal(result.rate,.78);
 assert.equal(audioConstructed,1,'normal and slow reuse the same cached hosted clip');

 result=await controller.play('학교에 가요.',false);
 assert.equal(result.ok,true);assert.equal(result.source,'hosted','example sentence uses same pronunciation controller');
 result=await controller.play('학교에 가요.',true);
 assert.equal(result.ok,true);assert.equal(result.rate,.78,'example sentence supports slow playback');

 // Repeated playback should restart a cached element instead of constructing/downloading a new one.
 const beforeRepeat=audioConstructed;await controller.play('학교');await controller.play('학교');
 assert.equal(audioConstructed,beforeRepeat+1,'repeated clicks reuse the same Audio object');

 // A transient hosted failure is retryable; no learning data or voice setup is involved.
 failNext=true;result=await controller.play('학교');
 assert.equal(result.ok,false);assert.equal(result.reason,'unavailable','no Korean browser voice leaves a concise final failure');
 result=await controller.play('학교');
 assert.equal(result.ok,true);assert.equal(result.source,'hosted','second click retries the hosted clip');

 // If a hosted clip is missing, wait for voiceschanged before deciding browser fallback availability.
 let dynamicVoices=[],voiceHandler=null;
 const dynamicSynth={getVoices:()=>dynamicVoices,cancel(){},speak(u){this.last=u},addEventListener(name,fn){if(name==='voiceschanged')voiceHandler=fn},removeEventListener(){}};
 const fallback=P.createController({speechSynthesis:dynamicSynth,SpeechSynthesisUtterance:Utterance,Audio:MockAudio,document:doc,manifest});
 const pending=fallback.play('정말 없는 사용자 단어');
 setTimeout(()=>{dynamicVoices=[{name:'Korean late',lang:'ko-KR',localService:true},{name:'Chinese',lang:'zh-CN',localService:true}];voiceHandler?.()},0);
 result=await pending;
 assert.equal(result.ok,true);assert.equal(result.source,'browser-tts');assert.equal(dynamicSynth.last.voice.name,'Korean late');
 assert.equal(dynamicSynth.last.lang,'ko-KR','fallback never substitutes a Chinese voice');

 const app=fs.readFileSync('topik-vocab/app.js','utf8'),html=fs.readFileSync('topik-vocab/index.html','utf8');
 assert.ok(app.includes('await koreanSpeech.play(s,slow)'));
 assert.ok(app.includes('韩语发音暂时无法播放，请重试'));
 assert.ok(!app.includes('未检测到韩语语音。请在设备设置中下载或启用韩语声音。'));
 assert.ok(!app.includes('韩语朗读失败，请检查设备韩语语音设置'));
 const manifestPos=html.indexOf('./audio/manifest.js'),pronunciationPos=html.indexOf('./pronunciation.js');
 assert.ok(manifestPos>=0&&manifestPos<pronunciationPos,'hosted manifest loads before pronunciation controller');
 console.log('Hosted Korean audio, slow playback, retry and voiceschanged fallback checks passed');
})().catch(err=>{console.error(err);process.exitCode=1});
