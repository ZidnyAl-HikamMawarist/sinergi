# 🗺️ SYSTEM MAP — SINERGI (Sistem Integrasi Ekstrakurikuler dan Organisasi)
*Terakhir diperbarui: 2026-10-11 | Living Architecture Blueprint*

Dokumen ini adalah **Single Source of Truth** arsitektur SINERGI. Setiap agen AI wajib membaca dokumen ini terlebih dahulu sebelum menganalisis atau menambahkan kode baru untuk menghemat token dan mencegah kesalahan asumsi.

---

## 1. Stack & Konvensi Inti
* **Backend:** Laravel 13.0 (PHP 8.3)
* **Frontend:** React 19, Inertia.js v2, Vite 7, Tailwind CSS 4 (`@tailwindcss/vite`)
* **Database:** SQLite (Local & Testing) / MySQL 8.x (Production)
* **Timezone:** `Asia/Jakarta` (WIB) — seluruh kalkulasi QR dan rekaman waktu terikat ke WIB.
* **Desain:** SINERGI Theme (Solid Navy `#123B5D`, Blue `#1769AA`, Green `#2A9D6F`, Amber `#F4B942`, Coral `#E76F51`, NO Gradients).
* **PWA:** Standalone manifest + Service Worker caching whitelist non-authenticated (`public/sw.js`).
* **Standar Organisasi Kesiswaan:** Wajib merujuk secara ketat pada **Permendiknas Nomor 39 Tahun 2008 tentang Pembinaan Kesiswaan** (Pasal 3 & Lampiran untuk 10 Seksi Bidang OSIS).

---

## 2. Peta Database & Relasi (Schema Map)

| Nama Tabel | Primary / Unique Key | Foreign Keys & Relasi | Kolom Kunci & Enum | Aturan Integritas |
|---|---|---|---|---|
| `users` | `id`, `uuid` (unique) | - | `status: aktif\|nonaktif\|lulus`, `nisn`, `email`, `must_change_password` | UUID untuk rujukan publik, auth multi-role |
| `roles` | `id`, `name` (unique) | - | `name: super_admin\|admin\|ketua_osis\|wakil_ketua_osis\|sekretaris_osis\|bendahara\|ketua_sekbid\|sekretaris_sekbid\|anggota_osis\|pengurus_eskul\|siswa` | Master data peran pengguna. `admin` adalah Admin Sekolah/Pembina, bukan Ketua OSIS. |
| `role_user` | `id` | `user_id -> users.id`, `role_id -> roles.id`, `academic_year_id -> academic_years.id`, `extracurricular_id -> extracurriculars.id`, `osis_sekbid_id -> osis_sekbids.id` | Pivot multi-role per tahun ajaran | Satu siswa dapat memiliki banyak role lintas eskul/sekbid/tahun |
| `academic_years` | `id` | - | `name`, `start_date`, `end_date`, `is_active` (boolean) | Scope seluruh transaksi, surat, & keanggotaan |
| `school_classes` | `id` | - | `name`, `grade`, `major` | Referensi rombel kelas siswa |
| `student_profiles`| `id` | `user_id -> users.id` (unique) | `gender: L\|P`, `phone`, `address` | Profil pelengkap data siswa |
| `class_enrollments`| `id` | `user_id -> users.id`, `school_class_id -> school_classes.id`, `academic_year_id -> academic_years.id` | Riwayat kelas per tahun ajaran | Siswa naik kelas tiap tahun ajaran |
| `extracurriculars`| `id`, `uuid` (unique) | - | `name`, `description`, `status: aktif\|nonaktif` | Master ekstrakurikuler sekolah |
| `extracurricular_members` | `id`, unique(`extracurricular_id`, `user_id`, `academic_year_id`) | `extracurricular_id -> extracurriculars.id`, `user_id -> users.id`, `academic_year_id -> academic_years.id` | **`position: ketua\|wakil\|anggota`** *(lowercase)*, `joined_at`, `left_at` | Anggota keluar diisi `left_at`, tidak dihapus permanen |
| `osis_sekbids` | `id`, `number` (unique, 1-10) | - | `number`, `name`, `short_title`, `description`, `official_duties` (json), `coordinating_eskuls` (json), `is_active` (boolean) | Master 10 Sekbid resmi Permendiknas No. 39/2008 |
| `letters` | `id`, `uuid` (unique) | `academic_year_id -> academic_years.id`, `created_by -> users.id`, `approved_by -> users.id` | `type: masuk\|keluar`, `reference_number`, `classification_code`, `sender_or_recipient`, `subject`, `letter_date`, `received_or_sent_date`, `status: draft\|diajukan\|disetujui\|diarsipkan`, `file_path`, `file_name`, `file_size`, `file_mime` | E-Arsip surat OSIS dengan penomoran resmi baku dan private file streaming |
| `osis_programs` | `id`, `uuid` (unique) | `academic_year_id -> academic_years.id`, `osis_sekbid_id -> osis_sekbids.id`, `proposed_by -> users.id`, `approved_by -> users.id` | `name`, `description`, `objective`, `target_audience`, `start_date`, `end_date`, `estimated_budget`, `status: usulan\|disetujui\|ditolak\|berjalan\|terlaksana`, `notes` | Manajemen Program Kerja Sekbid 1-10; pengesahan oleh Presidium/Admin |
| `osis_meetings` | `id`, `uuid` (unique) | `academic_year_id -> academic_years.id`, `osis_sekbid_id -> osis_sekbids.id` (nullable), `leader_id -> users.id`, `notetaker_id -> users.id` | `title`, `type: pleno\|presidium\|koordinasi_sekbid\|evaluasi`, `meeting_date`, `start_time`, `end_time`, `location`, `agenda`, `minutes`, `action_items`, `status: dijadwalkan\|berlangsung\|selesai\|dibatalkan` | Agenda rapat & notulensi digital terpusat lintas presidium dan sekbid |
| `activity_sessions`| `id`, `uuid` (unique) | `extracurricular_id -> extracurriculars.id`, `academic_year_id -> academic_years.id`, `created_by -> users.id` | `title`, `session_date`, `start_time`, `end_time`, `status: draft\|dibuka\|ditutup`, `opened_at`, `closed_at` | Presensi hanya sah saat status `dibuka` |
| `attendances` | `id`, unique(`activity_session_id`, `user_id`) | `activity_session_id -> activity_sessions.id`, `user_id -> users.id`, `recorded_by -> users.id` | `status: hadir\|izin\|sakit\|alpa`, `method: qr\|manual`, `recorded_at`, `note` | Satu siswa hanya absen 1x per sesi |
| `qr_token_uses` | `id`, `token_hash` (unique)| `user_id -> users.id` | `used_at` (datetime) | Perlindungan replay token QR dinamis (HMAC 60s) |
| `cash_categories` | `id` | - | `name`, `type: masuk\|keluar` | Klasifikasi buku kas |
| `cash_transactions`| `id`, `uuid` (unique) | `academic_year_id -> academic_years.id`, `cash_category_id -> cash_categories.id`, `created_by -> users.id`, `void_by -> users.id` | `type: masuk\|keluar`, `amount` (bigint), `description`, `transaction_date`, `proof_path`, `status: valid\|void`, `void_reason`, `void_at` | **IMMUTABLE**: Dilarang edit/delete, koreksi hanya via status `void` |
| `audit_logs` | `id` | `user_id -> users.id` | `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address` | Append-only security tracking |

