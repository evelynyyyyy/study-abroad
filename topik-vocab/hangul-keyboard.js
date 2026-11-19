/* Korean 2-set Dubeolsik syllable composition. No romanization. */
(function(root){
'use strict';
const symbolRows={numbers:[['1','2','3','4','5','6','7','8','9','0'],['@','#','₩','%','&','-','+','(',')'],['.',',','?','!',';',':','/','\"']],extra:[['[',']','{','}','#','%','^','*','+','='],['_','-','/','\\\\','|','~','<','>','@'],['&','…','—','\"','\'','?','!']]};
const keys=[
 [['ㅂ','ㅃ'],['ㅈ','ㅉ'],['ㄷ','ㄸ'],['ㄱ','ㄲ'],['ㅅ','ㅆ'],['ㅛ'],['ㅕ'],['ㅑ'],['ㅐ','ㅒ'],['ㅔ','ㅖ']],
 [['ㅁ'],['ㄴ'],['ㅇ'],['ㄹ'],['ㅎ'],['ㅗ'],['ㅓ'],['ㅏ'],['ㅣ']],
 [['ㅋ'],['ㅌ'],['ㅊ'],['ㅍ'],['ㅠ'],['ㅜ'],['ㅡ']]
];
function edit(text,start,end,key,shift=false){
 const mapped=key==='Backspace'||key===' '?key:root.TOPIK_KOREAN_ENGINE.keyForJamo(shift?({'ㄱ':'ㄲ','ㄷ':'ㄸ','ㅂ':'ㅃ','ㅅ':'ㅆ','ㅈ':'ㅉ','ㅐ':'ㅒ','ㅔ':'ㅖ'}[key]||key):key);
 return root.TOPIK_KOREAN_IME.edit(text,start,end,mapped||key);
}
function append(text,key){return edit(text,String(text).length,String(text).length,key).text}
function backspace(text){return edit(text,String(text).length,String(text).length,'Backspace').text}
function render(shift=false){
 const key=(pair)=>'<button type="button" class="hangul-key" data-hangul="'+pair[0]+'"'+(pair[1]?' data-shift="'+pair[1]+'"':'')+'>'+(shift&&pair[1]?pair[1]:pair[0])+'</button>';
 const row=(pairs,extra='')=>'<div class="hangul-row '+extra+'">'+pairs.map(key).join('')+'</div>';
 return '<div class="hangul-keyboard ios-keyboard" role="group" aria-label="韩语两套式网页键盘">'+
 '<div data-hangul-panel="letters">'+row(keys[0],'ios-row-first')+row(keys[1],'ios-row-second')+
 '<div class="hangul-row ios-row-third">'+
 '<button type="button" class="hangul-key hangul-control ios-special ios-shift" data-hangul-shift="1" aria-label="Shift" aria-pressed="'+String(shift)+'"><span aria-hidden="true">'+(shift?'⬆':'⇧')+'</span></button>'+
 keys[2].map(key).join('')+
 '<button type="button" class="hangul-key hangul-control ios-special ios-delete" data-hangul="Backspace" aria-label="删除">⌫</button></div></div>'+
 Object.entries(symbolRows).map(([mode,rows])=>'<div class="hangul-symbols" data-hangul-panel="'+mode+'" hidden>'+rows.map((symbols,i)=>'<div class="hangul-row ios-row-'+(i===0?'first':i===1?'second':'third')+'">'+symbols.map(ch=>'<button type="button" class="hangul-key" data-hangul-symbol="'+encodeURIComponent(ch)+'">'+ch.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</button>').join('')+'</div>').join('')+'</div>').join('')+
 '<div class="hangul-row ios-row-bottom"><button type="button" class="hangul-key hangul-control ios-special" data-hangul-mode="numbers">123</button><button type="button" class="hangul-key hangul-control ios-special" data-hangul-more="extra" hidden>#+=</button><button type="button" class="hangul-key hangul-space ios-space" data-hangul=" " aria-label="空格"> </button><button type="button" class="hangul-key ios-return" data-smart-submit="1" aria-label="完成输入">↵</button></div></div>';
}
function setMode(container,mode){if(!container)return;container.querySelectorAll('[data-hangul-panel]').forEach(p=>p.hidden=p.dataset.hangulPanel!==mode);const toggle=container.querySelector('[data-hangul-mode]'),extra=container.querySelector('[data-hangul-more]');if(toggle){toggle.textContent=mode==='letters'?'123':'ABC';toggle.dataset.hangulMode=mode==='letters'?'numbers':'letters'}if(extra){extra.hidden=mode==='letters';extra.textContent=mode==='extra'?'123':'#+=';extra.dataset.hangulMore=mode==='extra'?'numbers':'extra'}}
function updateShift(container,shift){if(!container)return;container.querySelectorAll('[data-hangul]').forEach(b=>{if(b.dataset.shift)b.textContent=shift?b.dataset.shift:b.dataset.hangul});const b=container.querySelector('[data-hangul-shift]');if(b){b.setAttribute('aria-pressed',String(shift));const glyph=b.querySelector('span');if(glyph)glyph.textContent=shift?'⬆':'⇧';}}
return root.TOPIK_HANGUL={append,backspace,edit,render,updateShift,setMode,keys};
})(typeof window!=='undefined'?window:globalThis);
