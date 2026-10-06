<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_logs_cannot_be_updated_or_deleted(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        $log = AuditLog::record(
            action: 'test_action',
            entityType: 'Test',
            entityId: 1,
            userId: $admin->id
        );

        $this->assertDatabaseHas('audit_logs', [
            'id' => $log->id,
            'action' => 'test_action',
        ]);

        // Attempting to update throws RuntimeException (AC-F2)
        try {
            $log->action = 'modified_action';
            $log->save();
            $this->fail('AuditLog update should have thrown a RuntimeException.');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('append-only', $e->getMessage());
        }

        // Attempting to delete throws RuntimeException (AC-F2)
        try {
            $log->delete();
            $this->fail('AuditLog delete should have thrown a RuntimeException.');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('tidak dapat dihapus', $e->getMessage());
        }
    }

    public function test_admin_can_filter_audit_logs(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        AuditLog::record('login', 'User', $admin->id, userId: $admin->id);
        AuditLog::record('create_transaction', 'CashTransaction', 1, userId: $admin->id);

        $response = $this->actingAs($admin)->get('/admin/audit-logs?action=login');
        $response->assertOk();
    }
}
