<?php

namespace App\Services\Accounting\Support;

final class ChangesInEquityResult
{
    /**
     * @param  list<FinancialStatementLine>  $capitalLines
     * @param  array<string, mixed>  $filters
     */
    public function __construct(
        public readonly array $capitalLines,
        public readonly string $beginningCapital,
        public readonly string $netIncome,
        public readonly string $withdrawals,
        public readonly string $endingCapital,
        public readonly bool $isNetLoss,
        public readonly array $filters,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'capital_lines' => array_map(fn (FinancialStatementLine $line) => $line->toArray(), $this->capitalLines),
            'beginning_capital' => $this->beginningCapital,
            'net_income' => $this->netIncome,
            'withdrawals' => $this->withdrawals,
            'ending_capital' => $this->endingCapital,
            'is_net_loss' => $this->isNetLoss,
            'filters' => $this->filters,
        ];
    }
}
