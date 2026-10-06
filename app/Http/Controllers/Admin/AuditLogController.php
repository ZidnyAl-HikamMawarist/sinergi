<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user')->latest('created_at');

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($dateFrom = $request->query('from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $logs = $query->paginate(25)->withQueryString();
        $users = User::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $logs,
            'users' => $users,
            'filters' => $request->only(['action', 'user_id', 'from', 'to']),
        ]);
    }
}
