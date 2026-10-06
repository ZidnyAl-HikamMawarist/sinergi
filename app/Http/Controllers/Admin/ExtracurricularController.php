<?php

namespace App\Http\Controllers\Admin;

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

class ExtracurricularController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $eskuls = Extracurricular::withCount([
            'members' => function ($q) use ($yearId) {
                $q->when($yearId, fn ($sq) => $sq->where('academic_year_id', $yearId))->whereNull('left_at');
            },
            'activitySessions' => function ($q) use ($yearId) {
                $q->when($yearId, fn ($sq) => $sq->where('academic_year_id', $yearId));
            },
        ])->get();

        $selectedUuid = $request->query('selected');
        $selectedEskul = null;
        $members = collect();

        if ($selectedUuid) {
            $selectedEskul = Extracurricular::where('uuid', $selectedUuid)->first();
        } elseif ($eskuls->isNotEmpty()) {
            $selectedEskul = $eskuls->first();
        }

        if ($selectedEskul) {
            $members = ExtracurricularMember::with(['user.enrollments.schoolClass'])
                ->where('extracurricular_id', $selectedEskul->id)
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->whereNull('left_at')
                ->latest('joined_at')
                ->get();
        }

        // Available students who are not yet active members of the selected eskul
        $existingUserIds = $members->pluck('user_id');
        $availableStudents = User::where('status', 'aktif')
            ->whereHas('roles', fn ($q) => $q->where('name', 'siswa'))
            ->whereNotIn('id', $existingUserIds)
            ->with('enrollments.schoolClass')
            ->take(50)
            ->get();

        return Inertia::render('Admin/Eskul', [
            'eskuls' => $eskuls,
            'selectedEskul' => $selectedEskul,
            'members' => $members,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:extracurriculars,name'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $eskul = Extracurricular::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => 'aktif',
        ]);

        AuditLog::record(
            action: 'create_extracurricular',
            entityType: 'Extracurricular',
            entityId: $eskul->id,
            newValues: ['name' => $eskul->name],
            userId: auth()->id()
        );

        return back()->with('success', "Ekstrakurikuler '{$eskul->name}' berhasil dibuat.");
    }

    public function update(Request $request, Extracurricular $eskul): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:extracurriculars,name,' . $eskul->id],
            'description' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $oldValues = $eskul->only(['name', 'description', 'status']);
        $eskul->update($validated);

        AuditLog::record(
            action: 'update_extracurricular',
            entityType: 'Extracurricular',
            entityId: $eskul->id,
            oldValues: $oldValues,
            newValues: $validated,
            userId: auth()->id()
        );

        return back()->with('success', "Ekstrakurikuler '{$eskul->name}' berhasil diperbarui.");
    }

    public function addMember(Request $request, Extracurricular $eskul): RedirectResponse
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'position' => ['nullable', 'string', 'in:ketua,wakil,anggota,Ketua,Wakil,Anggota'],
        ]);

        $activeYear = AcademicYear::active();
        if (!$activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $userId = $request->input('user_id');

        // Check if already active
        $existing = ExtracurricularMember::where('extracurricular_id', $eskul->id)
            ->where('user_id', $userId)
            ->where('academic_year_id', $activeYear->id)
            ->whereNull('left_at')
            ->first();

        if ($existing) {
            return back()->with('error', 'Siswa sudah menjadi anggota aktif eskul ini.');
        }

        $position = strtolower($request->input('position', 'anggota')) ?: 'anggota';

        $member = ExtracurricularMember::create([
            'extracurricular_id' => $eskul->id,
            'user_id' => $userId,
            'academic_year_id' => $activeYear->id,
            'position' => $position,
            'joined_at' => now(),
        ]);

        AuditLog::record(
            action: 'add_eskul_member',
            entityType: 'ExtracurricularMember',
            entityId: $member->id,
            newValues: [
                'eskul' => $eskul->name,
                'user_id' => $userId,
                'position' => $member->position,
            ],
            userId: auth()->id()
        );

        return back()->with('success', 'Anggota berhasil ditambahkan ke ' . $eskul->name);
    }

    public function removeMember(Extracurricular $eskul, ExtracurricularMember $member): RedirectResponse
    {
        if ($member->extracurricular_id !== $eskul->id) {
            abort(403);
        }

        // Set left_at instead of deleting row to preserve historical attendance integrity
        $member->update([
            'left_at' => now(),
        ]);

        AuditLog::record(
            action: 'remove_eskul_member',
            entityType: 'ExtracurricularMember',
            entityId: $member->id,
            oldValues: ['left_at' => null],
            newValues: ['left_at' => now()->toDateString()],
            userId: auth()->id()
        );

        return back()->with('success', 'Anggota dinonaktifkan dari keanggotaan eskul.');
    }
}
