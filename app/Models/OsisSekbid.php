<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OsisSekbid extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'name',
        'short_title',
        'description',
        'official_duties',
        'coordinating_eskuls',
        'is_active',
    ];

    protected $casts = [
        'number' => 'integer',
        'official_duties' => 'array',
        'coordinating_eskuls' => 'array',
        'is_active' => 'boolean',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')
            ->withPivot(['id', 'academic_year_id', 'role_id', 'assigned_by'])
            ->withTimestamps();
    }
}
