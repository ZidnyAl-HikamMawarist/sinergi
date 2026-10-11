<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'uuid',
        'nisn',
        'name',
        'email',
        'password',
        'status',
        'must_change_password',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'must_change_password' => 'boolean',
            'password' => 'hashed',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (User $user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    public function profile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->withPivot(['id', 'academic_year_id', 'extracurricular_id', 'osis_sekbid_id', 'assigned_by'])
            ->withTimestamps();
    }

    public function extracurricularMemberships(): HasMany
    {
        return $this->hasMany(ExtracurricularMember::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function getActiveRoles(?int $academicYearId = null)
    {
        $query = $this->roles();

        if ($academicYearId) {
            $query->wherePivot('academic_year_id', $academicYearId);
        } else {
            $activeYear = AcademicYear::where('is_active', true)->first();
            if ($activeYear) {
                $query->wherePivot('academic_year_id', $activeYear->id);
            }
        }

        return $query->get();
    }

    public function hasRole(string|array $roleName, ?int $academicYearId = null, ?int $eskulId = null): bool
    {
        $roles = is_array($roleName) ? $roleName : [$roleName];
        $activeRoles = $this->getActiveRoles($academicYearId);

        foreach ($activeRoles as $role) {
            if (in_array($role->name, $roles)) {
                if ($eskulId !== null && $role->pivot->extracurricular_id !== null) {
                    if ($role->pivot->extracurricular_id === $eskulId) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }

        return false;
    }

    public function isSuperAdmin(): bool
    {
        return $this->roles()->where('name', 'super_admin')->exists();
    }

    public function isAdmin(?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('admin', $academicYearId);
    }

    public function isBendahara(?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('bendahara', $academicYearId);
    }

    public function isKetuaOsis(?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('ketua_osis', $academicYearId);
    }

    public function isWakilKetuaOsis(?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('wakil_ketua_osis', $academicYearId);
    }

    public function isPresidiumOsis(?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole(['ketua_osis', 'wakil_ketua_osis', 'admin'], $academicYearId);
    }

    public function isSekretarisOsis(?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('sekretaris_osis', $academicYearId);
    }

    public function isKetuaSekbid(?int $sekbidId = null, ?int $academicYearId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $activeRoles = $this->getActiveRoles($academicYearId);
        foreach ($activeRoles as $role) {
            if ($role->name === 'ketua_sekbid') {
                if ($sekbidId !== null) {
                    if ((int) $role->pivot->osis_sekbid_id === (int) $sekbidId) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }

        return false;
    }

    public function isSekretarisSekbid(?int $sekbidId = null, ?int $academicYearId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $activeRoles = $this->getActiveRoles($academicYearId);
        foreach ($activeRoles as $role) {
            if ($role->name === 'sekretaris_sekbid') {
                if ($sekbidId !== null) {
                    if ((int) $role->pivot->osis_sekbid_id === (int) $sekbidId) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }

        return false;
    }

    public function isAnggotaOsis(?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole(['anggota_osis', 'ketua_osis', 'wakil_ketua_osis', 'sekretaris_osis', 'bendahara', 'ketua_sekbid', 'sekretaris_sekbid'], $academicYearId);
    }

    public function isPengurusEskul(?int $eskulId = null, ?int $academicYearId = null): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('pengurus_eskul', $academicYearId, $eskulId);
    }

    public function canManageExtracurricular(int $eskulId, ?int $academicYearId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isAdmin($academicYearId)) {
            return true;
        }

        $query = $this->roles()
            ->where('roles.name', 'pengurus_eskul')
            ->wherePivot('extracurricular_id', $eskulId);

        if ($academicYearId) {
            $query->wherePivot('academic_year_id', $academicYearId);
        }

        return $query->exists();
    }

    public function isSiswa(?int $academicYearId = null): bool
    {
        return $this->hasRole('siswa', $academicYearId) || ! empty($this->nisn);
    }
}
