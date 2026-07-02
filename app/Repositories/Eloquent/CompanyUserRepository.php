<?php

namespace App\Repositories\Eloquent;

use App\Models\CompanyUser;
use App\Repositories\Contracts\CompanyUserRepositoryInterface;

class CompanyUserRepository implements CompanyUserRepositoryInterface
{
    public function find(int $id): ?CompanyUser
    {
        return CompanyUser::query()->find($id);
    }

    public function findOrFail(int $id): CompanyUser
    {
        return CompanyUser::query()->findOrFail($id);
    }

    public function findMembership(int $companyId, int $userId): ?CompanyUser
    {
        return CompanyUser::query()
            ->where('company_id', $companyId)
            ->where('user_id', $userId)
            ->first();
    }

    public function assign(array $attributes): CompanyUser
    {
        if (($attributes['is_default'] ?? false) === true) {
            $this->clearDefaultForUser((int) $attributes['user_id']);
        }

        return CompanyUser::query()->create($attributes);
    }

    public function update(CompanyUser $companyUser, array $attributes): CompanyUser
    {
        if (($attributes['is_default'] ?? false) === true) {
            $this->clearDefaultForUser($companyUser->user_id);
        }

        $companyUser->update($attributes);

        return $companyUser->fresh(['role', 'company', 'user']);
    }

    public function delete(CompanyUser $companyUser): bool
    {
        return (bool) $companyUser->delete();
    }

    public function clearDefaultForUser(int $userId): void
    {
        CompanyUser::query()
            ->where('user_id', $userId)
            ->update(['is_default' => false]);
    }
}
