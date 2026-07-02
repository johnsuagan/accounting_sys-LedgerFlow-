<?php

namespace App\Http\Controllers\Concerns;

use App\Models\FiscalYear;

trait ResolvesAccountingDateDefaults
{
    /**
     * @return array{date_from: string, date_to: string, fiscal_year_id: int|null}
     */
    protected function defaultDateFilters(int $companyId): array
    {
        $fiscalYear = FiscalYear::query()
            ->where('company_id', $companyId)
            ->orderByDesc('year')
            ->first();

        if ($fiscalYear === null) {
            return [
                'date_from' => '',
                'date_to' => '',
                'fiscal_year_id' => null,
            ];
        }

        return [
            'date_from' => $fiscalYear->start_date->toDateString(),
            'date_to' => $fiscalYear->end_date->toDateString(),
            'fiscal_year_id' => $fiscalYear->id,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    protected function applyDefaultDateFilters(int $companyId, array $filters): array
    {
        $defaults = $this->defaultDateFilters($companyId);

        if (($filters['date_from'] ?? '') === '') {
            $filters['date_from'] = $defaults['date_from'];
        }

        if (($filters['date_to'] ?? '') === '') {
            $filters['date_to'] = $defaults['date_to'];
        }

        if (($filters['fiscal_year_id'] ?? null) === null && $defaults['fiscal_year_id'] !== null) {
            $filters['fiscal_year_id'] = $defaults['fiscal_year_id'];
        }

        return $filters;
    }
}
