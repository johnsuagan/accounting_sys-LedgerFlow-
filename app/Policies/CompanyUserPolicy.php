<?php

namespace App\Policies;

use App\Models\CompanyUser;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;

class CompanyUserPolicy
{
    use HandlesCompanyAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function view(User $user, CompanyUser $companyUser): bool
    {
        return $this->isSuperAdmin($user)
            || $user->id === $companyUser->user_id
            || $this->canAccessCompany($user, $companyUser->company_id);
    }

    public function create(User $user): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function update(User $user, CompanyUser $companyUser): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function delete(User $user, CompanyUser $companyUser): bool
    {
        return $this->isSuperAdmin($user);
    }
}
