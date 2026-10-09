<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutBrowserCacheSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->adminUser = User::where('email', 'admin@sinergi.test')->firstOrFail();
    }

    public function test_authenticated_protected_route_returns_strict_no_cache_headers(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.dashboard'));

        $response->assertStatus(200);
        $response->assertHeader('Cache-Control');
        $cacheControl = $response->headers->get('Cache-Control');

        $this->assertStringContainsString('no-store', $cacheControl);
        $this->assertStringContainsString('no-cache', $cacheControl);
        $this->assertStringContainsString('must-revalidate', $cacheControl);
        $this->assertEquals('no-cache', $response->headers->get('Pragma'));
    }

    public function test_logout_response_sets_clear_site_data_and_invalidates_session(): void
    {
        $response = $this->actingAs($this->adminUser)->post(route('logout'));

        $response->assertRedirect(route('home'));
        $response->assertHeader('Clear-Site-Data', '"cache"');
        $this->assertGuest();
    }

    public function test_after_logout_attempting_to_reaccess_protected_route_redirects_to_login(): void
    {
        // 1. Authenticate and access
        $this->actingAs($this->adminUser)->get(route('admin.dashboard'))->assertStatus(200);

        // 2. Perform logout
        $this->post(route('logout'))->assertRedirect(route('home'));

        // 3. Simulating browser Back navigation sending request to protected route
        $response = $this->get(route('admin.dashboard'));

        // Must be unauthenticated and redirected to login, NOT 200
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }
}
