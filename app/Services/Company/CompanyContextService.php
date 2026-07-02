<?php

namespace App\Services\Company;

use App\Enums\RoleSlug;
use App\Models\Company;
use App\Models\User;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Session\Store;

class CompanyContextService
{
    protected ?Company $resolvedCompany = null;

    public function __construct(
        protected CompanyRepositoryInterface $companyRepository,
    ) {}

    public function sessionKey(): string
    {
        return config('ledgerflow.session.company_id');
    }

    public function getSessionCompanyId(Store $session): ?int
    {
        $companyId = $session->get($this->sessionKey());

        return is_numeric($companyId) ? (int) $companyId : null;
    }

    public function hasSelectedCompany(Store $session): bool
    {
        return $this->getSessionCompanyId($session) !== null;
    }

    /**
     * @return Collection<int, Company>
     */
    public function accessibleCompanies(User $user): Collection
    {
        if ($user->isSuperAdmin()) {
            return $this->companyRepository->allActive();
        }

        return $user->companies()
            ->where('companies.is_active', true)
            ->orderBy('companies.name')
            ->get();
    }

    public function userCanAccessCompany(User $user, int $companyId): bool
    {
        if (! $user->belongsToCompany($companyId)) {
            return false;
        }

        $company = $this->companyRepository->find($companyId);

        return $company !== null && $company->is_active;
    }

    public function setSessionCompany(User $user, int $companyId, Store $session): Company
    {
        if (! $this->userCanAccessCompany($user, $companyId)) {
            throw new \InvalidArgumentException('You do not have access to the selected company.');
        }

        $company = $this->companyRepository->findOrFail($companyId);

        $session->put($this->sessionKey(), $company->id);

        $this->applyContext($company);

        return $company;
    }

    public function clearSessionCompany(Store $session): void
    {
        $session->forget($this->sessionKey());

        $this->resolvedCompany = null;
        CompanyContext::clear();
    }

    /**
     * Load company from session, validate access, and bootstrap CompanyContext.
     */
    public function bootstrapFromSession(User $user, Store $session): ?int
    {
        CompanyContext::clear();
        $this->resolvedCompany = null;

        $companyId = $this->getSessionCompanyId($session);

        if ($companyId === null) {
            return null;
        }

        if (! $this->userCanAccessCompany($user, $companyId)) {
            $this->clearSessionCompany($session);

            return null;
        }

        $company = $this->companyRepository->find($companyId);

        if ($company === null) {
            $this->clearSessionCompany($session);

            return null;
        }

        $this->applyContext($company);

        return $company->id;
    }

    /**
     * Called immediately after login to auto-select when unambiguous.
     */
    public function initializeAfterLogin(User $user, Store $session): ?int
    {
        $this->clearSessionCompany($session);

        $accessible = $this->accessibleCompanies($user);

        if ($accessible->isEmpty()) {
            return null;
        }

        $defaultCompany = $user->defaultCompany();

        if ($defaultCompany !== null
            && $accessible->contains('id', $defaultCompany->id)
            && $this->userCanAccessCompany($user, $defaultCompany->id)) {
            return $this->setSessionCompany($user, $defaultCompany->id, $session)->id;
        }

        if ($accessible->count() === 1) {
            return $this->setSessionCompany($user, $accessible->first()->id, $session)->id;
        }

        return null;
    }

    /**
     * Attempt to select a company for the current session without user interaction.
     */
    public function ensureSelectedCompany(User $user, Store $session): bool
    {
        if ($this->hasSelectedCompany($session) && CompanyContext::has()) {
            return true;
        }

        return $this->initializeAfterLogin($user, $session) !== null
            || $this->selectSingleAccessibleCompany($user, $session);
    }

    /**
     * Auto-select when the user only has one accessible company.
     */
    public function selectSingleAccessibleCompany(User $user, Store $session): bool
    {
        $accessible = $this->accessibleCompanies($user);

        if ($accessible->count() !== 1) {
            return false;
        }

        $this->setSessionCompany($user, $accessible->first()->id, $session);

        return true;
    }

    public function currentCompany(): ?Company
    {
        if ($this->resolvedCompany !== null) {
            return $this->resolvedCompany;
        }

        $companyId = CompanyContext::id();

        if ($companyId === null) {
            return null;
        }

        $this->resolvedCompany = $this->companyRepository->find($companyId);

        return $this->resolvedCompany;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function currentCompanyPayload(?User $user = null): ?array
    {
        $company = $this->currentCompany();

        if ($company === null) {
            return null;
        }

        return [
            'id' => $company->id,
            'uuid' => $company->uuid,
            'name' => $company->name,
            'currency_code' => $company->currency_code,
            'role' => $user?->roleSlugForCompany($company->id)?->value,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function accessibleCompaniesPayload(User $user): array
    {
        return $this->accessibleCompanies($user)
            ->map(fn (Company $company) => [
                'id' => $company->id,
                'uuid' => $company->uuid,
                'name' => $company->name,
                'currency_code' => $company->currency_code,
                'role' => $user->roleSlugForCompany($company->id)?->value ?? (
                    $user->isSuperAdmin() ? RoleSlug::SuperAdmin->value : null
                ),
            ])
            ->values()
            ->all();
    }

    protected function applyContext(Company $company): void
    {
        $this->resolvedCompany = $company;
        CompanyContext::set($company->id);
    }
}
