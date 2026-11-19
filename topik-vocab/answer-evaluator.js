/* Unified answer evaluation. No scheduler, IME or progress dependencies. */
(function(root){'use strict';
const aliases={'되다':{'到时间':['到','时间到了'],'成为':['变成']},'집':{'住所':['住处']}};
const variants={'爲':'为','為':'为','學':'学','習':'习','時':'时','間':'间','變':'变','處':'处','書':'书','國':'国','語':'语','門':'门','開':'开','後':'后','來':'来','對':'对','說':'说','發':'发','現':'现','個':'个','這':'这','會':'会','與':'与','無':'无','長':'长','東':'东','愛':'爱','電':'电','車':'车','點':'点','頭':'头','過':'过','見':'见','還':'还','給':'给','體':'体','樣':'样','實':'实','從':'从','問':'问','題':'题','記':'记','讀':'读','寫':'写','聽':'听','買':'买','賣':'卖','飯':'饭','飲':'饮','錢':'钱','歲':'岁','號':'号','萬':'万','兩':'两','幾':'几','讓':'让','應':'应','該':'该','處':'处'};
const separators=/[,，、;；/|｜·]+|\s+(?:或者|或)\s+/u;
function normalizeChineseAnswer(value){
 let s=String(value??'').normalize('NFKC').normalize('NFC').trim().toLowerCase();
 s=[...s].map(ch=>variants[ch]||ch).join('');
 return s.replace(/(?:\.{3,}|…)+/g,'').replace(/[\u200b-\u200d\ufeff]/g,'').replace(/[\s\u3000]+/g,'').replace(/[（(【\[〔「『]/g,'').replace(/[）)】\]〕」』]/g,'').replace(/[，,。.;；:：!?！？、]/g,'').replace(/[—–－~～]/g,'').trim();
}
function splitMeanings(value){
 return String(value??'').normalize('NFKC').replace(/(?:\.{3,}|…)+/g,'').split(separators).map(x=>x.trim()).filter(Boolean);
}
function canonicalForms(value){
 const raw=String(value).trim(),out=new Set([normalizeChineseAnswer(raw)]);
 // Parenthesized lexicographic qualifiers can be omitted, never blindly omit arbitrary text.
 out.add(normalizeChineseAnswer(raw.replace(/[（(【\[][^）)】\]]+[）)】\]]/g,'')));
 out.add(normalizeChineseAnswer(raw.replace(/[（(【\[]([^）)】\]]+)[）)】\]]/g,'$1')));
 for(const prefix of [/^（[^）]+）/u,/^\([^)]*\)/u,/^(?:表示|指|用于|意为|意思是)[：:\s]*/u])out.add(normalizeChineseAnswer(raw.replace(prefix,'')));
 out.delete('');return [...out];
}
function senses(word){
 const display=String(Array.isArray(word)?word[2]:word?.displayMeaning??word?.translation??'');
 const korean=String(Array.isArray(word)?word[1]:word?.ko??'');
 const structured=Array.isArray(word?.meanings)?word.meanings:null;
 const entries=structured||splitMeanings(display).map(canonical=>({canonical,accepted:[]}));
 return entries.map(entry=>{const canonical=typeof entry==='string'?entry:entry.canonical;
 const accepted=typeof entry==='string'?[]:entry.accepted||[];
 const forms=canonicalForms(canonical);
 const special=aliases[korean]||{};
 for(const [key,extra] of Object.entries(special))if(canonicalForms(key).some(x=>forms.includes(x)))accepted.push(...extra);
 return {canonical,forms,accepted:[...new Set(accepted.flatMap(canonicalForms))]};}).filter(x=>x.forms.length);
}
function evaluateAnswer({direction,userAnswer,word}){
 const spell=direction==='spell'||direction==='zh-ko'||direction==='中文→韩语';
 const expected=String(Array.isArray(word)?word[1]:word?.ko??'');
 if(spell){const normalized=String(userAnswer??'').normalize('NFC').trim().replace(/\s+/g,' ');const target=expected.normalize('NFC').trim().replace(/\s+/g,' ');return {status:normalized===target?'correct':'incorrect',matchedMeaning:normalized===target?expected:null,normalizedAnswer:normalized,canonicalAnswer:expected,reason:normalized===target?'exact-spelling':'spelling-mismatch',other:[]};}
 const all=senses(word),parts=splitMeanings(userAnswer),items=parts.length?parts:[String(userAnswer??'')],normalized=items.map(normalizeChineseAnswer).filter(Boolean);
 let matched=null,alias=false;
 for(const item of normalized){for(const sense of all){if(sense.forms.includes(item)){matched=sense;break}if(sense.accepted.includes(item)){matched=sense;alias=true;break}}if(matched)break}
 const status=matched?(alias?'acceptable':'correct'):'incorrect';
 const result={status,matchedMeaning:matched?.canonical||null,normalizedAnswer:normalized.join('、'),canonicalAnswer:all.map(x=>x.canonical).join('、'),reason:matched?(alias?'curated-alias':'canonical-sense'):'no-matching-sense',other:matched?all.filter(x=>x!==matched).map(x=>x.canonical):[]};
 if(root.TOPIK_ANSWER_DEBUG&&root.console)root.console.debug('[AnswerEvaluator]',{userAnswer,normalizedAnswer:result.normalizedAnswer,acceptedAnswers:all,matchedMeaning:result.matchedMeaning,result:status,reason:result.reason});
 return result;
}
root.TOPIK_ANSWER_EVALUATOR=Object.freeze({normalizeChineseAnswer,splitMeanings,senses,evaluateAnswer});
})(typeof window!=='undefined'?window:globalThis);
