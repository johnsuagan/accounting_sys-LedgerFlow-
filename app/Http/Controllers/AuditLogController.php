<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __construct(
        protected AuditLogRepositoryInterface $auditLogRepository,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AuditLog::class);

        $companyId = CompanyContext::id();
        $logs = $this->auditLogRepository->paginateForCompany($companyId, 25);

        return Inertia::render('accounting/audit-trail/index', [
            'logs' => [
                'data' => $logs->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'module' => $log->module,
                    'action' => $log->action->value,
                    'auditable_type' => class_basename($log->auditable_type ?? ''),
                    'auditable_id' => $log->auditable_id,
                    'user_name' => $log->user?->name,
                    'created_at' => $log->created_at?->toIso8601String(),
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                ]),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'links' => $logs->linkCollection()->toArray(),
            ],
        ]);
    }
}
