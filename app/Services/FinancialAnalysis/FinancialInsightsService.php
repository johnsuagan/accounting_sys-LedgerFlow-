<?php

namespace App\Services\FinancialAnalysis;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Services\Accounting\AccountBalanceService;
use App\Services\FinancialAnalysis\Support\AnalysisPeriod;
use App\Services\FinancialAnalysis\Support\RatioBenchmark;
use App\Services\FinancialAnalysis\Support\RatioMath;

class FinancialInsightsService
{
    public function __construct(
        protected AccountBalanceService $accountBalanceService,
        protected FinancialRatioService $financialRatioService,
    ) {}

    /**
     * @return list<array<string, string>>
     */
    public function generate(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $insights = [];

        if ($period->previousEnd === null) {
            return [[
                'type' => 'info',
                'message' => 'Post more journal entries to unlock period-over-period insights.',
            ]];
        }

        $current = $this->periodSnapshot($companyId, $period->currentEnd, $fiscalYearId);
        $previous = $this->periodSnapshot($companyId, $period->previousEnd, $fiscalYearId);

        $this->appendChangeInsight($insights, 'revenue', 'Revenue', $current['revenue'], $previous['revenue']);
        $this->appendChangeInsight($insights, 'expenses', 'Operating expenses', $current['expenses'], $previous['expenses'], invertPositive: true);
        $this->appendChangeInsight($insights, 'net_income', 'Net income', $current['net_income'], $previous['net_income']);

        if (bccomp($current['net_income'], $previous['net_income'], 4) === 1 && bccomp($current['revenue'], $previous['revenue'], 4) === 1) {
            $insights[] = [
                'type' => 'positive',
                'message' => 'Net income improved due to increased revenue.',
            ];
        }

        if (bccomp($current['current_liabilities'], $previous['current_liabilities'], 4) === 1
            && bccomp($current['current_assets'], $previous['current_assets'], 4) !== 1) {
            $insights[] = [
                'type' => 'warning',
                'message' => 'Current liabilities increased faster than current assets.',
            ];
        }

        $currentRatio = RatioMath::toFloat(RatioMath::divide($current['current_assets'], $current['current_liabilities']));
        $liquidity = RatioBenchmark::forCurrentRatio($currentRatio);
        $insights[] = [
            'type' => $liquidity['color'] === 'red' ? 'warning' : 'positive',
            'message' => $liquidity['color'] === 'red'
                ? 'Liquidity may need attention based on the current ratio.'
                : 'Liquidity remains healthy based on the current ratio.',
        ];

        $debtRatio = RatioMath::toFloat(RatioMath::percent(RatioMath::divide($current['liabilities'], $current['assets'])));
        $debtStatus = RatioBenchmark::forDebtRatio($debtRatio !== null ? $debtRatio / 100 : null);
        $insights[] = [
            'type' => $debtStatus['color'] === 'red' ? 'warning' : 'positive',
            'message' => $debtStatus['color'] === 'red'
                ? 'Debt ratio is elevated and should be monitored.'
                : 'Debt ratio remains within acceptable levels.',
        ];

        return $insights;
    }

    /**
     * @param  list<array<string, string>>  $insights
     */
    protected function appendChangeInsight(
        array &$insights,
        string $key,
        string $label,
        string $current,
        string $previous,
        bool $invertPositive = false,
    ): void {
        if (bccomp($previous, '0', 4) === 0) {
            return;
        }

        $change = bcmul(bcdiv(bcsub($current, $previous, 4), $previous, 4), '100', 2);
        $direction = bccomp($change, '0', 2) >= 0 ? 'increased' : 'decreased';
        $absChange = ltrim($change, '-');
        $isPositive = $direction === 'increased';

        if ($invertPositive) {
            $isPositive = ! $isPositive;
        }

        $insights[] = [
            'type' => $isPositive ? 'positive' : 'warning',
            'message' => sprintf('%s %s by %s%% compared to the previous period.', $label, $direction, $absChange),
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function periodSnapshot(int $companyId, \Carbon\CarbonInterface $asOfDate, ?int $fiscalYearId): array
    {
        $revenue = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Revenue, $asOfDate, $fiscalYearId);
        $expenses = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Expense, $asOfDate, $fiscalYearId);

        return [
            'revenue' => $revenue,
            'expenses' => $expenses,
            'net_income' => bcsub($revenue, $expenses, 4),
            'assets' => $this->accountBalanceService->totalByAccountType($companyId, AccountType::Asset, $asOfDate, $fiscalYearId),
            'liabilities' => $this->accountBalanceService->totalByAccountType($companyId, AccountType::Liability, $asOfDate, $fiscalYearId),
            'current_assets' => $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentAsset, $asOfDate, $fiscalYearId),
            'current_liabilities' => $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentLiability, $asOfDate, $fiscalYearId),
        ];
    }
}
