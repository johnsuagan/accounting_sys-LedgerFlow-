<?php

namespace App\Http\Requests\Concerns;

use App\Models\Company;
use App\Models\User;
use App\Support\CompanyContext;

trait AuthorizesCompanyAccess
{
    protected function currentCompanyId(): ?int
    {
        $companyId = $this->input('company_id') ?? CompanyContext::id();

        return $companyId !== null ? (int) $companyId : null;
    }

    protected function userCanAccessCompany(?int $companyId = null): bool
    {
        /** @var User $user */
        $user = $this->user();
        $companyId ??= $this->currentCompanyId();

        return $companyId !== null && $user->belongsToCompany($companyId);
    }

    protected function userCanWriteAccounting(?int $companyId = null): bool
    {
        /** @var User $user */
        $user = $this->user();
        $companyId ??= $this->currentCompanyId();

        return $companyId !== null && $user->canWriteAccounting($companyId);
    }

    protected function companyExistsRule(): array
    {
        return ['required', 'integer', 'exists:companies,id'];
    }
}
