let db,user=null,page='dash';
const $=i=>document.getElementById(i);
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
function ask(m){return new Promise(r=>{const d=document.createElement('div');d.className='fixed inset-0 z-[70] flex items-end lg:items-center justify-center bg-slate-900/50';d.innerHTML='<div class="bg-white w-full max-w-[480px] lg:max-w-[420px] rounded-t-xl lg:rounded-xl p-4 lg:p-6"><p class="font-semibold mb-4">'+esc(m)+'</p><div class="grid grid-cols-2 gap-3"><button class="btn alt" id="n">Batal</button><button class="btn" id="y">Lanjutkan</button></div></div>';document.body.appendChild(d);d.querySelector('#n').onclick=()=>{d.remove();r(false)};d.querySelector('#y').onclick=()=>{d.remove();r(true)}})}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>parseFloat(v)||0;
const sum=(a,k)=>a.reduce((t,x)=>t+num(x[k]),0);
const fmt=n=>num(n).toLocaleString('id-ID',{maximumFractionDigits:2});
const rp=n=>'Rp '+Math.round(num(n)).toLocaleString('id-ID');
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const fd=d=>d?d.split('-').reverse().join('/'):'';
const addD=(d,n)=>{const t=new Date(d+'T00:00:00Z');if(isNaN(t))return '';t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
const longD=d=>new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
const C=()=>db.CONFIG;
const mat=id=>db.DB_MATERIAL.find(m=>m.id_material===id);
const rab=id=>db.DB_RAB.find(r=>r.id_rab===id);
const jumlah=r=>num(r.volume)*num(r.harga_satuan);
const totalRab=()=>num(C().total_rab)||db.DB_RAB.reduce((t,r)=>t+jumlah(r),0);
const bobot=r=>totalRab()?jumlah(r)/totalRab()*100:0;
const masuk=id=>sum(db.TRX_MASUK.filter(x=>x.id_material===id),'qty');
const keluar=id=>sum(db.TRX_KELUAR.filter(x=>x.id_material===id),'qty');
const stok=id=>masuk(id)-keluar(id);
const kum=id=>Math.max(0,...db.TRX_PROGRES.filter(x=>x.id_rab===id).map(x=>num(x.persen_kumulatif)));
const fisik=()=>db.DB_RAB.reduce((t,r)=>t+bobot(r)*kum(r.id_rab)/100,0);
const keluarKas=()=>sum(db.TRX_KEUANGAN,'kas_keluar');
const saldo=()=>sum(db.TRX_KEUANGAN,'kas_masuk')-keluarKas();
function status(m){const a=masuk(m.id_material);if(!a)return['BELUM MASUK','mu'];const s=stok(m.id_material);return s<=0?['HABIS','bd']:s<=num(m.stok_minimum)?['MENIPIS','wn']:['AMAN','ok']}
const kritis=()=>db.DB_MATERIAL.filter(m=>['HABIS','MENIPIS'].includes(status(m)[0]));

/* Tampilan foto penuh (nota, barang) */
function lihatFoto(k,i,j){const o=({masuk:db.TRX_MASUK})[k][i],u=o&&o[j==='nota'?'foto_nota_url':'foto_barang_url'];if(!u)return;const d=document.createElement('div');d.className='fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-900/80 p-4';d.innerHTML='<img src="'+u+'" alt="Foto '+j+'" style="max-width:100%;max-height:80vh;border-radius:6px;background:#fff"><button class="btn alt sm mt-4" style="width:auto">Tutup</button>';document.body.appendChild(d);d.onclick=()=>d.remove()}
