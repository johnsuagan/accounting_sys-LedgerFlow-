<?php

namespace App\Policies;

use App\Enums\JournalEntryStatus;
use App\Models\JournalEntryAttachment;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;

class JournalEntryAttachmentPolicy
{
    use HandlesCompanyAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->companyUsers()->exists();
    }

    public function view(User $user, JournalEntryAttachment $attachment): bool
    {
        return $this->canAccessCompany($user, $attachment->company_id);
    }

    public function create(User $user): bool
    {
        return $this->canWriteAccounting($user);
    }

    public function delete(User $user, JournalEntryAttachment $attachment): bool
    {
        if (! $this->canWriteAccounting($user, $attachment->company_id)) {
            return false;
        }

        if (! $this->canAccessCompany($user, $attachment->company_id)) {
            return false;
        }

        $attachment->loadMissing('journalEntry');

        return $attachment->journalEntry?->status === JournalEntryStatus::Draft;
    }
}