---

## 3. Peta Jalur Alur Kode (Wiring & Routing Map)

| Workspace / Domain | Method & URI | Route Name | Controller & Action | Model Terkait | Halaman Inertia (React) |
|---|---|---|---|---|---|
| **Portal Siswa** | `GET /portal/dashboard` | `portal.dashboard` | `Portal\PortalDashboardController@index` | `User`, `ExtracurricularMember`, `Attendance` | `Pages/Portal/Dashboard.jsx` |
| | `GET /portal/qr-token` | `portal.qr.token` | `Portal\PortalDashboardController@getFreshQrToken` | `QrTokenService` | JSON (Token + TTL 60s) |
| **Pengurus Eskul** | `GET /eskul/dashboard` | `eskul.dashboard` | `Eskul\EskulDashboardController@index` | `ActivitySession`, `Extracurricular` | `Pages/Eskul/Dashboard.jsx` |
| | `GET /eskul/sessions` | `eskul.sessions.index` | `Eskul\EskulDashboardController@index` | `ActivitySession` | `Pages/Eskul/Dashboard.jsx` |
| | `POST /eskul/sessions` | `eskul.sessions.store` | `Eskul\ActivitySessionController@store` | `ActivitySession` | Redirect / Flash |
| | `POST /eskul/sessions/{session}/close` | `eskul.sessions.close` | `Eskul\AttendanceController@closeSession` | `ActivitySession` | Redirect / Flash |
| | `GET /eskul/scanner` | `eskul.scanner` | `Eskul\AttendanceController@showScanner` | `ActivitySession` | `Pages/Eskul/Scanner.jsx` |
| | `POST /eskul/attendance/scan` | `eskul.attendance.scan` | `Eskul\AttendanceController@scan` | `Attendance`, `QrTokenService` | JSON scan result (WIB) |
| | `POST /eskul/attendance/manual` | `eskul.attendance.manual`| `Eskul\AttendanceController@manual` | `Attendance` | Redirect / Flash |
| | `GET /eskul/members` | `eskul.members.index` | `Eskul\EskulMemberController@index` | `ExtracurricularMember` | `Pages/Eskul/Members.jsx` |
| | `POST /eskul/members` | `eskul.members.store` | `Eskul\EskulMemberController@store` | `ExtracurricularMember` | Redirect / Flash |
| | `DELETE /eskul/members/{member}`| `eskul.members.destroy`| `Eskul\EskulMemberController@destroy` | `ExtracurricularMember` | Redirect (Set `left_at`) |
| | `GET /eskul/rekap` | `eskul.rekap` | `Eskul\AttendanceRecapController@index` | `Attendance`, `ActivitySession` | `Pages/Eskul/Recap.jsx` |
| | `GET /eskul/rekap/export` | `eskul.rekap.export` | `Eskul\AttendanceRecapController@exportCsv` | `Attendance` | Streamed CSV download |
| | `GET /eskul/analytics` | `eskul.analytics` | `Eskul\AttendanceAnalyticsController@index` | `Attendance`, `ExtracurricularMember` | `Pages/Eskul/Analytics.jsx` |
| **Buku Kas** | `GET /kas/dashboard` | `kas.dashboard` | `Kas\KasDashboardController@index` | `CashTransaction`, `CashCategory` | `Pages/Kas/Dashboard.jsx` |
| | `POST /kas/transactions` | `kas.transactions.store`| `Kas\CashTransactionController@store` | `CashTransaction` | Redirect / Flash |
| | `POST /kas/transactions/{uuid}/void` | `kas.transactions.void`| `Kas\CashTransactionController@void` | `CashTransaction` | Redirect / Flash |
| | `GET /kas/transactions/{uuid}/proof` | `kas.transactions.proof`| `Kas\CashTransactionController@showProof`| `CashTransaction` | Private File Stream (nosniff) |
| **Admin Sekolah** | `GET /admin/dashboard` | `admin.dashboard` | `Admin\AdminDashboardController@index` | Master & System Counts | `Pages/Admin/Dashboard.jsx` |
| | `GET /admin/eskul` | `admin.eskul.index` | `Admin\ExtracurricularController@index` | `Extracurricular` | `Pages/Admin/Extracurriculars.jsx` |
| | `GET /admin/students` | `admin.students.index` | `Admin\StudentController@index` | `User`, `SchoolClass` | `Pages/Admin/Students.jsx` |
| | `GET /admin/import` | `admin.import.index` | `Admin\StudentImportController@index` | Import Batches | `Pages/Admin/Import.jsx` |
| | `GET /admin/audit-logs` | `admin.audit-logs.index` | `Admin\AuditLogController@index` | `AuditLog` | `Pages/Admin/AuditLogs.jsx` |
| **Presidium OSIS** | `GET /osis/dashboard` | `osis.dashboard` | `Osis\OsisDashboardController@index` | `OsisSekbid`, `Letter`, `ActivitySession` | `Pages/Osis/Dashboard.jsx` |
| | `GET /osis/sekbid` | `osis.sekbid.index` | `Osis\OsisSekbidController@index` | `OsisSekbid` | `Pages/Osis/Sekbid/Index.jsx` |
| **Program Kerja OSIS** | `GET /osis/program` | `osis.program.index` | `Osis\OsisProgramController@index` | `OsisProgram`, `OsisSekbid` | `Pages/Osis/Program/Index.jsx` |
| | `POST /osis/program` | `osis.program.store` | `Osis\OsisProgramController@store` | `OsisProgram` | Redirect / Flash |
| | `POST /osis/program/{uuid}/approve` | `osis.program.approve` | `Osis\OsisProgramController@approve` | `OsisProgram` | Redirect / Flash (Presidium Only) |
| | `POST /osis/program/{uuid}/status` | `osis.program.status` | `Osis\OsisProgramController@updateStatus` | `OsisProgram` | Redirect / Flash |
| **Agenda & Rapat OSIS** | `GET /osis/agenda` | `osis.agenda.index` | `Osis\OsisMeetingController@index` | `OsisMeeting`, `OsisSekbid` | `Pages/Osis/Agenda/Index.jsx` |
| | `POST /osis/agenda` | `osis.agenda.store` | `Osis\OsisMeetingController@store` | `OsisMeeting` | Redirect / Flash |
| | `POST /osis/agenda/{uuid}/notulensi` | `osis.agenda.notulensi` | `Osis\OsisMeetingController@updateMinutes` | `OsisMeeting` | Redirect / Flash |
| **E-Arsip OSIS** | `GET /osis/arsip` | `osis.arsip.index` | `Osis\LetterArchiveController@index` | `Letter` | `Pages/Osis/Arsip/Index.jsx` |
| | `POST /osis/arsip` | `osis.arsip.store` | `Osis\LetterArchiveController@store` | `Letter` | Redirect / Flash |
| | `GET /osis/arsip/generate-nomor` | `osis.arsip.generate-nomor` | `Osis\LetterArchiveController@generateReferenceNumber` | `Letter` | JSON (`reference_number`) |
| | `GET /osis/arsip/{uuid}/file` | `osis.arsip.file` | `Osis\LetterArchiveController@showFile` | `Letter` | Private File Stream (nosniff) |
| | `POST /osis/arsip/{uuid}/status` | `osis.arsip.status` | `Osis\LetterArchiveController@updateStatus` | `Letter` | Redirect / Flash |

