/* ===== PIN & ROLE ===== */
const ALL=['dash','masuk','keluar','stok','progres','absen','kas','laporan','setting'];
const PG={mingguan:'Laporan mingguan',menu:'Menu',dash:'Beranda',masuk:'Barang masuk',keluar:'Barang keluar',stok:'Stok gudang',progres:'Progres harian',absen:'Absensi dan upah',kas:'Kas dan BKU',laporan:'Laporan dan cetak',setting:'Pengaturan'};
const NL={dash:'Beranda',masuk:'Masuk',keluar:'Keluar',progres:'Progres',absen:'Absen',laporan:'Laporan'};
const IC={chev:'M9 6l6 6-6 6',dash:'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10',masuk:'M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3',keluar:'M12 15V3m0 0L8 7m4-4l4 4M4 17v3h16v-3',stok:'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',progres:'M4 20V10M10 20V4M16 20v-8M22 20H2',absen:'M9 12l2 2 4-4M5 4h14v16H5z',kas:'M3 7h18v12H3zM3 11h18M7 15h3',laporan:'M7 3h8l4 4v14H7zM14 3v5h5M10 13h6M10 17h6',setting:'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',menu:'M4 7h16M4 12h16M4 17h16'};
const ic=n=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n]}"/></svg>`;
const ROLES={sek:{nama:'Sekretaris',pages:ALL,nav:['dash','masuk','keluar','progres']},mandor:{nama:'Mandor',pages:['progres','absen'],nav:['progres','absen']},kepsek:{nama:'Kepala Sekolah',pages:['dash','laporan'],nav:['dash','laporan']}};
let pin='';
function drawPin(){$('dots').innerHTML=[0,1,2,3].map(i=>`<span class="dot ${i<pin.length?'f':''}"></span>`).join('')}
function buildPad(){$('pad').innerHTML=[1,2,3,4,5,6,7,8,9,'',0,'<'].map(k=>k===''?'<span></span>':`<button class="key" onclick="pressPin('${k}')" aria-label="${k==='<'?'Hapus':k}">${k==='<'?'Hapus':k}</button>`).join('');
 $('pad').querySelectorAll('.key').forEach(b=>{if(b.textContent==='Hapus')b.style.fontSize='16px'})}
function pressPin(k){
 $('pinErr').textContent='';
 if(k==='<')pin=pin.slice(0,-1);else if(pin.length<4)pin+=k;
 drawPin();
 if(pin.length===4){
  if(!C().pin_sekretaris){loginRemote(pin);return}
  const c=C(),m={[String(c.pin_sekretaris)]:'sek',[String(c.pin_mandor)]:'mandor',[String(c.pin_kepsek)]:'kepsek'}[pin];
  if(!m){$('pinErr').textContent='PIN salah. Periksa lalu coba lagi.';pin='';drawPin();return}
  user={role:m,nama:ROLES[m].nama};ls.set(K+'_u',m);ls.set(K+'_lp',pin);pin='';enter();
 }
}
/* Perangkat baru: PIN diperiksa server Apps Script; bila benar, data proyek ikut diambil. */
async function loginRemote(p){
 const e=$('pinErr'),u=GAS_URL;e.textContent='Memeriksa PIN...';e.className='lgerr mu';
 const bad=m=>{e.textContent=m;e.className='lgerr bd';pin='';drawPin()};
 try{
  const r=await(await fetch(u+(u.indexOf('?')<0?'?':'&')+'action=login&pin='+encodeURIComponent(p))).json();
  if(r.error==='kosong'){pin='';drawPin();e.textContent='';$('login').hidden=true;showSetup();return toast('Sheet masih kosong. Lakukan pengaturan awal.')}
  if(r.error)return bad(r.error==='lock'?'Terlalu banyak PIN salah. Coba lagi 15 menit lagi.':'PIN salah. Periksa lalu coba lagi.');
  if(!r.CONFIG||!r.role||!ROLES[r.role])return bad('Data di Sheet belum lengkap. Hubungi Sekretaris.');
  applyData(r,u,'');ls.set(K+'_lp',p);user={role:r.role,nama:ROLES[r.role].nama};ls.set(K+'_u',r.role);pin='';e.textContent='';drawPin();enter()
 }catch(x){bad('Tidak bisa menghubungi server. Periksa internet.')}
}
function enter(){
 $('login').hidden=true;$('main').hidden=false;
 $('who').textContent=user.nama+(C().nama_sekolah?' - '+C().nama_sekolah.replace('UPTD Satuan Pendidikan ',''):'');
 go(ROLES[user.role].pages[0]);
}
function logout(){ls.del(K+'_u');user=null;$('main').hidden=true;$('login').hidden=false;pin='';drawPin();loginInfo()}