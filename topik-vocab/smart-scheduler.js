/* TOPIK v2.0.0: continuous scheduling with SM-2 intervals and short learning steps.
 * Independently stored per direction; no third-party source code copied.
 * Adapted from published SM-2 principles (1d, 6d, interval*ease).
 */
'use strict';
window.TOPIK_SMART={
 DAY:86400000, MIN_GAP:2, VERSION:'2.0.0',
 normalize(state,ko,mode,now=Date.now()){
  const p=state.progress?.[ko]?.[mode]||{},old=p.memory||{};
  const lastReview=Number(old.lastReview||p.last||0);
  const interval=Number.isFinite(old.interval)?old.interval:Math.max(0,(Number(p.due||lastReview)-lastReview)/this.DAY);
  const stability=Math.max(.04,Number(old.stability)||Math.max(.04,interval||.2));
  const elapsed=lastReview?Math.max(0,(now-lastReview)/this.DAY):0;
  return {
   ease:Math.max(1.3,Math.min(3,Number(old.ease)||2.5)),
   streak:Number(old.streak??p.step??0),stability,
   difficulty:Number(old.difficulty)||5,
   retrievability:Math.pow(.9,elapsed/stability),
   interval,lastReview,nextReview:Number(p.due??old.nextReview??now),
   correct:Number(old.correct??p.correct??Math.max(0,p.step||0)),
   incorrect:Number(old.incorrect??p.wrong??0),
   reps:Number(old.reps??((p.correct||Math.max(0,p.step||0))+(p.wrong||0))),
   lastResult:old.lastResult??null
  };
 },
 review(state,ko,mode,success,now=Date.now(),result=success?'correct':'wrong'){
  const entry=state.progress[ko]||{},old=entry[mode]||{};
  const m=this.normalize(state,ko,mode,now);
  const streak=success?m.streak+1:0;
  const ease=Math.max(1.3,Math.min(3,m.ease+(success?0:-.2)));
  // SM-2 review progression, plus 1-minute learning/lapse step for in-session errors.
  let interval;
  if(!success)interval=1/1440;
  else if(streak===1)interval=1;
  else if(streak===2)interval=6;
  else interval=Math.max(1,Math.round(Math.max(1,m.interval)*ease));
  const nextReview=now+Math.round(interval*this.DAY);
  const stability=success?Math.max(.2,interval):Math.max(.04,m.stability*.4);
  const memory={
   ease,streak,stability,difficulty:Math.max(1,Math.min(10,m.difficulty+(success?-.15:.7))),
   retrievability:1,interval,lastReview:now,nextReview,
   correct:m.correct+(success?1:0),incorrect:m.incorrect+(success?0:1),
   reps:m.reps+1,lastResult:result
  };
  entry[mode]={...old,memory,due:nextReview,last:now,
   wrong:(old.wrong||0)+(success?0:1),correct:(old.correct||0)+(success?1:0),
   step:success?Math.min(7,(old.step||0)+1):0};
  state.progress[ko]=entry;return memory;
 },
 due(state,ko,mode,now=Date.now()){
  const p=state.progress?.[ko]?.[mode];
  return !p||!Number.isFinite(Number(p.due))||Number(p.due)<=now;
 },
 stage(state,ko){return window.TOPIK_FIRST_LEARNING.stage(state,ko)},
 select(state,words,day,goal,history=[],now=Date.now()){
  const recent=history.slice(-this.MIN_GAP);
  const introduced=new Set(day.learned||[]);
  const candidates=[];
  for(const word of words){
   const ko=word[1],stage=this.stage(state,ko),p=state.progress[ko]||{};
   if(stage==='unseen'){
    if(introduced.size<goal)candidates.push({word,type:'show',mode:null,score:20});
    continue;
   }
   for(const mode of ['meaning','spell']){
    const q=p[mode],first=!!state.lifecycle?.[ko]?.first?.[mode]||!!q?.last;
    const seenAt=state.lifecycle?.[ko]?.seenAt||p.read?.last||0;
    if(!this.due(state,ko,mode,now))continue;
    // A lapse must wait for its scheduled minute, even when history is short.
    // Require intervening items; a very short cooldown also avoids answer leakage.
    if(!first&&seenAt&&now-seenAt<3000)continue;
    const m=this.normalize(state,ko,mode,now);
    const lateness=q?.due?Math.max(0,(now-q.due)/this.DAY):0;
    const score=(!first?90:60)+Math.min(40,lateness*8)+
     (q?.wrong?Math.min(30,q.wrong*3):0)+(m.lastResult==='wrong'?15:0)+
     Math.max(0,5-m.stability);
    candidates.push({word,type:'typing',mode,score});
   }
  }
  if(!candidates.length)return null;
  let eligible=candidates.filter(c=>!recent.includes(c.word[1]));
  // If there are fewer than 3 available words, relax the history filter
  // rather than falsely claiming that today's work is complete.
  if(!eligible.length)eligible=candidates.filter(c=>c.word[1]!==history.at(-1));
  if(!eligible.length)eligible=candidates;
  const due=eligible.filter(c=>c.type==='typing').sort((a,b)=>b.score-a.score);
  const fresh=eligible.filter(c=>c.type==='show');
  // Dynamically interleave new words among due work without a fixed-size batch.
  const newSlot=history.length%4===0;
  if(fresh.length&&(!due.length||newSlot))return fresh[0];
  // Avoid the same word in both directions back-to-back whenever alternatives exist.
  return due[0]||fresh[0]||null;
 },
 summary(state,words,day,goal,now=Date.now()){
  let due=0;
  for(const word of words){
   if(this.stage(state,word[1])==='unseen')continue;
   for(const mode of ['meaning','spell'])if(this.due(state,word[1],mode,now))due++;
  }
  return {due,newCount:(day.learned||[]).length,goal,
   remaining:Math.max(0,goal-(day.learned||[]).length)};
 }
};