---

## 4. Helper, Scope & Aturan Bisnis Kunci
* **Academic Year:** Ambil periode berjalan via `AcademicYear::active()`.
* **Pemisahan Peran Admin vs OSIS:** Peran `admin` dikhususkan bagi Admin Sekolah / Pembina Kesiswaan (manajemen master data, akun, eskul, audit sistem). Kepengurusan siswa OSIS dikelola oleh `ketua_osis`, `wakil_ketua_osis`, `sekretaris_osis`, `bendahara`, `ketua_sekbid`, `sekretaris_sekbid`, dan `anggota_osis`.
* **Standar Penomoran Surat Resmi OSIS:** Mengikuti pola baku persuratan resmi `[NomorUrut]/OSIS/[KodeKlasifikasi]/[BulanRomawi]/[Tahun]`, contoh: `001/OSIS/UND/X/2026`. Nomor urut dihitung otomatis per tahun ajaran berjalan.
* **10 Seksi Bidang Permendiknas 39/2008:** Dilarang mengarang tugas atau eskul naungan sekbid. Seluruh data seeder dan master tabel `osis_sekbids` merujuk ketat pada Pasal 3 dan Lampiran Permendiknas No. 39 Tahun 2008.
* **Immutabilitas Kas:** Model `CashTransaction` melempar `RuntimeException` jika dicoba `delete()`. Pembaruan atribut selain status `void` diblokir oleh model hook `updating`.
* **Formula Injection:** Seluruh ekspor CSV wajib mensterilkan karakter berbahaya (`=`, `+`, `-`, `@`, `\t`, `\r`) dengan awalan kutip tunggal `'`.
* **Private Storage Streaming:** Berkas bukti transaksi (`receipts/`) dan berkas arsip surat (`letters/`) disimpan di private disk `local` (`storage/app/private`), diakses via endpoint berotorisasi dengan header `nosniff` dan `CSP`.

