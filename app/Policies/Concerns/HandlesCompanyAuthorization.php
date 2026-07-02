<?php

namespace App\Policies\Concerns;

use App\Models\Company;
use App\Models\User;
use App\Support\CompanyContext;

trait HandlesCompanyAuthorization
{
    protected function isSuperAdmin(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    protected function canAccessCompany(User $user, Company|int|null $company): bool
    {
        if ($company === null) {
            return false;
        }

        $companyId = $company instanceof Company ? $company->id : $company;

        return $user->belongsToCompany($companyId);
    }

    protected function canWriteAccounting(User $user, Company|int|null $company = null): bool
    {
        if ($this->isSuperAdmin($user)) {
            return true;
        }

        $companyId = $this->resolveCompanyId($company);

        return $user->canWriteAccounting($companyId);
    }

    protected function isReadOnly(User $user, Company|int|null $company = null): bool
    {
        if ($this->isSuperAdmin($user)) {
            return false;
        }

        $companyId = $this->resolveCompanyId($company);

        return $user->isReadOnlyInCompany($companyId);
    }

    protected function resolveCompanyId(Company|int|null $company = null): ?int
    {
        if ($company instanceof Company) {
            return $company->id;
        }

        if (is_int($company)) {
            return $company;
        }

        return CompanyContext::id();
    }
}
