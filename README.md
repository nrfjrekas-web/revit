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

## Data awal
Aplikasi mulai benar-benar kosong: tidak ada identitas sekolah, pejabat, PIN, RAB, material, maupun pekerja bawaan. Saat pertama dibuka (belum ada PIN) tampil layar **Pengaturan awal**: identitas sekolah, baris atas kop dan kota tanda tangan, tahun anggaran, tanggal mulai (wajib), nama pejabat (boleh kosong), dan tiga PIN 4 angka yang berbeda. Perangkat baru dapat memilih "Ambil data dari Google Sheet" di layar yang sama. Setelah itu Beranda menampilkan panel "Mulai di sini" sampai RAB, material, dan pekerja terisi. Total RAB 0 berarti dihitung otomatis dari jumlah item RAB.
