<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Letter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LetterArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_sekretaris_can_create_incoming_and_outgoing_letters(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        // 1. Catat Surat Masuk
        $responseMasuk = $this->actingAs($sekretaris)->post('/osis/arsip', [
            'type' => 'masuk',
            'reference_number' => '421/999/Disdik/X/2026',
            'sender_or_recipient' => 'Dinas Pendidikan Jawa Barat',
            'subject' => 'Undangan Rapat Kerja Wilayah',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-11',
            'description' => 'Undangan delegasi pengurus',
        ]);

        $responseMasuk->assertRedirect();
        $this->assertDatabaseHas('letters', [
            'reference_number' => '421/999/Disdik/X/2026',
            'type' => 'masuk',
            'created_by' => $sekretaris->id,
        ]);

        // 2. Catat Surat Keluar dengan attachment berkas PDF
        Storage::fake('local');
        $pdfFile = UploadedFile::fake()->create('surat-undangan.pdf', 100, 'application/pdf');

        $responseKeluar = $this->actingAs($sekretaris)->post('/osis/arsip', [
            'type' => 'keluar',
            'reference_number' => '002/OSIS/UND/X/2026',
            'classification_code' => 'UND',
            'sender_or_recipient' => 'Kepala Sekolah SMAN 1',
            'subject' => 'Permohonan Dispensasi Latihan Rutin',
            'letter_date' => '2026-10-11',
            'received_or_sent_date' => '2026-10-11',
            'file' => $pdfFile,
        ]);

        $responseKeluar->assertRedirect();
        $letterKeluar = Letter::where('reference_number', '002/OSIS/UND/X/2026')->first();
        $this->assertNotNull($letterKeluar);
        $this->assertNotNull($letterKeluar->file_path);
        Storage::disk('local')->assertExists($letterKeluar->file_path);
    }

    public function test_reference_number_generator_follows_official_standard(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        $response = $this->actingAs($sekretaris)->getJson('/osis/arsip/generate-nomor?classification=SK');
        $response->assertOk();
        $data = $response->json();

        $this->assertArrayHasKey('reference_number', $data);
        $this->assertStringContainsString('/OSIS/SK/', $data['reference_number']);
        $this->assertStringContainsString(date('Y'), $data['reference_number']);
    }

    public function test_authorized_user_can_access_letter_file(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        Storage::fake('local');
        $filePath = 'letters/test_sample.pdf';
        Storage::disk('local')->put($filePath, 'PDF-CONTENT-SAMPLE');

        $activeYear = AcademicYear::active();
        $letter = Letter::create([
            'academic_year_id' => $activeYear->id,
            'type' => 'keluar',
            'reference_number' => '003/OSIS/UND/X/2026',
            'sender_or_recipient' => 'Siswa',
            'subject' => 'Contoh Undangan',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-10',
            'file_path' => $filePath,
            'file_name' => 'undangan.pdf',
            'file_mime' => 'application/pdf',
            'created_by' => $sekretaris->id,
        ]);

        $response = $this->actingAs($sekretaris)->get("/osis/arsip/{$letter->uuid}/file");
        $response->assertOk();
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_updating_letter_status(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();
        $letter = Letter::first();

        $response = $this->actingAs($sekretaris)->post("/osis/arsip/{$letter->uuid}/status", [
            'status' => 'diarsipkan',
        ]);

        $response->assertRedirect();
        $this->assertEquals('diarsipkan', $letter->fresh()->status);
    }

    public function test_unauthorized_user_cannot_update_letter_status(): void
    {
        $this->seed();
        $letter = Letter::first();
        $anggota = User::where('email', 'anggota.osis@sinergi.test')->first();

        // Anggota OSIS biasa tidak berhak menyetujui atau mengarsipkan surat
        $response = $this->actingAs($anggota)->post("/osis/arsip/{$letter->uuid}/status", [
            'status' => 'disetujui',
        ]);

        $response->assertStatus(403);
    }
}
