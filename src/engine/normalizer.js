const abbreviations = {pq:'perque',xq:'perque',q:'que'};
const stop = new Set('a al als amb de del dels el els la les un una uns unes i o que qui es son per perque com quan on en ho hi em el meu meva pots pot podria voldria saber explica explicam digam entenc no si mes molt tant tenen te estan fetes fet fer passa vol dir significa serveix serveixen quina quin quins quines diferent fan sigui fa entre d l m t s hola gràcies siusplau'.split(' '));
export function normalize(text) { return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/).map(t=>abbreviations[t]||t).join(' '); }
export function singular(t) { return t.length>4 ? t.replace(/ades$/,'ada').replace(/ides$/,'ida').replace(/es$/,'a').replace(/s$/,'') : t; }
export function tokens(text) { return [...new Set(normalize(text).split(' ').filter(t=>t&&!stop.has(t)).map(singular))]; }
