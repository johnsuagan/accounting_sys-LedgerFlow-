<?php

namespace App\Services\Accounting\Support;

final class GeneralLedgerAccountSummary
{
    public function __construct(
        public readonly int $id,
        public readonly string $accountCode,
        public readonly string $accountName,
        public readonly string $accountType,
        public readonly string $normalBalance,
        public readonly bool $isHeader,
        public readonly bool $rollupEnabled,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'account_code' => $this->accountCode,
            'account_name' => $this->accountName,
            'account_type' => $this->accountType,
            'normal_balance' => $this->normalBalance,
            'is_header' => $this->isHeader,
            'rollup_enabled' => $this->rollupEnabled,
        ];
    }
}
