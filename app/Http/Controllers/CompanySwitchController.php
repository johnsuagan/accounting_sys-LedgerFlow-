<?php

namespace App\Http\Controllers;

use App\Http\Requests\Company\SwitchCompanyRequest;
use App\Services\Company\CompanyContextService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CompanySwitchController extends Controller
{
    public function __construct(
        protected CompanyContextService $companyContextService,
    ) {}

    /**
     * Display company selection screen.
     */
    public function index(Request $request): View|RedirectResponse
    {
        $user = $request->user();

        $companies = $this->companyContextService->accessibleCompaniesPayload($user);

        if ($companies === []) {
            return redirect()->route('onboarding.index');
        }

        if (count($companies) === 1) {
            $this->companyContextService->setSessionCompany(
                $user,
                $companies[0]['id'],
                $request->session(),
            );

            return redirect()->intended(route('dashboard'));
        }

        if ($this->companyContextService->hasSelectedCompany($request->session())) {
            return redirect()->intended(route('dashboard'));
        }

        return view('company.select', [
            'companies' => $companies,
            'currentCompanyId' => $this->companyContextService->getSessionCompanyId($request->session()),
        ]);
    }

    /**
     * Switch active company (session + CompanyContext).
     */
    public function store(SwitchCompanyRequest $request): RedirectResponse
    {
        $this->companyContextService->setSessionCompany(
            $request->user(),
            $request->integer('company_id'),
            $request->session(),
        );

        return redirect()
            ->intended(route('dashboard'))
            ->with('status', 'company-switched');
    }

    /**
     * Clear active company from session (forces re-selection).
     */
    public function destroy(Request $request): RedirectResponse
    {
        $this->companyContextService->clearSessionCompany($request->session());

        return redirect()->route('company.select');
    }
}
