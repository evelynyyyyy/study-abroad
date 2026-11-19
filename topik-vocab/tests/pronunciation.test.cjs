'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
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
const calls=[],mock={getVoices:()=>voices,cancel:()=>calls.push(['cancel']),speak:u=>calls.push(['speak',u])};
function Utterance(text){this.text=text}
const errors=[];
const controller=P.createController({speechSynthesis:mock,SpeechSynthesisUtterance:Utterance,onError:e=>errors.push(e)});
const samples=[
 ['한국어','韩语，连音/鼻音化，人工核验'],
 ['같이','腭化，人工核验'],
 ['읽어요','复合收音及连音，人工核验'],
 ['합니다','鼻音化，人工核验'],
 ['지금 집에 있어요.','整句语调与自然停顿，人工核验'],
 ['학교','紧音化，人工核验'],
 ['좋다','送气音化，人工核验']
];
for(const [sample] of samples){
 const result=controller.play(sample,false);
 assert.equal(result.ok,true);
 const u=calls.at(-1)[1];
 assert.equal(u.text,sample);
 assert.equal(u.lang,'ko-KR');
 assert.equal(u.voice.name,'Korean local');
 assert.equal(u.rate,1);
 assert.equal(calls.at(-2)[0],'cancel','new speech cancels previous speech');
}
controller.play('한국어',true);
assert.equal(calls.at(-1)[1].rate,.78);
assert.ok(controller.rates.slow<controller.rates.normal);
const noKorean=P.createController({speechSynthesis:{getVoices:()=>voices.slice(0,1),cancel(){throw Error('should not cancel')},speak(){throw Error('should not speak')}},SpeechSynthesisUtterance:Utterance});
assert.equal(noKorean.play('한국어').reason,'no-ko-voice');
const app=fs.readFileSync('topik-vocab/app.js','utf8');
const html=fs.readFileSync('topik-vocab/index.html','utf8');
assert.ok(app.includes('enhanceSpeakButtons();'));
assert.ok(app.includes('koreanSpeech.play(s,slow)'));
assert.ok(html.includes('./pronunciation.js'));
console.log('Korean pronunciation controller tests passed; listening QA pending for:',samples.map(x=>x[0]).join(', '));
