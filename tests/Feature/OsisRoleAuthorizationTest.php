<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OsisRoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_ketua_osis_can_access_osis_workspace_and_sekbid_directory(): void
    {
        $this->seed();
        $ketua = User::where('email', 'ketua.osis@sinergi.test')->first();

        $response = $this->actingAs($ketua)->get('/osis/dashboard');
        $response->assertOk();
        $page = $response->viewData('page');
        $this->assertEquals('Osis/Dashboard', $page['component']);

        $responseSekbid = $this->actingAs($ketua)->get('/osis/sekbid');
        $responseSekbid->assertOk();
        $pageSekbid = $responseSekbid->viewData('page');
        $this->assertEquals('Osis/Sekbid/Index', $pageSekbid['component']);
    }

    public function test_sekretaris_osis_can_access_letter_archive(): void
    {
        $this->seed();
        $sekretaris = User::where('email', 'sekretaris@sinergi.test')->first();

        $response = $this->actingAs($sekretaris)->get('/osis/arsip');
        $response->assertOk();
        $page = $response->viewData('page');
        $this->assertEquals('Osis/Arsip/Index', $page['component']);
    }

    public function test_admin_sekolah_can_access_admin_and_osis_workspaces(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@sinergi.test')->first();

        $responseAdmin = $this->actingAs($admin)->get('/admin/dashboard');
        $responseAdmin->assertOk();

        $responseOsis = $this->actingAs($admin)->get('/osis/dashboard');
        $responseOsis->assertOk();
    }

    public function test_regular_student_cannot_access_osis_or_admin_workspaces(): void
    {
        $this->seed();
        $siswa = User::where('email', 'siswa@sinergi.test')->first();

        $responseAdmin = $this->actingAs($siswa)->get('/admin/dashboard');
        $responseAdmin->assertStatus(403);

        $responseOsis = $this->actingAs($siswa)->get('/osis/dashboard');
        $responseOsis->assertStatus(403);

        $responseArsip = $this->actingAs($siswa)->get('/osis/arsip');
        $responseArsip->assertStatus(403);
    }
}
