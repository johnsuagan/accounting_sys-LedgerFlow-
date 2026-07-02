<?php

namespace App\Http\Requests\FinancialStatements;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\Account;
use App\Models\FiscalYear;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class FinancialStatementIndexRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Account::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'date_from' => ['nullable', 'date', 'required_with:date_to'],
            'date_to' => ['nullable', 'date', 'required_with:date_from', 'after_or_equal:date_from'],
            'as_of_date' => ['nullable', 'date'],
            'fiscal_year_id' => ['nullable', 'integer', 'exists:fiscal_years,id'],
            'statement' => ['nullable', 'in:balance_sheet,income_statement,changes_in_equity'],
        ];
    }

    public function shouldGenerateIncomeStatement(): bool
    {
        return $this->filled('date_from') && $this->filled('date_to');
    }

    public function shouldGenerateBalanceSheet(): bool
    {
        return $this->filled('as_of_date');
    }

    public function shouldGenerateChangesInEquity(): bool
    {
        return $this->filled('date_from') && $this->filled('date_to');
    }

    public function activeStatement(): string
    {
        return $this->input('statement', 'balance_sheet');
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $companyId = $this->currentCompanyId();

            if ($companyId === null) {
                $validator->errors()->add('company', 'Company context is required.');

                return;
            }

            if ($this->filled('fiscal_year_id')) {
                $fiscalYear = FiscalYear::query()->find($this->integer('fiscal_year_id'));

                if ($fiscalYear !== null && (int) $fiscalYear->company_id !== $companyId) {
                    $validator->errors()->add('fiscal_year_id', 'Fiscal year does not belong to the active company.');
                }
            }
        });
    }
}
