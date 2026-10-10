<?php

namespace Tests\Feature;

use App\Models\OsisMeeting;
use App\Models\OsisProgram;
use App\Models\OsisSekbid;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OsisProgramAndMeetingTest extends TestCase
{
    use RefreshDatabase;

    public function test_ketua_sekbid_can_propose_program_kerja(): void
    {
        $this->seed();
        $ketuaSekbid1 = User::where('email', 'sekbid1@sinergi.test')->first();
        $sekbid1 = OsisSekbid::where('number', 1)->first();

        $response = $this->actingAs($ketuaSekbid1)->post('/osis/program', [
            'osis_sekbid_id' => $sekbid1->id,
            'name' => 'Pesantren Kilat Ramadhan Pelajar',
            'description' => 'Kegiatan penguatan iman dan amaliah ramadhan bagi siswa.',
            'target_audience' => 'Siswa Muslim Kelas X & XI',
            'start_date' => '2026-11-10',
            'end_date' => '2026-11-13',
            'estimated_budget' => 3000000,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('osis_programs', [
            'name' => 'Pesantren Kilat Ramadhan Pelajar',
            'osis_sekbid_id' => $sekbid1->id,
            'status' => 'diajukan',
            'pic_user_id' => $ketuaSekbid1->id,
        ]);
    }

    public function test_presidium_can_approve_program_kerja(): void
    {
        $this->seed();
        $ketuaOsis = User::where('email', 'ketua.osis@sinergi.test')->first();
        $program = OsisProgram::where('status', 'diajukan')->first();

        $this->assertNotNull($program);

        $response = $this->actingAs($ketuaOsis)->post("/osis/program/{$program->uuid}/approve", [
            'decision' => 'disetujui',
            'approval_note' => 'Disetujui untuk dilaksanakan sesuai jadwal.',
        ]);

        $response->assertRedirect();
        $fresh = $program->fresh();
        $this->assertEquals('disetujui', $fresh->status);
        $this->assertEquals($ketuaOsis->id, $fresh->approved_by);
        $this->assertEquals('Disetujui untuk dilaksanakan sesuai jadwal.', $fresh->approval_note);
    }

    public function test_non_presidium_cannot_approve_program_kerja(): void
    {
        $this->seed();
        $siswa = User::where('email', 'siswa@sinergi.test')->first();
        $program = OsisProgram::first();

        $response = $this->actingAs($siswa)->post("/osis/program/{$program->uuid}/approve", [
            'decision' => 'disetujui',
        ]);

        $response->assertStatus(403);
    }

    public function test_program_status_transition_to_berjalan_and_terlaksana(): void
    {
        $this->seed();
        $ketuaOsis = User::where('email', 'ketua.osis@sinergi.test')->first();
        $program = OsisProgram::where('status', 'disetujui')->first();

        $this->assertNotNull($program);

        // Berjalan
        $response1 = $this->actingAs($ketuaOsis)->post("/osis/program/{$program->uuid}/status", [
            'status' => 'berjalan',
        ]);
        $response1->assertRedirect();
        $this->assertEquals('berjalan', $program->fresh()->status);

        // Terlaksana
        $response2 = $this->actingAs($ketuaOsis)->post("/osis/program/{$program->uuid}/status", [
            'status' => 'terlaksana',
        ]);
        $response2->assertRedirect();
        $this->assertEquals('terlaksana', $program->fresh()->status);
    }

    public function test_scheduling_meeting_and_recording_minutes(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        // 1. Schedule Meeting
        $responseSchedule = $this->actingAs($sekretaris)->post('/osis/agenda', [
            'title' => 'Rapat Koordinasi Persiapan Classmeeting Semester Ganjil',
            'meeting_type' => 'koordinasi_sekbid',
            'meeting_date' => '2026-11-20',
            'start_time' => '13:00',
            'end_time' => '15:00',
            'location' => 'Ruang OSIS',
            'agenda_description' => 'Pembagian cabang perlombaan antar kelas.',
        ]);

        $responseSchedule->assertRedirect();
        $meeting = OsisMeeting::where('title', 'Rapat Koordinasi Persiapan Classmeeting Semester Ganjil')->first();
        $this->assertNotNull($meeting);
        $this->assertEquals('dijadwalkan', $meeting->status);

        // 2. Record Minutes
        $responseMinutes = $this->actingAs($sekretaris)->post("/osis/agenda/{$meeting->uuid}/notulen", [
            'minutes_of_meeting' => 'Disepakati 4 cabang olahraga: Futsal, Basket, E-Sport, dan Rangku Alu.',
            'status' => 'selesai',
        ]);

        $responseMinutes->assertRedirect();
        $this->assertEquals('selesai', $meeting->fresh()->status);
        $this->assertStringContainsString('Futsal, Basket', $meeting->fresh()->minutes_of_meeting);
    }
}
