/* Dubeolsik engine adapted from devslab-kr/kokey (MIT); see KOREAN-IME-LICENSE.md. */
(function(root){'use strict';
const CHO=[...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'],V=[...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'],T=[...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];
const J={ㄱ:'r',ㄲ:'R',ㄴ:'s',ㄷ:'e',ㄸ:'E',ㄹ:'f',ㅁ:'a',ㅂ:'q',ㅃ:'Q',ㅅ:'t',ㅆ:'T',ㅇ:'d',ㅈ:'w',ㅉ:'W',ㅊ:'c',ㅋ:'z',ㅌ:'x',ㅍ:'v',ㅎ:'g',ㅏ:'k',ㅐ:'o',ㅑ:'i',ㅒ:'O',ㅓ:'j',ㅔ:'p',ㅕ:'u',ㅖ:'P',ㅗ:'h',ㅘ:'hk',ㅙ:'ho',ㅚ:'hl',ㅛ:'y',ㅜ:'n',ㅝ:'nj',ㅞ:'np',ㅟ:'nl',ㅠ:'b',ㅡ:'m',ㅢ:'ml',ㅣ:'l',ㄳ:'rt',ㄵ:'sw',ㄶ:'sg',ㄺ:'fr',ㄻ:'fa',ㄼ:'fq',ㄽ:'ft',ㄾ:'fx',ㄿ:'fv',ㅀ:'fg',ㅄ:'qt'};
const K={};for(const [j,k] of Object.entries(J))if(k.length===1)K[k]=j;for(const [k,j] of Object.entries(K))if(k===k.toLowerCase()&&!K[k.toUpperCase()])K[k.toUpperCase()]=j;
const CV={'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ','ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ'};
const CT={'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ'};
const ST=Object.fromEntries(Object.entries(CT).map(([k,v])=>[v,[...k]]));
function enToKo(keys){
 let out='',cho=null,jung=null,jong=null;
 const flush=()=>{if(cho!==null&&jung!==null){out+=String.fromCharCode(0xAC00+(CHO.indexOf(cho)*21+V.indexOf(jung))*28+(jong===null?0:T.indexOf(jong)+1))}else{if(cho!==null)out+=cho;if(jung!==null)out+=jung;if(jong!==null)out+=jong}cho=jung=jong=null};
 for(const ch of keys){const j=K[ch];if(j===undefined){flush();out+=ch;continue}
 if(V.includes(j)){if(jong!==null){let moved=jong;const parts=ST[jong];if(parts){jong=parts[0];moved=parts[1]}else jong=null;flush();cho=moved;jung=j}
 else if(jung!==null){const combined=CV[jung+j];if(combined)jung=combined;else{flush();jung=j}}
 else jung=j}
 else if(jung!==null&&cho!==null&&jong===null){if(T.includes(j))jong=j;else{flush();cho=j}}
 else if(jung!==null&&cho!==null){const combined=CT[jong+j];if(combined)jong=combined;else{flush();cho=j}}
 else{if(cho!==null||jung!==null)flush();cho=j}}
 flush();return out;
}
function koToEn(text){let out='';for(const ch of text){const n=ch.charCodeAt(0);if(n>=0xAC00&&n<=0xD7A3){const idx=n-0xAC00;out+=J[CHO[Math.floor(idx/588)]]+J[V[Math.floor(idx/28)%21]]+(idx%28?J[T[idx%28-1]]:'')}else out+=J[ch]||ch}return out}
root.TOPIK_KOREAN_ENGINE=Object.freeze({enToKo,koToEn,keyForJamo:j=>J[j]||null});
})(typeof window!=='undefined'?window:globalThis);
