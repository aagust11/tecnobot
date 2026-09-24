import {normalize} from './normalizer.js';
// Ordres d’interfície genèriques: no hi ha vocabulari de cap temari aquí.
const requests={
 easyAnswer:['mes facil','explica m ho mes facil','no ho entenc','explica ho mes facil'],
 fullAnswer:['amplia','amplia l explicacio','explica m ho millor','mes detalls'],
 shortAnswer:['resumeix','resum','mes breu','fes un resum'],
 examples:['exemple','un exemple','posa m un exemple','posa un exemple','exemples'],
 related:['conceptes relacionats','relacionats']
};
export function followUpMode(question,context){
 if(!context)return null;
 const q=normalize(question);
 return Object.entries(requests).find(([,values])=>values.includes(q))?.[0]||null;
}
