<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentDirectoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
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

        $this->admin = User::factory()->create(['must_change_password' => false]);
        $this->admin->roles()->attach($adminRole->id, ['academic_year_id' => $this->year->id]);

        $classA = SchoolClass::create([
            'academic_year_id' => $this->year->id,
            'name' => 'X-RPL-1',
            'major' => 'RPL',
            'grade_level' => 10,
        ]);

        $student = User::factory()->create([
            'name' => 'Siti Aminah',
            'nisn' => '0023456789',
            'must_change_password' => false,
        ]);
        $student->roles()->attach($studentRole->id, ['academic_year_id' => $this->year->id]);

        StudentEnrollment::create([
            'user_id' => $student->id,
            'class_id' => $classA->id,
            'academic_year_id' => $this->year->id,
        ]);
    }

    public function test_admin_can_view_student_directory(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.students.index'));
        $response->assertOk();
    }

    public function test_admin_can_filter_students_by_search(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.students.index', ['search' => 'Siti']));
        $response->assertOk();
    }
}
