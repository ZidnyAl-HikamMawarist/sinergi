# 📄 Product Requirements Document (PRD) — SINERGI (Sistem Integrasi Ekstrakurikuler dan Organisasi)

| | |
|---|---|
| **Produk** | SINERGI (Sistem Integrasi Ekstrakurikuler dan Organisasi) |
| **Versi dokumen** | 3.0 (revisi dari v2 setelah review) |
| **Fase** | Fase 1: MVP "Presensi + Kas" |
| **Status** | 🟡 Draft siap review (belum *approved*; lihat Bagian 15) |
| **Tech stack** | Laravel 13, React.js, Inertia.js, Tailwind CSS, MySQL, PWA |
| **Pemilik produk / developer** | Zidny Al Hikam M. |
| **Target rilis pilot** | `[isi tanggal]`: lihat estimasi di Bagian 12 |

---

## 1. Latar Belakang, Tujuan, dan Non-Tujuan

### 1.1 Masalah
Presensi ekstrakurikuler, administrasi, dan keuangan OSIS masih memakai kertas atau form terpisah (WhatsApp, Google Forms). Akibatnya data mudah hilang, rekap memakan waktu, titip absen sulit dicegah, dan pencatatan uang kas tidak transparan.

### 1.2 Tujuan MVP
Menyelesaikan **dua masalah yang terjadi tiap minggu**:
1. **Presensi eskul yang valid** (anti titip absen).
2. **Buku kas OSIS yang akuntabel** (wajib bukti, tidak bisa dimanipulasi diam-diam).

### 1.3 Non-Tujuan MVP
Manajemen proker, arsip surat, dashboard eksekutif, audit MPK, notifikasi WhatsApp, kepanitiaan, ticketing, dan inventaris **tidak** dikerjakan di Fase 1 (lihat Bagian 10 dan 11).

---

## 2. Success Metrics

Diukur setelah pilot berjalan 1 bulan. Nilai baseline diisi lewat pengamatan sebelum rilis.

| # | Metrik | Target | Cara ukur |
|---|---|---|---|
| M1 | Adopsi presensi QR | ≥ 80% eskul aktif memakai presensi digital dalam 1 bulan | Jumlah eskul dengan ≥ 1 sesi tercatat / total eskul aktif |
| M2 | Efisiensi rekap | Waktu membuat rekap absen bulanan turun dari `[baseline: ... jam]` menjadi < 5 menit | Wawancara + uji langsung dengan pengurus eskul |
| M3 | Akuntabilitas kas | 100% transaksi kas memiliki bukti dan tercatat di audit log | Query database (ditegakkan sistem) |
| M4 | Keandalan scan | ≥ 95% scan QR sukses pada percobaan pertama; waktu proses < 3 detik per siswa | Log scan (sukses/gagal + alasan) |
| M5 | Kepuasan pengguna | ≥ 4 dari 5 dari Ketua Eskul dan Bendahara | Survei singkat di akhir bulan pertama |

---

## 3. Stakeholder, Asumsi, Ketergantungan

### 3.1 Stakeholder
- **Pengguna langsung:** pengurus inti OSIS, Bendahara, pengurus eskul, siswa.
- **Pihak yang perlu memberi izin:** Wakasek Kesiswaan / Kepala Sekolah, Pembina OSIS.
- **Pihak yang terdampak:** Pembina eskul, MPK (belum punya akses di Fase 1).

### 3.2 Asumsi (harus divalidasi)
- Mayoritas siswa memiliki smartphone dengan kamera dan koneksi internet saat kegiatan eskul.
- Data siswa (NISN, nama, kelas) dapat diekspor dari Dapodik atau data sekolah ke CSV/XLSX.
- Sekolah mengizinkan aplikasi ini dipakai secara resmi.

### 3.3 Ketergantungan
- Izin tertulis/lisan dari pihak sekolah.
- Hosting dengan HTTPS (kamera browser hanya berfungsi di HTTPS).
- Akses ke data siswa awal.

