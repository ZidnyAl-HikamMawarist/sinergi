<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use RuntimeException;

class CashTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'academic_year_id',
        'cash_category_id',
        'type',
        'amount',
        'description',
        'transaction_date',
        'proof_path',
        'proof_mime',
        'proof_size',
        'status',
        'void_reason',
        'voided_by',
        'voided_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'transaction_date' => 'date',
            'voided_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (CashTransaction $tx) {
            if (empty($tx->uuid)) {
                $tx->uuid = (string) Str::uuid();
            }
        });

        // Enforce strict immutability: PRD AC-E2
        static::updating(function (CashTransaction $tx) {
            $dirty = $tx->getDirty();
            $allowedFields = ['status', 'void_reason', 'voided_by', 'voided_at', 'updated_at'];

            foreach (array_keys($dirty) as $field) {
                if (!in_array($field, $allowedFields)) {
                    throw new RuntimeException("Transaksi kas bersifat immutable. Kolom '{$field}' tidak dapat diubah.");
                }
            }

            // Only transition from valid to void is allowed
            if ($tx->isDirty('status')) {
                if ($tx->getOriginal('status') !== 'valid' || $tx->status !== 'void') {
                    throw new RuntimeException("Transisi status hanya diperbolehkan dari valid ke void.");
                }
            }
        });

        // Forbid deletion completely: PRD AC-E2
        static::deleting(function () {
            throw new RuntimeException("Transaksi kas tidak boleh dihapus. Gunakan prosedur void.");
        });
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CashCategory::class, 'cash_category_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function voider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
