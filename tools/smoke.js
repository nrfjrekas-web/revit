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
 FileReader:class{readAsDataURL(){this.result='data:x';setTimeout(()=>this.onload(),0)}},Image:class{constructor(){this.width=100;this.height=100}set src(v){setTimeout(()=>this.onload(),0)}},
 document:{getElementById:el,createElement:t=>t==='canvas'?mk({getContext:()=>mk(),toDataURL:()=>'data:image/jpeg;base64,AAAA'}):mk(),body:mk(),addEventListener(){},querySelector:()=>mk(),querySelectorAll:()=>[]},
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
ok('pertama dibuka: tanpa PIN lokal, tampil papan PIN bila GAS_URL terisi, bila tidak pengaturan awal',run("!!GAS_URL")?(els.login.hidden===false&&els.setup.hidden===true):(els.setup.hidden===false&&els.setup.innerHTML.includes('Pengaturan awal')&&els.login.hidden===true));
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
 run("user={role:'sek',nama:'Sekretaris'};db.DB_MATERIAL.push({id_material:'M001',nama_material:'Semen',satuan:'sak',stok_minimum:1,harga_acuan_siplah:1000})");
 const fm=(a,b)=>({preventDefault(){},target:{mat:{value:'M001'},qty:{value:'5'},harga:{value:'1000'},tgl:{value:'2026-11-02'},sup:{value:'Toko'},nota:{value:'N1'},foto:{files:a?[{}]:[]},fotob:{files:b?[{}]:[]}}});
 ctx.fm=fm;
 await run('subMasuk(fm(true,false))');ok('barang masuk tanpa foto barang ditolak',run('db.TRX_MASUK.length')===0&&els.toast.textContent.includes('wajib'));
 await run('subMasuk(fm(false,true))');ok('barang masuk tanpa foto nota ditolak',run('db.TRX_MASUK.length')===0);
 els.fm=mk({mat:{value:'M001'},qty:{value:''},harga:{value:''}});
 await run('subMasuk(fm(true,true))');ok('barang masuk dengan nota dan foto barang tersimpan terpisah',run("db.TRX_MASUK.length===1&&!!db.TRX_MASUK[0].foto_nota_url&&!!db.TRX_MASUK[0].foto_barang_url"));
 ok('daftar barang masuk menampilkan pratinjau nota dan barang',run("V.masuk().includes('lihatFoto')&&V.masuk().includes('Foto barang')"));
 await run('resetData()');
 ok('hapus data: kembali ke pengaturan awal, PIN lama tidak berlaku',(run("!!GAS_URL")?(els.login.hidden===false&&els.setup.hidden===true):(els.setup.hidden===false&&els.login.hidden===true))&&run("!C().pin_sekretaris")&&!store.sirevital_v2_u);
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

// ===== Login PIN perangkat baru (tanpa mengetik URL/token) =====
(async()=>{
 await new Promise(r=>setTimeout(r,400));
 const reset=()=>run("ls.del(K);ls.del(K+'_u');ls.del(K+'_lp');db=JSON.parse(JSON.stringify(SEED));user=null;pin=''");
 const resp=o=>{ctx.fetch=async()=>({json:async()=>o})};
 reset();resp({error:'pin'});await run("loginRemote('9999')");
 ok('login perangkat baru: PIN salah ditolak server',els.pinErr.textContent.includes('PIN salah')&&run("user")===null);
 reset();resp({error:'lock'});await run("loginRemote('9999')");
 ok('login perangkat baru: terkunci setelah terlalu banyak PIN salah',els.pinErr.textContent.includes('15 menit'));
 reset();resp({error:'kosong'});await run("loginRemote('1111')");
 ok('login perangkat baru: Sheet kosong membuka pengaturan awal',els.setup.hidden===false&&els.login.hidden===true);
 reset();resp({role:'mandor',ver:7,CONFIG:{nama_sekolah:'SD Remote',pin_sekretaris:'1111',pin_mandor:'2222',pin_kepsek:'3333'},DB_RAB:[]});
 await run("loginRemote('2222')");
 ok('login perangkat baru: PIN benar mengambil data dan masuk sesuai peran',run("user.role")==='mandor'&&run("C().nama_sekolah")==='SD Remote'&&run("C().gas_ver")===7&&run("C().gas_token")===''&&run("myPin()")==='2222'&&els.main.hidden===false);
})();

