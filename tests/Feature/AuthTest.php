<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_email(): void
    {
        $this->seed();

        $response = $this->post('/login', [
            'identifier' => 'admin@sinergi.test',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticated();
    }

    public function test_user_can_login_with_nisn(): void
    {
        $this->seed();

        $response = $this->post('/login', [
            'identifier' => '0051234562',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/portal/dashboard');
        $this->assertAuthenticated();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->seed();

        $inactiveUser = User::create([
            'name' => 'Siswa Nonaktif',
            'nisn' => '9999999999',
            'password' => 'password123',
            'status' => 'nonaktif',
        ]);

        $response = $this->post('/login', [
            'identifier' => '9999999999',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('identifier');
        $this->assertGuest();
    }

    public function test_user_with_must_change_password_is_redirected_to_change_password(): void
    {
        $this->seed();

        $user = User::create([
            'name' => 'Siswa Baru',
            'nisn' => '8888888888',
            'password' => 'password123',
            'status' => 'aktif',
            'must_change_password' => true,
        ]);

        $response = $this->post('/login', [
            'identifier' => '8888888888',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('password.change'));
        $this->assertAuthenticated();
    }

    public function test_multi_role_user_is_redirected_to_workspace_selector(): void
    {
        $this->seed();

        // Budi Santoso in seeder has both 'pengurus_eskul' and 'siswa' roles
        $response = $this->post('/login', [
            'identifier' => 'pengurus@sinergi.test',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('workspace.select'));
        $this->assertAuthenticated();
    }

    public function test_user_can_logout(): void
    {
        $this->seed();
        $user = User::where('email', 'admin@sinergi.test')->first();

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }
}
