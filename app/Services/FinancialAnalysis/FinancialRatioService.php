<?php

namespace App\Services\FinancialAnalysis;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Models\Account;
use App\Services\Accounting\AccountBalanceService;
use App\Services\Accounting\FinancialStatementService;
use App\Services\FinancialAnalysis\Support\AnalysisPeriod;
use App\Services\FinancialAnalysis\Support\FinancialRatioResult;
use App\Services\FinancialAnalysis\Support\RatioBenchmark;
use App\Services\FinancialAnalysis\Support\RatioMath;
use Carbon\CarbonInterface;

class FinancialRatioService
{
    public function __construct(
        protected AccountBalanceService $accountBalanceService,
        protected FinancialStatementService $financialStatementService,
    ) {}

    /**
     * @return list<FinancialRatioResult>
     */
    public function profitability(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $metrics = $this->baseMetrics($companyId, $period, $fiscalYearId);

        $grossMargin = RatioMath::percent(RatioMath::divide($metrics['gross_profit'], $metrics['revenue']));
        $operatingMargin = RatioMath::percent(RatioMath::divide($metrics['operating_profit'], $metrics['revenue']));
        $netMargin = RatioMath::percent(RatioMath::divide($metrics['net_income'], $metrics['revenue']));
        $roa = RatioMath::percent(RatioMath::divide($metrics['net_income'], $metrics['average_assets']));
        $roe = RatioMath::percent(RatioMath::divide($metrics['net_income'], $metrics['average_equity']));
        $roi = RatioMath::percent(RatioMath::divide($metrics['net_income'], $metrics['average_equity']));

        return [
            $this->ratio('gross_profit_margin', 'Gross Profit Margin', 'Gross Profit ÷ Revenue', $metrics['gross_profit'].' ÷ '.$metrics['revenue'], $grossMargin, 'Measures profit after direct costs relative to revenue.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($grossMargin), 40, 25, 15)),
            $this->ratio('operating_profit_margin', 'Operating Profit Margin', 'Operating Profit ÷ Revenue', $metrics['operating_profit'].' ÷ '.$metrics['revenue'], $operatingMargin, 'Shows operating efficiency before interest and taxes.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($operatingMargin), 20, 12, 6)),
            $this->ratio('net_profit_margin', 'Net Profit Margin', 'Net Income ÷ Revenue', $metrics['net_income'].' ÷ '.$metrics['revenue'], $netMargin, 'Indicates how much profit is earned per dollar of revenue.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($netMargin), 15, 8, 3)),
            $this->ratio('roa', 'Return on Assets (ROA)', 'Net Income ÷ Average Total Assets', $metrics['net_income'].' ÷ '.$metrics['average_assets'], $roa, 'Measures profit generated from total assets.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($roa), 10, 5, 2)),
            $this->ratio('roe', 'Return on Equity (ROE)', 'Net Income ÷ Average Equity', $metrics['net_income'].' ÷ '.$metrics['average_equity'], $roe, 'Shows return earned on owners\' equity.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($roe), 15, 10, 5)),
            $this->ratio('roi', 'Return on Investment (ROI)', 'Net Income ÷ Average Equity', $metrics['net_income'].' ÷ '.$metrics['average_equity'], $roi, 'Approximates return on invested capital using equity.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($roi), 15, 10, 5)),
        ];
    }

    /**
     * @return list<FinancialRatioResult>
     */
    public function liquidity(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $end = $period->currentEnd;
        $currentAssets = $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentAsset, $end, $fiscalYearId);
        $currentLiabilities = $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentLiability, $end, $fiscalYearId);
        $cash = $this->sumAccountsByCodes($companyId, $end, ['1110'], $fiscalYearId);
        $quickAssets = $this->sumAccountsByCodes($companyId, $end, ['1110', '1120'], $fiscalYearId);

        $currentRatio = RatioMath::divide($currentAssets, $currentLiabilities);
        $quickRatio = RatioMath::divide($quickAssets, $currentLiabilities);
        $cashRatio = RatioMath::divide($cash, $currentLiabilities);

        return [
            $this->ratio('current_ratio', 'Current Ratio', 'Current Assets ÷ Current Liabilities', $currentAssets.' ÷ '.$currentLiabilities, RatioMath::formatRatio($currentRatio), 'Measures ability to pay short-term obligations.', RatioBenchmark::forCurrentRatio(RatioMath::toFloat($currentRatio)), displayAsRatio: true),
            $this->ratio('quick_ratio', 'Quick Ratio', '(Cash + Receivables) ÷ Current Liabilities', $quickAssets.' ÷ '.$currentLiabilities, RatioMath::formatRatio($quickRatio), 'Tests immediate liquidity without relying on inventory.', RatioBenchmark::forQuickRatio(RatioMath::toFloat($quickRatio)), displayAsRatio: true),
            $this->ratio('cash_ratio', 'Cash Ratio', 'Cash ÷ Current Liabilities', $cash.' ÷ '.$currentLiabilities, RatioMath::formatRatio($cashRatio), 'Shows cash available to cover current liabilities.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($cashRatio), 0.5, 0.25, 0.1), displayAsRatio: true),
        ];
    }

    /**
     * @return list<FinancialRatioResult>
     */
    public function solvency(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $end = $period->currentEnd;
        $assets = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Asset, $end, $fiscalYearId);
        $liabilities = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Liability, $end, $fiscalYearId);
        $equity = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Equity, $end, $fiscalYearId);

        $debtRatio = RatioMath::percent(RatioMath::divide($liabilities, $assets));
        $debtToEquity = RatioMath::formatRatio(RatioMath::divide($liabilities, $equity));
        $equityRatio = RatioMath::percent(RatioMath::divide($equity, $assets));

        $metrics = $this->baseMetrics($companyId, $period, $fiscalYearId);
        $interestExpense = $this->sumInterestExpense($companyId, $period, $fiscalYearId);
        $interestCoverage = RatioMath::formatRatio(RatioMath::divide($metrics['operating_profit'], $interestExpense));

        return [
            $this->ratio('debt_ratio', 'Debt Ratio', 'Total Liabilities ÷ Total Assets', $liabilities.' ÷ '.$assets, $debtRatio, 'Shows what portion of assets is financed by debt.', RatioBenchmark::forDebtRatio(RatioMath::toFloat($debtRatio) !== null ? RatioMath::toFloat($debtRatio) / 100 : null)),
            $this->ratio('debt_to_equity', 'Debt-to-Equity Ratio', 'Total Liabilities ÷ Total Equity', $liabilities.' ÷ '.$equity, $debtToEquity, 'Compares debt financing to equity financing.', RatioBenchmark::forLowerIsBetter(RatioMath::toFloat($debtToEquity), 0.5, 1.0, 2.0), displayAsRatio: true),
            $this->ratio('equity_ratio', 'Equity Ratio', 'Total Equity ÷ Total Assets', $equity.' ÷ '.$assets, $equityRatio, 'Indicates how much of the business is owned versus owed.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($equityRatio), 60, 40, 25)),
            $this->ratio('interest_coverage', 'Interest Coverage Ratio', 'Operating Profit ÷ Interest Expense', $metrics['operating_profit'].' ÷ '.$interestExpense, $interestCoverage, bccomp($interestExpense, '0', 4) === 0 ? 'No interest expense recorded in this period.' : 'Measures ability to pay interest from operating earnings.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($interestCoverage), 5, 3, 1.5), displayAsRatio: true),
        ];
    }

    /**
     * @return list<FinancialRatioResult>
     */
    public function efficiency(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $metrics = $this->baseMetrics($companyId, $period, $fiscalYearId);
        $assetTurnover = RatioMath::formatRatio(RatioMath::divide($metrics['revenue'], $metrics['average_assets']));
        $wcTurnover = RatioMath::formatRatio(RatioMath::divide($metrics['revenue'], $metrics['average_working_capital']));

        return [
            $this->ratio('asset_turnover', 'Asset Turnover', 'Revenue ÷ Average Total Assets', $metrics['revenue'].' ÷ '.$metrics['average_assets'], $assetTurnover, 'Shows how efficiently assets generate revenue.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($assetTurnover), 1.5, 1.0, 0.5), displayAsRatio: true),
            $this->ratio('inventory_turnover', 'Inventory Turnover', 'Cost of Goods Sold ÷ Average Inventory', '—', null, 'Planned for future inventory module support.', ['status' => 'Future Support', 'color' => 'gray'], isFuture: true),
            $this->ratio('receivable_turnover', 'Receivable Turnover', 'Revenue ÷ Average Accounts Receivable', '—', null, 'Planned for future receivables module support.', ['status' => 'Future Support', 'color' => 'gray'], isFuture: true),
            $this->ratio('working_capital_turnover', 'Working Capital Turnover', 'Revenue ÷ Average Working Capital', $metrics['revenue'].' ÷ '.$metrics['average_working_capital'], $wcTurnover, 'Measures revenue generated per unit of working capital.', RatioBenchmark::forHigherIsBetter(RatioMath::toFloat($wcTurnover), 4, 2, 1), displayAsRatio: true),
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function baseMetrics(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId): array
    {
        $end = $period->currentEnd;
        $start = $period->currentStart;

        $revenue = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Revenue, $end, $fiscalYearId);
        $expenses = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Expense, $end, $fiscalYearId);
        $netIncome = bcsub($revenue, $expenses, 4);

        $assetsEnd = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Asset, $end, $fiscalYearId);
        $assetsStart = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Asset, $start->copy()->subDay(), $fiscalYearId);
        $equityEnd = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Equity, $end, $fiscalYearId);
        $equityStart = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Equity, $start->copy()->subDay(), $fiscalYearId);

        $currentAssetsEnd = $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentAsset, $end, $fiscalYearId);
        $currentLiabilitiesEnd = $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentLiability, $end, $fiscalYearId);
        $currentAssetsStart = $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentAsset, $start->copy()->subDay(), $fiscalYearId);
        $currentLiabilitiesStart = $this->accountBalanceService->totalBySubtype($companyId, AccountSubtype::CurrentLiability, $start->copy()->subDay(), $fiscalYearId);

        $workingCapitalEnd = bcsub($currentAssetsEnd, $currentLiabilitiesEnd, 4);
        $workingCapitalStart = bcsub($currentAssetsStart, $currentLiabilitiesStart, 4);

        $grossProfit = bcsub($revenue, $this->sumCogs($companyId, $end, $fiscalYearId), 4);
        $operatingProfit = bcsub($grossProfit, $this->sumOperatingExpenses($companyId, $end, $fiscalYearId), 4);

        return [
            'revenue' => $revenue,
            'expenses' => $expenses,
            'net_income' => $netIncome,
            'gross_profit' => $grossProfit,
            'operating_profit' => $operatingProfit,
            'average_assets' => RatioMath::average($assetsStart, $assetsEnd),
            'average_equity' => RatioMath::average($equityStart, $equityEnd),
            'average_working_capital' => RatioMath::average($workingCapitalStart, $workingCapitalEnd),
        ];
    }

    protected function sumCogs(int $companyId, CarbonInterface $asOfDate, ?int $fiscalYearId): string
    {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->where('account_type', AccountType::Expense)
            ->postable()
            ->get()
            ->filter(fn (Account $account) => str_contains(strtolower($account->account_name), 'cost of goods')
                || str_contains(strtolower($account->account_name), 'cogs'));

        $total = '0.0000';

        foreach ($accounts as $account) {
            $balance = $this->accountBalanceService->balanceForAccount($account, $asOfDate, $fiscalYearId);
            $total = bcadd($total, $balance['balance_amount'], 4);
        }

        return $total;
    }

    protected function sumOperatingExpenses(int $companyId, CarbonInterface $asOfDate, ?int $fiscalYearId): string
    {
        $totalExpenses = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Expense, $asOfDate, $fiscalYearId);

        return bcsub($totalExpenses, $this->sumCogs($companyId, $asOfDate, $fiscalYearId), 4);
    }

    protected function sumInterestExpense(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId): string
    {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->where('account_type', AccountType::Expense)
            ->postable()
            ->get()
            ->filter(fn (Account $account) => str_contains(strtolower($account->account_name), 'interest'));

        $total = '0.0000';

        foreach ($accounts as $account) {
            $balance = $this->accountBalanceService->balanceForAccount($account, $period->currentEnd, $fiscalYearId);
            $total = bcadd($total, $balance['balance_amount'], 4);
        }

        return $total;
    }

    /**
     * @param  list<string>  $codes
     */
    protected function sumAccountsByCodes(int $companyId, CarbonInterface $asOfDate, array $codes, ?int $fiscalYearId): string
    {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->whereIn('account_code', $codes)
            ->postable()
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        return $this->accountBalanceService->totalPresentationForAccounts($accounts, $companyId, $asOfDate, $fiscalYearId);
    }

    /**
     * @param  array{status: string, color: string}  $benchmark
     */
    protected function ratio(
        string $key,
        string $name,
        string $formula,
        string $computation,
        ?string $displayValue,
        string $interpretation,
        array $benchmark,
        bool $displayAsRatio = false,
        bool $isFuture = false,
    ): FinancialRatioResult {
        $value = $displayValue;

        if (! $displayAsRatio && $displayValue !== null && str_ends_with($displayValue, '%')) {
            $value = rtrim($displayValue, '%');
        }

        return new FinancialRatioResult(
            key: $key,
            name: $name,
            formula: $formula,
            computation: $computation,
            value: $value,
            displayValue: $displayValue ?? 'N/A',
            interpretation: $interpretation,
            status: $benchmark['status'],
            statusColor: $benchmark['color'],
            isFuture: $isFuture,
        );
    }
}
