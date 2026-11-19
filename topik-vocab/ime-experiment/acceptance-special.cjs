const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.STUDY_E2E_URL||'http://127.0.0.1:8765/topik-vocab/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const queries=['jian','cheng','chengwei','shijian','xuesheng','gongzuo'];
const pct=(a,p)=>a.slice().sort((x,y)=>x-y)[Math.min(a.length-1,Math.ceil(a.length*p)-1)];
const stats=a=>({n:a.length,meanMs:+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(3),medianMs:+pct(a,.5).toFixed(3),p95Ms:+pct(a,.95).toFixed(3),maxMs:+Math.max(...a).toFixed(3)});
async function task(page,mode='meaning'){await page.evaluate(mode=>{view='smart';smartTask={word:[1,'되다','成为'],type:'typing',mode};state.inputMethod='virtual';didCheck=false;pendingRating=false;typed='';pinyinComposition='';pinyinExpanded=false;hangulShift=false;if(simpleIme)simpleIme.reset();render()},mode)}
async function keys(page,str){for(const k of str)await page.locator('.pinyin-keyboard [data-pinyin-key="'+k+'"]').click()}
async function del(page,mode='meaning'){return page.locator(mode==='meaning'?'.pinyin-keyboard [data-pinyin-key="backspace"]:visible':'.hangul-keyboard [data-hangul="Backspace"]:visible')}
async function text(page){return page.locator('#spell-input').inputValue()}
async function comp(page){return page.locator('#pinyin-composition').textContent()}
async function stop(page,button,event){if(event==='blur')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));else if(event==='visibilitychange')await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden});else await button.dispatchEvent(event,{bubbles:true})}
async function deleteChecks(page,name){
 await task(page);await keys(page,'chengwei');let b=await del(page);
 await b.dispatchEvent('pointerdown',{button:0,bubbles:true});assert.equal(await comp(page),'chengwe');await stop(page,b,'pointerup');await sleep(540);assert.equal(await comp(page),'chengwe','short press must stop');
 for(const event of ['pointerup','pointercancel','touchend','touchcancel','blur','visibilitychange']){
  await task(page);await keys(page,'chengwei');b=await del(page);
  await b.dispatchEvent('pointerdown',{button:0,bubbles:true});await sleep(660);
  const before=await comp(page);assert.ok(before.length<7,'repeat failed '+event+' '+before);
  await stop(page,b,event);await sleep(320);
  assert.equal(await comp(page),before,'timer leaked '+event);
 }
 await task(page);await page.evaluate(()=>{typed='到（';syncChineseAnswer()});await keys(page,'shijian');b=await del(page);
 await b.dispatchEvent('pointerdown',{button:0,bubbles:true});await sleep(600);await stop(page,b,'pointerup');
 assert.equal(await text(page),'到（','composition delete must not touch committed');
 await page.evaluate(()=>{simpleIme.reset();pinyinComposition='';updatePinyinDisplay()});await b.click();assert.equal(await text(page),'到');
 await task(page,'spell');for(const k of ['ㄱ','ㅗ','ㅏ'])await page.locator('[data-hangul="'+k+'"]').click();
 assert.equal(await text(page),'과');b=await del(page,'spell');for(const expected of ['고','ㄱ','']){await b.click();assert.equal(await text(page),expected,'Hangul delete '+expected)}
 console.log(JSON.stringify({browser:name,test:'delete-events-and-composition',events:6,status:'pass'}));
}
async function swipeChecks(page,name){
 await task(page);await keys(page,'jian');
 const list=page.locator('#pinyin-candidates');const before=await page.evaluate(()=>({x:document.documentElement.scrollLeft,y:window.scrollY}));
 assert.equal(await list.evaluate(e=>getComputedStyle(e).touchAction),'pan-x');
 const candidates=await page.evaluate(()=>simpleIme.getCandidates());assert.ok(candidates.length>10);
 const rect=await list.boundingBox();assert.ok(rect);
 await page.evaluate(()=>{const e=document.getElementById('pinyin-candidates');e.scrollLeft=0});
 const start=await list.evaluate(e=>e.scrollLeft);
 await page.evaluate(()=>{const e=document.getElementById('pinyin-candidates');e.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:e,clientX:260,clientY:320})]}));e.scrollLeft+=130;e.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:e,clientX:130,clientY:320})]}))});
 const moved=await list.evaluate(e=>e.scrollLeft);assert.ok(moved>start,'horizontal scroll must work');
 assert.equal(await comp(page),'jian','swipe must not commit');
 assert.deepEqual(await page.evaluate(()=>({x:document.documentElement.scrollLeft,y:window.scrollY})),before,'page scroll changed');
 const idx=candidates.indexOf('间');assert.ok(idx>=0);await page.locator('[data-pinyin-choice="'+idx+'"]').click();assert.equal(await text(page),'间');
 await task(page);await keys(page,'jian');const all=await page.evaluate(()=>simpleIme.getCandidates());assert.ok(all.length>10);
 await page.locator('[data-ime-next]').click();assert.equal(await page.evaluate(()=>simpleIme.page),1);
 const next=page.locator('#pinyin-candidates [data-pinyin-choice]').first();const index=Number(await next.getAttribute('data-pinyin-choice'));assert.equal(index,10);
 await next.click();assert.equal(await text(page),all[10]);
 console.log(JSON.stringify({browser:name,test:'candidate-swipe-and-page-index',scrollPx:moved,selectedIndex:index,status:'pass'}));
}
async function performance(page,name){
 await task(page);await page.waitForFunction(()=>!!simpleIme);
 const report=await page.evaluate(async queries=>{
 const core=window.SimpleImeCore,ad=simpleIme,now=()=>performance.now();
 const query=q=>{const t=now();core.requestCandidates(q);return now()-t};
 const individual={};for(const q of queries){const a=[];for(let i=0;i<80;i++)a.push(query(q));individual[q]=a}
 const samples=[];for(let i=0;i<1000;i++)samples.push(query(queries[i%queries.length]));
 const heap=performance.memory?.usedJSHeapSize??null;
 return {individual,samples,heapAfter1000:heap};
 },queries);
 const out={browser:name,kind:'engine-performance',queries:Object.fromEntries(Object.entries(report.individual).map(([k,v])=>[k,stats(v)])),queries1000:stats(report.samples),first100:stats(report.samples.slice(0,100)),last100:stats(report.samples.slice(-100)),heapAfter1000:report.heapAfter1000};
 assert.equal(report.samples.length,1000);assert.ok(out.queries1000.maxMs<1000);
 console.log(JSON.stringify(out));
}
async function lazyAndFailure(browser,name){
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await ctx.newPage();const err=[];page.on('pageerror',e=>err.push(e.message));
 await page.goto(base,{waitUntil:'load'});
 assert.equal(await page.locator('script[src*="simple-ime-core"]').count(),0);
 const coldStart=Date.now();await task(page);await page.waitForFunction(()=>!!simpleIme);
 const cold=Date.now()-coldStart;const first=await page.evaluate(()=>!!simpleIme);assert.equal(first,true);
 await task(page,'spell');await task(page,'meaning');
 assert.equal(await page.locator('script[src*="simple-ime-core"]').count(),1);
 assert.equal(await page.evaluate(()=>simpleIme===window.__not_an_ime),false);
 const warmStart=Date.now();await page.reload({waitUntil:'load'});await task(page);await page.waitForFunction(()=>!!simpleIme);const warm=Date.now()-warmStart;
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(x=>x.name.includes('simple-ime-core')).map(x=>({duration:x.duration,transferSize:x.transferSize,encodedBodySize:x.encodedBodySize,decodedBodySize:x.decodedBodySize})));
 console.log(JSON.stringify({browser:name,kind:'lazy-cold-warm',coldMs:cold,warmMs:warm,resources}));
 await deleteChecks(page,name);await swipeChecks(page,name);await performance(page,name);assert.deepEqual(err,[]);await ctx.close();
 const failCtx=await browser.newContext();await failCtx.route('**/simple-ime-core.js*',route=>route.fulfill({status:404,body:'not found'}));
 const failure=await failCtx.newPage();await failure.goto(base,{waitUntil:'load'});await task(failure);await sleep(350);
 assert.equal(await failure.evaluate(()=>smartTask.word[1]),'되다');
 assert.ok(await failure.locator('body').isVisible());
 assert.equal(await failure.evaluate(()=>!!simpleIme),false);
 console.log(JSON.stringify({browser:name,kind:'engine-load-404',taskPreserved:true,whiteScreen:false,developerLegacyRollback:true,status:'pass'}));
 await failCtx.close();
}
(async()=>{for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch();try{await lazyAndFailure(browser,name)}finally{await browser.close()}}})().catch(e=>{console.error(e);process.exitCode=1});
