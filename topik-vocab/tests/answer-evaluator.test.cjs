const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={};vm.runInNewContext(fs.readFileSync('topik-vocab/answer-evaluator.js','utf8'),context);
const e=context.TOPIK_ANSWER_EVALUATOR;
const evaluate=(w,input,mode='meaning')=>e.evaluateAnswer({direction:mode,userAnswer:input,word:w}).status;
for(const input of ['成为','到时间','到（时间）','成为……','到时间，成为','成为，到时间','成为......','成为...','到(时间)','成为；到时间','到时间|成为','变成','時間到了'])assert.notEqual(evaluate([1,'되다','到（时间），成为……'],input),'incorrect',input);
for(const input of ['吃饭','学校','城为'])assert.equal(evaluate([1,'되다','到（时间），成为……'],input),'incorrect',input);
for(const input of ['家','房子','住所','住处'])assert.notEqual(evaluate([1,'집','家，房子，住所'],input),'incorrect',input);
assert.equal(evaluate([1,'학생','学生'],'学生'),'correct');
assert.equal(evaluate([1,'되다','成为'],'돼요','spell'),'incorrect');
for(const [meaning,input] of [['开（门）','开门'],['学习','學習'],['TOPIK','topik'],['第一','第1']])assert.equal(evaluate([1,'test',meaning],input),meaning==='第一'?'incorrect':'correct',meaning);
const samples=['A，B','A、B','A；B','A/B','A|B','A｜B','A·B','A（说明）','A……','A，B……','A；B；C'];
for(const meaning of samples){const parts=e.splitMeanings(meaning);assert.ok(parts.length>=1);for(const part of parts)assert.notEqual(evaluate([1,'test',meaning],part),'incorrect',meaning+' -> '+part)}
console.log('Answer evaluator: regression, formats, spelling, typo checks passed');
