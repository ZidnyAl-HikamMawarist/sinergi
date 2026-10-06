<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\AppSetting;
use App\Models\CashCategory;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
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
            ['name' => 'admin', 'label' => 'Admin Inti OSIS'],
            ['name' => 'bendahara', 'label' => 'Bendahara'],
            ['name' => 'pengurus_eskul', 'label' => 'Pengurus Ekstrakurikuler'],
            ['name' => 'siswa', 'label' => 'Siswa'],
        ];

        $roleModels = [];
        foreach ($roles as $r) {
            $roleModels[$r['name']] = Role::firstOrCreate(['name' => $r['name']], $r);
        }

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

        // Admin OSIS
        $admin = User::firstOrCreate(
            ['email' => 'admin@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Zidny Al Hikam (Ketua OSIS)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $admin->roles()->syncWithoutDetaching([
            $roleModels['admin']->id => ['academic_year_id' => $academicYear->id],
        ]);

        // Bendahara
        $bendahara = User::firstOrCreate(
            ['email' => 'bendahara@sinergi.test'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Siti Rahma (Bendahara OSIS)',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'must_change_password' => false,
            ]
        );
        $bendahara->roles()->syncWithoutDetaching([
            $roleModels['bendahara']->id => ['academic_year_id' => $academicYear->id],
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
    }
}
