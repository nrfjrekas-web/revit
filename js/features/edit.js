
/* ===== UBAH DAN HAPUS ===== */
let EDIT=null,KEEP=false;
const ACT=(k,i)=>`<div class="flex gap-2 mt-2"><button class="btn alt sm" onclick="ubah('${k}',${i})">Ubah</button><button class="btn alt sm" style="color:var(--bad);border-color:var(--bad)" onclick="hapus('${k}',${i})">Hapus</button></div>`;
const PAGEOF={masuk:'masuk',keluar:'keluar',progres:'progres',kas:'kas',rab:'set2',mat:'set3',pkj:'set4'};
const FM={masuk:{f:'fm',src:()=>db.TRX_MASUK,map:{tgl:'tanggal',mat:'id_material',qty:'qty',harga:'harga_beli',sup:'supplier',nota:'no_nota'}},
 keluar:{f:'fk',src:()=>db.TRX_KELUAR,map:{tgl:'tanggal',mat:'id_material',qty:'qty',rab:'untuk_pekerjaan_id_rab',pen:'penerima_mandor'}},
 progres:{f:'fp',src:()=>db.TRX_PROGRES,map:{tgl:'tanggal',rab:'id_rab',p:'persen_hari_ini',cuaca:'cuaca',ken:'kendala',beso:'kebutuhan_besok'}},
 kas:{f:'fs',src:()=>db.TRX_KEUANGAN,map:{tgl:'tanggal',jml:'kas_masuk'}},
 rab:{f:'frab',src:()=>db.DB_RAB,map:{u:'uraian_pekerjaan',v:'volume',s:'satuan',h:'harga_satuan'}},
 mat:{f:'fmat',src:()=>db.DB_MATERIAL,map:{n:'nama_material',s:'satuan',m:'stok_minimum',h:'harga_acuan_siplah'}},
 pkj:{f:'fpkj',src:()=>db.DB_PEKERJA,map:{n:'nama',j:'jabatan',u:'upah'}}};
function guard(snap){if(db.DB_MATERIAL.some(m=>stok(m.id_material)<0)){db=JSON.parse(snap);toast('Perubahan ditolak: stok material akan menjadi minus karena sudah ada barang keluar.','err');return false}return true}
function dropBku(o){const i=db.TRX_KEUANGAN.findIndex(x=>x.sumber==='Material'&&x.tanggal===o.tanggal&&num(x.kas_keluar)===num(o.total_harga)&&String(x.uraian).startsWith('Belanja '+o.nama_material));if(i>=0)db.TRX_KEUANGAN.splice(i,1)}
function recumul(){const g={};db.TRX_PROGRES.forEach((x,i)=>{(g[x.id_rab]=g[x.id_rab]||[]).push([x,i])});Object.values(g).forEach(a=>{let t=0;a.sort((p,q)=>p[0].tanggal.localeCompare(q[0].tanggal)||p[1]-q[1]).forEach(([x])=>{t+=num(x.persen_hari_ini);x.persen_kumulatif=t})})}
function ubah(k,i){
 EDIT={k,i};KEEP=true;go(PAGEOF[k]);
 const M=FM[k],f=$(M.f),o=M.src()[i];
 Object.entries(M.map).forEach(([n,key])=>{if(f[n])f[n].value=o[key]});
 if(k==='kas')f.th.value=(String(o.uraian).match(/Tahap \d/)||['Tahap 1'])[0];
 [...f.querySelectorAll('button')].pop().textContent='Simpan perubahan';
 f.insertAdjacentHTML('beforebegin','<div class="rounded p-3 mb-3 flex items-center justify-between gap-3" style="background:#DBEAFE"><span class="text-sm font-semibold">Mengubah data yang sudah tersimpan</span><button type="button" class="btn alt sm" onclick="EDIT=null;go(page)">Batal</button></div>');
 if(k==='masuk')masUpd();if(k==='keluar')kelUpd();if(k==='progres')proUpd();
 scrollTo(0,0);
}
async function hapus(k,i){
 const M=FM[k],o=M.src()[i];
 if(!(await ask('Hapus data ini? Tindakan ini tidak bisa dibatalkan.')))return;
 const snap=JSON.stringify(db),used=(id,key1,key2)=>db.TRX_MASUK.some(x=>x[key1]===id)||db.TRX_KELUAR.some(x=>x[key2]===id)||db.TRX_PROGRES.some(x=>x.id_rab===id);
 if(k==='masuk'){dropBku(o);db.TRX_MASUK.splice(i,1);if(!guard(snap))return}
 else if(k==='keluar')db.TRX_KELUAR.splice(i,1);
 else if(k==='progres'){db.TRX_PROGRES.splice(i,1);recumul()}
 else if(k==='kas')db.TRX_KEUANGAN.splice(i,1);
 else if(k==='rab'){if(db.TRX_PROGRES.some(x=>x.id_rab===o.id_rab)||db.TRX_KELUAR.some(x=>x.untuk_pekerjaan_id_rab===o.id_rab))return toast('Item RAB ini sudah dipakai di progres atau barang keluar, jadi tidak bisa dihapus.','err');db.DB_RAB.splice(i,1)}
 else if(k==='mat'){if(db.TRX_MASUK.some(x=>x.id_material===o.id_material)||db.TRX_KELUAR.some(x=>x.id_material===o.id_material))return toast('Material ini sudah punya transaksi, jadi tidak bisa dihapus.','err');db.DB_MATERIAL.splice(i,1)}
 else db.DB_PEKERJA.splice(i,1);
 log('Hapus data',k);EDIT=null;commit();toast('Data dihapus.');go(page);
}
