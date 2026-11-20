'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const app=path.resolve(process.argv[2]||'topik-vocab');
const release=JSON.parse(fs.readFileSync(path.join(app,'release.json')));
const html=fs.readFileSync(path.join(app,'index.html'),'utf8');
assert.match(release.buildSha,/^[a-f0-9]{40}$/);
assert.ok(html.includes('window.TOPIK_RELEASE='));
assert.ok(html.includes('content="'+release.version+'"'));
for(const asset of release.assets){
 assert.ok(html.includes(asset.output),'HTML missing '+asset.output);
 const file=path.join(app,asset.output.replace(/^\.\//,''));
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,16),asset.hash);
}
assert.ok(release.assets.length>15);
const pronunciation=JSON.parse(fs.readFileSync(path.join(app,'audio','manifest.json'),'utf8'));
assert.equal(pronunciation.schemaVersion,1);
assert.equal(pronunciation.source?.model,'akamotaco/ppaso-tts-v1');
assert.equal(pronunciation.source?.license,'Apache-2.0');
assert.ok(pronunciation.clipCount>5000,'release must contain full Korean pronunciation inventory');
for(const text of ['한국어','학교','학교에 가요.']){
 const clip=pronunciation.clips[text];assert.ok(clip,'missing pronunciation '+text);
 const file=path.join(app,clip.file.replace(/^\.\//,''));
 const bytes=fs.readFileSync(file);
 assert.ok(bytes.length>1000,'audio clip too small '+text);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.sha256,'audio hash mismatch '+text);
}
console.log('Release manifest and hashed HTML assets verified',release.version,release.buildSha);
