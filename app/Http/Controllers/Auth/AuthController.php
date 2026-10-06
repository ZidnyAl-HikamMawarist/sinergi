<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'identifier.required' => 'NISN atau Email wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input('identifier')).'|'.$request->ip());

        // AC-A5: 5 attempts within 10 minutes (600 seconds)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'identifier' => "Terlalu banyak percobaan login gagal. Silakan coba lagi dalam {$seconds} detik.",
            ]);
        }

        $identifier = $request->input('identifier');
        $user = User::where('email', $identifier)
            ->orWhere('nisn', $identifier)
            ->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey, 600);
            throw ValidationException::withMessages([
                'identifier' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
            ]);
        }

        // AC-A3: Non-active or graduated accounts cannot log in
        if ($user->status !== 'aktif') {
            RateLimiter::hit($throttleKey, 600);
            throw ValidationException::withMessages([
                'identifier' => 'Akun Anda tidak aktif atau telah lulus. Hubungi administrator sekolah.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        $user->update(['last_login_at' => now()]);

        AuditLog::record(
            action: 'login',
            entityType: 'User',
            entityId: $user->id,
            userId: $user->id
        );

        return $this->redirectBasedOnRole($user);
    }

    public function logout(Request $request): RedirectResponse
    {
        if ($user = $request->user()) {
            AuditLog::record(
                action: 'logout',
                entityType: 'User',
                entityId: $user->id,
                userId: $user->id
            );
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'Anda telah berhasil keluar.');
    }

    public function showChangePassword(): Response
    {
        return Inertia::render('Auth/ChangePassword');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->input('password')),
            'must_change_password' => false,
        ]);

        AuditLog::record(
            action: 'change_password',
            entityType: 'User',
            entityId: $user->id,
            userId: $user->id
        );

        return $this->redirectBasedOnRole($user)
            ->with('success', 'Kata sandi berhasil diperbarui.');
    }

    protected function redirectBasedOnRole(User $user): RedirectResponse
    {
        if ($user->must_change_password) {
            return redirect()->route('password.change');
        }

        $activeYear = AcademicYear::active();
        $activeRoles = $user->getActiveRoles($activeYear?->id);

        // Filter unique operational roles
        $distinctRoles = $activeRoles->pluck('name')->unique()->values();

        // AC-A2: If user holds multiple roles (e.g. Siswa + Pengurus Eskul), show workspace selector
        if ($distinctRoles->count() > 1) {
            return redirect()->route('workspace.select');
        }

        if ($user->isSuperAdmin() || $distinctRoles->contains('admin')) {
            return redirect()->route('admin.dashboard');
        }

        if ($distinctRoles->contains('bendahara')) {
            return redirect()->route('kas.dashboard');
        }

        if ($distinctRoles->contains('pengurus_eskul')) {
            return redirect()->route('eskul.dashboard');
        }

        return redirect()->route('portal.dashboard');
    }
}
