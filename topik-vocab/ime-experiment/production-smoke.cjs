const {webkit,chromium}=require('playwright');
const assert=require('node:assert/strict');
const url=process.env.STUDY_E2E_URL||'https://evelynyyyyy.github.io/study-abroad/topik-vocab/';
const words={jian:'间',cheng:'成',chengwei:'成为',shijian:'时间',fangjian:'房间',zhongjian:'中间',xuesheng:'学生',xuexi:'学习',gongzuo:'工作',pengyou:'朋友',keyi:'可以',ranhou:'然后'};
async function setTask(page,mode,word='되다'){await page.evaluate(({mode,word})=>{view='smart';smartTask={word:[1,word,mode==='meaning'?'成为':'学习'],type:'typing',mode};state.inputMethod='virtual';didCheck=false;pendingRating=false;typed='';pinyinComposition='';pinyinExpanded=false;hangulShift=false;hangulMode='letters';if(simpleIme)simpleIme.reset();render()},{mode,word})}
async function typeChinese(page,py){for(const k of py)await page.locator('.pinyin-keyboard [data-pinyin-key="'+k+'"]').click()}
async function typeKorean(page,keys){for(const k of keys)await page.locator('.hangul-keyboard [data-hangul="'+k+'"]').click()}
(async()=>{for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
 const browser=await engine.launch();const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];const failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+':'+r.url())});
 const start=Date.now();await page.goto(url,{waitUntil:'load',timeout:60000});
 assert.equal(await page.evaluate(()=>window.CHINESE_IME_ENGINE),'simple-ime');
 assert.equal(await page.locator('script[src*="simple-ime-core"]').count(),0,'engine should be lazy');
 await setTask(page,'meaning');
 await page.waitForFunction(()=>typeof simpleIme!=='undefined'&&!!simpleIme,{timeout:30000});
 const lazyMs=Date.now()-start;
 for(const [py,expected] of Object.entries(words)){
   await setTask(page,'meaning');await typeChinese(page,py);
   const all=await page.evaluate(()=>simpleIme.getCandidates());
   assert.ok(all.includes(expected),name+' '+py+' missing '+expected+' in '+all.slice(0,20));
   const index=all.indexOf(expected);
   if(index>=10){await page.locator('[data-pinyin-expand]').click()}
   await page.locator('[data-pinyin-choice="'+index+'"]').click();
   assert.equal(await page.locator('#spell-input').inputValue(),expected);
   assert.equal(await page.locator('#pinyin-composition').textContent(),'');
   console.log(JSON.stringify({browser:name,kind:'study-chinese',pinyin:py,candidates:all.slice(0,12),answer:expected}));
 }
 await setTask(page,'meaning');await typeChinese(page,'dao');
 const dao=await page.evaluate(()=>simpleIme.getCandidates());assert.ok(dao.includes('到'));
 await page.locator('[data-pinyin-choice="'+dao.indexOf('到')+'"]').click();
 await page.locator('[data-pinyin-mode="numbers"]').click();
 await page.locator('[data-pinyin-symbol="'+encodeURIComponent('（')+'"]').click();
 await page.locator('[data-pinyin-mode="letters"]').click();
 await typeChinese(page,'shijian');const timeChoices=await page.evaluate(()=>simpleIme.getCandidates());assert.ok(timeChoices.includes('时间'));await page.locator('[data-pinyin-choice="'+timeChoices.indexOf('时间')+'"]').click();
 await page.locator('[data-pinyin-mode="numbers"]').click();
 await page.locator('[data-pinyin-symbol="'+encodeURIComponent('）')+'"]').click();
 assert.equal(await page.locator('#spell-input').inputValue(),'到（时间）');
 await page.locator('[data-pinyin-key="backspace"]:visible').click();
 assert.equal(await page.locator('#spell-input').inputValue(),'到（时间');
 await page.locator('[data-pinyin-mode="letters"]').click();
 await typeChinese(page,'chengwei');
 await page.locator('[data-pinyin-key="backspace"]:visible').click();
 assert.equal(await page.locator('#pinyin-composition').textContent(),'chengwe');
 assert.equal(await page.locator('#spell-input').inputValue(),'到（时间');
 await page.locator('.pinyin-keyboard [data-smart-submit]').click();
 assert.equal(await page.locator('#pinyin-composition').textContent(),'');
 assert.equal(await page.locator('.pinyin-keyboard [data-smart-submit]').count(),1);assert.ok(await page.locator('.smart-bottom [data-smart-submit]').count()>=1);
 for(const [expected,keys] of Object.entries({
  '学生':'', // Korean samples below use actual jamo arrays
 }))void expected,void keys;
 const samples=[
 ['학생','ㅎㅏㄱㅅㅐㅇ'],['먹다','ㅁㅓㄱㄷㅏ'],['있다','ㅇㅣㅆㄷㅏ'],
 ['없다','ㅇㅓㅂㅅㄷㅏ'],['학교','ㅎㅏㄱㄱㅛ'],['공부하다','ㄱㅗㅇㅂㅜㅎㅏㄷㅏ'],
 ['과','ㄱㅗㅏ'],['뭐','ㅁㅜㅓ'],['의','ㅇㅡㅣ']
 ];
 for(const [expected,keys] of samples){await setTask(page,'spell');await typeKorean(page,[...keys]);assert.equal(await page.locator('#spell-input').inputValue(),expected)}
 await setTask(page,'spell');await page.locator('[data-hangul-shift]').click();
 assert.equal(await page.locator('[data-hangul-shift]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-hangul="ㄱ"]').click();
 assert.equal(await page.locator('#spell-input').inputValue(),'ㄲ');
 assert.equal(await page.locator('[data-hangul-shift]').getAttribute('aria-pressed'),'false');
 await page.locator('[data-hangul-mode="numbers"]').click();
 await page.locator('[data-hangul-symbol="1"]').click();
 assert.equal(await page.locator('#spell-input').inputValue(),'ㄲ1');
 await page.locator('[data-hangul-mode="letters"]').click();
 const directions=['spell','meaning','meaning','spell'];
 for(const mode of directions){await setTask(page,mode);assert.equal(await page.locator(mode==='meaning'?'.pinyin-keyboard':'.hangul-keyboard').count(),1);assert.equal(await page.evaluate(()=>smartTask.mode),mode)}
 for(let i=0;i<100;i++){const mode=i%2?'meaning':'spell';await setTask(page,mode);if(mode==='meaning'){await typeChinese(page,'jian');assert.ok((await page.evaluate(()=>simpleIme.getCandidates())).includes('间'))}else{await typeKorean(page,['ㅎ','ㅏ','ㄱ']);assert.equal(await page.locator('#spell-input').inputValue(),'학')}}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 console.log(JSON.stringify({browser:name,kind:'study-page-100-tasks',tasks:100,lazyReadyMs:lazyMs,engine:'simple-ime',koreanSamples:samples.length,chineseSamples:Object.keys(words).length,errors,failed}));
 await browser.close();
}})().catch(e=>{console.error(e);process.exit(1)});
