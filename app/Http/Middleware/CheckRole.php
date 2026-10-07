<?php

namespace App\Http\Middleware;

use App\Models\AcademicYear;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->status !== 'aktif') {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors(['login' => 'Akun Anda tidak aktif. Hubungi administrator sekolah.']);
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        foreach ($roles as $role) {
            if ($user->hasRole($role, $yearId)) {
                return $next($request);
            }
        }

        abort(403, 'Akses Ditolak: Anda tidak memiliki izin untuk mengakses workspace atau halaman ini.');
    }
}
