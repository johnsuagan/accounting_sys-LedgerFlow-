<?php

namespace App\Repositories\Eloquent;

use App\Models\AccountingPeriod;
use App\Repositories\Contracts\AccountingPeriodRepositoryInterface;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;

class AccountingPeriodRepository implements AccountingPeriodRepositoryInterface
{
    public function find(int $id): ?AccountingPeriod
    {
        return AccountingPeriod::query()->find($id);
    }

    public function findOrFail(int $id): AccountingPeriod
    {
        return AccountingPeriod::query()->findOrFail($id);
    }

    public function forFiscalYear(int $fiscalYearId): Collection
    {
        return AccountingPeriod::query()
            ->where('fiscal_year_id', $fiscalYearId)
            ->orderBy('period_number')
            ->get();
    }

    public function findForDate(int $companyId, CarbonInterface $date): ?AccountingPeriod
    {
        return AccountingPeriod::query()
            ->where('company_id', $companyId)
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->first();
    }

    public function update(AccountingPeriod $period, array $attributes): AccountingPeriod
    {
        $period->update($attributes);

        return $period->fresh();
    }
}
