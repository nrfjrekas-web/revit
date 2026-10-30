// Uji asap tanpa browser: node tools/smoke.js
// Memuat semua <script> dari index.html di node:vm dengan DOM tiruan, lalu menguji alur dari nol.
const vm=require('vm'),fs=require('fs');
const mk=(extra={})=>{const t=Object.assign({style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},children:[],value:'',hidden:false,innerHTML:'',textContent:'',files:[]},extra);
 return new Proxy(t,{get:(o,k)=>k in o?o[k]:(typeof k==='string'?(()=>mk()):undefined),set:(o,k,v)=>(o[k]=v,true)})};
const els={},store={};
const el=id=>els[id]||(els[id]=mk());
class FormData{constructor(f){this.d=Object.entries(f.__data)}[Symbol.iterator](){return this.d[Symbol.iterator]()}}
let sheet={CONFIG:{nama_sekolah:'SD Contoh',pin_sekretaris:'1111',pin_mandor:'2222',pin_kepsek:'3333',tgl_mulai:'2026-11-02',total_rab:0},DB_RAB:[],ver:4};
const ctx={tailwind:{},console,setTimeout,clearTimeout,Promise,JSON,Math,Date,FormData,
 localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},
 document:{getElementById:el,createElement:()=>mk(),body:mk(),addEventListener(){},querySelector:()=>mk(),querySelectorAll:()=>[]},
 navigator:{},scrollTo(){},print(){},fetch:async()=>({json:async()=>sheet})};
