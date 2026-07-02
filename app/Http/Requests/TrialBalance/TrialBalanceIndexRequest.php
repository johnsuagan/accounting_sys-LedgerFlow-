<?php

namespace App\Http\Requests\TrialBalance;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\Account;
use App\Models\FiscalYear;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class TrialBalanceIndexRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Account::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'as_of_date' => ['nullable', 'date'],
            'fiscal_year_id' => ['nullable', 'integer', 'exists:fiscal_years,id'],
        ];
    }

    public function shouldGenerate(): bool
    {
        return $this->filled('as_of_date');
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
