# Panduan Pengujian Langsung (UAT Walkthrough) — SINERGI

Panduan ini disusun untuk mempermudah pengujian manual aplikasi **SINERGI** di peramban (browser) desktop maupun smartphone. Setiap skenario dilengkapi dengan akun login, langkah klik, dan ekspektasi hasil.

---

## 🔑 Kredensial Pengujian (Deterministic Dev Accounts)

Semua akun dev menggunakan kata sandi yang sama: **`password123`**

| Role / Akun | Identifier Login | Kata Sandi | Deskripsi & Hak Akses |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `superadmin@sinergi.test` | `password123` | Akses tak terbatas ke seluruh workspace dan pengaturan |
| **Admin Inti OSIS** | `admin@sinergi.test` | `password123` | Mengelola siswa, penetapan eskul, rekap sekolah, & audit log |
| **Bendahara OSIS** | `bendahara@sinergi.test` | `password123` | Mengelola buku kas, catat uang masuk/keluar, dan void transaksi |
| **Pengurus Eskul** | `pengurus@sinergi.test` *(atau NISN `0051234561`)* | `password123` | Multi-role (Pengurus Pramuka + Siswa). Buka sesi & scan QR |
| **Siswa (Portal)** | `0051234562` *(atau `siswa@sinergi.test`)* | `password123` | Akses ID Digital QR dinamis & riwayat kehadiran pribadi |

---

## 🚀 Persiapan Lingkungan Uji

1. Pastikan server dev berjalan:
   ```bash
   php artisan serve
   ```
   *(atau buka melalui Laragon di `http://sinergi.test`)*
2. Pastikan database lokal terisi data demo:
   ```bash
   php artisan db:seed --class=DemoSchoolSeeder
   ```
3. Buka halaman utama di peramban: **`http://localhost:8000`** atau **`http://sinergi.test`**.

---

## 📋 Skenario UAT 1: Multi-Role Workspace Selector
- **Tujuan:** Memverifikasi pengguna yang memiliki lebih dari 1 role (misal: Siswa sekaligus Pengurus Eskul) diarahkan ke halaman pemilih ruang kerja.
- **Langkah-langkah:**
  1. Buka halaman login di `/login`.
  2. Masukkan email `pengurus@sinergi.test` dan kata sandi `password123`.
  3. Klik tombol **Masuk**.
- **Hasil yang Diharapkan:**
  - [ ] Sistem tidak langsung masuk ke satu dashboard, melainkan membuka halaman `/workspace/select`.
  - [ ] Muncul 2 kartu workspace: **Pengurus Ekstrakurikuler** dan **Portal Siswa**.
  - [ ] Klik kartu **Pengurus Ekstrakurikuler** $\rightarrow$ Masuk ke Dashboard Eskul.

---

## 📋 Skenario UAT 2: ID Digital & QR Dinamis Siswa
- **Tujuan:** Menguji pembuatan token QR terenkripsi HMAC-SHA256 dengan hitung mundur otomatis.
- **Langkah-langkah:**
  1. Login dengan akun siswa: NISN `0051234562` / `password123`.
  2. Buka dashboard portal di `/portal/dashboard`.
  3. Amati kartu **ID Digital Siswa** di bagian atas.
- **Hasil yang Diharapkan:**
  - [ ] QR code tampil dengan jelas di tengah layar.
  - [ ] Terdapat bar progres dan teks hitung mundur (detik) masa berlaku QR (TTL 60 detik).
  - [ ] Ketika hitung mundur habis, QR otomatis diperbarui tanpa perlu refresh halaman (zero-flicker).
  - [ ] Tampil daftar keanggotaan eskul siswa (misal: *Pramuka*).

---

## 📋 Skenario UAT 3: Pemindaian QR Presensi Kegiatan
- **Tujuan:** Memvalidasi pemindaian QR oleh pengurus, deteksi anggota aktif, dan pencegahan scan ganda (replay attack).
- **Langkah-langkah:**
  1. Login sebagai `pengurus@sinergi.test`.
  2. Buka menu **Scanner Presensi** (`/eskul/scanner`).
  3. Pilih sesi aktif yang tersedia di dropdown sesi.
  4. Siapkan QR siswa dari Skenario 2 (dapat ditunjukkan via layar HP atau tab terpisah).
  5. Scan QR code siswa menggunakan kamera webcam/HP atau input token string simulasi.
