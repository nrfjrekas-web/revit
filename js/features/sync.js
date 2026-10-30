/* Sinkronisasi Google Sheet: kirim (push) dan tarik (pull). Backend: backend/Code.gs */
function gasCfg(){const u=$('gas').value.trim(),t=$('gtok').value.trim();if(!u||!t){toast('Isi URL Web App dan kata sandi sinkron.','err');return null}db.CONFIG.gas_url=u;db.CONFIG.gas_token=t;return{u,t}}
async function push(force){const g=gasCfg();if(!g)return;clearTimeout(SY.t);commit();try{const cfg=Object.assign({},db.CONFIG);delete cfg.gas_url;delete cfg.gas_token;delete cfg.gas_ver;const data=Object.assign({},db,{CONFIG:cfg});const r=await(await fetch(g.u,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({token:g.t,base:num(db.CONFIG.gas_ver),force:!!force,data})})).json();
 if(r.error)return toast(r.error==='token'?'Kata sandi sinkron salah.':'Server sibuk atau format salah, coba lagi.','err');
 if(r.conflict){if(await ask('Data di Google Sheet lebih baru (diubah dari perangkat lain). Timpa dengan data perangkat ini? Bila tidak, tekan Tarik dari Sheet untuk mengambil data terbaru.'))return push(true);return}
 (r.photos||[]).forEach(p=>{const row=db[p.t]&&db[p.t][p.i];if(row&&String(row[p.c]).indexOf('data:image')===0)row[p.c]=p.url});
 db.CONFIG.gas_ver=r.ver;SY.applying=true;commit();SY.applying=false;ls.del(K+'_dirty');SY.askd=false;syStat('Tersinkron '+jam());toast('Data terkirim ke Sheet (versi '+r.ver+').');go(page)}catch(e){toast('Gagal mengirim: '+e.message,'err')}}
async function tarik(u,t,guard){const d=await(await fetch(u+(u.indexOf('?')<0?'?':'&')+'action=pull&token='+encodeURIComponent(t))).json();
 if(d.error)throw new Error(d.error==='token'?'kata sandi sinkron salah':d.error);
 if(!d.CONFIG)throw new Error('Sheet masih kosong. Kirim data dulu dari perangkat utama.');
 if(guard&&guard())throw new Error('batal');
 Object.keys(SEED).forEach(k=>{if(d[k]!==undefined)db[k]=Array.isArray(SEED[k])?d[k]:Object.assign({},SEED[k],d[k])});
 Object.assign(db.CONFIG,{gas_url:u,gas_token:t,gas_ver:d.ver});SY.applying=true;commit();SY.applying=false;ls.del(K+'_dirty')}
async function pull(){const g=gasCfg();if(!g)return;if(!(await ask('Data di perangkat akan diganti dengan data dari Google Sheet. Lanjutkan?')))return;try{clearTimeout(SY.t);await tarik(g.u,g.t);SY.askd=false;syStat('Tersinkron '+jam());toast('Data ditarik dari Sheet.');go(page)}catch(e){toast('Gagal menarik data: '+e.message,'err')}}
async function pullAwal(){const u=$('sgas').value.trim(),t=$('stok').value.trim();if(!u||!t)return toast('Isi URL Web App dan kata sandi sinkron.','err');try{await tarik(u,t);if(!C().pin_sekretaris)throw new Error('data di Sheet belum memuat PIN');toast('Data ditarik dari Sheet.');boot()}catch(e){toast('Gagal menarik data: '+e.message,'err')}}

