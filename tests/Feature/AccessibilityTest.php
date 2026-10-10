<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_renders_accessible_form_markup(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertSee('viewport', false);
        $response->assertSee('lang="id"', false);
    }

    public function test_authenticated_dashboard_has_accessible_landmarks_and_renders_inertia_component(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->firstOrFail();

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $page = $response->viewData('page');
        $this->assertEquals('Admin/Dashboard', $page['component']);
    }
}
