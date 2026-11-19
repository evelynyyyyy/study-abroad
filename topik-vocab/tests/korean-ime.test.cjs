const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={};vm.createContext(ctx);
for(const name of ['korean-ime-engine.js','korean-ime-adapter.js','hangul-keyboard.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),ctx,{filename:name});
const engine=ctx.TOPIK_KOREAN_ENGINE,ime=ctx.TOPIK_KOREAN_IME,kb=ctx.TOPIK_HANGUL;
const words=['한글','학생','학교','먹다','있다','없다','공부하다','읽다','앉다','괜찮다','까','따','빠','싸','짜','과','왜','외','워','웨','위','의','값','닭'];
for(const word of words){const keys=engine.koToEn(word);assert.equal(engine.enToKo(keys),word,word);ime.reset();for(const key of keys)ime.inputKey(key);assert.equal(ime.getText(),word,word);while(ime.getRawKeys()){ime.backspace();assert.equal(ime.getText(),engine.enToKo(ime.getRawKeys()))}assert.equal(ime.getText(),'');for(const key of keys)ime.inputKey(key);assert.equal(ime.getText(),word)}
for(const [keys,text] of [['gksrmf','한글'],['dkssud','안녕'],['ekfrl','달기'],['djqtdj','없어'],['dkswk','안자'],['gksrnr','한국'],['hk','ㅘ'],['nj','ㅝ'],['ml','ㅢ'],['rkqt: 123','값: 123']])assert.equal(engine.enToKo(keys),text,keys);
for(const [jamo,word] of [['ㄱ','까'],['ㄷ','따'],['ㅂ','빠'],['ㅅ','싸'],['ㅈ','짜']]){ime.reset();let x=kb.edit('',0,0,{'ㄱ':'ㄲ','ㄷ':'ㄸ','ㅂ':'ㅃ','ㅅ':'ㅆ','ㅈ':'ㅉ'}[jamo]);x=kb.edit(x.text,x.caret,x.caret,'ㅏ');assert.equal(x.text,word)}
let x={text:'',caret:0};for(const jamo of ['ㅎ','ㅏ','ㄱ','ㅅ','ㅐ','ㅇ'])x=kb.edit(x.text,x.caret,x.caret,jamo);assert.equal(x.text,'학생');for(let i=0;i<6;i++)x=kb.edit(x.text,x.caret,x.caret,'Backspace');assert.equal(x.text,'');x=kb.edit(x.text,x.caret,x.caret,'ㄱ');x=kb.edit(x.text,x.caret,x.caret,'ㅜ');assert.equal(x.text,'구');
console.log('Korean IME acceptance: PASS ('+words.length+' words + carry/shift/delete/punctuation)');
