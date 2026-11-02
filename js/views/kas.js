V.kas=()=>`
 <section class="pn"><p class="mu text-sm">Saldo kas saat ini</p><p class="text-3xl font-extrabold ${saldo()<0?'bd':''}">${rp(saldo())}</p></section>
 ${H2('Catat pencairan dana')}
 <form id="fs" class="pn" onsubmit="subKas(event)">
  ${F('Tahap','<select class="in" name="th"><option>Tahap 1</option><option>Tahap 2</option><option>Tahap 3</option></select>')}
  ${F('Tanggal',`<input class="in" type="date" name="tgl" value="${today()}" required>`)}
  ${F('Jumlah dicairkan','<input class="in" name="jml" type="number" min="1" inputmode="numeric" required>')}
  <button class="btn em">Simpan pencairan</button>
 </form>
 ${H2('Catat pengeluaran lain')}
 <form id="fx" class="pn" onsubmit="subKasx(event)">
  ${F('Kategori','<select class="in" name="kat"><option>ATK</option><option>Transport</option><option>Konsumsi</option><option>Pajak</option><option>Sewa alat</option><option>Lain-lain</option></select>')}
  ${F('Tanggal',`<input class="in" type="date" name="tgl" value="${today()}" required>`)}
  ${F('Keterangan','<input class="in" name="ur" maxlength="120" required>','Contoh: Beli ATK untuk laporan, bukan material bangunan.')}
  ${F('Jumlah dibayar','<input class="in" name="jml" type="number" min="1" inputmode="numeric" required>')}
  <button class="btn">Simpan pengeluaran</button>
 </form>
 ${H2('Buku kas umum')}
 <section class="pn !py-0">${db.TRX_KEUANGAN.length?db.TRX_KEUANGAN.map((x,i)=>[x,i]).reverse().map(([x,i])=>`<div class="rl py-3"><div class="flex justify-between items-start gap-3"><p class="text-sm leading-snug">${esc(x.uraian)}</p><b class="text-sm whitespace-nowrap ${x.kas_masuk?'ok':''}">${x.kas_masuk?'+ '+rp(x.kas_masuk):'- '+rp(x.kas_keluar)}</b></div><div class="flex justify-between mu text-xs mt-1"><span>${fd(x.tanggal)}, ${esc(x.sumber)}</span><span>Saldo ${rp(x.saldo)}</span></div>${x.sumber==='Pencairan'?ACT('kas',i):x.sumber==='Pengeluaran'?ACT('kasx',i):'<p class="mu text-xs mt-1">Otomatis dari '+(x.sumber==='Upah'?'absensi':'barang masuk')+'. Ubah lewat halaman asalnya.</p>'}</div>`).join(''):empty('BKU masih kosong. Catat pencairan tahap 1 untuk memulai.')}</section>`;
function subKas(e){e.preventDefault();const f=e.target,j=num(f.jml.value);if(j<=0)return toast('Jumlah harus lebih dari 0.','err');const ed=EDIT&&EDIT.k==='kas'?EDIT.i:-1,rec={tanggal:f.tgl.value,uraian:'Pencairan dana '+f.th.value,kas_masuk:j,kas_keluar:0,saldo:0,sumber:'Pencairan',bukti_url:''};if(ed>=0)db.TRX_KEUANGAN[ed]=rec;else db.TRX_KEUANGAN.push(rec);log(ed>=0?'Ubah pencairan':'Pencairan dana',f.th.value+' '+rp(j));EDIT=null;commit();toast(ed>=0?'Perubahan disimpan.':'Pencairan dicatat.');go('kas')}

function subKasx(e){e.preventDefault();const f=e.target,j=num(f.jml.value),u=f.ur.value.trim();if(j<=0||!u)return toast('Isi keterangan dan jumlah lebih dari 0.','err');const ed=EDIT&&EDIT.k==='kasx'?EDIT.i:-1,rec={tanggal:f.tgl.value,uraian:f.kat.value+': '+u,kas_masuk:0,kas_keluar:j,saldo:0,sumber:'Pengeluaran',bukti_url:''};if(ed>=0)db.TRX_KEUANGAN[ed]=rec;else db.TRX_KEUANGAN.push(rec);log(ed>=0?'Ubah pengeluaran':'Pengeluaran lain',rec.uraian+' '+rp(j));EDIT=null;commit();toast(ed>=0?'Perubahan disimpan.':'Pengeluaran dicatat.');go('kas')}
