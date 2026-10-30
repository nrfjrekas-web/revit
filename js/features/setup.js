/* Pengaturan awal (pertama kali dipakai) dan hapus data perangkat */
const SF=(k,l,o={})=>F(l,`<input class="in" name="${k}" type="${o.t||'text'}" ${o.m?'inputmode="numeric" maxlength="4" pattern="[0-9]{4}"':''} ${o.r?'required':''} value="${esc(o.v||'')}" placeholder="${esc(o.p||'')}" autocomplete="off">`,o.h);
function loginInfo(){const n=C().nama_sekolah;$('lgSub').textContent=n?'Administrasi revitalisasi '+n:'Administrasi revitalisasi sekolah'}
function showSetup(){
 $('setup').innerHTML=`<h1 class="text-[28px] font-extrabold leading-tight" style="color:var(--navy)">Pengaturan awal</h1>
 <p class="mu mt-1 mb-5">Isi sekali saja. Semua bisa diubah nanti di Pengaturan.</p>
 <form onsubmit="subSetup(event)">
 <h2 class="text-[17px] font-bold mb-2">Sekolah</h2>
 ${SF('nama_sekolah','Nama sekolah',{r:1})}${SF('alamat','Alamat')}${SF('kode_desa','Kode desa')}${SF('kop_atas','Baris atas kop surat (opsional)',{p:'contoh: PEMERINTAH KABUPATEN ...'})}${SF('kota_ttd','Kota untuk tanda tangan',{p:'contoh: Jember'})}
 <h2 class="text-[17px] font-bold mt-6 mb-2">Proyek</h2>
 ${SF('tahun_anggaran','Tahun anggaran',{v:new Date().getFullYear()})}${SF('tgl_mulai','Tanggal mulai pekerjaan (minggu 1)',{t:'date',r:1})}
 <h2 class="text-[17px] font-bold mt-6 mb-2">Pejabat (boleh dikosongkan dulu)</h2>
 ${SF('nama_kepsek','Nama kepala sekolah')}${SF('nip_kepsek','NIP kepala sekolah')}${SF('nama_sekretaris','Nama sekretaris')}${SF('nama_mandor','Nama mandor')}${SF('nama_komite','Nama ketua komite')}
 <h2 class="text-[17px] font-bold mt-6 mb-2">PIN akses (4 angka, harus berbeda)</h2>
 ${SF('pin_sekretaris','PIN sekretaris',{m:1,r:1})}${SF('pin_mandor','PIN mandor',{m:1,r:1})}${SF('pin_kepsek','PIN kepala sekolah',{m:1,r:1})}
 <button class="btn">Simpan dan mulai</button></form>
 <details class="mt-8"><summary class="font-semibold">Perangkat baru? Ambil data dari Google Sheet</summary>
 <div class="mt-3">${F('URL Web App','<input class="in" id="sgas" placeholder="https://script.google.com/macros/s/.../exec">')}${F('Kata sandi sinkron','<input class="in" id="stok">')}<button type="button" class="btn alt" onclick="pullAwal()">Tarik data dari Sheet</button></div></details>`;
 $('setup').hidden=false;
}
function subSetup(e){e.preventDefault();const f=new FormData(e.target),o={};for(const[k,v]of f)o[k]=String(v).trim();
 const pins=[o.pin_sekretaris,o.pin_mandor,o.pin_kepsek];
 if(!o.nama_sekolah)return toast('Nama sekolah wajib diisi.','err');
 if(!o.tgl_mulai)return toast('Tanggal mulai pekerjaan wajib diisi.','err');
 if(!pins.every(p=>/^[0-9]{4}$/.test(p)))return toast('Setiap PIN harus 4 angka.','err');
 if(new Set(pins).size<3)return toast('Ketiga PIN harus berbeda.','err');
 Object.assign(db.CONFIG,o);user={role:'sek',nama:'Sekretaris'};log('Pengaturan','Pengaturan awal selesai');commit();ls.set(K+'_u','sek');$('setup').hidden=true;enter()}
async function resetData(){if(!(await ask('Hapus semua data di perangkat ini? Pengaturan awal akan diulang.')))return;ls.del(K);ls.del(K+'_u');user=null;boot()}
