<?php

namespace App\Services\FinancialAnalysis;

use App\Enums\AccountType;
use App\Services\Accounting\AccountBalanceService;
use App\Services\Accounting\DashboardAnalyticsService;
use App\Services\FinancialAnalysis\Support\AnalysisPeriod;

class FinancialAnalysisService
{
    public function __construct(
        protected AccountBalanceService $accountBalanceService,
        protected DashboardAnalyticsService $dashboardAnalyticsService,
        protected FinancialRatioService $financialRatioService,
        protected FinancialInsightsService $financialInsightsService,
        protected BusinessHealthScoreService $businessHealthScoreService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function dashboard(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $current = $this->dashboardAnalyticsService->summary($companyId, $period->currentEnd, $fiscalYearId);
        $previous = $period->previousEnd
            ? $this->dashboardAnalyticsService->summary($companyId, $period->previousEnd, $fiscalYearId)
            : null;

        return [
            'filters' => $period->toFilterArray(),
            'kpis' => $this->buildKpis($current, $previous),
            'trends' => $this->dashboardAnalyticsService->monthlyTrends(
                $companyId,
                $period->currentStart,
                $period->currentEnd,
            ),
            'composition' => $this->composition($companyId, $period->currentEnd, $fiscalYearId),
            'top_accounts' => $this->topAccounts($companyId, $period->currentEnd, $fiscalYearId),
            'health' => $this->businessHealthScoreService->score($companyId, $period, $fiscalYearId),
            'insights' => array_slice($this->financialInsightsService->generate($companyId, $period, $fiscalYearId), 0, 4),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function trends(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $currentTrends = $this->dashboardAnalyticsService->monthlyTrends(
            $companyId,
            $period->currentStart,
            $period->currentEnd,
        );

        $previousTrends = $period->previousStart && $period->previousEnd
            ? $this->dashboardAnalyticsService->monthlyTrends(
                $companyId,
                $period->previousStart,
                $period->previousEnd,
            )
            : [];

        return [
            'filters' => $period->toFilterArray(),
            'current' => $currentTrends,
            'previous' => $previousTrends,
            'comparison' => $this->buildKpis(
                $this->dashboardAnalyticsService->summary($companyId, $period->currentEnd, $fiscalYearId),
                $period->previousEnd
                    ? $this->dashboardAnalyticsService->summary($companyId, $period->previousEnd, $fiscalYearId)
                    : null,
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function insightsPage(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        return [
            'filters' => $period->toFilterArray(),
            'insights' => $this->financialInsightsService->generate($companyId, $period, $fiscalYearId),
            'health' => $this->businessHealthScoreService->score($companyId, $period, $fiscalYearId),
        ];
    }

    /**
     * @param  array<string, string>  $current
     * @param  array<string, string>|null  $previous
     * @return list<array<string, mixed>>
     */
    protected function buildKpis(array $current, ?array $previous): array
    {
        $keys = [
            'total_assets' => 'Total Assets',
            'total_liabilities' => 'Total Liabilities',
            'total_equity' => 'Total Equity',
            'total_revenue' => 'Total Revenue',
            'total_expenses' => 'Total Expenses',
            'net_income' => 'Net Income',
        ];

        $kpis = [];

        foreach ($keys as $key => $label) {
            $currentValue = $current[$key] ?? '0.0000';
            $previousValue = $previous[$key] ?? null;
            $changePercent = null;
            $direction = 'neutral';

            if ($previousValue !== null && bccomp($previousValue, '0', 4) !== 0) {
                $changePercent = bcmul(bcdiv(bcsub($currentValue, $previousValue, 4), $previousValue, 4), '100', 2);
                $direction = bccomp($changePercent, '0', 2) > 0 ? 'up' : (bccomp($changePercent, '0', 2) < 0 ? 'down' : 'neutral');
            }

            $kpis[] = [
                'key' => $key,
                'label' => $label,
                'current_value' => $currentValue,
                'previous_value' => $previousValue,
                'change_percent' => $changePercent,
                'direction' => $direction,
                'drill_down' => $this->drillDownForKpi($key),
            ];
        }

        return $kpis;
    }

    /**
     * @return array<string, mixed>
     */
    protected function composition(int $companyId, \Carbon\CarbonInterface $asOfDate, ?int $fiscalYearId): array
    {
        $summaries = $this->accountBalanceService->summariesForPostableAccounts($companyId, $asOfDate, $fiscalYearId);

        return [
            'assets' => $this->filterAndSort($summaries, 'asset'),
            'liabilities' => $this->filterAndSort($summaries, 'liability'),
            'expenses' => $this->filterAndSort($summaries, 'expense'),
        ];
    }

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    protected function topAccounts(int $companyId, \Carbon\CarbonInterface $asOfDate, ?int $fiscalYearId): array
    {
        $summaries = $this->accountBalanceService->summariesForPostableAccounts($companyId, $asOfDate, $fiscalYearId);

        return [
            'revenue' => $this->filterAndSort($summaries, 'revenue', 5),
            'expense' => $this->filterAndSort($summaries, 'expense', 5),
            'asset' => $this->filterAndSort($summaries, 'asset', 5),
            'liability' => $this->filterAndSort($summaries, 'liability', 5),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $summaries
     * @return list<array<string, mixed>>
     */
    protected function filterAndSort(array $summaries, string $type, ?int $limit = null): array
    {
        $filtered = array_values(array_filter(
            $summaries,
            fn (array $row) => $row['account_type'] === $type,
        ));

        usort($filtered, fn (array $a, array $b) => bccomp($b['balance_amount'], $a['balance_amount'], 4));

        if ($limit !== null) {
            $filtered = array_slice($filtered, 0, $limit);
        }

        return array_map(fn (array $row) => [
            'account_id' => $row['account_id'],
            'account_code' => $row['account_code'],
            'account_name' => $row['account_name'],
            'account_type' => $row['account_type'],
            'amount' => $row['balance_amount'],
        ], $filtered);
    }

    /**
     * @return array<string, string>
     */
    protected function drillDownForKpi(string $key): array
    {
        return match ($key) {
            'total_revenue', 'total_expenses', 'net_income' => [
                'route' => 'accounting.financial-statements.index',
                'statement' => 'income_statement',
            ],
            default => [
                'route' => 'accounting.financial-statements.index',
                'statement' => 'balance_sheet',
            ],
        };
    }
}
