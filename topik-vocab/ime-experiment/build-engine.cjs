// Executed from pinned upstream simple-ime checkout after npm ci and acceptance tests.
// Only exports the original engine; does not import or bundle upstream UI.
const esbuild = require('esbuild')
const fs = require('node:fs')
const path = require('node:path')
esbuild.build({
 entryPoints:['src/engine/index.ts'],
 outfile:'../topik-vocab/ime-experiment/simple-ime-core.js',
 bundle:true,minify:true,platform:'browser',format:'iife',globalName:'SimpleImeCore',target:'es2020',
 plugins:[{name:'vite-raw-text',setup(build){
   build.onResolve({filter:/\.txt\?raw$/},args=>({path:path.resolve(args.resolveDir,args.path.replace(/\?raw$/,'')),namespace:'raw-text'}))
   build.onLoad({filter:/.*/,namespace:'raw-text'},args=>({contents:fs.readFileSync(args.path,'utf8'),loader:'text'}))
 }}]
}).then(()=>{console.log('Bundled genuine simple-ime engine:',fs.statSync('../topik-vocab/ime-experiment/simple-ime-core.js').size,'bytes')}).catch(e=>{console.error(e);process.exit(1)})
