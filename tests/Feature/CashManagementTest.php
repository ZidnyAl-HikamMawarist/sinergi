<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CashManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_transaction_requires_valid_proof_file(): void
    {
        $this->seed();
        $bendahara = User::where('email', 'bendahara@sinergi.test')->first();
        $cat = CashCategory::where('type', 'masuk')->first();

        // 1. Missing proof must fail validation
        $response = $this->actingAs($bendahara)->post('/kas/transactions', [
            'type' => 'masuk',
            'cash_category_id' => $cat->id,
            'amount' => 150000,
            'description' => 'Iuran Anggota',
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertSessionHasErrors('proof');

        // 2. With valid proof file must succeed
        Storage::fake('public');
        $file = UploadedFile::fake()->image('receipt.jpg');

        $responseSuccess = $this->actingAs($bendahara)->post('/kas/transactions', [
            'type' => 'masuk',
            'cash_category_id' => $cat->id,
            'amount' => 150000,
            'description' => 'Iuran Anggota',
            'transaction_date' => now()->toDateString(),
            'proof' => $file,
        ]);

        $responseSuccess->assertRedirect();
        $this->assertDatabaseHas('cash_transactions', [
            'amount' => 150000,
            'status' => 'valid',
            'created_by' => $bendahara->id,
        ]);
    }

    public function test_voiding_transaction_requires_reason_and_updates_balance(): void
    {
        $this->seed();
        $bendahara = User::where('email', 'bendahara@sinergi.test')->first();
        $cat = CashCategory::where('type', 'masuk')->first();
        $year = AcademicYear::active();

        $tx = CashTransaction::create([
            'academic_year_id' => $year->id,
            'cash_category_id' => $cat->id,
            'type' => 'masuk',
            'amount' => 250000,
            'description' => 'Salah Input',
            'transaction_date' => now()->toDateString(),
            'proof_path' => 'receipts/test.jpg',
            'status' => 'valid',
            'created_by' => $bendahara->id,
        ]);

        // Void without reason fails
        $this->actingAs($bendahara)->post("/kas/transactions/{$tx->uuid}/void", [])
            ->assertSessionHasErrors('void_reason');

        // Void with reason succeeds
        $this->actingAs($bendahara)->post("/kas/transactions/{$tx->uuid}/void", [
            'void_reason' => 'Salah nominal, diinput ulang dengan benar',
        ])->assertRedirect();

        $this->assertDatabaseHas('cash_transactions', [
            'id' => $tx->id,
            'status' => 'void',
            'void_reason' => 'Salah nominal, diinput ulang dengan benar',
            'voided_by' => $bendahara->id,
        ]);
    }
}
