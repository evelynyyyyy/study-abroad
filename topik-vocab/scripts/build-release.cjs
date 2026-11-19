'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||'.'),app=path.join(root,'topik-vocab');
const source=JSON.parse(fs.readFileSync(path.join(app,'release-source.json'),'utf8'));
const version=source.version,sha=process.env.GITHUB_SHA||process.env.TOPIK_BUILD_SHA;
if(!/^\d+\.\d+\.\d+$/.test(version)||!(/^[a-f0-9]{40}$/.test(sha||'')))throw Error('Valid release version and 40-character commit SHA required');
const htmlPath=path.join(app,'index.html');
let html=fs.readFileSync(htmlPath,'utf8');
const assets=[],assetRegex=/(src|href)="(\.\/[^"?]+\.(?:js|css))(?:\?[^"]*)?"/g;
html=html.replace(assetRegex,(whole,attr,rel)=>{
 const sourcePath=path.resolve(app,rel);
 if(!sourcePath.startsWith(app+path.sep)||!fs.existsSync(sourcePath))throw Error('Missing asset '+rel);
 const bytes=fs.readFileSync(sourcePath),hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16);
 const ext=path.extname(sourcePath),target=sourcePath.slice(0,-ext.length)+'.'+hash+ext;
 fs.copyFileSync(sourcePath,target);
 const newRel=rel.slice(0,-ext.length)+'.'+hash+ext;
 assets.push({source:rel,output:newRel,hash});
 return attr+'="'+newRel+'"';
});
if(!assets.some(a=>a.source==='./app.js')||!assets.some(a=>a.source==='./styles.css')||!assets.some(a=>a.source==='./release-client.js'))throw Error('Required assets missing');
const assetVersion=crypto.createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0,16);
const release={version,buildSha:sha,buildTime:new Date().toISOString(),assetVersion,assets};
html=html.replace(/(<meta name="topik-version" content=")[^"]+(")/,'$1'+version+'$2')
 .replace(/(<meta name="topik-app-version" content=")[^"]+(")/,'$1'+version+'$2')
 .replace(/<title>TOPIK单词 · v[^<]+<\/title>/,'<title>TOPIK单词 · v'+version+'</title>');
html=html.replace('<script src="./release-client.', '<script src="./release-client.'); // Keep hashed client reference.
const boot='<script>window.TOPIK_RELEASE='+JSON.stringify({version,buildSha:sha,buildTime:release.buildTime,assetVersion}).replace(/</g,'\\u003c')+';<\/script>';
html=html.replace('<script src="./release-client.',boot+'<script src="./release-client.');
fs.writeFileSync(htmlPath,html);
fs.writeFileSync(path.join(app,'release.json'),JSON.stringify(release,null,2)+'\n');
console.log('Built '+version+' '+sha+' '+assetVersion+' ('+assets.length+' assets)');
