<?php

namespace App\Models;

use App\Enums\RoleSlug;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_super_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'company_users')
            ->using(CompanyUser::class)
            ->withPivot(['role_id', 'is_default'])
            ->withTimestamps();
    }

    public function companyUsers(): HasMany
    {
        return $this->hasMany(CompanyUser::class);
    }

    public function isSuperAdmin(): bool
    {
        return (bool) $this->is_super_admin;
    }

    public function belongsToCompany(int $companyId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->companyUsers()
            ->where('company_id', $companyId)
            ->exists();
    }

    public function roleSlugForCompany(?int $companyId = null): ?RoleSlug
    {
        if ($this->isSuperAdmin()) {
            return RoleSlug::SuperAdmin;
        }

        $companyId ??= CompanyContext::id();

        if ($companyId === null) {
            return null;
        }

        $membership = $this->companyUsers()
            ->with('role')
            ->where('company_id', $companyId)
            ->first();

        if ($membership === null || $membership->role === null) {
            return null;
        }

        return RoleSlug::tryFrom($membership->role->slug);
    }

    public function hasCompanyRole(RoleSlug ...$roles): bool
    {
        $currentRole = $this->roleSlugForCompany();

        if ($currentRole === null) {
            return false;
        }

        return in_array($currentRole, $roles, true);
    }

    public function canWriteAccounting(?int $companyId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $role = $this->roleSlugForCompany($companyId);

        return $role === RoleSlug::Accountant;
    }

    public function isReadOnlyInCompany(?int $companyId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return false;
        }

        return $this->roleSlugForCompany($companyId) === RoleSlug::Auditor;
    }

    public function defaultCompany(): ?Company
    {
        $membership = $this->companyUsers()
            ->with('company')
            ->where('is_default', true)
            ->first();

        return $membership?->company;
    }
}
