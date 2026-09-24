import {readdir,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export async function loadKnowledge(root=new URL('../knowledge/',import.meta.url)) {
 const modules=[];
 for(const dir of (await readdir(root,{withFileTypes:true})).filter(d=>d.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name))) {
  modules.push(JSON.parse(await readFile(new URL(`${dir.name}/concepts.json`,root),'utf8')));
 }
 validate(modules); return modules;
}
export function validate(modules) {
 const ids=new Set(), moduleIds=new Set();
 const fail=m=>{throw new Error(`Coneixement invàlid: ${m}`);};
 if(!Array.isArray(modules)||!modules.length) fail('cal almenys un mòdul');
 for(const m of modules){
  if(!/^[a-z][a-z0-9-]*$/.test(m.id)||moduleIds.has(m.id)) fail('ID de mòdul duplicat o incorrecte');
  moduleIds.add(m.id);
  if(typeof m.title!=='string'||!m.title.trim()||!Array.isArray(m.entries)||!m.entries.length) fail('mòdul sense títol o entrades');
  if(!m.synonyms||typeof m.synonyms!=='object'||Array.isArray(m.synonyms)) fail('sinònims incorrectes');
  for(const values of Object.values(m.synonyms)) if(!Array.isArray(values)||values.some(x=>typeof x!=='string'||!x.trim())) fail('llista de sinònims incorrecta');
  for(const e of m.entries){
   if(typeof e.id!=='string'||!e.id.startsWith(m.id+'.')||! /^[a-z0-9.-]+$/.test(e.id)||ids.has(e.id)) fail('ID d’entrada duplicat o incorrecte');
   ids.add(e.id);
   if(e.module!==m.id) fail(`mòdul desconegut: ${e.id}`);
   for(const k of ['title','topic','shortAnswer','easyAnswer','fullAnswer','page']) if(typeof e[k]!=='string'||!e[k].trim()) fail(`${e.id}: falta ${k}`);
   for(const k of ['concepts','keywords','expressions','exampleQuestions','examples','related']) if(!Array.isArray(e[k])||(!e[k].length&&k!=='related')||e[k].some(x=>typeof x!=='string'||!x.trim())) fail(`${e.id}: ${k} incorrecte`);
   if(e.page!==`#${e.id}`) fail(`${e.id}: pàgina inexistent (ha de ser #ID)`);
  }
 }
 for(const m of modules) for(const e of m.entries) for(const r of e.related) if(!ids.has(r)) fail(`${e.id}: relació inexistent ${r}`);
 return true;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const m=await loadKnowledge();console.log(`${m.length} mòduls, ${m.flatMap(x=>x.entries).length} conceptes: vàlids.`);}
