/* ===== LAPORAN REVIT (format P2SP, mengikuti contoh PDF Laporan Pendahuluan) =====
   Khusus Operator. Isi: halaman 1 = kop program + tabel pekerjaan + tanda tangan,
   halaman 2 = dokumentasi foto Before/After dari progres harian pada periode itu. */
PG.lrevit='Laporan Revit';IC.lrevit=IC.laporan;

const kumSd=(id,z)=>Math.max(0,...db.TRX_PROGRES.filter(x=>x.id_rab===id&&x.tanggal<=z).map(x=>num(x.persen_kumulatif)));
const fisikSd=z=>db.DB_RAB.reduce((t,r)=>t+bobot(r)*kumSd(r.id_rab,z)/100,0);

V.lrevit=()=>{
 const tombol=(k,j)=>`<button class="btn alt" onclick="cetakRevit('${k}',${k==='m'?'+':''}$('${j}').value)">Lihat laporan</button>`;
 return `<p class="mu text-sm mb-4">Laporan dengan format Program Revitalisasi (kop program, tabel pekerjaan, tanda tangan Kepala Sekolah, P2SP, Pengawas, dan lembar dokumentasi foto). Ketuk Lihat laporan, lalu cetak atau simpan sebagai PDF.</p>
 <section class="pn">
  ${F('Harian: pilih tanggal',`<input class="in" type="date" id="rvd" value="${today()}">`)}${tombol('h','rvd')}
  <div class="mb-5"></div>
  ${F('Mingguan: pilih minggu',`<select class="in" id="rvm">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${i+1===mingguKe()?'selected':''}>Minggu ${i+1}</option>`).join('')}</select>`)}${tombol('m','rvm')}
  <div class="mb-5"></div>
  ${F('Bulanan: pilih bulan',`<input class="in" type="month" id="rvb" value="${today().slice(0,7)}">`)}${tombol('b','rvb')}
 </section>
 <p class="mu text-xs mt-3">Nama sekolah, NPSN, Kab/Kota, Provinsi, P2SP, Pengawas, nomor PKS, dan dana 70% diisi di Pengaturan, bagian Identitas dan pejabat.</p>`;
};

function rentangRevit(k,v){
 if(k==='h')return[v,v,'HARIAN','Tanggal '+longD(v)];
 if(k==='m'){const a=addD(C().tgl_mulai,(v-1)*7),z=addD(a,6);return[a,z,'MINGGUAN KE-'+v,'Periode '+fd(a)+' sampai '+fd(z)]}
 const[y,m]=v.split('-').map(Number),a=v+'-01',z=v+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0');
 return[a,z,'BULANAN','Bulan '+new Date(y,m-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'})]
}
const rvOk=u=>/^(data:image\/|https:\/\/)/.test(String(u||''));
const rvTgl=d=>d?longD(d):'-';

const BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const tglS=d=>{if(!d)return '-';const[y,m,t]=d.split('-');return t+'-'+BLN[m-1]+'-'+y.slice(2)};
const BARU=[['Ruang Kelas Baru','Ruang'],['Ruang Administrasi','Ruang'],['Ruang Perpustakaan','Ruang'],['Ruang Laboratorium','Ruang'],['Ruang UKS','Ruang'],['Rumah Dinas Guru','Ruang'],['Ruang Inklusi','Ruang'],['Satap','Unit'],['Toilet Baru','Unit']];

function cetakRevit(k,v){
 if(!v)return toast('Pilih tanggal, minggu, atau bulannya dulu.','err');
 if(k==='m'&&!C().tgl_mulai)return toast('Isi tanggal mulai pekerjaan di Pengaturan dulu.','err');
 const[a,z,jenis,per]=rentangRevit(k,v),c=C(),f=fisikSd(z),ib=x=>x.tanggal>=a&&x.tanggal<=z;
 const prog=db.TRX_PROGRES.map((x,i)=>[x,i]).filter(x=>ib(x[0])).sort((p,q)=>p[0].tanggal.localeCompare(q[0].tanggal)||p[1]-q[1]).map(x=>x[0]);
 const kasKeluar=sum(db.TRX_KEUANGAN.filter(x=>x.tanggal<=z),'kas_keluar');
 const naik=r=>sum(prog.filter(x=>x.id_rab===r.id_rab),'persen_hari_ini');
 const ln=(l,t)=>`<tr><td>${l}</td><td>: <span class="bl">${t}</span></td></tr>`;
 const bd=t=>`<tr><td colspan="6" class="g"><b>${t}</b></td></tr>`;
 const adm=num(c.nilai_admin),tot=db.DB_RAB.reduce((t,r)=>t+jumlah(r),0)+adm;
 /* ===== Halaman 1: seperti Laporan Pendahuluan ===== */
 const tabel=`<table class="lb"><tr><th style="width:34px">No.</th><th>Bantuan yang Diterima</th><th style="width:60px">Jumlah</th><th style="width:72px">Satuan</th><th style="width:120px">Nilai Rupiah</th><th style="width:190px">Keterangan</th></tr>
 ${bd('Bangun Baru')}${BARU.map((x,i)=>`<tr><td class="r2">${i+1}</td><td>${x[0]}</td><td class="c">0</td><td>${x[1]}</td><td class="r">-</td><td></td></tr>`).join('')}
 ${bd('Rehab')}${db.DB_RAB.map((r,i)=>`<tr><td class="r2">${i+1}</td><td>${esc(r.uraian_pekerjaan)}</td><td class="c">${fmt(r.volume)}</td><td>${esc(r.satuan)}</td><td class="r">${fmt(jumlah(r))}</td><td class="c">Sesuai PKS, realisasi ${fmt(kumSd(r.id_rab,z))}%${naik(r)?' (naik '+fmt(naik(r))+'%)':''}</td></tr>`).join('')||'<tr><td colspan="6" class="c">Belum ada item RAB.</td></tr>'}
 <tr><td></td><td class="g"><b>Mebeler</b></td><td class="c">0</td><td class="c">-</td><td class="r">-</td><td></td></tr>
 <tr><td></td><td class="g"><b>Administrasi</b></td><td></td><td></td><td class="r">${adm?fmt(adm):'-'}</td><td class="c">Sesuai PKS</td></tr>
 <tr><td></td><td></td><td></td><td class="r">Jumlah</td><td class="r">${fmt(tot)}</td><td class="c">Sesuai PKS</td></tr></table>
 <p style="font-size:11px;margin:3px 0 0 28px">Catatan&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Beri Tanda 0 jika tidak termasuk terima bantuan</p>`;
 const info=[['Tanggal Perjanjian Kerjasama (PKS)',rvTgl(c.tgl_pks)],['No. Perjanjian Kerjasama',esc(c.no_pks||'-')],['Tanggal Dana Masuk Ke Rek Sekolah',rvTgl(c.tgl_dana)],['Dana 70 %',c.dana_70?rp(c.dana_70):'-'],['Lampiran-lampiran','Dokumentasi progres '+fmt(f)+'% bangunan'],['Progres fisik sampai akhir periode',fmt(f)+'%'],['Realisasi dana keluar sampai akhir periode',rp(kasKeluar)]];
 const ttdBox=[['Kepala Sekolah',c.nama_kepsek],['P2SP',c.nama_p2sp],['Pengawas',c.nama_pengawas]];
 const p1=`<div class="lr frm"><h2>PROGRAM REVITALISASI SATUAN PENDIDIKAN SEKOLAH DASAR TAHUN ${esc(c.tahun_anggaran||'')}</h2><h2>LAPORAN ${jenis} (${fmt(f)}%)</h2><p style="text-align:center;font-size:11px;margin-bottom:6px">${per}</p>
  <table class="lid">${ln('Nama Sekolah',esc(c.nama_sekolah))}${ln('NPSN',esc(c.npsn||'-'))}${ln('Kab /Kota',esc(c.kab_kota||'-'))}${ln('Provinsi',esc(c.provinsi||'-'))}</table>
  <p style="margin:8px 0 3px">1. Bantuan yang diterima sekolah adalah</p>${tabel}
  <table class="li" style="margin-top:10px">${info.map((x,i)=>`<tr><td>${i+2}.</td><td>${x[0]}</td><td>: ${x[1]}</td></tr>`).join('')}</table>
  <table class="lsg">${ttdBox.map(x=>`<tr><td><p><b>Nama</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>${esc(x[1]||'..............................')}</b></p><p style="margin-top:8px"><b>Jabatan</b>&nbsp;&nbsp;&nbsp;${x[0]}</p></td><td class="s"><b>Tanda Tangan</b> ....................................................</td></tr>`).join('')}</table></div>`;
 /* ===== Halaman 2: dokumentasi (No, Ketersediaan, Catatan, Foto) ===== */
 let n=0;const baris=[];
 prog.forEach(x=>{
  const m=db.DB_RAB.findIndex(r=>r.id_rab===x.id_rab)+1,ket=`Menu ${m||'-'} ( Rehab ${esc(x.pekerjaan)} )`,tg=k==='h'?'':'<br><span style="font-size:10px">'+tglS(x.tanggal)+'</span>';
  [['Kondisi sebelum dikerjakan (Before)',x.foto1_url],['Kondisi sesudah dikerjakan (After), naik '+fmt(x.persen_hari_ini)+'%, kumulatif '+fmt(x.persen_kumulatif)+'%'+(x.kendala?'. Kendala: '+esc(x.kendala):''),x.foto3_url]].forEach(y=>{
   n++;baris.push(`<tr><td class="c">${n}</td><td>${ket}${tg}</td><td>${y[0]}</td><td class="c">${rvOk(y[1])?`<img class="fl" src="${esc(y[1])}" alt="Foto dokumentasi ${n}">`:'<span style="font-size:10px">Belum ada foto</span>'}</td></tr>`)})});
 const p2=`<div class="lr pb"><h2 style="text-decoration:underline;font-size:15px;margin-bottom:12px">DOKUMENTASI LAPORAN ${jenis} (${fmt(f)}%)</h2>
  <table style="width:100%"><tr><td style="width:62%"><table class="lid">${ln('Nama Sekolah',esc(c.nama_sekolah))}${ln('NPSN',esc(c.npsn||'-'))}</table></td><td style="vertical-align:top;font-size:13px">Tanggal: <span class="bl" style="border-bottom:1px solid #000;display:inline-block;min-width:150px;text-align:center">${k==='h'?tglS(v):tglS(a)+' s/d '+tglS(z)}</span></td></tr></table>
  <table class="lb dk"><tr><th style="width:34px">No</th><th style="width:210px">Ketersediaan</th><th>Catatan</th><th style="width:150px">Foto Dokumentasi</th></tr>${baris.join('')||'<tr><td colspan="4" class="c" style="height:60px">Tidak ada laporan progres pada periode ini.</td></tr>'}</table>
  <div class="ttd" style="margin-top:20px">${[['Kepala Sekolah',c.nama_kepsek],['P2SP',c.nama_p2sp],['PENGAWAS',c.nama_pengawas]].map(x=>`<div>${x[0]}<br><br><br><br><br><u>${esc(x[1]||'..............................')}</u></div>`).join('')}</div></div>`;
 $('print').innerHTML=`<div class="noprint" style="position:sticky;top:0;background:#fff;border-bottom:1px solid #E2E8F0;padding:10px 16px;display:flex;gap:10px;justify-content:center"><button class="btn sm" onclick="print()">Cetak atau simpan PDF</button><button class="btn sm alt" onclick="$('print').hidden=true">Tutup</button></div><div class="doc">${p1}${p2}</div>`;
 $('print').hidden=false;$('print').scrollTop=0;
}
