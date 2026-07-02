<?php

namespace App\Services\Accounting\Support;

use App\Enums\AccountingPeriodStatus;
use App\Enums\FiscalYearStatus;
use App\Exceptions\Accounting\FiscalYearLockedException;
use App\Exceptions\Accounting\FiscalYearNotFoundException;
use App\Exceptions\Accounting\PeriodLockedException;
use App\Exceptions\Accounting\PeriodMismatchException;
use App\Exceptions\Accounting\PeriodNotFoundException;
use App\Models\FiscalYear;
use App\Repositories\Contracts\AccountingPeriodRepositoryInterface;
use Carbon\CarbonInterface;

class PeriodGuard
{
    public function __construct(
        protected AccountingPeriodRepositoryInterface $accountingPeriodRepository,
    ) {}

    public function resolve(int $companyId, CarbonInterface $entryDate): PeriodContext
    {
        $fiscalYear = FiscalYear::query()
            ->where('company_id', $companyId)
            ->whereDate('start_date', '<=', $entryDate)
            ->whereDate('end_date', '>=', $entryDate)
            ->first();

        if ($fiscalYear === null) {
            throw new FiscalYearNotFoundException(
                "No fiscal year found for date {$entryDate->toDateString()}."
            );
        }

        $accountingPeriod = $this->accountingPeriodRepository->findForDate($companyId, $entryDate);

        if ($accountingPeriod === null) {
            throw new PeriodNotFoundException(
                "No accounting period found for date {$entryDate->toDateString()}."
            );
        }

        if ($accountingPeriod->fiscal_year_id !== $fiscalYear->id) {
            throw new PeriodMismatchException('Accounting period does not belong to the resolved fiscal year.');
        }

        return new PeriodContext($fiscalYear, $accountingPeriod);
    }

    public function assertPostable(int $companyId, CarbonInterface $entryDate): PeriodContext
    {
        $context = $this->resolve($companyId, $entryDate);

        if ($context->fiscalYear->status !== FiscalYearStatus::Open) {
            throw new FiscalYearLockedException(
                "Fiscal year {$context->fiscalYear->name} is {$context->fiscalYear->status->value}."
            );
        }

        if ($context->accountingPeriod->status !== AccountingPeriodStatus::Open) {
            throw new PeriodLockedException(
                "Accounting period {$context->accountingPeriod->name} is {$context->accountingPeriod->status->value}."
            );
        }

        if ($context->fiscalYear->company_id !== $companyId
            || $context->accountingPeriod->company_id !== $companyId) {
            throw new PeriodMismatchException('Period does not belong to the specified company.');
        }

        return $context;
    }
}
