const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const url=process.env.STUDY_E2E_URL||'http://127.0.0.1:8765/topik-vocab/';
async function sequence(browser,engine){
 const page=await browser.newPage();await page.goto(url+'?chineseIme='+engine,{waitUntil:'load'});
 const result=await page.evaluate(()=>{
  const now=Date.now(),words=scope().slice(0,50),initial=JSON.parse(JSON.stringify(state));
  const base={...initial,progress:{},lifecycle:{},relearnQueue:[],smartDirectionHistory:[],smartHistory:[],daily:{}};
  for(const w of words){
   base.lifecycle[w[1]]={seenAt:now-86400000,first:{meaning:now-86400000,spell:now-86400000}};
   base.progress[w[1]]={meaning:{last:now-86400000,due:now-3600000,correct:2,wrong:1,memory:{schedulerVersion:3,phase:'learning',stability:.5,difficulty:5,lastReview:now-86400000,learningStep:1}},spell:{last:now-86400000,due:now-7200000,correct:2,wrong:0,memory:{schedulerVersion:3,phase:'learning',stability:.5,difficulty:5,lastReview:now-86400000,learningStep:1}}};
  }
  const history=[],seq=[],stateCopy=JSON.parse(JSON.stringify(base)),day={learned:[]};
  for(let i=0;i<100;i++){
   const selected=TOPIK_SMART.select(stateCopy,words,day,0,history,now+i*1000,i%2?'meaning':'spell');
   if(!selected)throw Error('No task at '+i);
   seq.push({wordId:selected.word[0],word:selected.word[1],direction:selected.mode,type:selected.type,priority:selected.score,reason:selected.reason});
   history.push(selected.word[1]);if(history.length>30)history.shift();
   // Identical deterministic task state update, without IME interaction.
   const entry=stateCopy.progress[selected.word[1]][selected.mode];
   entry.due=now+i*1000+600000;entry.last=now+i*1000;
  }
  return {seq,scheduler:stateCopy};
 });
 await page.close();return result;
}
(async()=>{for(const [name,driver] of [['chromium',chromium],['webkit',webkit]]){const browser=await driver.launch();try{
 const a=await sequence(browser,'legacy'),b=await sequence(browser,'simple-ime');
 assert.equal(a.seq.length,100);assert.deepEqual(a.seq,b.seq);
 assert.deepEqual(a.scheduler,b.scheduler);
 console.log(JSON.stringify({browser:name,kind:'scheduler-ime-equivalence',tasks:100,'Task sequence identical':true,'Direction sequence identical':true,'Word ID sequence identical':true,'Scheduler state identical':true}));
}finally{await browser.close()}}})().catch(e=>{console.error(e);process.exitCode=1});
