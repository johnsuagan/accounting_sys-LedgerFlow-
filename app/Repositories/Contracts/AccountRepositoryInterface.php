<?php

namespace App\Repositories\Contracts;

use App\Models\Account;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AccountRepositoryInterface
{
    public function find(int $id): ?Account;

    public function findOrFail(int $id): Account;

    public function findByCode(int $companyId, string $accountCode): ?Account;

    public function paginateForCompany(int $companyId, int $perPage = 25): LengthAwarePaginator;

    public function getPostingAccounts(int $companyId): Collection;

    public function create(array $attributes): Account;

    public function update(Account $account, array $attributes): Account;

    public function delete(Account $account): bool;

    public function hasPostedActivity(Account $account): bool;

    /**
     * @return list<int>
     */
    public function getDescendantIds(Account $account): array;

    /**
     * @param  array{search?: string, account_type?: string, is_active?: bool|null}  $filters
     * @return \Illuminate\Database\Eloquent\Collection<int, Account>
     */
    public function listForCompany(int $companyId, array $filters = []): \Illuminate\Database\Eloquent\Collection;

    public function hasChildren(Account $account): bool;
}
