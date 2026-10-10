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

class AttendanceAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $activeYear;

    protected AcademicYear $pastYear;

    protected Extracurricular $eskulA;

    protected Extracurricular $eskulB;

    protected User $pengurusA;

    protected User $pengurusB;

    protected User $admin;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->activeYear = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'is_active' => true,
        ]);

        $this->pastYear = AcademicYear::create([
            'name' => '2025/2026',
            'start_date' => '2025-07-01',
            'end_date' => '2026-06-30',
            'is_active' => false,
        ]);

        $this->eskulA = Extracurricular::create(['name' => 'Paskibra', 'status' => 'aktif']);
        $this->eskulB = Extracurricular::create(['name' => 'PMR', 'status' => 'aktif']);

        $pengurusRole = Role::create(['name' => 'pengurus_eskul', 'label' => 'Pengurus Eskul']);
        $adminRole = Role::create(['name' => 'admin', 'label' => 'Admin OSIS']);
        $studentRole = Role::create(['name' => 'siswa', 'label' => 'Siswa']);

        // Pengurus A for Eskul A
        $this->pengurusA = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->pengurusA->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->activeYear->id,
            'extracurricular_id' => $this->eskulA->id,
        ]);

        // Pengurus B for Eskul B
        $this->pengurusB = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->pengurusB->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->activeYear->id,
            'extracurricular_id' => $this->eskulB->id,
        ]);

        // Admin OSIS
        $this->admin = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->admin->roles()->attach($adminRole->id, [
            'academic_year_id' => $this->activeYear->id,
        ]);

        // Student
        $this->student = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->student->roles()->attach($studentRole->id, [
            'academic_year_id' => $this->activeYear->id,
        ]);
    }

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get('/eskul/analytics');
        $response->assertRedirect('/login');
    }

    public function test_student_cannot_access_analytics(): void
    {
        $response = $this->actingAs($this->student)->get('/eskul/analytics');
        $response->assertStatus(403);
    }

    public function test_pengurus_cannot_access_unassigned_extracurricular_analytics(): void
    {
        // Pengurus A attempts to inspect Eskul B
        $response = $this->actingAs($this->pengurusA)->get('/eskul/analytics?eskul_id='.$this->eskulB->id);
        $response->assertStatus(403);
    }

    public function test_pengurus_can_view_analytics_for_assigned_extracurricular(): void
    {
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $this->student->id,
            'academic_year_id' => $this->activeYear->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        $session = ActivitySession::create([
            'extracurricular_id' => $this->eskulA->id,
            'academic_year_id' => $this->activeYear->id,
            'title' => 'Latihan Perdana',
            'session_date' => now()->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'ditutup',
            'created_by' => $this->pengurusA->id,
        ]);

        Attendance::create([
            'activity_session_id' => $session->id,
            'user_id' => $this->student->id,
            'status' => 'hadir',
            'method' => 'qr',
            'recorded_by' => $this->pengurusA->id,
            'recorded_at' => now(),
        ]);

        $response = $this->actingAs($this->pengurusA)->get('/eskul/analytics?eskul_id='.$this->eskulA->id);
        $response->assertStatus(200);

        $response->assertInertia(function ($page) {
            $page->component('Eskul/Analytics')
                ->has('analytics', function ($analytics) {
                    $analytics->where('total_active_members', 1)
                        ->where('total_sessions', 1)
                        ->where('avg_attendance_rate', 100)
                        ->has('participation_tier')
                        ->has('trend', 1)
                        ->has('top_active_members', 1)
                        ->etc();
                });
        });
    }

    public function test_admin_can_view_any_extracurricular_analytics(): void
    {
        $responseA = $this->actingAs($this->admin)->get('/eskul/analytics?eskul_id='.$this->eskulA->id);
        $responseA->assertStatus(200);

        $responseB = $this->actingAs($this->admin)->get('/eskul/analytics?eskul_id='.$this->eskulB->id);
        $responseB->assertStatus(200);
    }

    public function test_handles_empty_extracurricular_with_zero_members_and_sessions_safely(): void
    {
        // No members and no sessions created for Eskul A
        $response = $this->actingAs($this->pengurusA)->get('/eskul/analytics?eskul_id='.$this->eskulA->id);
        $response->assertStatus(200);

        $response->assertInertia(function ($page) {
            $page->component('Eskul/Analytics')
                ->has('analytics', function ($analytics) {
                    $analytics->where('total_active_members', 0)
                        ->where('total_sessions', 0)
                        ->where('avg_attendance_rate', 0)
                        ->where('trend', [])
                        ->where('members_at_risk', [])
                        ->where('top_active_members', [])
                        ->where('participation_tier.high', 0)
                        ->where('participation_tier.moderate', 0)
                        ->where('participation_tier.low', 0);
                });
        });
    }

    public function test_computes_participation_tiers_and_identifies_at_risk_members_accurately(): void
    {
        $studentHigh = User::factory()->create(['name' => 'Siswa Rajin', 'nisn' => '1111111111']);
        $studentMod = User::factory()->create(['name' => 'Siswa Sedang', 'nisn' => '2222222222']);
        $studentLow = User::factory()->create(['name' => 'Siswa Kurang', 'nisn' => '3333333333']);

        foreach ([$studentHigh, $studentMod, $studentLow] as $stu) {
            ExtracurricularMember::create([
                'extracurricular_id' => $this->eskulA->id,
                'user_id' => $stu->id,
                'academic_year_id' => $this->activeYear->id,
                'position' => 'anggota',
                'joined_at' => now(),
            ]);
        }

        // Create 4 sessions
        $sessions = [];
        for ($i = 1; $i <= 4; $i++) {
            $sessions[] = ActivitySession::create([
                'extracurricular_id' => $this->eskulA->id,
                'academic_year_id' => $this->activeYear->id,
                'title' => "Sesi $i",
                'session_date' => now()->subDays(10 - $i)->toDateString(),
                'start_time' => '15:00',
                'end_time' => '17:00',
                'status' => 'ditutup',
                'created_by' => $this->pengurusA->id,
            ]);
        }

        // studentHigh attends 4/4 (100% -> High)
        foreach ($sessions as $s) {
            Attendance::create([
                'activity_session_id' => $s->id,
                'user_id' => $studentHigh->id,
                'status' => 'hadir',
                'method' => 'qr',
                'recorded_by' => $this->pengurusA->id,
                'recorded_at' => now(),
            ]);
        }

        // studentMod attends 3/4 (75% -> Moderate)
        for ($i = 0; $i < 3; $i++) {
            Attendance::create([
                'activity_session_id' => $sessions[$i]->id,
                'user_id' => $studentMod->id,
                'status' => 'hadir',
                'method' => 'qr',
                'recorded_by' => $this->pengurusA->id,
                'recorded_at' => now(),
            ]);
        }

        // studentLow attends 1/4 (25% -> Low)
        Attendance::create([
            'activity_session_id' => $sessions[0]->id,
            'user_id' => $studentLow->id,
            'status' => 'hadir',
            'method' => 'qr',
            'recorded_by' => $this->pengurusA->id,
            'recorded_at' => now(),
        ]);

        $response = $this->actingAs($this->pengurusA)->get('/eskul/analytics?eskul_id='.$this->eskulA->id);
        $response->assertStatus(200);

        $analytics = $response->viewData('page')['props']['analytics'];

        $this->assertEquals(3, $analytics['total_active_members']);
        $this->assertEquals(4, $analytics['total_sessions']);
        $this->assertEquals(1, $analytics['participation_tier']['high']);
        $this->assertEquals(1, $analytics['participation_tier']['moderate']);
        $this->assertEquals(1, $analytics['participation_tier']['low']);

        // Assert member at risk contains studentLow
        $this->assertCount(1, $analytics['members_at_risk']);
        $this->assertEquals('Siswa Kurang', $analytics['members_at_risk'][0]['name']);
        $this->assertEquals(25.0, $analytics['members_at_risk'][0]['attendance_rate']);

        // Assert top member contains studentHigh
        $this->assertCount(1, $analytics['top_active_members']);
        $this->assertEquals('Siswa Rajin', $analytics['top_active_members'][0]['name']);
        $this->assertEquals(100.0, $analytics['top_active_members'][0]['attendance_rate']);
    }

    public function test_excludes_inactive_academic_year_sessions_and_inactive_members(): void
    {
        // Member that already left
        $leftStudent = User::factory()->create(['name' => 'Siswa Keluar']);
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $leftStudent->id,
            'academic_year_id' => $this->activeYear->id,
            'position' => 'anggota',
            'joined_at' => now()->subMonths(3),
            'left_at' => now()->subMonth(),
        ]);

        // Active member
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $this->student->id,
            'academic_year_id' => $this->activeYear->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        // Session in past academic year
        ActivitySession::create([
            'extracurricular_id' => $this->eskulA->id,
            'academic_year_id' => $this->pastYear->id,
            'title' => 'Sesi Tahun Lalu',
            'session_date' => now()->subYear()->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'ditutup',
            'created_by' => $this->pengurusA->id,
        ]);

        $response = $this->actingAs($this->pengurusA)->get('/eskul/analytics?eskul_id='.$this->eskulA->id);
        $response->assertStatus(200);

        $analytics = $response->viewData('page')['props']['analytics'];

        // Only active member is counted, left member is excluded
        $this->assertEquals(1, $analytics['total_active_members']);
        // Only active year session is counted, past year session is excluded
        $this->assertEquals(0, $analytics['total_sessions']);
    }
}
