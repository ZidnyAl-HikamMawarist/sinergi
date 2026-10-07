<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceRecapTest extends TestCase
{
    use RefreshDatabase;

    protected User $pengurus;

    protected User $student;

    protected Extracurricular $eskul;

    protected AcademicYear $year;

    protected function setUp(): void
    {
        parent::setUp();

        $this->year = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'is_active' => true,
        ]);

        $this->eskul = Extracurricular::create([
            'name' => 'Paskibra',
            'status' => 'aktif',
        ]);

        $pengurusRole = Role::create(['name' => 'pengurus_eskul', 'label' => 'Pengurus Eskul']);
        $studentRole = Role::create(['name' => 'siswa', 'label' => 'Siswa']);

        $this->pengurus = User::factory()->create(['must_change_password' => false]);
        $this->pengurus->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->year->id,
            'extracurricular_id' => $this->eskul->id,
        ]);

        $this->student = User::factory()->create([
            'name' => 'Rian Hidayat',
            'nisn' => '0098765432',
            'must_change_password' => false,
        ]);
        $this->student->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);

        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskul->id,
            'user_id' => $this->student->id,
            'academic_year_id' => $this->year->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);
    }

    public function test_pengurus_can_view_recap(): void
    {
        $session = ActivitySession::create([
            'extracurricular_id' => $this->eskul->id,
            'academic_year_id' => $this->year->id,
            'title' => 'Latihan Baris Berbaris 1',
            'session_date' => '2026-10-06',
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'ditutup',
            'opened_at' => now(),
            'closed_at' => now(),
            'created_by' => $this->pengurus->id,
        ]);

        Attendance::create([
            'activity_session_id' => $session->id,
            'user_id' => $this->student->id,
            'status' => 'hadir',
            'method' => 'qr',
            'recorded_by' => $this->pengurus->id,
            'recorded_at' => now(),
        ]);

        $response = $this->actingAs($this->pengurus)->get(route('eskul.rekap', ['eskul_id' => $this->eskul->id]));
        $response->assertOk();
    }

    public function test_pengurus_can_export_csv(): void
    {
        $response = $this->actingAs($this->pengurus)->get(route('eskul.rekap.export', ['eskul_id' => $this->eskul->id]));
        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
