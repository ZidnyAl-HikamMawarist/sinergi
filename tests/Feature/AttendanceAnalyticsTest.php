<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_cannot_access_analytics(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->firstOrFail();

        $response = $this->actingAs($student)->get('/eskul/analytics');
        $response->assertStatus(403);
    }

    public function test_pengurus_can_view_analytics_for_assigned_extracurricular(): void
    {
        $this->seed();
        $pengurus = User::where('email', 'pengurus@sinergi.test')->firstOrFail();
        $student = User::where('email', 'siswa@sinergi.test')->firstOrFail();
        $eskul = Extracurricular::firstOrFail();
        $activeYear = AcademicYear::active();

        // Ensure membership
        ExtracurricularMember::firstOrCreate([
            'extracurricular_id' => $eskul->id,
            'user_id' => $student->id,
            'academic_year_id' => $activeYear->id,
        ], ['joined_at' => now()]);

        // Create an activity session with attendance
        $session = ActivitySession::create([
            'extracurricular_id' => $eskul->id,
            'academic_year_id' => $activeYear->id,
            'title' => 'Latihan Analitik',
            'session_date' => now()->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'ditutup',
            'closed_at' => now(),
            'created_by' => $pengurus->id,
        ]);

        Attendance::create([
            'activity_session_id' => $session->id,
            'user_id' => $student->id,
            'status' => 'hadir',
            'method' => 'qr',
            'recorded_by' => $pengurus->id,
            'recorded_at' => now(),
        ]);

        $response = $this->actingAs($pengurus)->get('/eskul/analytics?eskul_id='.$eskul->id);
        $response->assertStatus(200);

        $analytics = $response->viewData('page')['props']['analytics'];
        $this->assertGreaterThanOrEqual(1, $analytics['total_active_members']);
        $this->assertGreaterThanOrEqual(1, $analytics['total_sessions']);
        $this->assertArrayHasKey('participation_tier', $analytics);
        $this->assertArrayHasKey('trend', $analytics);
    }
}
