<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\StudentEnrollment;
use App\Models\StudentProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');

        // 1. Roles & Academic Year
        $siswaRole = Role::firstOrCreate(['name' => 'siswa'], ['label' => 'Siswa']);
        $pengurusRole = Role::firstOrCreate(['name' => 'pengurus_eskul'], ['label' => 'Pengurus Eskul']);
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['label' => 'Admin Inti OSIS']);
        $bendaharaRole = Role::firstOrCreate(['name' => 'bendahara'], ['label' => 'Bendahara']);

        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2026/2027'],
            ['start_date' => '2026-07-01', 'end_date' => '2027-06-30', 'is_active' => true]
        );

        // 2. Extracurriculars
        $eskulsData = [
            ['name' => 'Pramuka', 'description' => 'Praja Muda Karana Gugus Depan SMAN 1 Prestasi'],
            ['name' => 'Paskibra', 'description' => 'Pasukan Pengibar Bendera Pusaka'],
            ['name' => 'Palang Merah Remaja (PMR)', 'description' => 'Korps Sukarela dan Kesiapsiagaan Pertolongan Pertama'],
            ['name' => 'Futsal Club', 'description' => 'Klub Olahraga dan Pembinaan Atlet Futsal'],
            ['name' => 'Basket Club', 'description' => 'Tim Basket Putra dan Putri SMAN 1'],
            ['name' => 'Rohis (Rohani Islam)', 'description' => 'Forum Kajian Keislaman dan Karakter Mulia'],
        ];

        $eskuls = [];
        foreach ($eskulsData as $ed) {
            $eskuls[$ed['name']] = Extracurricular::firstOrCreate(
                ['name' => $ed['name']],
                ['uuid' => (string) Str::uuid(), 'description' => $ed['description'], 'status' => 'aktif']
            );
        }

        // 3. School Classes
        $classesData = [
            ['name' => 'X PPLG 1', 'major' => 'PPLG', 'grade_level' => 10],
            ['name' => 'X DKV 1', 'major' => 'DKV', 'grade_level' => 10],
            ['name' => 'X TKJ 1', 'major' => 'TKJ', 'grade_level' => 10],
            ['name' => 'XI PPLG 1', 'major' => 'PPLG', 'grade_level' => 11],
            ['name' => 'XI AKL 1', 'major' => 'AKL', 'grade_level' => 11],
            ['name' => 'XII PPLG 1', 'major' => 'PPLG', 'grade_level' => 12],
            ['name' => 'XII MIPA 1', 'major' => 'MIPA', 'grade_level' => 12],
        ];

        $classes = [];
        foreach ($classesData as $cd) {
            $classes[$cd['name']] = SchoolClass::firstOrCreate(
                ['academic_year_id' => $academicYear->id, 'name' => $cd['name']],
                ['major' => $cd['major'], 'grade_level' => $cd['grade_level']]
            );
        }

        // 4. Indonesian Student Names Generator
        $firstNames = ['Ahmad', 'Dimas', 'Muhammad', 'Rizky', 'Fajar', 'Dewa', 'Bagus', 'Kevin', 'Aditya', 'Bayu', 'Gilang', 'Ilham', 'Nabila', 'Siti', 'Anisa', 'Putri', 'Tiara', 'Zahra', 'Alya', 'Salma', 'Dinda', 'Indah', 'Dewi', 'Rina'];
        $lastNames = ['Pratama', 'Saputra', 'Ramadhan', 'Hidayat', 'Kurniawan', 'Santoso', 'Wijaya', 'Nugroho', 'Kusuma', 'Siregar', 'Rahmawati', 'Lestari', 'Wulandari', 'Utami', 'Puspitasari', 'Nurhaliza', 'Anggraini', 'Maulana'];

        $students = [];
        $nisnBase = 5001000;
        $classList = array_values($classes);

        for ($i = 0; $i < 48; $i++) {
            $fn = $firstNames[$i % count($firstNames)];
            $ln = $lastNames[($i * 3) % count($lastNames)];
            $name = "{$fn} {$ln}";
            $nisn = (string) ($nisnBase + $i);
            $class = $classList[$i % count($classList)];

            $student = User::firstOrCreate(
                ['nisn' => $nisn],
                [
                    'uuid' => (string) Str::uuid(),
                    'name' => $name,
                    'email' => strtolower($fn).'.'.strtolower($ln).$i.'@sinergi.test',
                    'password' => $password,
                    'status' => 'aktif',
                    'must_change_password' => false,
                ]
            );

            $student->roles()->syncWithoutDetaching([
                $siswaRole->id => ['academic_year_id' => $academicYear->id],
            ]);

            StudentProfile::firstOrCreate(
                ['user_id' => $student->id],
                ['entry_year' => 2026 - ($class->grade_level - 10)]
            );

            StudentEnrollment::firstOrCreate(
                ['user_id' => $student->id, 'academic_year_id' => $academicYear->id],
                ['class_id' => $class->id]
            );

            $students[] = $student;
        }

        // 5. Appoint Pengurus for Each Eskul (Ketua & Anggota)
        $eskulList = array_values($eskuls);
        foreach ($eskulList as $idx => $eskul) {
            $leader = $students[$idx * 2];
            $leader->roles()->syncWithoutDetaching([
                $pengurusRole->id => [
                    'academic_year_id' => $academicYear->id,
                    'extracurricular_id' => $eskul->id,
                ],
            ]);

            ExtracurricularMember::firstOrCreate(
                ['extracurricular_id' => $eskul->id, 'user_id' => $leader->id, 'academic_year_id' => $academicYear->id],
                ['position' => 'ketua', 'joined_at' => '2026-07-15']
            );

            // Enroll 12-16 students per eskul
            for ($k = 0; $k < 14; $k++) {
                $memberIndex = ($idx * 7 + $k) % count($students);
                $member = $students[$memberIndex];

                ExtracurricularMember::firstOrCreate(
                    ['extracurricular_id' => $eskul->id, 'user_id' => $member->id, 'academic_year_id' => $academicYear->id],
                    ['position' => 'anggota', 'joined_at' => '2026-07-20']
                );
            }
        }

        // 6. Historical Attendance Sessions (Past 6 Weeks)
        $adminUser = User::where('email', 'admin@sinergi.test')->first() ?? $students[0];

        foreach ($eskuls as $eskul) {
            $members = ExtracurricularMember::where('extracurricular_id', $eskul->id)
                ->where('academic_year_id', $academicYear->id)
                ->get();

            // Create 4 past closed sessions
            for ($w = 4; $w >= 1; $w--) {
                $sessionDate = Carbon::now()->subWeeks($w)->startOfWeek()->addDays(4); // Every Friday

                $session = ActivitySession::firstOrCreate(
                    [
                        'extracurricular_id' => $eskul->id,
                        'academic_year_id' => $academicYear->id,
                        'session_date' => $sessionDate->toDateString(),
                    ],
                    [
                        'uuid' => (string) Str::uuid(),
                        'title' => "Latihan Rutin Minggu ke-{$w} ({$eskul->name})",
                        'start_time' => '15:30',
                        'end_time' => '17:30',
                        'status' => 'ditutup',
                        'opened_at' => $sessionDate->copy()->setTime(15, 30),
                        'closed_at' => $sessionDate->copy()->setTime(17, 30),
                        'created_by' => $adminUser->id,
                    ]
                );

                // Populate attendances with realistic variations
                foreach ($members as $mIdx => $member) {
                    $rand = ($mIdx + $w) % 10;
                    $status = 'hadir';
                    $method = 'qr';
                    $note = null;

                    if ($rand === 7) {
                        $status = 'izin';
                        $method = 'manual';
                        $note = 'Izin ada keperluan keluarga';
                    } elseif ($rand === 8) {
                        $status = 'sakit';
                        $method = 'manual';
                        $note = 'Surat dokter terlampir';
                    } elseif ($rand === 9) {
                        $status = 'alpa';
                        $method = 'manual';
                        $note = 'Tidak hadir tanpa keterangan';
                    }

                    Attendance::firstOrCreate(
                        [
                            'activity_session_id' => $session->id,
                            'user_id' => $member->user_id,
                        ],
                        [
                            'status' => $status,
                            'method' => $method,
                            'recorded_by' => $adminUser->id,
                            'note' => $note,
                            'recorded_at' => $sessionDate->copy()->setTime(15, 45),
                        ]
                    );
                }
            }

            // Create 1 OPEN session for today (Ready for live scanner demo!)
            ActivitySession::firstOrCreate(
                [
                    'extracurricular_id' => $eskul->id,
                    'academic_year_id' => $academicYear->id,
                    'session_date' => Carbon::now()->toDateString(),
                ],
                [
                    'uuid' => (string) Str::uuid(),
                    'title' => "Sesi Latihan Aktif Hari Ini ({$eskul->name})",
                    'start_time' => '15:00',
                    'end_time' => '17:30',
                    'status' => 'dibuka',
                    'opened_at' => Carbon::now()->subMinutes(15),
                    'created_by' => $adminUser->id,
                ]
            );
        }

        // 7. Rich Cash Transactions
        $bendahara = User::where('email', 'bendahara@sinergi.test')->first() ?? $adminUser;

        $catSaldo = CashCategory::firstOrCreate(['name' => 'Saldo Awal', 'type' => 'masuk'], ['is_active' => true]);
        $catIuran = CashCategory::firstOrCreate(['name' => 'Iuran Anggota', 'type' => 'masuk'], ['is_active' => true]);
        $catBOS = CashCategory::firstOrCreate(['name' => 'Dana Bantuan Sekolah', 'type' => 'masuk'], ['is_active' => true]);
        $catKonsumsi = CashCategory::firstOrCreate(['name' => 'Konsumsi Rapat & Kegiatan', 'type' => 'keluar'], ['is_active' => true]);
        $catLogistik = CashCategory::firstOrCreate(['name' => 'Perlengkapan & Logistik', 'type' => 'keluar'], ['is_active' => true]);
        $catTransport = CashCategory::firstOrCreate(['name' => 'Transportasi', 'type' => 'keluar'], ['is_active' => true]);

        $cashData = [
            ['type' => 'masuk', 'cat' => $catSaldo, 'amount' => 5000000, 'desc' => 'Saldo kas awal tahun ajaran 2026/2027', 'days_ago' => 60],
            ['type' => 'masuk', 'cat' => $catBOS, 'amount' => 3500000, 'desc' => 'Pencairan subsidi pembinaan ekstrakurikuler tahap 1', 'days_ago' => 45],
            ['type' => 'keluar', 'cat' => $catLogistik, 'amount' => 1250000, 'desc' => 'Pembelian tenda regu dan perlengkapan P3K Pramuka', 'days_ago' => 40],
            ['type' => 'masuk', 'cat' => $catIuran, 'amount' => 640000, 'desc' => 'Iuran kas bulanan anggota Futsal & Basket (Agustus)', 'days_ago' => 35],
            ['type' => 'keluar', 'cat' => $catKonsumsi, 'amount' => 350000, 'desc' => 'Konsumsi rapat koordinasi akbar seluruh ketua eskul', 'days_ago' => 30],
            ['type' => 'keluar', 'cat' => $catTransport, 'amount' => 450000, 'desc' => 'Sewa transportasi bus kegiatan latihan gabungan PMR', 'days_ago' => 20],
            ['type' => 'masuk', 'cat' => $catIuran, 'amount' => 780000, 'desc' => 'Iuran kas bulanan anggota seluruh eskul (September)', 'days_ago' => 10],
            ['type' => 'keluar', 'cat' => $catLogistik, 'amount' => 200000, 'desc' => 'Pembelian bola futsal dan peluit wasit baru', 'days_ago' => 5],
        ];

        foreach ($cashData as $cd) {
            CashTransaction::firstOrCreate(
                [
                    'academic_year_id' => $academicYear->id,
                    'description' => $cd['desc'],
                ],
                [
                    'uuid' => (string) Str::uuid(),
                    'cash_category_id' => $cd['cat']->id,
                    'type' => $cd['type'],
                    'amount' => $cd['amount'],
                    'transaction_date' => Carbon::now()->subDays($cd['days_ago'])->toDateString(),
                    'proof_path' => 'receipts/sample_receipt.png',
                    'proof_mime' => 'image/png',
                    'proof_size' => 124500,
                    'status' => 'valid',
                    'created_by' => $bendahara->id,
                ]
            );
        }

        // 1 Voided Transaction for Auditing Demo
        CashTransaction::firstOrCreate(
            [
                'academic_year_id' => $academicYear->id,
                'description' => 'Salah input nominal kuitansi konsumsi rapat',
            ],
            [
                'uuid' => (string) Str::uuid(),
                'cash_category_id' => $catKonsumsi->id,
                'type' => 'keluar',
                'amount' => 850000,
                'transaction_date' => Carbon::now()->subDays(15)->toDateString(),
                'proof_path' => 'receipts/sample_receipt.png',
                'proof_mime' => 'image/png',
                'proof_size' => 124500,
                'status' => 'void',
                'void_reason' => 'Salah ketik nominal kuitansi ganda oleh petugas kasir',
                'voided_by' => $bendahara->id,
                'voided_at' => Carbon::now()->subDays(14),
                'created_by' => $bendahara->id,
            ]
        );
    }
}
