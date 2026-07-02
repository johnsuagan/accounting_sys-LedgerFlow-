<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;

class CompanyPolicy
{
    use HandlesCompanyAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->companyUsers()->exists();
    }

    public function view(User $user, Company $company): bool
    {
        return $this->canAccessCompany($user, $company);
    }

    public function create(User $user): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function update(User $user, Company $company): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function delete(User $user, Company $company): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function restore(User $user, Company $company): bool
    {
        return $this->isSuperAdmin($user);
    }
}
