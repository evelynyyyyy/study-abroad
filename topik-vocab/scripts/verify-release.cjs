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
console.log('Release manifest and hashed HTML assets verified',release.version,release.buildSha);
