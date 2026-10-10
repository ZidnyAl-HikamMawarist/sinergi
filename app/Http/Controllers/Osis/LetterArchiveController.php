<?php

namespace App\Http\Controllers\Osis;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\Letter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LetterArchiveController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::active();
        $yearId = $activeYear?->id;

        $type = $request->query('type');
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Letter::with(['creator', 'approver'])
            ->when($yearId, fn ($q) => $q->where('academic_year_id', $yearId));

        if ($type && in_array($type, ['masuk', 'keluar'])) {
            $query->where('type', $type);
        }

        if ($status && in_array($status, ['draft', 'diajukan', 'disetujui', 'diarsipkan'])) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('sender_or_recipient', 'like', "%{$search}%")
                    ->orWhere('classification_code', 'like', "%{$search}%");
            });
        }

        $letters = $query->latest('letter_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => Letter::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->count(),
            'masuk' => Letter::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->where('type', 'masuk')->count(),
            'keluar' => Letter::when($yearId, fn ($q) => $q->where('academic_year_id', $yearId))->where('type', 'keluar')->count(),
        ];

        $suggestedReference = $yearId
            ? Letter::generateNextReferenceNumber($yearId, 'UND')
            : '001/OSIS/UND/X/'.date('Y');

        return Inertia::render('Osis/Arsip/Index', [
            'letters' => $letters,
            'stats' => $stats,
            'filters' => [
                'type' => $type ?? 'all',
                'search' => $search ?? '',
                'status' => $status ?? 'all',
            ],
            'suggestedReference' => $suggestedReference,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:masuk,keluar'],
            'reference_number' => ['required', 'string', 'max:100'],
            'classification_code' => ['nullable', 'string', 'max:20'],
            'sender_or_recipient' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'letter_date' => ['required', 'date'],
            'received_or_sent_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:draft,diajukan,disetujui,diarsipkan'],
            'file' => ['nullable', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:5120'], // Max 5MB
        ], [
            'reference_number.required' => 'Nomor surat wajib diisi.',
            'sender_or_recipient.required' => 'Asal pengirim atau tujuan surat wajib diisi.',
            'subject.required' => 'Perihal surat wajib diisi.',
            'letter_date.required' => 'Tanggal surat wajib diisi.',
            'received_or_sent_date.required' => 'Tanggal terima atau tanggal kirim wajib diisi.',
            'file.mimes' => 'Format berkas harus berupa PDF, JPG, atau PNG.',
            'file.max' => 'Ukuran berkas maksimal 5 MB.',
        ]);

        $activeYear = AcademicYear::active();
        if (! $activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $filePath = null;
        $fileName = null;
        $fileSize = null;
        $fileMime = null;

        if ($request->hasFile('file')) {
            $uploaded = $request->file('file');
            $filePath = $uploaded->store('letters', 'local');
            $fileName = $uploaded->getClientOriginalName();
            $fileSize = $uploaded->getSize();
            $fileMime = $uploaded->getMimeType();
        }

        $user = $request->user();
        $isApprover = $user->isSekretarisOsis($activeYear->id)
            || $user->isPresidiumOsis($activeYear->id)
            || $user->isAdmin($activeYear->id);

        $status = $request->input('status');
        if (! $status) {
            $status = $request->input('type') === 'masuk' ? 'diarsipkan' : ($isApprover ? 'disetujui' : 'diajukan');
        } elseif (! $isApprover && in_array($status, ['disetujui', 'diarsipkan'])) {
            $status = 'diajukan';
        }

        $letter = Letter::create([
            'academic_year_id' => $activeYear->id,
            'type' => $request->input('type'),
            'reference_number' => $request->input('reference_number'),
            'classification_code' => $request->input('classification_code'),
            'sender_or_recipient' => $request->input('sender_or_recipient'),
            'subject' => $request->input('subject'),
            'letter_date' => $request->input('letter_date'),
            'received_or_sent_date' => $request->input('received_or_sent_date'),
            'description' => $request->input('description'),
            'status' => $status,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'file_mime' => $fileMime,
            'created_by' => $user->id,
            'approved_by' => in_array($status, ['disetujui', 'diarsipkan']) ? $user->id : null,
        ]);

        AuditLog::record(
            action: 'create_letter',
            entityType: 'Letter',
            entityId: $letter->id,
            newValues: [
                'type' => $letter->type,
                'reference_number' => $letter->reference_number,
                'subject' => $letter->subject,
                'status' => $letter->status,
            ],
            userId: $user->id
        );

        return back()->with('success', 'Surat berhasil dicatat ke dalam E-Arsip OSIS.');
    }

    public function generateReferenceNumber(Request $request): JsonResponse
    {
        $classification = $request->query('classification', 'UND');
        $activeYear = AcademicYear::active();

        if (! $activeYear) {
            return response()->json(['reference_number' => '001/OSIS/'.strtoupper($classification).'/'.date('m/Y')]);
        }

        $ref = Letter::generateNextReferenceNumber($activeYear->id, $classification);

        return response()->json([
            'reference_number' => $ref,
            'classification' => strtoupper($classification),
        ]);
    }

    public function showFile(Request $request, string $uuid)
    {
        $letter = Letter::where('uuid', $uuid)->firstOrFail();

        if (! $letter->file_path || ! Storage::disk('local')->exists($letter->file_path)) {
            abort(404, 'Berkas surat tidak ditemukan.');
        }

        return Storage::disk('local')->response(
            $letter->file_path,
            $letter->file_name ?? basename($letter->file_path),
            [
                'Content-Type' => $letter->file_mime ?? 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
                'Content-Security-Policy' => "default-src 'none'",
            ]
        );
    }

    public function updateStatus(Request $request, string $uuid): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:draft,diajukan,disetujui,diarsipkan'],
        ]);

        $user = $request->user();
        $activeYear = AcademicYear::active();
        $isAuthorized = $user->isSekretarisOsis($activeYear?->id)
            || $user->isPresidiumOsis($activeYear?->id)
            || $user->isAdmin($activeYear?->id);

        if (! $isAuthorized) {
            abort(403, 'Hanya Sekretaris OSIS, Presidium OSIS, atau Admin yang berhak memperbarui status arsip surat.');
        }

        $letter = Letter::where('uuid', $uuid)->firstOrFail();
        $oldStatus = $letter->status;

        $letter->update([
            'status' => $request->input('status'),
            'approved_by' => in_array($request->input('status'), ['disetujui', 'diarsipkan']) ? $user->id : $letter->approved_by,
        ]);

        AuditLog::record(
            action: 'update_letter_status',
            entityType: 'Letter',
            entityId: $letter->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $letter->status],
            userId: $user->id
        );

        return back()->with('success', "Status surat berhasil diperbarui menjadi {$letter->status}.");
    }
}
