/* Korean 2-set Dubeolsik syllable composition. No romanization. */
(function(root){
'use strict';
const L='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const V='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
const T=' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split('');
const consonants='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const vowels='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const compoundV={'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ','ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ'};
const splitV={'ㅘ':['ㅗ','ㅏ'],'ㅙ':['ㅗ','ㅐ'],'ㅚ':['ㅗ','ㅣ'],'ㅝ':['ㅜ','ㅓ'],'ㅞ':['ㅜ','ㅔ'],'ㅟ':['ㅜ','ㅣ'],'ㅢ':['ㅡ','ㅣ']};
const compoundT={'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ'};
const splitT=Object.fromEntries(Object.entries(compoundT).map(([k,v])=>[v,k.split('')]));
const doubles={'ㄱ':'ㄲ','ㄷ':'ㄸ','ㅂ':'ㅃ','ㅅ':'ㅆ','ㅈ':'ㅉ'};
const keys=[
 [['ㅂ','ㅃ'],['ㅈ','ㅉ'],['ㄷ','ㄸ'],['ㄱ','ㄲ'],['ㅅ','ㅆ'],['ㅛ'],['ㅕ'],['ㅑ'],['ㅐ','ㅒ'],['ㅔ','ㅖ']],
 [['ㅁ'],['ㄴ'],['ㅇ'],['ㄹ'],['ㅎ'],['ㅗ'],['ㅓ'],['ㅏ'],['ㅣ']],
 [['ㅋ'],['ㅌ'],['ㅊ'],['ㅍ'],['ㅠ'],['ㅜ'],['ㅡ']]
];
function syllable(l,v,t=''){return String.fromCharCode(0xAC00+(L.indexOf(l)*21+V.indexOf(v))*28+Math.max(0,T.indexOf(t)))}
function parseLast(str){
 const ch=str.at(-1),n=ch?.charCodeAt(0);
 if(n>=0xAC00&&n<=0xD7A3){
  const v=n-0xAC00;return {l:L[Math.floor(v/588)],v:V[Math.floor(v%588/28)],t:T[v%28]===' '?'':T[v%28],prefix:str.slice(0,-1)};
 }
 return null;
}
function append(text,key){
 if(key===' ')return text+' ';
 if(!consonants.includes(key)&&!vowels.includes(key))return text;
 const p=parseLast(text),last=text.at(-1);
 if(!p){
  if(vowels.includes(key)&&consonants.includes(last)&&L.includes(last))return text.slice(0,-1)+syllable(last,key);
  if(vowels.includes(key)&&vowels.includes(last)&&compoundV[last+key])return text.slice(0,-1)+compoundV[last+key];
  return text+key;
 }
 if(vowels.includes(key)){
  if(!p.t){
   if(compoundV[p.v+key])return p.prefix+syllable(p.l,compoundV[p.v+key]);
   return text+key;
  }
  const parts=splitT[p.t],carry=parts?parts[1]:p.t;
  if(!L.includes(carry))return text+key;
  return p.prefix+syllable(p.l,p.v,parts?parts[0]:'')+syllable(carry,key);
 }
 if(!p.t){
  if(T.includes(key))return p.prefix+syllable(p.l,p.v,key);
  return text+key;
 }
 if(compoundT[p.t+key])return p.prefix+syllable(p.l,p.v,compoundT[p.t+key]);
 return text+key;
}
function backspace(text){
 if(!text)return '';
 const p=parseLast(text);
 if(!p)return text.slice(0,-1);
 if(p.t)return p.prefix+syllable(p.l,p.v,splitT[p.t]?.[0]||'');
 if(splitV[p.v])return p.prefix+syllable(p.l,splitV[p.v][0]);
 return p.prefix+p.l;
}
function edit(text,start,end,key){
 text=String(text||'');start=Math.max(0,Math.min(text.length,start));end=Math.max(start,Math.min(text.length,end));
 const left=text.slice(0,start),right=text.slice(end);
 const result=key==='Backspace'?(start===end?backspace(left):left):append(left,key);
 return {text:result+right,caret:result.length};
}
function render(shift=false){return '<div class="hangul-keyboard" role="group" aria-label="韩语两套式网页键盘">'+
 keys.map(row=>'<div class="hangul-row">'+row.map(pair=>'<button type="button" class="hangul-key" data-hangul="'+pair[0]+'"'+(pair[1]?' data-shift="'+pair[1]+'"':'')+'>'+(shift&&pair[1]?pair[1]:pair[0])+'</button>').join('')+'</div>').join('')+
 '<div class="hangul-row"><button type="button" class="hangul-key hangul-control" data-hangul-shift="1" aria-label="Shift" aria-pressed="'+String(shift)+'">⇧</button><button type="button" class="hangul-key hangul-space" data-hangul=" ">空格</button><button type="button" class="hangul-key hangul-control" data-hangul="Backspace">⌫ 删除</button></div></div>'}
function updateShift(container,shift){if(!container)return;container.querySelectorAll('[data-hangul]').forEach(b=>{if(b.dataset.shift)b.textContent=shift?b.dataset.shift:b.dataset.hangul});const b=container.querySelector('[data-hangul-shift]');if(b)b.setAttribute('aria-pressed',String(shift));}
return root.TOPIK_HANGUL={append,backspace,edit,render,updateShift,keys,L,V,T};
})(typeof window!=='undefined'?window:globalThis);
