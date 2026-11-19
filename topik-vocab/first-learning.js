/* First-learning controller for TOPIK单词. Independent of layout and CSS. */
'use strict';
window.TOPIK_FIRST_LEARNING={
STAGES:['unseen','shown','learning','reviewing','mastered'],
LIMIT:10, MASTERY:4,
record(state,ko){
 const p=state.progress?.[ko]||{},r=state.lifecycle?.[ko];
 if(r&&this.STAGES.includes(r.stage))return r;
 if(p.meaning?.last||p.spell?.last)return {stage:'learning',seenAt:p.read?.last||p.meaning?.last||p.spell?.last,first:{meaning:!!p.meaning?.last,spell:!!p.spell?.last}};
 if(p.read?.last)return {stage:'shown',seenAt:p.read.last,first:{meaning:false,spell:false}};
 return {stage:'unseen',seenAt:0,first:{meaning:false,spell:false}};
},
stage(state,ko){return this.record(state,ko).stage},
shown(state,ko){if(this.stage(state,ko)!=='unseen')return false;state.lifecycle[ko]={stage:'shown',seenAt:Date.now(),first:{meaning:false,spell:false}};return true},
recall(state,ko,mode){
 if(!['meaning','spell'].includes(mode))return;
 const r=this.record(state,ko);if(r.stage==='unseen')return;
 r.first[mode]=true;r.stage=r.first.meaning&&r.first.spell?'reviewing':'learning';
 state.lifecycle[ko]=r;this.mastery(state,ko);
},
mastery(state,ko){
 const r=state.lifecycle?.[ko];if(!r||!r.first?.meaning||!r.first?.spell)return;
 const a=state.progress?.[ko]?.meaning,b=state.progress?.[ko]?.spell;
 r.stage=a?.step>=this.MASTERY&&b?.step>=this.MASTERY?'mastered':'reviewing';
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