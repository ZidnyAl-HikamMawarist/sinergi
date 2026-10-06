<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\QrTokenUse;
use App\Models\Role;
use App\Models\User;
use App\Services\QrTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QrCollisionAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $year;
    protected Extracurricular $eskulA;
    protected Extracurricular $eskulB;
    protected User $pengurusA;
    protected User $pengurusB;
    protected User $student;
    protected QrTokenService $tokenService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->year = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'is_active' => true,
        ]);

        $this->eskulA = Extracurricular::create(['name' => 'Paskibra', 'status' => 'aktif']);
        $this->eskulB = Extracurricular::create(['name' => 'PMR', 'status' => 'aktif']);

        $pengurusRole = Role::create(['name' => 'pengurus_eskul', 'label' => 'Pengurus Eskul']);
        $studentRole = Role::create(['name' => 'siswa', 'label' => 'Siswa']);

        $this->pengurusA = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->pengurusA->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->year->id,
            'extracurricular_id' => $this->eskulA->id,
        ]);

        $this->pengurusB = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->pengurusB->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->year->id,
            'extracurricular_id' => $this->eskulB->id,
        ]);

        $this->student = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->student->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);

        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $this->student->id,
            'academic_year_id' => $this->year->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        $this->tokenService = app(QrTokenService::class);
    }

    public function test_pengurus_a_cannot_scan_for_session_of_eskul_b(): void
    {
        $sessionB = ActivitySession::create([
            'extracurricular_id' => $this->eskulB->id,
            'academic_year_id' => $this->year->id,
            'title' => 'Sesi Eskul B',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'opened_at' => now(),
            'created_by' => $this->pengurusB->id,
        ]);

        $tokenData = $this->tokenService->generateToken($this->student);

        $response = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionB->uuid,
            'token' => $tokenData['token'],
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Anda tidak memiliki hak akses memindai untuk eskul ini.',
        ]);
    }

    public function test_race_condition_collision_returns_422_instead_of_500(): void
    {
        $sessionA = ActivitySession::create([
            'extracurricular_id' => $this->eskulA->id,
            'academic_year_id' => $this->year->id,
            'title' => 'Sesi Eskul A',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'opened_at' => now(),
            'created_by' => $this->pengurusA->id,
        ]);

        $tokenData = $this->tokenService->generateToken($this->student);

        // Pre-insert an attendance or token hash into DB as if a parallel thread just committed it
        QrTokenUse::create([
            'token_hash' => hash('sha256', $tokenData['token']),
            'user_id' => $this->student->id,
            'activity_session_id' => $sessionA->id,
            'used_at' => now(),
        ]);

        // Attempt scan with the same token - verifyToken will see it in qr_token_uses or DB unique constraint
        $response = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionA->uuid,
            'token' => $tokenData['token'],
        ]);

        // Must return clean 422 JSON and never 500 error
        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
    }
}
