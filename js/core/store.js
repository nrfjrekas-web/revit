function load(){
 let d=null;try{d=JSON.parse(ls.get(K))}catch(e){}
 db=JSON.parse(JSON.stringify(SEED));
 if(d)Object.keys(SEED).forEach(k=>{if(d[k]!==undefined)db[k]=Array.isArray(SEED[k])?d[k]:Object.assign({},SEED[k],d[k])});
}
function recalc(){
 const a=db.TRX_KEUANGAN.map((r,i)=>[r,i]).sort((x,y)=>x[0].tanggal.localeCompare(y[0].tanggal)||x[1]-y[1]).map(x=>x[0]);
 let s=0;a.forEach(r=>{s+=num(r.kas_masuk)-num(r.kas_keluar);r.saldo=s});db.TRX_KEUANGAN=a;
}
function commit(){recalc();if(!ls.set(K,JSON.stringify(db)))toast('Penyimpanan perangkat penuh. Kirim data ke Google Sheet lalu kurangi foto.','err')}
function log(akt,det){const n=new Date();db.LOG_AKTIVITAS.push({waktu:today()+' '+n.toTimeString().slice(0,5),user:user.nama,aktivitas:akt,detail:det||''})}
function toast(m,t){const e=$('toast');e.textContent=m;e.style.background=t==='err'?'#B91C1C':'#0F172A';e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3200)}
const img=f=>new Promise(res=>{if(!f)return res('');const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,720/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.6))};i.onerror=()=>res('');i.src=r.result};r.readAsDataURL(f)});
