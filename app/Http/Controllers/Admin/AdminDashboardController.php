<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\AuditLog;
use App\Models\CashTransaction;
use App\Models\Extracurricular;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $totalStudents = User::whereNotNull('nisn')->where('status', 'aktif')->count();
        $totalEskul = Extracurricular::where('status', 'aktif')->count();
        $totalSessions = ActivitySession::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->count();

        // Server-calculated balance per ERD Section 7
        $cashBalance = 0;
        if ($yearId) {
            $cashBalance = (int) CashTransaction::where('academic_year_id', $yearId)
                ->where('status', 'valid')
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'masuk' THEN amount ELSE -amount END), 0) as balance")
                ->value('balance');
        }

        $recentSessions = ActivitySession::with(['extracurricular', 'creator'])
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->latest()
            ->take(5)
            ->get();

        $recentLogs = AuditLog::with('user')
            ->latest('created_at')
            ->take(6)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'totalEskul' => $totalEskul,
                'totalSessions' => $totalSessions,
                'cashBalance' => $cashBalance,
            ],
            'recentSessions' => $recentSessions,
            'recentLogs' => $recentLogs,
        ]);
    }
}
