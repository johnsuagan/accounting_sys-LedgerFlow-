<?php

namespace App\Services\Accounting\Support;

final class IncomeStatementResult
{
    /**
     * @param  list<FinancialStatementLine>  $revenueLines
     * @param  list<FinancialStatementLine>  $expenseLines
     * @param  array<string, mixed>  $filters
     */
    public function __construct(
        public readonly array $revenueLines,
        public readonly array $expenseLines,
        public readonly string $totalRevenue,
        public readonly string $totalExpenses,
        public readonly string $netIncome,
        public readonly bool $isNetLoss,
        public readonly array $filters,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'revenue_lines' => array_map(fn (FinancialStatementLine $line) => $line->toArray(), $this->revenueLines),
            'expense_lines' => array_map(fn (FinancialStatementLine $line) => $line->toArray(), $this->expenseLines),
            'total_revenue' => $this->totalRevenue,
            'total_expenses' => $this->totalExpenses,
            'net_income' => $this->netIncome,
            'is_net_loss' => $this->isNetLoss,
            'filters' => $this->filters,
        ];
    }
}
