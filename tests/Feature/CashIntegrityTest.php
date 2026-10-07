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
use RuntimeException;
use Tests\TestCase;

class CashIntegrityTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicYear $year;

    protected User $bendahara;

    protected CashCategory $catMasuk;

    protected CashCategory $catKeluar;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $this->year = AcademicYear::create([
            'name' => '2026/2027',
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'is_active' => true,
        ]);

        $bendaharaRole = Role::create(['name' => 'bendahara', 'label' => 'Bendahara OSIS']);

        $this->bendahara = User::factory()->create(['status' => 'aktif', 'must_change_password' => false]);
        $this->bendahara->roles()->attach($bendaharaRole->id, ['academic_year_id' => $this->year->id]);

        $this->catMasuk = CashCategory::create([
            'name' => 'Iuran OSIS',
            'type' => 'masuk',
            'is_active' => true,
        ]);

        $this->catKeluar = CashCategory::create([
            'name' => 'Perlengkapan',
            'type' => 'keluar',
            'is_active' => true,
        ]);
    }

    public function test_cash_immutability_and_lifecycle(): void
    {
        // 1. Create valid transaction -> Success
        $response = $this->actingAs($this->bendahara)->post(route('kas.transactions.store'), [
            'type' => 'masuk',
            'cash_category_id' => $this->catMasuk->id,
            'amount' => 150000,
            'description' => 'Iuran Awal',
            'transaction_date' => '2026-10-07',
            'proof' => UploadedFile::fake()->create('nota.jpg', 300, 'image/jpeg'),
        ]);
        $response->assertRedirect();

        $tx = CashTransaction::first();
        $this->assertNotNull($tx);
        $this->assertEquals('valid', $tx->status);

        // 2. Edit amount directly -> RuntimeException
        try {
            $tx->amount = 200000;
            $tx->save();
            $this->fail('CashTransaction allowed updating amount!');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('immutable', $e->getMessage());
        }

        // 3. Edit category directly -> RuntimeException
        try {
            $tx->cash_category_id = $this->catKeluar->id;
            $tx->save();
            $this->fail('CashTransaction allowed updating category!');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('immutable', $e->getMessage());
        }

        // 4. Edit description directly -> RuntimeException
        try {
            $tx->description = 'Deskripsi diganti';
            $tx->save();
            $this->fail('CashTransaction allowed updating description!');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('immutable', $e->getMessage());
        }

        // 5. Delete transaction directly -> RuntimeException
        try {
            $tx->delete();
            $this->fail('CashTransaction allowed direct deletion!');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('tidak boleh dihapus', $e->getMessage());
        }

        // 6. Void valid transaction -> Success
        $respVoid = $this->actingAs($this->bendahara)->post(route('kas.transactions.void', $tx->uuid), [
            'void_reason' => 'Salah catat nominal transaksi',
        ]);
        $respVoid->assertRedirect();
        $tx->refresh();
        $this->assertEquals('void', $tx->status);
        $this->assertEquals('Salah catat nominal transaksi', $tx->void_reason);

        // 7. Void again -> Warning redirect
        $respVoidAgain = $this->actingAs($this->bendahara)->post(route('kas.transactions.void', $tx->uuid), [
            'void_reason' => 'Mencoba void dua kali',
        ]);
        $respVoidAgain->assertRedirect();
        $respVoidAgain->assertSessionHas('warning');

        // 8. Revert void -> valid -> RuntimeException
        try {
            $tx->status = 'valid';
            $tx->save();
            $this->fail('CashTransaction allowed transition from void to valid!');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('Transisi status hanya diperbolehkan', $e->getMessage());
        }

        // 9. Category type mismatch -> Validation Error
        $respMismatch = $this->actingAs($this->bendahara)->post(route('kas.transactions.store'), [
            'type' => 'masuk',
            'cash_category_id' => $this->catKeluar->id, // keluar category on masuk type
            'amount' => 50000,
            'description' => 'Iuran Ilegal',
            'transaction_date' => '2026-10-07',
            'proof' => UploadedFile::fake()->create('nota.jpg', 300, 'image/jpeg'),
        ]);
        $respMismatch->assertSessionHasErrors('cash_category_id');
    }
}
