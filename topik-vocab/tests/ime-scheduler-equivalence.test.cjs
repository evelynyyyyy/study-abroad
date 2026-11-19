const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function run(engine){
 const ctx={window:{},Date,Math};vm.runInNewContext(fs.readFileSync('topik-vocab/first-learning.js','utf8'),ctx);
 vm.runInNewContext(fs.readFileSync('topik-vocab/smart-scheduler.js','utf8'),ctx);
 const S=ctx.window.TOPIK_SMART,F=ctx.window.TOPIK_FIRST_LEARNING,now=1763500000000;
 let seed=24681357;S.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 const words=Array.from({length:140},(_,i)=>[1,'단어'+i,'词'+i]);
 const state={progress:{},lifecycle:{},smartDirectionHistory:[],smartAnswerHistory:[]},day={learned:[]};
 for(const w of words){F.shown(state,w[1],now-86400000);day.learned.push(w[1]);S.review(state,w[1],'meaning',true,now-86400000,'good');S.review(state,w[1],'spell',true,now-86400000,'good')}
 const sequence=[],history=[];
 for(let i=0;i<100;i++){
  const t=now+i*60000;
  const selected=S.select(state,words,day,20,history,t);
  assert.ok(selected&&selected.word,'missing task '+i);
  const task={wordId:selected.word[1],direction:selected.mode,type:selected.type,priority:selected.score??null};
  sequence.push(task);history.push(selected.word[1]);
  S.review(state,selected.word[1],selected.mode,true,t,'good');
  state.smartDirectionHistory.push(selected.mode);
 }
 return {sequence,state:JSON.parse(JSON.stringify(state)),history};
}
const legacy=run('legacy'),simple=run('simple-ime');
assert.deepEqual(legacy.sequence,simple.sequence);
assert.deepEqual(legacy.sequence.map(t=>t.direction),simple.sequence.map(t=>t.direction));
assert.deepEqual(legacy.sequence.map(t=>t.wordId),simple.sequence.map(t=>t.wordId));
assert.deepEqual(legacy.state,simple.state);
console.log(JSON.stringify({tasks:100,engines:['legacy','simple-ime'],taskSequenceIdentical:true,directionSequenceIdentical:true,wordIdSequenceIdentical:true,schedulerStateIdentical:true}));
