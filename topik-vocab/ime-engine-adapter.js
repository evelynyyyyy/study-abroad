/* Chinese IME engine contract — experimental, isolated from study records.
 * The production keyboard does NOT use this module until acceptance tests pass.
 */
(function(root){
'use strict';
class ChineseIMEEngine {
 async init(){throw Error('Engine implementation required')}
 async processKey(_key){throw Error('Engine implementation required')}
 getComposition(){throw Error('Engine implementation required')}
 getCandidates(){throw Error('Engine implementation required')}
 async selectCandidate(_index){throw Error('Engine implementation required')}
 async backspace(){return this.processKey('BackSpace')}
 async commit(){throw Error('Engine implementation required')}
 async reset(){throw Error('Engine implementation required')}
}
class RimeWasmEngine extends ChineseIMEEngine {
 constructor(loader){super();this.loader=loader;this.decoder=null;this.composition='';this.candidates=[];this.committed='';this.ready=false}
 async init(){
  if(typeof this.loader!=='function')throw Error('A browser-compatible Rime WASM loader must be supplied');
  const bridge=await this.loader();
  // Decoder bridge must be supplied by a non-Chrome build, not the Chrome-extension pre.js.
  for(const method of ['processKey','getComposition','getCandidates','selectCandidate','commit','reset'])if(typeof bridge?.[method]!=='function')throw Error('Incomplete Rime bridge: '+method);
  this.decoder=bridge;this.ready=true;return this;
 }
 async processKey(key){if(!this.ready)throw Error('Rime not initialized');await this.decoder.processKey(key);return this.snapshot()}
 getComposition(){return this.decoder?.getComposition()||''}
 getCandidates(){return this.decoder?.getCandidates()||[]}
 async selectCandidate(index){await this.decoder.selectCandidate(index);return this.snapshot()}
 async commit(){return this.decoder.commit()}
 async reset(){if(this.decoder)await this.decoder.reset();return this.snapshot()}
 snapshot(){return {composition:this.getComposition(),candidates:this.getCandidates()}}
}
root.TOPIK_IME_ENGINES={ChineseIMEEngine,RimeWasmEngine};
})(typeof window!=='undefined'?window:globalThis);
