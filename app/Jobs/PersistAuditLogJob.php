<?php

namespace App\Jobs;

use App\Repositories\Contracts\AuditLogRepositoryInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class PersistAuditLogJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /** @var list<int> */
    public array $backoff = [10, 30, 60, 120, 300];

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function __construct(
        public array $attributes,
    ) {}

    public function handle(AuditLogRepositoryInterface $auditLogRepository): void
    {
        $auditLogRepository->create($this->attributes);
    }

    public function failed(?\Throwable $exception): void
    {
        Log::error('Failed to persist audit log after retries.', [
            'attributes' => $this->attributes,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
