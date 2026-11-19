/* Time-validated spaced repetition, FSRS-inspired (not an official FSRS implementation).
 * Per-direction short steps, stability, difficulty, retrieval and cross-day evidence.
 * All timestamps persisted in the existing topik_lab_v2 progress structure.
 */
'use strict';
window.TOPIK_SMART={
 DAY:86400000, MIN_GAP:2, VERSION:'3.0.0',
 CONFIG:{
  learningMinutes:[3,15,180],lapseMinutes:[3,15,180],
  targetRetention:.90,masteryRetention:.85,longTermRetention:.80,
  longTermDays:7,masteryDays:21,masteryCrossDays:2,
  maxNewWhenDue:12,maxNewWhenBacklogged:0,
  maxIntervalDays:365
 },
 dayKey(t){return new Date(t).toISOString().slice(0,10)},
 normalize(state,ko,mode,now=Date.now()){
  const p=state.progress?.[ko]?.[mode]||{},m=p.memory||{};
  const lastReview=Number(m.lastReview||p.last||0);
  // Old SM-2 grades do not constitute verified cross-day evidence.
  const verified=m.schedulerVersion===3;
  const stability=verified?Math.max(.04,Number(m.stability)||.04):.10;
  const elapsed=lastReview?Math.max(0,(now-lastReview)/this.DAY):0;
  return {
   phase:verified?(m.phase||'learning'):(lastReview?'learning':'new'),
   step:verified?Math.max(0,Number(m.learningStep)||0):0,
   stability,difficulty:verified?Math.max(1,Math.min(10,Number(m.difficulty)||5)):5,
   retrievability:lastReview?Math.pow(this.CONFIG.targetRetention,elapsed/stability):0,
   lastReview,nextReview:Number(p.due??m.nextReview??now),
   correct:Number(p.correct??m.correct??0),incorrect:Number(p.wrong??m.incorrect??0),
   successes:verified?Number(m.successes||0):0,
   crossDaySuccess:verified?Number(m.crossDaySuccess||0):0,
   lastSuccessDay:verified?(m.lastSuccessDay||null):null,
   lastFailure:verified?Number(m.lastFailure||0):0,
   lastResult:m.lastResult||null,
   schedulerVersion:verified?3:0
  };
 },
 mastered(state,ko,now=Date.now()){
  return ['meaning','spell'].every(mode=>{
   const m=this.normalize(state,ko,mode,now);
   return m.schedulerVersion===3&&m.phase==='review'&&
    m.successes>=4&&m.crossDaySuccess>=this.CONFIG.masteryCrossDays&&
    m.stability>=this.CONFIG.masteryDays&&
    m.retrievability>=this.CONFIG.masteryRetention&&
    (!m.lastFailure||m.lastReview-m.lastFailure>=this.DAY);
  });
 },
 review(state,ko,mode,success,now=Date.now(),rating=success?'good':'again'){
  state.progress=state.progress||{};
  const entry=state.progress[ko]||{},old=entry[mode]||{};
  const m=this.normalize(state,ko,mode,now);
  const grade=success&&['hard','good','easy'].includes(rating)?rating:success?'good':'again';
  const lastDay=m.lastSuccessDay,day=this.dayKey(now);
  const crossDay=success&&lastDay&&lastDay!==day?1:0;
  let phase=m.phase,step=m.step,stability=m.stability;
  let difficulty=Math.max(1,Math.min(10,m.difficulty+(grade==='again'?1.2:grade==='hard'?.35:grade==='easy'?-.35:-.1)));
  let successes=m.successes,days=m.crossDaySuccess,intervalMinutes;
  let lastFailure=m.lastFailure;
  if(!success){
   phase='relearning';step=0;stability=Math.max(.04,m.stability*.35);
   successes=0;days=0;lastFailure=now;
   intervalMinutes=this.CONFIG.lapseMinutes[0];
  }else{
   successes++;days+=crossDay;
   if(phase==='new'||phase==='learning'||phase==='relearning'){
    // Short-step success cannot inflate long-term stability.
    const steps=phase==='relearning'?this.CONFIG.lapseMinutes:this.CONFIG.learningMinutes;
    const current=Math.min(step,steps.length-1);
    intervalMinutes=steps[current]*(grade==='hard'?1.5:grade==='easy'?.8:1);
    step++;
    phase=phase==='relearning'?'relearning':'learning';
    if(step>=steps.length){
     phase='review';step=0;
     stability=Math.max(.35,Math.min(1,stability+.30));
     intervalMinutes=24*60;
    }
   }else{
    const elapsed=m.lastReview?Math.max(0,(now-m.lastReview)/this.DAY):0;
    const gain=Math.min(2.5,1+.18*(11-difficulty)/5*(1-m.retrievability+.3));
    const factor=grade==='hard'?.75:grade==='easy'?1.3:1;
    // Only a delayed successful review grows stability meaningfully.
    stability=Math.min(this.CONFIG.maxIntervalDays,Math.max(stability+.05,stability*gain*factor+(elapsed>=.75?.35:0)));
    const desired=stability*Math.log(this.CONFIG.targetRetention)/Math.log(this.CONFIG.targetRetention);
    intervalMinutes=Math.max(60,Math.min(this.CONFIG.maxIntervalDays*1440,desired*1440*(grade==='hard'?.65:grade==='easy'?1.2:1)));
   }
  }
  const nextReview=now+Math.round(intervalMinutes*60000);
  const memory={schedulerVersion:3,phase,learningStep:step,stability,difficulty,
   retrievability:1,interval:intervalMinutes/1440,lastReview:now,nextReview,
   successes,crossDaySuccess:days,lastSuccessDay:success?day:lastDay,
   lastFailure,lastResult:grade,correct:m.correct+(success?1:0),
   incorrect:m.incorrect+(success?0:1),reps:m.correct+m.incorrect+1};
  entry[mode]={...old,memory,due:nextReview,last:now,
   wrong:(old.wrong||0)+(success?0:1),correct:(old.correct||0)+(success?1:0),
   step:success?Math.min(7,(old.step||0)+1):0};
  state.progress[ko]=entry;
  return memory;
 },
 due(state,ko,mode,now=Date.now()){
  const p=state.progress?.[ko]?.[mode];
  if(!p)return true;
  const m=this.normalize(state,ko,mode,now);
  // An old schedule may be days away after just one success: bring it back
  // into consolidation without fabricating historical review events.
  if(m.schedulerVersion!==3)return true;
  return !Number.isFinite(Number(p.due))||Number(p.due)<=now;
 },
 stage(state,ko,now=Date.now()){return window.TOPIK_FIRST_LEARNING.stage(state,ko,now)},
 select(state,words,day,goal,history=[],now=Date.now()){
  const relearn=window.TOPIK_RELEARN?.select(state,words,history,now);
  const recent=history.slice(-this.MIN_GAP),introduced=new Set(day.learned||[]);
  const candidates=[],fresh=[];
  for(const word of words){
   const ko=word[1],stage=this.stage(state,ko,now),p=state.progress?.[ko]||{};
   if(stage==='unseen'){fresh.push({word,type:'show',mode:null,score:0});continue}
   for(const mode of ['meaning','spell']){
    const q=p[mode],first=!!state.lifecycle?.[ko]?.first?.[mode]||!!q?.last;
    const seenAt=state.lifecycle?.[ko]?.seenAt||p.read?.last||0;
    if(!this.due(state,ko,mode,now))continue;
    if(!first&&seenAt&&now-seenAt<3000)continue;
    const m=this.normalize(state,ko,mode,now);
    const overdue=q?.due?Math.max(0,(now-q.due)/this.DAY):0;
    const score=(!first?95:m.phase==='relearning'?145:m.phase==='learning'?120:100)+
     (m.lastResult==='again'?20:0)+Math.min(80,overdue*12)+
     (1-m.retrievability)*30+Math.min(20,(q?.wrong||0)*2);
    candidates.push({word,type:'typing',mode,score});
   }
  }
  let eligible=candidates.filter(c=>!recent.includes(c.word[1]));
  if(!eligible.length)eligible=candidates.filter(c=>c.word[1]!==history.at(-1));
  if(!eligible.length)eligible=candidates;
  eligible.sort((a,b)=>b.score-a.score);
  const due=eligible[0],backlog=candidates.length;
  const freshAllowed=introduced.size<goal&&
   (backlog<this.CONFIG.maxNewWhenDue||this.CONFIG.maxNewWhenBacklogged>0&&backlog<this.CONFIG.maxNewWhenBacklogged);
  const recentSpellings=history.slice(-3);
  const distinct=fresh.filter(c=>!recentSpellings.some(prev=>window.TOPIK_LEXICON?.similar(c.word[1],prev)));
  const nextFresh=(distinct.length?distinct:fresh).find(c=>!recent.includes(c.word[1]))||
    (distinct.length?distinct:fresh)[0];
  if(relearn&&relearn.word[1]!==history.at(-1))return relearn;
  if(due&&(!freshAllowed||history.length%5!==0))return due;
  if(freshAllowed&&nextFresh)return nextFresh;
  return due||relearn||null;
 },
 summary(state,words,day,goal,now=Date.now()){
  let due=0,consolidating=0,mastered=0,firstRecall=0;
  const today=this.dayKey(now);
  for(const word of words){
   const ko=word[1],stage=this.stage(state,ko,now);
   if(stage==='unseen')continue;
   if(stage==='mastered')mastered++;
   if(['learning','consolidating'].includes(stage))consolidating++;
   const first=state.lifecycle?.[ko]?.first;
   if(first?.meaning&&first?.spell&&
     (state.smartAnswerHistory||[]).some(h=>h.ko===ko&&this.dayKey(h.at)===today))firstRecall++;
   for(const mode of ['meaning','spell'])if(this.due(state,ko,mode,now))due++;
  }
  return {due,newCount:(day.learned||[]).length,firstRecall,consolidating,mastered,goal,
   remaining:Math.max(0,goal-(day.learned||[]).length)};
 }
};
