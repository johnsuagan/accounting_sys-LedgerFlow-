<?php

namespace App\Http\Middleware;

use App\Services\Company\CompanyContextService;
use App\Support\CompanyContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyAccess
{
    public function __construct(
        protected CompanyContextService $companyContextService,
    ) {}

    /**
     * Bootstrap tenant context from session for authenticated users.
     * Clears invalid session values when access is revoked or company is inactive.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() !== null) {
            $this->companyContextService->bootstrapFromSession(
                $request->user(),
                $request->session(),
            );
        } else {
            CompanyContext::clear();
        }

        return $next($request);
    }
}