ctx.window=ctx;vm.createContext(ctx);
const run=c=>vm.runInContext(c,ctx);
globalThis.els=els;globalThis.store=store;
const root=require('path').resolve(__dirname,'..');
const order=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/<script src="(js\/[^"]+)"/g)].map(m=>m[1]);
run(order.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n'));
const ok=(n,c)=>console.log((c?'LULUS  ':'GAGAL  ')+n);
const ev=(o)=>({preventDefault(){},target:{__data:o}});
ctx.ev=ev;ctx.els=els;ctx.store=store;
ok('pertama dibuka: layar pengaturan awal tampil, login tersembunyi',els.setup.hidden===false&&els.setup.innerHTML.includes('Pengaturan awal')&&els.login.hidden===true);
ok('tidak ada PIN/identitas bawaan',run("!C().pin_sekretaris&&!C().nama_sekolah&&!C().tgl_mulai"));
run(`subSetup(ev({nama_sekolah:'SD Uji',tgl_mulai:'2026-11-02',pin_sekretaris:'1111',pin_mandor:'1111',pin_kepsek:'3333'}))`);
ok('PIN kembar ditolak',els.toast.textContent.includes('berbeda')&&!run('C().pin_sekretaris'));
run(`subSetup(ev({nama_sekolah:'SD Uji',tgl_mulai:'2026-11-02',pin_sekretaris:'12a4',pin_mandor:'2222',pin_kepsek:'3333'}))`);
ok('PIN bukan 4 angka ditolak',els.toast.textContent.includes('4 angka'));
run(`subSetup(ev({nama_sekolah:'',tgl_mulai:'2026-11-02',pin_sekretaris:'1111',pin_mandor:'2222',pin_kepsek:'3333'}))`);
ok('nama sekolah kosong ditolak',els.toast.textContent.includes('Nama sekolah'));
run(`subSetup(ev({nama_sekolah:'SD Uji',alamat:'Jl. A',kota_ttd:'Kota X',tgl_mulai:'2026-11-02',pin_sekretaris:'1111',pin_mandor:'2222',pin_kepsek:'3333'}))`);
ok('setup valid: masuk sebagai Sekretaris, tersimpan',els.main.hidden===false&&els.setup.hidden===true&&run("user.role==='sek'&&C().pin_mandor==='2222'")&&!!store.sirevital_v2);
ok('Beranda menampilkan panel Mulai di sini',run("V.dash().includes('Mulai di sini')"));
run('boot()');ok('buka ulang: sesi pulih, tidak minta setup',els.main.hidden===false&&els.setup.hidden===true);
run('logout()');ok('keluar: layar PIN tampil dengan nama sekolah',els.login.hidden===false&&els.lgSub.textContent.includes('SD Uji'));
run("pressPin('9');pressPin('9');pressPin('9');pressPin('9')");ok('PIN salah ditolak',els.pinErr.textContent.includes('salah'));
run("['2','2','2','2'].forEach(pressPin)");ok('PIN mandor masuk sebagai Mandor',run("user&&user.role==='mandor'"));
run('logout()');run("['3','3','3','3'].forEach(pressPin)");ok('PIN kepsek masuk sebagai Kepala Sekolah',run("user&&user.role==='kepsek'"));
run("user={role:'sek',nama:'Sekretaris'}");
ok('sidebar desktop: Sekretaris melihat 9 halaman, halaman aktif ditandai',run("go('masuk')")===undefined&&(els.side.innerHTML.match(/class=\"sd\"/g)||[]).length===9&&/aria-current="page"><svg[^]*?<span>Barang masuk/.test(els.side.innerHTML)&&els.view.dataset.p==='masuk');
ok('sidebar: Pengaturan bagian dan Laporan mingguan menyorot induknya',(run("go('set2')"),/aria-current="page"[^]*?<span>Pengaturan/.test(els.side.innerHTML))&&(run("go('mingguan')"),/aria-current="page"[^]*?<span>Laporan dan cetak/.test(els.side.innerHTML)));
run("user={role:'mandor',nama:'Mandor'};go('progres')");ok('sidebar: Mandor hanya melihat Progres dan Absen',(els.side.innerHTML.match(/class=\"sd\"/g)||[]).length===2);
run("user={role:'sek',nama:'Sekretaris'}");
const r=run(`(()=>{const bad=[];const chk=(t,f)=>{try{const h=f();if(typeof h==='string'&&/NaN|undefined|Infinity|Invalid/.test(h))bad.push(t+' memuat NaN/undefined')}catch(e){bad.push(t+' -> '+e.message)}};
 Object.keys(V).forEach(k=>chk('V.'+k,V[k]));
 ['bku','stok','b50','b100','lpj'].forEach(k=>chk('cetak '+k,()=>{cetak(k);return $('print').innerHTML}));
 for(let w=1;w<=12;w++)chk('mg'+w,()=>{cetak('mg',w);return $('print').innerHTML});
 cetak('bku');const h=$('print').innerHTML;
 return{bad,kopTanpaBarisAtas:!h.includes('PEMERINTAH'),kota:h.includes('Kota X,'),nama:h.includes('SD Uji')}})()`);
ok('semua halaman dan cetak bebas NaN/galat'+(r.bad.length?' '+JSON.stringify(r.bad):''),r.bad.length===0);
ok('kop tanpa baris atas bila tidak diisi; kota tanda tangan dari pengaturan',r.kopTanpaBarisAtas&&r.kota&&r.nama);
(async()=>{
 run('ask=async()=>true');
 await run('resetData()');
 ok('hapus data: kembali ke pengaturan awal, PIN lama tidak berlaku',els.setup.hidden===false&&els.login.hidden===true&&run("!C().pin_sekretaris")&&!store.sirevital_v2_u);
 el('sgas').value='https://x/exec';el('stok').value='tok';
 await run('pullAwal()');
 ok('perangkat baru: tarik dari Sheet lalu tampil layar PIN',els.login.hidden===false&&els.setup.hidden===true&&run("C().nama_sekolah==='SD Contoh'&&C().gas_url==='https://x/exec'&&C().gas_ver===4"));
 sheet={CONFIG:{nama_sekolah:'Tanpa PIN'},ver:1};run('resetData()');await new Promise(r=>setTimeout(r,5));
 el('sgas').value='https://x/exec';el('stok').value='tok';await run('pullAwal()');
 ok('Sheet tanpa PIN: ditolak dengan pesan jelas',els.toast.textContent.includes('belum memuat PIN'));
})();

// ===== Sinkron otomatis =====
(async()=>{
 await new Promise(r=>setTimeout(r,50));
 const calls=[];
 run("db.CONFIG.gas_url='https://x/exec';db.CONFIG.gas_token='tok';db.CONFIG.gas_ver=4");
 ctx.fetch=async(u,o)=>{calls.push({u,o});return{json:async()=>o&&o.method==='POST'?{ok:true,ver:5,photos:[]}:{ver:5}}};
 run("SY.applying=false;ls.del(K+'_dirty');ls.del(K+'_auto')");
 run("commit()");
 ok('perubahan menandai data belum terkirim',run("syDirty()")===true);
 await run("syPush()");
 ok('kirim otomatis: POST, versi naik, penanda bersih',calls.some(c=>c.o&&c.o.method==='POST')&&run("db.CONFIG.gas_ver")===5&&run("syDirty()")===false);
 calls.length=0;await run("syPull()");
 ok('tarik otomatis dilewati bila versi Sheet sama',calls.length===1&&calls[0].u.includes('action=ver'));
 run("user={role:Object.keys(ROLES)[0],nama:'t'}");run("syToggle()");run("commit()");
 ok('matikan sinkron otomatis: perubahan tidak dikirim sendiri',run("ls.get(K+'_auto')")==='0'&&run("syOn()")===false);
})();