---

## 4. Role dan Hak Akses

Sistem memakai **RBAC multi-role**: satu akun boleh memiliki banyak role (mis. siswa yang sekaligus pengurus eskul dan pengurus OSIS) dan berpindah *workspace* lewat menu pilihan role.

| Role | Deskripsi |
|---|---|
| **Admin (Inti OSIS)** | Kelola akun, import, eskul, keanggotaan, penetapan role, lihat kas (baca saja), audit log |
| **Bendahara** | Input dan void transaksi kas, ekspor laporan kas |
| **Pengurus Eskul (Ketua/Wakil)** | Kelola anggota eskulnya, buka sesi, scan presensi, ubah status presensi manual |
| **Siswa** | Lihat ID digital (QR) dan histori absen sendiri |
| *Super Admin (teknis)* | Akun developer untuk maintenance; tidak untuk pengguna harian |

### 4.1 Matriks Izin

| Aksi | Admin | Bendahara | Pengurus Eskul | Siswa |
|---|:-:|:-:|:-:|:-:|
| Import dan kelola akun siswa | ✅ | ❌ | ❌ | ❌ |
| Tetapkan / cabut role | ✅ | ❌ | ❌ | ❌ |
| Kelola data eskul | ✅ | ❌ | ❌ | ❌ |
| Kelola anggota eskul | ✅ (semua) | ❌ | ✅ (eskulnya) | ❌ |
| Buka/tutup sesi kegiatan | ✅ | ❌ | ✅ (eskulnya) | ❌ |
| Scan QR presensi | ❌ | ❌ | ✅ (eskulnya) | ❌ |
| Ubah presensi manual | ✅ | ❌ | ✅ (eskulnya, dengan alasan) | ❌ |
| Lihat ID QR dan histori absen sendiri | ✅ | ✅ | ✅ | ✅ |
| Input transaksi kas | ❌ | ✅ | ❌ | ❌ |
| Void transaksi kas | ❌ | ✅ | ❌ | ❌ |
| Lihat Buku Kas | ✅ (baca) | ✅ | ❌ | ❌* |
| Ekspor laporan kas | ✅ | ✅ | ❌ | ❌ |
| Ekspor rekap presensi | ✅ | ❌ | ✅ (eskulnya) | ❌ |
| Lihat audit log | ✅ | ❌ | ❌ | ❌ |

\* Opsi "ringkasan saldo untuk semua siswa" disediakan sebagai pengaturan, default **mati** (lihat Bagian 15).

---

## 5. Model Data (Ringkas)

Bukan ERD final, tetapi daftar entitas minimum yang **harus ada sejak Fase 1** supaya Fase 2–4 tidak membongkar database.

| Entitas | Field kunci | Catatan |
|---|---|---|
| `users` | uuid, nisn (unik), nama, email (nullable), password, status (aktif/nonaktif/lulus), must_change_password | UUID dipakai di URL, bukan ID berurutan |
| `roles`, `role_user` | role, user_id, **academic_year_id**, scope (mis. eskul_id) | Role terikat periode dan lingkup |
| `academic_years` | nama, tgl_mulai, tgl_selesai, is_active | **Wajib ada sejak MVP** (dasar regenerasi Fase 2) |
| `classes`, `student_profiles` | kelas, jurusan, tahun masuk | Kelas bisa berubah tiap tahun |
| `extracurriculars` | nama, deskripsi, status | |
| `extracurricular_members` | eskul_id, user_id, academic_year_id, posisi, tgl_gabung, tgl_keluar | Keanggotaan per periode |
| `activity_sessions` | eskul_id, judul, tanggal, mulai, selesai, status (draft/dibuka/ditutup), dibuat_oleh | Presensi hanya valid saat sesi dibuka |
| `attendances` | session_id, user_id, status (hadir/izin/sakit/alpa), **method** (qr/manual), scanned_by, catatan, waktu | **Unik (session_id, user_id)** |
| `qr_token_uses` | token_hash, user_id, dipakai_pada | Mencegah replay token |
| `cash_categories` | nama, tipe (masuk/keluar) | |
| `cash_transactions` | uuid, tipe, kategori, nominal, keterangan, tanggal, bukti_path, status (valid/void), void_reason, void_by, void_at, dibuat_oleh | Tidak ada edit/hapus |
| `audit_logs` | user_id, aksi, entitas, entitas_id, data_sebelum/sesudah (JSON), ip, waktu | Append-only |

