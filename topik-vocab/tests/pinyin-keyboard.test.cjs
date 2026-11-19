const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('topik-vocab/pinyin-keyboard.js','utf8'),ctx);
const K=ctx.window.TOPIK_PINYIN;
for(const [p,w] of Object.entries({zuo:'做',xuesheng:'学生',xuexiao:'学校',xuexi:'学习',gongzuo:'工作',pengyou:'朋友',ni:'你',hao:'好',chi:'吃',fan:'饭',zhidao:'知道'}))assert.ok(K.candidates(p).includes(w),p);
assert.equal(K.candidates('zuo',['做']).at(0),'做');
assert.equal(K.candidates('xuesheng',['学生']).at(0),'学生');
assert.ok(K.candidates('zuo').length>=5);
let answer='',composition='';
for(const key of 'xuesheng'){({answer,composition}=K.update(answer,composition,key))}
assert.equal(composition,'xuesheng');
({answer,composition}=K.select(answer,composition,K.candidates(composition)[0]));
assert.equal(answer,'学生');assert.equal(composition,'');
for(const key of 'hao'){({answer,composition}=K.update(answer,composition,key))}
({answer,composition}=K.select(answer,composition,'好'));
assert.equal(answer,'学生好');
({answer,composition}=K.update(answer,composition,'backspace'));assert.equal(answer,'学生');
({answer,composition}=K.update(answer,composition,'space'));assert.equal(answer,'学生 ');
({answer,composition}=K.update(answer,composition,'clear'));assert.equal(answer,'');
assert.ok(K.render().includes('data-pinyin-key="backspace"'));
const app=fs.readFileSync('topik-vocab/app.js','utf8');
assert.ok(app.includes('useVirtualKeyboard()'));
assert.ok(app.includes('const koreanKeyboard=webKeyboard&&!isMeaning,chineseKeyboard=webKeyboard&&isMeaning'));
assert.ok(app.includes('TOPIK_PINYIN.render()'));
assert.ok(app.includes('updatePinyinDisplay()'));
assert.ok(!app.includes('data-temporary-system'));
assert.ok(app.includes("if(!useVirtualKeyboard()&&!/iPad|iPhone|iPod/.test(navigator.userAgent))i.focus"));
console.log('Pinyin IME word candidates, selection, deletion, clear, bilingual direction isolation passed.');
