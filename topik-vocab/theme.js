/* Standalone presentation controller. No scheduler, task, or answer state access. */
(function(root){
'use strict';
const KEY='topik_theme_preference';
const modes=['system','light','dark'];
function normalize(mode){return modes.includes(mode)?mode:'system'}
function preferred(storage){
 try{const explicit=storage.getItem(KEY);if(explicit!==null)return normalize(explicit);
 return 'system'}catch{return 'system'}
}
function resolved(mode,systemDark){return mode==='system'?(systemDark?'dark':'light'):normalize(mode)==='dark'?'dark':'light'}
function create(options){
 const doc=options.document,storage=options.storage,media=options.media;
 let mode=preferred(storage);
 const themeMeta=()=>doc.querySelector('meta[name="theme-color"]');
 function apply(){
  const effective=resolved(mode,!!media.matches);
  doc.documentElement.dataset.theme=effective;
  doc.documentElement.dataset.themePreference=mode;
  doc.documentElement.style.colorScheme=effective;
  const meta=themeMeta();if(meta)meta.setAttribute('content',effective==='dark'?'#000000':'#ffffff');
  const toggle=doc.getElementById('theme-toggle');
  if(toggle)toggle.setAttribute('aria-label','主题：'+(mode==='system'?'跟随系统':mode==='light'?'浅色':'深色')+'，当前'+(effective==='dark'?'深色':'浅色')+'，点击切换');
  const choice=doc.getElementById('theme-choice');if(choice)choice.value=mode;
  return effective;
 }
 function setMode(next){
  mode=normalize(next);
  try{storage.setItem(KEY,mode)}catch{}
  apply();return mode;
 }
 function getMode(){return mode}
 function onChange(){if(mode==='system')apply()}
 if(media.addEventListener)media.addEventListener('change',onChange);
 else if(media.addListener)media.addListener(onChange);
 apply();
 return {apply,setMode,getMode,resolved:()=>resolved(mode,!!media.matches)};
}
root.TOPIK_THEME={create,normalize,resolved,preferred,KEY};
})(typeof window!=='undefined'?window:globalThis);
