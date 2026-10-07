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

class AuthorizationMatrixTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $year;

    protected Extracurricular $eskulA;

    protected Extracurricular $eskulB;

    protected User $pengurusA;

    protected User $studentA;

    protected User $studentB;

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

        // Pengurus A specifically assigned to Eskul A
        $this->pengurusA = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->pengurusA->roles()->attach($pengurusRole->id, [
            'academic_year_id' => $this->year->id,
            'extracurricular_id' => $this->eskulA->id,
        ]);

        // Student A member of Eskul A
        $this->studentA = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->studentA->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $this->studentA->id,
            'academic_year_id' => $this->year->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        // Student B member of Eskul B
        $this->studentB = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->studentB->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulB->id,
            'user_id' => $this->studentB->id,
            'academic_year_id' => $this->year->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);
    }

    public function test_pengurus_a_resource_access_on_own_eskul_a(): void
    {
        // 1. Create session A -> Success
        $respCreate = $this->actingAs($this->pengurusA)->post(route('eskul.sessions.store'), [
            'extracurricular_id' => $this->eskulA->id,
            'title' => 'Latihan Rutin Pramuka',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);
        $respCreate->assertRedirect();
        $sessionA = ActivitySession::where('extracurricular_id', $this->eskulA->id)->first();
        $this->assertNotNull($sessionA);

        // 2. Manual attendance on Session A -> Success
        $respManual = $this->actingAs($this->pengurusA)->post(route('eskul.attendance.manual'), [
            'session_uuid' => $sessionA->uuid,
            'user_id' => $this->studentA->id,
            'status' => 'hadir',
            'note' => 'Hadir tepat waktu',
        ]);
        $respManual->assertRedirect();
        $this->assertDatabaseHas('attendances', [
            'activity_session_id' => $sessionA->id,
            'user_id' => $this->studentA->id,
            'status' => 'hadir',
        ]);

        // 3. Close Session A -> Success
        $respClose = $this->actingAs($this->pengurusA)->post(route('eskul.sessions.close', $sessionA));
        $respClose->assertRedirect();
        $sessionA->refresh();
        $this->assertEquals('ditutup', $sessionA->status);

        // 4. Recap Eskul A -> Success
        $respRecap = $this->actingAs($this->pengurusA)->get(route('eskul.rekap', ['eskul_id' => $this->eskulA->id]));
        $respRecap->assertOk();

        // 5. Export Eskul A -> Success
        $respExport = $this->actingAs($this->pengurusA)->get(route('eskul.rekap.export', ['eskul_id' => $this->eskulA->id]));
        $respExport->assertOk();
    }

    public function test_pengurus_a_resource_access_on_other_eskul_b_is_strictly_forbidden(): void
    {
        $sessionB = ActivitySession::create([
            'extracurricular_id' => $this->eskulB->id,
            'academic_year_id' => $this->year->id,
            'title' => 'Latihan Sesi B',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'opened_at' => now(),
            'created_by' => $this->studentB->id,
        ]);

        // 1. Create session B -> 403
        $respCreate = $this->actingAs($this->pengurusA)->post(route('eskul.sessions.store'), [
            'extracurricular_id' => $this->eskulB->id,
            'title' => 'Percobaan Ilegal Sesi B',
            'session_date' => '2026-10-07',
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);
        $respCreate->assertForbidden();

        // 2. Close session B -> 403
        $respClose = $this->actingAs($this->pengurusA)->post(route('eskul.sessions.close', $sessionB));
        $respClose->assertForbidden();

        // 3. Manual attendance for Session B -> 403
        $respManual = $this->actingAs($this->pengurusA)->post(route('eskul.attendance.manual'), [
            'session_uuid' => $sessionB->uuid,
            'user_id' => $this->studentB->id,
            'status' => 'hadir',
            'note' => 'Ilegal attendance',
        ]);
        $respManual->assertForbidden();

        // 4. Export CSV Eskul B -> 403
        $respExport = $this->actingAs($this->pengurusA)->get(route('eskul.rekap.export', ['eskul_id' => $this->eskulB->id]));
        $respExport->assertForbidden();
    }
}
