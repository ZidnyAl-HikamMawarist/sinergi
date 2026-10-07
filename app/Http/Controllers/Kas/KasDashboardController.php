<?php

namespace App\Http\Controllers\Kas;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KasDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $stats = [
            'balance' => 0,
            'totalIn' => 0,
            'totalOut' => 0,
            'validCount' => 0,
            'voidCount' => 0,
        ];

        if ($yearId) {
            $aggregated = CashTransaction::where('academic_year_id', $yearId)
                ->selectRaw("
                    COALESCE(SUM(CASE WHEN status = 'valid' AND type = 'masuk' THEN amount ELSE 0 END), 0) as total_in,
                    COALESCE(SUM(CASE WHEN status = 'valid' AND type = 'keluar' THEN amount ELSE 0 END), 0) as total_out,
                    COALESCE(SUM(CASE WHEN status = 'valid' AND type = 'masuk' THEN amount WHEN status = 'valid' AND type = 'keluar' THEN -amount ELSE 0 END), 0) as balance,
                    COALESCE(SUM(CASE WHEN status = 'valid' THEN 1 ELSE 0 END), 0) as valid_count,
                    COALESCE(SUM(CASE WHEN status = 'void' THEN 1 ELSE 0 END), 0) as void_count
                ")
                ->first();

            $stats['totalIn'] = (int) ($aggregated->total_in ?? 0);
            $stats['totalOut'] = (int) ($aggregated->total_out ?? 0);
            $stats['balance'] = (int) ($aggregated->balance ?? 0);
            $stats['validCount'] = (int) ($aggregated->valid_count ?? 0);
            $stats['voidCount'] = (int) ($aggregated->void_count ?? 0);
        }

        $transactions = CashTransaction::with(['category', 'creator', 'voider'])
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->latest('transaction_date')
            ->latest('id')
            ->paginate(15);

        $categories = CashCategory::where('is_active', true)->get();

        return Inertia::render('Kas/Dashboard', [
            'stats' => $stats,
            'transactions' => $transactions,
            'categories' => $categories,
        ]);
    }
}
