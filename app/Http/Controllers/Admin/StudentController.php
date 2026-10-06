<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $classes = SchoolClass::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))
            ->withCount(['enrollments' => function ($q) use ($yearId) {
                $q->when($yearId, fn ($sq) => $sq->where('academic_year_id', $yearId));
            }])
            ->get();

        $selectedClassId = $request->query('class_id');
        $search = $request->query('search');
        $status = $request->query('status');

        $studentsQuery = User::whereHas('roles', fn ($q) => $q->where('name', 'siswa'))
            ->with([
                'profile',
                'enrollments' => function ($q) use ($yearId) {
                    $q->when($yearId, fn ($sq) => $sq->where('academic_year_id', $yearId))
                        ->with('schoolClass');
                },
                'extracurricularMemberships' => function ($q) use ($yearId) {
                    $q->when($yearId, fn ($sq) => $sq->where('academic_year_id', $yearId))
                        ->whereNull('left_at')
                        ->with('extracurricular');
                },
            ]);

        if ($selectedClassId) {
            $studentsQuery->whereHas('enrollments', function ($q) use ($selectedClassId, $yearId) {
                $q->where('class_id', $selectedClassId)
                    ->when($yearId, fn ($sq) => $sq->where('academic_year_id', $yearId));
            });
        }

        if ($search) {
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $studentsQuery->where('status', $status);
        }

        $students = $studentsQuery->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Students', [
            'classes' => $classes,
            'selectedClassId' => $selectedClassId ? (int) $selectedClassId : null,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
            'students' => $students,
        ]);
    }
}
