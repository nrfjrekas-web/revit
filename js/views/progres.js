V.progres=()=>{
 if(!db.DB_RAB.length)return `<div class="pn">${empty('Belum ada item pekerjaan RAB.',user.role==='sek'?'<button class="btn mt-4" onclick="go(\'setting\')">Tambah RAB di Pengaturan</button>':'')}</div>`;
 const h=db.TRX_PROGRES.map((x,i)=>[x,i]).slice(-6).reverse();
 return `<form id="fp" class="pn" onsubmit="subProgres(event)">
  ${F('Tanggal',`<input class="in" type="date" name="tgl" value="${today()}" required>`)}
  ${F('Pekerjaan',`<select class="in" name="rab" onchange="proUpd()">${rabOpts()}</select>`,'<span id="prev"></span>')}
  ${F('Kemajuan hari ini (persen)','<input class="in" name="p" type="number" min="0" max="100" step="any" inputmode="decimal" required>','<span id="perr" class="bd font-semibold" role="alert"></span>')}
  ${F('Cuaca','<select class="in" name="cuaca"><option>Cerah</option><option>Berawan</option><option>Hujan ringan</option><option>Hujan deras</option></select>')}
  ${F('Kendala','<textarea class="in" name="ken" placeholder="Kosongkan jika tidak ada"></textarea>')}
  ${F('Kebutuhan besok','<textarea class="in" name="beso" placeholder="Material, alat, atau tenaga"></textarea>')}
  ${F('Foto Before (kondisi sebelum dikerjakan)','<input class="in" type="file" name="f1" accept="image/*" capture="environment">','Disimpan di folder Progres Before.')}
  ${F('Foto After (kondisi sesudah dikerjakan)','<input class="in" type="file" name="f3" accept="image/*" capture="environment">','Disimpan di folder Progres After.')}
  <button class="btn" id="pb">Simpan progres</button>
 </form>
 ${H2('Laporan terakhir')}
 <section class="pn !py-0">${h.length?h.map(([x,i])=>`<div class="rl py-3"><div class="flex justify-between gap-3"><p class="font-semibold text-sm">${esc(x.pekerjaan)}</p><b class="text-sm">${fmt(x.persen_kumulatif)}%</b></div><p class="mu text-xs">${fd(x.tanggal)}, ${esc(x.cuaca)}, naik ${fmt(x.persen_hari_ini)}%${x.kendala?', kendala: '+esc(x.kendala):''}</p>${ACT('progres',i)}</div>`).join(''):empty('Belum ada laporan progres. Isi formulir di atas setiap hari kerja.')}</section>`;
};
A.progres=()=>{if(db.DB_RAB.length)proUpd()};
const sumP=(id,sk)=>db.TRX_PROGRES.reduce((t,x,i)=>t+(x.id_rab===id&&i!==sk?num(x.persen_hari_ini):0),0);
function proUpd(){const f=$('fp'),k=sumP(f.rab.value,EDIT&&EDIT.k==='progres'?EDIT.i:-1);$('prev').textContent='Kumulatif saat ini '+fmt(k)+'%. Sisa yang bisa diisi '+fmt(100-k)+'%.'}
async function subProgres(e){
 e.preventDefault();const f=e.target,r=rab(f.rab.value),p=num(f.p.value),ed=EDIT&&EDIT.k==='progres'?EDIT.i:-1,o=ed>=0?db.TRX_PROGRES[ed]:null,k=sumP(r.id_rab,ed);
 if(p<=0)return toast('Kemajuan harus lebih dari 0.','err');
 if(k+p>100.0001){$('perr').textContent=`Melebihi 100%. Maksimal ${fmt(100-k)}%.`;return}
 $('pb').disabled=true;const fo=await Promise.all([f.f1,f.f3].map(i=>img(i.files[0])));
 const rec={tanggal:f.tgl.value,cuaca:f.cuaca.value,id_rab:r.id_rab,pekerjaan:r.uraian_pekerjaan,persen_hari_ini:p,persen_kumulatif:k+p,kendala:f.ken.value,kebutuhan_besok:f.beso.value,foto1_url:fo[0]||(o?o.foto1_url:''),foto3_url:fo[1]||(o?o.foto3_url:''),foto2_url:o&&o.foto2_url?o.foto2_url:'',input_oleh:user.nama};
 if(o)db.TRX_PROGRES[ed]=rec;else db.TRX_PROGRES.push(rec);recumul();
 log(o?'Ubah progres harian':'Progres harian',`${r.id_rab} ${fmt(p)}%`);EDIT=null;commit();toast(o?'Perubahan disimpan.':'Progres disimpan.');go('progres');
}
