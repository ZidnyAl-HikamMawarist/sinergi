<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtracurricularAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $year;

    protected Extracurricular $eskulA;

    protected Extracurricular $eskulB;

    protected User $pengurusA;

    protected User $pengurusB;

    protected User $student;

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

        // Pengurus A strictly for Eskul A
        $this->pengurusA = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->pengurusA->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->year->id,
            'extracurricular_id' => $this->eskulA->id,
        ]);

        // Pengurus B strictly for Eskul B
        $this->pengurusB = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->pengurusB->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->year->id,
            'extracurricular_id' => $this->eskulB->id,
        ]);

        // Student member of Eskul B
        $this->student = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->student->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);

        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulB->id,
            'user_id' => $this->student->id,
            'academic_year_id' => $this->year->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);
    }

    public function test_pengurus_a_cannot_create_session_for_eskul_b(): void
    {
        $response = $this->actingAs($this->pengurusA)->post(route('eskul.sessions.store'), [
            'extracurricular_id' => $this->eskulB->id,
            'title' => 'Latihan Ilegal Eskul B',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('activity_sessions', [
            'title' => 'Latihan Ilegal Eskul B',
        ]);
    }

    public function test_pengurus_a_can_create_session_for_eskul_a(): void
    {
        $response = $this->actingAs($this->pengurusA)->post(route('eskul.sessions.store'), [
            'extracurricular_id' => $this->eskulA->id,
            'title' => 'Latihan Legal Eskul A',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('activity_sessions', [
            'title' => 'Latihan Legal Eskul A',
            'extracurricular_id' => $this->eskulA->id,
        ]);
    }

    public function test_pengurus_a_cannot_close_session_of_eskul_b(): void
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

        $response = $this->actingAs($this->pengurusA)->post(route('eskul.sessions.close', $sessionB));
        $response->assertForbidden();

        $sessionB->refresh();
        $this->assertEquals('dibuka', $sessionB->status);
    }

    public function test_pengurus_a_cannot_submit_manual_attendance_for_eskul_b(): void
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

        $response = $this->actingAs($this->pengurusA)->post(route('eskul.attendance.manual'), [
            'session_uuid' => $sessionB->uuid,
            'user_id' => $this->student->id,
            'status' => 'hadir',
            'note' => 'Presensi oleh pengurus yang tidak berwenang',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('attendances', [
            'activity_session_id' => $sessionB->id,
            'user_id' => $this->student->id,
        ]);
    }

    public function test_pengurus_a_cannot_export_csv_recap_for_eskul_b(): void
    {
        $response = $this->actingAs($this->pengurusA)->get(route('eskul.rekap.export', ['eskul_id' => $this->eskulB->id]));
        $response->assertForbidden();
    }

    public function test_pengurus_a_cannot_add_member_to_eskul_b(): void
    {
        $newStudent = User::factory()->create(['status' => 'aktif']);
        $newStudent->roles()->attach(Role::where('name', 'siswa')->first()->id, ['academic_year_id' => $this->year->id]);

        $response = $this->actingAs($this->pengurusA)->post(route('eskul.members.store'), [
            'extracurricular_id' => $this->eskulB->id,
            'user_id' => $newStudent->id,
            'position' => 'anggota',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('extracurricular_members', [
            'extracurricular_id' => $this->eskulB->id,
            'user_id' => $newStudent->id,
        ]);
    }

    public function test_pengurus_a_cannot_remove_member_from_eskul_b(): void
    {
        $memberB = ExtracurricularMember::where('extracurricular_id', $this->eskulB->id)
            ->where('user_id', $this->student->id)
            ->first();

        $response = $this->actingAs($this->pengurusA)->delete(route('eskul.members.destroy', $memberB));
        $response->assertForbidden();

        $memberB->refresh();
        $this->assertNull($memberB->left_at);
    }

    public function test_pengurus_a_can_add_and_remove_member_in_own_eskul(): void
    {
        $newStudent = User::factory()->create(['status' => 'aktif']);
        $newStudent->roles()->attach(Role::where('name', 'siswa')->first()->id, ['academic_year_id' => $this->year->id]);

        $response = $this->actingAs($this->pengurusA)->post(route('eskul.members.store'), [
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $newStudent->id,
            'position' => 'anggota',
        ]);

        $response->assertRedirect();
        $member = ExtracurricularMember::where('extracurricular_id', $this->eskulA->id)
            ->where('user_id', $newStudent->id)
            ->first();
        $this->assertNotNull($member);

        // Pengurus A deactivates member
        $deleteResponse = $this->actingAs($this->pengurusA)->delete(route('eskul.members.destroy', $member));
        $deleteResponse->assertRedirect();

        $member->refresh();
        $this->assertNotNull($member->left_at);
    }
}

