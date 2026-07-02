<?php

namespace App\Policies;

use App\Models\AccountingPeriod;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;

class AccountingPeriodPolicy
{
    use HandlesCompanyAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->companyUsers()->exists();
    }

    public function view(User $user, AccountingPeriod $accountingPeriod): bool
    {
        return $this->canAccessCompany($user, $accountingPeriod->company_id);
    }

    public function close(User $user, AccountingPeriod $accountingPeriod): bool
    {
        return $this->canWriteAccounting($user, $accountingPeriod->company_id)
            && $this->canAccessCompany($user, $accountingPeriod->company_id);
    }

    public function lock(User $user, AccountingPeriod $accountingPeriod): bool
    {
        return $this->isSuperAdmin($user)
            && $this->canAccessCompany($user, $accountingPeriod->company_id);
    }

    public function reopen(User $user, AccountingPeriod $accountingPeriod): bool
    {
        return $this->isSuperAdmin($user)
            && $this->canAccessCompany($user, $accountingPeriod->company_id);
    }
}
