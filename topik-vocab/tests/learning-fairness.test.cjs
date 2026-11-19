const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Date,Math};vm.runInNewContext(fs.readFileSync('topik-vocab/first-learning.js','utf8'),context);vm.runInNewContext(fs.readFileSync('topik-vocab/smart-scheduler.js','utf8'),context);
const S=context.window.TOPIK_SMART,F=context.window.TOPIK_FIRST_LEARNING,now=Date.now();
const words=Array.from({length:40},(_,i)=>[1,'测试韩词'+i,'释义'+i]),state={progress:{},lifecycle:{},smartHistory:[]},day={learned:[]};
S.resetSession();let order=[];
for(let i=0;i<20;i++){
 const task=S.select(state,words,day,30,state.smartHistory,now+i*1000,null,'learn');
 assert.ok(task,'new word must remain schedulable');
 order.push(task.word[1]);
 if(task.type==='show'){F.shown(state,task.word[1]);day.learned.push(task.word[1]);}
 else S.learningResult(state,task.word[1],task.mode,i%5!==0,now+i*1000,i%5===0?'again':'good');
 S.recordExposure(task.word[1],task.mode,i%5===0?'wrong':'correct');
 state.smartHistory.push(task.word[1]);
}
assert.ok(new Set(order).size>=8,'20 tasks cannot loop over three words');
assert.ok(day.learned.length>=8,'fresh words must continue entering');
assert.ok(order.every((w,i)=>i===0||w!==order[i-1]),'no immediate repeat');
const fresh={progress:{},lifecycle:{}};F.shown(fresh,'测试韩词0');S.wordState(fresh,'测试韩词0');
fresh.learningActiveWindow=5;
const interleave=(offset)=>{for(let i=1;i<=3;i++){const ko='间隔词'+i;F.shown(fresh,ko);S.wordState(fresh,ko);S.learningResult(fresh,ko,'meaning',true,now+offset+i)}};
S.learningResult(fresh,'测试韩词0','meaning',true,now);
assert.equal(S.wordState(fresh,'测试韩词0'),'LEARNING');
interleave(100);
S.learningResult(fresh,'测试韩词0','spell',true,now+1000);
assert.equal(S.wordState(fresh,'测试韩词0'),'LEARNING');
interleave(32000);
S.learningResult(fresh,'测试韩词0','meaning',true,now+33000);
assert.equal(S.wordState(fresh,'测试韩词0'),'REVIEW');
assert.ok(fresh.progress['测试韩词0'].meaning.due>now);
assert.equal(S.select(fresh,[words[0]],{learned:[words[0][1]]},1,[],now+3000,null,'learn'),null);
S.resetSession();
const dueTask=S.select(fresh,[words[0]],{learned:[]},0,[],now+S.DAY+40000,null,'review');
assert.ok(dueTask,'graduated word should be available in a new review session');
assert.ok(['meaning','spell'].includes(dueTask.mode),'either due direction is valid');
const before=JSON.stringify(fresh.progress);
S.select(fresh,words,{learned:[]},30,[],now,null,'learn');
assert.equal(JSON.stringify(fresh.progress),before,'pool selection must not alter FSRS');
const app=fs.readFileSync('topik-vocab/app.js','utf8');
assert.ok(app.includes('data-smart-start="learn"')&&app.includes('data-smart-start="review"'));
assert.ok(app.includes('data-speak="\'+ko+'));
assert.ok(app.includes('smart-speak'));
assert.ok(app.includes('didCheck&&d[0]?example'));

function seeded(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}}
function simulate(seed){
 const state={progress:{},lifecycle:{},smartHistory:[]},day={learned:[]},sequence=[];
 S.random=seeded(seed);S.resetSession();
 for(let i=0;i<100;i++){
  let task=S.select(state,words,day,40,state.smartHistory,now+i*1000,null,'learn');
  if(!task){S.resetSession();state.smartHistory=[];task=S.select(state,words,day,40,[],now+i*1000,null,'learn')}
  if(!task)break;
  const ko=task.word[1];sequence.push({ko,type:task.type,mode:task.mode});
  if(task.type==='show'){F.shown(state,ko);day.learned.push(ko)}
  else S.learningResult(state,ko,task.mode,true,now+i*1000);
  S.recordExposure(ko,task.mode,'correct');
  state.smartHistory.push(ko);state.smartHistory=state.smartHistory.slice(-30);
 }
 return {sequence,state,day};
}
const a=simulate(42),b=simulate(99),again=simulate(42);
assert.ok(a.sequence.length>=60,'must schedule substantial interleaved learning');
assert.equal(JSON.stringify(a.sequence),JSON.stringify(again.sequence),'seed must reproduce order');
assert.notEqual(JSON.stringify(a.sequence),JSON.stringify(b.sequence),'different seeds must alter order');
assert.ok(new Set(a.sequence.slice(0,20).map(x=>x.ko)).size>3,'no three-word cycle');
assert.ok(a.sequence.every((q,i)=>i===0||q.ko!==a.sequence[i-1].ko),'no consecutive word');
assert.ok(a.sequence.some((q,i)=>q.type==='typing'&&a.sequence.slice(i+1).some(x=>x.type==='show')),'recognition and introduction interleave');
assert.ok(a.sequence.some((q,i)=>q.mode==='meaning'&&a.sequence.slice(i+1).some(x=>x.mode==='spell')),'both directions interleave');
assert.ok(a.day.learned.length>=8,'fresh introductions continue');
assert.ok(!a.sequence.slice(0,10).every((q,i)=>q.ko===words[i][1]),'introduction order must not match dictionary');
delete S.random;

console.log('Learning fairness, graduation, review separation, persistence and pronunciation markup checks passed');
