import {createEngine} from './engine/search-engine.js';
import {CONFIG} from './engine/config.js';
import {normalize} from './engine/normalizer.js';
const $=id=>document.getElementById(id);
const debug=new URLSearchParams(location.search).get('debugChatbot')==='true';
let engine,history=[],lastFocus,selectedModule='';
const key='tecnobot:v1:'+new URL('../',import.meta.url).pathname;
function el(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
function button(text,action){const b=el('button',text);b.type='button';b.addEventListener('click',action);return b;}
function openChat(){if($('chat').hidden)lastFocus=document.activeElement;$('chat').hidden=false;$('launcher').setAttribute('aria-expanded','true');$('question').focus();}
function closeChat(){$('chat').hidden=true;$('launcher').setAttribute('aria-expanded','false');(lastFocus||$('launcher')).focus();}
function save(){try{sessionStorage.setItem(key,JSON.stringify(history.filter(h=>!h.transient).slice(-CONFIG.historyLimit)));}catch{/* La cerca funciona encara que l’emmagatzematge estigui bloquejat. */}}
function record(item){history.push(item);history=history.slice(-CONFIG.historyLimit);save();renderMessages();}
function showEntry(id,mode='shortAnswer'){if(engine.entries.some(e=>e.id===id))record({kind:'answer',id,mode});}
function ask(q){if(!engine||!q.trim())return;openChat();const result=engine.search(q,{module:selectedModule||null,context:location.hash.slice(1)});if(debug)console.debug('TecnoBot',result);
 // No es desen les preguntes lliures: l’historial persistent només conté referències al temari.
 history.push({kind:'question',text:q.slice(0,CONFIG.maxQuestionLength),transient:true});
 const item=result.status==='answer'?{kind:'answer',id:result.id,mode:'shortAnswer'}:result.status==='clarify'?{kind:'clarify',ids:result.results.filter(r=>r.score>=CONFIG.clarificationThreshold).slice(0,3).map(r=>r.id)}:{kind:'unknown'};
 history.push(item);history=history.slice(-CONFIG.historyLimit);
 try{sessionStorage.setItem(key,JSON.stringify(history.filter(h=>!h.transient)));}catch{}
 renderMessages();if(debug){const details=el('details');details.append(el('summary','Diagnòstic de la cerca'),el('pre',JSON.stringify(result,null,2)));$('messages').append(details);}
}
function renderMessages(){const log=$('messages');log.replaceChildren();if(!history.length){const welcome=el('div',null,'message bot');welcome.append(el('strong','Hola! Què vols entendre avui?'),el('p',`Puc ajudar-te amb ${engine.modules.map(m=>m.title).join(', ')}. Escriu un dubte o tria un concepte.`));const actions=el('div',null,'actions');engine.entries.slice(0,3).forEach(e=>actions.append(button(e.title,()=>showEntry(e.id))));welcome.append(actions);log.append(welcome);}
 for(const h of history){const box=el('div',null,'message '+(h.kind==='question'?'user':'bot'));const actions=el('div',null,'actions');
  if(h.kind==='question')box.append(el('p',h.text));
  if(h.kind==='answer') {const e=engine.entries.find(e=>e.id===h.id);if(!e)continue;box.append(el('strong',e.title));
   if(h.mode==='related'){box.append(el('p','Continua explorant:'));e.related.forEach(id=>{const r=engine.entries.find(e=>e.id===id);if(r)actions.append(button(r.title,()=>showEntry(id)));});}
   else if(h.mode==='examples') e.examples.forEach(t=>box.append(el('p',t)));
   else box.append(el('p',e[h.mode]||e.shortAnswer));
   for(const [label,mode] of [['Més fàcil','easyAnswer'],['Amplia','fullAnswer'],['Exemples','examples'],['Relacionats','related']]) if(mode!==h.mode) actions.append(button(label,()=>showEntry(e.id,mode)));
   const a=el('a','Veure al tema ↗');a.href=e.page;a.addEventListener('click',()=>{ $('filter').value='';$('module').value='';selectedModule='';renderCards();closeChat();requestAnimationFrame(()=>$(e.id)?.focus());});actions.append(a);
  }
  if(h.kind==='clarify'){box.append(el('p','Vols dir algun d’aquests conceptes?'));h.ids.forEach(id=>{const e=engine.entries.find(e=>e.id===id);if(e)actions.append(button(e.title,()=>showEntry(id)));});actions.append(button('Cap d’aquests',()=>record({kind:'unknown'})));}
  if(h.kind==='unknown'){box.append(el('p',`No he trobat aquesta informació als continguts disponibles. Ara mateix puc ajudar-te amb ${engine.modules.map(m=>m.title).join(', ')}. Prova una pregunta més concreta o explora el temari.`));engine.entries.filter(e=>!selectedModule||e.module===selectedModule).slice(0,3).forEach(e=>actions.append(button(e.title,()=>showEntry(e.id))));}
  box.append(actions);log.append(box);
 }log.scrollTop=log.scrollHeight;
}
function renderCards(){const list=engine.entries.filter(e=>(!selectedModule||e.module===selectedModule)&&normalize(e.title+' '+e.keywords.join(' ')).includes(normalize($('filter').value)));$('cards').replaceChildren();$('count').textContent=`${list.length} conceptes · ${engine.modules.length} tema${engine.modules.length===1?'':'s'}`;
 for(const [i,e] of list.entries()){const card=el('article',null,'concept-card');card.id=e.id;card.tabIndex=-1;card.append(el('span',String(i+1).padStart(2,'0'),'card-number'),el('h3',e.title),el('p',e.shortAnswer));const detail=el('details');detail.append(el('summary','Llegeix l’explicació'),el('p',e.fullAnswer),el('p',e.examples.join(' '),'example'));card.append(detail,button('Explora amb TecnoBot ↗',()=>{openChat();showEntry(e.id);}));$('cards').append(card);}if(!list.length)$('cards').append(el('p','No hi ha conceptes amb aquest filtre.'));
}
$('launcher').addEventListener('click',()=> $('chat').hidden?openChat():closeChat());$('start-chat').addEventListener('click',openChat);$('close-chat').addEventListener('click',closeChat);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('chat').hidden)closeChat();});
$('reset').addEventListener('click',()=>{history=[];save();if(engine)renderMessages();$('question').focus();});
$('chat-form').addEventListener('submit',e=>{e.preventDefault();const q=$('question').value;$('question').value='';ask(q);$('question').focus();});
document.querySelectorAll('[data-ask]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.ask)));
$('filter').addEventListener('input',()=>{if(engine)renderCards();});$('module').addEventListener('change',()=>{selectedModule=$('module').value;if(engine)renderCards();});
try{const r=await fetch(new URL('../knowledge.json',import.meta.url));if(!r.ok)throw Error(r.status);const modules=await r.json();engine=createEngine(modules);
 for(const m of modules){const option=el('option',m.title);option.value=m.id;$('module').append(option);}$('module-label').hidden=modules.length<2;$('available').textContent=modules.map(m=>m.title).join(' · ');
 try{const saved=JSON.parse(sessionStorage.getItem(key)||'[]');if(Array.isArray(saved))history=saved.filter(h=>h&&((h.kind==='answer'&&engine.entries.some(e=>e.id===h.id)&&['shortAnswer','easyAnswer','fullAnswer','examples','related'].includes(h.mode))||(h.kind==='clarify'&&Array.isArray(h.ids)&&h.ids.every(id=>typeof id==='string'))||h.kind==='unknown')).slice(-CONFIG.historyLimit);}catch{}
 renderCards();renderMessages();if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
}catch(error){$('load-error').hidden=false;$('count').textContent='Continguts no disponibles';$('messages').append(el('p','No s’han pogut carregar els continguts. Recarrega la pàgina.'));$('question').disabled=true;if(debug)console.error(error);}
