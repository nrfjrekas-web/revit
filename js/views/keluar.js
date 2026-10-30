V.keluar=()=>{
 if(!db.DB_MATERIAL.length||!db.DB_RAB.length)return `<div class="pn">${empty('Material atau RAB belum ada.','<button class="btn mt-4" onclick="go(\'setting\')">Buka Pengaturan</button>')}</div>`;
 const h=db.TRX_KELUAR.map((x,i)=>[x,i]).slice(-8).reverse();
 return `<form id="fk" class="pn" onsubmit="subKeluar(event)">
  ${F('Tanggal ambil',`<input class="in" type="date" name="tgl" value="${today()}" required>`)}
  ${F('Material',`<select class="in" name="mat" onchange="kelUpd()">${matOpts()}</select>`)}
  <div class="rounded p-3 mb-4" style="background:var(--bg)"><span class="mu text-sm">Sisa stok sekarang</span><p class="text-2xl font-extrabold" id="sisa"></p></div>
  ${F('Jumlah diambil','<input class="in" name="qty" type="number" min="0" step="any" inputmode="decimal" oninput="kelUpd()" required>','<span id="kerr" class="bd font-semibold" role="alert"></span>')}
  ${F('Untuk pekerjaan',`<select class="in" name="rab">${rabOpts()}</select>`)}
  ${F('Penerima','<input class="in" name="pen" required>')}
  <button class="btn" id="kb" disabled>Simpan barang keluar</button>
 </form>
 ${H2('Pengambilan terakhir')}
 <section class="pn !py-0">${h.length?h.map(([x,i])=>`<div class="rl py-3"><p class="font-semibold text-sm">${esc(x.nama_material)}: ${fmt(x.qty)} ${esc(x.satuan)}</p><p class="mu text-xs">${fd(x.tanggal)}, untuk ${esc(x.untuk_pekerjaan_nama)}, penerima ${esc(x.penerima_mandor)}</p>${ACT('keluar',i)}</div>`).join(''):empty('Belum ada barang keluar.')}</section>`;
};
A.keluar=()=>{if(db.DB_MATERIAL.length&&db.DB_RAB.length)kelUpd()};
function avail(id){const o=EDIT&&EDIT.k==='keluar'?db.TRX_KELUAR[EDIT.i]:null;return stok(id)+(o&&o.id_material===id?num(o.qty):0)}
function kelUpd(){const f=$('fk'),m=mat(f.mat.value),s=avail(m.id_material),q=num(f.qty.value);$('sisa').textContent=fmt(s)+' '+m.satuan;$('kerr').textContent=q>s?`Jumlah melebihi stok. Maksimal ${fmt(s)} ${m.satuan}.`:'';$('kb').disabled=q<=0||q>s}
function subKeluar(e){
 e.preventDefault();const f=e.target,m=mat(f.mat.value),q=num(f.qty.value),r=rab(f.rab.value);
 if(q<=0||q>avail(m.id_material))return toast('Jumlah melebihi stok yang tersedia.','err');
 const ed=EDIT&&EDIT.k==='keluar'?EDIT.i:-1,rec={tanggal:f.tgl.value,id_material:m.id_material,nama_material:m.nama_material,qty:q,satuan:m.satuan,untuk_pekerjaan_id_rab:r.id_rab,untuk_pekerjaan_nama:r.uraian_pekerjaan,penerima_mandor:f.pen.value,input_oleh:user.nama};
 if(ed>=0)db.TRX_KELUAR[ed]=rec;else db.TRX_KELUAR.push(rec);
 log(ed>=0?'Ubah barang keluar':'Barang keluar',`${m.nama_material} ${fmt(q)} ${m.satuan} untuk ${r.id_rab}`);EDIT=null;commit();toast(ed>=0?'Perubahan disimpan.':'Barang keluar disimpan.');go('keluar');
}
