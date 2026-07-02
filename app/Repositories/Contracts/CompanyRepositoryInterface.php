<?php

namespace App\Repositories\Contracts;

use App\Models\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CompanyRepositoryInterface
{
    public function find(int $id): ?Company;

    public function findOrFail(int $id): Company;

    public function findByUuid(string $uuid): ?Company;

    public function allActive(): Collection;

    public function paginate(int $perPage = 15): LengthAwarePaginator;

    public function create(array $attributes): Company;

    public function update(Company $company, array $attributes): Company;

    public function delete(Company $company): bool;
}
