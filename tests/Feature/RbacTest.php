<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_dashboards(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/kas/dashboard')->assertRedirect('/login');
        $this->get('/eskul/dashboard')->assertRedirect('/login');
        $this->get('/portal/dashboard')->assertRedirect('/login');
    }

    public function test_student_cannot_access_admin_or_cash_dashboards(): void
    {
        $this->seed();
        $student = User::where('email', 'siswa@sinergi.test')->first();

        // Student accessing Admin -> 403 Forbidden
        $this->actingAs($student)->get('/admin/dashboard')->assertStatus(403);

        // Student accessing Kas -> 403 Forbidden
        $this->actingAs($student)->get('/kas/dashboard')->assertStatus(403);

        // Student accessing Portal -> 200 OK
        $this->actingAs($student)->get('/portal/dashboard')->assertStatus(200);
    }

    public function test_bendahara_can_access_cash_dashboard(): void
    {
        $this->seed();
        $bendahara = User::where('email', 'bendahara@sinergi.test')->first();

        $this->actingAs($bendahara)->get('/kas/dashboard')->assertStatus(200);
        $this->actingAs($bendahara)->get('/admin/dashboard')->assertStatus(403);
    }

    public function test_super_admin_can_access_all_dashboards(): void
    {
        $this->seed();
        $superAdmin = User::where('email', 'superadmin@sinergi.test')->first();

        $this->actingAs($superAdmin)->get('/admin/dashboard')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/kas/dashboard')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/eskul/dashboard')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/portal/dashboard')->assertStatus(200);
    }
}
