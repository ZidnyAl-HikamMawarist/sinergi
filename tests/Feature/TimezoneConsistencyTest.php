<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\User;
use App\Services\QrTokenService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimezoneConsistencyTest extends TestCase
{
    use RefreshDatabase;

    protected QrTokenService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(QrTokenService::class);
    }

    public function test_application_timezone_is_configured_to_asia_jakarta(): void
    {
        $this->assertEquals('Asia/Jakarta', config('app.timezone'));
    }

    public function test_qr_token_generated_before_midnight_validates_successfully_after_midnight(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->firstOrFail();

        // 1. Simulate 10 seconds before midnight WIB (23:59:50)
        Carbon::setTestNow(Carbon::parse('2026-10-07 23:59:50', 'Asia/Jakarta'));

        $tokenData = $this->service->generateToken($student);
        $this->assertNotEmpty($tokenData['token']);

        // 2. Travel forward by 30 seconds to past midnight (00:00:20 of next day)
        Carbon::setTestNow(Carbon::parse('2026-10-08 00:00:20', 'Asia/Jakarta'));

        // 30 seconds is well within the 60s TTL + 15s tolerance window
        $verify = $this->service->verifyToken($tokenData['token']);
        $this->assertTrue($verify['success'], 'Token should remain valid across midnight within TTL.');
        $this->assertEquals($student->id, $verify['user']->id);

        Carbon::setTestNow(); // reset
    }

    public function test_qr_token_expires_correctly_across_midnight_boundary(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->firstOrFail();

        // 1. Generate token at 23:58:30 WIB
        Carbon::setTestNow(Carbon::parse('2026-10-07 23:58:30', 'Asia/Jakarta'));
        $tokenData = $this->service->generateToken($student);

        // 2. Travel forward 120 seconds into next day (00:00:30 WIB)
        // 120s exceeds 60s TTL + 15s tolerance (75s max)
        Carbon::setTestNow(Carbon::parse('2026-10-08 00:00:30', 'Asia/Jakarta'));

        $verify = $this->service->verifyToken($tokenData['token']);
        $this->assertFalse($verify['success'], 'Token must be expired after 120 seconds.');
        $this->assertStringContainsString('QR kedaluwarsa', $verify['error']);

        Carbon::setTestNow(); // reset
    }

    public function test_attendance_feedback_contains_wib_formatted_time(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->firstOrFail();
        $pengurus = User::where('email', 'pengurus@sinergi.test')->firstOrFail();
        $eskul = Extracurricular::firstOrFail();
        $academicYear = AcademicYear::active();

        $session = ActivitySession::create([
            'extracurricular_id' => $eskul->id,
            'academic_year_id' => $academicYear->id,
            'title' => 'Latihan Rutin Timezone Test',
            'session_date' => now()->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'created_by' => $pengurus->id,
        ]);

        // Fix membership
        ExtracurricularMember::firstOrCreate([
            'extracurricular_id' => $eskul->id,
            'user_id' => $student->id,
            'academic_year_id' => $academicYear->id,
        ], [
            'joined_at' => now(),
        ]);

        // Simulate recording attendance at fixed time 15:45:00 WIB
        Carbon::setTestNow(Carbon::parse('2026-10-07 15:45:00', 'Asia/Jakarta'));
        Attendance::create([
            'activity_session_id' => $session->id,
            'user_id' => $student->id,
            'status' => 'hadir',
            'method' => 'qr',
            'recorded_by' => $pengurus->id,
            'recorded_at' => now(),
        ]);

        // Attempting duplicate scan
        $tokenData = $this->service->generateToken($student);

        $response = $this->actingAs($pengurus)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $session->uuid,
            'token' => $tokenData['token'],
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('15:45:00 WIB', $response->json('message'));

        Carbon::setTestNow(); // reset
    }
}
