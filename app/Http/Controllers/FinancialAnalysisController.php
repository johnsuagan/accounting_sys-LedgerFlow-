<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAccountingDateDefaults;
use App\Http\Requests\FinancialAnalysis\FinancialAnalysisIndexRequest;
use App\Models\FiscalYear;
use App\Services\FinancialAnalysis\FinancialAnalysisService;
use App\Services\FinancialAnalysis\FinancialRatioService;
use App\Services\FinancialAnalysis\Support\AnalysisPeriod;
use App\Services\FinancialAnalysis\Support\FinancialRatioResult;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAnalysisController extends Controller
{
    use ResolvesAccountingDateDefaults;

    public function __construct(
        protected FinancialAnalysisService $financialAnalysisService,
        protected FinancialRatioService $financialRatioService,
    ) {}

    public function dashboard(FinancialAnalysisIndexRequest $request): Response
    {
        [$period, $filters, $fiscalYears] = $this->resolveContext($request);

        return Inertia::render('financial-analysis/dashboard', [
            'data' => $this->financialAnalysisService->dashboard(
                $this->resolveCompanyId(),
                $period,
                $filters['fiscal_year_id'],
            ),
            'fiscalYears' => $fiscalYears,
            'filters' => $filters,
        ]);
    }

    public function profitability(FinancialAnalysisIndexRequest $request): Response
    {
        return $this->ratioPage($request, 'financial-analysis/profitability', 'profitability');
    }

    public function liquidity(FinancialAnalysisIndexRequest $request): Response
    {
        return $this->ratioPage($request, 'financial-analysis/liquidity', 'liquidity');
    }

    public function solvency(FinancialAnalysisIndexRequest $request): Response
    {
        return $this->ratioPage($request, 'financial-analysis/solvency', 'solvency');
    }

    public function efficiency(FinancialAnalysisIndexRequest $request): Response
    {
        return $this->ratioPage($request, 'financial-analysis/efficiency', 'efficiency');
    }

    public function trends(FinancialAnalysisIndexRequest $request): Response
    {
        [$period, $filters, $fiscalYears] = $this->resolveContext($request);

        return Inertia::render('financial-analysis/trends', [
            'data' => $this->financialAnalysisService->trends(
                $this->resolveCompanyId(),
                $period,
                $filters['fiscal_year_id'],
            ),
            'fiscalYears' => $fiscalYears,
            'filters' => $filters,
        ]);
    }

    public function insights(FinancialAnalysisIndexRequest $request): Response
    {
        [$period, $filters, $fiscalYears] = $this->resolveContext($request);

        return Inertia::render('financial-analysis/insights', [
            'data' => $this->financialAnalysisService->insightsPage(
                $this->resolveCompanyId(),
                $period,
                $filters['fiscal_year_id'],
            ),
            'fiscalYears' => $fiscalYears,
            'filters' => $filters,
        ]);
    }

    protected function ratioPage(
        FinancialAnalysisIndexRequest $request,
        string $view,
        string $category,
    ): Response {
        [$period, $filters, $fiscalYears] = $this->resolveContext($request);
        $companyId = $this->resolveCompanyId();
        $fiscalYearId = $filters['fiscal_year_id'];

        $ratios = match ($category) {
            'profitability' => $this->financialRatioService->profitability($companyId, $period, $fiscalYearId),
            'liquidity' => $this->financialRatioService->liquidity($companyId, $period, $fiscalYearId),
            'solvency' => $this->financialRatioService->solvency($companyId, $period, $fiscalYearId),
            default => $this->financialRatioService->efficiency($companyId, $period, $fiscalYearId),
        };

        return Inertia::render($view, [
            'ratios' => array_map(
                fn (FinancialRatioResult $ratio) => $ratio->toArray(),
                $ratios,
            ),
            'filters' => array_merge($period->toFilterArray(), [
                'fiscal_year_id' => $fiscalYearId,
            ]),
            'fiscalYears' => $fiscalYears,
        ]);
    }

    /**
     * @return array{0: AnalysisPeriod, 1: array<string, mixed>, 2: \Illuminate\Support\Collection<int, array<string, mixed>>}
     */
    protected function resolveContext(FinancialAnalysisIndexRequest $request): array
    {
        $companyId = $this->resolveCompanyId();
        $validated = $request->validated();

        $defaults = $this->defaultDateFilters($companyId);
        $asOfDate = $validated['as_of_date'] ?? $defaults['date_to'] ?: Carbon::today()->toDateString();
        $comparisonType = $request->comparisonType();
        $fiscalYearId = isset($validated['fiscal_year_id'])
            ? (int) $validated['fiscal_year_id']
            : $defaults['fiscal_year_id'];

        $period = AnalysisPeriod::resolve(Carbon::parse($asOfDate), $comparisonType);

        $filters = [
            'as_of_date' => $asOfDate,
            'comparison_type' => $comparisonType,
            'fiscal_year_id' => $fiscalYearId,
            'period_label' => $period->label,
        ];

        $fiscalYears = FiscalYear::query()
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
            ->values();

        return [$period, $filters, $fiscalYears];
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
