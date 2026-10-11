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

    public function test_ordinary_member_creating_incoming_letter_without_status_gets_diajukan_and_null_approved_by(): void
    {
        $this->seed();
        $anggota = User::where('email', 'anggota.osis@sinergi.test')->first();

        // Anggota OSIS biasa menginput surat masuk tanpa mengirim field status
        $response = $this->actingAs($anggota)->post('/osis/arsip', [
            'type' => 'masuk',
            'reference_number' => '010/EXT/X/2026',
            'sender_or_recipient' => 'Kwartir Cabang Pramuka',
            'subject' => 'Edaran Raimuna Cabang',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-11',
        ]);

        $response->assertRedirect();
        $letter = Letter::where('reference_number', '010/EXT/X/2026')->first();
        $this->assertNotNull($letter);
        $this->assertEquals('diajukan', $letter->status);
        $this->assertNull($letter->approved_by);
    }

    public function test_ordinary_member_sending_diarsipkan_or_disetujui_is_coerced_to_diajukan_with_null_approved_by(): void
    {
        $this->seed();
        $anggota = User::where('email', 'anggota.osis@sinergi.test')->first();

        // 1. Upaya menetapkan status 'diarsipkan' pada surat masuk
        $response1 = $this->actingAs($anggota)->post('/osis/arsip', [
            'type' => 'masuk',
            'reference_number' => '011/EXT/X/2026',
            'sender_or_recipient' => 'Puskesmas Kecamatan',
            'subject' => 'Sosialisasi Kesehatan Remaja',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-11',
            'status' => 'diarsipkan',
        ]);
        $response1->assertRedirect();
        $letter1 = Letter::where('reference_number', '011/EXT/X/2026')->first();
        $this->assertEquals('diajukan', $letter1->status);
        $this->assertNull($letter1->approved_by);

        // 2. Upaya menetapkan status 'disetujui' pada surat keluar
        $response2 = $this->actingAs($anggota)->post('/osis/arsip', [
            'type' => 'keluar',
            'reference_number' => '012/OSIS/UND/X/2026',
            'sender_or_recipient' => 'Ekstrakurikuler Paskibra',
            'subject' => 'Pemberitahuan Seleksi Pasukan',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-11',
            'status' => 'disetujui',
        ]);
        $response2->assertRedirect();
        $letter2 = Letter::where('reference_number', '012/OSIS/UND/X/2026')->first();
        $this->assertEquals('diajukan', $letter2->status);
        $this->assertNull($letter2->approved_by);
    }

    public function test_approver_can_create_incoming_as_diarsipkan_and_outgoing_as_disetujui_with_approved_by_set(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        // 1. Approver input surat masuk -> default 'diarsipkan', approved_by tercatat
        $responseMasuk = $this->actingAs($sekretaris)->post('/osis/arsip', [
            'type' => 'masuk',
            'reference_number' => '020/DINAS/X/2026',
            'sender_or_recipient' => 'Dinas Pendidikan',
            'subject' => 'Surat Edaran Lomba',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-11',
        ]);
        $responseMasuk->assertRedirect();
        $letterMasuk = Letter::where('reference_number', '020/DINAS/X/2026')->first();
        $this->assertEquals('diarsipkan', $letterMasuk->status);
        $this->assertEquals($sekretaris->id, $letterMasuk->approved_by);

        // 2. Approver input surat keluar -> default 'disetujui', approved_by tercatat
        $responseKeluar = $this->actingAs($sekretaris)->post('/osis/arsip', [
            'type' => 'keluar',
            'reference_number' => '021/OSIS/UND/X/2026',
            'sender_or_recipient' => 'Kepala Sekolah',
            'subject' => 'Undangan Rapat Koordinasi',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-11',
        ]);
        $responseKeluar->assertRedirect();
        $letterKeluar = Letter::where('reference_number', '021/OSIS/UND/X/2026')->first();
        $this->assertEquals('disetujui', $letterKeluar->status);
        $this->assertEquals($sekretaris->id, $letterKeluar->approved_by);
    }

    public function test_demoting_approved_or_archived_letter_back_to_draft_is_rejected(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();
        $letter = Letter::where('status', 'diarsipkan')->firstOrFail();

        // Upaya menurunkan surat resmi kembali ke draft
        $response = $this->actingAs($sekretaris)->post("/osis/arsip/{$letter->uuid}/status", [
            'status' => 'draft',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertEquals('diarsipkan', $letter->fresh()->status);
    }

    public function test_draft_file_cannot_be_viewed_by_unauthorized_member(): void
    {
        $this->seed();
        $anggota = User::where('email', 'anggota.osis@sinergi.test')->first();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        Storage::fake('local');
        $filePath = 'letters/draft_sample.pdf';
        Storage::disk('local')->put($filePath, 'DRAFT-CONTENT');

        $activeYear = AcademicYear::active();
        $draftLetter = Letter::create([
            'academic_year_id' => $activeYear->id,
            'type' => 'keluar',
            'reference_number' => '999/OSIS/DRAFT/X/2026',
            'sender_or_recipient' => 'Pihak Luar',
            'subject' => 'Draf Rahasia OSIS',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-10',
            'status' => 'draft',
            'file_path' => $filePath,
            'file_name' => 'draft.pdf',
            'file_mime' => 'application/pdf',
            'created_by' => $sekretaris->id,
        ]);

        // Anggota OSIS biasa yang bukan pembuat tidak boleh melihat draf
        $responseAnggota = $this->actingAs($anggota)->get("/osis/arsip/{$draftLetter->uuid}/file");
        $responseAnggota->assertStatus(403);

        // Pembuat draf boleh melihat
        $responseCreator = $this->actingAs($sekretaris)->get("/osis/arsip/{$draftLetter->uuid}/file");
        $responseCreator->assertOk();
    }
}
