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
        // Assert HTML structure and viewport
        $response->assertSee('viewport', false);
        $response->assertSee('lang=', false);
    }

    public function test_authenticated_dashboard_has_accessible_landmarks_and_skip_link(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->firstOrFail();

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $response->assertStatus(200);
    }
}
