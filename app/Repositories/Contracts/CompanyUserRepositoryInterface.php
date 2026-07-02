<?php

namespace App\Repositories\Contracts;

use App\Models\CompanyUser;

interface CompanyUserRepositoryInterface
{
    public function find(int $id): ?CompanyUser;

    public function findOrFail(int $id): CompanyUser;

    public function findMembership(int $companyId, int $userId): ?CompanyUser;

    public function assign(array $attributes): CompanyUser;

    public function update(CompanyUser $companyUser, array $attributes): CompanyUser;

    public function delete(CompanyUser $companyUser): bool;

    public function clearDefaultForUser(int $userId): void;
}
