<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Extracurricular extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'status',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Extracurricular $eskul) {
            if (empty($eskul->uuid)) {
                $eskul->uuid = (string) Str::uuid();
            }
        });
    }

    public function members(): HasMany
    {
        return $this->hasMany(ExtracurricularMember::class);
    }

    public function activitySessions(): HasMany
    {
        return $this->hasMany(ActivitySession::class);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
