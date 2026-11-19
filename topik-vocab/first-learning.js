/* First-learning controller for TOPIK单词. Independent of layout and CSS. */
'use strict';
window.TOPIK_FIRST_LEARNING={
STAGES:['unseen','shown','learning','consolidating','long-term','mastered','reviewing'],
LIMIT:10,
record(state,ko){
 const p=state.progress?.[ko]||{},r=state.lifecycle?.[ko];
 const first={meaning:!!(r?.first?.meaning||p.meaning?.last),spell:!!(r?.first?.spell||p.spell?.last)};
 const seenAt=Number(r?.seenAt||p.read?.last||p.meaning?.last||p.spell?.last||0);
 if(!seenAt&&!first.meaning&&!first.spell)return {stage:'unseen',seenAt:0,first};
 return {stage:r?.stage||'shown',seenAt,first};
},
stage(state,ko,now=Date.now()){
 const r=this.record(state,ko);
 if(r.stage==='unseen')return 'unseen';
 if(!r.first.meaning&&!r.first.spell)return 'shown';
 if(!r.first.meaning||!r.first.spell)return 'learning';
 const smart=window.TOPIK_SMART;
 if(!smart)return 'consolidating';
 if(smart.mastered(state,ko,now))return 'mastered';
 const modes=['meaning','spell'].map(mode=>smart.normalize(state,ko,mode,now));
 if(modes.every(m=>m.phase==='review'&&m.stability>=smart.CONFIG.longTermDays&&m.crossDaySuccess>=1&&m.retrievability>=smart.CONFIG.longTermRetention))return 'long-term';
 return 'consolidating';
},
shown(state,ko){
 if(this.stage(state,ko)!=='unseen')return false;
 state.lifecycle=state.lifecycle||{};
 state.lifecycle[ko]={stage:'shown',seenAt:Date.now(),first:{meaning:false,spell:false}};
 return true;
},
recall(state,ko,mode){
 if(!['meaning','spell'].includes(mode))return;
 state.lifecycle=state.lifecycle||{};
 const r=this.record(state,ko);
 if(r.stage==='unseen')return;
 r.first[mode]=true;
 r.stage=this.stage(state,ko);
 state.lifecycle[ko]=r;
 this.mastery(state,ko);
},
mastery(state,ko){
 const r=state.lifecycle?.[ko];if(!r)return;
 r.stage=this.stage(state,ko);
},
shuffle(items){let a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
questions(words){
 const pool=this.shuffle(words.flatMap(word=>[{word,mode:'meaning',retry:false},{word,mode:'spell',retry:false}]));
 const out=[];
 while(pool.length){
  const last=out.at(-1)?.word[1];
  const counts=new Map();
  for(const q of pool)counts.set(q.word[1],(counts.get(q.word[1])||0)+1);
  let candidates=pool.filter(q=>q.word[1]!==last);
  if(!candidates.length)candidates=pool;
  candidates.sort((a,b)=>counts.get(b.word[1])-counts.get(a.word[1]));
  const pick=candidates[0],i=pool.indexOf(pick);
  out.push(pool.splice(i,1)[0]);
 }
 return out;
},
newBatch(words){return {phase:'show',words:words.slice(0,this.LIMIT),index:0,queue:[],retry:[],retryCount:{},question:null,attempts:0,correct:0}},
reveal(batch){batch.index++;if(batch.index>=batch.words.length){batch.phase='intro';batch.queue=this.questions(batch.words);batch.index=0}},
next(batch){
 let q=batch.queue.shift();
 if(!q&&batch.retry.length&&batch.words.length>1){batch.queue=this.shuffle(batch.retry);batch.retry=[];q=batch.queue.shift()}
 if(!q){batch.phase='done';batch.question=null;return}
 batch.phase='typing';batch.question=q;
},
result(batch,correct){
 batch.attempts++;if(correct)batch.correct++;
 const q=batch.question,key=q.word[1]+'|'+q.mode;
 if(!correct&&(batch.retryCount[key]||0)<2){batch.retryCount[key]=(batch.retryCount[key]||0)+1;batch.retry.push({...q,retry:true})}
}
};