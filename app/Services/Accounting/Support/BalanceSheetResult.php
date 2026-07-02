<?php

namespace App\Services\Accounting\Support;

final class BalanceSheetResult
{
    /**
     * @param  list<GroupedStatementSection>  $assetSections
     * @param  list<GroupedStatementSection>  $liabilitySections
     * @param  list<GroupedStatementSection>  $equitySections
     * @param  array<string, mixed>  $filters
     */
    public function __construct(
        public readonly array $assetSections,
        public readonly array $liabilitySections,
        public readonly array $equitySections,
        public readonly string $totalAssets,
        public readonly string $totalLiabilities,
        public readonly string $totalEquity,
        public readonly string $netIncome,
        public readonly string $totalLiabilitiesAndEquity,
        public readonly bool $isBalanced,
        public readonly array $filters,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'asset_sections' => array_map(fn (GroupedStatementSection $section) => $section->toArray(), $this->assetSections),
            'liability_sections' => array_map(fn (GroupedStatementSection $section) => $section->toArray(), $this->liabilitySections),
            'equity_sections' => array_map(fn (GroupedStatementSection $section) => $section->toArray(), $this->equitySections),
            'total_assets' => $this->totalAssets,
            'total_liabilities' => $this->totalLiabilities,
            'total_equity' => $this->totalEquity,
            'net_income' => $this->netIncome,
            'total_liabilities_and_equity' => $this->totalLiabilitiesAndEquity,
            'is_balanced' => $this->isBalanced,
            'filters' => $this->filters,
        ];
    }
}
