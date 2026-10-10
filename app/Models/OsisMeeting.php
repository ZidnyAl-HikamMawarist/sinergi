<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class OsisMeeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'academic_year_id',
        'osis_sekbid_id',
        'title',
        'meeting_type',
        'meeting_date',
        'start_time',
        'end_time',
        'location',
        'agenda_description',
        'status',
        'minutes_of_meeting',
        'created_by',
    ];

    protected $casts = [
        'meeting_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (OsisMeeting $meeting) {
            if (empty($meeting->uuid)) {
                $meeting->uuid = (string) Str::uuid();
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForYear(Builder $query, ?int $yearId): Builder
    {
        return $yearId ? $query->where('academic_year_id', $yearId) : $query;
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('meeting_date', '>=', now()->toDateString())
            ->whereIn('status', ['dijadwalkan', 'berlangsung'])
            ->orderBy('meeting_date')
            ->orderBy('start_time');
    }
}
