// Pure matching smoke test: runs with Node/tsx after installing dependencies.
const norm = (s='') => s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\((official|audio|video)\)|\[(official|audio|video)\]/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const score=(a:any,b:any)=>{let s=0;if(a.isrc&&b.isrc&&a.isrc.replace(/-/g,'')===b.isrc.replace(/-/g,''))s+=120;if(norm(a.artist)===norm(b.artist))s+=50;if(norm(a.title)===norm(b.title))s+=75;if(a.duration&&b.duration){const d=Math.abs(a.duration-b.duration);if(d<=2)s+=25;else if(d>15)s-=20}return Math.max(0,s)};
const base={title:'Cenere',artist:'Lazza',album:'Sirio',duration:196,isrc:'IT1234567890'};
const same={title:'Cenere (Official Audio)',artist:'Lazza',album:'Sirio',duration:197,isrc:'IT1234567890'};
const live={title:'Cenere (Live)',artist:'Lazza',album:'Live',duration:276};
const s1=score(base,same),s2=score(base,live);
if(!(s1>s2 && s1>=120)) throw new Error(`Matching failed: same=${s1}, live=${s2}`);
console.log(JSON.stringify({ok:true,sameScore:s1,liveScore:s2,message:'Same recording outranks live version'}));
