<?php

namespace App\Services\Onboarding;

use App\Enums\AccountingPeriodStatus;
use App\Enums\FiscalYearStatus;
use App\Enums\RoleSlug;
use App\Models\AccountingPeriod;
use App\Models\Company;
use App\Models\FiscalYear;
use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use App\Repositories\Contracts\CompanyUserRepositoryInterface;
use App\Services\Accounting\ChartOfAccountService;
use App\Services\Company\CompanyContextService;
use Carbon\Carbon;
use Database\Seeders\StarterChartOfAccountsSeeder;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\DB;

class PracticeSetProvisioner
{
    public function __construct(
        protected CompanyRepositoryInterface $companyRepository,
        protected CompanyUserRepositoryInterface $companyUserRepository,
        protected CompanyContextService $companyContextService,
        protected ChartOfAccountService $chartOfAccountService,
    ) {}

    public function userHasPracticeSet(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return $this->companyContextService->accessibleCompanies($user)->isNotEmpty();
        }

        return $user->companyUsers()->exists();
    }

    /**
     * Ensure the student has a practice set and active company in session.
     */
    public function ensureWorkspace(User $user, Store $session, ?string $companyName = null, ?string $businessType = null): Company
    {
        if (! $this->userHasPracticeSet($user) && ! $user->isSuperAdmin()) {
            return $this->provisionForUser($user, $session, $companyName, $businessType);
        }

        if ($this->companyContextService->hasSelectedCompany($session)) {
            $companyId = $this->companyContextService->getSessionCompanyId($session);
            $company = $companyId !== null ? $this->companyRepository->find($companyId) : null;

            if ($company !== null) {
                return $company;
            }
        }

        $initialized = $this->companyContextService->initializeAfterLogin($user, $session);

        if ($initialized !== null) {
            return $this->companyRepository->findOrFail($initialized);
        }

        $company = $user->defaultCompany() ?? $user->companies()->first();

        if ($company !== null) {
            $this->companyContextService->setSessionCompany($user, $company->id, $session);

            return $company;
        }

        return $this->provisionForUser($user, $session, $companyName, $businessType);
    }

    /**
     * Create a student practice set or return an existing default workspace.
     */
    public function provisionForUser(User $user, Store $session, ?string $companyName = null, ?string $businessType = null): Company
    {
        if ($this->userHasPracticeSet($user)) {
            $company = $user->defaultCompany() ?? $user->companies()->first();

            if ($company !== null) {
                $this->companyContextService->setSessionCompany($user, $company->id, $session);

                return $company;
            }
        }

        return DB::transaction(function () use ($user, $session, $companyName, $businessType) {
            $company = $this->createPracticeSetCompany($user, $companyName, $businessType);
            $this->assignAccountantRole($user, $company);
            $this->createOpenFiscalYear($company);
            (new StarterChartOfAccountsSeeder)->seedForCompany($company->id, $this->chartOfAccountService);
            $this->companyContextService->setSessionCompany($user, $company->id, $session);

            return $company->fresh();
        });
    }

    protected function createPracticeSetCompany(User $user, ?string $companyName = null, ?string $businessType = null): Company
    {
        $name = $companyName ?: "{$user->name}'s Practice Set";

        $settings = [
            'is_practice_set' => true,
            'educational' => true,
        ];

        if ($businessType !== null && $businessType !== '') {
            $settings['business_type'] = $businessType;
        }

        return $this->companyRepository->create([
            'name' => $name,
            'currency_code' => 'USD',
            'country_code' => 'US',
            'fiscal_year_start_month' => 1,
            'timezone' => config('app.timezone', 'UTC'),
            'is_active' => true,
            'settings' => $settings,
        ]);
    }

    protected function assignAccountantRole(User $user, Company $company): void
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Accountant->value],
            [
                'name' => 'Accountant',
                'description' => 'Creates journal entries, manages chart of accounts, views reports.',
            ],
        );

        $this->companyUserRepository->assign([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'role_id' => $role->id,
            'is_default' => true,
        ]);
    }

    protected function createOpenFiscalYear(Company $company): FiscalYear
    {
        $year = (int) now()->year;
        $startDate = Carbon::create($year, 1, 1)->startOfDay();
        $endDate = Carbon::create($year, 12, 31)->startOfDay();

        $fiscalYear = FiscalYear::query()->create([
            'company_id' => $company->id,
            'name' => (string) $year,
            'year' => $year,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => FiscalYearStatus::Open,
        ]);

        $this->createMonthlyPeriods($company, $fiscalYear);

        return $fiscalYear;
    }

    protected function createMonthlyPeriods(Company $company, FiscalYear $fiscalYear): void
    {
        $year = $fiscalYear->year;

        for ($month = 1; $month <= 12; $month++) {
            $startDate = Carbon::create($year, $month, 1)->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->startOfDay();

            AccountingPeriod::query()->create([
                'company_id' => $company->id,
                'fiscal_year_id' => $fiscalYear->id,
                'period_number' => $month,
                'name' => $startDate->format('F'),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => AccountingPeriodStatus::Open,
                'is_adjustment_period' => false,
            ]);
        }
    }
}
