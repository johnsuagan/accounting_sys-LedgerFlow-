<?php

namespace App\Services\Accounting\Support;

final class GeneralLedgerResult
{
    /**
     * @param  list<GeneralLedgerLine>  $lines
     * @param  array<string, mixed>  $filters
     */
    public function __construct(
        public readonly GeneralLedgerAccountSummary $account,
        public readonly array $lines,
        public readonly string $openingBalance,
        public readonly string $openingBalanceAmount,
        public readonly string $openingBalanceSide,
        public readonly string $closingBalance,
        public readonly string $closingBalanceAmount,
        public readonly string $closingBalanceSide,
        public readonly string $totalDebit,
        public readonly string $totalCredit,
        public readonly array $filters,
        public readonly bool $includesDescendants,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'account' => $this->account->toArray(),
            'lines' => array_map(fn (GeneralLedgerLine $line) => $line->toArray(), $this->lines),
            'opening_balance' => $this->openingBalance,
            'opening_balance_amount' => $this->openingBalanceAmount,
            'opening_balance_side' => $this->openingBalanceSide,
            'closing_balance' => $this->closingBalance,
            'closing_balance_amount' => $this->closingBalanceAmount,
            'closing_balance_side' => $this->closingBalanceSide,
            'total_debit' => $this->totalDebit,
            'total_credit' => $this->totalCredit,
            'filters' => $this->filters,
            'includes_descendants' => $this->includesDescendants,
        ];
    }
}
