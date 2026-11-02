V.masuk=()=>{
 if(!db.DB_MATERIAL.length)return `<div class="pn">${empty('Daftar material kosong.','<button class="btn mt-4" onclick="go(\'setting\')">Tambah material di Pengaturan</button>')}</div>`;
 const h=db.TRX_MASUK.map((x,i)=>[x,i]).slice(-8).reverse();
 return `<form id="fm" class="pn" onsubmit="subMasuk(event)">
  ${F('Tanggal terima',`<input class="in" type="date" name="tgl" value="${today()}" required>`)}
  ${F('Material',`<select class="in" name="mat" onchange="masUpd(1)">${matOpts()}</select>`)}
  <div class="grid grid-cols-2 gap-3">${F('Jumlah',`<input class="in" name="qty" type="number" min="0" step="any" inputmode="decimal" oninput="masUpd()" required>`,'<span id="sat"></span>')}${F('Harga beli satuan',`<input class="in" name="harga" type="number" min="0" inputmode="numeric" oninput="masUpd()" required>`,'<span id="acu"></span>')}</div>
  <p class="font-bold mb-4" id="tot">Total Rp 0</p>
  ${F('Supplier / toko','<input class="in" name="sup" required>')}
  ${F('Nomor nota','<input class="in" name="nota">')}
  ${F('Foto nota atau kwitansi (wajib)','<input class="in" type="file" name="foto" accept="image/*" capture="environment" required>','Foto bukti pembelian. Dikecilkan otomatis sebelum disimpan.')}
  ${F('Foto barang yang diterima (wajib)','<input class="in" type="file" name="fotob" accept="image/*" capture="environment" required>','Foto fisik material yang datang, terpisah dari foto nota.')}
  <button class="btn">Simpan barang masuk</button>
 </form>
 ${H2('Penerimaan terakhir')}
 <section class="pn !py-0">${h.length?h.map(([x,i])=>`<div class="rl py-3"><div class="flex gap-3 justify-between"><div><p class="font-semibold text-sm">${esc(x.nama_material)}: ${fmt(x.qty)} ${esc(x.satuan)}</p><p class="mu text-xs">${fd(x.tanggal)}, ${esc(x.supplier)}, nota ${esc(x.no_nota||'-')}</p></div><b class="text-sm whitespace-nowrap">${rp(x.total_harga)}</b></div>${thumbs(x,i)}${ACT('masuk',i)}</div>`).join(''):empty('Belum ada barang masuk. Catat pembelian pertama lewat formulir di atas.')}</section>`;
};
const thumbs=(x,i)=>x.foto_nota_url||x.foto_barang_url?`<div class="flex gap-2 mt-2">${[['nota','Nota',x.foto_nota_url],['barang','Barang',x.foto_barang_url]].map(([k,l,u])=>u?`<button type="button" class="thumb" onclick="lihatFoto('masuk',${i},'${k}')" aria-label="Lihat foto ${l.toLowerCase()}"><img src="${u}" alt="Foto ${l.toLowerCase()}"><span>${l}</span></button>`:'').join('')}</div>`:'';
A.masuk=()=>{if(db.DB_MATERIAL.length)masUpd(1)};
function masUpd(r){const f=$('fm'),m=mat(f.mat.value);$('sat').textContent='Satuan: '+m.satuan;$('acu').textContent='Acuan SIPLah '+rp(m.harga_acuan_siplah);if(r)f.harga.value=m.harga_acuan_siplah;$('tot').textContent='Total '+rp(num(f.qty.value)*num(f.harga.value))}
async function subMasuk(e){
 e.preventDefault();const f=e.target,m=mat(f.mat.value),q=num(f.qty.value),h=num(f.harga.value);
 if(q<=0||h<=0)return toast('Jumlah dan harga harus lebih dari 0.','err');
 const ed=EDIT&&EDIT.k==='masuk'?EDIT.i:-1,o=ed>=0?db.TRX_MASUK[ed]:null,snap=JSON.stringify(db);
 const foto=(await img(f.foto.files[0]))||(o?o.foto_nota_url:''),fotoB=(await img(f.fotob.files[0]))||(o?o.foto_barang_url:'');
 if(!foto||!fotoB)return toast('Foto nota dan foto barang wajib diisi, keduanya terpisah.','err');
 const r={tanggal:f.tgl.value,id_material:m.id_material,nama_material:m.nama_material,qty:q,satuan:m.satuan,harga_beli:h,total_harga:q*h,supplier:f.sup.value,no_nota:f.nota.value,foto_nota_drive_id:'',foto_nota_url:foto,foto_barang_url:fotoB,input_oleh:user.nama};
 if(o){dropBku(o);db.TRX_MASUK[ed]=r}else db.TRX_MASUK.push(r);
 db.TRX_KEUANGAN.push({tanggal:r.tanggal,uraian:`Belanja ${m.nama_material} ${fmt(q)} ${m.satuan}, nota ${r.no_nota||'-'}`,kas_masuk:0,kas_keluar:r.total_harga,saldo:0,sumber:'Material',bukti_url:foto?'foto_nota_url':''});
 if(!guard(snap))return;
 log(o?'Ubah barang masuk':'Barang masuk',`${m.nama_material} ${fmt(q)} ${m.satuan}`);EDIT=null;commit();toast(o?'Perubahan disimpan.':'Barang masuk disimpan dan kas keluar tercatat.');go('masuk');
}
