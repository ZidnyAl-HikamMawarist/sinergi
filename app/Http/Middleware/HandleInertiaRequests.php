<?php

namespace App\Http\Middleware;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $activeYear = null;

        try {
            if (Schema::hasTable('academic_years')) {
                $activeYear = AcademicYear::active();
            }
        } catch (\Throwable $e) {
            // Fallback during initial installation or unmigrated tests
        }

        $userData = null;
        if ($user) {
            $activeRoles = $user->getActiveRoles($activeYear?->id);
            $userData = [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'name' => $user->name,
                'email' => $user->email,
                'nisn' => $user->nisn,
                'status' => $user->status,
                'must_change_password' => $user->must_change_password,
                'roles' => $activeRoles->map(fn ($r) => [
                    'name' => $r->name,
                    'label' => $r->label,
                    'extracurricular_id' => $r->pivot->extracurricular_id,
                ])->values()->all(),
                'is_super_admin' => $user->isSuperAdmin(),
                'is_admin' => $user->isAdmin($activeYear?->id),
                'is_bendahara' => $user->isBendahara($activeYear?->id),
                'is_presidium' => $user->isPresidiumOsis($activeYear?->id),
                'is_ketua_osis' => $user->isKetuaOsis($activeYear?->id),
                'is_wakil_ketua_osis' => $user->isWakilKetuaOsis($activeYear?->id),
                'is_sekretaris_osis' => $user->isSekretarisOsis($activeYear?->id),
                'is_anggota_osis' => $user->isAnggotaOsis($activeYear?->id),
                'is_pengurus' => $user->isPengurusEskul(null, $activeYear?->id),
                'is_siswa' => $user->isSiswa($activeYear?->id),
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
            'activeAcademicYear' => $activeYear ? [
                'id' => $activeYear->id,
                'name' => $activeYear->name,
            ] : null,
            'appTimezone' => config('app.timezone', 'Asia/Jakarta'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
        ];
    }
}
