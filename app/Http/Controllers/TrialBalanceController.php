<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrialBalance\TrialBalanceIndexRequest;
use App\Services\Accounting\Support\FinancialStatementMapper;
use App\Models\FiscalYear;
use App\Services\Accounting\TrialBalanceService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TrialBalanceController extends Controller
{
    public function __construct(
        protected TrialBalanceService $trialBalanceService,
    ) {}

    public function index(TrialBalanceIndexRequest $request): Response
    {
        $companyId = $this->resolveCompanyId();
        $validated = $request->validated();

        $filters = [
            'as_of_date' => $validated['as_of_date'] ?? '',
            'fiscal_year_id' => isset($validated['fiscal_year_id']) ? (int) $validated['fiscal_year_id'] : null,
        ];

        $trialBalance = null;

        if ($request->shouldGenerate()) {
            $trialBalance = $this->trialBalanceService->generate(
                $companyId,
                Carbon::parse($filters['as_of_date']),
                $filters['fiscal_year_id'],
            )->toArray();
        }

        return Inertia::render('accounting/trial-balance/index', [
            'trialBalance' => $trialBalance,
            'fiscalYears' => FiscalYear::query()
                ->where('company_id', $companyId)
                ->orderByDesc('year')
                ->get(['id', 'name', 'year', 'start_date', 'end_date'])
                ->map(fn (FiscalYear $fiscalYear) => [
                    'id' => $fiscalYear->id,
                    'name' => $fiscalYear->name,
                    'year' => $fiscalYear->year,
                    'start_date' => $fiscalYear->start_date->toDateString(),
                    'end_date' => $fiscalYear->end_date->toDateString(),
                ])
                ->values(),
            'filters' => $filters,
        ]);
    }

    protected function resolveCompanyId(): int
    {
        $companyId = CompanyContext::id();

        if ($companyId === null) {
            throw new \RuntimeException('Company context is required.');
        }

        return $companyId;
    }
}
