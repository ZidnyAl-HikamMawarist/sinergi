<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Letter extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'academic_year_id',
        'type',
        'reference_number',
        'classification_code',
        'sender_or_recipient',
        'subject',
        'letter_date',
        'received_or_sent_date',
        'description',
        'status',
        'file_path',
        'file_name',
        'file_size',
        'file_mime',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'letter_date' => 'date',
        'received_or_sent_date' => 'date',
        'file_size' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Letter $letter) {
            if (empty($letter->uuid)) {
                $letter->uuid = (string) Str::uuid();
            }
        });
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeMasuk(Builder $query): Builder
    {
        return $query->where('type', 'masuk');
    }

    public function scopeKeluar(Builder $query): Builder
    {
        return $query->where('type', 'keluar');
    }

    public function scopeForYear(Builder $query, ?int $yearId): Builder
    {
        return $yearId ? $query->where('academic_year_id', $yearId) : $query;
    }

    /**
     * Generate standard official OSIS outgoing letter reference number.
     * Format: [NomorUrut]/OSIS/[KodeKlasifikasi]/[BulanRomawi]/[Tahun]
     * Contoh: 001/OSIS/UND/X/2026
     */
    public static function generateNextReferenceNumber(int $yearId, string $classification = 'UND', ?\DateTimeInterface $date = null): string
    {
        $targetDate = $date ?? now();
        $year = (int) $targetDate->format('Y');
        $month = (int) $targetDate->format('n');

        $romanNumerals = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];
        $romanMonth = $romanNumerals[$month] ?? 'I';

        $code = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $classification) ?: 'UND');

        // Count existing outgoing letters in this academic year
        $count = static::where('academic_year_id', $yearId)
            ->where('type', 'keluar')
            ->count();

        $seq = $count + 1;

        return sprintf('%03d/OSIS/%s/%s/%d', $seq, $code, $romanMonth, $year);
    }
}
