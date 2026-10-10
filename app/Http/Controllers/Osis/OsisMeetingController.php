<?php

namespace App\Http\Controllers\Osis;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\OsisMeeting;
use App\Models\OsisSekbid;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OsisMeetingController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $type = $request->query('type');
        $status = $request->query('status');

        $query = OsisMeeting::with(['sekbid', 'creator'])
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId));

        if ($type && in_array($type, ['pleno', 'presidium', 'koordinasi_sekbid', 'evaluasi'])) {
            $query->where('meeting_type', $type);
        }

        if ($status && in_array($status, ['dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan'])) {
            $query->where('status', $status);
        }

        $meetings = $query->orderBy('meeting_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(15)
            ->withQueryString();

        $sekbids = OsisSekbid::where('is_active', true)->orderBy('number')->get();

        $stats = [
            'total' => OsisMeeting::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->count(),
            'dijadwalkan' => OsisMeeting::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->where('status', 'dijadwalkan')->count(),
            'selesai' => OsisMeeting::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->where('status', 'selesai')->count(),
        ];

        return Inertia::render('Osis/Agenda/Index', [
            'meetings' => $meetings,
            'sekbids' => $sekbids,
            'stats' => $stats,
            'filters' => [
                'type' => $type ?? 'all',
                'status' => $status ?? 'all',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'meeting_type' => ['required', 'in:pleno,presidium,koordinasi_sekbid,evaluasi'],
            'osis_sekbid_id' => ['nullable', 'exists:osis_sekbids,id'],
            'meeting_date' => ['required', 'date'],
            'start_time' => ['required', 'string', 'max:10'],
            'end_time' => ['nullable', 'string', 'max:10'],
            'location' => ['required', 'string', 'max:100'],
            'agenda_description' => ['nullable', 'string', 'max:1000'],
        ], [
            'title.required' => 'Judul rapat atau agenda wajib diisi.',
            'meeting_type.required' => 'Tipe pertemuan wajib dipilih.',
            'meeting_date.required' => 'Tanggal pelaksanaan rapat wajib diisi.',
            'start_time.required' => 'Waktu mulai rapat wajib diisi.',
            'location.required' => 'Lokasi rapat wajib diisi.',
        ]);

        $activeYear = AcademicYear::active();
        if (! $activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $meeting = OsisMeeting::create([
            'academic_year_id' => $activeYear->id,
            'osis_sekbid_id' => $request->input('osis_sekbid_id'),
            'title' => $request->input('title'),
            'meeting_type' => $request->input('meeting_type'),
            'meeting_date' => $request->input('meeting_date'),
            'start_time' => $request->input('start_time'),
            'end_time' => $request->input('end_time'),
            'location' => $request->input('location'),
            'agenda_description' => $request->input('agenda_description'),
            'status' => 'dijadwalkan',
            'created_by' => $request->user()->id,
        ]);

        AuditLog::record(
            action: 'schedule_osis_meeting',
            entityType: 'OsisMeeting',
            entityId: $meeting->id,
            newValues: [
                'title' => $meeting->title,
                'meeting_type' => $meeting->meeting_type,
                'meeting_date' => $meeting->meeting_date,
            ],
            userId: $request->user()->id
        );

        return back()->with('success', 'Agenda rapat internal OSIS berhasil dijadwalkan.');
    }

    public function updateMinutes(Request $request, string $uuid): RedirectResponse
    {
        $request->validate([
            'minutes_of_meeting' => ['required', 'string', 'max:5000'],
            'status' => ['nullable', 'in:selesai,berlangsung'],
        ], [
            'minutes_of_meeting.required' => 'Notulensi hasil rapat wajib diisi.',
        ]);

        $meeting = OsisMeeting::where('uuid', $uuid)->firstOrFail();
        $status = $request->input('status', 'selesai');

        $meeting->update([
            'minutes_of_meeting' => $request->input('minutes_of_meeting'),
            'status' => $status,
        ]);

        AuditLog::record(
            action: 'update_meeting_minutes',
            entityType: 'OsisMeeting',
            entityId: $meeting->id,
            newValues: [
                'status' => $meeting->status,
            ],
            userId: $request->user()->id
        );

        return back()->with('success', 'Notulensi rapat berhasil disimpan.');
    }
}