---

## 6. User Flow

### 6.1 Login dan Pemilihan Workspace
1. Pengguna login dengan NISN atau email + password.
2. Jika `must_change_password = true` → wajib ganti password sebelum lanjut.
3. Sistem membaca semua role aktif pengguna pada periode berjalan.
4. Hanya Siswa → langsung ke *Student Portal*. Punya role lain → muncul pemilih workspace (Student Portal / Eskul Dashboard / Kas / Admin).
5. *Error path:* password salah berulang → throttle (lihat NFR); akun nonaktif/lulus → pesan "akun tidak aktif, hubungi admin".

### 6.2 Presensi QR
1. Pengurus Eskul membuka sesi kegiatan (judul, tanggal, jam) → status **dibuka**.
2. Siswa membuka PWA → menu ID Digital → QR tampil dan **diperbarui otomatis setiap 60 detik** (butuh koneksi).
3. Pengurus Eskul membuka *Scanner* → mengarahkan kamera ke QR siswa.
4. Server memvalidasi: token sah + belum kedaluwarsa + belum pernah dipakai + siswa anggota eskul ini + sesi sedang dibuka + belum absen di sesi ini.
5. Sukses → muncul nama dan foto/inisial siswa, status hadir tercatat. Gagal → pesan spesifik (lihat 7.D).
6. Pengurus Eskul menutup sesi → rekap tampil; siswa yang belum tercatat bisa diatur manual (izin/sakit/alpa).
7. *Fallback:* kamera rusak atau siswa tanpa HP → checklist manual dengan alasan, tercatat `method = manual`.

### 6.3 Buku Kas
1. Bendahara membuka Buku Kas → klik **Tambah Transaksi**.
2. Isi tipe, kategori, nominal, tanggal, keterangan, **unggah bukti** (tombol Simpan nonaktif sebelum bukti ada).
3. Simpan → transaksi tercatat, saldo dihitung ulang oleh server.
4. *Jika salah input:* klik **Void** → wajib isi alasan → transaksi tetap tampil tercoret, tidak masuk saldo. Koreksi dilakukan dengan transaksi baru.
5. Bendahara/Admin mengekspor laporan bulanan.

### 6.4 Siklus Awal Periode (Admin)
Buat periode → import siswa → buat eskul → tetapkan pengurus eskul → tetapkan Bendahara → pengurus eskul memasukkan anggota.

---

## 7. Fitur MVP dan Acceptance Criteria

### A. Autentikasi, Akun, dan Role
- Login tunggal dengan redirect/pemilih workspace berbasis role (bukan SSO sungguhan).
- Password awal berupa **string acak sekali pakai**, bukan tanggal lahir.
- Reset password oleh Admin; siswa dapat mengganti password sendiri.
- Siklus akun: aktif → nonaktif → lulus (data historis tetap ada).

**AC**
- [ ] AC-A1: Login pertama selalu memaksa ganti password; password baru minimal 8 karakter.
- [ ] AC-A2: Akun dengan 2+ role melihat pemilih workspace; akun 1 role langsung diarahkan.
- [ ] AC-A3: Akun nonaktif/lulus tidak bisa login, tetapi datanya tetap muncul di rekap historis.
- [ ] AC-A4: Setiap perubahan role tercatat di audit log.
- [ ] AC-A5: Percobaan login gagal 5× dalam 10 menit → akun/IP dibatasi sementara.

