<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class OsisProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'academic_year_id',
        'osis_sekbid_id',
        'name',
        'description',
        'target_audience',
        'start_date',
        'end_date',
        'estimated_budget',
        'status',
        'pic_user_id',
        'approval_note',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'estimated_budget' => 'integer',
        'approved_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (OsisProgram $program) {
            if (empty($program->uuid)) {
                $program->uuid = (string) Str::uuid();
            }
        });
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function sekbid(): BelongsTo
    {
        return $this->belongsTo(OsisSekbid::class, 'osis_sekbid_id');
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForYear(Builder $query, ?int $yearId): Builder
    {
        return $yearId ? $query->where('academic_year_id', $yearId) : $query;
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->whereIn('status', ['disetujui', 'berjalan', 'terlaksana']);
    }
}