// ===== Peran Bendahara: PIN, tugas, pengeluaran lain, laporan keuangan harian/mingguan/bulanan =====
(async()=>{
 await new Promise(r=>setTimeout(r,800));
 const fo=o=>({preventDefault(){},target:Object.fromEntries(Object.entries(o).map(([k,v])=>[k,{value:v}]))});ctx.fo=fo;
 run("ls.del(K+'_u');db=JSON.parse(JSON.stringify(SEED));Object.assign(db.CONFIG,{nama_sekolah:'SD Bend',pin_sekretaris:'1111',pin_mandor:'2222',pin_kepsek:'3333',pin_bendahara:'4444',nama_bendahara:'Bu Dewi',tgl_mulai:'2026-11-02'});user=null;pin=''");
 '4444'.split('').forEach(k=>run(`pressPin('${k}')`));
 ok('PIN bendahara: masuk sebagai Bendahara, halaman awal Tugas',run("user&&user.role")==='bend'&&els.view.dataset.p==='tugas');
 ok('bendahara punya menu kas, barang masuk, absensi, stok, laporan',run("ROLES.bend.pages.join()")==='tugas,dash,kas,masuk,absen,stok,laporan');
 run("ls.del(K+'_u');Object.assign(db.CONFIG,{pin_operator:'5555'});user=null;pin=''");
 run("pressPin('5');pressPin('5');pressPin('5');pressPin('5')");
 ok('PIN operator: masuk sebagai Operator dengan semua menu',run("user&&user.role")==='op'&&run("ROLES.op.pages.join()")===run("ROLES.sek.pages.join()")+",lrevit");
 run("db.TRX_KEUANGAN.push({tanggal:'2026-11-03',uraian:'Pencairan dana Tahap 1',kas_masuk:1000000,kas_keluar:0,saldo:0,sumber:'Pencairan',bukti_url:''},{tanggal:'2026-11-04',uraian:'Belanja Semen 10 sak, nota 7',kas_masuk:0,kas_keluar:200000,saldo:0,sumber:'Material',bukti_url:''});commit()");
 run("subKasx(fo({kat:'ATK',tgl:'2026-11-04',ur:'Kertas laporan',jml:'150000'}))");
 ok('pengeluaran lain masuk BKU dengan saldo benar',run("db.TRX_KEUANGAN.some(x=>x.sumber==='Pengeluaran'&&x.uraian==='ATK: Kertas laporan'&&x.kas_keluar===150000)")&&run("saldo()")===650000);
 const harian=run("lapKeu('kd','2026-11-04')"),minggu=run("lapKeu('km',1)"),bulan=run("lapKeu('kb','2026-11')");
 ok('laporan harian: saldo awal 1.000.000, pengeluaran 350.000, saldo akhir 650.000',harian.includes('1.000.000')&&harian.includes('350.000')&&harian.includes('650.000')&&harian.includes('Bu Dewi')&&harian.includes('HARIAN'));
 ok('laporan mingguan dan bulanan memuat seluruh transaksi',minggu.includes('MINGGUAN KE-1')&&minggu.includes('Pencairan dana')&&bulan.includes('BULANAN')&&bulan.includes('November 2026'));
 ok('laporan keuangan bebas NaN dan undefined',![harian,minggu,bulan].some(h=>/NaN|undefined/.test(h)));
 ok('halaman Tugas dan Laporan memuat laporan harian, mingguan, bulanan tanpa galat',!/NaN|undefined/.test(run("V.tugas()"))&&run("V.laporan()").includes('Laporan harian, mingguan, dan bulanan'));
run("db.CONFIG.npsn='30523505';db.CONFIG.kab_kota='JEMBER';db.CONFIG.provinsi='JAWA TIMUR';db.CONFIG.nama_p2sp='ABD. ROHIM';db.CONFIG.nama_pengawas='AMIRUL';db.CONFIG.no_pks='PKS/2026';db.CONFIG.tgl_pks='2026-07-27';db.CONFIG.dana_70=517660538");
 {const rv=[["h","2026-11-04"],["m",1],["b","2026-11"]].map(a=>run("cetakRevit('"+a[0]+"',"+JSON.stringify(a[1])+");$('print').innerHTML"));
 ok('Laporan Revit harian/mingguan/bulanan: kop program, NPSN, tanda tangan P2SP dan Pengawas, dokumentasi',rv.every(h=>h.includes('PROGRAM REVITALISASI')&&h.includes('30523505')&&h.includes('ABD. ROHIM')&&h.includes('DOKUMENTASI LAPORAN'))&&rv[0].includes('LAPORAN HARIAN')&&rv[1].includes('MINGGUAN KE-1')&&rv[2].includes('BULANAN'));
 ok('Laporan Revit memuat data PKS: total 1.401.165.955 dan Ruang Guru',rv.every(h=>h.includes('1.401.165.955')&&h.includes('Ruang Guru')&&h.includes('232.444.000')));
 ok('Isi RAB sesuai PKS: 11 item, total 1.334.545.000, tidak ganda saat diulang',run("(()=>{const b=db.DB_RAB;db.DB_RAB=[];isiRabPks();isiRabPks();const r=db.DB_RAB.reduce((a,x)=>a+jumlah(x),0)+'|'+db.DB_RAB.length;db.DB_RAB=b;return r})()")==='1334545000|11');
 ok('Laporan Revit bebas NaN dan undefined',!rv.some(h=>/NaN|undefined|Infinity/.test(h)));
 ok('halaman Laporan Revit tampil',run("V.lrevit()").includes('Lihat laporan'));}
 run("subPin(fo({sekretaris:'1111',mandor:'2222',kepsek:'3333',bendahara:'1111'}))");
 ok('PIN bendahara kembar dengan peran lain ditolak',els.toast.textContent.includes('berbeda')&&run("C().pin_bendahara")==='4444');
})();