### B. Import Data Siswa
- Unggah `.csv`/`.xlsx` memakai template yang disediakan.
- Ada tahap **pratinjau** sebelum data benar-benar disimpan.
- Import ulang melakukan **upsert berdasarkan NISN** (tidak membuat duplikat).

**AC**
- [ ] AC-B1: Format/kolom salah → import ditolak dengan pesan baris dan kolom yang bermasalah.
- [ ] AC-B2: Pratinjau menampilkan jumlah data baru, diperbarui, dan error sebelum konfirmasi.
- [ ] AC-B3: NISN duplikat di file → baris ditandai error; NISN yang sudah ada → diperbarui, bukan diduplikasi.
- [ ] AC-B4: Hasil import menghasilkan daftar kredensial awal yang dapat diunduh **sekali** oleh Admin.
- [ ] AC-B5: Import 1.000 baris selesai tanpa timeout (diproses lewat *queue*).

### C. Eskul dan Keanggotaan
- Admin membuat eskul dan menetapkan pengurusnya.
- Pengurus Eskul menambah/menghapus anggota eskulnya per periode.

**AC**
- [ ] AC-C1: Satu siswa dapat menjadi anggota lebih dari satu eskul.
- [ ] AC-C2: Pengurus Eskul hanya melihat dan mengelola eskul yang ia pegang.
- [ ] AC-C3: Menghapus anggota mengisi `tgl_keluar`, tidak menghapus riwayat presensi lama.

### D. Sesi Kegiatan dan Presensi
- Presensi hanya dapat dilakukan **dalam sesi yang dibuka**.
- Status: **Hadir / Izin / Sakit / Alpa**.
- Rekap per sesi, per anggota, dan per eskul; ekspor CSV/PDF.

**AC (QR)**
- [ ] AC-D1: QR berganti tiap 60 detik; token kedaluwarsa (toleransi maksimal +15 detik) ditolak dengan pesan "QR kedaluwarsa".
- [ ] AC-D2: Token yang sama tidak bisa dipakai dua kali (replay ditolak: "QR sudah digunakan").
- [ ] AC-D3: Siswa bukan anggota eskul → "Bukan anggota eskul ini".
- [ ] AC-D4: Tidak ada sesi dibuka → "Sesi belum dibuka/sudah ditutup".
- [ ] AC-D5: Siswa yang sudah absen → "Sudah tercatat hadir" (tidak membuat data ganda).
- [ ] AC-D6: Pengurus Eskul tidak bisa memindai siswa dari eskul lain.
- [ ] AC-D7: Layar QR siswa menampilkan pesan jelas jika koneksi putus ("Butuh internet untuk menampilkan QR").

**AC (manual dan rekap)**
- [ ] AC-D8: Perubahan status manual wajib mengisi alasan dan tercatat siapa yang mengubah (`method = manual`, masuk audit log).
- [ ] AC-D9: Pengurus Eskul dapat mengubah status hanya dalam jendela waktu yang ditetapkan (default 24 jam setelah sesi ditutup); setelah itu hanya Admin.
- [ ] AC-D10: Ketua/Wakil dapat dicatat hadir lewat checklist manual atau di-scan Pengurus lain.
- [ ] AC-D11: Rekap bulanan satu eskul dapat diekspor dalam < 5 menit pengerjaan pengguna.

### E. Buku Kas Digital (Immutable)
- Transaksi masuk/keluar dengan kategori.
- **Bukti wajib**; file disimpan di penyimpanan privat dan diakses lewat URL bertanda tangan sementara.
- **Void**, bukan edit/hapus.
- Saldo selalu dihitung **di server** dari seluruh transaksi berstatus valid.

