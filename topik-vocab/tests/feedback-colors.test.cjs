'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('topik-vocab/app.js','utf8');
const css=fs.readFileSync('topik-vocab/styles.css','utf8');
const screen=app.slice(app.indexOf('function smartScreen(){'),app.indexOf('function startOnboarding(){'));
const block=css.slice(css.indexOf('/* Smart typing feedback only:'));
assert.match(screen,/correctRating\(smartResult\)\?'good':smartResult==='again'&&!typed\?'skipped':'bad'/,'recorded result drives separate classes');
assert.match(screen,/correctRating\(smartResult\)\?'回答正确':smartResult==='again'&&!typed\?'不知道 · 稍后重练':'回答错误'/,'skipped never shows correct');
assert.match(screen,/smart-user-answer.*quote\(typed\)/,'typed answer displayed for both directions');
assert.match(screen,/meaningFeedback\(w,typed,mode,false\)/,'Chinese answer is not duplicated');
assert.match(app,/function smartDontKnow\(\)[\s\S]*?typed='';[\s\S]*?smartRecord\('again'\)/,'unknown grades Again without correct recall');
assert.match(app,/smartRecord\(correct\?'good':'again'\)/,'answer evaluator determines correct versus wrong');
assert.match(app,/if\(correct\)markRecall\(/,'only correct answers count as successful recall');
for(const [name,hex] of [['good','#A8E6CF'],['bad','#F2A3A3'],['skipped','#A3A3A3']]){
 assert.ok(block.includes('.smart-feedback.'+name+'{color:'+hex+'}'),name+' status color');
 assert.ok(block.includes('.smart-feedback.'+name+' .smart-user-answer{color:'+hex+'}'),name+' user answer color');
}
assert.ok(!block.includes('.smart-answer b'),'correct answers retain inherited white');
assert.ok(!block.includes('.smart-answer button'),'pronunciation controls unchanged');
assert.ok(!block.includes('.smart-action'),'continue unchanged');
console.log('Feedback state and CSS tests: both typing directions share good/bad/skipped state mapping; correct-answer colors untouched');
