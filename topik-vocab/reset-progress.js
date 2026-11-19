/* Scoped, non-destructive vocabulary progress reset. No browser storage clear(). */
(function(root){
'use strict';
const KEYS=['progress','lifecycle','relearn'];
function reset(state,words,level){
 if(!Number.isInteger(level)&&level!=='all')throw Error('Invalid reset scope');
 if(level!=='all'&&(level<1||level>6))throw Error('Invalid TOPIK level');
 const targets=new Set(words.filter(w=>level==='all'||Number(w[0])===level).map(w=>w[1]));
 const protectedWords=new Set(level==='all'?[]:words.filter(w=>Number(w[0])!==level).map(w=>w[1]));
 const removed=new Set([...targets].filter(ko=>!protectedWords.has(ko)));
 // Shared spellings use one storage key; preserve them for the other TOPIK levels.
 for(const key of KEYS){if(!state[key]||typeof state[key]!=='object')state[key]={};for(const ko of removed)delete state[key][ko]}
 if(level==='all'){
  state.daily={};state.smartHistory=[];state.smartAnswerHistory=[];
 }else{
  for(const d of Object.values(state.daily||{})){
   if(Array.isArray(d.learned))d.learned=d.learned.filter(ko=>!removed.has(ko));
   // Aggregate daily review counters cannot be reliably separated by level.
   // Preserve their legacy value; derive level-specific counters from answer history.
  }
  state.smartHistory=(state.smartHistory||[]).filter(ko=>!removed.has(ko));
  state.smartAnswerHistory=(state.smartAnswerHistory||[]).filter(h=>!removed.has(h.ko));
 }
 // Prevent old topik_records data from restoring reset words on refresh.
 state.legacyMigrated=true;
 return {removed:removed.size,shared:targets.size-removed.size};
}
function validateBackup(data){
 if(!data||data.version!==2||!data.state||typeof data.state!=='object'||Array.isArray(data.state))throw Error('备份格式不正确');
 const s=data.state;
 for(const key of ['progress','lifecycle','daily','relearn']){
  if(s[key]!==undefined&&(s[key]===null||typeof s[key]!=='object'||Array.isArray(s[key])))throw Error(key+' 格式不正确');
 }
 if(!s.progress||!Array.isArray(s.extra))throw Error('备份缺少学习进度或自定义词库');
 for(const key of ['favorites','extra','smartHistory','smartAnswerHistory'])if(s[key]!==undefined&&!Array.isArray(s[key]))throw Error(key+' 格式不正确');
 if(s.dailyGoal!==undefined&&(!Number.isFinite(Number(s.dailyGoal))||Number(s.dailyGoal)<0||Number(s.dailyGoal)>200))throw Error('每日目标无效');
 return true;
}
root.TOPIK_RESET={reset,validateBackup};
})(typeof window!=='undefined'?window:globalThis);
