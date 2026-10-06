<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportBatchRow extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'import_batch_id',
        'row_number',
        'payload',
        'action',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'row_number' => 'integer',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ImportBatch::class, 'import_batch_id');
    }
}
