<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;
use App\Policies\Concerns\HandlesCompanyAuthorization;

class AuditLogPolicy
{
    use HandlesCompanyAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->companyUsers()->exists();
    }

    public function view(User $user, AuditLog $auditLog): bool
    {
        if ($auditLog->company_id === null) {
            return $this->isSuperAdmin($user);
        }

        return $this->canAccessCompany($user, $auditLog->company_id);
    }
}
