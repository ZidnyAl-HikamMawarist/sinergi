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

    public function test_approver_can_transition_letter_from_diajukan_to_disetujui_and_to_diarsipkan(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();
        $activeYear = AcademicYear::active();

        $letter = Letter::create([
            'academic_year_id' => $activeYear->id,
            'type' => 'keluar',
            'reference_number' => '101/OSIS/UND/X/2026',
            'sender_or_recipient' => 'Wakasek Kesiswaan',
            'subject' => 'Surat Pengajuan',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-10',
            'status' => 'diajukan',
            'created_by' => $sekretaris->id,
        ]);

        // 1. diajukan -> disetujui
        $responseApprove = $this->actingAs($sekretaris)->post("/osis/arsip/{$letter->uuid}/status", [
            'status' => 'disetujui',
        ]);
        $responseApprove->assertRedirect();
        $this->assertEquals('disetujui', $letter->fresh()->status);
        $this->assertEquals($sekretaris->id, $letter->fresh()->approved_by);

        // 2. disetujui -> diarsipkan
        $responseArchive = $this->actingAs($sekretaris)->post("/osis/arsip/{$letter->uuid}/status", [
            'status' => 'diarsipkan',
        ]);
        $responseArchive->assertRedirect();
        $this->assertEquals('diarsipkan', $letter->fresh()->status);
        $this->assertEquals($sekretaris->id, $letter->fresh()->approved_by);
    }

    public function test_approver_can_return_diajukan_letter_to_draft_for_revision(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();
        $activeYear = AcademicYear::active();

        $letter = Letter::create([
            'academic_year_id' => $activeYear->id,
            'type' => 'keluar',
            'reference_number' => '102/OSIS/UND/X/2026',
            'sender_or_recipient' => 'Wakasek Kesiswaan',
            'subject' => 'Surat Pengajuan Belum Selesai',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-10',
            'status' => 'diajukan',
            'created_by' => $sekretaris->id,
        ]);

        // diajukan -> draft (dikembalikan untuk revisi sebelum disetujui)
        $response = $this->actingAs($sekretaris)->post("/osis/arsip/{$letter->uuid}/status", [
            'status' => 'draft',
        ]);
        $response->assertRedirect();
        $this->assertEquals('draft', $letter->fresh()->status);
        $this->assertNull($letter->fresh()->approved_by);
    }

    public function test_updating_status_on_inactive_academic_year_letter_is_rejected_for_non_admin_and_allowed_for_admin(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        // Buat tahun ajaran lampau / tidak aktif
        $pastYear = AcademicYear::create([
            'name' => '2024/2025',
            'start_date' => '2024-07-15',
            'end_date' => '2025-06-20',
            'is_active' => false,
        ]);

        $pastLetter = Letter::create([
            'academic_year_id' => $pastYear->id,
            'type' => 'masuk',
            'reference_number' => '001/PAST/2024',
            'sender_or_recipient' => 'Dinas Pendidikan',
            'subject' => 'Surat Tahun Lalu',
            'letter_date' => '2024-08-10',
            'received_or_sent_date' => '2024-08-11',
            'status' => 'diajukan',
            'created_by' => $sekretaris->id,
        ]);

        // Sekretaris OSIS tidak boleh mengubah status arsip tahun ajaran lampau
        $responseSekretaris = $this->actingAs($sekretaris)->post("/osis/arsip/{$pastLetter->uuid}/status", [
            'status' => 'diarsipkan',
        ]);
        $responseSekretaris->assertStatus(403);

        // Admin Sekolah berwenang mengelola arsip lampau
        $responseAdmin = $this->actingAs($admin)->post("/osis/arsip/{$pastLetter->uuid}/status", [
            'status' => 'diarsipkan',
        ]);
        $responseAdmin->assertRedirect();
        $this->assertEquals('diarsipkan', $pastLetter->fresh()->status);
    }

    public function test_non_draft_letter_file_is_accessible_to_all_authorized_osis_members(): void
    {
        $this->seed();
        $anggota = User::where('email', 'anggota.osis@sinergi.test')->first();
        $siswaBiasa = User::where('email', 'siswa@sinergi.test')->first();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        Storage::fake('local');
        $filePath = 'letters/official_circular.pdf';
        Storage::disk('local')->put($filePath, 'OFFICIAL-CIRCULAR-PDF');

        $activeYear = AcademicYear::active();
        $officialLetter = Letter::create([
            'academic_year_id' => $activeYear->id,
            'type' => 'masuk',
            'reference_number' => '055/DISDIK/X/2026',
            'sender_or_recipient' => 'Dinas Pendidikan',
            'subject' => 'Edaran Resmi Kegiatan Pelajar',
            'letter_date' => '2026-10-10',
            'received_or_sent_date' => '2026-10-11',
            'status' => 'diarsipkan',
            'file_path' => $filePath,
            'file_name' => 'edaran.pdf',
            'file_mime' => 'application/pdf',
            'created_by' => $sekretaris->id,
            'approved_by' => $sekretaris->id,
        ]);

        // 1. Anggota OSIS biasa berhak melihat berkas surat resmi yang sudah diarsipkan
        $responseAnggota = $this->actingAs($anggota)->get("/osis/arsip/{$officialLetter->uuid}/file");
        $responseAnggota->assertOk();
        $responseAnggota->assertHeader('X-Content-Type-Options', 'nosniff');

        // 2. Siswa biasa (non-OSIS) dilarang mengakses berkas arsip surat (HTTP 403 via RoleMiddleware)
        $responseSiswa = $this->actingAs($siswaBiasa)->get("/osis/arsip/{$officialLetter->uuid}/file");
        $responseSiswa->assertStatus(403);
    }
}
