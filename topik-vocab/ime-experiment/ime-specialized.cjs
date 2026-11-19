const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.STUDY_E2E_URL||'http://127.0.0.1:8765/topik-vocab/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function task(page,mode='meaning'){await page.evaluate(mode=>{view='smart';smartTask={word:[1,'되다','成为'],type:'typing',mode};state.inputMethod='virtual';didCheck=false;pendingRating=false;typed='';pinyinComposition='';pinyinExpanded=false;hangulMode='letters';if(simpleIme)simpleIme.reset();render()},mode)}
async function chinese(page,word){for(const k of word)await page.locator('.pinyin-keyboard [data-pinyin-key="'+k+'"]').click()}
async function hold(page,event,ms=600){const b=page.locator('.pinyin-keyboard [data-pinyin-key="backspace"]:visible').first();await b.dispatchEvent('pointerdown',{button:0,pointerId:1,pointerType:'touch',isPrimary:true});await sleep(ms);await b.dispatchEvent(event,{button:0,pointerId:1,pointerType:'touch'});return b}
async function run(name,engine){
 const browser=await engine.launch(),context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);assert.equal(await page.locator('script[src*="simple-ime-core"]').count(),0);
 await task(page);await page.waitForFunction(()=>typeof simpleIme!=='undefined'&&simpleIme);
 const init=await page.evaluate(()=>({start:imeLoadStarted,ready:performance.now(),resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('simple-ime')) .map(r=>({name:r.name.split('/').pop(),duration:r.duration,transferSize:r.transferSize,decodedBodySize:r.decodedBodySize,encodedBodySize:r.encodedBodySize}))}));
 const b=page.locator('.pinyin-keyboard [data-pinyin-key="backspace"]:visible').first();
 await chinese(page,'chengwei');await b.dispatchEvent('pointerdown',{button:0,pointerId:2,pointerType:'touch'});assert.equal(await page.locator('#pinyin-composition').textContent(),'chengwe');await b.dispatchEvent('pointerup',{button:0,pointerId:2,pointerType:'touch'});await sleep(550);assert.equal(await page.locator('#pinyin-composition').textContent(),'chengwe','short press continued deleting');
 for(const end of ['pointerup','pointercancel','touchend','touchcancel','blur','visibilitychange']){
  await task(page);await chinese(page,'chengwei');
  const key=page.locator('.pinyin-keyboard [data-pinyin-key="backspace"]:visible').first();
  await key.dispatchEvent('pointerdown',{button:0,pointerId:3,pointerType:'touch'});
  assert.equal(await page.locator('#pinyin-composition').textContent(),'chengwe');
  await sleep(650);
  const before=await page.locator('#pinyin-composition').textContent();assert.ok(before.length<6,'repeat not started: '+end+' '+before);
  if(end==='blur')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  else if(end==='visibilitychange')await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden});
  else await key.dispatchEvent(end,{button:0,pointerId:3,pointerType:'touch'});
  const stopped=await page.locator('#pinyin-composition').textContent();await sleep(240);
  assert.equal(await page.locator('#pinyin-composition').textContent(),stopped,'timer leaked after '+end);
  assert.equal(await page.evaluate(()=>keyboardDeleteTimer===null&&keyboardDeleteInterval===null),true);
 }
 await task(page);await chinese(page,'dao');const all=await page.evaluate(()=>simpleIme.getCandidates());await page.locator('[data-pinyin-choice="'+all.indexOf('到')+'"]').click();
 await page.locator('[data-pinyin-mode="numbers"]').click();await page.locator('[data-pinyin-symbol="'+encodeURIComponent('（')+'"]').click();await page.locator('[data-pinyin-mode="letters"]').click();await chinese(page,'shijian');
 await hold(page,'pointerup',520);assert.equal(await page.locator('#spell-input').inputValue(),'到（','long Delete consumed committed text before composition');
 await task(page);await chinese(page,'jian');
 const strip=page.locator('#pinyin-candidates'),touch=await strip.evaluate(el=>getComputedStyle(el).touchAction);
 assert.ok(touch.includes('pan-x'),touch);
 const before=await strip.evaluate(el=>({scroll:el.scrollLeft,top:window.scrollY,width:el.scrollWidth,client:el.clientWidth}));
 assert.ok(before.width>before.client,'candidate strip not scrollable');
 await strip.hover();await page.mouse.wheel(260,0);await sleep(180);
 const after=await strip.evaluate(el=>({scroll:el.scrollLeft,top:window.scrollY}));
 assert.ok(after.scroll>before.scroll,'horizontal gesture did not move candidate strip');
 assert.equal(after.top,before.top,'candidate horizontal swipe moved page vertically');
 await page.locator('[data-pinyin-choice="7"]').click();assert.equal(await page.locator('#spell-input').inputValue(),'减');
 await task(page);await chinese(page,'jian');await page.locator('[data-ime-next]').click();assert.equal(await page.evaluate(()=>simpleIme.page),1);await page.locator('[data-pinyin-choice="10"]').click();
 assert.equal(await page.locator('#spell-input').inputValue(),'捡');
 await task(page,'spell');for(const k of ['ㄱ','ㅗ','ㅏ'])await page.locator('[data-hangul="'+k+'"]').click();
 for(const expected of ['고','ㄱ','']){await page.locator('.hangul-keyboard [data-hangul="Backspace"]').click();assert.equal(await page.locator('#spell-input').inputValue(),expected)}
 // Engine query timing is measured inside the browser, without Playwright click overhead.
 const perf=await page.evaluate(()=>{
  const samples=['jian','cheng','chengwei','shijian','xuesheng','gongzuo'];
  const timings={};for(const q of samples){const t=[];for(let i=0;i<100;i++){const a=performance.now();SimpleImeCore.requestCandidates(q);t.push(performance.now()-a)}timings[q]=t}
  const all=[],start=performance.now();for(let i=0;i<1000;i++){const q=samples[i%samples.length],a=performance.now();SimpleImeCore.requestCandidates(q);all.push(performance.now()-a)}
  const summarize=values=>{const sorted=[...values].sort((a,b)=>a-b);return {meanMs:values.reduce((a,b)=>a+b,0)/values.length,medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:sorted.at(-1)}};
  return {queries:Object.fromEntries(Object.entries(timings).map(([k,v])=>[k,summarize(v)])),run1000:{totalMs:performance.now()-start,...summarize(all),first100MeanMs:summarize(all.slice(0,100)).meanMs,last100MeanMs:summarize(all.slice(-100)).meanMs},memory:performance.memory?.usedJSHeapSize??null}
 });
 assert.equal(errors.length,0,errors.join('; '));
 console.log(JSON.stringify({browser:name,kind:'ime-specialized',deleteTermination:['pointerup','pointercancel','touchend','touchcancel','blur','visibilitychange'],candidatePan:touch,init,perf,errors}));
 await context.close();await browser.close();
}
(async()=>{for(const [n,e] of [['chromium',chromium],['webkit',webkit]])await run(n,e)})().catch(e=>{console.error(e);process.exit(1)});
