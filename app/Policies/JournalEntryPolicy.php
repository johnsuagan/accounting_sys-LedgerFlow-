<?php

namespace App\Policies;

use App\Enums\JournalEntryStatus;
use App\Models\JournalEntry;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;

class JournalEntryPolicy
{
    use HandlesCompanyAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->companyUsers()->exists();
    }

    public function view(User $user, JournalEntry $journalEntry): bool
    {
        return $this->canAccessCompany($user, $journalEntry->company_id);
    }

    public function create(User $user): bool
    {
        return $this->canWriteAccounting($user);
    }

    public function update(User $user, JournalEntry $journalEntry): bool
    {
        return $this->canWriteAccounting($user, $journalEntry->company_id)
            && $this->canAccessCompany($user, $journalEntry->company_id)
            && $journalEntry->status === JournalEntryStatus::Draft;
    }

    public function delete(User $user, JournalEntry $journalEntry): bool
    {
        return $this->update($user, $journalEntry);
    }

    public function post(User $user, JournalEntry $journalEntry): bool
    {
        return $this->canWriteAccounting($user, $journalEntry->company_id)
            && $this->canAccessCompany($user, $journalEntry->company_id)
            && $journalEntry->status === JournalEntryStatus::Draft;
    }

    public function cancel(User $user, JournalEntry $journalEntry): bool
    {
        return $this->post($user, $journalEntry);
    }

    public function reverse(User $user, JournalEntry $journalEntry): bool
    {
        return $this->canWriteAccounting($user, $journalEntry->company_id)
            && $this->canAccessCompany($user, $journalEntry->company_id)
            && $journalEntry->status === JournalEntryStatus::Posted;
    }

    public function restore(User $user, JournalEntry $journalEntry): bool
    {
        return $this->canWriteAccounting($user, $journalEntry->company_id)
            && $this->canAccessCompany($user, $journalEntry->company_id)
            && $journalEntry->status === JournalEntryStatus::Draft;
    }
}
