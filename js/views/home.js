/* ===== HALAMAN ===== */
const V={},A={};
const MD={dash:'Ringkasan progres, dana, dan stok',masuk:'Catat belanja material dan foto nota',keluar:'Catat pengambilan material gudang',stok:'Sisa stok dan status tiap material',progres:'Laporan kemajuan fisik harian',absen:'Kehadiran pekerja dan upah harian',kas:'Pencairan dana dan buku kas umum',laporan:'Laporan kas, stok, mingguan, dan serah terima',setting:'Identitas, PIN, RAB, material, pekerja'};
V.menu=()=>{const R=ROLES[user.role],L=R.pages.filter(p=>!R.nav.includes(p));return `<section class="pn !py-0">${L.map((p,i)=>`<button class="rw !items-center" style="min-height:68px;border-top-width:${i?1:0}px" onclick="go('${p}')">${ic(p)}<span class="flex-1">${PG[p]}<br><span class="mu text-xs font-normal">${MD[p]}</span></span></button>`).join('')}</section>`};
const mulai=()=>{
 const st=[['RAB','set2',db.DB_RAB.length],['Material','set3',db.DB_MATERIAL.length],['Pekerja dan tarif HOK','set4',db.DB_PEKERJA.length]];
 if(st.every(s=>s[2]))return '';
 const sek=user.role==='sek';
 return `<section class="pn mb-4" style="border-left:4px solid var(--em)"><h2 class="text-[17px] font-bold">Mulai di sini</h2><p class="mu text-sm mt-1 mb-3">${sek?'Aplikasi masih kosong. Isi data proyek berikut agar catatan dan laporan sesuai kenyataan.':'Data proyek belum diisi. Minta Sekretaris mengisinya di Pengaturan.'}</p>${st.map(s=>`<div class="rw !items-center" style="min-height:52px"><span class="flex-1">${s[0]}<br><span class="mu text-xs">${s[2]?s[2]+' item terisi':'Belum diisi'}</span></span>${sek&&!s[2]?`<button class="btn alt !w-auto px-4" onclick="go('${s[1]}')">Isi</button>`:''}</div>`).join('')}</section>`};
V.dash=()=>{
 const f=fisik(),sr=keluarKas(),pc=totalRab()?sr/totalRab()*100:0,k=kritis(),lg=db.LOG_AKTIVITAS.slice(-5).reverse();
 return `${mulai()}
 <div class="dg">
 <section class="text-white rounded-md p-4 dg-hero" >
  <p class="text-sm opacity-80">Progres fisik kumulatif</p>
  <p class="text-[56px] font-extrabold leading-none mt-1" style="font-stretch:80%">${fmt(f)}<span class="text-2xl font-semibold">%</span></p>
  <div class="mt-3">${bar(f)}</div>
  <div class="flex justify-between text-xs opacity-80 mt-1"><span>0</span><span>50</span><span>100</span></div>
 </section>
 <section class="pn mt-3 !py-0">
  <div class="rl py-3"><div class="flex justify-between items-baseline"><span class="mu text-sm">Serapan dana</span><b>${rp(sr)}</b></div><div class="flex items-center gap-3 mt-2"><div class="flex-1">${bar(pc,1)}</div><span class="text-sm font-semibold">${fmt(pc)}%</span></div></div>
  <div class="rl py-3 flex justify-between items-baseline"><span class="mu text-sm">Sisa saldo kas BKU</span><b class="${saldo()<0?'bd':''}">${rp(saldo())}</b></div>
  <div class="rl py-3 flex justify-between items-center"><span class="mu text-sm">Item stok kritis</span>${k.length?`<button class="font-bold wn min-h-[44px]" onclick="go('stok')">${k.length} item, lihat stok</button>`:'<b class="ok">Tidak ada</b>'}</div>
 </section>
 <div class="dg-l">${H2('Progres per pekerjaan RAB')}
 <section class="pn">${db.DB_RAB.length?db.DB_RAB.map(r=>`<div class="rl py-3"><div class="flex justify-between gap-3 text-sm"><span>${esc(r.uraian_pekerjaan)}</span><b>${fmt(kum(r.id_rab))}%</b></div><div class="mt-2">${bar(kum(r.id_rab),1)}</div><p class="hint">Bobot ${fmt(bobot(r))}% dari total RAB</p></div>`).join(''):empty('Belum ada item RAB. Tambahkan di Pengaturan.')}</section>
 </div>
 <div class="dg-r">${H2('Aktivitas terakhir')}
 <section class="pn !py-0">${lg.length?lg.map(l=>`<div class="rl py-3"><p class="font-semibold text-sm">${esc(l.aktivitas)}</p><p class="mu text-xs">${esc(l.detail)}</p><p class="mu text-xs">${esc(l.waktu)} oleh ${esc(l.user)}</p></div>`).join(''):empty('Belum ada transaksi. Aktivitas akan muncul setelah barang atau progres dicatat.')}</section>
 </div>
 </div>`;
};