**AC**
- [ ] AC-E1: Tombol simpan tidak aktif tanpa bukti; server juga menolak request tanpa bukti.
- [ ] AC-E2: Tidak ada endpoint edit atau hapus transaksi.
- [ ] AC-E3: Void mewajibkan alasan; transaksi tetap tampil dengan penanda *void*, dikecualikan dari saldo.
- [ ] AC-E4: Saldo di layar selalu sama dengan hasil perhitungan server (tidak dihitung dari *state* klien).
- [ ] AC-E5: Format bukti dibatasi (JPG/PNG/PDF), ukuran maksimal 5 MB, gambar dikompres otomatis.
- [ ] AC-E6: Input, void, dan ekspor tercatat di audit log (user, waktu, IP).
- [ ] AC-E7: Laporan bulanan (PDF/XLSX) memuat saldo awal, daftar transaksi per kategori, total masuk/keluar, saldo akhir, dan transaksi void ditandai terpisah.

### F. Audit Log
**AC**
- [ ] AC-F1: Tercatat: login/logout, perubahan role, import data, perubahan presensi manual, semua aksi kas, dan ekspor data.
- [ ] AC-F2: Log bersifat *append-only* (tidak ada fitur edit/hapus di UI).
- [ ] AC-F3: Admin dapat memfilter log berdasarkan pengguna, aksi, dan rentang waktu.

---

## 8. Keputusan Desain: QR Dinamis

| Aspek | Keputusan MVP |
|---|---|
| Cara token dibuat | Server menerbitkan token, klien memperbaruinya tiap ±55 detik |
| Isi token | `uuid_siswa` + `window_waktu` + tanda tangan HMAC-SHA256 (bukan sekadar "dienkripsi") |
| Masa berlaku | 60 detik + toleransi 15 detik untuk selisih jam |
| Anti replay | Hash token disimpan di `qr_token_uses`; pemakaian kedua ditolak |
| Pengikatan ke sesi | Dilakukan saat scan (sesi milik pemindai), bukan di token |
| Offline | **Siswa wajib online** untuk menampilkan QR. Offline hanya untuk cache aplikasi dan halaman profil. Cadangan: checklist manual |
| Batasan yang diakui | QR dinamis menutup screenshot dan *share link*, tetapi tidak menutup relay layar langsung (video call). Mitigasi: Pengurus Eskul melihat orangnya langsung + presensi hanya dalam sesi dibuka |

Alternatif (TOTP dengan *secret* di perangkat) sengaja ditunda karena menambah kompleksitas dan risiko selisih jam.

---

## 9. Non-Functional Requirements

### 9.1 Keamanan
- Seluruh trafik lewat **HTTPS**; cookie `Secure`, `HttpOnly`, `SameSite`.
- Password di-hash (bcrypt/argon2); proteksi CSRF bawaan Laravel.
- Identifier publik memakai **UUID**; NISN tidak muncul di URL.
- *Rate limiting* pada login dan endpoint scan.
- Otorisasi di sisi server untuk **setiap** aksi (policy/gate), tidak hanya menyembunyikan tombol di UI.
- File bukti kas di penyimpanan privat, tidak bisa diakses lewat URL publik.

### 9.2 Privasi dan Kepatuhan
- Data siswa adalah data pribadi anak di bawah umur. Merujuk UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022), pemrosesan data anak umumnya memerlukan persetujuan orang tua/wali. **Konfirmasikan mekanismenya ke pihak sekolah** sebelum rilis.
- Prinsip minimisasi: hanya mengumpulkan data yang dipakai fitur (NISN, nama, kelas, status).
- Ada halaman kebijakan privasi singkat dan kontak admin untuk permintaan koreksi/hapus data.
- Kebijakan retensi: akun lulus dinonaktifkan; data mentah dihapus/anonim setelah `[lama retensi]` yang disepakati dengan sekolah.

### 9.3 Performa dan Keandalan
- Target: ±100 siswa dipindai dalam 2 menit; endpoint scan p95 < 500 ms pada beban tersebut.
- Import 1.000 baris diproses lewat *queue*, tidak memblokir UI.
- **Backup database otomatis minimal 1×/hari**, retensi minimal 7 hari harian + 4 mingguan, disimpan di lokasi terpisah dari server utama.
- **Uji restore** backup dilakukan sekali sebelum rilis dan tiap kuartal.

