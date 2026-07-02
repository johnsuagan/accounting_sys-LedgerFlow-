<?php

namespace App\Services\Accounting;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Models\Account;
use App\Services\Accounting\Support\BalanceSheetResult;
use App\Services\Accounting\Support\ChangesInEquityResult;
use App\Services\Accounting\Support\FinancialStatementLine;
use App\Services\Accounting\Support\GroupedStatementSection;
use App\Services\Accounting\Support\IncomeStatementResult;
use Carbon\CarbonInterface;
use Illuminate\Support\Str;

class FinancialStatementService
{
    public function __construct(
        protected AccountBalanceService $accountBalanceService,
    ) {}

    public function incomeStatement(
        int $companyId,
        CarbonInterface $dateFrom,
        CarbonInterface $dateTo,
        ?int $fiscalYearId = null,
    ): IncomeStatementResult {
        $revenueLines = $this->linesForType($companyId, AccountType::Revenue, $dateTo, $fiscalYearId);
        $expenseLines = $this->linesForType($companyId, AccountType::Expense, $dateTo, $fiscalYearId);

        $totalRevenue = $this->sumLines($revenueLines);
        $totalExpenses = $this->sumLines($expenseLines);
        $netIncome = bcsub($totalRevenue, $totalExpenses, 4);
        $isNetLoss = bccomp($netIncome, '0', 4) === -1;

        return new IncomeStatementResult(
            revenueLines: $revenueLines,
            expenseLines: $expenseLines,
            totalRevenue: $totalRevenue,
            totalExpenses: $totalExpenses,
            netIncome: $isNetLoss ? bcmul($netIncome, '-1', 4) : $netIncome,
            isNetLoss: $isNetLoss,
            filters: [
                'date_from' => $dateFrom->toDateString(),
                'date_to' => $dateTo->toDateString(),
                'fiscal_year_id' => $fiscalYearId,
            ],
        );
    }

