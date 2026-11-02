/* Alamat Web App Google Apps Script. Isi sekali di sini (URL berakhiran /exec) lalu deploy ulang.
   Bila terisi, perangkat baru langsung login dengan PIN dan mengambil data dari Sheet; pengguna tidak perlu mengetik URL atau token.
   Kosong = mode lokal (data hanya di perangkat). */
const GAS_URL='https://script.google.com/macros/s/AKfycbymaFd9WHxUdWYH3KA33BteFpXR8BtI0xRleqmqXd_JhsjtCO6QQerzkHFE6q5UIw4/exec';
/* ===== DATA (struktur 9 sheet PRD; disimpan di localStorage, bisa disinkronkan ke Google Sheet) ===== */
const K='sirevital_v2';
const SEED={
 CONFIG:{nama_sekolah:'',alamat:'',kode_desa:'',kop_atas:'',kota_ttd:'',total_rab:0,nama_kepsek:'',nip_kepsek:'',nama_sekretaris:'',nama_mandor:'',nama_komite:'',nama_bendahara:'',pin_sekretaris:'',pin_mandor:'',pin_kepsek:'',pin_bendahara:'',tahun_anggaran:'',tgl_mulai:'',gas_url:'',gas_token:'',gas_ver:0},
 DB_RAB:[],DB_MATERIAL:[],DB_PEKERJA:[],
 TRX_MASUK:[],TRX_KELUAR:[],TRX_PROGRES:[],TRX_ABSEN:[],TRX_KEUANGAN:[],LOG_AKTIVITAS:[]
};
