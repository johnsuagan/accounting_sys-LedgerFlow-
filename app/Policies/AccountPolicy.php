<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;
use App\Repositories\Contracts\AccountRepositoryInterface;

class AccountPolicy
{
    use HandlesCompanyAuthorization;

    public function __construct(
        protected AccountRepositoryInterface $accountRepository,
    ) {}

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->companyUsers()->exists();
    }

    public function view(User $user, Account $account): bool
    {
        return $this->canAccessCompany($user, $account->company_id);
    }

    public function create(User $user): bool
    {
        return $this->canWriteAccounting($user);
    }

    public function update(User $user, Account $account): bool
    {
        return $this->canWriteAccounting($user, $account->company_id)
            && $this->canAccessCompany($user, $account->company_id);
    }

    public function delete(User $user, Account $account): bool
    {
        return $this->canWriteAccounting($user, $account->company_id)
            && $this->canAccessCompany($user, $account->company_id)
            && ! $account->is_system
            && ! $this->accountRepository->hasPostedActivity($account)
            && ! $this->accountRepository->hasChildren($account);
    }

    public function deactivate(User $user, Account $account): bool
    {
        return $this->canWriteAccounting($user, $account->company_id)
            && $this->canAccessCompany($user, $account->company_id)
            && ! $account->is_system;
    }

    public function activate(User $user, Account $account): bool
    {
        return $this->update($user, $account);
    }

    public function restore(User $user, Account $account): bool
    {
        return $this->update($user, $account);
    }
}
