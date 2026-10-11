<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function select(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();
        $roles = $user->getActiveRoles($activeYear?->id);

        $availableWorkspaces = [];

        if ($user->isSuperAdmin() || $roles->contains('name', 'admin')) {
            $availableWorkspaces[] = [
                'id' => 'admin',
                'name' => 'Admin Sekolah / Pembina',
                'description' => 'Kelola akun siswa, penetapan eskul, konfigurasi master sistem, dan audit log keamanan.',
                'route' => 'admin.dashboard',
                'badge' => 'Admin Sekolah',
                'color' => 'secondary',
            ];
        }

        $osisRoles = $roles->pluck('name')->intersect([
            'ketua_osis', 'wakil_ketua_osis', 'sekretaris_osis',
            'ketua_sekbid', 'sekretaris_sekbid', 'anggota_osis',
        ]);
        if ($user->isSuperAdmin() || $osisRoles->isNotEmpty()) {
            $availableWorkspaces[] = [
                'id' => 'osis',
                'name' => 'Presidium & Pengurus OSIS',
                'description' => 'Monitoring 10 Sekbid Permendiknas 39/2008, kelola E-Arsip surat menyurat, dan koordinasi eskul.',
                'route' => 'osis.dashboard',
                'badge' => 'OSIS',
                'color' => 'accent',
            ];
        }

        if ($user->isSuperAdmin() || $roles->contains('name', 'bendahara')) {
            $availableWorkspaces[] = [
                'id' => 'bendahara',
                'name' => 'Bendahara OSIS',
                'description' => 'Kelola buku kas, catat transaksi masuk/keluar, dan verifikasi bukti pembayaran.',
                'route' => 'kas.dashboard',
                'badge' => 'Keuangan',
                'color' => 'success',
            ];
        }

        $eskulRoles = $roles->where('name', 'pengurus_eskul');
        if ($user->isSuperAdmin() || $eskulRoles->isNotEmpty()) {
            $availableWorkspaces[] = [
                'id' => 'pengurus_eskul',
                'name' => 'Pengurus Ekstrakurikuler',
                'description' => 'Buka sesi kegiatan, scan presensi QR siswa, dan kelola anggota eskul.',
                'route' => 'eskul.dashboard',
                'badge' => 'Eskul',
                'color' => 'primary',
            ];
        }

        if ($user->isSiswa($activeYear?->id)) {
            $availableWorkspaces[] = [
                'id' => 'siswa',
                'name' => 'Portal Siswa',
                'description' => 'Lihat ID Digital QR presensi dan pantau riwayat kehadiran kegiatan.',
                'route' => 'portal.dashboard',
                'badge' => 'Siswa',
                'color' => 'accent',
            ];
        }

        return Inertia::render('Workspace/Select', [
            'workspaces' => $availableWorkspaces,
        ]);
    }
}
