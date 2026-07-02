<?php

namespace App\Repositories\Contracts;

use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AuditLogRepositoryInterface
{
    public function create(array $attributes): AuditLog;

    public function paginateForCompany(?int $companyId, int $perPage = 25): LengthAwarePaginator;

    public function findByRequestId(string $requestId): LengthAwarePaginator;
}
