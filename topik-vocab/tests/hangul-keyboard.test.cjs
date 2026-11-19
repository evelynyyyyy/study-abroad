const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};vm.runInNewContext(fs.readFileSync('topik-vocab/hangul-keyboard.js','utf8'),c);
const K=c.window.TOPIK_HANGUL;
function type(keys){return keys.reduce((s,k)=>K.append(s,k),'')}
assert.equal(type(['ㅎ','ㅏ','ㄱ','ㅅ','ㅐ','ㅇ']),'학생');
assert.equal(type(['ㅁ','ㅓ','ㄱ','ㅇ','ㅓ','ㅇ','ㅛ']),'먹어요');
assert.equal(type(['ㅁ','ㅓ','ㄱ','ㅇ','ㅓ','ㅆ','ㅇ','ㅓ','ㅇ','ㅛ']),'먹었어요');
assert.equal(type(['ㄱ','ㅗ','ㅏ']),'과');
assert.equal(type(['ㄱ','ㅗ','ㅏ','ㄴ']),'관');
assert.equal(type(['ㄱ','ㅗ','ㅏ','ㄴ','ㅏ']),'과나');
assert.equal(type(['ㄱ','ㅏ','ㅂ','ㅅ']),'값');
assert.equal(type(['ㄱ','ㅏ','ㅂ','ㅅ','ㅣ']),'갑시');
assert.equal(type(['ㄲ','ㅏ']),'까');
assert.equal(K.backspace('값'),'갑');
assert.equal(K.backspace('갑'),'가');
assert.equal(K.backspace('과'),'고');
assert.equal(K.backspace('고'),'ㄱ');
assert.equal(K.edit('학교',1,1,'ㅏ').text,'하가교');
assert.equal(K.edit('학교',0,1,'ㄱ').text,'ㄱ교');
assert.equal(K.edit('학교',2,2,'Backspace').text,'학ㄱ');
assert.ok(K.render().includes('data-hangul="Backspace"'));
const app=fs.readFileSync('topik-vocab/app.js','utf8'),html=fs.readFileSync('topik-vocab/index.html','utf8');
for(const m of ['input-method','TOPIK_HANGUL.edit','inputmode=','compositionstart','compositionend'])assert.ok(app.includes(m),m);
assert.ok(html.includes('hangul-keyboard.js?v=3.7.0'));
assert.ok(html.includes('name="topik-app-version" content="3.7.0"'));
assert.ok(html.includes('app.js?v=3.7.0'));
assert.ok(app.includes('版本 v3.7.0 · simple-ime 中文输入引擎'));
assert.ok(app.includes('<h3>学习安排</h3>')&&app.includes('<h3>输入方式</h3>')&&app.includes('<h3>显示偏好</h3>'));
assert.ok(app.indexOf('<h3>学习安排</h3>')<app.indexOf('<h3>输入方式</h3>')&&app.indexOf('<h3>输入方式</h3>')<app.indexOf('<h3>显示偏好</h3>'));
for(const mode of ['system','bilingual'])assert.ok(app.includes('<option value="'+mode+'"'));
assert.ok(app.includes("state.inputMethod=e.target.value;persist();render()"));
assert.ok(app.includes("state.inputMethod=state.inputMethod==='system'?'system':'bilingual'"));
assert.ok(app.includes('TOPIK_PINYIN.render()')&&app.includes('TOPIK_HANGUL.render(hangulShift)'));
console.log('Hangul Dubeolsik syllables, compound vowels/finals, deletion, caret edit and UI hooks passed.');

assert.ok(app.includes("state.inputMethod=state.inputMethod==='system'?'system':'bilingual'"));
assert.ok(app.includes('const koreanKeyboard=webKeyboard&&!isMeaning,chineseKeyboard=webKeyboard&&isMeaning'));
assert.ok(app.includes("webKeyboard||didCheck?'readonly'"));
assert.ok(app.includes('TOPIK_PINYIN.render()'));
assert.ok(app.includes('TOPIK_HANGUL.render(hangulShift)'));
assert.ok(!app.includes('data-temporary-system'));
assert.ok(html.includes('pinyin-keyboard.js?v=3.7.0'));
console.log('Virtual keyboard is readonly and direction-derived.');

for(const [plain,shifted] of Object.entries({'ㅂ':'ㅃ','ㅈ':'ㅉ','ㄷ':'ㄸ','ㄱ':'ㄲ','ㅅ':'ㅆ','ㅐ':'ㅒ','ㅔ':'ㅖ'})){assert.ok(K.render(false).includes('>'+plain+'</button>'));assert.ok(K.render(true).includes('>'+shifted+'</button>'))}
assert.ok(K.render(true).includes('aria-pressed="true"'));assert.ok(K.render(false).includes('aria-pressed="false"'));assert.ok(!K.render().includes('双辅音'));
for(const [keys,expected] of [[['ㄲ','ㅏ'],'까'],[['ㄸ','ㅏ'],'따'],[['ㅃ','ㅏ'],'빠'],[['ㅆ','ㅏ'],'싸'],[['ㅉ','ㅏ'],'짜'],[['ㅎ','ㅏ','ㄱ'],'학'],[['ㅁ','ㅓ','ㄱ'],'먹'],[['ㄱ','ㅗ','ㅏ'],'과'],[['ㄱ','ㅜ','ㅓ'],'궈'],[['ㄱ','ㅡ','ㅣ'],'긔']])assert.equal(type(keys),expected);
assert.ok(app.includes('TOPIK_HANGUL.updateShift'));

const keyboardCSS=fs.readFileSync('topik-vocab/styles.css','utf8');
const pinyinUI=fs.readFileSync('topik-vocab/pinyin-keyboard.js','utf8');
for(const selector of ['--ios-keyboard-bg','--ios-key-bg','--ios-special-key-bg','--ios-special-key-active','--ios-candidate-text','.ios-row-second','.ios-row-third','.ios-row-bottom','.ios-candidate-strip'])assert.ok(keyboardCSS.includes(selector),selector);
for(const label of ['ios-row-third','ios-row-bottom','ios-shift','ios-delete','ios-space','ios-return'])assert.ok(K.render().includes(label),label);
for(const label of ['ios-row-third','ios-row-bottom','ios-delete','ios-space','ios-return','ios-candidate-strip'])assert.ok(pinyinUI.includes(label),label);
assert.ok(K.render().includes('data-smart-submit="1"'));
assert.ok(!K.render().includes('⌫ 删除'));
assert.ok(!K.render().includes('>空格</button>'));
assert.ok(pinyinUI.includes('data-pinyin-shift="1"')&&pinyinUI.includes('data-pinyin-key="backspace"'));
