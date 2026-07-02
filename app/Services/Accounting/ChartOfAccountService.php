<?php

namespace App\Services\Accounting;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Exceptions\Accounting\AccountHasPostedActivityException;
use App\Exceptions\Accounting\AccountHierarchyException;
use App\Exceptions\Accounting\AccountMergeNotSupportedException;
use App\Exceptions\Accounting\AccountProtectedException;
use App\Exceptions\Accounting\AccountTypeMismatchException;
use App\Exceptions\Accounting\DuplicateAccountCodeException;
use App\Models\Account;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ChartOfAccountService
{
    /** @var list<string> */
    protected array $mergeFieldKeys = [
        'merge_into_id',
        'merge_from_id',
        'target_account_id',
        'source_account_id',
        'merged_account_id',
    ];

    public function __construct(
        protected AccountRepositoryInterface $accountRepository,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Account
    {
        $this->assertNotMergeAttempt($data);

        $companyId = (int) $data['company_id'];
        $accountType = $this->resolveAccountType($data);
        $accountSubtype = $this->resolveAccountSubtype($data, $accountType);

        $account = new Account([
            'company_id' => $companyId,
            'account_code' => $data['account_code'],
            'account_name' => $data['account_name'],
            'account_type' => $accountType,
            'account_subtype' => $accountSubtype,
            'normal_balance' => $accountType->normalBalance(),
            'parent_id' => $data['parent_id'] ?? null,
            'is_header' => (bool) ($data['is_header'] ?? false),
            'is_system' => false,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'description' => $data['description'] ?? null,
        ]);

        $this->assertAccountCodeUnique($companyId, $account->account_code);
        $this->validateParentAssignment($account, $account->parent_id);
        $this->validateSubtypeMatchesType($accountSubtype, $accountType);
        $this->validateHeaderRules($account);

        return DB::transaction(function () use ($account) {
            $account->save();
            $this->rebuildTree($account->fresh());

            return $account->fresh(['parent']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Account $account, array $data): Account
    {
        $this->assertNotMergeAttempt($data);
        $this->assertSystemAccountProtection($account, $data);

        $accountType = isset($data['account_type'])
            ? $this->resolveAccountType($data)
            : $account->account_type;

        $accountSubtype = isset($data['account_subtype'])
            ? $this->resolveAccountSubtype($data, $accountType)
            : $account->account_subtype;

        $parentId = array_key_exists('parent_id', $data)
            ? $data['parent_id']
            : $account->parent_id;

        $isHeader = array_key_exists('is_header', $data)
            ? (bool) $data['is_header']
            : $account->is_header;

        $account->fill([
            'account_code' => $data['account_code'] ?? $account->account_code,
            'account_name' => $data['account_name'] ?? $account->account_name,
            'account_type' => $accountType,
            'account_subtype' => $accountSubtype,
            'normal_balance' => $accountType->normalBalance(),
            'parent_id' => $parentId,
            'is_header' => $isHeader,
            'is_active' => array_key_exists('is_active', $data)
                ? (bool) $data['is_active']
                : $account->is_active,
            'description' => array_key_exists('description', $data)
                ? $data['description']
                : $account->description,
        ]);

        if (isset($data['account_code']) && $data['account_code'] !== $account->getOriginal('account_code')) {
            $this->assertAccountCodeUnique($account->company_id, $account->account_code, $account->id);
        }

        $this->validateParentAssignment($account, $account->parent_id);
        $this->validateSubtypeMatchesType($account->account_subtype, $account->account_type);
        $this->validateHeaderRules($account);

        $parentChanged = $account->isDirty('parent_id');

        return DB::transaction(function () use ($account, $parentChanged) {
            $account->save();

            if ($parentChanged) {
                $this->rebuildTree($account->fresh());
            }

            return $account->fresh(['parent']);
        });
    }

    public function delete(Account $account): void
    {
        $this->assertDeletable($account);

        $account->delete();
    }

    public function deactivate(Account $account): Account
    {
        if ($account->is_system) {
            throw new AccountProtectedException('System accounts cannot be deactivated.');
        }

        return $this->accountRepository->update($account, ['is_active' => false]);
    }

    public function activate(Account $account): Account
    {
        return $this->accountRepository->update($account, ['is_active' => true]);
    }

    /**
     * @param  array{search?: string, account_type?: string, is_active?: bool|null}  $filters
     * @return Collection<int, Account>
     */
    public function listAccounts(int $companyId, array $filters = []): Collection
    {
        return $this->accountRepository->listForCompany($companyId, $filters);
    }

    /**
     * @param  array{search?: string, account_type?: string, is_active?: bool|null}  $filters
     * @return list<array<string, mixed>>
     */
    public function buildTree(int $companyId, array $filters = []): array
    {
        $accounts = $this->accountRepository->listForCompany($companyId, $filters);

        return $this->nestAccounts($accounts);
    }

    /**
     * @return list<array{id: int, account_code: string, account_name: string, level: int}>
     */
    public function parentOptions(int $companyId, ?AccountType $accountType = null, ?int $excludeAccountId = null): array
    {
        $query = Account::query()
            ->where('company_id', $companyId)
            ->where('is_header', true)
            ->orderBy('account_code');

        if ($accountType !== null) {
            $query->where('account_type', $accountType);
        }

        if ($excludeAccountId !== null) {
            $account = $this->accountRepository->find($excludeAccountId);

            if ($account !== null) {
                $excludedIds = array_merge([$excludeAccountId], $this->accountRepository->getDescendantIds($account));
                $query->whereNotIn('id', $excludedIds);
            }
        }

        return $query->get()
            ->map(fn (Account $account) => [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'level' => $account->level,
            ])
            ->values()
            ->all();
    }

  /**
     * Regenerate path and level for an account and all descendants.
     */
    public function rebuildTree(Account $account): void
    {
        $account->loadMissing('parent');

        if ($account->parent_id === null) {
            $account->level = 1;
            $account->path = '/'.$account->id.'/';
        } else {
            $parent = $account->parent ?? $this->accountRepository->findOrFail($account->parent_id);
            $account->level = $parent->level + 1;
            $account->path = rtrim($parent->path, '/').'/'.$account->id.'/';
        }

        $account->saveQuietly();

        $children = Account::query()
            ->where('parent_id', $account->id)
            ->orderBy('account_code')
            ->get();

        foreach ($children as $child) {
            $this->rebuildTree($child);
        }
    }

    public function assertDeletable(Account $account): void
    {
        if ($account->is_system) {
            throw new AccountProtectedException('System accounts cannot be deleted.');
        }

        if ($this->accountRepository->hasPostedActivity($account)) {
            throw new AccountHasPostedActivityException(
                'Accounts with posted journal activity cannot be deleted. Deactivate the account instead.'
            );
        }

        if ($this->accountRepository->hasChildren($account)) {
            throw new AccountHierarchyException('Accounts with child accounts cannot be deleted.');
        }
    }

    protected function validateParentAssignment(Account $account, ?int $parentId): void
    {
        if ($parentId === null) {
            return;
        }

        if ($account->exists && $parentId === $account->id) {
            throw new AccountHierarchyException('An account cannot be its own parent.');
        }

        $parent = $this->accountRepository->find($parentId);

        if ($parent === null) {
            throw new AccountHierarchyException('The selected parent account does not exist.');
        }

        if ((int) $parent->company_id !== (int) $account->company_id) {
            throw new AccountHierarchyException('Parent account must belong to the same company.');
        }

        if ($parent->account_type !== $account->account_type) {
            throw new AccountTypeMismatchException(
                'Child account type must match the parent account type.'
            );
        }

        if ($account->exists) {
            $descendantIds = $this->accountRepository->getDescendantIds($account);

            if (in_array($parentId, $descendantIds, true)) {
                throw new AccountHierarchyException(
                    'An account cannot be assigned a descendant as its parent.'
                );
            }
        }
    }

    protected function assertAccountCodeUnique(int $companyId, string $accountCode, ?int $ignoreId = null): void
    {
        $existing = $this->accountRepository->findByCode($companyId, $accountCode);

        if ($existing !== null && $existing->id !== $ignoreId) {
            throw new DuplicateAccountCodeException(
                "Account code [{$accountCode}] already exists for this company."
            );
        }
    }

    protected function validateSubtypeMatchesType(AccountSubtype $subtype, AccountType $type): void
    {
        if ($subtype->accountType() !== $type) {
            throw new AccountTypeMismatchException(
                'Account subtype does not match the selected account type.'
            );
        }
    }

    protected function validateHeaderRules(Account $account): void
    {
        if ($account->is_header && $this->accountRepository->hasPostedActivity($account)) {
            throw new AccountHasPostedActivityException(
                'Header accounts cannot have posted journal activity.'
            );
        }

        if ($this->accountRepository->hasChildren($account) && ! $account->is_header) {
            throw new AccountHierarchyException(
                'Accounts with children must be marked as header accounts.'
            );
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function assertSystemAccountProtection(Account $account, array $data): void
    {
        if (! $account->is_system) {
            return;
        }

        foreach (['account_type', 'account_subtype', 'normal_balance'] as $field) {
            if (! array_key_exists($field, $data)) {
                continue;
            }

            $current = $account->{$field};
            $incoming = $data[$field];

            $currentValue = $current instanceof \BackedEnum ? $current->value : (string) $current;
            $incomingValue = $incoming instanceof \BackedEnum ? $incoming->value : (string) $incoming;

            if ($incomingValue !== $currentValue) {
                throw new AccountProtectedException("System accounts cannot change {$field}.");
            }
        }

        if (array_key_exists('is_active', $data) && ! (bool) $data['is_active']) {
            throw new AccountProtectedException('System accounts cannot be deactivated.');
        }

        if ($account->is_system && array_key_exists('is_system', $data) && ! (bool) $data['is_system']) {
            throw new AccountProtectedException('System account flag cannot be removed.');
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function assertNotMergeAttempt(array $data): void
    {
        foreach ($this->mergeFieldKeys as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null && $data[$key] !== '') {
                throw new AccountMergeNotSupportedException(
                    'Account merging is not supported in this release.'
                );
            }
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function resolveAccountType(array $data): AccountType
    {
        $type = $data['account_type'];

        return $type instanceof AccountType
            ? $type
            : AccountType::from((string) $type);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function resolveAccountSubtype(array $data, AccountType $accountType): AccountSubtype
    {
        if (! isset($data['account_subtype'])) {
            return match ($accountType) {
                AccountType::Asset => AccountSubtype::CurrentAsset,
                AccountType::Liability => AccountSubtype::CurrentLiability,
                AccountType::Equity => AccountSubtype::Equity,
                AccountType::Revenue => AccountSubtype::Revenue,
                AccountType::Expense => AccountSubtype::Expense,
            };
        }

        $subtype = $data['account_subtype'];

        return $subtype instanceof AccountSubtype
            ? $subtype
            : AccountSubtype::from((string) $subtype);
    }

    /**
     * @param  Collection<int, Account>  $accounts
     * @return list<array<string, mixed>>
     */
    protected function nestAccounts(Collection $accounts): array
    {
        /** @var array<int|string, Collection<int, Account>> $grouped */
        $grouped = $accounts->groupBy(fn (Account $account) => $account->parent_id ?? 'root');

        $build = function (string|int $parentKey) use (&$build, $grouped): array {
            $siblings = $grouped->get($parentKey, collect());

            return $siblings->map(function (Account $account) use (&$build) {
                return [
                    'id' => $account->id,
                    'account_code' => $account->account_code,
                    'account_name' => $account->account_name,
                    'account_type' => $account->account_type->value,
                    'account_subtype' => $account->account_subtype->value,
                    'normal_balance' => $account->normal_balance->value,
                    'parent_id' => $account->parent_id,
                    'level' => $account->level,
                    'path' => $account->path,
                    'is_header' => $account->is_header,
                    'is_system' => $account->is_system,
                    'is_active' => $account->is_active,
                    'is_postable' => $account->isPostable(),
                    'has_posted_activity' => $this->accountRepository->hasPostedActivity($account),
                    'description' => $account->description,
                    'children' => $build($account->id),
                ];
            })->values()->all();
        };

        return $build('root');
    }

    public function resolveCompanyId(): int
    {
        $companyId = CompanyContext::id();

        if ($companyId === null) {
            throw new \RuntimeException('Company context is required.');
        }

        return $companyId;
    }
}
