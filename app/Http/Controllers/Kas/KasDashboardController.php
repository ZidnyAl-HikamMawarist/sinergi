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
            $stats['balance'] = (int) CashTransaction::where('academic_year_id', $yearId)
                ->where('status', 'valid')
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'masuk' THEN amount ELSE -amount END), 0) as balance")
                ->value('balance');

            $stats['totalIn'] = (int) CashTransaction::where('academic_year_id', $yearId)
                ->where('status', 'valid')
                ->where('type', 'masuk')
                ->sum('amount');

            $stats['totalOut'] = (int) CashTransaction::where('academic_year_id', $yearId)
                ->where('status', 'valid')
                ->where('type', 'keluar')
                ->sum('amount');

            $stats['validCount'] = CashTransaction::where('academic_year_id', $yearId)
                ->where('status', 'valid')
                ->count();

            $stats['voidCount'] = CashTransaction::where('academic_year_id', $yearId)
                ->where('status', 'void')
                ->count();
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
