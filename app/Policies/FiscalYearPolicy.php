<?php

namespace App\Policies;

use App\Models\FiscalYear;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;

class FiscalYearPolicy
{
    use HandlesCompanyAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->companyUsers()->exists();
    }

    public function view(User $user, FiscalYear $fiscalYear): bool
    {
        return $this->canAccessCompany($user, $fiscalYear->company_id);
    }

    public function create(User $user): bool
    {
        return $this->canWriteAccounting($user);
    }

    public function update(User $user, FiscalYear $fiscalYear): bool
    {
        return $this->canWriteAccounting($user, $fiscalYear->company_id)
            && $this->canAccessCompany($user, $fiscalYear->company_id);
    }

    public function delete(User $user, FiscalYear $fiscalYear): bool
    {
        return $this->canWriteAccounting($user, $fiscalYear->company_id)
            && $this->canAccessCompany($user, $fiscalYear->company_id);
    }

    public function close(User $user, FiscalYear $fiscalYear): bool
    {
        return $this->update($user, $fiscalYear);
    }

    public function lock(User $user, FiscalYear $fiscalYear): bool
    {
        return $this->isSuperAdmin($user)
            && $this->canAccessCompany($user, $fiscalYear->company_id);
    }

    public function reopen(User $user, FiscalYear $fiscalYear): bool
    {
        return $this->isSuperAdmin($user)
            && $this->canAccessCompany($user, $fiscalYear->company_id);
    }
}
