<?php

namespace App\Services\Accounting;

use App\Enums\AccountType;
use App\Models\Account;
use App\Services\Accounting\Support\FinancialStatementMapper;
use App\Services\Accounting\Support\TrialBalanceLine;
use App\Services\Accounting\Support\TrialBalanceResult;
use Carbon\CarbonInterface;

class TrialBalanceService
{
    public function __construct(
        protected AccountBalanceService $accountBalanceService,
    ) {}

    public function generate(
        int $companyId,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
    ): TrialBalanceResult {
        $accounts = $this->accountBalanceService->postableAccountsWithActivity(
            $companyId,
            $asOfDate,
            $fiscalYearId,
        );

        $lines = [];
        $totalDebit = '0.0000';
        $totalCredit = '0.0000';

        foreach ($accounts as $account) {
            $balance = $this->accountBalanceService->balanceForAccount($account, $asOfDate, $fiscalYearId);

            if (bccomp($balance['balance_amount'], '0', 4) === 0) {
                continue;
            }

            $lines[] = new TrialBalanceLine(
                accountId: $account->id,
                accountCode: $account->account_code,
                accountName: $account->account_name,
                accountType: $account->account_type->value,
                normalBalance: $account->normal_balance->value,
                debitBalance: $balance['debit_balance'],
                creditBalance: $balance['credit_balance'],
                financialStatement: FinancialStatementMapper::forAccountType($account->account_type),
            );

            $totalDebit = bcadd($totalDebit, $balance['debit_balance'], 4);
            $totalCredit = bcadd($totalCredit, $balance['credit_balance'], 4);
        }

        $difference = bcsub($totalDebit, $totalCredit, 4);
        $isBalanced = bccomp($difference, '0', 4) === 0;

        return new TrialBalanceResult(
            lines: $lines,
            totalDebit: $totalDebit,
            totalCredit: $totalCredit,
            isBalanced: $isBalanced,
            difference: $isBalanced ? '0.0000' : (bccomp($difference, '0', 4) === -1 ? bcmul($difference, '-1', 4) : $difference),
            filters: [
                'as_of_date' => $asOfDate->toDateString(),
                'fiscal_year_id' => $fiscalYearId,
            ],
        );
    }
}
