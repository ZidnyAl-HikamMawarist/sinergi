<?php

namespace App\Http\Controllers\Eskul;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\Extracurricular;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EskulDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        // Determine accessible extracurriculars for the user
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

        $myEskuls = $eskulQuery->withCount(['members' => function ($q) use ($yearId) {
            $q->where('academic_year_id', $yearId)->whereNull('left_at');
        }])->get();

        $eskulIds = $myEskuls->pluck('id');

        $activeSessions = ActivitySession::with(['extracurricular', 'attendances'])
            ->whereIn('extracurricular_id', $eskulIds)
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->where('status', 'dibuka')
            ->latest()
            ->get();

        $recentSessions = ActivitySession::with(['extracurricular'])
            ->withCount('attendances')
            ->whereIn('extracurricular_id', $eskulIds)
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->latest('session_date')
            ->take(5)
            ->get();

        return Inertia::render('Eskul/Dashboard', [
            'myEskuls' => $myEskuls,
            'activeSessions' => $activeSessions,
            'recentSessions' => $recentSessions,
        ]);
    }
}
