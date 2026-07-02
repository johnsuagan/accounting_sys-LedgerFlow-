<?php

namespace App\Repositories\Eloquent;

use App\Models\AuditLog;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AuditLogRepository implements AuditLogRepositoryInterface
{
    public function create(array $attributes): AuditLog
    {
        return AuditLog::query()->create($attributes);
    }

    public function paginateForCompany(?int $companyId, int $perPage = 25): LengthAwarePaginator
    {
        return AuditLog::query()
            ->when($companyId !== null, fn ($query) => $query->where('company_id', $companyId))
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findByRequestId(string $requestId): LengthAwarePaginator
    {
        return AuditLog::query()
            ->where('request_id', $requestId)
            ->with('user')
            ->orderBy('created_at')
            ->paginate(100);
    }
}
