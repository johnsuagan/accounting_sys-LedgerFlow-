<?php

namespace App\Services\Accounting\Support;

use App\Enums\AuditAction;
use App\Jobs\PersistAuditLogJob;
use App\Models\JournalEntry;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Support\AuditRequestContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class JournalAuditDispatcher
{
    public function __construct(
        protected AuditLogRepositoryInterface $auditLogRepository,
    ) {}

    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function dispatch(
        AuditAction $action,
        Model $auditable,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $companyId = null,
        ?int $userId = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $url = null,
    ): void {
        $attributes = [
            'company_id' => $companyId ?? ($auditable instanceof JournalEntry ? $auditable->company_id : null),
            'user_id' => $userId,
            'request_id' => AuditRequestContext::id(),
            'module' => 'journal_entries',
            'action' => $action->value,
            'auditable_type' => $auditable->getMorphClass(),
            'auditable_id' => $auditable->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'url' => $url,
        ];

        try {
            $this->auditLogRepository->create($attributes);
        } catch (\Throwable $exception) {
            Log::warning('Audit log write failed; dispatching async retry.', [
                'auditable_type' => $attributes['auditable_type'],
                'auditable_id' => $attributes['auditable_id'],
                'action' => $attributes['action'],
                'exception' => $exception->getMessage(),
            ]);

            PersistAuditLogJob::dispatch($attributes);
        }
    }
}
