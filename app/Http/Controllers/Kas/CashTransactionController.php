<?php

namespace App\Http\Controllers\Kas;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\CashCategory;
use App\Models\CashTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CashTransactionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:masuk,keluar'],
            'cash_category_id' => ['required', 'exists:cash_categories,id'],
            'amount' => ['required', 'integer', 'min:1000', 'max:1000000000'],
            'description' => ['required', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
            'proof' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'], // AC-E1, AC-E5 (max 5MB)
        ], [
            'proof.required' => 'Bukti transaksi wajib diunggah.',
            'proof.mimes' => 'Format bukti harus berupa JPG, PNG, atau PDF.',
            'proof.max' => 'Ukuran file bukti maksimal 5 MB.',
        ]);

        $activeYear = AcademicYear::active();
        if (! $activeYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif.');
        }

        $user = $request->user();
        if (! $user->isSuperAdmin() && ! $user->isAdmin($activeYear->id) && ! $user->isBendahara($activeYear->id)) {
            abort(403, 'Anda tidak memiliki hak akses mencatat transaksi kas pada tahun ajaran ini.');
        }

        // Validate that category matches the transaction type
        $category = CashCategory::where('id', $request->input('cash_category_id'))
            ->where('is_active', true)
            ->first();

        if (! $category || $category->type !== $request->input('type')) {
            return back()->withErrors(['cash_category_id' => 'Kategori kas tidak valid atau tidak sesuai dengan tipe transaksi.']);
        }

        $proofFile = $request->file('proof');
        $proofPath = $proofFile->store('receipts', 'local');

        $tx = CashTransaction::create([
            'academic_year_id' => $activeYear->id,
            'cash_category_id' => $category->id,
            'type' => $request->input('type'),
            'amount' => $request->input('amount'),
            'description' => $request->input('description'),
            'transaction_date' => $request->input('transaction_date'),
            'proof_path' => $proofPath,
            'proof_mime' => $proofFile->getMimeType() ?: 'application/octet-stream',
            'proof_size' => $proofFile->getSize(),
            'status' => 'valid',
            'created_by' => auth()->id(),
        ]);

        AuditLog::record(
            action: 'create_transaction',
            entityType: 'CashTransaction',
            entityId: $tx->id,
            newValues: [
                'type' => $tx->type,
                'amount' => $tx->amount,
                'category_id' => $tx->cash_category_id,
                'description' => $tx->description,
            ],
            userId: auth()->id()
        );

        return back()->with('success', 'Transaksi kas berhasil dicatat.');
    }

    public function void(Request $request, string $uuid): RedirectResponse
    {
        $request->validate([
            'void_reason' => ['required', 'string', 'min:5', 'max:255'],
        ], [
            'void_reason.required' => 'Alasan void transaksi wajib diisi.',
            'void_reason.min' => 'Alasan void minimal 5 karakter.',
        ]);

        $tx = CashTransaction::where('uuid', $uuid)->firstOrFail();
        $user = $request->user();

        if (! $user->isSuperAdmin() && ! $user->isAdmin($tx->academic_year_id) && ! $user->isBendahara($tx->academic_year_id)) {
            abort(403, 'Anda tidak memiliki hak akses membatalkan (void) transaksi pada tahun ajaran ini.');
        }

        if ($tx->status === 'void') {
            return back()->with('warning', 'Transaksi ini sudah pernah dibatalkan (void).');
        }

        $oldStatus = $tx->status;

        $tx->status = 'void';
        $tx->void_reason = $request->input('void_reason');
        $tx->voided_by = auth()->id();
        $tx->voided_at = now();
        $tx->save();

        AuditLog::record(
            action: 'void_transaction',
            entityType: 'CashTransaction',
            entityId: $tx->id,
            oldValues: ['status' => $oldStatus],
            newValues: [
                'status' => 'void',
                'void_reason' => $tx->void_reason,
                'voided_by' => $tx->voided_by,
            ],
            userId: auth()->id()
        );

        return back()->with('success', 'Transaksi berhasil di-void dan saldo telah dikoreksi.');
    }

    public function showProof(Request $request, string $uuid)
    {
        $tx = CashTransaction::where('uuid', $uuid)->firstOrFail();
        $user = $request->user();

        if (! $user->isSuperAdmin() && ! $user->isAdmin($tx->academic_year_id) && ! $user->isBendahara($tx->academic_year_id)) {
            abort(403, 'Anda tidak memiliki hak akses melihat bukti transaksi ini.');
        }

        if (! Storage::disk('local')->exists($tx->proof_path)) {
            abort(404, 'File bukti transaksi tidak ditemukan.');
        }

        return Storage::disk('local')->response(
            $tx->proof_path,
            basename($tx->proof_path),
            [
                'Content-Type' => $tx->proof_mime ?? 'application/octet-stream',
                'X-Content-Type-Options' => 'nosniff',
                'Content-Security-Policy' => "default-src 'none'",
            ]
        );
    }
}
