<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class PwaCacheSecurityTest extends TestCase
{
    public function test_pwa_manifest_is_valid_and_present(): void
    {
        $manifestPath = public_path('manifest.json');
        $this->assertFileExists($manifestPath);

        $content = File::get($manifestPath);
        $manifest = json_decode($content, true);

        $this->assertIsArray($manifest);
        $this->assertEquals('SINERGI', $manifest['short_name']);
        $this->assertEquals('standalone', $manifest['display']);
        $this->assertEquals('/', $manifest['start_url']);
    }

    public function test_service_worker_is_hardened_against_authenticated_data_caching(): void
    {
        $swPath = public_path('sw.js');
        $this->assertFileExists($swPath);

        $content = File::get($swPath);

        // 1. Must use updated cache version
        $this->assertStringContainsString('sinergi-cache-v2', $content);

        // 2. Must explicitly define protected routes that are NEVER cached
        $this->assertStringContainsString('PROTECTED_ROUTE_REGEX', $content);
        $this->assertStringContainsString('portal|eskul|kas|admin|workspace|password', $content);

        // 3. Must implement offline fallback page
        $this->assertStringContainsString('/offline.html', $content);

        // 4. Must support cache clearing on logout message
        $this->assertStringContainsString('CLEAR_USER_DATA', $content);
    }

    public function test_offline_fallback_page_is_present_and_unprivileged(): void
    {
        $offlinePath = public_path('offline.html');
        $this->assertFileExists($offlinePath);

        $content = File::get($offlinePath);
        $this->assertStringContainsString('Koneksi Terputus', $content);
        $this->assertStringNotContainsString('csrf-token', $content);
    }
}
