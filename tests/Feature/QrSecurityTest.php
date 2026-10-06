<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\Role;
use App\Models\User;
use App\Services\QrTokenService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QrSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $year;
    protected Extracurricular $eskulA;
    protected Extracurricular $eskulB;
    protected User $pengurusA;
    protected User $pengurusB;
    protected User $studentA;
    protected User $studentNonMember;
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

        $this->eskulA = Extracurricular::create(['name' => 'Pramuka', 'status' => 'aktif']);
        $this->eskulB = Extracurricular::create(['name' => 'Paskibra', 'status' => 'aktif']);

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

        $this->studentA = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->studentA->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);

        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $this->studentA->id,
            'academic_year_id' => $this->year->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        $this->studentNonMember = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->studentNonMember->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);

        $this->tokenService = app(QrTokenService::class);
    }

    public function test_full_qr_security_matrix(): void
    {
        $sessionA = ActivitySession::create([
            'extracurricular_id' => $this->eskulA->id,
            'academic_year_id' => $this->year->id,
            'title' => 'Latihan Rutin Pramuka',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'opened_at' => now(),
            'created_by' => $this->pengurusA->id,
        ]);

        // 1. Valid QR -> Success (200 JSON)
        $tokenData = $this->tokenService->generateToken($this->studentA);
        $respValid = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionA->uuid,
            'token' => $tokenData['token'],
        ]);
        $respValid->assertOk();
        $respValid->assertJson(['success' => true]);
        $this->assertDatabaseHas('attendances', [
            'activity_session_id' => $sessionA->id,
            'user_id' => $this->studentA->id,
            'method' => 'qr',
        ]);

        // 2. Replay same QR token -> 422 Rejection
        $respReplay = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionA->uuid,
            'token' => $tokenData['token'],
        ]);
        $respReplay->assertStatus(422);
        $respReplay->assertJson(['success' => false]);

        // 3. Tampered QR token -> 422 Rejection
        $student2 = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $token2 = $this->tokenService->generateToken($student2);
        $decoded = json_decode(base64_decode($token2['token']), true);
        $decoded['p']['u'] = $this->studentA->uuid; // Tamper payload
        $tamperedToken = base64_encode(json_encode($decoded));

        $respTampered = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionA->uuid,
            'token' => $tamperedToken,
        ]);
        $respTampered->assertStatus(422);

        // 4. Expired QR token -> 422 Rejection
        Carbon::setTestNow(now()->addMinutes(10));
        $respExpired = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionA->uuid,
            'token' => $token2['token'],
        ]);
        $respExpired->assertStatus(422);
        Carbon::setTestNow(); // Reset time

        // 5. Non-member scan -> 422 Rejection
        $tokenNonMember = $this->tokenService->generateToken($this->studentNonMember);
        $respNonMember = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionA->uuid,
            'token' => $tokenNonMember['token'],
        ]);
        $respNonMember->assertStatus(422);

        // 6. Cross-eskul scanner -> 403 Forbidden
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
        $respCross = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionB->uuid,
            'token' => $tokenNonMember['token'],
        ]);
        $respCross->assertForbidden();

        // 7. Closed session scan -> 422 Rejection
        $sessionA->update(['status' => 'ditutup', 'closed_at' => now()]);
        $student3 = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $student3->id,
            'academic_year_id' => $this->year->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);
        $token3 = $this->tokenService->generateToken($student3);
        $respClosed = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $sessionA->uuid,
            'token' => $token3['token'],
        ]);
        $respClosed->assertStatus(422);
    }
}
