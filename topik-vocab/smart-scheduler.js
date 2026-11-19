/* Time-validated spaced repetition, FSRS-inspired (not an official FSRS implementation).
 * Per-direction short steps, stability, difficulty, retrieval and cross-day evidence.
 * All timestamps persisted in the existing topik_lab_v2 progress structure.
 */
'use strict';
window.TOPIK_SMART={
 DAY:86400000, MIN_GAP:2, VERSION:'3.7.23',
 // Explicit lifecycle: short-term learning never invokes FSRS; graduated words enter dated review.
 wordState(state,ko){
  state.lifecycle=state.lifecycle||{};
  const r=state.lifecycle[ko]||{};
  if(['NEW','LEARNING','REVIEW','RELEARNING'].includes(r.wordState))return r.wordState;
  const p=state.progress?.[ko]||{};
  const seen=!!(r.seenAt||p.read?.last||p.meaning?.last||p.spell?.last);
  if(!seen)return 'NEW';
  // Preserve old review schedules and historical answers, never erase or re-grade them.
  const reviewEvidence=['meaning','spell'].some(m=>p[m]?.memory?.phase==='review'||Number(p[m]?.memory?.crossDaySuccess)>0);
  const historical=(Number(p.meaning?.correct||0)+Number(p.spell?.correct||0))>=4&&!!p.meaning?.last&&!!p.spell?.last;
  const wordState=reviewEvidence||historical?'REVIEW':'LEARNING';
  state.lifecycle[ko]={...r,wordState,learningSuccessCount:0,learningFailureCount:0,lastLearningSeenAt:Number(r.seenAt||0),learningByMode:{meaning:0,spell:0},learningStreak:0};
  return wordState;
 },
 learningResult(state,ko,mode,success,now=Date.now(),rating='good'){
  const r=state.lifecycle[ko],counts=r.learningByMode||(r.learningByMode={meaning:0,spell:0});
  r.lastLearningSeenAt=now;
  if(success){
   counts[mode]=(counts[mode]||0)+1;r.learningSuccessCount=(r.learningSuccessCount||0)+1;
   r.learningStreak=(r.learningStreak||0)+1;
  }else{
   r.learningFailureCount=(r.learningFailureCount||0)+1;r.learningStreak=0;
  }
  // Dynamic 3-5+ successful retrievals, both directions, with a stable recent streak.
  const threshold=Math.min(6,3+Math.min(3,r.learningFailureCount||0)+(rating==='hard'?1:0));
  if(success&&counts.meaning>=1&&counts.spell>=1&&r.learningSuccessCount>=threshold&&r.learningStreak>=3){
   r.wordState='REVIEW';r.graduatedAt=now;
   state.progress=state.progress||{};const p=state.progress[ko]||(state.progress[ko]={});
   for(const direction of ['meaning','spell']){
    const old=p[direction]||{};
    p[direction]={...old,due:now+this.DAY,last:now,memory:{...(old.memory||{}),schedulerVersion:3,phase:'review',learningStep:0,stability:.35,difficulty:5,lastReview:now,nextReview:now+this.DAY,successes:0,crossDaySuccess:0}};
   }
  }
  return r.wordState;
 },

 session:null,
 resetSession(){this.session={index:0,words:new Map()};},
 sessionEntry(ko){if(!this.session)this.resetSession();if(!this.session.words.has(ko))this.session.words.set(ko,{count:0,last:-1000,byMode:{meaning:{wins:0,last:-1000},spell:{wins:0,last:-1000}},failed:false,outcome:'correct'});return this.session.words.get(ko)},
 recordExposure(ko,mode,result){const e=this.sessionEntry(ko);const index=this.session.index++;e.count++;e.last=index;e.outcome=result||'correct';if(mode){const m=e.byMode[mode];m.last=index;if(['again','wrong','incorrect','unfamiliar'].includes(result)){m.wins=0;e.failed=true}else if(['correct','good','easy','hard'].includes(result))m.wins++}},
 gapFor(ko,mode){const e=this.sessionEntry(ko);const m=mode?e.byMode[mode]:null;if(['again','wrong','incorrect','unfamiliar'].includes(e.outcome))return 3;if(!m||!m.wins)return 6;if(m.wins===1)return 6;if(m.wins===2)return 18;return 1000},
 sessionEligible(candidate){const e=this.sessionEntry(candidate.word[1]);const cap=e.failed?6:4;if(e.count>=cap)return false;const elapsed=this.session.index-e.last-1;return elapsed>=this.gapFor(candidate.word[1],candidate.mode)},
 CONFIG:{
  learningMinutes:[3,15,180],lapseMinutes:[3,15,180],
  targetRetention:.90,masteryRetention:.85,longTermRetention:.80,
  longTermDays:7,masteryDays:21,masteryCrossDays:2,
  maxNewWhenDue:12,maxNewWhenBacklogged:0,
  maxIntervalDays:365, maxComparableRun:4, alternateScoreTolerance:18, firstRecallPriority:138
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
    const desired=stability;
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
 select(state,words,day,goal,history=[],now=Date.now(),preferredMode=null){
  const recent=history.slice(-3),introduced=new Set(day.learned||[]);
  const learning=[],review=[],fresh=[];
  for(const word of words){
   const ko=word[1],phase=this.wordState(state,ko);
   if(phase==='NEW'){if(introduced.size<goal)fresh.push({word,type:'show',mode:null,reason:'new-introduction'});continue}
   if(phase==='LEARNING'){
    const r=state.lifecycle[ko],counts=r.learningByMode||{};
    const mode=(counts.meaning||0)<=(counts.spell||0)?'meaning':'spell';
    const alternate=mode==='meaning'?'spell':'meaning';
    for(const m of [mode,alternate]){
     const candidate={word,type:'typing',mode:m,reason:'learning-recall'};
     if(this.sessionEligible(candidate)&&!recent.includes(ko)){learning.push(candidate);break}
    }
    continue;
   }
   if(phase==='REVIEW'||phase==='RELEARNING'){
    for(const mode of ['meaning','spell'])if(this.due(state,ko,mode,now)){
     const candidate={word,type:'typing',mode,reason:phase==='RELEARNING'?'relearning-due':'fsrs-review'};
     if(this.sessionEligible(candidate))review.push(candidate);
    }
   }
  }
  const byRecent=(a,b)=>recent.indexOf(a.word[1])-recent.indexOf(b.word[1]);
  const nextReview=review.sort((a,b)=>(state.progress?.[a.word[1]]?.[a.mode]?.due||0)-(state.progress?.[b.word[1]]?.[b.mode]?.due||0))[0];
  const nextLearning=learning.sort((a,b)=>(state.lifecycle[a.word[1]]?.lastLearningSeenAt||0)-(state.lifecycle[b.word[1]]?.lastLearningSeenAt||0))[0];
  const nextFresh=fresh.find(c=>!recent.includes(c.word[1])&&this.sessionEligible(c));
  // Separate pools; interleave tasks, never put new words into FSRS before graduation.
  if(nextReview&&this.session.index%3===0)return nextReview;
  if(nextLearning)return nextLearning;
  if(nextFresh)return nextFresh;
  return nextReview||null;
 },
 // Lightweight on-demand diagnostics; no persistent pre-generated direction queue.
 inspect(state,words,now=Date.now()){
  const counts={meaning:0,spell:0},eligible={meaning:0,spell:0},states={};
  for(const w of words){
   const ko=w[1],stage=this.stage(state,ko,now);
   if(stage==='unseen')continue;
   for(const mode of ['meaning','spell']){
    if(this.due(state,ko,mode,now)){
     counts[mode]++;
     const m=this.normalize(state,ko,mode,now);
     if(!states[mode])states[mode]={phase:m.phase,stability:m.stability,due:m.nextReview};
    }
   }
  }
  return {due:counts,queue:counts,states,queueLength:counts.meaning+counts.spell,preGenerated:false};
 },
 summary(state,words,day,goal,now=Date.now()){
  let due=0,consolidating=0,mastered=0,firstRecall=0;
  for(const word of words){
   const ko=word[1],phase=this.wordState(state,ko);
   if(phase==='LEARNING')consolidating++;
   if(phase==='REVIEW'||phase==='RELEARNING'){
    if(this.mastered(state,ko,now))mastered++;
    if(['meaning','spell'].some(mode=>this.due(state,ko,mode,now)))due++;
   }
   const firstAt=Number(state.lifecycle?.[ko]?.firstBothAt||0);
   if(firstAt&&this.dayKey(firstAt)===this.dayKey(now))firstRecall++;
  }
  return {due,newCount:(day.learned||[]).length,firstRecall,consolidating,mastered,goal,remaining:Math.max(0,goal-(day.learned||[]).length)};
 }
};
