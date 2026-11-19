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
S.learningResult(fresh,'测试韩词0','meaning',true,now);
S.learningResult(fresh,'测试韩词0','spell',true,now+1000);
assert.equal(S.wordState(fresh,'测试韩词0'),'LEARNING');
S.learningResult(fresh,'测试韩词0','meaning',true,now+2000);
assert.equal(S.wordState(fresh,'测试韩词0'),'REVIEW');
assert.ok(fresh.progress['测试韩词0'].meaning.due>now);
assert.equal(S.select(fresh,[words[0]],{learned:[words[0][1]]},1,[],now+3000,null,'learn'),null);
assert.equal(S.select(fresh,[words[0]],{learned:[]},0,[],now+S.DAY+5000,null,'review').mode,'meaning');
const before=JSON.stringify(fresh.progress);
S.select(fresh,words,{learned:[]},30,[],now,null,'learn');
assert.equal(JSON.stringify(fresh.progress),before,'pool selection must not alter FSRS');
const app=fs.readFileSync('topik-vocab/app.js','utf8');
assert.ok(app.includes('data-smart-start="learn"')&&app.includes('data-smart-start="review"'));
assert.ok(app.includes('data-speak="'+String("'")+ko'+''));
assert.ok(app.includes("isMeaning?'<button class="));
assert.ok(app.includes('didCheck&&d[0]?example'));
console.log('Learning fairness, graduation, review separation, persistence and pronunciation markup checks passed');
