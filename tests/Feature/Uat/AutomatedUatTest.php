<?php

namespace Tests\Feature\Uat;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\User;
use App\Services\QrTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AutomatedUatTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('local');
    }

    /**
     * UAT SCENARIO 1: ADMIN WORKFLOW
     * Flow: login → dashboard → student directory → extracurricular management
     */
    public function test_uat_admin_lifecycle(): void
    {
        // 1. Login as Admin OSIS
        $response = $this->post('/login', [
            'identifier' => 'admin@sinergi.test',
            'password' => 'password123',
        ]);
        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticated();

        // 2. Access Admin Dashboard
        $dashboardResponse = $this->get('/admin/dashboard');
        $dashboardResponse->assertStatus(200);

        // 3. Access Student Directory
        $studentsResponse = $this->get('/admin/students');
        $studentsResponse->assertStatus(200);

        // 4. Access Extracurricular Management
        $eskulResponse = $this->get('/admin/eskul');
        $eskulResponse->assertStatus(200);
    }

    /**
     * UAT SCENARIO 2: STUDENT WORKFLOW
     * Flow: login → mandatory password change gate → dynamic QR generation
     */
    public function test_uat_student_lifecycle(): void
    {
        // Configure student to require initial password change
        $student = User::where('email', 'siswa@sinergi.test')->firstOrFail();
        $student->update(['must_change_password' => true]);

        // 1. Student logs in with NISN
        $loginResponse = $this->post('/login', [
            'identifier' => $student->nisn,
            'password' => 'password123',
        ]);
        $loginResponse->assertRedirect(route('password.change'));
        $this->assertAuthenticatedAs($student);

        // 2. Attempting to bypass password change gate to dashboard is blocked
        $bypassResponse = $this->get('/portal/dashboard');
        $bypassResponse->assertRedirect(route('password.change'));

        // 3. Complete password change
        $changePasswordResponse = $this->post('/password/change', [
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);
        $changePasswordResponse->assertRedirect('/portal/dashboard');
        $this->assertFalse($student->fresh()->must_change_password);

        // 4. Access Student Portal Dashboard
        $portalResponse = $this->get('/portal/dashboard');
        $portalResponse->assertStatus(200);

        // 5. Fetch fresh cryptographic dynamic QR token
        $qrResponse = $this->getJson('/portal/qr-token');
        $qrResponse->assertStatus(200);
        $qrResponse->assertJsonStructure(['token', 'ttl', 'expires_at']);
        $this->assertNotEmpty($qrResponse->json('token'));
    }

    /**
     * UAT SCENARIO 3: PENGURUS ESKUL WORKFLOW
     * Flow: login → workspace select → session creation → attendance scanning → recap → close session
     */
    public function test_uat_pengurus_lifecycle(): void
    {
        $pengurus = User::where('email', 'pengurus@sinergi.test')->firstOrFail();
        $student = User::where('email', 'siswa@sinergi.test')->firstOrFail();
        $eskul = Extracurricular::firstOrFail();
        $activeYear = AcademicYear::active();

        // Ensure student is member
        ExtracurricularMember::firstOrCreate([
            'extracurricular_id' => $eskul->id,
            'user_id' => $student->id,
            'academic_year_id' => $activeYear->id,
        ], ['joined_at' => now()]);

        // 1. Pengurus logs in (multi-role: pengurus + siswa)
        $loginResponse = $this->post('/login', [
            'identifier' => 'pengurus@sinergi.test',
            'password' => 'password123',
        ]);
        $loginResponse->assertRedirect('/workspace/select');
        $this->assertAuthenticatedAs($pengurus);

        // 2. Open new activity session
        $sessionResponse = $this->post('/eskul/sessions', [
            'extracurricular_id' => $eskul->id,
            'title' => 'Latihan Gabungan UAT',
            'session_date' => now()->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);
        $sessionResponse->assertRedirect();
        $session = ActivitySession::where('title', 'Latihan Gabungan UAT')->firstOrFail();
        $this->assertEquals('dibuka', $session->status);

        // 3. Scan student QR token
        $qrService = app(QrTokenService::class);
        $tokenData = $qrService->generateToken($student);

        $scanResponse = $this->postJson('/eskul/attendance/scan', [
            'session_uuid' => $session->uuid,
            'token' => $tokenData['token'],
        ]);
        $scanResponse->assertStatus(200);
        $scanResponse->assertJson(['success' => true]);

        // 4. View Attendance Recap
        $recapResponse = $this->get('/eskul/rekap?eskul_id='.$eskul->id);
        $recapResponse->assertStatus(200);

        // 5. Close activity session
        $closeResponse = $this->post("/eskul/sessions/{$session->uuid}/close");
        $closeResponse->assertRedirect();
        $this->assertEquals('ditutup', $session->fresh()->status);
        $this->assertNotNull($session->fresh()->closed_at);
    }

    /**
     * UAT SCENARIO 4: BENDAHARA OSIS WORKFLOW
     * Flow: login → transaction record with receipt → ledger audit → transaction void
     */
    public function test_uat_bendahara_lifecycle(): void
    {
        $bendahara = User::where('email', 'bendahara@sinergi.test')->firstOrFail();
        $category = CashCategory::where('type', 'masuk')->firstOrFail();

        // 1. Bendahara logs in
        $loginResponse = $this->post('/login', [
            'identifier' => 'bendahara@sinergi.test',
            'password' => 'password123',
        ]);
        $loginResponse->assertRedirect('/kas/dashboard');
        $this->assertAuthenticatedAs($bendahara);

        // 2. Record new income transaction with receipt upload
        $receipt = UploadedFile::fake()->create('bukti_kas.jpg', 200, 'image/jpeg');
        $txResponse = $this->post('/kas/transactions', [
            'type' => 'masuk',
            'cash_category_id' => $category->id,
            'amount' => 150000,
            'description' => 'Iuran Kas UAT',
            'transaction_date' => now()->toDateString(),
            'proof' => $receipt,
        ]);
        $txResponse->assertRedirect();

        $tx = CashTransaction::where('description', 'Iuran Kas UAT')->firstOrFail();
        $this->assertEquals('valid', $tx->status);
        $this->assertEquals(150000, $tx->amount);
        Storage::disk('local')->assertExists($tx->proof_path);

        // 3. View Ledger Dashboard
        $dashboardResponse = $this->get('/kas/dashboard');
        $dashboardResponse->assertStatus(200);

        // 4. Void transaction
        $voidResponse = $this->post("/kas/transactions/{$tx->uuid}/void", [
            'void_reason' => 'Salah input nominal iuran oleh bendahara',
        ]);
        $voidResponse->assertRedirect();
        $this->assertEquals('void', $tx->fresh()->status);
        $this->assertEquals('Salah input nominal iuran oleh bendahara', $tx->fresh()->void_reason);
    }

    /**
     * UAT SCENARIO 5: SECURITY POST-LOGOUT BACK NAVIGATION
     * Flow: login → access protected route → logout → browser back request → redirect to login
     */
    public function test_uat_security_logout_and_back_navigation(): void
    {
        $admin = User::where('email', 'admin@sinergi.test')->firstOrFail();

        // 1. Authenticate and access protected administration route
        $this->actingAs($admin)->get('/admin/dashboard')->assertStatus(200);

        // 2. Perform logout
        $logoutResponse = $this->post('/logout');
        $logoutResponse->assertRedirect(route('home'));
        $this->assertGuest();

        // 3. Browser Back button simulation: Requesting protected routes without active session
        $backAdminResponse = $this->get('/admin/dashboard');
        $backAdminResponse->assertRedirect('/login');

        $backPortalResponse = $this->get('/portal/dashboard');
        $backPortalResponse->assertRedirect('/login');

        $backKasResponse = $this->get('/kas/dashboard');
        $backKasResponse->assertRedirect('/login');
    }

    /**
     * UAT SCENARIO 6: OSIS PRESIDIUM & SECRETARY E-ARSIP LIFECYCLE
     * Flow: login ketua osis → dashboard osis → 10 sekbid permendiknas → login sekretaris → generate nomor surat → create letter → archive letter
     */
    public function test_uat_osis_lifecycle(): void
    {
        // 1. Ketua OSIS login and access OSIS Dashboard
        $ketua = User::where('email', 'ketua.osis@sinergi.test')->firstOrFail();
        $this->actingAs($ketua)->get('/osis/dashboard')->assertStatus(200);

        // 2. Access 10 Sekbid Permendiknas 39/2008
        $sekbidResponse = $this->actingAs($ketua)->get('/osis/sekbid');
        $sekbidResponse->assertStatus(200);
        $sekbidPage = $sekbidResponse->viewData('page');
        $this->assertCount(10, $sekbidPage['props']['sekbids']);

        // 3. Sekretaris OSIS login and access E-Arsip
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->firstOrFail();
        $this->actingAs($sekretaris)->get('/osis/arsip')->assertStatus(200);

        // 4. Generate Nomor Surat Resmi
        $genResponse = $this->actingAs($sekretaris)->getJson('/osis/arsip/generate-nomor?classification=UND');
        $genResponse->assertStatus(200);
        $nomorResmi = $genResponse->json('reference_number');
        $this->assertNotEmpty($nomorResmi);

        // 5. Store Outgoing Letter in E-Arsip
        $createResponse = $this->actingAs($sekretaris)->post('/osis/arsip', [
            'type' => 'keluar',
            'reference_number' => $nomorResmi,
            'classification_code' => 'UND',
            'sender_or_recipient' => 'Kepala Sekolah SMAN 1',
            'subject' => 'Permohonan Izin Kegiatan Pekan Olahraga Siswa',
            'letter_date' => now()->toDateString(),
            'received_or_sent_date' => now()->toDateString(),
            'description' => 'Disposisi permohonan fasilitas sarpras',
            'status' => 'disetujui',
        ]);
        $createResponse->assertRedirect();
        $this->assertDatabaseHas('letters', [
            'reference_number' => $nomorResmi,
            'type' => 'keluar',
            'status' => 'disetujui',
        ]);
    }
}
