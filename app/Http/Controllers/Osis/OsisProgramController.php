<?php

namespace App\Http\Controllers\Osis;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\OsisProgram;
use App\Models\OsisSekbid;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OsisProgramController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $sekbidId = $request->query('sekbid_id');
        $status = $request->query('status');
        $search = $request->query('search');

        $query = OsisProgram::with(['sekbid', 'pic', 'approver', 'creator'])
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId));

        if ($sekbidId) {
            $query->where('osis_sekbid_id', $sekbidId);
        }

        if ($status && in_array($status, ['draft', 'diajukan', 'disetujui', 'berjalan', 'terlaksana', 'dibatalkan'])) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('target_audience', 'like', "%{$search}%");
            });
        }

        $programs = $query->orderBy('start_date')
            ->paginate(15)
            ->withQueryString();

        $sekbids = OsisSekbid::where('is_active', true)->orderBy('number')->get();

        $stats = [
            'total' => OsisProgram::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->count(),
            'disetujui' => OsisProgram::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->where('status', 'disetujui')->count(),
            'diajukan' => OsisProgram::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->where('status', 'diajukan')->count(),
            'terlaksana' => OsisProgram::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->where('status', 'terlaksana')->count(),
        ];

        return Inertia::render('Osis/Program/Index', [
            'programs' => $programs,
            'sekbids' => $sekbids,
            'stats' => $stats,
            'filters' => [
                'sekbid_id' => $sekbidId ?? '',
                'status' => $status ?? 'all',
                'search' => $search ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'osis_sekbid_id' => ['required', 'exists:osis_sekbids,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1500'],
            'target_audience' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'estimated_budget' => ['required', 'integer', 'min:0', 'max:1000000000'],
        ], [
            'osis_sekbid_id.required' => 'Seksi bidang wajib dipilih.',
            'name.required' => 'Nama program kerja wajib diisi.',
            'description.required' => 'Deskripsi program kerja wajib diisi.',
            'target_audience.required' => 'Sasaran peserta kegiatan wajib diisi.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'estimated_budget.min' => 'Estimasi anggaran tidak boleh bernilai negatif.',
        ]);

        $activeYear = AcademicYear::active();
        if (! $activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $user = $request->user();

        // Default initial status: diajukan (langsung diajukan ke Presidium)
        $program = OsisProgram::create([
            'academic_year_id' => $activeYear->id,
            'osis_sekbid_id' => $request->input('osis_sekbid_id'),
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'target_audience' => $request->input('target_audience'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'estimated_budget' => $request->input('estimated_budget'),
            'status' => 'diajukan',
            'pic_user_id' => $user->id,
            'created_by' => $user->id,
        ]);

        AuditLog::record(
            action: 'create_osis_program',
            entityType: 'OsisProgram',
            entityId: $program->id,
            newValues: [
                'name' => $program->name,
                'osis_sekbid_id' => $program->osis_sekbid_id,
                'status' => $program->status,
            ],
            userId: $user->id
        );

        return back()->with('success', 'Program kerja berhasil didaftarkan dan diajukan ke Presidium OSIS.');
    }

    public function approve(Request $request, string $uuid): RedirectResponse
    {
        $request->validate([
            'decision' => ['required', 'in:disetujui,dibatalkan'],
            'approval_note' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $activeYear = AcademicYear::active();

        // Only Presidium (Ketua/Wakil) or Admin Sekolah can approve
        if (! $user->isPresidiumOsis($activeYear?->id) && ! $user->isAdmin($activeYear?->id)) {
            abort(403, 'Hanya Presidium OSIS atau Admin Sekolah yang berhak menyetujui program kerja.');
        }

        $program = OsisProgram::where('uuid', $uuid)->firstOrFail();
        $oldStatus = $program->status;
        $decision = $request->input('decision');

        $program->update([
            'status' => $decision,
            'approval_note' => $request->input('approval_note'),
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        AuditLog::record(
            action: 'review_osis_program',
            entityType: 'OsisProgram',
            entityId: $program->id,
            oldValues: ['status' => $oldStatus],
            newValues: [
                'status' => $program->status,
                'approval_note' => $program->approval_note,
                'approved_by' => $user->id,
            ],
            userId: $user->id
        );

        $statusText = $decision === 'disetujui' ? 'disetujui' : 'ditolak/dibatalkan';

        return back()->with('success', "Program kerja '{$program->name}' berhasil {$statusText}.");
    }

    public function updateStatus(Request $request, string $uuid): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:berjalan,terlaksana,dibatalkan'],
        ]);

        $program = OsisProgram::where('uuid', $uuid)->firstOrFail();
        $oldStatus = $program->status;

        $program->update([
            'status' => $request->input('status'),
        ]);

        AuditLog::record(
            action: 'update_osis_program_status',
            entityType: 'OsisProgram',
            entityId: $program->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $program->status],
            userId: $request->user()->id
        );

        return back()->with('success', "Status program kerja diperbarui menjadi {$program->status}.");
    }
}