- **Hasil yang Diharapkan:**
  - [ ] Pemindai merespons dengan audio/notifikasi hijau: *"Presensi Berhasil: [Nama Siswa] tercatat HADIR"*.
  - [ ] Nama siswa langsung muncul di tabel daftar hadir sesi hari ini.
  - [ ] Coba scan QR yang sama untuk kedua kalinya $\rightarrow$ Sistem menolak dengan pesan *"QR sudah digunakan"* atau *"Siswa sudah tercatat hadir"*.

---

## 📋 Skenario UAT 4: Presensi Manual & Batas Jendela Edit 24 Jam
- **Tujuan:** Menguji penginputan presensi manual dengan catatan wajib (izin/sakit/alpa).
- **Langkah-langkah:**
  1. Di halaman scanner atau rekap, klik tombol **Presensi Manual**.
  2. Pilih salah satu siswa anggota eskul.
  3. Pilih status **Izin** atau **Sakit**.
  4. Kosongkan kolom alasan $\rightarrow$ Klik Simpan.
  5. Isi alasan *"Dispensasi lomba olimpiade matematika"* $\rightarrow$ Klik Simpan.
- **Hasil yang Diharapkan:**
  - [ ] Validasi menolak jika alasan kosong (minimal 3 karakter).
  - [ ] Setelah diisi alasan yang valid, status presensi siswa berhasil diperbarui.
  - [ ] Data tersimpan di database lengkap dengan catatan audit siapa yang mengubah.

---

## 📋 Skenario UAT 5: Rekapitulasi Presensi & Ekspor CSV
- **Tujuan:** Memeriksa agregasi persentase kehadiran per anggota dan ekspor CSV aman dari formula injection.
- **Langkah-langkah:**
  1. Buka menu **Rekap Presensi** (`/eskul/rekap`).
  2. Pilih eskul **Pramuka**.
  3. Amati ringkasan kartu: Total Sesi, Anggota Aktif, Rata-rata Kehadiran.
  4. Klik tombol **Unduh Rekap CSV**.
  5. Buka berkas CSV yang diunduh di Excel atau Notepad.
- **Hasil yang Diharapkan:**
  - [ ] Tabel menampilkan rincian: Hadir, Izin, Sakit, Alpa, dan % Kehadiran per siswa.
  - [ ] Berkas CSV terunduh dengan nama `rekap_presensi_pramuka_YYYYMMDD_HHMMSS.csv`.
  - [ ] Format CSV rapi dan semua karakter formula telah tersanitasi dengan aman.

---

## 📋 Skenario UAT 6: Buku Kas OSIS & Void Transaksi (Immutability)
- **Tujuan:** Menguji pencatatan transaksi kas masuk/keluar, upload bukti, dan pembatalan transaksi (void).
- **Langkah-langkah:**
  1. Login sebagai `bendahara@sinergi.test`.
  2. Buka dashboard kas di `/kas/dashboard`.
  3. Catat transaksi keluar baru:
     - Tipe: **Kas Keluar**
     - Kategori: **Konsumsi Rapat & Kegiatan**
     - Nominal: `150000`
     - Deskripsi: *"Snack rapat panitia perkemahan sabtu minggu"*
     - Unggah file gambar kuitansi (`.png` atau `.jpg`).
     - Klik **Simpan Transaksi**.
  4. Di tabel transaksi, klik ikon **Lihat Bukti** pada transaksi yang baru dibuat.
  5. Coba lakukan **Void Transaksi**:
     - Klik tombol **Void**.
     - Masukkan alasan: *"Nota salah input ganda oleh panitia"*.
     - Konfirmasi void.
- **Hasil yang Diharapkan:**
  - [ ] Saldo kas otomatis berkurang sebesar Rp 150.000 setelah transaksi dibuat.
  - [ ] Bukti transaksi terbuka dengan header keamanan (`nosniff`).
  - [ ] Setelah di-void, status berubah menjadi merah (VOID) dan saldo kas langsung terkoreksi kembali.
  - [ ] Transaksi yang sudah di-void tidak dapat diedit atau dihapus.

---

## 📋 Skenario UAT 7: Audit Log Explorer
- **Tujuan:** Memverifikasi bahwa setiap aktivitas sensitif tercatat di log audit append-only.
- **Langkah-langkah:**
  1. Login sebagai `admin@sinergi.test`.
  2. Buka menu **Audit Log** (`/admin/audit-logs`).
  3. Periksa riwayat aktivitas terbaru.
  4. Coba filter berdasarkan aksi (misal: `create_transaction` atau `void_transaction`).
- **Hasil yang Diharapkan:**
  - [ ] Log mencatat aktor (`user_id`), nama aksi, data sebelum, dan data sesudah (`old_values` & `new_values`).
  - [ ] Riwayat tidak dapat diubah maupun dihapus oleh siapapun (termasuk admin).
