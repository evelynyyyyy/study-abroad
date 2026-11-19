'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.argv[2],sha=process.argv[3];
if(!base||!(/^[a-f0-9]{40}$/.test(sha||'')))throw Error('Expected site URL and commit SHA');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url){
 const response=await fetch(url,{signal:AbortSignal.timeout(12000),cache:'no-store',headers:{'Cache-Control':'no-cache','Pragma':'no-cache'}});
 if(!response.ok)throw Error(response.status+' '+url);
 return response;
}
async function verify(){
 const marker=Date.now().toString();
 const manifest=await (await get(new URL('release.json?verify='+marker,base))).json();
 assert.equal(manifest.buildSha,sha,'Published Build SHA differs from expected commit');
 assert.match(manifest.version,/^\d+\.\d+\.\d+$/);
 const html=await (await get(new URL('?verify='+marker,base))).text();
 assert.ok(html.includes('window.TOPIK_RELEASE='),'HTML missing release bootstrap');
 assert.ok(html.includes(sha),'HTML does not match deployed build');
 assert.ok(html.includes('content="'+manifest.version+'"'),'HTML version mismatch');
 for(const asset of manifest.assets){
  assert.ok(html.includes(asset.output),'HTML missing hashed asset '+asset.output);
  const url=new URL(asset.output,base);
  const bytes=Buffer.from(await (await get(url)).arrayBuffer());
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16),asset.hash,'Asset content mismatch '+asset.output);
 }
 console.log('VERIFIED published release',manifest.version,manifest.buildSha,manifest.assetVersion);
}
(async()=>{
 for(let attempt=0;attempt<15;attempt++){
  try{await verify();return}catch(err){console.warn('Online release not yet verified ('+(attempt+1)+'/15): '+err.message);if(attempt===14)throw err;await sleep(10000)}
 }
})().catch(err=>{console.error('DEPLOYMENT UNVERIFIED:',err.message);process.exitCode=1});
