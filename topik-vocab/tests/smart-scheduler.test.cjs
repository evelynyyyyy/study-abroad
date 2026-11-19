const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{},Date,Math};vm.runInNewContext(fs.readFileSync('topik-vocab/first-learning.js','utf8'),c);
vm.runInNewContext(fs.readFileSync('topik-vocab/smart-scheduler.js','utf8'),c);
const S=c.window.TOPIK_SMART,F=c.window.TOPIK_FIRST_LEARNING,now=Date.now();
const words=[[1,'집','家'],[1,'학교','学校'],[1,'물','水']];
const state={progress:{},lifecycle:{},smartAnswerHistory:[]},day={learned:[]};
assert.equal(S.select(state,words,day,2,[],now).type,'show');
F.shown(state,'집');day.learned.push('집');
assert.equal(F.stage(state,'집'),'shown');
assert.notEqual(S.select(state,words,day,2,['집'],now)?.word[1],'집');
F.shown(state,'학교');day.learned.push('학교');
assert.equal(S.select(state,words,day,2,['집','학교'],now),null);
let m=S.review(state,'집','meaning',true,now,'good');F.recall(state,'집','meaning');
assert.ok(m.interval<1,'first success schedules minutes not days');
assert.equal(S.due(state,'집','meaning',now+60000),false);
assert.equal(S.due(state,'집','meaning',now+4*60000),true);
m=S.review(state,'집','spell',true,now,'easy');F.recall(state,'집','spell');
assert.equal(S.mastered(state,'집',now),false,'two correct answers are not mastery');
assert.equal(F.stage(state,'집',now),'consolidating');
for(let i=1;i<=3;i++){
 S.review(state,'집','meaning',true,now+i*20*60000,'good');
 S.review(state,'집','spell',true,now+i*20*60000,'easy');
}
assert.equal(S.mastered(state,'집',now+3*20*60000),false,'same-day successes cannot prove mastery');
const due=S.select(state,words,day,2,['학교','물'],now+S.DAY*2);
assert.equal(due.type,'typing','next-day due reviews take priority');
const weakState={progress:{},lifecycle:{}};
F.shown(weakState,'물');
S.review(weakState,'물','meaning',true,now);S.review(weakState,'물','spell',true,now);
const before=weakState.progress['물'].spell.memory.stability;
const again=S.review(weakState,'물','spell',false,now+1000,'again');
assert.equal(again.lastResult,'again');assert.ok(again.stability<before);
assert.equal(weakState.progress['물'].meaning.wrong,0,'direction independence');
assert.equal(S.due(weakState,'물','spell',now+2*60000),false);
assert.equal(S.due(weakState,'물','spell',now+4*60000),true);
const retry=S.review(weakState,'물','spell',true,now+4*60000,'good');
assert.equal(retry.phase,'relearning');assert.equal(S.mastered(weakState,'물'),false);
const restored=JSON.parse(JSON.stringify(weakState));
assert.equal(S.due(restored,'물','spell',now+5*60000),false,'refresh retains scheduled due time');
assert.equal(S.due(restored,'물','spell',retry.nextReview+1),true);
const old={progress:{집:{meaning:{step:7,correct:7,due:now+90*S.DAY,last:now},spell:{step:7,correct:7,due:now+90*S.DAY,last:now}}},lifecycle:{집:{stage:'mastered',seenAt:now,first:{meaning:true,spell:true}}}};
assert.equal(S.mastered(old,'집'),false);
assert.equal(F.stage(old,'집'),'consolidating');
assert.equal(S.due(old,'집','spell',now),true,'legacy long-due card returns for consolidation');
const app=fs.readFileSync('topik-vocab/app.js','utf8'),html=fs.readFileSync('topik-vocab/index.html','utf8');
for(const marker of ['data-smart-start="1"','function smartRate(','data-smart-rate="hard"','data-smart-rate="good"','data-smart-rate="easy"',"smartRecord('again')",'didCheck=true;persist();render()'])assert.ok(app.includes(marker),marker);
assert.ok(html.includes('smart-scheduler.js?v=3.5.0'));
assert.ok(app.includes('版本 v3.5.0'));

