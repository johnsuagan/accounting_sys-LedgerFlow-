<?php

namespace App\Services\Accounting\Support;

final class FinancialStatementLine
{
    public function __construct(
        public readonly int $accountId,
        public readonly string $accountCode,
        public readonly string $accountName,
        public readonly string $amount,
        public readonly ?string $accountType = null,
        public readonly ?string $accountSubtype = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'account_id' => $this->accountId,
            'account_code' => $this->accountCode,
            'account_name' => $this->accountName,
            'amount' => $this->amount,
            'account_type' => $this->accountType,
            'account_subtype' => $this->accountSubtype,
        ], fn ($value) => $value !== null);
    }
}
