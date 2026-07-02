<?php

namespace App\Repositories\Contracts;

use App\Models\AccountingPeriod;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;

interface AccountingPeriodRepositoryInterface
{
    public function find(int $id): ?AccountingPeriod;

    public function findOrFail(int $id): AccountingPeriod;

    public function forFiscalYear(int $fiscalYearId): Collection;

    public function findForDate(int $companyId, CarbonInterface $date): ?AccountingPeriod;

    public function update(AccountingPeriod $period, array $attributes): AccountingPeriod;
}
