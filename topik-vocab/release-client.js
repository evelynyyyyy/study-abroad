/* Release metadata comes from the deployed artifact, never GitHub branch HEAD. */
(function(){
 'use strict';
 const release=window.TOPIK_RELEASE||{version:document.querySelector('meta[name="topik-version"]')?.content||'unknown',buildSha:'unverified',buildTime:'',assetVersion:'unverified'};
 window.TOPIK_APP_VERSION=release.version;
 window.TOPIK_BUILD=release.buildSha;
 window.TOPIK_ASSET_VERSION=release.assetVersion;
 let checking=false,lastCheck=0,pending=null;
 const bannerId='topik-release-notice';
 function showUpdate(next){
  pending=next;
  let banner=document.getElementById(bannerId);
  if(!banner){
   banner=document.createElement('div');banner.id=bannerId;banner.setAttribute('role','status');
   banner.className='topik-release-notice';
   const label=document.createElement('span');label.id='topik-release-label';
   const button=document.createElement('button');button.type='button';button.textContent='立即更新';
   button.onclick=()=>{
    if(!pending)return;
    try{window.TOPIK_SAVE_SESSION?.()}catch(_){}
    try{
     const pool=window.TOPIK_ACTIVE_SMART_POOL?.();
     if(pool)sessionStorage.setItem('topik:resume-after-update',pool);
    }catch(_){}
    const url=new URL(location.href);url.searchParams.set('release',pending.buildSha);
    location.replace(url.href);
   };
   banner.append(label,button);document.body.append(banner);
  }
  banner.querySelector('#topik-release-label').textContent='发现新版本 v'+next.version;
 }
 async function check(force=false){
  if(checking||document.visibilityState==='hidden')return false;
  if(!force&&Date.now()-lastCheck<15000)return false;
  checking=true;lastCheck=Date.now();
  try{
   const url=new URL('./release.json',location.href);
   url.searchParams.set('t',String(Date.now()));
   const response=await fetch(url.href,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
   if(!response.ok)throw Error('HTTP '+response.status);
   const remote=await response.json();
   if(!remote||typeof remote.version!=='string'||!/^[a-f0-9]{40}$/.test(remote.buildSha||''))throw Error('invalid release manifest');
   if(remote.buildSha!==release.buildSha){showUpdate(remote);return true}
   return false;
  }catch(err){if(force)console.warn('[TOPIK] 更新检查未验证',err);return false}
  finally{checking=false}
 }
 window.TOPIK_CHECK_UPDATE=()=>check(true);
 window.addEventListener('pageshow',()=>{void check()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void check()});
 document.addEventListener('DOMContentLoaded',()=>{
  if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(regs=>{
   regs.filter(reg=>reg.scope.includes('/study-abroad/topik-vocab/')).forEach(reg=>reg.unregister());
  }).catch(()=>{});
  // No deletion of Cache Storage, localStorage, IndexedDB, or learning data.
  void check();
 });
})();
