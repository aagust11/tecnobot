import {mkdir,rm,cp,writeFile} from 'node:fs/promises';
import {loadKnowledge} from './validate.mjs';
const modules=await loadKnowledge();
const dist=new URL('../dist/',import.meta.url);
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const file of ['index.html','styles.css','src']) await cp(new URL('../'+file,import.meta.url),new URL(file,dist),{recursive:true});
await writeFile(new URL('knowledge.json',dist),JSON.stringify(modules));
await writeFile(new URL('.nojekyll',dist),'');
console.log('Build estàtic generat a dist/. Totes les rutes són relatives.');
