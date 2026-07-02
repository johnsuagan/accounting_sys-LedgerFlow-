<?php

namespace App\Services\Accounting\Support;

final class GroupedStatementSection
{
    /**
     * @param  list<FinancialStatementLine>  $lines
     */
    public function __construct(
        public readonly string $label,
        public readonly array $lines,
        public readonly string $total,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'label' => $this->label,
            'lines' => array_map(fn (FinancialStatementLine $line) => $line->toArray(), $this->lines),
            'total' => $this->total,
        ];
    }
}
