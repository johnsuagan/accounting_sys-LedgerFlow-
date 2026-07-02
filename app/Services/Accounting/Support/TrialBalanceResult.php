<?php

namespace App\Services\Accounting\Support;

final class TrialBalanceResult
{
    /**
     * @param  list<TrialBalanceLine>  $lines
     * @param  array<string, mixed>  $filters
     */
    public function __construct(
        public readonly array $lines,
        public readonly string $totalDebit,
        public readonly string $totalCredit,
        public readonly bool $isBalanced,
        public readonly string $difference,
        public readonly array $filters,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'lines' => array_map(fn (TrialBalanceLine $line) => $line->toArray(), $this->lines),
            'total_debit' => $this->totalDebit,
            'total_credit' => $this->totalCredit,
            'is_balanced' => $this->isBalanced,
            'difference' => $this->difference,
            'filters' => $this->filters,
        ];
    }
}
