'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const sources=['topik-vocab/app.js','topik-vocab/vocabulary.js',...fs.readdirSync('topik-vocab/data').filter(x=>x.endsWith('.js')).map(x=>'topik-vocab/data/'+x)];
const hangul=/[가-힣]/,quoted=/"((?:\\.|[^"\\])*)"/g,texts=new Set();
for(const source of sources){
 const raw=fs.readFileSync(source,'utf8');let m;
 while((m=quoted.exec(raw))){
  let value;try{value=JSON.parse('"'+m[1]+'"')}catch{continue}
  value=String(value).normalize('NFC').trim();
  if(value&&value.length<=120&&hangul.test(value)&&!/[<>]/.test(value))texts.add(value);
 }
}
assert.ok(texts.size>5000,'full default vocabulary/example inventory must be covered by hosted pronunciation generation');
for(const sample of ['한국어','학교','학교에 가요.'])assert.ok(texts.has(sample),'pronunciation inventory missing '+sample);
const app=fs.readFileSync('topik-vocab/app.js','utf8');
const pronunciation=fs.readFileSync('topik-vocab/pronunciation.js','utf8');
const workflow=fs.readFileSync('.github/workflows/topik-release.yml','utf8');
const builder=fs.readFileSync('topik-vocab/scripts/build-pronunciation-audio.py','utf8');
const online=fs.readFileSync('topik-vocab/scripts/verify-online.cjs','utf8');
const license=fs.readFileSync('topik-vocab/PRONUNCIATION-AUDIO-LICENSE.md','utf8');
assert.match(pronunciation,/source:'hosted'/);
assert.match(pronunciation,/hosted-playback-error/);
assert.match(pronunciation,/voiceschanged/,'browser fallback waits for asynchronously loaded voices');
assert.match(pronunciation,/playbackRate=slow\?SLOW_RATE:NORMAL_RATE/);
assert.match(app,/await koreanSpeech\.play\(s,slow\)/);
assert.doesNotMatch(app,/下载或启用韩语声音|检查设备韩语语音设置/);
assert.match(workflow,/akamotaco\/ppaso-tts-v1/);
assert.match(workflow,/actions\/cache@v4/);
assert.match(workflow,/build-pronunciation-audio\.py/);
assert.doesNotMatch(workflow,/API_KEY|api[-_ ]?key/i,'hosted audio build must not require a public API key');
assert.match(builder,/MODEL_LICENSE="Apache-2\.0"/);
assert.match(builder,/subtype="PCM_16"/);
assert.match(online,/Published pronunciation inventory incomplete/);
assert.match(license,/Apache License 2\.0/);
assert.ok(fs.existsSync('topik-vocab/audio/manifest.js'));
assert.ok(fs.existsSync('topik-vocab/audio/manifest.json'));
console.log('Hosted Korean pronunciation inventory, build, cache, retry and licensing invariants passed:',texts.size,'texts');
