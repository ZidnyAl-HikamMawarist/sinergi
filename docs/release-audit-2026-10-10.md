# SINERGI — Production Release Audit Report

**Tanggal Audit:** 10 Oktober 2026  
**Auditor:** Senior QA Engineer, Laravel Security Reviewer & Release Engineer  
**Repository:** [https://github.com/ZidnyAl-HikamMawarist/sinergi](https://github.com/ZidnyAl-HikamMawarist/sinergi)  
**Target Produksi:** [https://sinergi.zidny.web.id/](https://sinergi.zidny.web.id/)  
**Status Evaluasi:** **READY FOR UAT** *(Controlled Staging / School UAT)*  

---

## 1. Executive Summary

Audit rilis produksi read-only ini dilakukan terhadap commit HEAD branch `master` ([`1aeda6a`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/1aeda6a)) setelah integrasi bertahap PR #10, #2, #3, #4, #5, #7, dan #9.

Pemeriksaan mencakup verifikasi baseline repository, eksekusi test suite otomatis pada database terisolasi, audit statis kode keamanan/otorisasi (RBAC, QR presensi, pembukuan kas, isolasi data, PWA), serta *smoke check* non-destruktif terhadap URL produksi.

**Temuan Utama:**
- **Automated Test Baseline Terverifikasi:** Seluruh **80 tests (302 assertions)** pada Laravel Feature Test Suite berhasil lolos 100% tanpa kegagalan (`Duration: 7.17s`).
- **Pint & Build Bersih:** Laravel Pint berstatus `passed` (0 violation), dan frontend Vite 7 terkompilasi bersih dalam `9.60s` (2.567 modul).
- **Integritas Logic & Keamanan Backend Sangat Kuat:** Proteksi otorisasi multi-role, enkripsi token HMAC QR dinamis dengan epoch timestamp, immutability model Eloquent pada buku kas, dan mitigasi CWE-1236 (formula injection) terimplementasi dengan baik di level backend.
- **Temuan Konfigurasi Produksi (P1):** URL HTTP (`http://sinergi.zidny.web.id/`) merespons `200 OK` tanpa redirect 301 ke HTTPS (Cloudflare *Always Use HTTPS* belum aktif). Selain itu, terdeteksi header `x-inertia-devtools-id` dan `x-powered-by: PHP/8.3.26` pada respons produksi publik yang membocorkan informasi runtime.

---

## 2. Commit dan Branch yang Diaudit

| Item | Nilai Aktual |
|---|---|
| **Audited Branch** | `master` (Direfleksikan pada branch audit terpisah `audit/release-readiness-2026-10-10`) |
| **Commit HEAD** | [`1aeda6a`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/1aeda6a) (*docs: publish Overnight Engineering Lab Report (#9)*) |
| **Commit Rilis Utama** | [`4636e35`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/4636e35) (PR #10 Visual Polish), [`ff7d8e5`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/ff7d8e5) (PR #2 Logout Security), [`b579f32`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/b579f32) (PR #3 Timezone), [`c83d7c9`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/c83d7c9) (PR #4 PWA Security), [`aaac965`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/aaac965) (PR #5 UAT Lifecycle), [`14a0da9`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/14a0da9) (PR #7 Query Optimization) |
| **Status Working Tree** | Clean (`nothing to commit, working tree clean`) |
| **Status Remote GitHub** | Sinkron dengan `origin/master` |
| **PR Terbuka di Repo** | Hanya tersisa 2 PR: [#6](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/6) (WCAG a11y - conflicting) & [#8](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/8) (Analytics - ditahan) |

---

## 3. Ringkasan Hasil Uji Otomatis

Semua pengujian dijalankan pada environment testing terisolasi (`phpunit.xml`: `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `SESSION_DRIVER=array`, `CACHE_STORE=array`).

| Pemeriksaan | Perintah Aktual | Exit Code | Hasil | Detail & Durasi |
|---|---|:---:|:---:|---|
| **Laravel Test Suite** | `php artisan test` | `0` | **PASS** | **80 passed**, 0 failed, 0 skipped (**302 assertions**), 7.17s |
| **Laravel Pint (Read-Only)** | `vendor/bin/pint --test` | `0` | **PASS** | `{"tool":"pint","result":"passed"}` (0 formatting issue) |
| **Frontend Production Build** | `npm run build` | `0` | **PASS** | Vite v7.3.7, 2.567 modules transformed, output `public/build/`, 9.60s |
| **CI GitHub Actions (Push master)** | Remote Workflow `tests-and-build` | `0` | **PASS** | Run #38052811396 sukses (durasi: 33s) |

---

## 4. Hasil Pemeriksaan Produksi (Production Smoke Check)

Pengujian dilakukan menggunakan request HTTP ringan non-destruktif terhadap target `https://sinergi.zidny.web.id/`.

| Titik Pemeriksaan | Permintaan | Status HTTP | Temuan & Analisis |
|---|---|:---:|---|
| **HTTPS Root** | `curl.exe -I -s -S https://sinergi.zidny.web.id/` | `200 OK` | Menyajikan dokumen HTML aplikasi melalui Cloudflare CDN (Edge SIN). Cookie `laravel-session` tersetting `secure; httponly; samesite=lax`. |
| **HTTP Port 80 (Plaintext)** | `curl.exe -I -s -S http://sinergi.zidny.web.id/` | `200 OK` *(Warning)* | **Tidak ada redirect 301 ke HTTPS.** Server melayani request plaintext dan mengirimkan cookie tanpa flag `secure`. |
| **Service Worker** | `curl.exe -I -s -S https://sinergi.zidny.web.id/sw.js` | `200 OK` | `sw.js` dapat diakses secara publik (Content-Type: `application/javascript`, Cache-Control: `max-age=14400`). |
| **PWA Web Manifest** | `curl.exe -I -s -S https://sinergi.zidny.web.id/manifest.json` | `200 OK` | `manifest.json` dapat diakses secara publik (Content-Type: `application/json`). |
| **PWA Offline Fallback** | `curl.exe -I -s -S https://sinergi.zidny.web.id/offline.html` | `200 OK` | Dokumen fallback statis `offline.html` berhasil disajikan tanpa kebocoran data sesi. |
| **Header Informasi Runtime** | Pemeriksaan header respons | — | Terdeteksi `x-powered-by: PHP/8.3.26` dan header `x-inertia-devtools-id`. |
| **Header HSTS / Keamanan** | Pemeriksaan header respons | — | Header `Strict-Transport-Security`, `X-Frame-Options`, dan `X-Content-Type-Options` belum disuntikkan pada level edge/server web. |

---

## 5. Temuan Keamanan & Kualitas Berdasarkan Risiko

### Level Risiko: P1 (High — Wajib Dibenahi Sebelum Rilis Publik Penuh)

#### 1. HTTP Port 80 Tidak Melakukan Redirect ke HTTPS
- **Lokasi:** Konfigurasi Cloudflare / Nginx Production (`http://sinergi.zidny.web.id/`).
- **Dampak:** Siswa atau pengurus yang mengetikkan alamat tanpa `https://` akan berkomunikasi melalui koneksi tidak terenkripsi. Cookie sesi pada request HTTP tersetting tanpa flag `secure`, rentan terhadap serangan sniffing Wi-Fi sekolah (Man-in-the-Middle).
- **Bukti:** Respons request HTTP port 80 menghasilkan `HTTP/1.1 200 OK` bukan `301 Moved Permanently`.
- **Rekomendasi:** Aktifkan fitur *"Always Use HTTPS"* dan *"Automatic HTTPS Rewrites"* pada dashboard Cloudflare domain `zidny.web.id`, atau tambahkan redirect permanent pada konfigurasi Nginx port 80.

#### 2. Eksposur Header Inertia DevTools pada Lingkungan Produksi
- **Lokasi:** Respons HTTP (`x-inertia-devtools-id: 01M4JZMT75M5R1A654G2J3GC4A`).
- **Dampak:** Menandakan package/middleware debug atau profiling masih aktif atau tidak dinonaktifkan di environment produksi, berpotensi membebani memori dan mengekspos ID request internal.
- **Rekomendasi:** Pastikan `.env` produksi memiliki `APP_DEBUG=false` dan hapus/nonaktifkan package Inertia devtools pada environment production.

---

### Level Risiko: P2 (Medium — Hardening Infrastruktur & Proteksi Header)

#### 3. Kebocoran Versi PHP (`X-Powered-By`)
- **Lokasi:** Respons HTTP header (`x-powered-by: PHP/8.3.26`).
- **Dampak:** Memberikan informasi fingerprinting versi runtime kepada pihak luar.
- **Rekomendasi:** Set `expose_php = Off` pada konfigurasi `php.ini` server produksi atau sembunyikan via Nginx `proxy_hide_header X-Powered-By;`.

#### 4. Ketiadaan Header HSTS & Keamanan Standar pada Edge
- **Lokasi:** Header respons HTTP HTTPS root.
- **Dampak:** Browser tidak dipaksa mengingat HTTPS via HSTS; halaman login berpotensi di-embed jika perlindungan clickjacking hanya mengandalkan CSP lokal.
- **Rekomendasi:** Tambahkan header keamanan pada Nginx atau Cloudflare Transform Rules:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`

---

### Kekuatan Keamanan & Kualitas Terkonfirmasi (Verified Robust)

1. **Role-Based Access Control (RBAC):**
   - [`app/Http/Middleware/CheckRole.php:L23-L45`](file:///c:/laragon/www/sinergi/app/Http/Middleware/CheckRole.php#L23-L45): Verifikasi akun non-aktif langsung melakukan invalidasi sesi dan regenerasi token CSRF. Pengecekan role terikat ketat dengan active `academic_year_id`.
2. **Mitigasi bfcache & Logout Data Exposure:**
   - [`app/Http/Middleware/PreventBackHistory.php:L22`](file:///c:/laragon/www/sinergi/app/Http/Middleware/PreventBackHistory.php#L22): Injeksi `Cache-Control: no-cache, no-store, max-age=0, must-revalidate` pada seluruh endpoint terproteksi.
   - [`resources/views/app.blade.php:L26-L32`](file:///c:/laragon/www/sinergi/resources/views/app.blade.php#L26-L32): Listener `pageshow` mendeteksi `event.persisted` (tombol Back browser) dan memaksa reload halaman sehingga langsung diarahkan ke `/login`.
3. **Integritas QR Presensi & Perlindungan Replay:**
   - [`app/Services/QrTokenService.php:L58-L76`](file:///c:/laragon/www/sinergi/app/Services/QrTokenService.php#L58-L76): Verifikasi HMAC SHA-256 menggunakan `hash_equals` (kebal timing attack), validasi kedaluwarsa berbasis epoch integer (kebal pergantian zona waktu/tengah malam), dan verifikasi tabel `qr_token_uses`.
   - [`app/Http/Controllers/Eskul/AttendanceController.php:L153-L176`](file:///c:/laragon/www/sinergi/app/Http/Controllers/Eskul/AttendanceController.php#L153-L176): Transaksi database atomik menangani *race condition* / scan ganda simultan dan mengembalikan respon 422 JSON yang rapi (bukan 500 error).
4. **Immutability Buku Kas & Validasi Bukti:**
   - [`app/Models/CashTransaction.php:L51-L73`](file:///c:/laragon/www/sinergi/app/Models/CashTransaction.php#L51-L73): Hook Eloquent `updating` memblokir perubahan atribut selain voiding, dan hook `deleting` melempar `RuntimeException` yang membatalkan operasi penghapusan data secara absolut.
   - [`app/Http/Controllers/Kas/CashTransactionController.php:L140-L148`](file:///c:/laragon/www/sinergi/app/Http/Controllers/Kas/CashTransactionController.php#L140-L148): File bukti disimpan di disk `local` non-publik, disajikan dengan `X-Content-Type-Options: nosniff` dan `CSP: default-src 'none'`.
5. **Sanitasi CSV Formula Injection (CWE-1236):**
   - [`app/Http/Controllers/Eskul/AttendanceRecapController.php:L188-L196`](file:///c:/laragon/www/sinergi/app/Http/Controllers/Eskul/AttendanceRecapController.php#L188-L196): Karakter berbahaya (`=`, `+`, `-`, `@`, `\t`, `\r`) pada ekspor rekapitulasi dinetralkan dengan prefiks apostrof `'`.
6. **Proteksi Batch Import Siswa:**
   - [`app/Http/Controllers/Admin/StudentImportController.php:L117-L123`](file:///c:/laragon/www/sinergi/app/Http/Controllers/Admin/StudentImportController.php#L117-L123): Batas ketat 2.000 baris per batch mencegah kehabisan memori server/DoS.
   - [`app/Http/Controllers/Admin/StudentImportController.php:L188-L195`](file:///c:/laragon/www/sinergi/app/Http/Controllers/Admin/StudentImportController.php#L188-L195): Transisi status atomik `update(['status' => 'processing'])` mencegah race condition double-commit.

---

## 6. Hal yang Tidak Bisa Diverifikasi (Out of Scope / Blocked)

1. **Hardware Kamera Fisik untuk QR Scanner:**
   - Pustaka `html5-qrcode` telah terpasang dan lolos build bundle, namun aksesibilitas feed video kamera perangkat nyata di production memerlukan pengujian langsung pada perangkat fisik melalui protokol HTTPS.
2. **Konfigurasi Lingkungan Host Server Nyata (.env Production):**
   - Berdasarkan aturan read-only, pembacaan file `.env` di server hosting produksi tidak dilakukan demi menjaga kerahasiaan secrets.
3. **Status Worker Queue & Cron Scheduler di Hosting:**
   - Apakah scheduler/queue runner di server produksi aktif atau menggunakan koneksi sync belum dapat diverifikasi tanpa akses monitoring proses host.

---

## 7. Rekomendasi 5 Skenario UAT Manual Paling Bernilai

Berikut 5 skenario manual inti yang disarankan untuk diuji oleh tim sekolah pada tahap User Acceptance Testing:

### Skenario 1: Lifecycle Login Siswa & Paksa Ganti Password
- **Langkah:** Login menggunakan akun siswa hasil import baru (NISN dan password acak awal).
- **Ekspektasi:** Sistem otomatis memblokir akses ke halaman lain dan mengarahkan ke `/password/change`. Setelah password diganti, siswa diarahkan ke Portal Siswa dan QR dinamis ter-generate setiap 60 detik.

### Skenario 2: Pemindaian QR & Penolakan Presensi Duplikat
- **Langkah:** Pengurus membuka scanner eskul (`/eskul/scanner`), arahkan kamera ke QR di layar siswa anggota. Lakukan pemindaian ulang pada QR yang sama setelah berhasil.
- **Ekspektasi:** Pemindaian pertama mencatat presensi HADIR disertai jam WIB. Pemindaian kedua menampilkan pesan kesalahan ramah: *"QR sudah digunakan"* atau *"Siswa sudah tercatat hadir pada pukul XX:XX:XX WIB"* tanpa crash.

### Skenario 3: Pencatatan Kas & Prosedur Pembatalan (Void)
- **Langkah:** Bendahara mengunggah transaksi kas masuk dengan bukti file PDF/gambar (`/kas/dashboard`). Lakukan pembatalan transaksi dengan mengisi alasan void.
- **Ekspektasi:** Saldo kas otomatis bertambah saat transaksi valid, dan berkurang kembali ke nilai semula saat di-void. Tombol unduh bukti hanya bisa diakses oleh role berwenang. Transaksi tidak dapat dihapus.

### Skenario 4: Keamanan Sesi Pasca-Logout di Komputer Bersama (Lab Komputer)
- **Langkah:** Login sebagai Admin di browser, buka dashboard admin, lalu klik *Keluar*. Tekan tombol **Back** pada browser.
- **Ekspektasi:** Halaman dashboard tidak boleh menampilkan data cache; browser otomatis mereload dan langsung mengarahkan ke halaman login.

### Skenario 5: Mode PWA & Akses Saat Koneksi Terputus
- **Langkah:** Buka aplikasi di smartphone, pasang (*Install*) PWA SINERGI. Matikan data internet / Wi-Fi, lalu buka aplikasi.
- **Ekspektasi:** Aplikasi menyajikan halaman offline fallback (`/offline.html`) yang bersih dengan tombol *"Coba Muat Ulang"*, bukan pesan error bawaan browser (*dinosaur/network error*), serta tidak menampilkan data sensitif usang.

---

## 8. Rekomendasi Prioritas Perbaikan

1. **Prioritas P0 (Blocker):** Tidak ada bug blocker pada kode aplikasi. Seluruh 80 tests lolos.
2. **Prioritas P1 (High — Sebelum Rilis Umum):**
   - Aktifkan **Always Use HTTPS** pada Cloudflare dashboard domain `sinergi.zidny.web.id`.
   - Pastikan environment produksi menjalankan `APP_DEBUG=false` untuk menonaktifkan header devtools.
3. **Prioritas P2 (Medium — Polish Stabilitas):**
   - Nonaktifkan `expose_php` di `php.ini` hosting untuk menyembunyikan header `X-Powered-By`.
   - Terapkan header keamanan `Strict-Transport-Security` (HSTS) pada level server/Cloudflare.
   - Selesaikan konflik PR #6 (aksesibilitas) pada branch terpisah agar standar WCAG 2.1 AA terintegrasi pada rilis minor berikutnya.

---

## 9. Keputusan Akhir

### Status: 🟢 READY FOR UAT (Terkendali)

**Justifikasi:**
Kode aplikasi pada branch `master` ([`1aeda6a`](https://github.com/ZidnyAl-HikamMawarist/sinergi/commit/1aeda6a)) memiliki kestabilan teknis yang sangat tinggi, dibuktikan dengan **80 automated tests yang lolos 100%**, build frontend tanpa error, dan proteksi otorisasi backend yang solid. 

Aplikasi **SIAP** untuk dilanjutkan ke pengujian pengguna (UAT pengurus & siswa). Sebelum peluncuran publik skala penuh ke seluruh sekolah, tim infrastruktur hanya perlu mengaktifkan pengaturan HTTPS permanen di Cloudflare dan memastikan konfigurasi debug produksi bersih.
