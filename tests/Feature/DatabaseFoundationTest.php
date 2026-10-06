<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AppSetting;
use App\Models\Attendance;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use App\Models\Extracurricular;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class DatabaseFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_seed_creates_expected_roles_and_academic_year(): void
    {
        $this->seed();

        $this->assertDatabaseHas('roles', ['name' => 'super_admin']);
        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('roles', ['name' => 'bendahara']);
        $this->assertDatabaseHas('roles', ['name' => 'pengurus_eskul']);
        $this->assertDatabaseHas('roles', ['name' => 'siswa']);

        $activeYear = AcademicYear::active();
        $this->assertNotNull($activeYear);
        $this->assertTrue($activeYear->is_active);

        $superAdmin = User::where('email', 'superadmin@sinergi.test')->first();
        $this->assertNotNull($superAdmin);
        $this->assertTrue($superAdmin->isSuperAdmin());
    }

    public function test_cash_transaction_immutability_rejects_arbitrary_updates_and_deletions(): void
    {
        $this->seed();

        $year = AcademicYear::active();
        $cat = CashCategory::where('type', 'masuk')->first();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        $tx = CashTransaction::create([
            'academic_year_id' => $year->id,
            'cash_category_id' => $cat->id,
            'type' => 'masuk',
            'amount' => 500000,
            'description' => 'Iuran Awal Kas',
            'transaction_date' => now()->toDateString(),
            'proof_path' => 'receipts/test.jpg',
            'status' => 'valid',
            'created_by' => $admin->id,
        ]);

        $this->assertDatabaseHas('cash_transactions', [
            'id' => $tx->id,
            'amount' => 500000,
            'status' => 'valid',
        ]);

        // Attempting to change amount must throw RuntimeException (AC-E2)
        $this->expectException(RuntimeException::class);
        $tx->amount = 750000;
        $tx->save();
    }

    public function test_cash_transaction_cannot_be_deleted(): void
    {
        $this->seed();

        $year = AcademicYear::active();
        $cat = CashCategory::where('type', 'masuk')->first();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        $tx = CashTransaction::create([
            'academic_year_id' => $year->id,
            'cash_category_id' => $cat->id,
            'type' => 'masuk',
            'amount' => 100000,
            'description' => 'Dana Kegiatan',
            'transaction_date' => now()->toDateString(),
            'proof_path' => 'receipts/dana.jpg',
            'status' => 'valid',
            'created_by' => $admin->id,
        ]);

        $this->expectException(RuntimeException::class);
        $tx->delete();
    }

    public function test_cash_transaction_allows_valid_to_void_transition_only(): void
    {
        $this->seed();

        $year = AcademicYear::active();
        $cat = CashCategory::where('type', 'masuk')->first();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        $tx = CashTransaction::create([
            'academic_year_id' => $year->id,
            'cash_category_id' => $cat->id,
            'type' => 'masuk',
            'amount' => 200000,
            'description' => 'Salah Input',
            'transaction_date' => now()->toDateString(),
            'proof_path' => 'receipts/salah.jpg',
            'status' => 'valid',
            'created_by' => $admin->id,
        ]);

        // Transition to void with required metadata is allowed
        $tx->status = 'void';
        $tx->void_reason = 'Double entry';
        $tx->voided_by = $admin->id;
        $tx->voided_at = now();
        $tx->save();

        $this->assertDatabaseHas('cash_transactions', [
            'id' => $tx->id,
            'status' => 'void',
            'void_reason' => 'Double entry',
        ]);
    }
}