/* ===== Sinkron otomatis: kirim setelah ada perubahan, tarik berkala bila Sheet lebih baru ===== */
const SY={t:null,busy:false,applying:false,seq:0,askd:false,stat:''};
const jam=()=>new Date().toTimeString().slice(0,5);
const syCfg=()=>!!(db&&db.CONFIG&&db.CONFIG.gas_url&&db.CONFIG.gas_token);
const syOn=()=>syCfg()&&ls.get(K+'_auto')!=='0';
const syDirty=()=>ls.get(K+'_dirty')==='1';
const syOffline=()=>typeof navigator!=='undefined'&&navigator.onLine===false;
function syStat(s){SY.stat=s;const e=$('sstat');if(e)e.textContent=s}
function syMark(){if(SY.applying||!syCfg())return;SY.seq++;ls.set(K+'_dirty','1');clearTimeout(SY.t);
 if(!syOn()){syStat('Ada perubahan yang belum dikirim.');return}
 syStat('Menunggu kirim...');SY.t=setTimeout(syPush,4000)}
async function syPush(force){
 if(SY.busy||!syOn()||!syDirty())return;
 if(syOffline()){syStat('Offline. Dikirim otomatis saat tersambung.');return}
 SY.busy=true;const seq=SY.seq;syStat('Mengirim...');
 try{
  const c=db.CONFIG,cfg=Object.assign({},c);delete cfg.gas_url;delete cfg.gas_token;delete cfg.gas_ver;
  const data=Object.assign({},db,{CONFIG:cfg});
  const r=await(await fetch(c.gas_url,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({token:c.gas_token,base:num(c.gas_ver),force:force===true,data})})).json();
  if(r.error){syStat(r.error==='token'?'Kata sandi sinkron salah.':'Server sibuk, dicoba lagi.');if(r.error!=='token')SY.t=setTimeout(syPush,30000);return}
  if(r.conflict){syStat('Konflik: Sheet lebih baru dari perangkat ini.');
   if(!SY.askd){SY.askd=true;SY.busy=false;if(await ask('Data di Google Sheet lebih baru (diubah dari perangkat lain). Timpa dengan data perangkat ini? Bila tidak, buka Pengaturan lalu tekan Tarik dari Sheet.'))return syPush(true)}
   return}
  (r.photos||[]).forEach(p=>{const row=db[p.t]&&db[p.t][p.i];if(row&&String(row[p.c]).indexOf('data:image')===0)row[p.c]=p.url});
  db.CONFIG.gas_ver=r.ver;SY.applying=true;commit();SY.applying=false;SY.askd=false;
  if(SY.seq===seq){ls.del(K+'_dirty');syStat('Tersinkron '+jam())}else{SY.t=setTimeout(syPush,1500)}
 }catch(e){SY.applying=false;syStat('Gagal kirim, dicoba lagi otomatis.');SY.t=setTimeout(syPush,30000)}
 finally{SY.busy=false}
}
const syEditing=()=>{const a=typeof document!=='undefined'&&document.activeElement;return !!a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName||'')};
async function syPull(){
 if(SY.busy||!syOn()||syDirty()||syOffline())return;
 SY.busy=true;const seq=SY.seq;
 try{
  const c=db.CONFIG;
  const v=await(await fetch(c.gas_url+(c.gas_url.indexOf('?')<0?'?':'&')+'action=ver&token='+encodeURIComponent(c.gas_token))).json();
  if(v.error||v.ver===undefined||num(v.ver)<=num(c.gas_ver))return;
  if(syEditing())return;
  await tarik(c.gas_url,c.gas_token,()=>SY.seq!==seq||syDirty());
  SY.askd=false;syStat('Diperbarui dari Sheet '+jam());toast('Data diperbarui dari perangkat lain.');
  if(user)go(page)
 }catch(e){if(e.message!=='batal')syStat('Gagal memeriksa Sheet.')}
 finally{SY.busy=false}
}
function syToggle(){const on=ls.get(K+'_auto')==='0';ls.set(K+'_auto',on?'1':'0');if(on){syStat('Sinkron otomatis aktif.');syPush();syPull()}else syStat('Sinkron otomatis dimatikan.');go(page)}
function syStart(){
 if(typeof setInterval==='function')setInterval(syPull,45000);
 if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){syPush();syPull()}});
 if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('online',()=>{syPush();syPull()});
 setTimeout(async()=>{await syPush();syPull()},2500)}
syStart();
