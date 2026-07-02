<?php

namespace App\Repositories\Eloquent;

use App\Enums\FiscalYearStatus;
use App\Models\FiscalYear;
use App\Repositories\Contracts\FiscalYearRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class FiscalYearRepository implements FiscalYearRepositoryInterface
{
    public function find(int $id): ?FiscalYear
    {
        return FiscalYear::query()->find($id);
    }

    public function findOrFail(int $id): FiscalYear
    {
        return FiscalYear::query()->findOrFail($id);
    }

    public function findByYear(int $companyId, int $year): ?FiscalYear
    {
        return FiscalYear::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->first();
    }

    public function paginateForCompany(int $companyId, int $perPage = 15): LengthAwarePaginator
    {
        return FiscalYear::query()
            ->where('company_id', $companyId)
            ->orderByDesc('start_date')
            ->paginate($perPage);
    }

    public function getOpenForCompany(int $companyId): Collection
    {
        return FiscalYear::query()
            ->where('company_id', $companyId)
            ->where('status', FiscalYearStatus::Open)
            ->orderByDesc('start_date')
            ->get();
    }

    public function create(array $attributes): FiscalYear
    {
        return FiscalYear::query()->create($attributes);
    }

    public function update(FiscalYear $fiscalYear, array $attributes): FiscalYear
    {
        $fiscalYear->update($attributes);

        return $fiscalYear->fresh();
    }
}
