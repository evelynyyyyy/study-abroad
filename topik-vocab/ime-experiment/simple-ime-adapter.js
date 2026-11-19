/* Isolated adapter for upstream simple-ime requestCandidates(). No study state. */
(function(root){
'use strict';
class SimpleImeAdapter {
 constructor(core,pageSize=10){if(typeof core?.requestCandidates!=='function')throw Error('Real simple-ime engine bundle is required');this.core=core;this.pageSize=pageSize;this.reset()}
 async init(){return this}
 input(char){if(!/^[a-z']$/i.test(char))return this.snapshot();this.composition+=char.toLowerCase();this.refresh();return this.snapshot()}
 backspace(){this.composition=this.composition.slice(0,-1);this.refresh();return this.snapshot()}
 getComposition(){return this.composition}
 getCandidates(){return this.candidates.slice()}
 getPage(){return this.candidates.slice(this.page*this.pageSize,(this.page+1)*this.pageSize)}
 nextPage(){this.page=Math.min(this.page+1,Math.max(0,Math.ceil(this.candidates.length/this.pageSize)-1));return this.getPage()}
 previousPage(){this.page=Math.max(0,this.page-1);return this.getPage()}
 selectCandidate(index){const candidate=this.candidates[index];if(!candidate)return null;this.composition='';this.candidates=[];this.page=0;return candidate}
 commit(){return this.selectCandidate(0)}
 reset(){this.composition='';this.candidates=[];this.page=0}
 refresh(){this.candidates=this.composition?this.core.requestCandidates(this.composition).candidates.map(x=>x.w):[];this.page=0}
 snapshot(){return {engine:'simple-ime',composition:this.composition,candidateCount:this.candidates.length,candidates:this.getCandidates()}}
}
root.TOPIK_SimpleImeAdapter=SimpleImeAdapter;
})(typeof window!=='undefined'?window:globalThis);
