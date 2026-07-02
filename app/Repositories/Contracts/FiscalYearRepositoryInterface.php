<?php

namespace App\Repositories\Contracts;

use App\Models\FiscalYear;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface FiscalYearRepositoryInterface
{
    public function find(int $id): ?FiscalYear;

    public function findOrFail(int $id): FiscalYear;

    public function findByYear(int $companyId, int $year): ?FiscalYear;

    public function paginateForCompany(int $companyId, int $perPage = 15): LengthAwarePaginator;

    public function getOpenForCompany(int $companyId): Collection;

    public function create(array $attributes): FiscalYear;

    public function update(FiscalYear $fiscalYear, array $attributes): FiscalYear;
}
