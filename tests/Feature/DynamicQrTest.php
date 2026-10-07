<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Extracurricular;
use App\Models\User;
use App\Services\QrTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DynamicQrTest extends TestCase
{
    use RefreshDatabase;

    protected QrTokenService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(QrTokenService::class);
    }

    public function test_qr_token_generates_and_verifies_correctly(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->first();

        $tokenData = $this->service->generateToken($student);

        $this->assertNotEmpty($tokenData['token']);
        $this->assertEquals(60, $tokenData['ttl']);

        $verify = $this->service->verifyToken($tokenData['token']);
        $this->assertTrue($verify['success']);
        $this->assertEquals($student->id, $verify['user']->id);
    }

    public function test_tampered_qr_token_is_rejected(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->first();

        $tokenData = $this->service->generateToken($student);
        $raw = json_decode(base64_decode($tokenData['token']), true);
        $raw['p']['u'] = '00000000-0000-0000-0000-000000000000'; // Tamper UUID
        $tamperedToken = base64_encode(json_encode($raw));

        $verify = $this->service->verifyToken($tamperedToken);
        $this->assertFalse($verify['success']);
        $this->assertStringContainsString('Tanda tangan', $verify['error']);
    }

    public function test_expired_qr_token_is_rejected(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->first();

        // Expired timestamp: 100 seconds ago
        $payload = [
            'u' => $student->uuid,
            't' => now()->subSeconds(100)->timestamp,
            'exp' => now()->subSeconds(40)->timestamp,
        ];
        $payloadJson = json_encode($payload);
        $signature = hash_hmac('sha256', $payloadJson, config('app.key'));
        $expiredToken = base64_encode(json_encode(['p' => $payload, 's' => $signature]));

        $verify = $this->service->verifyToken($expiredToken);
        $this->assertFalse($verify['success']);
        $this->assertStringContainsString('kedaluwarsa', $verify['error']);
    }

    public function test_scan_records_attendance_and_prevents_replay(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();
        $student = User::where('email', 'siswa@sinergi.test')->first();
        $pramuka = Extracurricular::where('name', 'Pramuka')->first();
        $year = AcademicYear::active();

        // Create an open session
        $session = ActivitySession::create([
            'extracurricular_id' => $pramuka->id,
            'academic_year_id' => $year->id,
            'title' => 'Latihan Rutin Pramuka',
            'session_date' => now()->toDateString(),
            'start_time' => '15:30',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'created_by' => $admin->id,
        ]);

        $tokenData = $this->service->generateToken($student);

        // 1. First scan must succeed
        $response = $this->actingAs($admin)->postJson('/eskul/attendance/scan', [
            'session_uuid' => $session->uuid,
            'token' => $tokenData['token'],
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('attendances', [
            'activity_session_id' => $session->id,
            'user_id' => $student->id,
            'status' => 'hadir',
            'method' => 'qr',
        ]);

        // 2. Replay of same token must be rejected (AC-D2)
        $replayResponse = $this->actingAs($admin)->postJson('/eskul/attendance/scan', [
            'session_uuid' => $session->uuid,
            'token' => $tokenData['token'],
        ]);

        $replayResponse->assertStatus(422);
        $replayResponse->assertJson(['message' => 'QR sudah digunakan.']);
    }

    public function test_non_member_cannot_be_scanned(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();
        $pramuka = Extracurricular::where('name', 'Pramuka')->first();
        $year = AcademicYear::active();

        // Create an outsider student (not a member of Pramuka)
        $outsider = User::create([
            'name' => 'Siswa Luar',
            'nisn' => '7777777777',
            'password' => 'password123',
            'status' => 'aktif',
        ]);

        $session = ActivitySession::create([
            'extracurricular_id' => $pramuka->id,
            'academic_year_id' => $year->id,
            'title' => 'Latihan Rutin Pramuka',
            'session_date' => now()->toDateString(),
            'start_time' => '15:30',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'created_by' => $admin->id,
        ]);

        $tokenData = $this->service->generateToken($outsider);

        $response = $this->actingAs($admin)->postJson('/eskul/attendance/scan', [
            'session_uuid' => $session->uuid,
            'token' => $tokenData['token'],
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('bukan anggota aktif', $response->json('message'));
    }
}
