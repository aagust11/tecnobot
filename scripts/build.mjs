import {mkdir,rm,cp,writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadKnowledge} from './validate.mjs';
const modules=await loadKnowledge();
const dist=new URL('../dist/',import.meta.url);
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const file of ['index.html','styles.css','src']) await cp(new URL('../'+file,import.meta.url),new URL(file,dist),{recursive:true});
await writeFile(new URL('knowledge.json',dist),JSON.stringify(modules));
// Canvia totes les URL de recursos quan canvia qualsevol fitxer del build.
async function files(dir){const result=[];for(const item of await readdir(dir,{withFileTypes:true})){const url=new URL(item.name+(item.isDirectory()?'/':''),dir);if(item.isDirectory())result.push(...await files(url));else result.push(url);}return result.sort((a,b)=>a.href.localeCompare(b.href));}
const assets=await files(dist),hash=createHash('sha256');
for(const url of assets)hash.update(url.pathname.slice(dist.pathname.length)).update(await readFile(url));
const version=hash.digest('hex').slice(0,12);
for(const url of assets){
 if(url.pathname.endsWith('.js')){const source=await readFile(url,'utf8');await writeFile(url,source.replace(/(['"])(\.\.?\/[^'"\n]+\.(?:js|json))\1/g,(_,quote,path)=>`${quote}${path}?v=${version}${quote}`));}
}
const html=await readFile(new URL('index.html',dist),'utf8');
await writeFile(new URL('index.html',dist),html.replace(/((?:src|href)="\.\/[^"?]+\.(?:js|css))"/g,`$1?v=${version}"`));
await writeFile(new URL('.nojekyll',dist),'');
console.log('Build estàtic generat a dist/. Totes les rutes són relatives.');
