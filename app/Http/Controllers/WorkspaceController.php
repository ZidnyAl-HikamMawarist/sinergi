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
                'name' => 'Admin Inti OSIS',
                'description' => 'Kelola akun siswa, penetapan eskul, rekap keseluruhan, dan audit sistem.',
                'route' => 'admin.dashboard',
                'badge' => 'Admin',
                'color' => 'secondary',
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
