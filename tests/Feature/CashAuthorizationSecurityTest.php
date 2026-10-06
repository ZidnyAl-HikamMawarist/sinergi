<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CashAuthorizationSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $year1;
    protected AcademicYear $year2;
    protected User $bendahara1;
    protected User $bendahara2;
    protected User $student;
    protected CashCategory $catMasuk;
    protected CashCategory $catKeluar;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->year1 = AcademicYear::create([
            'name' => '2025/2026',
            'start_date' => '2025-07-01',
            'end_date' => '2026-06-30',
            'is_active' => false,
        ]);

        $this->year2 = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'is_active' => true,
        ]);

        $bendaharaRole = Role::create(['name' => 'bendahara', 'label' => 'Bendahara OSIS']);
        $studentRole = Role::create(['name' => 'siswa', 'label' => 'Siswa']);

        $this->bendahara1 = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->bendahara1->roles()->attach($bendaharaRole->id, ['academic_year_id' => $this->year1->id]);

        $this->bendahara2 = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->bendahara2->roles()->attach($bendaharaRole->id, ['academic_year_id' => $this->year2->id]);

        $this->student = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->student->roles()->attach($studentRole->id, ['academic_year_id' => $this->year2->id]);

        $this->catMasuk = CashCategory::create([
            'name' => 'Iuran OSIS',
            'type' => 'masuk',
            'is_active' => true,
        ]);

        $this->catKeluar = CashCategory::create([
            'name' => 'Konsumsi Rapat',
            'type' => 'keluar',
            'is_active' => true,
        ]);
    }

    public function test_student_cannot_create_cash_transaction(): void
    {
        $response = $this->actingAs($this->student)->post(route('kas.transactions.store'), [
            'type' => 'masuk',
            'cash_category_id' => $this->catMasuk->id,
            'amount' => 50000,
            'description' => 'Iuran Liar',
            'transaction_date' => '2026-10-07',
            'proof' => UploadedFile::fake()->create('struk.jpg', 200, 'image/jpeg'),
        ]);

        $response->assertForbidden();
    }

    public function test_category_type_mismatch_is_rejected(): void
    {
        // Try submitting 'masuk' transaction with category that belongs to 'keluar'
        $response = $this->actingAs($this->bendahara2)->post(route('kas.transactions.store'), [
            'type' => 'masuk',
            'cash_category_id' => $this->catKeluar->id,
            'amount' => 50000,
            'description' => 'Iuran',
            'transaction_date' => '2026-10-07',
            'proof' => UploadedFile::fake()->create('struk.jpg', 200, 'image/jpeg'),
        ]);

        $response->assertSessionHasErrors('cash_category_id');
        $this->assertDatabaseEmpty('cash_transactions');
    }

    public function test_bendahara_cannot_void_transaction_from_different_academic_year(): void
    {
        $txYear1 = CashTransaction::create([
            'academic_year_id' => $this->year1->id,
            'cash_category_id' => $this->catMasuk->id,
            'type' => 'masuk',
            'amount' => 100000,
            'description' => 'Kas Tahun Lalu',
            'transaction_date' => '2025-08-01',
            'proof_path' => 'receipts/test.jpg',
            'status' => 'valid',
            'created_by' => $this->bendahara1->id,
        ]);

        // Bendahara 2 (from Year 2) tries to void transaction from Year 1
        $response = $this->actingAs($this->bendahara2)->post(route('kas.transactions.void', $txYear1->uuid), [
            'void_reason' => 'Mencoba batalkan kas tahun lalu',
        ]);

        $response->assertForbidden();
        $txYear1->refresh();
        $this->assertEquals('valid', $txYear1->status);
    }
}
