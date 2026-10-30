/* Sinkronisasi Google Sheet: kirim (push) dan tarik (pull). Backend: backend/Code.gs */
function gasCfg(){const u=$('gas').value.trim(),t=$('gtok').value.trim();if(!u||!t){toast('Isi URL Web App dan kata sandi sinkron.','err');return null}db.CONFIG.gas_url=u;db.CONFIG.gas_token=t;return{u,t}}
async function push(force){const g=gasCfg();if(!g)return;commit();try{const cfg=Object.assign({},db.CONFIG);delete cfg.gas_url;delete cfg.gas_token;delete cfg.gas_ver;const data=Object.assign({},db,{CONFIG:cfg});const r=await(await fetch(g.u,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({token:g.t,base:num(db.CONFIG.gas_ver),force:!!force,data})})).json();
 if(r.error)return toast(r.error==='token'?'Kata sandi sinkron salah.':'Server sibuk atau format salah, coba lagi.','err');
 if(r.conflict){if(await ask('Data di Google Sheet lebih baru (diubah dari perangkat lain). Timpa dengan data perangkat ini? Bila tidak, tekan Tarik dari Sheet untuk mengambil data terbaru.'))return push(true);return}
 (r.photos||[]).forEach(p=>{const row=db[p.t]&&db[p.t][p.i];if(row&&String(row[p.c]).indexOf('data:image')===0)row[p.c]=p.url});
 db.CONFIG.gas_ver=r.ver;commit();toast('Data terkirim ke Sheet (versi '+r.ver+').');go(page)}catch(e){toast('Gagal mengirim: '+e.message,'err')}}
async function tarik(u,t){const d=await(await fetch(u+(u.indexOf('?')<0?'?':'&')+'action=pull&token='+encodeURIComponent(t))).json();
 if(d.error)throw new Error(d.error==='token'?'kata sandi sinkron salah':d.error);
 if(!d.CONFIG)throw new Error('Sheet masih kosong. Kirim data dulu dari perangkat utama.');
 Object.keys(SEED).forEach(k=>{if(d[k]!==undefined)db[k]=Array.isArray(SEED[k])?d[k]:Object.assign({},SEED[k],d[k])});
 Object.assign(db.CONFIG,{gas_url:u,gas_token:t,gas_ver:d.ver});commit()}
async function pull(){const g=gasCfg();if(!g)return;if(!(await ask('Data di perangkat akan diganti dengan data dari Google Sheet. Lanjutkan?')))return;try{await tarik(g.u,g.t);toast('Data ditarik dari Sheet.');go(page)}catch(e){toast('Gagal menarik data: '+e.message,'err')}}
async function pullAwal(){const u=$('sgas').value.trim(),t=$('stok').value.trim();if(!u||!t)return toast('Isi URL Web App dan kata sandi sinkron.','err');try{await tarik(u,t);if(!C().pin_sekretaris)throw new Error('data di Sheet belum memuat PIN');toast('Data ditarik dari Sheet.');boot()}catch(e){toast('Gagal menarik data: '+e.message,'err')}}