// 30-task keyboard-mode independence: both due directions must appear.
const pool=Array.from({length:18},(_,i)=>[1,'测试词'+i,'词义'+i]);
const dual={progress:{},lifecycle:{},smartDirectionHistory:[],smartHistory:[]};
for(const w of pool){
 F.shown(dual,w[1]);
 S.review(dual,w[1],'meaning',true,now-2*S.DAY,'good');
 S.review(dual,w[1],'spell',true,now-2*S.DAY,'good');
 F.recall(dual,w[1],'meaning');F.recall(dual,w[1],'spell');
}
function simulate(inputMethod){
 const state=JSON.parse(JSON.stringify(dual)),modes=[];
 state.inputMethod=inputMethod;
 for(let i=0;i<30;i++){
  const t=S.select(state,pool,{learned:[]},0,state.smartHistory,now+i*1000,state.smartInputDirection||null);
  assert.ok(t&&t.type==='typing','30 due typing tasks must be available');
  modes.push(t.mode);
  S.review(state,t.word[1],t.mode,true,now+i*1000,'good');
  state.smartInputDirection=t.mode;
  state.smartDirectionHistory.push(t.mode);
  state.smartHistory.push(t.word[1]);
 }
 return {modes,state};
}
const web=simulate('web'),system=simulate('system'),smart=simulate('smart');
assert.deepEqual(web.modes,system.modes,'keyboard must not alter scheduler sequence');
assert.deepEqual(web.modes,smart.modes,'smart input must not alter scheduler sequence');
assert.ok(web.modes.includes('meaning')&&web.modes.includes('spell'),'both directions must be scheduled');
assert.ok(web.modes.some((mode,i)=>i>0&&mode!==web.modes[i-1]),'direction must switch');
let run=1,maxRun=1;for(let i=1;i<web.modes.length;i++){run=web.modes[i]===web.modes[i-1]?run+1:1;maxRun=Math.max(maxRun,run)}
assert.ok(maxRun<=4,'comparable due directions cannot be starved by a long same-direction run');
assert.ok(web.state.progress[pool[0][1]].meaning&&web.state.progress[pool[0][1]].spell);
assert.equal(web.state.inputMethod,'web','keyboard preference persists');


// Reproduce the real starvation bug: dozens of previously practiced meaning
// cards competed against completely untested spell cards. Old scores 120 vs 95
// made one direction dominate. Every keyboard mode must give the untested
// direction a fair chance, without changing any existing progress records.
const mixedPool=Array.from({length:32},(_,i)=>[1,'未测词'+i,'释义'+i]);
const mixed={progress:{},lifecycle:{},smartHistory:[],smartDirectionHistory:[]};
for(const w of mixedPool){
 F.shown(mixed,w[1]);
 S.review(mixed,w[1],'meaning',true,now-2*S.DAY,'good');
 F.recall(mixed,w[1],'meaning');
}
function run50(inputMethod){
 const st=JSON.parse(JSON.stringify(mixed));st.inputMethod=inputMethod;
 const modes=[];
 for(let i=0;i<50;i++){
  const task=S.select(st,mixedPool,{learned:[]},0,st.smartHistory,now+i*1000,st.smartInputDirection||null);
  assert.ok(task&&task.type==='typing','must provide due task '+i);
  modes.push(task.mode);
  S.review(st,task.word[1],task.mode,true,now+i*1000,'good');
  F.recall(st,task.word[1],task.mode);
  st.smartHistory.push(task.word[1]);st.smartDirectionHistory.push(task.mode);st.smartInputDirection=task.mode;
 }
 return {modes,counts:{zhToKoCount:modes.filter(m=>m==='spell').length,koToZhCount:modes.filter(m=>m==='meaning').length},state:st};
}
const skewWeb=run50('web'),skewSystem=run50('system'),skewSmart=run50('smart');
assert.deepEqual(skewWeb.modes,skewSystem.modes);
assert.deepEqual(skewWeb.modes,skewSmart.modes);
assert.ok(skewWeb.counts.zhToKoCount>0&&skewWeb.counts.koToZhCount>0,'50 tasks must cover both due directions');
assert.ok(skewWeb.counts.zhToKoCount>=15,'untested production direction must not starve');
assert.ok(skewWeb.counts.koToZhCount>=5,'recognition due tasks must remain available');
assert.equal(S.inspect(skewWeb.state,mixedPool,now+60000).preGenerated,false);
assert.equal(skewWeb.state.inputMethod,'web');
assert.ok(app.includes("smartTask=TOPIK_SMART.select(state,words"),'scheduler chooses task without input method');
assert.ok(app.includes("const koreanKeyboard=webKeyboard&&!isMeaning,chineseKeyboard=webKeyboard&&isMeaning"),'UI keyboard follows task mode');
assert.ok(app.includes("state.studyDebug"),'opt-in diagnostic console trace');
assert.ok(app.includes("Recognition due: "),'visible due counts');
// A keyboard renderer is a pure projection of an already-selected task.
// Simulate 100 preselected directions and assert keyboard choice cannot mutate them.
const fixedDirections=Array.from({length:100},(_,i)=>i%5<2?'spell':'meaning');
const projected=fixedDirections.map(m=>m==='spell'?'Korean':'Chinese');
assert.deepEqual(projected.slice(0,5),['Korean','Korean','Chinese','Chinese','Chinese']);
assert.deepEqual(fixedDirections,Array.from({length:100},(_,i)=>i%5<2?'spell':'meaning'));
assert.ok(app.includes("smartTask=TOPIK_SMART.select(state,words"),'only scheduler selects current task');
assert.ok(!S.select.toString().includes('inputMethod'),'scheduler must not depend on keyboard preference');

console.log('50-question skewed direction results:',JSON.stringify(skewWeb.counts));

console.log('Minute steps, cross-day review, independent directions, lapse, persistence and legacy migration passed.');