---

## 5. Changelog Fitur & Arsitektur
* **2026-10-11** [feat/osis-proker-agenda]: Implementasi modul Program Kerja Sekbid 1 s.d. 10 (usulan, validasi presidium, pelacakan anggaran & status pelaksanaan) serta modul Agenda Rapat OSIS dan Notulensi Digital (Pleno, Presidium, Koordinasi Sekbid, Evaluasi) berpedoman ketat pada Permendiknas No. 39 Tahun 2008.
* **2026-10-11** [feat/osis-org-matrix]: Pemisahan arsitektural Dashboard Admin Sekolah (`/admin`) dan Presidium OSIS (`/osis`), penambahan modul E-Arsip Surat Sekretaris OSIS (Surat Masuk, Surat Keluar, generator nomor otomatis format resmi, upload berkas terproteksi), serta implementasi master 10 Seksi Bidang OSIS berlandaskan hukum Permendiknas No. 39 Tahun 2008.
* **2026-10-11** [feat/analytics]: Menambahkan modul `AttendanceAnalyticsController`, halaman `Analytics.jsx`, navigasi sidebar `eskul.analytics`, serta metrik *participation tiers* (tinggi >=80%, sedang 50-79%, rendah <50% / at-risk).
* **2026-10-10** [perf/query]: Mengoptimalkan query dashboard kas menjadi agregasi kondisional tunggal dan scoping keanggotaan siswa.
* **2026-10-10** [security/pwa]: Memperketat cache service worker terhadap data autentikasi dan menambahkan offline fallback page.
