<?php

namespace App\Services\Accounting\Support;

final class TrialBalanceLine
{
    public function __construct(
        public readonly int $accountId,
        public readonly string $accountCode,
        public readonly string $accountName,
        public readonly string $accountType,
        public readonly string $normalBalance,
        public readonly string $debitBalance,
        public readonly string $creditBalance,
        public readonly string $financialStatement,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'account_id' => $this->accountId,
            'account_code' => $this->accountCode,
            'account_name' => $this->accountName,
            'account_type' => $this->accountType,
            'normal_balance' => $this->normalBalance,
            'debit_balance' => $this->debitBalance,
            'credit_balance' => $this->creditBalance,
            'financial_statement' => $this->financialStatement,
        ];
    }
}
