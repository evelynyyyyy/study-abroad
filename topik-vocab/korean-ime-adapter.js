/* Korean IME adapter: QWERTY key buffer, no Hangul composition rules in the keyboard view. */
(function(root){'use strict';
const engine=root.TOPIK_KOREAN_ENGINE;
if(!engine)throw Error('Korean IME engine must load before adapter');
let rawKeys='',lastText='',lastCaret=0;
function reset(){rawKeys='';lastText='';lastCaret=0}
function getRawKeys(){return rawKeys}
function getText(){return engine.enToKo(rawKeys)}
function inputKey(key){rawKeys+=key;return getText()}
function backspace(){rawKeys=rawKeys.slice(0,-1);return getText()}
function space(){return inputKey(' ')}
function edit(text,start,end,key){
 text=String(text||'');start=Math.max(0,Math.min(text.length,start));end=Math.max(start,Math.min(text.length,end));
 const left=text.slice(0,start),right=text.slice(end);
 // Reuse the actual keystroke stream at the same caret, including after deletion.
 rawKeys=(text===lastText&&start===lastCaret&&end===start)?rawKeys:engine.koToEn(left);
 if(key==='Backspace')backspace();
 else if(key===' ')space();
 else inputKey(key);
 const composed=getText();lastText=composed+right;lastCaret=composed.length;
 return {text:lastText,caret:lastCaret};
}
root.TOPIK_KOREAN_IME=Object.freeze({reset,inputKey,backspace,space,getRawKeys,getText,edit});
})(typeof window!=='undefined'?window:globalThis);
