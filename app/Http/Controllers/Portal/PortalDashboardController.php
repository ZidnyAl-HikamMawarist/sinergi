<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\ExtracurricularMember;
use App\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalDashboardController extends Controller
{
    public function __construct(
        protected QrTokenService $qrTokenService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $user->load([
            'profile',
            'enrollments' => fn ($q) => $q->when($yearId, fn ($sq) => $sq->where('academic_year_id', $yearId))->with('schoolClass'),
        ]);

        $memberships = ExtracurricularMember::with('extracurricular')
            ->where('user_id', $user->id)
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->whereNull('left_at')
            ->get();

        $recentAttendances = Attendance::with(['activitySession.extracurricular'])
            ->where('user_id', $user->id)
            ->latest('recorded_at')
            ->take(10)
            ->get();

        $qrData = $this->qrTokenService->generateToken($user);

        return Inertia::render('Portal/Dashboard', [
            'student' => $user,
            'memberships' => $memberships,
            'recentAttendances' => $recentAttendances,
            'initialQr' => $qrData,
        ]);
    }

    public function getFreshQrToken(Request $request): JsonResponse
    {
        $qrData = $this->qrTokenService->generateToken($request->user());
        return response()->json($qrData);
    }
}
