<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtracurricularManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $student;
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

        $adminRole = Role::create(['name' => 'admin', 'label' => 'Admin OSIS']);
        $studentRole = Role::create(['name' => 'siswa', 'label' => 'Siswa']);

        $this->admin = User::factory()->create([
            'email' => 'admin@sinergi.test',
            'must_change_password' => false,
        ]);
        $this->admin->roles()->attach($adminRole->id, ['academic_year_id' => $this->year->id]);

        $this->student = User::factory()->create([
            'name' => 'Budi Santoso',
            'nisn' => '0012345678',
            'must_change_password' => false,
        ]);
        $this->student->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);
    }

    public function test_admin_can_view_eskul_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.eskul.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_extracurricular(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.eskul.store'), [
            'name' => 'Robotika',
            'description' => 'Klub robotika dan teknologi',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('extracurriculars', [
            'name' => 'Robotika',
            'status' => 'aktif',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'create_extracurricular',
            'entity_type' => 'Extracurricular',
        ]);
    }

    public function test_admin_can_add_and_remove_member(): void
    {
        $eskul = Extracurricular::create([
            'name' => 'PMR',
            'status' => 'aktif',
        ]);

        // Add member
        $response = $this->actingAs($this->admin)->post(route('admin.eskul.members.add', $eskul->uuid), [
            'user_id' => $this->student->id,
            'position' => 'anggota',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('extracurricular_members', [
            'extracurricular_id' => $eskul->id,
            'user_id' => $this->student->id,
            'left_at' => null,
        ]);

        $member = ExtracurricularMember::where('extracurricular_id', $eskul->id)
            ->where('user_id', $this->student->id)
            ->first();

        // Remove member (sets left_at, does not delete row)
        $removeResponse = $this->actingAs($this->admin)->delete(route('admin.eskul.members.remove', [$eskul->uuid, $member->id]));
        $removeResponse->assertRedirect();

        $member->refresh();
        $this->assertNotNull($member->left_at);
    }

    public function test_student_cannot_manage_extracurricular(): void
    {
        $response = $this->actingAs($this->student)->get(route('admin.eskul.index'));
        $response->assertForbidden();
    }
}