### 9.4 PWA dan Kompatibilitas
- Dapat diinstal ke *homescreen*; *app shell* ter-cache oleh Service Worker.
- Target peramban: Chrome Android terbaru (prioritas), Safari iOS, Chrome/Edge desktop.
- Tampilan responsif, mobile-first; kontras dan ukuran tombol memadai.

### 9.5 Operasional dan Maintainability
- Logging error terpusat (mis. log harian + notifikasi ke developer).
- README, panduan deployment, dan panduan admin tertulis.
- **Rencana serah terima developer** (siapa yang merawat setelah developer utama lulus) didokumentasikan sebelum rilis pilot.

---

## 10. Out of Scope Fase 1 (Eksplisit)
Tidak dikerjakan di MVP, meskipun terlihat "kecil":
- Notifikasi (push/WhatsApp/email) dan pengumuman.
- Kalender kegiatan global.
- Role Pembina, MPK, Kepala Sekolah / Wakasek.
- Pendaftaran eskul mandiri oleh siswa.
- Pembayaran/iuran online dan penagihan otomatis.
- Dashboard grafik lintas modul.
- Multi-sekolah.

---

## 11. Backlog Fase Lanjutan

*Struktur database awal (RBAC bercakupan, periode, keanggotaan) dirancang agar modul-modul ini bisa ditambahkan tanpa membongkar skema.*

**Fase 2: Administrasi Organisasi dan Koordinasi**
- [ ] Kanban Proker OSIS (To Do / In Progress / Done) per sekbid.
- [ ] E-Arsip (Sekretaris): generator surat masuk/keluar dari template baku.
- [ ] Dashboard keaktifan eskul untuk Sekbid OSIS.
- [ ] **Regenerasi kepengurusan:** serah terima akun, pemindahan role, handover arsip dan kas ke periode baru tanpa menghapus data lama.
- [ ] Pengumuman dan notifikasi dalam aplikasi.
- [ ] Kalender kegiatan.
- [ ] Ekspor rekap presensi sebagai bahan nilai eskul.

**Fase 3: Pengawasan dan Eksekutif**
- [ ] Role Pembina + approval proker (tanda tangan digital).
- [ ] Role MPK + Audit Board (rating, evaluasi, catatan atas proker OSIS yang selesai).
- [ ] Dashboard Eksekutif (Kepsek/Wakasek): *dropdown* OSIS / MPK / Eskul, ekspor PDF satu klik.
- [ ] Akses baca kas untuk Pembina/MPK/Kepsek.

**Fase 4: Fitur Lanjutan (Super App)**
- [ ] AI Voice-to-Text notulensi rapat (Whisper API).
- [ ] WhatsApp Gateway: pengingat tagihan kas dan jadwal rapat.
- [ ] Workspace Kepanitiaan (matrix organization) untuk event besar.
- [ ] Ticketing dan registrasi event eksternal (validasi bayar, tiket pengunjung).
- [ ] Manajemen inventaris/barang (peminjaman bola, kabel, kostum).
- [ ] **LPJ / Laporan Pertanggungjawaban Event Generator**
  - *Catatan:* butuh riset lebih dulu: struktur pengumpulan laporan tiap divisi, format kaku atau dinamis, dan cara menyatukannya menjadi satu dokumen otomatis.

---

## 12. Roadmap dan Estimasi

> ⚠️ Estimasi kasar untuk pengembang tunggal paruh waktu. **Belum divalidasi**; sesuaikan dengan jadwal ujian dan kesibukan kelas 12.

| Milestone | Isi | Estimasi |
|---|---|---|
| **M0 Persiapan** | Izin sekolah, data awal, hosting + HTTPS, domain, template import | 1–2 minggu |
| **M1 Fondasi** | Auth, RBAC multi-role, periode, import siswa, audit log dasar | 2–3 minggu |
| **M2 Eskul** | Master eskul, keanggotaan, sesi kegiatan | ±2 minggu |
| **M3 Presensi** | QR dinamis, scanner, manual fallback, rekap + ekspor | 2–3 minggu |
| **M4 Buku Kas** | Transaksi, bukti, void, saldo server-side, laporan bulanan | ±2 minggu |
| **M5 Hardening + Pilot** | PWA, backup + uji restore, uji beban, UAT bersama 1–2 eskul | ±2 minggu |

