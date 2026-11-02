# SI-REVITAL LITE (SDN Klompangan 01)

Aplikasi statis tanpa proses build. Unggah seluruh folder ini ke hosting statis (Cloudflare Pages, Netlify, GitHub Pages) atau buka `index.html` langsung.

## Struktur
```
index.html            markup + urutan pemuatan skrip
css/style.css         seluruh gaya (palet Navy/Emerald/Slate)
js/tailwind-config.js konfigurasi Tailwind (dimuat tepat setelah CDN)
js/core/              config (SEED data awal), util (helper, hitung), store (load/commit/toast),
                      auth (PIN, peran, menu per peran), nav (go/back, komponen kecil)
js/views/             satu berkas per halaman: home (Beranda+Menu), masuk, keluar, stok,
                      progres, absen, kas, laporan, pengaturan
js/features/          sync (kirim/tarik Sheet), setup (pengaturan awal, hapus data), edit (ubah/hapus), print (dokumen cetak),
                      gas-code (salinan backend untuk tombol salin)
js/main.js            start aplikasi
backend/Code.gs       backend Google Apps Script
tools/sync-gas.py     salin backend/Code.gs ke js/features/gas-code.js
tools/smoke.js        uji asap tanpa browser: node tools/smoke.js
```

## Aturan penting
- Skrip klasik (bukan ES module) karena tombol memakai `onclick="fungsi()"`. Semua berkas berbagi satu lingkup global.
- **Urutan di `index.html` menentukan segalanya.** `core` harus lebih dulu; `views/home.js` mendefinisikan `V` dan `A` sehingga harus sebelum view lain; `main.js` paling akhir.
- Halaman baru: buat `js/views/nama.js` berisi `V.nama=()=>...`, tambahkan ke `PG`/`NL`/`ROLES` di `core/auth.js`, lalu daftarkan `<script>` di `index.html`.
- Setelah mengubah `backend/Code.gs`, jalankan `python3 tools/sync-gas.py`. Code.gs tidak boleh berisi backtick, `${`, atau backslash.
- Penyimpanan: localStorage kunci `sirevital_v2`; sesi peran `sirevital_v2_u`.

## Tampilan desktop
Mulai lebar 1024 px (`@media (min-width:1024px)` di akhir `css/style.css`), tampilan berubah; di bawah itu tetap mobile-first 480 px seperti semula.
- Sidebar kiri (`#side`, dibangun `sideBuild()` di `core/nav.js`) memuat semua halaman milik peran, jadi halaman Menu dan navbar bawah tidak dipakai.
- Atribut `data-p` di `#view` menandai halaman aktif; CSS memakainya untuk tata letak: isian di kiri, riwayat di kanan (Masuk, Keluar, Progres, Absen, Kas), dua kolom (Beranda, Laporan), satu kolom terbatas (Pengaturan, Stok).
- Layar PIN terbagi dua dengan panel merek, dan PIN bisa diketik dari papan tombol.
- Menambah halaman baru: cukup daftarkan seperti biasa; bila ingin tata letak khusus desktop, tambahkan aturan `#view[data-p=nama]` di blok desktop.

## Foto
- Barang masuk wajib dua foto terpisah: nota (`foto_nota_url`) dan barang yang diterima (`foto_barang_url`). Saat Ubah, foto lama dipakai bila tidak diganti.
- Dokumentasi progres kini dua foto: Before (`foto1_url`) dan After (`foto3_url`); `foto2_url` hanya sisa data lama dan dokumentasi absen (`foto_absen_url`) tetap kolom tersendiri.
- Di Google Drive, backend memisahkan foto ke subfolder `SI-REVITAL/Nota`, `Barang`, `Progres Before`, `Progres After`, dan `Lainnya` (absen). Foto lama dirapikan dengan menjalankan `rapikanFoto()` sekali di editor Apps Script.
- Pratinjau foto nota dan barang tampil di daftar Barang masuk; ketuk untuk memperbesar (`lihatFoto` di `core/util.js`).

## Data awal
Aplikasi mulai benar-benar kosong: tidak ada identitas sekolah, pejabat, PIN, RAB, material, maupun pekerja bawaan. Saat pertama dibuka (belum ada PIN) tampil layar **Pengaturan awal**: identitas sekolah, baris atas kop dan kota tanda tangan, tahun anggaran, tanggal mulai (wajib), nama pejabat (boleh kosong), dan tiga PIN 4 angka yang berbeda. Perangkat baru dapat memilih "Ambil data dari Google Sheet" di layar yang sama. Setelah itu Beranda menampilkan panel "Mulai di sini" sampai RAB, material, dan pekerja terisi. Total RAB 0 berarti dihitung otomatis dari jumlah item RAB.


## Login langsung dengan PIN (tanpa mengetik URL Apps Script)

1. Pasang `backend/Code.gs` versi terbaru di Apps Script, deploy ulang sebagai versi baru.
2. Buka `js/core/config.js`, isi `GAS_URL` dengan URL Web App (berakhiran `/exec`), lalu push dan deploy ulang.
3. Dari perangkat utama, kirim data pertama kali lewat Pengaturan dengan kata sandi admin (TOKEN). Ini hanya sekali.
4. Setelah itu perangkat mana pun cukup memasukkan PIN. Server memeriksa PIN, lalu mengirim data sesuai peran. Sinkron otomatis memakai PIN yang sama, tanpa token.

Keamanan: URL Web App bersifat publik, tetapi data hanya dikirim bila PIN benar. Sepuluh PIN salah berturut-turut mengunci login PIN selama 15 menit. TOKEN admin tidak ditaruh di kode aplikasi.
