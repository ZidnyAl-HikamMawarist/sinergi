<?php

namespace App\Http\Controllers\Eskul;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Attendance;
use App\Models\Extracurricular;
use App\Models\ExtracurricularMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceRecapController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        // Accessible extracurriculars
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

        $eskuls = $eskulQuery->get();
        $selectedEskulId = $request->query('eskul_id', $eskuls->first()?->id);
        $selectedEskul = $eskuls->firstWhere('id', $selectedEskulId);

        $sessions = collect();
        $memberRecaps = collect();
        $stats = [
            'total_sessions' => 0,
            'total_members' => 0,
            'avg_attendance_rate' => 0,
        ];

        if ($selectedEskul) {
            $sessions = ActivitySession::where('extracurricular_id', $selectedEskul->id)
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->latest('session_date')
                ->get();

            $members = ExtracurricularMember::with(['user.enrollments.schoolClass'])
                ->where('extracurricular_id', $selectedEskul->id)
                ->where('academic_year_id', $yearId)
                ->whereNull('left_at')
                ->get();

            $totalSessionsCount = $sessions->count();
            $stats['total_sessions'] = $totalSessionsCount;
            $stats['total_members'] = $members->count();

            $sessionIds = $sessions->pluck('id');
            $attendanceStats = Attendance::whereIn('activity_session_id', $sessionIds)
                ->selectRaw('user_id, status, count(*) as count')
                ->groupBy('user_id', 'status')
                ->get()
                ->groupBy('user_id')
                ->map(fn ($rows) => $rows->pluck('count', 'status'));

            $memberRecaps = $members->map(function ($member) use ($totalSessionsCount, $attendanceStats) {
                $userStats = $attendanceStats->get($member->user_id, collect());
                $hadir = $userStats['hadir'] ?? 0;
                $izin = $userStats['izin'] ?? 0;
                $sakit = $userStats['sakit'] ?? 0;
                $alpa = $totalSessionsCount > 0 ? max(0, $totalSessionsCount - ($hadir + $izin + $sakit)) : 0;
                $rate = $totalSessionsCount > 0 ? round(($hadir / $totalSessionsCount) * 100, 1) : 0;

                return [
                    'user_id' => $member->user_id,
                    'name' => $member->user->name,
                    'nisn' => $member->user->nisn ?? '-',
                    'class_name' => $member->user->enrollments->first()?->schoolClass?->name ?? '-',
                    'hadir' => $hadir,
                    'izin' => $izin,
                    'sakit' => $sakit,
                    'alpa' => $alpa,
                    'attendance_rate' => $rate,
                ];
            });

            if ($memberRecaps->isNotEmpty() && $totalSessionsCount > 0) {
                $stats['avg_attendance_rate'] = round($memberRecaps->avg('attendance_rate'), 1);
            }
        }

        return Inertia::render('Eskul/Recap', [
            'eskuls' => $eskuls,
            'selectedEskulId' => (int) $selectedEskulId,
            'selectedEskul' => $selectedEskul,
            'sessions' => $sessions,
            'memberRecaps' => $memberRecaps,
            'stats' => $stats,
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $request->validate([
            'eskul_id' => ['required', 'exists:extracurriculars,id'],
        ]);

        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;
        $eskul = Extracurricular::findOrFail($request->input('eskul_id'));

        $user = $request->user();
        if (!$user->canManageExtracurricular($eskul->id, $yearId)) {
            abort(403, 'Anda tidak memiliki hak akses mengunduh rekap untuk ekstrakurikuler ini.');
        }

        $sessions = ActivitySession::where('extracurricular_id', $eskul->id)
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->orderBy('session_date')
            ->get();

        $members = ExtracurricularMember::with(['user.enrollments.schoolClass'])
            ->where('extracurricular_id', $eskul->id)
            ->where('academic_year_id', $yearId)
            ->whereNull('left_at')
            ->get();

        $sessionIds = $sessions->pluck('id');
        $attendanceStats = Attendance::whereIn('activity_session_id', $sessionIds)
            ->selectRaw('user_id, status, count(*) as count')
            ->groupBy('user_id', 'status')
            ->get()
            ->groupBy('user_id')
            ->map(fn ($rows) => $rows->pluck('count', 'status'));

        $totalSessionsCount = $sessions->count();
        $fileName = 'rekap_presensi_' . str_replace(' ', '_', strtolower($eskul->name)) . '_' . date('Ymd_His') . '.csv';

        return response()->stream(function () use ($members, $sessions, $attendanceStats, $totalSessionsCount) {
            $handle = fopen('php://output', 'w');
            
            // CSV Header
            fputcsv($handle, ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Hadir', 'Izin', 'Sakit', 'Alpa', '% Kehadiran']);

            $no = 1;
            foreach ($members as $member) {
                $userStats = $attendanceStats->get($member->user_id, collect());
                $hadir = $userStats['hadir'] ?? 0;
                $izin = $userStats['izin'] ?? 0;
                $sakit = $userStats['sakit'] ?? 0;
                $alpa = $totalSessionsCount > 0 ? max(0, $totalSessionsCount - ($hadir + $izin + $sakit)) : 0;
                $rate = $totalSessionsCount > 0 ? round(($hadir / $totalSessionsCount) * 100, 1) : 0;

                fputcsv($handle, [
                    $no++,
                    $member->user->nisn ?? '-',
                    $member->user->name,
                    $member->user->enrollments->first()?->schoolClass?->name ?? '-',
                    $hadir,
                    $izin,
                    $sakit,
                    $alpa,
                    $rate . '%',
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }
}
