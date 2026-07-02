<?php

namespace App\Repositories\Eloquent;

use App\Enums\JournalEntryStatus;
use App\Models\Account;
use App\Repositories\Contracts\AccountRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class AccountRepository implements AccountRepositoryInterface
{
    public function find(int $id): ?Account
    {
        return Account::query()->find($id);
    }

    public function findOrFail(int $id): Account
    {
        return Account::query()->findOrFail($id);
    }

    public function findByCode(int $companyId, string $accountCode): ?Account
    {
        return Account::query()
            ->where('company_id', $companyId)
            ->where('account_code', $accountCode)
            ->first();
    }

    public function paginateForCompany(int $companyId, int $perPage = 25): LengthAwarePaginator
    {
        return Account::query()
            ->where('company_id', $companyId)
            ->orderBy('account_code')
            ->paginate($perPage);
    }

    public function getPostingAccounts(int $companyId): Collection
    {
        return Account::query()
            ->where('company_id', $companyId)
            ->postable()
            ->orderBy('account_code')
            ->get();
    }

    public function create(array $attributes): Account
    {
        return Account::query()->create($attributes);
    }

    public function update(Account $account, array $attributes): Account
    {
        $account->update($attributes);

        return $account->fresh();
    }

    public function delete(Account $account): bool
    {
        return (bool) $account->delete();
    }

    public function hasPostedActivity(Account $account): bool
    {
        return $account->journalEntryLines()
            ->whereHas('journalEntry', fn ($query) => $query->where('status', JournalEntryStatus::Posted))
            ->exists();
    }

    public function hasPostedActivityOnDescendants(Account $account): bool
    {
        $descendantIds = $this->getDescendantIds($account);

        if ($descendantIds === []) {
            return false;
        }

        return Account::query()
            ->whereIn('id', $descendantIds)
            ->whereHas('journalEntryLines', fn ($query) => $query->whereHas(
                'journalEntry',
                fn ($entryQuery) => $entryQuery->where('status', JournalEntryStatus::Posted),
            ))
            ->exists();
    }

    public function getDescendantIds(Account $account): array
    {
        if ($account->path === null) {
            return $this->collectDescendantIds($account->id);
        }

        $pattern = rtrim($account->path, '/').'/%';

        return Account::query()
            ->where('company_id', $account->company_id)
            ->where('path', 'like', $pattern)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /**
     * @return list<int>
     */
    protected function collectDescendantIds(int $accountId): array
    {
        $ids = [];
        $children = Account::query()->where('parent_id', $accountId)->pluck('id');

        foreach ($children as $childId) {
            $ids[] = (int) $childId;
            $ids = array_merge($ids, $this->collectDescendantIds((int) $childId));
        }

        return $ids;
    }

    public function listForCompany(int $companyId, array $filters = []): Collection
    {
        return Account::query()
            ->where('company_id', $companyId)
            ->when(
                isset($filters['search']) && $filters['search'] !== '',
                fn ($query) => $query->where(function ($inner) use ($filters) {
                    $search = $filters['search'];
                    $inner->where('account_code', 'like', "%{$search}%")
                        ->orWhere('account_name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                }),
            )
            ->when(
                isset($filters['account_type']) && $filters['account_type'] !== '',
                fn ($query) => $query->where('account_type', $filters['account_type']),
            )
            ->when(
                array_key_exists('is_active', $filters) && $filters['is_active'] !== null,
                fn ($query) => $query->where('is_active', (bool) $filters['is_active']),
            )
            ->orderBy('account_code')
            ->get();
    }

    public function hasChildren(Account $account): bool
    {
        return $account->children()->exists();
    }
}
