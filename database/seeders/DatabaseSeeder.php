<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\AppSetting;
use App\Models\CashCategory;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\Letter;
use App\Models\OsisMeeting;
use App\Models\OsisProgram;
use App\Models\OsisSekbid;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\StudentEnrollment;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $roles = [
            ['name' => 'super_admin', 'label' => 'Super Administrator'],
            ['name' => 'admin', 'label' => 'Admin Sekolah / Pembina'],
            ['name' => 'ketua_osis', 'label' => 'Ketua OSIS'],
            ['name' => 'wakil_ketua_osis', 'label' => 'Wakil Ketua OSIS'],
            ['name' => 'sekretaris_osis', 'label' => 'Sekretaris OSIS'],
            ['name' => 'bendahara', 'label' => 'Bendahara OSIS'],
            ['name' => 'ketua_sekbid', 'label' => 'Ketua Seksi Bidang'],
            ['name' => 'sekretaris_sekbid', 'label' => 'Sekretaris Seksi Bidang'],
            ['name' => 'anggota_osis', 'label' => 'Anggota OSIS'],
            ['name' => 'pengurus_eskul', 'label' => 'Pengurus Ekstrakurikuler'],
            ['name' => 'siswa', 'label' => 'Siswa'],
        ];

        $roleModels = [];
        foreach ($roles as $r) {
            $roleModels[$r['name']] = Role::firstOrCreate(['name' => $r['name']], $r);
        }

        // Call Official 10 Sekbid Seeder per Permendiknas No. 39/2008
        $this->call(OsisSekbidSeeder::class);

        // 2. Active Academic Year
        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2026/2027'],
            [
                'start_date' => '2026-07-01',
                'end_date' => '2027-06-30',
                'is_active' => true,
            ]
        );

        // 3. Default App Settings
        $settings = [
            ['key' => 'qr_token_ttl_seconds', 'value' => '60', 'description' => 'Masa berlaku token QR dinamis (detik)'],
            ['key' => 'qr_token_tolerance_seconds', 'value' => '15', 'description' => 'Toleransi selisih waktu scan QR (detik)'],
            ['key' => 'attendance_manual_window_hours', 'value' => '24', 'description' => 'Jendela waktu pengurus mengedit presensi manual setelah sesi ditutup (jam)'],
            ['key' => 'public_cash_summary_enabled', 'value' => '0', 'description' => 'Apakah siswa dapat melihat ringkasan saldo kas OSIS (1 = ya, 0 = tidak)'],
            ['key' => 'school_name', 'value' => 'SMA Negeri 1 Prestasi', 'description' => 'Nama instansi sekolah'],
        ];

        foreach ($settings as $s) {
            AppSetting::firstOrCreate(['key' => $s['key']], $s);
        }

        // 4. Default Cash Categories
        $categories = [
            ['name' => 'Saldo Awal', 'type' => 'masuk', 'is_active' => true, 'is_system' => true],
            ['name' => 'Iuran Anggota', 'type' => 'masuk', 'is_active' => true, 'is_system' => false],
            ['name' => 'Dana Bantuan Sekolah', 'type' => 'masuk', 'is_active' => true, 'is_system' => false],
            ['name' => 'Sponsor & Donasi', 'type' => 'masuk', 'is_active' => true, 'is_system' => false],
            ['name' => 'Konsumsi Rapat & Kegiatan', 'type' => 'keluar', 'is_active' => true, 'is_system' => false],
            ['name' => 'Perlengkapan & Logistik', 'type' => 'keluar', 'is_active' => true, 'is_system' => false],
            ['name' => 'Transportasi', 'type' => 'keluar', 'is_active' => true, 'is_system' => false],
            ['name' => 'Lain-lain', 'type' => 'keluar', 'is_active' => true, 'is_system' => false],
        ];

        foreach ($categories as $cat) {
            CashCategory::firstOrCreate(
                ['name' => $cat['name'], 'type' => $cat['type']],
                $cat
            );
        }

        // 5. Seed Core Accounts for Local Development
        $defaultPassword = Hash::make('password123');

        // Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Super Administrator',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $superAdmin->roles()->syncWithoutDetaching([
            $roleModels['super_admin']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Admin Sekolah / Pembina
        $admin = User::firstOrCreate(
            ['email' => 'admin@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Bapak H. Wahyudi, M.Pd (Pembina / Admin Sekolah)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $admin->roles()->syncWithoutDetaching([
            $roleModels['admin']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Ketua OSIS
        $ketuaOsis = User::firstOrCreate(
            ['email' => 'ketua.osis@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'nisn' => '0051234550',
                'name' => 'Zidny Al Hikam (Ketua OSIS)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $ketuaOsis->roles()->syncWithoutDetaching([
            $roleModels['ketua_osis']->id => ['academic_year_id' => $academicYear->id],
            $roleModels['siswa']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Wakil Ketua OSIS
        $wakilOsis = User::firstOrCreate(
            ['email' => 'wakil.osis@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'nisn' => '0051234551',
                'name' => 'Ahmad Fauzi (Wakil Ketua OSIS)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $wakilOsis->roles()->syncWithoutDetaching([
            $roleModels['wakil_ketua_osis']->id => ['academic_year_id' => $academicYear->id],
            $roleModels['siswa']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Sekretaris OSIS
        $sekretaris = User::firstOrCreate(
            ['email' => 'sekretaris@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'nisn' => '0051234552',
                'name' => 'Anindya Putri (Sekretaris OSIS)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $sekretaris->roles()->syncWithoutDetaching([
            $roleModels['sekretaris_osis']->id => ['academic_year_id' => $academicYear->id],
            $roleModels['siswa']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Bendahara
        $bendahara = User::firstOrCreate(
            ['email' => 'bendahara@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'nisn' => '0051234553',
                'name' => 'Siti Rahma (Bendahara OSIS)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $bendahara->roles()->syncWithoutDetaching([
            $roleModels['bendahara']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Ketua Sekbid 1 (Keimanan & Ketakwaan)
        $sekbid1 = OsisSekbid::where('number', 1)->first();
        $ketuaSekbid1 = User::firstOrCreate(
            ['email' => 'sekbid1@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'nisn' => '0051234554',
                'name' => 'Muhammad Farhan (Ketua Sekbid 1)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $ketuaSekbid1->roles()->syncWithoutDetaching([
            $roleModels['ketua_sekbid']->id => [
                'academic_year_id' => $academicYear->id,
                'osis_sekbid_id' => $sekbid1?->id,
            ],
            $roleModels['siswa']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Anggota OSIS Biasa
        $anggotaOsis = User::firstOrCreate(
            ['email' => 'anggota.osis@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'nisn' => '0051234555',
                'name' => 'Budi Santoso (Anggota OSIS)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $anggotaOsis->roles()->syncWithoutDetaching([
            $roleModels['anggota_osis']->id => ['academic_year_id' => $academicYear->id],
            $roleModels['siswa']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // 6. Extracurriculars
        $pramuka = Extracurricular::firstOrCreate(
            ['name' => 'Pramuka'],
            [
                'uuid' => (string) Str::uuid(),
                'description' => 'Praja Muda Karana Pangkalan SMAN 1',
                'status' => 'aktif',
            ]
        );

        $pmr = Extracurricular::firstOrCreate(
            ['name' => 'Palang Merah Remaja (PMR)'],
            [
                'uuid' => (string) Str::uuid(),
                'description' => 'Korps Sukarela dan Kesiapsiagaan PMR',
                'status' => 'aktif',
            ]
        );

        // Pengurus Eskul Pramuka
        $pengurus = User::firstOrCreate(
            ['email' => 'pengurus@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'nisn' => '0051234561',
                'name' => 'Budi Santoso (Ketua Pramuka)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $pengurus->roles()->syncWithoutDetaching([
            $roleModels['pengurus_eskul']->id => [
                'academic_year_id' => $academicYear->id,
                'extracurricular_id' => $pramuka->id,
            ],
            $roleModels['siswa']->id => [
                'academic_year_id' => $academicYear->id,
            ],
        ]);

        // Sample Class
        $class12 = SchoolClass::firstOrCreate(
            ['academic_year_id' => $academicYear->id, 'name' => 'XII PPLG 1'],
            ['major' => 'Pengembangan Perangkat Lunak', 'grade_level' => 12]
        );

        // Sample Students
        $siswa = User::firstOrCreate(
            ['nisn' => '0051234562'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Ahmad Fajar Pratama',
                'email' => 'siswa@sinergi.test',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $siswa->roles()->syncWithoutDetaching([
            $roleModels['siswa']->id => ['academic_year_id' => $academicYear->id],
        ]);

        StudentProfile::firstOrCreate(
            ['user_id' => $siswa->id],
            ['entry_year' => 2024]
        );

        StudentEnrollment::firstOrCreate(
            ['user_id' => $siswa->id, 'academic_year_id' => $academicYear->id],
            ['class_id' => $class12->id]
        );

        // Enroll Budi Santoso & Ahmad Fajar in Pramuka
        ExtracurricularMember::firstOrCreate(
            [
                'extracurricular_id' => $pramuka->id,
                'user_id' => $pengurus->id,
                'academic_year_id' => $academicYear->id,
            ],
            [
                'position' => 'ketua',
                'joined_at' => '2026-07-15',
            ]
        );

        ExtracurricularMember::firstOrCreate(
            [
                'extracurricular_id' => $pramuka->id,
                'user_id' => $siswa->id,
                'academic_year_id' => $academicYear->id,
            ],
            [
                'position' => 'anggota',
                'joined_at' => '2026-07-20',
            ]
        );

        // 7. Seed Initial E-Arsip Letters
        Letter::firstOrCreate(
            ['reference_number' => '421/045/Disdik/X/2026'],
            [
                'academic_year_id' => $academicYear->id,
                'type' => 'masuk',
                'classification_code' => 'UND',
                'sender_or_recipient' => 'Dinas Pendidikan Provinsi / Balai Wilayah Kesiswaan',
                'subject' => 'Undangan Sarasehan & Temu Forum Ketua OSIS Pelajar Berprestasi',
                'letter_date' => '2026-10-05',
                'received_or_sent_date' => '2026-10-06',
                'description' => 'Delegasi 2 orang pengurus presidium OSIS untuk menghadiri sarasehan kepemimpinan pelajar.',
                'status' => 'diarsipkan',
                'created_by' => $sekretaris->id,
            ]
        );

        Letter::firstOrCreate(
            ['reference_number' => '001/OSIS/UND/X/2026'],
            [
                'academic_year_id' => $academicYear->id,
                'type' => 'keluar',
                'classification_code' => 'UND',
                'sender_or_recipient' => 'Seluruh Ketua Ekstrakurikuler & Sekbid 1 s.d. 10',
                'subject' => 'Undangan Rapat Koordinasi Sinergi Program Kerja Triwulan I',
                'letter_date' => '2026-10-08',
                'received_or_sent_date' => '2026-10-08',
                'description' => 'Rapat koordinasi penyelarasan kalender kegiatan seluruh sekbid dan ekstrakurikuler di Aula Utama.',
                'status' => 'disetujui',
                'created_by' => $sekretaris->id,
                'approved_by' => $ketuaOsis->id,
            ]
        );

        // 8. Seed Initial Program Kerja OSIS (Permendiknas No. 39/2008)
        $sekbid9 = OsisSekbid::where('number', 9)->first();
        if ($sekbid1) {
            OsisProgram::firstOrCreate(
                ['name' => 'Kajian Akbar Toleransi & Peringatan Maulid Nabi Pelajar'],
                [
                    'academic_year_id' => $academicYear->id,
                    'osis_sekbid_id' => $sekbid1->id,
                    'description' => 'Program pembinaan keimanan lintas rohis dan sarasehan toleransi beragama di lingkungan sekolah.',
                    'target_audience' => 'Seluruh Siswa Muslim & Delegasi OSIS',
                    'start_date' => '2026-10-20',
                    'end_date' => '2026-10-21',
                    'estimated_budget' => 2500000,
                    'status' => 'disetujui',
                    'pic_user_id' => $ketuaSekbid1->id,
                    'approval_note' => 'Disetujui. Koordinasikan penggunaan sound system dengan sarpras.',
                    'approved_by' => $ketuaOsis->id,
                    'approved_at' => now(),
                    'created_by' => $ketuaSekbid1->id,
                ]
            );
        }

        if ($sekbid9) {
            OsisProgram::firstOrCreate(
                ['name' => 'Workshop Literasi Digital & Pemrograman Web Sinergi'],
                [
                    'academic_year_id' => $academicYear->id,
                    'osis_sekbid_id' => $sekbid9->id,
                    'description' => 'Pelatihan pemanfaatan TIK untuk edukasi, coding pemula, dan media informasi digital OSIS.',
                    'target_audience' => 'Anggota IT Club & Perwakilan Kelas X-XI',
                    'start_date' => '2026-11-05',
                    'end_date' => '2026-11-06',
                    'estimated_budget' => 1750000,
                    'status' => 'diajukan',
                    'pic_user_id' => $ketuaOsis->id,
                    'created_by' => $ketuaOsis->id,
                ]
            );
        }

        // 9. Seed Initial Agenda / Rapat OSIS
        OsisMeeting::firstOrCreate(
            ['title' => 'Rapat Pleno Koordinasi Program Kerja Triwulan I'],
            [
                'academic_year_id' => $academicYear->id,
                'meeting_type' => 'pleno',
                'meeting_date' => '2026-10-15',
                'start_time' => '13:30',
                'end_time' => '16:00',
                'location' => 'Aula Utama & Ruang Multimedia',
                'agenda_description' => 'Penyelarasan jadwal 10 Sekbid Permendiknas 39/2008 dengan kalender akademik sekolah.',
                'status' => 'dijadwalkan',
                'created_by' => $ketuaOsis->id,
            ]
        );

        OsisMeeting::firstOrCreate(
            ['title' => 'Sidang Evaluasi Kinerja Bulanan Presidium OSIS'],
            [
                'academic_year_id' => $academicYear->id,
                'meeting_type' => 'presidium',
                'meeting_date' => '2026-10-02',
                'start_time' => '14:00',
                'end_time' => '15:30',
                'location' => 'Ruang Sekretariat OSIS',
                'agenda_description' => 'Evaluasi serapan dana kas awal dan penerbitan nomor surat resmi.',
                'status' => 'selesai',
                'minutes_of_meeting' => 'Disepakati pembagian tugas pembuatan disposisi surat masuk oleh sekretaris dan sinkronisasi presensi QR eskul.',
                'created_by' => $sekretaris->id,
            ]
        );
    }
}
