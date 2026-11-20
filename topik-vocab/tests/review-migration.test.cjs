'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{},Date,Math};vm.runInNewContext(fs.readFileSync('topik-vocab/smart-scheduler.js','utf8'),c);
const S=c.window.TOPIK_SMART,dayKey='2026-11-20',now=Date.parse('2026-11-20T08:00:00Z');
const localDay=()=>dayKey;
const oldRound=words=>({total:words.length,words:[...words],completed:[]});
const answer=(ko,mode,result,offset)=>({ko,mode,result,at:now+offset});
const progressFor=(ko,due)=>({[ko]:{
 meaning:{due,last:now-60000,memory:{schedulerVersion:3,phase:'review',lastReview:now-60000,nextReview:due,stability:1,difficulty:5}},
 spell:{due,last:now-60000,memory:{schedulerVersion:3,phase:'review',lastReview:now-60000,nextReview:due,stability:1,difficulty:5}}
}});
function migrate(state){return S.migrateReviewData(state,localDay,now+9999)}

// v3.8.8 fixture: no roundId/states. Reliable same-day bidirectional Good proves completion.
let state={progress:{},lifecycle:{词:{wordState:'REVIEW'}},daily:{[dayKey]:{smartReviewRound:oldRound(['词'])}},
 smartAnswerHistory:[answer('词','meaning','good',1),answer('词','spell','good',2)]};
const historyBefore=JSON.stringify(state.smartAnswerHistory),rawBefore=JSON.stringify(state.daily[dayKey].smartReviewRound);
let report=migrate(state),round=state.daily[dayKey].smartReviewRound;
assert.equal(report.legacyRounds,1);assert.equal(report.recoveredCompleted,1);
assert.equal(state.reviewDataVersion,S.REVIEW_DATA_VERSION);
assert.equal(round.status,'completed');assert.equal(round.completed.length,1);
assert.equal(round.states.词.koToZhPassed,true);assert.equal(round.states.词.zhToKoPassed,true);
assert.equal(JSON.stringify(state.smartAnswerHistory),historyBefore,'migration preserves answer history byte-for-byte');
assert.equal(JSON.stringify(state.daily[dayKey].smartReviewRoundLegacy),rawBefore,'raw legacy round is preserved');
assert.equal(S.activeReviewRound(state.daily[dayKey]),null,'completed legacy round cannot remain active');

// Explicit old completed record remains completed even without answer history.
state={progress:{},lifecycle:{已:{wordState:'REVIEW'}},daily:{[dayKey]:{smartReviewRound:{...oldRound(['已']),completed:['已']}}},smartAnswerHistory:[]};
migrate(state);round=state.daily[dayKey].smartReviewRound;
assert.equal(round.states.已.status,'completed');assert.equal(round.completed.length,1);

// Only one direction correct is insufficient; unresolved legacy round is closed, not silently completed.
state={progress:progressFor('单',now+3600000),lifecycle:{单:{wordState:'REVIEW'}},daily:{[dayKey]:{smartReviewRound:oldRound(['单'])}},
 smartAnswerHistory:[answer('单','meaning','good',1)]};
migrate(state);round=state.daily[dayKey].smartReviewRound;
assert.equal(round.states.单.koToZhPassed,true);assert.equal(round.states.单.zhToKoPassed,false);
assert.equal(round.status,'closed-unresolved');assert.equal(round.migration.unresolved[0],'单');
assert.equal(S.activeReviewRound(state.daily[dayKey]),null,'unresolved legacy state is historical, not a forced active queue');
S.resetSession();
assert.equal(S.select(state,[[1,'单','单']],state.daily[dayKey],0,[],now,null,'review'),null,'future FSRS due does not requeue an unresolved legacy word');

// Error invalidates a prior success; only two post-error successes recover completion.
state={progress:{},lifecycle:{错:{wordState:'REVIEW'}},daily:{[dayKey]:{smartReviewRound:oldRound(['错'])}},
 smartAnswerHistory:[answer('错','meaning','good',1),answer('错','spell','again',2),answer('错','spell','good',3)]};
migrate(state);round=state.daily[dayKey].smartReviewRound;
assert.equal(round.status,'closed-unresolved');assert.equal(round.states.错.koToZhPassed,false);assert.equal(round.states.错.zhToKoPassed,true);
state={progress:{},lifecycle:{错:{wordState:'REVIEW'}},daily:{[dayKey]:{smartReviewRound:oldRound(['错'])}},
 smartAnswerHistory:[answer('错','meaning','good',1),answer('错','spell','again',2),answer('错','spell','good',3),answer('错','meaning','good',4)]};
migrate(state);round=state.daily[dayKey].smartReviewRound;
assert.equal(round.status,'completed');assert.equal(round.states.错.hadError,true);

