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

class AttendanceAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        // Fetch accessible extracurriculars for the user
        $eskulQuery = Extracurricular::where('status', 'aktif');
        if (! $user->isSuperAdmin() && ! $user->isAdmin($yearId)) {
            $userEskulIds = $user->roles()
                ->where('roles.name', 'pengurus_eskul')
                ->wherePivot('academic_year_id', $yearId)
                ->pluck('role_user.extracurricular_id')
                ->filter()
                ->values();

            $eskulQuery->whereIn('id', $userEskulIds);
        }

        $myEskuls = $eskulQuery->get();
        $selectedEskulId = (int) $request->query('eskul_id', $myEskuls->first()?->id);
        $selectedEskul = $myEskuls->firstWhere('id', $selectedEskulId);

        if ($selectedEskul && ! $user->canManageExtracurricular($selectedEskul->id, $yearId)) {
            abort(403, 'Anda tidak memiliki hak akses melihat analitik untuk ekstrakurikuler ini.');
        }

        $analytics = [
            'total_active_members' => 0,
            'total_sessions' => 0,
            'avg_attendance_rate' => 0,
            'trend' => [],
            'participation_tier' => [
                'high' => 0,      // >= 80%
                'moderate' => 0,  // 50% - 79%
                'low' => 0,       // < 50%
            ],
        ];

        if ($selectedEskul) {
            $activeMembers = ExtracurricularMember::where('extracurricular_id', $selectedEskul->id)
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->whereNull('left_at')
                ->get();

            $sessions = ActivitySession::where('extracurricular_id', $selectedEskul->id)
                ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
                ->orderBy('session_date')
                ->get();

            $totalMembersCount = $activeMembers->count();
            $totalSessionsCount = $sessions->count();

            $analytics['total_active_members'] = $totalMembersCount;
            $analytics['total_sessions'] = $totalSessionsCount;

            if ($totalSessionsCount > 0 && $totalMembersCount > 0) {
                $sessionIds = $sessions->pluck('id');
                $attendances = Attendance::whereIn('activity_session_id', $sessionIds)
                    ->where('status', 'hadir')
                    ->get();

                // 1. Session Trend (Last 8 sessions)
                $analytics['trend'] = $sessions->take(-8)->values()->map(function ($s) use ($attendances, $totalMembersCount) {
                    $presentCount = $attendances->where('activity_session_id', $s->id)->count();
                    $rate = round(($presentCount / max(1, $totalMembersCount)) * 100, 1);

                    return [
                        'session_id' => $s->id,
                        'title' => $s->title,
                        'date' => $s->session_date?->format('Y-m-d') ?? '-',
                        'present_count' => $presentCount,
                        'total_members' => $totalMembersCount,
                        'attendance_rate' => $rate,
                    ];
                });

                // 2. Member Participation Tier Distribution
                $userAttendanceCounts = $attendances->groupBy('user_id')->map->count();

                $high = 0;
                $moderate = 0;
                $low = 0;

                foreach ($activeMembers as $m) {
                    $count = $userAttendanceCounts->get($m->user_id, 0);
                    $memberRate = ($count / $totalSessionsCount) * 100;

                    if ($memberRate >= 80) {
                        $high++;
                    } elseif ($memberRate >= 50) {
                        $moderate++;
                    } else {
                        $low++;
                    }
                }

                $analytics['participation_tier'] = [
                    'high' => $high,
                    'moderate' => $moderate,
                    'low' => $low,
                ];

                // 3. Average attendance rate across all sessions
                $analytics['avg_attendance_rate'] = round(
                    $analytics['trend']->avg('attendance_rate') ?? 0,
                    1
                );
            }
        }

        return Inertia::render('Eskul/Analytics', [
            'myEskuls' => $myEskuls,
            'selectedEskul' => $selectedEskul,
            'selectedEskulId' => $selectedEskulId,
            'analytics' => $analytics,
        ]);
    }
}
