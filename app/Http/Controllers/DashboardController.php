<?php

namespace App\Http\Controllers;

use App\Models\FiscalYear;
use App\Services\Accounting\DashboardAnalyticsService;
use App\Services\Company\CompanyContextService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected CompanyContextService $companyContextService,
        protected DashboardAnalyticsService $dashboardAnalyticsService,
    ) {}

    public function index(Request $request): Response
    {
        $company = $this->companyContextService->currentCompany();
        $settings = $company?->settings ?? [];
        $companyId = CompanyContext::id();

        $analytics = null;

        if ($companyId !== null) {
            $fiscalYear = FiscalYear::query()
                ->where('company_id', $companyId)
                ->orderByDesc('year')
                ->first();

            $asOfDate = $fiscalYear?->end_date ?? Carbon::today();
            $dateFrom = $fiscalYear?->start_date ?? Carbon::today()->startOfYear();
            $dateTo = $asOfDate;

            $analytics = [
                'summary' => $this->dashboardAnalyticsService->summary($companyId, $asOfDate),
                'trends' => $this->dashboardAnalyticsService->monthlyTrends($companyId, $dateFrom, $dateTo),
                'account_balance_summary' => $this->dashboardAnalyticsService->accountBalanceSummary($companyId, $asOfDate),
                'recent_journal_entries' => $this->dashboardAnalyticsService->recentJournalEntries($companyId),
            ];
        }

        return Inertia::render('dashboard', [
            'showWelcome' => (bool) $request->session()->get('welcome', false),
            'practiceSet' => [
                'name' => $company?->name,
                'isEducational' => (bool) ($settings['is_practice_set'] ?? false),
            ],
            'analytics' => $analytics,
        ]);
    }
}