// Old round with no reliable evidence stays preserved and closed; truly due FSRS words may enter a fresh round.
state={progress:progressFor('到期',now-1),lifecycle:{到期:{wordState:'REVIEW'}},daily:{[dayKey]:{smartReviewRound:oldRound(['到期'])}},smartAnswerHistory:[]};
migrate(state);assert.equal(state.daily[dayKey].smartReviewRound.status,'closed-unresolved');
const fresh=S.startReviewRound(state.daily[dayKey],['到期'],dayKey,now+10000);
assert.equal(fresh.status,'active');assert.notEqual(fresh.roundId,'legacy-'+dayKey);
assert.deepEqual([...fresh.words],['到期']);assert.equal(state.daily[dayKey].smartReviewRoundHistory.length,1);
S.resetSession();assert.ok(S.select(state,[[1,'到期','到期']],state.daily[dayKey],0,[],now+10001,null,'review'),'truly due word can enter a fresh round');

// Existing v3.8.9 structured active data is upgraded in place, not discarded.
state={reviewDataVersion:0,progress:{},lifecycle:{新轮:{wordState:'REVIEW'}},daily:{[dayKey]:{smartReviewRound:{
 roundId:dayKey+'-1',createdAt:now,total:1,words:['新轮'],completed:[],states:{新轮:{roundId:dayKey+'-1',wordId:'新轮',koToZhPassed:true,zhToKoPassed:false,hadError:false,attemptCount:1,status:'pending',lastErrorAt:0,lastErrorMode:null}}
}}},smartAnswerHistory:[]};
report=migrate(state);round=state.daily[dayKey].smartReviewRound;
assert.equal(report.structuredRounds,1);assert.equal(round.status,'active');assert.equal(round.states.新轮.koToZhPassed,true);
assert.ok(S.activeReviewRound(state.daily[dayKey]));

// Idempotence: repeated refresh/migration does not change already migrated data.
const once=JSON.stringify(state);const second=migrate(state);assert.equal(second.legacyRounds,0);assert.equal(JSON.stringify(state),once);

// Eight-word real-upgrade simulation: all bidirectionally correct -> 8 completed, 0 active, none reappears.
const words=Array.from({length:8},(_,i)=>'复习'+i),hist=[];
for(const [i,ko] of words.entries()){hist.push(answer(ko,'meaning','good',i*10+1),answer(ko,'spell','good',i*10+2))}
state={progress:{},lifecycle:Object.fromEntries(words.map(ko=>[ko,{wordState:'REVIEW'}])),daily:{[dayKey]:{smartReviewRound:oldRound(words)}},smartAnswerHistory:hist};
report=migrate(state);round=state.daily[dayKey].smartReviewRound;
assert.equal(round.completed.length,8);assert.equal(report.recoveredCompleted,8);assert.equal(S.activeReviewRound(state.daily[dayKey]),null);
S.resetSession();assert.equal(S.select(state,words.map(ko=>[1,ko,ko]),state.daily[dayKey],0,[],now+100,null,'review'),null);

// Cross-day: historical completion does not block a genuinely due new-day round.
const nextDay={};const next=S.startReviewRound(nextDay,['复习0'],'2026-11-21',now+S.DAY);
assert.equal(next.status,'active');assert.deepEqual([...next.words],['复习0']);

// App-level invariants: same storage key, backup before migration, explicit local-only diagnostics, no clearing.
const app=fs.readFileSync('topik-vocab/app.js','utf8');
assert.ok(app.includes("const STORAGE='topik_lab_v2'"));
assert.ok(app.includes("const REVIEW_MIGRATION_BACKUP='topik_lab_v2_review_migration_v2_backup'"));
assert.ok(app.indexOf('localStorage.setItem(REVIEW_MIGRATION_BACKUP')<app.indexOf('TOPIK_SMART.migrateReviewData(state'),'backup must precede migration');
assert.ok(app.includes('window.TOPIK_REVIEW_DIAGNOSTIC=reviewDiagnostic'));
const diagnosticBody=app.slice(app.indexOf('function reviewDiagnostic(){'),app.indexOf('window.TOPIK_REVIEW_DIAGNOSTIC=reviewDiagnostic'));
assert.ok(!diagnosticBody.includes('persist()'),'diagnostic is read-only');assert.ok(!diagnosticBody.includes('fetch('),'diagnostic never uploads data');
for(const marker of ['wordId','wordState','lastAnswers','fsrs','roundId','roundStatus','koToZhPassed','zhToKoPassed','belongsToCurrentRound','completed','queueReason','buildSha','dataStructureVersion','timezone'])assert.ok(app.includes(marker),'diagnostic field '+marker);
assert.ok(!app.includes('localStorage.clear('),'upgrade never clears local storage');
console.log('Legacy v3.8.8/v3.8.9 review migration, recovery, idempotence, due filtering and local-only diagnostics passed');
