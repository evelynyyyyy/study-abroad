/* Phase 1 lexicon: stable sense IDs and reviewable metadata; no invented attestations. */
'use strict';
(function(){
 const curated=[
  ['눈','眼睛','noun','눈','眼睛'],['눈','雪','noun','눈','雪'],
  ['배','肚子','noun','배','腹部'],['배','船','noun','배','船'],['배','梨','noun','배','水果'],
  ['밤','夜晚','noun','밤','夜间'],['밤','栗子','noun','밤','食物'],
  ['말','话','noun','말','语言'],['말','马','noun','말','动物'],
  ['차','茶','noun','차','饮品'],['차','车','noun','차','交通工具'],
  ['쓰다','写','verb','쓰다','写字'],['쓰다','使用','verb','쓰다','使用'],['쓰다','苦','adjective','쓰다','味道'],
  ['타다','乘坐','verb','타다','乘坐交通工具'],['타다','燃烧','verb','타다','燃烧'],
  ['사과','苹果','noun','사과','水果'],['사과','道歉','noun','사과','致歉']
 ];
 const entries={};for(const [ko,zh,pos,lemma,context] of curated){
  const key=ko.normalize('NFC'),group=entries[key]||(entries[key]=[]);
  group.push({id:'ko:'+Array.from(key).map(c=>c.codePointAt(0).toString(16)).join('-')+':'+group.length,
   lemma,form:key,pos,zh,context,source:'editorial-example',review:'needs-human-review',
   aliases:[],pronunciation:null,example:null,collocations:[],levelEvidence:null});
 }
 const forms={
  '먹다':[{form:'먹어요',grammar:'해요体·现在',irregular:false},{form:'먹었어요',grammar:'해요体·过去',irregular:false}],
  '가다':[{form:'가요',grammar:'해요体·现在',irregular:false},{form:'갔어요',grammar:'해요体·过去',irregular:false}],
  '오다':[{form:'와요',grammar:'해요体·现在',irregular:false},{form:'왔어요',grammar:'해요体·过去',irregular:false}],
  '하다':[{form:'해요',grammar:'해요体·现在',irregular:false},{form:'했어요',grammar:'해요体·过去',irregular:false}],
  '듣다':[{form:'들어요',grammar:'ㄷ不规则·现在',irregular:true}],
  '걷다':[{form:'걸어요',grammar:'ㄷ不规则·现在',irregular:true}],
  '돕다':[{form:'도와요',grammar:'ㅂ不规则·现在',irregular:true}],
  '춥다':[{form:'추워요',grammar:'ㅂ不规则·现在',irregular:true}],
  '모르다':[{form:'몰라요',grammar:'르不规则·现在',irregular:true}],
  '읽다':[{form:'읽어요',grammar:'해요体·现在',irregular:false}],
  '좋다':[{form:'좋아요',grammar:'해요体·现在',irregular:false}]
 };
 const reverse={};for(const [lemma,items] of Object.entries(forms))for(const item of items){
  (reverse[item.form]||(reverse[item.form]=[])).push({lemma,...item});
 }
 const normalized=x=>String(x||'').normalize('NFC').trim().replace(/\s+/g,'');
 const sameMeaning=(a,b)=>normalized(a)===normalized(b);
 function metadata(ko,zh){
  const list=entries[ko]||[];
  const match=list.find(x=>sameMeaning(x.zh,zh));
  return match||{id:'ko:'+Array.from(ko).map(c=>c.codePointAt(0).toString(16)).join('-')+':legacy',
   lemma:ko,form:ko,pos:null,zh,source:'legacy-import',review:'needs-human-review',ambiguous:list.length>1,
   pronunciation:null,example:null,collocations:[],levelEvidence:null};
 }
 function acceptedSpell(input,word,words){
  const typed=normalized(input),ko=word[1],zh=word[2];
  if(typed===normalized(ko))return true;
  // Never automatically accept homographs or similarly-spelled words.
  // Multiple Korean answers are allowed only for a Chinese prompt with an identical
  // unambiguous normalized meaning; avoid broad substring matching.
  const matches=words.filter(w=>sameMeaning(w[2],zh));
  return matches.length>1&&matches.some(w=>normalized(w[1])===typed);
 }
 function hint(word,words){
  const matches=words.filter(w=>sameMeaning(w[2],word[2]));
  const m=metadata(word[1],word[2]);
  return matches.length>1?('同义答案可接受'+(m.pos?' · '+m.pos:'')+(m.context?' · '+m.context:'')):(m.context||'');
 }
 function confusion(state,expected,typed,words,mode){
  if(mode!=='spell')return false;
  const input=normalized(typed);
  if(!input||input===normalized(expected))return false;
  const match=words.find(w=>normalized(w[1])===input);
  if(!match)return false;
  state.confusions=state.confusions||{};
  const key=[expected,match[1]].sort().join('⇄');
  const record=state.confusions[key]||{words:[expected,match[1]].sort(),count:0};
  record.count++;record.lastAt=Date.now();state.confusions[key]=record;return true;
 }
 function similar(a,b){
  if(a===b)return false;
  const x=Array.from(a),y=Array.from(b);
  if(Math.abs(x.length-y.length)>1)return false;
  let previous=Array(y.length+1).fill(0).map((_,i)=>i);
  for(let i=1;i<=x.length;i++){const row=[i];for(let j=1;j<=y.length;j++)row[j]=Math.min(row[j-1]+1,previous[j]+1,previous[j-1]+(x[i-1]===y[j-1]?0:1));previous=row}
  return previous[y.length]===1&&Math.min(x.length,y.length)>=2;
 }
 window.TOPIK_LEXICON={entries,forms,reverse,metadata,acceptedSpell,hint,confusion,similar};
})();
