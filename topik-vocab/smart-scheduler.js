/* Continuous scheduler, FSRS-inspired D/S/R memory model (not official FSRS weights). */
'use strict';
window.TOPIK_SMART={
  DAY:86400000, MIN:60000, MIN_GAP:2, MAX_NEW_PER_DAY:20,
  normalize(state,ko,mode){
    const p=state.progress?.[ko]?.[mode]||{},now=Date.now();
    if(p.memory&&Number.isFinite(p.memory.stability))return p.memory;
    // Preserve old due dates and successful steps; never reset existing learning.
    const elapsed=p.last?Math.max(0,(now-p.last)/this.DAY):0;
    const stability=Math.max(.08,Math.min(365,p.step?Math.pow(2,Math.max(0,p.step-1)):.08));
    return {stability,difficulty:Math.max(1,Math.min(10,5+(p.wrong||0)*.3)),retrievability:Math.pow(.9,elapsed/stability),interval:Math.max(0,(Number(p.due||now)-Number(p.last||now))/this.DAY),lastReview:p.last||0,nextReview:p.due||now,correct:p.correct||0,incorrect:p.wrong||0,reps:(p.correct||0)+(p.wrong||0)};
  },
  review(state,ko,mode,success,now=Date.now()){
    const entry=state.progress[ko]||{},old=entry[mode]||{},m=this.normalize(state,ko,mode);
    const elapsed=m.lastReview?Math.max(0,(now-m.lastReview)/this.DAY):0;
    const R=Math.pow(.9,elapsed/Math.max(.08,m.stability));
    const D=Math.max(1,Math.min(10,m.difficulty+(success?-.18:.75)));
    let S;
    if(success){
      S=m.reps===0?.6:Math.max(.15,m.stability*(1+Math.exp((11-D)/6)*(Math.pow(Math.max(.02,1-R),.55))*.35));
    }else{
      S=Math.max(.08,Math.min(m.stability*.55,.18+Math.pow(D,-.3)*Math.pow(m.stability,.45)*.13));
    }
    // Failed items return after short delay; successful items follow retention target.
    const interval=success?Math.max(.04,Math.min(365,S)):Math.max(2/1440,Math.min(.015,S*.08));
    const nextReview=now+Math.round(interval*this.DAY);
    const memory={stability:S,difficulty:D,retrievability:1,interval,lastReview:now,nextReview,correct:m.correct+(success?1:0),incorrect:m.incorrect+(success?0:1),reps:m.reps+1};
    entry[mode]={...old,memory,due:nextReview,last:now,wrong:(old.wrong||0)+(success?0:1),correct:(old.correct||0)+(success?1:0),step:success?Math.min(7,(old.step||0)+1):0};
    state.progress[ko]=entry;
    return memory;
  },
  due(state,ko,mode,now=Date.now()){
    const p=state.progress?.[ko]?.[mode];return !p||Number(p.due||0)<=now;
  },
  stage(state,ko){
    return window.TOPIK_FIRST_LEARNING.stage(state,ko);
  },
  select(state,words,day,goal,history=[],now=Date.now()){
    const recent=history.slice(-this.MIN_GAP);
    const seenToday=new Set(day.learned||[]);
    const candidates=[];
    for(const w of words){
      const ko=w[1],stage=this.stage(state,ko),p=state.progress[ko]||{};
      if(stage==='unseen'){
        if(seenToday.size<goal)candidates.push({word:w,type:'show',mode:null,score:30});
        continue;
      }
      for(const mode of ['meaning','spell']){
        const q=p[mode],m=q?this.normalize(state,ko,mode):null;
        const first=!!state.lifecycle?.[ko]?.first?.[mode]||!!q?.last;
        const shownAt=state.lifecycle?.[ko]?.seenAt||p.read?.last||0;
        const isDue=!q||q.due<=now;
        if(!isDue)continue;
        // No instant testing after a first reveal. Require two intervening items
        // and a short temporal separation, except for previously shown legacy words.
        if(!first&&shownAt&&now-shownAt<15000)continue;
        let score=!first?95:65;
        if(q?.wrong)score+=Math.min(25,q.wrong*2);
        if(q?.due)score+=Math.min(35,Math.max(0,(now-q.due)/this.DAY)*4);
        if(m)score+=Math.max(0,6-m.stability)*2;
        candidates.push({word:w,type:'typing',mode,score});
      }
    }
    const eligible=candidates.filter(c=>!recent.includes(c.word[1]));
    if(!eligible.length)return null;
    const due=eligible.filter(x=>x.type==='typing').sort((a,b)=>b.score-a.score);
    const fresh=eligible.filter(x=>x.type==='show');
    // Due work takes priority, but new words are interleaved when capacity remains.
    const recentTypes=history.slice(-4).map(x=>typeof x==='string'?x:'');
    const wantNew=fresh.length&&(!due.length||history.length%4===0);
    if(wantNew)return fresh[0];
    return due[0]||fresh[0]||null;
  },
  summary(state,words,day,goal,now=Date.now()){
    let due=0;
    for(const w of words)if(this.stage(state,w[1])!=='unseen')for(const m of ['meaning','spell'])if(this.due(state,w[1],m,now))due++;
    return {due,newCount:(day.learned||[]).length,goal,remaining:Math.max(0,goal-(day.learned||[]).length)};
  }
};