**Total ≈ 11–14 minggu.** Rilis pilot dengan **1–2 eskul** dulu sebelum seluruh sekolah.

**Urutan pemotongan jika waktu mepet:** (1) ekspor PDF → cukup CSV/XLSX, (2) polesan PWA, (3) M4 Buku Kas digeser setelah pilot presensi. Presensi tetap prioritas utama.

---

## 13. Definition of Done (per fitur)
- Seluruh AC fitur tersebut lulus (uji manual atau otomatis).
- Otorisasi sisi server diuji untuk setiap role (termasuk kasus *ditolak*).
- Tes otomatis untuk logika kritis: validasi token QR, perhitungan saldo, aturan void, upsert import.
- Aksi sensitif tercatat di audit log.
- Berjalan di Chrome Android (perangkat nyata) di jaringan sekolah.
- Dokumentasi diperbarui.

---

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Sekolah tidak mengizinkan / mempermasalahkan data siswa | Proyek berhenti | Minta izin dan dukungan Wakasek/Pembina di M0; sediakan kebijakan privasi |
| Sinyal/Wi-Fi sekolah buruk | QR gagal tampil | Uji di lokasi eskul; fallback manual; target ukuran halaman ringan |
| Siswa tidak punya HP/kamera | Presensi terhambat | Checklist manual dengan log alasan |
| Titip absen via relay layar | Data presensi tidak valid | Sesi dibuka hanya saat kegiatan; Pengurus melihat langsung; audit metode manual vs QR |
| Data siswa tidak rapi | Import gagal/duplikat | Template baku, pratinjau, upsert NISN |
| Pengembang utama lulus (2027) | Aplikasi tidak terawat | Dokumentasi, README, calon penerus dari kelas 10/11 sejak M3 |
| Scope membengkak | Rilis tertunda | Bagian 10 jadi pagar; ubah scope hanya lewat revisi PRD |
| Kehilangan data | Kas dan presensi hilang | Backup harian + uji restore |

---

## 15. Pertanyaan Terbuka (Perlu Keputusan Pemilik Produk)
1. Berapa jumlah siswa dan eskul aktif? (menentukan ukuran beban dan target M1)
2. Apakah ringkasan saldo kas boleh dilihat **semua siswa**, hanya pengurus OSIS, atau tidak sama sekali?
3. Apakah Pembina eskul (guru) perlu login di MVP, atau cukup menerima laporan dari pengurus?
4. Kas yang dicatat hanya kas OSIS, atau juga iuran/kas per eskul?
5. Siapa yang menanggung biaya hosting dan domain, dan di mana datanya disimpan?
6. Bagaimana mekanisme persetujuan orang tua/wali yang diminta sekolah?
7. Berapa lama data siswa lulus disimpan?
8. Siapa calon penerus yang akan memegang aplikasi setelah 2027?

> Status berubah menjadi **Approved for Development** setelah pertanyaan 1, 2, 5, dan 6 terjawab dan izin sekolah diperoleh.

---

## 16. Riwayat Revisi

| Versi | Perubahan utama |
|---|---|
| 1.0 | PRD awal: 6 role, 3 modul besar |
| 2.0 | MVP dipangkas jadi Presensi + Kas, ditambah metrik, user flow, AC, NFR, backlog Fase 2–4 |
| 3.0 | Memperbaiki kontradiksi QR vs offline; token bertanda tangan + anti replay; password acak; entitas eskul/keanggotaan/sesi/periode; status izin-sakit-alpa; akses baca kas; saldo server-side; ekspor laporan; audit log diperluas; lifecycle akun; privasi (UU PDP); hosting/HTTPS; rencana serah terima; roadmap, risiko, DoD, pertanyaan terbuka |
