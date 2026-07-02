<?php

namespace App\Services\Accounting\Support;

use App\Models\AccountingPeriod;
use App\Models\FiscalYear;

readonly class PeriodContext
{
    public function __construct(
        public FiscalYear $fiscalYear,
        public AccountingPeriod $accountingPeriod,
    ) {}

    public function fiscalYearId(): int
    {
        return $this->fiscalYear->id;
    }

    public function accountingPeriodId(): int
    {
        return $this->accountingPeriod->id;
    }
}
