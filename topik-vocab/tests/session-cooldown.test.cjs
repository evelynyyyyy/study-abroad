'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('topik-vocab/smart-scheduler.js','utf8'),ctx);
const q=ctx.window.TOPIK_SMART;q.resetSession();
const c=(ko,mode='meaning')=>({word:[1,ko,'意义'],mode,type:'typing'});
const allowed=(ko,mode='meaning')=>q.sessionEligible(c(ko,mode));
q.recordExposure('되다','meaning','good');
assert.equal(allowed('되다','meaning'),false);
assert.equal(allowed('되다','spell'),false,'both directions share cooldown');
for(let i=0;i<5;i++){q.recordExposure('other'+i,'meaning','good');assert.equal(allowed('되다','meaning'),false)}
q.recordExposure('other5','meaning','good');assert.equal(allowed('되다','meaning'),true);
q.recordExposure('되다','meaning','good');assert.equal(q.gapFor('되다','meaning'),18);
for(let i=0;i<18;i++)q.recordExposure('filler'+i,'spell','good');
assert.equal(allowed('되다','meaning'),true);
q.recordExposure('되다','meaning','good');assert.equal(allowed('되다','meaning'),false);
assert.equal(q.gapFor('되다','meaning'),1000);
q.resetSession();q.recordExposure('wrong','meaning','again');assert.equal(allowed('wrong'),false);
for(let i=0;i<3;i++)q.recordExposure('gap'+i,'meaning','good');
assert.equal(allowed('wrong'),true,'wrong answer returns after three other questions');
q.resetSession();for(let i=0;i<4;i++){q.recordExposure('cap','meaning','good');for(let j=0;j<30;j++)q.recordExposure('pad'+i+'_'+j,'spell','good')}
assert.equal(allowed('cap'),false,'successful word capped at four appearances');
q.resetSession();q.recordExposure('lapse','meaning','again');for(let i=0;i<5;i++){q.recordExposure('lapse','meaning','again');for(let j=0;j<4;j++)q.recordExposure('p'+i+'_'+j,'spell','good')}
assert.equal(allowed('lapse'),false,'lapsed word capped at six appearances');
console.log('Session cooldown: shared word gap, 6/18/1000 success gaps, 3 failure gap, 4/6 caps passed');
