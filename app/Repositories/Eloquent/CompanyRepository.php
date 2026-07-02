<?php

namespace App\Repositories\Eloquent;

use App\Models\Company;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CompanyRepository implements CompanyRepositoryInterface
{
    public function find(int $id): ?Company
    {
        return Company::query()->find($id);
    }

    public function findOrFail(int $id): Company
    {
        return Company::query()->findOrFail($id);
    }

    public function findByUuid(string $uuid): ?Company
    {
        return Company::query()->where('uuid', $uuid)->first();
    }

    public function allActive(): Collection
    {
        return Company::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Company::query()
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function create(array $attributes): Company
    {
        return Company::query()->create($attributes);
    }

    public function update(Company $company, array $attributes): Company
    {
        $company->update($attributes);

        return $company->fresh();
    }

    public function delete(Company $company): bool
    {
        return (bool) $company->delete();
    }
}
