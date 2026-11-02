V.absen=()=>{
 if(!db.DB_PEKERJA.length)return `<div class="pn">${empty('Belum ada data pekerja.',user.role==='sek'?'<button class="btn mt-4" onclick="go(\'setting\')">Tambah pekerja di Pengaturan</button>':'')}</div>`;
 return `<form id="fa" class="pn" onsubmit="subAbsen(event)">
  ${F('Tanggal',`<input class="in" type="date" name="tgl" value="${today()}" onchange="absUpd(1)" required>`)}
  <div id="wl"></div>
  <div class="rounded p-3 my-4" style="background:var(--bg)"><span class="mu text-sm">Total upah hari ini</span><p class="text-2xl font-extrabold" id="up">Rp 0</p></div>
  ${F('Foto dokumentasi absen (opsional)','<input class="in" type="file" name="foto" accept="image/*" capture="environment">')}
  <button class="btn">Simpan absensi</button>
 </form>
 ${user.role==='sek'||user.role==='bend'?`${H2('Rekap upah terbaru')}<section class="pn !py-0">${rekapAbsen().slice(0,6).map(x=>`<div class="rl py-3 flex justify-between"><span class="text-sm">${fd(x[0])}, ${x[1]} hadir</span><b class="text-sm">${rp(x[2])}</b></div>`).join('')||empty('Belum ada absensi.')}</section>`:''}`;
};
function rekapAbsen(){const m={};db.TRX_ABSEN.forEach(x=>{m[x.tanggal]=m[x.tanggal]||[x.tanggal,0,0];if(x.hadir==='Ya')m[x.tanggal][1]++;m[x.tanggal][2]+=num(x.total_upah_hari_ini)});return Object.values(m).sort((a,b)=>b[0].localeCompare(a[0]))}
A.absen=()=>{if(db.DB_PEKERJA.length)absUpd(1)};
function absUpd(r){
 const f=$('fa'),d=f.tgl.value;
 if(r)$('wl').innerHTML=db.DB_PEKERJA.map(w=>{const o=db.TRX_ABSEN.find(x=>x.tanggal===d&&x.nama_tukang===w.nama);return `<label class="rw" style="min-height:60px"><input type="checkbox" name="w" value="${w.id}" ${o&&o.hadir==='Ya'?'checked':''} onchange="absUpd()" style="width:26px;height:26px;accent-color:#1E3A8A"><span class="flex-1">${esc(w.nama)}<br><span class="mu text-xs">${esc(w.jabatan)}</span></span><b class="text-sm">${rp(w.upah)}</b></label>`}).join('');
 const t=[...f.querySelectorAll('input[name=w]:checked')].reduce((s,c)=>s+num(db.DB_PEKERJA.find(w=>w.id===c.value).upah),0);$('up').textContent=rp(t);
}
async function subAbsen(e){
 e.preventDefault();const f=e.target,d=f.tgl.value,ck=[...f.querySelectorAll('input[name=w]:checked')].map(c=>c.value);
 if(!ck.length&&!(await ask('Tidak ada pekerja hadir. Simpan sebagai hari tanpa kerja?')))return;
 const foto=await img(f.foto.files[0]);
 db.TRX_ABSEN=db.TRX_ABSEN.filter(x=>x.tanggal!==d);db.TRX_KEUANGAN=db.TRX_KEUANGAN.filter(x=>!(x.sumber==='Upah'&&x.tanggal===d));
 let tot=0;db.DB_PEKERJA.forEach((w,i)=>{const h=ck.includes(w.id);tot+=h?num(w.upah):0;db.TRX_ABSEN.push({tanggal:d,nama_tukang:w.nama,jabatan:w.jabatan,hadir:h?'Ya':'Tidak',upah_harian:num(w.upah),total_upah_hari_ini:h?num(w.upah):0,foto_absen_url:i===0?foto:''})});
 if(tot>0)db.TRX_KEUANGAN.push({tanggal:d,uraian:`Upah ${ck.length} pekerja tanggal ${fd(d)}`,kas_masuk:0,kas_keluar:tot,saldo:0,sumber:'Upah',bukti_url:''});
 log('Absensi',`${fd(d)}: ${ck.length} hadir, ${rp(tot)}`);commit();toast('Absensi disimpan dan upah masuk ke BKU.');go('absen');
}
