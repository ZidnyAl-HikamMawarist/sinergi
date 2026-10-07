<?php

namespace App\Http\Controllers\Eskul;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EskulMemberController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        // Accessible extracurriculars for this user
        $eskulQuery = Extracurricular::where('status', 'aktif');
        if (!$user->isSuperAdmin() && !$user->isAdmin($yearId)) {
            $userEskulIds = $user->roles()
                ->where('roles.name', 'pengurus_eskul')
                ->wherePivot('academic_year_id', $yearId)
                ->pluck('role_user.extracurricular_id')
                ->filter()
                ->values();

            $eskulQuery->whereIn('id', $userEskulIds);
        }

        $myEskuls = $eskulQuery->get();
        $selectedEskulId = $request->query('eskul_id', $myEskuls->first()?->id);
        $selectedEskul = $myEskuls->firstWhere('id', $selectedEskulId);

        $members = collect();
        $availableStudents = collect();

        if ($selectedEskul) {
            $members = ExtracurricularMember::with(['user.enrollments.schoolClass'])
                ->where('extracurricular_id', $selectedEskul->id)
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->whereNull('left_at')
                ->latest('joined_at')
                ->get();

            // Active students not yet enrolled in this eskul
            $enrolledUserIds = $members->pluck('user_id');
            $availableStudents = User::where('status', 'aktif')
                ->whereHas('roles', fn ($q) => $q->where('name', 'siswa'))
                ->whereNotIn('id', $enrolledUserIds)
                ->with('enrollments.schoolClass')
                ->take(50)
                ->get();
        }

        return Inertia::render('Eskul/Members', [
            'myEskuls' => $myEskuls,
            'selectedEskul' => $selectedEskul,
            'selectedEskulId' => (int) $selectedEskulId,
            'members' => $members,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'extracurricular_id' => ['required', 'exists:extracurriculars,id'],
            'user_id' => ['required', 'exists:users,id'],
            'position' => ['required', 'in:ketua,wakil,anggota'],
        ]);

        $activeYear = AcademicYear::active();
        if (!$activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $user = $request->user();
        $eskulId = (int) $request->input('extracurricular_id');

        if (!$user->canManageExtracurricular($eskulId, $activeYear->id)) {
            abort(403, 'Anda tidak memiliki hak akses mengelola anggota eskul ini.');
        }

        $userId = $request->input('user_id');
        $targetStudent = User::find($userId);
        if (!$targetStudent || $targetStudent->status !== 'aktif' || !$targetStudent->hasRole('siswa', $activeYear->id)) {
            return back()->with('error', 'Hanya siswa aktif yang dapat ditambahkan sebagai anggota eskul.');
        }

        $existing = ExtracurricularMember::where('extracurricular_id', $eskulId)
            ->where('user_id', $userId)
            ->where('academic_year_id', $activeYear->id)
            ->whereNull('left_at')
            ->first();

        if ($existing) {
            return back()->with('error', 'Siswa sudah menjadi anggota aktif ekstrakurikuler ini.');
        }

        $member = ExtracurricularMember::create([
            'extracurricular_id' => $eskulId,
            'user_id' => $userId,
            'academic_year_id' => $activeYear->id,
            'position' => $request->input('position'),
            'joined_at' => now(),
        ]);

        AuditLog::record(
            action: 'add_eskul_member_by_pengurus',
            entityType: 'ExtracurricularMember',
            entityId: $member->id,
            newValues: [
                'eskul_id' => $eskulId,
                'user_id' => $userId,
                'position' => $member->position,
            ],
            userId: $user->id
        );

        return back()->with('success', "Siswa {$targetStudent->name} berhasil ditambahkan sebagai anggota.");
    }

    public function destroy(Request $request, ExtracurricularMember $member): RedirectResponse
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();

        if (!$user->canManageExtracurricular($member->extracurricular_id, $member->academic_year_id ?? $activeYear?->id)) {
            abort(403, 'Anda tidak memiliki hak akses menonaktifkan anggota eskul ini.');
        }

        $member->update(['left_at' => now()]);

        AuditLog::record(
            action: 'remove_eskul_member_by_pengurus',
            entityType: 'ExtracurricularMember',
            entityId: $member->id,
            oldValues: ['left_at' => null],
            newValues: ['left_at' => now()->toDateString()],
            userId: $user->id
        );

        return back()->with('success', 'Anggota berhasil dinonaktifkan dari ekstrakurikuler.');
    }
}
