export function similarity(a,b) {
  if(a===b) return 1;
  if(Math.min(a.length,b.length)<4) return 0;
  let row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){const next=[i]; for(let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]!==b[j-1])); row=next;}
  return 1-row[b.length]/Math.max(a.length,b.length);
}
