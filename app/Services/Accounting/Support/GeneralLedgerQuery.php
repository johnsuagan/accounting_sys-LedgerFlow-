<?php

namespace App\Services\Accounting\Support;

use Carbon\CarbonInterface;

/**
 * Query parameters for general ledger generation.
 *
 * Set includeDescendants to true for future parent-account roll-up aggregation.
 */
final class GeneralLedgerQuery
{
    /**
     * @param  list<int>  $accountIds
     */
    public function __construct(
        public readonly int $companyId,
        public readonly array $accountIds,
        public readonly CarbonInterface $dateFrom,
        public readonly CarbonInterface $dateTo,
        public readonly ?int $fiscalYearId = null,
        public readonly bool $includeDescendants = false,
    ) {}

    public static function forAccount(
        int $companyId,
        int $accountId,
        CarbonInterface $dateFrom,
        CarbonInterface $dateTo,
        ?int $fiscalYearId = null,
        bool $includeDescendants = false,
    ): self {
        return new self(
            companyId: $companyId,
            accountIds: [$accountId],
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            fiscalYearId: $fiscalYearId,
            includeDescendants: $includeDescendants,
        );
    }

    /**
     * @param  list<int>  $accountIds
     */
    public function withAccountIds(array $accountIds): self
    {
        return new self(
            companyId: $this->companyId,
            accountIds: array_values(array_unique($accountIds)),
            dateFrom: $this->dateFrom,
            dateTo: $this->dateTo,
            fiscalYearId: $this->fiscalYearId,
            includeDescendants: $this->includeDescendants,
        );
    }
}
