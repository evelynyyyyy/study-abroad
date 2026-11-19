/* Voluntary relearning: persisted overlay; never deletes historical grades. */
(function(root){
'use strict';
const MODES=['meaning','spell'],DELAY=45000;
function init(state){if(!state.relearn||typeof state.relearn!=='object'||Array.isArray(state.relearn))state.relearn={};return state.relearn}
function enqueue(state,ko,kind='refresh',modes=MODES,now=Date.now()){
 if(!ko)return false;
 const store=init(state),old=store[ko],chosen=modes.filter(m=>MODES.includes(m));
 if(!chosen.length)return false;
 const pending=old?.pending||{};
 const directions={...(old?.directions||{})};
 for(const mode of chosen){
  directions[mode]={status:'show',due:now,tries:0,kind};
  // Historical SM-2 grades and counters are preserved. Only the future schedule is adjusted.
  const p=state.progress?.[ko]?.[mode];
  if(p){
   const m=p.memory||{};
   const stability=Math.max(.04,Number(m.stability||1)*(kind==='restart'?.35:.7));
   p.memory={...m,stability,streak:kind==='restart'?0:Number(m.streak||0),
    phase:'relearning',learningStep:0,successes:0,crossDaySuccess:0,
    lastFailure:now,lastResult:'relearn-requested',nextReview:now};
   p.due=now;
  }
 }
 store[ko]={...old,directions,requestedAt:now,kind,history:[...(old?.history||[]),{at:now,kind,modes:chosen}].slice(-100)};
 return true;
}
function afterShow(state,ko,now=Date.now()){
 const task=init(state)[ko];if(!task)return;
 for(const mode of MODES){const d=task.directions?.[mode];if(d?.status==='show')task.directions[mode]={...d,status:'typing',due:now+DELAY}}
 task.shownAt=now;task.showCount=(task.showCount||0)+1;
}
function afterAnswer(state,ko,mode,success,now=Date.now()){
 const d=init(state)[ko]?.directions?.[mode];if(!d||d.status!=='typing')return;
 if(success){d.status='done';d.due=0}
 else{d.tries=(d.tries||0)+1;if(d.tries>=2){d.status='done';d.due=0}else d.due=now+DELAY}
}
function select(state,words,history=[],now=Date.now()){
 const map=new Map(words.map(w=>[w[1],w]));
 const recent=new Set(history.slice(-2)),last=history.at(-1);
 const candidates=[];
 for(const [ko,task] of Object.entries(init(state))){
  const word=map.get(ko);if(!word)continue;
  const dirs=Object.entries(task.directions||{});
  if(dirs.some(([,d])=>d.status==='show'))candidates.push({word,type:'relearn-show',mode:null,score:110});
  for(const [mode,d] of dirs)if(d.status==='typing'&&d.due<=now)candidates.push({word,type:'typing',mode,score:130+(d.tries||0)*10,relearn:true});
 }
 if(!candidates.length)return null;
 const eligible=candidates.filter(c=>!recent.has(c.word[1]));
 const pool=eligible.length?eligible:candidates.filter(c=>c.word[1]!==last);
 return (pool.length?pool:candidates).sort((a,b)=>b.score-a.score)[0];
}
function count(state){return Object.values(init(state)).filter(t=>Object.values(t.directions||{}).some(d=>d.status!=='done')).length}
return root.TOPIK_RELEARN={init,enqueue,afterShow,afterAnswer,select,count,DELAY};
})(typeof window!=='undefined'?window:globalThis);
