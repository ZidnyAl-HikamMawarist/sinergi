<?php

namespace App\Http\Controllers\Eskul;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ActivitySession;
use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ActivitySessionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'extracurricular_id' => ['required', 'exists:extracurriculars,id'],
            'title' => ['required', 'string', 'max:255'],
            'session_date' => ['required', 'date'],
            'start_time' => ['required'],
            'end_time' => ['required'],
        ]);

        $activeYear = AcademicYear::active();
        if (!$activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $user = $request->user();
        $eskulId = (int) $request->input('extracurricular_id');

        if (!$user->canManageExtracurricular($eskulId, $activeYear->id)) {
            abort(403, 'Anda tidak memiliki hak akses membuat sesi untuk ekstrakurikuler ini.');
        }

        $session = ActivitySession::create([
            'extracurricular_id' => $request->input('extracurricular_id'),
            'academic_year_id' => $activeYear->id,
            'title' => $request->input('title'),
            'session_date' => $request->input('session_date'),
            'start_time' => $request->input('start_time'),
            'end_time' => $request->input('end_time'),
            'status' => 'dibuka',
            'opened_at' => now(),
            'created_by' => auth()->id(),
        ]);

        AuditLog::record(
            action: 'create_session',
            entityType: 'ActivitySession',
            entityId: $session->id,
            newValues: ['title' => $session->title, 'status' => 'dibuka'],
            userId: auth()->id()
        );

        return back()->with('success', "Sesi kegiatan '{$session->title}' berhasil dibuka. Presensi siap dipindai.");
    }
}
