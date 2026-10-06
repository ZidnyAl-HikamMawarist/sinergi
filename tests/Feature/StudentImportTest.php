<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ImportBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_preview_valid_csv(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        $csvContent = "nisn,nama,kelas,email\n0098765432,Bambang Pamungkas,X PPLG 1,bambang@example.com\n0051234562,Ahmad Fajar Pratama,XII PPLG 1,siswa@sinergi.test\n,Siswa Tanpa NISN,X PPLG 2,\n";
        $file = UploadedFile::fake()->createWithContent('students.csv', $csvContent);

        $response = $this->actingAs($admin)->post('/admin/import/preview', [
            'file' => $file,
        ]);

        $response->assertRedirect();

        $batch = ImportBatch::first();
        $this->assertNotNull($batch);
        $this->assertEquals(1, $batch->new_rows); // Bambang is new
        $this->assertEquals(1, $batch->updated_rows); // Ahmad exists from seeder
        $this->assertEquals(1, $batch->error_rows); // Empty NISN is error
    }

    public function test_admin_can_commit_import_and_download_credentials_once(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();
        Storage::fake('local');

        $csvContent = "nisn,nama,kelas\n0099887766,Citra Lestari,X PPLG 1\n";
        $file = UploadedFile::fake()->createWithContent('new_students.csv', $csvContent);

        $this->actingAs($admin)->post('/admin/import/preview', ['file' => $file]);

        $batch = ImportBatch::first();

        // Commit batch
        $responseCommit = $this->actingAs($admin)->post("/admin/import/{$batch->uuid}/commit");
        $responseCommit->assertRedirect();

        $batch->refresh();
        $this->assertEquals('committed', $batch->status);

        // Verify user was created in database
        $newUser = User::where('nisn', '0099887766')->first();
        $this->assertNotNull($newUser);
        $this->assertEquals('Citra Lestari', $newUser->name);
        $this->assertTrue($newUser->must_change_password);

        // Download credentials first time: should succeed
        $responseDownload1 = $this->actingAs($admin)->get("/admin/import/{$batch->uuid}/credentials");
        $responseDownload1->assertOk();

        // Download credentials second time: must be rejected per AC-B4
        $responseDownload2 = $this->actingAs($admin)->get("/admin/import/{$batch->uuid}/credentials");
        $responseDownload2->assertRedirect();
        $responseDownload2->assertSessionHas('warning');
    }

    public function test_import_intelligently_parses_grade_and_major(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        $csvContent = "nisn,nama,kelas\n0088112233,Budi XII,XII RPL 1\n0088112234,Andi XI,XI-TKJ-2\n";
        $file = UploadedFile::fake()->createWithContent('grades.csv', $csvContent);

        $this->actingAs($admin)->post('/admin/import/preview', ['file' => $file]);
        $batch = ImportBatch::latest()->first();

        $this->actingAs($admin)->post("/admin/import/{$batch->uuid}/commit");

        $class12 = \App\Models\SchoolClass::where('name', 'XII RPL 1')->first();
        $this->assertNotNull($class12);
        $this->assertEquals(12, $class12->grade_level);
        $this->assertEquals('RPL', $class12->major);

        $class11 = \App\Models\SchoolClass::where('name', 'XI-TKJ-2')->first();
        $this->assertNotNull($class11);
        $this->assertEquals(11, $class11->grade_level);
        $this->assertEquals('TKJ', $class11->major);
    }
}
