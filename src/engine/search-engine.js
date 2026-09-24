import {normalize,tokens} from './normalizer.js';
import {similarity} from './similarity.js';
import {CONFIG} from './config.js';
export function createEngine(modules) {
 const entries=modules.flatMap(m=>m.entries);
 const index=entries.map(entry=>{
   const mod=modules.find(m=>m.id===entry.module);
   const aliases=entry.concepts.flatMap(c=>mod.synonyms[c]||[]);
   const terms=tokens([entry.title,...entry.concepts,...entry.keywords,...entry.expressions,...entry.exampleQuestions,...aliases].join(' '));
   return {entry,terms,phrases:[...entry.expressions,...aliases].map(normalize),examples:entry.exampleQuestions.map(tokens)};
 });
 const frequency=new Map(); for(const x of index) for(const t of x.terms) frequency.set(t,(frequency.get(t)||0)+1);
 const weight=t=>Math.log(1+entries.length/(frequency.get(t)||1));
 function search(question,{module=null,context=null}={}) {
   const normalized=normalize(question.slice(0,CONFIG.maxQuestionLength)), query=tokens(normalized);
   const ranked=index.filter(x=>!module||x.entry.module===module).map(x=>{
     const matches=query.map(q=>{let best=0,term='';for(const t of x.terms){const s=similarity(q,t);if(s>best){best=s;term=t;}}return {query:q,term,similarity:best>=(q.length<=5?0.84:CONFIG.fuzzyThreshold)?best:0};});
     const total=query.reduce((a,q)=>a+weight(q),0)||1;
     const coverage=matches.reduce((a,m)=>a+m.similarity*weight(m.query),0)/total;
     const specific=matches.some(m=>m.similarity>0&&((frequency.get(m.term)||0)/entries.length<0.35));
     const phrase=x.phrases.some(p=>p&&(` ${normalized} `).includes(` ${p} `));
     const example=Math.max(0,...x.examples.map(ts=>query.length?query.filter(q=>ts.includes(q)).length/Math.max(query.length,ts.length):0));
     const score=Math.min(1,coverage*0.78+(phrase?0.10:0)+example*0.12+(coverage>0.3&&context===x.entry.id?0.025:0));
     return {id:x.entry.id,title:x.entry.title,score:specific?score:score*0.35,matches};
   }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
   const top=ranked[0], margin=(top?.score||0)-(ranked[1]?.score||0);
   const status=!top||top.score<CONFIG.clarificationThreshold?'unknown':top.score>=CONFIG.directAnswerThreshold&&margin>=CONFIG.minimumMargin?'answer':'clarify';
   return {status,id:top?.id,normalized,tokens:query,margin,results:ranked.slice(0,4)};
 }
 return {search,entries,modules};
}
