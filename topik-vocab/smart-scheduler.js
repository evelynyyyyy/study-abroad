/* Time-validated spaced repetition, FSRS-inspired (not an official FSRS implementation).
 * Per-direction short steps, stability, difficulty, retrieval and cross-day evidence.
 * All timestamps persisted in the existing topik_lab_v2 progress structure.
 */
'use strict';
window.TOPIK_SMART={
 DAY:86400000, MIN_GAP:2, VERSION:'3.8.3',
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
  // Legacy REVIEW schedules are preserved, but raw answer totals are not proof
  // of the new three-round graduation requirement.
  const wordState=reviewEvidence?'REVIEW':'LEARNING';
  state.lifecycle[ko]={...r,wordState,learningSuccessCount:Number(r.learningSuccessCount)||0,learningFailureCount:Number(r.learningFailureCount)||0,lastLearningSeenAt:Number(r.lastLearningSeenAt||r.seenAt||0),learningByMode:r.learningByMode||{meaning:0,spell:0},learningStreak:Number(r.learningStreak)||0};
  return wordState;
 },
 learningResult(state,ko,mode,success,now=Date.now(),rating='good'){
  const r=state.lifecycle?.[ko];
  if(!r||r.wordState!=='LEARNING'||!['meaning','spell'].includes(mode))return r?.wordState||'NEW';
  const counts=r.learningByMode||(r.learningByMode={meaning:0,spell:0});
  // Durable global event numbers survive reloads and pool switching.
  const serial=state.learningRecallSerial=(Number(state.learningRecallSerial)||0)+1;
  const events=state.learningRecallEvents||(state.learningRecallEvents=[]);
  const proof=r.learningProof||(r.learningProof={round:0,lastSerial:0});
  const lastSerial=Number(proof.lastSerial)||0;
  const between=lastSerial?new Set(events.filter(e=>e.serial>lastSerial&&e.ko!==ko).map(e=>e.ko)).size:0;
  const available=Number(state.learningActiveWindow)||10;
  const required=Math.min(3,Math.max(1,available-1));
  const spacingOk=!lastSerial||between>=required;
  const expected=proof.round===0?'meaning':proof.round===1?'spell':null;
  const orderOk=!expected||mode===expected;
  events.push({serial,ko,mode,success:!!success,at:now});
  if(events.length>150)events.splice(0,events.length-150);
  r.lastLearningSeenAt=now;
  if(success){
   counts[mode]=(Number(counts[mode])||0)+1;
   r.learningSuccessCount=(Number(r.learningSuccessCount)||0)+1;
   if(spacingOk&&orderOk){
    proof.round=Math.min(3,proof.round+1);
    proof.lastSerial=serial;
    proof.directions=(proof.directions||[]).concat(mode).slice(-3);
    r.learningStreak=proof.round;
   }
  }else{
   r.learningFailureCount=(Number(r.learningFailureCount)||0)+1;
   r.learningStreak=0;
   proof.round=0;proof.lastSerial=0;proof.directions=[];
  }
  // Only a meaning -> spell -> spaced third recall without intervening
  // mistakes is valid; a retry after a wrong answer begins at round one.
  if(success&&proof.round===3&&proof.directions[0]==='meaning'&&proof.directions[1]==='spell'&&
     proof.directions.length===3&&!r.graduatedAt){
   r.wordState='REVIEW';r.graduatedAt=now;r.graduationEvidence={...proof,verifiedAt:now};
   state.progress=state.progress||{};const p=state.progress[ko]||(state.progress[ko]={});
   for(const direction of ['meaning','spell']){
    const old=p[direction]||{};
    p[direction]={...old,due:now+this.DAY,last:now,memory:{...(old.memory||{}),schedulerVersion:3,phase:'review',learningStep:0,stability:.35,difficulty:5,lastReview:now,nextReview:now+this.DAY,successes:0,crossDaySuccess:0}};
   }
  }
  return r.wordState;
 },

 session:null,
 resetSession(){this.session={index:0,words:new Map(),freshIntroduced:0};},
 sessionEntry(ko){if(!this.session)this.resetSession();if(!this.session.words.has(ko))this.session.words.set(ko,{count:0,last:-1000,byMode:{meaning:{wins:0,last:-1000},spell:{wins:0,last:-1000}},failed:false,outcome:'correct'});return this.session.words.get(ko)},
 recordExposure(ko,mode,result){const e=this.sessionEntry(ko);const index=this.session.index++;e.count++;e.last=index;e.outcome=result||'correct';if(mode){const m=e.byMode[mode];m.last=index;if(['again','wrong','incorrect','unfamiliar'].includes(result)){m.wins=0;e.failed=true}else if(['correct','good','easy','hard'].includes(result))m.wins++}},
 gapFor(ko,mode){const e=this.sessionEntry(ko);const m=mode?e.byMode[mode]:null;if(['again','wrong','incorrect','unfamiliar'].includes(e.outcome))return 3;if(!m||!m.wins)return 6;if(m.wins===1)return 6;if(m.wins===2)return 18;return 1000},
 sessionEligible(candidate){const e=this.sessionEntry(candidate.word[1]);const cap=candidate.reason==='learning-recall'?Math.max(5,Number(this.session?.freshIntroduced||0)+2):e.failed?6:4;if(e.count>=cap)return false;const elapsed=this.session.index-e.last-1;return elapsed>=(candidate.reason==='learning-recall'?(e.outcome==='wrong'||e.outcome==='again'?3:Math.max(5,this.gapFor(candidate.word[1],candidate.mode))):this.gapFor(candidate.word[1],candidate.mode))},
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
 select(state,words,day,goal,history=[],now=Date.now(),preferredMode=null,pool='learn'){
  const session=this.session||(this.resetSession(),this.session);
  const recent=history.slice(-8),introduced=new Set(day.learned||[]);
  const learning=[],review=[],fresh=[];
  const random=()=>Math.max(0,Math.min(.999999999,Number(this.random?.()??Math.random())));
  const pick=items=>{
   if(!items.length)return null;
   const total=items.reduce((n,c)=>n+c.weight,0);
   let threshold=random()*total;
   for(const c of items){threshold-=c.weight;if(threshold<0)return c.task}
   return items[items.length-1].task;
  };
  for(const word of words){
   const ko=word[1],phase=this.wordState(state,ko);
   if(phase==='NEW'){
    const candidate={word,type:'show',mode:null,reason:'new-introduction'};
    if(pool==='learn'&&introduced.size<goal&&this.sessionEligible(candidate)&&!recent.includes(ko))
     fresh.push({task:candidate,weight:1});
    continue;
   }
   if(phase==='LEARNING'&&pool==='learn'){
    const r=state.lifecycle[ko],counts=r.learningByMode||{},entry=this.sessionEntry(ko);
    if(recent.includes(ko))continue;
    for(const mode of ['meaning','spell']){
     const candidate={word,type:'typing',mode,reason:'learning-recall'};
     if(!this.sessionEligible(candidate))continue;
     const attempts=Number(counts[mode]||0);
     const gap=this.session.index-entry.byMode[mode].last-1;
     const needsDirection=attempts===0?2.5:1;
     const recency=Math.min(2,Math.max(.5,gap/8));
     learning.push({task:candidate,weight:needsDirection*recency/(1+attempts*.6)});
    }
    continue;
   }
   if((phase==='REVIEW'||phase==='RELEARNING')&&pool==='review'){
    for(const mode of ['meaning','spell'])if(this.due(state,ko,mode,now)){
     const candidate={word,type:'typing',mode,reason:phase==='RELEARNING'?'relearning-due':'fsrs-review'};
     if(this.sessionEligible(candidate)&&!recent.includes(ko))
      review.push({task:candidate,weight:1+Math.min(3,Math.max(0,now-Number(state.progress?.[ko]?.[mode]?.due||now))/this.DAY)});
    }
   }
  }
  if(pool==='review')return pick(review);
  const active=words.reduce((n,w)=>n+(this.wordState(state,w[1])==='LEARNING'?1:0),0);
  const capacity=Math.max(8,Math.min(12,10-Math.floor(active/8)));
  const canIntroduce=fresh.length>0&&active<capacity;
  if(canIntroduce&&(!learning.length||session.freshIntroduced===0||session.index%2===0)){
   session.freshIntroduced++;return pick(fresh);
  }
  return pick(learning)||(canIntroduce?(session.freshIntroduced++,pick(fresh)):null);
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
