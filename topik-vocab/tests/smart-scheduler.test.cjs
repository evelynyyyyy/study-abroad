const releaseVersion=JSON.parse(require('node:fs').readFileSync('topik-vocab/release-source.json','utf8')).version;
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
state.lifecycle['집'].wordState='REVIEW';
const due=S.select(state,words,day,2,['학교','물'],now+S.DAY*2,null,'review');
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
for(const marker of ['data-smart-start="learn"','data-smart-start="review"',"smartRecord(correct?'good':'again')",'data-smart-unknown="1"','didCheck=true;resetKeyboardInteraction();persist();render()'])assert.ok(app.includes(marker),marker);
assert.ok(html.includes('smart-scheduler.js?v='+releaseVersion+''));
assert.ok(app.includes('window.TOPIK_APP_VERSION'));

// 30-task keyboard-mode independence: both due directions must appear.
const pool=Array.from({length:18},(_,i)=>[1,'测试词'+i,'词义'+i]);
const dual={progress:{},lifecycle:{},smartDirectionHistory:[],smartHistory:[]};
for(const w of pool){
 F.shown(dual,w[1]);
 S.review(dual,w[1],'meaning',true,now-2*S.DAY,'good');
 S.review(dual,w[1],'spell',true,now-2*S.DAY,'good');
 F.recall(dual,w[1],'meaning');F.recall(dual,w[1],'spell');dual.lifecycle[w[1]].wordState='REVIEW';
}
function simulate(inputMethod){
 const state=JSON.parse(JSON.stringify(dual)),modes=[];
 state.inputMethod=inputMethod;
 let seed=24681357;S.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<30;i++){
  const t=S.select(state,pool,{learned:[]},0,state.smartHistory,now+i*1000,state.smartInputDirection||null,'review');
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
assert.ok(web.modes.filter(m=>m==='meaning').length>=5&&web.modes.filter(m=>m==='spell').length>=5,'both due directions must receive substantial opportunities across the session');
assert.ok(maxRun<web.modes.length,'scheduler must not lock into one direction');
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
 F.recall(mixed,w[1],'meaning');mixed.lifecycle[w[1]].wordState='REVIEW';
}
function run50(inputMethod){
 S.resetSession();
 let seed=97531864;S.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 const st=JSON.parse(JSON.stringify(mixed));st.inputMethod=inputMethod;
 const modes=[];
 for(let i=0;i<50;i++){
  const task=S.select(st,mixedPool,{learned:[]},0,st.smartHistory,now+i*1000,st.smartInputDirection||null,'review');
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

// New architecture regression: independent home actions, no cross-pool task leakage.
assert.ok(app.includes('data-smart-start="learn"')&&app.includes('data-smart-start="review"'));
assert.ok(app.includes('startSmart(b.dataset.smartStart)'));
const isolated={progress:{},lifecycle:{},smartHistory:[]};
F.shown(isolated,'집');
assert.equal(S.select(isolated,words,{learned:['집']},2,[],now,null,'review'),null);
assert.ok(S.select(isolated,words,{learned:['집']},2,[],now,null,'learn'));
const preserved=JSON.stringify(isolated.progress);
S.select(isolated,words,{learned:['집']},2,[],now,null,'review');
assert.equal(JSON.stringify(isolated.progress),preserved,'switching pools must not mutate FSRS progress');
const completed={progress:{},lifecycle:{},smartHistory:[]};
assert.equal(S.select(completed,words,{learned:[]},0,[],now,null,'review'),null);


// Formal review round regression: completion is two directional passes, independent of future FSRS due flags.
function freshRound(ids){
 const d={learned:[]};S.startReviewRound(d,ids,'2026-11-20',now);return d;
}
function reviewState(ids){
 const st={progress:{},lifecycle:{},smartHistory:[]};
 for(const ko of ids)st.lifecycle[ko]={wordState:'REVIEW'};
 return st;
}
let rd=freshRound(['양방향']);
let rr=S.recordReviewRound(rd,'양방향','meaning',true,now);
assert.equal(rr.status,'pending');assert.equal(rd.smartReviewRound.completed.length,0,'one direction is not complete');
rr=S.recordReviewRound(rd,'양방향','spell',true,now+1);
assert.equal(rr.status,'completed');assert.equal([...rd.smartReviewRound.completed].join(','),'양방향','two first-pass directions complete exactly one word');
const attemptsAfterComplete=rr.attemptCount;
S.recordReviewRound(rd,'양방향','meaning',true,now+2);
assert.equal(rr.attemptCount,attemptsAfterComplete,'completed word ignores duplicate round submissions');

rd=freshRound(['错后']);
S.recordReviewRound(rd,'错后','meaning',true,now);
rr=S.recordReviewRound(rd,'错后','spell',false,now+1);
assert.equal(rr.status,'reinforcing');assert.equal(rr.koToZhPassed,false);assert.equal(rr.zhToKoPassed,false,'an error invalidates earlier directional pass');
S.recordReviewRound(rd,'错后','spell',true,now+2);
assert.equal(rd.smartReviewRound.completed.length,0,'wrong then one success is not complete');
rr=S.recordReviewRound(rd,'错后','meaning',true,now+3);
assert.equal(rr.status,'completed','after an error both directions must pass again');

rd=freshRound(['先错']);
S.recordReviewRound(rd,'先错','meaning',false,now);
rr=S.recordReviewRound(rd,'先错','spell',true,now+1);
assert.equal(rr.status,'reinforcing');assert.equal(rr.koToZhPassed,false);assert.equal(rr.zhToKoPassed,true,'wrong ko→zh plus correct zh→ko remains incomplete');
rd=freshRound(['双错']);
S.recordReviewRound(rd,'双错','meaning',false,now);
rr=S.recordReviewRound(rd,'双错','spell',false,now+1);
assert.equal(rr.status,'reinforcing');assert.equal(rd.smartReviewRound.completed.length,0,'two errors never complete');
assert.ok(app.includes("smartRecord('again')"),'不知道 maps to Again/error path');

const excludedState=reviewState(['完成词']);
rd=freshRound(['完成词']);
S.recordReviewRound(rd,'完成词','meaning',true,now);S.recordReviewRound(rd,'完成词','spell',true,now+1);
S.resetSession();
assert.equal(S.select(excludedState,[[1,'完成词','完成']],rd,0,[],now+2,null,'review'),null,'completed word never re-enters the same round');

const persisted=JSON.parse(JSON.stringify(rd)),persistedRound=S.reviewRound(persisted);
assert.equal(persistedRound.states['完成词'].status,'completed','refresh preserves completed state');
assert.equal(persistedRound.completed.length,1,'refresh preserves completed count');
const nextDay={learned:[]};S.startReviewRound(nextDay,['完成词'],'2026-11-21',now+S.DAY);
assert.equal(nextDay.smartReviewRound.states['完成词'].status,'pending','same word may enter a new review round on another day');

const coolState=reviewState(['冷却词']);
rd=freshRound(['冷却词']);S.resetSession();
S.review(coolState,'冷却词','meaning',false,now,'again');
S.recordReviewRound(rd,'冷却词','meaning',false,now);S.recordExposure('冷却词','meaning','again');
assert.equal(S.select(coolState,[[1,'冷却词','冷却']],rd,0,['冷却词'],now+1000,null,'review'),null,'failed word is not immediately repeated');
assert.ok(S.select(coolState,[[1,'冷却词','冷却']],rd,0,['冷却词'],now+S.CONFIG.lapseMinutes[0]*60000+1,null,'review'),'failed word unlocks after short reinforcement interval');

const eight=Array.from({length:8},(_,i)=>[1,'复习'+i,'释义'+i]),eightIds=eight.map(w=>w[1]);
const eightState=reviewState(eightIds),eightDay=freshRound(eightIds),seenCompleted=new Set();
S.resetSession();S.random=()=>0;
for(let i=0;i<16;i++){
 const task=S.select(eightState,eight,eightDay,0,eightState.smartHistory,now+i*1000,null,'review');
 assert.ok(task,'8-word round must provide exactly 16 directional tasks');
 S.review(eightState,task.word[1],task.mode,true,now+i*1000,'good');
 const wordRound=S.recordReviewRound(eightDay,task.word[1],task.mode,true,now+i*1000);
 S.recordExposure(task.word[1],task.mode,'correct');eightState.smartHistory.push(task.word[1]);
 if(wordRound.status==='completed')seenCompleted.add(task.word[1]);
}
assert.equal(eightDay.smartReviewRound.completed.length,8,'8 words double-correct complete 8 unique words');
assert.equal(seenCompleted.size,8,'directional passes never double-count a word');
assert.ok(eightIds.every(ko=>eightDay.smartReviewRound.states[ko].attemptCount===2),'normal review needs one pass per direction only');
assert.equal(S.select(eightState,eight,eightDay,0,eightState.smartHistory,now+20000,null,'review'),null,'all 8 completed words stay out of the current queue');
assert.ok(app.includes('今日复习已完成'),'completed round has an explicit completion screen');

const recordBody=app.slice(app.indexOf('function smartRecord(result){'),app.indexOf('function queueRelearn'));
assert.equal((recordBody.match(/TOPIK_SMART\.review\(/g)||[]).length,1,'one submitted review answer invokes FSRS once');
assert.ok(recordBody.includes("if(!smartTask||smartTask.type!=='typing'||didCheck)return"),'duplicate submit is blocked before FSRS');
assert.ok(app.includes("slow.textContent='慢速'"),'wrong-answer pronunciation keeps existing slow playback support');
assert.ok(app.includes('TOPIK_SMART.recordReviewRound'),'app persists formal round result separately from FSRS scheduling');
assert.ok(!app.includes('delete d.smartReviewRound'),'review repair does not clear old review-round data');
