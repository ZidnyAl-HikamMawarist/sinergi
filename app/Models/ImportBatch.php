<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ImportBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'academic_year_id',
        'uploaded_by',
        'filename',
        'status',
        'total_rows',
        'new_rows',
        'updated_rows',
        'error_rows',
        'credentials_path',
        'credentials_downloaded_at',
        'committed_at',
    ];

    protected function casts(): array
    {
        return [
            'credentials_downloaded_at' => 'datetime',
            'committed_at' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (ImportBatch $batch) {
            if (empty($batch->uuid)) {
                $batch->uuid = (string) Str::uuid();
            }
        });
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function rows(): HasMany
    {
        return $this->hasMany(ImportBatchRow::class);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
