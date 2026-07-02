<?php

namespace App\Http\Middleware;

use App\Services\Company\CompanyContextService;
use App\Services\Onboarding\PracticeSetProvisioner;
use App\Support\CompanyContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanySelected
{
    public function __construct(
        protected CompanyContextService $companyContextService,
        protected PracticeSetProvisioner $practiceSetProvisioner,
    ) {}

    /**
     * Require an active company in session before accessing tenant-scoped routes.
     * Students with a practice set are auto-provisioned and auto-selected — no company picker.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null) {
            return redirect()->route('login');
        }

        $user = $request->user();

        if (! $user->isSuperAdmin() && ! $this->practiceSetProvisioner->userHasPracticeSet($user)) {
            $this->practiceSetProvisioner->ensureWorkspace($user, $request->session());
        }

        if (! $this->companyContextService->ensureSelectedCompany($user, $request->session())) {
            $accessible = $this->companyContextService->accessibleCompanies($user);

            if ($accessible->isEmpty() && ! $user->isSuperAdmin()) {
                return redirect()->route('onboarding.index');
            }

            if ($accessible->count() > 1 || $user->isSuperAdmin()) {
                return redirect()->route('company.select');
            }
        }

        if (! CompanyContext::has()) {
            return redirect()->route('onboarding.index');
        }

        return $next($request);
    }
}
