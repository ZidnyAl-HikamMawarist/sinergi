<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\ImportBatch;
use App\Models\Role;
use App\Models\User;
use App\Services\QrTokenService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RedTeamAbuseTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $academicYear;

    protected Role $siswaRole;

    protected Role $pengurusRole;

    protected Role $bendaharaRole;

    protected Role $adminRole;

    protected Extracurricular $eskulA;

    protected Extracurricular $eskulB;

    protected User $pengurusA;

    protected User $studentA;

    protected User $studentB;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->academicYear = AcademicYear::create([
            'name' => '2026/2027 Ganjil',
            'start_date' => '2026-07-01',
            'end_date' => '2026-12-31',
            'is_active' => true,
        ]);

        $this->siswaRole = Role::create(['name' => 'siswa', 'label' => 'Siswa']);
        $this->pengurusRole = Role::create(['name' => 'pengurus_eskul', 'label' => 'Pengurus Eskul']);
        $this->bendaharaRole = Role::create(['name' => 'bendahara', 'label' => 'Bendahara']);
        $this->adminRole = Role::create(['name' => 'admin', 'label' => 'Admin']);

        $this->eskulA = Extracurricular::create(['name' => 'Pramuka', 'status' => 'aktif']);
        $this->eskulB = Extracurricular::create(['name' => 'Paskibra', 'status' => 'aktif']);

        // Pengurus A for Eskul A
        $this->pengurusA = User::create([
            'name' => 'Budi Pengurus',
            'email' => 'pengurus.a@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'aktif',
            'must_change_password' => false,
        ]);
        $this->pengurusA->roles()->attach($this->pengurusRole->id, [
            'academic_year_id' => $this->academicYear->id,
            'extracurricular_id' => $this->eskulA->id,
        ]);

        // Student A (Member of Eskul A)
        $this->studentA = User::create([
            'name' => 'Siswa A Pramuka',
            'nisn' => '1111111111',
            'email' => 'siswa.a@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'aktif',
            'must_change_password' => false,
        ]);
        $this->studentA->roles()->attach($this->siswaRole->id, ['academic_year_id' => $this->academicYear->id]);
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $this->studentA->id,
            'academic_year_id' => $this->academicYear->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        // Student B (Member of Eskul B only, NOT Eskul A)
        $this->studentB = User::create([
            'name' => 'Siswa B Paskibra',
            'nisn' => '2222222222',
            'email' => 'siswa.b@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'aktif',
            'must_change_password' => false,
        ]);
        $this->studentB->roles()->attach($this->siswaRole->id, ['academic_year_id' => $this->academicYear->id]);
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulB->id,
            'user_id' => $this->studentB->id,
            'academic_year_id' => $this->academicYear->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        // Admin
        $this->admin = User::create([
            'name' => 'Admin OSIS',
            'email' => 'admin@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'aktif',
            'must_change_password' => false,
        ]);
        $this->admin->roles()->attach($this->adminRole->id, ['academic_year_id' => $this->academicYear->id]);
    }

    /**
     * VULN-01: Manual attendance MUST reject non-members of the session's extracurricular
     */
    public function test_manual_attendance_rejects_non_member_of_the_extracurricular(): void
    {
        $session = ActivitySession::create([
            'extracurricular_id' => $this->eskulA->id,
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Latihan Rutin Pramuka',
            'session_date' => now()->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'opened_at' => now(),
            'created_by' => $this->pengurusA->id,
        ]);

        // Pengurus A attempts to manually mark Student B (who only belongs to Eskul B) as present in Eskul A
        $response = $this->actingAs($this->pengurusA)
            ->post(route('eskul.attendance.manual'), [
                'session_uuid' => $session->uuid,
                'user_id' => $this->studentB->id,
                'status' => 'hadir',
                'note' => 'Hadir manual titipan',
            ]);

        // Must be rejected with 422 or redirect with error flash message, NOT recorded in DB
        $this->assertDatabaseMissing('attendances', [
            'activity_session_id' => $session->id,
            'user_id' => $this->studentB->id,
        ]);
    }

    /**
     * VULN-02: Suspended/inactive student QR token must be rejected by QrTokenService and scanner
     */
    public function test_inactive_student_qr_is_rejected(): void
    {
        $session = ActivitySession::create([
            'extracurricular_id' => $this->eskulA->id,
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Latihan Pramuka',
            'session_date' => now()->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'dibuka',
            'opened_at' => now(),
            'created_by' => $this->pengurusA->id,
        ]);

        $service = app(QrTokenService::class);
        $tokenData = $service->generateToken($this->studentA);

        // Student A gets suspended/deactivated
        $this->studentA->update(['status' => 'nonaktif']);

        // Verification service must reject inactive student
        $verifyResult = $service->verifyToken($tokenData['token']);
        $this->assertFalse($verifyResult['success']);
        $this->assertStringContainsString('aktif', strtolower($verifyResult['error'] ?? ''));

        // Attendance scan endpoint must also reject with 422
        $response = $this->actingAs($this->pengurusA)->postJson(route('eskul.attendance.scan'), [
            'session_uuid' => $session->uuid,
            'token' => $tokenData['token'],
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('attendances', [
            'activity_session_id' => $session->id,
            'user_id' => $this->studentA->id,
        ]);
    }

    /**
     * VULN-03: Password change for active user requires current_password
     */
    public function test_password_change_requires_current_password_for_active_users(): void
    {
        // When must_change_password is false, updating password without current_password must fail
        $response = $this->actingAs($this->pengurusA)->post(route('password.update'), [
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasErrors('current_password');

        // Providing wrong current_password must also fail
        $responseWrong = $this->actingAs($this->pengurusA)->post(route('password.update'), [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $responseWrong->assertSessionHasErrors('current_password');

        // Providing correct current_password succeeds
        $responseValid = $this->actingAs($this->pengurusA)->post(route('password.update'), [
            'current_password' => 'password123',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $responseValid->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('newpassword123', $this->pengurusA->fresh()->password));
    }

    /**
     * VULN-04: Closing an already closed session must not reset closed_at
     */
    public function test_closing_an_already_closed_session_does_not_reset_closed_at(): void
    {
        $originalClosedAt = Carbon::now()->subDays(2); // 48 hours ago

        $session = ActivitySession::create([
            'extracurricular_id' => $this->eskulA->id,
            'academic_year_id' => $this->academicYear->id,
            'title' => 'Sesi Lampau',
            'session_date' => now()->subDays(2)->toDateString(),
            'start_time' => '15:00',
            'end_time' => '17:00',
            'status' => 'ditutup',
            'opened_at' => now()->subDays(2)->subHours(2),
            'closed_at' => $originalClosedAt,
            'created_by' => $this->pengurusA->id,
        ]);

        // Attempting to close again
        $this->actingAs($this->pengurusA)
            ->post(route('eskul.sessions.close', $session->uuid));

        // The closed_at timestamp MUST NOT be updated to now()
        $session->refresh();
        $this->assertEquals(
            $originalClosedAt->toDateTimeString(),
            $session->closed_at->toDateTimeString()
        );
    }

    /**
     * VULN-05: Receipt proof upload stores true MIME type and response includes nosniff
     */
    public function test_receipt_proof_upload_stores_server_mime_and_serves_nosniff(): void
    {
        Storage::fake('local');

        $bendahara = User::create([
            'name' => 'Siti Bendahara',
            'email' => 'bendahara.test@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'aktif',
            'must_change_password' => false,
        ]);
        $bendahara->roles()->attach($this->bendaharaRole->id, ['academic_year_id' => $this->academicYear->id]);

        $category = CashCategory::create([
            'academic_year_id' => $this->academicYear->id,
            'name' => 'Dana BOS',
            'type' => 'masuk',
            'is_active' => true,
        ]);

        $file = UploadedFile::fake()->create('receipt.png', 100, 'image/png');

        $this->actingAs($bendahara)->post(route('kas.transactions.store'), [
            'type' => 'masuk',
            'cash_category_id' => $category->id,
            'amount' => 50000,
            'description' => 'Penerimaan dana kas',
            'transaction_date' => now()->toDateString(),
            'proof' => $file,
        ]);

        $tx = CashTransaction::latest('id')->first();
        $this->assertNotNull($tx);
        $this->assertEquals('image/png', $tx->proof_mime);

        // Check showProof response headers
        $response = $this->actingAs($bendahara)->get(route('kas.transactions.proof', $tx->uuid));
        $response->assertStatus(200);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    /**
     * VULN-06: CSV Export sanitizes formula injection characters
     */
    public function test_csv_export_sanitizes_formula_injection(): void
    {
        // Malicious student name with formula prefix
        $hackerStudent = User::create([
            'name' => '=CMD|\' /C calc\'!A0',
            'nisn' => '3333333333',
            'email' => 'hacker@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'aktif',
            'must_change_password' => false,
        ]);
        $hackerStudent->roles()->attach($this->siswaRole->id, ['academic_year_id' => $this->academicYear->id]);
        ExtracurricularMember::create([
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $hackerStudent->id,
            'academic_year_id' => $this->academicYear->id,
            'position' => 'anggota',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($this->pengurusA)
            ->get(route('eskul.rekap.export', ['eskul_id' => $this->eskulA->id]));

        $response->assertStatus(200);
        $content = $response->streamedContent();

        // The formula character '=' must be neutralized/escaped with leading quote "'" or tab
        $this->assertStringNotContainsString('"=CMD|', $content);
        $this->assertStringContainsString("'=CMD|", $content);
    }

    /**
     * VULN-08: Admin cannot add inactive or non-student user to extracurricular
     */
    public function test_admin_cannot_add_inactive_or_non_student_to_extracurricular(): void
    {
        $inactiveStudent = User::create([
            'name' => 'Siswa Nonaktif',
            'nisn' => '4444444444',
            'email' => 'nonaktif@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'nonaktif',
            'must_change_password' => false,
        ]);
        $inactiveStudent->roles()->attach($this->siswaRole->id, ['academic_year_id' => $this->academicYear->id]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.eskul.members.add', $this->eskulA->uuid), [
                'user_id' => $inactiveStudent->id,
                'position' => 'anggota',
            ]);

        $this->assertDatabaseMissing('extracurricular_members', [
            'extracurricular_id' => $this->eskulA->id,
            'user_id' => $inactiveStudent->id,
        ]);
    }

    /**
     * VULN-07: Unbounded CSV rows exceeding 2,000 data rows are safely rejected to prevent DoS
     */
    public function test_unbounded_csv_rows_exceeding_safe_limit_are_rejected(): void
    {
        // Generate CSV with 2,005 rows
        $lines = ['nisn,nama,kelas'];
        for ($i = 1; $i <= 2005; $i++) {
            $lines[] = '999'.str_pad($i, 7, '0', STR_PAD_LEFT).",Siswa {$i},X RPL 1";
        }
        $csvContent = implode("\n", $lines);
        $file = UploadedFile::fake()->createWithContent('huge_students.csv', $csvContent);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.import.preview'), [
                'file' => $file,
            ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('import_batches', ['filename' => 'huge_students.csv']);
    }

    /**
     * Cash integer overflow boundary test (> Rp 1.000.000.000)
     */
    public function test_cash_transaction_extreme_overflow_amount_is_rejected(): void
    {
        Storage::fake('local');

        $bendahara = User::create([
            'name' => 'Bendahara OSIS',
            'email' => 'bendahara.bound@sinergi.test',
            'password' => Hash::make('password123'),
            'status' => 'aktif',
            'must_change_password' => false,
        ]);
        $bendahara->roles()->attach($this->bendaharaRole->id, ['academic_year_id' => $this->academicYear->id]);

        $category = CashCategory::create([
            'academic_year_id' => $this->academicYear->id,
            'name' => 'Sumbangan',
            'type' => 'masuk',
            'is_active' => true,
        ]);

        $file = UploadedFile::fake()->create('receipt.png', 100, 'image/png');

        // Rp 2.000.000.000 exceeds max constraint
        $response = $this->actingAs($bendahara)->post(route('kas.transactions.store'), [
            'type' => 'masuk',
            'cash_category_id' => $category->id,
            'amount' => 2000000000,
            'description' => 'Transfer dana fantastis',
            'transaction_date' => now()->toDateString(),
            'proof' => $file,
        ]);

        $response->assertSessionHasErrors('amount');
    }

    /**
     * Concurrent double commit prevention
     */
    public function test_concurrent_double_commit_prevention(): void
    {
        $batch = ImportBatch::create([
            'academic_year_id' => $this->academicYear->id,
            'uploaded_by' => $this->admin->id,
            'filename' => 'batch_double.csv',
            'status' => 'committed', // Already processed
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.import.commit', $batch->uuid));

        $response->assertSessionHas('warning');
    }

    /**
     * Unauthorized user cannot access receipt proof
     */
    public function test_unauthorized_user_cannot_access_receipt_proof(): void
    {
        Storage::fake('local');
        $path = Storage::disk('local')->put('receipts/dummy.png', 'fake image bytes');

        $category = CashCategory::create([
            'academic_year_id' => $this->academicYear->id,
            'name' => 'Kas',
            'type' => 'masuk',
            'is_active' => true,
        ]);

        $tx = CashTransaction::create([
            'academic_year_id' => $this->academicYear->id,
            'cash_category_id' => $category->id,
            'type' => 'masuk',
            'amount' => 50000,
            'description' => 'Kas bendahara',
            'transaction_date' => now()->toDateString(),
            'proof_path' => 'receipts/dummy.png',
            'proof_mime' => 'image/png',
            'proof_size' => 100,
            'status' => 'valid',
            'created_by' => $this->admin->id,
        ]);

        // Siswa accessing proof -> 403 Forbidden
        $response = $this->actingAs($this->studentA)
            ->get(route('kas.transactions.proof', $tx->uuid));

        $response->assertStatus(403);
    }
}
