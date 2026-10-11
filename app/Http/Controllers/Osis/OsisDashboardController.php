<?php

namespace App\Http\Controllers\Osis;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\CashTransaction;
use App\Models\Extracurricular;
use App\Models\Letter;
use App\Models\OsisSekbid;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OsisDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $totalSekbids = OsisSekbid::where('is_active', true)->count();
        $totalEskuls = Extracurricular::where('status', 'aktif')->count();
        $totalLetters = Letter::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->count();
        $totalSessions = ActivitySession::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->count();

        // Safe cash balance calculation
        $cashBalance = 0;
        if ($yearId) {
            $cashBalance = (int) CashTransaction::where('academic_year_id', $yearId)
                ->where('status', 'valid')
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'masuk' THEN amount ELSE -amount END), 0) as balance")
                ->value('balance');
        }

        // 10 Sekbid with official data per Permendiknas No. 39/2008
        $sekbids = OsisSekbid::where('is_active', true)
            ->orderBy('number')
            ->get();

        // Recent letters
        $recentLetters = Letter::with(['creator', 'approver'])
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->latest()
            ->take(5)
            ->get();

        // Recent extracurricular activities
        $recentSessions = ActivitySession::with(['extracurricular', 'creator'])
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->latest('activity_date')
            ->take(5)
            ->get();

        return Inertia::render('Osis/Dashboard', [
            'stats' => [
                'totalSekbids' => $totalSekbids,
                'totalEskuls' => $totalEskuls,
                'totalLetters' => $totalLetters,
                'totalSessions' => $totalSessions,
                'cashBalance' => $cashBalance,
            ],
            'sekbids' => $sekbids,
            'recentLetters' => $recentLetters,
            'recentSessions' => $recentSessions,
        ]);
    }
}
