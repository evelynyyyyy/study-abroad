const { webkit, chromium } = require('playwright');
const assert = require('node:assert/strict');
const URL = 'https://evelynyyyyy.github.io/study-abroad/topik-vocab/ime-experiment/';
const expected={jian:'间',cheng:'成',chengwei:'成为',shijian:'时间',fangjian:'房间',zhongjian:'中间',xuesheng:'学生',xuexi:'学习',gongzuo:'工作',pengyou:'朋友',keyi:'可以',ranhou:'然后'};
(async()=>{
for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
 const browser=await engine.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const errors=[],responses=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('response',r=>{if(r.status()>=400)responses.push({status:r.status(),url:r.url()})});
 const t=Date.now();
 const response=await page.goto(URL,{waitUntil:'load',timeout:60000});
 assert.equal(response.status(),200);
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('Engine loaded'),{timeout:30000});
 const readyMs=Date.now()-t;
 const init=await page.evaluate(()=>({engine:typeof SimpleImeCore,adapter:typeof TOPIK_SimpleImeAdapter,ready:document.querySelector('#status').textContent}));
 assert.equal(init.engine,'object');assert.equal(init.adapter,'function');
 let firstMs=null;const durations=[];
 for(const [py,want] of Object.entries(expected)){
  const start=Date.now();
  await page.locator('#pinyin').fill(py);
  await page.waitForFunction(p=>document.querySelector('#composition').textContent===p,py);
  const result=JSON.parse(await page.locator('#debug').textContent());
  durations.push(Date.now()-start);
  assert.equal(result.engine,'simple-ime');
  assert.ok(result.candidates.includes(want),`${name} ${py}: missing ${want} in first 50: ${result.candidates.join(',')}`);
  if(py==='chengwei')firstMs=Date.now()-start;
  console.log(JSON.stringify({browser:name,pinyin:py,candidateCount:result.candidateCount,firstCandidates:result.candidates.slice(0,12)}));
 }
 const cycle=['chengwei','shijian','xuesheng','jian'];
 for(let i=0;i<50;i++){
  const py=cycle[i%cycle.length];
  await page.locator('#pinyin').fill(py);
  const result=JSON.parse(await page.locator('#debug').textContent());
  assert.ok(result.candidates.includes(expected[py]),`${name} cycle ${i}: ${py}`);
  await page.locator('#pinyin').fill('');
  assert.equal(await page.locator('#composition').textContent(),'');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(responses,[]);
 console.log(JSON.stringify({browser:name,kind:'headless desktop engine mobile viewport, NOT real iPhone Safari',readyMs,firstChengweiMs:firstMs,meanQueryRoundtripMs:durations.reduce((a,b)=>a+b,0)/durations.length,cycles:50,errors,responses}));
 await browser.close();
}
})().catch(e=>{console.error(e);process.exit(1)});
