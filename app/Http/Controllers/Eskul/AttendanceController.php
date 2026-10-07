<?php

namespace App\Http\Controllers\Eskul;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\AppSetting;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\ExtracurricularMember;
use App\Models\QrTokenUse;
use App\Models\User;
use App\Services\QrTokenService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        protected QrTokenService $qrTokenService
    ) {}

    public function showScanner(Request $request): Response
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        // Fetch open sessions manageable by the user
        $sessionsQuery = ActivitySession::with('extracurricular')
            ->where('status', 'dibuka')
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId));

        if (! $user->isSuperAdmin() && ! $user->isAdmin($yearId)) {
            $userEskulIds = $user->roles()
                ->where('roles.name', 'pengurus_eskul')
                ->wherePivot('academic_year_id', $yearId)
                ->pluck('role_user.extracurricular_id')
                ->filter()
                ->values();

            $sessionsQuery->whereIn('extracurricular_id', $userEskulIds);
        }

        $openSessions = $sessionsQuery->get();

        $selectedSessionUuid = $request->query('session');
        $selectedSession = null;
        $attendances = [];
        $members = [];

        if ($selectedSessionUuid) {
            $selectedSession = ActivitySession::with('extracurricular')->where('uuid', $selectedSessionUuid)->first();
        } elseif ($openSessions->isNotEmpty()) {
            $selectedSession = $openSessions->first();
        }

        if ($selectedSession) {
            $attendances = Attendance::with('student')
                ->where('activity_session_id', $selectedSession->id)
                ->latest('recorded_at')
                ->get();

            $members = ExtracurricularMember::with('user')
                ->where('extracurricular_id', $selectedSession->extracurricular_id)
                ->where('academic_year_id', $selectedSession->academic_year_id)
                ->whereNull('left_at')
                ->get();
        }

        return Inertia::render('Eskul/Scanner', [
            'openSessions' => $openSessions,
            'selectedSession' => $selectedSession,
            'attendances' => $attendances,
            'members' => $members,
        ]);
    }

    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'session_uuid' => ['required', 'string'],
            'token' => ['required', 'string'],
        ]);

        $user = $request->user();
        $activeYear = AcademicYear::active();

        $session = ActivitySession::with('extracurricular')
            ->where('uuid', $request->input('session_uuid'))
            ->first();

        if (! $session) {
            return response()->json(['success' => false, 'message' => 'Sesi kegiatan tidak ditemukan.'], 404);
        }

        // AC-D4: Sesi harus berstatus dibuka
        if ($session->status !== 'dibuka') {
            return response()->json(['success' => false, 'message' => 'Sesi belum dibuka atau sudah ditutup.'], 422);
        }

        // Verify scanner authorization
        if (! $user->canManageExtracurricular($session->extracurricular_id, $session->academic_year_id)) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak akses memindai untuk eskul ini.'], 403);
        }

        // Validate cryptographic QR token (AC-D1, AC-D2)
        $verifyResult = $this->qrTokenService->verifyToken($request->input('token'));
        if (! $verifyResult['success']) {
            return response()->json(['success' => false, 'message' => $verifyResult['error']], 422);
        }

        $student = $verifyResult['user'];
        $tokenHash = $verifyResult['token_hash'];

        // AC-D3: Siswa harus anggota aktif eskul ini
        $isMember = ExtracurricularMember::where('extracurricular_id', $session->extracurricular_id)
            ->where('user_id', $student->id)
            ->where('academic_year_id', $session->academic_year_id)
            ->whereNull('left_at')
            ->exists();

        if (! $isMember) {
            return response()->json([
                'success' => false,
                'message' => "Siswa {$student->name} bukan anggota aktif di eskul {$session->extracurricular->name}.",
            ], 422);
        }

        // AC-D5: Cek apakah sudah absen di sesi ini
        $existing = Attendance::where('activity_session_id', $session->id)
            ->where('user_id', $student->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "Siswa {$student->name} sudah tercatat hadir pada pukul ".Carbon::parse($existing->recorded_at)->format('H:i:s'),
            ], 422);
        }

        // Atomic recording of attendance and token replay protection with race-condition collision handling
        try {
            DB::transaction(function () use ($session, $student, $user, $tokenHash) {
                Attendance::create([
                    'activity_session_id' => $session->id,
                    'user_id' => $student->id,
                    'status' => 'hadir',
                    'method' => 'qr',
                    'recorded_by' => $user->id,
                    'recorded_at' => now(),
                ]);

                QrTokenUse::create([
                    'token_hash' => $tokenHash,
                    'user_id' => $student->id,
                    'activity_session_id' => $session->id,
                    'used_at' => now(),
                ]);
            });
        } catch (UniqueConstraintViolationException|QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token QR telah digunakan atau presensi untuk siswa ini sudah tercatat.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Presensi Berhasil: {$student->name} tercatat HADIR.",
            'student' => [
                'name' => $student->name,
                'nisn' => $student->nisn,
                'time' => now()->format('H:i:s'),
            ],
        ]);
    }

    public function manual(Request $request): RedirectResponse
    {
        $request->validate([
            'session_uuid' => ['required', 'string'],
            'user_id' => ['required', 'exists:users,id'],
            'status' => ['required', 'in:hadir,izin,sakit,alpa'],
            'note' => ['required', 'string', 'min:3'], // AC-D8: Alasan wajib
        ], [
            'note.required' => 'Alasan perubahan presensi manual wajib diisi.',
            'note.min' => 'Alasan minimal 3 karakter.',
        ]);

        $session = ActivitySession::where('uuid', $request->input('session_uuid'))->firstOrFail();
        $user = $request->user();

        // Check if user is authorized to manage this extracurricular
        if (! $user->canManageExtracurricular($session->extracurricular_id, $session->academic_year_id)) {
            abort(403, 'Anda tidak memiliki hak akses mencatat presensi untuk ekstrakurikuler ini.');
        }

        // VULN-01: Ensure target user is an active member of this extracurricular
        $isMember = ExtracurricularMember::where('extracurricular_id', $session->extracurricular_id)
            ->where('user_id', $request->input('user_id'))
            ->where('academic_year_id', $session->academic_year_id)
            ->whereNull('left_at')
            ->exists();

        if (! $isMember) {
            return back()->with('error', 'Siswa yang dipilih bukan anggota aktif di ekstrakurikuler ini.');
        }

        // AC-D9: Edit window check (default 24 hours after session closed)
        if ($session->status === 'ditutup' && $session->closed_at) {
            $windowHours = (int) AppSetting::get('attendance_manual_window_hours', 24);
            $deadline = Carbon::parse($session->closed_at)->addHours($windowHours);

            if (now()->greaterThan($deadline) && ! $user->isSuperAdmin() && ! $user->isAdmin($session->academic_year_id)) {
                return back()->with('error', "Jendela waktu edit presensi manual ({$windowHours} jam) telah berakhir. Hubungi Admin.");
            }
        }

        $existing = Attendance::where('activity_session_id', $session->id)
            ->where('user_id', $request->input('user_id'))
            ->first();

        $oldStatus = $existing?->status;

        Attendance::updateOrCreate(
            [
                'activity_session_id' => $session->id,
                'user_id' => $request->input('user_id'),
            ],
            [
                'status' => $request->input('status'),
                'method' => 'manual',
                'recorded_by' => $user->id,
                'note' => $request->input('note'),
                'recorded_at' => now(),
            ]
        );

        AuditLog::record(
            action: 'manual_attendance',
            entityType: 'Attendance',
            entityId: $session->id.':'.$request->input('user_id'),
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $request->input('status'), 'note' => $request->input('note')],
            userId: $user->id
        );

        return back()->with('success', 'Presensi manual berhasil diperbarui.');
    }

    public function closeSession(Request $request, ActivitySession $session): RedirectResponse
    {
        $user = $request->user();
        if (! $user->canManageExtracurricular($session->extracurricular_id, $session->academic_year_id)) {
            abort(403, 'Anda tidak memiliki hak akses menutup sesi untuk ekstrakurikuler ini.');
        }

        // VULN-04: Prevent closing already closed session to protect audit trail and manual edit window
        if ($session->status === 'ditutup') {
            return back()->with('warning', "Sesi '{$session->title}' sudah ditutup sebelumnya.");
        }

        $session->update([
            'status' => 'ditutup',
            'closed_at' => now(),
        ]);

        AuditLog::record(
            action: 'close_session',
            entityType: 'ActivitySession',
            entityId: $session->id,
            userId: auth()->id()
        );

        return back()->with('success', "Sesi '{$session->title}' berhasil ditutup.");
    }
}