    public function balanceSheet(
        int $companyId,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
    ): BalanceSheetResult {
        $currentAssets = $this->linesForSubtype($companyId, AccountSubtype::CurrentAsset, $asOfDate, $fiscalYearId);
        $nonCurrentAssets = $this->linesForSubtype($companyId, AccountSubtype::NonCurrentAsset, $asOfDate, $fiscalYearId);
        $currentLiabilities = $this->linesForSubtype($companyId, AccountSubtype::CurrentLiability, $asOfDate, $fiscalYearId);
        $nonCurrentLiabilities = $this->linesForSubtype($companyId, AccountSubtype::NonCurrentLiability, $asOfDate, $fiscalYearId);
        $capitalLines = $this->capitalEquityLines($companyId, $asOfDate, $fiscalYearId);

        $totalRevenue = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Revenue, $asOfDate, $fiscalYearId);
        $totalExpenses = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Expense, $asOfDate, $fiscalYearId);
        $netIncome = bcsub($totalRevenue, $totalExpenses, 4);
        $netIncomeAmount = bccomp($netIncome, '0', 4) === -1 ? bcmul($netIncome, '-1', 4) : $netIncome;

        $assetSections = [
            new GroupedStatementSection('Current Assets', $currentAssets, $this->sumLines($currentAssets)),
            new GroupedStatementSection('Noncurrent Assets', $nonCurrentAssets, $this->sumLines($nonCurrentAssets)),
        ];

        $liabilitySections = [
            new GroupedStatementSection('Current Liabilities', $currentLiabilities, $this->sumLines($currentLiabilities)),
            new GroupedStatementSection('Noncurrent Liabilities', $nonCurrentLiabilities, $this->sumLines($nonCurrentLiabilities)),
        ];

        $equitySections = [
            new GroupedStatementSection('Capital', $capitalLines, $this->sumLines($capitalLines)),
            new GroupedStatementSection(
                'Net Income',
                bccomp($netIncome, '0', 4) === 0 ? [] : [
                    new FinancialStatementLine(0, '', 'Net Income', $netIncomeAmount, AccountType::Equity->value, AccountSubtype::Equity->value),
                ],
                $netIncomeAmount,
            ),
        ];

        $totalAssets = bcadd($assetSections[0]->total, $assetSections[1]->total, 4);
        $totalLiabilities = bcadd($liabilitySections[0]->total, $liabilitySections[1]->total, 4);
        $totalEquity = bcadd($equitySections[0]->total, $netIncomeAmount, 4);
        $totalLiabilitiesAndEquity = bcadd($totalLiabilities, $totalEquity, 4);

        return new BalanceSheetResult(
            assetSections: $assetSections,
            liabilitySections: $liabilitySections,
            equitySections: $equitySections,
            totalAssets: $totalAssets,
            totalLiabilities: $totalLiabilities,
            totalEquity: $totalEquity,
            netIncome: $netIncomeAmount,
            totalLiabilitiesAndEquity: $totalLiabilitiesAndEquity,
            isBalanced: bccomp($totalAssets, $totalLiabilitiesAndEquity, 4) === 0,
            filters: [
                'as_of_date' => $asOfDate->toDateString(),
                'fiscal_year_id' => $fiscalYearId,
            ],
        );
    }

    public function changesInEquity(
        int $companyId,
        CarbonInterface $dateFrom,
        CarbonInterface $dateTo,
        ?int $fiscalYearId = null,
    ): ChangesInEquityResult {
        $capitalAccounts = $this->capitalAccounts($companyId);
        $drawingAccounts = $this->drawingAccounts($companyId);

        $capitalLines = [];
        $beginningCapital = '0.0000';

        foreach ($capitalAccounts as $account) {
            $beginning = $this->accountBalanceService->balanceBeforeDate($account, $dateFrom, $fiscalYearId);
            $beginningCapital = bcadd($beginningCapital, $beginning['balance_amount'], 4);

            $capitalLines[] = new FinancialStatementLine(
                accountId: $account->id,
                accountCode: $account->account_code,
                accountName: $account->account_name,
                amount: $beginning['balance_amount'],
                accountType: $account->account_type->value,
                accountSubtype: $account->account_subtype->value,
            );
        }

        $incomeStatement = $this->incomeStatement($companyId, $dateFrom, $dateTo, $fiscalYearId);
        $netIncome = $incomeStatement->netIncome;
        $isNetLoss = $incomeStatement->isNetLoss;

        $drawingIds = $drawingAccounts->pluck('id')->map(fn ($id) => (int) $id)->all();
        $withdrawals = $this->accountBalanceService->totalDebitsInPeriod(
            $drawingIds,
            $companyId,
            $dateFrom,
            $dateTo,
            $fiscalYearId,
        );

        $netIncomeAdjustment = $isNetLoss ? bcmul($netIncome, '-1', 4) : $netIncome;
        $endingCapital = bcsub(bcadd($beginningCapital, $netIncomeAdjustment, 4), $withdrawals, 4);

        return new ChangesInEquityResult(
            capitalLines: $capitalLines,
            beginningCapital: $beginningCapital,
            netIncome: $netIncome,
            withdrawals: $withdrawals,
            endingCapital: $endingCapital,
            isNetLoss: $isNetLoss,
            filters: [
                'date_from' => $dateFrom->toDateString(),
                'date_to' => $dateTo->toDateString(),
                'fiscal_year_id' => $fiscalYearId,
            ],
        );
    }

    /**
     * @return list<FinancialStatementLine>
     */
    protected function linesForType(
        int $companyId,
        AccountType $accountType,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId,
    ): array {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->where('account_type', $accountType)
            ->postable()
            ->orderBy('account_code')
            ->get();

        return $this->buildLines($accounts, $asOfDate, $fiscalYearId);
    }

    /**
     * @return list<FinancialStatementLine>
     */
    protected function linesForSubtype(
        int $companyId,
        AccountSubtype $accountSubtype,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId,
    ): array {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->where('account_subtype', $accountSubtype)
            ->postable()
            ->orderBy('account_code')
            ->get();

        return $this->buildLines($accounts, $asOfDate, $fiscalYearId);
    }

    /**
     * @return list<FinancialStatementLine>
     */
    protected function capitalEquityLines(
        int $companyId,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId,
    ): array {
        return $this->buildLines($this->capitalAccounts($companyId), $asOfDate, $fiscalYearId);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Account>  $accounts
     * @return list<FinancialStatementLine>
     */
    protected function buildLines($accounts, CarbonInterface $asOfDate, ?int $fiscalYearId): array
    {
        $lines = [];

        foreach ($accounts as $account) {
            $balance = $this->accountBalanceService->balanceForAccount($account, $asOfDate, $fiscalYearId);

            if (bccomp($balance['balance_amount'], '0', 4) === 0) {
                continue;
            }

            $lines[] = new FinancialStatementLine(
                accountId: $account->id,
                accountCode: $account->account_code,
                accountName: $account->account_name,
                amount: $balance['balance_amount'],
                accountType: $account->account_type->value,
                accountSubtype: $account->account_subtype->value,
            );
        }

        return $lines;
    }

    protected function capitalAccounts(int $companyId)
    {
        return Account::query()
            ->where('company_id', $companyId)
            ->where('account_type', AccountType::Equity)
            ->postable()
            ->get()
            ->filter(fn (Account $account) => ! $this->isDrawingAccount($account));
    }

    protected function drawingAccounts(int $companyId)
    {
        return Account::query()
            ->where('company_id', $companyId)
            ->where('account_type', AccountType::Equity)
            ->postable()
            ->get()
            ->filter(fn (Account $account) => $this->isDrawingAccount($account));
    }

    protected function isDrawingAccount(Account $account): bool
    {
        $name = Str::lower($account->account_name);

        return Str::contains($name, ['drawing', 'withdrawal', 'draw']);
    }

    /**
     * @param  list<FinancialStatementLine>  $lines
     */
    protected function sumLines(array $lines): string
    {
        $total = '0.0000';

        foreach ($lines as $line) {
            $total = bcadd($total, $line->amount, 4);
        }

        return $total;
    }
}
